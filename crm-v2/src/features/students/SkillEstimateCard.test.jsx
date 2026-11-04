import { render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import SkillEstimateCard from './SkillEstimateCard.jsx';

const now = Date.parse('2026-11-04T12:00:00Z');
const sheet = (id, completedAt, ok, total) => ({ id, status: 'done', completedAt, worksheetDoc: { blocks: [{ id: 'b' }] }, answers: { 'b:0': 'x' }, score: { correct: ok, total, perGoal: { g_read: { ok, total } } } });
const recording = (id, startedAt, checked, errors) => ({ id, invitationId: id, status: 'done', startedAt, analysis: { checked, errors: Array.from({ length: errors }, (_, i) => ({ said: `a${i}`, corrected: `b${i}` })) } });

function repo(overrides = {}) {
  return {
    assignments: vi.fn().mockResolvedValue([sheet('r1', '2026-10-30T10:00:00Z', 17, 20), sheet('r2', '2026-10-20T10:00:00Z', 10, 10), sheet('r3', '2026-10-05T10:00:00Z', 9, 10)]),
    recordings: vi.fn().mockResolvedValue([recording('l1', '2026-11-02T15:00:00Z', 20, 8), recording('l2', '2026-10-28T15:00:00Z', 15, 6)]),
    stats: vi.fn().mockResolvedValue([]),
    words: vi.fn().mockRejectedValue(new Error('permission-denied')),
    curriculum: vi.fn().mockResolvedValue([1, 2].map((n) => ({ id: `b1-${n}`, title: `Tund ${n}`, level: 'B1', roadmapModuleTitle: 'Igapäevaelu', roadmapModuleNumber: 1, roadmapLessonNumber: n }))),
    ...overrides,
  };
}

describe('SkillEstimateCard', () => {
  it('shows per-skill bars, the average, the course position and „vähe andmeid” for thin skills', async () => {
    const repository = repo();
    render(<SkillEstimateCard student={{ id: 's1', level: 'A2', targetLevel: 'B1' }} lessons={[{ topicLessonId: 'b1-1', status: 'Toimunud' }]} repository={repository} now={now} />);
    const reading = (await screen.findByText('Lugemine', {}, { timeout: 4000 })).closest('.auto-skills__row');
    expect(within(reading).getByText('100%')).toBeInTheDocument();
    expect(within(reading).getByText(/3 töölehte · 40 vastust/)).toBeInTheDocument();
    const grammar = screen.getByText('Grammatika täpsus').closest('.auto-skills__row');
    // 35 checked, 14 with an error → 60 % → (60 − 30) / 50 = 60 %
    expect(within(grammar).getByText('60%')).toBeInTheDocument();
    const listening = screen.getByText('Kuulamine').closest('.auto-skills__row');
    expect(within(listening).getByText(/vähe andmeid/)).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument(); // average of reading and grammar
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByText(/Hinnang, mitte eksam/)).toBeInTheDocument();
    expect(screen.getByText(/Osa andmeid jäi laadimata/)).toBeInTheDocument();
    expect(repository.recordings).toHaveBeenCalledWith('s1');
  });

  it('says when the level or the target is not on the card', async () => {
    render(<SkillEstimateCard student={{ id: 's1', level: 'A2' }} repository={repo({ words: vi.fn().mockResolvedValue([]) })} now={now} />);
    expect(await screen.findByText(/sihttase märkimata, arvestan A2 → B1/, {}, { timeout: 4000 })).toBeInTheDocument();
  });
});
