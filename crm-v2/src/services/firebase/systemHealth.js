import { doc, getDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// `systemHealth/current` (health check every 10 min) and `systemHealth/digest` (07:00 error digest): written only by
// the scheduled functions systemHealthTick / systemHealthDigest (functions/index.js), read only by an admin
// (firestore.rules). A missing document reads as null (the functions are not deployed yet).
export const SYSTEM_HEALTH_COLLECTION = 'systemHealth';

async function read(id) {
  const { db } = requireFirebaseClient();
  const snap = await getDoc(doc(db, SYSTEM_HEALTH_COLLECTION, id));
  return snap.exists() ? snap.data() : null;
}

export const systemHealthService = {
  current: () => read('current'),
  digest: () => read('digest'),
  // the bell: both at once, a failing read is null (the bell must not break because of the health check)
  async both() {
    const [current, digest] = await Promise.all([read('current').catch(() => null), read('digest').catch(() => null)]);
    return { current, digest };
  },
};
