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
});
