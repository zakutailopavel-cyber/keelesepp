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
  if (!alive.length) return { known: true, online: false, busy: false, host: '', analyzing: [] };
  // what the Macs are analysing right now: the lesson's parts and the step („vead 12/40”, „kokkuvõte”)
  const analyzing = alive.filter((w) => w.state === 'analyzing').map((w) => ({ ids: [...(w.recordingIds || []), w.recordingId].filter(Boolean), detail: w.detail || '' }));
  return { known: true, online: true, busy: alive.some((w) => w.state === 'transcribing'), host: alive[0].host || alive[0].id || '', analyzing };
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
  if (!enabled || workers === null) return { known: false, online: false, busy: false, host: '', analyzing: [] };
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
