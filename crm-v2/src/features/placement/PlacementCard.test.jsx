import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PlacementCard from './PlacementCard.jsx';

const student = { id: 's1', name: 'Mia' };
describe('PlacementCard', () => {
  it('sends the test and, once done, shows the suggested level per level', async () => {
    const repository = { list: vi.fn().mockResolvedValue([]), assign: vi.fn().mockResolvedValue({}) };
    const { unmount } = render(<PlacementCard student={student} user={{ uid: 't' }} repository={repository} />);
    fireEvent.click(await screen.findByRole('button', { name: /Saada paigutustest/ }));
    expect(await screen.findByText(/Paigutustest on õpilase „Kodutööd” all/)).toBeInTheDocument();
    expect(repository.assign).toHaveBeenCalledWith({ student, user: { uid: 't' } });
    unmount();
    const done = { lessonId: 'placement-et', status: 'done', completedAt: '2026-10-22T10:00:00Z', score: { perGoal: { g_a1: { ok: 6, total: 6 }, g_a2: { ok: 5, total: 6 }, g_b1: { ok: 2, total: 6 }, g_b2: { ok: 1, total: 6 }, g_c1: { ok: 0, total: 6 } } } };
    render(<PlacementCard student={student} user={{ uid: 't' }} repository={{ list: vi.fn().mockResolvedValue([done]), assign: vi.fn() }} />);
    expect(await screen.findByText('Testi järgi: A2')).toBeInTheDocument();
    expect(screen.getByText('83%')).toBeInTheDocument();
  });
});
