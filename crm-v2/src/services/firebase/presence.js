import { collection, doc, documentId, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// „Viimati sees” and the last „Minu vead” review on the account document (owner 2026-10-23: the teacher sees when the
// student was in and whether he practises). The rules (validPresence) allow only the server's time for lastSeenAt and a
// small practice map { errorsDate, errorsPct, days ≤ 60 }; staff read the account of a student they teach.
export const SEEN_EVERY_MS = 6 * 3600000;
export const PRACTICE_DAYS = 60;
const SELF_ROLES = ['student', 'parent'];

const millis = (value) => (typeof value?.toMillis === 'function' ? value.toMillis() : Date.parse(value || '') || 0);

export function shouldMarkSeen(user, now = Date.now()) {
  if (!user?.uid || !user.profile || !Object.keys(user.profile).length) return false;
  if (user.approvalStatus && user.approvalStatus !== 'approved') return false;
  if (!user.roles?.some((role) => SELF_ROLES.includes(role))) return false;
  return now - millis(user.profile.lastSeenAt) >= SEEN_EVERY_MS;
}

// the practice map after one more „Minu vead” review: the last result and the days practised (newest last)
export function nextPractice(current = {}, { date, pct }) {
  const days = [...new Set([...(Array.isArray(current?.days) ? current.days : []), date])].filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day)).sort().slice(-PRACTICE_DAYS);
  return { errorsDate: date, errorsPct: Math.max(0, Math.min(100, Math.round(Number(pct) || 0))), days };
}

// the student's own account on a card (or on any card of a person: StudentsPage groups cards)
export function accountUid(student) {
  const cards = Array.isArray(student?.records) && student.records.length ? [student, ...student.records] : [student];
  for (const card of cards) {
    const uid = card?.linkedUserId || card?.studentUid || (Array.isArray(card?.linkedUserIds) ? card.linkedUserIds[0] : '');
    if (uid) return uid;
  }
  return '';
}

// the newest of the visit and the last „Minu vead” day (ms), 0 when unknown
export const lastSeenOf = (entry) => Math.max(entry?.lastSeenAt || 0, entry?.practice?.errorsDate ? Date.parse(`${entry.practice.errorsDate}T12:00:00`) || 0 : 0);

export const presenceService = {
  async markSeen(user) {
    if (!shouldMarkSeen(user)) return false;
    const { db } = requireFirebaseClient();
    await setDoc(doc(db, 'users', user.uid), { lastSeenAt: serverTimestamp() }, { merge: true });
    return true;
  },
  async savePractice(uid, entry) {
    if (!uid) return null;
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'users', uid));
    const practice = nextPractice(snapshot.exists() ? snapshot.data().practice : {}, entry);
    await setDoc(doc(db, 'users', uid), { practice }, { merge: true });
    return practice;
  },
  // many students at once (the students list, the dashboard): Map studentId → { lastSeenAt, practice }
  async forStudents(students = []) {
    const byUid = new Map();
    students.forEach((student) => { const uid = accountUid(student); if (uid && student?.id) byUid.set(uid, [...(byUid.get(uid) || []), student.id]); });
    const uids = [...byUid.keys()];
    if (!uids.length) return new Map();
    const { db } = requireFirebaseClient();
    const chunks = Array.from({ length: Math.ceil(uids.length / 30) }, (_, index) => uids.slice(index * 30, index * 30 + 30));
    const snapshots = await Promise.all(chunks.map((chunk) => getDocs(query(collection(db, 'users'), where(documentId(), 'in', chunk)))));
    const result = new Map();
    snapshots.forEach((snapshot) => snapshot.docs.forEach((account) => {
      const data = account.data();
      const entry = { lastSeenAt: millis(data.lastSeenAt), practice: data.practice || null };
      (byUid.get(account.id) || []).forEach((studentId) => result.set(studentId, entry));
    }));
    return result;
  },
  // what the teacher sees: the student's own account (linkedUserId / studentUid / the first linked account)
  async forStudent(studentId) {
    if (!studentId) return null;
    const { db } = requireFirebaseClient();
    const card = await getDoc(doc(db, 'students', studentId));
    const data = card.exists() ? card.data() : {};
    const uid = data.linkedUserId || data.studentUid || (Array.isArray(data.linkedUserIds) ? data.linkedUserIds[0] : '');
    if (!uid) return { hasAccount: false };
    const account = await getDoc(doc(db, 'users', uid));
    const profile = account.exists() ? account.data() : {};
    return { hasAccount: account.exists(), lastSeenAt: millis(profile.lastSeenAt), practice: profile.practice || null };
  },
};
