import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// „Keeleoskus” curve (owner 2026-11-04): `progressPoints/{id}` { studentId, date 'YYYY-MM-DD', level, percent 0–100,
// kind 'estimate' | 'exam' | 'teacher', label, createdBy, createdByName, createdAt, updatedAt }. Written only by an
// admin or the student's teacher (a teacher changes / deletes his own); read by them, the student and linked parents
// (firestore.rules). No automatic writer: the teacher adds a point on the card, the admin can save the skill estimate.
export const PROGRESS_KINDS = Object.freeze({
  teacher: { label: 'Õpetaja hinnang', ru: 'оценка учителя' },
  exam: { label: 'Proovieksam', ru: 'пробный экзамен' },
  estimate: { label: 'Oskuste hinnang', ru: 'оценка навыков' },
});
export const PROGRESS_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value) * 10) / 10));

export function normalizeProgressPoint(id, data = {}) {
  const percent = Number(data.percent);
  return {
    id,
    studentId: String(data.studentId || ''),
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(data.date || '')) ? data.date : '',
    level: PROGRESS_LEVELS.includes(data.level) ? data.level : '',
    percent: Number.isFinite(percent) ? clamp(percent) : null,
    kind: PROGRESS_KINDS[data.kind] ? data.kind : 'teacher',
    label: String(data.label || '').slice(0, 80),
    createdBy: String(data.createdBy || ''),
    createdByName: String(data.createdByName || ''),
    createdAt: String(data.createdAt || ''),
  };
}

// what the form sends; throws a plain Estonian message when something is missing
export function progressPointRecord({ studentId, date, level, percent, kind = 'teacher', label = '' }, user = {}, now = new Date().toISOString()) {
  const value = Number(String(percent ?? '').replace(',', '.'));
  if (!studentId) throw new Error('Õpilane puudub.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) throw new Error('Vali kuupäev.');
  if (!PROGRESS_LEVELS.includes(level)) throw new Error('Vali tase.');
  if (String(percent ?? '').trim() === '' || !Number.isFinite(value) || value < 0 || value > 100) throw new Error('Protsent peab olema 0–100.');
  if (!PROGRESS_KINDS[kind]) throw new Error('Vali mõõtmise liik.');
  return {
    studentId, date, level, percent: clamp(value), kind, label: String(label || '').trim().slice(0, 80),
    createdBy: user.uid || '', createdByName: String(user.displayName || user.email || '').slice(0, 160), createdAt: now, updatedAt: now,
  };
}

export const progressPointsService = {
  async listForStudents(studentIds = []) {
    const ids = [...new Set(studentIds.filter(Boolean))];
    if (!ids.length) return [];
    const { db } = requireFirebaseClient();
    const lists = await Promise.all(ids.map((studentId) => getDocs(query(collection(db, 'progressPoints'), where('studentId', '==', studentId)))));
    return lists.flatMap((snapshot) => snapshot.docs.map((item) => normalizeProgressPoint(item.id, item.data())))
      .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
  },
  async add(input, user) {
    const { db } = requireFirebaseClient();
    const record = progressPointRecord(input, user);
    const created = await addDoc(collection(db, 'progressPoints'), record);
    return normalizeProgressPoint(created.id, record);
  },
  async update(id, input, user, existing = {}) {
    const { db } = requireFirebaseClient();
    const record = progressPointRecord(input, user);
    // the author and the first time stay as they were
    const changes = { date: record.date, level: record.level, percent: record.percent, kind: record.kind, label: record.label, updatedAt: record.updatedAt };
    await updateDoc(doc(db, 'progressPoints', id), changes);
    return normalizeProgressPoint(id, { ...existing, ...changes });
  },
  async remove(id) {
    const { db } = requireFirebaseClient();
    await deleteDoc(doc(db, 'progressPoints', id));
  },
};
