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
} from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { canonicalTeacherName, isSameTeacher } from '../../utils/teachers.js';
import { visibleStudentValue } from '../../utils/studentPrivacy.js';

const PAGE_SIZE = 50;
const writableFields = [
  'name', 'parentName', 'parentEmail', 'email', 'phone', 'level', 'targetLevel',
  'subject', 'grade', 'group', 'teacher', 'active', 'contactStatus', 'contactOwner',
  'contactLastAt', 'contactNotes',
];

function cleanText(value) { return String(value ?? '').trim(); }

export function normalizeStudent(id, data = {}) {
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
    teacher: cleanText(data.teacher),
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
  if (filters.teacher && !isSameTeacher(student.teacher, filters.teacher)) return false;
  if (filters.scopeTeacher && !isSameTeacher(student.teacher, filters.scopeTeacher)) return false;
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
  async list(filters = {}) {
    const { db } = requireFirebaseClient();
    const pageSize = Math.max(1, Number(filters.pageSize) || PAGE_SIZE);
    const exhaustive = filters.exhaustive || filters.sort === 'level' || filters.sort === 'teacher';
    const direction = filters.sort === 'name-desc' ? 'desc' : 'asc';
    let cursor = filters.cursor || null;
    let hasMore = true;
    const items = [];

    while (hasMore && (exhaustive || items.length < pageSize)) {
      const constraints = [orderBy('name', direction), limit(pageSize)];
      if (cursor) constraints.splice(1, 0, startAfter(cursor));
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
    const candidate = normalizeStudent('', { ...data, active: true });
    const possibleDuplicates = await this.list({ search: candidate.name, status: 'active', pageSize: PAGE_SIZE, exhaustive: true });
    if (hasDuplicateStudent(possibleDuplicates.items, candidate)) throw new StudentDuplicateError();
    const payload = {
      ...pickStudentFields(data),
      active: true,
      contactStatus: data.contactStatus || 'new',
      contactOwner: data.contactOwner || '',
      contactLastAt: data.contactLastAt || '',
      contactNotes: data.contactNotes || '',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const reference = await addDoc(collection(db, 'students'), payload);
    return normalizeStudent(reference.id, payload);
  },
  async update(id, data) {
    const { db } = requireFirebaseClient();
    const payload = { ...pickStudentFields(data), updatedAt: new Date().toISOString().slice(0, 10) };
    const current = await this.getById(id);
    const candidate = current ? normalizeStudent(id, { ...current, ...payload }) : null;
    if (
      candidate?.active
      && studentProfileKey(candidate) !== studentProfileKey(current)
    ) {
      const possibleDuplicates = await this.list({ search: candidate.name, status: 'active', pageSize: PAGE_SIZE, exhaustive: true });
      if (hasDuplicateStudent(possibleDuplicates.items, candidate, id)) throw new StudentDuplicateError();
    }
    await updateDoc(doc(db, 'students', id), payload);
    return this.getById(id);
  },
  async archive(id) {
    return this.update(id, { active: false });
  },
};
