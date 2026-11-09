// Pure parts of the word-audio generator (build-word-audio.mjs): what to say, under which key, what is still missing,
// how a TTS answer is retried, how the silence is cut, and the manifest the app reads. No network, no files.
import { normalizeAudioText, wordAudioKey, WORD_AUDIO_SPEAKER } from '../../src/features/vocabulary/wordAudioKey.js';

export const STORAGE_PREFIX = 'audio/words/';
export const AUDIO_EXT = 'm4a';
export const AUDIO_CONTENT_TYPE = 'audio/mp4';
export const CACHE_CONTROL = 'public, max-age=31536000, immutable';
export const MAX_TEXT = 400; // a longer text is not a word or a sentence of a card

// lessonWords/<course>.json → [{ text, source }] (the word, then its example sentence)
export function lessonWordTexts(courses = {}) {
  const out = [];
  Object.entries(courses).forEach(([course, lessons]) => {
    Object.entries(lessons || {}).forEach(([lessonId, words]) => {
      (Array.isArray(words) ? words : []).forEach((word) => {
        if (word?.et) out.push({ text: word.et, source: `${course}:${lessonId}:word` });
        if (word?.ex) out.push({ text: word.ex, source: `${course}:${lessonId}:example` });
      });
    });
  });
  return out;
}

// the sentences a „Kuula ja pane kokku” item can play: build items short enough to become listening (engine/lesson.js)
export function listenTexts(items = [], { fullSentence, maxTiles }) {
  return items
    .filter((item) => item?.type === 'build' && (item.tiles || []).length > 0 && (item.tiles || []).length <= maxTiles)
    .map((item) => ({ text: fullSentence(item), source: `${item.level || ''}:${item.lessonId || ''}:listen` }));
}

// one entry per key, first source kept; empty and over-long texts dropped
export function uniqueTexts(entries = [], speaker = WORD_AUDIO_SPEAKER) {
  const byKey = new Map();
  let skipped = 0;
  entries.forEach(({ text, source }) => {
    const clean = normalizeAudioText(text);
    if (!clean || clean.length > MAX_TEXT || !/\p{L}/u.test(clean)) { skipped += 1; return; }
    const key = wordAudioKey(clean, speaker);
    if (!byKey.has(key)) byKey.set(key, { key, text: clean, source });
  });
  return { items: [...byKey.values()], skipped };
}

/**
 * What still has to be done. local / remote: Sets of keys already present as a finished file on this machine / in
 * Storage. limit caps the number of new syntheses (0 = no cap).
 *   synth  — neither here nor in Storage
 *   upload — made here, not in Storage yet
 *   done   — already in Storage
 */
export function planWork(items = [], { local = new Set(), remote = new Set(), limit = 0 } = {}) {
  const synth = [];
  const upload = [];
  const done = [];
  items.forEach((item) => {
    if (remote.has(item.key)) done.push(item);
    else if (local.has(item.key)) upload.push(item);
    else synth.push(item);
  });
  return { synth: limit > 0 ? synth.slice(0, limit) : synth, upload, done, waiting: limit > 0 ? Math.max(0, synth.length - limit) : 0 };
}

export const storagePath = (key) => `${STORAGE_PREFIX}${key}.${AUDIO_EXT}`;
export const keyOfPath = (path) => {
  const match = String(path || '').match(new RegExp(`^${STORAGE_PREFIX}([0-9a-f]+)\\.${AUDIO_EXT}$`));
  return match ? match[1] : '';
};

// retry only what may pass later: rate limit, server errors, network errors (status 0)
export const retryable = (status) => status === 0 || status === 408 || status === 429 || status >= 500;

// wait before attempt n (1 = first retry): Retry-After if the server gave one, else 2^n s (max 60 s) + up to 25 % jitter
export function backoffMs(attempt, { retryAfter = '', random = Math.random } = {}) {
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds > 0) return Math.min(120, seconds) * 1000;
  const base = Math.min(60000, 1000 * 2 ** attempt);
  return Math.round(base * (1 + 0.25 * random()));
}

// ffmpeg silencedetect output → where the speech starts and ends (seconds), with a little air kept around it
export function speechBounds(stderr = '', { padBefore = 0.06, padAfter = 0.12 } = {}) {
  const durationMatch = String(stderr).match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const duration = durationMatch ? Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3]) : 0;
  const silences = [];
  String(stderr).split('\n').forEach((line) => {
    const start = line.match(/silence_start:\s*(-?[\d.]+)/);
    const end = line.match(/silence_end:\s*([\d.]+)/);
    if (start) silences.push({ start: Math.max(0, Number(start[1])), end: null });
    if (end && silences.length) silences[silences.length - 1].end = Number(end[1]);
  });
  let from = 0;
  let to = duration;
  const first = silences[0];
  if (first && first.start <= 0.01 && first.end != null) from = first.end;
  const last = silences[silences.length - 1];
  const tail = last && (last.end == null || (duration && last.end >= duration - 0.01)) ? last : null;
  if (tail && !(tail === first && first.start <= 0.01)) to = tail.start;
  if (!(to > from)) return { duration, start: 0, end: duration };
  return { duration, start: Math.max(0, from - padBefore), end: duration ? Math.min(duration, to + padAfter) : to + padAfter };
}

// the loudnorm first pass prints a JSON block at the end of stderr
export function loudnormMeasure(stderr = '') {
  const text = String(stderr);
  const at = text.lastIndexOf('{');
  if (at < 0) return null;
  try {
    const data = JSON.parse(text.slice(at, text.indexOf('}', at) + 1));
    const value = (name) => Number(data[name]);
    const out = { i: value('input_i'), tp: value('input_tp'), lra: value('input_lra'), thresh: value('input_thresh'), offset: value('target_offset') };
    return Object.values(out).every(Number.isFinite) ? out : null;
  } catch {
    return null;
  }
}

// /word-audio.json: keys only (the app hashes the text itself, wordAudioKey.js) — small and holds no text
export function buildManifest(keys = [], { bucket, speaker = WORD_AUDIO_SPEAKER, generatedAt = '' } = {}) {
  return {
    v: 1,
    voice: 'Neurokõne (TartuNLP)',
    speaker,
    ext: AUDIO_EXT,
    base: `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(STORAGE_PREFIX)}`,
    generatedAt,
    keys: [...new Set(keys)].sort(),
  };
}
