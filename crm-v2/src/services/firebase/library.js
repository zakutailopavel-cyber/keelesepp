import { collection, getDocs } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

function records(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export const libraryService = {
  async list() {
    const { db } = requireFirebaseClient();
    const [curriculumLessons, exercises] = await Promise.all([
      getDocs(collection(db, 'curriculumLessons')),
      getDocs(collection(db, 'exercises')),
    ]);
    return {
      curriculumLessons: records(curriculumLessons),
      exercises: records(exercises),
    };
  },
};
