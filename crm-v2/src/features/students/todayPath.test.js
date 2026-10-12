import { describe, expect, it } from 'vitest';
import { todayPath } from './todayPath.js';

const today = '2026-10-12';
const now = Date.parse('2026-10-12T10:00:00Z');

describe('Täna — four things to do', () => {
  it('tasks, words, my mistakes and the pet, each done by what the student really did today', () => {
    const path = todayPath({
      today, now,
      words: [{ id: 'a', reviewedAt: '2026-10-12T08:00:00Z', dueAt: '2026-10-20' }, { id: 'b', dueAt: '2026-10-01' }, { id: 'e', word: 'Ma läksin panka', translation: 'Sinu lause: Mina läksin pank' }],
      homework: [{ id: 'h', task: 'Loe tekst', status: 'Ootel' }],
      assignments: [{ id: 's1', status: 'new' }, { id: 's2', status: 'done' }],
      pet: { kind: 'rebane', name: 'Lisa', playedAt: '2026-10-11T10:00:00Z' },
    });
    expect(path.steps.map((step) => [step.key, step.done, step.to])).toEqual([
      ['work', false, '/homework'], ['words', true, '/student/sonavara'], ['mistakes', false, '/student/vead'], ['pet', false, '/student/lemmik'],
    ]);
    expect(path.steps[0].detail).toBe('2 ootab');
    expect(path.steps[2].detail).toBe('1 lauset tundidest');
    expect(path.done).toBe(1);
  });

  it('no mistakes — no mistakes step; the mistakes drill done today closes it', () => {
    expect(todayPath({ today, now }).steps.map((step) => step.key)).toEqual(['work', 'words']);
    const words = [{ id: 'e', word: 'Ma läksin panka', translation: 'Sinu lause: Mina läksin pank' }];
    expect(todayPath({ today, now, words, mistakesDoneToday: true }).steps.find((step) => step.key === 'mistakes')).toMatchObject({ done: true, detail: 'Harjutatud täna' });
  });

  it('a student without a friend gets the step to choose one (not in the teacher\'s preview, not when switched off)', () => {
    expect(todayPath({ today, now, offerPet: true }).steps.at(-1)).toMatchObject({ key: 'pet', label: 'Vali endale sõber', to: '/student/lemmik', done: false });
    expect(todayPath({ today, now, offerPet: false }).steps.some((step) => step.key === 'pet')).toBe(false);
    expect(todayPath({ today, now, offerPet: true, pet: { optedOut: true } }).steps.some((step) => step.key === 'pet')).toBe(false);
  });

  it('a sheet submitted today closes the task step', () => {
    const path = todayPath({ today, now, homework: [{ id: 'h', status: 'Ootel', task: 'X' }], submissions: [{ completedAt: '2026-10-12T09:00:00Z' }] });
    expect(path.steps[0]).toMatchObject({ key: 'work', done: true, detail: 'Tehtud täna' });
  });
});
