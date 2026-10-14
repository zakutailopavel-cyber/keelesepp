// The people and records of the browser scenarios (emulator only). Passwords exist only in the emulator.
const PASSWORD = 'e2e-only-password';
const PEOPLE = {
  admin: { uid: 'e2e-admin', email: 'admin@e2e.test', name: 'Aino Admin', role: 'admin' },
  teacher: { uid: 'e2e-teacher', email: 'pavel@e2e.test', name: 'Pavel Õpetaja', role: 'teacher' },
  student: { uid: 'e2e-student', email: 'anna@e2e.test', name: 'Anna Õpilane', role: 'student' },
  parent: { uid: 'e2e-parent', email: 'liis@e2e.test', name: 'Liis Vanem', role: 'parent' },
  both: { uid: 'e2e-both', email: 'olga@e2e.test', name: 'Olga Mõlemad', role: 'student', claims: { roles: ['student', 'parent'] } },
};
const CARDS = {
  anna: { id: 'e2e-card-anna', name: 'Anna Õpilane', email: PEOPLE.student.email, studentUid: PEOPLE.student.uid, linkedUserId: PEOPLE.student.uid, linkedUserIds: [PEOPLE.student.uid], teacher: 'Pavel Õpetaja', teacherUid: PEOPLE.teacher.uid, teacherUids: [PEOPLE.teacher.uid], subject: 'Eesti keel', level: 'A2', targetLevel: 'B1', active: true, recordingConsent: true },
  kaarel: { id: 'e2e-card-kaarel', name: 'Kaarel Laps', grade: '3. klass', parentName: PEOPLE.parent.name, parentEmail: PEOPLE.parent.email, parentUid: PEOPLE.parent.uid, linkedParentId: PEOPLE.parent.uid, linkedParentIds: [PEOPLE.parent.uid], teacher: 'Pavel Õpetaja', teacherUid: PEOPLE.teacher.uid, teacherUids: [PEOPLE.teacher.uid], subject: 'Eesti keel', level: 'A1', active: true },
  olga: { id: 'e2e-card-olga', name: 'Olga Mõlemad', email: PEOPLE.both.email, studentUid: PEOPLE.both.uid, linkedUserId: PEOPLE.both.uid, linkedUserIds: [PEOPLE.both.uid], teacher: 'Pavel Õpetaja', teacherUid: PEOPLE.teacher.uid, teacherUids: [PEOPLE.teacher.uid], subject: 'Eesti keel', level: 'B1', active: true },
  mia: { id: 'e2e-card-mia', name: 'Mia Laps', grade: '1. klass', parentName: PEOPLE.both.name, parentEmail: PEOPLE.both.email, parentUid: PEOPLE.both.uid, linkedParentId: PEOPLE.both.uid, linkedParentIds: [PEOPLE.both.uid], teacher: 'Pavel Õpetaja', teacherUid: PEOPLE.teacher.uid, teacherUids: [PEOPLE.teacher.uid], subject: 'Eesti keel', level: 'A1', active: true },
};
module.exports = { PASSWORD, PEOPLE, CARDS, PROJECT: 'demo-keelesepp-e2e' };
// registration scenarios: a child's card written with the mother's e-mail (as Lana's card had Olena's)
CARDS.kristi = { id: 'e2e-card-kristi', name: 'Kristi Laps', grade: '2. klass', parentName: 'Mari Ema', email: 'mari.ema@e2e.test', teacher: 'Pavel Õpetaja', teacherUid: PEOPLE.teacher.uid, teacherUids: [PEOPLE.teacher.uid], subject: 'Eesti keel', level: 'A1', active: true };
