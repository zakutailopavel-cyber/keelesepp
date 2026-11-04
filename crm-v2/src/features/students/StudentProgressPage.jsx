import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { studentsService } from '../../services/firebase/students.js';
import LearnerAnnouncementsCard from '../announcements/LearnerAnnouncementsCard.jsx';
import AvailabilityCard from '../availability-poll/AvailabilityCard.jsx';
import MonthStepsCard from '../learner/MonthStepsCard.jsx';
import LessonSummariesCard from '../vocabulary/LessonSummariesCard.jsx';
import LessonBoardsCard from '../board/LessonBoardsCard.jsx';
import WordGrowthCard from '../vocabulary/WordGrowthCard.jsx';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import ProficiencyCard from '../progress-points/ProficiencyCard.jsx';
import { targetLevelOf } from '../progress-points/levelCurve.js';
import './studentHome.css';
import { subjectsOf } from './subjects.js';
import SubjectSwitcher from './SubjectSwitcher.jsx';

/**
 * „Minu areng” (owner 2026-11-01): what used to stand above and under the student's day on the home page. Moved here
 * whole, so the home page shows only what to do today. Owner 2026-11-04: the „Keeleoskus” curve is the one progress card
 * at the top; the older level / skills card („A1 → B1 · N% teest”) was removed from here.
 */
export default function StudentProgressPage({
  studentRepository = studentsService,
  homeworkRepository = homeworkService,
  wordsService,
  summaryService,
  boardCopiesService,
  announcementService,
  pointsService,
  goalsLoader,
}) {
  const { user, preview } = useAuth();
  const [subject, setSubject] = useState('');
  const location = useLocation();
  const state = useAsyncData(async () => {
    const students = preview?.studentId
      ? [await studentRepository.getById(preview.studentId)].filter(Boolean)
      : await studentRepository.listSelf(user.uid);
    const studentIds = students.map((student) => student.id);
    // the sheets (curve, „Kuu sammud”) may fail alone without breaking the page
    const sheets = await Promise.resolve().then(() => homeworkRepository.listWorksheetAssignmentsByStudentIds?.(studentIds) || []).catch(() => []);
    return { students, sheets };
  }, [homeworkRepository, preview?.studentId, studentRepository, user.uid]);
  const words = useStudentWords((state.data?.students || []).map((student) => student.id), ...(wordsService ? [wordsService] : []));

  const loaded = Boolean(state.data);
  // a line on the home page leads to one card here
  useEffect(() => {
    if (!loaded || !location.hash) return;
    try { document.getElementById(location.hash.slice(1))?.scrollIntoView?.({ block: 'start' }); } catch { /* an odd hash */ }
  }, [loaded, location.hash]);

  if (state.loading) return <LoadingState label="Laen sinu arengut…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const { students, sheets } = state.data;
  if (!students.length) return <div className="page-content"><PageHeader title="Minu areng" /><Card><EmptyState title="Õpilase profiil ei ole kontoga seotud" description="Palu administraatoril siduda õpilase kaart sinu kontoga." /></Card></div>;
  const subjects = subjectsOf(students);
  const chosen = subjects.length > 1 ? subject : '';

  return <div className="page-content">
    <PageHeader title="Minu areng" description={<>Siit näed, kuidas sul läheb. Siin pole vaja midagi ära teha.<span lang="ru"> · Здесь видно твой прогресс, делать ничего не нужно.</span></>} />
    <SubjectSwitcher subjects={subjects} value={subject} onChange={setSubject} label="Minu õppeained" />
    {/* „Minu areng” follows the Estonian course; another subject has its own teacher's plan */}
    {/* „Sinu B1 keeleoskus” (owner 2026-11-04): the same curve the parents see, at the top of „Minu areng” (not on the home screen) */}
    {!chosen || chosen === 'Eesti keel' ? <ProficiencyCard audience="student" studentIds={students.map((student) => student.id)} assignments={sheets} targetLevel={targetLevelOf(students[0])} {...(pointsService ? { service: pointsService } : {})} {...(goalsLoader ? { loadGoals: goalsLoader } : {})} /> : null}
    <WordGrowthCard words={words} />
    {/* „Kuu sammud” for the learner: traffic lights with the curve's „Oskan” rule, no percentages (owner 2026-11-04) */}
    <MonthStepsCard assignments={sheets} lights />
    <p><Link className="sh-link" to="/homework#vaadatud">Õpetaja tagasiside on lehel „Ülesanded” <ChevronRight size={15} aria-hidden="true" /></Link></p>
    <div className="student-home-grid">
      <LessonSummariesCard studentIds={students.map((student) => student.id)} {...(summaryService ? { summaryService } : {})} {...(wordsService ? { wordsService } : {})} homeworkService={homeworkRepository} />
      {/* „Tunni tahvlid”: the lesson boards as they were at the end of each lesson, read-only */}
      <LessonBoardsCard studentIds={students.map((student) => student.id)} {...(boardCopiesService ? { service: boardCopiesService } : {})} />
      {/* „Millal sulle tund sobib?”: the student keeps the times that suit up to date (owner 2026-10-21) */}
      {students.slice(0, 1).map((student) => <AvailabilityCard key={`ajad-${student.id}`} studentId={student.id} user={user} mode={preview ? 'view' : 'own'} compact subjects={subjectsOf(student)} />)}
      {/* „Teated”: the school's announcements already answered, to read again (owner 2026-10-24) */}
      {!preview ? <div id="teated"><LearnerAnnouncementsCard user={user} {...(announcementService ? { service: announcementService } : {})} /></div> : null}
    </div>
  </div>;
}
