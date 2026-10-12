import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// lessonChangeRequests/{id}: „Ei saa tulla?” — a student or parent asks to move one lesson; the teacher (or an admin)
// confirms one of the proposed times or declines; the asker may withdraw while it is pending. Rules: firestore.rules.
const chunks = (list) => Array.from({ length: Math.ceil(list.length / 10) }, (_, i) => list.slice(i * 10, i * 10 + 10));
const rows = (snapshot) => snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));

export const lessonChangeRequestsService = {
  async create(request) {
    const { db } = requireFirebaseClient();
    const reference = await addDoc(collection(db, 'lessonChangeRequests'), request);
    return { id: reference.id, ...request };
  },
  async listForStudents(studentIds = []) {
    const ids = [...new Set(studentIds.filter(Boolean))];
    if (!ids.length) return [];
    const { db } = requireFirebaseClient();
    const snapshots = await Promise.all(chunks(ids).map((part) => getDocs(query(collection(db, 'lessonChangeRequests'), where('studentId', 'in', part)))));
    return snapshots.flatMap(rows);
  },
  // the teacher's pending requests (an admin: everyone's), live for the calendar and the bell
  subscribePending({ teacherUid = '', all = false }, onData, onError) {
    const { db } = requireFirebaseClient();
    const base = collection(db, 'lessonChangeRequests');
    const q = all ? query(base, where('status', '==', 'pending')) : query(base, where('teacherUid', '==', teacherUid), where('status', '==', 'pending'));
    return onSnapshot(q, (snapshot) => onData(rows(snapshot)), onError);
  },
  async listPending({ teacherUid = '', all = false }) {
    const { db } = requireFirebaseClient();
    const base = collection(db, 'lessonChangeRequests');
    const q = all ? query(base, where('status', '==', 'pending')) : query(base, where('teacherUid', '==', teacherUid), where('status', '==', 'pending'));
    return rows(await getDocs(q));
  },
  async decide(id, { accepted, chosen = null, note = '', user }) {
    const { db } = requireFirebaseClient();
    await updateDoc(doc(db, 'lessonChangeRequests', id), {
      status: accepted ? 'accepted' : 'declined', chosen: accepted && chosen ? { date: chosen.date, time: chosen.time } : null,
      teacherNote: String(note || '').trim().slice(0, 300), decidedAt: new Date().toISOString(), decidedByUid: user.uid,
    });
  },
  async cancel(id) {
    const { db } = requireFirebaseClient();
    await updateDoc(doc(db, 'lessonChangeRequests', id), { status: 'cancelled', cancelledAt: new Date().toISOString() });
  },
};
