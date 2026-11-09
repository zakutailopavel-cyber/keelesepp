import { askConfirm } from '../../components/ui/ConfirmHost.jsx';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { unmarkedLessonsService } from '../../services/firebase/unmarkedLessons.js';
import { ROLES } from '../../utils/roles.js';
import { toIsoDate } from './calendarView.js';
import { REVIEW_DAYS, actionError, summarizeUnmarked } from './unmarkedLessons.js';
import { onLessonMarked } from './lessonActions.js';
import './unmarkedLessons.css';

const dayLabel = (iso) => new Intl.DateTimeFormat('et-EE', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(new Date(`${iso}T12:00:00`));
const lessonPath = (item) => `/calendar?lesson=${encodeURIComponent(`${item.occurrenceId}|${item.occurrenceDate}`)}`;
const STATUS_LABEL = { Toimunud: 'Toimunud', Puudus_p: 'Puudus, teatas', Puudus_eta: 'Puudus, ei teatanud' };
const KINDS = [
  { id: '', label: 'Kõik' },
  { id: 'evidence', label: 'Live-tund leitud' },
  { id: 'duplicate', label: 'Tõenäoliselt topelt' },
  { id: 'teacher', label: 'Õpetaja otsustab' },
];

function evidenceLine(session) {
  const what = session.sources.includes('recording') && session.sources.includes('summary') ? 'Live-tund ja salvestus'
    : session.sources.includes('recording') ? 'Salvestus' : 'Live-tund';
  const when = session.endTime ? `${session.time}–${session.endTime}` : session.time;
  return `${what} ${dayLabel(session.date)} kell ${when}${session.teacherName ? ` · ${session.teacherName}` : ''}`;
}
function duplicateLine(twin) {
  if (twin.source === 'planned') return `Samal päeval on teine kirje${twin.time ? ` kell ${twin.time}` : ''}, millel on Live-tund.`;
  return `Samal päeval on juba märgitud tund: ${STATUS_LABEL[twin.status] || twin.status}${twin.time ? ` kell ${twin.time}` : ''}${twin.teacher ? ` · ${twin.teacher}` : ''}.`;
}

// „Märkimata tunnid”: past lessons of the last 60 days without a mark, each with what the Live Classroom shows.
// An admin sees every teacher, a teacher his own. Marking uses the calendar's own path (completeFromSchedule), a
// leftover is cancelled through the calendar's cancel path (never deleted).
export default function UnmarkedLessonsPage({ repository = unmarkedLessonsService, today = toIsoDate() }) {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.roles?.includes(ROLES.ADMIN));
  const state = useAsyncData(() => repository.load({ user, isAdmin, today }), [repository, user?.uid, isAdmin, today]);
  const [done, setDone] = useState(() => new Map());
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [kind, setKind] = useState('');
  const [teacher, setTeacher] = useState('');
  // marked in the side drawer (right-click → „Ava tund (siinsamas)”, owner 2026-11-09): the row moves to „done” here too
  useEffect(() => onLessonMarked((occurrenceId) => setDone((current) => {
    const item = (state.data?.items || []).find((entry) => entry.occurrenceId === occurrenceId);
    return item ? new Map(current).set(occurrenceId, `${item.studentName || 'Õpilane'} ${dayLabel(item.occurrenceDate)}: märgitud paneelis`) : current;
  })), [state.data]);

  const open = useMemo(() => (state.data?.items || []).filter((item) => !done.has(item.occurrenceId)), [state.data, done]);
  const teachers = useMemo(() => [...new Set(open.map((item) => item.teacher || 'Õpetaja määramata'))].sort((a, b) => a.localeCompare(b, 'et')), [open]);
  const inTeacher = useMemo(() => open.filter((item) => !teacher || (item.teacher || 'Õpetaja määramata') === teacher), [open, teacher]);
  const shown = useMemo(() => inTeacher.filter((item) => !kind || item.kind === kind), [inTeacher, kind]);
  const counts = summarizeUnmarked(inTeacher);
  const finished = [...done.values()];

  async function run(item, key, action, label, fallback) {
    setBusy(`${item.occurrenceId}|${key}`);
    setError('');
    try {
      await action();
      setDone((current) => new Map(current).set(item.occurrenceId, `${item.studentName || 'Õpilane'} ${dayLabel(item.occurrenceDate)}: ${label}`));
    } catch (problem) {
      setError(`${item.studentName || 'Õpilane'} ${dayLabel(item.occurrenceDate)}: ${actionError(problem, fallback)}`);
    } finally {
      setBusy('');
    }
  }
  const mark = (item, status) => run(item, status, () => repository.mark(item, user, status), STATUS_LABEL[status], 'Märkimine ebaõnnestus.');
  const cancel = async (item) => {
    if (!(await askConfirm(item.recurring ? 'Tühistada ainult see tund? Järgmised jäävad alles.' : 'Kas tühistada see tund?'))) return;
    const event = (state.data?.schedule || []).find((entry) => entry.id === item.id) || item;
    run(item, 'cancel', () => repository.cancel(item, event), 'tühistatud', 'Tühistamine ebaõnnestus.');
  };
  const isBusy = (item, key) => busy === `${item.occurrenceId}|${key}`;

  const header = <PageHeader eyebrow="Kalender" title="Märkimata tunnid" compact
    description={`Viimase ${REVIEW_DAYS} päeva tunnid (kuni eilseni), millel pole märget. Märkimata tund ei jõua arvele ega õpilase ajalukku.`}
    actions={<Link className="button button--secondary" to="/calendar">Ava kalender</Link>} />;
  if (state.loading && !state.data) return <>{header}<LoadingState label="Otsin märkimata tunde…" /></>;
  if (state.error) return <>{header}<ErrorState message={actionError(state.error, 'Tunde ei saanud laadida.')} onRetry={state.reload} /></>;

  return <>
    {header}
    <Card className="unmarked-page">
      <div className="unmarked-page__filters" role="group" aria-label="Näita">
        {KINDS.map((option) => {
          const count = option.id ? counts[option.id] : counts.total;
          return <button key={option.id || 'all'} type="button" className={`unmarked-chip${kind === option.id ? ' is-on' : ''}`} aria-pressed={kind === option.id} onClick={() => setKind(option.id)}>{option.label} <span>{count}</span></button>;
        })}
        {isAdmin && teachers.length > 1 ? <select className="cal2-select" aria-label="Õpetaja" value={teacher} onChange={(event) => setTeacher(event.target.value)}>
          <option value="">Kõik õpetajad</option>
          {teachers.map((name) => <option key={name} value={name}>{name}</option>)}
        </select> : null}
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {finished.length ? <p className="form-hint" role="status">Tehtud: {finished.slice(-3).join(' · ')}{finished.length > 3 ? ` (+${finished.length - 3})` : ''}</p> : null}
      {!shown.length ? <EmptyState title={open.length ? 'Selles valikus pole tunde' : 'Kõik tunnid on märgitud'} description={open.length ? 'Vali teine filter.' : `Viimase ${REVIEW_DAYS} päeva tunnid on päevikus.`} /> : null}
      <ul className="unmarked-page__list">
        {shown.map((item) => <li key={item.occurrenceId} className={`unmarked-row unmarked-row--${item.kind}`} data-entity="lesson" data-schedule-id={item.id} data-date={item.occurrenceDate} data-student-id={item.studentId || undefined} data-entity-title={`${item.time ? `${item.time} · ` : ''}${item.studentName || 'Tund'}`}>
          <div className="unmarked-row__who">
            <strong>{item.studentName || 'Õpilane'}</strong>
            <small>{dayLabel(item.occurrenceDate)}{item.time ? ` · ${item.time}` : ''}{item.duration ? ` · ${item.duration} min` : ''}{isAdmin ? ` · ${item.teacher || 'Õpetaja määramata'}` : ''}{item.recurring ? ' · sari' : ''}</small>
          </div>
          <div className="unmarked-row__why">
            {item.kind === 'evidence' ? <><Badge tone="success">Live-tund leitud</Badge><small>{evidenceLine(item.evidence)}</small></> : null}
            {item.kind === 'duplicate' ? <><Badge tone="danger">Tõenäoliselt topelt</Badge><small>{duplicateLine(item.duplicateOf)}</small></> : null}
            {item.kind === 'teacher' ? <><Badge tone="neutral">Õpetaja otsustab</Badge><small>Live-tundi ega salvestust ei leitud.</small></> : null}
          </div>
          <div className="unmarked-row__actions">
            {item.kind === 'evidence' ? <Button loading={isBusy(item, 'Toimunud')} disabled={Boolean(busy)} data-entity-action="done" onClick={() => mark(item, 'Toimunud')}>Märgi toimunuks</Button> : null}
            {item.kind === 'duplicate' ? <Button variant="danger" loading={isBusy(item, 'cancel')} disabled={Boolean(busy)} onClick={() => cancel(item)}>Tühista</Button> : null}
            {item.kind === 'teacher' ? <>
              <Button loading={isBusy(item, 'Toimunud')} disabled={Boolean(busy)} data-entity-action="done" onClick={() => mark(item, 'Toimunud')}>Toimus</Button>
              <Button variant="secondary" loading={isBusy(item, 'Puudus_p')} disabled={Boolean(busy)} onClick={() => mark(item, 'Puudus_p')}>Puudus (teatas)</Button>
              <Button variant="secondary" loading={isBusy(item, 'Puudus_eta')} disabled={Boolean(busy)} onClick={() => mark(item, 'Puudus_eta')}>Puudus (ei teatanud)</Button>
            </> : null}
            <Link to={lessonPath(item)}>Ava kalendris</Link>
          </div>
        </li>)}
      </ul>
    </Card>
  </>;
}
