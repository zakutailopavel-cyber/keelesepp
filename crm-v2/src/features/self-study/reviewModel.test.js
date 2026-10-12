import { describe, expect, it } from 'vitest';
import { buildReview, checkTask, heldLessons, ownErrors } from './reviewModel.js';

const catalog = { byId: new Map([['b1-003', { id: 'b1-003', title: 'Raha', level: 'B1' }], ['b1-004', { id: 'b1-004', title: 'Pank', level: 'B1' }]]) };
const cards = [['raha', 'деньги'], ['pank', 'банк'], ['arve', 'счёт'], ['hind', 'цена'], ['ost', 'покупка'], ['kaart', 'карта']].map(([front, back]) => ({ front, back }));
const dictionary = { raha: ['raha', 'raha', 'raha'], pank: ['pank', 'panga', 'panka'], arve: ['arve', 'arve', 'arvet'] };
const forms = (word) => dictionary[word] || [];
const errors = [{ said: 'Mina läksin pank', corrected: 'Ma läksin panka' }, { said: 'Ma ostan leiba eile', corrected: 'Ma ostsin eile leiba' }];

describe('Kordamine', () => {
  it('opens only lessons held with the teacher, newest first, each once', () => {
    const held = heldLessons([
      { topicLessonId: 'b1-003', date: '2026-10-01' }, { topicLessonId: 'b1-004', date: '2026-10-08' },
      { topicLessonId: 'b1-003', date: '2026-09-20' }, { topicLessonId: '', date: '2026-10-10' }, { topicLessonId: 'x', date: '2026-10-11' },
    ], catalog);
    expect(held.map((lesson) => [lesson.id, lesson.heldAt])).toEqual([['b1-004', '2026-10-08'], ['b1-003', '2026-10-01']]);
  });

  it('reads the own corrected sentences from the word cards', () => {
    expect(ownErrors([{ word: 'Ma läksin panka', translation: 'Sinu lause: Mina läksin pank' }, { word: 'raha', translation: 'деньги' }])).toEqual([{ said: 'Mina läksin pank', corrected: 'Ma läksin panka' }]);
  });

  it('builds a short mixed drill, the same for the same seed', () => {
    const tasks = buildReview({ cards, forms, errors, seed: 7 });
    expect(tasks.length).toBeGreaterThanOrEqual(8);
    expect(tasks.length).toBeLessThanOrEqual(10);
    expect(new Set(tasks.map((task) => task.kind))).toEqual(new Set(['meaning', 'recall', 'forms', 'fix', 'order']));
    for (let i = 1; i < 4; i += 1) expect(tasks[i].kind).not.toBe(tasks[i - 1].kind);
    expect(buildReview({ cards, forms, errors, seed: 7 })).toEqual(tasks);
    const meaning = tasks.find((task) => task.kind === 'meaning');
    expect(meaning.options).toContain(meaning.answer);
  });

  it('checks every kind of answer', () => {
    expect(checkTask({ kind: 'forms', answer: ['panga', 'panka'] }, ['panga', 'panka'])).toBe('right');
    expect(checkTask({ kind: 'forms', answer: ['panga', 'panka'] }, ['raha', 'raha'])).toBe('wrong');
    expect(checkTask({ kind: 'recall', answer: 'raha' }, ' Raha ')).toBe('right');
    expect(checkTask({ kind: 'fix', answer: 'Ma läksin panka' }, 'Mina läksin pank')).toBe('wrong');
    expect(checkTask({ kind: 'order', answer: 'Ma ostsin eile leiba.' }, 'Ma ostsin eile leiba')).toBe('right');
  });
});
