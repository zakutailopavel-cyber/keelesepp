import { CalendarCheck, Copy, Shuffle, Trash2, UsersRound, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Modal } from '../../components/ui/index.js';
import { occurrencesForDates, shiftDate } from './calendarView.js';
import TimeGrid from './TimeGrid.jsx';
import { plannerBatchesService } from '../../services/firebase/plannerBatches.js';
import { assignRoom } from './roomModel.js';
import { DAY_LABELS, PLAN_DAYS, UNPLACED_TEXT, distribute, dragMarks, judgeAll, lessonPayload, moveDraft, nextMonday, openRequests, patternDates, placeRequest, planSummary, planningRequests, plannerContext, sortLessons } from './plannerModel.js';
import { dayOfDate, timesLine } from './studentTimesModel.js';

// „Planeerija” (owner 2026-10-25): plan the weekly timetable of all students at once (docs/specs/CALENDAR_V2_SPEC.md
// „Planeerija”). The draft lives in this browser (localStorage, per user) until „Kinnita ajakava” creates the lessons.
const STORE = (uid) => `keelesepp.planner.v1.${uid || 'user'}`;
const STATUS_TEXT = { best: '★ eelistatud aeg', ok: 'sobib', agree: 'Lepi õpilasega kokku', overlap: 'Kattub' };
const DURATIONS = [30, 45, 60, 75, 90, 120];
const dayName = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'long' });
const shortDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('et-EE', { day: 'numeric', month: 'numeric' });

function readDraft(storage, uid) {
  try { return JSON.parse(storage?.getItem(STORE(uid)) || 'null'); } catch { return null; }
}

export default function PlannerView({ user, teacherOnly = false, students = [], events = [], journal = [], teachers = [], studentTimes = new Map(), teacherAvailability = () => null, rooms = [], bookings = [], scheduleRepository, batchRepository = plannerBatchesService, today, narrow = false, initialTeacher = '', onClose, onSaved, storage = globalThis.localStorage }) {
  const [draft, setDraft] = useState(() => {
    const saved = readDraft(storage, user.uid);
    const base = { startDate: nextMonday(today), scope: teacherOnly ? user.uid : initialTeacher, includePlanned: false, requests: [], lessons: [], unplaced: [], viewTeacher: teacherOnly ? user.uid : initialTeacher, stale: false };
    return saved?.startDate ? { ...base, ...saved, ...(teacherOnly ? { scope: user.uid, viewTeacher: user.uid } : {}) } : base;
  });
  const [selectedId, setSelectedId] = useState('');
  const [pickedKey, setPickedKey] = useState('');
  const [dragging, setDragging] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try { storage?.setItem(STORE(user.uid), JSON.stringify({ ...draft, savedAt: new Date().toISOString() })); } catch { /* private window: the draft lives only in memory */ }
  }, [draft, storage, user.uid]);

  const { startDate, scope, includePlanned, requests, lessons, unplaced, viewTeacher } = draft;
  const update = (patch) => setDraft((current) => ({ ...current, ...(typeof patch === 'function' ? patch(current) : patch) }));
  const replacedIds = useMemo(() => requests.flatMap((request) => request.replaces || []), [requests]);
  const ctx = useMemo(() => plannerContext({ startDate, events, replacedIds, studentTimes, teacherTimes: teacherAvailability, rooms, bookings }),
    [startDate, events, replacedIds, studentTimes, teacherAvailability, rooms, bookings]);
  const judged = useMemo(() => judgeAll(ctx, lessons), [ctx, lessons]);
  const judgedById = new Map(judged.map((entry) => [entry.lesson.id, entry]));
  const open = openRequests(requests, lessons, unplaced);
  const summary = planSummary(judged, open);
  const requestOf = (key) => requests.find((request) => request.key === key);
  const teacherName = (uid) => teachers.find((teacher) => teacher.id === uid)?.name || (uid === user.uid ? user.displayName : '') || '';
  const viewTeachers = [...new Map(requests.filter((request) => request.teacherUid).map((request) => [request.teacherUid, request.teacher || teacherName(request.teacherUid)])).entries()]
    .concat(teachers.filter((teacher) => !requests.some((request) => request.teacherUid === teacher.id)).map((teacher) => [teacher.id, teacher.name]))
    .sort((a, b) => String(a[1]).localeCompare(String(b[1]), 'et'));

  // ── actions (nothing is written to the database here) ──────────
  const addAll = () => {
    const found = planningRequests({ students, events, today, teacherUid: scope, teachers, includePlanned, lessons: journal });
    const known = new Set(requests.map((request) => request.key));
    const added = found.filter((request) => !known.has(request.key));
    update({ requests: [...requests, ...added], stale: requests.length > 0 || draft.stale });
    setNotice(added.length ? `Lisatud ${added.length} õppesuunda${found.length > added.length ? ` (${found.length - added.length} oli juba plaanis)` : ''}. Vajuta „Jaota”.` : 'Uusi õppesuundi ei leitud: kõigil on korduv tund ees või nad on juba plaanis.');
    setError('');
  };
  const runDistribute = () => {
    const kept = lessons.filter((lesson) => lesson.pinned && requests.some((request) => request.key === lesson.key));
    const result = distribute(ctx, requests, kept);
    update({ lessons: result.lessons, unplaced: result.unplaced, stale: false });
    setSelectedId(''); setPickedKey('');
    setNotice(`Jaotatud: ${result.lessons.length} tundi${kept.length ? ` (${kept.length} käsitsi tõstetud jäid paigale)` : ''}.`);
  };
  const clearAll = () => {
    if (!globalThis.confirm('Tühjendan plaani (õppesuunad ja mustandtunnid)? Kalendris olevaid tunde see ei puuduta.')) return;
    update({ requests: [], lessons: [], unplaced: [], stale: false });
    setSelectedId(''); setPickedKey(''); setNotice('');
  };
  const setStart = (value) => {
    if (!value) return;
    const dates = patternDates(value);
    update((current) => ({ startDate: value, lessons: current.lessons.map((lesson) => ({ ...lesson, date: dates[PLAN_DAYS.indexOf(lesson.day)] })) }));
  };
  const changeRequest = (key, patch) => update((current) => ({
    requests: current.requests.map((request) => (request.key === key ? { ...request, ...patch } : request)),
    lessons: current.lessons.map((lesson) => (lesson.key === key ? { ...lesson, ...('duration' in patch ? { duration: patch.duration } : {}), ...('online' in patch ? { online: patch.online } : {}) } : lesson))
      .filter((lesson) => lesson.key !== key || !('perWeek' in patch) || current.lessons.filter((other) => other.key === key).indexOf(lesson) < patch.perWeek),
    stale: 'perWeek' in patch ? true : current.stale,
  }));
  const removeRequest = (key) => update((current) => ({ requests: current.requests.filter((request) => request.key !== key), lessons: current.lessons.filter((lesson) => lesson.key !== key), unplaced: current.unplaced.filter((entry) => entry.key !== key) }));
  const moveLesson = (id, at) => { update((current) => ({ lessons: moveDraft(ctx, current.lessons, id, at) })); };
  const placeAt = (key, at) => {
    const request = requestOf(key);
    if (!request) return;
    update((current) => ({ lessons: placeRequest(ctx, current.lessons, request, at) }));
    setPickedKey(''); setDragging(null);
  };
  const suggest = (key) => {
    const request = requestOf(key);
    if (!request) return;
    const result = distribute(ctx, [request], lessons);
    update({ lessons: result.lessons });
    setPickedKey('');
    if (result.unplaced.length) setNotice(`${request.studentName}: ${UNPLACED_TEXT[result.unplaced[0].reason]} — tõsta õpilane kalendrisse käsitsi.`);
  };
  const removeLesson = (id) => { update((current) => ({ lessons: current.lessons.filter((lesson) => lesson.id !== id) })); setSelectedId(''); };
  const resuggest = (lesson) => {
    const request = requestOf(lesson.key);
    if (!request) return;
    const rest = lessons.filter((other) => other.id !== lesson.id);
    const result = distribute(ctx, [{ ...request, perWeek: lessons.filter((other) => other.key === lesson.key).length }], rest);
    update({ lessons: result.lessons });
    setSelectedId('');
  };
  const copyLink = async () => {
    const link = `${globalThis.location?.origin || ''}/ajad`;
    try { await globalThis.navigator?.clipboard?.writeText(link); setCopied(true); } catch { globalThis.prompt?.('Kopeeri link', link); }
  };

  // ── „Kinnita ajakava” ─────────────────────────────────────────
  const openConfirm = () => {
    setError('');
    setConfirm({ checks: Object.fromEntries(judged.map((entry) => [entry.lesson.id, !entry.flagged])), endOld: true });
  };
  const chosen = confirm ? judged.filter((entry) => confirm.checks[entry.lesson.id]) : [];
  const ending = confirm ? [...new Set(chosen.flatMap((entry) => requestOf(entry.lesson.key)?.replaces || []))] : [];
  const runConfirm = async () => {
    setSaving(true); setError('');
    const endingIds = confirm.endOld ? ending : [];
    let roomBookings = bookings.filter((booking) => !endingIds.includes(booking.scheduleId));
    // one id per „Kinnita” click: every lesson carries it, and (administrator) plannerBatches/{id} lists them afterwards
    let batchId = '';
    try { batchId = batchRepository?.newId?.() || ''; } catch { batchId = ''; }
    if (!batchId) batchId = `pb${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const created = [];
    const createdIds = [];
    const failed = [];
    for (const { lesson } of chosen) {
      try {
        const candidate = lessonPayload(lesson, { batchId });
        let room = assignRoom(rooms, roomBookings, { ...candidate, startDate: candidate.date });
        if (room.error && candidate.roomId) room = assignRoom(rooms, roomBookings, { ...candidate, roomId: '', startDate: candidate.date });
        if (room.error) throw new Error(room.error);
        Object.assign(candidate, room);
        const saved = await scheduleRepository.create(candidate);
        created.push(lesson.id);
        if (saved?.id) createdIds.push(saved.id);
        if (room.roomId) roomBookings = [...roomBookings, { scheduleId: saved?.id || lesson.id, roomId: room.roomId, recurring: true, startDate: candidate.date, date: candidate.date, day: dayOfDate(candidate.date), time: candidate.time, duration: candidate.duration, excludedDates: [], status: 'Planeeritud' }];
      } catch (problem) { failed.push(`${lesson.studentName} (${DAY_LABELS[lesson.day]} ${lesson.time}): ${problem.message || 'ei salvestunud'}`); }
    }
    // the batch record is written after all lessons; a teacher's rules do not allow it (admin only)
    if (createdIds.length && !teacherOnly && batchRepository?.create) {
      try { await batchRepository.create(batchId, { lessonIds: createdIds, studentIds: lessons.filter((lesson) => created.includes(lesson.id)).map((lesson) => lesson.studentId) }, user); }
      catch (problem) { failed.push(`Tunnid on kalendris, kuid plaani kirjet (plannerBatches) ei saanud salvestada: ${problem.message || 'viga'}`); }
    }
    let ended = 0;
    if (endingIds.length && created.length) {
      const doneKeys = new Set(lessons.filter((lesson) => created.includes(lesson.id)).map((lesson) => lesson.key));
      for (const request of requests.filter((item) => doneKeys.has(item.key))) {
        for (const id of request.replaces || []) {
          try { await scheduleRepository.patch(id, { endDate: shiftDate(startDate, -1) }); ended += 1; } catch (problem) { failed.push(`Vana sari ${request.studentName}: ${problem.message || 'ei lõppenud'}`); }
        }
      }
    }
    const doneKeys = new Set(lessons.filter((lesson) => created.includes(lesson.id)).map((lesson) => lesson.key));
    update((current) => {
      const left = current.lessons.filter((lesson) => !created.includes(lesson.id));
      return { lessons: left, requests: current.requests.filter((request) => !doneKeys.has(request.key) || left.some((lesson) => lesson.key === request.key)) };
    });
    setSaving(false); setConfirm(null); setSelectedId('');
    setNotice(`Kalendrisse lisati ${created.length} korduvat tundi alates ${shortDate(startDate)}${ended ? `, ${ended} vana sarja lõpetati ${shortDate(shiftDate(startDate, -1))}` : ''}.`);
    if (failed.length) setError(`Ei salvestunud: ${failed.join('; ')}`);
    if (created.length) await onSaved?.();
  };

  // ── grid ──────────────────────────────────────────────────────
  const shownTeacher = (item) => !viewTeacher || item.teacherUid === viewTeacher || (!item.teacherUid && item.teacher && item.teacher === teacherName(viewTeacher));
  const replaced = new Set(replacedIds);
  const fixedShown = events.filter((event) => !replaced.has(event.id) && shownTeacher(event));
  const selected = lessons.find((lesson) => lesson.id === selectedId) || null;
  const picked = pickedKey ? requestOf(pickedKey) : null;
  const colouring = dragging || (picked ? { ...picked, id: `${picked.key}#new` } : null) || selected;
  const draftItem = (lesson) => {
    const entry = judgedById.get(lesson.id);
    return { ...lesson, occurrenceId: `draft:${lesson.id}`, occurrenceDate: lesson.date, isDraft: true, status: 'Planeeritud', studentName: `${entry?.status === 'overlap' ? '⚠ ' : entry?.status === 'agree' ? '! ' : entry?.status === 'best' ? '★ ' : ''}${lesson.studentName}`, blockClass: `is-draft is-plan-${entry?.status || 'ok'}${lesson.id === selectedId ? ' is-selected' : ''}`, roomName: rooms.find((room) => room.id === lesson.roomId)?.name || '' };
  };
  const columns = ctx.dates.map((date) => ({
    key: date, date, today, isToday: false, title: shortDate(date), subtitle: dayName(date).slice(0, 2),
    items: [
      ...occurrencesForDates(fixedShown, [date]).map((item) => ({ ...item, blockClass: 'is-fixed' })),
      ...lessons.filter((lesson) => lesson.date === date && shownTeacher(lesson)).map(draftItem),
    ],
  }));
  const draftOf = (item) => lessons.find((lesson) => `draft:${lesson.id}` === item.occurrenceId) || null;
  const onMove = ({ item, column, time, duration }) => { const lesson = draftOf(item); if (lesson) moveLesson(lesson.id, { date: column.date, time, duration }); };
  const onOpen = (item) => { const lesson = draftOf(item); setPickedKey(''); setSelectedId(lesson && lesson.id !== selectedId ? lesson.id : ''); };
  const onSlot = (column, time) => {
    if (picked) placeAt(picked.key, { date: column.date, time });
    else if (selected) { moveLesson(selected.id, { date: column.date, time, duration: selected.duration }); setSelectedId(''); }
  };
  const marks = colouring ? (column) => dragMarks(ctx, colouring, column.date, lessons) : null;

  const selectedFit = selected ? judgedById.get(selected.id) : null;
  const timeOptions = [];
  for (let minutes = 7 * 60; minutes <= 21 * 60; minutes += 15) timeOptions.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  const lessonEditor = (lesson, fit) => (
    <div className="cal2-plan__edit">
      <label>Päev <select aria-label={`Päev: ${lesson.studentName}`} value={lesson.day} onChange={(event) => moveLesson(lesson.id, { date: ctx.dates[PLAN_DAYS.indexOf(event.target.value)], time: lesson.time, duration: lesson.duration })}>{PLAN_DAYS.map((day, index) => <option key={day} value={day}>{dayName(ctx.dates[index])}</option>)}</select></label>
      <label>Kell <select aria-label={`Kellaaeg: ${lesson.studentName}`} value={lesson.time} onChange={(event) => moveLesson(lesson.id, { date: lesson.date, time: event.target.value, duration: lesson.duration })}>{[...new Set([...timeOptions, lesson.time])].sort().map((time) => <option key={time} value={time}>{time}</option>)}</select></label>
      {fit ? <span className={`cal2-plan__status is-${fit.status}`}>{STATUS_TEXT[fit.status]}</span> : null}
    </div>
  );

  return (
    <section className="cal2-plan" aria-label="Planeerija">
      <div className="cal2-plan__head">
        <strong><UsersRound size={17} /> Planeerija</strong>
        <label className="cal2-plan__field">Algus <input type="date" aria-label="Ajakava algus" value={startDate} onChange={(event) => setStart(event.target.value)} /></label>
        {teacherOnly ? null : <label className="cal2-plan__field">Õpilased <select aria-label="Kelle õpilased" value={scope} onChange={(event) => update({ scope: event.target.value })}><option value="">Kõik õpetajad</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select></label>}
        <label className="checkbox-field cal2-plan__check"><input type="checkbox" checked={includePlanned} onChange={(event) => update({ includePlanned: event.target.checked })} /> <span>Ka need, kel on korduv tund (uus plaan)</span></label>
        <Button variant="secondary" onClick={addAll}><UsersRound size={16} /> Lisa kõik õpilased</Button>
        <Button variant={draft.stale || (requests.length && !lessons.length) ? 'primary' : 'secondary'} disabled={!requests.length} onClick={runDistribute}><Shuffle size={16} /> Jaota</Button>
        <Button disabled={!lessons.length} onClick={openConfirm}><CalendarCheck size={16} /> Kinnita ajakava…</Button>
        <Button variant="secondary" disabled={!requests.length && !lessons.length} onClick={clearAll}><Trash2 size={16} /> Tühjenda</Button>
        <Button variant="secondary" onClick={onClose}>Sulge</Button>
      </div>

      <div className="cal2-plan__summary" aria-live="polite" aria-label="Plaani kokkuvõte">
        <span className="is-best"><b>{summary.best}</b> ★ eelistatud</span>
        <span className="is-ok"><b>{summary.ok}</b> sobib</span>
        <span className="is-agree"><b>{summary.agree}</b> lepi kokku</span>
        <span className="is-overlap"><b>{summary.overlap}</b> kattub</span>
        <span className="is-unplaced"><b>{summary.unplaced}</b> aega ei leitud</span>
        <small>{requests.length} õppesuunda · mustand salvestub selles brauseris · kalendrisse kirjutatakse alles „Kinnita ajakava” järel</small>
      </div>
      <p className="cal2-legend cal2-plan__legend" aria-label="Värvid"><span><i className="cal2-dot is-plan-green" /> sobib õpilasele (★ eelistatud), õpetaja vaba</span><span><i className="cal2-dot is-plan-yellow" /> võimalik (sobib, aga pole ★; õpilane käis varem sel ajal; õpetajal ainult veeb; väljaspool õpetaja vaba aega)</span><span><i className="cal2-dot is-plan-red" /> õpilasele ei sobi / õpetaja ei saa / kattub — saab panna, lepi õpilasega kokku</span><span><i className="cal2-dot is-plan-draft" /> mustand</span></p>
      {draft.stale ? <p className="form-hint cal2-plan__stale">Plaan on muutunud: vajuta „Jaota”, et õpilased uuesti jaotada (käsitsi tõstetud tunnid jäävad paigale).</p> : null}
      {notice ? <p className="cal2-plan__notice" role="status">{notice}<button type="button" aria-label="Sulge teade" onClick={() => setNotice('')}><X size={13} /></button></p> : null}
      {error ? <p className="action-error" role="alert">{error}<button type="button" aria-label="Sulge" onClick={() => setError('')}>×</button></p> : null}

      {open.length ? <div className="cal2-plan__unplaced" aria-label="Aega ei leitud">
        <strong>Aega ei leitud ({open.length})</strong>
        <span className="form-hint">{narrow ? 'Vajuta „Paku aeg”.' : 'Lohista õpilane kalendrisse või vali ta ja klõpsa kalendris ajal. Värvid näitavad, kuhu ta sobib.'}</span>
        <ul>{open.map(({ request, missing, reason }) => (
          <li key={request.key} className={pickedKey === request.key ? 'is-picked' : ''}>
            <button type="button" className="cal2-plan__chip" draggable={!narrow} aria-pressed={pickedKey === request.key}
              onDragStart={(event) => { event.dataTransfer?.setData?.('text/plain', request.key); setDragging({ ...request, id: `${request.key}#new` }); setPickedKey(request.key); }}
              onDragEnd={() => setDragging(null)}
              onClick={() => { setSelectedId(''); setPickedKey(pickedKey === request.key ? '' : request.key); }}>
              <strong>{request.studentName}</strong><small>{[request.subject, request.teacher, `${request.duration} min`, request.online ? 'veeb' : 'kohapeal', missing > 1 ? `${missing} tundi` : ''].filter(Boolean).join(' · ')}</small>
            </button>
            <span className="cal2-plan__why">{UNPLACED_TEXT[reason]}{reason === 'no-times' ? <> · <Link to={`/students/${request.studentId}#sobivad-ajad`}>ava kaart</Link> · <button type="button" className="link-button" onClick={copyLink}><Copy size={12} /> {copied ? 'link kopeeritud' : 'kopeeri /ajad link'}</button></> : null}</span>
            <Button variant="secondary" onClick={() => suggest(request.key)}>Paku aeg</Button>
          </li>
        ))}</ul>
      </div> : null}

      {selected && selectedFit ? <div className="cal2-plan__selected" role="region" aria-label="Valitud mustandtund">
        <div><strong>{selected.studentName}</strong> <small>{[selected.subject, selected.teacher, `${selected.duration} min`, selected.online ? 'veebitund' : `kohapeal${selected.roomId ? ` · ${rooms.find((room) => room.id === selected.roomId)?.name || ''}` : ''}`].filter(Boolean).join(' · ')}</small></div>
        {lessonEditor(selected, selectedFit)}
        <ul className="cal2-plan__reasons">{selectedFit.fit.reasons.map((text) => <li key={text}>{text}</li>)}</ul>
        {selectedFit.flagged ? <p className="cal2-plan__agree">Lepi õpilasega kokku: {selectedFit.status === 'overlap' ? 'aeg kattub teise tunniga.' : 'see aeg ei ole õpilase / õpetaja sobiv aeg.'} {hasTimesLine(studentTimes, selected.studentId)}</p> : null}
        <div className="cal2-plan__actions"><Button variant="secondary" onClick={() => resuggest(selected)}>Paku parim aeg</Button><Button variant="secondary" onClick={() => removeLesson(selected.id)}>Eemalda plaanist</Button><Button variant="secondary" onClick={() => setSelectedId('')}>Valmis</Button></div>
        {narrow ? null : <p className="form-hint">Lohista tundi kalendris või klõpsa kalendris uuel ajal.</p>}
      </div> : null}

      {narrow ? <div className="cal2-plan__list" aria-label="Mustandtunnid">
        {ctx.dates.map((date) => {
          const day = judged.filter((entry) => entry.lesson.date === date && shownTeacher(entry.lesson));
          return day.length ? <section key={date}><h3>{dayName(date)} {shortDate(date)}</h3>{day.map(({ lesson, status }) => (
            <div key={lesson.id} className={`cal2-plan__row is-plan-${status}`}>
              <span><strong>{lesson.studentName}</strong><small>{[lesson.subject, lesson.teacher, `${lesson.duration} min`].filter(Boolean).join(' · ')}</small></span>
              {lessonEditor(lesson, judgedById.get(lesson.id))}
              <Button variant="secondary" onClick={() => setSelectedId(lesson.id)}>Ava</Button>
            </div>
          ))}</section> : null;
        })}
        {!lessons.length ? <p className="form-hint">Vajuta „Lisa kõik õpilased”, siis „Jaota”.</p> : null}
      </div> : <>
        {teacherOnly ? null : <label className="cal2-plan__field cal2-plan__view">Näita kalendris <select aria-label="Näita õpetaja tunde" value={viewTeacher} onChange={(event) => update({ viewTeacher: event.target.value })}><option value="">Kõik õpetajad</option>{viewTeachers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>}
        <TimeGrid
          columns={columns}
          allowColumnChange
          showTeacher={!viewTeacher}
          canDrag={(item) => Boolean(item.isDraft)}
          onSlot={onSlot}
          onOpen={onOpen}
          onMove={onMove}
          marks={marks}
          onDragChange={(item) => setDragging(item ? draftOf(item) : null)}
          onDropItem={(column, time) => { const key = dragging?.key || pickedKey; if (key && !lessons.some((lesson) => `${lesson.id}` === dragging?.id)) placeAt(key, { date: column.date, time }); }}
        />
      </>}

      {requests.length ? <details className="cal2-plan__requests">
        <summary>Õppesuunad plaanis ({requests.length}) — tunde nädalas, kestus, veeb</summary>
        <ul>{requests.map((request) => (
          <li key={request.key}>
            <span><strong>{request.studentName}</strong><small>{[request.subject, request.teacher || 'õpetaja määramata', request.planned ? 'uus plaan (vana sari lõpeb)' : ''].filter(Boolean).join(' · ')}</small></span>
            <label>Nädalas <select aria-label={`Tunde nädalas: ${request.studentName} ${request.subject}`} value={request.perWeek} onChange={(event) => changeRequest(request.key, { perWeek: Number(event.target.value) })}>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label>Kestus <select aria-label={`Kestus: ${request.studentName} ${request.subject}`} value={request.duration} onChange={(event) => changeRequest(request.key, { duration: Number(event.target.value) })}>{[...new Set([...DURATIONS, request.duration])].sort((a, b) => a - b).map((value) => <option key={value} value={value}>{value} min</option>)}</select></label>
            <label><input type="checkbox" checked={Boolean(request.online)} onChange={(event) => changeRequest(request.key, { online: event.target.checked })} /> veeb</label>
            <button type="button" className="link-button" aria-label={`Eemalda ${request.studentName} ${request.subject}`} onClick={() => removeRequest(request.key)}><X size={14} /></button>
          </li>
        ))}</ul>
      </details> : null}

      <Modal open={Boolean(confirm)} title="Kinnita ajakava" onClose={() => (saving ? null : setConfirm(null))} footer={<><Button variant="secondary" disabled={saving} onClick={() => setConfirm(null)}>Loobu</Button><Button loading={saving} disabled={!chosen.length} onClick={runConfirm}>Loo {chosen.length} korduvat tundi</Button></>}>
        {confirm ? <div className="cal2-plan__confirm">
          <p>Iga märgitud tund lisatakse kalendrisse <b>korduva tunnina igal nädalal</b> alates {shortDate(startDate)} (nagu „Uus tund”). Õpilastele midagi ei saadeta. Kattuvad ja kokkuleppimist vajavad tunnid tuleb eraldi märkida.</p>
          <p className="cal2-plan__confirm-tools"><button type="button" className="link-button" onClick={() => setConfirm({ ...confirm, checks: Object.fromEntries(judged.map((entry) => [entry.lesson.id, !entry.flagged])) })}>Ainult sobivad</button> · <button type="button" className="link-button" onClick={() => setConfirm({ ...confirm, checks: Object.fromEntries(judged.map((entry) => [entry.lesson.id, true])) })}>Kõik</button> · <button type="button" className="link-button" onClick={() => setConfirm({ ...confirm, checks: {} })}>Mitte ühtegi</button></p>
          <ul>{sortLessons(ctx, lessons).map((lesson) => {
            const entry = judgedById.get(lesson.id);
            return <li key={lesson.id} className={`is-plan-${entry.status}`}><label className="checkbox-field"><input type="checkbox" checked={Boolean(confirm.checks[lesson.id])} onChange={(event) => setConfirm({ ...confirm, checks: { ...confirm.checks, [lesson.id]: event.target.checked } })} /> <span><b>{DAY_LABELS[lesson.day]} {lesson.time}</b> {lesson.studentName} · {lesson.subject} · {lesson.teacher} · {lesson.duration} min{lesson.online ? ' · veeb' : ''}{entry.flagged ? <em> — {entry.status === 'overlap' ? entry.fit.reasons.find((text) => text.startsWith('Kattub')) || 'vaba kabinetti pole' : 'Lepi õpilasega kokku'}</em> : null}</span></label></li>;
          })}</ul>
          {ending.length ? <label className="checkbox-field"><input type="checkbox" checked={confirm.endOld} onChange={(event) => setConfirm({ ...confirm, endOld: event.target.checked })} /> <span>Lõpeta nende õpilaste vanad korduvad tunnid ({ending.length}) {shortDate(shiftDate(startDate, -1))} (uus plaan asendab need; toimunud tunnid jäävad)</span></label> : null}
        </div> : null}
      </Modal>
    </section>
  );
}

function hasTimesLine(studentTimes, studentId) {
  const times = studentTimes.get?.(studentId);
  const line = timesLine(times);
  if (line && times?.learned) return `Sobivaid aegu pole märgitud; varasemad tunnid: ${line}.`;
  return line ? `Õpilase sobivad ajad: ${line}.` : 'Õpilase sobivad ajad puuduvad.';
}
