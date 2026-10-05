import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// Admin data cleanup („Seaded → Andmete korrastus”): small batched writes on records the admin ticked.
// Every action is logged in activityLog.

async function inBatches(entries, apply) {
  const { db } = requireFirebaseClient();
  let batch = writeBatch(db);
  let pending = 0;
  for (const entry of entries) {
    apply(batch, db, entry);
    pending += 1;
    if (pending >= 400) { await batch.commit(); batch = writeBatch(db); pending = 0; }
  }
  if (pending) await batch.commit();
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
    });
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    log(batch, db, user, 'maintenance.lesson_topics_cleared', `Tühjendati ${lessons.length} tunni teema „Uus tööleht”`, { lessonIds: lessons.map((item) => item.id).slice(0, 200) });
    await batch.commit();
  },

  // old homework nobody will do any more → „Suletud” (not done, just no longer open)
  async closeHomework(items, user) {
    const now = new Date().toISOString();
    await inBatches(items, (batch, db, item) => {
      batch.update(doc(db, 'homework', item.id), { status: 'Suletud', closedAt: now, closedBy: user?.uid || '', updatedAt: now });
    });
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    log(batch, db, user, 'maintenance.homework_closed', `Suleti ${items.length} vana kodutööd`, { homeworkIds: items.map((item) => item.id).slice(0, 200) });
    await batch.commit();
  },

  // test conversations: their messages are deleted (admin only by the rules)
  async deleteMessages(messageIds, user, label = '') {
    await inBatches(messageIds, (batch, db, id) => { batch.delete(doc(db, 'messages', id)); });
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    log(batch, db, user, 'maintenance.messages_deleted', `Kustutati testvestlused (${messageIds.length} sõnumit)${label ? `: ${label}` : ''}`, { messageIds: messageIds.slice(0, 200) });
    await batch.commit();
  },
};
