import { BookOpen, CalendarDays, ChevronRight, MessageSquareText, UsersRound, WalletCards } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import PeopleOverview from '../../components/PeopleOverview.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, invoicesService, scheduleService, studentsService } from '../../services/firebase/index.js';
import { groupStudentPeople } from '../../services/firebase/students.js';
import { occurrencesForDates, shiftDate, toIsoDate } from '../calendar/calendarView.js';
import { invoiceBalanceCents } from '../students/studentFinance.js';

function unique(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function money(cents) {
  return (Number(cents || 0) / 100).toLocaleString('et-EE', { style: 'currency', currency: 'EUR' });
}

export default function ParentDashboardPage({ studentRepository = studentsService, homeworkRepository = homeworkService, scheduleRepository = scheduleService, invoiceRepository = invoicesService }) {
  const { user } = useAuth();
  const state = useAsyncData(async () => {
    const studentRecords = await studentRepository.listOwned(user.uid);
    const students = groupStudentPeople(studentRecords);
    const studentIds = studentRecords.map((student) => student.id);
    const [homework, scheduleLists, invoiceLists] = await Promise.all([
      homeworkRepository.listByStudentIds(studentIds),
      Promise.all(studentIds.map((studentId) => scheduleRepository.listByStudent(studentId))),
      Promise.all(studentIds.map((studentId) => invoiceRepository.listByStudent(studentId))),
    ]);
    return { students, studentRecords, homework, schedule: unique(scheduleLists.flat()), invoices: unique(invoiceLists.flat()) };
  }, [homeworkRepository, invoiceRepository, scheduleRepository, studentRepository, user.uid]);

  const today = toIsoDate();
  const nextDates = useMemo(() => Array.from({ length: 21 }, (_, index) => shiftDate(today, index)), [today]);
  if (state.loading) return <LoadingState label="Laen pere ülevaadet…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const { students, studentRecords, homework, schedule, invoices } = state.data;
  const groupedByRecordId = new Map(students.flatMap((student) => (student.recordIds || [student.id]).map((id) => [id, student])));
  const studentMap = new Map(studentRecords.map((student) => [student.id, groupedByRecordId.get(student.id) || student]));
  const upcoming = occurrencesForDates(schedule, nextDates).slice(0, 6);
  const pendingHomework = homework.filter((item) => item.status !== 'Tehtud');
  const balance = invoices.reduce((sum, invoice) => sum + invoiceBalanceCents(invoice), 0);

  return <div className="page-content">
    <PageHeader eyebrow="Minu pere" title={`Tere, ${user.displayName || 'lapsevanem'}!`} description="Laste õppetöö, tunnid ja arved ühes turvalises vaates." />
    <PeopleOverview label="Pere kokkuvõte" eyebrow="Pere töölaud" title="Kõik oluline ühe pilguga" description="Laste tunnid, ülesanded ja arved on turvaliselt koos." metrics={[
      { icon: UsersRound, label: 'Õpilasi', value: students.length, hint: 'kontoga seotud' },
      { icon: CalendarDays, label: 'Lähimad tunnid', value: upcoming.length, hint: '21 päeva jooksul' },
      { icon: BookOpen, label: 'Pooleli ülesanded', value: pendingHomework.length, hint: 'ootab tegemist' },
      { icon: WalletCards, label: 'Tasumata jääk', value: money(balance), hint: `${invoices.length} arvet` },
    ]} />
    {!students.length ? <Card><EmptyState title="Õpilase kaarti ei ole kontoga seotud" description="Palu administraatoril siduda lapse olemasolev õpilase kaart sinu kontoga." /></Card> : <div className="parent-home-grid">
      <Card><div className="section-heading"><div><span className="eyebrow">Pere</span><h2>Minu õpilased</h2></div></div><div className="parent-home-students">{students.map((student) => <article className="parent-child-card" key={student.personKey || student.id}><div className="parent-child-card__head"><div className="student-mini-avatar">{student.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</div><div><strong>{student.name}</strong><small>{student.enrollments?.length || 0} õppesuun{student.enrollments?.length === 1 ? 'd' : 'da'}</small></div></div><div className="parent-child-enrollments">{(student.enrollments || []).map((enrollment) => <div key={enrollment.id}><strong>{enrollment.subject || 'Õppeaine puudub'}</strong><span>{enrollment.level || 'tase puudub'}{enrollment.targetLevel ? ` → ${enrollment.targetLevel}` : ''}</span><small>{enrollment.teacher || 'õpetaja määramata'}</small></div>)}</div></article>)}</div></Card>
      <Card><div className="section-heading"><div><span className="eyebrow">Kalender</span><h2>Järgmised tunnid</h2></div></div>{upcoming.length ? <div className="simple-list parent-home-lessons">{upcoming.map((lesson) => <div key={lesson.occurrenceId}><div><strong>{new Date(`${lesson.occurrenceDate}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short', day: 'numeric', month: 'short' })} · {lesson.time}</strong><span>{studentMap.get(lesson.studentId)?.name || lesson.studentName || 'Õpilane'} · {lesson.teacher || 'Õpetaja'}</span></div><Badge tone="info">{lesson.duration || 60} min</Badge></div>)}</div> : <EmptyState title="Lähimaid tunde ei ole" />}</Card>
      <Card><div className="section-heading"><div><span className="eyebrow">Kodutööd</span><h2>Pooleli ülesanded</h2></div><Link to="/homework">Kõik ülesanded <ChevronRight size={15} /></Link></div>{pendingHomework.length ? <div className="simple-list">{pendingHomework.slice(0, 6).map((item) => <div key={item.id}><div><strong>{item.task}</strong><span>{item.studentName || studentMap.get(item.studentId)?.name || 'Õpilane'}</span></div><Badge tone={item.due && item.due < today ? 'danger' : 'neutral'}>{item.due || 'Tähtajata'}</Badge></div>)}</div> : <EmptyState title="Kõik ülesanded on tehtud" />}</Card>
      <Card><div className="section-heading"><div><span className="eyebrow">Kontakt</span><h2>Kiirviited</h2></div></div><div className="parent-quick-links"><Link to="/messages"><MessageSquareText size={21} /><span><strong>Sõnumid</strong><small>Kirjuta õpetajale</small></span><ChevronRight size={18} /></Link><Link to="/homework"><BookOpen size={21} /><span><strong>Kodutööd</strong><small>Ava ülesanded ja tagasiside</small></span><ChevronRight size={18} /></Link></div></Card>
    </div>}
  </div>;
}
