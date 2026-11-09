import { CalendarCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// „Märkimata tunnid” nudge on a teacher's home page (owner 2026-11-09: a daily reminder inside the CRM, never an
// e-mail): once a day, when own lessons from before yesterday are still unmarked. Remembered per teacher in this
// browser only (no server write); a browser without storage shows it on every visit, which is harmless.
const nudgeKey = (uid) => `ks-unmarked-nudge:${uid}`;
const readDay = (key) => { try { return globalThis.localStorage?.getItem(key) || ''; } catch { return ''; } };
const writeDay = (key, day) => { try { globalThis.localStorage?.setItem(key, day); } catch { /* storage may be disabled */ } };

export default function UnmarkedNudge({ reminder, uid, today, disabled = false }) {
  const key = nudgeKey(uid || '');
  // decided once per visit: shown today already → stays hidden until tomorrow
  const [shown] = useState(() => !disabled && Boolean(uid) && readDay(key) !== today);
  const [closed, setClosed] = useState(false);
  const visible = shown && !closed && Boolean(reminder?.stale);
  useEffect(() => { if (visible) writeDay(key, today); }, [visible, key, today]);
  if (!visible) return null;
  return <div className="calm-nudge" role="status">
    <CalendarCheck size={18} aria-hidden="true" />
    <Link to="/calendar/markimata" onClick={() => setClosed(true)}>
      Sul on {reminder.total} märkimata {reminder.total === 1 ? 'tund' : 'tundi'}{reminder.oldestLabel ? ` (vanim ${reminder.oldestLabel})` : ''}. <b>Märgi need 1 minutiga →</b>
    </Link>
    <button type="button" className="calm-nudge__close" aria-label="Peida meeldetuletus" onClick={() => setClosed(true)}><X size={15} /></button>
  </div>;
}
