import { CalendarClock, CalendarRange, ChevronLeft, ChevronRight, DoorOpen, Plus, Search, StickyNote, Undo2, UserRoundX, UsersRound, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, EmptyState, ErrorState, Input, LoadingState, Modal } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { isSameTeacher } from '../../utils/teachers.js';
import { financeApi } from '../../services/firebase/financeApi.js';
import { classroomsService, groupsService, lessonChangeRequestsService, lessonNotesService, lessonsService, libraryService, liveLessonInvitationsService, scheduleService, studentAvailabilityService, studentsService, teacherAvailabilityService, teachersService, websiteLeadsService } from '../../services/firebase/index.js';
import { timesFromLeads, withLeadTimes } from './leadTimes.js';
import ChangeRequestsPanel from './ChangeRequestsPanel.jsx';
import { studentAccountUid } from '../live-classroom/invitationModel.js';
import { isLessonKey, looseLessonKey, parseHeld, rememberLessonLink } from '../live-classroom/lessonLink.js';
import { handoffTopic, takeLessonHandoff } from '../live-classroom/lessonHandoff.js';
import { canQuickCompleteLesson } from './quickAttendance.js';
import { scheduleOverlaps } from '../../services/firebase/schedule.js';
import { ROLES } from '../../utils/roles.js';
import { datesForView, filterCalendarEvents, withoutArchivedFuture, groupCalendarEvents, occurrencesForDates, withCurrentStudentNames, withLessonSubjects, resolveOccurrenceRecord, shiftDate, startOfWeek, toIsoDate } from './calendarView.js';
import { canMove, planDelete, planMove, planSubstitute, teacherTone, toClock, toMinutes, tonesOf } from './calendarGrid.js';
import { buildTopicCatalog, suggestTopic, topicFields, topicLine } from './lessonTopic.js';
import TimeGrid from './TimeGrid.jsx';
import { unplannedStudents } from './unplannedStudents.js';
import { DAY_IDS, bandsOn, cellStatus, paintSlot, setCellStatus, slotsOn } from './availabilityModel.js';
import CellStatusMenu from './CellStatusMenu.jsx';
import RoomsDialog from './RoomsDialog.jsx';
import { assignRoom, mergedBookings, roomChoices, roomConflict } from './roomModel.js';
import LessonPanel from './LessonPanel.jsx';
import AdminNoteBox from './AdminNoteBox.jsx';
import { notesFor } from '../../services/firebase/lessonNotes.js';
import QuickAttendanceAction from './QuickAttendanceAction.jsx';
import CalendarGoogleChip from '../google-calendar/CalendarGoogleChip.jsx';
import { isGoogleOwned } from '../google-calendar/googleCalendarModel.js';
import './calendarUx.css';
import './calendarV2.css';
import SubjectTag from './SubjectTag.jsx';
import StudentTimesPanel from './StudentTimesPanel.jsx';
import TeacherWeekEditor from './TeacherWeekEditor.jsx';
import PlannerView from './PlannerView.jsx';
import { candidateTimes, learnedTimes, lessonsOn, overlayBandsOn, studentBandsOn, planningWarnings, timesLine, withLearnedTimes } from './studentTimesModel.js';

const blankLesson = () => ({ studentId: '', teacherUid: '', subject: '', date: toIsoDate(), time: '09:00', duration: 60, recurring: false, online: false, roomId: '', status: 'Planeeritud' });
const viewLabels = { day: 'Päev', week: 'Nädal', month: 'Kuu' };
const isTeacherAccount = (staff) => staff.role === 'teacher' || (Array.isArray(staff.roles) && staff.roles.includes('teacher'));
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
        <strong><SubjectTag subject={item.subject} />{item.studentName || 'Õpilane'}</strong>
        {compact ? null : <small>{item.teacher || 'Õpetaja'} · {item.duration} min</small>}
      </button>
      {compact ? null : <QuickAttendanceAction item={item} saving={completing} onComplete={onComplete} />}
    </div>
  );
}


// runs `run` once when mounted (the Live Classroom handoff: mark the lesson held)
function RunOnce({ run }) {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    run();
  }, [run]);
  return null;
}

export default function CalendarPage({ scheduleRepository = scheduleService, studentRepository = studentsService, groupRepository = groupsService, lessonRepository = lessonsService, libraryRepository = libraryService, googleCalendarRepository, teacherRepository = teachersService, liveRepository = liveLessonInvitationsService, availabilityRepository = teacherAvailabilityService, changeRequests = lessonChangeRequestsService, takeHandoff = takeLessonHandoff, noteRepository = lessonNotesService, roomRepository = classroomsService, financeRepository = financeApi, studentTimesRepository = studentAvailabilityService, leadsRepository = websiteLeadsService }) {
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
  // the form's „Salvesta ikkagi” step: the lesson (teacher, date, time, …) the red / yellow warning was shown for
  const [windowAsk, setWindowAsk] = useState('');
  const [actionError, setActionError] = useState('');
  // „Ei saa tulla?”: pending requests of this teacher (an admin: all), live
  const [changeRequestList, setChangeRequestList] = useState([]);
  const [requestBusy, setRequestBusy] = useState('');
  const [panelKey, setPanelKey] = useState(linkedLesson);
  // „Lõpeta tund” in the Live Classroom left the note and the worksheets' topics for this lesson: mark it held once
  const [handoff, setHandoff] = useState(() => (linkedLesson ? takeHandoff(linkedLesson) : null));
  const [autoMarked, setAutoMarked] = useState('');
  // `?student=<id>&held=<date>|<HH:MM>|<min>`: a Live Classroom lesson that was not in the calendar has just ended
  const [held] = useState(() => (searchParams.get('student') ? parseHeld(searchParams.get('held')) : null));
  const [heldHandoff] = useState(() => (held ? takeHandoff(looseLessonKey(searchParams.get('student'), held.date)) : null));
  const [heldState, setHeldState] = useState('');
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
  // „Minu ajad” / „Õpetaja ajad”: the week grid editor (Oleksiy 2026-10-24); `?ajad=1` opens it
  const [weekEditor, setWeekEditor] = useState(() => searchParams.get('ajad') === '1');
  // a click on an empty cell: { column, date, start, end, x, y } — its status menu (Oleksiy 2026-10-15)
  const [cellMenu, setCellMenu] = useState(null);
  // students with no lesson ahead (`?unplanned=1` opens the list, e.g. from Ülevaade)
  const [showUnplanned, setShowUnplanned] = useState(() => searchParams.get('unplanned') === '1');
  const [pausing, setPausing] = useState('');
  // „Sobivad ajad” over the grid (owner 2026-10-24): the chosen students' suitable times; `?times=<id>` opens it
  const [fitOpen, setFitOpen] = useState(() => Boolean(searchParams.get('times')));
  const [fitIds, setFitIds] = useState(() => (searchParams.get('times') && searchParams.get('times') !== '1' ? [searchParams.get('times')] : []));
  // „Planeerija” (owner 2026-10-25): the whole weekly timetable at once; `?planeerija=1` opens it
  const [dragging, setDragging] = useState(null); // the lesson being dragged in the grid (its student's times show)
  const [plannerOpen, setPlannerOpen] = useState(() => searchParams.get('planeerija') === '1');
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  useEffect(() => {
    if (!changeRequests?.subscribePending || !user?.uid) return undefined;
    try { return changeRequests.subscribePending({ teacherUid: user.uid, all: isAdmin }, setChangeRequestList, () => setChangeRequestList([])); } catch { return undefined; }
  }, [changeRequests, user?.uid, isAdmin]);

  const teacherOnly = user.roles.includes(ROLES.TEACHER) && !isAdmin;
  const state = useAsyncData(async () => Promise.all([
    scheduleRepository.list(teacherOnly ? { teacherUid: user.uid } : {}),
    studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) }),
    groupRepository.list(teacherOnly ? { teacherUid: user.uid, teacherName: user.displayName } : {}),
    lessonRepository.listForCalendar(teacherOnly ? { teacherUid: user.uid } : {}),
    studentRepository.list({ status: 'archived', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) }).then((result) => result.items || []).catch(() => []),
  ]), [groupRepository, lessonRepository, scheduleRepository, studentRepository, teacherOnly, user.displayName, user.uid]);
  // the students' „Sobivad ajad” (studentAvailability): an administrator reads all, a teacher their own students' cards
  const scopedStudentIds = teacherOnly && state.data ? state.data[1].items.map((student) => student.id).join(',') : '';
  const studentTimesState = useAsyncData(async () => {
    if (!studentTimesRepository?.list || (teacherOnly && !scopedStudentIds)) return [];
    try { return await studentTimesRepository.list(teacherOnly ? scopedStudentIds.split(',') : null); } catch { return []; }
  }, [studentTimesRepository, teacherOnly, scopedStudentIds]);
  // answers sent through the public /ajad link (enquiries), joined to the cards they belong to
  const leadTimesState = useAsyncData(() => (leadsRepository?.list ? leadsRepository.list().catch(() => []) : Promise.resolve([])), [leadsRepository]);
  // Admin can give a lesson to another teacher (substitution); teachers always plan their own lessons.
  const teacherState = useAsyncData(() => (isAdmin && teacherRepository?.list ? teacherRepository.list() : Promise.resolve([])), [isAdmin, teacherRepository]);
  const availabilityState = useAsyncData(() => (availabilityRepository?.list ? availabilityRepository.list().catch(() => []) : Promise.resolve([])), [availabilityRepository]);
  // admin notes on lessons (Oleksiy 2026-10-15): all for an administrator, the own lessons' notes for a teacher
  // rooms and every lesson's room booking (Oleksiy 2026-10-15); bookings saved in this session count at once (the
  // server's booking follows a moment later)
  const roomsState = useAsyncData(() => (roomRepository?.list ? roomRepository.list().catch(() => []) : Promise.resolve([])), [roomRepository]);
  // the server's bookings are read again on every calendar reload (Oleksiy 2026-10-22, „Tühista” did not free the
  // room): a teacher sees other teachers' lessons only through them, so a lesson cancelled elsewhere frees its room
  const hasRooms = (roomsState.data || []).some((room) => room.active !== false);
  const bookingsState = useAsyncData(() => (hasRooms && roomRepository?.bookings ? roomRepository.bookings().catch(() => []) : Promise.resolve([])), [roomRepository, hasRooms, state.data]);
  const [localBookings, setLocalBookings] = useState({});
  const [roomsOpen, setRoomsOpen] = useState(false);
  const notesState = useAsyncData(() => (noteRepository?.list ? noteRepository.list(teacherOnly ? { teacherUid: user.uid } : {}).catch(() => []) : Promise.resolve([])), [noteRepository, teacherOnly, user.uid]);
  const libraryState = useAsyncData(() => (libraryRepository?.list ? libraryRepository.list() : Promise.resolve(null)), [libraryRepository]);
  const catalog = useMemo(() => (libraryState.data ? buildTopicCatalog(libraryState.data.curriculumLessons) : null), [libraryState.data]);
  const dates = useMemo(() => datesForView(anchor, view), [anchor, view]);

  useEffect(() => {
    if (!undo) return undefined;
    const timer = globalThis.setTimeout(() => setUndo(null), 8000);
    return () => globalThis.clearTimeout(timer);
  }, [undo]);

  // the planner: students without „Sobivad ajad” get the times of their past lessons (computed when it opens)
  const learned = useMemo(() => (plannerOpen && state.data ? learnedTimes({ events: state.data[0] || [], lessons: state.data[3] || [], today: toIsoDate() }) : new Map()), [plannerOpen, state.data]);
  if (state.loading) return <LoadingState label="Laen kalendrit…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const [scheduleEvents, students, groups, lessonRecords] = state.data;
  const studentMap = new Map(students.items.map((student) => [student.id, student]));
  const archivedIds = new Set((state.data[4] || []).filter((student) => student.active === false).map((student) => student.id));
  const events = [...withLessonSubjects(withCurrentStudentNames(withoutArchivedFuture(scheduleEvents, archivedIds, toIsoDate()), studentMap), studentMap), ...groupCalendarEvents(groups)];
  const filteredEvents = filterCalendarEvents(events, filters);
  const withRecord = (item) => {
    const resolved = resolveOccurrenceRecord(item, lessonRecords);
    const notes = notesFor(notesState.data || [], item);
    const noted = notes.length ? { ...resolved, adminNote: notes.map((note) => note.text).join('\n') } : resolved;
    return resolved.record ? { ...noted, recordTopic: topicLine(resolved.record) || resolved.record.topic || '' } : noted;
  };
  const saveAdminNote = async (item, { date, text }) => {
    await noteRepository.save({ scheduleId: item.id, date, teacherUid: item.teacherUid || '', studentName: item.studentName || '', text, user });
    await notesState.reload();
  };
  const occurrences = occurrencesForDates(filteredEvents, dates).map(withRecord);
  // teachers of the lessons plus (admin) every active teacher account, so a new teacher without lessons can be chosen;
  // administrators and the accountant without the teacher role are not teachers (owner 2026-10-28)
  const lessonTeachers = [...new Map(events.filter((item) => item.teacher).map((item) => [item.teacherUid || item.teacher, { id: item.teacherUid || item.teacher, name: item.teacher }])).values()];
  const teachers = [
    ...lessonTeachers,
    ...(teacherState.data || []).filter((staff) => !staff.disabled && isTeacherAccount(staff) && !lessonTeachers.some((teacher) => teacher.id === staff.id || isSameTeacher(teacher.name, staff.name))).map((staff) => ({ id: staff.id, name: staff.name })),
  ].sort((a, b) => a.name.localeCompare(b.name, 'et'));
  const tones = tonesOf(teacherState.data);
  // the teachers who can take over a lesson („Asendab”): active teacher accounts
  const substitutes = (teacherState.data || []).filter((staff) => !staff.disabled && isTeacherAccount(staff)).map((staff) => ({ id: staff.id, name: staff.name }));
  const hasActiveFilters = Boolean(filters.search || filters.teacher || filters.student);
  const today = toIsoDate();
  const historyOf = (studentId) => lessonRecords.filter((lesson) => lesson.studentId === studentId && ['Toimunud', undefined, ''].includes(lesson.status)).sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`));
  const panelItem = panelKey ? occurrencesForDates(events, [panelKey.split('|')[1]]).map(withRecord).find((item) => item.occurrenceId === panelKey.split('|')[0]) || null : null;
  const autoMarkReady = Boolean(handoff && panelItem && !panelItem.isGroup && canQuickCompleteLesson(panelItem) && panelItem.occurrenceDate <= today && !libraryState.loading);
  const autoMark = async () => {
    const item = panelItem;
    const from = handoff;
    setHandoff(null);
    setPanelSaving(true); setPanelError('');
    try {
      const suggestion = catalog ? suggestTopic(catalog, { studentLevel: studentMap.get(item.studentId)?.level || '', history: historyOf(item.studentId), plan: studentMap.get(item.studentId)?.studyPlan }) : null;
      await lessonRepository.completeFromSchedule(item, user, topicFields(handoffTopic(catalog, from, suggestion), from.notes));
      setAutoMarked(item.occurrenceId);
      await state.reload();
    } catch (error) { setPanelError(`${error.message || 'Salvestamine ebaõnnestus.'} Märgi tund siin käsitsi.`); } finally { setPanelSaving(false); }
  };
  // the lesson that just ended without a calendar lesson: mark that day's planned lesson, or add one and mark it
  const heldStudent = held ? studentMap.get(searchParams.get('student') || '') : null;
  const heldDay = heldStudent ? occurrencesForDates(events, [held.date]).map(withRecord).filter((item) => !item.isGroup && item.studentId === heldStudent.id) : [];
  const heldPlanned = heldDay.find(canQuickCompleteLesson) || null;
  const heldMarked = heldDay.some((item) => item.lessonRecordId || item.status === 'Toimunud');
  const usualDuration = Number(events.find((item) => !item.isGroup && item.studentId === heldStudent?.id && Number(item.duration))?.duration) || held?.duration || 60;
  const markHeldLesson = async () => {
    setHeldState('saving'); setActionError('');
    try {
      let item = heldPlanned;
      if (!item) {
        const teacherFields = lessonTeacher(heldStudent);
        const subject = lessonSubject(heldStudent, teacherFields.teacherUid);
        const candidate = { ...blankLesson(), studentId: heldStudent.id, studentName: heldStudent.name, date: held.date, time: held.time, duration: usualDuration, ...teacherFields, ...(subject ? { subject } : {}) };
        if (!candidate.subject) delete candidate.subject;
        const created = await scheduleRepository.create(candidate);
        item = { ...candidate, id: created.id, occurrenceDate: held.date, occurrenceId: `${created.id}:${held.date}` };
      }
      const suggestion = catalog ? suggestTopic(catalog, { studentLevel: heldStudent.level || '', history: historyOf(heldStudent.id), plan: heldStudent.studyPlan }) : null;
      await lessonRepository.completeFromSchedule(item, user, topicFields(handoffTopic(catalog, heldHandoff, suggestion), heldHandoff?.notes || ''));
      setHeldState('done');
      await state.reload();
    } catch (error) { setHeldState(''); setActionError(error.message || 'Tundi ei saanud märkida.'); }
  };
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
  const saveWindows = async (slots, owner = paintTeacher) => {
    if (!owner) return false;
    setPaintSaving(true); setActionError('');
    try {
      await availabilityRepository.save({ teacherUid: owner.uid, teacherName: owner.name, slots, user });
      await availabilityState.reload();
      return true;
    } catch (error) { setActionError(error.message || 'Aegu ei saanud salvestada.'); return false; } finally { setPaintSaving(false); }
  };
  // whose time a cell is: the teacher's own column (an administrator's day view), the teacher, or the chosen teacher
  const cellTeacher = (column) => {
    if (column.key.startsWith('t:')) {
      const uid = column.key.slice(2);
      if (uid === '—') return paintTeacher;
      if (!isAdmin && uid !== user.uid) return null;
      // a column keyed by a teacher's name (an old lesson without the account) has no windows to set
      const known = uid === user.uid || teachers.some((teacher) => teacher.id === uid) || availabilityList.some((entry) => entry.teacherUid === uid);
      return known ? { uid, name: teachers.find((teacher) => teacher.id === uid)?.name || column.title || '' } : null;
    }
    return paintTeacher;
  };
  const openCell = (column, time, point = {}) => {
    const start = time;
    const end = toClock(Math.min(toMinutes(time) + 30, 24 * 60));
    setCellMenu({ column, date: column.date, start, end, x: point.x, y: point.y });
  };
  const setCell = async (kind, weekly) => {
    const menu = cellMenu;
    const owner = cellTeacher(menu.column);
    if (!owner) return;
    let slots;
    try { slots = setCellStatus(availabilityFor(owner.uid)?.slots || [], { date: menu.date, weekly, start: menu.start, end: menu.end, kind }); } catch (error) { setActionError(error.message); return; }
    if (await saveWindows(slots, owner)) setCellMenu(null);
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
  // A teacher's red (busy) or yellow (online only) window is a warning, not a ban (Oleksiy 2026-10-23: „нужно
  // предупреждение, что вы собираетесь перенести урок на час, отмеченный красным, а не запрет”): the form asks
  // „Salvesta ikkagi”, a drag „Tõsta ikkagi”. → the warning text, or ''
  const teacherWindowWarning = ({ teacherUid, teacher, date, time, duration, online, recurring }) => planningWarnings({
    lesson: { date, time, duration, online: Boolean(online), recurring: Boolean(recurring) }, teacherUid, teacherName: teacher,
    teacherAvailability: availabilityFor(teacherUid) || availabilityFor(teacher), includeTeacherLessons: false,
  }).find((warning) => warning.window === 'busy' || warning.window === 'online')?.text || '';

  const navigatePeriod = (direction) => setAnchor((current) => view === 'month' ? shiftMonth(current, direction) : shiftDate(current, direction * (view === 'week' ? 7 : 1)));
  const openCreate = (date = anchor, time = '09:00', studentId = '') => { setWindowAsk(''); setEditing(null); setForm({ ...blankLesson(), date, time, ...(studentId ? { studentId } : {}) }); setModal(true); setActionError(''); };
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
    setWindowAsk('');
    setEditing(item);
    setForm({ studentId: item.studentId || '', teacherUid: item.teacherUid || '', subject: item.subject || '', date: item.recurring ? item.startDate : (item.occurrenceDate || item.date), time: item.time || '09:00', duration: item.duration || 60, recurring: Boolean(item.recurring), online: Boolean(item.online), roomId: item.roomId || '', status: item.status || 'Planeeritud' });
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
  const rooms = roomsState.data || [];
  const bookings = mergedBookings(bookingsState.data || [], scheduleEvents, localBookings);
  const activeRooms = rooms.filter((room) => room.active !== false);
  const formRoomChoices = modal && !form.online && activeRooms.length ? roomChoices(rooms, bookings, { ...form, startDate: form.date, excludedDates: editing?.excludedDates || [] }, editing?.id || '') : [];
  const formTracks = tracksOf(formStudent);
  // other lessons of the same teacher at the chosen time: allowed, just shown
  const formTeacher = lessonTeacher(formStudent);
  const formAskKey = JSON.stringify([formTeacher.teacherUid || formTeacher.teacher, form.date, form.time, Number(form.duration), Boolean(form.recurring), Boolean(form.online)]);
  const formWindowAsk = modal && windowAsk === formAskKey ? teacherWindowWarning({ ...form, ...formTeacher }) : '';
  const parallel = modal && form.date && form.time
    ? scheduleOverlaps(occurrencesForDates(events, [form.date]).map((item) => ({ ...item, date: item.occurrenceDate })), { ...form, ...formTeacher }, editing?.id)
    : [];

  // ── „Sobivad ajad” ───────────────────────────────────────────
  const studentTimes = withLeadTimes(new Map((studentTimesState.data || []).map((entry) => [entry.studentId || entry.id, entry])), timesFromLeads(leadTimesState.data || [], students.items));
  const plannerTimes = withLearnedTimes(studentTimes, learned);
  const fitTeacher = teacherOnly ? { uid: user.uid, name: user.displayName } : filters.teacher ? { uid: filters.teacher, name: teachers.find((teacher) => teacher.id === filters.teacher)?.name || '' } : null;
  const fitStudents = fitOpen ? fitIds.map((id) => studentMap.get(id)).filter(Boolean) : [];
  const FIT_TITLES = { best: '★ sobib kõige paremini', ok: 'sobib', some: 'sobib osadele' };
  const marksFor = (column) => {
    const shaded = overlayBandsOn(fitStudents.map((student) => ({ name: student.name, availability: studentTimes.get(student.id) })), column.date)
      .map((band) => ({ ...band, title: `${FIT_TITLES[band.kind]} ${toClock(band.start)}–${toClock(band.end)}: ${band.names.join(', ')}` }));
    // the chosen students' lessons that this column does not show (another teacher, another subject, a group)
    const shown = new Set(column.items.map((item) => item.id));
    const taken = lessonsOn(events, column.date, { studentIds: fitStudents.map((student) => student.id) }).filter(({ event, student }) => student && !shown.has(event.id))
      .map(({ event }) => ({ kind: 'taken', start: toMinutes(event.time), end: toMinutes(event.time) + (Number(event.duration) || 60), title: `Õpilasel on tund ${event.time}: ${event.studentName || ''}${event.teacher ? ` (${event.teacher})` : ''}` }));
    return [...shaded, ...taken];
  };
  // while a lesson is dragged: that student's suitable times light up in every column (owner 2026-10-27)
  const dragMarksFor = (column) => {
    const availability = dragging && !dragging.isGroup ? studentTimes.get(dragging.studentId) : null;
    return studentBandsOn(availability, column.date).map((band) => ({ kind: band.kind === 'best' ? 'best' : 'ok', start: band.start, end: band.end, title: `${dragging.studentName || 'Õpilane'}: ${band.kind === 'best' ? '★ eelistatud' : 'sobib'} ${toClock(band.start)}–${toClock(band.end)}` }));
  };
  const gridMarks = dragging && !dragging.isGroup && studentTimes.get(dragging.studentId)?.slots?.length ? dragMarksFor : fitStudents.length ? marksFor : null;
  const warningsFor = ({ lesson, student, teacherUid, teacherName, includeTeacherLessons = true }) => planningWarnings({
    lesson, student, studentAvailability: student ? studentTimes.get(student.id) : null, teacherUid, teacherName,
    teacherAvailability: availabilityFor(teacherUid) || availabilityFor(teacherName), events, includeTeacherLessons,
  }).map((warning) => warning.text);
  // the new / edited lesson: the teacher's parallel lessons are listed below already („Samal ajal on ka”)
  const formWarnings = modal && formStudent && form.date && form.time
    ? warningsFor({ lesson: { ...form, id: editing?.id || '' }, student: formStudent, teacherUid: formTeacher.teacherUid, teacherName: formTeacher.teacher, includeTeacherLessons: false })
    : [];
  const formNoTimes = Boolean(modal && formStudent && !studentTimesState.loading && !studentTimes.get(formStudent.id)?.slots?.length);
  // „Uus tund”: the student's own suitable times that are free for the teacher and the student in the next two weeks,
  // one click puts the date and time into the form (owner 2026-10-27: „чтобы не бегая по вкладкам поставить”)
  const formSuggestions = modal && formStudent && !formNoTimes ? candidateTimes({
    studentId: formStudent.id, studentAvailability: studentTimes.get(formStudent.id), teacherUid: formTeacher.teacherUid, teacherName: formTeacher.teacher,
    teacherAvailability: availabilityFor(formTeacher.teacherUid) || availabilityFor(formTeacher.teacher),
    events: events.filter((event) => !editing || event.id !== editing.id), dates: Array.from({ length: 14 }, (_, index) => shiftDate(toIsoDate(), index)),
    duration: Number(form.duration) || 60, online: Boolean(form.online), recurring: editing ? Boolean(editing.recurring) : Boolean(form.recurring), rooms, bookings, limit: 10,
  }).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)) : [];
  const openFit = (student) => {
    setFitOpen(true);
    setFitIds((current) => (current.includes(student.id) ? current : [...current, student.id]));
    if (isAdmin && !filters.teacher && student.teacherUid) setFilters((current) => ({ ...current, teacher: student.teacherUid }));
  };
  const pickCandidate = ({ date, time, duration, online, recurring, studentId, teacherUid }) => {
    openCreate(date, time, studentId);
    setForm((current) => ({ ...current, duration, online, recurring, ...(isAdmin && (teacherState.data || []).some((teacher) => teacher.id === teacherUid) ? { teacherUid } : {}) }));
  };

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setActionError('');
    try {
      const student = studentMap.get(form.studentId);
      if (!student) throw new Error('Vali õpilane.');
      const teacherFields = lessonTeacher(student);
      const subject = lessonSubject(student, teacherFields.teacherUid);
      const candidate = { ...form, studentName: student.name, ...teacherFields, ...(subject ? { subject } : {}) };
      if (!candidate.subject) delete candidate.subject;
      // several students at the same time (or overlapping) are allowed; a red / yellow window asks once more
      if (teacherWindowWarning(candidate) && windowAsk !== formAskKey) { setWindowAsk(formAskKey); return; }
      // a lesson on site takes a free room; when all are taken it can only be an online lesson
      const room = assignRoom(rooms, bookings, { ...candidate, startDate: candidate.date, excludedDates: editing?.excludedDates || [] }, editing?.id || '');
      if (room.error) throw new Error(room.error);
      Object.assign(candidate, room);
      const saved = editing ? await scheduleRepository.update(editing.id, candidate, editing) : await scheduleRepository.create(candidate);
      const savedId = editing?.id || saved?.id;
      if (savedId) setLocalBookings((current) => ({ ...current, [savedId]: room.roomId ? { scheduleId: savedId, roomId: room.roomId, roomName: room.roomName, recurring: Boolean(candidate.recurring), date: candidate.date, startDate: candidate.date, day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(`${candidate.date}T12:00:00`).getDay()], excludedDates: editing?.excludedDates || [], time: candidate.time, duration: Number(candidate.duration) || 60, status: 'Planeeritud' } : null }));
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

  // confirm: the one lesson moves to the chosen time like a calendar drag (slot null: the teacher moved it already)
  const acceptChangeRequest = async (request, slot) => {
    setActionError('');
    setRequestBusy(`${request.id}|${slot ? `${slot.date} ${slot.time}` : 'manual'}`);
    try {
      if (slot) {
        const item = occurrencesForDates(events, [request.occurrenceDate]).find((entry) => entry.id === request.scheduleId);
        if (!item) throw new Error('Seda tundi ei leitud kalendris: see võib olla juba liigutatud. Liiguta tund ise ja vajuta „Liigutasin ise”.');
        const warnings = warningsFor({ lesson: { date: slot.date, time: slot.time, duration: item.duration, online: Boolean(item.online), id: item.id }, student: studentMap.get(item.studentId) || null, teacherUid: item.teacherUid, teacherName: item.teacher });
        if (warnings.length && !globalThis.confirm(`${warnings.join('\n')}\n\nTõstan tunni ikkagi?`)) return;
        await runOps(planMove(item, { toDate: slot.date, toTime: slot.time, duration: item.duration, scope: 'single' }).apply, item);
      }
      await changeRequests.decide(request.id, { accepted: true, chosen: slot, user });
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Tundi ei saanud üle viia.');
    } finally { setRequestBusy(''); }
  };
  // a notice of absence: the lesson is marked „Puudus (teatas ette)” and the notice answered
  const absentChangeRequest = async (request) => {
    setActionError('');
    setRequestBusy(`${request.id}|absent`);
    try {
      const item = occurrencesForDates(events, [request.occurrenceDate]).find((entry) => entry.id === request.scheduleId);
      if (!item) throw new Error('Seda tundi ei leitud kalendris: see võib olla juba liigutatud või tühistatud.');
      await lessonRepository.completeFromSchedule(item, user, { status: 'Puudus_p', notes: request.reason || '' });
      await changeRequests.decide(request.id, { accepted: true, chosen: null, note: 'Puudumine märgitud.', user });
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Puudumist ei saanud märkida.');
    } finally { setRequestBusy(''); }
  };
  const declineChangeRequest = async (request, note) => {
    setActionError('');
    setRequestBusy(`${request.id}|decline`);
    try { await changeRequests.decide(request.id, { accepted: false, note, user }); } catch (error) { setActionError(error.message || 'Vastust ei saanud saata.'); } finally { setRequestBusy(''); }
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
    if (item.roomId && !item.online && roomConflict(bookings, { date: toDate, time, duration, recurring: false }, item.roomId, item.id)) {
      setActionError(`${item.roomName || 'Kabinet'} on sel ajal hõivatud. Ava tund, vali teine kabinet või märgi see veebitunniks.`);
      return;
    }
    // warn (never block): outside the student's times, the teacher's or the student's other lesson, the teacher's windows
    const warnings = warningsFor({ lesson: { date: toDate, time, duration, online: Boolean(item.online), id: item.id }, student: item.isGroup ? null : studentMap.get(item.studentId) || null, teacherUid: item.teacherUid, teacherName: item.teacher });
    const move = { item, toDate, time, duration, warnings };
    if (item.recurring || warnings.length) setMoveAsk(move);
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
      const { homework, schoolCoveredReason = '', ...fields } = details;
      const lesson = await lessonRepository.completeFromSchedule(panelItem, user, fields);
      // „Kooli kulul” right away (Oleksiy 2026-10-19: a fourth way to close a lesson): held for the teacher, free for the
      // student; the audited finance route also gives back a credit the lesson took
      if (schoolCoveredReason && lesson?.id) {
        try { await financeRepository.setLessonBillingDisposition(lesson.id, 'school_covered', schoolCoveredReason); }
        catch (coverError) { await state.reload(); setPanelError(`Tund märgiti toimunuks, kuid „kooli kulul” ei salvestunud (${coverError.message || 'viga'}). Ava tund ja vajuta „Kooli kulul” uuesti.`); return false; }
      }
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
      const suggestion = catalog ? suggestTopic(catalog, { studentLevel: studentMap.get(item.studentId)?.level || '', history: historyOf(item.studentId), plan: studentMap.get(item.studentId)?.studyPlan }) : null;
      await lessonRepository.completeFromSchedule(item, user, topicFields(suggestion));
      await state.reload();
    } catch (error) { setActionError(error.message || 'Tunni arvestamine ebaõnnestus.'); } finally { setQuickCompleting(''); }
  };
  const substituteOccurrence = async (teacher) => {
    const item = panelItem;
    if (!item) return false;
    setPanelSaving(true); setPanelError('');
    try {
      const plan = planSubstitute(item, { teacher: teacher.name, teacherUid: teacher.id });
      const created = await runOps(plan.apply, item);
      setUndo({ label: `${item.studentName} ${item.occurrenceDate}: annab ${teacher.name}`, plan, created, item });
      // the panel follows the lesson: a lesson of a series is now its own one-off lesson
      if (created.single) setPanelKey(`${created.single}:${item.occurrenceDate}|${item.occurrenceDate}`);
      await state.reload();
      return true;
    } catch (error) { setPanelError(error.message || 'Asendust ei saanud salvestada.'); return false; } finally { setPanelSaving(false); }
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
      // a deleted lesson frees its room at once (the server's booking goes away a moment later)
      setLocalBookings((current) => ({ ...current, [item.id]: null }));
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
  // „Kooli kulul” (owner 2026-10-19): admin marks a held lesson as paid by the school, or undoes it; server-side audit
  const setSchoolCovered = async (billingStatus, reason) => {
    const item = panelItem;
    if (!item?.record?.id) return false;
    setPanelSaving(true); setPanelError('');
    try {
      await financeRepository.setLessonBillingDisposition(item.record.id, billingStatus, reason);
      await state.reload();
      return true;
    } catch (error) {
      setPanelError(/closed|suletud/i.test(error.message || '') ? 'Periood on suletud: seda tundi ei saa enam muuta.' : (error.message || 'Muutmine ebaõnnestus.'));
      return false;
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
        <button type="button" className={`cal-agenda__row tone-${teacherTone(item.teacherUid || item.teacher, tones)}`} key={item.occurrenceId} onClick={() => openPanel(item)}>
          <time>{item.time}</time>
          <span><strong>{item.online ? <Badge tone="info">veeb</Badge> : null} <SubjectTag subject={item.subject} />{item.studentName}{item.adminNote ? <StickyNote className="cal-note-icon" size={14} aria-label="Admini märkus" /> : null}</strong><small>{item.recordTopic || [item.isGroup ? 'Grupp' : '', item.teacher, `${item.duration} min`].filter(Boolean).join(' · ')}</small></span>
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
        {isAdmin ? <Button variant="secondary" onClick={() => setRoomsOpen(true)}><DoorOpen size={17} /> Kabinetid{activeRooms.length ? ` (${activeRooms.length})` : ''}</Button> : null}
        {teacherOnly || isAdmin ? <Button variant={plannerOpen ? 'primary' : 'secondary'} aria-pressed={plannerOpen} onClick={() => { setPlannerOpen((value) => !value); setPanelKey(''); }}><UsersRound size={17} /> Planeerija</Button> : null}
        {teacherOnly || isAdmin ? <Button variant={fitOpen ? 'primary' : 'secondary'} aria-pressed={fitOpen} onClick={() => setFitOpen((value) => !value)}><CalendarClock size={17} /> Sobivad ajad</Button> : null}
        {teacherOnly || isAdmin ? <Button variant={paint || (weekEditor && paintTeacher) ? 'primary' : 'secondary'} aria-pressed={Boolean(weekEditor && paintTeacher)} onClick={() => { setPaint(null); if (!paintTeacher) { setActionError('Vali enne õpetaja, kelle aegu soovid märkida.'); return; } setActionError(''); setWeekEditor(true); }}><CalendarRange size={17} /> {teacherOnly ? 'Minu ajad' : 'Õpetaja ajad'}</Button> : null}
        <CalendarGoogleChip user={user} onSynced={state.reload} {...(googleCalendarRepository ? { repository: googleCalendarRepository } : {})} />
        <Button onClick={() => openCreate()}><Plus size={17} /> Lisa tund</Button>
      </div>
    </div>
    <ChangeRequestsPanel requests={changeRequestList} focusId={searchParams.get('request') || ''} busy={requestBusy} onAccept={acceptChangeRequest} onDecline={declineChangeRequest} onAbsent={absentChangeRequest} />
    <div className="calendar-filter-summary cal2-summary" aria-live="polite">
      <span><strong>{occurrences.length}</strong> tundi valitud perioodil</span>
      {filters.student ? <button type="button" className="cal2-chip" onClick={() => setFilters({ ...filters, student: '' })}>Õpilane: {studentMap.get(filters.student)?.name || filters.student} <X size={13} /></button> : null}
      {hasActiveFilters ? <Button variant="secondary" onClick={() => setFilters(emptyFilters())}>Tühjenda filtrid</Button> : null}
      {unplanned.length ? <button type="button" className={`cal2-unplanned-chip ${showUnplanned ? 'is-open' : ''}`} aria-expanded={showUnplanned} onClick={() => setShowUnplanned((value) => !value)}><UserRoundX size={15} /> {unplanned.length} {unplanned.length === 1 ? 'õpilane' : 'õpilast'} ilma tulevase tunnita</button> : null}
      <span className="cal2-hint">{narrow ? '' : 'Lohista tundi, et muuta aega · tõmba alumisest servast, et muuta kestust'}</span>
    </div>
    {heldStudent && (heldState === 'done' || !heldMarked) ? <div className="cal2-held" role="status">
      {heldState === 'done' ? <span>Tund on kalendris ja märgitud toimunuks{heldHandoff?.notes ? ' koos märkusega' : ''}. Kui midagi on valesti, ava tund ja paranda.</span> : <>
        <span>{heldPlanned
          ? <>Live Classroomi tund lõppes ({heldStudent.name}). Märgi selle päeva tund kell {heldPlanned.time} toimunuks?</>
          : <>Live Classroomi tundi ({heldStudent.name}, {held.date} kell {held.time}) ei olnud kalendris. Lisa see ({usualDuration} min) ja märgi toimunuks?</>}</span>
        <Button loading={heldState === 'saving'} disabled={libraryState.loading} onClick={markHeldLesson}>{heldPlanned ? 'Märgi toimunuks' : 'Lisa ja märgi toimunuks'}</Button>
        {heldPlanned ? null : <Button variant="secondary" disabled={heldState === 'saving'} onClick={() => { openCreate(held.date, held.time, heldStudent.id); setForm((current) => ({ ...current, duration: usualDuration })); }}>Muuda enne</Button>}
      </>}
    </div> : null}
    {paint && paintTeacher ? (
      <div className="cal2-paint" role="region" aria-label="Õpetaja ajad">
        <strong>{teacherOnly ? 'Minu ajad' : `${paintTeacher.name} — ajad`}</strong>
        <div className="view-switcher" role="group" aria-label="Aja liik">
          <button type="button" aria-pressed={paint.kind === 'free'} className={paint.kind === 'free' ? 'active' : ''} onClick={() => setPaint({ ...paint, kind: 'free' })}><i className="cal2-dot is-free" /> Vaba (tunde võib panna)</button>
          <button type="button" aria-pressed={paint.kind === 'online'} className={paint.kind === 'online' ? 'active' : ''} onClick={() => setPaint({ ...paint, kind: 'online' })}><i className="cal2-dot is-online" /> Ainult veebitunnid</button>
          <button type="button" aria-pressed={paint.kind === 'busy'} className={paint.kind === 'busy' ? 'active' : ''} onClick={() => setPaint({ ...paint, kind: 'busy' })}><i className="cal2-dot is-busy" /> Hõivatud (tund ainult hoiatusega)</button>
        </div>
        <label className="checkbox-field"><input type="checkbox" checked={paint.weekly} onChange={(event) => setPaint({ ...paint, weekly: event.target.checked })} /> <span>Kordub iga nädal</span></label>
        <span className="cal2-paint__hint">{paintSaving ? 'Salvestan…' : 'Lohista kalendris üle aja, et see märkida. Klõps märgitud alal eemaldab selle.'}</span>
        <Button variant="secondary" onClick={() => setPaint(null)}>Valmis</Button>
      </div>
    ) : bandTeacher && availabilityFor(bandTeacher)?.slots?.length ? <p className="cal2-legend"><i className="cal2-dot is-free" /> vaba aeg <i className="cal2-dot is-online" /> ainult veebitunnid <i className="cal2-dot is-busy" /> hõivatud — tund sinna ainult hoiatusega</p> : null}
    {fitOpen ? <StudentTimesPanel
      students={students.items}
      availabilityById={studentTimes}
      loading={studentTimesState.loading}
      unplanned={unplanned}
      selected={fitIds}
      onSelect={(ids, added) => { if (added) openFit(added); else setFitIds(ids); }}
      teacher={fitTeacher}
      teachers={teacherOnly ? null : teachers}
      onTeacher={(uid) => setFilters((current) => ({ ...current, teacher: uid }))}
      teacherAvailability={fitTeacher ? availabilityFor(fitTeacher.uid) : null}
      events={events}
      dates={datesForView(anchor, 'week')}
      rooms={rooms}
      bookings={bookings}
      onPick={pickCandidate}
      onClose={() => setFitOpen(false)}
    /> : null}
    {showUnplanned && unplanned.length ? (
      <section className="cal2-unplanned" aria-label="Õpilased ilma tulevase tunnita">
        <div className="cal2-unplanned__head"><strong>Neil õpilastel ei ole kalendris ühtegi tulevast tundi</strong><button type="button" className="link-button" onClick={() => setShowUnplanned(false)}>Peida</button></div>
        <ul>
          {unplanned.map(({ student, lastLesson }) => (
            <li key={student.id}>
              <span><strong>{student.name}</strong><small>{[isAdmin && !teacherOnly ? (student.teacher || 'õpetaja määramata') : '', student.level, lastLesson ? `viimane tund ${lastLesson}` : 'tunde pole olnud'].filter(Boolean).join(' · ')}</small><small className="cal2-unplanned__times">{studentTimes.get(student.id)?.slots?.length ? `Sobivad ajad: ${timesLine(studentTimes.get(student.id))}` : studentTimesState.loading ? '' : 'Sobivad ajad puuduvad'}</small></span>
              <Button variant="secondary" onClick={() => openFit(student)}><CalendarClock size={15} /> Sobivad ajad</Button>
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

    {plannerOpen ? <PlannerView
      user={user}
      teacherOnly={teacherOnly}
      students={students.items}
      events={events}
      journal={lessonRecords}
      teachers={teacherOnly ? [{ id: user.uid, name: user.displayName || '' }] : teachers}
      studentTimes={plannerTimes}
      teacherAvailability={(who) => availabilityFor(who.teacherUid) || availabilityFor(who.teacher)}
      rooms={rooms}
      bookings={bookings}
      scheduleRepository={scheduleRepository}
      today={today}
      narrow={narrow}
      initialTeacher={isAdmin ? filters.teacher : ''}
      onClose={() => setPlannerOpen(false)}
      onSaved={state.reload}
    /> : null}
    <div className={`cal2-main ${panelItem ? 'has-panel' : ''} ${plannerOpen ? 'is-hidden' : ''}`}>
      <div className="cal2-view">
        {view === 'month' ? <div className="month-grid">{dates.map((date) => { const daily = occurrences.filter((item) => item.occurrenceDate === date); const inMonth = date.slice(0, 7) === anchor.slice(0, 7); return <section className={`${date === today ? 'is-today ' : ''}${inMonth ? '' : 'is-outside'}`} key={date}><button className="month-day" onClick={() => { setAnchor(date); setView('day'); }}>{date.slice(-2)}</button><div>{daily.slice(0, 3).map((item) => <LessonButton compact item={item} onClick={openPanel} onComplete={quickDone} completing={false} key={item.occurrenceId} />)}{daily.length > 3 ? <button className="more-lessons" onClick={() => { setAnchor(date); setView('day'); }}>+{daily.length - 3} veel</button> : null}</div></section>; })}</div>
          : narrow ? agenda(view === 'day' ? occurrences.filter((item) => item.occurrenceDate === anchor) : occurrences)
            : <>
              <TimeGrid
                tones={tones}
                columns={view === 'day' ? dayColumns : weekColumns}
                allowColumnChange={view === 'week'}
                showTeacher={!filters.teacher && !teacherOnly && view === 'week'}
                canDrag={(item) => canMove(item) && (!item.isGroup || isAdmin) && !isGoogleOwned(item)}
                onSlot={openCell}
                onOpen={openPanel}
                onQuickDone={quickDone}
                onMove={onMove}
                bands={bandsFor}
                marks={gridMarks}
                onDragChange={setDragging}
                paint={paint && paintTeacher ? paint : null}
                onPaint={onPaint}
                onBandClick={onBandClick}
              />
              {!occurrences.length ? <p className="cal2-empty">{hasActiveFilters ? <>Filtritele vastavaid tunde ei leitud · <button type="button" className="link-button" onClick={() => setFilters(emptyFilters())}>Tühjenda filtrid</button></> : 'Valitud perioodil tunde ei ole — klõpsa kalendris vabal ajal, et lisada tund.'}</p> : null}
            </>}
      </div>
      {weekEditor && paintTeacher && !availabilityState.loading ? <TeacherWeekEditor
        key={`${paintTeacher.uid}:${availabilityFor(paintTeacher.uid)?.updatedAt || ''}`}
        teacher={paintTeacher}
        availability={availabilityFor(paintTeacher.uid)}
        events={events}
        weekStart={startOfWeek(anchor)}
        students={students.items.filter((student) => teacherOnly || student.teacherUid === paintTeacher.uid || (student.enrollments || []).some((track) => track.teacherUid === paintTeacher.uid)).sort((a, b) => String(a.name).localeCompare(String(b.name), 'et'))}
        studentTimes={studentTimes}
        today={today}
        saving={paintSaving}
        own={paintTeacher.uid === user.uid}
        onSave={async (slots) => { const ok = await saveWindows(slots, paintTeacher); if (ok) setWeekEditor(false); return ok; }}
        onClose={() => setWeekEditor(false)}
        onDates={() => { setWeekEditor(false); setPaint({ kind: 'busy', weekly: false }); }}
      /> : null}
      {roomsOpen ? <RoomsDialog rooms={rooms} user={user} repository={roomRepository} onClose={() => setRoomsOpen(false)} onChanged={() => roomsState.reload()} /> : null}
      {cellMenu ? (() => {
        const owner = cellTeacher(cellMenu.column);
        return <CellStatusMenu key={`${cellMenu.date}${cellMenu.start}${cellMenu.column.key}`} cell={cellMenu} teacherName={owner?.name || ''} saving={paintSaving}
          current={owner ? cellStatus(availabilityFor(owner.uid), cellMenu) : { kind: 'open', weekly: false }}
          onStatus={owner ? setCell : null}
          onLesson={() => { const { date, start } = cellMenu; setCellMenu(null); openCreate(date, start); }}
          onClose={() => setCellMenu(null)} />;
      })() : null}
      {autoMarkReady ? <RunOnce run={autoMark} /> : null}
      {panelItem ? (
        <LessonPanel
          key={panelItem.occurrenceId}
          notice={autoMarked === panelItem.occurrenceId ? 'Tund märgiti Live Classroomist toimunuks: teema töölehest, märkus kokkuvõttest. Kui midagi on valesti, muuda allpool.' : ''}
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
          onSchoolCovered={isAdmin && !panelItem.isGroup ? setSchoolCovered : undefined}
          onCancelGroupLesson={isAdmin && panelItem.isGroup ? cancelGroupOccurrence : undefined}
          onSubstitute={isAdmin && !panelItem.isGroup ? substituteOccurrence : undefined}
          teachers={substitutes}
          onStartLive={startLive}
          startingLive={startingLive}
          liveBlocked={panelItem.isGroup ? '' : !studentMap.get(panelItem.studentId) ? 'Õpilase kaarti ei leitud.' : studentAccountUid(studentMap.get(panelItem.studentId)) ? '' : 'Õpilasel pole veel sisselogimiskontot: seo konto õpilase kaardil, siis saab tunni alustada.'}
          today={today}
        >
          <AdminNoteBox key={`note-${panelItem.occurrenceId}`} item={panelItem} notes={notesFor(notesState.data || [], panelItem)} canEdit={isAdmin} onSave={(value) => saveAdminNote(panelItem, value)} />
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

    <Modal open={Boolean(moveAsk)} title={moveAsk?.item.recurring ? 'Korduv tund' : 'Tõsta tund?'} onClose={() => setMoveAsk(null)} footer={moveAsk?.item.recurring
      ? <><Button variant="secondary" onClick={() => setMoveAsk(null)}>Loobu</Button><Button variant="secondary" onClick={() => executeMove(moveAsk, 'series')}>See ja kõik järgmised</Button><Button onClick={() => executeMove(moveAsk, 'single')}>Ainult see tund</Button></>
      : <><Button variant="secondary" onClick={() => setMoveAsk(null)}>Loobu</Button><Button onClick={() => executeMove(moveAsk, 'single')}>Tõsta ikkagi</Button></>}>
      {moveAsk ? <p>Tõsta <b>{moveAsk.item.studentName}</b> tund ({moveAsk.item.occurrenceDate} {moveAsk.item.time}) uuele ajale <b>{moveAsk.toDate} {moveAsk.time}</b>?</p> : null}
      {moveAsk?.warnings?.length ? <ul className="cal2-warnings" aria-label="Hoiatused">{moveAsk.warnings.map((text) => <li key={text}>{text}</li>)}</ul> : null}
    </Modal>

    <Modal open={Boolean(deleteAsk)} title="Kustuta tund" onClose={() => setDeleteAsk(null)} footer={deleteAsk?.recurring
      ? <><Button variant="secondary" onClick={() => setDeleteAsk(null)}>Loobu</Button><Button variant="danger" onClick={() => deleteLesson('series')}>See ja kõik järgmised (lõpeta sari)</Button><Button variant="danger" onClick={() => deleteLesson('single')}>Ainult see tund</Button></>
      : <><Button variant="secondary" onClick={() => setDeleteAsk(null)}>Loobu</Button><Button variant="danger" onClick={() => deleteLesson('single')}>Kustuta</Button></>}>
      {deleteAsk ? <p>Kustutada <b>{deleteAsk.studentName || 'õpilase'}</b> tund {new Date(`${deleteAsk.occurrenceDate}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'long', day: 'numeric', month: 'long' })} kell {deleteAsk.time}? Tund kaob kalendrist ja Google Calendarist; kohe pärast saad selle tagasi võtta.{deleteAsk.recurring ? ' Tund kordub igal nädalal: vali, kas kustutada ainult see kuupäev või ka kõik järgmised.' : ''}</p> : null}
    </Modal>

    <Modal open={modal} title={editing ? 'Muuda tundi' : 'Uus tund'} onClose={closeModal} footer={<>{editing && !editing.recurring ? <Button variant="danger" disabled={saving || Boolean(editing.lessonRecordId)} onClick={async () => { if (!globalThis.confirm('Kas tühistada see tund?')) return; setSaving(true); try { await scheduleRepository.cancel(editing.id, editing); setUndo({ label: `${editing.studentName} tühistatud ${editing.occurrenceDate || editing.date}`, plan: { undo: [{ op: 'patch', id: editing.id, fields: { status: editing.status || 'Planeeritud' } }] }, created: {}, item: editing }); setModal(false); setEditing(null); setPanelKey(''); await state.reload(); } catch (error) { setActionError(error.message); } finally { setSaving(false); } }}><XCircle size={17} /> Tühista tund</Button> : null}{editing?.recurring && editing.occurrenceDate ? <Button variant="danger" disabled={saving} onClick={() => { setModal(false); setDeleteAsk(editing); }}><XCircle size={17} /> Lõpeta või kustuta…</Button> : null}<span className="modal__footer-spacer" /><Button variant="secondary" onClick={closeModal}>Loobu</Button><Button loading={saving} type="submit" form="lesson-form">{formWindowAsk ? 'Salvesta ikkagi' : editing ? 'Salvesta muudatused' : 'Salvesta tund'}</Button></>}><form id="lesson-form" className="form-grid" onSubmit={submit}>{actionError && modal ? <p className="form-error form-grid__wide" role="alert">{actionError}</p> : null}<StudentCombobox students={students.items} value={form.studentId} onChange={(studentId) => setForm({ ...form, studentId, subject: '' })} />{formTracks.length > 1 ? <div className="field form-grid__wide"><label className="field__label" htmlFor="lesson-track">Õppesuund</label><select id="lesson-track" className="cal2-select" value={lessonSubject(formStudent, formTeacher.teacherUid)} onChange={(event) => { const track = formTracks.find((item) => item.subject === event.target.value); setForm({ ...form, subject: event.target.value, ...(isAdmin && track?.teacherUid ? { teacherUid: track.teacherUid } : {}) }); }}>{formTracks.map((track) => <option value={track.subject} key={track.id || track.subject}>{track.subject}{track.teacher ? ` · ${track.teacher}` : ''}</option>)}</select></div> : null}{isAdmin && (teacherState.data || []).length ? <div className="field form-grid__wide"><label className="field__label" htmlFor="lesson-teacher">Õpetaja</label><select id="lesson-teacher" className="cal2-select" value={form.teacherUid} onChange={(event) => setForm({ ...form, teacherUid: event.target.value })}><option value="">{studentMap.get(form.studentId)?.teacher ? `Õpilase õpetaja (${studentMap.get(form.studentId).teacher})` : 'Õpilase õpetaja'}</option>{teacherState.data.map((teacher) => <option value={teacher.id} key={teacher.id}>{teacher.name}</option>)}</select></div> : null}<Input label="Kuupäev" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /><Input label="Kellaaeg" type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required /><Input label="Kestus minutites" type="number" min="5" step="5" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} required />{editing ? null : <label className="checkbox-field"><input type="checkbox" checked={form.recurring} onChange={(event) => setForm({ ...form, recurring: event.target.checked })} /><span>Kordub igal nädalal</span></label>}<label className="checkbox-field"><input type="checkbox" checked={Boolean(form.online)} onChange={(event) => setForm({ ...form, online: event.target.checked })} /><span>Veebitund (online)</span></label>{formRoomChoices.length ? <div className="field form-grid__wide"><label className="field__label" htmlFor="lesson-room">Kabinet</label><select id="lesson-room" className="cal2-select" value={form.roomId || ''} onChange={(event) => setForm({ ...form, roomId: event.target.value })}><option value="">{formRoomChoices.some((room) => !room.takenOn) ? 'Vaba kabinet automaatselt' : 'Kõik kabinetid on hõivatud'}</option>{formRoomChoices.map((room) => <option key={room.id} value={room.id} disabled={Boolean(room.takenOn)}>{room.name}{room.takenOn ? ` — hõivatud${form.recurring ? ` (${room.takenOn})` : ''}` : ''}</option>)}</select>{formRoomChoices.every((room) => room.takenOn) ? <p className="form-error" role="alert">Kõik kabinetid on sel ajal hõivatud: märgi tund veebitunniks või vali teine aeg.</p> : null}</div> : null}{formWindowAsk ? <p className="form-grid__wide cal2-window-ask" role="alert">{formWindowAsk} Kas salvestan tunni ikkagi? Vajuta „Salvesta ikkagi”.</p> : null}{formWarnings.some((text) => text !== formWindowAsk) ? <ul className="form-grid__wide cal2-warnings" role="status" aria-label="Hoiatused">{formWarnings.filter((text) => text !== formWindowAsk).map((text) => <li key={text}>{text}</li>)}</ul> : null}{formStudent && !formNoTimes ? <div className="form-grid__wide cal2-form-times" role="group" aria-label="Õpilase sobivad vabad ajad"><span className="field__label">{formStudent.name}: sobivad vabad ajad</span>{formSuggestions.length ? <div className="cal2-form-times__list">{formSuggestions.map((item) => { const on = form.date === item.date && form.time === item.time; return <button type="button" key={`${item.date} ${item.time}`} aria-pressed={on} className={`cal2-form-time${on ? ' is-on' : ''}${item.student === 'best' ? ' is-best' : ''}`} onClick={() => setForm({ ...form, date: item.date, time: item.time })}>{new Date(`${item.date}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short', day: 'numeric', month: 'numeric' })} {item.time}{item.student === 'best' ? ' ★' : ''}</button>; })}</div> : <small className="form-hint">Järgmise kahe nädala sobivad ajad on hõivatud{timesLine(studentTimes.get(formStudent.id)) ? ` · õpilase ajad: ${timesLine(studentTimes.get(formStudent.id))}` : ''}.</small>}</div> : null}{formNoTimes ? <p className="form-grid__wide form-hint">{formStudent.name}: sobivad ajad puuduvad — <Link to={`/students/${formStudent.id}#sobivad-ajad`}>ava kaart</Link> või saada õpilasele link /ajad.</p> : null}{parallel.length ? <p className="form-grid__wide form-hint cal2-parallel" role="status">Samal ajal on ka: {parallel.map((item) => `${item.time} ${item.studentName || 'tund'}`).join(', ')}. Tunnid toimuvad paralleelselt.</p> : null}{editing?.recurring ? <p className="form-grid__wide form-hint">Siin muudetud aeg kehtib kogu sarjale. Ühe tunni muutmiseks lohista see kalendris.</p> : null}</form></Modal>
  </div>;
}
