import { useEffect, useState } from 'react';
import { courseTopics, learnerTopics } from './petGames.js';

// What the pet plays with: his recorded lessons (his own corrected sentences) and, only when `wantTopics`, the sheets
// the teacher gave plus the published course sheets of the lessons he has had (the last four). Each may fail alone.
export function usePetMaterial({ uid, studentId, readOnly, lessons = [], assignments, wantTopics = true, off = false, repository, assignmentsService, courseSheets }) {
  const [speech, setSpeech] = useState([]);
  useEffect(() => {
    let alive = true;
    // staff in a read-only preview read them by the card: the same pet the student sees
    const load = readOnly ? (studentId ? () => repository.lessonStatsForStudents?.([studentId]) : null) : (uid && repository.lessonStats ? () => repository.lessonStats(uid) : null);
    if (off || !load) return undefined;
    Promise.resolve().then(load).then((list) => { if (alive) setSpeech(list || []); }).catch(() => {});
    return () => { alive = false; };
  }, [off, repository, readOnly, studentId, uid]);

  const [topics, setTopics] = useState([]);
  const lessonKey = lessons.map((l) => `${l.topicLessonId || ''}:${l.status || ''}`).join('|');
  const given = Boolean(assignments);
  const assignmentsKey = (assignments || []).map((item) => item.id).join('|');
  useEffect(() => {
    let alive = true;
    if (off || readOnly || !wantTopics || !studentId) return undefined;
    if (!given && typeof assignmentsService?.listWorksheetAssignmentsByStudentIds !== 'function') return undefined;
    const lessonIds = [...new Set(lessons.filter((l) => l.topicLessonId && (!l.status || l.status === 'Toimunud'))
      .sort((a, b) => String(b.date).localeCompare(String(a.date))).map((l) => l.topicLessonId))].slice(0, 4);
    const loadCourse = typeof courseSheets?.list === 'function'
      ? Promise.all(lessonIds.map((id) => Promise.resolve().then(() => courseSheets.list(id)).then((sheets) => [id, sheets || []]).catch(() => [id, []])))
      : Promise.resolve([]);
    Promise.all([
      given ? assignments : Promise.resolve().then(() => assignmentsService.listWorksheetAssignmentsByStudentIds([studentId])).catch(() => []),
      loadCourse,
    ]).then(([list, course]) => {
      if (alive) setTopics(learnerTopics([...(list || []), ...courseTopics(lessons, Object.fromEntries(course))]));
    }).catch(() => {});
    return () => { alive = false; };
  }, [assignmentsService, courseSheets, readOnly, studentId, lessonKey, off, wantTopics, assignmentsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  return { speech, topics };
}
