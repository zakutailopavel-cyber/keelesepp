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
});

test('drops invented subtitle credits and English noise in an Estonian line (Monika 2026-10-11)', () => {
  const { isEnglishNoise } = require('./lib');
  assert.equal(cleanText('Редактор субтитров А.Семкин Корректор А.Егорова'), '');
  assert.equal(isEnglishNoise("I'm going to talk to you.", 'et'), true);
  assert.equal(isEnglishNoise('I just love it.', 'et'), true);
  assert.equal(isEnglishNoise('Ma lähen poodi.', 'et'), false);
  assert.equal(isEnglishNoise('Okei, tere.', 'et'), false);
  assert.equal(isEnglishNoise("I'm going to talk to you.", 'en'), false);
});

test('learner sentences leave out echoes and self-corrected attempts; corrections get a kind', () => {
  const { learnerSentences, judgeCorrection } = require('./analysis');
  const t = [
    { speaker: 'teacher', startMs: 0, endMs: 2000, text: 'Kui sul on halb tervis.', lang: 'et' },
    { speaker: 'student', startMs: 3000, endMs: 5000, text: 'Kui sul on halb tervis.', lang: 'et' },
    { speaker: 'student', startMs: 40000, endMs: 42000, text: 'Esimene ma valin pood.', lang: 'et' },
    { speaker: 'student', startMs: 46000, endMs: 48000, text: 'Esimeseks ma valin poe.', lang: 'et' },
    { speaker: 'student', startMs: 90000, endMs: 92000, text: 'Ma lähen raamatukogu.', lang: 'et' },
    { speaker: 'student', startMs: 95000, endMs: 97000, text: 'Ma lähen poodi.', lang: 'et' },
  ];
  assert.deepEqual(learnerSentences(t).map((s) => s.text), ['Esimeseks ma valin poe.', 'Ma lähen raamatukogu.', 'Ma lähen poodi.']);
  assert.equal(judgeCorrection('Ma lähen raamatukogu.', 'Ma lähen raamatukokku.').kind, 'vorm');
  assert.equal(judgeCorrection('Õhtuti ma teen süüa.', 'Õhtuti teen ma süüa.').kind, 'sõnajärg');
  assert.equal(judgeCorrection('Me peame sööma ja.', 'Me peame sööma.').kind, 'liigne sõna');
  assert.equal(judgeCorrection('Esimeseks ma valin pood.', 'Esiteks valin ma poe.').kind, 'sõnajärg, vorm');
  assert.equal(judgeCorrection('Ma lähin raamatu.', 'Ma lähen raamatukokku.').kind, 'vorm');
  assert.equal(judgeCorrection('Viimasel korral see oli.', 'Hiljuti juhtus midagi muud.'), null);
  assert.equal(judgeCorrection('Ma lähen poodi.', 'Ma lähen poodi!'), null);
});

test('a passing analysis failure is tried again, at most three times', () => {
  const { needsAnalysis, ANALYSIS_VERSION } = require('./analysis');
  const rec = (analysis) => ({ status: 'done', transcript: [{ text: 'Tere' }], analysis });
  assert.equal(needsAnalysis(rec(undefined)), true);
  assert.equal(needsAnalysis(rec({ version: ANALYSIS_VERSION, errors: [] })), false);
  assert.equal(needsAnalysis(rec({ version: ANALYSIS_VERSION, error: 'Ollama 500' })), true);
  assert.equal(needsAnalysis(rec({ version: ANALYSIS_VERSION, error: 'Ollama 500', attempts: 3 })), false);
  assert.equal(needsAnalysis(rec({ version: ANALYSIS_VERSION, error: 'Unexpected token' })), false);
});

test('the teacher\'s recasts become errors; the summary starts with counted topics', () => {
  const { teacherRecasts, errorTopics, withFocus } = require('./analysis');
  const t = [
    { speaker: 'student', startMs: 0, endMs: 2000, text: 'Okei, järgmisel ma valin.', lang: 'et' },
    { speaker: 'teacher', startMs: 9000, endMs: 10000, text: 'Järgmiseks.', lang: 'et' },
    { speaker: 'student', startMs: 60000, endMs: 62000, text: 'Õhtuti ma tavaliselt teen süüa kodus.', lang: 'et' },
    { speaker: 'teacher', startMs: 64000, endMs: 66000, text: 'Õhtuti teen ma tavaliselt süüa.', lang: 'et' },
    { speaker: 'student', startMs: 90000, endMs: 92000, text: 'Kuidas on vene keeles eesmärk?', lang: 'et' },
    { speaker: 'teacher', startMs: 95000, endMs: 96000, text: 'Mis on sinu eesmärk?', lang: 'et' },
  ];
  const recasts = teacherRecasts(t);
  assert.deepEqual(recasts.map((e) => e.corrected), ['Okei, järgmiseks ma valin.', 'Õhtuti teen ma tavaliselt süüa.']);
  assert.ok(recasts.every((e) => e.source === 'teacher'));
  const topics = errorTopics([...recasts, { said: 'Ma lähen raamatukogu.', corrected: 'Ma lähen raamatukokku.', kind: 'vorm' }]);
  assert.equal(topics[0].key, 'cases');
  assert.equal(topics[0].count, 2);
  const summary = withFocus({ kokkuvote: 'x', meeldis: [], raske: ['muu'], jargmiseks: [] }, topics);
  assert.match(summary.raske[0], /Падеж после глагола.*2 раз/);
  assert.equal(summary.raske.at(-1), 'muu');
});
