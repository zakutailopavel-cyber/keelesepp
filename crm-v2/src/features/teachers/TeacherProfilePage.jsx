import { ArrowLeft, CalendarDays, Clock3, Euro, GraduationCap, Link2, Mail, Save, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader, Select } from '../../components/ui/index.js';
import PeopleOverview from '../../components/PeopleOverview.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { scheduleService, studentsService, teachersService, workTimeService } from '../../services/firebase/index.js';
import { isSameTeacher, teachesStudent, tracksTaughtBy } from '../../utils/teachers.js';
import { TONE_NAMES } from '../calendar/calendarGrid.js';
import { occurrencesForDates, shiftDate } from '../calendar/calendarView.js';
import { localDate } from '../../utils/localDate.js';

const monthNow = () => new Date().toISOString().slice(0, 7);
const dateLabel = (value) => { const date = value?.toDate?.() || (value ? new Date(value) : null); return date && !Number.isNaN(date.getTime()) ? date.toLocaleString('et-EE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'; };
const durationLabel = (minutes) => `${Math.floor(Number(minutes || 0) / 60)} h ${String(Number(minutes || 0) % 60).padStart(2, '0')} min`;
// a card belongs to the teacher by account id, or by name (the card itself or an active study direction)
const linkedTo = (item, uid) => item.teacherUid === uid || (item.teacherUids || []).includes(uid);
const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);

export default function TeacherProfilePage({ teacherRepository = teachersService, studentRepository = studentsService, scheduleRepository = scheduleService, timeRepository = workTimeService }) {
  const { teacherId } = useParams();
  const { user } = useAuth();
  const [month, setMonth] = useState(monthNow());
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');
  const [linking, setLinking] = useState(false);
  const state = useAsyncData(async () => {
    const teacher = await teacherRepository.getById(teacherId);
    if (!teacher) return { teacher: null, students: [], schedule: [], workTime: { sessions: [], programDays: [], summary: {} } };
    const [students, schedule, workTime] = await Promise.all([
      studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true }), scheduleRepository.list(), timeRepository.listByStaff(teacherId, month),
    ]);
    return {
      teacher,
      // the same rule as the student list: the student's study tracks (utils/teachers.js teachesStudent)
      students: students.items.filter((item) => teachesStudent(item, { id: teacherId, name: teacher.name })).sort((a, b) => String(a.name).localeCompare(String(b.name), 'et')),
      schedule: schedule.filter((item) => item.teacherUid === teacherId || isSameTeacher(item.teacher, teacher.name)),
      workTime,
    };
  }, [teacherId, month, teacherRepository, studentRepository, scheduleRepository, timeRepository]);

  if (state.loading) return <LoadingState label="Laen õpetaja profiili…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  if (!state.data.teacher) return <ErrorState title="Õpetajat ei leitud" message="Kasutaja võib olla eemaldatud või sul puudub ligipääs." />;
  const { teacher, students, schedule, workTime } = state.data;
  const isAdmin = (user?.roles || []).includes('admin');
  // assigned by name only: the teacher cannot read these cards (Live Classroom, Õpilased stay empty)
  const unlinked = students.filter((item) => !linkedTo(item, teacher.id));
  const linkStudents = async () => {
    setLinking(true); setActionError('');
    try {
      const { linked } = await studentRepository.linkTeacher(unlinked.map((item) => item.id), { teacherUid: teacher.id, teacherName: teacher.name });
      setSuccess(`${linked} õpilast seoti õpetaja kontoga. ${teacher.name} näeb neid nüüd Live Classroomis ja õpilaste lehel (värskenda lehte).`);
      await state.reload();
    } catch (error) { setActionError(error.message); } finally { setLinking(false); }
  };
  const today = localDate();
  const upcomingDates = Array.from({ length: 30 }, (_, index) => shiftDate(today, index));
  const allUpcoming = occurrencesForDates(schedule, upcomingDates);
  const upcoming = allUpcoming.slice(0, 8);
  const startEditing = () => { setDraft({ displayName: teacher.name, email: teacher.email || '', role: teacher.role || 'teacher', disabled: Boolean(teacher.disabled), staffNotes: teacher.staffNotes || '', calendarTone: teacher.calendarTone ?? '' }); setEditing(true); setSuccess(''); };
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setActionError('');
    try {
      if (teacher.id === user.uid && (draft.disabled || draft.role !== teacher.role)) throw new Error('Enda administraatori kontot ei saa peatada ega selle rolli muuta.');
      await teacherRepository.update(teacher.id, draft); setEditing(false); setSuccess('Õpetaja profiil salvestatud.'); await state.reload();
    } catch (error) { setActionError(error.message); } finally { setSaving(false); }
  };

  return <div className="page-content"><Link className="back-link" to="/teachers"><ArrowLeft size={17} /> Tagasi õpetajate juurde</Link><PageHeader eyebrow="Meeskond" title={teacher.name} description="Õpetaja profiil, õpilased, ajakava ja tööaja tõendid." actions={editing ? null : <Button onClick={startEditing}>Muuda profiili</Button>} />
    {isAdmin && unlinked.length ? <div className="action-error" role="status"><span><strong>{unlinked.length} õpilast on määratud ainult nime järgi</strong> ({unlinked.map((item) => item.name).join(', ')}). {teacher.name} ei näe neid Live Classroomis ega õpilaste lehel, kuni need on tema kontoga seotud.</span> <Button loading={linking} onClick={linkStudents}><Link2 size={16} /> Seo õpetaja kontoga</Button></div> : null}
    {success ? <div className="success-notice">{success}<button onClick={() => setSuccess('')}>×</button></div> : null}{actionError ? <div className="action-error">{actionError}<button onClick={() => setActionError('')}>×</button></div> : null}
    <PeopleOverview label="Õpetaja kokkuvõte" eyebrow="Meeskonna töölaud" title="Õpetaja hetkeseis" description="Õpilased, lähitunnid ja kinnitatud tööaeg ühes vaates." metrics={[
      { icon: GraduationCap, label: 'Aktiivsed õpilased', value: students.length, hint: 'praegu määratud' },
      { icon: CalendarDays, label: 'Eesootavad tunnid', value: allUpcoming.length, hint: '30 päeva jooksul' },
      { icon: Clock3, label: 'Kinnitatud tööaeg', value: durationLabel(workTime.summary.approvedMinutes), hint: month },
      { icon: Euro, label: 'Kinnitatud töötasu', value: money(workTime.summary.approvedPayCents), hint: workTime.summary.pendingMinutes ? `${durationLabel(workTime.summary.pendingMinutes)} ootel` : 'ootel aega ei ole' },
    ]} />
    <section className="teacher-profile-grid"><Card>{editing ? <form className="teacher-profile-form" onSubmit={save}><label><span>Nimi</span><input value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} required /></label><label><span>E-post</span><input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} required /></label><Select label="Roll" value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })}><option value="teacher">Õpetaja</option><option value="admin">Administraator</option></Select><Select label="Konto olek" value={draft.disabled ? 'disabled' : 'active'} onChange={(event) => setDraft({ ...draft, disabled: event.target.value === 'disabled' })}><option value="active">Aktiivne</option><option value="disabled">Peatatud</option></Select><Select label="Värv kalendris" value={String(draft.calendarTone ?? '')} onChange={(event) => setDraft({ ...draft, calendarTone: event.target.value === '' ? '' : Number(event.target.value) })}><option value="">Automaatne</option>{TONE_NAMES.map((name, index) => <option value={index} key={name}>{name}</option>)}</Select><label className="form-grid__wide"><span>Administraatori märkmed</span><textarea rows="5" value={draft.staffNotes} onChange={(event) => setDraft({ ...draft, staffNotes: event.target.value })} placeholder="Sisemised märkmed õpetaja kohta" /></label><div className="form-actions form-grid__wide"><Button variant="secondary" onClick={() => setEditing(false)}>Loobu</Button><Button loading={saving} type="submit"><Save size={17} /> Salvesta</Button></div></form> : <><div className="teacher-profile-head"><div className="teacher-avatar teacher-avatar--large">{teacher.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><h2>{teacher.name}</h2><Badge tone={teacher.disabled ? 'danger' : 'success'}>{teacher.disabled ? 'Peatatud' : 'Aktiivne'}</Badge></div></div><div className="profile-facts"><div><Mail size={18} /><span>E-post</span><strong>{teacher.email || '—'}</strong></div><div><ShieldCheck size={18} /><span>Roll ja õigused</span><strong>{teacher.role === 'admin' ? 'Administraator' : 'Õpetaja'}</strong></div></div><div className="teacher-notes"><span className="eyebrow">Administraatori märkmed</span><p>{teacher.staffNotes || 'Märkmeid ei ole lisatud.'}</p></div></>}</Card>
      <Card><div className="section-heading"><div><span className="eyebrow">Kalender</span><h2>Järgmised tunnid</h2></div><Link to={`/calendar?teacher=${teacher.id}`}>Ava kalender →</Link></div>{upcoming.length ? <div className="simple-list">{upcoming.map((item) => <div key={item.occurrenceId}><div><strong>{item.studentName}</strong><span>{item.occurrenceDate} · {item.time}</span></div><Badge tone="info">{item.duration} min</Badge></div>)}</div> : <EmptyState title="Eesootavaid tunde ei ole" />}</Card>
      <Card><div className="section-heading"><div><span className="eyebrow">Õpilased</span><h2>Määratud õpilased</h2></div></div>{students.length ? <div className="teacher-student-list">{students.map((student) => <Link to={`/students/${student.id}`} key={student.id}><span className="student-mini-avatar">{student.name[0]}</span><div><strong>{student.name}</strong><small>{tracksTaughtBy(student, teacher).map((track) => `${track.subject || 'Eesti keel'} · ${track.level || 'tase määramata'}`).join(' · ') || `${student.subject || 'Eesti keel'} · ${student.level || 'tase määramata'}`}</small></div><span>→</span></Link>)}</div> : <EmptyState title="Õpilasi ei ole määratud" />}</Card>
      <Card className="profile-wide"><div className="section-heading"><div><span className="eyebrow">Tööaeg</span><h2>Kuu tööaja tõendid</h2></div><input className="month-input" type="month" aria-label="Tööaja kuu" value={month} onChange={(event) => setMonth(event.target.value)} /></div><div className="worktime-summary"><div><span>Programmis aktiivne</span><strong>{durationLabel(workTime.summary.programMinutes)}</strong></div><div><span>Kinnitamise ootel</span><strong>{durationLabel(workTime.summary.pendingMinutes)}</strong></div><div><span>Kinnitatud</span><strong>{durationLabel(workTime.summary.approvedMinutes)}</strong></div></div>{workTime.sessions.length ? <div className="students-table-wrap"><table className="students-table"><thead><tr><th>Algus</th><th>Lõpp</th><th>Kestus</th><th>Olek</th><th>Märkus</th></tr></thead><tbody>{workTime.sessions.slice(0, 20).map((session) => <tr key={session.id}><td>{dateLabel(session.startedAt)}</td><td>{dateLabel(session.endedAt)}</td><td>{durationLabel(session.durationMinutes)}</td><td><Badge tone={session.approvalStatus === 'approved' ? 'success' : session.approvalStatus === 'rejected' ? 'danger' : 'neutral'}>{session.status === 'open' ? 'Avatud' : session.approvalStatus || '—'}</Badge></td><td>{session.note || '—'}</td></tr>)}</tbody></table></div> : <EmptyState title="Selles kuus tööaja kirjeid ei ole" />}</Card>
    </section></div>;
}
