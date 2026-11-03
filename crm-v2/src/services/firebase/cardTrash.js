import { collection, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

/*
 * „Prügikast” (administrator 2026-11-03): student and teacher cards deleted by the administrator wait here 7 days.
 * Putting a card in the trash, restoring it and the purge run on the server (staffOperationsApi /cards/*,
 * functions/card-trash.js) — it checks the lessons ahead and writes the audit entry. This client only reads the trash
 * (the administrator may read students and users) and calls those endpoints. Contract: ARCHITECTURE.md „Card trash”.
 */

const defaultApiUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/staffOperationsApi';

async function post(path, body = {}) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub. Logi uuesti sisse.');
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(import.meta.env.VITE_STAFF_OPERATIONS_API_URL || defaultApiUrl).replace(/\/$/, '');
  const response = await globalThis.fetch(`${baseUrl}/cards${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Päring ebaõnnestus.');
  return data;
}

// a card in the trash (not yet purged) and a purged (anonymised) one
export const inTrash = (card) => Boolean(card?.deletedAt) && !card?.purgedAt;
export const isDeletedCard = (card) => Boolean(card?.deletedAt || card?.purgedAt);

export function trashItem(kind, id, data = {}) {
  return {
    kind,
    id,
    name: kind === 'teacher' ? (data.displayName || data.name || data.email || 'Nimetu') : (data.name || 'Nimetu'),
    detail: kind === 'teacher' ? (data.email || '') : [data.subject, data.level, data.teacher].filter(Boolean).join(' · '),
    deletedAt: data.deletedAt || '',
    deletedBy: data.deletedBy?.name || '',
    purgeAfter: data.purgeAfter || '',
    purgedAt: data.purgedAt || '',
    purgeBlocked: data.purgeBlocked || '',
  };
}

const byPurgeDate = (a, b) => String(a.purgeAfter || a.purgedAt).localeCompare(String(b.purgeAfter || b.purgedAt));

export const cardTrashService = {
  // everything waiting in the trash (purgeAfter set) and the purged cards kept for history
  async list() {
    const { db } = requireFirebaseClient();
    const [students, users, purgedStudents, purgedUsers] = await Promise.all([
      getDocs(query(collection(db, 'students'), where('purgeAfter', '>=', ''))),
      getDocs(query(collection(db, 'users'), where('purgeAfter', '>=', ''))),
      getDocs(query(collection(db, 'students'), where('purgedAt', '>=', ''))),
      getDocs(query(collection(db, 'users'), where('purgedAt', '>=', ''))),
    ]);
    const waiting = [
      ...students.docs.map((item) => trashItem('student', item.id, item.data())),
      ...users.docs.map((item) => trashItem('teacher', item.id, item.data())),
    ].filter((item) => !item.purgedAt).sort(byPurgeDate);
    const purged = [
      ...purgedStudents.docs.map((item) => trashItem('student', item.id, item.data())),
      ...purgedUsers.docs.map((item) => trashItem('teacher', item.id, item.data())),
    ].sort((a, b) => String(b.purgedAt).localeCompare(String(a.purgedAt)));
    return { waiting, purged };
  },
  trash(kind, id) { return post('/trash', { kind, id }); },
  restore(kind, id) { return post('/restore', { kind, id }); },
  purgeDue() { return post('/purge-due'); },
};
