import { BookOpen, CalendarDays, Check, ChevronRight, Flame, Gamepad2, Languages, MessageSquareText, Star, Video, WalletCards } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, invoicesService, lessonsService, libraryService, petsService, scheduleService, studentsService } from '../../services/firebase/index.js';
import { buildTopicCatalog } from '../calendar/lessonTopic.js';
import { lessonProgress, nextLesson as nextCourseLesson, progressMap } from '../self-study/selfStudyModel.js';
import { reviewedOn } from '../self-study/reviewStore.js';
import { autoSkills } from './autoSkills.js';
import { levelProgress, speakingFromStats } from './levelProgress.js';
import MyProgressCard from './MyProgressCard.jsx';
import { petProgress } from '../pet/petModel.js';
import { todayPath } from './todayPath.js';
import { petReact } from '../pet/petEvents.js';
import { occurrencesForDates, shiftDate, toIsoDate } from '../calendar/calendarView.js';
import { invoiceBalanceCents } from './studentFinance.js';
import RecordingConsentPrompt from '../lesson-recording/RecordingConsentPrompt.jsx';
import MyWordsCard from '../vocabulary/MyWordsCard.jsx';
import LessonSummariesCard from '../vocabulary/LessonSummariesCard.jsx';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import { isHomeworkOpen } from '../homework/homeworkStatus.js';

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
  petRepository = petsService,
  catalogRepository = libraryService,
  consentService,
  wordsService,
  summaryService,
}) {
  const { user, preview } = useAuth();
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
    return {
      progressData,
      pet: pet || null,
      students,
      homework,
      submissions,
      schedule: unique(scheduleLists.flat()),
      invoices: unique(invoiceLists.flat()),
      lessons: unique(lessonLists.flat()),
    };
  }, [homeworkRepository, invoiceRepository, lessonRepository, preview?.studentId, scheduleRepository, studentRepository, user.uid]);

  // words of „Minu sõnad” also feed the pet (learned words, practice days)
  const words = useStudentWords((state.data?.students || []).map((student) => student.id), ...(wordsService ? [wordsService] : []));
  const today = toIsoDate();
  const nextDates = useMemo(() => Array.from({ length: 28 }, (_, index) => shiftDate(today, index)), [today]);
  // the whole day's path done → the walking pet shows a flame, once a day
  const reviewedToday = reviewedOn(user?.uid, today);
  const pathDone = useMemo(() => {
    if (!state.data) return false;
    const day = todayPath({ words, homework: state.data.homework, submissions: state.data.submissions, pet: state.data.pet, reviewedToday, today });
    return day.total > 0 && day.done === day.total;
  }, [state.data, words, today, reviewedToday]);
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

  const { students, homework, submissions, schedule, invoices, lessons } = state.data;
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const upcoming = occurrencesForDates(schedule, nextDates).slice(0, 6);
  const pendingHomework = homework.filter(isHomeworkOpen);
  const completedLessons = lessons.filter((lesson) => lesson.status !== 'Tühistatud');
  const reviewedSubmissions = submissions.filter((item) => item.reviewStatus === 'reviewed').slice(0, 5);
  const nextLesson = upcoming[0] || null;
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
  const path = todayPath({ words, homework, submissions, pet: state.data.pet, reviewedToday, today });
  const streak = petProgress({ lessons, submissions, homework, words }).streak;
  const STEP_ICON = { words: Languages, work: BookOpen, pet: Gamepad2 };
  const balance = invoices.reduce((sum, invoice) => sum + invoiceBalanceCents(invoice), 0);

  return <div className="page-content">
    <PageHeader eyebrow="Minu õpingud" title={`Tere, ${user.displayName || 'õpilane'}!`} description="Sinu tunnid, ülesanded, tulemused ja õppimise edenemine ühes vaates." />
    {!preview?.studentId ? <RecordingConsentPrompt students={students} user={user} role="student" {...(consentService ? { service: consentService } : {})} /> : null}

    {students.length ? <section className="student-path" aria-label="Täna">
      <header className="student-path__head">
        <div><span className="eyebrow">Tänane tee</span><h2>{path.done === path.total ? 'Kõik tänased sammud tehtud!' : `${path.done}/${path.total} sammu tehtud`}</h2></div>
        <span className={`student-path__streak ${streak ? 'is-on' : ''}`} title="Õppimise päevi järjest"><Flame size={17} aria-hidden="true" /> {streak} {streak === 1 ? 'päev' : 'päeva'} järjest</span>
      </header>
      <div className="student-path__bar" aria-hidden="true"><i style={{ width: `${path.total ? Math.round((path.done / path.total) * 100) : 0}%` }} /></div>
      <div className="student-today">
        <Link className="student-today__card is-lesson" to={nextLesson?.occurrenceDate === today ? '/live-classroom' : '/homework'}>
          <i>{nextLesson?.occurrenceDate === today ? <Video size={22} /> : <CalendarDays size={22} />}</i>
          <span><small>Järgmine tund</small><strong>{nextLesson ? `${nextLesson.occurrenceDate === today ? 'Täna' : dateLabel(nextLesson.occurrenceDate)} · ${nextLesson.time}` : 'Tunde ei ole plaanis'}</strong><em>{nextLesson ? (nextLesson.occurrenceDate === today ? 'Ava Live Classroom' : `${nextLesson.teacher || 'Õpetaja'} · ${nextLesson.duration || 60} min`) : 'Õpetaja lisab tunni kalendrisse'}</em></span>
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
    </section> : null}
    {students.length ? <MyProgressCard progress={progress} /> : null}
    {!students.length ? <Card><EmptyState title="Õpilase profiil ei ole kontoga seotud" description="Palu administraatoril lisada sinu õpilase kaardile konto UID. Nime või e-posti põhjal profiili automaatselt ei seostata." /></Card> : <div className="student-home-grid">

      <Card><div className="section-heading"><div><span className="eyebrow">Kalender</span><h2>Järgmised tunnid</h2></div></div>{upcoming.length ? <div className="simple-list student-home-lessons">{upcoming.map((lesson) => <div key={lesson.occurrenceId}><div><strong>{dateLabel(lesson.occurrenceDate)} · {lesson.time}</strong><span>{studentMap.get(lesson.studentId)?.name || lesson.studentName || 'Õpilane'} · {lesson.teacher || 'Õpetaja'}</span></div><Badge tone="info">{lesson.duration || 60} min</Badge></div>)}</div> : <EmptyState title="Lähimaid tunde ei ole" />}</Card>

      <Card><div className="section-heading"><div><span className="eyebrow">Kodutööd</span><h2>Pooleli ülesanded</h2></div><Link to="/homework">Kõik ülesanded <ChevronRight size={15} /></Link></div>{pendingHomework.length ? <div className="simple-list">{pendingHomework.slice(0, 6).map((item) => <div key={item.id}><div><strong>{item.task}</strong><span>{item.studentName || studentMap.get(item.studentId)?.name || 'Õpilane'}</span></div><Badge tone={item.due && item.due < today ? 'danger' : 'neutral'}>{item.due ? dateLabel(item.due) : 'Tähtajata'}</Badge></div>)}</div> : <EmptyState title="Kõik ülesanded on tehtud" />}</Card>

      <LessonSummariesCard studentIds={students.map((student) => student.id)} {...(summaryService ? { summaryService } : {})} {...(wordsService ? { wordsService } : {})} homeworkService={homeworkRepository} />

      <MyWordsCard studentIds={students.map((student) => student.id)} readOnly={Boolean(preview)} {...(wordsService ? { service: wordsService } : {})} />

      <Card><div className="section-heading"><div><span className="eyebrow">Tagasiside</span><h2>Viimased tulemused</h2></div><Link to="/homework">Ava tööd <ChevronRight size={15} /></Link></div>{reviewedSubmissions.length ? <div className="student-home-feedback">{reviewedSubmissions.map((item) => <article key={`${item.submissionKind}-${item.id}`}><i><Star size={18} /></i><span><strong>{item.title}</strong><small>{item.teacherFeedback || 'Õpetaja lisas tulemuse.'}</small></span><Badge tone="success">{item.teacherGrade ? `Hinne ${item.teacherGrade}` : item.percentage != null ? `${item.percentage}%` : 'Kontrollitud'}</Badge></article>)}</div> : <EmptyState title="Õpetaja tagasisidet veel ei ole" />}</Card>

      <Card><div className="section-heading"><div><span className="eyebrow">Ajalugu</span><h2>Viimased tunnid</h2></div></div>{completedLessons.length ? <div className="simple-list">{completedLessons.slice(0, 6).map((lesson) => <div key={lesson.id}><div><strong>{dateLabel(lesson.date)} · {lesson.time || ''}</strong><span>{lesson.topic || lesson.subject || studentMap.get(lesson.studentId)?.subject || 'Õppetund'}</span></div><Badge tone="success">{lesson.status || 'Toimunud'}</Badge></div>)}</div> : <EmptyState title="Läbitud tunde veel ei ole" />}</Card>

      <Card><div className="section-heading"><div><span className="eyebrow">Kontakt</span><h2>Kiirviited</h2></div></div><div className="parent-quick-links"><Link to="/messages"><MessageSquareText size={21} /><span><strong>Sõnumid</strong><small>Kirjuta õpetajale</small></span><ChevronRight size={18} /></Link><Link to="/homework"><BookOpen size={21} /><span><strong>Kodutööd</strong><small>Tee ülesandeid ja vaata tagasisidet</small></span><ChevronRight size={18} /></Link></div></Card>
      <Card><div className="section-heading"><div><span className="eyebrow">Profiil</span><h2>Minu õppeprofiil</h2></div></div><div className="student-home-profiles">{students.map((student) => {
        const progress = Object.entries(student.skillMap || {}).sort((left, right) => Number(right[1]) - Number(left[1])).slice(0, 5);
        return <article key={student.id}><div className="student-home-profile-head"><div className="student-mini-avatar">{student.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</div><span><strong>{student.name}</strong><small>{student.subject || 'Õppeaine puudub'} · {student.level || 'tase puudub'} → {student.targetLevel || '—'}</small><small>Õpetaja: {student.teacher || 'määramata'}</small></span></div>{progress.length ? <div className="student-home-skills">{progress.map(([skill, score]) => <div key={skill}><span>{skillLabel(skill)}</span><div><i style={{ width: `${Math.max(0, Math.min(100, Number(score) || 0))}%` }} /></div><strong>{score}%</strong></div>)}</div> : <p className="form-hint">Oskuste tulemusi ei ole veel salvestatud.</p>}</article>;
      })}</div></Card>
    </div>}
  </div>;
}
