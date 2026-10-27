import { Phone, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Input, LoadingState, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { lessonsService, scheduleService, studentAvailabilityService, studentsService, websiteLeadsService } from '../../services/firebase/index.js';
import { toIsoDate } from '../calendar/calendarView.js';
import { timesFromLeads, withLeadTimes } from '../calendar/leadTimes.js';
import { AUDIENCES } from './groupFill.js';
import { INTEREST, contactRows, filterContacts } from './groupContacts.js';

const TONE = { '': 'neutral', offered: 'info', interested: 'success', declined: 'warning' };
const WHO = [['all', 'Kõik'], ['active', 'Praegused õpilased'], ['noLessons', 'Ilma tundide ja grupita'], ['former', 'Endised õpilased'], ['leads', 'Veebipäringud']];

/**
 * Grupid → „Kellele pakkuda grupitunde”: every learner the school knows (current and former cards, website enquiries)
 * with the age group, level, parent and contacts, lessons now and times, and the group offer status the admin keeps.
 * Selected student cards go into a group with the normal add-to-group action. Nobody is contacted automatically.
 */
export default function GroupContactsPanel({ groups = [], user, saving = '', onAddToGroup, repositories = {} }) {
  const { students = studentsService, leads = websiteLeadsService, schedule = scheduleService, lessons = lessonsService, times = studentAvailabilityService } = repositories;
  const state = useAsyncData(async () => {
    const settle = (load) => Promise.resolve().then(load).catch(() => []);
    const [active, archived, enquiries, events, journal, own] = await Promise.all([
      settle(() => students.list({ status: 'active', pageSize: 500, exhaustive: true }).then((result) => result.items || [])),
      settle(() => students.list({ status: 'archived', pageSize: 500, exhaustive: true }).then((result) => result.items || [])),
      settle(() => leads.list()), settle(() => schedule.list({})), settle(() => lessons.listForCalendar({})), settle(() => times.list(null)),
    ]);
    const cards = [...new Map([...active, ...archived].map((student) => [student.id, student])).values()];
    const studentTimes = withLeadTimes(new Map(own.map((entry) => [entry.studentId || entry.id, entry])), timesFromLeads(enquiries, active));
    return { cards, enquiries, events, journal, studentTimes };
  }, [students, leads, schedule, lessons, times]);
  const [filters, setFilters] = useState({ query: '', who: 'noLessons', audience: '', subject: '', level: '', interest: 'all' });
  const [picked, setPicked] = useState([]);
  const [target, setTarget] = useState('');
  const [interest, setInterest] = useState({});
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const rows = useMemo(() => (state.data ? contactRows({ students: state.data.cards, leads: state.data.enquiries, events: state.data.events, journal: state.data.journal, studentTimes: state.data.studentTimes, groups, today: toIsoDate() }) : []), [state.data, groups]);
  const withInterest = rows.map((row) => (interest[row.id] ? { ...row, interest: interest[row.id] } : row));
  const shown = filterContacts(withInterest, filters);
  const subjects = [...new Set(rows.flatMap((row) => row.subjects))].sort();
  const levels = [...new Set(rows.map((row) => row.level).filter(Boolean))].sort();
  const set = (patch) => setFilters((current) => ({ ...current, ...patch }));
  const toggle = (id) => setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const saveInterest = async (row, patch) => {
    const next = { ...(row.interest || {}), ...patch };
    setInterest((current) => ({ ...current, [row.id]: next }));
    setBusy(`interest:${row.id}`); setMessage('');
    try { await students.saveGroupInterest(row.id, next, user); } catch (error) { setMessage(error.message || 'Ei saanud salvestada.'); } finally { setBusy(''); }
  };
  const addPicked = async () => {
    const group = groups.find((item) => item.id === target);
    if (!group) return;
    const cards = picked.map((id) => state.data.cards.find((student) => student.id === id)).filter(Boolean);
    for (const student of cards) await onAddToGroup(group, student);
    setMessage(`${cards.length} õpilast lisati gruppi „${group.name}”.`);
    setPicked([]);
  };

  if (state.loading) return <Card><LoadingState label="Laen õpilasi ja peresid…" /></Card>;
  const pickedCards = picked.filter((id) => rows.some((row) => row.id === id && row.kind === 'student'));

  return (
    <Card className="group-contacts" role="region" aria-label="Kellele pakkuda grupitunde">
      <div className="section-heading"><div><span className="eyebrow">Grupi komplekteerimine</span><h2>Kellele pakkuda grupitunde</h2></div><UsersRound size={20} aria-hidden="true" /></div>
      <p className="form-hint">Kõik õpilased (ka endised) ja veebipäringud koos vanema kontaktidega. Märgi, kellele grupitundi pakuti ja mida vastati; vali õpilased ja lisa gruppi.</p>
      <div className="group-contacts__filters">
        <Input id="gc-query" label="Otsi" placeholder="Nimi, vanem, telefon, e-post" value={filters.query} onChange={(event) => set({ query: event.target.value })} />
        <Select id="gc-who" label="Kes" value={filters.who} onChange={(event) => set({ who: event.target.value })}>{WHO.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
        <Select id="gc-audience" label="Vanus" value={filters.audience} onChange={(event) => set({ audience: event.target.value })}><option value="">Kõik</option>{Object.entries(AUDIENCES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
        <Select id="gc-subject" label="Aine" value={filters.subject} onChange={(event) => set({ subject: event.target.value })}><option value="">Kõik</option>{subjects.map((subject) => <option key={subject}>{subject}</option>)}</Select>
        <Select id="gc-level" label="Tase" value={filters.level} onChange={(event) => set({ level: event.target.value })}><option value="">Kõik</option>{levels.map((level) => <option key={level}>{level}</option>)}</Select>
        <Select id="gc-interest" label="Pakkumine" value={filters.interest} onChange={(event) => set({ interest: event.target.value })}><option value="all">Kõik</option>{Object.entries(INTEREST).map(([value, label]) => <option key={value || 'none'} value={value}>{label}</option>)}</Select>
      </div>
      <div className="group-contacts__bar">
        <strong>{shown.length} inimest</strong>
        {pickedCards.length ? <span className="group-contacts__add">
          <Select id="gc-target" label="" aria-label="Grupp" value={target} onChange={(event) => setTarget(event.target.value)}><option value="">Vali grupp</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</Select>
          <Button disabled={!target || Boolean(saving)} onClick={addPicked}>Lisa {pickedCards.length} valitut gruppi</Button>
        </span> : null}
      </div>
      {message ? <p className="form-hint" role="status">{message}</p> : null}
      {shown.length ? <div className="group-contacts__list">{shown.slice(0, 200).map((row) => (
        <div className="group-contacts__row" key={`${row.kind}:${row.id}`}>
          {row.kind === 'student' ? <input type="checkbox" aria-label={`Vali ${row.name}`} checked={picked.includes(row.id)} onChange={() => toggle(row.id)} /> : <span />}
          <span className="group-contacts__who">
            <strong>{row.kind === 'student' ? <Link to={`/students/${row.id}`}>{row.name}</Link> : row.name}</strong>
            <small>{[row.age !== null ? `~${row.age} a` : row.audience === 'child' ? 'laps' : '', row.subjects.join(', '), row.level, row.kind === 'lead' ? `veebipäring ${row.createdAt || ''}` : row.active ? (row.lessonsAhead ? 'tunnid käivad' : 'tunde ees pole') : `endine${row.lastLesson ? ` · viimane tund ${row.lastLesson}` : ''}`, row.group ? `grupp: ${row.group}` : '', row.hasTimes ? 'ajad teada' : ''].filter(Boolean).join(' · ')}</small>
          </span>
          <span className="group-contacts__contact">
            {row.parentName ? <small>Vanem: {row.parentName}</small> : null}
            {row.phone ? <a href={`tel:${row.phone.replace(/\s/g, '')}`}><Phone size={13} /> {row.phone}</a> : null}
            {row.email ? <a href={`mailto:${row.email}`}>{row.email}</a> : null}
          </span>
          {row.kind === 'student' ? <span className="group-contacts__interest">
            <Select id={`gc-i-${row.id}`} label="" aria-label={`Pakkumine: ${row.name}`} value={row.interest?.status || ''} disabled={busy === `interest:${row.id}`} onChange={(event) => saveInterest(row, { status: event.target.value })}>
              {Object.entries(INTEREST).map(([value, label]) => <option key={value || 'none'} value={value}>{label}</option>)}
            </Select>
            <input className="field__input" aria-label={`Märkus: ${row.name}`} placeholder="Märkus" defaultValue={row.interest?.note || ''} onBlur={(event) => { if (event.target.value !== (row.interest?.note || '')) saveInterest(row, { note: event.target.value }); }} />
          </span> : <span className="group-contacts__interest"><Badge tone={TONE['']}>päring</Badge><Link to="/leads">Ava päringud</Link></span>}
        </div>
      ))}</div> : <EmptyState title="Selliseid inimesi ei leitud" description="Muuda filtreid." />}
    </Card>
  );
}
