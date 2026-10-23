import { getDocs, collection, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
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

  // the words of many cards at once (the school's retention view): 30 ids per query, as Firestore allows
  async listForStudentIds(studentIds = []) {
    const ids = [...new Set(studentIds.filter(Boolean))];
    if (!ids.length) return [];
    const { db } = requireFirebaseClient();
    const chunks = [];
    for (let index = 0; index < ids.length; index += 30) chunks.push(ids.slice(index, index + 30));
    const snapshots = await Promise.all(chunks.map((chunk) => getDocs(query(collection(db, 'studentWords'), where('studentId', 'in', chunk)))));
    return snapshots.flatMap((snapshot) => snapshot.docs.map((d) => normalizeWord(d.id, d.data())));
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

  // the words of a passed „Teemad” topic, each under its fixed id (lessonWordId), written in batches (Firestore allows
  // 500 writes per batch). Create only: the rules let the student create words with box 0 and the usual keys.
  // `items`: [{ id, word, translation, example }]
  async addLessonWords({ studentId, items = [], user }) {
    if (!studentId) throw new Error('Õpilane puudub.');
    const { db } = requireFirebaseClient();
    const now = new Date().toISOString();
    const records = items.map(({ id, ...input }) => {
      const data = cleanWord(input);
      if (!id || !data.word) throw new Error('Kirjuta sõna.');
      return [id, {
        studentId, invitationId: '', ...data,
        createdByUid: user.uid, createdByName: String(user.displayName || user.email || '').slice(0, 160),
        createdAt: now, updatedAt: now, box: 0, dueAt: now,
      }];
    });
    for (let start = 0; start < records.length; start += 400) {
      const batch = writeBatch(db);
      records.slice(start, start + 400).forEach(([id, record]) => batch.set(doc(db, 'studentWords', id), record));
      await batch.commit();
    }
    return records.map(([id, record]) => normalizeWord(id, record));
  },

  // a submitted worksheet's errors as the student's own sentence cards (engine/errorCards.js); a sentence he already has
  // is not added twice. Practice only: a failure never stops the submission.
  async addSheetErrors({ studentId, cards = [], user }) {
    if (!studentId || !cards.length) return 0;
    const existing = await this.listForStudent(studentId);
    const have = new Set(existing.map((word) => String(word.word || '').trim().toLocaleLowerCase('et')));
    const fresh = cards.filter((card) => !have.has(String(card.word).trim().toLocaleLowerCase('et')));
    for (const card of fresh) await this.add({ studentId, invitationId: '', user, ...card });
    return fresh.length;
  },

  // the student keeps a word from a course deck for repetition („Lisa raskemad minu sõnadesse”)
  async addOwn({ studentId, user, ...input }) {
    return this.add({ studentId, invitationId: '', user, ...cleanWord(input) });
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
