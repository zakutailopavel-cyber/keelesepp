import { BookOpen, CalendarDays, SpellCheck, Check, ChevronRight, Flame, Gamepad2, Languages, MessageSquareText, Star, Video, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, invoicesService, lessonChangeRequestsService, lessonsService, libraryService, petsService, scheduleService, studentsService } from '../../services/firebase/index.js';
import { isAbsenceOnly, requestFor } from '../calendar/rescheduleModel.js';
import RescheduleDialog from './RescheduleDialog.jsx';
import { buildTopicCatalog } from '../calendar/lessonTopic.js';
import { lessonProgress, nextLesson as nextCourseLesson, progressMap } from '../self-study/selfStudyModel.js';
import { readDone } from '../self-study/reviewStore.js';
import { autoSkills } from './autoSkills.js';
import { levelProgress, speakingFromStats } from './levelProgress.js';
import MyProgressCard from './MyProgressCard.jsx';
import WordGrowthCard from '../vocabulary/WordGrowthCard.jsx';
import MonthStepsCard from '../learner/MonthStepsCard.jsx';
import { petProgress } from '../pet/petModel.js';
import { todayPath } from './todayPath.js';
import { petReact } from '../pet/petEvents.js';
import { occurrencesForDates, shiftDate, toIsoDate } from '../calendar/calendarView.js';
import { invoiceBalanceCents } from './studentFinance.js';
import OpenInvoicesCard from '../payments/OpenInvoicesCard.jsx';
import RecordingConsentPrompt from '../lesson-recording/RecordingConsentPrompt.jsx';
import MyWordsCard from '../vocabulary/MyWordsCard.jsx';
import LessonSummariesCard from '../vocabulary/LessonSummariesCard.jsx';
import { useStudentWords } from '../vocabulary/useStudentWords.js';

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


import SubjectSwitcher from './SubjectSwitcher.jsx';
import AvailabilityCard from '../availability-poll/AvailabilityCard.jsx';
import LearnerAnnouncementsCard from '../announcements/LearnerAnnouncementsCard.jsx';
import { itemSubject, onlySubject, subjectsOf } from './subjects.js';

export default function StudentDashboardPage({
  studentRepository = studentsService,
  homeworkRepository = homeworkService,
  scheduleRepository = scheduleService,
  invoiceRepository = invoicesService,
  lessonRepository = lessonsService,
  petRepository = petsService,
  catalogRepository = libraryService,
  changeRequests = lessonChangeRequestsService,
  consentService,
  wordsService,
  summaryService,
  announcementService,
}) {
  const { user, preview } = useAuth();
  const [rescheduling, setRescheduling] = useState(false);
  // several subjects on one card (owner 2026-10-20): the next lesson and the work of one subject, or all
  const [subject, setSubject] = useState('');
  const state = useAsyncData(async () => {
    const students = preview?.studentId
      ? [await studentRepository.getById(preview.studentId)].filter(Boolean)
      : await studentRepository.listSelf(user.uid);
    const studentIds = students.map((student) => student.id);
    // „Minu areng” needs the course, all his sheets and his lesson stats; each may fail alone without breaking the page
    const [progressData] = await Promise.all([Promise.all([
      Promise.resolve().then(() => catalogRepository.listCurriculum?.() || []).catch(() => []),
      Promise.resolve().then(() => homeworkRepository.listWorksheetAssignmentsByStudentIds?.(studentIds) || []).catch(() => []),
      preview ? [] : Promise.resolve().then(() => petRepository.lessonStats?.(user.uid) || []).catch(() => []),
    ])]);
    const [pet, homework, submissions, scheduleLists, invoiceLists, lessonLists] = await Promise.all([
      preview ? null : Promise.resolve().then(() => petRepository.get?.(user.uid)).catch(() => null),
      homeworkRepository.listByStudentIds(studentIds),
      homeworkRepository.listSubmissionsByStudentIds(studentIds),
      Promise.all(studentIds.map((studentId) => scheduleRepository.listByStudent(studentId))),
      Promise.all(studentIds.map((studentId) => invoiceRepository.listByStudent(studentId))),
      Promise.all(studentIds.map((studentId) => lessonRepository.listByStudent(studentId))),
    ]);
    const requests = await Promise.resolve().then(() => changeRequests?.listForStudents?.(studentIds) || []).catch(() => []);
    return {
      progressData,
      pet: pet || null,
      students,
      homework,
      submissions,
      schedule: unique(scheduleLists.flat()),
      invoices: unique(invoiceLists.flat()),
      lessons: unique(lessonLists.flat()),
      requests,
    };
  }, [homeworkRepository, invoiceRepository, lessonRepository, preview?.studentId, scheduleRepository, studentRepository, user.uid]);

  // words of „Minu sõnad” also feed the pet (learned words, practice days)
  const words = useStudentWords((state.data?.students || []).map((student) => student.id), ...(wordsService ? [wordsService] : []));
  const today = toIsoDate();
  const nextDates = useMemo(() => Array.from({ length: 28 }, (_, index) => shiftDate(today, index)), [today]);
  // the whole day's path done → the walking pet shows a flame, once a day
  const reviewedToday = readDone(user?.uid).errors?.date === today || user?.profile?.practice?.errorsDate === today;
  const pathDone = useMemo(() => {
    if (!state.data) return false;
    const day = todayPath({ words, homework: state.data.homework, submissions: state.data.submissions, pet: state.data.pet, assignments: (state.data.progressData?.[1] || []), mistakesDoneToday: reviewedToday, offerPet: !preview, today });
    return day.total > 0 && day.done === day.total;
  }, [state.data, words, today, reviewedToday, preview]);
  useEffect(() => {
    if (!pathDone || preview) return;
    try {
      const key = `ks-path-done-${today}`;
      if (globalThis.localStorage?.getItem(key)) return;
      globalThis.localStorage?.setItem(key, '1');
    } catch { return; }
    petReact('streak');
  }, [pathDone, preview, today]);
  if (state.loading) return <LoadingState label="Laen sinu õpinguid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const { students, submissions, invoices } = state.data;
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const subjects = subjectsOf(students);
  const chosen = subjects.length > 1 ? subject : '';
  const studentOf = (item) => studentMap.get(item.studentId) || null;
  const homework = onlySubject(state.data.homework, chosen, studentOf);
  const lessons = onlySubject(state.data.lessons, chosen, studentOf);
  const upcoming = onlySubject(occurrencesForDates(state.data.schedule, nextDates), chosen, studentOf).slice(0, 6);
  const reviewedSubmissions = submissions.filter((item) => item.reviewStatus === 'reviewed').slice(0, 5);
  const nextLesson = upcoming[0] || null;
  const nextRequest = requestFor(state.data.requests, nextLesson);
  const cancelRequest = async () => { try { await changeRequests.cancel(nextRequest.id); } finally { state.reload(); } };
  const progress = (() => {
    const [curriculum, allSheets, stats] = state.data.progressData || [[], [], []];
    const student = students[0];
    if (!student) return null;
    const catalog = buildTopicCatalog(curriculum);
    const map = progressMap(allSheets);
    const courseByLevel = Object.fromEntries(catalog.levels.map((entry) => {
      const list = entry.modules.flatMap((module) => module.lessons);
      const next = nextCourseLesson(list, map);
      return [entry.key, { done: list.filter((lesson) => lessonProgress(lesson.id, map).done === 3).length, total: list.length, next: next ? `${next.number ? `${next.number}. ` : ''}${next.title}` : null }];
    }));
    const computed = [...autoSkills({ assignments: allSheets }), ...[speakingFromStats(stats)].filter(Boolean)];
    return levelProgress({ level: student.level, target: student.targetLevel, computed, skillMap: student.skillMap, courseByLevel });
  })();
  const path = todayPath({ words, homework, submissions, pet: state.data.pet, assignments: (state.data.progressData?.[1] || []), mistakesDoneToday: reviewedToday, offerPet: !preview, today });
  const streak = petProgress({ lessons, submissions, homework, words }).streak;
  const STEP_ICON = { words: Languages, work: BookOpen, mistakes: SpellCheck, pet: Gamepad2 };
  const balance = invoices.reduce((sum, invoice) => sum + invoiceBalanceCents(invoice), 0);

  return <div className="page-content">
    <PageHeader eyebrow="Minu õpingud" title={`Tere, ${user.displayName || 'õpilane'}!`} description="Alusta ülevalt: plokis „Täna” on kõik, mida täna teha. Iga töö kontrollitakse kohe." />
    {!preview?.studentId ? <RecordingConsentPrompt students={students} user={user} role="student" {...(consentService ? { service: consentService } : {})} /> : null}

    {/* „Minu areng” first, then „Täna” (owner 2026-10-12) */}
    <SubjectSwitcher subjects={subjects} value={subject} onChange={setSubject} label="Minu õppeained" />
    {/* „Minu areng” follows the Estonian course; another subject has its own teacher's plan */}
    {students.length && (!chosen || chosen === 'Eesti keel') ? <MyProgressCard progress={progress} /> : null}
    {/* plain numbers: words learned, new this month, own mistakes fixed (owner 2026-10-23) */}
    {students.length ? <WordGrowthCard words={words} /> : null}
    {/* „Kuu sammud”: the month's lesson steps and how well each is mastered (owner 2026-10-23) */}
    {students.length ? <MonthStepsCard assignments={state.data.progressData?.[1] || []} /> : null}
    {students.length ? <section className="student-path" aria-label="Täna">
      <header className="student-path__head">
        <div><span className="eyebrow">Täna</span><h2>{path.done === path.total ? 'Kõik tänased sammud tehtud!' : `${path.done}/${path.total} sammu tehtud`}</h2></div>
        <span className={`student-path__streak ${streak ? 'is-on' : ''}`} title="Õppimise päevi järjest"><Flame size={17} aria-hidden="true" /> {streak} {streak === 1 ? 'päev' : 'päeva'} järjest</span>
      </header>
      <div className="student-path__bar" aria-hidden="true"><i style={{ width: `${path.total ? Math.round((path.done / path.total) * 100) : 0}%` }} /></div>
      <div className="student-today">
        <Link className="student-today__card is-lesson" to={nextLesson?.occurrenceDate === today ? '/live-classroom' : '/homework'}>
          <i>{nextLesson?.occurrenceDate === today ? <Video size={22} /> : <CalendarDays size={22} />}</i>
          <span><small>Järgmine tund</small><strong>{nextLesson ? `${nextLesson.occurrenceDate === today ? 'Täna' : dateLabel(nextLesson.occurrenceDate)} · ${nextLesson.time}` : 'Tunde ei ole plaanis'}</strong><em>{nextLesson ? (nextLesson.occurrenceDate === today ? 'Ava Live Classroom' : [subjects.length > 1 ? itemSubject(nextLesson, studentOf(nextLesson)) : '', nextLesson.teacher || 'Õpetaja', `${nextLesson.duration || 60} min`].filter(Boolean).join(' · ')) : 'Õpetaja lisab tunni kalendrisse'}</em></span>
        </Link>
        {path.steps.map((step, index) => {
          const Icon = step.done ? Check : STEP_ICON[step.key];
          return <Link key={step.key} className={`student-today__card is-step ${step.done ? 'is-done' : 'is-todo'}`} to={step.to}>
            <i><Icon size={22} /></i>
            <span><small>{index + 1}. samm</small><strong>{step.label}</strong><em>{step.detail}</em></span>
          </Link>;
        })}
        {balance > 0 ? <div className="student-today__card is-todo">
          <i><WalletCards size={22} /></i>
          <span><small>Arved</small><strong>{money(balance)}</strong><em>{invoices.length} arvet · tasumata</em></span>
        </div> : null}
      </div>
      {nextLesson && !preview ? <div className="student-path__reschedule">
        {nextRequest?.status === 'pending' ? <p className="form-hint" role="status">{isAbsenceOnly(nextRequest) ? 'Teade, et sa ei tule, on õpetajale saadetud.' : 'Palve tund üle viia on saadetud. Tund jääb oma kohale, kuni õpetaja vastab.'} <button type="button" className="link-button" onClick={cancelRequest}>Võta palve tagasi</button></p>
          : nextRequest?.status === 'accepted' && isAbsenceOnly(nextRequest) ? <p className="form-hint" role="status">Õpetaja märkis, et sa sellesse tundi ei tule.</p>
          : nextRequest?.status === 'declined' ? <p className="form-hint" role="status">Õpetaja ei saanud tundi üle viia{nextRequest.teacherNote ? `: ${nextRequest.teacherNote}` : ''}. Tund jääb samale ajale. <button type="button" className="link-button" onClick={() => setRescheduling(true)}>Küsi uuesti</button></p>
            : <Button variant="secondary" onClick={() => setRescheduling(true)}>Ei saa tulla?</Button>}
      </div> : null}
    </section> : null}
    {rescheduling && nextLesson ? <RescheduleDialog lesson={nextLesson} student={studentMap.get(nextLesson.studentId) || students[0]} user={user} role="student"
      busy={upcoming.map((item) => ({ date: item.occurrenceDate, time: item.time, duration: item.duration }))} requests={changeRequests}
      onClose={() => setRescheduling(false)} onSent={() => { setRescheduling(false); state.reload(); }} /> : null}
    {!students.length ? <Card><EmptyState title="Õpilase profiil ei ole kontoga seotud" description="Palu administraatoril lisada sinu õpilase kaardile konto UID. Nime või e-posti põhjal profiili automaatselt ei seostata." /></Card> : <div className="student-home-grid">
      <OpenInvoicesCard invoices={invoices} readOnly={Boolean(preview)} />

      {/* „Teated”: the school's announcements already answered, to read again (owner 2026-10-24) */}
      {!preview ? <LearnerAnnouncementsCard user={user} {...(announcementService ? { service: announcementService } : {})} /> : null}

      {/* „Millal sulle tund sobib?” — the student keeps the times that suit up to date (owner 2026-10-21) */}
      {students.slice(0, 1).map((student) => <AvailabilityCard key={`ajad-${student.id}`} studentId={student.id} user={user} mode={preview ? 'view' : 'own'} compact />)}

      <LessonSummariesCard studentIds={students.map((student) => student.id)} {...(summaryService ? { summaryService } : {})} {...(wordsService ? { wordsService } : {})} homeworkService={homeworkRepository} />

      <Card><div className="section-heading"><div><span className="eyebrow">Tagasiside</span><h2>Viimased tulemused</h2></div><Link to="/homework">Ava tööd <ChevronRight size={15} /></Link></div>{reviewedSubmissions.length ? <div className="student-home-feedback">{reviewedSubmissions.map((item) => <article key={`${item.submissionKind}-${item.id}`}><i><Star size={18} /></i><span><strong>{item.title}</strong><small>{item.teacherFeedback || 'Õpetaja lisas tulemuse.'}</small></span><Badge tone="success">{item.teacherGrade ? `Hinne ${item.teacherGrade}` : item.percentage != null ? `${item.percentage}%` : 'Kontrollitud'}</Badge></article>)}</div> : <EmptyState title="Õpetaja tagasisidet veel ei ole" />}</Card>

    </div>}
  </div>;
}
