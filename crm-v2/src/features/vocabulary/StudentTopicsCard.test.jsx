import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import StudentTopicsCard from './StudentTopicsCard.jsx';
import StudentProfilePage from '../students/StudentProfilePage.jsx';
import { buildTopics, topicReport } from './topicModel.js';

// three course modules of A2 with lessons; the words come from the fake loader
const curriculum = [
  { id: 'a2-001', title: 'Tutvumine', level: 'A2', topic: '01. Mina ja pere', roadmapManaged: true, roadmapLessonNumber: 1 },
  { id: 'a2-002', title: 'Pere', level: 'A2', topic: '01. Mina ja pere', roadmapManaged: true, roadmapLessonNumber: 2 },
  { id: 'a2-003', title: 'Kodu', level: 'A2', topic: '02. Kodu', roadmapManaged: true, roadmapLessonNumber: 3 },
  { id: 'a2-004', title: 'Linn', level: 'A2', topic: '03. Linn', roadmapManaged: true, roadmapLessonNumber: 4 },
];
const ET = { 'a2-001': ['nimi', 'vanus', 'pere', 'ema'], 'a2-002': ['isa', 'vend', 'õde', 'laps'], 'a2-003': ['kodu', 'tuba', 'köök', 'aken', 'uks'], 'a2-004': ['linn', 'buss', 'pood', 'park'] };
const words = Object.fromEntries(Object.entries(ET).map(([id, list]) => [id, list.map((et) => ({ et, ru: `ru-${et}`, ex: '' }))]));
const own = (lessonId, n, createdAt) => ET[lessonId].slice(0, n).map((et, i) => ({ id: `lw_s1_${lessonId}_${i}`, studentId: 's1', word: et, createdAt }));

// topic 1 passed on 12 Oct, topic 2 open with two words already known (one added by a teacher under its own spelling)
const studentWords = [
  ...own('a2-001', 4, '2026-10-12T09:00:00.000Z'), ...own('a2-002', 4, '2026-10-12T09:00:00.000Z'),
  { id: 'teacher-word', studentId: 's1', word: 'Kodu', createdAt: '2026-09-01T08:00:00.000Z' },
  { id: 'lw_s1_a2-003_1', studentId: 's1', word: 'tuba', createdAt: '2026-09-02T08:00:00.000Z' },
];

const apis = () => ({
  catalogApi: { listCurriculum: vi.fn().mockResolvedValue(curriculum) },
  wordsApi: { listForStudent: vi.fn().mockResolvedValue(studentWords), addLessonWords: vi.fn() },
  loadWords: vi.fn().mockResolvedValue(words),
});

describe('Sõnavara teemad for staff', () => {
  it('topicReport: state, known words and the date a topic was passed', () => {
    const level = { modules: [
      { key: 'm1', label: 'Mina', lessons: [{ id: 'a2-001' }, { id: 'a2-002' }] },
      { key: 'm2', label: 'Kodu', lessons: [{ id: 'a2-003' }] },
      { key: 'm3', label: 'Linn', lessons: [{ id: 'a2-004' }] },
    ] };
    const report = topicReport(buildTopics(level, words, 's1'), studentWords);
    expect(report.map((t) => [t.key, t.state, t.known, t.words.length, t.passedAt])).toEqual([
      ['m1', 'passed', 8, 8, '2026-10-12T09:00:00.000Z'],
      ['m2', 'open', 2, 5, ''],
      ['m3', 'locked', 0, 4, ''],
    ]);
  });

  it('shows the topics of the student\'s level in order, read only, with passed / all and the last pass date', async () => {
    const data = apis();
    render(<StudentTopicsCard student={{ id: 's1', level: 'A2' }} {...data} />);
    const list = await screen.findByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items.map((li) => li.querySelector('strong').textContent)).toEqual(['01. Mina ja pere', '02. Kodu', '03. Linn']);
    const day = new Date('2026-10-12T09:00:00.000Z').toLocaleDateString('et-EE');
    expect(within(items[0]).getByText(`läbitud · 8/8 sõna · ${day}`)).toBeInTheDocument();
    expect(within(items[1]).getByText('avatud · 2/5 sõna')).toBeInTheDocument();
    expect(within(items[2]).getByText('lukus · 0/4 sõna')).toBeInTheDocument();
    expect(screen.getByText(`Läbitud 1/3 teemat. Viimati läbitud: 01. Mina ja pere (${day}).`)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Teemad · A2' })).toBeInTheDocument();
    // a view only: no study, no test, nothing written
    expect(screen.queryByRole('button')).toBeNull();
    expect(data.wordsApi.addLessonWords).not.toHaveBeenCalled();
    expect(data.wordsApi.listForStudent).toHaveBeenCalledWith('s1');
    expect(data.loadWords).toHaveBeenCalledWith(['a2-001', 'a2-002', 'a2-003', 'a2-004']);
  });

  it('nothing passed yet; a load error can be retried', async () => {
    const data = apis();
    data.wordsApi.listForStudent.mockResolvedValueOnce([]);
    const { unmount } = render(<StudentTopicsCard student={{ id: 's1', level: 'A2' }} {...data} />);
    expect(await screen.findByText(/Läbitud 0\/3 teemat\. Ühtegi teemat pole veel läbitud\./)).toBeInTheDocument();
    unmount();
    data.catalogApi.listCurriculum.mockRejectedValueOnce(new Error('Võrk puudub'));
    render(<StudentTopicsCard student={{ id: 's1', level: 'A2' }} {...data} />);
    expect(await screen.findByText('Võrk puudub')).toBeInTheDocument();
  });

  it('is on the student card under „Areng”', async () => {
    const student = { id: 's1', name: 'Mari Maas', teacher: 'Pavel', active: true, level: 'A2' };
    render(
      <MemoryRouter initialEntries={['/students/s1?tab=learning']}>
        <Routes><Route path="/students/:studentId" element={<StudentProfilePage studentApi={{ getById: vi.fn().mockResolvedValue(student) }} lessonApi={{ listByStudent: vi.fn().mockResolvedValue([]) }} invoiceApi={{ listByStudent: vi.fn().mockResolvedValue([]) }} scheduleApi={{ listByStudent: vi.fn().mockResolvedValue([]) }} homeworkApi={{}} recordingApi={{}} topicsApi={apis()} actor={{ uid: 'a', roles: ['admin'], displayName: 'Admin' }} />} /></Routes>
      </MemoryRouter>,
    );
    const card = await screen.findByLabelText('Sõnavara teemad', {}, { timeout: 4000 });
    expect(await within(card).findByText(/Läbitud 1\/3 teemat/)).toBeInTheDocument();
  });
});
