import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CalendarPage from './CalendarPage.jsx';
import { toIsoDate } from './calendarView.js';

// Oleksiy 2026-10-22 (#bug #high_priority): „При отмене занятия через Tühista не освобождается кабинет”.
const auth = vi.hoisted(() => ({ user: null }));
vi.mock('../../app/AuthContext.jsx', () => ({
  useAuth: () => ({ user: auth.user || { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] } }),
}));

const today = toIsoDate();
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(`${today}T12:00:00`).getDay()];
const roomList = [{ id: 'r1', name: 'Kabinet 1' }];
const lesson = (extra = {}) => ({ id: 'schedule-1', studentId: 's1', studentName: 'Mari Maas', teacher: 'Pavel', teacherUid: 't1', date: today, startDate: today, day: DAY, time: '10:00', duration: 60, recurring: false, status: 'Planeeritud', roomId: 'r1', roomName: 'Kabinet 1', ...extra });
const booking = (extra = {}) => ({ scheduleId: 'schedule-1', roomId: 'r1', roomName: 'Kabinet 1', recurring: false, date: today, startDate: today, day: DAY, time: '10:00', duration: 60, status: 'Planeeritud', excludedDates: [], ...extra });

function setup({ before, after, bookings = [], bookingsAfter = null }) {
  const list = vi.fn().mockResolvedValueOnce([before]).mockResolvedValue([after]);
  const roomBookings = vi.fn().mockResolvedValueOnce(bookings).mockResolvedValue(bookingsAfter ?? bookings);
  const props = {
    studentTimesRepository: { list: vi.fn().mockResolvedValue([]) },
    noteRepository: { list: vi.fn().mockResolvedValue([]), save: vi.fn() },
    roomRepository: { list: vi.fn().mockResolvedValue(roomList), bookings: roomBookings, save: vi.fn() },
    availabilityRepository: { list: vi.fn().mockResolvedValue([]), save: vi.fn() },
    scheduleRepository: { list, create: vi.fn().mockResolvedValue({ id: 'created-1' }), update: vi.fn(), patch: vi.fn().mockResolvedValue({}), remove: vi.fn(), restore: vi.fn(), cancel: vi.fn().mockResolvedValue({}) },
    studentRepository: { list: vi.fn().mockResolvedValue({ items: [{ id: 's1', name: 'Mari Maas', teacher: 'Pavel', teacherUid: 't1' }] }) },
    groupRepository: { list: vi.fn().mockResolvedValue([]) },
    liveRepository: { create: vi.fn() },
    teacherRepository: { list: vi.fn().mockResolvedValue([{ id: 't1', name: 'Pavel' }]) },
    lessonRepository: { listForCalendar: vi.fn().mockResolvedValue([]) },
    libraryRepository: { list: vi.fn().mockResolvedValue({ curriculumLessons: [], exercises: [] }) },
  };
  render(<MemoryRouter initialEntries={['/calendar']}><Routes><Route path="/calendar" element={<CalendarPage {...props} />} /></Routes></MemoryRouter>);
  return props;
}

async function cancelAndOpenNewLesson() {
  globalThis.confirm = vi.fn(() => true);
  fireEvent.click(await screen.findByRole('button', { name: /10:00 Mari Maas/ }));
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Tund: Mari Maas' })).getByRole('button', { name: /Tühista tund/ }));
  await waitFor(() => expect(screen.queryByRole('button', { name: /10:00 Mari Maas/ })).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: /Lisa tund/ }));
  const dialog = await screen.findByRole('dialog', { name: /Uus tund/ });
  fireEvent.change(within(dialog).getByLabelText('Kellaaeg'), { target: { value: '10:00' } });
  return within(dialog).getByLabelText('Kabinet');
}

afterEach(() => { auth.user = null; });

describe('rooms after „Tühista tund”', () => {
  it('a cancelled one-off lesson frees its room at once, even while the server booking is still there', async () => {
    const props = setup({ before: lesson(), after: lesson({ status: 'Tühistatud' }), bookings: [booking()] });
    const select = await cancelAndOpenNewLesson();
    expect(props.scheduleRepository.cancel).toHaveBeenCalled();
    expect(within(select).getByRole('option', { name: 'Kabinet 1' })).not.toBeDisabled();
  });

  it('a cancelled date of a weekly lesson frees the room on that date', async () => {
    const props = setup({ before: lesson({ recurring: true }), after: lesson({ recurring: true, excludedDates: [today] }), bookings: [booking({ recurring: true })] });
    const select = await cancelAndOpenNewLesson();
    expect(props.scheduleRepository.patch).toHaveBeenCalledWith('schedule-1', { excludedDates: [today] });
    expect(within(select).getByRole('option', { name: 'Kabinet 1' })).not.toBeDisabled();
  });

  it('a teacher: another teacher\'s lesson cancelled meanwhile frees the room after the calendar reloads', async () => {
    auth.user = { uid: 't1', displayName: 'Pavel', roles: ['teacher'] };
    // the teacher cannot read the other lesson; only its server booking — gone after the other one was cancelled
    const other = booking({ scheduleId: 'other-1', teacherUid: 't2' });
    setup({ before: lesson({ roomId: '', roomName: '', online: true }), after: lesson({ roomId: '', roomName: '', online: true, status: 'Tühistatud' }), bookings: [other], bookingsAfter: [] });
    const select = await cancelAndOpenNewLesson();
    expect(within(select).getByRole('option', { name: 'Kabinet 1' })).not.toBeDisabled();
  });

  it('a stale server booking of a cancelled lesson never holds the room', async () => {
    auth.user = { uid: 't1', displayName: 'Pavel', roles: ['teacher'] };
    const stale = [booking({ scheduleId: 'other-1', status: 'Tühistatud' }), booking({ scheduleId: 'other-2', online: true })];
    setup({ before: lesson({ roomId: '', roomName: '', online: true }), after: lesson({ roomId: '', roomName: '', online: true, status: 'Tühistatud' }), bookings: stale });
    const select = await cancelAndOpenNewLesson();
    expect(within(select).getByRole('option', { name: 'Kabinet 1' })).not.toBeDisabled();
  });
});
