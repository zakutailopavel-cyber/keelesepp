import { describe, expect, it } from 'vitest';
import { levelProgress, speakingFromStats } from './levelProgress.js';

describe('Minu areng', () => {
  it('A1 → B1: the A2 course now, readiness from course and skills, a path of three levels', () => {
    const p = levelProgress({
      level: 'A1', target: 'B1',
      computed: [{ skill: 'Grammatika', pct: 40, basis: '3 töölehte' }, { skill: 'Lugemine', pct: 80, basis: '2 töölehte' }],
      skillMap: { sõnavara: 60 },
      courseByLevel: { A2: { done: 20, total: 100, next: '21. Minu päev' } },
    });
    expect(p.step).toBe('A2');
    expect(p.path.map((x) => [x.level, x.state])).toEqual([['A1', 'done'], ['A2', 'current'], ['B1', 'todo']]);
    expect(p.skills.find((s) => s.skill === 'Sõnavara')).toMatchObject({ pct: 60, state: 'close', basis: 'õpetaja hinnang' });
    expect(p.readiness).toBe(Math.round((20 + 60) / 2));
    expect(p.overall).toBe(20);
    expect(p.hints.map((h) => h.key)).toEqual(['skill-Grammatika', 'first-Rääkimine', 'course']);
    expect(p.hints[0].et).toContain('Grammatika 40% → 70%');
  });
  it('ready: all known skills above the bar and most of the course done → ask for the level test', () => {
    const computed = ['Grammatika', 'Sõnavara', 'Lugemine', 'Kirjutamine', 'Kuulamine', 'Rääkimine'].map((skill) => ({ skill, pct: 85 }));
    const p = levelProgress({ level: 'A2', target: 'B1', computed, courseByLevel: { B1: { done: 80, total: 90, next: 'x' } } });
    expect(p.hints[0]).toMatchObject({ key: 'test', to: '/messages' });
  });
  it('target reached: 100%', () => {
    expect(levelProgress({ level: 'B1', target: 'B1' })).toMatchObject({ reached: true, overall: 100 });
  });
  it('speaking from lesson stats the student can read', () => {
    expect(speakingFromStats([{ studentWords: 100, share: 60 }, { studentWords: 50, share: 80 }, { studentWords: 5, share: 0 }])).toMatchObject({ skill: 'Rääkimine', pct: 70 });
    expect(speakingFromStats([])).toBe(null);
  });
});
