import { describe, expect, it } from 'vitest';
import {
  backoffMs, buildManifest, keyOfPath, lessonWordTexts, listenTexts, loudnormMeasure, planWork, retryable, speechBounds,
  storagePath, uniqueTexts,
} from './lib.mjs';
import { wordAudioKey } from '../../src/features/vocabulary/wordAudioKey.js';

describe('collecting texts', () => {
  it('takes every word and its example sentence from the lesson word files', () => {
    const entries = lessonWordTexts({ a2: { 'a2-001': [{ et: 'nimi', ex: 'Minu nimi on Anna.' }, { et: 'amet' }] }, b1b2: { x: null } });
    expect(entries).toEqual([
      { text: 'nimi', source: 'a2:a2-001:word' },
      { text: 'Minu nimi on Anna.', source: 'a2:a2-001:example' },
      { text: 'amet', source: 'a2:a2-001:word' },
    ]);
  });

  it('takes listening sentences only from build items short enough to be heard', () => {
    const items = [
      { type: 'build', tiles: ['Ma', 'loen'], answers: ['Ma loen.'], level: 'A2', lessonId: 'a2-001' },
      { type: 'build', tiles: Array(11).fill('x'), answers: ['long'] },
      { type: 'form', tiles: ['a'] },
    ];
    expect(listenTexts(items, { fullSentence: (item) => item.answers[0], maxTiles: 10 })).toEqual([{ text: 'Ma loen.', source: 'A2:a2-001:listen' }]);
  });

  it('one entry per normalised text; empty, letterless and over-long texts are dropped', () => {
    const { items, skipped } = uniqueTexts([
      { text: 'Minu  nimi on Anna. ', source: 'a' },
      { text: 'Minu nimi on Anna.', source: 'b' },
      { text: '  ', source: 'c' },
      { text: '…', source: 'd' },
      { text: 'x'.repeat(401), source: 'e' },
    ]);
    expect(items).toEqual([{ key: wordAudioKey('Minu nimi on Anna.'), text: 'Minu nimi on Anna.', source: 'a' }]);
    expect(skipped).toBe(3);
  });
});

describe('resume', () => {
  const items = ['a', 'b', 'c', 'd', 'e'].map((key) => ({ key, text: key }));

  it('never synthesizes what is cached here or already in Storage; uploads what is only here', () => {
    const plan = planWork(items, { local: new Set(['a', 'b']), remote: new Set(['b', 'c']) });
    expect(plan.done.map((i) => i.key)).toEqual(['b', 'c']);
    expect(plan.upload.map((i) => i.key)).toEqual(['a']);
    expect(plan.synth.map((i) => i.key)).toEqual(['d', 'e']);
    expect(plan.waiting).toBe(0);
  });

  it('--limit caps the new syntheses and says how many wait', () => {
    const plan = planWork(items, { limit: 2 });
    expect(plan.synth.map((i) => i.key)).toEqual(['a', 'b']);
    expect(plan.waiting).toBe(3);
  });

  it('Storage paths and keys round-trip', () => {
    expect(storagePath('0123456789ab')).toBe('audio/words/0123456789ab.m4a');
    expect(keyOfPath('audio/words/0123456789ab.m4a')).toBe('0123456789ab');
    expect(keyOfPath('audio/words/readme.txt')).toBe('');
    expect(keyOfPath('lesson-scenes/0123456789ab.m4a')).toBe('');
  });
});

describe('politeness', () => {
  it('retries rate limits, timeouts, server and network errors only', () => {
    expect([0, 408, 429, 500, 503].every(retryable)).toBe(true);
    expect([400, 401, 404, 413].some(retryable)).toBe(false);
  });

  it('backs off exponentially with jitter, honours Retry-After', () => {
    expect(backoffMs(1, { random: () => 0 })).toBe(2000);
    expect(backoffMs(3, { random: () => 1 })).toBe(10000);
    expect(backoffMs(10, { random: () => 0 })).toBe(60000);
    expect(backoffMs(1, { retryAfter: '7' })).toBe(7000);
  });
});

describe('audio processing', () => {
  it('finds the speech between leading and trailing silence, with a little air', () => {
    const stderr = [
      '  Duration: 00:00:02.19, start: 0.000000, bitrate: 705 kb/s',
      '[silencedetect] silence_start: 0',
      '[silencedetect] silence_end: 0.499229 | silence_duration: 0.499229',
      '[silencedetect] silence_start: 1.69483',
      '[silencedetect] silence_end: 2.19 | silence_duration: 0.495',
    ].join('\n');
    const b = speechBounds(stderr);
    expect(b.duration).toBeCloseTo(2.19);
    expect(b.start).toBeCloseTo(0.439, 3);
    expect(b.end).toBeCloseTo(1.815, 3);
  });

  it('keeps everything when there is no silence, or only silence', () => {
    expect(speechBounds('Duration: 00:00:01.00,')).toMatchObject({ start: 0, end: 1 });
    expect(speechBounds('Duration: 00:00:01.00,\nsilence_start: 0\nsilence_end: 1 |')).toMatchObject({ start: 0, end: 1 });
  });

  it('reads the loudnorm measurement', () => {
    const stderr = 'blah\n[Parsed_loudnorm_1 @ 0x1]\n{\n\t"input_i" : "-24.10",\n\t"input_tp" : "-6.00",\n\t"input_lra" : "3.10",\n\t"input_thresh" : "-34.5",\n\t"output_i" : "-18.0",\n\t"target_offset" : "0.20"\n}\n';
    expect(loudnormMeasure(stderr)).toEqual({ i: -24.1, tp: -6, lra: 3.1, thresh: -34.5, offset: 0.2 });
    expect(loudnormMeasure('no json')).toBeNull();
  });
});

describe('manifest', () => {
  it('lists sorted unique keys and the public Storage base', () => {
    const m = buildManifest(['b', 'a', 'b'], { bucket: 'keelesepp-5136b.firebasestorage.app', generatedAt: '2026-11-09' });
    expect(m.keys).toEqual(['a', 'b']);
    expect(m.base).toBe('https://firebasestorage.googleapis.com/v0/b/keelesepp-5136b.firebasestorage.app/o/audio%2Fwords%2F');
    expect(m).toMatchObject({ v: 1, speaker: 'mari', ext: 'm4a' });
  });
});
