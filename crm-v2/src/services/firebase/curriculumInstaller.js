import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { A2_CURRICULUM_ID, A2_LESSON_COUNT, a2CurriculumRecords } from '../../features/curriculum/a2Curriculum.js';
import { LESSON_PLAN_SOURCE } from '../../features/curriculum/lessonPlans.js';
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

  // Writes the lesson plan (what to do, what to teach, how the hour goes) into the description of every installed
  // roadmap lesson. A description a teacher wrote by hand is kept: only empty ones, the old module text and earlier
  // generated plans are replaced.
  async refreshLessonPlans({ user } = {}) {
    if (!user?.uid) throw new Error('Kirjelduste uuendamiseks peab olema sisse logitud.');
    const { default: plans } = await import('../../features/curriculum/lessonPlanData.json');
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'curriculumLessons'));
    const now = new Date().toISOString();
    const result = { updated: 0, kept: 0, total: 0 };
    let batch = writeBatch(db);
    let pending = 0;
    for (const entry of snapshot.docs) {
      const plan = plans[entry.id];
      if (!plan) continue;
      result.total += 1;
      const data = entry.data();
      const current = String(data.description || '').trim();
      const replaceable = !current || data.descriptionSource === LESSON_PLAN_SOURCE || current === String(plan.previous || '').trim() || current === String(data.roadmapModuleGoal || '').trim();
      if (!replaceable) { result.kept += 1; continue; }
      if (current === plan.description) continue;
      batch.set(entry.ref, { description: plan.description, descriptionSource: LESSON_PLAN_SOURCE, descriptionUpdatedAt: now, descriptionUpdatedBy: user.uid }, { merge: true });
      result.updated += 1;
      pending += 1;
      if (pending >= 400) { await batch.commit(); batch = writeBatch(db); pending = 0; }
    }
    if (pending) await batch.commit();
    return result;
  },
};
