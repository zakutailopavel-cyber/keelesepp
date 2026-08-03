import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

function normalize(id, data = {}) {
  return { id, status: 'Planeeritud', duration: 60, ...data };
}

function sort(items) {
  return items.sort((a, b) => `${a.date || a.startDate || '9999'} ${a.time || ''}`.localeCompare(`${b.date || b.startDate || '9999'} ${b.time || ''}`, 'et'));
}

function payload(data, current = {}) {
  const now = new Date().toISOString();
  const date = String(data.date || current.date || '').trim();
  const recurring = Boolean(data.recurring ?? current.recurring);
  return {
    ...current,
    ...data,
    date,
    day: data.day || current.day || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(`${date}T12:00:00`).getDay()],
    time: String(data.time || current.time || '09:00'),
    duration: Math.max(5, Number(data.duration || current.duration || 60)),
    recurring,
    status: data.status || current.status || 'Planeeritud',
    source: current.source || 'keelesepp-crm-v2',
    scheduleVersion: 2,
    updatedAtIso: now,
    ...(recurring ? { startDate: date } : {}),
  };
}

function minutes(value) {
  const [hours, mins] = String(value || '').split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(mins) ? hours * 60 + mins : 0;
}

export function hasScheduleConflict(items, candidate, excludeId = '') {
  const start = minutes(candidate.time);
  const end = start + Number(candidate.duration || 60);
  return items.some((item) => {
    if (item.id === excludeId || item.status === 'Tühistatud') return false;
    if ((item.date || item.startDate) !== candidate.date) return false;
    if (candidate.teacherUid && item.teacherUid ? item.teacherUid !== candidate.teacherUid : item.teacher !== candidate.teacher) return false;
    const itemStart = minutes(item.time);
    return start < itemStart + Number(item.duration || 60) && end > itemStart;
  });
}

export const scheduleService = {
  async list(filters = {}) {
    const { db } = requireFirebaseClient();
    const reference = collection(db, 'schedule');
    const snapshot = await getDocs(filters.teacherUid ? query(reference, where('teacherUid', '==', filters.teacherUid)) : reference);
    return sort(snapshot.docs.map((item) => normalize(item.id, item.data())));
  },
  async listByStudent(studentId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'schedule'), where('studentId', '==', studentId)));
    return sort(snapshot.docs.map((item) => normalize(item.id, item.data())));
  },
  async create(data) {
    const { db } = requireFirebaseClient();
    const value = { ...payload(data), createdAt: data.date, createdAtIso: new Date().toISOString() };
    const reference = await addDoc(collection(db, 'schedule'), value);
    return normalize(reference.id, value);
  },
  async update(id, data, current = {}) {
    const { db } = requireFirebaseClient();
    const value = payload(data, current);
    delete value.id;
    await updateDoc(doc(db, 'schedule', id), value);
    return normalize(id, value);
  },
  async cancel(id, current = {}) {
    return this.update(id, { status: 'Tühistatud' }, current);
  },
};
