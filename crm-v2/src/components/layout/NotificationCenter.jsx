import { Bell, BookOpenCheck, CircleAlert, ListTodo, MessageSquareText, ReceiptText, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, invoicesService, messagesService, studentsService } from '../../services/firebase/index.js';
import { tasksService } from '../../services/firebase/tasks.js';
import {
  CATEGORY_LABEL,
  homeworkNotifications,
  invoiceNotifications,
  messageNotifications,
  sortNotifications,
  taskNotifications,
} from '../../features/notifications/notificationModel.js';
import { useTasks } from '../../features/tasks/useTasks.js';
import IconButton from '../ui/IconButton.jsx';
import '../../features/notifications/notifications.css';

const defaultRepositories = { students: studentsService, messages: messagesService, homework: homeworkService, invoices: invoicesService, tasks: tasksService };
const ICONS = { task: ListTodo, message: MessageSquareText, homework: BookOpenCheck, invoice: ReceiptText };
const quiet = (promise) => Promise.resolve(promise).catch(() => []);

async function loadSources(user, repositories) {
  const admin = user.roles.includes('admin');
  const teacher = user.roles.includes('teacher');
  const finance = user.roles.includes('finance');
  const staff = admin || teacher;
  const studentResult = staff
    ? await repositories.students.list({ status: 'active', pageSize: 500, exhaustive: true, ...(admin ? {} : { scopeTeacherUid: user.uid }) }).catch(() => ({ items: [] }))
    : { items: [] };
  const ids = studentResult.items.map((student) => student.id);
  const names = new Map(studentResult.items.map((student) => [student.id, student.name]));
  const [messages, submissions, invoices] = await Promise.all([
    staff ? quiet(admin ? repositories.messages.list() : repositories.messages.listByStudentIds(ids)) : [],
    staff ? quiet(repositories.homework.listSubmissionsByStudentIds(ids)) : [],
    admin || finance ? quiet(repositories.invoices.list()) : [],
  ]);
  return {
    messages,
    submissions: submissions.map((item) => ({ ...item, studentName: item.studentName || names.get(item.studentId) || 'Õpilane' })),
    invoices,
  };
}

export default function NotificationCenter({ user, repositories = defaultRepositories }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const rootRef = useRef(null);
  const staff = user.roles.includes('admin') || user.roles.includes('teacher');
  const { tasks } = useTasks(repositories.tasks, staff);
  const sources = useAsyncData(() => loadSources(user, repositories), [user.uid, repositories, refreshKey]);

  const items = useMemo(() => sortNotifications([
    ...(staff ? taskNotifications(tasks, user) : []),
    ...messageNotifications(sources.data?.messages || [], user),
    ...homeworkNotifications(sources.data?.submissions || []),
    ...invoiceNotifications(sources.data?.invoices || []),
  ]), [sources.data, staff, tasks, user]);
  // the bell counts only what is new since the panel was last opened (remembered per user in this browser);
  // the panel itself still lists everything that needs attention
  const seenKey = `ks-notifications-seen:${user.uid}`;
  const [seen, setSeen] = useState(() => { try { return new Set(JSON.parse(window.localStorage.getItem(seenKey) || '[]')); } catch { return new Set(); } });
  const fresh = items.filter((item) => !seen.has(item.id));
  const counts = useMemo(() => items.reduce((all, item) => ({ ...all, [item.category]: (all[item.category] || 0) + 1 }), {}), [items]);
  const visible = category === 'all' ? items : items.filter((item) => item.category === category);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    const onPointer = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer); };
  }, [open]);

  const toggle = () => {
    if (!open) {
      setRefreshKey((key) => key + 1);
      const ids = items.map((item) => item.id);
      setSeen(new Set(ids));
      try { window.localStorage.setItem(seenKey, JSON.stringify(ids.slice(0, 500))); } catch { /* storage may be disabled */ }
    }
    setOpen(!open);
  };
  const go = (item) => { setOpen(false); navigate(item.to); };

  return (
    <div className="nc" ref={rootRef}>
      <IconButton label={fresh.length ? `Teavitused, ${fresh.length} uut` : items.length ? `Teavitused, ${items.length} avatud` : 'Teavitused'} className={`nc-bell ${items.length && !fresh.length ? 'has-seen' : ''}`} aria-expanded={open} aria-haspopup="dialog" onClick={toggle}>
        <Bell size={19} />
        {fresh.length ? <span className="nc-count" aria-hidden="true">{fresh.length > 99 ? '99+' : fresh.length}</span> : items.length ? <span className="nc-dot" aria-hidden="true" /> : null}
      </IconButton>
      {open ? (
        <section className="nc-panel" role="dialog" aria-label="Teavituskeskus">
          <header className="nc-head">
            <strong>Teavitused</strong>
            <IconButton label="Värskenda" className="nc-refresh" onClick={() => setRefreshKey((key) => key + 1)} disabled={sources.loading}><RefreshCw size={16} /></IconButton>
          </header>
          <div className="nc-filters" role="tablist" aria-label="Teavituste liik">
            <button type="button" role="tab" aria-selected={category === 'all'} onClick={() => setCategory('all')}>Kõik <span>{items.length}</span></button>
            {Object.entries(CATEGORY_LABEL).filter(([id]) => counts[id]).map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={category === id} onClick={() => setCategory(id)}>{label} <span>{counts[id]}</span></button>
            ))}
          </div>
          <div className="nc-list">
            {visible.map((item) => {
              const Icon = ICONS[item.category] || CircleAlert;
              return (
                <button key={item.id} type="button" className={`nc-item nc-item--${item.severity}`} onClick={() => go(item)}>
                  <span className="nc-icon"><Icon size={17} /></span>
                  <span className="nc-text"><strong>{item.title}</strong>{item.detail ? <span>{item.detail}</span> : null}{item.meta ? <small>{item.meta}</small> : null}</span>
                </button>
              );
            })}
            {!visible.length ? <p className="nc-empty">{sources.loading ? 'Laen…' : 'Kõik on tehtud — uusi teavitusi pole.'}</p> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
