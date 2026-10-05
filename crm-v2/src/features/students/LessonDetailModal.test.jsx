import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import StudentLessonsPanel from './StudentLessonsPanel.jsx';

const student = { id: 's1', name: 'Mari Maas', teacher: 'Pavel', subject: 'Eesti keel' };
const lessons = [
  { id: 'l1', date: '2026-09-04', time: '14:00', status: 'Toimunud', verified: true, verifiedByName: 'Admin', topic: 'Minu päev', notes: 'Hea töö kellaaegadega.', duration: 60 },
  { id: 'l2', date: '2026-09-02', status: 'Puudus_p' },
];

function apis() {
  return {
    homeworkApi: { listByStudentIds: vi.fn().mockResolvedValue([{ id: 'h1', task: 'Korda tunni sõnu', due: '2026-09-11', date: '2026-09-04', status: 'Ootel' }, { id: 'h2', task: 'Teine päev', date: '2026-09-02' }]) },
    summaryApi: { subscribeForStudent: (id, onData) => { onData([{ id: 'inv1', startedAt: '2026-09-04T11:00:00.000Z', note: 'Rääkisime päevast.', pages: [{ id: 'p1', title: 'Kellaajad' }] }]); return () => {}; } },
    wordsApi: { subscribeForStudent: (id, onData) => { onData([{ id: 'w1', word: 'hommikul', translation: 'утром', createdAt: '2026-09-04T11:10:00.000Z' }, { id: 'w2', word: 'vana', createdAt: '2026-08-01T10:00:00.000Z' }]); return () => {}; } },
    recordingApi: { listForStudent: vi.fn().mockResolvedValue([]) },
    boardApi: { subscribePages: (id, onData) => { onData([]); return () => {}; } },
  };
}

describe('a lesson opened on its own from the student card', () => {
  it('shows the mark, topic, notes and everything from that day only', async () => {
    const detailApis = apis();
    render(<MemoryRouter><StudentLessonsPanel student={student} lessons={lessons} schedule={[]} user={{ uid: 'a' }} lessonApi={{}} onChanged={() => {}} detailApis={detailApis} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Ava tund 2026-09-04' }));
    const dialog = await screen.findByRole('dialog', { name: 'Tund 2026-09-04 · 14:00' });
    expect(within(dialog).getByText('Toimunud ja kontrollitud')).toBeInTheDocument();
    expect(within(dialog).getByText('Minu päev')).toBeInTheDocument();
    expect(within(dialog).getByText('Hea töö kellaaegadega.')).toBeInTheDocument();
    expect(within(dialog).getByText('Rääkisime päevast.')).toBeInTheDocument();
    expect(await within(dialog).findByText('Korda tunni sõnu')).toBeInTheDocument();
    expect(within(dialog).queryByText('Teine päev')).not.toBeInTheDocument();
    expect(within(dialog).getByText('hommikul – утром')).toBeInTheDocument();
    expect(within(dialog).queryByText(/vana/)).not.toBeInTheDocument();
    expect(detailApis.recordingApi.listForStudent).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's1' }));
  });

  it('says so when nothing else is known about the day', async () => {
    const detailApis = { ...apis(), homeworkApi: { listByStudentIds: vi.fn().mockResolvedValue([]) }, summaryApi: { subscribeForStudent: (id, onData) => { onData([]); return () => {}; } }, wordsApi: { subscribeForStudent: (id, onData) => { onData([]); return () => {}; } } };
    render(<MemoryRouter><StudentLessonsPanel student={student} lessons={lessons} schedule={[]} user={{ uid: 'a' }} lessonApi={{}} onChanged={() => {}} detailApis={detailApis} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Ava tund 2026-09-02' }));
    expect(await screen.findByText(/pole kodutööd, kokkuvõtet, sõnu ega salvestist/)).toBeInTheDocument();
  });
});
