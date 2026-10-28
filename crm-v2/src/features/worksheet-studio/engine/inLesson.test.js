import { describe, expect, it } from 'vitest';
import { isInLesson } from './inLesson.js';
import { answerProgress, checkDocument } from './registry.js';

const speaking = (id, instruction, extra = {}) => ({ id, type: 'speaking', data: { title: 'Räägi.', instruction, questions: 'Kes?\nKus?', minSec: 60, maxSec: 120 }, ...extra });

describe('where a task is done', () => {
  it('pair tasks are done in the lesson, a monologue at home; a hand-set flag wins', () => {
    expect(isInLesson({ type: 'rolecards', data: {} })).toBe(true);
    expect(isInLesson({ type: 'speakcard', data: {} })).toBe(true);
    expect(isInLesson(speaking('a', 'Arutage paarilisega ja leppige kokku.'))).toBe(true);
    expect(isInLesson(speaking('b', 'Räägi 1–2 minutit ja salvesta.', { tag: { task: 'S03' } }))).toBe(true);
    expect(isInLesson(speaking('c', 'Räägi 1–2 minutit ja salvesta.'))).toBe(false);
    expect(isInLesson({ ...speaking('d', 'Räägi paarilisega.'), inLesson: false })).toBe(false);
    expect(isInLesson({ type: 'gaps', inLesson: true, data: {} })).toBe(true);
  });

  it('a pair task is not asked at home and does not pull the score down', () => {
    const doc = { blocks: [
      { id: 'g', type: 'gaps', data: { sentences: 'Ma [olen] kodus.', bank: '', showBank: 'no' } },
      { id: 'r', type: 'rolecards', data: { roleA: 'A', roleB: 'B' } },
      speaking('pair', 'Räägi paarilisega.'),
      speaking('home', 'Räägi ja salvesta.'),
    ] };
    const gapKey = Object.keys(checkDocument(doc, {}).results).find((k) => k.startsWith('g:'));
    const answers = { [gapKey]: 'olen', 'home:audioUrl': 'x.webm' };
    expect(checkDocument(doc, answers).speak.map((s) => s.id)).toEqual(['home']);
    expect(answerProgress(doc, answers)).toEqual({ answered: 2, total: 2 });
  });
});
