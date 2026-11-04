import { describe, expect, it } from 'vitest';
import { checkDocument, unmatchedAnswers } from './registry.js';
import { effectiveScore } from './storedScore.js';
import { normalizeSubmission, normalizeWorksheetAssignment } from '../../../services/firebase/homework.js';
import { buildCourseSheet } from '../../worksheet-generator/admin/course/registry.js';
import * as oldModule from '../../worksheet-generator/admin/course/archive/v1/b2/module05.js';
import * as liveModule from '../../worksheet-generator/admin/course/b2/module05.js';

// b1b2-023 „Nõustumine ja mittenõustumine”, Avasta, as assigned before the module was rewritten: the student answered
// the open tasks (023_d_tone, 023_d_trans, 023_d_tr, 023_d_say); the dialogue, the reading, the writing and the
// dictation were done orally in the lesson. Submitted with the rules before 2026-10-27, it was stored as 0/28.
const oldSheet = buildCourseSheet(oldModule, 'b1b2-023', 'discover');
const answers = {
  '023_d_tone:0': ['terav', 'sulgeb vestluse'],
  '023_d_tone:1': ['viisakas', 'avab vestluse'],
  '023_d_trans:0': 'Ma näen seda teisiti.',
  '023_d_trans:1': 'See argument ei veena mind.',
  '023_d_trans:2': 'Ma ei ole päris kindel, et see on nii.',
  '023_d_trans:3': 'Kas ma sain õigesti aru, et sa arvad, et see on vale?',
  '023_d_trans:4': 'Olen osaliselt nõus, aga mul on teine vaade.',
  '023_d_trans:5': 'Mida sa täpselt silmas pead?',
  '023_d_tr:0': 'Olen täiesti nõus.',
  '023_d_tr:1': 'Olen osaliselt nõus, aga mul on teine vaade.',
  '023_d_say:audioUrl': 'https://example.test/rec.webm',
};
const stored = { correct: 0, total: 28, pct: 0, perGoal: {} };

describe('the 0/28 sheet (b1b2-023 Avasta): answers present, the score said nothing was right', () => {
  it('the sheet she answered still has her tasks; the score counts only what she answered and what has a fixed key', () => {
    const { score } = checkDocument(oldSheet, answers);
    // only the transformation is scored: 6 rows, one of them a free example („…”) that is the teacher's
    expect(score.total).toBe(5);
    expect(score.correct).toBe(5);
    expect(score.unmatched).toBeUndefined();
  });

  it('the stored 0/28 is shown checked again on her own sheet copy, nothing is written', () => {
    const result = effectiveScore({ score: stored, worksheetDoc: oldSheet, answers, status: 'done' });
    expect(result.recomputed).toBe(true);
    expect(result.stored).toBe(stored);
    expect(result.score).toMatchObject({ correct: 5, total: 5, pct: 100, recomputed: true });
  });

  it('the same score in the teacher list and the review dialog', () => {
    const data = { studentId: 's1', lessonId: 'b1b2-023', source: 'learning_library', status: 'done', score: stored, answers, worksheetDoc: oldSheet };
    expect(normalizeWorksheetAssignment('a1', data)).toMatchObject({ score: { correct: 5, total: 5 }, storedScore: stored });
    const submission = normalizeSubmission('a1', data, 'worksheet');
    expect(submission.percentage).toBe(100);
    expect(submission.storedScore).toBe(stored);
  });

  it('a score that agrees with the sheet is left as stored', () => {
    const fresh = checkDocument(oldSheet, answers).score;
    const result = effectiveScore({ score: fresh, worksheetDoc: oldSheet, answers, status: 'done' });
    expect(result.recomputed).toBe(false);
    expect(result.score).toBe(fresh);
    expect(normalizeWorksheetAssignment('a1', { status: 'done', score: fresh, answers, worksheetDoc: oldSheet }).storedScore).toBeUndefined();
  });

  it('a stored score with real mistakes is not touched', () => {
    const some = { ...answers, '023_d_trans:0': 'Sa eksid.', '023_d_trans:1': 'See on rumal.' };
    const fresh = checkDocument(oldSheet, some).score;
    expect(fresh).toMatchObject({ correct: 3, total: 5 });
    expect(effectiveScore({ score: fresh, worksheetDoc: oldSheet, answers: some }).recomputed).toBe(false);
  });
});

describe('answers whose keys are not on the sheet (the sheet was rewritten, block ids renamed)', () => {
  const liveSheet = buildCourseSheet(liveModule, 'b1b2-023', 'discover');

  it('the rewritten lesson has none of her blocks', () => {
    const ids = new Set(liveSheet.blocks.map((block) => block.id));
    expect(['023_d_tone', '023_d_trans', '023_d_tr', '023_d_say'].some((id) => ids.has(id))).toBe(false);
  });

  it('are never counted as wrong: excluded from the total and reported as unmatched', () => {
    const { score, skipped } = checkDocument(liveSheet, answers);
    expect(score.total).toBe(0);
    expect(score.correct).toBe(0);
    expect(score.unmatched).toBe(Object.keys(answers).length);
    // every task of the rewritten sheet counts as not answered, none as wrong
    expect(skipped.every((item) => item.reason !== 'graded')).toBe(true);
    expect(Object.values(score.perGoal)).toEqual([]);
    expect(unmatchedAnswers(liveSheet, answers)).toHaveLength(Object.keys(answers).length);
  });

  it('a stored 0/28 against such a sheet shows no score instead of 0 %', () => {
    const result = effectiveScore({ score: stored, worksheetDoc: liveSheet, answers });
    expect(result).toMatchObject({ score: null, recomputed: true, unmatched: Object.keys(answers).length });
    expect(normalizeSubmission('a1', { status: 'done', score: stored, answers, worksheetDoc: liveSheet }, 'worksheet').percentage).toBeNull();
  });

  it('only filled answers count, and error markers are ignored', () => {
    expect(unmatchedAnswers({ blocks: [{ id: 'a' }] }, { 'a:0': 'x', 'b:0': '', 'b:1': 'y', 'c:error': 'z', plain: 'w' })).toEqual(['b:1']);
  });
});

describe('free tasks are never an automatic mistake', () => {
  it('a transformation row whose model answer is a free example („…”) is left to the teacher', () => {
    const doc = { blocks: [{ id: 't', type: 'transformation', data: { rows: [{ from: 'a', prompt: 'b', answer: 'Kas ma sain õigesti aru, et sa arvad…?' }, { from: 'c', prompt: 'd', answer: 'Ma näen seda teisiti.' }] } }] };
    const { score, results } = checkDocument(doc, { 't:0': 'Kas ma sain õigesti aru, et sa arvad nii?', 't:1': 'Ma näen seda teisiti.' });
    expect(score).toMatchObject({ correct: 1, total: 1 });
    expect(results['t:0']).toBeUndefined();
  });

  it('translation and many-to-many matching are not scored', () => {
    const doc = { blocks: [
      { id: 'tr', type: 'translation', data: { rows: [{ source: 'Я согласен.', hint: '' }] } },
      { id: 'mm', type: 'manymatch', data: { left: 'a\nb', right: 'x\ny' } },
    ] };
    const { score } = checkDocument(doc, { 'tr:0': 'Olen nõus.', 'mm:0': ['x'] });
    expect(score).toMatchObject({ correct: 0, total: 0 });
  });
});
