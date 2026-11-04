import { describe, expect, it } from 'vitest';
import { errorKey } from '../lesson-recording/errorReview.js';
import { groupRecordings } from '../lesson-recording/lessonTimeline.js';
import { lessonHints, pickWarmupItems, usableError, warmupWorksheet, wordEdits } from './warmup.js';

const err = (said, corrected, extra = {}) => ({ said, corrected, kind: 'vorm', startMs: 1000, ...extra });
const lesson = (id, startedAt, errors, extra = {}) => ({ id, invitationId: `inv-${id}`, startedAt, analysis: { errors, ...(extra.analysis || {}) }, ...(extra.rest || {}) });

describe('usableError', () => {
  it('keeps a short learner sentence with a small change', () => {
    expect(usableError(err('Ma lähen koolis homme.', 'Ma lähen kooli homme.'))).toMatchObject({ edits: 1 });
  });
  it('drops teacher lines, unsure lines and empty corrections', () => {
    expect(usableError(err('Ma lähen koolis homme.', 'Ma lähen kooli homme.', { source: 'teacher' }))).toBeNull();
    expect(usableError(err('Ma lähen koolis homme.', 'Ma lähen kooli homme.', { unsure: true }))).toBeNull();
    expect(usableError(err('Ma lähen koolis.', ''))).toBeNull();
  });
  it('drops noisy lines: too long, too short, big rewrites, stutters, punctuation only', () => {
    expect(usableError(err('Eile ma olin kodus ja siis ma läksin poodi ja ostsin piima ja leiba ja juustu', 'Eile olin ma kodus ja siis läksin ma poodi ja ostsin piima ja leiba ja juustu'))).toBeNull();
    expect(usableError(err('Ma lähen.', 'Ma läksin.'))).toBeNull();
    expect(usableError(err('kass koer maja auto', 'täna on ilus ilm'))).toBeNull();
    expect(usableError(err('ma ma lähen koolis', 'ma lähen kooli'))).toBeNull();
    expect(usableError(err('Ma lähen kooli homme', 'Ma lähen kooli homme.'))).toBeNull();
  });
  it('counts word edits', () => {
    expect(wordEdits(['a', 'b', 'c'], ['a', 'x', 'c'])).toBe(1);
    expect(wordEdits(['a', 'b'], ['b', 'a', 'c'])).toBe(2);
  });
});

describe('pickWarmupItems', () => {
  const latest = lesson('r2', '2026-11-03T10:00:00Z', [
    err('Ma lähen koolis homme.', 'Ma lähen kooli homme.', { startMs: 1000 }),
    err('Ma lähen koolis homme!', 'Ma lähen kooli homme.', { startMs: 2000 }), // same sentence again → dedupe
    err('Täna ma olen väsinud.', 'Täna olen ma väsinud.', { kind: 'sõnajärg', startMs: 3000 }),
    err('Ta elab Tallinnas ammu.', 'Ta on elanud Tallinnas ammu.', { source: 'teacher', startMs: 4000 }),
    err('Mina tahan kohvi joob.', 'Mina tahan kohvi juua.', { startMs: 5000 }),
    err('Ma ei tea see.', 'Ma ei tea seda.', { startMs: 6000 }),
  ], { analysis: { focus: [{ key: 'order', topic: 'x', count: 5 }, { key: 'cases', topic: 'y', count: 2 }] } });
  const older = lesson('r1', '2026-10-27T10:00:00Z', [err('Eile ma läksin poodi.', 'Eile läksin ma poodi.', { kind: 'sõnajärg' })]);

  it('takes the latest analysed lesson, top focus topics first, without teacher lines and duplicates', () => {
    const { items, latest: picked } = pickWarmupItems([older, latest]);
    expect(picked.id).toBe('r2');
    expect(items[0].said).toBe('Täna ma olen väsinud.');
    expect(items.map((i) => i.said)).not.toContain('Ta elab Tallinnas ammu.');
    expect(items.filter((i) => i.corrected === 'Ma lähen kooli homme.')).toHaveLength(1);
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items.length).toBeLessThanOrEqual(5);
    expect(items.every((i) => i.lessonId === 'r2')).toBe(true);
  });

  it('skips the lesson running now', () => {
    const { latest: picked } = pickWarmupItems([older, latest], { currentInvitationId: 'inv-r2' });
    expect(picked.id).toBe('r1');
  });

  it('leaves out errors marked „Pole viga”, also the same correction from another lesson', () => {
    const dismissed = latest.analysis.errors[4];
    const review = { [errorKey(dismissed)]: { said: dismissed.said, corrected: dismissed.corrected, at: '2026-11-03T12:00:00Z' } };
    const grouped = groupRecordings([{ ...latest, errorReview: review }]);
    const { items } = pickWarmupItems(grouped);
    expect(items.map((i) => i.said)).not.toContain('Mina tahan kohvi joob.');
    // the same said → corrected pair dismissed in an older lesson is not offered again
    const elsewhere = lesson('r0', '2026-10-20T10:00:00Z', [err('Ma ei tea see.', 'Ma ei tea seda.', { startMs: 9 })], { rest: { errorReview: { [errorKey(err('Ma ei tea see.', 'Ma ei tea seda.', { startMs: 9 }))]: { said: 'Ma ei tea see.', corrected: 'Ma ei tea seda.', at: 'x' } } } });
    expect(pickWarmupItems([latest, elsewhere]).items.map((i) => i.said)).not.toContain('Ma ei tea see.');
    // an undone mark counts as not dismissed
    const undone = { [errorKey(dismissed)]: { ...review[errorKey(dismissed)], undoneAt: '2026-11-03T13:00:00Z' } };
    expect(pickWarmupItems(groupRecordings([{ ...latest, errorReview: undone }])).items.map((i) => i.said)).toContain('Mina tahan kohvi joob.');
  });

  it('fills from an older lesson only when the latest gives fewer than three', () => {
    const thin = lesson('r3', '2026-11-04T08:00:00Z', [err('Ma lähen koolis homme.', 'Ma lähen kooli homme.')]);
    const { items } = pickWarmupItems([thin, latest]);
    expect(items[0].lessonId).toBe('r3');
    expect(items.some((i) => i.lessonId === 'r2')).toBe(true);
    expect(items.filter((i) => i.corrected === 'Ma lähen kooli homme.')).toHaveLength(1);
  });

  it('ignores lessons without analysis', () => {
    expect(pickWarmupItems([{ id: 'x', startedAt: '2026-11-04', analysis: { error: 'failed' } }]).latest).toBeNull();
  });
});

describe('warmupWorksheet', () => {
  it('makes one „Paranda lause” task per sentence', () => {
    const doc = warmupWorksheet([{ said: 'Ma lähen koolis.', corrected: 'Ma lähen kooli.' }, { said: ' x ', corrected: '' }, { said: 'Täna ma olen.', corrected: 'Täna olen ma.' }], { date: '04.11.2026' });
    expect(doc.meta.title).toBe('Soojendus 04.11.2026');
    expect(doc.blocks).toHaveLength(2);
    expect(doc.blocks.every((b) => b.type === 'errorfix' && b.data.rows.length === 1)).toBe(true);
    expect(doc.blocks[0].data.rows[0]).toEqual({ wrong: 'Ma lähen koolis.', answer: 'Ma lähen kooli.' });
    expect(warmupWorksheet([])).toBeNull();
  });
});

describe('lessonHints', () => {
  it('lists the top topics of the last lessons with one example and the advice', () => {
    const a = lesson('r2', '2026-11-03T10:00:00Z', [err('Täna ma olen väsinud.', 'Täna olen ma väsinud.', { kind: 'sõnajärg' })], {
      analysis: { focus: [{ key: 'order', count: 3, examples: [{ said: 'Täna ma olen väsinud.', corrected: 'Täna olen ma väsinud.' }] }, { key: 'vocab', count: 1, examples: [] }], summary: { jargmiseks: ['Harjuta sõnajärge.', ''] } },
    });
    const b = lesson('r1', '2026-10-27T10:00:00Z', [err('Ma lähen koolis homme.', 'Ma lähen kooli homme.')], { analysis: { focus: [{ key: 'cases', count: 4, examples: [{ said: 'Ma lähen koolis homme.', corrected: 'Ma lähen kooli homme.', source: 'gec' }] }] } });
    const hints = lessonHints([b, a]);
    expect(hints.topics.map((t) => t.key)).toEqual(['cases', 'order', 'vocab']);
    expect(hints.topics[1].example).toEqual({ said: 'Täna ma olen väsinud.', corrected: 'Täna olen ma väsinud.' });
    expect(hints.topics[0].topic).toMatch(/Käänded/);
    expect(hints.next).toEqual(['Harjuta sõnajärge.']);
    expect(hints.lessonCount).toBe(2);
    expect(lessonHints([a], { currentInvitationId: 'inv-r2' })).toBeNull();
  });
  it('counts topics from the errors of older analyses without focus, not the teacher lines', () => {
    const old = lesson('r1', '2026-10-27T10:00:00Z', [
      err('Täna ma olen väsinud.', 'Täna olen ma väsinud.', { kind: 'sõnajärg' }),
      err('Ta tuli eile koju.', 'Ta tuli eile koju tagasi.', { kind: 'sõna puudu', source: 'teacher' }),
    ]);
    expect(lessonHints([old]).topics.map((t) => t.key)).toEqual(['order']);
  });
});
