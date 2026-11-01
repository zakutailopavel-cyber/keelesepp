// „Õpetajate võrdlus” (owner 2026-10-23: admin only): how the students of each teacher are doing over the last 30
// days — lessons held and missed, how many students practise on their own, worksheet results, new words per student.
// Lessons come from the calendar with the journal's marks, by the rules of „Ärinäitajad” (a past lesson not marked yet
// counts as given and is reported as unmarked; the journal alone showed 0 for a teacher who does not mark).
// Built from schedule, groups, journal, studentWords and worksheetAssignments; read only. Numbers describe the students' learning,
// so a teacher with few students shows „—” rather than a misleading percentage.
import { isSameTeacher, teachesStudent } from '../../utils/teachers.js';
import { localDate } from '../../utils/localDate.js';
import { MISSED, TOOK_PLACE, lessonFacts } from '../finance/businessReport.js';

const DAY = 86400000;
const time = (value) => {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  return Date.parse(value) || 0;
};
const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : null);

export function teacherReport({ teachers = [], students = [], lessons = [], schedule = [], groups = [], words = [], assignments = [], now = Date.now(), days = 30 } = {}) {
  const from = now - days * DAY;
  const practising = new Set(words.filter((word) => now - time(word.reviewedAt) <= 14 * DAY).map((word) => word.studentId));
  const newWords = new Map();
  words.forEach((word) => { if (time(word.createdAt) >= from) newWords.set(word.studentId, (newWords.get(word.studentId) || 0) + 1); });
  // a student archived during the month still had those lessons: a bare record keeps them countable
  const known = new Set(students.map((student) => student.id));
  const others = [...new Set([...lessons, ...schedule].map((item) => item.studentId).filter((id) => id && !known.has(id)))].map((id) => ({ id }));
  const today = localDate(new Date(now));
  const facts = lessonFacts({ from: localDate(new Date(from)), to: today, today, students: [...students, ...others], schedule, groups, lessons });
  return teachers.filter((teacher) => !teacher.disabled).map((teacher) => {
    const own = students.filter((student) => student.active !== false && teachesStudent(student, teacher));
    const ids = new Set(own.map((student) => student.id));
    const taught = new Map(); // one lesson once: a group's lesson has a fact per student
    facts.filter((fact) => (fact.teacherUid ? fact.teacherUid === teacher.uid || fact.teacherUid === teacher.id : fact.teacher ? isSameTeacher(fact.teacher, teacher.name) : ids.has(fact.studentId)))
      .forEach((fact) => taught.set(fact.occurrence, fact));
    const given = [...taught.values()];
    const held = given.filter((fact) => TOOK_PLACE.has(fact.state)).length;
    const unmarked = given.filter((fact) => fact.state === 'unmarked').length;
    const missed = given.filter((fact) => MISSED.has(fact.state)).length;
    const sheets = assignments.filter((item) => ids.has(item.studentId) && item.status === 'done' && time(item.completedAt) >= from && item.score?.total);
    const avg = sheets.length ? Math.round(sheets.reduce((sum, item) => sum + (Number(item.score.correct) / Number(item.score.total)) * 100, 0) / sheets.length) : null;
    const withWords = own.filter((student) => words.some((word) => word.studentId === student.id));
    return {
      id: teacher.id,
      name: teacher.name || teacher.email || 'Õpetaja',
      students: own.length,
      held,
      unmarked,
      missedRate: pct(missed, held + missed),
      practising: withWords.length >= 2 ? pct(withWords.filter((student) => practising.has(student.id)).length, withWords.length) : null,
      sheets: sheets.length,
      sheetScore: sheets.length >= 3 ? avg : null,
      newWordsPerStudent: own.length ? Math.round((own.reduce((sum, student) => sum + (newWords.get(student.id) || 0), 0) / own.length) * 10) / 10 : null,
    };
  }).filter((row) => row.students > 0).sort((a, b) => b.students - a.students || a.name.localeCompare(b.name, 'et'));
}
