'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseWhisperJson, mergeDialogue, isAudioExpired, isAbandoned, cleanText } = require('./lib');

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
  assert.equal(isAbandoned({ status: 'recording', updatedAt: '2026-11-30T23:00:00Z' }, now), false);
});
