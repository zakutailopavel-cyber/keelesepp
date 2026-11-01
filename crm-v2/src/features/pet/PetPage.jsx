import { useMemo } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, lessonsService, scheduleService, studentsService } from '../../services/firebase/index.js';
import { occurrencesForDates, shiftDate, toIsoDate } from '../calendar/calendarView.js';
import { isHomeworkOpen } from '../homework/homeworkStatus.js';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import PetCard from './PetCard.jsx';

/**
 * „Minu lemmik”: the pet in its room, its one request, then games and the wardrobe (owner 2026-11-01). The student comes
 * here from the pet on the home page or the menu. Same numbers as before: lessons, homework, words.
 */
export default function PetPage({
  studentRepository = studentsService, homeworkRepository = homeworkService, scheduleRepository = scheduleService,
  lessonRepository = lessonsService, petRepository, wordsService,
}) {
  const { user, preview } = useAuth();
  const state = useAsyncData(async () => {
    const students = preview?.studentId
      ? [await studentRepository.getById(preview.studentId)].filter(Boolean)
      : await studentRepository.listSelf(user.uid);
    const ids = students.map((student) => student.id);
    const [homework, submissions, scheduleLists, lessonLists] = await Promise.all([
      homeworkRepository.listByStudentIds(ids),
      homeworkRepository.listSubmissionsByStudentIds(ids),
      Promise.all(ids.map((id) => scheduleRepository.listByStudent(id))),
      Promise.all(ids.map((id) => lessonRepository.listByStudent(id))),
    ]);
    return { students, homework, submissions, schedule: scheduleLists.flat(), lessons: lessonLists.flat() };
  }, [homeworkRepository, lessonRepository, preview?.studentId, scheduleRepository, studentRepository, user.uid]);
  const words = useStudentWords((state.data?.students || []).map((student) => student.id), ...(wordsService ? [wordsService] : []));
  const today = toIsoDate();
  const nextDates = useMemo(() => Array.from({ length: 7 }, (_, index) => shiftDate(today, index)), [today]);
  if (state.loading) return <LoadingState label="Laen sinu lemmikut…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const { students, homework, submissions, schedule, lessons } = state.data;
  const lessonToday = occurrencesForDates(schedule, nextDates).find((lesson) => lesson.occurrenceDate === today)?.time || '';
  return <div className="page-content">
    <PageHeader title="Minu lemmik" />
    {students.length
      ? <PetCard user={user} studentId={students[0].id} readOnly={Boolean(preview)} lessons={lessons} submissions={submissions} homework={homework} words={words}
        pendingHomework={homework.filter(isHomeworkOpen).length} lessonToday={lessonToday} subject={students[0].subject || ''}
        {...(wordsService ? { wordsService } : {})} {...(petRepository ? { repository: petRepository } : {})} />
      : <Card><EmptyState title="Õpilase profiil ei ole kontoga seotud" /></Card>}
  </div>;
}
