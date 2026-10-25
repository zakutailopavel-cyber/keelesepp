import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// „Puuduvad andmed” (owner 2026-10-25). A student / parent gets the questions for their own cards and sends the
// answers through staffOperationsApi /missing-data/* (functions/missing-data-service.js): the server decides what is
// missing and writes only those fields, with an audit record in missingDataSubmissions. The administrator saves the
// setting (missingDataSettings/current), reads the list (/missing-data/report) and marks fillings as seen.

export const MISSING_ITEMS = ['availability', 'email', 'phone', 'parentName', 'language', 'grade'];
// owner 2026-10-25: Sobivad ajad + contact e-mail + language required, class for children required
export const DEFAULT_MISSING_SETTINGS = { availability: 'required', email: 'required', phone: 'optional', parentName: 'optional', language: 'required', grade: 'required' };
const MODES = ['required', 'optional', 'off'];

export function normalizeMissingSettings(data = {}) {
  const items = data?.items && typeof data.items === 'object' ? data.items : {};
  return Object.fromEntries(MISSING_ITEMS.map((item) => [item, MODES.includes(items[item]) ? items[item] : DEFAULT_MISSING_SETTINGS[item]]));
}

const clean = (value, max = 200) => String(value ?? '').trim().slice(0, max);
const dateOf = (value) => (typeof value?.toDate === 'function' ? value.toDate().toISOString() : clean(value, 40));

export function normalizeSubmission(id, data = {}) {
  return {
    id,
    byUid: clean(data.byUid, 128),
    byName: clean(data.byName),
    byRole: clean(data.byRole, 20),
    at: clean(data.atIso, 40) || dateOf(data.at),
    studentIds: Array.isArray(data.studentIds) ? data.studentIds.map((item) => clean(item, 128)) : [],
    studentNames: Array.isArray(data.studentNames) ? data.studentNames.map((item) => clean(item)) : [],
    changes: Array.isArray(data.changes) ? data.changes.map((item) => ({ target: clean(item?.target, 20), id: clean(item?.id, 128), field: clean(item?.field, 40), before: item?.before ?? '', after: item?.after ?? '' })) : [],
    reviewedAt: clean(data.reviewedAt, 40),
    reviewedByName: clean(data.reviewedByName),
  };
}

const defaultApiUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/staffOperationsApi';
async function post(path, body = {}) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub. Logi uuesti sisse.');
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(import.meta.env.VITE_STAFF_OPERATIONS_API_URL || defaultApiUrl).replace(/\/$/, '');
  const response = await globalThis.fetch(`${baseUrl}/missing-data${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Päring ebaõnnestus.');
    error.status = response.status;
    error.details = data.details || null;
    throw error;
  }
  return data;
}

export const missingDataService = {
  // student / parent: only their own cards
  mine() { return post('/mine'); },
  save({ cards = {}, profile = {} }) { return post('/save', { cards, profile }); },
  // administrator
  report() { return post('/report'); },
  async getSettings() {
    const { db } = requireFirebaseClient();
    const snap = await getDoc(doc(db, 'missingDataSettings', 'current'));
    return normalizeMissingSettings(snap.exists() ? snap.data() : {});
  },
  async saveSettings(items, user) {
    const { db } = requireFirebaseClient();
    const value = normalizeMissingSettings({ items });
    await setDoc(doc(db, 'missingDataSettings', 'current'), { items: value, updatedAt: serverTimestamp(), updatedByUid: user.uid });
    return value;
  },
  async listUnreviewed() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'missingDataSubmissions'), where('reviewedAt', '==', '')));
    return snapshot.docs.map((item) => normalizeSubmission(item.id, item.data())).sort((a, b) => b.at.localeCompare(a.at));
  },
  async markReviewed(id, user) {
    const { db } = requireFirebaseClient();
    const value = { reviewedAt: new Date().toISOString(), reviewedByUid: user.uid, reviewedByName: clean(user.displayName || user.email) };
    await updateDoc(doc(db, 'missingDataSubmissions', id), value);
    return value;
  },
};
