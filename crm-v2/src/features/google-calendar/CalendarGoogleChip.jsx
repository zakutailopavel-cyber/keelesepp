import { CalendarSync, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { googleCalendarService } from '../../services/firebase/googleCalendar.js';
import { describeConnection, formatSyncTime, shouldAutoSync, syncResultMessage } from './googleCalendarModel.js';
import './googleCalendar.css';

/**
 * Calendar toolbar: the teacher's Google Calendar state with a "sync now" button. Opening the calendar
 * syncs by itself when the last sync is older than 15 minutes; `onSynced` reloads the calendar data.
 * Hidden when the status cannot be loaded (for example Firebase not configured).
 */
export default function CalendarGoogleChip({ user, repository = googleCalendarService, onSynced }) {
  const [status, setStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const autoTried = useRef(false);
  const onSyncedRef = useRef(onSynced);
  useEffect(() => { onSyncedRef.current = onSynced; }, [onSynced]);

  useEffect(() => {
    let alive = true;
    const sync = async (current) => {
      setSyncing(true);
      try {
        const result = await repository.sync(user.uid);
        const next = await repository.status(user.uid);
        if (!alive) return;
        setStatus(next);
        setMessage(syncResultMessage(result));
        if (result.synced || result.cancelled || result.removed) await onSyncedRef.current?.();
      } catch (error) {
        if (alive) { setStatus({ ...current, lastSyncError: error.message || 'Sünkroonimine ebaõnnestus.' }); setMessage(''); }
      } finally {
        if (alive) setSyncing(false);
      }
    };
    Promise.resolve().then(() => repository.status(user.uid)).then((value) => {
      if (!alive) return;
      setStatus(value);
      if (!autoTried.current && shouldAutoSync(value)) { autoTried.current = true; sync(value); }
    }).catch(() => { if (alive) setStatus(null); });
    return () => { alive = false; };
  }, [repository, user.uid]);

  if (!status) return null;
  if (!status.connected) {
    return <Link className="gcal-chip" to="/settings#google-calendar"><CalendarSync size={15} /> Ühenda Google</Link>;
  }

  const summary = describeConnection(status);
  const syncNow = async () => {
    setSyncing(true); setMessage('');
    try {
      const result = await repository.sync(user.uid);
      setStatus(await repository.status(user.uid));
      setMessage(syncResultMessage(result));
      await onSynced?.();
    } catch (error) {
      setStatus((current) => ({ ...current, lastSyncError: error.message || 'Sünkroonimine ebaõnnestus.' }));
    } finally { setSyncing(false); }
  };
  const title = [summary.error || summary.label, `Viimane sünkroonimine: ${formatSyncTime(status.lastSyncAt)}`, message].filter(Boolean).join('\n');

  return (
    <span className={`gcal-chip is-${summary.tone}`} title={title} role="status" aria-live="polite">
      <Link to="/settings#google-calendar" className="gcal-chip__label">{summary.short}</Link>
      <small>{syncing ? 'sünkroonin…' : formatSyncTime(status.lastSyncAt)}</small>
      <button type="button" aria-label="Sünkrooni Google Calendariga" disabled={syncing} onClick={syncNow}><RefreshCw size={14} className={syncing ? 'is-spinning' : ''} /></button>
    </span>
  );
}
