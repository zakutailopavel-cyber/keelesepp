import { useEffect, useRef } from 'react';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { importLessonWords, lessonsToImport } from './lessonWords.js';

// After a held lesson with an Õppevara topic, its vocabulary goes into „Minu sõnad” by itself (once per lesson).
// Reads the student's words fresh (not the live list, which may still be empty) so nothing is written twice.
// Never throws; the dashboard shows the new words from the live list (freshLessonWords), not from this hook.
export function useLessonWordsImport({ studentId = '', lessons = [], user, enabled = true, service = studentWordsService }) {
  const started = useRef('');
  const lessonKey = lessons.map((l) => `${l.topicLessonId || ''}:${l.status || ''}:${l.date || ''}`).join('|');
  useEffect(() => {
    const runKey = `${studentId}|${lessonKey}`;
    // once per student and lesson list (React may run an effect twice; the import must not)
    if (!enabled || !studentId || !user?.uid || typeof service?.addLessonWords !== 'function' || started.current === runKey) return;
    started.current = runKey;
    (async () => {
      const words = await service.listForStudent(studentId);
      const ids = lessonsToImport({ studentId, lessons, words });
      for (const lessonId of ids) await importLessonWords({ studentId, lessonId, words, service, user }).catch(() => 0);
    })().catch(() => {});
  }, [enabled, studentId, lessonKey, user, service]); // eslint-disable-line react-hooks/exhaustive-deps
}
