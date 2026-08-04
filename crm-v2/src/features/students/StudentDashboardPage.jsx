import { BookOpen, CalendarDays, ChevronRight, GraduationCap, MessageSquareText, Star, WalletCards } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, invoicesService, lessonsService, scheduleService, studentsService } from '../../services/firebase/index.js';
import { occurrencesForDates, shiftDate, toIsoDate } from '../calendar/calendarView.js';
import { invoiceBalanceCents } from './studentFinance.js';

function unique(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function money(cents) {
  return (Number(cents || 0) / 100).toLocaleString('et-EE', { style: 'currency', currency: 'EUR' });
}

function dateLabel(value) {
  if (!value) return 'Kuupäev puudub';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('et-EE', { day: 'numeric', month: 'short' });
}

function skillLabel(value) {
  return String(value || '').replaceAll('_', ' ').replace(/^./, (letter) => letter.toLocaleUpperCase('et'));
}

export default function StudentDashboardPage({
  studentRepository = studentsService,
  homeworkRepository = homeworkService,
  scheduleRepository = scheduleService,
  invoiceRepository = invoicesService,
  lessonRepository = lessonsService,
}) {
  const { user } = useAuth();
  const state = useAsyncData(async () => {
    const students = await studentRepository.listSelf(user.uid);
    const studentIds = students.map((student) => student.id);
    const [homework, submissions, scheduleLists, invoiceLists, lessonLists] = await Promise.all([
      homeworkRepository.listByStudentIds(studentIds),
      homeworkRepository.listSubmissionsByStudentIds(studentIds),
      Promise.all(studentIds.map((studentId) => scheduleRepository.listByStudent(studentId))),
      Promise.all(studentIds.map((studentId) => invoiceRepository.listByStudent(studentId))),
      Promise.all(studentIds.map((studentId) => lessonRepository.listByStudent(studentId))),
    ]);
    return {
      students,
      homework,
      submissions,
      schedule: unique(scheduleLists.flat()),
      invoices: unique(invoiceLists.flat()),
      lessons: unique(lessonLists.flat()),
    };
  }, [homeworkRepository, invoiceRepository, lessonRepository, scheduleRepository, studentRepository, user.uid]);

  const today = toIsoDate();
  const nextDates = useMemo(() => Array.from({ length: 28 }, (_, index) => shiftDate(today, index)), [today]);
  if (state.loading) return <LoadingState label="Laen sinu õpinguid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const { students, homework, submissions, schedule, invoices, lessons } = state.data;
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const upcoming = occurrencesForDates(schedule, nextDates).slice(0, 6);
  const pendingHomework = homework.filter((item) => item.status !== 'Tehtud');
  const completedLessons = lessons.filter((lesson) => lesson.status !== 'Tühistatud');
  const reviewedSubmissions = submissions.filter((item) => item.reviewStatus === 'reviewed').slice(0, 5);
  const balance = invoices.reduce((sum, invoice) => sum + invoiceBalanceCents(invoice), 0);

  return <div className="page-content">
    <PageHeader eyebrow="Minu õpingud" title={`Tere, ${user.displayName || 'õpilane'}!`} description="Sinu tunnid, ülesanded, tulemused ja õppimise edenemine ühes vaates." />
    <div className="metric-grid"><Card className="metric-card metric-card--green"><div className="metric-card__top"><span>Läbitud tunnid</span><i><GraduationCap size={19} /></i></div><strong>{completedLessons.length}</strong><small>õppeajaloos</small></Card><Card className="metric-card metric-card--blue"><div className="metric-card__top"><span>Lähimad tunnid</span><i><CalendarDays size={19} /></i></div><strong>{upcoming.length}</strong><small>järgmise 28 päeva jooksul</small></Card><Card className="metric-card metric-card--amber"><div className="metric-card__top"><span>Pooleli ülesanded</span><i><BookOpen size={19} /></i></div><strong>{pendingHomework.length}</strong><small>ootab tegemist</small></Card><Card className="metric-card metric-card--purple"><div className="metric-card__top"><span>Tasumata jääk</span><i><WalletCards size={19} /></i></div><strong>{money(balance)}</strong><small>{invoices.length} arvet</small></Card></div>

    {!students.length ? <Card><EmptyState title="Õpilase profiil ei ole kontoga seotud" description="Palu administraatoril lisada sinu õpilase kaardile konto UID. Nime või e-posti põhjal profiili automaatselt ei seostata." /></Card> : <div className="student-home-grid">
      <Card><div className="section-heading"><div><span className="eyebrow">Profiil</span><h2>Minu õppeprofiil</h2></div></div><div className="student-home-profiles">{students.map((student) => {
        const progress = Object.entries(student.skillMap || {}).sort((left, right) => Number(right[1]) - Number(left[1])).slice(0, 5);
        return <article key={student.id}><div className="student-home-profile-head"><div className="student-mini-avatar">{student.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</div><span><strong>{student.name}</strong><small>{student.subject || 'Õppeaine puudub'} · {student.level || 'tase puudub'} → {student.targetLevel || '—'}</small><small>Õpetaja: {student.teacher || 'määramata'}</small></span></div>{progress.length ? <div className="student-home-skills">{progress.map(([skill, score]) => <div key={skill}><span>{skillLabel(skill)}</span><div><i style={{ width: `${Math.max(0, Math.min(100, Number(score) || 0))}%` }} /></div><strong>{score}%</strong></div>)}</div> : <p className="form-hint">Oskuste tulemusi ei ole veel salvestatud.</p>}</article>;
      })}</div></Card>

      <Card><div className="section-heading"><div><span className="eyebrow">Kalender</span><h2>Järgmised tunnid</h2></div></div>{upcoming.length ? <div className="simple-list student-home-lessons">{upcoming.map((lesson) => <div key={lesson.occurrenceId}><div><strong>{dateLabel(lesson.occurrenceDate)} · {lesson.time}</strong><span>{studentMap.get(lesson.studentId)?.name || lesson.studentName || 'Õpilane'} · {lesson.teacher || 'Õpetaja'}</span></div><Badge tone="info">{lesson.duration || 60} min</Badge></div>)}</div> : <EmptyState title="Lähimaid tunde ei ole" />}</Card>

      <Card><div className="section-heading"><div><span className="eyebrow">Kodutööd</span><h2>Pooleli ülesanded</h2></div><Link to="/homework">Kõik ülesanded <ChevronRight size={15} /></Link></div>{pendingHomework.length ? <div className="simple-list">{pendingHomework.slice(0, 6).map((item) => <div key={item.id}><div><strong>{item.task}</strong><span>{item.studentName || studentMap.get(item.studentId)?.name || 'Õpilane'}</span></div><Badge tone={item.due && item.due < today ? 'danger' : 'neutral'}>{item.due ? dateLabel(item.due) : 'Tähtajata'}</Badge></div>)}</div> : <EmptyState title="Kõik ülesanded on tehtud" />}</Card>

      <Card><div className="section-heading"><div><span className="eyebrow">Tagasiside</span><h2>Viimased tulemused</h2></div><Link to="/homework">Ava tööd <ChevronRight size={15} /></Link></div>{reviewedSubmissions.length ? <div className="student-home-feedback">{reviewedSubmissions.map((item) => <article key={`${item.submissionKind}-${item.id}`}><i><Star size={18} /></i><span><strong>{item.title}</strong><small>{item.teacherFeedback || 'Õpetaja lisas tulemuse.'}</small></span><Badge tone="success">{item.teacherGrade ? `Hinne ${item.teacherGrade}` : item.percentage != null ? `${item.percentage}%` : 'Kontrollitud'}</Badge></article>)}</div> : <EmptyState title="Õpetaja tagasisidet veel ei ole" />}</Card>

      <Card><div className="section-heading"><div><span className="eyebrow">Ajalugu</span><h2>Viimased tunnid</h2></div></div>{completedLessons.length ? <div className="simple-list">{completedLessons.slice(0, 6).map((lesson) => <div key={lesson.id}><div><strong>{dateLabel(lesson.date)} · {lesson.time || ''}</strong><span>{lesson.topic || lesson.subject || studentMap.get(lesson.studentId)?.subject || 'Õppetund'}</span></div><Badge tone="success">{lesson.status || 'Toimunud'}</Badge></div>)}</div> : <EmptyState title="Läbitud tunde veel ei ole" />}</Card>

      <Card><div className="section-heading"><div><span className="eyebrow">Kontakt</span><h2>Kiirviited</h2></div></div><div className="parent-quick-links"><Link to="/messages"><MessageSquareText size={21} /><span><strong>Sõnumid</strong><small>Kirjuta õpetajale</small></span><ChevronRight size={18} /></Link><Link to="/homework"><BookOpen size={21} /><span><strong>Kodutööd</strong><small>Tee ülesandeid ja vaata tagasisidet</small></span><ChevronRight size={18} /></Link></div></Card>
    </div>}
  </div>;
}
