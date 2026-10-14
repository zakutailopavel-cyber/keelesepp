import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { activeLessons, liveLessonObserversService } from '../../services/firebase/liveLessonObservers.js';

const since = (ms) => new Date(ms).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' });

// Administrator: the lessons going on now, each with „Vaata tundi” (owner, 2026-10-14)
export default function ActiveLessonsMenu({ service = liveLessonObserversService }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { return service.subscribeAccepted((next) => setItems(activeLessons(next)), () => setItems([])); } catch { return undefined; }
  }, [service]);
  return <div className="lw-active">
    <button type="button" className={`lr-text-btn ${open ? 'is-active' : ''}`} aria-expanded={open} onClick={() => setOpen(!open)}>
      <Eye size={17} /> Käimasolevad tunnid ({items.length})
    </button>
    {open ? <div className="lw-active__list" role="list" aria-label="Käimasolevad tunnid">
      {items.length ? items.map((item) => <div key={item.id} role="listitem">
        <span><strong>{item.teacherName}</strong> · {item.studentName}<small>{item.title} · alates {since(item.startedMs)}</small></span>
        <Link className="lr-text-btn" to={`/live-classroom/vaatle/${item.id}`}><Eye size={15} /> Vaata tundi</Link>
      </div>) : <p className="lr-muted">Praegu ühtegi tundi ei toimu.</p>}
    </div> : null}
  </div>;
}
