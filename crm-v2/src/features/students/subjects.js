// One child, several subjects (owner 2026-10-20): each enrollment of a card is a subject with its own teacher. The
// parent, the student and the card show one subject at a time (or all). A record without a subject (old schedule) is
// placed by its teacher, else by the card's only subject.
import { isSameTeacher } from '../../utils/teachers.js';

const clean = (value) => String(value ?? '').trim();

// "Inglise Keel" and "inglise keel" are one subject (the same rule as functions/student-enrollments-core.js)
export function subjectName(value) {
  const text = clean(value).replace(/\s+/g, ' ');
  if (!text) return '';
  const low = text.toLocaleLowerCase('et');
  return low.charAt(0).toLocaleUpperCase('et') + low.slice(1);
}

// the active tracks of a card: [{ subject, teacher, teacherUid, level }]
export function tracksOf(student = {}) {
  const list = Array.isArray(student.enrollments) && student.enrollments.length ? student.enrollments : [student];
  return list.filter((track) => track && track.active !== false)
    .map((track) => ({ subject: subjectName(track.subject || student.subject) || 'Eesti keel', teacher: clean(track.teacher || (list.length === 1 ? student.teacher : '')), teacherUid: clean(track.teacherUid || (list.length === 1 ? student.teacherUid : '')), level: clean(track.level || (list.length === 1 ? student.level : '')) }));
}

// the subjects of one card or of several, in the order they first appear
export function subjectsOf(students = []) {
  const list = Array.isArray(students) ? students : [students];
  return [...new Set(list.flatMap((student) => tracksOf(student).map((track) => track.subject)))];
}

// the subject a lesson / schedule entry / homework belongs to
export function itemSubject(item = {}, student = null) {
  const own = subjectName(item.subject);
  if (own) return own;
  const tracks = student ? tracksOf(student) : [];
  const byTeacher = tracks.find((track) => (item.teacherUid && track.teacherUid === item.teacherUid) || (item.teacher && track.teacher && isSameTeacher(item.teacher, track.teacher)));
  if (byTeacher) return byTeacher.subject;
  const subjects = [...new Set(tracks.map((track) => track.subject))];
  return subjects.length === 1 ? subjects[0] : '';
}

// items of one subject ('' = all); `studentOf(item)` finds the item's card
export function onlySubject(items = [], subject = '', studentOf = () => null) {
  if (!subject) return items;
  return items.filter((item) => itemSubject(item, studentOf(item)) === subject);
}

// the tracks of the card a teacher teaches (by uid, else by name); the admin gets []
export function teacherTracks(student = {}, user = {}) {
  return tracksOf(student).filter((track) => (user.uid && track.teacherUid === user.uid) || (track.teacher && user.displayName && isSameTeacher(track.teacher, user.displayName)));
}

// the card's main subject: its own `subject` when it is one of its tracks, else the first track's (its price is the
// card's price; further subjects may have their own in studentRevenuePlans.subjectPrices)
export function mainSubject(student = {}) {
  const subjects = subjectsOf(student);
  const own = subjectName(student.subject);
  return subjects.includes(own) ? own : subjects[0] || own || 'Eesti keel';
}

// the subjects the school teaches (suggestions when a subject is added to a card; any other name is allowed)
export const SUBJECT_CHOICES = ['Eesti keel', 'Inglise keel', 'Matemaatika', 'Vene keel'];
