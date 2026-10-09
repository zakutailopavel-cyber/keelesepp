import { getDocs, collection, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { cleanWord, normalizeWord, review } from '../../features/vocabulary/wordsModel.js';

// `studentWords/{id}`: the student's own word list. Staff add and edit words (also during a Live Classroom lesson,
// then with `invitationId`); the student or a linked parent reads them and writes only the practice fields.
export const studentWordsService = {
  subscribeForStudent(studentId, onData, onError) {
    if (!studentId) { onData([]); return () => {}; }
    const { db } = requireFirebaseClient();
    return onSnapshot(query(collection(db, 'studentWords'), where('studentId', '==', studentId)),
      (snapshot) => onData(snapshot.docs.map((d) => normalizeWord(d.id, d.data()))), (error) => onError?.(error));
  },

  // one read of the student's words (the personal worksheet takes the due ones)
  async listForStudent(studentId) {
    if (!studentId) return [];
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'studentWords'), where('studentId', '==', studentId)));
    return snapshot.docs.map((d) => normalizeWord(d.id, d.data()));
  },

  async add({ studentId, invitationId = '', user, ...input }) {
    const data = cleanWord(input);
    if (!studentId) throw new Error('Õpilane puudub.');
    if (!data.word) throw new Error('Kirjuta sõna.');
    const { db } = requireFirebaseClient();
    const ref = doc(collection(db, 'studentWords'));
    const now = new Date().toISOString();
    const record = {
      studentId, invitationId: String(invitationId || ''), ...data,
      createdByUid: user.uid, createdByName: String(user.displayName || user.email || '').slice(0, 160),
      createdAt: now, updatedAt: now, box: 0, dueAt: now,
    };
    await setDoc(ref, record);
    return normalizeWord(ref.id, record);
  },

  async update(id, input) {
    const data = cleanWord(input);
    if (!data.word) throw new Error('Kirjuta sõna.');
    const { db } = requireFirebaseClient();
    await updateDoc(doc(db, 'studentWords', id), { ...data, updatedAt: new Date().toISOString() });
  },

  async remove(id) {
    const { db } = requireFirebaseClient();
    await deleteDoc(doc(db, 'studentWords', id));
  },

  async review(word, knew) {
    const { db } = requireFirebaseClient();
    const patch = review(word, knew);
    await updateDoc(doc(db, 'studentWords', word.id), patch);
    return patch;
  },
};
