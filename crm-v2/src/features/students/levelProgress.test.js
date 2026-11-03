import { describe, expect, it } from 'vitest';
import { coursePath, levelProgress, speakingFromStats } from './levelProgress.js';

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
  it('a weak or unknown skill on worksheets leads to the tasks of that skill, not to every task', () => {
    const computed = [{ skill: 'Kuulamine', pct: 0 }, { skill: 'Grammatika', pct: 90 }];
    const p = levelProgress({ level: 'B1', target: 'B2', computed });
    expect(p.hints[0]).toMatchObject({ key: 'skill-Kuulamine', to: '/homework?oskus=Kuulamine' });
    expect(p.hints[0].et).toContain('Kuulamine 0% → 70%');
    const unknown = levelProgress({ level: 'B1', target: 'B2', computed: ['Rääkimine', 'Grammatika', 'Sõnavara'].map((skill) => ({ skill, pct: 90 })) });
    expect(unknown.hints.find((h) => h.key === 'first-Lugemine')).toMatchObject({ to: '/homework?oskus=Lugemine' });
  });
  it('target reached: 100%', () => {
    expect(levelProgress({ level: 'B1', target: 'B1' })).toMatchObject({ reached: true, overall: 100 });
  });
  it('speaking from lesson stats the student can read', () => {
    expect(speakingFromStats([{ studentWords: 100, share: 60 }, { studentWords: 50, share: 80 }, { studentWords: 5, share: 0 }])).toMatchObject({ skill: 'Rääkimine', pct: 70 });
    expect(speakingFromStats([])).toBe(null);
  });

  it('Sõnavara is not „Valmis” while none of his word cards is learned', () => {
    const computed = [{ skill: 'Sõnavara', pct: 100, basis: '1 tööleht' }];
    const skill = (wordCounts) => levelProgress({ level: 'A2', target: 'B1', computed, wordCounts }).skills.find((row) => row.skill === 'Sõnavara');
    expect(skill({ words: 12, learned: 0 })).toMatchObject({ pct: 100, state: 'close', note: 'sõnad veel õppimata' });
    expect(skill({ words: 12, learned: 3 })).toMatchObject({ state: 'ready' });
    expect(skill({ words: 0, learned: 0 })).toMatchObject({ state: 'ready' }); // no cards: nothing to compare with
    expect(skill(null)).toMatchObject({ state: 'ready' });
  });

  it('the course he works on is the next level\'s, for a card learning English too; a school grade is not a language level', () => {
    expect(coursePath('A2', 'B1')).toMatchObject({ from: 'A2', to: 'B1', step: 'B1', levels: ['A2', 'B1'] });
    expect(coursePath('B2', 'B2')).toMatchObject({ reached: true, step: 'B2' });
    expect(coursePath('9. klass', '')).toMatchObject({ from: 'A1' });
    const courseByLevel = { B1: { done: 1, total: 10, next: 'x' }, 'English B1': { done: 2, total: 20, next: 'y' } };
    expect(levelProgress({ level: 'A2', target: 'B1', courseByLevel, subject: 'Inglise keel' }).course.total).toBe(20);
    expect(levelProgress({ level: 'A2', target: 'B1', courseByLevel, subject: 'Eesti keel' }).course.total).toBe(10);
  });
});
