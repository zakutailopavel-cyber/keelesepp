import { BookOpen, CalendarDays, ChevronRight, MessageSquareText, UsersRound, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import LessonTokensCard from '../students/LessonTokensCard.jsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import PeopleOverview from '../../components/PeopleOverview.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, invoicesService, lessonChangeRequestsService, lessonsService, scheduleService, studentsService } from '../../services/firebase/index.js';
import { requestFor } from '../calendar/rescheduleModel.js';
import RescheduleDialog from '../students/RescheduleDialog.jsx';
import { groupStudentPeople } from '../../services/firebase/students.js';
import { occurrencesForDates, shiftDate, toIsoDate } from '../calendar/calendarView.js';
import { invoiceBalanceCents } from '../students/studentFinance.js';
import OpenInvoicesCard from '../payments/OpenInvoicesCard.jsx';
import { INDIVIDUAL_TOPIC } from '../calendar/lessonTopic.js';
import RecordingConsentPrompt from '../lesson-recording/RecordingConsentPrompt.jsx';
import MyWordsCard from '../vocabulary/MyWordsCard.jsx';
import { ChildrenWordGrowth } from '../vocabulary/WordGrowthCard.jsx';
import { ChildrenMonthSteps } from '../learner/MonthStepsCard.jsx';
import LessonSummariesCard from '../vocabulary/LessonSummariesCard.jsx';
import PetOverview from '../pet/PetOverview.jsx';
import { isHomeworkOpen } from '../homework/homeworkStatus.js';
import SubjectSwitcher from '../students/SubjectSwitcher.jsx';
import AvailabilityCard from '../availability-poll/AvailabilityCard.jsx';
import LearnerAnnouncementsCard from '../announcements/LearnerAnnouncementsCard.jsx';
import { itemSubject, onlySubject, subjectsOf } from '../students/subjects.js';

function unique(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function money(cents) {
  return (Number(cents || 0) / 100).toLocaleString('et-EE', { style: 'currency', currency: 'EUR' });
}

export default function ParentDashboardPage({ studentRepository = studentsService, homeworkRepository = homeworkService, scheduleRepository = scheduleService, invoiceRepository = invoicesService, lessonRepository = lessonsService, changeRequests = lessonChangeRequestsService, consentService, wordsService, summaryService, petRepository, tokensApi, announcementService }) {
  const { user } = useAuth();
  const [rescheduling, setRescheduling] = useState(null);
  // one child with several subjects (owner 2026-10-20): the lessons and homework of one subject, or all
  const [subject, setSubject] = useState('');
  const state = useAsyncData(async () => {
    const studentRecords = await studentRepository.listOwned(user.uid);
    const students = groupStudentPeople(studentRecords);
    const studentIds = studentRecords.map((student) => student.id);
    const [homework, scheduleLists, invoiceLists, lessonLists] = await Promise.all([
      homeworkRepository.listByStudentIds(studentIds),
      Promise.all(studentIds.map((studentId) => scheduleRepository.listByStudent(studentId))),
      Promise.all(studentIds.map((studentId) => invoiceRepository.listByStudent(studentId))),
      Promise.all(studentIds.map((studentId) => (lessonRepository?.listByStudent ? lessonRepository.listByStudent(studentId).catch(() => []) : []))),
    ]);
    const requests = await Promise.resolve().then(() => changeRequests?.listForStudents?.(studentIds) || []).catch(() => []);
    return { students, studentRecords, homework, schedule: unique(scheduleLists.flat()), invoices: unique(invoiceLists.flat()), lessons: unique(lessonLists.flat()), requests };
  }, [homeworkRepository, invoiceRepository, lessonRepository, scheduleRepository, studentRepository, user.uid]);

  const today = toIsoDate();
  const nextDates = useMemo(() => Array.from({ length: 21 }, (_, index) => shiftDate(today, index)), [today]);
  if (state.loading) return <LoadingState label="Laen pere ülevaadet…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const { students, studentRecords, homework, schedule, invoices, lessons = [] } = state.data;
  const groupedByRecordId = new Map(students.flatMap((student) => (student.recordIds || [student.id]).map((id) => [id, student])));
  const studentMap = new Map(studentRecords.map((student) => [student.id, groupedByRecordId.get(student.id) || student]));
  const subjects = subjectsOf(students);
  const studentOf = (item) => studentMap.get(item.studentId) || null;
  const shown = (items) => onlySubject(items, subjects.length > 1 ? subject : '', studentOf);
  // the subject next to a lesson when the family has more than one
  const subjectTag = (item) => (subjects.length > 1 && !subject ? itemSubject(item, studentOf(item)) : '');
  const upcoming = shown(occurrencesForDates(schedule, nextDates)).slice(0, 6);
  const pendingHomework = shown(homework).filter(isHomeworkOpen);
  const balance = invoices.reduce((sum, invoice) => sum + invoiceBalanceCents(invoice), 0);
  // what was done in the last lessons: topic from Õppevara (level · theme · lesson) and the teacher's note
  const doneLessons = shown(lessons).filter((lesson) => !lesson.status || lesson.status === 'Toimunud').sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`)).slice(0, 6);

  return <div className="page-content">
    <PageHeader eyebrow="Minu pere" title={`Tere, ${user.displayName || 'lapsevanem'}!`} description="Laste õppetöö, tunnid ja arved ühes turvalises vaates." />
    <RecordingConsentPrompt students={studentRecords} user={user} role="parent" {...(consentService ? { service: consentService } : {})} />
    <PeopleOverview label="Pere kokkuvõte" eyebrow="Pere töölaud" title="Kõik oluline ühe pilguga" description="Laste tunnid, ülesanded ja arved on turvaliselt koos." metrics={[
      { icon: UsersRound, label: 'Õpilasi', value: students.length, hint: 'kontoga seotud' },
      { icon: CalendarDays, label: 'Lähimad tunnid', value: upcoming.length, hint: '21 päeva jooksul' },
      { icon: BookOpen, label: 'Pooleli ülesanded', value: pendingHomework.length, hint: 'ootab tegemist' },
      { icon: WalletCards, label: 'Tasumata jääk', value: money(balance), hint: `${invoices.length} arvet` },
    ]} />
    <SubjectSwitcher subjects={subjects} value={subject} onChange={setSubject} label="Näita õppeainet" />
    {!students.length ? <Card><EmptyState title="Õpilase kaarti ei ole kontoga seotud" description="Palu administraatoril siduda lapse olemasolev õpilase kaart sinu kontoga." /></Card> : <div className="parent-home-grid">
      <OpenInvoicesCard invoices={invoices} />
      <Card><div className="section-heading"><div><span className="eyebrow">Pere</span><h2>Minu õpilased</h2></div></div><div className="parent-home-students">{students.map((student) => <article className="parent-child-card" key={student.personKey || student.id}><div className="parent-child-card__head"><div className="student-mini-avatar">{student.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</div><div><strong>{student.name}</strong><small>{student.enrollments?.length || 0} õppesuun{student.enrollments?.length === 1 ? 'd' : 'da'}</small></div></div><div className="parent-child-enrollments">{(student.enrollments || []).filter((enrollment) => !subject || itemSubject({ subject: enrollment.subject }) === subject).map((enrollment) => <div key={enrollment.id}><strong>{enrollment.subject || 'Õppeaine puudub'}</strong><span>{enrollment.level || 'tase puudub'}{enrollment.targetLevel ? ` → ${enrollment.targetLevel}` : ''}</span><small>{enrollment.teacher || 'õpetaja määramata'}</small></div>)}</div></article>)}</div></Card>
      <Card><div className="section-heading"><div><span className="eyebrow">Õppetöö</span><h2>Mida tunnis tehti</h2></div></div>{doneLessons.length ? <div className="simple-list parent-home-done">{doneLessons.map((lesson) => <div key={lesson.id}><div><strong>{lesson.topic || INDIVIDUAL_TOPIC}</strong><span>{[new Date(`${lesson.date}T12:00:00`).toLocaleDateString('et-EE', { day: 'numeric', month: 'short' }), subjectTag(lesson), studentMap.get(lesson.studentId)?.name || lesson.studentName, [lesson.topicLevel, lesson.topicModule].filter(Boolean).join(' · ')].filter(Boolean).join(' · ')}</span>{lesson.billingStatus === 'school_covered' ? <Badge tone="success">Tasuta (kooli kulul)</Badge> : null}{lesson.notes ? <small className="parent-home-note">{lesson.notes}</small> : null}</div><Badge tone="success">Toimus</Badge></div>)}</div> : <EmptyState title="Läbitud tunde veel ei ole" />}</Card>
      <PetOverview studentIds={studentRecords.map((student) => student.id)} lessons={lessons} homework={homework} names={Object.fromEntries(studentRecords.map((student) => [student.id, student.name]))} {...(petRepository ? { repository: petRepository } : {})} {...(wordsService ? { wordsService } : {})} />
      {/* „Teated”: the school's announcements already answered, to read again (owner 2026-10-24) */}
      <LearnerAnnouncementsCard user={user} {...(announcementService ? { service: announcementService } : {})} />
      {/* „Millal sobib tund?” for each child (owner 2026-10-21) */}
      {students.map((student) => <AvailabilityCard key={`ajad-${student.id}`} studentId={student.id} studentName={student.name} user={user} mode="own" compact />)}
      {/* words learned, new this month, mistakes fixed per child (owner 2026-10-23) */}
      <ChildrenWordGrowth students={studentRecords} {...(wordsService ? { service: wordsService } : {})} />
      <ChildrenMonthSteps students={studentRecords} repository={homeworkRepository} />
      <LessonSummariesCard studentIds={studentRecords.map((student) => student.id)} {...(summaryService ? { summaryService } : {})} {...(wordsService ? { wordsService } : {})} homeworkService={homeworkRepository} />
      <MyWordsCard studentIds={studentRecords.map((student) => student.id)} readOnly {...(wordsService ? { service: wordsService } : {})} />
      <Card><div className="section-heading"><div><span className="eyebrow">Kalender</span><h2>Järgmised tunnid</h2></div></div>{upcoming.length ? <div className="simple-list parent-home-lessons">{upcoming.map((lesson) => <div key={lesson.occurrenceId}><div><strong>{new Date(`${lesson.occurrenceDate}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short', day: 'numeric', month: 'short' })} · {lesson.time}</strong><span>{[subjectTag(lesson), studentMap.get(lesson.studentId)?.name || lesson.studentName || 'Õpilane', lesson.teacher || 'Õpetaja'].filter(Boolean).join(' · ')}</span></div>{(() => { const request = requestFor(state.data.requests, lesson); return request?.status === 'pending' ? <Badge tone="warning">Palve saadetud</Badge> : <Button variant="secondary" onClick={() => setRescheduling(lesson)}>Ei saa tulla?</Button>; })()}</div>)}</div> : <EmptyState title="Lähimaid tunde ei ole" />}</Card>
      {/* lesson tokens of each child (shown only for a child with a package) */}{studentRecords.map((record) => <LessonTokensCard key={`tokens-${record.id}`} student={record} compact {...(tokensApi ? { service: tokensApi } : {})} />)}
      <Card><div className="section-heading"><div><span className="eyebrow">Kodutööd</span><h2>Pooleli ülesanded</h2></div><Link to="/homework">Kõik ülesanded <ChevronRight size={15} /></Link></div>{pendingHomework.length ? <div className="simple-list">{pendingHomework.slice(0, 6).map((item) => <div key={item.id}><div><strong>{item.task}</strong><span>{item.studentName || studentMap.get(item.studentId)?.name || 'Õpilane'}</span></div><Badge tone={item.due && item.due < today ? 'danger' : 'neutral'}>{item.due || 'Tähtajata'}</Badge></div>)}</div> : <EmptyState title="Kõik ülesanded on tehtud" />}</Card>
      <Card><div className="section-heading"><div><span className="eyebrow">Kontakt</span><h2>Kiirviited</h2></div></div><div className="parent-quick-links"><Link to="/messages"><MessageSquareText size={21} /><span><strong>Sõnumid</strong><small>Kirjuta õpetajale</small></span><ChevronRight size={18} /></Link><Link to="/homework"><BookOpen size={21} /><span><strong>Kodutööd</strong><small>Ava ülesanded ja tagasiside</small></span><ChevronRight size={18} /></Link></div></Card>
    </div>}
    {rescheduling ? <RescheduleDialog lesson={rescheduling} student={studentRecords.find((item) => item.id === rescheduling.studentId) || { id: rescheduling.studentId, name: rescheduling.studentName }} user={user} role="parent"
      busy={upcoming.map((item) => ({ date: item.occurrenceDate, time: item.time, duration: item.duration }))} requests={changeRequests}
      onClose={() => setRescheduling(null)} onSent={() => { setRescheduling(null); state.reload(); }} /> : null}
  </div>;
}
