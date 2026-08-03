import { collection, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

export const scheduleService = {
  async listByStudent(studentId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'schedule'), where('studentId', '==', studentId)));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((left, right) => `${left.date || '9999'} ${left.time || ''}`.localeCompare(`${right.date || '9999'} ${right.time || ''}`, 'et'));
  },
};
