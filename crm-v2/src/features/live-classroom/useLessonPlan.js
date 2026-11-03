import { useEffect, useMemo, useState } from 'react';
import { liveLessonPlansService } from '../../services/firebase/liveLessonPlans.js';
import { emptyPlan, normalizeSteps, planClock } from './lessonPlan.js';

/**
 * The teacher's lesson plan and attendance of a room (1:1 and group). The stored plan (`liveLessonPlans/{roomKey}`)
 * wins; before the teacher starts or edits it the default agenda is shown and nothing is written. The clock ticks
 * locally (once a second) from the stored timestamps.
 */
export function useLessonPlan({ roomKey, kind = 'lesson', user, enabled = true, defaultSteps, plannedStart = '', service = liveLessonPlansService }) {
  const [stored, setStored] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled || !roomKey || !service?.subscribe) return undefined;
    try {
      return service.subscribe(roomKey, (value) => { setStored(value); setLoaded(true); }, (next) => { setLoaded(true); setError(next?.message || 'Tunniplaani ei saanud laadida.'); });
    } catch (next) {
      globalThis.queueMicrotask(() => setError(next?.message || 'Tunniplaani ei saanud laadida.'));
      return undefined;
    }
  }, [enabled, roomKey, service]);
  const running = Boolean(stored?.startedAt);
  useEffect(() => {
    if (!enabled || !running) return undefined;
    const timer = globalThis.setInterval(() => setNow(Date.now()), 1000);
    return () => globalThis.clearInterval(timer);
  }, [enabled, running]);
  const plan = useMemo(() => (stored
    ? { ...stored, kind, steps: normalizeSteps(stored.steps), attendance: stored.attendance || {} }
    : { ...emptyPlan(defaultSteps || []), kind, plannedStart, attendance: {} }), [stored, defaultSteps, kind, plannedStart]);
  const save = async (next) => {
    setError('');
    const value = { ...next, kind, plannedStart: next.plannedStart || plannedStart };
    setStored((current) => ({ ...(current || {}), ...value }));
    try { await service.save(roomKey, value, user); } catch (failure) { setError(failure?.message || 'Tunniplaani ei saanud salvestada.'); }
  };
  return { plan, stored: Boolean(stored), loaded, error, now, clock: planClock(plan, now), save };
}

