import { doc, getDoc, setDoc } from 'firebase/firestore';
import { assessmentPayload, normalizeAssessment } from '../../features/initial-assessment/assessmentModel.js';
import { requireFirebaseClient } from './client.js';

// `studentInitialAssessments/{studentId}` — one baseline per student (shared with CRM v1). Teachers of the student
// and admins may create/update it; only an admin deletes (rules).
export const initialAssessmentsService = {
  async get(student) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'studentInitialAssessments', student.id));
    return snapshot.exists() ? normalizeAssessment(snapshot.data(), student) : null;
  },

  async save(student, draft, actor, existing) {
    const { db } = requireFirebaseClient();
    const payload = assessmentPayload(draft, student, actor, existing);
    await setDoc(doc(db, 'studentInitialAssessments', student.id), payload);
    return payload;
  },
};
