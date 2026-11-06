import { CalendarDays, Video } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Input } from '../../../components/ui/index.js';
import { FOLLOWUP_NOTE_MAX } from '../../../services/firebase/studentFollowups.js';
import { timelineSplit } from '../calmModel.js';
import { CALLED_DAYS, CALL_WINDOW_DAYS } from './todayModel.js';
import { HOMEWORK_WINDOW_DAYS } from './useTodaySignals.js';
import './today.css';

// The „Täna” parts of the home page (2026-11-04, calm layout 2026-11-06): today's lessons as a short timeline, and the
// panels behind the „Ülevaated” tiles — homework per teacher, website enquiries, paid lessons running out and the
// students who need a call („Helistasin”). Data comes from useTodaySignals; nothing here reads by itself except the
// call log write.

const tunde = (n) => `${String(n).replace('.', ',')} ${Number(n) === 1 ? 'tund' : 'tundi'}`;
const shortDay = (iso) => (iso ? new Intl.DateTimeFormat('et-EE', { day: 'numeric', month: 'numeric', timeZone: 'Europe/Tallinn' }).format(new Date(iso)) : '');
const waited = (days) => (days == null ? '' : days === 0 ? 'täna' : days === 1 ? 'eile' : `${days} päeva tagasi`);
const PHASE = { now: ['success', 'Käib'], past: ['neutral', 'Läbi'], cancelled: ['danger', 'Tühistatud'] };
const Pending = ({ label = 'Arvutan…' }) => <p className="form-hint">{label}</p>;
const Failed = () => <p className="form-hint">Andmeid ei saanud praegu laadida.</p>;

function LessonRow({ item, showTeacher }) {
  return <li className={`is-${item.phase}`}>
    <time>{item.time}{item.end ? <span className="today-end">–{item.end}</span> : null}</time>
    <div><strong>{item.studentId && !item.isGroup ? <Link to={`/students/${item.studentId}`}>{item.studentName}</Link> : item.studentName}</strong>
      <small>{[showTeacher ? item.teacher : '', item.place, item.marked ? item.status : ''].filter(Boolean).join(' · ')}</small></div>
    {PHASE[item.phase] ? <Badge tone={PHASE[item.phase][0]}>{PHASE[item.phase][1]}</Badge> : <span />}
    {item.phase === 'cancelled' ? <span /> : <Link className="today-start" to={item.path} title="Avab tunni kalendris, kus „Alusta tundi” kutsub õpilase tundi">{item.online ? <Video size={15} aria-hidden="true" /> : null}{item.phase === 'past' ? 'Ava tund' : 'Alusta tundi'}</Link>}
  </li>;
}

// „Täna”: the next lessons ahead; „Näita kõiki” opens the rest of the day, the lessons over stay folded
export function TodayTimeline({ lessons = [], allTeachers = false }) {
  const [all, setAll] = useState(false);
  const { ahead, done, next, total } = timelineSplit(lessons);
  const shown = all ? ahead : next;
  return <Card className="calm-card calm-today" as="section" aria-label="Täna">
    <div className="calm-card__head"><h2><CalendarDays size={17} aria-hidden="true" /> Täna{allTeachers ? <small> · kõik õpetajad</small> : null}</h2><Link to="/calendar">Kalender →</Link></div>
    {!lessons.length ? <p className="calm-empty">Täna tunde ei ole.</p> : <>
      {shown.length ? <ul className="today-lessons">{shown.map((item) => <LessonRow key={item.key} item={item} showTeacher={allTeachers} />)}</ul>
        : <p className="calm-empty">Tänased tunnid on läbi.</p>}
      {all && done.length ? <details className="calm-done">
        <summary>Läbi ({done.length})</summary>
        <ul className="today-lessons">{done.map((item) => <LessonRow key={item.key} item={item} showTeacher={allTeachers} />)}</ul>
      </details> : null}
      <div className="calm-today__foot">
        {!all && done.length ? <span>Läbi {done.length}</span> : <span />}
        {ahead.length > next.length || (done.length && !all) ? <button type="button" className="calm-link" onClick={() => setAll((value) => !value)} aria-expanded={all}>{all ? 'Näita vähem' : `Näita kõiki (${total})`}</button> : null}
      </div>
    </>}
  </Card>;
}

export function HomeworkPanel({ queue }) {
  if (!queue) return <Pending />;
  return <>
    <div className="today-numbers">
      <div><strong>{queue.waiting}</strong><small>ootab kontrolli</small></div>
      <div><strong>{queue.overdue}</strong><small>tähtaeg möödas ({HOMEWORK_WINDOW_DAYS} päeva)</small></div>
    </div>
    {queue.byTeacher.length ? <table className="today-table" aria-label="Kodutööd õpetajate kaupa">
      <thead><tr><th>Õpetaja</th><th>Kontrolli</th><th>Hilinenud</th></tr></thead>
      <tbody>{queue.byTeacher.map((row) => <tr key={row.teacher}><td>{row.teacher}</td><td>{row.waiting}</td><td>{row.overdue}</td></tr>)}</tbody>
    </table> : <p className="form-hint">Kõik esitatud tööd on kontrollitud ja tähtajad peetud.</p>}
    <p className="form-hint"><Link to="/homework">Ava Kodutööd →</Link></p>
  </>;
}

export function LeadsPanel({ leads, failed = false }) {
  if (failed) return <Failed />;
  if (!leads) return <Pending label="Laen…" />;
  return <>
    {!leads.length ? <p className="form-hint">Kõik päringud on käsitletud.</p> : <ul className="today-list">
      {leads.slice(0, 8).map((lead) => <li key={lead.id}>
        <div><strong>{lead.name || 'Nimeta'}</strong><small>{[lead.source === 'level-test' ? 'Tasemetest' : lead.source === 'availability' ? 'Sobivad ajad' : 'Veebivorm', lead.language, waited(lead.days)].filter(Boolean).join(' · ')}</small></div>
        <Badge tone={lead.days != null && lead.days >= 2 ? 'warning' : 'info'}>Uus</Badge>
      </li>)}
    </ul>}
    <p className="form-hint">{leads.length > 8 ? `+ veel ${leads.length - 8} · ` : ''}<Link to="/leads">Ava päringud →</Link></p>
  </>;
}

// paid lessons running out: admin and accountant only (owner 2026-11-02)
export function BalancePanel({ runningOut, isAdmin = false, journalMissing = false }) {
  if (!runningOut) return <Pending />;
  return <>
    {!runningOut.length ? <p className="form-hint">Kõigil on makstud tunde piisavalt.</p> : <ul className="today-list">
      {runningOut.slice(0, 12).map((item) => <li key={item.key}>
        <div><strong>{isAdmin ? <Link to={`/students/${item.studentId}`}>{item.studentName}</Link> : item.studentName}{item.subject ? ` · ${item.subject}` : ''}</strong>
          <small>{item.kind === 'package'
            ? (item.owed ? `Pakett läbi · ${tunde(item.owed)} ootab tasumist` : item.left <= 0 ? 'Pakett läbi' : `Paketist alles ${tunde(item.left)}`)
            : (item.left <= 0 ? `Kuuarvetega makstud tunnid on otsas${item.planned ? ` · kuu lõpuni plaanis ${tunde(item.planned)}` : ''}` : `Alles ${tunde(item.left)} · kuu lõpuni plaanis ${tunde(item.planned)}`)}</small></div>
        <Badge tone={item.owed || item.left <= 0 ? 'danger' : 'warning'}>{item.kind === 'package' ? 'Pakett' : 'Kuuarve'}</Badge>
      </li>)}
    </ul>}
    {runningOut.length > 12 ? <p className="form-hint">+ veel {runningOut.length - 12}</p> : null}
    {isAdmin && journalMissing ? <p className="form-hint">Kuuarvete jääk puudub: tunnipäevikut ei saanud laadida.</p> : null}
    <p className="form-hint">Näevad ainult administraator ja raamatupidaja.</p>
  </>;
}

// „Vajab kõnet” with „Helistasin”: a short note goes to studentFollowups and the student moves to the called list
export function CallsPanel({ calls, user, onCalled, save }) {
  const [open, setOpen] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  if (!calls) return <Pending />;

  async function saveCall(entry) {
    setSaving(true); setError('');
    try {
      const record = await save({ student: entry.student, note, reasons: entry.reasons }, user);
      onCalled(record);
      setOpen(''); setNote('');
    } catch (problem) {
      setError(problem?.message || 'Salvestamine ebaõnnestus.');
    } finally { setSaving(false); }
  }

  return <>
    <p className="form-hint">Märgid viimase {CALL_WINDOW_DAYS} päeva jooksul.</p>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {!calls.list.length ? <p className="form-hint">Praegu ei vaja keegi kõnet.</p> : <ul className="today-calls">
      {calls.list.slice(0, 10).map((entry) => <li key={entry.student.id}>
        <div className="today-calls__who"><strong><Link to={`/students/${entry.student.id}`}>{entry.student.name || 'Õpilane'}</Link></strong>
          <small>{entry.student.teacher || 'Õpetaja määramata'}{entry.student.phone ? ` · ${entry.student.phone}` : ''}{entry.call ? ` · viimati helistatud ${shortDay(entry.call.at)}` : ''}</small>
          <ul className="today-reasons">{entry.reasons.map((reason) => <li key={reason.code}>{reason.text}</li>)}</ul></div>
        {open === entry.student.id ? <form className="today-call-form" onSubmit={(event) => { event.preventDefault(); saveCall(entry); }}>
          <Input aria-label="Märkus kõne kohta" id={`call-note-${entry.student.id}`} value={note} maxLength={FOLLOWUP_NOTE_MAX} placeholder="Lühike märkus (nt ema helistab tagasi)" onChange={(event) => setNote(event.target.value)} autoFocus />
          <Button type="submit" loading={saving}>Salvesta</Button>
          <Button type="button" variant="secondary" disabled={saving} onClick={() => { setOpen(''); setNote(''); }}>Loobu</Button>
        </form> : <Button type="button" variant="secondary" disabled={saving} onClick={() => { setOpen(entry.student.id); setNote(''); setError(''); }}>Helistasin</Button>}
      </li>)}
    </ul>}
    {calls.list.length > 10 ? <p className="form-hint">+ veel {calls.list.length - 10} õpilast</p> : null}
    {calls.called.length ? <details className="today-called">
      <summary>Helistatud viimase {CALLED_DAYS} päeva jooksul ({calls.called.length})</summary>
      <ul>{calls.called.map((entry) => <li key={entry.student.id}><Link to={`/students/${entry.student.id}`}>{entry.student.name}</Link> <span>{shortDay(entry.call.at)}{entry.call.byName ? ` · ${entry.call.byName}` : ''}{entry.call.note ? ` — ${entry.call.note}` : ''}</span></li>)}</ul>
    </details> : null}
  </>;
}
