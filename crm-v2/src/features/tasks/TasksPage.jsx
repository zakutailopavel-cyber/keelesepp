import { CalendarClock, CheckCircle2, Circle, Columns3, List, MessageSquare, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { teachersService } from '../../services/firebase/index.js';
import { tasksService } from '../../services/firebase/tasks.js';
import {
  CATEGORY_LABEL,
  FILTERS,
  PRIORITY_LABEL,
  STATUS_LABEL,
  STATUS_ORDER,
  formatDue,
  hasUnreadReply,
  isAdmin,
  isCreatedBy,
  isNewForMe,
  isOverdue,
  matchesFilter,
  matchesSearch,
  scopeTasks,
  sortTasks,
  staffOptions,
  todayIso,
} from './taskModel.js';
import { useTasks } from './useTasks.js';
import './tasks.css';

const PRIORITY_TONE = { high: 'danger', normal: 'info', low: 'neutral' };
const emptyDraft = { title: '', assignedTo: '', dueDate: '', priority: 'normal', category: 'general' };
const formatTime = (value) => (value ? new Date(value).toLocaleString('et-EE', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');
const daysAgo = (days) => todayIso(new Date(Date.now() - days * 86_400_000));

function TaskCard({ task, user, today, onOpen, onToggle }) {
  const overdue = isOverdue(task, today);
  const unread = hasUnreadReply(task, user) || isNewForMe(task, user, today);
  return (
    <article className={`tk-card ${task.status === 'done' ? 'is-done' : ''}`}>
      <button type="button" className="tk-check" aria-label={task.status === 'done' ? `Ava uuesti: ${task.title}` : `Märgi tehtuks: ${task.title}`} onClick={() => onToggle(task)}>
        {task.status === 'done' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </button>
      <button type="button" className="tk-card__main" onClick={() => onOpen(task.id)}>
        <strong>{task.title || 'Nimetu ülesanne'}</strong>
        <span className="tk-card__meta">
          {task.priority !== 'normal' ? <Badge tone={PRIORITY_TONE[task.priority]}>{PRIORITY_LABEL[task.priority]}</Badge> : null}
          <Badge tone="neutral">{CATEGORY_LABEL[task.category] || 'Üldine'}</Badge>
          {task.dueDate ? <span className={`tk-due ${overdue ? 'is-overdue' : ''}`}><CalendarClock size={14} />{formatDue(task.dueDate)}</span> : null}
          {task.replies.length ? <span className="tk-replies"><MessageSquare size={14} />{task.replies.length}</span> : null}
          {unread ? <span className="tk-new">Uus</span> : null}
        </span>
        <small>{task.assignedTo || 'Vastutaja puudub'}</small>
      </button>
    </article>
  );
}

function TaskDrawer({ task, user, staff, onClose, onUpdate, onReply, onDelete }) {
  const [title, setTitle] = useState(task.title);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const canDelete = isAdmin(user) || isCreatedBy(task, user);
  const saveTitle = () => { const clean = title.trim(); if (clean && clean !== task.title) onUpdate(task, { title: clean }); else setTitle(task.title); };
  const send = async (event) => {
    event.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    if (await onReply(task, reply)) setReply('');
    setSending(false);
  };
  const assign = (name) => onUpdate(task, { assignedTo: name, assignedToUid: staff.find((member) => member.name === name)?.uid || '' });
  return (
    <Modal open title="Ülesanne" onClose={onClose} className="tk-modal" footer={canDelete ? <Button variant="danger" onClick={() => onDelete(task)}><Trash2 size={16} /> Kustuta</Button> : null}>
      <div className="tk-drawer">
        <Input label="Pealkiri" value={title} onChange={(event) => setTitle(event.target.value)} onBlur={saveTitle} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} />
        <div className="tk-drawer__grid">
          <Select label="Staatus" value={task.status} onChange={(event) => onUpdate(task, { status: event.target.value })}>
            {STATUS_ORDER.map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}
          </Select>
          <Select label="Vastutaja" value={task.assignedTo} onChange={(event) => assign(event.target.value)}>
            {!task.assignedTo ? <option value="">Vali vastutaja</option> : null}
            {staff.map((member) => <option key={member.name} value={member.name}>{member.name}</option>)}
          </Select>
          <Input label="Tähtaeg" type="date" value={task.dueDate} onChange={(event) => onUpdate(task, { dueDate: event.target.value })} />
          <Select label="Prioriteet" value={task.priority} onChange={(event) => onUpdate(task, { priority: event.target.value })}>
            {Object.entries(PRIORITY_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </Select>
          <Select label="Kategooria" value={task.category} onChange={(event) => onUpdate(task, { category: event.target.value })}>
            {Object.entries(CATEGORY_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </Select>
        </div>
        <p className="tk-origin">Lisas {task.createdByName || '—'}{task.createdAt ? ` · ${formatDue(String(task.createdAt).slice(0, 10))}` : ''}{task.status === 'done' && task.doneByName ? ` · valmis: ${task.doneByName}` : ''}</p>
        <section className="tk-thread" aria-label="Arutelu">
          <h3>Arutelu</h3>
          {task.replies.length ? task.replies.map((item) => (
            <div key={item.id || item.createdAt} className={`tk-reply ${item.byUid === user.uid ? 'is-mine' : ''}`}>
              <strong>{item.byName || 'Kasutaja'}</strong><small>{formatTime(item.createdAt)}</small>
              <p>{item.text}</p>
            </div>
          )) : <p className="tk-muted">Vastuseid veel pole.</p>}
          <form className="tk-reply-form" onSubmit={send}>
            <textarea aria-label="Vastus" rows="2" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Kirjuta vastus või täpsustus…" />
            <Button type="submit" loading={sending} disabled={!reply.trim()}>Saada</Button>
          </form>
        </section>
      </div>
    </Modal>
  );
}

export default function TasksPage({ service = tasksService, staffRepository = teachersService }) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { loading, tasks, error } = useTasks(service);
  const staffState = useAsyncData(() => staffRepository.list().catch(() => []), [staffRepository]);
  const [draft, setDraft] = useState(emptyDraft);
  const [filter, setFilter] = useState('open');
  const [search, setSearch] = useState('');
  const [view, setView] = useState(() => { try { return globalThis.localStorage.getItem('keelesepp.tasks.view') || 'board'; } catch { return 'board'; } });
  const [adding, setAdding] = useState(false);
  const [actionError, setActionError] = useState('');
  const today = todayIso();

  const scoped = useMemo(() => scopeTasks(tasks, user), [tasks, user]);
  const staff = useMemo(() => staffOptions(staffState.data || [], scoped, user), [staffState.data, scoped, user]);
  const filtered = useMemo(() => sortTasks(scoped.filter((task) => matchesFilter(task, filter, user, today) && matchesSearch(task, search))), [scoped, filter, search, user, today]);
  // On the board the "Avatud" filter still shows what was finished during the last week in the Valmis column.
  const boardTasks = useMemo(() => (filter === 'open'
    ? [...filtered, ...sortTasks(scoped.filter((task) => task.status === 'done' && String(task.doneAt || '') >= daysAgo(7) && matchesSearch(task, search)))]
    : filtered), [filter, filtered, scoped, search]);
  const selectedId = searchParams.get('task') || '';
  const selected = scoped.find((task) => task.id === selectedId) || null;
  const counts = useMemo(() => Object.fromEntries(FILTERS.map(({ id }) => [id, scoped.filter((task) => matchesFilter(task, id, user, today)).length])), [scoped, user, today]);

  const fail = (fallback) => (reason) => { setActionError(reason?.message || fallback); return false; };
  const openTask = (id) => {
    setSearchParams((params) => { const next = new globalThis.URLSearchParams(params); next.set('task', id); return next; });
  };
  const closeTask = () => setSearchParams((params) => { const next = new globalThis.URLSearchParams(params); next.delete('task'); return next; });
  const update = (task, patch) => { setActionError(''); return service.update(task, patch, user).then(() => true, fail('Ülesannet ei saanud salvestada.')); };
  const toggle = (task) => update(task, { status: task.status === 'done' ? 'open' : 'done' });
  const replyTo = (task, text) => { setActionError(''); return service.reply(task, text, user).then(() => true, fail('Vastust ei saanud saata.')); };
  const remove = async (task) => {
    if (!globalThis.confirm('Kustuta see ülesanne?')) return;
    setActionError('');
    if (await service.remove(task, user).then(() => true, fail('Ülesannet ei saanud kustutada.'))) closeTask();
  };
  const add = async (event) => {
    event.preventDefault();
    if (!draft.title.trim()) { setActionError('Sisesta ülesande pealkiri.'); return; }
    setAdding(true);
    setActionError('');
    const assignedTo = draft.assignedTo || user.displayName || '';
    const assignedToUid = staff.find((member) => member.name === assignedTo)?.uid || (draft.assignedTo ? '' : user.uid);
    const ok = await service.create({ ...draft, assignedTo, assignedToUid }, user).then(() => true, fail('Ülesannet ei saanud lisada.'));
    if (ok) setDraft({ ...emptyDraft, assignedTo: draft.assignedTo, category: draft.category });
    setAdding(false);
  };
  const chooseView = (next) => { setView(next); try { globalThis.localStorage.setItem('keelesepp.tasks.view', next); } catch { /* private mode */ } };

  // Opening a task (from the list or from a notification link) marks its new reply and the task itself as seen.
  const needsSeen = Boolean(selected) && (hasUnreadReply(selected, user) || !selected.openedByUids.includes(user.uid));
  useEffect(() => {
    if (needsSeen) service.markSeen(selected, user).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsSeen, selected?.id, service, user]);

  return (
    <div className="page-content tk-page">
      <PageHeader eyebrow="Meeskond" title="Ülesanded" description="Meeskonna ülesanded, tähtajad ja arutelu. Samad ülesanded on näha ka CRM v1-s." />

      <Card className="tk-add">
        <form className="tk-add__form" onSubmit={add}>
          <Input label="Uus ülesanne" placeholder="Mida on vaja teha?" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          <Select label="Vastutaja" value={draft.assignedTo} onChange={(event) => setDraft({ ...draft, assignedTo: event.target.value })}>
            <option value="">Mina</option>
            {staff.filter((member) => member.uid !== user.uid).map((member) => <option key={member.name} value={member.name}>{member.name}</option>)}
          </Select>
          <Input label="Tähtaeg" type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} />
          <Select label="Prioriteet" value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value })}>
            {Object.entries(PRIORITY_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </Select>
          <Select label="Kategooria" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
            {Object.entries(CATEGORY_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </Select>
          <Button type="submit" loading={adding}><Plus size={17} /> Lisa</Button>
        </form>
      </Card>

      <div className="tk-toolbar">
        <div className="tk-filters" role="tablist" aria-label="Ülesannete filter">
          {FILTERS.map(({ id, label }) => (
            <button key={id} type="button" role="tab" aria-selected={filter === id} onClick={() => setFilter(id)}>{label}{id !== 'all' && id !== 'done' ? <span>{counts[id]}</span> : null}</button>
          ))}
        </div>
        <label className="tk-search"><Search size={16} /><input aria-label="Otsi ülesannet" placeholder="Otsi…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <div className="tk-views" role="group" aria-label="Vaade">
          <button type="button" aria-pressed={view === 'board'} onClick={() => chooseView('board')}><Columns3 size={16} /> Tahvel</button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => chooseView('list')}><List size={16} /> Nimekiri</button>
        </div>
      </div>
      {actionError ? <p className="form-error" role="alert">{actionError}</p> : null}

      {loading ? <LoadingState label="Laen ülesandeid…" /> : null}
      {error ? <ErrorState title="Ülesandeid ei saanud laadida" message={error.message} /> : null}
      {!loading && !error && view === 'board' ? (
        <div className="tk-board">
          {STATUS_ORDER.map((status) => {
            const column = boardTasks.filter((task) => task.status === status);
            return (
              <section key={status} className={`tk-column tk-column--${status}`} aria-label={STATUS_LABEL[status]}>
                <header><strong>{STATUS_LABEL[status]}</strong><span>{column.length}</span></header>
                {column.map((task) => <TaskCard key={task.id} task={task} user={user} today={today} onOpen={openTask} onToggle={toggle} />)}
                {!column.length ? <p className="tk-muted">—</p> : null}
              </section>
            );
          })}
        </div>
      ) : null}
      {!loading && !error && view === 'list' ? (
        filtered.length ? <div className="tk-list">{filtered.map((task) => <TaskCard key={task.id} task={task} user={user} today={today} onOpen={openTask} onToggle={toggle} />)}</div>
          : <EmptyState title="Ülesandeid pole" description="Selle filtriga ülesandeid ei leitud." />
      ) : null}

      {selected ? <TaskDrawer key={selected.id} task={selected} user={user} staff={staff} onClose={closeTask} onUpdate={update} onReply={replyTo} onDelete={remove} /> : null}
    </div>
  );
}
