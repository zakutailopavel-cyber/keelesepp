'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { learnerSentences, isCorrection, parseSummary, needsAnalysis, summaryPrompt, ANALYSIS_VERSION } = require('./analysis');

test('takes the learner\'s Estonian sentences only', () => {
  const transcript = [
    { speaker: 'teacher', startMs: 0, text: 'Kus sa elad?', lang: 'et' },
    { speaker: 'student', startMs: 1000, text: 'Ma elan Tallinnas koos minu ema. Majas.', lang: 'et', unsure: [3] },
    { speaker: 'student', startMs: 2000, text: 'Как сказать брат?', lang: 'ru' },
    { speaker: 'student', startMs: 3000, text: 'Mul on kaks vend.' }, // an older line without `lang`
    { speaker: 'student', startMs: 4000, text: 'Ну это Mul on' },
  ];
  assert.deepEqual(learnerSentences(transcript), [
    { startMs: 1000, text: 'Ma elan Tallinnas koos minu ema.', unsure: true },
    { startMs: 3000, text: 'Mul on kaks vend.', unsure: false },
  ]);
});

test('a correction counts only when words changed', () => {
  assert.equal(isCorrection('Mul on kaks vend.', 'Mul on kaks venda.'), true);
  assert.equal(isCorrection('tere, minu nimi on Sofia', 'Tere! Minu nimi on Sofia.'), false);
  assert.equal(isCorrection('Mul on koer.', ''), false);
});

test('the summary is reduced to short strings; broken output gives nothing', () => {
  const s = parseSummary(JSON.stringify({ kokkuvote: ' Hea  tund. ', meeldis: ['joonistamine', 3, ''], raske: 'not a list', jargmiseks: ['a', 'b', 'c', 'd', 'e', 'f'], extra: 'x' }));
  assert.deepEqual(s, { kokkuvote: 'Hea tund.', meeldis: ['joonistamine', '3'], raske: [], jargmiseks: ['a', 'b', 'c', 'd', 'e'] });
  assert.equal(parseSummary('not json'), null);
  assert.equal(parseSummary('{}'), null);
});

test('only finished recordings with text and without this analysis version are analysed', () => {
  const done = { status: 'done', transcript: [{ speaker: 'student', text: 'Tere' }] };
  assert.equal(needsAnalysis(done), true);
  assert.equal(needsAnalysis({ ...done, analysis: { version: ANALYSIS_VERSION } }), false);
  assert.equal(needsAnalysis({ ...done, status: 'recording' }), false);
  assert.equal(needsAnalysis({ ...done, transcript: [] }), false);
  assert.match(summaryPrompt([{ speaker: 'student', startMs: 61000, text: 'Tere' }]), /\[1:01\] Õpilane: Tere/);
});

test('one lesson: the parts of one invitation on one day, joined in time order', () => {
  const { lessonParts, joinedTranscript, partsFinished } = require('./analysis');
  const all = [
    { id: 'b', invitationId: 'i', startedAt: '2026-10-09T15:38:00Z', status: 'done', transcript: [{ speaker: 'student', startMs: 500, endMs: 900, text: 'Kaks.' }] },
    { id: 'a', invitationId: 'i', startedAt: '2026-10-09T15:19:00Z', status: 'done', transcript: [{ speaker: 'teacher', startMs: 0, endMs: 400, text: 'Üks.' }] },
    { id: 'c', invitationId: 'i', startedAt: '2026-10-12T15:19:00Z', status: 'done', transcript: [] },
    { id: 'd', invitationId: 'other', startedAt: '2026-10-09T15:00:00Z', status: 'done', transcript: [] },
  ];
  const parts = lessonParts(all[0], all);
  assert.deepEqual(parts.map((p) => p.id), ['a', 'b']);
  assert.deepEqual(joinedTranscript(parts).map((l) => [l.text, l.startMs]), [['Üks.', 0], ['Kaks.', 1140500]]);
  assert.equal(partsFinished(parts), true);
  assert.equal(partsFinished([...parts, { status: 'transcribing' }]), false);
});

test('„Paku laused”: only sentences with exactly one gap, unique, at most the count', () => {
  const { parseSentences, withoutGap, sentencesPrompt } = require('./analysis');
  const raw = JSON.stringify({ laused: ['Minu [ema] on õpetaja.', 'Ilma lüngata lause.', 'Kaks [lünka] [siin].', 'minu [ema] on õpetaja.', '  Mul on kaks [venda].  '] });
  assert.deepEqual(parseSentences(raw, 5), ['Minu [ema] on õpetaja.', 'Mul on kaks [venda].']);
  assert.deepEqual(parseSentences('nonsense'), []);
  assert.equal(withoutGap('Mul on kaks [venda].'), 'Mul on kaks venda.');
  assert.match(sentencesPrompt({ topic: 'Minu pere', level: 'A2', grammar: 'osastav', count: 6 }), /Kirjuta 6 .*osastav/s);
});

test("the pet gets only simple numbers and the learner's own corrected sentences", () => {
  const { petLessonStats } = require('./analysis');
  const parts = [{ id: 'a', studentId: 's1', studentUid: 'u1', startedAt: '2026-10-09T15:00:00Z', endedAt: '2026-10-09T15:40:00Z' }];
  const transcript = [
    { speaker: 'student', text: 'Ma elan Tallinnas koos oma emaga.', lang: 'et' },
    { speaker: 'student', text: 'Как это сказать?', lang: 'ru' },
    { speaker: 'teacher', text: 'Väga hea!', lang: 'et' },
  ];
  const stats = petLessonStats({ parts, transcript, errors: [{ said: 'a b', corrected: 'a c' }, { said: 'x y', corrected: 'x z', unsure: true }] });
  assert.deepEqual(stats, { studentId: 's1', studentUid: 'u1', date: '2026-10-09T15:00:00Z', minutes: 40, studentWords: 9, estonianWords: 6, share: 67, longest: 6, practice: [{ said: 'a b', corrected: 'a c' }], lang: 'et' });
  assert.equal(petLessonStats({ parts: [{ id: 'b' }], transcript }), null);
});
