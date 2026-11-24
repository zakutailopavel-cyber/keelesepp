/* global setInterval, clearInterval */
import { useEffect, useState } from 'react';
import { lessonRecordingsService } from '../../services/firebase/lessonRecordings.js';

// The transcriber on the school Mac starts at login (launchd) and writes a heartbeat to
// `transcriberStatus/{host}` about once a minute. A heartbeat older than this means the Mac is off, asleep or the
// program is not running: recordings still upload and wait, the text comes when the Mac is back.
export const TRANSCRIBER_FRESH_MS = 3 * 60 * 1000;

export function transcriberState(workers = [], now = Date.now()) {
  const alive = workers
    .map((w) => ({ ...w, seen: Date.parse(w?.lastSeenAt || '') || 0 }))
    .filter((w) => now - w.seen <= TRANSCRIBER_FRESH_MS)
    .sort((a, b) => b.seen - a.seen);
  const latest = workers.map((w) => ({ ...w, seen: Date.parse(w?.lastSeenAt || '') || 0 })).sort((a, b) => b.seen - a.seen)[0] || null;
  const lastSeenAt = latest?.lastSeenAt || '';
  if (!alive.length) return { known: true, online: false, busy: false, host: latest?.host || '', analyzing: [], lastSeenAt, hours: latest?.hours || '', windowOpen: null, current: null };
  // what the Macs are analysing right now: the lesson's parts and the step („vead 12/40”, „kokkuvõte”)
  const analyzing = alive.filter((w) => w.state === 'analyzing').map((w) => ({ ids: [...(w.recordingIds || []), w.recordingId].filter(Boolean), detail: w.detail || '' }));
  const working = alive.find((w) => w.state === 'transcribing' || w.state === 'analyzing') || null;
  const current = working ? { state: working.state, recordingId: working.recordingId || '', recordingIds: working.recordingIds || [], detail: working.detail || '', progress: working.progress || null } : null;
  return { known: true, online: true, busy: alive.some((w) => w.state === 'transcribing'), host: alive[0].host || alive[0].id || '', analyzing, lastSeenAt, hours: alive[0].hours || '', windowOpen: typeof alive[0].windowOpen === 'boolean' ? alive[0].windowOpen : null, current };
}

// staff only (rules); `enabled` false → no subscription
export function useTranscriberStatus({ service = lessonRecordingsService, enabled = true } = {}) {
  const [workers, setWorkers] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled || typeof service?.subscribeTranscribers !== 'function') return undefined;
    let stop = () => {};
    try { stop = service.subscribeTranscribers((list) => setWorkers(list), () => setWorkers(null)) || stop; } catch { /* no Firebase client: status stays unknown */ }
    const timer = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => { stop(); clearInterval(timer); };
  }, [service, enabled]);
  if (!enabled || workers === null) return { known: false, online: false, busy: false, host: '', analyzing: [], lastSeenAt: '', hours: '', windowOpen: null, current: null };
  return transcriberState(workers, now);
}

export function transcriberLabel(state) {
  if (!state?.known) return '';
  if (!state.online) return 'Transkribeerija ei tööta: tekst tehakse, kui Mac on sees ja programm käib';
  return state.busy ? `Transkribeerija töötab (${state.host}), teeb praegu teksti` : `Transkribeerija töötab (${state.host})`;
}

// Where the AI analysis of a finished lesson is: ready, being made now (with its step), waiting in the queue, or
// waiting for the Mac. `recording` may be a joined lesson (`parts`). Null while the text itself is not done.
export function analysisStatus(recording, transcriber = {}) {
  if (!recording || recording.status !== 'done' || !recording.transcript?.length) return null;
  const a = recording.analysis;
  if (a?.summary || Array.isArray(a?.errors)) return { key: 'ready', label: 'AI analüüs valmis', tone: 'success' };
  if (a?.error) return { key: 'failed', label: 'AI analüüs ebaõnnestus', tone: 'danger' };
  const ids = recording.parts?.length ? recording.parts : [recording.id];
  const now = (transcriber.analyzing || []).find((w) => w.ids.some((id) => ids.includes(id)));
  if (now) return { key: 'running', label: `Analüüsin…${now.detail ? ` ${now.detail}` : ''}`, tone: 'info' };
  if (transcriber.known && !transcriber.online) return { key: 'offline', label: 'Analüüs tehakse, kui kooli Mac on sees', tone: 'neutral' };
  return { key: 'waiting', label: 'Ootab AI analüüsi (tavaliselt mõni minut)', tone: 'neutral' };
}

// „Tundide tekst” (owner 2026-11-24: the transcription stays on his Mac, but he sees its progress on the site): the
// lessons waiting for text, the one being made now, the ones whose analysis is still to come, today's finished ones
// and the failed ones. `recordings` = the queue (recording / uploaded / transcribing / failed) plus the recently
// transcribed ones; a part of a joined lesson (`partOf`) is not a lesson of its own.
export function transcriptionQueue(recordings = [], { now = Date.now(), dayMs = 24 * 60 * 60 * 1000 } = {}) {
  const lessons = recordings.filter((r) => r && !r.partOf);
  const by = (key) => (a, b) => String(a[key] || '').localeCompare(String(b[key] || ''));
  const recent = (iso) => now - (Date.parse(iso || '') || 0) <= dayMs;
  const analysed = (r) => Boolean(r.analysis?.summary || Array.isArray(r.analysis?.errors) || r.analysis?.error);
  return {
    recording: lessons.filter((r) => r.status === 'recording').sort(by('startedAt')),
    waiting: lessons.filter((r) => r.status === 'uploaded').sort(by('endedAt')),
    working: lessons.filter((r) => r.status === 'transcribing'),
    analysis: lessons.filter((r) => r.status === 'done' && r.transcript?.length && !analysed(r)).sort(by('transcribedAt')),
    doneToday: lessons.filter((r) => r.status === 'done' && analysed(r) && recent(r.analysis?.analyzedAt || r.transcribedAt)),
    failed: lessons.filter((r) => r.status === 'failed').sort(by('failedAt')).reverse(),
  };
}

// when the night window opens next: „täna 02:00” / „homme 02:00” (the Mac's window is in its local time = Tallinn)
export function nextWindowLabel(hours = '', now = new Date()) {
  const m = String(hours).match(/^(\d{1,2})-(\d{1,2})$/);
  if (!m) return '';
  const from = Number(m[1]);
  return `${now.getHours() < from ? 'täna' : 'homme'} kell ${String(from).padStart(2, '0')}:00`;
}

export function useTranscriptionQueue({ service = lessonRecordingsService, enabled = true } = {}) {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!enabled || typeof service?.subscribeQueue !== 'function') return undefined;
    let stop = () => {};
    try { stop = service.subscribeQueue((items) => { setList(items); setError(''); }, (err) => setError(err?.message || 'Järjekorda ei saanud lugeda')) || stop; } catch { /* no Firebase client: the queue stays unknown */ }
    return () => stop();
  }, [service, enabled]);
  return { list, error };
}

export function transcriberTileMeta(state, queue) {
  if (!queue) return '…';
  const left = queue.waiting.length + queue.working.length;
  const mac = !state?.known ? '' : state.online ? ' · Mac sees' : ' · Mac väljas';
  return `${left} ootab teksti · ${queue.analysis.length} analüüsi${mac}`;
}

