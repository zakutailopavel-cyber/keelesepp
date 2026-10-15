import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// lessonNotes/{scheduleId} (every lesson of the series) or {scheduleId}_{date} (one lesson): the administrator's note
// on a calendar lesson (Oleksiy 2026-10-15). Only the administrator writes it; the administrator and the lesson's
// teacher read it (rules) — students and parents, who can read their schedule entries, never see it. Kept out of the
// schedule document for that reason.
export const noteId = (scheduleId, date = '') => `${scheduleId}${date ? `_${date}` : ''}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 200);

export const lessonNotesService = {
  // an administrator reads all notes, a teacher the notes of their lessons
  async list({ teacherUid = '' } = {}) {
    const { db } = requireFirebaseClient();
    const reference = collection(db, 'lessonNotes');
    const snapshot = await getDocs(teacherUid ? query(reference, where('teacherUid', '==', teacherUid)) : reference);
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
  },
  // an empty text removes the note
  async save({ scheduleId, date = '', teacherUid = '', studentName = '', text, user }) {
    if (!scheduleId) throw new Error('Tund puudub.');
    const { db } = requireFirebaseClient();
    const reference = doc(db, 'lessonNotes', noteId(scheduleId, date));
    const value = String(text || '').trim().slice(0, 1000);
    if (!value) { await deleteDoc(reference); return null; }
    const note = {
      scheduleId,
      date,
      teacherUid: teacherUid || '',
      studentName: String(studentName || '').slice(0, 160),
      text: value,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.uid || '',
      updatedByName: String(user?.displayName || user?.email || '').slice(0, 160),
    };
    await setDoc(reference, note);
    return { id: reference.id, ...note };
  },
};

// the notes that belong to one calendar occurrence: the series note and the note of that date
export function notesFor(notes = [], item = {}) {
  if (!item?.id) return [];
  const series = notes.find((note) => note.id === noteId(item.id));
  const day = item.occurrenceDate ? notes.find((note) => note.id === noteId(item.id, item.occurrenceDate)) : null;
  return [day, series].filter(Boolean);
}
