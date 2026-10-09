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
