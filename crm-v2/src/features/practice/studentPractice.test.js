import { describe, expect, it } from 'vitest';
import { checkItem } from './engine/items.js';
import { ownSentenceItems, ownSentencePairs } from './engine/ownSentences.js';
import { currentModule, loadStudentPractice, practiceCourseFor, sentencesAvailable } from './studentPractice.js';

const card = { id: 'w1', word: 'Ma lähen koju.', translation: 'Sinu lause: Ma lähen kodus.', dueAt: '2026-11-01T10:00:00Z' };
const stats = [{ practice: [{ said: 'Ma lähen kodus.', corrected: 'Ma lähen koju.' }, { said: 'Ta tuli eile kool.', corrected: 'Ta tuli eile kooli.' }, { said: 'sama', corrected: 'Sama' }] }];

describe('own sentences from both mistake sources', () => {
  it('merges „Sinu lause” cards and lesson pairs, one sentence once, cards first; a pair without a change is left out', () => {
    const pairs = ownSentencePairs({ words: [card, { id: 'x', word: 'koer', translation: 'собака' }], stats, now: Date.parse('2026-11-09T10:00:00Z') });
    expect(pairs.map((pair) => [pair.corrected, pair.source])).toEqual([['Ma lähen koju.', 'words'], ['Ta tuli eile kooli.', 'lesson']]);
    expect(pairs[0].wordId).toBe('w1');
  });

  it('becomes „Paranda viga” items: his sentence shown, the right one built from its words', () => {
    const [item] = ownSentenceItems(ownSentencePairs({ words: [card] }), { seed: 1 });
    expect(item).toMatchObject({ type: 'transform', fix: true, own: true, from: 'Ma lähen kodus.', input: 'tiles', wordId: 'w1' });
    expect(item.shown).toHaveLength(3);
    expect(item.shown.join(' ')).not.toBe('Ma lähen koju');
    expect(checkItem(item, { tiles: ['Ma', 'lähen', 'koju'] }).verdict).toBe('correct');
    expect(checkItem(item, { tiles: ['lähen', 'Ma', 'koju'] }).verdict).toBe('wrong');
    expect(ownSentenceItems(ownSentencePairs({ words: [card] }), { seed: 1 })).toEqual([item]);
  });

  it('at most three, a long sentence is typed', () => {
    const many = Array.from({ length: 6 }, (_, i) => ({ said: `Lause ${i} vale`, corrected: `Lause ${i} õige` }));
    expect(ownSentenceItems(many)).toHaveLength(3);
    const long = 'Üks kaks kolm neli viis kuus seitse kaheksa üheksa kümme üksteist';
    expect(ownSentenceItems([{ said: 'x y', corrected: long }])[0].input).toBe('type');
  });
});

describe('the student practice lesson', () => {
  it('takes the course he is working towards; English or no level → none', () => {
    expect(practiceCourseFor({ level: 'A2', subject: 'Eesti keel' })).toBe('b1');
    expect(practiceCourseFor({ level: 'A1' })).toBe('a2');
    expect(practiceCourseFor({ level: 'B1', targetLevel: 'B2' })).toBe('b2');
    expect(practiceCourseFor({ level: 'C1', targetLevel: 'C1' })).toBe('c1');
    expect(practiceCourseFor({ level: 'B1', subject: 'Inglise keel' })).toBe('');
    expect(practiceCourseFor({ level: '' })).toBe('');
    expect(practiceCourseFor(null)).toBe('');
  });

  it('the current module is the newest held lesson the course has, else the first module', () => {
    const items = [{ lessonId: 'b1-01', moduleId: 'm1', moduleIndex: 0 }, { lessonId: 'b1-07', moduleId: 'm2', moduleIndex: 1 }];
    expect(currentModule(items, [{ topicLessonId: 'b1-01', date: '2026-10-01' }, { topicLessonId: 'b1-07', date: '2026-11-01' }, { topicLessonId: 'zz', date: '2026-11-05' }])).toBe('m2');
    expect(currentModule(items, [{ topicLessonId: 'b1-07', date: '2026-11-01', status: 'Puudus_eta' }])).toBe('m1');
  });

  it('says whether the step has something to do without loading the course', () => {
    expect(sentencesAvailable({ student: { level: 'A2' }, words: [card] })).toEqual({ available: true, own: 1 });
    expect(sentencesAvailable({ student: { level: 'B1', subject: 'Inglise keel' } })).toEqual({ available: false, own: 0 });
  });

  it('own sentences first, then a course lesson of his module; a course that fails to load leaves the own ones', async () => {
    const MODULES = [{
      MODULE: { id: 'mod-1', title: 'Pere' },
      LESSONS: { 'b1-01': { title: 'Pere', discover: [{ id: 'w', type: 'wordorder', data: { title: 'Pane lause kokku', sentences: Array.from({ length: 12 }, (_, i) => `Minu ${['ema', 'isa', 'vend', 'õde', 'tädi', 'onu', 'vanaema', 'vanaisa', 'poeg', 'tütar', 'naine', 'mees'][i]} elab Tallinnas`).join('\n') } }] } },
    }];
    const result = await loadStudentPractice({ student: { level: 'A2' }, words: [card], loaders: { b1: async () => ({ MODULES }) }, seed: 's' });
    expect(result.own).toBe(1);
    expect(result.items[0].own).toBe(true);
    expect(result.items.length).toBeGreaterThan(1);
    expect(result.course).toBe('b1');
    const failed = await loadStudentPractice({ student: { level: 'A2' }, words: [card], loaders: { b1: async () => { throw new Error('offline'); } } });
    expect(failed.items).toHaveLength(1);
  });
});
