import { useEffect } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { onPractice } from './events.js';
import { countsAsLearnDay, xpOf } from './progress.js';
import { usePracticeProgress } from './usePracticeProgress.js';

// Practice XP for the pet (owner 2026-11-09: one progress meter): every finished word round or sentence / grammar lesson
// anywhere in the cabinet („Täna”, „Sõnad”, „Minu vead”, „Lemmik”) announces itself (events.js); this adds its XP —
// right answers only, at most DAILY_XP_CAP a day (progress.js, checked again by the rules). Students only, never in the
// staff preview. Any finished practice (countsAsLearnDay: also a submitted worksheet / task, a pet game) keeps the day
// streak, even with no XP (Fable review U2). Renders nothing.
export default function PracticeRecorder({ service }) {
  const { user, preview } = useAuth();
  const { save } = usePracticeProgress(user, { readOnly: Boolean(preview), ...(service ? { service } : {}) });
  useEffect(() => onPractice((event) => {
    const xp = xpOf(event);
    const learned = countsAsLearnDay(event);
    if (xp > 0 || learned) save({ xp, learned });
  }), [save]);
  return null;
}
