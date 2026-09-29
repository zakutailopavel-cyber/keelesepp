import {
  collection,
  doc,
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

  async markOffline(invitationId, participant) {
    return this.heartbeat(invitationId, { ...participant, online: false });
  },
};
