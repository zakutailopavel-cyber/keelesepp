import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

const SIGNAL_TYPES = new Set(['offer', 'answer', 'candidate', 'hangup']);
const clean = (value) => String(value ?? '').trim();

export const liveLessonCallSignalsService = {
  subscribe(invitationId, onSignal, onError) {
    if (!invitationId) return () => {};
    const { db } = requireFirebaseClient();
    return onSnapshot(
      query(collection(db, 'liveLessonInvitations', invitationId, 'signals')),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type !== 'added') return;
          onSignal({ id: change.doc.id, ...change.doc.data() });
        });
      },
      onError,
    );
  },

  async send(invitationId, signal) {
    const type = clean(signal?.type);
    const sessionId = clean(signal?.sessionId);
    const senderUid = clean(signal?.senderUid);
    const senderRole = clean(signal?.senderRole);
    if (!invitationId || !SIGNAL_TYPES.has(type) || !sessionId || !senderUid || !['teacher', 'student'].includes(senderRole)) {
      throw new Error('Videokõne signaal on vigane.');
    }
    const payload = JSON.stringify(signal?.payload ?? {});
    if (payload.length > 64000) throw new Error('Videokõne signaal on liiga suur.');
    const { db } = requireFirebaseClient();
    await addDoc(collection(db, 'liveLessonInvitations', invitationId, 'signals'), {
      type,
      sessionId,
      senderUid,
      senderRole,
      payload,
      createdAt: serverTimestamp(),
      createdAtIso: new Date().toISOString(),
    });
  },
};
