import { describe, expect, it } from 'vitest';
import { todayPath } from './todayPath.js';

const today = '2026-10-12';
const now = Date.parse('2026-10-12T10:00:00Z');

describe('Tänane tee', () => {
  it('counts what the student really did today', () => {
    const path = todayPath({
      today, now,
      words: [{ id: 'a', reviewedAt: '2026-10-12T08:00:00Z', dueAt: '2026-10-20' }, { id: 'b', dueAt: '2026-10-01' }],
      homework: [{ id: 'h', task: 'Loe tekst', status: 'Ootel' }],
      submissions: [],
      pet: { kind: 'rebane', name: 'Lisa', playedAt: '2026-10-11T10:00:00Z' },
    });
    expect(path.steps.map((step) => [step.key, step.done])).toEqual([['words', true], ['work', false], ['pet', false]]);
    expect(path.steps[1].detail).toBe('Loe tekst');
    expect(path.done).toBe(1);
    expect(path.total).toBe(3);
  });
  it('no open homework: the step is a course lesson on one\'s own; no pet, no pet step', () => {
    const path = todayPath({ today, now, words: [{ id: 'b', dueAt: '2026-10-01' }], homework: [], submissions: [] });
    expect(path.steps.map((step) => [step.key, step.label, step.done, step.to])).toEqual([['words', 'Korda sõnu', false, '/student/sonavara'], ['work', 'Korda tundi', false, '/student/kursus']]);
  });
  it('a student without a friend gets the step to choose one (not in the teacher\'s preview, not when switched off)', () => {
    expect(todayPath({ today, now, offerPet: true }).steps.at(-1)).toMatchObject({ key: 'pet', label: 'Vali endale sõber', to: '/student/lemmik', done: false });
    expect(todayPath({ today, now, offerPet: false }).steps.some((step) => step.key === 'pet')).toBe(false);
    expect(todayPath({ today, now, offerPet: true, pet: { optedOut: true } }).steps.some((step) => step.key === 'pet')).toBe(false);
  });
  it('a sheet submitted today closes the work step', () => {
    const path = todayPath({ today, now, homework: [{ id: 'h', status: 'Ootel', task: 'X' }], submissions: [{ completedAt: '2026-10-12T09:00:00Z' }] });
    expect(path.steps[1]).toMatchObject({ done: true, detail: 'Tehtud täna' });
  });
});
