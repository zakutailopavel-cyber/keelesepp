import { collection, doc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// „Teated” (owner 2026-10-24). The administrator writes `announcements/{id}` here (firestore.rules: admin only).
// Learners and parents never read Firestore for this: their own announcements and their answers go through
// staffOperationsApi /announcements/* (functions/announcements-service.js), which matches the audience on the server.
const clean = (value, max = 200) => String(value ?? '').trim().slice(0, max);
const dateOf = (value) => (typeof value?.toDate === 'function' ? value.toDate().toISOString() : clean(value, 40));
const list = (value, max = 500) => (Array.isArray(value) ? value.map((item) => clean(item, 128)).filter(Boolean).slice(0, max) : []);

export function normalizeAnnouncement(id, data = {}) {
  const mode = ['text', 'single', 'multiple'].includes(data.question?.mode) ? data.question.mode : 'text';
  return {
    id,
    title: clean(data.title),
    body: clean(data.body, 5000),
    audience: ['students', 'parents', 'both'].includes(data.audience) ? data.audience : 'both',
    subjects: list(data.subjects, 20),
    levels: list(data.levels, 20),
    studentIds: list(data.studentIds),
    activeFrom: clean(data.activeFrom, 10),
    activeTo: clean(data.activeTo, 10),
    responseType: ['read', 'question', 'availability'].includes(data.responseType) ? data.responseType : 'read',
    question: { mode, options: mode === 'text' ? [] : list(data.question?.options, 12), allowOther: mode !== 'text' && data.question?.allowOther === true },
    allowChange: data.allowChange === true,
    status: ['draft', 'published', 'archived'].includes(data.status) ? data.status : 'draft',
    createdAt: dateOf(data.createdAt),
    createdByUid: clean(data.createdByUid, 128),
    createdByName: clean(data.createdByName),
    publishedAt: dateOf(data.publishedAt),
    updatedAt: dateOf(data.updatedAt),
  };
}

// the stored fields of a form (firestore.rules announcementValid)
function recordOf(form) {
  const mode = form.responseType === 'question' ? form.question.mode : 'text';
  return {
    title: clean(form.title),
    body: clean(form.body, 5000),
    audience: form.audience,
    subjects: list(form.subjects, 20),
    levels: list(form.levels, 20),
    studentIds: list(form.studentIds),
    activeFrom: clean(form.activeFrom, 10),
    activeTo: clean(form.activeTo, 10),
    responseType: form.responseType,
    question: form.responseType === 'question'
      ? { mode, options: mode === 'text' ? [] : list(form.question.options, 12), allowOther: mode !== 'text' && form.question.allowOther === true }
      : { mode: 'text', options: [], allowOther: false },
    allowChange: form.allowChange === true,
  };
}

const defaultApiUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/staffOperationsApi';
async function post(path, body = {}) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub. Logi uuesti sisse.');
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(import.meta.env.VITE_STAFF_OPERATIONS_API_URL || defaultApiUrl).replace(/\/$/, '');
  const response = await globalThis.fetch(`${baseUrl}/announcements${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Päring ebaõnnestus.');
  return data;
}

export const announcementsService = {
  // administrator
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'announcements'));
    return snapshot.docs.map((item) => normalizeAnnouncement(item.id, item.data()))
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  },
  async save(current, form, user, status) {
    const { db } = requireFirebaseClient();
    const record = { ...recordOf(form), status, updatedAt: serverTimestamp(), updatedByUid: user.uid };
    const publishing = status === 'published' && !current?.publishedAt;
    if (current?.id) {
      await updateDoc(doc(db, 'announcements', current.id), { ...record, ...(publishing ? { publishedAt: serverTimestamp() } : {}) });
      return current.id;
    }
    const ref = doc(collection(db, 'announcements'));
    await setDoc(ref, {
      ...record,
      createdAt: serverTimestamp(),
      createdByUid: user.uid,
      createdByName: clean(user.displayName || user.email),
      ...(publishing ? { publishedAt: serverTimestamp() } : {}),
    });
    return ref.id;
  },
  async setStatus(current, status, user) {
    const { db } = requireFirebaseClient();
    await updateDoc(doc(db, 'announcements', current.id), {
      status,
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
      ...(status === 'published' && !current.publishedAt ? { publishedAt: serverTimestamp() } : {}),
      ...(status === 'archived' ? { archivedAt: serverTimestamp() } : {}),
    });
  },
  report(announcementId) { return post('/report', { announcementId }); },
  // student / parent: only their own
  mine() { return post('/mine'); },
  respond({ announcementId, targetKey, answer = {} }) { return post('/respond', { announcementId, targetKey, answer }); },
};
