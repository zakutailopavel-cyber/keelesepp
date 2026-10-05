import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
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

function repositories({ events = [], records = [], groups = [], windows = [] } = {}) {
  return {
    availabilityRepository: { list: vi.fn().mockResolvedValue(windows), save: vi.fn().mockResolvedValue({}) },
    scheduleRepository: {
      list: vi.fn().mockResolvedValue(events),
      create: vi.fn().mockResolvedValue({ id: 'created-1' }),
      update: vi.fn(),
      patch: vi.fn().mockResolvedValue({}),
      remove: vi.fn().mockResolvedValue(undefined),
      restore: vi.fn().mockResolvedValue({}),
      cancel: vi.fn(),
    },
    studentRepository: {
      list: vi.fn().mockResolvedValue({ items: [
        { id: 's1', name: 'Mari Maas', teacher: 'Pavel', teacherUid: 't1', level: 'B1', subject: 'Eesti keel', studentUid: 'mari-user' },
        { id: 's2', name: 'Jaan Tamm', teacher: 'Jelena', teacherUid: 't2' },
      ] }),
    },
    groupRepository: { list: vi.fn().mockResolvedValue(groups), setAttendance: vi.fn(), patchLesson: vi.fn().mockResolvedValue({}) },
    liveRepository: { create: vi.fn().mockResolvedValue({ id: 'inv-1' }) },
    teacherRepository: { list: vi.fn().mockResolvedValue([{ id: 't1', name: 'Pavel' }, { id: 't2', name: 'Jelena' }]) },
    lessonRepository: {
      listForCalendar: vi.fn().mockResolvedValue(records),
      completeFromSchedule: vi.fn().mockResolvedValue({ id: 'lesson-1' }),
      changeMark: vi.fn().mockResolvedValue({}),
      removeMark: vi.fn().mockResolvedValue(undefined),
    },
    libraryRepository: { list: vi.fn().mockResolvedValue({ curriculumLessons: curriculum, exercises: [] }), assign: vi.fn().mockResolvedValue({ count: 1 }) },
  };
}

function renderCalendar(options, path = '/calendar') {
  const props = repositories(options);
  render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/calendar" element={<CalendarPage {...props} />} /><Route path="/live-classroom" element={<LiveLocation />} /></Routes></MemoryRouter>);
  return props;
}

function LiveLocation() {
  const location = useLocation();
  return <p>live room {location.search}</p>;
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

  it('a lesson that once came from Google Calendar is edited in KeeleSepp (one-way sync)', async () => {
    renderCalendar({ events: [lesson({ source: 'gcal', gcalEventId: 'g1' })] });
    fireEvent.click(await screen.findByRole('button', { name: /10:00 Mari Maas/ }));
    const panel = screen.getByRole('dialog', { name: 'Tund: Mari Maas' });
    expect(within(panel).getByText('Algselt Google Calendarist')).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: /Muuda aega/ })).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: /Tund toimus/ })).toBeInTheDocument();
  });

  it('shows whether a KeeleSepp lesson reached Google Calendar', async () => {
    renderCalendar({ events: [lesson({ gcalSyncStatus: 'error', gcalSyncError: 'Forbidden' })] });
    fireEvent.click(await screen.findByRole('button', { name: /10:00 Mari Maas/ }));
    const panel = screen.getByRole('dialog', { name: 'Tund: Mari Maas' });
    expect(within(panel).getByText("Google'isse ei jõudnud")).toBeInTheDocument();
    expect(within(panel).getByText('Forbidden')).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: /Muuda aega/ })).toBeInTheDocument();
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

  it('allows moving a lesson onto another lesson of the same teacher (parallel lessons)', async () => {
    const props = renderCalendar({ events: [lesson(), lesson({ id: 'schedule-2', studentId: 's2', studentName: 'Jaan Tamm', time: '11:00' })] });
    const block = await screen.findByRole('button', { name: /10:00 Mari Maas/ });
    fireEvent.pointerDown(block, { button: 0, clientX: 5000, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(block, { clientX: 5000, clientY: 166, pointerId: 1 });
    fireEvent.pointerUp(block, { clientX: 5000, clientY: 166, pointerId: 1 });
    await waitFor(() => expect(props.scheduleRepository.patch).toHaveBeenCalled());
    expect(screen.queryByText(/juba teine tund/)).toBeNull();
  });

  it('plans a second student at the same time and shows who else is there', async () => {
    const props = renderCalendar({ events: [lesson({ time: '09:00' })] });
    fireEvent.click(await screen.findByRole('button', { name: /Lisa tund/ }));
    fireEvent.focus(screen.getByRole('combobox', { name: /Õpilane/ }));
    fireEvent.click(await screen.findByRole('option', { name: /Mari Maas/ }));
    expect(await screen.findByText(/Samal ajal on ka: 09:00 Mari Maas/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta tund' }));
    await waitFor(() => expect(props.scheduleRepository.create).toHaveBeenCalledWith(expect.objectContaining({ time: '09:00', studentId: 's1' })));
  });

  it('deletes a lesson added by mistake and can bring it back', async () => {
    const props = renderCalendar({ events: [lesson({ gcalEventId: 'g-old', gcalSyncStatus: 'synced' })] });
    fireEvent.click(await screen.findByRole('button', { name: /10:00 Mari Maas/ }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Tund: Mari Maas' })).getByRole('button', { name: /Kustuta/ }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Kustuta tund' })).getByRole('button', { name: 'Kustuta' }));
    await waitFor(() => expect(props.scheduleRepository.remove).toHaveBeenCalledWith('schedule-1'));
    fireEvent.click(await screen.findByRole('button', { name: /Tühista/ }));
    await waitFor(() => expect(props.scheduleRepository.restore).toHaveBeenCalledWith('schedule-1', expect.objectContaining({ studentId: 's1', time: '10:00' })));
    expect(props.scheduleRepository.restore.mock.calls[0][1]).not.toHaveProperty('gcalEventId');
  });

  it('deletes only one date of a weekly lesson', async () => {
    const props = renderCalendar({ events: [lesson({ recurring: true, day: undefined })] });
    fireEvent.click(await screen.findByRole('button', { name: /10:00 Mari Maas/ }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Tund: Mari Maas' })).getByRole('button', { name: /Kustuta/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Ainult see tund' }));
    await waitFor(() => expect(props.scheduleRepository.patch).toHaveBeenCalledWith('schedule-1', { excludedDates: [today] }));
    expect(props.scheduleRepository.remove).not.toHaveBeenCalled();
  });

  it('shows a lesson at 21:00 in the week grid', async () => {
    renderCalendar({ events: [lesson({ time: '21:00' })] });
    expect(await screen.findByRole('button', { name: /21:00 Mari Maas/ })).toBeInTheDocument();
  });

  it('fixes a wrong mark: another status or back to planned', async () => {
    const record = { id: 'rec-1', scheduleId: 'schedule-1', studentId: 's1', date: today, status: 'Toimunud', accountingSource: 'crm_v2' };
    const props = renderCalendar({ events: [lesson()], records: [record] });
    fireEvent.click(await screen.findByRole('button', { name: /10:00 Mari Maas, toimunud/ }));
    const panel = screen.getByRole('dialog', { name: 'Tund: Mari Maas' });
    fireEvent.click(within(panel).getByRole('button', { name: /Paranda/ }));
    fireEvent.click(within(panel).getByRole('button', { name: 'Puudus (teatas ette)' }));
    await waitFor(() => expect(props.lessonRepository.changeMark).toHaveBeenCalledWith(expect.objectContaining({ id: 'rec-1' }), 'Puudus_p', expect.objectContaining({ uid: 'admin-1' }), { scheduleRecurring: false }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Tund: Mari Maas' })).getByRole('button', { name: /Eemalda märge/ }));
    await waitFor(() => expect(props.lessonRepository.removeMark).toHaveBeenCalled());
  });

  it('a future lesson can only be marked as an absence announced in advance', async () => {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const date = toIsoDate(tomorrow);
    renderCalendar({ events: [lesson({ date, startDate: date })] });
    await waitFor(() => expect(summary()).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Päev' }));
    fireEvent.click(screen.getByRole('button', { name: 'Järgmine periood' }));
    fireEvent.click(await screen.findByRole('button', { name: /10:00 Mari Maas/ }));
    const panel = screen.getByRole('dialog', { name: 'Tund: Mari Maas' });
    expect(within(panel).queryByRole('button', { name: /Tund toimus/ })).toBeNull();
    expect(within(panel).queryByRole('button', { name: 'Puudus (ei teatanud)' })).toBeNull();
    expect(within(panel).getByRole('button', { name: /Puudus \(teatas ette\)/ })).toBeInTheDocument();
  });

  it('cancelling a one-off lesson can be undone', async () => {
    const props = renderCalendar({ events: [lesson()] });
    props.scheduleRepository.cancel.mockResolvedValue({});
    globalThis.confirm = vi.fn(() => true);
    fireEvent.click(await screen.findByRole('button', { name: /10:00 Mari Maas/ }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Tund: Mari Maas' })).getByRole('button', { name: /Tühista tund/ }));
    await waitFor(() => expect(props.scheduleRepository.cancel).toHaveBeenCalled());
    fireEvent.click(await screen.findByRole('button', { name: /Tühista$/ }));
    await waitFor(() => expect(props.scheduleRepository.patch).toHaveBeenCalledWith('schedule-1', { status: 'Planeeritud' }));
  });

  it('admin cancels one date of a group lesson', async () => {
    const group = { id: 'g1', name: 'A2 õhtune', teacher: 'Jelena', teacherUid: 't2', students: [], lessons: [{ id: 'gl1', day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(`${today}T12:00:00`).getDay()], time: '18:00', duration: 90, recurring: true, startDate: today }] };
    const props = renderCalendar({ groups: [group] });
    globalThis.confirm = vi.fn(() => true);
    fireEvent.click(await screen.findByRole('button', { name: /18:00 A2 õhtune/ }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Tund: A2 õhtune' })).getByRole('button', { name: /Tühista see grupitund/ }));
    await waitFor(() => expect(props.groupRepository.patchLesson).toHaveBeenCalledWith(expect.objectContaining({ id: 'g1' }), 'gl1', { excludedDates: [today] }, expect.anything()));
  });

  it('admin can give a new lesson to another teacher', async () => {
    const props = renderCalendar();
    fireEvent.click(await screen.findByRole('button', { name: /Lisa tund/ }));
    fireEvent.focus(screen.getByRole('combobox', { name: /Õpilane/ }));
    fireEvent.click(await screen.findByRole('option', { name: /Mari Maas/ }));
    fireEvent.change(await screen.findByLabelText('Õpetaja'), { target: { value: 't2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta tund' }));
    await waitFor(() => expect(props.scheduleRepository.create).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's1', teacher: 'Jelena', teacherUid: 't2' })));
  });

  it('a lesson cannot be planned into a teacher\'s red window', async () => {
    const props = renderCalendar({ windows: [{ teacherUid: 't2', teacherName: 'Jelena', slots: [{ id: 'x', kind: 'busy', day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(`${today}T12:00:00`).getDay()], start: '08:00', end: '12:00' }] }] });
    fireEvent.click(await screen.findByRole('button', { name: /Lisa tund/ }));
    fireEvent.focus(screen.getByRole('combobox', { name: /Õpilane/ }));
    fireEvent.click(await screen.findByRole('option', { name: /Mari Maas/ }));
    fireEvent.change(await screen.findByLabelText('Õpetaja'), { target: { value: 't2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta tund' }));
    expect((await screen.findAllByText(/Jelena ei ole .* saadaval \(punane aeg\)/)).length).toBeGreaterThan(0);
    expect(props.scheduleRepository.create).not.toHaveBeenCalled();
  });

  it('the admin marks a teacher\'s green window by dragging in the week grid', async () => {
    const props = renderCalendar({ events: [lesson()] });
    await screen.findByRole('button', { name: /10:00 Mari Maas/ });
    fireEvent.change(screen.getByLabelText('Filtreeri õpetaja järgi'), { target: { value: 't1' } });
    fireEvent.click(screen.getByRole('button', { name: /Õpetaja ajad/ }));
    expect(screen.getByRole('region', { name: 'Õpetaja ajad' })).toBeInTheDocument();
    const column = document.querySelector('.tg-col');
    const body = document.querySelector('.tg-body');
    fireEvent.pointerDown(column, { button: 0, clientY: 0 });
    fireEvent.pointerMove(body, { clientY: 240 });
    fireEvent.pointerUp(body);
    await waitFor(() => expect(props.availabilityRepository.save).toHaveBeenCalledTimes(1));
    const saved = props.availabilityRepository.save.mock.calls[0][0];
    expect(saved).toMatchObject({ teacherUid: 't1', teacherName: 'Pavel' });
    expect(saved.slots).toEqual([expect.objectContaining({ kind: 'free', day: expect.any(String) })]);
  });

  it('lists students without a lesson ahead; Lisa tund opens the form for them, Paus hides them for a while', async () => {
    const props = renderCalendar({ events: [lesson({ studentId: 's1' })] });
    props.studentRepository.update = vi.fn().mockResolvedValue({});
    fireEvent.click(await screen.findByRole('button', { name: /1 õpilane ilma tulevase tunnita/ }));
    const list = screen.getByRole('region', { name: 'Õpilased ilma tulevase tunnita' });
    expect(within(list).getByText('Jaan Tamm')).toBeInTheDocument();
    expect(within(list).queryByText('Mari Maas')).toBeNull();
    fireEvent.change(within(list).getByRole('combobox', { name: 'Paus: Jaan Tamm' }), { target: { value: '30' } });
    await waitFor(() => expect(props.studentRepository.update).toHaveBeenCalledWith('s2', { planningPausedUntil: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) }));
    fireEvent.click(within(list).getByRole('button', { name: /Lisa tund/ }));
    expect(screen.getByRole('heading', { name: 'Uus tund' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Õpilane/ })).toHaveValue('Jaan Tamm');
  });

  it('"Alusta tundi" invites the student and opens the live room for today\'s lesson', async () => {
    const props = renderCalendar({ events: [lesson()] });
    fireEvent.click(await screen.findByRole('button', { name: /10:00 Mari Maas/ }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Tund: Mari Maas' })).getByRole('button', { name: /Alusta tundi/ }));
    await waitFor(() => expect(props.liveRepository.create).toHaveBeenCalledWith(
      { student: expect.objectContaining({ id: 's1', studentUid: 'mari-user' }), title: 'Eesti keel · 10:00' },
      expect.objectContaining({ uid: 'admin-1' }),
    ));
    expect(await screen.findByText('live room ?invitation=inv-1')).toBeInTheDocument();
    expect(JSON.parse(globalThis.localStorage.getItem('keelesepp.liveLessonLinks'))['inv-1']).toBe(`schedule-1:${today}|${today}`);
  });

  it('opens the linked lesson panel after the live lesson ends (?lesson=)', async () => {
    renderCalendar({ events: [lesson()] }, `/calendar?lesson=${encodeURIComponent(`schedule-1:${today}|${today}`)}`);
    expect(await screen.findByRole('dialog', { name: 'Tund: Mari Maas' })).toBeInTheDocument();
  });

  it('ignores a malformed ?lesson= link', async () => {
    renderCalendar({ events: [lesson()] }, '/calendar?lesson=bogus');
    await screen.findByRole('button', { name: /10:00 Mari Maas/ });
    expect(screen.queryByRole('dialog', { name: 'Tund: Mari Maas' })).not.toBeInTheDocument();
  });

  it('explains why a student without an account cannot be invited', async () => {
    const props = renderCalendar({ events: [lesson({ studentId: 's2', studentName: 'Jaan Tamm', teacherUid: 't2' })] });
    fireEvent.click(await screen.findByRole('button', { name: /10:00 Jaan Tamm/ }));
    const panel = screen.getByRole('dialog', { name: 'Tund: Jaan Tamm' });
    expect(within(panel).getByRole('button', { name: /Alusta tundi/ })).toBeDisabled();
    expect(within(panel).getByText(/pole veel sisselogimiskontot/)).toBeInTheDocument();
    expect(props.liveRepository.create).not.toHaveBeenCalled();
  });

  it('offers "Alusta tundi" only on the lesson day', async () => {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const date = toIsoDate(tomorrow);
    renderCalendar({ events: [lesson({ date, startDate: date })] });
    await waitFor(() => expect(summary()).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Päev' }));
    fireEvent.click(screen.getByRole('button', { name: 'Järgmine periood' }));
    fireEvent.click(await screen.findByRole('button', { name: /10:00 Mari Maas/ }));
    expect(within(screen.getByRole('dialog', { name: 'Tund: Mari Maas' })).queryByRole('button', { name: /Alusta tundi/ })).toBeNull();
  });
});
