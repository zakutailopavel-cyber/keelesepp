import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { presenceService } from '../../services/firebase/presence.js';
import { localDate } from '../../utils/localDate.js';
import { learnStreak, newerPractice, nextPracticeToday, readLocalPractice, todayOf, writeLocalPractice, xpOf } from './progress.js';

// One copy of „Täna” progress for the whole cabinet: the account's `practice` map (read at sign-in) merged with this
// browser's copy, updated at once on screen and saved in the background. Every user of this hook (Täna, the pet, the
// XP recorder) hears the same change through one window event.
export const PROGRESS_EVENT = 'ks-practice-progress';

const announce = (practice) => {
  try { globalThis.dispatchEvent?.(new globalThis.CustomEvent(PROGRESS_EVENT, { detail: practice })); } catch { /* old browsers */ }
};

/**
 * save({ done: [stepKey], xp }) ticks steps / adds XP (capped, progress.js). In the staff preview (`readOnly`) nothing is
 * written anywhere. `service` is presence.js (injected in tests).
 */
export function usePracticeProgress(user, { readOnly = false, service = presenceService, now } = {}) {
  const uid = user?.uid || '';
  const [practice, setPracticeState] = useState(() => newerPractice(user?.profile?.practice || {}, readOnly ? {} : readLocalPractice(uid)));
  const latest = useRef(practice);
  const setPractice = useCallback((next) => { latest.current = next; setPracticeState(next); }, []);
  useEffect(() => {
    const onChange = (event) => { if (event.detail) setPractice(newerPractice(latest.current, event.detail)); };
    globalThis.addEventListener?.(PROGRESS_EVENT, onChange);
    return () => globalThis.removeEventListener?.(PROGRESS_EVENT, onChange);
  }, [setPractice]);
  const date = localDate(now ? new Date(now) : new Date());

  const save = useCallback(async (update) => {
    const next = nextPracticeToday(latest.current, { ...update, date });
    setPractice(next);
    if (readOnly || !uid) return next;
    writeLocalPractice(uid, next);
    announce(next);
    try {
      const saved = await service.saveToday?.(uid, { ...update, date });
      if (saved) { writeLocalPractice(uid, saved); announce(saved); }
    } catch { /* kept in this browser; the next save carries it */ }
    return next;
  }, [date, readOnly, service, setPractice, uid]);

  const today = useMemo(() => todayOf(practice, date), [practice, date]);
  const streak = useMemo(() => learnStreak(practice.learnDays || [], date), [practice, date]);
  return { practice, today, streak, xp: Math.max(0, Number(practice.xp) || 0), save, xpOf };
}
