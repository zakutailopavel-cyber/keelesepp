'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseWhisperJson, mergeDialogue, isAudioExpired, isAbandoned, cleanText, workerId, heartbeat } = require('./lib');

test('parses whisper output with the segment offset and drops invented lines', () => {
  const json = { transcription: [
    { offsets: { from: 0, to: 2000 }, text: ' Tere! Kuidas läheb?' },
    { offsets: { from: 2500, to: 4000 }, text: ' [MUSIC]' },
    { offsets: { from: 5000, to: 6000 }, text: 'Субтитры сделал DimaTorzok' },
  ] };
  assert.deepEqual(parseWhisperJson(json, { speaker: 'teacher', offsetMs: 300000 }), [
    { speaker: 'teacher', startMs: 300000, endMs: 302000, text: 'Tere! Kuidas läheb?' },
  ]);
  assert.equal(cleanText('  '), '');
  assert.equal(cleanText(' . '), '');
  assert.equal(cleanText('…'), '');
});

test('merges both tracks into one dialogue in time order', () => {
  const lines = [
    { speaker: 'student', startMs: 2100, endMs: 3000, text: 'Hästi,' },
    { speaker: 'teacher', startMs: 0, endMs: 2000, text: 'Tere!' },
    { speaker: 'student', startMs: 3500, endMs: 4200, text: 'aitäh.' },
    { speaker: 'teacher', startMs: 5000, endMs: 6000, text: 'Mis kell sa ärkad?' },
    { speaker: 'teacher', startMs: 6100, endMs: 7000, text: 'Mis kell sa ärkad?' },
  ];
  assert.deepEqual(mergeDialogue(lines).map((l) => `${l.speaker}: ${l.text}`), [
    'teacher: Tere!',
    'student: Hästi, aitäh.',
    'teacher: Mis kell sa ärkad? Mis kell sa ärkad?',
  ]);
});

test('audio is deleted after 60 days; forgotten recordings are handed over after 3 hours', () => {
  const now = Date.parse('2026-12-01T00:00:00Z');
  assert.equal(isAudioExpired({ endedAt: '2026-09-29T10:00:00Z' }, now), true);
  assert.equal(isAudioExpired({ endedAt: '2026-11-20T10:00:00Z' }, now), false);
  assert.equal(isAudioExpired({ endedAt: '2026-09-29T10:00:00Z', audioDeletedAt: '2026-11-28' }, now), false);
  assert.equal(isAbandoned({ status: 'recording', updatedAt: '2026-11-30T20:00:00Z' }, now), true);
  assert.equal(isAbandoned({ status: 'recording', updatedAt: '2026-11-30T23:40:00Z' }, now), true);
  assert.equal(isAbandoned({ status: 'recording', updatedAt: '2026-11-30T23:50:00Z' }, now), false);
});

test('Estonian lessons use the TalTech Estonian model, others the general one', () => {
  const { pickModel } = require('./lib');
  const models = { et: '/m/ggml-taltech-et-verbatim-2604.bin', general: '/m/ggml-large-v3-turbo.bin' };
  assert.equal(pickModel('et', models), models.et);
  assert.equal(pickModel('en', models), models.general);
  assert.equal(pickModel('et', models, () => false), models.general, 'missing Estonian file falls back');
});

test('heartbeat doc for the lesson room', () => {
  assert.equal(workerId('Kooli-MacBook-Pro'), 'kooli-macbook-pro');
  assert.equal(workerId('Pavel’s Mac mini'), 'pavel-s-mac-mini');
  assert.equal(workerId(''), 'mac');
  const now = new Date('2026-10-04T10:00:00Z');
  assert.deepEqual(heartbeat({ host: 'Kooli-Mac', startedAt: 'x', now }),
    { host: 'Kooli-Mac', state: 'idle', recordingId: '', startedAt: 'x', lastSeenAt: '2026-10-04T10:00:00.000Z' });
  assert.equal(heartbeat({ host: 'm', state: 'transcribing', recordingId: 'r1', now }).state, 'transcribing');
});

test('a lesson a dead transcriber had taken goes back to the queue', () => {
  const { isStaleTranscribing } = require('./lib');
  const now = Date.parse('2026-10-09T16:00:00Z');
  const rec = { status: 'transcribing', transcriber: 'Mac', transcribeStartedAt: '2026-10-09T15:00:00Z' };
  assert.equal(isStaleTranscribing(rec, { host: 'Mac', startedAt: '2026-10-09T15:40:00Z', now }), true);
  assert.equal(isStaleTranscribing(rec, { host: 'Mac', startedAt: '2026-10-09T14:00:00Z', now }), false);
  assert.equal(isStaleTranscribing(rec, { host: 'Other', startedAt: '2026-10-09T15:40:00Z', now }), false);
  assert.equal(isStaleTranscribing({ ...rec, transcribeStartedAt: '2026-10-09T12:00:00Z' }, { host: 'Other', now }), true);
  assert.equal(isStaleTranscribing({ ...rec, status: 'done' }, { host: 'Mac', now }), false);
});

test('whisper loops are collapsed: a word or a group repeated three or more times stays once', () => {
  const { collapseRepeats, cleanText } = require('./lib');
  assert.equal(collapseRepeats('Ja, ja, ja, ja, ja tõesti, tõesti, tõesti. Da.'), 'Ja, tõesti, Da.');
  assert.equal(collapseRepeats("I'm going to be able to be able to be able to be able to go"), "I'm going to be able to go");
  assert.equal(collapseRepeats('ma ei tea, ma ei tea, ma ei tea, seda'), 'ma ei tea, seda');
  assert.equal(collapseRepeats('jah jah, see on hea'), 'jah jah, see on hea');
  assert.equal(cleanText('  võ võ võ võ  '), 'võ');
});

test('speech is cut into chunks and each chunk gets its own language', () => {
  const { parseVadSegments, groupChunks, parseDetectedLanguage, chooseLanguage } = require('./lib');
  const vad = parseVadSegments('Detected 3 speech segments:\nSpeech segment 0: start = 391.00, end = 502.00\nSpeech segment 1: start = 600.00, end = 768.00\nSpeech segment 2: start = 4333.00, end = 4374.00\n');
  assert.deepEqual(vad, [{ startMs: 3910, endMs: 5020 }, { startMs: 6000, endMs: 7680 }, { startMs: 43330, endMs: 43740 }]);
  assert.deepEqual(groupChunks(vad, { totalMs: 43800 }), [{ startMs: 3710, endMs: 7880 }, { startMs: 43130, endMs: 43800 }]);
  assert.equal(groupChunks([{ startMs: 0, endMs: 20000 }, { startMs: 20500, endMs: 30000 }], { padMs: 0 }).length, 2, 'a chunk stays under 25 s');
  assert.deepEqual(parseDetectedLanguage('whisper_full_with_state: auto-detected language: ru (p = 0.973476)'), { lang: 'ru', p: 0.973476 });
  assert.equal(parseDetectedLanguage('nothing'), null);
  assert.equal(chooseLanguage({ lang: 'ru', p: 0.97 }, 'et'), 'ru');
  assert.equal(chooseLanguage({ lang: 'fi', p: 0.9 }, 'et'), 'et');
  assert.equal(chooseLanguage({ lang: 'en', p: 0.3 }, 'et'), 'et');
  assert.equal(chooseLanguage(null, 'et'), 'et');
  // a short Estonian answer guessed as English stays Estonian; an English lesson keeps English
  assert.equal(chooseLanguage({ lang: 'en', p: 0.93 }, 'et'), 'et');
  assert.equal(chooseLanguage({ lang: 'en', p: 0.93 }, 'en'), 'en');
  assert.equal(chooseLanguage({ lang: 'et', p: 0.9 }, 'en'), 'en');
});

test('the learner track takes Russian only when the guess is sure', () => {
  const { chooseLanguage } = require('./lib');
  assert.equal(chooseLanguage({ lang: 'ru', p: 0.67 }, 'et'), 'ru');
  assert.equal(chooseLanguage({ lang: 'ru', p: 0.67 }, 'et', { ruMin: 0.8 }), 'et');
  assert.equal(chooseLanguage({ lang: 'ru', p: 0.95 }, 'et', { ruMin: 0.8 }), 'ru');
});

test('words whisper was unsure of are marked; language and marks survive merging', () => {
  const json = { transcription: [{ offsets: { from: 0, to: 2000 }, text: ' Ma ei saa õega.', tokens: [
    { text: '[_BEG_]', p: 1 }, { text: ' Ma', p: 0.98 }, { text: ' ei', p: 0.9 }, { text: ' sa', p: 0.31 }, { text: 'a', p: 0.9 },
    { text: ' õ', p: 0.95 }, { text: 'ega', p: 0.7 }, { text: '.', p: 1 }, { text: '[_TT_100]', p: 0.3 },
  ] }] };
  const [line] = parseWhisperJson(json, { speaker: 'student' });
  assert.equal(line.text, 'Ma ei saa õega.');
  assert.deepEqual(line.unsure, [2]);
  const merged = mergeDialogue([
    { ...line, lang: 'et' },
    { speaker: 'student', startMs: 2500, endMs: 3000, text: 'Mul on koer.', lang: 'et', unsure: [2] },
    { speaker: 'student', startMs: 3200, endMs: 4000, text: 'Как сказать?', lang: 'ru' },
  ]);
  assert.deepEqual(merged.map((l) => [l.text, l.lang, l.unsure]), [
    ['Ma ei saa õega. Mul on koer.', 'et', [2, 6]],
    ['Как сказать?', 'ru', undefined],
  ]);
});

test('the heartbeat carries the lesson parts and the progress only while analysing', () => {
  const { heartbeat } = require('./lib');
  const beat = heartbeat({ host: 'm', state: 'analyzing', recordingId: 'a', recordingIds: ['a', 'b'], detail: 'vead 8/40', now: new Date(0) });
  assert.deepEqual([beat.recordingIds, beat.detail], [['a', 'b'], 'vead 8/40']);
  assert.equal('detail' in heartbeat({ host: 'm', now: new Date(0) }), false);
});
