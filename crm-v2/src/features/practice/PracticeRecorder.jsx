import { useEffect } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { onPractice } from './events.js';
import { xpOf } from './progress.js';
import { usePracticeProgress } from './usePracticeProgress.js';

// Practice XP for the pet (owner 2026-11-09: one progress meter): every finished word round or sentence / grammar lesson
// anywhere in the cabinet („Täna”, „Sõnad”, „Minu vead”, „Lemmik”) announces itself (events.js); this adds its XP —
// right answers only, at most DAILY_XP_CAP a day (progress.js, checked again by the rules). Students only, never in the
// staff preview. Renders nothing.
export default function PracticeRecorder({ service }) {
  const { user, preview } = useAuth();
  const { save } = usePracticeProgress(user, { readOnly: Boolean(preview), ...(service ? { service } : {}) });
  useEffect(() => onPractice((event) => {
    const xp = xpOf(event);
    if (xp > 0) save({ xp });
  }), [save]);
  return null;
}
