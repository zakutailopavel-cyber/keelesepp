import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { normalizeNote } from '../../features/board/bookmarkModel.js';

// `studentNotes/{id}`: the student's notes from lessons, shown in „Minu vead” → „Märkmed tunnist”. Written from the
// board's „Järjehoidja / Kleebis” (features/board/bookmarkModel.js noteRecord) by staff or the student / a linked
// parent; the author or staff change and delete it (firestore.rules).
export const studentNotesService = {
  subscribeForStudent(studentId, onData, onError) {
    if (!studentId) { onData([]); return () => {}; }
    const { db } = requireFirebaseClient();
    return onSnapshot(query(collection(db, 'studentNotes'), where('studentId', '==', studentId)),
      (snapshot) => onData(snapshot.docs.map((d) => normalizeNote(d.id, d.data()))), (error) => onError?.(error));
  },
  async add(record) {
    const { db } = requireFirebaseClient();
    const ref = await addDoc(collection(db, 'studentNotes'), record);
    return ref.id;
  },
  async update(id, patch) {
    const { db } = requireFirebaseClient();
    await updateDoc(doc(db, 'studentNotes', id), patch);
  },
  async remove(id) {
    const { db } = requireFirebaseClient();
    await deleteDoc(doc(db, 'studentNotes', id));
  },
};
