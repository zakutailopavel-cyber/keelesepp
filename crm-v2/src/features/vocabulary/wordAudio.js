/* global SpeechSynthesisUtterance */
// Stored Estonian audio for course words, example sentences and listening sentences (docs/VOCABULARY_SRS.md „Sõnade
// heli”). The files were made once with TartuNLP Neurokõne (voice „mari”) by crm-v2/scripts/word-audio/ and live in
// Firebase Storage under audio/words/<key>.m4a; /word-audio.json lists the keys (loaded lazily, once). The app never
// calls the TTS service.
//
// Order when something is played: 1) the stored file, 2) the lesson's own audio file (card.audio), 3) the browser's
// Estonian speechSynthesis voice. A source that fails (network, rules not deployed, codec) passes on to the next one.
import { useEffect, useState } from 'react';
import { estonianVoice } from './cardFace.js';
import { wordAudioKey } from './wordAudioKey.js';

export const WORD_AUDIO_MANIFEST_URL = '/word-audio.json';
export const WORD_AUDIO_CREDIT = 'Hääl: Neurokõne (TartuNLP)';
const CACHE_MAX = 12;

let manifest = null; // { speaker, ext, base, keys: Set }
let loading = null;
const cache = new Map(); // url → audio element (preloaded / played), newest last

function fromJson(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.keys) || !data.base) return { speaker: '', ext: '', base: '', keys: new Set() };
  return { speaker: String(data.speaker || ''), ext: String(data.ext || 'm4a'), base: String(data.base), keys: new Set(data.keys.map(String)) };
}

// tests and the generator's own check
export function setWordAudioManifest(data) {
  manifest = data ? fromJson(data) : null;
  loading = manifest ? Promise.resolve(manifest) : null;
  cache.clear();
}

export function loadWordAudio({ fetcher = globalThis.fetch, url = WORD_AUDIO_MANIFEST_URL } = {}) {
  if (manifest) return Promise.resolve(manifest);
  if (!loading) {
    loading = Promise.resolve()
      .then(() => fetcher(url, { cache: 'force-cache' }))
      .then((response) => (response?.ok ? response.json() : null))
      .catch(() => null)
      .then((data) => { manifest = fromJson(data); return manifest; });
  }
  return loading;
}

export const wordAudioReady = () => Boolean(manifest?.keys.size);

// the stored file's address, or '' (also while the list is not loaded yet)
export function wordAudioUrl(text) {
  if (!manifest?.keys.size) return '';
  const key = wordAudioKey(text, manifest.speaker || undefined);
  return key && manifest.keys.has(key) ? `${manifest.base}${key}.${manifest.ext}?alt=media` : '';
}

export const hasWordAudio = (text) => Boolean(wordAudioUrl(text));

// re-renders once the list has arrived; true when there is at least one stored file
export function useWordAudio() {
  const [ready, setReady] = useState(wordAudioReady);
  useEffect(() => {
    let alive = true;
    loadWordAudio().then(() => { if (alive) setReady(wordAudioReady()); });
    return () => { alive = false; };
  }, []);
  return ready;
}

function element(url, AudioCtor) {
  if (cache.has(url)) {
    const found = cache.get(url);
    cache.delete(url);
    cache.set(url, found);
    return found;
  }
  const audio = new AudioCtor(url);
  audio.preload = 'auto';
  cache.set(url, audio);
  while (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
  return audio;
}

// fetch the next card's / item's sound ahead, so the tap plays at once
export function preloadWordAudio(texts = [], { AudioCtor = globalThis.Audio } = {}) {
  if (typeof AudioCtor !== 'function') return;
  (Array.isArray(texts) ? texts : [texts]).forEach((text) => {
    const url = wordAudioUrl(text);
    if (!url || cache.has(url)) return;
    try { element(url, AudioCtor).load?.(); } catch { /* preloading is only a nicety */ }
  });
}

function speak(text, { slow, synth, voice }) {
  const chosen = voice || estonianVoice(synth);
  if (!chosen || !synth || typeof globalThis.SpeechSynthesisUtterance !== 'function') return false;
  try {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text || ''));
    utterance.lang = chosen.lang || 'et-EE';
    utterance.voice = chosen;
    utterance.rate = slow ? 0.65 : 0.9;
    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

// what would be used first: 'file' | 'lesson' | 'voice' | '' (nothing — hide the button)
export function audioSource(text, { audio = '', synth = globalThis.speechSynthesis, voice = null } = {}) {
  if (wordAudioUrl(text)) return 'file';
  if (audio) return 'lesson';
  return voice || estonianVoice(synth) ? 'voice' : '';
}

/**
 * Play an Estonian text. Must be called inside the tap (iOS), so it never waits for the list: before it has loaded the
 * lesson audio / browser voice is used. Returns the source tried first ('file' | 'lesson' | 'voice' | '').
 */
export function playEstonian(text, { audio = '', slow = false, synth = globalThis.speechSynthesis, voice = null, AudioCtor = globalThis.Audio } = {}) {
  const files = [wordAudioUrl(text), audio].filter(Boolean);
  const first = audioSource(text, { audio, synth, voice });
  const tryFile = (index) => {
    if (index >= files.length || typeof AudioCtor !== 'function') { speak(text, { slow, synth, voice }); return; }
    let failed = false;
    const fail = () => {
      if (failed) return;
      failed = true;
      cache.delete(files[index]);
      tryFile(index + 1);
    };
    try {
      const player = element(files[index], AudioCtor);
      player.onerror = fail;
      try { player.pause?.(); player.currentTime = 0; } catch { /* not loaded yet */ }
      player.playbackRate = slow ? 0.75 : 1;
      const started = player.play?.();
      if (started?.catch) started.catch((error) => { if (error?.name !== 'AbortError') fail(); });
    } catch {
      fail();
    }
  };
  tryFile(0);
  return first;
}
