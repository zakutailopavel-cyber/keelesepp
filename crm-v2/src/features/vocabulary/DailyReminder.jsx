import { BellRing } from 'lucide-react';
import { useState } from 'react';
import { dailyReminderIcs, REMINDER_TIMES } from './dailyReminder.js';

const STORE = 'keelesepp.dailyReminder';
const saved = () => { try { return globalThis.localStorage?.getItem(STORE) || ''; } catch { return ''; } };

// „Tuleta mulle iga päev meelde”: downloads a daily repeating calendar event (dailyReminder.js) for the phone.
export default function DailyReminder({ download = downloadFile }) {
  const [time, setTime] = useState(() => saved() || '19:00');
  const [added, setAdded] = useState(() => Boolean(saved()));
  const add = () => {
    download('keelesepp-paeva-5-minutit.ics', dailyReminderIcs({ time, url: `${globalThis.location?.origin || ''}/student/sonavara?paev=1` }));
    try { globalThis.localStorage?.setItem(STORE, time); } catch { /* private mode */ }
    setAdded(true);
  };
  return <div className="vd-reminder">
    <BellRing size={16} aria-hidden="true" />
    <span>{added ? `Meeldetuletus on kalendris kell ${time}.` : 'Tuleta mulle iga päev meelde'}</span>
    <select aria-label="Meeldetuletuse kellaaeg" value={time} onChange={(event) => setTime(event.target.value)}>
      {REMINDER_TIMES.map((value) => <option key={value} value={value}>{value}</option>)}
    </select>
    <button type="button" className="vw-btn" onClick={add}>{added ? 'Lisa uuesti' : 'Lisa telefoni kalendrisse'}</button>
  </div>;
}

function downloadFile(name, text) {
  const blob = new globalThis.Blob([text], { type: 'text/calendar;charset=utf-8' });
  const href = globalThis.URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  globalThis.setTimeout(() => globalThis.URL.revokeObjectURL(href), 1000);
}
