import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus, Search, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { groupsService, scheduleService, studentsService } from '../../services/firebase/index.js';
import { hasScheduleConflict } from '../../services/firebase/schedule.js';
import { ROLES } from '../../utils/roles.js';
import { datesForView, filterCalendarEvents, groupCalendarEvents, occurrencesForDates, shiftDate, toIsoDate } from './calendarView.js';

const blankLesson = () => ({ studentId: '', date: toIsoDate(), time: '09:00', duration: 60, recurring: false, status: 'Planeeritud' });
const viewLabels = { day: 'Päev', week: 'Nädal', month: 'Kuu' };

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

function LessonButton({ item, compact = false, onClick }) {
  return <button className={`lesson-chip ${compact ? 'lesson-chip--compact' : ''}`} onClick={() => onClick(item)}><time>{item.time}</time><strong>{item.studentName || 'Õpilane'}</strong>{compact ? null : <small>{item.teacher || 'Õpetaja'} · {item.duration} min</small>}</button>;
}

export default function CalendarPage({ scheduleRepository = scheduleService, studentRepository = studentsService, groupRepository = groupsService }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [anchor, setAnchor] = useState(toIsoDate());
  const [view, setView] = useState('week');
  const [filters, setFilters] = useState(() => ({ search: '', teacher: searchParams.get('teacher') || '', student: searchParams.get('student') || '' }));
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankLesson());
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [attendanceEvent, setAttendanceEvent] = useState(null);
  const [attendanceSaving, setAttendanceSaving] = useState('');
  const teacherOnly = user.roles.includes(ROLES.TEACHER) && !user.roles.includes(ROLES.ADMIN);
  const state = useAsyncData(async () => Promise.all([
    scheduleRepository.list(teacherOnly ? { teacherUid: user.uid } : {}),
    studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) }),
    groupRepository.list(teacherOnly ? { teacherUid: user.uid, teacherName: user.displayName } : {}),
  ]), [groupRepository, scheduleRepository, studentRepository, teacherOnly, user.displayName, user.uid]);
  const dates = useMemo(() => datesForView(anchor, view), [anchor, view]);

  if (state.loading) return <LoadingState label="Laen kalendrit…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const [scheduleEvents, students, groups] = state.data;
  const events = [...scheduleEvents, ...groupCalendarEvents(groups)];
  const filteredEvents = filterCalendarEvents(events, filters);
  const occurrences = occurrencesForDates(filteredEvents, dates);
  const teachers = [...new Map(events.filter((item) => item.teacher).map((item) => [item.teacherUid || item.teacher, { id: item.teacherUid || item.teacher, name: item.teacher }])).values()].sort((a, b) => a.name.localeCompare(b.name, 'et'));

  const navigatePeriod = (direction) => setAnchor((current) => view === 'month' ? shiftMonth(current, direction) : shiftDate(current, direction * (view === 'week' ? 7 : 1)));
  const openCreate = (date = anchor) => { setEditing(null); setForm({ ...blankLesson(), date }); setModal(true); setActionError(''); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ studentId: item.studentId || '', date: item.recurring ? item.startDate : (item.occurrenceDate || item.date), time: item.time || '09:00', duration: item.duration || 60, recurring: Boolean(item.recurring), status: item.status || 'Planeeritud' });
    setModal(true); setActionError('');
  };
  const openEvent = (item) => item.isGroup ? setAttendanceEvent(item) : openEdit(item);
  const attendanceGroup = attendanceEvent ? groups.find((group) => group.id === attendanceEvent.groupId) : null;
  const attendanceStudents = attendanceEvent ? students.items.filter((student) => attendanceEvent.studentIds.includes(student.id)) : [];
  const setAttendance = async (studentId, status) => {
    if (!attendanceGroup || !attendanceEvent?.occurrenceDate) return;
    setAttendanceSaving(studentId);
    setActionError('');
    try {
      const attendance = await groupRepository.setAttendance(attendanceGroup, attendanceEvent.groupLessonId, attendanceEvent.occurrenceDate, studentId, status, user);
      setAttendanceEvent((current) => current ? { ...current, attendance } : current);
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Kohalolu märkimine ebaõnnestus.');
    } finally {
      setAttendanceSaving('');
    }
  };
  const closeModal = () => { if (!saving) setModal(false); };
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setActionError('');
    try {
      const student = students.items.find((item) => item.id === form.studentId);
      if (!student) throw new Error('Vali õpilane.');
      const candidate = { ...form, studentName: student.name, teacher: student.teacher || user.displayName, teacherUid: student.teacherUid || user.uid };
      const conflictEvents = occurrencesForDates(events, [candidate.date]).map((item) => ({ ...item, date: item.occurrenceDate }));
      if (hasScheduleConflict(conflictEvents, candidate, editing?.id)) throw new Error('Sellel õpetajal on valitud ajal juba teine tund.');
      if (editing) await scheduleRepository.update(editing.id, candidate, editing);
      else await scheduleRepository.create(candidate);
      setModal(false); setEditing(null); await state.reload();
    } catch (error) { setActionError(error.message); } finally { setSaving(false); }
  };
  const cancelLesson = async () => {
    if (!editing || !window.confirm('Kas tühistada see tund?')) return;
    setSaving(true);
    try { await scheduleRepository.cancel(editing.id, editing); setModal(false); setEditing(null); await state.reload(); }
    catch (error) { setActionError(error.message); } finally { setSaving(false); }
  };

  return <div className="page-content">
    <PageHeader eyebrow="Planeerimine" title="Kalender" description="Päeva-, nädala- ja kuuvaade koos filtrite ning konfliktikontrolliga." actions={<Button onClick={() => openCreate()}><Plus size={18} /> Lisa tund</Button>} />
    {actionError ? <div className="action-error">{actionError}<button onClick={() => setActionError('')}>×</button></div> : null}
    <Card className="calendar-filters"><div className="search-field"><Search size={17} /><input aria-label="Otsi kalendrist" placeholder="Otsi õpilast või õpetajat" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /></div>{teacherOnly ? null : <Select aria-label="Filtreeri õpetaja järgi" value={filters.teacher} onChange={(event) => setFilters({ ...filters, teacher: event.target.value })}><option value="">Kõik õpetajad</option>{teachers.map((teacher) => <option value={teacher.id} key={teacher.id}>{teacher.name}</option>)}</Select>}<Select aria-label="Filtreeri õpilase järgi" value={filters.student} onChange={(event) => setFilters({ ...filters, student: event.target.value })}><option value="">Kõik õpilased</option>{students.items.map((student) => <option value={student.id} key={student.id}>{student.name}</option>)}</Select></Card>
    <Card className="calendar-card">
      <div className="calendar-toolbar"><div className="calendar-toolbar__nav"><Button variant="secondary" aria-label="Eelmine periood" onClick={() => navigatePeriod(-1)}><ChevronLeft size={17} /></Button><Button variant="secondary" onClick={() => setAnchor(toIsoDate())}>Täna</Button><Button variant="secondary" aria-label="Järgmine periood" onClick={() => navigatePeriod(1)}><ChevronRight size={17} /></Button></div><strong>{periodLabel(anchor, view, dates)}</strong><div className="view-switcher">{Object.entries(viewLabels).map(([value, label]) => <button className={view === value ? 'active' : ''} key={value} onClick={() => setView(value)}>{label}</button>)}</div></div>
      {view === 'day' ? <div className="day-agenda"><header><div><span className="eyebrow">{new Date(`${anchor}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'long' })}</span><h2>{new Date(`${anchor}T12:00:00`).toLocaleDateString('et-EE', { day: 'numeric', month: 'long' })}</h2></div><Button variant="secondary" onClick={() => openCreate(anchor)}><Plus size={16} /> Lisa sellele päevale</Button></header>{occurrences.length ? occurrences.map((item) => <button className="agenda-lesson" key={item.occurrenceId} onClick={() => openEvent(item)}><time>{item.time}</time><div><strong>{item.studentName}</strong><span>{item.isGroup ? 'Grupp · ' : ''}{item.teacher} · {item.duration} min</span></div><Badge tone={item.isGroup ? 'success' : item.status === 'Toimunud' ? 'success' : 'info'}>{item.isGroup ? 'Grupp' : item.status}</Badge><Pencil size={16} /></button>) : <EmptyState title="Sellel päeval tunde ei ole" />}</div> : null}
      {view === 'week' ? <div className="week-grid">{dates.map((date) => { const daily = occurrences.filter((item) => item.occurrenceDate === date); return <section className={date === toIsoDate() ? 'is-today' : ''} key={date}><header><span>{new Date(`${date}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short' })}</span><strong>{date.slice(-2)}</strong></header><div>{daily.map((item) => <LessonButton item={item} onClick={openEvent} key={item.occurrenceId} />)}{!daily.length ? <button className="day-empty" aria-label={`Lisa tund ${date}`} onClick={() => openCreate(date)}>+</button> : null}</div></section>; })}</div> : null}
      {view === 'month' ? <div className="month-grid">{dates.map((date) => { const daily = occurrences.filter((item) => item.occurrenceDate === date); const inMonth = date.slice(0, 7) === anchor.slice(0, 7); return <section className={`${date === toIsoDate() ? 'is-today ' : ''}${inMonth ? '' : 'is-outside'}`} key={date}><button className="month-day" onClick={() => { setAnchor(date); setView('day'); }}>{date.slice(-2)}</button><div>{daily.slice(0, 3).map((item) => <LessonButton compact item={item} onClick={openEvent} key={item.occurrenceId} />)}{daily.length > 3 ? <button className="more-lessons" onClick={() => { setAnchor(date); setView('day'); }}>+{daily.length - 3} veel</button> : null}</div></section>; })}</div> : null}
      {!occurrences.length && view !== 'day' ? <EmptyState title="Valitud perioodil tunde ei ole" description="Lisa tund või muuda filtreid." action={<CalendarDays size={28} />} /> : null}
    </Card>
    <Modal open={modal} title={editing ? 'Muuda tundi' : 'Uus tund'} onClose={closeModal} footer={<>{editing ? <Button variant="danger" disabled={saving} onClick={cancelLesson}><XCircle size={17} /> Tühista tund</Button> : null}<span className="modal__footer-spacer" /><Button variant="secondary" onClick={closeModal}>Loobu</Button><Button loading={saving} type="submit" form="lesson-form">{editing ? 'Salvesta muudatused' : 'Salvesta tund'}</Button></>}><form id="lesson-form" className="form-grid" onSubmit={submit}><Select className="form-grid__wide" label="Õpilane" value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} required><option value="">Vali õpilane</option>{students.items.map((student) => <option value={student.id} key={student.id}>{student.name} · {student.teacher}</option>)}</Select><Input label="Kuupäev" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /><Input label="Kellaaeg" type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required /><Input label="Kestus minutites" type="number" min="5" step="5" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} required />{editing ? <Select label="Staatus" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Planeeritud</option><option>Toimunud</option><option>Tühistatud</option></Select> : <label className="checkbox-field"><input type="checkbox" checked={form.recurring} onChange={(event) => setForm({ ...form, recurring: event.target.checked })} /><span>Kordub igal nädalal</span></label>}{editing?.recurring ? <p className="form-grid__wide form-hint">Korduva tunni muutmine rakendub kogu sarjale.</p> : null}</form></Modal>
    <Modal open={Boolean(attendanceEvent)} title={`Kohalolu: ${attendanceEvent?.studentName || ''}`} onClose={() => !attendanceSaving && setAttendanceEvent(null)} className="modal--attendance" footer={<Button variant="secondary" disabled={Boolean(attendanceSaving)} onClick={() => setAttendanceEvent(null)}>Valmis</Button>}>
      {attendanceEvent ? <div className="attendance-sheet"><header><div><span>Kuupäev</span><strong>{new Date(`${attendanceEvent.occurrenceDate}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></div><div><span>Kellaaeg</span><strong>{attendanceEvent.time}</strong></div></header>{attendanceStudents.length ? <div>{attendanceStudents.map((student) => {
        const key = `${student.id}_${attendanceEvent.occurrenceDate}`;
        const current = attendanceEvent.attendance?.[key]?.status || '';
        return <section key={student.id}><div><strong>{student.name}</strong><small>{student.level || 'Tase puudub'}</small></div><div><Button variant={current === 'coming' ? 'primary' : 'secondary'} disabled={Boolean(attendanceSaving)} onClick={() => setAttendance(student.id, 'coming')}>Kohal</Button><Button variant={current === 'absent' ? 'danger' : 'secondary'} disabled={Boolean(attendanceSaving)} onClick={() => setAttendance(student.id, 'absent')}>Puudub</Button><Button variant="secondary" disabled={Boolean(attendanceSaving)} onClick={() => setAttendance(student.id, current ? 'clear' : 'warned')}>{current ? 'Tühista märge' : 'Teatas'}</Button></div></section>;
      })}</div> : <EmptyState title="Selle tunniga seotud õpilasi ei ole" />}</div> : null}
    </Modal>
  </div>;
}
