import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { canonicalTeacherName, isSameTeacher } from '../../utils/teachers.js';
import { visibleStudentValue } from '../../utils/studentPrivacy.js';

const PAGE_SIZE = 50;
const writableFields = [
  'name', 'parentName', 'parentEmail', 'email', 'phone', 'level', 'targetLevel',
  'subject', 'grade', 'group', 'teacher', 'active', 'contactStatus', 'contactOwner',
  'contactLastAt', 'contactNotes', 'enrollments', 'personId', 'teacherUids', 'facebook', 'instagram', 'planningPausedUntil',
];

function cleanText(value) { return String(value ?? '').trim(); }

function normalizedEnrollment(value = {}, fallback = {}) {
  const subject = cleanText(value.subject || fallback.subject) || 'Eesti keel';
  const teacher = canonicalTeacherName(cleanText(value.teacher || fallback.teacher));
  const teacherUid = cleanText(value.teacherUid || fallback.teacherUid);
  const level = cleanText(value.level || fallback.level);
  const targetLevel = cleanText(value.targetLevel || fallback.targetLevel);
  return {
    id: cleanText(value.id) || [subject, teacherUid || teacher, level, targetLevel].join('|').toLocaleLowerCase('et'),
    subject,
    teacher,
    teacherUid,
    level,
    targetLevel,
    active: value.active !== false,
  };
}

export function enrollmentKey(value = {}) {
  const enrollment = normalizedEnrollment(value);
  return [enrollment.subject, enrollment.teacherUid || enrollment.teacher].map((item) => cleanText(item).toLocaleLowerCase('et')).join('|');
}

export function studentPersonKey(student = {}) {
  const name = cleanText(student.name).toLocaleLowerCase('et');
  const explicitParentId = cleanText(student.linkedParentId || student.parentUid || student.guardianUid);
  const parentEmail = cleanText(student.parentEmail || student.guardianEmail).toLocaleLowerCase('et');
  const parentName = cleanText(student.parentName || student.guardianName).toLocaleLowerCase('et');
  if (cleanText(student.personId)) return `person:${cleanText(student.personId)}`;
  if (explicitParentId && name) return `parent:${explicitParentId}|name:${name}`;
  if (parentEmail && name) return `email:${parentEmail}|name:${name}`;
  if (parentName && name) return `parent-name:${parentName}|name:${name}`;
  return `record:${cleanText(student.id) || name}`;
}

export function groupStudentPeople(items = []) {
  const groups = new Map();
  items.forEach((source) => {
    const student = Array.isArray(source?.enrollments) && source.enrollments.length
      ? source
      : normalizeStudent(source?.id || '', source || {});
    const key = studentPersonKey(student);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(student);
  });
  return [...groups.entries()].map(([personKey, records]) => {
    const primary = records.find((item) => item.active !== false) || records[0];
    const enrollmentMap = new Map();
    records.forEach((record) => (record.enrollments || []).forEach((enrollment) => {
      const key = enrollmentKey(enrollment);
      const current = enrollmentMap.get(key);
      if (!current) enrollmentMap.set(key, { ...enrollment, sourceRecordIds: [record.id] });
      else if (!current.sourceRecordIds.includes(record.id)) current.sourceRecordIds.push(record.id);
    }));
    const enrollments = [...enrollmentMap.values()];
    const teachers = [...new Set(enrollments.map((item) => item.teacher).filter(Boolean))];
    const levels = [...new Set(enrollments.map((item) => item.level).filter(Boolean))];
    const subjects = [...new Set(enrollments.map((item) => item.subject).filter(Boolean))];
    return {
      ...primary,
      personKey,
      recordIds: records.map((item) => item.id),
      records,
      enrollments,
      teacher: teachers.join(', '),
      level: levels.length === 1 ? levels[0] : (levels.length ? levels.join(', ') : primary.level),
      subject: subjects.join(', '),
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'et', { sensitivity: 'base' }));
}

// who can open the student's work in the CRM: the learner's own account, only a parent's account, or nobody (a card
// without a linked account — assigned work is saved but no one sees it)
export function studentAccess(student = {}) {
  if (student.linkedUserId || student.studentUid || (student.linkedUserIds || []).length) return 'student';
  if (student.linkedParentId || student.parentUid || student.guardianUid || (student.linkedParentIds || []).length) return 'parent';
  return 'none';
}

export function normalizeStudent(id, data = {}) {
  const legacyEnrollment = normalizedEnrollment(data, data);
  const sourceEnrollments = Array.isArray(data.enrollments) && data.enrollments.length ? data.enrollments : [legacyEnrollment];
  const enrollmentMap = new Map(sourceEnrollments.map((item) => { const normalized = normalizedEnrollment(item, data); return [enrollmentKey(normalized), normalized]; }));
  return {
    id,
    ...data,
    name: cleanText(data.name),
    parentName: cleanText(data.parentName),
    parentEmail: cleanText(data.parentEmail),
    email: cleanText(data.email),
    phone: cleanText(data.phone),
    level: cleanText(data.level),
    targetLevel: cleanText(data.targetLevel),
    subject: cleanText(data.subject) || 'Eesti keel',
    teacher: canonicalTeacherName(cleanText(data.teacher)),
    enrollments: [...enrollmentMap.values()],
    active: data.active !== false,
    skillMap: data.skillMap && typeof data.skillMap === 'object' ? data.skillMap : {},
  };
}

export function studentProfileKey(student = {}) {
  return [
    cleanText(student.name).toLocaleLowerCase('et'),
    cleanText(student.parentEmail || student.email).toLocaleLowerCase('et'),
    cleanText(student.parentName).toLocaleLowerCase('et'),
    cleanText(student.subject || 'Eesti keel').toLocaleLowerCase('et'),
    canonicalTeacherName(student.teacher).toLocaleLowerCase('et'),
  ].join('|');
}

export class StudentDuplicateError extends Error {
  constructor() {
    super('Sama nime, kontakti, õppeaine ja õpetajaga aktiivne õpilane on juba olemas.');
    this.name = 'StudentDuplicateError';
    this.code = 'students/duplicate';
  }
}

export function hasDuplicateStudent(items, candidate, excludeId = '') {
  const candidateKey = studentProfileKey(candidate);
  return items.some((student) => (
    student.id !== excludeId
    && student.active
    && studentProfileKey(student) === candidateKey
  ));
}

function pickStudentFields(data) {
  return Object.fromEntries(writableFields.filter((key) => key in data).map((key) => [key, typeof data[key] === 'string' ? cleanText(data[key]) : data[key]]));
}

export class TeacherResolutionError extends Error {
  constructor() {
    super('Valitud õpetaja kontot ei leitud või nimi ei ole üheselt seostatav. Kontrolli kasutajate kataloogi.');
    this.name = 'TeacherResolutionError';
    this.code = 'students/teacher-not-resolved';
  }
}

async function resolveTeacherUid(db, teacherName) {
  const canonicalName = canonicalTeacherName(teacherName);
  if (!canonicalName) return '';
  const snapshot = await getDocs(query(
    collection(db, 'users'),
    where('role', 'in', ['admin', 'teacher']),
  ));
  const matches = snapshot.docs.filter((item) => {
    const profile = item.data();
    return profile.disabled !== true && isSameTeacher(profile.displayName || profile.name, canonicalName);
  });
  if (matches.length !== 1) throw new TeacherResolutionError();
  return matches[0].id;
}

export function matchesStudentFilters(student, filters = {}) {
  const search = cleanText(filters.search).toLocaleLowerCase('et');
  if (search && ![
    visibleStudentValue(student, 'name'),
    visibleStudentValue(student, 'phone'),
    visibleStudentValue(student, 'email'),
    visibleStudentValue(student, 'parentEmail'),
    visibleStudentValue(student, 'parentName'),
  ].some((value) => cleanText(value).toLocaleLowerCase('et').includes(search))) return false;
  if (filters.status === 'active' && !student.active) return false;
  if (filters.status === 'archived' && student.active) return false;
  if (filters.level && student.level !== filters.level) return false;
  const enrollmentTeachers = (student.enrollments || []).map((item) => item.teacher).filter(Boolean);
  if (filters.teacher && ![student.teacher, ...enrollmentTeachers].some((teacher) => isSameTeacher(teacher, filters.teacher))) return false;
  if (filters.scopeTeacher && ![student.teacher, ...enrollmentTeachers].some((teacher) => isSameTeacher(teacher, filters.scopeTeacher))) return false;
  return true;
}

export function sortStudents(items, sort = 'name-asc') {
  const collator = new Intl.Collator('et', { sensitivity: 'base', numeric: true });
  const sorted = [...items];
  if (sort === 'name-desc') sorted.sort((a, b) => collator.compare(b.name, a.name));
  else if (sort === 'level') sorted.sort((a, b) => collator.compare(a.level, b.level) || collator.compare(a.name, b.name));
  else if (sort === 'teacher') sorted.sort((a, b) => collator.compare(a.teacher, b.teacher) || collator.compare(a.name, b.name));
  else sorted.sort((a, b) => collator.compare(a.name, b.name));
  return sorted;
}

export const studentsService = {
  async listSelf(uid) {
    if (!uid) return [];
    const { db } = requireFirebaseClient();
    const constraints = [
      where('linkedUserId', '==', uid),
      where('studentUid', '==', uid),
      where('linkedUserIds', 'array-contains', uid),
    ];
    const snapshots = await Promise.all(constraints.map((constraint) => getDocs(query(collection(db, 'students'), constraint))));
    const unique = new Map();
    snapshots.forEach((snapshot) => snapshot.docs.forEach((item) => unique.set(item.id, normalizeStudent(item.id, item.data()))));
    return sortStudents([...unique.values()].filter((student) => student.active && !student.convertedToParent));
  },
  async listOwned(uid) {
    const { db } = requireFirebaseClient();
    const constraints = [
      where('linkedUserId', '==', uid),
      where('studentUid', '==', uid),
      where('linkedUserIds', 'array-contains', uid),
      where('linkedParentId', '==', uid),
      where('parentUid', '==', uid),
      where('guardianUid', '==', uid),
      where('linkedParentIds', 'array-contains', uid),
    ];
    const snapshots = await Promise.all(constraints.map((constraint) => getDocs(query(collection(db, 'students'), constraint))));
    const unique = new Map();
    snapshots.forEach((snapshot) => snapshot.docs.forEach((item) => unique.set(item.id, normalizeStudent(item.id, item.data()))));
    return sortStudents([...unique.values()].filter((student) => student.active && !student.convertedToParent));
  },
  async list(filters = {}) {
    const { db } = requireFirebaseClient();
    const pageSize = Math.max(1, Number(filters.pageSize) || PAGE_SIZE);
    if (filters.scopeTeacherUid && filters.exhaustive) {
      const reference = collection(db, 'students');
      const [legacySnapshot, multiSnapshot] = await Promise.all([
        getDocs(query(reference, where('teacherUid', '==', filters.scopeTeacherUid))),
        getDocs(query(reference, where('teacherUids', 'array-contains', filters.scopeTeacherUid))),
      ]);
      const unique = new Map();
      [...legacySnapshot.docs, ...multiSnapshot.docs].forEach((item) => unique.set(item.id, normalizeStudent(item.id, item.data())));
      const scopedItems = [...unique.values()].filter((student) => matchesStudentFilters(student, filters));
      return { items: sortStudents(scopedItems, filters.sort), cursor: null, hasMore: false };
    }
    const exhaustive = filters.exhaustive || filters.sort === 'level' || filters.sort === 'teacher';
    const direction = filters.sort === 'name-desc' ? 'desc' : 'asc';
    let cursor = filters.cursor || null;
    let hasMore = true;
    const items = [];

    while (hasMore && (exhaustive || items.length < pageSize)) {
      const constraints = filters.scopeTeacherUid
        ? [where('teacherUid', '==', filters.scopeTeacherUid)]
        : [orderBy('name', direction)];
      if (cursor) constraints.push(startAfter(cursor));
      constraints.push(limit(pageSize));
      const snapshot = await getDocs(query(collection(db, 'students'), ...constraints));
      hasMore = snapshot.size === pageSize;
      if (!snapshot.size) hasMore = false;

      for (const [index, item] of snapshot.docs.entries()) {
        cursor = item;
        const student = normalizeStudent(item.id, item.data());
        if (matchesStudentFilters(student, filters)) items.push(student);
        if (!exhaustive && items.length === pageSize) {
          hasMore = index < snapshot.docs.length - 1 || snapshot.size === pageSize;
          break;
        }
      }
    }

    return {
      items: sortStudents(items, filters.sort),
      cursor,
      hasMore,
    };
  },
  async getById(id) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'students', id));
    return snapshot.exists() ? normalizeStudent(snapshot.id, snapshot.data()) : null;
  },
  async create(data) {
    const { db } = requireFirebaseClient();
    const teacherUid = await resolveTeacherUid(db, data.teacher);
    const candidate = normalizeStudent('', { ...data, teacherUid, active: true });
    const duplicateSnapshot = await getDocs(query(collection(db, 'students'), where('teacherUid', '==', teacherUid)));
    const possibleDuplicates = duplicateSnapshot.docs.map((item) => normalizeStudent(item.id, item.data()));
    if (hasDuplicateStudent(possibleDuplicates, candidate)) throw new StudentDuplicateError();
    const payload = {
      ...pickStudentFields(data),
      active: true,
      contactStatus: data.contactStatus || 'new',
      contactOwner: data.contactOwner || '',
      contactLastAt: data.contactLastAt || '',
      contactNotes: data.contactNotes || '',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    payload.teacher = canonicalTeacherName(payload.teacher);
    payload.teacherUid = teacherUid;
    payload.teacherUids = teacherUid ? [teacherUid] : [];
    const reference = await addDoc(collection(db, 'students'), payload);
    return normalizeStudent(reference.id, payload);
  },
  async update(id, data) {
    const { db } = requireFirebaseClient();
    const payload = { ...pickStudentFields(data), updatedAt: new Date().toISOString().slice(0, 10) };
    if ('teacher' in payload) payload.teacher = canonicalTeacherName(payload.teacher);
    const current = await this.getById(id);
    if ('teacher' in payload) {
      payload.teacherUid = current?.teacherUid && isSameTeacher(current.teacher, payload.teacher)
        ? current.teacherUid
        : await resolveTeacherUid(db, payload.teacher);
      payload.teacherUids = payload.teacherUid ? [...new Set([...(current?.teacherUids || []), payload.teacherUid])] : (current?.teacherUids || []);
    }
    const candidate = current ? normalizeStudent(id, { ...current, ...payload }) : null;
    if (
      candidate?.active
      && studentProfileKey(candidate) !== studentProfileKey(current)
    ) {
      const possibleDuplicates = await this.list({
        search: candidate.name,
        status: 'active',
        scopeTeacherUid: candidate.teacherUid,
        pageSize: PAGE_SIZE,
        exhaustive: true,
      });
      if (hasDuplicateStudent(possibleDuplicates.items, candidate, id)) throw new StudentDuplicateError();
    }
    await updateDoc(doc(db, 'students', id), payload);
    return this.getById(id);
  },
  async addEnrollment(id, enrollment) {
    const current = await this.getById(id);
    if (!current) throw new Error('Õpilast ei leitud.');
    const { db } = requireFirebaseClient();
    const teacherUid = await resolveTeacherUid(db, enrollment.teacher);
    const nextEnrollment = normalizedEnrollment({ ...enrollment, teacherUid }, current);
    const existing = new Map((current.enrollments || []).map((item) => [enrollmentKey(item), item]));
    existing.set(enrollmentKey(nextEnrollment), { ...existing.get(enrollmentKey(nextEnrollment)), ...nextEnrollment });
    const enrollments = [...existing.values()];
    const teacherUids = [...new Set(enrollments.map((item) => item.teacherUid).filter(Boolean))];
    const payload = { enrollments, teacherUids, updatedAt: new Date().toISOString().slice(0, 10) };
    await updateDoc(doc(db, 'students', id), payload);
    return this.getById(id);
  },
  async updateEnrollment(recordId, enrollmentId, patch) {
    const current = await this.getById(recordId);
    if (!current) throw new Error('Õpilast ei leitud.');
    const index = (current.enrollments || []).findIndex((item) => item.id === enrollmentId || enrollmentKey(item) === enrollmentId);
    if (index < 0) throw new Error('Õppesuunda ei leitud.');
    const { db } = requireFirebaseClient();
    const teacherUid = await resolveTeacherUid(db, patch.teacher ?? current.enrollments[index].teacher);
    const updated = normalizedEnrollment({ ...current.enrollments[index], ...patch, teacherUid }, current);
    const enrollments = [...current.enrollments];
    enrollments[index] = updated;
    const teacherUids = [...new Set(enrollments.filter((item) => item.active !== false).map((item) => item.teacherUid).filter(Boolean))];
    const payload = { enrollments, teacherUids, updatedAt: new Date().toISOString().slice(0, 10) };
    if (current.enrollments.length === 1 || enrollmentKey(current.enrollments[index]) === enrollmentKey(normalizedEnrollment(current, current))) {
      Object.assign(payload, {
        subject: updated.subject,
        teacher: updated.teacher,
        teacherUid: updated.teacherUid,
        level: updated.level,
        targetLevel: updated.targetLevel,
      });
    }
    await updateDoc(doc(db, 'students', recordId), payload);
    return this.getById(recordId);
  },
  async setPersonActive(recordIds, active) {
    const ids = [...new Set((Array.isArray(recordIds) ? recordIds : [recordIds]).map(cleanText).filter(Boolean))];
    if (!ids.length) throw new Error('Õpilase kirjeid ei leitud.');
    if (ids.length > 450) throw new Error('Õpilasega on seotud liiga palju kirjeid.');
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    const changedAt = new Date().toISOString();
    ids.forEach((id) => batch.update(doc(db, 'students', id), {
      active: Boolean(active),
      updatedAt: changedAt.slice(0, 10),
      ...(active ? { restoredAt: changedAt } : { archivedAt: changedAt }),
    }));
    await batch.commit();
    return { recordIds: ids, active: Boolean(active) };
  },
  async archive(recordIds) {
    return this.setPersonActive(recordIds, false);
  },
  async restore(recordIds) {
    return this.setPersonActive(recordIds, true);
  },
};
