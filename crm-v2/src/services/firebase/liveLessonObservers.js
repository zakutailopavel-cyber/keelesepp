import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { normalizeInvitation, timestampMillis } from '../../features/live-classroom/invitationModel.js';

// Administrator watching a lesson (Live Classroom „Vaata tundi”, owner 2026-10-14): the list of lessons going on now,
// the observer's entry in the room (both sides see it) and the receive-only call signals (firestore.rules).
const SIGNAL_TYPES = new Set(['offer', 'answer', 'candidate', 'hangup']);
// an accepted room older than this is a lesson somebody forgot to end, not one going on now
export const ACTIVE_LESSON_MAX_MS = 4 * 60 * 60 * 1000;

export function activeLessons(invitations = [], now = Date.now()) {
  return invitations
    .filter((item) => item.status === 'accepted')
    .map((item) => ({ ...item, startedMs: timestampMillis(item.respondedAt) || timestampMillis(item.createdAt) || 0 }))
    .filter((item) => item.startedMs && now - item.startedMs < ACTIVE_LESSON_MAX_MS)
    .sort((a, b) => b.startedMs - a.startedMs);
}

export const liveLessonObserversService = {
  subscribeAccepted(onChange, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(
      query(collection(db, 'liveLessonInvitations'), where('status', '==', 'accepted')),
      (snapshot) => onChange(snapshot.docs.map((item) => normalizeInvitation(item.id, item.data()))),
      onError,
    );
  },

  subscribeInvitation(invitationId, onChange, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(doc(db, 'liveLessonInvitations', invitationId),
      (snapshot) => onChange(snapshot.exists() ? normalizeInvitation(snapshot.id, snapshot.data()) : null), onError);
  },

  // the observer's entry: active while the page is open (both sides show „Administraator vaatab tundi”)
  async setPresence(invitationId, user, active) {
    const { db } = requireFirebaseClient();
    const now = new Date().toISOString();
    await setDoc(doc(db, 'liveLessonInvitations', invitationId, 'observers', user.uid), {
      uid: user.uid,
      displayName: String(user.displayName || user.email || 'Administraator').slice(0, 160),
      active: Boolean(active),
      ...(active ? { joinedAt: now } : {}),
      lastSeen: serverTimestamp(),
      lastSeenIso: now,
    }, { merge: true });
  },

  subscribeObservers(invitationId, onChange, onError) {
    if (!invitationId) { onChange([]); return () => {}; }
    const { db } = requireFirebaseClient();
    return onSnapshot(collection(db, 'liveLessonInvitations', invitationId, 'observers'),
      (snapshot) => onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
      onError);
  },

  subscribeSignals(invitationId, toUid, onSignal, onError) {
    if (!invitationId || !toUid) return () => {};
    const { db } = requireFirebaseClient();
    return onSnapshot(
      query(collection(db, 'liveLessonInvitations', invitationId, 'observerSignals'), where('toUid', '==', toUid)),
      (snapshot) => snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') onSignal({ id: change.doc.id, ...change.doc.data() });
      }),
      onError,
    );
  },

  async sendSignal(invitationId, signal) {
    const type = String(signal?.type || '');
    if (!invitationId || !SIGNAL_TYPES.has(type) || !signal.sessionId || !signal.observerUid || !signal.fromUid || !signal.toUid) {
      throw new Error('Vaatleja signaal on vigane.');
    }
    const payload = JSON.stringify(signal.payload ?? {});
    if (payload.length > 64000) throw new Error('Vaatleja signaal on liiga suur.');
    const { db } = requireFirebaseClient();
    await addDoc(collection(db, 'liveLessonInvitations', invitationId, 'observerSignals'), {
      type,
      sessionId: String(signal.sessionId).slice(0, 120),
      observerUid: signal.observerUid,
      fromUid: signal.fromUid,
      toUid: signal.toUid,
      payload,
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
    });
  },
};
