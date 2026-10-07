import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// Admin data cleanup („Seaded → Andmete korrastus”): small batched writes on records the admin ticked.
// Every action is logged in activityLog.

async function inBatches(entries, apply, audit) {
  const { db } = requireFirebaseClient();
  for (let offset = 0; offset < entries.length; offset += 400) {
    const chunk = entries.slice(offset, offset + 400);
    const batch = writeBatch(db);
    for (const entry of chunk) apply(batch, db, entry);
    // Each committed chunk carries its own audit; partial completion is visible if a later chunk fails.
    audit(batch, db, chunk);
    await batch.commit();
  }
}

function log(batch, db, user, type, label, meta) {
  const now = new Date().toISOString();
  batch.set(doc(collection(db, 'activityLog')), { type, label, byUid: user?.uid || '', byName: user?.displayName || user?.email || '', byRole: 'admin', createdAt: now, date: now.slice(0, 10), meta });
}

export const maintenanceService = {
  async listLessons() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'lessons'));
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
  },

  // a placeholder worksheet title written as the lesson topic („Uus tööleht”) → empty topic
  async clearLessonTopics(lessons, user) {
    const now = new Date().toISOString();
    await inBatches(lessons, (batch, db, lesson) => {
      batch.update(doc(db, 'lessons', lesson.id), { topic: '', updatedAt: now, updatedByUid: user?.uid || '', updatedByName: user?.displayName || '' });
    }, (batch, db, chunk) => log(batch, db, user, 'maintenance.lesson_topics_cleared', `Tühjendati ${chunk.length} tunni teema „Uus tööleht”`, { lessonIds: chunk.map((item) => item.id) }));
  },

  // old homework nobody will do any more → „Suletud” (not done, just no longer open)
  async closeHomework(items, user) {
    const now = new Date().toISOString();
    await inBatches(items, (batch, db, item) => {
      batch.update(doc(db, 'homework', item.id), { status: 'Suletud', closedAt: now, closedBy: user?.uid || '', updatedAt: now });
    }, (batch, db, chunk) => log(batch, db, user, 'maintenance.homework_closed', `Suleti ${chunk.length} vana kodutööd`, { homeworkIds: chunk.map((item) => item.id) }));
  },

  // test conversations: their messages are deleted (admin only by the rules)
  async deleteMessages(messageIds, user, label = '') {
    await inBatches(messageIds, (batch, db, id) => { batch.delete(doc(db, 'messages', id)); },
      (batch, db, chunk) => log(batch, db, user, 'maintenance.messages_deleted', `Kustutati testvestlused (${chunk.length} sõnumit)${label ? `: ${label}` : ''}`, { messageIds: chunk }));
  },
};
