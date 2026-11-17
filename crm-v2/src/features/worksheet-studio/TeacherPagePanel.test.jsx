import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import DocWorksheetPlayer from './DocWorksheetPlayer.jsx';
import LiveWorksheetView from './LiveWorksheetView.jsx';
import TeacherPagePanel, { extraFields, planRows } from './TeacherPagePanel.jsx';
import { SCHEMA } from './engine/schema.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const page = {
  goal: 'Ученик сравнивает свой дом с данными.',
  hook: '«Угадаем: сколько минут в день?»',
  plan: ['0–10: пункт 1 — игра', '10–22: пункт 2 — радио', 'запас: обсуждение'],
  stations: [
    { n: 1, title: 'Arva ära!', minutes: 10, sheet: 'Avasta', core: true, alt: false, final: '', needs: null, tasks: [{ id: 'd1', teacher: 'Vastused: 47 min.' }] },
    { n: 2, title: 'Raadio', minutes: 12, sheet: 'Avasta', core: false, alt: true, final: '', needs: null, tasks: [] },
  ],
  core: [1, 3, 4], alt: 2, coreMinutes: 37, totalMinutes: 49,
  short: 'План Б: игра — 3 вопроса.',
  errors: ['läheb jahe → läheb jahedaks', 'oodatakse äike → äikest'],
  sources: 'Статистикаамет 2019–2021.',
  groups: '', notes: [],
  // a field a later course version adds: shown under its own key
  homework: 'Kirjuta vastus lõpuni.',
};

const teacher = { uid: 't', roles: ['teacher'] };
const student = { uid: 's', roles: ['student'] };

describe('TeacherPagePanel', () => {
  it('shows the teacher page to staff: hook first, the minute plan as a timeline, plan B, errors, sources', () => {
    render(<TeacherPagePanel page={page} user={teacher} defaultOpen />);
    expect(screen.getByText('Õpetaja leht')).toBeInTheDocument();
    expect(screen.getByText('õpilane ei näe')).toBeInTheDocument();
    expect(screen.getByText('Konks — mida öelda')).toBeInTheDocument();
    expect(screen.getByText(page.hook)).toBeInTheDocument();
    expect(screen.getByText('0–10')).toBeInTheDocument();
    expect(screen.getByText('пункт 1 — игра')).toBeInTheDocument();
    expect(screen.getByText('запас: обсуждение')).toBeInTheDocument();
    expect(screen.getByText('Plaan B — kui aega on vähe')).toBeInTheDocument();
    expect(screen.getByText('läheb jahe → läheb jahedaks')).toBeInTheDocument();
    expect(screen.getByText('Vastuste allikad')).toBeInTheDocument();
    expect(screen.getByText(/põhitee 1, 3, 4 \(37 min\)/)).toBeInTheDocument();
    expect(screen.getByText('Jaam 1 (d1): Vastused: 47 min.')).toBeInTheDocument();
    expect(screen.getByText('homework')).toBeInTheDocument();
    expect(screen.queryByText('Väike rühm')).toBeNull();
    expect(screen.getByTestId('teacher-page-panel')).toHaveAttribute('open');
  });

  it('takes the signed-in user from AuthContext and stays closed by default', () => {
    render(<AuthContext.Provider value={{ user: { uid: 'a', roles: ['admin'] } }}><TeacherPagePanel page={page} /></AuthContext.Provider>);
    expect(screen.getByTestId('teacher-page-panel')).not.toHaveAttribute('open');
  });

  it('never renders for a student, a parent or nobody', () => {
    const { container, rerender } = render(<TeacherPagePanel page={page} user={student} defaultOpen />);
    expect(container).toBeEmptyDOMElement();
    rerender(<TeacherPagePanel page={page} user={{ uid: 'p', roles: ['parent'] }} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<TeacherPagePanel page={page} user={null} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<AuthContext.Provider value={{ user: student }}><TeacherPagePanel page={page} /></AuthContext.Provider>);
    expect(container).toBeEmptyDOMElement();
  });

  it('handles a missing or thin page', () => {
    const { container, rerender } = render(<TeacherPagePanel page={undefined} user={teacher} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<TeacherPagePanel page={{ goal: '', errors: [], plan: null }} user={teacher} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<TeacherPagePanel page={{ goal: 'Цель.', core: [1, 4], alt: 4, short: '', errors: ['x'] }} user={teacher} defaultOpen />);
    expect(screen.getByText('Цель.')).toBeInTheDocument();
    expect(screen.queryByText('Konks — mida öelda')).toBeNull();
    expect(screen.queryByText('Minutiplaan')).toBeNull();
  });

  it('splits plan lines into time and text, and keeps only text extras', () => {
    expect(planRows(['0–4: крючок', '62-90: запас', 'без времени', 5])).toEqual([
      { time: '0–4', text: 'крючок' }, { time: '62-90', text: 'запас' }, { time: '', text: 'без времени' }, { time: '', text: '5' },
    ]);
    expect(extraFields({ goal: 'x', extra: ' y ', empty: '', obj: { a: 1 }, many: ['a', '', 'b'] })).toEqual([
      { key: 'extra', items: ['y'] }, { key: 'many', items: ['a', 'b'] },
    ]);
  });
});

// the same sheet doc (with meta.teacherPage, as the published course sheet carries it) in the teacher's live view and
// in the learner's player
describe('teacher page on the lesson screens', () => {
  const worksheetDoc = {
    schema: SCHEMA, id: 'd', meta: { title: 'Kodu', goals: { g1: 'Saan aru.' }, teacherPage: page },
    blocks: [{ id: 'tf', type: 'truefalse', width: 'half', tone: 'green', goal: 'g1', data: { title: 'Õige või vale?', statements: [{ text: 'Päeval on pime.', answer: 'false' }] } }],
  };
  const assignment = { id: 'as-1', studentId: 'st-1', studentName: 'Mari', title: 'Kodu', status: 'in_progress', answers: {}, worksheetDoc, updatedAt: '2026-11-17T10:00:00Z' };

  it.each([[false], [true]])('the live lesson view shows it to the teacher (board %s)', (board) => {
    let push;
    const repository = { subscribeWorksheetAssignment: vi.fn((_id, onData) => { push = onData; return () => {}; }), setWorksheetLiveFocus: vi.fn() };
    render(<MemoryRouter><AuthContext.Provider value={{ user: teacher }}><LiveWorksheetView assignmentId="as-1" repository={repository} board={board} /></AuthContext.Provider></MemoryRouter>);
    act(() => push(assignment));
    expect(screen.getByText('Õpetaja leht')).toBeInTheDocument();
    expect(screen.getByText(page.hook)).toBeInTheDocument();
  });

  it('the learner player never shows it', () => {
    const repository = { saveWorksheetDraft: vi.fn().mockResolvedValue({}), submitWorksheet: vi.fn().mockResolvedValue({}) };
    render(<MemoryRouter><AuthContext.Provider value={{ user: student }}><DocWorksheetPlayer assignment={assignment} repository={repository} inline /></AuthContext.Provider></MemoryRouter>);
    expect(screen.getAllByText('Päeval on pime.').length).toBeGreaterThan(0);
    expect(screen.queryByText('Õpetaja leht')).toBeNull();
    expect(screen.queryByText(page.hook)).toBeNull();
    expect(screen.queryByText('Plaan B — kui aega on vähe')).toBeNull();
  });
});
