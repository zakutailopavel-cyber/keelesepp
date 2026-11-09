import { useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { lessonsService } from '../../services/firebase/lessons.js';
import { petsService } from '../../services/firebase/pets.js';
import { scheduleService } from '../../services/firebase/schedule.js';
import { studentsService } from '../../services/firebase/students.js';
import { studentMonologuesService } from '../../services/firebase/studentMonologues.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { occurrencesForDates, shiftDate, toIsoDate } from '../calendar/calendarView.js';
import { monologueLevel, monologueTask } from '../monologue/monologueModel.js';
import PetLoop from '../pet/PetLoop.jsx';
import { petProgress } from '../pet/petModel.js';
import { langOf } from '../pet/petLoop.js';
import { fullSentence } from '../practice/engine/items.js';
import { loadStudentPractice, sentencesAvailable } from '../practice/studentPractice.js';
import { usePracticeProgress } from '../practice/usePracticeProgress.js';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import { hasWordAudio, loadWordAudio } from '../vocabulary/wordAudio.js';
import { COURSE_LOADERS } from '../worksheet-generator/admin/course/courseLoaders.js';
import { todaySteps } from './nextStep.js';
import PracticeFlow from './PracticeFlow.jsx';

/**
 * „Harjuta” (owner 2026-11-09): the student's daily practice in its own tab after „Täna” — one button runs homework,
 * the words due today, one sentence & grammar lesson (with his own wrong sentences) and, on a self-study card, the
 * course; the pet thanks at the end. nextStep.js decides the steps; „Täna” points here when practice is next.
 */
export default function StudentPracticePage({
  studentRepository = studentsService, homeworkRepository = homeworkService, scheduleRepository = scheduleService,
  lessonRepository = lessonsService, petRepository = petsService, monologueRepository = studentMonologuesService,
  wordsService = studentWordsService, practiceService, courseLoaders = COURSE_LOADERS,
}) {
  const { user, preview } = useAuth();
  const state = useAsyncData(async () => {
    const students = preview?.studentId
      ? [await studentRepository.getById(preview.studentId)].filter(Boolean)
      : await studentRepository.listSelf(user.uid);
    const ids = students.map((student) => student.id);
    const monologueCard = students.find((student) => monologueLevel(student)) || null;
    const [pet, sheets, homework, submissions, scheduleLists, lessonLists, monologues] = await Promise.all([
      Promise.resolve().then(() => petRepository.get?.(user.uid)).catch(() => null),
      Promise.resolve().then(() => homeworkRepository.listWorksheetAssignmentsByStudentIds?.(ids) || []).catch(() => []),
      homeworkRepository.listByStudentIds(ids),
      homeworkRepository.listSubmissionsByStudentIds(ids),
      Promise.all(ids.map((id) => scheduleRepository.listByStudent(id))),
      Promise.all(ids.map((id) => lessonRepository.listByStudent(id))),
      monologueCard && !preview ? Promise.resolve().then(() => monologueRepository?.listByStudent?.(monologueCard.id)).catch(() => null) : null,
    ]);
    const monologue = monologueCard && Array.isArray(monologues) ? monologueTask({ student: monologueCard, monologues }) : null;
    return { students, pet: pet || null, sheets, homework, submissions, schedule: scheduleLists.flat(), lessons: lessonLists.flat(), tasks: monologue ? [{ ...monologue, to: '/student/monoloog' }] : [] };
  }, [homeworkRepository, lessonRepository, preview?.studentId, scheduleRepository, studentRepository, user.uid]);
  const words = useStudentWords((state.data?.students || []).map((student) => student.id), wordsService);
  const progress = usePracticeProgress(user, { readOnly: Boolean(preview), ...(practiceService ? { service: practiceService } : {}) });
  const [reaction, setReaction] = useState('');

  if (state.loading) return <div className="page-content"><LoadingState label="Laen tänast harjutust…" /></div>;
  if (state.error) return <div className="page-content"><ErrorState message={state.error.message} onRetry={state.reload} /></div>;
  const { students, pet, sheets, homework, submissions, lessons, tasks } = state.data;
  const header = <PageHeader title="Harjuta" description={<>Tänane harjutus ühe nupuga: ülesanded, sõnad, laused.<span lang="ru"> · Тренировка на сегодня.</span></>} />;
  if (!students.length) return <div className="page-content">{header}<Card><EmptyState title="Õpilase profiil ei ole kontoga seotud" description="Palu administraatoril siduda õpilase kaart sinu kontoga." /></Card></div>;

  const today = toIsoDate();
  const main = students.find((student) => !student.isSelfStudent) || students[0];
  const occurrences = occurrencesForDates(state.data.schedule, [today, shiftDate(today, 1)]);
  const plan = todaySteps({
    occurrences, homework, assignments: sheets, submissions, tasks, words, sentences: sentencesAvailable({ student: main, words }),
    selfStudent: students.some((student) => student.isSelfStudent), done: progress.today.done, today,
  });
  // when the sentences step starts: his recorded lessons' corrected sentences (the second source of „my mistakes”) and the
  // audio manifest (listening only for sentences with a stored recording); either may fail and is then left out
  const loadPractice = async () => {
    const [stats] = await Promise.all([
      Promise.resolve().then(() => (preview?.studentId ? petRepository.lessonStatsForStudents?.([preview.studentId]) : petRepository.lessonStats?.(user.uid))).catch(() => []),
      Promise.resolve().then(() => loadWordAudio()).catch(() => null),
    ]);
    return loadStudentPractice({ student: main, lessons, words, stats: stats || [], loaders: courseLoaders, seed: `${user.uid}|${today}`, canListen: (item) => hasWordAudio(fullSentence(item)) });
  };
  const petStage = petProgress({ lessons, submissions, homework, words, practiceXp: progress.xp }).stage;

  return <div className="page-content">
    {header}
    <div className="pf-page">
      <PracticeFlow plan={plan} today={progress.today} streak={progress.streak} pet={pet} petStage={petStage} lang={langOf(main?.subject || '')} language={main?.preferredLanguage || ''}
        words={words} wordsService={wordsService} readOnly={Boolean(preview)} loadPractice={loadPractice}
        onTick={(key) => progress.save({ done: [key] })} onReact={setReaction} />
      {pet?.kind && !pet.optedOut ? <PetLoop user={user} studentId={students[0].id} pet={pet} readOnly={Boolean(preview)} lessons={lessons} submissions={submissions} homework={homework} assignments={sheets} words={words}
        subject={main?.subject || ''} practiceXp={progress.xp} streak={progress.streak} reaction={reaction === 'finished' ? '' : reaction} ready={plan.todo.length > 0} repository={petRepository} /> : null}
    </div>
  </div>;
}
