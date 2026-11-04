import { useCallback, useEffect, useRef, useState } from 'react';
import { liveCountdownService } from '../../services/firebase/liveCountdown.js';
import {
  addMinute, combineOffset, countdownRemaining, normalizeCountdown, offsetSample, pauseCountdown, resumeCountdown, startCountdown,
} from './countdown.js';

// The room's countdown (countdown.js): follows the field on the room doc, keeps an estimate of this clock's offset to
// the server and ticks only while a timer runs. The teacher gets the actions; every write is one click.
export function useCountdown({ kind = 'lesson', id = '', user, teacher = false, enabled = true, service = liveCountdownService }) {
  const [countdown, setCountdown] = useState(null);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const samples = useRef([]);
  const seen = useRef({ first: true, updatedAt: 0 });

  useEffect(() => {
    seen.current = { first: true, updatedAt: 0 };
    if (!enabled || !id || !service?.subscribe) { setCountdown(null); return undefined; }
    try {
      return service.subscribe(kind, id, (raw, meta = {}) => {
        const next = normalizeCountdown(raw);
        const before = seen.current;
        // a write that arrives live (not the first, already old snapshot; not the own pending estimate) is a sample
        if (next && !meta.pending && !meta.fromCache && !before.first && next.updatedAt !== before.updatedAt) {
          const sample = offsetSample(next.updatedAt, meta.receivedAt || Date.now());
          if (sample !== null) {
            samples.current = [...samples.current, sample].slice(-5);
            setOffset(combineOffset(samples.current));
          }
        }
        seen.current = { first: false, updatedAt: next?.updatedAt || 0 };
        setCountdown(next);
      }, (nextError) => setError(nextError?.message || 'Taimerit ei saanud laadida.'));
    } catch (nextError) {
      globalThis.queueMicrotask(() => setError(nextError?.message || 'Taimerit ei saanud laadida.'));
      return undefined;
    }
  }, [enabled, id, kind, service]);

  // ticks four times a second only while a timer runs and has time left
  const [now, setNow] = useState(() => Date.now());
  const left = countdownRemaining(countdown, now, offset);
  const ticking = Boolean(countdown?.running && left > 0);
  useEffect(() => {
    if (!ticking) return undefined;
    const timer = globalThis.setInterval(() => setNow(Date.now()), 250);
    return () => globalThis.clearInterval(timer);
  }, [ticking]);
  useEffect(() => { setNow(Date.now()); }, [countdown]);

  const write = useCallback(async (value) => {
    if (!teacher || !service?.set) return;
    setBusy(true);
    setError('');
    try { await service.set(kind, id, value); } catch (nextError) { setError(nextError?.message || 'Taimerit ei saanud muuta.'); } finally { setBusy(false); }
  }, [teacher, service, kind, id]);
  const by = user?.uid || '';
  const actions = {
    start: (durationMs, label = '') => write(startCountdown(durationMs, { label, by })),
    pause: () => write(pauseCountdown(countdown, Date.now(), offset, by)),
    resume: () => write(resumeCountdown(countdown, by)),
    addMinute: () => write(addMinute(countdown, Date.now(), offset, by)),
    stop: () => write(null),
  };
  return {
    countdown,
    remainingMs: left,
    active: Boolean(countdown),
    running: Boolean(countdown?.running),
    expired: Boolean(countdown?.running && left <= 0),
    offset,
    error,
    busy,
    actions,
  };
}
