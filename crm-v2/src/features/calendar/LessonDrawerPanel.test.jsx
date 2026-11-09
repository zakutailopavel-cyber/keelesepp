import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import LessonDrawerPanel from './LessonDrawerPanel.jsx';
import { onEntityChanged } from '../../components/entityDrawer/entityDrawer.js';
import { onLessonMarked } from './lessonActions.js';

const event = { id: 'e1', studentId: 's1', studentName: 'Mia vana', date: '2025-01-06', time: '10:00', duration: 60, teacher: 'Anna', teacherUid: 't1', status: 'Planeeritud', recurring: false };
const record = { id: 'L1', studentId: 's1', scheduleId: 'e1', date: '2025-01-06', status: 'Toimunud', topic: 'Individuaalne tund', notes: '' };

function repositories({ lessons = [[]], schedule = event } = {}) {
  const listByStudent = vi.fn();
  lessons.forEach((value) => listByStudent.mockResolvedValueOnce(value));
  listByStudent.mockResolvedValue(lessons[lessons.length - 1]);
  return {
    scheduleRepository: { get: vi.fn(async () => schedule) },
    studentRepository: { getById: vi.fn(async () => ({ id: 's1', name: 'Mia', level: 'A2' })) },
    lessonRepository: { listByStudent, completeFromSchedule: vi.fn(async () => record), changeMark: vi.fn(async () => ({})), removeMark: vi.fn(async () => ({})), updateDetails: vi.fn(async () => ({})) },
    libraryRepository: { list: vi.fn(async () => ({ curriculumLessons: [], exercises: [] })), assign: vi.fn() },
    financeRepository: { setLessonBillingDisposition: vi.fn(async () => ({})) },
    deviceCheck: { forStudent: vi.fn(async () => ({ deviceCheck: null, hadLiveLesson: false })) },
  };
}

function renderPanel(repos, { roles = ['teacher'], date = '2025-01-06' } = {}) {
  const auth = { user: { uid: 't1', displayName: 'Anna', roles }, signOut: vi.fn() };
  return render(<AuthContext.Provider value={auth}><LessonDrawerPanel scheduleId="e1" date={date} onClose={vi.fn()} {...repos} /></AuthContext.Provider>);
}

describe('LessonDrawerPanel (the side drawer’s lesson)', () => {
  it('shows the calendar lesson and marks it held through the calendar’s own path', async () => {
    const repos = repositories({ lessons: [[], [record]] });
    const marked = [];
    const stop = onLessonMarked((id) => marked.push(id));
    renderPanel(repos);
    expect(await screen.findByRole('dialog', { name: 'Tund: Mia' })).toBeInTheDocument();
    // a teacher reads only his own lessons of the student (the rules)
    expect(repos.lessonRepository.listByStudent).toHaveBeenCalledWith('s1', { teacherUid: 't1' });
    // moving, cancelling and the Live Classroom stay in the calendar; „Kooli kulul” is the administrator's
    expect(screen.queryByRole('button', { name: /Muuda aega/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tühista tund/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Kooli kulul/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Tund toimus/ }));
    await waitFor(() => expect(repos.lessonRepository.completeFromSchedule).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1', occurrenceDate: '2025-01-06', occurrenceId: 'e1:2025-01-06', studentName: 'Mia' }), expect.objectContaining({ uid: 't1' }), expect.objectContaining({ status: 'Toimunud' })));
    expect(await screen.findByText('Tund märgiti toimunuks.')).toBeInTheDocument();
    expect(await screen.findByText('Toimunud')).toBeInTheDocument();
    stop();
    expect(marked).toEqual(['e1:2025-01-06']);
  });

  it('the administrator reads every lesson of the student and may set „Kooli kulul” on a held one', async () => {
    const repos = repositories({ lessons: [[record]], schedule: { ...event, status: 'Toimunud', lessonEntryId: 'L1' } });
    const changes = [];
    const stop = onEntityChanged('lesson', (change) => changes.push(change));
    const marked = [];
    const stopMarked = onLessonMarked((id) => marked.push(id));
    renderPanel(repos, { roles: ['admin'] });
    expect(await screen.findByText('Toimunud')).toBeInTheDocument();
    expect(repos.lessonRepository.listByStudent).toHaveBeenCalledWith('s1', {});
    fireEvent.click(screen.getByRole('button', { name: /Kooli kulul \(õpilane ei maksa\)/ }));
    fireEvent.change(screen.getByRole('textbox', { name: /Põhjus/ }), { target: { value: 'proovitund' } });
    fireEvent.click(screen.getByRole('button', { name: /Kinnita: kooli kulul/ }));
    await waitFor(() => expect(repos.financeRepository.setLessonBillingDisposition).toHaveBeenCalledWith('L1', 'school_covered', 'proovitund'));
    // the page under the drawer is told a lesson changed (not „marked”: the „Märkimata tunnid” rows stay as they are)
    await waitFor(() => expect(changes).toEqual([{ kind: 'lesson', occurrenceId: 'e1:2025-01-06', change: 'changed' }]));
    stop(); stopMarked();
    expect(marked).toEqual([]);
  });

  it('a lesson that is not there on that day, or a group lesson, sends to the calendar', async () => {
    renderPanel(repositories(), { date: '2025-01-07' });
    expect(await screen.findByText(/Sel päeval seda tundi enam ei ole/)).toBeInTheDocument();
  });

  it('a refused read says so', async () => {
    const repos = repositories();
    repos.scheduleRepository.get = vi.fn(async () => { throw Object.assign(new Error('denied'), { code: 'permission-denied' }); });
    renderPanel(repos);
    expect(await screen.findByText('Seda tundi ei saa sinu kontoga avada.')).toBeInTheDocument();
  });
});
