import { Timestamp, addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// „Helistasin” on the dashboard's „Vajab kõnet” (admin, 2026-11-04): who called which student, when, a short note and
// the reasons shown at that moment. Admin only (firestore.rules `studentFollowups`): the note may say why a family
// stops, so it is not kept on the student card, which the student, the parent and the teacher read.
export const FOLLOWUP_NOTE_MAX = 300;
export const FOLLOWUP_REASONS_MAX = 6;

const clean = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const iso = (value) => (value?.toDate ? value.toDate().toISOString() : String(value || ''));

export function followupRecord({ student, note = '', reasons = [] }, user) {
  if (!student?.id) throw new Error('Õpilane puudub.');
  if (!user?.uid) throw new Error('Logi uuesti sisse.');
  return {
    studentId: String(student.id).slice(0, 200),
    studentName: clean(student.name, 200),
    note: clean(note, FOLLOWUP_NOTE_MAX),
    reasons: reasons.map((reason) => clean(reason?.text ?? reason, 120)).filter(Boolean).slice(0, FOLLOWUP_REASONS_MAX),
    byUid: user.uid,
    byName: clean(user.displayName || user.email, 120),
  };
}

export function normalizeFollowup(id, data = {}) {
  return { id, studentId: data.studentId || '', studentName: data.studentName || '', note: data.note || '', reasons: Array.isArray(data.reasons) ? data.reasons : [], byName: data.byName || '', at: iso(data.at) };
}

export const studentFollowupsService = {
  // the calls since `fromIso` (YYYY-MM-DD, Tallinn midnight is close enough for a 14-day window)
  async listSince(fromIso) {
    const { db } = requireFirebaseClient();
    const since = Timestamp.fromDate(new Date(`${fromIso}T00:00:00Z`));
    const snapshot = await getDocs(query(collection(db, 'studentFollowups'), where('at', '>=', since)));
    return snapshot.docs.map((item) => normalizeFollowup(item.id, item.data()));
  },
  async add(input, user) {
    const record = followupRecord(input, user);
    const { db } = requireFirebaseClient();
    const reference = await addDoc(collection(db, 'studentFollowups'), { ...record, at: serverTimestamp() });
    return { id: reference.id, ...record, at: new Date().toISOString() };
  },
};
