import { GraduationCap, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { announcementsService } from '../../services/firebase/announcements.js';
import AnnouncementResponder from './AnnouncementResponder.jsx';
import AnnouncementText from './AnnouncementText.jsx';
import './announcements.css';

const WAIT_MS = 8000;

// „Teated” (owner 2026-10-24): right after login every active announcement a student / parent has not answered yet
// opens full screen, one after another (oldest first); the CRM opens only after the last one. Logging out stays
// possible. If the server cannot be reached (or is slow), the CRM opens as usual — an announcement never locks
// anyone out.
export default function AnnouncementGate({ enabled, user, onSignOut, service = announcementsService, availabilityService, children }) {
  // the answer of the server for one account: { uid, pending }; until it comes (or the wait runs out) the gate loads
  const [state, setState] = useState({ uid: null, pending: [], done: 0 });
  const uid = user?.uid || '';

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    const finish = (pending) => { if (alive) setState((current) => (current.uid === uid ? current : { uid, pending, done: 0 })); };
    const timer = globalThis.setTimeout(() => finish([]), WAIT_MS);
    Promise.resolve().then(() => service.mine())
      .then((result) => finish(Array.isArray(result?.pending) ? result.pending : []))
      .catch(() => finish([]));
    return () => { alive = false; globalThis.clearTimeout(timer); };
  }, [enabled, service, uid]);

  if (!enabled) return children;
  if (state.uid !== uid) return <div className="announcement-gate announcement-gate--loading" role="status"><span className="state-spinner" aria-hidden="true" /> Laen… · Загрузка…</div>;
  const current = state.pending[0];
  if (!current) return children;
  const total = state.pending.length + state.done;
  const number = state.done + 1;
  const { announcement, target } = current;
  const titleId = `announcement-${announcement.id}-${target.key}`;
  const next = () => setState((value) => ({ ...value, pending: value.pending.slice(1), done: value.done + 1 }));

  return (
    <div className="announcement-gate" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header className="announcement-gate__bar">
        <span className="announcement-gate__brand"><GraduationCap size={20} /> KeeleSepp</span>
        {total > 1 ? <span className="announcement-gate__count" aria-label={`Teade ${number} / ${total}`}><span className="announcement-gate__count-long">Teade · Объявление </span>{number} / {total}</span> : null}
        <button type="button" className="announcement-gate__logout" onClick={onSignOut}><LogOut size={16} /> Logi välja · Выйти</button>
      </header>
      <main className="announcement-gate__body">
        <article className="announcement-gate__card" key={`${announcement.id}-${target.key}`}>
          <span className="eyebrow">Teade koolilt · Сообщение от школы</span>
          <h1 id={titleId}>{announcement.title}</h1>
          {target.kind === 'parent' && target.studentId ? <p className="announcement-gate__child">Laps · Ребёнок: <strong>{target.studentName}</strong></p> : null}
          <AnnouncementText body={announcement.body} />
          <AnnouncementResponder item={current} user={user} service={service} {...(availabilityService ? { availabilityService } : {})} onAnswered={next} />
          <p className="form-hint announcement-gate__hint">Pärast vastamist avaneb KeeleSepp. · После ответа откроется KeeleSepp.</p>
        </article>
      </main>
    </div>
  );
}
