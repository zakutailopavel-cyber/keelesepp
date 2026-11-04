import { doc, collection, onSnapshot, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { normalizeAnswer, normalizePoll, pollIdFor } from '../../features/live-classroom/quickPoll.js';

// „Kiirküsimus” of a Live Classroom room (features/live-classroom/quickPoll.js): `livePolls/{kind}_{roomId}` (read by
// the room's teacher and students), the right option in the teacher-only `livePolls/{id}/key/current`, one answer per
// student `livePolls/{id}/answers/{uid}` (the student writes only his own; the teacher reads all). firestore.rules
// check that only the room's teacher asks, only while the room is live, and that an answer belongs to the open round.
const pollRef = (db, kind, roomId) => doc(db, 'livePolls', pollIdFor(kind, roomId));

export const livePollsService = {
  subscribe(kind, roomId, onChange, onError) {
    if (!roomId) { onChange(null); return () => {}; }
    const { db } = requireFirebaseClient();
    return onSnapshot(pollRef(db, kind, roomId), (snapshot) => onChange(snapshot.exists() ? normalizePoll(snapshot.data()) : null), onError);
  },

  // the teacher: every answer of the room's students
  subscribeAnswers(kind, roomId, onChange, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(collection(pollRef(db, kind, roomId), 'answers'), (snapshot) => onChange(snapshot.docs.map((item) => normalizeAnswer(item.id, item.data()))), onError);
  },

  // a student: only his own answer
  subscribeMyAnswer(kind, roomId, uid, onChange, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(doc(pollRef(db, kind, roomId), 'answers', uid), (snapshot) => onChange(snapshot.exists() ? normalizeAnswer(snapshot.id, snapshot.data()) : null), onError);
  },

  // the teacher: the right option of the current round
  subscribeKey(kind, roomId, onChange, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(doc(pollRef(db, kind, roomId), 'key', 'current'), (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : null;
      onChange(data && Number.isInteger(data.round) && Number.isInteger(data.correctIndex) ? { round: data.round, correctIndex: data.correctIndex } : null);
    }, onError);
  },

  // a new question (round): the poll and its key in one batch
  async start({ kind, roomId, participantUids, draft, round, user }) {
    if (!roomId || !draft) throw new Error('Kiirküsimust ei saa alustada.');
    const { db } = requireFirebaseClient();
    const reference = pollRef(db, kind, roomId);
    const batch = writeBatch(db);
    batch.set(reference, {
      kind: kind === 'group' ? 'group' : 'lesson',
      roomId,
      teacherUid: user.uid,
      participantUids: [...participantUids],
      round,
      mode: draft.mode,
      question: draft.question,
      sentence: draft.sentence,
      options: draft.options,
      timeLimitSec: draft.timeLimitSec,
      status: 'open',
      correctIndex: -1,
      startedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(reference, 'key', 'current'), { teacherUid: user.uid, round, correctIndex: draft.correctIndex });
    await batch.commit();
  },

  // „Näita vastust”: the students see the right option
  async reveal(kind, roomId, correctIndex) {
    const { db } = requireFirebaseClient();
    await updateDoc(pollRef(db, kind, roomId), { status: 'revealed', correctIndex, updatedAt: serverTimestamp() });
  },

  async close(kind, roomId) {
    const { db } = requireFirebaseClient();
    await updateDoc(pollRef(db, kind, roomId), { status: 'closed', updatedAt: serverTimestamp() });
  },

  // a student's answer (he may change it until the answer is shown)
  async answer({ kind, roomId, round, choice, user, name = '' }) {
    const { db } = requireFirebaseClient();
    await setDoc(doc(pollRef(db, kind, roomId), 'answers', user.uid), {
      uid: user.uid,
      name: String(name || user.displayName || '').trim().slice(0, 160),
      round,
      choice,
      answeredAt: serverTimestamp(),
    });
  },
};
