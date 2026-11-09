import { useMemo, useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { financeApi } from '../../services/firebase/financeApi.js';
import { lessonsService } from '../../services/firebase/lessons.js';
import { libraryService } from '../../services/firebase/library.js';
import { scheduleService } from '../../services/firebase/schedule.js';
import { studentsService } from '../../services/firebase/students.js';
import { ROLES } from '../../utils/roles.js';
import { occurrencesForDates, resolveOccurrenceRecord, toIsoDate, withCurrentStudentNames, withLessonSubjects } from './calendarView.js';
import { announceLessonMarked, fixMarkError, fixOccurrenceMark, markOccurrence, schoolCoveredError } from './lessonActions.js';
import LessonPanel from './LessonPanel.jsx';
import { buildTopicCatalog, topicLine } from './lessonTopic.js';
import './calendarV2.css';

// a teacher reads only his own entries (the rules); the history below is the student's lessons the viewer may read
const historyOf = (records, studentId) => records.filter((lesson) => lesson.studentId === studentId && ['Toimunud', undefined, ''].includes(lesson.status)).sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`));

/**
 * One calendar lesson in the side drawer (owner 2026-11-09: right-click → „Ava tund (siinsamas)” on the dashboard,
 * „Märkimata tunnid”, …). The calendar's own LessonPanel with what can be done without the calendar around it: „Tund
 * toimus” / „Puudus” with topic, note and homework, the topic and note of a marked lesson, „Paranda märge”, and for the
 * administrator „Kooli kulul” — through the calendar's own paths (lessonActions.js). Moving, cancelling, substituting,
 * the Live Classroom and group attendance stay in the calendar („Ava kalendris” above).
 */
export default function LessonDrawerPanel({ scheduleId, date, onClose, scheduleRepository = scheduleService, studentRepository = studentsService, lessonRepository = lessonsService, libraryRepository = libraryService, financeRepository = financeApi, deviceCheck }) {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.roles?.includes(ROLES.ADMIN));
  const teacherOnly = Boolean(user?.roles?.includes(ROLES.TEACHER)) && !isAdmin;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const state = useAsyncData(async () => {
    const event = await scheduleRepository.get(scheduleId);
    if (!event?.studentId) return { event, student: null, records: [] };
    const [student, records] = await Promise.all([
      studentRepository.getById(event.studentId).catch(() => null),
      lessonRepository.listByStudent(event.studentId, teacherOnly ? { teacherUid: user.uid } : {}),
    ]);
    return { event, student, records };
  }, [scheduleRepository, studentRepository, lessonRepository, scheduleId, teacherOnly, user?.uid]);
  const libraryState = useAsyncData(() => (libraryRepository?.list ? libraryRepository.list() : Promise.resolve(null)), [libraryRepository]);
  const catalog = useMemo(() => (libraryState.data ? buildTopicCatalog(libraryState.data.curriculumLessons) : null), [libraryState.data]);

  if (!state.data) {
    if (state.error) return <div className="entity-drawer__note"><ErrorState message={state.error.code === 'permission-denied' ? 'Seda tundi ei saa sinu kontoga avada.' : state.error.message} onRetry={state.reload} /></div>;
    return <LoadingState label="Laen tundi…" />;
  }
  const { event, student, records } = state.data;
  const students = new Map(student ? [[student.id, student]] : []);
  // the occurrence exactly as the calendar builds it: series expanded, current name and subject, its journal entry
  const occurrence = event ? occurrencesForDates(withLessonSubjects(withCurrentStudentNames([event], students), students), [date])[0] || null : null;
  if (!occurrence || !event.studentId || occurrence.status === 'Tühistatud') {
    const why = !event ? 'Seda tundi ei leitud: see võib olla kustutatud.' : !event.studentId ? 'Grupitunni kohalolu märgitakse kalendris.' : occurrence?.status === 'Tühistatud' ? 'See tund on tühistatud.' : 'Sel päeval seda tundi enam ei ole: see võib olla liigutatud.';
    return <div className="entity-drawer__note"><EmptyState title="Tundi ei saa siin avada" description={`${why} Ava see kalendris.`} /></div>;
  }
  const resolved = resolveOccurrenceRecord(occurrence, records);
  const item = resolved.record ? { ...resolved, recordTopic: topicLine(resolved.record) || resolved.record.topic || '' } : resolved;

  const run = async (action, fallback, message = (problem) => problem?.message || fallback) => {
    setSaving(true); setError(''); setNotice('');
    try { await action(); await state.reload(); return true; } catch (problem) { if (problem?.marked) await state.reload(); setError(message(problem)); return false; } finally { setSaving(false); }
  };
  const repositories = { lessonRepository, financeRepository, libraryRepository };
  const onDone = (details) => run(async () => {
    await markOccurrence(repositories, item, user, details, student);
    announceLessonMarked(item.occurrenceId);
    setNotice(details.status === 'Toimunud' ? 'Tund märgiti toimunuks.' : 'Puudumine märgiti.');
  }, 'Salvestamine ebaõnnestus.');

  return <LessonPanel
    key={item.occurrenceId}
    viewer={user}
    {...(deviceCheck ? { deviceCheck } : {})}
    item={item}
    notice={notice}
    history={historyOf(records, item.studentId)}
    catalog={catalog}
    library={libraryState.data}
    loadingLibrary={libraryState.loading}
    student={student}
    saving={saving}
    error={error}
    today={toIsoDate()}
    onClose={onClose}
    onDone={onDone}
    onUpdateDetails={lessonRepository.updateDetails ? (details) => run(() => lessonRepository.updateDetails(item.record, details, user), 'Muudatust ei saanud salvestada.') : undefined}
    onChangeMark={(status) => run(() => fixOccurrenceMark(lessonRepository, item, user, 'change', status), '', fixMarkError)}
    onRemoveMark={() => run(() => fixOccurrenceMark(lessonRepository, item, user, 'remove'), '', fixMarkError)}
    onSchoolCovered={isAdmin ? (billingStatus, reason) => run(() => financeRepository.setLessonBillingDisposition(item.record.id, billingStatus, reason), '', schoolCoveredError) : undefined}
  />;
}
