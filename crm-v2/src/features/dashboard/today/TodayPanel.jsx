import { CalendarDays, ClipboardCheck, Inbox, PhoneCall, Video, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Input } from '../../../components/ui/index.js';
import { useAsyncData } from '../../../hooks/useAsyncData.js';
import { homeworkService } from '../../../services/firebase/homework.js';
import { lessonsService } from '../../../services/firebase/lessons.js';
import { revenuePlansService } from '../../../services/firebase/revenuePlans.js';
import { websiteLeadsService } from '../../../services/firebase/websiteLeads.js';
import { lessonTokensService } from '../../../services/firebase/lessonTokens.js';
import { presenceService } from '../../../services/firebase/presence.js';
import { FOLLOWUP_NOTE_MAX, studentFollowupsService } from '../../../services/firebase/studentFollowups.js';
import { CALL_WINDOW_DAYS, CALLED_DAYS, addDays, homeworkQueue, lessonsRunningOut, needsCall, newLeads, tallinnClock, todayLessons } from './todayModel.js';
import './today.css';

const HOMEWORK_WINDOW_DAYS = 30;
const api = {
  lessons: () => lessonsService.listForCalendar({}),
  seen: (students) => presenceService.forStudents(students),
  plans: () => revenuePlansService.list(),
  packages: () => lessonTokensService.listCountedPackages(),
  owed: () => lessonTokensService.listOwed(),
  leads: () => websiteLeadsService.listNew(),
  worksheetsDue: (from, to) => homeworkService.listWorksheetAssignmentsDueBetween(from, to),
  followups: (from) => studentFollowupsService.listSince(from),
  addFollowup: (input, user) => studentFollowupsService.add(input, user),
};

const tunde = (n) => `${String(n).replace('.', ',')} ${Number(n) === 1 ? 'tund' : 'tundi'}`;
const shortDay = (iso) => (iso ? new Intl.DateTimeFormat('et-EE', { day: 'numeric', month: 'numeric', timeZone: 'Europe/Tallinn' }).format(new Date(iso)) : '');
const waited = (days) => (days == null ? '' : days === 0 ? 'täna' : days === 1 ? 'eile' : `${days} päeva tagasi`);
const PHASE = { now: ['success', 'Käib'], past: ['neutral', 'Läbi'], cancelled: ['danger', 'Tühistatud'] };

// one source that fails leaves its own section empty with a note, never the whole panel
const optional = (read, fallback = null) => Promise.resolve().then(read).catch(() => fallback);

function Section({ icon: Icon, title, eyebrow, link, className = '', children }) {
  return <Card className={`today-card ${className}`}>
    <div className="section-heading"><div>{eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}<h2><Icon size={18} aria-hidden="true" /> {title}</h2></div>{link}</div>
    {children}
  </Card>;
}
const Failed = () => <p className="form-hint">Andmeid ei saanud praegu laadida.</p>;

// „Täna” (admin start page, 2026-11-04): the day on one screen — today's lessons, works waiting for review and overdue
// homework per teacher, paid lessons running out, new website enquiries and the students who need a call. The
// dashboard's own reads (calendar, cards, homework, submissions, invoices) are passed in; this panel adds only a few
// narrow ones. An accountant (finance) sees only the lesson packages running out: lessons left are for the admin and
// the accountant only (owner 2026-11-02), and the journal and the cards are not hers to read.
export default function TodayPanel({ user, isAdmin = false, canViewBalance = false, students = [], events = [], homework = [], submissions = [], invoices = [], today, repository = api, unmarkedCount, now = () => new Date() }) {
  const clock = tallinnClock(now());
  const state = useAsyncData(async () => {
    const callFrom = addDays(today, -Math.max(CALL_WINDOW_DAYS, HOMEWORK_WINDOW_DAYS));
    const [lessons, seen, plans, packages, owed, leads, worksheets, followups] = await Promise.all([
      isAdmin ? optional(() => repository.lessons()) : null,
      isAdmin ? optional(() => repository.seen(students), new Map()) : new Map(),
      isAdmin ? optional(() => repository.plans()) : [],
      canViewBalance ? optional(() => repository.packages()) : [],
      canViewBalance ? optional(() => repository.owed(), []) : [],
      isAdmin ? optional(() => repository.leads()) : [],
      isAdmin ? optional(() => repository.worksheetsDue(callFrom, addDays(today, -1))) : [],
      isAdmin ? optional(() => repository.followups(addDays(today, -CALLED_DAYS)), []) : [],
    ]);
    return { lessons, seen, plans, packages, owed, leads, worksheets, followups };
  }, [repository, today, isAdmin, canViewBalance, students]);
  const [added, setAdded] = useState([]);
  const [open, setOpen] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const data = state.data;
  const lessonsToday = useMemo(() => (isAdmin ? todayLessons({ events, today, now: clock }) : []), [isAdmin, events, today, clock]);
  const queue = useMemo(() => (isAdmin && data ? homeworkQueue({ submissions, homework, worksheets: data.worksheets || [], students, today, windowDays: HOMEWORK_WINDOW_DAYS }) : null), [isAdmin, data, submissions, homework, students, today]);
  const runningOut = useMemo(() => (canViewBalance && data ? lessonsRunningOut({
    students: isAdmin ? students : [],
    plans: isAdmin && data.lessons ? data.plans || [] : [],
    invoices,
    lessons: data.lessons || [],
    events,
    packages: data.packages || [],
    owed: data.owed || [],
    today,
  }) : []), [canViewBalance, isAdmin, data, students, invoices, events, today]);
  const leads = useMemo(() => (data?.leads ? newLeads(data.leads, today) : []), [data, today]);
  const calls = useMemo(() => (isAdmin && data ? needsCall({ students, lessons: data.lessons || [], homework, worksheets: data.worksheets || [], events, seen: data.seen || new Map(), followups: [...(data.followups || []), ...added], today, now: now().getTime() }) : null), [isAdmin, data, students, homework, events, added, today]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAdmin && !canViewBalance) return null;

  async function saveCall(entry) {
    setSaving(true); setError('');
    try {
      const record = await repository.addFollowup({ student: entry.student, note, reasons: entry.reasons }, user);
      setAdded((current) => [...current, record]);
      setOpen(''); setNote('');
    } catch (problem) {
      setError(problem?.message || 'Salvestamine ebaõnnestus.');
    } finally { setSaving(false); }
  }

  const balanceCard = <Section icon={Wallet} eyebrow="Ainult administraator ja raamatupidaja" title="Makstud tunnid lõppevad" className="today-card--balance">
    {!data ? <p className="form-hint">Arvutan…</p> : !runningOut.length ? <p className="form-hint">Kõigil on makstud tunde piisavalt.</p> : <ul className="today-list">
      {runningOut.slice(0, 8).map((item) => <li key={item.key}>
        <div><strong>{isAdmin ? <Link to={`/students/${item.studentId}`}>{item.studentName}</Link> : item.studentName}{item.subject ? ` · ${item.subject}` : ''}</strong>
          <small>{item.kind === 'package'
            ? (item.owed ? `Pakett läbi · ${tunde(item.owed)} ootab tasumist` : item.left <= 0 ? 'Pakett läbi' : `Paketist alles ${tunde(item.left)}`)
            : (item.left <= 0 ? `Kuuarvetega makstud tunnid on otsas${item.planned ? ` · kuu lõpuni plaanis ${tunde(item.planned)}` : ''}` : `Alles ${tunde(item.left)} · kuu lõpuni plaanis ${tunde(item.planned)}`)}</small></div>
        <Badge tone={item.owed || item.left <= 0 ? 'danger' : 'warning'}>{item.kind === 'package' ? 'Pakett' : 'Kuuarve'}</Badge>
      </li>)}
    </ul>}
    {runningOut.length > 8 ? <p className="form-hint">+ veel {runningOut.length - 8}</p> : null}
    {isAdmin && data && !data.lessons ? <p className="form-hint">Kuuarvete jääk puudub: tunnipäevikut ei saanud laadida.</p> : null}
  </Section>;

  if (!isAdmin) return <section className="today-desk" aria-label="Täna"><div className="today-desk__grid">{balanceCard}</div></section>;

  return <section className="today-desk" aria-label="Täna">
    <div className="today-desk__head">
      <div><span className="eyebrow">Täna · kõik õpetajad</span><h2>Päev ühe pilguga</h2></div>
      {/* „Märkimata tunnid” lives in its own card (calendar/UnmarkedLessonsCard); a count shows here when one is passed */}
      <a className="today-chip" href="#markimata-tunnid">Märkimata tunnid{Number.isFinite(unmarkedCount) ? <b>{unmarkedCount}</b> : null}</a>
    </div>
    <div className="today-desk__grid">
      <Section icon={CalendarDays} title={`Tänased tunnid (${lessonsToday.filter((item) => item.phase !== 'cancelled').length})`} className="today-card--wide" link={<Link to="/calendar">Ava kalender →</Link>}>
        {!lessonsToday.length ? <p className="form-hint">Täna tunde ei ole.</p> : <ul className="today-lessons">
          {lessonsToday.map((item) => <li key={item.key} className={`is-${item.phase}`}>
            <time>{item.time}{item.end ? `–${item.end}` : ''}</time>
            <div><strong>{item.studentId && !item.isGroup ? <Link to={`/students/${item.studentId}`}>{item.studentName}</Link> : item.studentName}</strong>
              <small>{item.teacher}{item.place ? ` · ${item.place}` : ''}{item.marked ? ` · ${item.status}` : ''}</small></div>
            {PHASE[item.phase] ? <Badge tone={PHASE[item.phase][0]}>{PHASE[item.phase][1]}</Badge> : <span />}
            {item.phase === 'cancelled' ? <span /> : <Link className="today-start" to={item.path} title="Avab tunni kalendris, kus „Alusta tundi” kutsub õpilase tundi">{item.online ? <Video size={15} aria-hidden="true" /> : null}{item.phase === 'past' ? 'Ava tund' : 'Alusta tundi'}</Link>}
          </li>)}
        </ul>}
      </Section>

      <Section icon={ClipboardCheck} title="Kodutööd" link={<Link to="/homework">Kodutööd →</Link>}>
        {!data ? <p className="form-hint">Arvutan…</p> : <>
          <div className="today-numbers">
            <div><strong>{queue.waiting}</strong><small>ootab kontrolli</small></div>
            <div><strong>{queue.overdue}</strong><small>tähtaeg möödas ({HOMEWORK_WINDOW_DAYS} päeva)</small></div>
          </div>
          {queue.byTeacher.length ? <table className="today-table" aria-label="Kodutööd õpetajate kaupa">
            <thead><tr><th>Õpetaja</th><th>Kontrolli</th><th>Hilinenud</th></tr></thead>
            <tbody>{queue.byTeacher.map((row) => <tr key={row.teacher}><td>{row.teacher}</td><td>{row.waiting}</td><td>{row.overdue}</td></tr>)}</tbody>
          </table> : <p className="form-hint">Kõik esitatud tööd on kontrollitud ja tähtajad peetud.</p>}
          {!data.worksheets ? <p className="form-hint">Töölehtede tähtaegu ei saanud laadida — hilinenud on ainult kodutööd.</p> : null}
        </>}
      </Section>

      <Section icon={Inbox} title={`Uued veebipäringud${leads.length ? ` (${leads.length})` : ''}`} link={<Link to="/leads">Päringud →</Link>}>
        {!data ? <p className="form-hint">Laen…</p> : !data.leads ? <Failed /> : !leads.length ? <p className="form-hint">Kõik päringud on käsitletud.</p> : <ul className="today-list">
          {leads.slice(0, 5).map((lead) => <li key={lead.id}>
            <div><strong>{lead.name || 'Nimeta'}</strong><small>{[lead.source === 'level-test' ? 'Tasemetest' : lead.source === 'availability' ? 'Sobivad ajad' : 'Veebivorm', lead.language, waited(lead.days)].filter(Boolean).join(' · ')}</small></div>
            <Badge tone={lead.days != null && lead.days >= 2 ? 'warning' : 'info'}>Uus</Badge>
          </li>)}
        </ul>}
        {leads.length > 5 ? <p className="form-hint">+ veel {leads.length - 5}</p> : null}
      </Section>

      {balanceCard}

      <Section icon={PhoneCall} eyebrow={`Viimased ${CALL_WINDOW_DAYS} päeva`} title={`Vajab kõnet${calls?.list.length ? ` (${calls.list.length})` : ''}`} className="today-card--wide">
        {!calls ? <p className="form-hint">Arvutan…</p> : <>
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
        </>}
      </Section>
    </div>
  </section>;
}
