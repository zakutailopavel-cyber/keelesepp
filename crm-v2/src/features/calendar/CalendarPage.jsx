import { CalendarRange, ChevronLeft, ChevronRight, Plus, Search, Undo2, UserRoundX, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, EmptyState, ErrorState, Input, LoadingState, Modal } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { isSameTeacher } from '../../utils/teachers.js';
import { groupsService, lessonsService, libraryService, liveLessonInvitationsService, scheduleService, studentsService, teacherAvailabilityService, teachersService } from '../../services/firebase/index.js';
import { studentAccountUid } from '../live-classroom/invitationModel.js';
import { isLessonKey, rememberLessonLink } from '../live-classroom/lessonLink.js';
import { scheduleOverlaps } from '../../services/firebase/schedule.js';
import { ROLES } from '../../utils/roles.js';
import { datesForView, filterCalendarEvents, groupCalendarEvents, occurrencesForDates, shiftDate, toIsoDate } from './calendarView.js';
import { canMove, planDelete, planMove, teacherTone, toClock } from './calendarGrid.js';
import { buildTopicCatalog, suggestTopic, topicFields, topicLine } from './lessonTopic.js';
import TimeGrid from './TimeGrid.jsx';
import { unplannedStudents } from './unplannedStudents.js';
import { DAY_IDS, bandsOn, paintSlot, slotsOn, windowProblem } from './availabilityModel.js';
import LessonPanel from './LessonPanel.jsx';
import QuickAttendanceAction from './QuickAttendanceAction.jsx';
import CalendarGoogleChip from '../google-calendar/CalendarGoogleChip.jsx';
import { isGoogleOwned } from '../google-calendar/googleCalendarModel.js';
import './calendarUx.css';
import './calendarV2.css';

const blankLesson = () => ({ studentId: '', teacherUid: '', subject: '', date: toIsoDate(), time: '09:00', duration: 60, recurring: false, online: false, status: 'Planeeritud' });
const viewLabels = { day: 'Päev', week: 'Nädal', month: 'Kuu' };
const emptyFilters = () => ({ search: '', teacher: '', student: '' });

function useNarrow(query = '(max-width: 760px)') {
  const get = () => Boolean(globalThis.matchMedia?.(query).matches);
  const [narrow, setNarrow] = useState(get);
  useEffect(() => {
    const media = globalThis.matchMedia?.(query);
    if (!media) return undefined;
    const onChange = () => setNarrow(media.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, [query]);
  return narrow;
}

function shiftMonth(value, amount) {
  const date = new Date(`${value}T12:00:00`);
  return toIsoDate(new Date(date.getFullYear(), date.getMonth() + amount, 1, 12));
}

function periodLabel(anchor, view, dates) {
  const options = view === 'day' ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } : { month: 'long', year: 'numeric' };
  if (view !== 'week') return new Date(`${anchor}T12:00:00`).toLocaleDateString('et-EE', options);
  const first = new Date(`${dates[0]}T12:00:00`).toLocaleDateString('et-EE', { day: 'numeric', month: 'short' });
  const last = new Date(`${dates.at(-1)}T12:00:00`).toLocaleDateString('et-EE', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${first} – ${last}`;
}


function StudentCombobox({ students, value, onChange }) {
  const selected = students.find((student) => student.id === value);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputValue = open ? query : (selected?.name || query);

  const normalized = inputValue.trim().toLocaleLowerCase('et');
  const matches = students.filter((student) => !normalized || [student.name, student.phone, student.email, student.parentEmail]
    .filter(Boolean)
    .some((field) => String(field).toLocaleLowerCase('et').includes(normalized))).slice(0, 20);

  const choose = (student) => {
    onChange(student.id);
    setQuery(student.name);
    setOpen(false);
  };

  const keyDown = (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setActiveIndex((index) => Math.min(index + 1, Math.max(0, matches.length - 1))); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); setActiveIndex((index) => Math.max(0, index - 1)); }
    if (event.key === 'Enter' && open && matches.length) { event.preventDefault(); choose(matches[activeIndex] || matches[0]); }
    if (event.key === 'Escape') setOpen(false);
  };

  return <label className="student-combobox form-grid__wide"><span className="field__label">Õpilane</span><div className="student-combobox__control"><Search size={17} /><input role="combobox" aria-expanded={open} aria-controls="lesson-student-options" aria-autocomplete="list" placeholder="Kirjuta õpilase nimi…" value={inputValue} onFocus={() => { setQuery(selected?.name || ''); setOpen(true); }} onBlur={() => window.setTimeout(() => setOpen(false), 120)} onKeyDown={keyDown} onChange={(event) => { setQuery(event.target.value); onChange(''); setActiveIndex(0); setOpen(true); }} required /></div>{open ? <div className="student-combobox__options" id="lesson-student-options" role="listbox">{matches.length ? matches.map((student, index) => <button type="button" role="option" aria-selected={student.id === value} className={index === activeIndex ? 'is-active' : ''} key={student.id} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(student)}><strong>{student.name}</strong><small>{[student.teacher, student.phone || student.email].filter(Boolean).join(' · ') || 'Kontakt puudub'}</small></button>) : <div className="student-combobox__empty">Ühtegi õpilast ei leitud.</div>}</div> : null}</label>;
}

function LessonButton({ item, compact = false, onClick, onComplete, completing }) {
  return (
    <div className={`lesson-chip-wrap ${compact ? 'lesson-chip-wrap--compact' : ''}`}>
      <button className={`lesson-chip ${compact ? 'lesson-chip--compact' : ''}`} onClick={() => onClick(item)}>
        <time>{item.time}</time>
        <strong>{item.studentName || 'Õpilane'}</strong>
        {compact ? null : <small>{item.teacher || 'Õpetaja'} · {item.duration} min</small>}
      </button>
      {compact ? null : <QuickAttendanceAction item={item} saving={completing} onComplete={onComplete} />}
    </div>
  );
}


export default function CalendarPage({ scheduleRepository = scheduleService, studentRepository = studentsService, groupRepository = groupsService, lessonRepository = lessonsService, libraryRepository = libraryService, googleCalendarRepository, teacherRepository = teachersService, liveRepository = liveLessonInvitationsService, availabilityRepository = teacherAvailabilityService }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [startingLive, setStartingLive] = useState(false);
  const narrow = useNarrow();
  // `?lesson=<occurrenceId>|<date>` opens that lesson's panel (after „Lõpeta tund” in the Live Classroom).
  const [linkedLesson] = useState(() => (isLessonKey(searchParams.get('lesson')) ? searchParams.get('lesson') : ''));
  const [anchor, setAnchor] = useState(() => (linkedLesson ? linkedLesson.split('|')[1] : toIsoDate()));
  const [view, setView] = useState('week');
  const [filters, setFilters] = useState(() => ({ search: '', teacher: searchParams.get('teacher') || '', student: searchParams.get('student') || '' }));
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankLesson());
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [panelKey, setPanelKey] = useState(linkedLesson);
  const [panelError, setPanelError] = useState('');
  const [panelSaving, setPanelSaving] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState('');
  const [moveAsk, setMoveAsk] = useState(null);
  const [deleteAsk, setDeleteAsk] = useState(null);
  const [undo, setUndo] = useState(null);
  const [quickCompleting, setQuickCompleting] = useState('');
  // painting a teacher's green (free) / red (busy) windows
  const [paint, setPaint] = useState(null);
  const [paintSaving, setPaintSaving] = useState(false);
  // students with no lesson ahead (`?unplanned=1` opens the list, e.g. from Ülevaade)
  const [showUnplanned, setShowUnplanned] = useState(() => searchParams.get('unplanned') === '1');
  const [pausing, setPausing] = useState('');
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const teacherOnly = user.roles.includes(ROLES.TEACHER) && !isAdmin;
  const state = useAsyncData(async () => Promise.all([
    scheduleRepository.list(teacherOnly ? { teacherUid: user.uid } : {}),
    studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) }),
    groupRepository.list(teacherOnly ? { teacherUid: user.uid, teacherName: user.displayName } : {}),
    lessonRepository.listForCalendar(teacherOnly ? { teacherUid: user.uid } : {}),
  ]), [groupRepository, lessonRepository, scheduleRepository, studentRepository, teacherOnly, user.displayName, user.uid]);
  // Admin can give a lesson to another teacher (substitution); teachers always plan their own lessons.
  const teacherState = useAsyncData(() => (isAdmin && teacherRepository?.list ? teacherRepository.list() : Promise.resolve([])), [isAdmin, teacherRepository]);
  const availabilityState = useAsyncData(() => (availabilityRepository?.list ? availabilityRepository.list().catch(() => []) : Promise.resolve([])), [availabilityRepository]);
  const libraryState = useAsyncData(() => (libraryRepository?.list ? libraryRepository.list() : Promise.resolve(null)), [libraryRepository]);
  const catalog = useMemo(() => (libraryState.data ? buildTopicCatalog(libraryState.data.curriculumLessons) : null), [libraryState.data]);
  const dates = useMemo(() => datesForView(anchor, view), [anchor, view]);

  useEffect(() => {
    if (!undo) return undefined;
    const timer = globalThis.setTimeout(() => setUndo(null), 8000);
    return () => globalThis.clearTimeout(timer);
  }, [undo]);

  if (state.loading) return <LoadingState label="Laen kalendrit…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const [scheduleEvents, students, groups, lessonRecords] = state.data;
  const studentMap = new Map(students.items.map((student) => [student.id, student]));
  const events = [...scheduleEvents, ...groupCalendarEvents(groups)];
  const filteredEvents = filterCalendarEvents(events, filters);
  const recordByOccurrence = new Map(lessonRecords.filter((lesson) => lesson.scheduleId && lesson.date).map((lesson) => [`${lesson.scheduleId}:${lesson.date}`, lesson]));
  const withRecord = (item) => {
    const record = item.isGroup ? null : recordByOccurrence.get(`${item.id}:${item.occurrenceDate}`);
    return record ? { ...item, status: record.status || 'Toimunud', lessonRecordId: record.id, record, recordTopic: topicLine(record) || record.topic || '' } : item;
  };
  const occurrences = occurrencesForDates(filteredEvents, dates).map(withRecord);
  // teachers of the lessons plus (admin) every active staff account, so a new teacher without lessons can be chosen
  const lessonTeachers = [...new Map(events.filter((item) => item.teacher).map((item) => [item.teacherUid || item.teacher, { id: item.teacherUid || item.teacher, name: item.teacher }])).values()];
  const teachers = [
    ...lessonTeachers,
    ...(teacherState.data || []).filter((staff) => !staff.disabled && !lessonTeachers.some((teacher) => teacher.id === staff.id || isSameTeacher(teacher.name, staff.name))).map((staff) => ({ id: staff.id, name: staff.name })),
  ].sort((a, b) => a.name.localeCompare(b.name, 'et'));
  const hasActiveFilters = Boolean(filters.search || filters.teacher || filters.student);
  const today = toIsoDate();
  const historyOf = (studentId) => lessonRecords.filter((lesson) => lesson.studentId === studentId && ['Toimunud', undefined, ''].includes(lesson.status)).sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`));
  const panelItem = panelKey ? occurrencesForDates(events, [panelKey.split('|')[1]]).map(withRecord).find((item) => item.occurrenceId === panelKey.split('|')[0]) || null : null;
  const panelGroup = panelItem?.isGroup ? groups.find((group) => group.id === panelItem.groupId) : null;

  // ── teacher windows ──────────────────────────────────────────
  const availabilityList = availabilityState.data || [];
  const availabilityFor = (key) => availabilityList.find((entry) => entry.teacherUid === key) || availabilityList.find((entry) => key && entry.teacherName === key) || null;
  const bandTeacher = teacherOnly ? user.uid : filters.teacher;
  const bandsFor = (column) => {
    const key = column.key.startsWith('t:') ? column.key.slice(2) : bandTeacher;
    return key ? bandsOn(availabilityFor(key), column.date) : [];
  };
  const paintTeacher = teacherOnly
    ? { uid: user.uid, name: user.displayName }
    : isAdmin && filters.teacher ? { uid: filters.teacher, name: teachers.find((teacher) => teacher.id === filters.teacher)?.name || '' } : null;
  const saveWindows = async (slots) => {
    if (!paintTeacher) return;
    setPaintSaving(true); setActionError('');
    try {
      await availabilityRepository.save({ teacherUid: paintTeacher.uid, teacherName: paintTeacher.name, slots, user });
      await availabilityState.reload();
    } catch (error) { setActionError(error.message || 'Aegu ei saanud salvestada.'); } finally { setPaintSaving(false); }
  };
  const onPaint = (column, start, end) => {
    if (!paintTeacher || !paint) return;
    const slot = { id: `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, kind: paint.kind, start: toClock(start), end: toClock(end), ...(paint.weekly ? { day: DAY_IDS[new Date(`${column.date}T12:00:00`).getDay()] } : { date: column.date }) };
    saveWindows(paintSlot(availabilityFor(paintTeacher.uid)?.slots || [], slot));
  };
  const onBandClick = (column, band) => {
    if (!paintTeacher) return;
    if (!globalThis.confirm(`Eemaldan ${band.kind === 'busy' ? 'punase' : band.kind === 'online' ? 'kollase' : 'rohelise'} aja ${toClock(band.start)}–${toClock(band.end)}${band.date ? '' : ' (iga nädal)'}?`)) return;
    saveWindows((availabilityFor(paintTeacher.uid)?.slots || []).filter((slot) => slot.id !== band.id));
  };
  // a lesson never goes into a teacher's red window, and into a yellow one only as an online lesson
  const assertTeacherWindow = ({ teacherUid, teacher, date, time, duration, online }) => {
    const windows = availabilityFor(teacherUid) || availabilityFor(teacher);
    const problem = windowProblem(windows, { date, time, duration, online: Boolean(online) }, teacher);
    if (problem) throw new Error(problem);
  };

  const navigatePeriod = (direction) => setAnchor((current) => view === 'month' ? shiftMonth(current, direction) : shiftDate(current, direction * (view === 'week' ? 7 : 1)));
  const openCreate = (date = anchor, time = '09:00', studentId = '') => { setEditing(null); setForm({ ...blankLesson(), date, time, ...(studentId ? { studentId } : {}) }); setModal(true); setActionError(''); };
  const unplanned = unplannedStudents({ students: students.items, events, today, teacherUid: teacherOnly ? user.uid : (isAdmin && filters.teacher ? filters.teacher : '') });
  const pauseStudent = async (student, days) => {
    setPausing(student.id); setActionError('');
    try {
      const until = shiftDate(today, days);
      await studentRepository.update(student.id, { planningPausedUntil: until });
      await state.reload();
    } catch (error) { setActionError(error.message || 'Pausi ei saanud salvestada.'); } finally { setPausing(''); }
  };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ studentId: item.studentId || '', teacherUid: item.teacherUid || '', subject: item.subject || '', date: item.recurring ? item.startDate : (item.occurrenceDate || item.date), time: item.time || '09:00', duration: item.duration || 60, recurring: Boolean(item.recurring), online: Boolean(item.online), status: item.status || 'Planeeritud' });
    setModal(true); setActionError('');
  };
  const openPanel = (item) => { setPanelError(''); setPanelKey(`${item.occurrenceId}|${item.occurrenceDate}`); };
  const closeModal = () => { if (!saving) setModal(false); };
  // A student may study several subjects with different teachers („Õppesuunad”). A teacher plans only their own
  // lessons; the lesson carries the subject of its study track.
  const tracksOf = (student) => (student?.enrollments || []).filter((track) => track.active !== false && track.subject && (isAdmin || !track.teacherUid || track.teacherUid === user.uid));
  const lessonTeacher = (student) => {
    const chosen = isAdmin && form.teacherUid ? (teacherState.data || []).find((teacher) => teacher.id === form.teacherUid) : null;
    if (chosen) return { teacher: chosen.name, teacherUid: chosen.id };
    if (editing) return { teacher: editing.teacher, teacherUid: editing.teacherUid };
    if (!isAdmin) return { teacher: user.displayName, teacherUid: user.uid };
    return { teacher: student?.teacher || user.displayName, teacherUid: student?.teacherUid || user.uid };
  };
  const lessonSubject = (student, teacherUid) => {
    const tracks = tracksOf(student);
    return (form.subject && tracks.some((track) => track.subject === form.subject) ? form.subject : '')
      || tracks.find((track) => track.teacherUid && track.teacherUid === teacherUid)?.subject
      || (tracks.length === 1 ? tracks[0].subject : '')
      || student?.subject || '';
  };
  const formStudent = studentMap.get(form.studentId);
  const formTracks = tracksOf(formStudent);
  // other lessons of the same teacher at the chosen time: allowed, just shown
  const formTeacher = lessonTeacher(formStudent);
  const parallel = modal && form.date && form.time
    ? scheduleOverlaps(occurrencesForDates(events, [form.date]).map((item) => ({ ...item, date: item.occurrenceDate })), { ...form, ...formTeacher }, editing?.id)
    : [];

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setActionError('');
    try {
      const student = studentMap.get(form.studentId);
      if (!student) throw new Error('Vali õpilane.');
      const teacherFields = lessonTeacher(student);
      const subject = lessonSubject(student, teacherFields.teacherUid);
      const candidate = { ...form, studentName: student.name, ...teacherFields, ...(subject ? { subject } : {}) };
      if (!candidate.subject) delete candidate.subject;
      // several students at the same time (or overlapping) are allowed; only the teacher's red windows are not
      assertTeacherWindow(candidate);
      if (editing) await scheduleRepository.update(editing.id, candidate, editing);
      else await scheduleRepository.create(candidate);
      setModal(false); setEditing(null); await state.reload();
    } catch (error) { setActionError(error.message); } finally { setSaving(false); }
  };

  // ── drag and drop ────────────────────────────────────────────
  const runOps = async (ops, item, created = {}) => {
    if (item.isGroup) {
      let group = groups.find((entry) => entry.id === item.groupId);
      if (!group) throw new Error('Gruppi ei leitud.');
      for (const op of ops) {
        if (op.op === 'patch') {
          await groupRepository.patchLesson(group, item.groupLessonId, op.fields, user);
          group = { ...group, lessons: group.lessons.map((lesson) => (lesson.id === item.groupLessonId ? { ...lesson, ...op.fields } : lesson)) };
        } else if (op.op === 'create') {
          const lesson = await groupRepository.addLesson(group, { ...op.data, startDate: op.data.startDate || op.data.date }, user);
          group = { ...group, lessons: [...group.lessons, lesson] };
          created[op.key] = lesson.id;
        } else if (op.op === 'remove' && created[op.key]) {
          await groupRepository.removeLesson(group, created[op.key], user);
          group = { ...group, lessons: group.lessons.filter((lesson) => lesson.id !== created[op.key]) };
        }
      }
      return created;
    }
    for (const op of ops) {
      if (op.op === 'patch') await scheduleRepository.patch(op.id, op.fields);
      else if (op.op === 'create') created[op.key] = (await scheduleRepository.create(op.data)).id;
      else if (op.op === 'remove' && created[op.key]) await scheduleRepository.remove(created[op.key]);
      else if (op.op === 'delete') await scheduleRepository.remove(op.id);
      else if (op.op === 'restore') await scheduleRepository.restore(op.id, op.data);
    }
    return created;
  };

  const executeMove = async ({ item, toDate, time, duration }, scope) => {
    setMoveAsk(null); setActionError('');
    try {
      const plan = planMove(item, { toDate, toTime: time, duration, scope });
      const created = await runOps(plan.apply, item);
      const when = new Date(`${toDate}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short', day: 'numeric', month: 'short' });
      setUndo({ label: `${item.studentName || 'Tund'} → ${when} ${time}${Number(duration) !== Number(item.duration || 60) ? ` · ${duration} min` : ''}${scope === 'series' && item.recurring ? ' (ja järgmised)' : ''}`, plan, created, item });
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Tunni liigutamine ebaõnnestus.');
      await state.reload();
    }
  };

  const onMove = ({ item, column, time, duration }) => {
    if (item.isGroup && !isAdmin) { setActionError('Grupi tundi saab liigutada administraator.'); return; }
    if (isGoogleOwned(item)) { setActionError('See tund tuli Google Calendarist: tõsta see Google Calendaris.'); return; }
    const toDate = column?.date || item.occurrenceDate;
    const candidate = { date: toDate, time, duration, teacher: item.teacher, teacherUid: item.teacherUid, online: Boolean(item.online) };
    try { assertTeacherWindow(candidate); } catch (error) { setActionError(error.message); return; }
    const move = { item, toDate, time, duration };
    if (item.recurring) setMoveAsk(move);
    else executeMove(move, 'single');
  };

  const undoMove = async () => {
    const current = undo;
    setUndo(null);
    try { await runOps(current.plan.undo, current.item, current.created); } catch (error) { setActionError(error.message || 'Tagasivõtmine ebaõnnestus.'); }
    await state.reload();
  };

  // ── lesson panel actions ─────────────────────────────────────
  const markDone = async (details) => {
    if (!panelItem) return;
    setPanelSaving(true); setPanelError('');
    try {
      const { homework, ...fields } = details;
      await lessonRepository.completeFromSchedule(panelItem, user, fields);
      const student = studentMap.get(panelItem.studentId);
      if (homework && student) await libraryRepository.assign({ item: homework, students: [student], dueDate: '', note: fields.topic ? `Tund: ${fields.topic}` : '', user });
      setPanelKey('');
      await state.reload();
      return true;
    } catch (error) { setPanelError(error.message || 'Salvestamine ebaõnnestus.'); return false; } finally { setPanelSaving(false); }
  };
  // the topic (level / module / lesson) and the note of an already marked lesson can be changed later
  const updateDetails = async (details) => {
    if (!panelItem?.record) return false;
    setPanelSaving(true); setPanelError('');
    try {
      await lessonRepository.updateDetails(panelItem.record, details, user);
      await state.reload();
      return true;
    } catch (error) { setPanelError(error.message || 'Muudatust ei saanud salvestada.'); return false; } finally { setPanelSaving(false); }
  };
  const quickDone = async (item) => {
    if (quickCompleting) return;
    setQuickCompleting(item.occurrenceId); setActionError('');
    try {
      const suggestion = catalog ? suggestTopic(catalog, { studentLevel: studentMap.get(item.studentId)?.level || '', history: historyOf(item.studentId) }) : null;
      await lessonRepository.completeFromSchedule(item, user, topicFields(suggestion));
      await state.reload();
    } catch (error) { setActionError(error.message || 'Tunni arvestamine ebaõnnestus.'); } finally { setQuickCompleting(''); }
  };
  const cancelOccurrence = async () => {
    const item = panelItem;
    if (!item || !globalThis.confirm(item.recurring ? 'Tühistada ainult see tund? Järgmised jäävad alles.' : 'Kas tühistada see tund?')) return;
    setPanelSaving(true); setPanelError('');
    try {
      if (item.recurring) {
        const excluded = item.excludedDates || [];
        await scheduleRepository.patch(item.id, { excludedDates: [...new Set([...excluded, item.occurrenceDate])] });
        setUndo({ label: `${item.studentName} tühistatud ${item.occurrenceDate}`, plan: { undo: [{ op: 'patch', id: item.id, fields: { excludedDates: excluded } }] }, created: {}, item });
      } else {
        await scheduleRepository.cancel(item.id, item);
        setUndo({ label: `${item.studentName} tühistatud ${item.occurrenceDate}`, plan: { undo: [{ op: 'patch', id: item.id, fields: { status: item.status || 'Planeeritud' } }] }, created: {}, item });
      }
      setPanelKey('');
      await state.reload();
    } catch (error) { setPanelError(error.message); } finally { setPanelSaving(false); }
  };
  // Delete a lesson added by mistake (wrong student, wrong day). Cancelling ("Tühista tund") is for a lesson that
  // was planned but does not take place.
  const deleteLesson = async (scope) => {
    const item = deleteAsk;
    setDeleteAsk(null);
    if (!item) return;
    setPanelSaving(true); setPanelError(''); setActionError('');
    try {
      const plan = planDelete(item, {
        scope,
        stored: scheduleEvents.find((entry) => entry.id === item.id) || item,
        hasRecords: lessonRecords.some((lesson) => lesson.scheduleId === item.id),
      });
      await runOps(plan.apply, item);
      const when = new Date(`${item.occurrenceDate}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short', day: 'numeric', month: 'short' });
      setUndo({ label: `${item.studentName || 'Tund'} ${when} kustutatud${item.recurring && scope === 'series' ? ' (ja järgmised)' : ''}`, plan, created: {}, item });
      setPanelKey('');
      await state.reload();
    } catch (error) { setPanelError(error.message || 'Kustutamine ebaõnnestus.'); } finally { setPanelSaving(false); }
  };
  // "Alusta tundi": invite the student to the Live Classroom and open the room for this lesson.
  const startLive = async () => {
    const item = panelItem;
    const student = item ? studentMap.get(item.studentId) : null;
    if (!item || !student) return;
    setStartingLive(true); setPanelError('');
    try {
      const title = `${item.subject || student.subject || 'Õppetund'} · ${item.time}`;
      const invitation = await liveRepository.create({ student, title }, user);
      rememberLessonLink(invitation.id, `${item.occurrenceId}|${item.occurrenceDate}`);
      navigate(`/live-classroom?invitation=${encodeURIComponent(invitation.id)}`);
    } catch (error) {
      setPanelError(error.message || 'Tundi ei saanud alustada.');
    } finally { setStartingLive(false); }
  };
  // A group lesson that does not take place on one date (holiday, teacher ill): the date is excluded from the series.
  const cancelGroupOccurrence = async () => {
    const item = panelItem;
    if (!item?.isGroup || !panelGroup || !globalThis.confirm(`Tühistada grupitund ${item.occurrenceDate}? Järgmised jäävad alles.`)) return;
    setPanelSaving(true); setPanelError('');
    try {
      const excluded = item.excludedDates || [];
      const plan = { apply: [{ op: 'patch', fields: { excludedDates: [...new Set([...excluded, item.occurrenceDate])] } }], undo: [{ op: 'patch', fields: { excludedDates: excluded } }] };
      await runOps(plan.apply, item);
      setUndo({ label: `${item.studentName} tühistatud ${item.occurrenceDate}`, plan, created: {}, item });
      setPanelKey('');
      await state.reload();
    } catch (error) { setPanelError(error.message || 'Tühistamine ebaõnnestus.'); } finally { setPanelSaving(false); }
  };
  // Fix a wrong mark: another status, or remove the mark so the lesson is planned again.
  const fixMark = async (action, status) => {
    const item = panelItem;
    if (!item?.record) return;
    setPanelSaving(true); setPanelError('');
    try {
      if (action === 'remove') await lessonRepository.removeMark(item.record, user, { scheduleRecurring: Boolean(item.recurring) });
      else await lessonRepository.changeMark(item.record, status, user, { scheduleRecurring: Boolean(item.recurring) });
      await state.reload();
    } catch (error) {
      setPanelError(error.code === 'permission-denied' ? 'Seda märget ei saa siin muuta: tund on arvel või periood on suletud. Paranda see Finantsides.' : (error.message || 'Parandamine ebaõnnestus.'));
    } finally { setPanelSaving(false); }
  };
  const setAttendance = async (studentId, status) => {
    if (!panelGroup || !panelItem?.occurrenceDate) return;
    setAttendanceSaving(studentId); setPanelError('');
    try {
      const student = studentMap.get(studentId);
      await groupRepository.setAttendance(panelGroup, panelItem.groupLessonId, panelItem.occurrenceDate, studentId, status, user, student?.name || '');
      await state.reload();
    } catch (error) { setPanelError(error.message || 'Kohalolu märkimine ebaõnnestus.'); } finally { setAttendanceSaving(''); }
  };

  // ── columns ──────────────────────────────────────────────────
  const dayColumns = (() => {
    const daily = occurrences.filter((item) => item.occurrenceDate === anchor);
    if (!isAdmin || filters.teacher) return [{ key: anchor, date: anchor, today, isToday: anchor === today, title: new Date(`${anchor}T12:00:00`).toLocaleDateString('et-EE', { day: 'numeric', month: 'long' }), subtitle: new Date(`${anchor}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'long' }), items: daily }];
    const byTeacher = new Map();
    daily.forEach((item) => { const key = item.teacherUid || item.teacher || '—'; if (!byTeacher.has(key)) byTeacher.set(key, { name: item.teacher || 'Õpetaja määramata', items: [] }); byTeacher.get(key).items.push(item); });
    // teachers with marked windows today get a column too, so the admin sees where a lesson can still go
    availabilityList.filter((entry) => slotsOn(entry, anchor).length && !byTeacher.has(entry.teacherUid)).forEach((entry) => byTeacher.set(entry.teacherUid, { name: entry.teacherName || 'Õpetaja', items: [] }));
    const list = [...byTeacher.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name, 'et'));
    return (list.length ? list : [['—', { name: 'Tunde pole', items: [] }]]).map(([key, entry]) => ({ key: `t:${key}`, date: anchor, today, isToday: anchor === today, title: entry.name, subtitle: `${entry.items.length} ${entry.items.length === 1 ? "tund" : "tundi"}`, items: entry.items }));
  })();
  const weekColumns = dates.map((date) => ({ key: date, date, today, isToday: date === today, title: date.slice(-2).replace(/^0/, ''), subtitle: new Date(`${date}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short' }), items: occurrences.filter((item) => item.occurrenceDate === date) }));
  const period = periodLabel(anchor, view, dates);

  const agenda = (list) => (list.length ? <div className="cal-agenda">{[...new Set(list.map((item) => item.occurrenceDate))].map((date) => (
    <section key={date}>
      <h3 className={date === today ? 'is-today' : ''}>{new Date(`${date}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
      {list.filter((item) => item.occurrenceDate === date).map((item) => (
        <button type="button" className={`cal-agenda__row tone-${teacherTone(item.teacherUid || item.teacher)}`} key={item.occurrenceId} onClick={() => openPanel(item)}>
          <time>{item.time}</time>
          <span><strong>{item.studentName}</strong><small>{item.recordTopic || [item.isGroup ? 'Grupp' : '', item.teacher, `${item.duration} min`].filter(Boolean).join(' · ')}</small></span>
          {item.lessonRecordId || item.status === 'Toimunud' ? <Badge tone="success">✓</Badge> : null}
        </button>
      ))}
    </section>
  ))}</div> : <EmptyState title={hasActiveFilters ? 'Filtritele vastavaid tunde ei leitud' : 'Valitud perioodil tunde ei ole'} action={hasActiveFilters ? <Button variant="secondary" onClick={() => setFilters(emptyFilters())}>Tühjenda filtrid</Button> : null} />);

  return <div className="page-content cal2">
    <div className="cal2-bar">
      <div className="cal2-nav">
        <Button variant="secondary" aria-label="Eelmine periood" onClick={() => navigatePeriod(-1)}><ChevronLeft size={17} /></Button>
        <Button variant="secondary" onClick={() => setAnchor(toIsoDate())}>Täna</Button>
        <Button variant="secondary" aria-label="Järgmine periood" onClick={() => navigatePeriod(1)}><ChevronRight size={17} /></Button>
        <h1>{period}</h1>
      </div>
      <div className="view-switcher" role="group" aria-label="Vaade">{Object.entries(viewLabels).map(([value, label]) => <button type="button" aria-pressed={view === value} className={view === value ? 'active' : ''} key={value} onClick={() => setView(value)}>{label}</button>)}</div>
      <div className="cal2-tools">
        <label className="cal2-search"><Search size={16} /><input aria-label="Otsi kalendrist" placeholder="Otsi õpilast või õpetajat" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /></label>
        {teacherOnly ? null : <select className="cal2-select" aria-label="Filtreeri õpetaja järgi" value={filters.teacher} onChange={(event) => setFilters({ ...filters, teacher: event.target.value })}><option value="">Kõik õpetajad</option>{teachers.map((teacher) => <option value={teacher.id} key={teacher.id}>{teacher.name}</option>)}</select>}
        {teacherOnly || isAdmin ? <Button variant={paint ? 'primary' : 'secondary'} onClick={() => { if (paint) { setPaint(null); return; } if (!paintTeacher) { setActionError('Vali enne õpetaja, kelle aegu soovid märkida.'); return; } setPaint({ kind: 'free', weekly: true }); }}><CalendarRange size={17} /> {teacherOnly ? 'Minu ajad' : 'Õpetaja ajad'}</Button> : null}
        <CalendarGoogleChip user={user} onSynced={state.reload} {...(googleCalendarRepository ? { repository: googleCalendarRepository } : {})} />
        <Button onClick={() => openCreate()}><Plus size={17} /> Lisa tund</Button>
      </div>
    </div>
    <div className="calendar-filter-summary cal2-summary" aria-live="polite">
      <span><strong>{occurrences.length}</strong> tundi valitud perioodil</span>
      {filters.student ? <button type="button" className="cal2-chip" onClick={() => setFilters({ ...filters, student: '' })}>Õpilane: {studentMap.get(filters.student)?.name || filters.student} <X size={13} /></button> : null}
      {hasActiveFilters ? <Button variant="secondary" onClick={() => setFilters(emptyFilters())}>Tühjenda filtrid</Button> : null}
      {unplanned.length ? <button type="button" className={`cal2-unplanned-chip ${showUnplanned ? 'is-open' : ''}`} aria-expanded={showUnplanned} onClick={() => setShowUnplanned((value) => !value)}><UserRoundX size={15} /> {unplanned.length} {unplanned.length === 1 ? 'õpilane' : 'õpilast'} ilma tulevase tunnita</button> : null}
      <span className="cal2-hint">{narrow ? '' : 'Lohista tundi, et muuta aega · tõmba alumisest servast, et muuta kestust'}</span>
    </div>
    {paint && paintTeacher ? (
      <div className="cal2-paint" role="region" aria-label="Õpetaja ajad">
        <strong>{teacherOnly ? 'Minu ajad' : `${paintTeacher.name} — ajad`}</strong>
        <div className="view-switcher" role="group" aria-label="Aja liik">
          <button type="button" aria-pressed={paint.kind === 'free'} className={paint.kind === 'free' ? 'active' : ''} onClick={() => setPaint({ ...paint, kind: 'free' })}><i className="cal2-dot is-free" /> Vaba (tunde võib panna)</button>
          <button type="button" aria-pressed={paint.kind === 'online'} className={paint.kind === 'online' ? 'active' : ''} onClick={() => setPaint({ ...paint, kind: 'online' })}><i className="cal2-dot is-online" /> Ainult veebitunnid</button>
          <button type="button" aria-pressed={paint.kind === 'busy'} className={paint.kind === 'busy' ? 'active' : ''} onClick={() => setPaint({ ...paint, kind: 'busy' })}><i className="cal2-dot is-busy" /> Hõivatud (tunde ei saa panna)</button>
        </div>
        <label className="checkbox-field"><input type="checkbox" checked={paint.weekly} onChange={(event) => setPaint({ ...paint, weekly: event.target.checked })} /> <span>Kordub iga nädal</span></label>
        <span className="cal2-paint__hint">{paintSaving ? 'Salvestan…' : 'Lohista kalendris üle aja, et see märkida. Klõps märgitud alal eemaldab selle.'}</span>
        <Button variant="secondary" onClick={() => setPaint(null)}>Valmis</Button>
      </div>
    ) : bandTeacher && availabilityFor(bandTeacher)?.slots?.length ? <p className="cal2-legend"><i className="cal2-dot is-free" /> vaba aeg <i className="cal2-dot is-online" /> ainult veebitunnid <i className="cal2-dot is-busy" /> hõivatud — sinna tundi panna ei saa</p> : null}
    {showUnplanned && unplanned.length ? (
      <section className="cal2-unplanned" aria-label="Õpilased ilma tulevase tunnita">
        <div className="cal2-unplanned__head"><strong>Neil õpilastel ei ole kalendris ühtegi tulevast tundi</strong><button type="button" className="link-button" onClick={() => setShowUnplanned(false)}>Peida</button></div>
        <ul>
          {unplanned.map(({ student, lastLesson }) => (
            <li key={student.id}>
              <span><strong>{student.name}</strong><small>{[isAdmin && !teacherOnly ? (student.teacher || 'õpetaja määramata') : '', student.level, lastLesson ? `viimane tund ${lastLesson}` : 'tunde pole olnud'].filter(Boolean).join(' · ')}</small></span>
              <Button onClick={() => openCreate(anchor, '09:00', student.id)}><Plus size={15} /> Lisa tund</Button>
              <select aria-label={`Paus: ${student.name}`} value="" disabled={pausing === student.id} onChange={(event) => { if (event.target.value) pauseStudent(student, Number(event.target.value)); }}>
                <option value="">Paus…</option>
                <option value="14">2 nädalat</option>
                <option value="30">1 kuu</option>
                <option value="90">3 kuud</option>
              </select>
            </li>
          ))}
        </ul>
        <p className="form-hint">Paus peidab õpilase sellest nimekirjast valitud ajaks (nt puhkus). Arhiveeritud õpilasi siin ei ole.</p>
      </section>
    ) : null}
    {actionError ? <div className="action-error" role="alert">{actionError}<button aria-label="Sulge" onClick={() => setActionError('')}>×</button></div> : null}

    <div className={`cal2-main ${panelItem ? 'has-panel' : ''}`}>
      <div className="cal2-view">
        {view === 'month' ? <div className="month-grid">{dates.map((date) => { const daily = occurrences.filter((item) => item.occurrenceDate === date); const inMonth = date.slice(0, 7) === anchor.slice(0, 7); return <section className={`${date === today ? 'is-today ' : ''}${inMonth ? '' : 'is-outside'}`} key={date}><button className="month-day" onClick={() => { setAnchor(date); setView('day'); }}>{date.slice(-2)}</button><div>{daily.slice(0, 3).map((item) => <LessonButton compact item={item} onClick={openPanel} onComplete={quickDone} completing={false} key={item.occurrenceId} />)}{daily.length > 3 ? <button className="more-lessons" onClick={() => { setAnchor(date); setView('day'); }}>+{daily.length - 3} veel</button> : null}</div></section>; })}</div>
          : narrow ? agenda(view === 'day' ? occurrences.filter((item) => item.occurrenceDate === anchor) : occurrences)
            : <>
              <TimeGrid
                columns={view === 'day' ? dayColumns : weekColumns}
                allowColumnChange={view === 'week'}
                showTeacher={!filters.teacher && !teacherOnly && view === 'week'}
                canDrag={(item) => canMove(item) && (!item.isGroup || isAdmin) && !isGoogleOwned(item)}
                onSlot={(column, time) => openCreate(column.date, time)}
                onOpen={openPanel}
                onQuickDone={quickDone}
                onMove={onMove}
                bands={bandsFor}
                paint={paint && paintTeacher ? paint : null}
                onPaint={onPaint}
                onBandClick={onBandClick}
              />
              {!occurrences.length ? <p className="cal2-empty">{hasActiveFilters ? <>Filtritele vastavaid tunde ei leitud · <button type="button" className="link-button" onClick={() => setFilters(emptyFilters())}>Tühjenda filtrid</button></> : 'Valitud perioodil tunde ei ole — klõpsa kalendris vabal ajal, et lisada tund.'}</p> : null}
            </>}
      </div>
      {panelItem ? (
        <LessonPanel
          key={panelItem.occurrenceId}
          item={panelItem}
          history={panelItem.isGroup ? [] : historyOf(panelItem.studentId)}
          catalog={catalog}
          library={libraryState.data}
          loadingLibrary={libraryState.loading}
          student={studentMap.get(panelItem.studentId)}
          saving={panelSaving}
          error={panelError}
          onClose={() => setPanelKey('')}
          onDone={markDone}
          onUpdateDetails={lessonRepository.updateDetails ? updateDetails : undefined}
          onEdit={() => openEdit(panelItem)}
          onCancelLesson={cancelOccurrence}
          onDeleteLesson={() => setDeleteAsk(panelItem)}
          onChangeMark={(status) => fixMark('change', status)}
          onRemoveMark={() => fixMark('remove')}
          onCancelGroupLesson={isAdmin && panelItem.isGroup ? cancelGroupOccurrence : undefined}
          onStartLive={startLive}
          startingLive={startingLive}
          liveBlocked={panelItem.isGroup ? '' : !studentMap.get(panelItem.studentId) ? 'Õpilase kaarti ei leitud.' : studentAccountUid(studentMap.get(panelItem.studentId)) ? '' : 'Õpilasel pole veel sisselogimiskontot: seo konto õpilase kaardil, siis saab tunni alustada.'}
          today={today}
        >
          {panelItem.isGroup ? (
            <div className="attendance-sheet lp-attendance">
              {students.items.filter((student) => panelItem.studentIds.includes(student.id)).map((student) => {
                const current = panelItem.attendance?.[`${student.id}_${panelItem.occurrenceDate}`]?.status || '';
                return <section key={student.id}><div><strong>{student.name}</strong><small>{student.level || 'Tase puudub'}</small></div><div><Button variant={current === 'coming' ? 'primary' : 'secondary'} disabled={Boolean(attendanceSaving)} onClick={() => setAttendance(student.id, 'coming')}>Kohal</Button><Button variant={current === 'absent' ? 'danger' : 'secondary'} disabled={Boolean(attendanceSaving)} onClick={() => setAttendance(student.id, 'absent')}>Puudub</Button><Button variant="secondary" disabled={Boolean(attendanceSaving)} onClick={() => setAttendance(student.id, current ? 'clear' : 'warned')}>{current ? 'Tühista märge' : 'Teatas'}</Button></div></section>;
              })}
            </div>
          ) : null}
        </LessonPanel>
      ) : null}
    </div>

    {undo ? <div className="cal2-toast" role="status"><span>{undo.label}</span><button type="button" onClick={undoMove}><Undo2 size={15} /> Tühista</button><button type="button" aria-label="Sulge" onClick={() => setUndo(null)}><X size={15} /></button></div> : null}

    <Modal open={Boolean(moveAsk)} title="Korduv tund" onClose={() => setMoveAsk(null)} footer={<><Button variant="secondary" onClick={() => setMoveAsk(null)}>Loobu</Button><Button variant="secondary" onClick={() => executeMove(moveAsk, 'series')}>See ja kõik järgmised</Button><Button onClick={() => executeMove(moveAsk, 'single')}>Ainult see tund</Button></>}>
      {moveAsk ? <p>Tõsta <b>{moveAsk.item.studentName}</b> tund ({moveAsk.item.occurrenceDate} {moveAsk.item.time}) uuele ajale <b>{moveAsk.toDate} {moveAsk.time}</b>?</p> : null}
    </Modal>

    <Modal open={Boolean(deleteAsk)} title="Kustuta tund" onClose={() => setDeleteAsk(null)} footer={deleteAsk?.recurring
      ? <><Button variant="secondary" onClick={() => setDeleteAsk(null)}>Loobu</Button><Button variant="danger" onClick={() => deleteLesson('series')}>See ja kõik järgmised (lõpeta sari)</Button><Button variant="danger" onClick={() => deleteLesson('single')}>Ainult see tund</Button></>
      : <><Button variant="secondary" onClick={() => setDeleteAsk(null)}>Loobu</Button><Button variant="danger" onClick={() => deleteLesson('single')}>Kustuta</Button></>}>
      {deleteAsk ? <p>Kustutada <b>{deleteAsk.studentName || 'õpilase'}</b> tund {new Date(`${deleteAsk.occurrenceDate}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'long', day: 'numeric', month: 'long' })} kell {deleteAsk.time}? Tund kaob kalendrist ja Google Calendarist; kohe pärast saad selle tagasi võtta.{deleteAsk.recurring ? ' Tund kordub igal nädalal: vali, kas kustutada ainult see kuupäev või ka kõik järgmised.' : ''}</p> : null}
    </Modal>

    <Modal open={modal} title={editing ? 'Muuda tundi' : 'Uus tund'} onClose={closeModal} footer={<>{editing && !editing.recurring ? <Button variant="danger" disabled={saving || Boolean(editing.lessonRecordId)} onClick={async () => { if (!globalThis.confirm('Kas tühistada see tund?')) return; setSaving(true); try { await scheduleRepository.cancel(editing.id, editing); setUndo({ label: `${editing.studentName} tühistatud ${editing.occurrenceDate || editing.date}`, plan: { undo: [{ op: 'patch', id: editing.id, fields: { status: editing.status || 'Planeeritud' } }] }, created: {}, item: editing }); setModal(false); setEditing(null); setPanelKey(''); await state.reload(); } catch (error) { setActionError(error.message); } finally { setSaving(false); } }}><XCircle size={17} /> Tühista tund</Button> : null}{editing?.recurring && editing.occurrenceDate ? <Button variant="danger" disabled={saving} onClick={() => { setModal(false); setDeleteAsk(editing); }}><XCircle size={17} /> Lõpeta või kustuta…</Button> : null}<span className="modal__footer-spacer" /><Button variant="secondary" onClick={closeModal}>Loobu</Button><Button loading={saving} type="submit" form="lesson-form">{editing ? 'Salvesta muudatused' : 'Salvesta tund'}</Button></>}><form id="lesson-form" className="form-grid" onSubmit={submit}>{actionError && modal ? <p className="form-error form-grid__wide" role="alert">{actionError}</p> : null}<StudentCombobox students={students.items} value={form.studentId} onChange={(studentId) => setForm({ ...form, studentId, subject: '' })} />{formTracks.length > 1 ? <div className="field form-grid__wide"><label className="field__label" htmlFor="lesson-track">Õppesuund</label><select id="lesson-track" className="cal2-select" value={lessonSubject(formStudent, formTeacher.teacherUid)} onChange={(event) => { const track = formTracks.find((item) => item.subject === event.target.value); setForm({ ...form, subject: event.target.value, ...(isAdmin && track?.teacherUid ? { teacherUid: track.teacherUid } : {}) }); }}>{formTracks.map((track) => <option value={track.subject} key={track.id || track.subject}>{track.subject}{track.teacher ? ` · ${track.teacher}` : ''}</option>)}</select></div> : null}{isAdmin && (teacherState.data || []).length ? <div className="field form-grid__wide"><label className="field__label" htmlFor="lesson-teacher">Õpetaja</label><select id="lesson-teacher" className="cal2-select" value={form.teacherUid} onChange={(event) => setForm({ ...form, teacherUid: event.target.value })}><option value="">{studentMap.get(form.studentId)?.teacher ? `Õpilase õpetaja (${studentMap.get(form.studentId).teacher})` : 'Õpilase õpetaja'}</option>{teacherState.data.map((teacher) => <option value={teacher.id} key={teacher.id}>{teacher.name}</option>)}</select></div> : null}<Input label="Kuupäev" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /><Input label="Kellaaeg" type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required /><Input label="Kestus minutites" type="number" min="5" step="5" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} required />{editing ? null : <label className="checkbox-field"><input type="checkbox" checked={form.recurring} onChange={(event) => setForm({ ...form, recurring: event.target.checked })} /><span>Kordub igal nädalal</span></label>}<label className="checkbox-field"><input type="checkbox" checked={Boolean(form.online)} onChange={(event) => setForm({ ...form, online: event.target.checked })} /><span>Veebitund (online)</span></label>{parallel.length ? <p className="form-grid__wide form-hint cal2-parallel" role="status">Samal ajal on ka: {parallel.map((item) => `${item.time} ${item.studentName || 'tund'}`).join(', ')}. Tunnid toimuvad paralleelselt.</p> : null}{editing?.recurring ? <p className="form-grid__wide form-hint">Siin muudetud aeg kehtib kogu sarjale. Ühe tunni muutmiseks lohista see kalendris.</p> : null}</form></Modal>
  </div>;
}
