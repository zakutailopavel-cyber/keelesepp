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
  async saveMaterial({ item = null, values, user }) {
    const title = String(values.title || '').trim();
    const subject = String(values.subject || '').trim();
    const description = String(values.description || '').trim();
    if (!title) throw new Error('Sisesta materjali pealkiri.');
    if (!subject) throw new Error('Sisesta õppeaine.');

    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    const materialType = values.materialType || item?.type || 'material';
    const legacyType = materialType === 'homework' ? 'hw' : materialType === 'worksheet' ? 'material' : materialType;
    const payload = {
      title,
      type: legacyType,
      description,
      subject,
      level: String(values.level || '').trim(),
      topic: String(values.topic || '').trim(),
      order: Number(values.order) || 0,
      updatedAt: now,
    };

    if (materialType === 'worksheet' || materialType === 'test') {
      const blocks = Array.isArray(values.blocks) ? values.blocks : [];
      if (!blocks.length) throw new Error('Lisa vähemalt üks töölehe ülesanne.');
      const incomplete = blocks.some((block) => (
        (['text', 'fill'].includes(block.type) && !String(block.text || '').trim())
        || (block.type === 'writing' && !String(block.task || '').trim())
      ));
      if (incomplete) throw new Error('Täida iga lisatud ülesande sisu.');
      payload.worksheetData = {
        meta: { title, subject, level: payload.level, topic: payload.topic },
        blocks,
      };
    }
    if (!['worksheet', 'test'].includes(materialType) && !description) throw new Error('Sisesta materjali kirjeldus või sisu.');
    if (materialType === 'test') payload.examPart = values.examPart || item?.source?.examPart || 'üldine';

    const materialRef = item?.sourceId
      ? doc(db, 'curriculumLessons', item.sourceId)
      : doc(collection(db, 'curriculumLessons'));
    const created = !item?.sourceId;
    if (created) {
      batch.set(materialRef, {
        ...payload,
        files: [],
        authorUid: user.uid,
        authorName: user.displayName || user.email || '',
        createdAt: now.slice(0, 10),
      });
    } else {
      batch.set(materialRef, payload, { merge: true });
    }
    batch.set(doc(collection(db, 'activityLog')), {
      type: created ? 'learning_material.created' : 'learning_material.updated',
      label: created ? 'Õppematerjal loodud' : 'Õppematerjal muudetud',
      meta: { sourceId: item?.sourceId || materialRef.id || '', materialType, title },
      byUid: user.uid,
      byName: user.displayName || user.email || '',
      byRole: user.roles?.[0] || '',
      createdAt: now,
      date: now.slice(0, 10),
    });
    await batch.commit();
    return { id: item?.sourceId || materialRef.id || '', title, created };
  },
};
