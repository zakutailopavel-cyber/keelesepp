// „Täienduskoolitus (EHIS)” (owner 2026-11-27: „надо сделать так чтобы мы могли хранить это все в нашей CRM
// системе”). A course is one run of a confirmed continuing-education curriculum: its dates, volume, teacher and
// participants. From the finished courses of a calendar year the page counts the activity indicators the school
// submits to EHIS by 31 March (täiskasvanute koolituse seadus § 8 lg 4): learners who started, certificates issued,
// courses by volume. The same record is the register of numbered certificates (täienduskoolituse standard § 3 lg 8).

// volumes of the school's confirmed curricula in academic hours (docs/TRAINING_COURSES.md)
export const CURRICULA = {
  A2: { name: 'Eesti keele A2-taseme eksamiks ettevalmistav koolitus', contactHours: 133, independentHours: 67 },
  B1: { name: 'Eesti keele B1-taseme eksamiks ettevalmistav kursus', contactHours: 120, independentHours: 60 },
  B2: { name: 'Eesti keele B2-taseme eksamiks ettevalmistav koolitus', contactHours: 120, independentHours: 60 },
  C1: { name: 'Eesti keele C1-taseme eksamiks ettevalmistav koolitus', contactHours: 200, independentHours: 40 },
  other: { name: '', contactHours: 0, independentHours: 0 },
};
export const CURRICULUM_LABELS = { A2: 'Eesti keel A2', B1: 'Eesti keel B1', B2: 'Eesti keel B2', C1: 'Eesti keel C1', other: 'Muu õppekava' };
export const STATUSES = { active: 'Käib', finished: 'Lõppenud', archived: 'Arhiiv' };
export const DOCUMENTS = { tunnistus: 'Tunnistus', toend: 'Tõend' };
export const BUCKETS = [
  ['upTo8', 'kuni 8 ak t'],
  ['from9to26', '9–26 ak t'],
  ['from27to80', '27–80 ak t'],
  ['from81to240', '81–240 ak t'],
  ['over240', 'üle 240 ak t'],
];
// the completion conditions of the confirmed curricula
export const MIN_ATTENDANCE = 75;
export const MIN_FINAL_TEST = 60;
export const MAX_PARTICIPANTS = 40;

const clean = (value, max = 200) => String(value ?? '').trim().slice(0, max);
const day = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? String(value) : '');
const hours = (value) => Math.min(2000, Math.max(0, Math.round(Number(value) || 0)));
// a percentage 0–100, or -1 when it is not known yet
export const toPercent = (value) => {
  if (value === '' || value === null || value === undefined) return -1;
  const number = Math.round(Number(String(value).replace(',', '.')));
  return Number.isFinite(number) && number >= 0 && number <= 100 ? number : -1;
};

export function normalizeParticipant(item = {}) {
  const document = DOCUMENTS[item.document] ? item.document : '';
  return {
    studentId: clean(item.studentId, 128),
    name: clean(item.name, 120),
    startedOn: day(item.startedOn),
    attendancePct: toPercent(item.attendancePct),
    finalTestPct: toPercent(item.finalTestPct),
    document,
    documentNumber: document ? clean(item.documentNumber, 20) : '',
    documentDate: document ? day(item.documentDate) : '',
  };
}

export function normalizeCourse(id, data = {}) {
  const curriculum = CURRICULA[data.curriculum] ? data.curriculum : 'other';
  return {
    id,
    title: clean(data.title, 120),
    curriculum,
    curriculumName: clean(data.curriculumName, 200) || CURRICULA[curriculum].name,
    contactHours: hours(data.contactHours),
    independentHours: hours(data.independentHours),
    startDate: day(data.startDate),
    endDate: day(data.endDate),
    teacherName: clean(data.teacherName, 120),
    groupId: clean(data.groupId, 128),
    status: STATUSES[data.status] ? data.status : 'active',
    participants: (Array.isArray(data.participants) ? data.participants : []).slice(0, MAX_PARTICIPANTS).map(normalizeParticipant).filter((item) => item.name),
    notes: clean(data.notes, 2000),
    createdAt: clean(data.createdAt, 40),
    createdByUid: clean(data.createdByUid, 128),
    createdByName: clean(data.createdByName, 120),
    updatedAt: clean(data.updatedAt, 40),
  };
}

// the stored fields (firestore.rules trainingCourseValid); the service adds createdAt / createdBy* / updatedAt
export function recordOf(course) {
  const { id: _id, createdAt: _createdAt, createdByUid: _uid, createdByName: _name, updatedAt: _updatedAt, ...value } = normalizeCourse('', course);
  return value;
}

export function blankCourse(curriculum = 'B1') {
  return normalizeCourse('', { curriculum, ...CURRICULA[curriculum] });
}

export function validateCourse(values) {
  const course = normalizeCourse('', values);
  if (!course.title) return 'Sisesta kursuse nimi.';
  if (!course.curriculumName) return 'Sisesta õppekava nimetus.';
  if (!course.contactHours) return 'Sisesta kontaktõppe maht akadeemilistes tundides.';
  if (!course.startDate) return 'Vali kursuse alguse kuupäev.';
  if (course.endDate && course.endDate < course.startDate) return 'Lõpp ei saa olla enne algust.';
  if (course.status === 'finished' && !course.endDate) return 'Lõppenud kursusel peab olema lõpu kuupäev.';
  const ids = course.participants.map((item) => item.studentId).filter(Boolean);
  if (new Set(ids).size !== ids.length) return 'Sama õppija on kursusel kaks korda.';
  if (course.participants.some((item) => item.document && (!item.documentNumber || !item.documentDate))) return 'Väljastatud dokumendil peab olema number ja kuupäev.';
  return '';
}

export const totalHours = (course) => course.contactHours + course.independentHours;

export function volumeBucket(course) {
  const total = totalHours(course);
  if (total <= 8) return 'upTo8';
  if (total <= 26) return 'from9to26';
  if (total <= 80) return 'from27to80';
  if (total <= 240) return 'from81to240';
  return 'over240';
}

// The document a participant is entitled to: a certificate needs the attendance and the final test of the curriculum,
// otherwise a statement of participation. '' while the final result is not known for someone who still could pass.
export function suggestedDocument(participant) {
  if (participant.attendancePct < 0) return '';
  if (participant.attendancePct < MIN_ATTENDANCE) return 'toend';
  if (participant.finalTestPct < 0) return '';
  return participant.finalTestPct >= MIN_FINAL_TEST ? 'tunnistus' : 'toend';
}

// „2026-014”: one running number per year for certificates and statements together
export function nextDocumentNumber(courses, year) {
  const prefix = `${year}-`;
  const used = courses.flatMap((course) => course.participants)
    .map((item) => (item.documentNumber.startsWith(prefix) ? Number(item.documentNumber.slice(prefix.length)) : 0))
    .filter((number) => Number.isInteger(number));
  return `${prefix}${String(Math.max(0, ...used) + 1).padStart(3, '0')}`;
}

// what is still to do on a finished course: a participant without a document
export const missingDocuments = (course) => (course.status === 'finished' ? course.participants.filter((item) => !item.document).length : 0);

// EHIS activity indicators: the courses that ended in the calendar year
export function yearReport(courses, year) {
  const finished = courses.filter((course) => course.status === 'finished' && course.endDate.startsWith(`${year}-`));
  const buckets = Object.fromEntries(BUCKETS.map(([key]) => [key, 0]));
  finished.forEach((course) => { buckets[volumeBucket(course)] += 1; });
  const participants = finished.flatMap((course) => course.participants);
  return {
    year: String(year),
    courses: finished.length,
    started: participants.length,
    certificates: participants.filter((item) => item.document === 'tunnistus').length,
    statements: participants.filter((item) => item.document === 'toend').length,
    buckets,
    todo: finished.reduce((sum, course) => sum + missingDocuments(course), 0),
    running: courses.filter((course) => course.status === 'active').length,
  };
}

const ATTENDED = 'Toimunud';
const ABSENT = new Set(['Puudus_eta', 'Puudus_p']);

// A participant's lesson marks inside the course dates: attended and missed lessons, attendance and academic hours.
// `lessons` are the CRM lesson marks (collection `lessons`: studentId, date, status, duration in minutes).
export function attendanceFromLessons(lessons, studentId, course, today = '') {
  const from = course.startDate;
  const to = course.endDate || today || '9999-12-31';
  const own = lessons.filter((lesson) => lesson.studentId === studentId && lesson.date >= from && lesson.date <= to);
  const attended = own.filter((lesson) => lesson.status === ATTENDED);
  const absent = own.filter((lesson) => ABSENT.has(lesson.status));
  const marked = attended.length + absent.length;
  const minutes = attended.reduce((sum, lesson) => sum + Math.max(0, Number(lesson.duration) || 60), 0);
  return {
    attended: attended.length,
    absent: absent.length,
    attendancePct: marked ? Math.round((attended.length / marked) * 100) : -1,
    academicHours: Math.round(minutes / 45),
    firstDate: [...attended, ...absent].map((lesson) => lesson.date).sort()[0] || '',
  };
}

// fill attendance (and the first lesson date, when empty) of every linked participant from the lesson marks
export function withLessonAttendance(course, lessons, today = '') {
  return {
    ...course,
    participants: course.participants.map((item) => {
      if (!item.studentId) return item;
      const result = attendanceFromLessons(lessons, item.studentId, course, today);
      if (result.attendancePct < 0) return item;
      return { ...item, attendancePct: result.attendancePct, startedOn: item.startedOn || result.firstDate };
    }),
  };
}

export function sortCourses(courses) {
  const rank = { active: 0, finished: 1, archived: 2 };
  return [...courses].sort((left, right) => rank[left.status] - rank[right.status] || (right.startDate || '').localeCompare(left.startDate || '') || left.title.localeCompare(right.title, 'et'));
}

// the report as text for the school's records (the figures are typed into EHIS by hand)
export function reportText(report, schoolName = 'E&P Koolituskeskus') {
  return [
    `${schoolName} — täienduskoolituse tegevusnäitajad ${report.year}`,
    'Õppekavarühm: Keeleõpe',
    `Täienduskoolitust alustanud õppijad: ${report.started}`,
    `Väljaantud tunnistused: ${report.certificates}`,
    `Väljaantud tõendid: ${report.statements}`,
    ...BUCKETS.map(([key, label]) => `Kursused mahus ${label}: ${report.buckets[key]}`),
    `Läbiviidud kursuste arv kokku: ${report.courses}`,
  ].join('\n');
}
