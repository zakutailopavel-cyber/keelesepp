import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import CalendarPage from './CalendarPage.jsx';
import { shiftDate, startOfWeek, toIsoDate } from './calendarView.js';

// the phone calendar (≤ 760 px): the agenda's inline „Toimus ✓ / Puudus ▾” (owner 2026-11-09)
const auth = vi.hoisted(() => ({ user: null }));
vi.mock('../../app/AuthContext.jsx', () => ({
  useAuth: () => ({ user: auth.user || { uid: 't1', displayName: 'Pavel', roles: ['teacher'] } }),
}));

const today = toIsoDate();
const yesterday = shiftDate(today, -1);
const lesson = (extra = {}) => ({ id: 'schedule-1', studentId: 's1', studentName: 'Mari Maas', teacher: 'Pavel', teacherUid: 't1', date: yesterday, startDate: yesterday, time: '10:00', duration: 60, recurring: false, status: 'Planeeritud', ...extra });

function props({ events = [], records = [], groups = [] } = {}) {
  return {
    markingRepository: { context: vi.fn().mockResolvedValue({ archivedStudentIds: [], staff: null, lockedDates: [] }) },
    studentTimesRepository: { list: vi.fn().mockResolvedValue([]) },
    noteRepository: { list: vi.fn().mockResolvedValue([]) },
    roomRepository: { list: vi.fn().mockResolvedValue([]), bookings: vi.fn().mockResolvedValue([]) },
    availabilityRepository: { list: vi.fn().mockResolvedValue([]) },
    leadsRepository: { list: vi.fn().mockResolvedValue([]) },
    changeRequests: { subscribePending: () => () => {} },
    scheduleRepository: { list: vi.fn().mockResolvedValue(events), patch: vi.fn() },
    studentRepository: { list: vi.fn().mockResolvedValue({ items: [{ id: 's1', name: 'Mari Maas', teacher: 'Pavel', teacherUid: 't1', level: 'B1' }] }) },
    groupRepository: { list: vi.fn().mockResolvedValue(groups) },
    teacherRepository: { list: vi.fn().mockResolvedValue([{ id: 't1', name: 'Pavel', role: 'teacher' }]) },
    lessonRepository: {
      listForCalendar: vi.fn().mockResolvedValue(records),
      completeFromSchedule: vi.fn().mockResolvedValue({ id: 'lesson-1', accountingSource: 'crm_v2' }),
      removeMark: vi.fn().mockResolvedValue(undefined),
    },
    libraryRepository: { list: vi.fn().mockResolvedValue({ curriculumLessons: [], exercises: [] }) },
    takeHandoff: () => null,
  };
}
const renderPhone = (options) => {
  const repos = props(options);
  render(<MemoryRouter initialEntries={['/calendar']}><Routes><Route path="/calendar" element={<CalendarPage {...repos} />} /></Routes></MemoryRouter>);
  return repos;
};
// the week view shows yesterday only when it is in this week (on a Monday: one week back)
const toYesterdaysWeek = async () => {
  const back = await screen.findByRole('button', { name: 'Eelmine periood' });
  if (yesterday < startOfWeek(today)) fireEvent.click(back);
};

describe('phone calendar agenda: inline marking', () => {
  let original;
  beforeEach(() => {
    original = globalThis.matchMedia;
    globalThis.matchMedia = (query) => ({ matches: query.includes('max-width'), addEventListener: () => {}, removeEventListener: () => {} });
  });
  afterEach(() => { globalThis.matchMedia = original; auth.user = null; });

  it('a past planned lesson has ≥ 44 px „Toimus ✓” and „Puudus ▾” right in the row; a tap marks it and offers the undo', async () => {
    const repos = renderPhone({ events: [lesson(), lesson({ id: 'future', studentName: 'Tulevane', date: shiftDate(yesterday, -1), startDate: shiftDate(yesterday, -1), status: 'Tühistatud' })] });
    await toYesterdaysWeek();
    const done = await screen.findByRole('button', { name: 'Toimus: Mari Maas' });
    expect(done.className).toContain('qm__btn');
    expect(screen.getByRole('button', { name: 'Puudus: Mari Maas' })).toBeInTheDocument();
    // a cancelled lesson has no buttons
    expect(screen.queryByRole('button', { name: 'Toimus: Tulevane' })).not.toBeInTheDocument();
    // the phone header's direct entry with the count of the ONE definition
    expect(screen.getByRole('link', { name: /Märgi tunnid \(1\)/ })).toHaveAttribute('href', '/calendar/markimata');
    fireEvent.click(done);
    await waitFor(() => expect(repos.lessonRepository.completeFromSchedule).toHaveBeenCalledWith(expect.objectContaining({ id: 'schedule-1', occurrenceDate: yesterday }), expect.objectContaining({ uid: 't1' }), expect.objectContaining({ status: 'Toimunud' })));
    const toast = await waitFor(() => { const node = document.querySelector('.qm-toast'); expect(node).not.toBeNull(); return node; });
    fireEvent.click(within(toast).getByRole('button', { name: /Võta tagasi/ }));
    await waitFor(() => expect(repos.lessonRepository.removeMark).toHaveBeenCalledWith({ id: 'lesson-1', accountingSource: 'crm_v2' }, expect.anything(), { scheduleRecurring: false }));
  });

  it('„Puudus ▾” → „Teatas ette” writes Puudus_p (never the billable one by default)', async () => {
    const repos = renderPhone({ events: [lesson()] });
    await toYesterdaysWeek();
    fireEvent.click(await screen.findByRole('button', { name: 'Puudus: Mari Maas' }));
    fireEvent.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Teatas ette/ }));
    await waitFor(() => expect(repos.lessonRepository.completeFromSchedule).toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.objectContaining({ status: 'Puudus_p' })));
  });

  it('a marked lesson shows its state and no buttons', async () => {
    renderPhone({ events: [lesson()], records: [{ id: 'r1', scheduleId: 'schedule-1', studentId: 's1', date: yesterday, status: 'Toimunud' }] });
    await toYesterdaysWeek();
    await screen.findByText(/Mari Maas/);
    expect(screen.queryByRole('button', { name: 'Toimus: Mari Maas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Märgi tunnid/ })).not.toBeInTheDocument();
  });
});
