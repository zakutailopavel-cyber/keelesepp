import { vi } from 'vitest';
import { checkDocument } from '../worksheet-studio/engine/registry.js';
import { validateWorksheetDoc } from '../../services/firebase/worksheetDocs.js';
import { applyErrorReview, errorKey } from './errorReview.js';
import {
  GENERATED_MAX, GENERATED_MIN, OWN_MAX, TOTAL_MAX, buildErrorHomework, errorHomeworkDocument, generatedItems, ownRows,
  rowProblem, sendErrorHomework, topTopic, wordDistance,
} from './errorHomework.js';

const e = (said, corrected, extra = {}) => ({ startMs: extra.startMs ?? 1000, said, corrected, kind: 'vorm', source: 'gec', ...extra });
const real = [
  e('Ma lähen raamatukogu homme.', 'Ma lähen homme raamatukokku.', { startMs: 5000, kind: 'sõnajärg, vorm' }),
  e('Mul on palju sõbrad Tallinnas.', 'Mul on palju sõpru Tallinnas.', { startMs: 9000 }),
  e('Õhtuti ma teen kodutööd koos vend.', 'Õhtuti teen ma kodutööd koos vennaga.', { startMs: 12000, kind: 'sõnajärg, vorm' }),
  e('Eile ma käisin poes ja ostsin leib.', 'Eile käisin ma poes ja ostsin leiba.', { startMs: 15000, kind: 'sõnajärg, vorm' }),
  e('Ta elab Tartu ja töötab koolis.', 'Ta elab Tartus ja töötab koolis.', { startMs: 20000 }),
  e('Meie pere sõidab suvel Pärnu.', 'Meie pere sõidab suvel Pärnusse.', { startMs: 25000 }),
  e('Minu õde õpib ülikoolis arsti.', 'Minu õde õpib ülikoolis arstiks.', { startMs: 30000 }),
];

describe('errorHomework builder — filtering', () => {
  it('counts word edits', () => {
    expect(wordDistance(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(0);
    expect(wordDistance(['ma', 'lähen', 'pood'], ['ma', 'lähen', 'poodi'])).toBe(1);
    expect(wordDistance([], ['a', 'b'])).toBe(2);
    expect(wordDistance(['õhtuti', 'ma', 'teen'], ['õhtuti', 'teen', 'ma'])).toBe(1); // a word-order fix is one edit
  });

  it('leaves out ASR noise: short lines, big rewrites, unsure lines, the teacher’s own lines, no change', () => {
    expect(rowProblem(e('Jah.', 'Jah, muidugi.'))).toBe('short');
    expect(rowProblem(e('Ma lähen', 'Ma lähen poodi'))).toBe('short');
    expect(rowProblem(e('Aga see oli kuidagi niimoodi et', 'Täna hommikul sõitsin ma bussiga tööle'))).toBe('rewrite');
    expect(rowProblem(e('Ma lähen pood täna.', 'Ma lähen poodi täna.', { unsure: true }))).toBe('unsure');
    expect(rowProblem(e('Ma lähen pood täna.', 'Ma lähen poodi täna.', { unsure: [2] }))).toBe('unsure');
    expect(rowProblem(e('Ma lähen pood täna.', 'Ma lähen poodi täna.', { source: 'teacher' }))).toBe('teacher');
    expect(rowProblem(e('ma lähen poodi täna', 'Ma lähen poodi täna.'))).toBe('same');
    expect(rowProblem(e('Ma lähen pood täna.', 'Ma lähen poodi täna.'))).toBe('');
  });

  it('dedupes the same sentence said twice, and the same correction', () => {
    const rows = ownRows({ errors: [real[1], { ...real[1], startMs: 40000 }, e('Mul on palju sõbrad Tallinnas!', 'Mul on palju sõpru Tallinnas.')] });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: 'fix', wrong: 'Mul on palju sõbrad Tallinnas.', answer: 'Mul on palju sõpru Tallinnas.' });
  });

  it('never uses an error marked „Pole viga” (dismissed on the recording or passed as a dismissed pair)', () => {
    const reviewed = applyErrorReview({ errors: real }, { [errorKey(real[1])]: { said: real[1].said, corrected: real[1].corrected, at: '2026-11-04T10:00:00Z' } });
    const draft = buildErrorHomework({ analysis: reviewed, seed: 'r1' });
    expect(draft.rows.some((row) => row.wrong === real[1].said)).toBe(false);
    // the same pair at another time of the lesson is out too (the teacher said it is not an error)
    const again = buildErrorHomework({ analysis: { ...reviewed, errors: [...reviewed.errors, { ...real[1], startMs: 99000 }] }, seed: 'r1' });
    expect(again.rows.some((row) => row.wrong === real[1].said)).toBe(false);
  });

  it('keeps at most 6 own rows when the generator adds items, in lesson order, the top topic first', () => {
    const rows = ownRows({ errors: real, topicKey: 'order' });
    expect(rows).toHaveLength(OWN_MAX);
    expect(rows.map((r) => r.startMs)).toEqual([...rows.map((r) => r.startMs)].sort((a, b) => a - b));
    // the three word-order errors are all in, even though 7 errors compete for 6 places
    expect(rows.filter((r) => /Õhtuti|Eile|raamatukokku/.test(r.answer))).toHaveLength(3);
  });
});

describe('errorHomework builder — topic items', () => {
  it('takes the top topic from the Mac’s focus, else counts it', () => {
    expect(topTopic({ focus: [{ key: 'cases', count: 3 }, { key: 'order', count: 1 }] })).toBe('cases');
    expect(topTopic({ focus: [{ key: 'cases', count: 0 }, { key: 'order', count: 1 }] })).toBe('order');
    expect(topTopic({ errors: [e('Õhtuti ma teen tööd.', 'Õhtuti teen ma tööd.', { kind: 'sõnajärg' })] })).toBe('order');
  });

  it('verb-second word order: the right sentence has the verb second, wrong ones the subject', () => {
    const items = generatedItems({ topicKey: 'order', seed: 's' });
    expect(items.length).toBeGreaterThanOrEqual(GENERATED_MIN);
    expect(items.length).toBeLessThanOrEqual(GENERATED_MAX);
    for (const item of items) {
      expect(item.kind).toBe('choice');
      expect(item.wrong).toHaveLength(2);
      expect(item.wrong).not.toContain(item.answer);
      expect(item.answer).toMatch(/^(Homme|Täna|Õhtul|Hommikul|Laupäeval|Pärast tööd) (lähen|lähed|läheb|läheme|lähete|lähevad|olen|oled|on|oleme|olete) (ma|sa|ta|me|te|nad) \S+\.$/);
    }
  });

  it('koos + kaasaütlev and palju + osastav when the learner missed them', () => {
    const items = generatedItems({ topicKey: 'form', seed: 's', errors: [real[1], real[2]] });
    expect(items.length).toBeGreaterThanOrEqual(GENERATED_MIN);
    expect(items.some((i) => /koos ___/.test(i.q) && /ga$/.test(i.answer))).toBe(true);
    expect(items.some((i) => /palju ___/.test(i.q))).toBe(true);
    const vennaga = generatedItems({ topicKey: 'form', seed: 'x', errors: [real[2]] }).find((i) => i.answer === 'vennaga');
    if (vennaga) expect(vennaga.wrong).toEqual(expect.arrayContaining(['vend', 'venna']));
  });

  it('cases and verb forms come from the generator’s patterns; every item has one right and ≥ 2 wrong forms', () => {
    for (const topicKey of ['cases', 'verb', 'form']) {
      const items = generatedItems({ topicKey, seed: 'p' });
      expect(items.length).toBeGreaterThanOrEqual(GENERATED_MIN);
      expect(new Set(items.map((i) => i.answer)).size).toBe(items.length);
      for (const item of items) {
        expect(item.q).toContain('___');
        expect(item.wrong.length).toBeGreaterThanOrEqual(2);
        expect(item.wrong.map((w) => w.toLowerCase())).not.toContain(item.answer.toLowerCase());
      }
    }
  });

  it('a topic the generator cannot cover gets more of the learner’s own rows', () => {
    expect(generatedItems({ topicKey: 'vocab' })).toEqual([]);
    const draft = buildErrorHomework({ analysis: { errors: real, focus: [{ key: 'vocab', count: 4 }] }, seed: 'v' });
    expect(draft.rows.every((r) => r.kind === 'fix')).toBe(true);
    expect(draft.rows).toHaveLength(real.length);
    expect(draft.rows.length).toBeLessThanOrEqual(TOTAL_MAX);
  });

  it('is deterministic for one lesson and empty without usable sentences', () => {
    const analysis = { errors: real, focus: [{ key: 'cases', count: 3 }] };
    expect(buildErrorHomework({ analysis, seed: 'rec1' })).toEqual(buildErrorHomework({ analysis, seed: 'rec1' }));
    expect(buildErrorHomework({ analysis: { errors: [e('Jah.', 'Jah, jah.')], focus: [{ key: 'vocab', count: 1 }] } })).toBeNull();
  });
});

describe('errorHomework document — scores with the worksheet engine', () => {
  const draft = buildErrorHomework({ analysis: { errors: real, focus: [{ key: 'cases', count: 3 }] }, seed: 'rec1' });
  const doc = errorHomeworkDocument({ ...draft, studentName: 'Anna', date: '4.11', level: 'B1' });

  it('two scored blocks: „Paranda lause” (errorfix) and „Vali õige vorm” (choice)', () => {
    expect(validateWorksheetDoc(doc)).toBe(true);
    expect(doc.meta).toMatchObject({ title: 'Kodutöö tunnist 4.11', level: 'B1' });
    expect(doc.meta.subtitle).toContain('Anna');
    expect(doc.blocks.map((b) => b.type)).toEqual(['errorfix', 'choice']);
    expect(doc.blocks[0].data.rows.length).toBeGreaterThanOrEqual(4);
    expect(doc.blocks[1].data.questions.length).toBeGreaterThanOrEqual(GENERATED_MIN);
  });

  it('right answers score 100 %, wrong ones 0 %, no answers count nothing', () => {
    const [fix, choice] = doc.blocks;
    const right = {};
    fix.data.rows.forEach((row, i) => { right[`${fix.id}:${i}`] = row.answer; });
    choice.data.questions.forEach((q, i) => { right[`${choice.id}:${i}`] = q.options.split('\n').findIndex((o) => o.startsWith('*')); });
    const good = checkDocument(doc, right).score;
    expect(good.total).toBe(fix.data.rows.length + choice.data.questions.length);
    expect(good.pct).toBe(100);
    const wrong = {};
    fix.data.rows.forEach((row, i) => { wrong[`${fix.id}:${i}`] = row.wrong; });
    choice.data.questions.forEach((q, i) => { wrong[`${choice.id}:${i}`] = q.options.split('\n').findIndex((o) => !o.startsWith('*')); });
    expect(checkDocument(doc, wrong).score.correct).toBe(0);
    expect(checkDocument(doc, {}).score.total).toBe(0);
  });

  it('a row the teacher emptied is dropped; nothing left → no sheet', () => {
    const rows = draft.rows.map((r, i) => (i === 0 ? { ...r, answer: '' } : r));
    expect(errorHomeworkDocument({ ...draft, rows }).blocks[0].data.rows).toHaveLength(draft.rows.filter((r) => r.kind === 'fix').length - 1);
    expect(errorHomeworkDocument({ rows: [] })).toBeNull();
  });
});

describe('sendErrorHomework', () => {
  const recording = { id: 'inv1_1730700000000', invitationId: 'inv1', studentId: 's1', studentName: 'Anna', language: 'et', startedAt: '2026-11-04T10:00:00Z' };
  const user = { uid: 't1', displayName: 'Kati' };
  const make = () => {
    const save = vi.fn(async ({ document }) => ({ id: 'draft1', title: document.meta.title }));
    const forStudent = vi.fn(() => ({ save }));
    const createFromLesson = vi.fn(async () => ({ id: 'hw1' }));
    return { save, forStudent, createFromLesson, services: { worksheets: { forStudent }, homework: { createFromLesson } } };
  };

  it('publishes the personal sheet with a link to the recording, then one homework task pointing at it', async () => {
    const fake = make();
    const draft = buildErrorHomework({ analysis: { errors: real, focus: [{ key: 'order', count: 3 }] }, seed: recording.id });
    const result = await sendErrorHomework({ ...draft, recording, student: { name: 'Anna', level: 'A2', subject: 'Eesti keel' }, user, due: '2026-11-11', date: '4.11', services: fake.services });
    expect(fake.forStudent).toHaveBeenCalledWith({ id: 's1', name: 'Anna', subject: 'Eesti keel', level: 'A2' });
    const saveArgs = fake.save.mock.calls[0][0];
    expect(saveArgs).toMatchObject({ status: 'published', user, origin: { kind: 'lesson-errors', recordingId: recording.id, invitationId: 'inv1' } });
    expect(saveArgs.document.blocks.map((b) => b.type)).toEqual(['errorfix', 'choice']);
    expect(fake.createFromLesson).toHaveBeenCalledWith(expect.objectContaining({
      invitation: { id: 'inv1', studentId: 's1', studentName: 'Anna' }, due: '2026-11-11', source: 'lesson-errors', recordingId: recording.id,
      worksheet: { id: 'draft1', title: 'Kodutöö tunnist 4.11' }, task: 'Tee tööleht „Kodutöö tunnist 4.11”',
    }));
    expect(fake.save.mock.invocationCallOrder[0]).toBeLessThan(fake.createFromLesson.mock.invocationCallOrder[0]);
    expect(result).toMatchObject({ assignmentId: 'draft1', homeworkId: 'hw1', due: '2026-11-11' });
  });

  it('writes nothing without rows or a student', async () => {
    const fake = make();
    await expect(sendErrorHomework({ rows: [], recording, user, services: fake.services })).rejects.toThrow('Lisa vähemalt üks');
    await expect(sendErrorHomework({ rows: [{ kind: 'fix', wrong: 'a b c', answer: 'a b d' }], recording: { id: 'x' }, user, services: fake.services })).rejects.toThrow('Õpilane puudub');
    expect(fake.save).not.toHaveBeenCalled();
    expect(fake.createFromLesson).not.toHaveBeenCalled();
  });
});
