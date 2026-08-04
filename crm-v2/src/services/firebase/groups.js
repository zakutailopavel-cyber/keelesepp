import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { isSameTeacher } from '../../utils/teachers.js';

const DAYS = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

function clean(value) {
  return String(value || '').trim();
}

function uniqueIds(values = []) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.trim()).map((value) => value.trim()))];
}

function lessonValue(lesson = {}) {
  return {
    ...lesson,
    id: clean(lesson.id),
    day: DAYS.has(lesson.day) ? lesson.day : 'Mon',
    time: /^\d{2}:\d{2}$/.test(lesson.time || '') ? lesson.time : '16:00',
    duration: Math.max(5, Number(lesson.duration) || 60),
    startDate: clean(lesson.startDate) || new Date().toISOString().slice(0, 10),
    recurring: lesson.recurring !== false,
    status: lesson.status || 'Planeeritud',
    attendance: lesson.attendance && typeof lesson.attendance === 'object' ? lesson.attendance : {},
  };
}

export function normalizeGroup(id, data = {}) {
  const lessons = Array.isArray(data.lessons) ? data.lessons.map(lessonValue).filter((lesson) => lesson.id) : [];
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const studentLessonMap = Object.fromEntries(Object.entries(data.studentLessonMap || {}).map(([studentId, ids]) => [
    studentId,
    uniqueIds(Array.isArray(ids) ? ids : []).filter((lessonId) => lessonIds.has(lessonId)),
  ]));
  return {
    id,
    ...data,
    name: clean(data.name),
    teacher: clean(data.teacher),
    teacherUid: clean(data.teacherUid),
    subject: clean(data.subject) || 'Eesti keel',
    level: clean(data.level) || 'A1',
    active: data.active !== false,
    students: uniqueIds(data.students),
    lessons,
    studentLessonMap,
  };
}

function requireAdmin(user) {
  if (!user?.roles?.includes('admin')) throw new Error('Ainult administraator saab gruppe muuta.');
}

function requireStaff(user) {
  if (!user?.roles?.some((role) => role === 'admin' || role === 'teacher')) throw new Error('Kohalolu saab märkida ainult õpetaja või administraator.');
}

function activity(batch, db, type, label, group, user, meta = {}) {
  const createdAt = new Date().toISOString();
  batch.set(doc(collection(db, 'activityLog')), {
    type,
    label,
    byUid: user.uid,
    byName: user.displayName || user.email || 'Administraator',
    byRole: 'admin',
    createdAt,
    date: createdAt.slice(0, 10),
    meta: { groupId: group.id || '', groupName: group.name || '', ...meta },
  });
}

function nextLessonId() {
  return globalThis.crypto?.randomUUID?.() || `gl-${Date.now()}`;
}

export const groupsService = {
  async list(filters = {}) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'groups'));
    return snapshot.docs
      .map((item) => normalizeGroup(item.id, item.data()))
      .filter((group) => group.active)
      .filter((group) => !filters.teacherUid || group.teacherUid === filters.teacherUid || (!group.teacherUid && isSameTeacher(group.teacher, filters.teacherName)))
      .sort((left, right) => left.name.localeCompare(right.name, 'et', { sensitivity: 'base', numeric: true }));
  },

  async create(data, user) {
    requireAdmin(user);
    const name = clean(data.name);
    if (!name) throw new Error('Sisesta grupi nimi.');
    const { db } = requireFirebaseClient();
    const reference = doc(collection(db, 'groups'));
    const value = normalizeGroup(reference.id || '', {
      name,
      teacher: clean(data.teacher),
      teacherUid: clean(data.teacherUid),
      subject: clean(data.subject) || 'Eesti keel',
      level: clean(data.level) || 'A1',
      students: [],
      lessons: [],
      studentLessonMap: {},
      active: true,
      createdAt: new Date().toISOString().slice(0, 10),
      createdBy: user.displayName || user.email || '',
      createdByUid: user.uid,
    });
    const batch = writeBatch(db);
    batch.set(reference, value);
    activity(batch, db, 'group.created', `${name} loodud`, value, user);
    await batch.commit();
    return value;
  },

  async remove(group, students = [], user) {
    requireAdmin(user);
    if (!group?.id) throw new Error('Gruppi ei leitud.');
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    for (const studentId of group.students || []) {
      const student = students.find((item) => item.id === studentId);
      if (!student || student.group === group.name) batch.set(doc(db, 'students', studentId), { group: '', updatedAt: new Date().toISOString().slice(0, 10) }, { merge: true });
    }
    batch.delete(doc(db, 'groups', group.id));
    activity(batch, db, 'group.deleted', `${group.name || 'Grupp'} kustutatud`, group, user, { studentIds: group.students || [] });
    await batch.commit();
  },

  async setStudent(group, student, shouldAdd, user) {
    requireAdmin(user);
    if (!group?.id || !student?.id) throw new Error('Gruppi või õpilast ei leitud.');
    const students = new Set(group.students || []);
    const studentLessonMap = { ...(group.studentLessonMap || {}) };
    const lessonIds = (group.lessons || []).map((lesson) => lesson.id);
    if (shouldAdd) {
      students.add(student.id);
      if (!Array.isArray(studentLessonMap[student.id])) studentLessonMap[student.id] = lessonIds;
    } else {
      students.delete(student.id);
      delete studentLessonMap[student.id];
    }
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    const updatedAt = new Date().toISOString();
    batch.set(doc(db, 'groups', group.id), { students: [...students], studentLessonMap, updatedAt }, { merge: true });
    batch.set(doc(db, 'students', student.id), { group: shouldAdd ? group.name : '', updatedAt: updatedAt.slice(0, 10) }, { merge: true });
    activity(batch, db, shouldAdd ? 'group.student_added' : 'group.student_removed', `${student.name || 'Õpilane'} ${shouldAdd ? 'lisatud gruppi' : 'eemaldatud grupist'}`, group, user, { studentId: student.id });
    await batch.commit();
  },

  async addLesson(group, draft, user) {
    requireAdmin(user);
    if (!group?.id) throw new Error('Gruppi ei leitud.');
    const lesson = lessonValue({ ...draft, id: nextLessonId() });
    const existingLessonIds = (group.lessons || []).map((item) => item.id);
    const studentLessonMap = { ...(group.studentLessonMap || {}) };
    (group.students || []).forEach((studentId) => {
      const assigned = Array.isArray(studentLessonMap[studentId]) ? studentLessonMap[studentId] : existingLessonIds;
      studentLessonMap[studentId] = uniqueIds([...assigned, lesson.id]);
    });
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    batch.set(doc(db, 'groups', group.id), { lessons: [...(group.lessons || []), lesson], studentLessonMap, updatedAt: new Date().toISOString() }, { merge: true });
    activity(batch, db, 'group.lesson_added', `${group.name || 'Grupi'} tunniaeg lisatud`, group, user, { lessonId: lesson.id, day: lesson.day, time: lesson.time });
    await batch.commit();
    return lesson;
  },

  async removeLesson(group, lessonId, user) {
    requireAdmin(user);
    if (!group?.id || !lessonId) throw new Error('Grupi tunniaega ei leitud.');
    const studentLessonMap = Object.fromEntries(Object.entries(group.studentLessonMap || {}).map(([studentId, ids]) => [studentId, (ids || []).filter((id) => id !== lessonId)]));
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    batch.set(doc(db, 'groups', group.id), { lessons: (group.lessons || []).filter((lesson) => lesson.id !== lessonId), studentLessonMap, updatedAt: new Date().toISOString() }, { merge: true });
    activity(batch, db, 'group.lesson_removed', `${group.name || 'Grupi'} tunniaeg eemaldatud`, group, user, { lessonId });
    await batch.commit();
  },

  async setStudentLesson(group, studentId, lessonId, shouldAttend, user) {
    requireAdmin(user);
    if (!group?.id || !studentId || !lessonId) throw new Error('Grupi tunniseos on vigane.');
    const lessonIds = (group.lessons || []).map((lesson) => lesson.id);
    const studentLessonMap = { ...(group.studentLessonMap || {}) };
    const selected = new Set(Array.isArray(studentLessonMap[studentId]) ? studentLessonMap[studentId] : lessonIds);
    if (shouldAttend) selected.add(lessonId);
    else selected.delete(lessonId);
    studentLessonMap[studentId] = [...selected].filter((id) => lessonIds.includes(id));
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    batch.set(doc(db, 'groups', group.id), { studentLessonMap, updatedAt: new Date().toISOString() }, { merge: true });
    activity(batch, db, 'group.student_lesson_updated', `${group.name || 'Grupi'} tunniseos uuendatud`, group, user, { studentId, lessonId, shouldAttend: Boolean(shouldAttend) });
    await batch.commit();
  },

  async setAttendance(group, lessonId, occurrenceDate, studentId, status, user) {
    requireStaff(user);
    if (!group?.id || !lessonId || !studentId || !/^\d{4}-\d{2}-\d{2}$/.test(occurrenceDate || '')) throw new Error('Kohalolu seos on vigane.');
    if (!['coming', 'absent', 'warned', 'clear'].includes(status)) throw new Error('Kohalolu olek on vigane.');
    const attendanceKey = `${studentId}_${occurrenceDate}`;
    let updatedAttendance = {};
    let found = false;
    const lessons = (group.lessons || []).map((lesson) => {
      if (lesson.id !== lessonId) return lesson;
      found = true;
      updatedAttendance = { ...(lesson.attendance || {}) };
      if (status === 'clear') delete updatedAttendance[attendanceKey];
      else updatedAttendance[attendanceKey] = {
        status,
        by: user.uid,
        byName: user.displayName || user.email || 'Õpetaja',
        byRole: user.roles?.[0] || 'teacher',
        updatedAt: new Date().toISOString(),
      };
      return { ...lesson, attendance: updatedAttendance };
    });
    if (!found) throw new Error('Grupi tunniaega ei leitud.');
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    batch.set(doc(db, 'groups', group.id), { lessons, updatedAt: new Date().toISOString() }, { merge: true });
    activity(batch, db, 'group.attendance_updated', `${group.name || 'Grupi'} kohalolu uuendatud`, group, user, { lessonId, occurrenceDate, studentId, status });
    await batch.commit();
    return updatedAttendance;
  },
};
