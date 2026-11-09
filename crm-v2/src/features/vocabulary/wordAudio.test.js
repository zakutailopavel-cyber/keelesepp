import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeAudioText, sha1Hex, wordAudioKey } from './wordAudioKey.js';
import { audioSource, hasWordAudio, loadWordAudio, playEstonian, preloadWordAudio, setWordAudioManifest, wordAudioUrl } from './wordAudio.js';
import { buildLesson } from '../practice/engine/lesson.js';

const BASE = 'https://firebasestorage.googleapis.com/v0/b/test-bucket/o/audio%2Fwords%2F';
const manifestWith = (...texts) => ({ v: 1, speaker: 'mari', ext: 'm4a', base: BASE, keys: texts.map((text) => wordAudioKey(text)) });

// a fake <audio>: records what was played; `fails` lists URLs whose play() is refused
function fakeAudio(fails = []) {
  const played = [];
  const made = [];
  class FakeAudio {
    constructor(src) { this.src = src; this.loads = 0; made.push(this); }
    load() { this.loads += 1; }
    pause() {}
    play() {
      played.push({ src: this.src, rate: this.playbackRate });
      return fails.includes(this.src) ? Promise.reject(Object.assign(new Error('no'), { name: 'NotAllowedError' })) : Promise.resolve();
    }
  }
  return { FakeAudio, played, made };
}
const flush = () => new Promise((done) => globalThis.setTimeout(done, 0));

afterEach(() => { setWordAudioManifest(null); delete globalThis.SpeechSynthesisUtterance; });

describe('word audio key', () => {
  it('sha1Hex equals Node crypto for ASCII, Estonian letters, emoji and long input', () => {
    ['', 'abc', 'mari|Minu nimi on Anna.', 'mari|Õun, äädikas, öö, üks — šokolaad, žürii', '🙂 ja „jutumärgid”', 'x'.repeat(1000)].forEach((text) => {
      expect(sha1Hex(text)).toBe(createHash('sha1').update(text, 'utf8').digest('hex'));
    });
  });

  it('normalises the text before hashing: trim, one space, NFC; case and punctuation stay', () => {
    expect(normalizeAudioText('  Minu   nimi\n on\tAnna. ')).toBe('Minu nimi on Anna.');
    expect(normalizeAudioText('õun')).toBe('õun'); // decomposed õ → one letter
    expect(wordAudioKey(' Minu  nimi on Anna.')).toBe(wordAudioKey('Minu nimi on Anna.'));
    expect(wordAudioKey('kass')).not.toBe(wordAudioKey('Kass'));
    expect(wordAudioKey('kass')).toBe(createHash('sha1').update('mari|kass').digest('hex').slice(0, 12));
    expect(wordAudioKey('kass', 'albert')).not.toBe(wordAudioKey('kass'));
    expect(wordAudioKey('   ')).toBe('');
  });
});

describe('manifest lookup', () => {
  it('finds a stored file by its text (any spacing), nothing for other texts or before the list has loaded', () => {
    expect(wordAudioUrl('kass')).toBe('');
    setWordAudioManifest(manifestWith('kass'));
    expect(wordAudioUrl(' kass ')).toBe(`${BASE}${wordAudioKey('kass')}.m4a?alt=media`);
    expect(hasWordAudio('koer')).toBe(false);
  });

  it('loads /word-audio.json once; a missing or broken list means no stored audio', async () => {
    const fetcher = vi.fn(async () => ({ ok: true, json: async () => manifestWith('kass') }));
    await loadWordAudio({ fetcher });
    await loadWordAudio({ fetcher });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(hasWordAudio('kass')).toBe(true);
    setWordAudioManifest(null);
    await loadWordAudio({ fetcher: async () => ({ ok: true, json: async () => { throw new Error('html'); } }) });
    expect(hasWordAudio('kass')).toBe(false);
  });
});

describe('playEstonian fallback order', () => {
  const voiceSynth = () => {
    const spoken = [];
    globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    return { spoken, synth: { getVoices: () => [{ lang: 'et-EE', name: 'Anu' }], speak: (u) => spoken.push(u), cancel: vi.fn() } };
  };

  it('1) the stored file first (slowed for „Aeglaselt”)', async () => {
    setWordAudioManifest(manifestWith('kass'));
    const { FakeAudio, played } = fakeAudio();
    const { synth, spoken } = voiceSynth();
    expect(playEstonian('kass', { audio: '/audio/lesson.mp3', synth, AudioCtor: FakeAudio, slow: true })).toBe('file');
    await flush();
    expect(played).toEqual([{ src: wordAudioUrl('kass'), rate: 0.75 }]);
    expect(spoken).toEqual([]);
  });

  it('2) the lesson audio when there is no stored file, or when the stored file fails', async () => {
    setWordAudioManifest(manifestWith('kass'));
    const { FakeAudio, played } = fakeAudio([wordAudioUrl('kass')]);
    const { synth, spoken } = voiceSynth();
    playEstonian('kass', { audio: '/audio/lesson.mp3', synth, AudioCtor: FakeAudio });
    await flush();
    expect(played.map((p) => p.src)).toEqual([wordAudioUrl('kass'), '/audio/lesson.mp3']);
    expect(spoken).toEqual([]);
    expect(playEstonian('koer', { audio: '/audio/koer.mp3', synth, AudioCtor: FakeAudio })).toBe('lesson');
  });

  it('3) the browser voice when every file fails or none exists; nothing at all → no source', async () => {
    setWordAudioManifest(manifestWith('kass'));
    const { FakeAudio } = fakeAudio([wordAudioUrl('kass')]);
    const { synth, spoken } = voiceSynth();
    playEstonian('kass', { synth, AudioCtor: FakeAudio });
    await flush();
    expect(spoken).toEqual([expect.objectContaining({ text: 'kass', lang: 'et-EE', rate: 0.9 })]);
    expect(playEstonian('koer', { synth, AudioCtor: FakeAudio })).toBe('voice');
    expect(audioSource('koer', { synth: { getVoices: () => [] } })).toBe('');
    expect(audioSource('kass', { synth: { getVoices: () => [] } })).toBe('file');
  });

  it('preloads only stored files, once each', () => {
    setWordAudioManifest(manifestWith('kass'));
    const { FakeAudio, made } = fakeAudio();
    preloadWordAudio(['kass', 'koer', 'kass'], { AudioCtor: FakeAudio });
    expect(made.map((a) => [a.src, a.loads])).toEqual([[wordAudioUrl('kass'), 1]]);
  });
});

describe('listening items with stored audio', () => {
  const build = (id, sentence) => ({ id, type: 'build', level: 'B1', moduleId: 'm1', grammar: [], tiles: sentence.replace(/[.]/g, '').split(' '), orders: [sentence.replace(/[.]/g, '').split(' ')], answers: [sentence], sentence, phase: 'discover' });
  const pool = Array.from({ length: 12 }, (_, i) => build(`b${i}`, `Anna õpib õhtul number ${i}.`));

  it('canListen may be a per-item check: only sentences with a recording become „Kuula ja pane kokku”', () => {
    const recorded = new Set(['b1', 'b2', 'b3']);
    const seen = new Set();
    for (let seed = 0; seed < 20; seed += 1) {
      const lesson = buildLesson({ pool, level: 'B1', moduleId: 'm1', size: 10, seed: `s${seed}`, canListen: (item) => recorded.has(item.id) });
      lesson.items.filter((item) => item.type === 'listen').forEach((item) => seen.add(item.id));
    }
    expect(seen.size).toBeGreaterThan(0);
    expect([...seen].every((id) => recorded.has(id))).toBe(true);
    const none = buildLesson({ pool, level: 'B1', moduleId: 'm1', size: 10, seed: 's1', canListen: () => false });
    expect(none.items.some((item) => item.type === 'listen')).toBe(false);
  });
});
