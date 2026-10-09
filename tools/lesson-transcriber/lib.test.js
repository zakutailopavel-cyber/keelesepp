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
