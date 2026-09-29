import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

const clean = (value) => String(value ?? '').trim();
const makeClientId = () => globalThis.crypto?.randomUUID?.() || `wb-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function participantName(user = {}) {
  return clean(user.displayName || user.email || 'Kasutaja').slice(0, 160);
}

function normalizePoints(points = []) {
  return points.slice(0, 800).map((point) => ({
    x: Number(Number(point?.x || 0).toFixed(2)),
    y: Number(Number(point?.y || 0).toFixed(2)),
  }));
}

function elementsCollection(db, invitationId) {
  return collection(db, 'liveLessonInvitations', invitationId, 'whiteboardElements');
}

export const liveLessonWhiteboardService = {
  subscribe(invitationId, onChange, onError) {
    if (!invitationId) {
      onChange([]);
      return () => {};
    }
    const { db } = requireFirebaseClient();
    return onSnapshot(
      elementsCollection(db, invitationId),
      (snapshot) => {
        const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        items.sort((left, right) => {
          const leftMs = left.updatedAt?.toMillis?.() || 0;
          const rightMs = right.updatedAt?.toMillis?.() || 0;
          return leftMs - rightMs || left.id.localeCompare(right.id);
        });
        onChange(items);
      },
      onError,
    );
  },

  async addStroke(invitationId, { points, color, strokeWidth = 4 }, user) {
    if (!invitationId || !user?.uid) throw new Error('Tahvli andmed on puudulikud.');
    const normalized = normalizePoints(points);
    if (normalized.length < 2) return null;
    const { db } = requireFirebaseClient();
    const reference = await addDoc(elementsCollection(db, invitationId), {
      type: 'stroke',
      points: normalized,
      color: clean(color || '#1C2B3A').slice(0, 32),
      strokeWidth: Math.min(40, Math.max(1, Number(strokeWidth) || 4)),
      updatedAt: serverTimestamp(),
      updatedByUid: user.uid,
      updatedByName: participantName(user),
      lastClientId: makeClientId(),
      revision: 1,
    });
    return reference.id;
  },

  async removeElement(invitationId, elementId) {
    if (!invitationId || !elementId) return;
    const { db } = requireFirebaseClient();
    await deleteDoc(doc(db, 'liveLessonInvitations', invitationId, 'whiteboardElements', elementId));
  },

  async clear(invitationId) {
    if (!invitationId) return;
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(elementsCollection(db, invitationId));
    if (snapshot.empty) return;
    const batch = writeBatch(db);
    snapshot.docs.forEach((item) => batch.delete(item.ref));
    await batch.commit();
  },
};
