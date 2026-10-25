import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import PlannerView from './PlannerView.jsx';

const halves = (day, from, to) => {
  const out = [];
  for (let at = from * 60; at < to * 60; at += 30) out.push(`${day}-${String(Math.floor(at / 60)).padStart(2, '0')}:${at % 60 ? '30' : '00'}`);
  return out;
};
const memoryStorage = () => {
  const memory = new Map();
  return { memory, getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, String(value)), removeItem: (key) => memory.delete(key) };
};
const student = (id, name) => ({ id, name, teacher: 'Pavel', teacherUid: 't1', subject: 'Eesti keel' });

function renderPlanner({ students, studentTimes, events = [], rooms = [], storage = memoryStorage(), teacherOnly = false }) {
  const scheduleRepository = { create: vi.fn().mockImplementation(async (data) => ({ id: `new-${data.studentId}`, ...data })), patch: vi.fn().mockResolvedValue({}) };
  const onSaved = vi.fn();
  const batchRepository = { newId: vi.fn().mockReturnValue('batch-1'), create: vi.fn().mockResolvedValue({ id: 'batch-1' }) };
  render(<MemoryRouter><PlannerView
    user={teacherOnly ? { uid: 't1', displayName: 'Pavel', roles: ['teacher'] } : { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] }}
    teacherOnly={teacherOnly}
    students={students}
    events={events}
    teachers={[{ id: 't1', name: 'Pavel' }]}
    studentTimes={new Map(Object.entries(studentTimes))}
    rooms={rooms}
    scheduleRepository={scheduleRepository}
    batchRepository={batchRepository}
    today="2026-10-25"
    storage={storage}
    onClose={() => {}}
    onSaved={onSaved}
  /></MemoryRouter>);
  return { scheduleRepository, batchRepository, onSaved, storage };
}

const summary = () => screen.getByLabelText('Plaani kokkuvõte').textContent;

describe('Planeerija', () => {
  it('adds all students, distributes them (★ first, no times → listed with the card link) and writes nothing before „Kinnita”', async () => {
    const { scheduleRepository, batchRepository, storage, onSaved } = renderPlanner({
      students: [student('a', 'Anna'), student('b', 'Boris')],
      studentTimes: { a: { slots: [...halves('Mon', 10, 12), ...halves('Wed', 9, 10)], preferred: halves('Mon', 10, 11) } },
    });
    fireEvent.click(screen.getByRole('button', { name: /Lisa kõik õpilased/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Lisatud 2 õppesuunda');
    fireEvent.click(screen.getByRole('button', { name: /Jaota/ }));
    expect(summary()).toMatch(/1 ★ eelistatud/);
    expect(summary()).toMatch(/1 aega ei leitud/);
    const unplaced = screen.getByLabelText('Aega ei leitud');
    expect(within(unplaced).getByText('Boris')).toBeInTheDocument();
    expect(within(unplaced).getByText(/Sobivad ajad puuduvad/)).toBeInTheDocument();
    expect(within(unplaced).getByRole('link', { name: 'ava kaart' })).toHaveAttribute('href', '/students/b#sobivad-ajad');
    // the draft block on the grid (dashed) — ★ Monday 10:00
    expect(screen.getByRole('button', { name: /10:00 ★ Anna/ })).toBeInTheDocument();
    expect(scheduleRepository.create).not.toHaveBeenCalled();
    expect(JSON.parse(storage.memory.get('keelesepp.planner.v1.admin-1')).lessons).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /Kinnita ajakava/ }));
    const dialog = screen.getByRole('dialog', { name: 'Kinnita ajakava' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Loo 1 korduvat tundi' }));
    await waitFor(() => expect(scheduleRepository.create).toHaveBeenCalledTimes(1));
    expect(scheduleRepository.create).toHaveBeenCalledWith({ studentId: 'a', studentName: 'Anna', teacher: 'Pavel', teacherUid: 't1', subject: 'Eesti keel', date: '2026-10-26', time: '10:00', duration: 60, recurring: true, online: false, roomId: '', roomName: '', status: 'Planeeritud', source: 'planner', plannerBatchId: 'batch-1' });
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    // the batch record comes after every lesson is created
    expect(batchRepository.create).toHaveBeenCalledWith('batch-1', { lessonIds: ['new-a'], studentIds: ['a'] }, expect.objectContaining({ uid: 'admin-1' }));
    expect(batchRepository.create.mock.invocationCallOrder[0]).toBeGreaterThan(scheduleRepository.create.mock.invocationCallOrder[0]);
    expect(screen.getByText(/Kalendrisse lisati 1 korduvat tundi/)).toBeInTheDocument();
    expect(scheduleRepository.patch).not.toHaveBeenCalled();
  });

  it('two students on one time overlap (both kept, marked); „Kinnita” needs an explicit tick for them', async () => {
    const times = { slots: halves('Tue', 16, 17), preferred: halves('Tue', 16, 17) };
    const { scheduleRepository } = renderPlanner({ students: [student('a', 'Anna'), student('c', 'Cärol')], studentTimes: { a: times, c: times } });
    fireEvent.click(screen.getByRole('button', { name: /Lisa kõik õpilased/ }));
    fireEvent.click(screen.getByRole('button', { name: /Jaota/ }));
    expect(summary()).toMatch(/2 kattub/);
    fireEvent.click(screen.getByRole('button', { name: /16:00 ⚠ Anna/ }));
    const panel = screen.getByRole('region', { name: 'Valitud mustandtund' });
    expect(within(panel).getByText('Kattub: Cärol')).toBeInTheDocument();
    expect(within(panel).getByText(/Lepi õpilasega kokku/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Kinnita ajakava/ }));
    const dialog = screen.getByRole('dialog', { name: 'Kinnita ajakava' });
    expect(within(dialog).getByRole('button', { name: 'Loo 0 korduvat tundi' })).toBeDisabled();
    fireEvent.click(within(dialog).getAllByRole('checkbox')[0]);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Loo 1 korduvat tundi' }));
    await waitFor(() => expect(scheduleRepository.create).toHaveBeenCalledTimes(1));
    expect(scheduleRepository.create.mock.calls[0][0]).toMatchObject({ studentId: 'a', date: '2026-10-27', time: '16:00', recurring: true });
  });

  it('a full re-plan ends the old weekly series of the directions it creates', async () => {
    const series = { id: 'old', studentId: 'a', studentName: 'Anna', teacherUid: 't1', teacher: 'Pavel', subject: 'Eesti keel', recurring: true, startDate: '2026-09-01', date: '2026-09-01', day: 'Fri', time: '12:00', duration: 45, online: true };
    const { scheduleRepository } = renderPlanner({ students: [student('a', 'Anna')], events: [series], studentTimes: { a: { slots: halves('Mon', 10, 11), preferred: halves('Mon', 10, 11) } } });
    fireEvent.click(screen.getByRole('button', { name: /Lisa kõik õpilased/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Uusi õppesuundi ei leitud');
    fireEvent.click(screen.getByLabelText(/Ka need, kel on korduv tund/));
    fireEvent.click(screen.getByRole('button', { name: /Lisa kõik õpilased/ }));
    fireEvent.click(screen.getByRole('button', { name: /Jaota/ }));
    // the old Friday series does not show while it is being replaced
    expect(screen.queryByRole('button', { name: /12:00 Anna/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Kinnita ajakava/ }));
    const dialog = screen.getByRole('dialog', { name: 'Kinnita ajakava' });
    expect(within(dialog).getByText(/Lõpeta nende õpilaste vanad korduvad tunnid \(1\)/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Loo 1 korduvat tundi' }));
    await waitFor(() => expect(scheduleRepository.patch).toHaveBeenCalledWith('old', { endDate: '2026-10-25' }));
    expect(scheduleRepository.create.mock.calls[0][0]).toMatchObject({ duration: 45, online: true, time: '10:00' });
  });

  it('keeps the draft in the browser: a new visit continues it', () => {
    const storage = memoryStorage();
    const times = { a: { slots: halves('Mon', 10, 11), preferred: halves('Mon', 10, 11) } };
    renderPlanner({ students: [student('a', 'Anna')], studentTimes: times, storage });
    fireEvent.click(screen.getByRole('button', { name: /Lisa kõik õpilased/ }));
    fireEvent.click(screen.getByRole('button', { name: /Jaota/ }));
    document.body.innerHTML = '';
    renderPlanner({ students: [student('a', 'Anna')], studentTimes: times, storage });
    expect(screen.getByRole('button', { name: /10:00 ★ Anna/ })).toBeInTheDocument();
  });

  it('a teacher plans own students; the lessons carry the batch id, the admin-only batch record is not written', async () => {
    const { scheduleRepository, batchRepository } = renderPlanner({ teacherOnly: true, students: [student('a', 'Anna'), { ...student('z', 'Zoja'), teacher: 'Jelena', teacherUid: 't2' }], studentTimes: { a: { slots: halves('Mon', 10, 11), preferred: halves('Mon', 10, 11) }, z: { slots: halves('Mon', 10, 11) } } });
    expect(screen.queryByLabelText('Kelle õpilased')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Lisa kõik õpilased/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Lisatud 1 õppesuunda');
    fireEvent.click(screen.getByRole('button', { name: /Jaota/ }));
    fireEvent.click(screen.getByRole('button', { name: /Kinnita ajakava/ }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Kinnita ajakava' })).getByRole('button', { name: 'Loo 1 korduvat tundi' }));
    await waitFor(() => expect(scheduleRepository.create).toHaveBeenCalledTimes(1));
    expect(scheduleRepository.create.mock.calls[0][0]).toMatchObject({ teacherUid: 't1', source: 'planner', plannerBatchId: 'batch-1' });
    await waitFor(() => expect(screen.getByText(/Kalendrisse lisati 1/)).toBeInTheDocument());
    expect(batchRepository.create).not.toHaveBeenCalled();
  });
});
