import { Timestamp, addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { getFirebaseClient, requireFirebaseClient } from './client.js';
import { CLIENT_ERRORS_COLLECTION } from '../../features/client-errors/clientErrorReporter.js';

// `clientErrors/{auto id}` (firestore.rules): any signed-in user (a lesson-link guest only while the link is valid)
// creates one record with exactly the reporter's fields; only an admin reads it, sets `status` and deletes it.
export const ERROR_STATUSES = Object.freeze(['new', 'ack', 'fixed']);
const DAY_MS = 24 * 60 * 60 * 1000;
const millis = (value) => (value?.toMillis ? value.toMillis() : (typeof value === 'number' ? value : (Date.parse(value) || 0)));

// the reporter's record → the stored document (`lastAt` = the server's time, `status` always 'new')
export function storedRecord(record) {
  return {
    message: record.message,
    kind: record.kind,
    route: record.route,
    build: record.build,
    role: record.role,
    uid: record.uid,
    browser: record.browser,
    frame: record.frame,
    count: Math.max(1, Math.min(1000, Math.round(record.count) || 1)),
    fingerprint: record.fingerprint,
    status: 'new',
    firstAt: Timestamp.fromMillis(Math.min(record.firstAt || Date.now(), Date.now())),
    lastAt: serverTimestamp(),
  };
}

export function normalizeClientError(id, data = {}) {
  return {
    id,
    message: data.message || '',
    kind: data.kind || 'error',
    route: data.route || '',
    build: data.build || '',
    role: data.role || 'none',
    uid: data.uid || '',
    browser: data.browser || '',
    frame: data.frame || '',
    count: Number(data.count) || 1,
    fingerprint: data.fingerprint || id,
    status: ERROR_STATUSES.includes(data.status) ? data.status : 'new',
    firstAt: millis(data.firstAt),
    lastAt: millis(data.lastAt),
  };
}

export const clientErrorsService = {
  // the reporter's sender: quiet when Firebase is not configured (tests, local without .env)
  async send(record) {
    const client = getFirebaseClient();
    if (!client) return null;
    return addDoc(collection(client.db, CLIENT_ERRORS_COLLECTION), storedRecord(record));
  },
  // admin: records seen in the last `days` days, newest first (single-field range, no composite index)
  async listRecent({ days = 30, now = Date.now() } = {}) {
    const { db } = requireFirebaseClient();
    const since = Timestamp.fromMillis(now - days * DAY_MS);
    const snapshot = await getDocs(query(collection(db, CLIENT_ERRORS_COLLECTION), where('lastAt', '>=', since), orderBy('lastAt', 'desc')));
    return snapshot.docs.map((item) => normalizeClientError(item.id, item.data()));
  },
  // admin: one status for every record of a group (≤ 450 per batch)
  async setStatus(ids, status) {
    if (!ERROR_STATUSES.includes(status)) throw new Error('Tundmatu olek.');
    const { db } = requireFirebaseClient();
    for (let start = 0; start < ids.length; start += 450) {
      const batch = writeBatch(db);
      for (const id of ids.slice(start, start + 450)) batch.update(doc(db, CLIENT_ERRORS_COLLECTION, id), { status });
      await batch.commit();
    }
  },
  async remove(ids) {
    const { db } = requireFirebaseClient();
    for (let start = 0; start < ids.length; start += 450) {
      const batch = writeBatch(db);
      for (const id of ids.slice(start, start + 450)) batch.delete(doc(db, CLIENT_ERRORS_COLLECTION, id));
      await batch.commit();
    }
  },
};
