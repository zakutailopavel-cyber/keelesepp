import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, runTransaction, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import './storageClient.js';
import { requireFirebaseClient } from './client.js';
import { fileToJpegBlob } from '../../features/worksheet-studio/engine/image.js';
import { copyableElement, lessonCopyId } from '../../features/board/lessonBoards.js';
import { worksheetPageId } from '../../features/board/boardModel.js';

// stable page id of a worksheet title (boardModel.js; also used to find the sheet behind a page)
export { worksheetPageId };

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
  // the board's kind: a group board ('groupBoards') belongs to no single student (no notes for „Minu vead”)
  root,
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
  // the board's lesson pages once (not snapshots), e.g. to copy a group board when the lesson ends
  async listPages(studentId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, root, studentId, 'lessonPages'));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      .filter((page) => !page.isSnapshot)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
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
  // a worksheet's page has a fixed id from its title, so opening the sheet again (another tab, a reload before the
  // page list arrived, teacher and student at once) finds the same page instead of adding a copy (owner 2026-10-12:
  // three tabs „Tööleht: Loodus ja tegevused”)
  async addWorksheetPage(studentId, title, order, user) {
    const { db } = requireFirebaseClient();
    const clean = String(title || 'Tööleht').trim().slice(0, 200) || 'Tööleht';
    const reference = doc(db, root, studentId, 'lessonPages', worksheetPageId(clean));
    await runTransaction(db, async (transaction) => {
      if ((await transaction.get(reference)).exists()) return;
      transaction.set(reference, {
        title: clean, order: Math.max(1, Math.round(Number(order) || 1)), status: 'active', isSnapshot: false, snapshotOf: null,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedByUid: user.uid, updatedByName: authorName(user),
      });
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
  // Staff remove a lesson page (e.g. an empty or doubled one): its elements first, then the page. A locked material the
  // rules keep is left behind unseen; completed lesson records stay (firestore.rules refuse them).
  async deletePage(studentId, pageId) {
    if (!pageId) throw new Error('Tahvlit ennast ei saa kustutada.');
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(elementsRef(db, studentId, pageId));
    await Promise.allSettled(snapshot.docs.map((item) => deleteDoc(item.ref)));
    await deleteDoc(doc(db, root, studentId, 'lessonPages', pageId));
  },
  // The paper of each page: { board: 'lines', <pageId>: 'grid' } on the board document (dots when not set).
  subscribeBackgrounds(studentId, onChange, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(doc(db, root, studentId), (snapshot) => onChange(snapshot.exists() ? snapshot.data().backgrounds || {} : {}), onError);
  },
  async setBackground(studentId, pageKey, value, user) {
    const { db } = requireFirebaseClient();
    await setDoc(doc(db, root, studentId), {
      backgrounds: { [pageKey]: value },
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
      updatedByName: authorName(user),
    }, { merge: true });
  },
  // A student's (or parent's) own photo for the board, e.g. a notebook page: made a JPEG of at most 1600 px and
  // stored in the board's student folder (the only place the rules let a student's picture come from).
  async uploadStudentImage(studentId, file) {
    if (root !== 'whiteboards') throw new Error('Pilti saab lisada ainult õpilase tahvlile.');
    if (!String(file?.type || '').startsWith('image/')) throw new Error('Vali pildifail.');
    const { storage } = requireFirebaseClient();
    const { blob } = await fileToJpegBlob(file);
    const name = String(file.name || 'pilt').normalize('NFKD').replace(/[^\w.-]+/g, '-').replace(/\.[^.]+$/, '').slice(-40) || 'pilt';
    const storagePath = `whiteboards/${studentId}/student/${Date.now()}_${name}.jpg`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
    return { url: await getDownloadURL(storageRef), storagePath };
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

// „Tunni tahvlid” (features/board/lessonBoards.js): read-only copies of a lesson's board pages on the student's own
// board (snapshot pages `whiteboards/{studentId}/lessonPages/lb-<lessonKey>-<n>`), made by the teacher when the lesson
// ends and read by the student and linked parents.
const COPY_BATCH = 100;
export const lessonCopiesService = {
  // pages: [{ id ('' = the main board), title }] of the source board `${sourceRoot}/${sourceId}`
  async save({ studentId, sourceRoot = 'whiteboards', sourceId, pages = [], lessonKey, titlePrefix = '', user }) {
    if (!studentId || !sourceId || !lessonKey) throw new Error('Tahvli koopiat ei saa teha.');
    const { db } = requireFirebaseClient();
    const name = authorName(user);
    const saved = [];
    for (const [index, page] of pages.entries()) {
      const copyId = lessonCopyId(lessonKey, index);
      const pageRef = doc(db, 'whiteboards', studentId, 'lessonPages', copyId);
      const existing = await getDoc(pageRef);
      if (existing.exists() && existing.data().status === 'completed') { saved.push(copyId); continue; }
      const source = await getDocs(elementsRefIn(sourceRoot)(db, sourceId, page.id || ''));
      // drawing order of the lesson (oldest first); the copy keeps it in `revision` (all copies are written at once)
      const elements = source.docs.map((item) => ({ id: item.id, at: timeOf(item.data().updatedAt), data: copyableElement(item.data()) }))
        .filter((item) => item.data).sort((a, b) => a.at - b.at || a.id.localeCompare(b.id)).map((item, position) => ({ ...item, position }));
      if (!existing.exists()) {
        if (!elements.length) continue; // an empty page is not worth a copy
        await setDoc(pageRef, {
          title: `${titlePrefix}${page.title || 'Leht'}`.trim().slice(0, 200) || 'Tund',
          order: index + 1, status: 'active', isSnapshot: true, snapshotOf: (page.id || 'board').slice(0, 200),
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedByUid: user.uid, updatedByName: name,
        });
      }
      const elementsRef = collection(pageRef, 'elements');
      // a retry after an error: only what is still missing (a snapshot's elements cannot be changed)
      const have = existing.exists() ? new Set((await getDocs(elementsRef)).docs.map((item) => item.id)) : new Set();
      const missing = elements.filter((item) => !have.has(item.id));
      for (let offset = 0; offset < missing.length; offset += COPY_BATCH) {
        const batch = writeBatch(db);
        missing.slice(offset, offset + COPY_BATCH).forEach((item) => batch.set(doc(elementsRef, item.id), {
          ...item.data, updatedAt: serverTimestamp(), updatedByUid: user.uid, updatedByName: name, revision: item.position + 1,
        }));
        await batch.commit();
      }
      // completed: nobody changes or deletes it any more (firestore.rules)
      await updateDoc(pageRef, { status: 'completed', updatedAt: serverTimestamp(), updatedByUid: user.uid, updatedByName: name });
      saved.push(copyId);
    }
    return saved;
  },

  // the student's lesson copies (snapshot pages), for „Tunni tahvlid”
  subscribe(studentId, onChange, onError) {
    if (!studentId) { onChange([]); return () => {}; }
    const { db } = requireFirebaseClient();
    return onSnapshot(query(collection(db, 'whiteboards', studentId, 'lessonPages'), where('isSnapshot', '==', true)),
      (snapshot) => onChange(snapshot.docs.map((item) => ({ id: item.id, studentId, ...item.data() }))), onError);
  },

  async listElements(studentId, pageId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'whiteboards', studentId, 'lessonPages', pageId, 'elements'));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => (Number(a.revision) || 0) - (Number(b.revision) || 0) || a.id.localeCompare(b.id));
  },
};
