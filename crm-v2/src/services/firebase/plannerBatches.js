import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// plannerBatches/{plannerBatchId}: one record per „Kinnita ajakava” in the calendar's „Planeerija” — the weekly lessons
// it created and their students (the schedule e-mail is sent from it on the server, never from here). Admin only.
export const plannerBatchesService = {
  newId() {
    const { db } = requireFirebaseClient();
    return doc(collection(db, 'plannerBatches')).id;
  },
  async create(id, { lessonIds = [], studentIds = [] }, user) {
    const { db } = requireFirebaseClient();
    await setDoc(doc(db, 'plannerBatches', id), {
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      lessonIds: lessonIds.slice(0, 500),
      studentIds: [...new Set(studentIds)].slice(0, 500),
      status: 'confirmed',
    });
    return { id };
  },
};
