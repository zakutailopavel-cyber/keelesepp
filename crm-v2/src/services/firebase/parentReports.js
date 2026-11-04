import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// `parentReports/{id}`: „Kuu kokkuvõte vanemale” the admin marked as sent (he copied it and sent it himself, or sent it
// to the student's conversation). Only a record of what was sent, when and by whom — nothing is sent from here.
// Administrators only (firestore.rules); create once, never changed.
export const PARENT_REPORT_CHANNELS = ['copy', 'conversation'];

export function parentReportRecord({ studentId, month, language, text, channel = 'copy', user, now = new Date().toISOString() }) {
  return {
    studentId: String(studentId || ''),
    month: String(month || ''),
    language: String(language || 'ru'),
    text: String(text || '').slice(0, 4000),
    channel: PARENT_REPORT_CHANNELS.includes(channel) ? channel : 'copy',
    sentAt: now,
    byUid: user?.uid || '',
    byName: String(user?.displayName || user?.email || '').slice(0, 160),
  };
}

export const parentReportsService = {
  async listForStudent(studentId) {
    if (!studentId) return [];
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'parentReports'), where('studentId', '==', studentId)));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => String(b.sentAt).localeCompare(String(a.sentAt)));
  },
  async markSent(input) {
    const record = parentReportRecord(input);
    if (!record.studentId || !/^\d{4}-\d{2}$/.test(record.month)) throw new Error('Õpilane või kuu puudub.');
    if (!record.text.trim()) throw new Error('Kokkuvõte on tühi.');
    const { db } = requireFirebaseClient();
    const ref = doc(collection(db, 'parentReports'));
    await setDoc(ref, record);
    return { id: ref.id, ...record };
  },
};
