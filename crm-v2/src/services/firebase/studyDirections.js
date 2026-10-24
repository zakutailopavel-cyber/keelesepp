import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { directionId, directionPayload, normalizeDirection } from '../../features/students/studyDirections.js';

// Seaded → „Õppesuunad” (firestore.rules studyDirections: admin writes, staff and finance read, nobody deletes)
export const studyDirectionsService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'studyDirections'));
    return snapshot.docs.map((item) => normalizeDirection(item.id, item.data()));
  },
  // a new direction gets an id from its name; an existing one keeps its id when renamed
  async save(values, user, order = 0) {
    const payload = directionPayload(values, user, order);
    const id = values.id && !values.fallback ? values.id : directionId(payload.name);
    const { db } = requireFirebaseClient();
    await setDoc(doc(db, 'studyDirections', id), { ...payload, ...(values.createdAt ? {} : { createdAt: payload.updatedAt }) }, { merge: true });
    return normalizeDirection(id, payload);
  },
};
