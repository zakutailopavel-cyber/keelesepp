import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { requireFirebaseClient } from './client.js';
import { cleanNote, isMonth, monologueAudioPath, monologueId, monologueRecord } from '../../features/monologue/monologueModel.js';

// „Kuu monoloog”: `studentMonologues/{studentId}_{YYYY-MM}` { studentId, studentUid, month, promptId, level, audioPath,
// contentType, seconds, createdAt, updatedAt } (+ later, from a transcriber: transcriptText, wordCount). The student
// account of the card writes and reads its own; the card's teacher and admins read. Parents: no access.
// The teacher's note lives apart, in `studentMonologueNotes/{monologueId}` { studentId, monologueId, text, byUid,
// byName, updatedAt }, which only staff can read, so the student never sees it (firestore.rules).
export function normalizeMonologue(id, data = {}) {
  return {
    id,
    studentId: data.studentId || '',
    studentUid: data.studentUid || '',
    month: data.month || '',
    promptId: data.promptId || '',
    level: data.level || '',
    audioPath: data.audioPath || '',
    contentType: data.contentType || '',
    seconds: Number(data.seconds) || 0,
    createdAt: data.createdAt || '',
    updatedAt: data.updatedAt || data.createdAt || '',
    ...(typeof data.transcriptText === 'string' ? { transcriptText: data.transcriptText } : {}),
    ...(Number.isFinite(data.wordCount) ? { wordCount: data.wordCount } : {}),
  };
}

const normalizeNote = (id, data = {}) => ({ id, studentId: data.studentId || '', text: data.text || '', byName: data.byName || '', updatedAt: data.updatedAt || '' });

export const studentMonologuesService = {
  // one card's recordings, newest month first (student: own card; staff: a card they may open)
  async listByStudent(studentId) {
    if (!studentId) return [];
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'studentMonologues'), where('studentId', '==', studentId)));
    return snapshot.docs.map((d) => normalizeMonologue(d.id, d.data())).sort((a, b) => b.month.localeCompare(a.month));
  },

  // the student sends this month's recording; a second take in the same month replaces the first (same file, same doc)
  async submit({ student, uid, month, level, blob, seconds, existing = null }) {
    if (!student?.id || !uid) throw new Error('Õpilast ei leitud.');
    if (!isMonth(month)) throw new Error('Kuu on vale.');
    const type = String(blob?.type || '').split(';')[0];
    if (!type.startsWith('audio/')) throw new Error('Salvestus ei ole helifail.');
    if (!blob.size) throw new Error('Salvestus jäi tühjaks. Proovi uuesti.');
    if (blob.size > 9.5 * 1024 * 1024) throw new Error('Salvestus on liiga suur.');
    const { db, storage } = requireFirebaseClient();
    const audioPath = monologueAudioPath(student.id, month, type);
    const storageRef = ref(storage, audioPath);
    await new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, blob, { contentType: type });
      task.on('state_changed', null, reject, resolve);
    });
    const record = monologueRecord({ student, uid, month, level, audioPath, contentType: type, seconds });
    const id = monologueId(student.id, month);
    if (existing) {
      // only the take changes; createdAt and the owner stay
      const { audioPath: path, contentType, seconds: secs, promptId, level: lvl, updatedAt } = record;
      await setDoc(doc(db, 'studentMonologues', id), { audioPath: path, contentType, seconds: secs, promptId, level: lvl, updatedAt }, { merge: true });
      return normalizeMonologue(id, { ...existing, ...record, createdAt: existing.createdAt });
    }
    await setDoc(doc(db, 'studentMonologues', id), record);
    return normalizeMonologue(id, record);
  },

  async audioUrl(audioPath) {
    if (!audioPath) throw new Error('Salvestust ei leitud.');
    const { storage } = requireFirebaseClient();
    return getDownloadURL(ref(storage, audioPath));
  },

  // staff only: the teacher's notes of one card, by monologue id
  async listNotes(studentId) {
    if (!studentId) return {};
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'studentMonologueNotes'), where('studentId', '==', studentId)));
    return Object.fromEntries(snapshot.docs.map((d) => [d.id, normalizeNote(d.id, d.data())]));
  },

  // an empty note removes it
  async saveNote({ monologue, text, user }) {
    if (!monologue?.id || !monologue.studentId) throw new Error('Salvestust ei leitud.');
    const { db } = requireFirebaseClient();
    const note = cleanNote(text);
    const target = doc(db, 'studentMonologueNotes', monologue.id);
    if (!note) { await deleteDoc(target); return null; }
    const data = { studentId: monologue.studentId, monologueId: monologue.id, text: note, byUid: user?.uid || '', byName: String(user?.displayName || user?.email || 'Õpetaja').slice(0, 160), updatedAt: new Date().toISOString() };
    await setDoc(target, data);
    return normalizeNote(monologue.id, data);
  },
};
