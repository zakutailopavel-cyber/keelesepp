// „Õpetajate võrdlus” (owner 2026-10-23: admin only): how the students of each teacher are doing over the last 30
// days — lessons held and missed, how many students practise on their own, worksheet results, new words per student.
// Built from the journal, studentWords and worksheetAssignments; read only. Numbers describe the students' learning,
// so a teacher with few students shows „—” rather than a misleading percentage.
import { teachesStudent } from '../../utils/teachers.js';

const DAY = 86400000;
const time = (value) => {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  return Date.parse(value) || 0;
};
const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : null);

export function teacherReport({ teachers = [], students = [], lessons = [], words = [], assignments = [], now = Date.now(), days = 30 } = {}) {
  const from = now - days * DAY;
  const practising = new Set(words.filter((word) => now - time(word.reviewedAt) <= 14 * DAY).map((word) => word.studentId));
  const newWords = new Map();
  words.forEach((word) => { if (time(word.createdAt) >= from) newWords.set(word.studentId, (newWords.get(word.studentId) || 0) + 1); });
  return teachers.filter((teacher) => !teacher.disabled).map((teacher) => {
    const own = students.filter((student) => student.active !== false && teachesStudent(student, teacher));
    const ids = new Set(own.map((student) => student.id));
    const journal = lessons.filter((lesson) => (lesson.teacherUid ? lesson.teacherUid === teacher.uid || lesson.teacherUid === teacher.id : ids.has(lesson.studentId))
      && time(lesson.date) >= from && time(lesson.date) <= now && lesson.status !== 'Planeeritud');
    const held = journal.filter((lesson) => !lesson.status || lesson.status === 'Toimunud').length;
    const missed = journal.filter((lesson) => String(lesson.status || '').startsWith('Puudus') || lesson.status === 'Tühistatud').length;
    const sheets = assignments.filter((item) => ids.has(item.studentId) && item.status === 'done' && time(item.completedAt) >= from && item.score?.total);
    const avg = sheets.length ? Math.round(sheets.reduce((sum, item) => sum + (Number(item.score.correct) / Number(item.score.total)) * 100, 0) / sheets.length) : null;
    const withWords = own.filter((student) => words.some((word) => word.studentId === student.id));
    return {
      id: teacher.id,
      name: teacher.name || teacher.email || 'Õpetaja',
      students: own.length,
      held,
      missedRate: pct(missed, held + missed),
      practising: withWords.length >= 2 ? pct(withWords.filter((student) => practising.has(student.id)).length, withWords.length) : null,
      sheets: sheets.length,
      sheetScore: sheets.length >= 3 ? avg : null,
      newWordsPerStudent: own.length ? Math.round((own.reduce((sum, student) => sum + (newWords.get(student.id) || 0), 0) / own.length) * 10) / 10 : null,
    };
  }).filter((row) => row.students > 0).sort((a, b) => b.students - a.students || a.name.localeCompare(b.name, 'et'));
}
