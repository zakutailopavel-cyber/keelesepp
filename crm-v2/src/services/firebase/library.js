import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
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
  async assign({ item, students, dueDate = '', note = '', user }) {
    if (!students.length) throw new Error('Vali vähemalt üks õpilane.');
    if (students.length > 450) throw new Error('Ühe korraga saab materjali määrata kuni 450 õpilasele.');
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    const date = now.slice(0, 10);
    const assignmentMode = item.type === 'worksheet' ? 'worksheet' : item.kind === 'exercise' ? 'exercise' : 'homework';

    for (const student of students) {
      if (assignmentMode === 'worksheet') {
        batch.set(doc(collection(db, 'worksheetAssignments')), {
          lessonId: item.sourceId,
          lessonTitle: item.title,
          subject: item.subject,
          level: item.level,
          topic: item.topic,
          curriculumId: item.curriculumId || '',
          curriculumTitle: item.curriculum || '',
          worksheetData: item.source.worksheetData,
          studentId: student.id,
          studentName: student.name || '',
          assignedBy: user.uid,
          assignedByName: user.displayName || user.email || '',
          assignedAt: now,
          dueDate,
          note,
          status: 'new',
          score: null,
          completedAt: null,
          answers: {},
          source: 'learning_library',
        });
      } else {
        const attachments = Array.isArray(item.source.files) ? item.source.files : [];
        const primary = attachments[0] || null;
        batch.set(doc(collection(db, 'homework')), {
          studentId: student.id,
          studentName: student.name || '',
          task: note ? `${item.title} — ${note}` : item.title,
          note,
          due: dueDate,
          status: 'Ootel',
          date,
          fileUrl: primary?.url || '',
          fileName: primary?.name || '',
          attachments,
          isExercise: assignmentMode === 'exercise',
          exerciseId: assignmentMode === 'exercise' ? item.sourceId : '',
          exerciseTitle: assignmentMode === 'exercise' ? item.title : '',
          sourceType: item.kind,
          sourceId: item.sourceId,
          curriculumId: item.curriculumId || '',
          curriculumTitle: item.curriculum || '',
          assignedBy: user.uid,
          assignedByName: user.displayName || user.email || '',
          assignedAt: now,
        });
      }
    }

    batch.set(doc(collection(db, 'activityLog')), {
      type: 'learning_material.assigned',
      label: 'Õppevara määratud',
      meta: {
        sourceId: item.sourceId,
        sourceType: item.kind,
        materialType: item.type,
        title: item.title,
        curriculumId: item.curriculumId || '',
        curriculumTitle: item.curriculum || '',
        studentIds: students.map((student) => student.id),
      },
      studentId: students.length === 1 ? students[0].id : '',
      studentName: students.length === 1 ? students[0].name || '' : '',
      byUid: user.uid,
      byName: user.displayName || user.email || '',
      byRole: user.roles?.[0] || '',
      createdAt: now,
      date,
    });
    await batch.commit();
    return { count: students.length, mode: assignmentMode };
  },
};
