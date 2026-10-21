import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// „Sobivad ajad” on the student's card (owner 2026-10-21): the student or the parent marks in their own CRM page every
// hour that really suits a lesson; the administrator sees it on the card and gets a notification when it changes.
// One document per card: studentAvailability/{studentId}. Half-hour slots „Mon-16:00” as on the public /ajad page.
const clean = (value, max = 160) => String(value ?? '').trim().slice(0, max);
const dateOf = (value) => (typeof value?.toDate === 'function' ? value.toDate().toISOString() : clean(value, 40));

export function normalizeAvailability(id, data = {}) {
  return {
    id,
    studentId: clean(data.studentId || id),
    slots: Array.isArray(data.slots) ? data.slots : [],
    preferred: Array.isArray(data.preferred) ? data.preferred : [],
    message: clean(data.message, 1000),
    changedAt: clean(data.changedAt, 40),
    changedByName: clean(data.changedByName),
    changedByRole: clean(data.changedByRole, 20),
    previousSlots: Array.isArray(data.previousSlots) ? data.previousSlots : [],
    previousPreferred: Array.isArray(data.previousPreferred) ? data.previousPreferred : [],
    reviewedAt: clean(data.reviewedAt, 40),
    reviewedByName: clean(data.reviewedByName),
    updatedAt: dateOf(data.updatedAt),
  };
}

// changed by the student / parent after the administrator last looked
export const needsReview = (item) => Boolean(item?.changedAt && item.changedByRole !== 'admin' && (!item.reviewedAt || item.reviewedAt < item.changedAt));

const roleOf = (user = {}) => (user.roles?.includes('admin') ? 'admin' : user.roles?.includes('parent') ? 'parent' : user.roles?.includes('student') ? 'student' : (user.roles?.[0] || ''));

export const studentAvailabilityService = {
  async get(studentId) {
    if (!studentId) return null;
    const { db } = requireFirebaseClient();
    const snap = await getDoc(doc(db, 'studentAvailability', studentId));
    return snap.exists() ? normalizeAvailability(snap.id, snap.data()) : null;
  },
  // the administrator: all cards; others pass their students' ids (the rules allow only those)
  async list(studentIds = null) {
    const { db } = requireFirebaseClient();
    if (studentIds) {
      const snaps = await Promise.all(studentIds.map((id) => getDoc(doc(db, 'studentAvailability', id)).catch(() => null)));
      return snaps.filter((snap) => snap?.exists()).map((snap) => normalizeAvailability(snap.id, snap.data()));
    }
    const snapshot = await getDocs(collection(db, 'studentAvailability'));
    return snapshot.docs.map((item) => normalizeAvailability(item.id, item.data()));
  },
  async save(studentId, { slots = [], preferred = [], message = '' }, user, previous = null) {
    if (!studentId) throw new Error('Õpilase kaart puudub.');
    const { db } = requireFirebaseClient();
    const role = roleOf(user);
    const value = {
      studentId,
      slots: slots.slice(0, 336),
      preferred: preferred.filter((slot) => slots.includes(slot)).slice(0, 336),
      message: clean(message, 1000),
      changedAt: new Date().toISOString(),
      changedByUid: user.uid,
      changedByName: clean(user.displayName || user.email),
      changedByRole: role,
      previousSlots: (previous?.slots || []).slice(0, 336),
      previousPreferred: (previous?.preferred || []).slice(0, 336),
      updatedAt: serverTimestamp(),
      // the administrator's own change needs no review
      ...(role === 'admin' ? { reviewedAt: new Date().toISOString(), reviewedByName: clean(user.displayName || user.email) } : {}),
    };
    await setDoc(doc(db, 'studentAvailability', studentId), value, { merge: true });
    return normalizeAvailability(studentId, { ...previous, ...value, updatedAt: value.changedAt });
  },
  async markReviewed(studentId, user) {
    const { db } = requireFirebaseClient();
    const value = { reviewedAt: new Date().toISOString(), reviewedByName: clean(user.displayName || user.email), updatedAt: serverTimestamp() };
    await setDoc(doc(db, 'studentAvailability', studentId), value, { merge: true });
    return value;
  },
};
