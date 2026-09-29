import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CalendarPage from './CalendarPage.jsx';
import { toIsoDate } from './calendarView.js';

// jsdom's PointerEvent drops clientX/clientY: without them a drag looks like a click
globalThis.PointerEvent = class PointerEvent extends globalThis.MouseEvent {
  constructor(type, init = {}) { super(type, init); this.pointerId = init.pointerId ?? 1; }
};

vi.mock('../../app/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] } }),
}));

const today = toIsoDate();
const lesson = (extra = {}) => ({ id: 'schedule-1', studentId: 's1', studentName: 'Mari Maas', teacher: 'Pavel', teacherUid: 't1', date: today, startDate: today, time: '10:00', duration: 60, recurring: false, status: 'Planeeritud', ...extra });
const curriculum = [
  { id: 'b1-1', title: 'Minu päev', level: 'B1', roadmapModuleTitle: 'Igapäevaelu', roadmapModuleNumber: 1, roadmapLessonNumber: 1 },
  { id: 'b1-2', title: 'Sagedus', level: 'B1', roadmapModuleTitle: 'Igapäevaelu', roadmapModuleNumber: 1, roadmapLessonNumber: 2 },
];

function repositories({ events = [], records = [] } = {}) {
  return {
    scheduleRepository: {
      list: vi.fn().mockResolvedValue(events),
      create: vi.fn().mockResolvedValue({ id: 'created-1' }),
      update: vi.fn(),
      patch: vi.fn().mockResolvedValue({}),
      remove: vi.fn().mockResolvedValue(undefined),
      cancel: vi.fn(),
    },
    studentRepository: {
      list: vi.fn().mockResolvedValue({ items: [
        { id: 's1', name: 'Mari Maas', teacher: 'Pavel', teacherUid: 't1', level: 'B1' },
        { id: 's2', name: 'Jaan Tamm', teacher: 'Jelena', teacherUid: 't2' },
      ] }),
    },
    groupRepository: { list: vi.fn().mockResolvedValue([]), setAttendance: vi.fn() },
    lessonRepository: {
      listForCalendar: vi.fn().mockResolvedValue(records),
      completeFromSchedule: vi.fn().mockResolvedValue({ id: 'lesson-1' }),
    },
    libraryRepository: { list: vi.fn().mockResolvedValue({ curriculumLessons: curriculum, exercises: [] }), assign: vi.fn().mockResolvedValue({ count: 1 }) },
  };
}

function renderCalendar(options) {
  const props = repositories(options);
  render(<MemoryRouter><CalendarPage {...props} /></MemoryRouter>);
  return props;
}

const summary = () => screen.getByText((_, element) => element?.classList?.contains('calendar-filter-summary'));

describe('calendar v2', () => {
  it('shows a light toolbar with the week view and the period count', async () => {
    renderCalendar();
    await waitFor(() => expect(summary()).toHaveTextContent('0 tundi valitud perioodil'));
    expect(screen.getByRole('button', { name: 'Nädal' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('region', { name: 'Kalendri kokkuvõte' })).not.toBeInTheDocument();
  });

  it('offers a clear reset when filters hide every lesson', async () => {
    renderCalendar({ events: [lesson()] });
    await screen.findByRole('button', { name: /10:00 Mari Maas/ });
    fireEvent.change(screen.getByLabelText('Otsi kalendrist'), { target: { value: 'puuduv nimi' } });
    expect(screen.getByText(/Filtritele vastavaid tunde ei leitud/)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Tühjenda filtrid' })[0]);
    expect(screen.getByLabelText('Otsi kalendrist')).toHaveValue('');
  });

  it('creates a lesson from the toolbar', async () => {
    renderCalendar();
    await waitFor(() => expect(summary()).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Lisa tund/ }));
    expect(screen.getByRole('heading', { name: 'Uus tund' })).toBeInTheDocument();
  });

  it('one click on ✓ marks the lesson done with the suggested next topic', async () => {
    const props = renderCalendar({ events: [lesson()], records: [{ id: 'old', scheduleId: 'x', studentId: 's1', date: '2026-01-01', status: 'Toimunud', topicLessonId: 'b1-1', topic: 'Minu päev' }] });
    await waitFor(() => expect(props.libraryRepository.list).toHaveBeenCalled());
    // the ✓ shows on hover / keyboard focus
    fireEvent.click(await screen.findByLabelText('Märgi toimunuks: Mari Maas'));
    await waitFor(() => expect(props.lessonRepository.completeFromSchedule).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'schedule-1', occurrenceDate: today }),
      expect.objectContaining({ uid: 'admin-1' }),
      expect.objectContaining({ topic: 'Sagedus', topicLevel: 'B1', topicModule: 'Igapäevaelu', topicLessonId: 'b1-2' }),
    ));
  });

  it('the lesson panel records level → theme → lesson, a note and homework', async () => {
    const props = renderCalendar({ events: [lesson()] });
    await waitFor(() => expect(props.libraryRepository.list).toHaveBeenCalled());
    const block = await screen.findByRole('button', { name: /10:00 Mari Maas/ });
    fireEvent.pointerDown(block, { button: 0, clientX: 5, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(block, { clientX: 5, clientY: 100, pointerId: 1 });
    const panel = await screen.findByRole('dialog', { name: 'Tund: Mari Maas' });
    await within(panel).findByText('Mida tunnis tehti?');
    expect(within(panel).getByLabelText('Tund')).toHaveValue('b1-1');
    fireEvent.change(within(panel).getByLabelText('Tund'), { target: { value: 'b1-2' } });
    fireEvent.change(within(panel).getByLabelText(/Märkus/), { target: { value: 'harjutasime sagedust' } });
    fireEvent.change(within(panel).getByLabelText('Otsi kodutööd Õppevarast'), { target: { value: 'minu päev' } });
    fireEvent.click(within(panel).getByRole('button', { name: /Minu päev/ }));
    fireEvent.click(within(panel).getByRole('button', { name: /Tund toimus/ }));
    await waitFor(() => expect(props.lessonRepository.completeFromSchedule).toHaveBeenCalledWith(
      expect.anything(), expect.anything(),
      expect.objectContaining({ status: 'Toimunud', topic: 'Sagedus', topicLessonId: 'b1-2', notes: 'harjutasime sagedust' }),
    ));
    await waitFor(() => expect(props.libraryRepository.assign).toHaveBeenCalledWith(expect.objectContaining({ students: [expect.objectContaining({ id: 's1' })] })));
  });

  it('without a topic the lesson is saved as "Individuaalne tund"', async () => {
    const props = renderCalendar({ events: [lesson()] });
    await waitFor(() => expect(props.libraryRepository.list).toHaveBeenCalled());
    const block = await screen.findByRole('button', { name: /10:00 Mari Maas/ });
    fireEvent.pointerDown(block, { button: 0, clientX: 5, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(block, { clientX: 5, clientY: 100, pointerId: 1 });
    const panel = await screen.findByRole('dialog', { name: 'Tund: Mari Maas' });
    fireEvent.click(await within(panel).findByRole('button', { name: 'Ilma teemata' }));
    fireEvent.click(within(panel).getByRole('button', { name: /Tund toimus/ }));
    await waitFor(() => expect(props.lessonRepository.completeFromSchedule).toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.objectContaining({ topic: 'Individuaalne tund', topicLessonId: '' })));
  });

  it('dragging a one-off lesson moves it and can be undone', async () => {
    const props = renderCalendar({ events: [lesson()] });
    const block = await screen.findByRole('button', { name: /10:00 Mari Maas/ });
    fireEvent.pointerDown(block, { button: 0, clientX: 5000, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(block, { clientX: 5000, clientY: 166, pointerId: 1 }); // +60 min
    fireEvent.pointerUp(block, { clientX: 5000, clientY: 166, pointerId: 1 });
    await waitFor(() => expect(props.scheduleRepository.patch).toHaveBeenCalledWith('schedule-1', expect.objectContaining({ date: today, time: '11:00', duration: 60 })));
    fireEvent.click(await screen.findByRole('button', { name: /Tühista/ }));
    await waitFor(() => expect(props.scheduleRepository.patch).toHaveBeenLastCalledWith('schedule-1', expect.objectContaining({ time: '10:00' })));
  });

  it('dragging a weekly lesson asks: only this lesson or all following', async () => {
    const props = renderCalendar({ events: [lesson({ recurring: true, day: undefined })] });
    const block = await screen.findByRole('button', { name: /10:00 Mari Maas/ });
    fireEvent.pointerDown(block, { button: 0, clientX: 5000, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(block, { clientX: 5000, clientY: 133, pointerId: 1 }); // +30 min
    fireEvent.pointerUp(block, { clientX: 5000, clientY: 133, pointerId: 1 });
    fireEvent.click(await screen.findByRole('button', { name: 'Ainult see tund' }));
    await waitFor(() => expect(props.scheduleRepository.patch).toHaveBeenCalledWith('schedule-1', { excludedDates: [today] }));
    expect(props.scheduleRepository.create).toHaveBeenCalledWith(expect.objectContaining({ date: today, time: '10:30', recurring: false, movedFromSeriesId: 'schedule-1' }));
  });

  it('refuses a move onto another lesson of the same teacher', async () => {
    const props = renderCalendar({ events: [lesson(), lesson({ id: 'schedule-2', studentId: 's2', studentName: 'Jaan Tamm', time: '11:00' })] });
    const block = await screen.findByRole('button', { name: /10:00 Mari Maas/ });
    fireEvent.pointerDown(block, { button: 0, clientX: 5000, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(block, { clientX: 5000, clientY: 166, pointerId: 1 });
    fireEvent.pointerUp(block, { clientX: 5000, clientY: 166, pointerId: 1 });
    expect(await screen.findByRole('alert')).toHaveTextContent('juba teine tund');
    expect(props.scheduleRepository.patch).not.toHaveBeenCalled();
  });
});
