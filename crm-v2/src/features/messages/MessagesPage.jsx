import { CheckCheck, MessageCircle, Search, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { messagesService, studentsService } from '../../services/firebase/index.js';
import { hasAnyRole, ROLES } from '../../utils/roles.js';
import { buildConversations } from './messagesModel.js';

function messageTime(message) {
  const date = new Date(message.createdAt || `${message.date}T12:00:00`);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('et-EE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toLocaleUpperCase('et') || '?';
}

export default function MessagesPage({ repository = messagesService, studentRepository = studentsService }) {
  const { user } = useAuth();
  const admin = hasAnyRole(user.roles, [ROLES.ADMIN]);
  const staff = hasAnyRole(user.roles, [ROLES.ADMIN, ROLES.TEACHER]);
  const teacherOnly = hasAnyRole(user.roles, [ROLES.TEACHER]) && !admin;
  const [selected, setSelected] = useState('');
  const [query, setQuery] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState('');
  const [locallyRead, setLocallyRead] = useState(() => new Set());

  const state = useAsyncData(async () => {
    const studentResult = staff
      ? await studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) })
      : { items: await studentRepository.listOwned(user.uid) };
    const studentIds = studentResult.items.map((student) => student.id);
    const messages = admin ? await repository.list() : await repository.listByStudentIds(studentIds);
    return { messages, students: studentResult.items };
  }, [admin, repository, staff, studentRepository, teacherOnly, user.uid]);

  const allConversations = useMemo(() => buildConversations(state.data?.messages, user.uid, locallyRead), [locallyRead, state.data, user.uid]);
  const conversations = useMemo(() => allConversations.filter((item) => item.name.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et'))), [allConversations, query]);
  const students = state.data?.students || [];
  const selectedStudent = students.find((item) => item.id === selected);
  const active = allConversations.find((item) => item.id === selected)
    || (selectedStudent ? { id: selectedStudent.id, name: selectedStudent.name, teacher: selectedStudent.teacher || '', messages: [], unread: 0 } : conversations[0]);
  const unreadMessages = active?.messages.filter((message) => !message.read && message.fromUid !== user.uid && !locallyRead.has(message.id)) || [];
  const unreadKey = unreadMessages.map((message) => message.id).join('|');
  const totalUnread = allConversations.reduce((sum, item) => sum + item.unread, 0);

  useEffect(() => {
    if (!active?.id || !unreadMessages.length) return undefined;
    let cancelled = false;
    repository.markConversationRead({ messages: unreadMessages, userUid: user.uid })
      .then(() => { if (!cancelled) setLocallyRead((current) => new Set([...current, ...unreadMessages.map((message) => message.id)])); })
      .catch((error) => { if (!cancelled) setActionError(error.message || 'Sõnumite loetuks märkimine ebaõnnestus.'); });
    return () => { cancelled = true; };
  // unreadKey is a stable identity for the unread messages in the active conversation.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, repository, unreadKey, user.uid]);

  if (state.loading) return <LoadingState label="Laen sõnumeid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const send = async (event) => {
    event.preventDefault();
    if (!text.trim() || !active) return;
    setSending(true); setActionError('');
    try {
      await repository.send({ studentId: active.id, studentName: active.name, teacher: active.teacher || selectedStudent?.teacher || '', text }, user);
      setText('');
      await state.reload();
    } catch (error) { setActionError(error.message || 'Sõnumi saatmine ebaõnnestus.'); }
    finally { setSending(false); }
  };

  const start = (event) => {
    const student = students.find((item) => item.id === event.target.value);
    if (student) { setSelected(student.id); setQuery(''); }
  };

  return <div className="page-content">
    <PageHeader eyebrow="Suhtlus" title="Sõnumid" description="Vestlused õpilaste ja lapsevanematega." actions={totalUnread ? <Badge tone="info">{totalUnread} lugemata</Badge> : null} />
    {actionError ? <div className="action-error" role="alert">{actionError}<button aria-label="Sulge veateade" onClick={() => setActionError('')}>×</button></div> : null}
    <Card className="messages-shell">
      <aside className="conversation-list">
        <div className="search-field"><Search size={17} /><input aria-label="Otsi vestlust" placeholder="Otsi vestlust" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <select className="new-conversation" aria-label="Alusta vestlust" value="" onChange={start}><option value="">+ Alusta uut vestlust</option>{students.map((student) => <option value={student.id} key={student.id}>{student.name}</option>)}</select>
        <div>{conversations.map((item) => <button className={active?.id === item.id ? 'conversation active' : 'conversation'} key={item.id} onClick={() => setSelected(item.id)}>
          <span className="conversation-avatar">{initials(item.name)}</span><div><strong>{item.name}</strong><small>{item.messages.at(-1)?.text}</small></div>{item.unread ? <b aria-label={`${item.unread} lugemata`}>{item.unread}</b> : <CheckCheck className="conversation-read" size={17} />}
        </button>)}</div>
        {!conversations.length && query ? <div className="conversation-empty">Vestlusi ei leitud.</div> : null}
      </aside>
      <section className="chat-panel">{active ? <>
        <header><span className="conversation-avatar">{initials(active.name)}</span><div><strong>{active.name}</strong><small>{active.messages.length} sõnumit{active.teacher ? ` · ${active.teacher}` : ''}</small></div></header>
        <div className="message-stream" aria-label={`Vestlus: ${active.name}`}>{active.messages.length ? active.messages.map((message) => <div className={message.fromUid === user.uid ? 'message own' : 'message'} key={message.id}><span>{message.fromName}</span><p>{message.text}</p><time>{messageTime(message)}</time></div>) : <EmptyState title="Alusta vestlust" description="Kirjuta esimene sõnum allolevasse väljale." action={<MessageCircle size={28} />} />}</div>
        <form className="message-composer" onSubmit={send}><textarea aria-label="Sõnum" maxLength="4000" placeholder="Kirjuta sõnum…" rows="2" value={text} onChange={(event) => setText(event.target.value)} /><div><small>{text.length}/4000</small><Button type="submit" loading={sending} disabled={!text.trim()} aria-label="Saada"><Send size={18} /></Button></div></form>
      </> : <EmptyState title="Vestlusi veel ei ole" description="Vali õpilane ja alusta esimest vestlust." action={<MessageCircle size={28} />} />}</section>
    </Card>
  </div>;
}
