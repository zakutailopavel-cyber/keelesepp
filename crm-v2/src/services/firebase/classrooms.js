import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// classrooms/{id}: the rooms the administrator keeps („Kabinet”, Oleksiy 2026-10-15); roomBookings/{scheduleId}: which
// lesson holds which room, kept by the server trigger syncRoomBooking (no student data)
export const classroomsService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'classrooms'));
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || String(a.name).localeCompare(String(b.name), 'et'));
  },
  async save({ id = '', name, active = true, order = 0, user }) {
    const value = String(name || '').trim().slice(0, 60);
    if (!value) throw new Error('Sisesta kabineti nimi.');
    const { db } = requireFirebaseClient();
    const reference = id ? doc(db, 'classrooms', id) : doc(collection(db, 'classrooms'));
    const room = { name: value, active: active !== false, order: Number(order) || 0, updatedAt: new Date().toISOString(), updatedBy: user?.uid || '' };
    await setDoc(reference, room);
    return { id: reference.id, ...room };
  },
  async bookings() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'roomBookings'));
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
  },
};
