import { doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// The teacher's countdown timer of a Live Classroom room (features/live-classroom/countdown.js): the field `countdown`
// on `liveLessonInvitations/{id}` (1:1) or `liveGroupRooms/{id}` (group). The students of the room already read that
// doc; the rules let only its teacher write this one field. `updatedAt` is always the server time of the write.
const collectionFor = (kind) => (kind === 'group' ? 'liveGroupRooms' : 'liveLessonInvitations');

export const liveCountdownService = {
  // onChange(raw countdown | null, { fresh, pending, receivedAt }): `pending` = the own write not yet confirmed
  // (its server time is the local estimate)
  subscribe(kind, id, onChange, onError) {
    if (!id) { onChange(null, { pending: false, receivedAt: Date.now() }); return () => {}; }
    const { db } = requireFirebaseClient();
    return onSnapshot(doc(db, collectionFor(kind), id), { includeMetadataChanges: true }, (snapshot) => {
      const data = snapshot.exists() ? snapshot.data({ serverTimestamps: 'estimate' }) : null;
      onChange(data?.countdown || null, { pending: snapshot.metadata.hasPendingWrites, fromCache: snapshot.metadata.fromCache, receivedAt: Date.now() });
    }, onError);
  },

  // value from countdown.js (start / pause / resume / +1 min) or null (stop)
  async set(kind, id, value) {
    if (!id) throw new Error('Taimerit ei saa seada.');
    const { db } = requireFirebaseClient();
    await updateDoc(doc(db, collectionFor(kind), id), { countdown: value ? { ...value, updatedAt: serverTimestamp() } : null });
  },
};
