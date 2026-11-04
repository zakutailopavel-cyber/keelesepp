import { render, screen } from '@testing-library/react';
import MonthStepsCard from './MonthStepsCard.jsx';

describe('MonthStepsCard', () => {
  it('shows the steps and how many are mastered; nothing without sheets', () => {
    const { container, rerender } = render(<MonthStepsCard assignments={[]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<MonthStepsCard assignments={[{ lessonTitle: 'Tutvumine', status: 'done', completedAt: new Date().toISOString(), worksheetDoc: { meta: { goals: { g1: 'Ma oskan ennast tutvustada' } } }, score: { perGoal: { g1: { ok: 4, total: 5 } } } }]} />);
    expect(screen.getByText(/1 \/ 1 sammu selge/)).toBeInTheDocument();
    expect(screen.getByText('Selge · 80%')).toBeInTheDocument();
    expect(screen.getByText(/шагов усвоено/)).toBeInTheDocument();
    rerender(<MonthStepsCard ruHint={false} assignments={[{ lessonTitle: 'Tutvumine', status: 'done', completedAt: new Date().toISOString(), worksheetDoc: { meta: { goals: { g1: 'Ma oskan ennast tutvustada' } } }, score: { perGoal: { g1: { ok: 4, total: 5 } } } }]} />);
    expect(screen.queryByText(/шагов усвоено/)).not.toBeInTheDocument();
  });
  it('lights (the learner): the curve rule for „Oskan” and words only, no percentages', () => {
    const sheet = (id, lesson, ok, total, days = 1) => ({ id, lessonTitle: lesson, status: 'done', completedAt: new Date(Date.now() - days * 86400000).toISOString(), worksheetDoc: { meta: { goals: { g1: `Ma oskan ${lesson}` } } }, score: { perGoal: { g1: { ok, total } } } });
    const assignments = [sheet('a1', 'tutvustada', 7, 10), sheet('a2', 'tutvustada', 7, 10, 2), sheet('b1', 'tellida', 9, 10), sheet('c1', 'kirjutada', 3, 10)];
    const { container } = render(<MonthStepsCard lights assignments={assignments} />);
    // 70 % in 2 sheets = Oskan; 90 % in only one sheet = Harjutan; 30 % = Kordame
    const label = (text) => screen.getByText(text).closest('li').querySelector('em').textContent;
    expect(label('Ma oskan tutvustada')).toMatch(/^Oskan/);
    expect(label('Ma oskan tellida')).toMatch(/^Harjutan/);
    expect(label('Ma oskan kirjutada')).toMatch(/^Kordame/);
    expect(screen.getByText('1 oskan')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\d+\s?%/);
    expect(container.querySelector('.ms-bar')).toBeNull();
    // the staff view of the same sheets keeps its percentages
    const staff = render(<MonthStepsCard assignments={assignments} />);
    expect(staff.container.textContent).toMatch(/\d+%/);
  });
});
