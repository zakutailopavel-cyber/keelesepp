import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, lessonsService, libraryService, petsService, studentsService } from '../../services/firebase/index.js';
import LearnerAnnouncementsCard from '../announcements/LearnerAnnouncementsCard.jsx';
import AvailabilityCard from '../availability-poll/AvailabilityCard.jsx';
import { buildTopicCatalog } from '../calendar/lessonTopic.js';
import MonthStepsCard from '../learner/MonthStepsCard.jsx';
import { heldCourseLessons, lessonProgress, nextLesson as nextCourseLesson, progressMap } from '../self-study/selfStudyModel.js';
import LessonSummariesCard from '../vocabulary/LessonSummariesCard.jsx';
import WordGrowthCard from '../vocabulary/WordGrowthCard.jsx';
import { wordGrowth } from '../vocabulary/wordGrowth.js';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import { autoSkills } from './autoSkills.js';
import { levelProgress, speakingFromStats } from './levelProgress.js';
import MyProgressCard from './MyProgressCard.jsx';
import './studentHome.css';
import { mainSubject, onlySubject, subjectsOf } from './subjects.js';
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
    const [curriculum, sheets, stats, lessonLists] = await Promise.all([
      Promise.resolve().then(() => catalogRepository.listCurriculum?.() || []).catch(() => []),
      Promise.resolve().then(() => homeworkRepository.listWorksheetAssignmentsByStudentIds?.(studentIds) || []).catch(() => []),
      Promise.resolve().then(() => (preview ? petRepository.lessonStatsForStudents?.(studentIds) : petRepository.lessonStats?.(user.uid)) || []).catch(() => []),
      Promise.all(studentIds.map((studentId) => lessonRepository.listByStudent(studentId))),
    ]);
    return { students, curriculum, sheets, stats, lessons: [...new Map(lessonLists.flat().map((item) => [item.id, item])).values()] };
  }, [catalogRepository, homeworkRepository, lessonRepository, petRepository, preview?.studentId, studentRepository, user.uid]);
  const words = useStudentWords((state.data?.students || []).map((student) => student.id), ...(wordsService ? [wordsService] : []));

  const loaded = Boolean(state.data);
  // a line on the home page leads to one card here
  useEffect(() => {
    if (!loaded || !location.hash) return;
    try { document.getElementById(location.hash.slice(1))?.scrollIntoView?.({ block: 'start' }); } catch { /* an odd hash */ }
  }, [loaded, location.hash]);

  if (state.loading) return <LoadingState label="Laen sinu arengut…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const { students, curriculum, sheets, stats } = state.data;
  if (!students.length) return <div className="page-content"><PageHeader title="Minu areng" /><Card><EmptyState title="Õpilase profiil ei ole kontoga seotud" description="Palu administraatoril siduda õpilase kaart sinu kontoga." /></Card></div>;
  const studentMap = new Map(students.map((student) => [student.id, student]));
  const subjects = subjectsOf(students);
  const chosen = subjects.length > 1 ? subject : '';
  const lessons = onlySubject(state.data.lessons, chosen, (item) => studentMap.get(item.studentId) || null);
  const progress = (() => {
    const student = students[0];
    const catalog = buildTopicCatalog(curriculum);
    const map = progressMap(sheets);
    // a course lesson held with the teacher (Live Classroom, the calendar topic) counts as done like its three sheets
    const held = heldCourseLessons(lessons);
    const courseByLevel = Object.fromEntries(catalog.levels.map((entry) => {
      const list = entry.modules.flatMap((module) => module.lessons);
      const next = nextCourseLesson(list.filter((lesson) => !held.has(lesson.id)), map);
      return [entry.key, { done: list.filter((lesson) => held.has(lesson.id) || lessonProgress(lesson.id, map).done === 3).length, total: list.length, next: next ? `${next.number ? `${next.number}. ` : ''}${next.title}` : null }];
    }));
    const computed = [...autoSkills({ assignments: sheets }), ...[speakingFromStats(stats)].filter(Boolean)];
    return levelProgress({ level: student.level, target: student.targetLevel, computed, skillMap: student.skillMap, courseByLevel, subject: mainSubject(student), wordCounts: wordGrowth(words) });
  })();

  return <div className="page-content">
    <PageHeader title="Minu areng" description={<>Siit näed, kuidas sul läheb. Siin pole vaja midagi ära teha.<span lang="ru"> · Здесь видно твой прогресс, делать ничего не нужно.</span></>} />
    <SubjectSwitcher subjects={subjects} value={subject} onChange={setSubject} label="Minu õppeained" />
    {/* „Minu areng” follows the Estonian course; another subject has its own teacher's plan */}
    {!chosen || chosen === 'Eesti keel' ? <MyProgressCard progress={progress} /> : null}
    <WordGrowthCard words={words} />
    <MonthStepsCard assignments={sheets} />
    <p><Link className="sh-link" to="/homework#vaadatud">Õpetaja tagasiside on lehel „Ülesanded” <ChevronRight size={15} aria-hidden="true" /></Link></p>
    <div className="student-home-grid">
      <LessonSummariesCard studentIds={students.map((student) => student.id)} {...(summaryService ? { summaryService } : {})} {...(wordsService ? { wordsService } : {})} homeworkService={homeworkRepository} />
      {/* „Millal sulle tund sobib?”: the student keeps the times that suit up to date (owner 2026-10-21) */}
      {students.slice(0, 1).map((student) => <AvailabilityCard key={`ajad-${student.id}`} studentId={student.id} user={user} mode={preview ? 'view' : 'own'} compact subjects={subjectsOf(student)} />)}
      {/* „Teated”: the school's announcements already answered, to read again (owner 2026-10-24) */}
      {!preview ? <div id="teated"><LearnerAnnouncementsCard user={user} {...(announcementService ? { service: announcementService } : {})} /></div> : null}
    </div>
  </div>;
}
