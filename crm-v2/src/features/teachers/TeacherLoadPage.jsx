import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { teacherLoadService } from '../../services/firebase/teacherLoad.js';
import { ROLES } from '../../utils/roles.js';
import { shiftDate } from '../calendar/calendarView.js';
import { shiftMonth } from '../finance/monthlyBilling.js';
import { FREE_DAYS, REVIEW_DUE_DAYS, loadTotals, periodRange, tallinnClock, tallinnDay, teacherLoad } from './teacherLoad.js';
import './teacherLoad.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);
const dayLabel = (iso) => new Intl.DateTimeFormat('et-EE', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(new Date(`${iso}T12:00:00`));
const hours = (value) => `${String(value).replace('.', ',')} h`;
const daysLabel = (days) => (days === 1 ? '1 päev' : `${days} päeva`);

function PayCell({ row, running }) {
  if (!row.pay.rateCents) return <span className="teacher-load__muted" title="Õpetaja tunnitasu pole määratud (Palk ja kulud)">määramata</span>;
  return <span>{money(row.pay.payCents)}{running && row.pay.forecastCents > row.pay.payCents ? <small>prognoos {money(row.pay.forecastCents)}</small> : null}<small>{money(row.pay.rateCents)}/h</small></span>;
}

// „Õpetajate koormus”: one row per teacher for a week or a month (administrator only; teacherLoad.js has the rules)
export default function TeacherLoadPage({ repository = teacherLoadService, now = new Date() }) {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.roles?.includes(ROLES.ADMIN));
  const today = tallinnDay(now);
  const nowClock = tallinnClock(now);
  const [mode, setMode] = useState('month');
  const [anchor, setAnchor] = useState(today);
  const [open, setOpen] = useState('');
  const period = useMemo(() => periodRange(mode, anchor), [mode, anchor]);
  const state = useAsyncData(() => (isAdmin ? repository.load({ period, today }) : Promise.resolve(null)), [repository, isAdmin, period.from, period.to, today]);
  const rows = useMemo(() => (state.data ? teacherLoad({ ...state.data, period, today, nowClock }) : []), [state.data, period, today, nowClock]);
  const totals = useMemo(() => loadTotals(rows), [rows]);

  if (!isAdmin) return <ErrorState title="Ainult administraatorile" message="Õpetajate koormust näeb ainult administraator." />;
  const move = (step) => setAnchor((current) => (mode === 'week' ? shiftDate(current, step * 7) : `${shiftMonth(current.slice(0, 7), step)}-01`));
  const running = period.to >= today;
  const toggle = (id) => setOpen((current) => (current === id ? '' : id));

  return <div className="page-content teacher-load">
    <Link className="back-link" to="/teachers"><ArrowLeft size={17} /> Tagasi õpetajate juurde</Link>
    <PageHeader eyebrow="Meeskond · ainult administraatorile" title="Õpetajate koormus" description="Iga õpetaja tunnid, vabad ajad, kontrollimata tööd ja töötasu hinnang valitud nädalal või kuul." />
    <Card className="teacher-load__toolbar">
      <div className="teacher-load__modes" role="group" aria-label="Periood">
        <button type="button" className={mode === 'week' ? 'is-on' : ''} aria-pressed={mode === 'week'} onClick={() => { setMode('week'); setAnchor(today); }}>Nädal</button>
        <button type="button" className={mode === 'month' ? 'is-on' : ''} aria-pressed={mode === 'month'} onClick={() => { setMode('month'); setAnchor(today); }}>Kuu</button>
      </div>
      <div className="teacher-load__nav">
        <Button variant="secondary" aria-label="Eelmine" onClick={() => move(-1)}><ChevronLeft size={16} /></Button>
        <strong aria-live="polite">{period.label}</strong>
        <Button variant="secondary" aria-label="Järgmine" onClick={() => move(1)}><ChevronRight size={16} /></Button>
        {period.from > today || period.to < today ? <Button variant="secondary" onClick={() => setAnchor(today)}>Täna</Button> : null}
      </div>
    </Card>
    {state.loading && !state.data ? <LoadingState label="Arvutan koormust…" /> : state.error ? <ErrorState message={state.error.message} onRetry={state.reload} /> : !rows.length ? <EmptyState title="Õpetajaid ei leitud" /> : <>
      <div className="teacher-load__totals" aria-label="Kokku">
        <div><span>Toimunud</span><strong>{totals.held}</strong><small>{hours(totals.hours)}</small></div>
        <div><span>Planeeritud</span><strong>{totals.planned}</strong></div>
        <div><span>Tühistatud / puudus</span><strong>{totals.cancelled} / {totals.absences}</strong></div>
        <div><span>Märkimata (60 p)</span><strong>{totals.unmarked}</strong></div>
        <div><span>Ootab kontrolli</span><strong>{totals.waiting}</strong>{totals.overdue ? <small>{totals.overdue} üle {REVIEW_DUE_DAYS} päeva</small> : null}</div>
        <div><span>Töötasu hinnang</span><strong>{money(totals.payCents)}</strong>{totals.unrated.length ? <small>määramata: {totals.unrated.length}</small> : null}</div>
      </div>
      {state.data?.reviewsFailed ? <p className="action-error" role="status">Kontrollimata töid ei õnnestunud lugeda — veerg „Ootab kontrolli” näitab 0.</p> : null}
      <div className="teacher-load__wrap"><table className="teacher-load__table" aria-label="Õpetajate koormus">
        <thead><tr><th>Õpetaja</th><th className="num">Õpilasi</th><th className="num">Toimunud</th><th className="num">Tunde</th><th className="num">Planeeritud</th><th className="num">Tühistatud</th><th className="num">Puudumised</th><th className="num">Märkimata</th><th className="num">Vabad ajad</th><th className="num">Ootab kontrolli</th><th className="num">Töötasu</th></tr></thead>
        <tbody>{rows.map((row) => <Fragment key={row.id}>
          <tr className={open === row.id ? 'is-open' : ''}>
            <td data-label="Õpetaja"><Link to={`/teachers/${row.id}`}><strong>{row.name}</strong></Link></td>
            <td className="num" data-label="Aktiivseid õpilasi">{row.students}</td>
            <td className="num" data-label="Toimunud">{row.held}</td>
            <td className="num" data-label="Antud tunde">{hours(row.hours)}</td>
            <td className="num" data-label="Planeeritud">{row.planned}</td>
            <td className="num" data-label="Tühistatud">{row.cancelled}</td>
            <td className="num" data-label="Puudumised">{row.absences}{row.absences ? <small>{row.absentNotified} teatas · {row.absentUnnotified} ei teatanud</small> : null}</td>
            <td className="num" data-label="Märkimata (60 p)">{row.unmarked ? <Link to="/calendar/markimata" className="teacher-load__warn">{row.unmarked}</Link> : 0}</td>
            <td className="num" data-label={`Vabad ajad (${FREE_DAYS} p)`}>{row.free.hasAvailability
              ? <button type="button" className="teacher-load__expand" aria-expanded={open === row.id} onClick={() => toggle(row.id)}>{row.free.count} {open === row.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
              : <span className="teacher-load__muted" title="Õpetaja pole kalendris vabu aegu märkinud">märkimata</span>}</td>
            <td className="num" data-label="Ootab kontrolli">{row.reviews.waiting ? <Link to="/homework" className={row.reviews.overdue ? 'teacher-load__warn' : ''}>{row.reviews.waiting}</Link> : 0}{row.reviews.waiting ? <small>vanim {daysLabel(row.reviews.oldestDays)}{row.reviews.overdue ? ` · ${row.reviews.overdue} hilinenud` : ''}</small> : null}</td>
            <td className="num" data-label="Töötasu hinnang"><PayCell row={row} running={running} /></td>
          </tr>
          {open === row.id ? <tr className="teacher-load__detail"><td colSpan={11}>
            <strong>Broneerimata vabad ajad järgmise {FREE_DAYS} päeva jooksul</strong>
            {row.free.windows.length ? <ul>{row.free.windows.map((item) => <li key={`${item.date}-${item.start}`}>{dayLabel(item.date)} · {item.start}–{item.end}{item.online ? ' · ainult veebis' : ''}{item.slots ? ` · ${item.slots} × 60 min` : ''}</li>)}</ul> : <p className="form-hint">Kõik märgitud vabad ajad on tundidega täis.</p>}
          </td></tr> : null}
        </Fragment>)}</tbody>
      </table></div>
      <p className="form-hint">„Toimunud” ja „Tunde”: märgitud tunnid (ka kooli kulul), grupitund üks kord. „Planeeritud”: perioodi tunnid tänasest edasi. „Puudumised”: õpilane puudus (teatas / ei teatanud). „Märkimata”: möödunud tunnid viimase 60 päeva jooksul ilma märketa (sama mis „Märkimata tunnid”). „Vabad ajad”: rohelised ja kollased ajad kalendris, mis ei ole tunniga kaetud — arv = mitu 60-minutilist tundi mahub. „Ootab kontrolli”: esitatud töölehed ja harjutused ilma tagasisideta (viimased 180 päeva); hilinenud = ootab üle {REVIEW_DUE_DAYS} päeva. „Töötasu”: sama reegel mis „Ärinäitajad” — õpetaja tunnitasu (Palk ja kulud) × antud tunnid (toimunud, märkimata, kooli kulul, ette teatamata puudumine); kui tunnitasu pole määratud, on „määramata”. Kinnitatud tööaeg on lehel <Link to="/finance/payroll">Palk ja kulud</Link>.</p>
    </>}
  </div>;
}
