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

function pickStudentFields(data) {
  return Object.fromEntries(writableFields.filter((key) => key in data).map((key) => [key, typeof data[key] === 'string' ? cleanText(data[key]) : data[key]]));
}

function matchesFilters(student, filters = {}) {
  const search = cleanText(filters.search).toLocaleLowerCase('et');
  if (search && ![student.name, student.phone, student.email, student.parentName].some((value) => cleanText(value).toLocaleLowerCase('et').includes(search))) return false;
  if (filters.status === 'active' && !student.active) return false;
  if (filters.status === 'archived' && student.active) return false;
  if (filters.level && student.level !== filters.level) return false;
  if (filters.teacher && student.teacher !== filters.teacher) return false;
  return true;
}

function sortStudents(items, sort = 'name-asc') {
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
    const constraints = [orderBy('name'), limit(filters.pageSize || PAGE_SIZE)];
    if (filters.cursor) constraints.splice(1, 0, startAfter(filters.cursor));
    const snapshot = await getDocs(query(collection(db, 'students'), ...constraints));
    const items = snapshot.docs.map((item) => normalizeStudent(item.id, item.data()));
    return {
      items: sortStudents(items.filter((student) => matchesFilters(student, filters)), filters.sort),
      cursor: snapshot.docs.at(-1) || null,
      hasMore: snapshot.size === (filters.pageSize || PAGE_SIZE),
    };
  },
  async getById(id) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'students', id));
    return snapshot.exists() ? normalizeStudent(snapshot.id, snapshot.data()) : null;
  },
  async create(data) {
    const { db } = requireFirebaseClient();
    const payload = { ...pickStudentFields(data), active: true, createdAt: new Date().toISOString().slice(0, 10) };
    const reference = await addDoc(collection(db, 'students'), payload);
    return normalizeStudent(reference.id, payload);
  },
  async update(id, data) {
    const { db } = requireFirebaseClient();
    const payload = { ...pickStudentFields(data), updatedAt: new Date().toISOString().slice(0, 10) };
    await updateDoc(doc(db, 'students', id), payload);
    return this.getById(id);
  },
  async archive(id) {
    return this.update(id, { active: false });
  },
};
