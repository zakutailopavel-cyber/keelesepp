const teacherAliases = Object.freeze({
  pavel: 'Pavel Zakutailo',
  jelena: 'Elena Zakutailo',
  elena: 'Elena Zakutailo',
  elizaveta: 'Yelyzaveta Lukiianchuk',
  yelyzaveta: 'Yelyzaveta Lukiianchuk',
  angelina: 'Anhelina Korotka',
  anhelina: 'Anhelina Korotka',
});
// first names used alone on older cards (only the bare name: „Jegor Tamm” stays himself)
const exactAliases = Object.freeze({ jegor: 'Jegor Fjodorov' });

export function canonicalTeacherName(value) {
  const name = String(value || '').trim();
  if (!name) return '';
  const lower = name.toLocaleLowerCase('et');
  if (exactAliases[lower]) return exactAliases[lower];
  const alias = Object.keys(teacherAliases).find((key) => lower === key || lower.startsWith(`${key} `));
  return alias ? teacherAliases[alias] : name;
}

export function isSameTeacher(left, right) {
  return canonicalTeacherName(left).toLocaleLowerCase('et') === canonicalTeacherName(right).toLocaleLowerCase('et');
}

// Whether a student card is this teacher's: one of its active study tracks (Õppesuunad — what the student list shows)
// names the teacher, or has the teacher's account when it names nobody. One rule for the student list, the teacher's
// card and the teachers' page (owner 2026-10-15: the lists did not match).
export function teachesStudent(student = {}, teacher = {}) {
  const tracks = Array.isArray(student.enrollments) && student.enrollments.length ? student.enrollments : [student];
  return tracks.filter((track) => track && track.active !== false).some((track) => (
    track.teacher ? isSameTeacher(track.teacher, teacher.name) : Boolean(teacher.id) && track.teacherUid === teacher.id
  ));
}

// the active tracks of a student that this teacher teaches (subject · level on the teacher's card)
export function tracksTaughtBy(student = {}, teacher = {}) {
  const tracks = Array.isArray(student.enrollments) && student.enrollments.length ? student.enrollments : [student];
  return tracks.filter((track) => track && track.active !== false && teachesStudent({ enrollments: [track] }, teacher));
}
