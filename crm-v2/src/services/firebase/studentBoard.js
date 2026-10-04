import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// The student's own board outside lessons: the same data as the CRM v1 board (whiteboards/{studentId}/elements and
// lesson pages whiteboards/{studentId}/lessonPages/{pageId}/elements), so everything drawn in v1 stays and both CRMs
// see the same board. Element shapes and access are enforced by the existing Firestore rules.
const makeClientId = () => globalThis.crypto?.randomUUID?.() || `sb-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const authorName = (user = {}) => String(user.displayName || user.email || 'Kasutaja').trim().slice(0, 160);

// `root`: 'whiteboards' (a student's board, keyed by student id) or 'groupBoards' (a group lesson, keyed by room id)
const elementsRefIn = (root) => (db, studentId, pageId) => {
  return pageId
    ? collection(db, root, studentId, 'lessonPages', pageId, 'elements')
    : collection(db, root, studentId, 'elements');
};

function timeOf(value) {
  return value?.toMillis?.() || Date.parse(value || '') || 0;
}

export function createBoardService(root = 'whiteboards') {
  const elementsRef = elementsRefIn(root);
  return {
  subscribeElements(studentId, pageId, onChange, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(elementsRef(db, studentId, pageId), (snapshot) => {
      onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => timeOf(a.updatedAt) - timeOf(b.updatedAt) || a.id.localeCompare(b.id)));
    }, onError);
  },
  subscribePages(studentId, onChange, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(collection(db, root, studentId, 'lessonPages'), (snapshot) => {
      onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
        .filter((page) => !page.isSnapshot)
        .sort((a, b) => (a.order || 0) - (b.order || 0)));
    }, onError);
  },
  async add(studentId, pageId, data, user) {
    const { db } = requireFirebaseClient();
    const reference = await addDoc(elementsRef(db, studentId, pageId), {
      ...data,
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
      updatedByName: authorName(user),
      lastClientId: makeClientId(),
      revision: 1,
    });
    return reference.id;
  },
  async update(studentId, pageId, element, patch, user) {
    const { db } = requireFirebaseClient();
    await updateDoc(doc(elementsRef(db, studentId, pageId), element.id), {
      ...patch,
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
      updatedByName: authorName(user),
      lastClientId: makeClientId(),
      revision: (Number(element.revision) || 0) + 1,
    });
  },
  // A lesson page (same shape as CRM v1 lesson pages, validLessonPage in the rules). Staff and the board's own
  // student/parent may create one (a separate sheet for an explanation or homework).
  async addPage(studentId, title, order, user) {
    const { db } = requireFirebaseClient();
    const reference = await addDoc(collection(db, root, studentId, 'lessonPages'), {
      title: String(title || 'Tund').trim().slice(0, 200) || 'Tund',
      order: Math.max(1, Math.round(Number(order) || 1)),
      status: 'active',
      isSnapshot: false,
      snapshotOf: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
      updatedByName: authorName(user),
    });
    return reference.id;
  },
  async renamePage(studentId, pageId, title, user) {
    const value = String(title || '').trim().slice(0, 200);
    if (!value) throw new Error('Lehel peab olema nimi.');
    const { db } = requireFirebaseClient();
    await updateDoc(doc(db, root, studentId, 'lessonPages', pageId), {
      title: value,
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
      updatedByName: authorName(user),
    });
    return value;
  },
  async remove(studentId, pageId, elementId) {
    const { db } = requireFirebaseClient();
    await deleteDoc(doc(elementsRef(db, studentId, pageId), elementId));
  },
  // Teacher's "Tühjenda": removes every unlocked element of the page (locked materials stay, as in v1).
  async clear(studentId, pageId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(elementsRef(db, studentId, pageId));
    const removable = snapshot.docs.filter((item) => item.data().locked !== true);
    for (let offset = 0; offset < removable.length; offset += 400) {
      const batch = writeBatch(db);
      removable.slice(offset, offset + 400).forEach((item) => batch.delete(item.ref));
      await batch.commit();
    }
    return removable.length;
  },
};
}

export const studentBoardService = createBoardService('whiteboards');
export const groupBoardService = createBoardService('groupBoards');
