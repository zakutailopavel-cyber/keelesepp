import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import StudentTimesPanel from './StudentTimesPanel.jsx';

// lessons a week the learner wants (team 2026-10-29) next to the name in „Sobivad ajad” over the calendar
describe('StudentTimesPanel', () => {
  it('shows how often a picked student wants lessons', () => {
    const students = [{ id: 's1', name: 'Mari', enrollments: [{ subject: 'Eesti keel' }, { subject: 'Matemaatika' }] }];
    const availabilityById = new Map([['s1', { slots: ['Mon-17:00', 'Mon-17:30'], preferred: [], perWeek: { 'eesti-keel': 2, matemaatika: 1 } }]]);
    render(<MemoryRouter><StudentTimesPanel students={students} availabilityById={availabilityById} selected={['s1']} onSelect={vi.fn()} onClose={vi.fn()} onPick={vi.fn()} /></MemoryRouter>);
    expect(screen.getByText(/Eesti keel 2× · Matemaatika 1× nädalas/)).toBeInTheDocument();
  });
});
