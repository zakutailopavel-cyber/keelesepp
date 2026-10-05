import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// teacherAvailability/{teacherUid}: the teacher's green (free) and red (busy) windows in the calendar
const clean = (value) => JSON.parse(JSON.stringify(value ?? null));

export const teacherAvailabilityService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'teacherAvailability'));
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
  },
  async save({ teacherUid, teacherName, slots, user }) {
    if (!teacherUid) throw new Error('Õpetaja puudub.');
    const { db } = requireFirebaseClient();
    const value = {
      teacherUid,
      teacherName: String(teacherName || '').slice(0, 120),
      slots: clean((slots || []).map(({ id, kind, day, date, start, end }) => ({ id, kind, start, end, ...(date ? { date } : { day }) }))),
      updatedAt: new Date().toISOString(),
      updatedBy: user?.uid || '',
    };
    await setDoc(doc(db, 'teacherAvailability', teacherUid), value);
    return { id: teacherUid, ...value };
  },
};
