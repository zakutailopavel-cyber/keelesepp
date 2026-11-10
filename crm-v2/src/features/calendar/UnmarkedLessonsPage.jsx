import { askConfirm } from '../../components/ui/ConfirmHost.jsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, Modal, PageHeader } from '../../components/ui/index.js';
import { unmarkedLessonsService } from '../../services/firebase/unmarkedLessons.js';
import { ROLES } from '../../utils/roles.js';
import { toIsoDate } from './calendarView.js';
import { EXCLUSION_REASONS, actionError, groupByDay, seriesEndDate, startLabel, summarizeUnmarked } from './unmarkedLessons.js';
import { onLessonMarked } from './lessonActions.js';
import { useEntityChanged } from '../../components/entityDrawer/useEntityChanged.js';
import QuickMarkButtons, { MarkUndoToast } from './QuickMarkButtons.jsx';
import { MARK_LABELS, useMarkUndo } from './quickMark.js';
import { financeApi } from '../../services/firebase/financeApi.js';
import LessonCashButton from '../cash/LessonCashButton.jsx';
import { canMarkLessonCash, lessonCashLessonId } from '../cash/lessonCash.js';
import { useLessonCashMarks } from '../cash/useLessonCashMarks.js';
import './unmarkedLessons.css';

const dayLabel = (iso) => new Intl.DateTimeFormat('et-EE', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(new Date(`${iso}T12:00:00`));
const longDay = (iso) => new Intl.DateTimeFormat('et-EE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${iso}T12:00:00`));
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

// one row per calendar entry of „Vajab admini” (a weekly series lists all its occurrences once)
function adminGroups(items = []) {
  const byEntry = new Map();
  items.forEach((item) => {
    const key = `${item.id}|${item.reason}`;
    const current = byEntry.get(key);
    byEntry.set(key, current ? { ...current, dates: [...current.dates, item.occurrenceDate] } : { item, reason: item.reason, dates: [item.occurrenceDate] });
  });
  return [...byEntry.values()].map((group) => ({ ...group, dates: group.dates.sort() })).sort((a, b) => a.dates[0].localeCompare(b.dates[0]));
}

/**
 * „Märkimata tunnid” (owner 2026-11-09, phone-first): the counted unmarked lessons (features/calendar/unmarkedLessons.js
 * markingSplit — from MARKING_START up to yesterday), oldest first and grouped by day, each with ≥ 44 px „Toimus ✓” /
 * „Puudus ▾” buttons, a 5-second undo after every tap and „Märgi kõik selle päeva tunnid toimunuks” (a confirm list,
 * then one mark after another through the same action). An admin sees every teacher, the Live Classroom's evidence,
 * „Märgi Live-tunnid toimunuks”, „Vajab admini” (excluded entries with a reason and a fix) and the small
 * „Vanemad (enne 1.11)” link; a teacher only his own counted lessons.
 */
export default function UnmarkedLessonsPage({ repository = unmarkedLessonsService, today = toIsoDate(), cashApi = financeApi }) {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.roles?.includes(ROLES.ADMIN));
  // „Makstud sularahas” (owner 2026-11-10): the lesson's own teacher (or an admin) marks cash taken for it
  const [cashMarks, setCashMark] = useLessonCashMarks(cashApi, Boolean(cashApi));
  const [searchParams, setSearchParams] = useSearchParams();
  const older = isAdmin && searchParams.get('vanemad') === '1';
  const [state, setState] = useState({ loading: true, error: null, data: null, evidence: false });
  const [round, setRound] = useState(0);
  const reload = useCallback(() => setRound((value) => value + 1), []);
  // rows first (calendar + marks), the Live Classroom evidence a moment later (owner 2026-11-09: faster load)
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => {
      if (alive) setState((current) => ({ ...current, loading: true, error: null }));
      return repository.load({ user, isAdmin, today, older, withEvidence: !repository.withEvidence });
    })
      .then((data) => {
        if (!alive) return;
        setState({ loading: false, error: null, data, evidence: !repository.withEvidence });
        if (repository.withEvidence) {
          repository.withEvidence({ user, isAdmin, today, older, loaded: data })
            .then((next) => { if (alive) setState({ loading: false, error: null, data: next, evidence: true }); })
            .catch(() => { if (alive) setState((current) => ({ ...current, evidence: true })); });
        }
      })
      .catch((error) => { if (alive) setState((current) => ({ ...current, loading: false, error })); });
    return () => { alive = false; };
  }, [repository, user?.uid, isAdmin, today, older, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [done, setDone] = useState(() => new Map());
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [kind, setKind] = useState('');
  const [teacher, setTeacher] = useState('');
  const [undo, setUndo] = useMarkUndo();
  const [bulk, setBulk] = useState(null); // { title, items } waiting for the confirm list
  const [bulkRun, setBulkRun] = useState(null); // { done, total }
  const [assign, setAssign] = useState(null); // { group, teacherId }
  const items = state.data?.items;
  // marked in the side drawer (right-click → „Ava tund (siinsamas)”): the row moves to „done” here too
  useEffect(() => onLessonMarked((occurrenceId) => setDone((current) => {
    const item = (items || []).find((entry) => entry.occurrenceId === occurrenceId);
    return item ? new Map(current).set(occurrenceId, `${item.studentName || 'Õpilane'} ${dayLabel(item.occurrenceDate)}: märgitud paneelis`) : current;
  })), [items]);
  // a mark fixed or removed in the drawer: read the list again in place — the rows stay, the filters are kept
  useEntityChanged('lesson', (change) => { if (change.change !== 'marked') reload(); });

  const open = useMemo(() => (items || []).filter((item) => !done.has(item.occurrenceId)), [items, done]);
  const teachers = useMemo(() => [...new Set(open.map((item) => item.teacher || 'Õpetaja määramata'))].sort((a, b) => a.localeCompare(b, 'et')), [open]);
  const inTeacher = useMemo(() => open.filter((item) => !teacher || (item.teacher || 'Õpetaja määramata') === teacher), [open, teacher]);
  const shown = useMemo(() => inTeacher.filter((item) => !kind || item.kind === kind), [inTeacher, kind]);
  const days = useMemo(() => groupByDay(shown), [shown]);
  const counts = summarizeUnmarked(inTeacher);
  const liveRows = inTeacher.filter((item) => item.kind === 'evidence');
  const adminRows = useMemo(() => (isAdmin && !older ? adminGroups((state.data?.adminItems || []).filter((item) => !done.has(`admin:${item.id}`))) : []), [isAdmin, older, state.data, done]);
  const staff = useMemo(() => (state.data?.context?.staff || []).filter((person) => !person.disabled && !person.deletedAt && !person.purgedAt && (person.role === 'teacher' || person.role === 'admin')), [state.data]);

  const label = (item, status) => `${item.studentName || 'Õpilane'} ${dayLabel(item.occurrenceDate)}: ${MARK_LABELS[status] || status}`;
  // one mark through the calendar's own path; → the record (or null on an error, which is shown)
  async function markOne(item, status) {
    const record = await repository.mark(item, user, status);
    setDone((current) => new Map(current).set(item.occurrenceId, label(item, status)));
    return record;
  }
  async function mark(item, status) {
    setBusy(`${item.occurrenceId}|${status}`);
    setError('');
    try {
      const record = await markOne(item, status);
      if (record?.id && repository.unmark) {
        setUndo({ label: label(item, status), run: async () => {
          await repository.unmark(record, user, { recurring: item.recurring });
          setDone((current) => { const next = new Map(current); next.delete(item.occurrenceId); return next; });
        } });
      }
    } catch (problem) {
      setError(`${item.studentName || 'Õpilane'} ${dayLabel(item.occurrenceDate)}: ${actionError(problem, 'Märkimine ebaõnnestus.')}`);
    } finally {
      setBusy('');
    }
  }
  // the confirmed list, one after another (never parallel: each goes through the same transaction as a single tap)
  async function runBulk() {
    const list = bulk.items;
    setBulk(null);
    setError('');
    setBulkRun({ done: 0, total: list.length });
    for (const [index, item] of list.entries()) {
      try {
        await markOne(item, 'Toimunud');
      } catch (problem) {
        setError(`${item.studentName || 'Õpilane'} ${dayLabel(item.occurrenceDate)}: ${actionError(problem, 'Märkimine ebaõnnestus.')} Ülejäänud jäid märkimata.`);
        break;
      }
      setBulkRun({ done: index + 1, total: list.length });
    }
    setBulkRun(null);
  }
  const cancel = async (item) => {
    if (!(await askConfirm(item.recurring ? 'Tühistada ainult see tund? Järgmised jäävad alles.' : 'Kas tühistada see tund?'))) return;
    const event = (state.data?.schedule || []).find((entry) => entry.id === item.id) || item;
    setBusy(`${item.occurrenceId}|cancel`);
    setError('');
    try {
      await repository.cancel(item, event);
      setDone((current) => new Map(current).set(item.occurrenceId, `${item.studentName || 'Õpilane'} ${dayLabel(item.occurrenceDate)}: tühistatud`));
    } catch (problem) {
      setError(`${item.studentName || 'Õpilane'} ${dayLabel(item.occurrenceDate)}: ${actionError(problem, 'Tühistamine ebaõnnestus.')}`);
    } finally { setBusy(''); }
  };
  // „Lõpeta sari”: asks, writes the end date, offers the undo for 5 s (and the old end date stays on the entry)
  const endSeries = async (group) => {
    const raw = (state.data?.schedule || []).find((entry) => entry.id === group.item.id) || group.item;
    const endDate = seriesEndDate(group.item, group.dates.map((date) => ({ id: group.item.id, occurrenceDate: date })));
    if (!endDate) return;
    if (!(await askConfirm(`Lõpetan ${group.item.studentName || 'õpilase'} iganädalase sarja (${group.item.teacher || 'õpetaja määramata'}, ${group.item.time || ''}) kuupäevaga ${dayLabel(endDate)}. Tunnid alates ${dayLabel(group.dates[0])} kaovad kalendrist, märkeid ei muudeta. Saad selle kohe tagasi võtta.`, { confirmLabel: 'Lõpeta sari' }))) return;
    setBusy(`admin:${group.item.id}`);
    setError('');
    try {
      const { previous } = await repository.endSeries(raw, endDate, user);
      setDone((current) => new Map(current).set(`admin:${group.item.id}`, `${group.item.studentName || 'Sari'}: sari lõpetatud`));
      setUndo({ label: `${group.item.studentName || 'Sari'}: sari lõpetatud`, run: async () => {
        await repository.restoreSeriesEnd(raw, previous);
        setDone((current) => { const next = new Map(current); next.delete(`admin:${group.item.id}`); return next; });
      } });
    } catch (problem) { setError(actionError(problem, 'Sarja ei saanud lõpetada.')); } finally { setBusy(''); }
  };
  const saveTeacher = async () => {
    const { group, teacherId } = assign;
    const chosen = staff.find((person) => person.id === teacherId);
    if (!chosen) return;
    setAssign(null);
    setBusy(`admin:${group.item.id}`);
    setError('');
    try {
      await repository.assignTeacher(group.item, { id: chosen.id, name: chosen.displayName || chosen.name || '' });
      setDone((current) => new Map(current).set(`admin:${group.item.id}`, `${group.item.studentName || 'Tund'}: õpetaja ${chosen.displayName || chosen.name}`));
      reload();
    } catch (problem) { setError(actionError(problem, 'Õpetajat ei saanud määrata.')); } finally { setBusy(''); }
  };
  const isBusy = (item, key) => busy === `${item.occurrenceId}|${key}`;
  const rowBusy = (item) => (busy.startsWith(`${item.occurrenceId}|`) ? busy.split('|')[1] : '');
  const anyBusy = Boolean(busy) || Boolean(bulkRun);

  const header = <PageHeader eyebrow="Kalender" title={older ? `Vanemad märkimata tunnid (enne ${startLabel()})` : 'Märkimata tunnid'} compact
    description={older
      ? `Tunnid enne ${startLabel()}, mida praegu ei loeta (omaniku otsus). Neid ei ole muudetud ega kustutatud.`
      : `Tunnid alates ${startLabel()} kuni eilseni, millel pole märget. Märkimata tund ei jõua arvele ega õpilase ajalukku.`}
    actions={<>{older ? <Button variant="secondary" onClick={() => setSearchParams({})}>Tagasi</Button> : null}<Link className="button button--secondary" to="/calendar">Ava kalender</Link></>} />;
  if (state.loading && !state.data) return <>{header}<LoadingState label="Otsin märkimata tunde…" /></>;
  if (state.error && !state.data) return <>{header}<ErrorState message={actionError(state.error, 'Tunde ei saanud laadida.')} onRetry={reload} /></>;
  const finished = [...done.values()];

  return <>
    {header}
    <Card className="unmarked-page">
      <div className="unmarked-page__filters" role="group" aria-label="Näita">
        {isAdmin ? KINDS.map((option) => {
          const count = option.id ? counts[option.id] : counts.total;
          return <button key={option.id || 'all'} type="button" className={`unmarked-chip${kind === option.id ? ' is-on' : ''}`} aria-pressed={kind === option.id} onClick={() => setKind(option.id)}>{option.label} <span>{count}</span></button>;
        }) : <strong className="unmarked-page__total">{counts.total} märkimata {counts.total === 1 ? 'tund' : 'tundi'}</strong>}
        {isAdmin && teachers.length > 1 ? <select className="cal2-select" aria-label="Õpetaja" value={teacher} onChange={(event) => setTeacher(event.target.value)}>
          <option value="">Kõik õpetajad</option>
          {teachers.map((name) => <option key={name} value={name}>{name}</option>)}
        </select> : null}
      </div>
      {isAdmin && liveRows.length ? <div className="unmarked-page__bulk">
        <Button disabled={anyBusy} onClick={() => setBulk({ title: 'Märgi Live-tunnid toimunuks', items: liveRows })}>Märgi Live-tunnid toimunuks ({liveRows.length})</Button>
        <small>Tunnid, mille kohta Live Classroomis on tund või salvestus.</small>
      </div> : null}
      {!state.evidence ? <p className="form-hint" role="status">Otsin Live-tunde…</p> : null}
      {bulkRun ? <p className="form-hint" role="status">Märgin… {bulkRun.done}/{bulkRun.total}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {finished.length ? <p className="form-hint" role="status">Tehtud: {finished.slice(-3).join(' · ')}{finished.length > 3 ? ` (+${finished.length - 3})` : ''}</p> : null}
      {!shown.length ? <EmptyState title={open.length ? 'Selles valikus pole tunde' : 'Kõik tunnid on märgitud'} description={open.length ? 'Vali teine filter.' : `Tunnid alates ${startLabel()} on päevikus.`} /> : null}
      {days.map((day) => {
        const markable = day.items.filter((item) => item.kind !== 'duplicate');
        return <section key={day.date} className="unmarked-day" aria-label={longDay(day.date)}>
          <div className="unmarked-day__head">
            <h2>{longDay(day.date)} <span>{day.items.length}</span></h2>
            {markable.length > 1 ? <Button variant="secondary" className="unmarked-day__all" disabled={anyBusy} onClick={() => setBulk({ title: `Märgi kõik ${longDay(day.date)} tunnid toimunuks`, items: markable })}>Märgi kõik selle päeva tunnid toimunuks</Button> : null}
          </div>
          <ul className="unmarked-page__list">
            {day.items.map((item) => <li key={item.occurrenceId} className={`unmarked-row unmarked-row--${item.kind}`} data-entity="lesson" data-schedule-id={item.id} data-date={item.occurrenceDate} data-student-id={item.studentId || undefined} data-entity-title={`${item.time ? `${item.time} · ` : ''}${item.studentName || 'Tund'}`}>
              <div className="unmarked-row__who">
                <strong>{item.time ? `${item.time} · ` : ''}{item.studentName || 'Õpilane'}</strong>
                <small>{[item.duration ? `${item.duration} min` : '', isAdmin ? item.teacher || 'Õpetaja määramata' : '', item.recurring ? 'sari' : ''].filter(Boolean).join(' · ')}</small>
              </div>
              {isAdmin || item.kind !== 'teacher' ? <div className="unmarked-row__why">
                {item.kind === 'evidence' ? <><Badge tone="success">Live-tund leitud</Badge><small>{evidenceLine(item.evidence)}</small></> : null}
                {item.kind === 'duplicate' ? <><Badge tone="danger">Tõenäoliselt topelt</Badge><small>{duplicateLine(item.duplicateOf)}</small></> : null}
                {item.kind === 'teacher' && state.evidence ? <><Badge tone="neutral">Õpetaja otsustab</Badge><small>Live-tundi ega salvestust ei leitud.</small></> : null}
              </div> : null}
              <div className="unmarked-row__actions">
                {item.kind === 'duplicate' ? <Button variant="danger" className="unmarked-row__cancel" loading={isBusy(item, 'cancel')} disabled={anyBusy} onClick={() => cancel(item)}>Tühista</Button> : null}
                <QuickMarkButtons item={item} busy={rowBusy(item)} disabled={anyBusy} onMark={mark} />
                {cashApi && item.kind !== 'duplicate' && canMarkLessonCash(item, { uid: user?.uid, isAdmin })
                  ? <LessonCashButton item={item} api={cashApi} mark={cashMarks[lessonCashLessonId(item)] || null} onChanged={setCashMark} alsoMark={mark} disabled={anyBusy} /> : null}
                <Link to={lessonPath(item)}>Ava</Link>
              </div>
            </li>)}
          </ul>
        </section>;
      })}
      {isAdmin && !older && state.data?.olderCount ? <p className="unmarked-page__older"><Link to="?vanemad=1" onClick={(event) => { event.preventDefault(); setSearchParams({ vanemad: '1' }); }}>Vanemad (enne {startLabel()}): {state.data.olderCount}</Link></p> : null}
    </Card>
    {adminRows.length ? <Card className="unmarked-admin" as="section" aria-label="Vajab admini">
      <h2>Vajab admini <span>{adminRows.length}</span></h2>
      <p className="form-hint">Need tunnid ei ole õpetajate nimekirjas ega loendis: kalendrikirjel on viga. Paranda kirje, siis kaob ka märge „märkimata”.</p>
      <ul className="unmarked-page__list">
        {adminRows.map((group) => {
          const { item, reason } = group;
          const key = `admin:${item.id}`;
          const canEnd = item.recurring && reason !== 'period-closed';
          const canAssign = reason === 'no-teacher' || reason === 'teacher-gone';
          return <li key={`${item.id}|${reason}`} className="unmarked-row unmarked-row--admin">
            <div className="unmarked-row__who">
              <strong>{item.studentName || 'Õpilane'}</strong>
              <small>{[item.recurring ? `sari, ${item.time || ''}` : item.time, item.teacher || 'Õpetaja määramata', `${group.dates.length} ${group.dates.length === 1 ? 'tund' : 'tundi'}: ${group.dates.slice(0, 3).map(dayLabel).join(', ')}${group.dates.length > 3 ? ' …' : ''}`].filter(Boolean).join(' · ')}</small>
            </div>
            <div className="unmarked-row__why"><Badge tone="warning">{EXCLUSION_REASONS[reason]}</Badge></div>
            <div className="unmarked-row__actions">
              {canEnd ? <Button variant="secondary" loading={busy === key} disabled={anyBusy} onClick={() => endSeries(group)}>Lõpeta sari</Button> : null}
              {canAssign ? <Button variant="secondary" disabled={anyBusy || !staff.length} onClick={() => setAssign({ group, teacherId: '' })}>Määra õpetaja</Button> : null}
              {reason === 'student-archived' && !item.recurring ? <Button variant="secondary" disabled={anyBusy} onClick={() => cancel(item)}>Tühista</Button> : null}
              {reason === 'period-closed' ? <Link to="/finance">Paranda Finantsides</Link> : <Link to={lessonPath(item)}>Ava</Link>}
            </div>
          </li>;
        })}
      </ul>
    </Card> : null}

    <Modal open={Boolean(bulk)} title={bulk?.title || ''} onClose={() => setBulk(null)} footer={<><Button variant="secondary" onClick={() => setBulk(null)}>Loobu</Button><Button onClick={runBulk}>Märgi {bulk?.items.length || 0} tundi toimunuks</Button></>}>
      {bulk ? <>
        <p>Need tunnid märgitakse „Toimunud” (arvele ja õpilase ajalukku). Üks kaupa, sama teed kui ühe tunni märkimine; vale märke saad hiljem kalendris parandada („Paranda märge”).</p>
        <ul className="unmarked-confirm" aria-label="Märgitavad tunnid">{bulk.items.map((item) => <li key={item.occurrenceId}>{dayLabel(item.occurrenceDate)} {item.time} · <b>{item.studentName || 'Õpilane'}</b>{isAdmin ? ` · ${item.teacher || 'Õpetaja määramata'}` : ''}</li>)}</ul>
      </> : null}
    </Modal>
    <Modal open={Boolean(assign)} title="Määra õpetaja" onClose={() => setAssign(null)} footer={<><Button variant="secondary" onClick={() => setAssign(null)}>Loobu</Button><Button disabled={!assign?.teacherId} onClick={saveTeacher}>Salvesta</Button></>}>
      {assign ? <>
        <p>{assign.group.item.studentName || 'Õpilane'}: {assign.group.item.recurring ? 'kogu sari' : 'see tund'} saab õpetaja. Tunnid jäävad märkimata, kuni õpetaja need märgib.</p>
        <select className="cal2-select" aria-label="Õpetaja" value={assign.teacherId} onChange={(event) => setAssign({ ...assign, teacherId: event.target.value })}>
          <option value="">Vali õpetaja</option>
          {staff.map((person) => <option key={person.id} value={person.id}>{person.displayName || person.name || person.email}</option>)}
        </select>
      </> : null}
    </Modal>
    <MarkUndoToast undo={undo} onClose={() => setUndo(null)} onError={(problem) => setError(actionError(problem, 'Tagasivõtmine ebaõnnestus.'))} />
  </>;
}
