import { doc, writeBatch } from 'firebase/firestore';
import { A2_CURRICULUM_ID, A2_LESSON_COUNT, a2CurriculumRecords } from '../../features/curriculum/a2Curriculum.js';
import { requireFirebaseClient } from './client.js';

function userName(user) {
  return user?.displayName || user?.email || '';
}

export const curriculumInstallerService = {
  async installA2({ user } = {}) {
    if (!user?.uid) throw new Error('A2 õppekava paigaldamiseks peab olema sisse logitud.');
    const records = a2CurriculumRecords();
    if (records.length !== A2_LESSON_COUNT) throw new Error('A2 õppekava pole paigaldamiseks valmis.');

    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    for (const record of records) {
      const { id, ...curriculumData } = record;
      batch.set(doc(db, 'curriculumLessons', id), {
        ...curriculumData,
        roadmapUpdatedAt: now,
        roadmapUpdatedBy: user.uid,
        roadmapUpdatedByName: userName(user),
        updatedAt: now,
      }, { merge: true });
    }

    await batch.commit();
    return {
      curriculumId: A2_CURRICULUM_ID,
      count: records.length,
      updatedAt: now,
    };
  },
};
