import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { useAuth } from '../../app/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { studentsService } from '../../services/firebase/students.js';
import { websiteLeadsService } from '../../services/firebase/websiteLeads.js';
import { leadStudentIds } from '../calendar/leadTimes.js';
import { leadToStudent } from './leadToStudent.js';
import './leads.css';
import PollGrid from '../availability-poll/PollGrid.jsx';
import { cellsOf, summaryOf } from '../availability-poll/pollModel.js';
import '../availability-poll/availabilityPoll.css';

const POLL_DAYS = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' };
const POLL_DAY_NAMES = { Mon: 'Esmaspäev', Tue: 'Teisipäev', Wed: 'Kolmapäev', Thu: 'Neljapäev', Fri: 'Reede', Sat: 'Laupäev', Sun: 'Pühapäev' };

const STATUS = { new: 'Uus', contacted: 'Ühendust võetud', converted: 'Õppijaks saanud', closed: 'Suletud' };

// createdAt is an ISO time from the website form: a Tallinn date and time; a bare date or anything else is shown as it is
function arrivedAt(value) {
  const date = new Date(value || '');
  if (!/T/.test(String(value || '')) || Number.isNaN(date.getTime())) return value || '—';
  return date.toLocaleString('et-EE', { timeZone: 'Europe/Tallinn', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function LeadsPage({ service = websiteLeadsService, studentRepository = studentsService }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('open');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const state = useAsyncData(() => service.list(), [service]);
  // an /ajad answer from a student who already has a card: show the card (its times are used in the calendar)
  const studentsState = useAsyncData(() => studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true }).then((result) => result.items).catch(() => []), [studentRepository]);
  const cardsOf = (lead) => (lead.source === 'availability' ? leadStudentIds(lead, studentsState.data || []).map((id) => (studentsState.data || []).find((student) => student.id === id)).filter(Boolean) : []);
  const leads = useMemo(() => (state.data || []).filter(lead => filter === 'all' || (filter === 'open' ? !['converted', 'closed'].includes(lead.status) : lead.status === filter)), [state.data, filter]);
  const changeStatus = async (lead, status) => {
    setBusy(lead.id);
    setError('');
    let saved = false;
    // a failed save used to leave the button spinning back with no word: say it, the lead stays as it was
    try { await service.updateStatus(lead.id, status, user); saved = true; state.reload(); } catch (failure) { setError(`${lead.name || 'Päring'}: ei õnnestunud salvestada (${failure.message || 'viga'}). Proovi uuesti.`); } finally { setBusy(''); }
    return saved;
  };
  // „Õppijaks” used to change only the status: now it also opens the new student card filled from the lead
  const convert = async (lead) => {
    if (await changeStatus(lead, 'converted')) navigate('/students', { state: { newStudent: leadToStudent(lead) } });
  };
  return <div className="page-content leads-page">
    <PageHeader eyebrow="Müük" title="Veebipäringud" description="Kodulehe registreerumised ja tasemetesti tulemused ühes tööjärjekorras." />
    <div className="leads-filters" role="tablist" aria-label="Päringute filter">
      {[['open', 'Aktiivsed'], ['new', 'Uued'], ['contacted', 'Ühendust võetud'], ['converted', 'Õppijad'], ['closed', 'Suletud'], ['all', 'Kõik']].map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={filter === id} className={filter === id ? 'is-active' : ''} onClick={() => setFilter(id)}>{label}</button>)}
    </div>
    {error ? <p className="action-error" role="alert">{error}<button type="button" aria-label="Sulge teade" onClick={() => setError('')}>×</button></p> : null}
    {state.loading ? <LoadingState label="Laen päringuid…" /> : state.error ? <ErrorState message={state.error.message} onRetry={state.reload} /> : !leads.length ? <Card><EmptyState title="Selles vaates päringuid pole" description="Uued veebivormi ja tasemetesti päringud ilmuvad siia automaatselt." /></Card> : <div className="leads-list">
      {leads.map(lead => <Card key={lead.id} className="lead-row" data-entity="lead" data-lead-id={lead.id} data-email={lead.email || undefined} data-phone={lead.phone || undefined} data-entity-title={lead.name || undefined}>
        <div className="lead-row__main">
          <div className="lead-row__head"><strong>{lead.name}</strong><Badge>{STATUS[lead.status] || lead.status}</Badge><Badge>{lead.source === 'level-test' ? 'Tasemetest' : lead.source === 'availability' ? 'Sobivad ajad' : 'Veebivorm'}</Badge></div>
          <div className="lead-row__contact">{lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : null}{lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : null}</div>
          <dl>{lead.parentName ? <><dt>Lapsevanem</dt><dd>{lead.parentName}</dd></> : lead.adult ? <><dt>Lapsevanem</dt><dd>— täiskasvanud õpilane</dd></> : null}{lead.source === 'availability' ? (lead.language ? <><dt>Õppeaine</dt><dd>{lead.language}</dd></> : null) : <><dt>Keel ja tase</dt><dd>{lead.language} · {lead.level}</dd></>}<dt>Saabus</dt><dd>{arrivedAt(lead.createdAt)}</dd>{cardsOf(lead).length ? <><dt>Õpilase kaart</dt><dd>{cardsOf(lead).map((student) => <Link key={student.id} to={`/students/${student.id}`}>{student.name}{student.subject ? ` (${student.subject})` : ''}</Link>).reduce((list, item, index) => (index ? [...list, ', ', item] : [item]), [])} · ajad on kalendris</dd></> : null}{lead.assessment ? <><dt>Test</dt><dd>{lead.assessment.score}/100 · {lead.assessment.answered} vastust · {lead.assessment.diagnosticId}</dd></> : null}{lead.message ? <><dt>{lead.source === 'availability' ? 'Kommentaar' : 'Eesmärk'}</dt><dd>{lead.message}</dd></> : null}{lead.source === 'availability' && lead.lessonsPerWeek ? <><dt>Tunde nädalas</dt><dd>{lead.lessonsPerWeek || 1} · {lead.format === 'online' ? 'veebis' : lead.format === 'kohapeal' ? 'kohapeal' : 'veebis või kohapeal'}</dd></> : null}</dl>
          {lead.source === 'availability' && lead.slots?.length ? (() => {
            const cells = cellsOf(lead.slots, lead.preferred);
            return <div className="lead-row__poll">
              <ul className="lead-row__times">{summaryOf(cells).map((row) => <li key={row.day}><b>{POLL_DAY_NAMES[row.day]}</b> {row.ranges.join(', ')}{row.best.length ? <em> · ★ {row.best.join(', ')}</em> : null}</li>)}</ul>
              <PollGrid cells={cells} dayNames={POLL_DAYS} label={`${lead.name}: sobivad ajad`} />
              <small>✓ sobib · ★ sobib kõige paremini</small>
            </div>;
          })() : null}
        </div>
        <div className="lead-row__actions">
          {lead.status === 'new' ? <Button loading={busy === lead.id} data-entity-action="contacted" onClick={() => changeStatus(lead, 'contacted')}>Märgi kontakteerituks</Button> : null}
          {!['converted', 'closed'].includes(lead.status) ? <Button variant="secondary" disabled={Boolean(busy)} data-entity-action="convert" onClick={() => convert(lead)}>Õppijaks</Button> : null}
          {/* „Suletud”: no answer, not interested or a duplicate — the status existed, the button did not */}
          {!['converted', 'closed'].includes(lead.status) ? <Button variant="secondary" disabled={Boolean(busy)} data-entity-action="close" onClick={() => changeStatus(lead, 'closed')}>Sulge</Button> : null}
          {lead.status === 'closed' ? <Button variant="secondary" disabled={Boolean(busy)} data-entity-action="reopen" onClick={() => changeStatus(lead, 'contacted')}>Ava uuesti</Button> : null}
        </div>
      </Card>)}
    </div>}
  </div>;
}
