import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

const clean = (value) => String(value ?? '').trim();

export function presenceIsFresh(presence, now = Date.now(), maxAgeMs = 45_000) {
  if (!presence?.online) return false;
  const value = presence.lastSeen;
  const lastSeenMs = value?.toMillis
    ? value.toMillis()
    : value?.toDate
      ? value.toDate().getTime()
      : Date.parse(String(value || presence.lastSeenIso || ''));
  return Number.isFinite(lastSeenMs) && now - lastSeenMs <= maxAgeMs;
}

export const liveLessonPresenceService = {
  subscribe(invitationId, onChange, onError) {
    if (!invitationId) {
      onChange([]);
      return () => {};
    }
    const { db } = requireFirebaseClient();
    return onSnapshot(
      collection(db, 'liveLessonInvitations', invitationId, 'presence'),
      (snapshot) => onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
      onError,
    );
  },

  async heartbeat(invitationId, { uid, role, displayName, online = true }) {
    if (!invitationId || !uid || !['teacher', 'student'].includes(role)) {
      throw new Error('Tunniruumi kohalolekuandmed on vigased.');
    }
    const { db } = requireFirebaseClient();
    await setDoc(doc(db, 'liveLessonInvitations', invitationId, 'presence', uid), {
      uid,
      role,
      displayName: clean(displayName).slice(0, 160),
      online: Boolean(online),
      lastSeen: serverTimestamp(),
      lastSeenIso: new Date().toISOString(),
    });
  },

  // Leaving the room. The rules accept presence writes only while the invitation is 'accepted': when the room is left
  // because the lesson was just closed (the teacher's „Lõpeta tund” → calendar, the student's room closing), the
  // write would be refused and reported to „Vead” — so the invitation is read first (pending local writes included)
  // and a closed room is left without a write. Nobody reads presence of a closed room.
  async markOffline(invitationId, participant) {
    if (!invitationId) return false;
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'liveLessonInvitations', invitationId)).catch(() => null);
    if (!snapshot?.exists?.() || snapshot.data()?.status !== 'accepted') return false;
    await this.heartbeat(invitationId, { ...participant, online: false });
    return true;
  },
};
