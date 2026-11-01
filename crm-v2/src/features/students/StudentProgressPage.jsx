import { ChevronRight, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, lessonsService, libraryService, petsService, studentsService } from '../../services/firebase/index.js';
import LearnerAnnouncementsCard from '../announcements/LearnerAnnouncementsCard.jsx';
import AvailabilityCard from '../availability-poll/AvailabilityCard.jsx';
import { buildTopicCatalog } from '../calendar/lessonTopic.js';
import MonthStepsCard from '../learner/MonthStepsCard.jsx';
import { lessonProgress, nextLesson as nextCourseLesson, progressMap } from '../self-study/selfStudyModel.js';
import LessonSummariesCard from '../vocabulary/LessonSummariesCard.jsx';
import WordGrowthCard from '../vocabulary/WordGrowthCard.jsx';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import { autoSkills } from './autoSkills.js';
import { levelProgress, speakingFromStats } from './levelProgress.js';
import MyProgressCard from './MyProgressCard.jsx';
import { markFeedbackSeen } from './nextStep.js';
import './studentHome.css';
import { onlySubject, subjectsOf } from './subjects.js';
import SubjectSwitcher from './SubjectSwitcher.jsx';

/**
 * „Minu areng” (owner 2026-11-01): what used to stand above and under the student's day on the home page. Moved here
 * whole, so the home page shows only what to do today. The heavy reads (the course, all sheets, lesson stats) happen here.
 */
export default function StudentProgressPage({
  studentRepository = studentsService,
  homeworkRepository = homeworkService,
  lessonRepository = lessonsService,
  petRepository = petsService,
  catalogRepository = libraryService,
  wordsService,
  summaryService,
  announcementService,
}) {
  const { user, preview } = useAuth();
  const [subject, setSubject] = useState('');
  const location = useLocation();
  const state = useAsyncData(async () => {
    const students = preview?.studentId
      ? [await studentRepository.getById(preview.studentId)].filter(Boolean)
      : await studentRepository.listSelf(user.uid);
    const studentIds = students.map((student) => student.id);
    // each may fail alone without breaking the page
    const [curriculum, sheets, stats, submissions, lessonLists] = await Promise.all([
      Promise.resolve().then(() => catalogRepository.listCurriculum?.() || []).catch(() => []),
      Promise.resolve().then(() => homeworkRepository.listWorksheetAssignmentsByStudentIds?.(studentIds) || []).catch(() => []),
      Promise.resolve().then(() => (preview ? petRepository.lessonStatsForStudents?.(studentIds) : petRepository.lessonStats?.(user.uid)) || []).catch(() => []),
      homeworkRepository.listSubmissionsByStudentIds(studentIds),
      Promise.all(studentIds.map((studentId) => lessonRepository.listByStudent(studentId))),
    ]);
    return { students, curriculum, sheets, stats, submissions, lessons: [...new Map(lessonLists.flat().map((item) => [item.id, item])).values()] };
  }, [catalogRepository, homeworkRepository, lessonRepository, petRepository, preview?.studentId, studentRepository, user.uid]);
  const words = useStudentWords((state.data?.students || []).map((student) => student.id), ...(wordsService ? [wordsService] : []));

  // opening the results counts as having seen the feedback (never in the staff's preview)
  const loaded = Boolean(state.data);
  useEffect(() => { if (loaded && !preview) markFeedbackSeen(user.uid); }, [loaded, preview, user.uid]);
  // a line on the home page leads to one card here
  useEffect(() => {
    if (!loaded || !location.hash) return;
    try { document.getElementById(location.hash.slice(1))?.scrollIntoView?.({ block: 'start' }); } catch { /* an odd hash */ }
  }, [loaded, location.hash]);

  if (state.loading) return <LoadingState label="Laen sinu arengut…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const { students, curriculum, sheets, stats, submissions } = state.data;
  if (!students.length) return <div className="page-content"><PageHeader title="Minu areng" /><Card><EmptyState title="Õpilase profiil ei ole kontoga seotud" description="Palu administraatoril siduda õpilase kaart sinu kontoga." /></Card></div>;
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const subjects = subjectsOf(students);
  const chosen = subjects.length > 1 ? subject : '';
  const lessons = onlySubject(state.data.lessons, chosen, (item) => studentMap.get(item.studentId) || null);
  const reviewed = submissions.filter((item) => item.reviewStatus === 'reviewed').slice(0, 5);
  const progress = (() => {
    const student = students[0];
    const catalog = buildTopicCatalog(curriculum);
    const map = progressMap(sheets);
    // a course lesson held with the teacher (Live Classroom, the calendar topic) counts as done like its three sheets
    const held = new Set(lessons.filter((lesson) => lesson.topicLessonId && (!lesson.status || lesson.status === 'Toimunud')).map((lesson) => lesson.topicLessonId));
    const courseByLevel = Object.fromEntries(catalog.levels.map((entry) => {
      const list = entry.modules.flatMap((module) => module.lessons);
      const next = nextCourseLesson(list.filter((lesson) => !held.has(lesson.id)), map);
      return [entry.key, { done: list.filter((lesson) => held.has(lesson.id) || lessonProgress(lesson.id, map).done === 3).length, total: list.length, next: next ? `${next.number ? `${next.number}. ` : ''}${next.title}` : null }];
    }));
    const computed = [...autoSkills({ assignments: sheets }), ...[speakingFromStats(stats)].filter(Boolean)];
    return levelProgress({ level: student.level, target: student.targetLevel, computed, skillMap: student.skillMap, courseByLevel });
  })();

  return <div className="page-content">
    <PageHeader eyebrow="Täna · Minu areng" title="Minu areng" description="Kuidas sul läheb: tase, sõnad, kuu sammud, tundide kokkuvõtted ja õpetaja tagasiside." />
    <SubjectSwitcher subjects={subjects} value={subject} onChange={setSubject} label="Minu õppeained" />
    {/* „Minu areng” follows the Estonian course; another subject has its own teacher's plan */}
    {!chosen || chosen === 'Eesti keel' ? <MyProgressCard progress={progress} /> : null}
    <WordGrowthCard words={words} />
    <MonthStepsCard assignments={sheets} />
    <div className="student-home-grid">
      <LessonSummariesCard studentIds={students.map((student) => student.id)} {...(summaryService ? { summaryService } : {})} {...(wordsService ? { wordsService } : {})} homeworkService={homeworkRepository} />
      <Card id="tulemused"><div className="section-heading"><div><span className="eyebrow">Tagasiside</span><h2>Viimased tulemused</h2></div><Link to="/homework">Ava tööd <ChevronRight size={15} /></Link></div>{reviewed.length ? <div className="student-home-feedback">{reviewed.map((item) => <article key={`${item.submissionKind}-${item.id}`}><i><Star size={18} /></i><span><strong>{item.title}</strong><small>{item.teacherFeedback || 'Õpetaja lisas tulemuse.'}</small></span><Badge tone="success">{item.teacherGrade ? `Hinne ${item.teacherGrade}` : item.percentage != null ? `${item.percentage}%` : 'Kontrollitud'}</Badge></article>)}</div> : <EmptyState title="Õpetaja tagasisidet veel ei ole" />}</Card>
      {/* „Millal sulle tund sobib?”: the student keeps the times that suit up to date (owner 2026-10-21) */}
      {students.slice(0, 1).map((student) => <AvailabilityCard key={`ajad-${student.id}`} studentId={student.id} user={user} mode={preview ? 'view' : 'own'} compact subjects={subjectsOf(student)} />)}
      {/* „Teated”: the school's announcements already answered, to read again (owner 2026-10-24) */}
      {!preview ? <div id="teated"><LearnerAnnouncementsCard user={user} {...(announcementService ? { service: announcementService } : {})} /></div> : null}
    </div>
  </div>;
}
