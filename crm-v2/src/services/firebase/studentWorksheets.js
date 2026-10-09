import { collection, doc, getDoc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { requireFirebaseClient } from './client.js';
import { validateWorksheetDoc, WorksheetConflictError } from './worksheetDocs.js';
import { fileToJpegBlob } from '../../features/worksheet-studio/engine/image.js';
import { SCHEMA } from '../../features/worksheet-studio/engine/schema.js';

const clean = (value) => JSON.parse(JSON.stringify(value));
const safeName = (name = 'file') => String(name).normalize('NFKD').replace(/[^\w.-]+/g, '-').slice(-60) || 'file';

async function upload(storage, path, blob, contentType) {
  const storageRef = ref(storage, path);
  await new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, blob, { contentType });
    task.on('state_changed', null, reject, resolve);
  });
  return getDownloadURL(storageRef);
}

export const studentWorksheetsService = {
  async listDraftsByStudent(studentId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'studentWorksheetDrafts'), where('studentId', '==', studentId)));
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
      .filter((entry) => entry.worksheetDocStatus === 'draft')
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  },

  forStudent(student) {
    const studentId = String(student?.id || '');
    if (!studentId) throw new Error('Õpilast ei leitud.');
    return {
      async load(worksheetId) {
        const { db } = requireFirebaseClient();
        const snapshot = await getDoc(doc(db, 'studentWorksheetDrafts', worksheetId));
        if (!snapshot.exists() || snapshot.data().studentId !== studentId) throw new Error('Õpilase töölehte ei leitud.');
        const data = snapshot.data();
        if (data.worksheetDoc?.schema !== SCHEMA) throw new Error('Töölehe vorming on tundmatu.');
        return {
          document: data.worksheetDoc,
          source: 'worksheetDoc',
          lesson: data,
          baseUpdatedAt: data.updatedAt || '',
          version: Number(data.worksheetDocVersion) || 1,
          status: data.worksheetDocStatus || 'draft',
        };
      },

      async save({ lessonId = '', document, user, baseUpdatedAt = '', status = 'draft' }) {
        validateWorksheetDoc(document);
        const { db } = requireFirebaseClient();
        const now = new Date().toISOString();
        const draftRef = lessonId ? doc(db, 'studentWorksheetDrafts', lessonId) : doc(collection(db, 'studentWorksheetDrafts'));
        const assignmentRef = doc(db, 'worksheetAssignments', draftRef.id);
        const created = !lessonId;
        const published = status === 'published';
        return runTransaction(db, async (transaction) => {
          const existing = created ? null : await transaction.get(draftRef);
          if (existing && (!existing.exists() || existing.data().studentId !== studentId)) throw new Error('Õpilase töölehte ei leitud.');
          const current = existing?.data() || {};
          if ((current.updatedAt || '') !== baseUpdatedAt) throw new WorksheetConflictError();
          const assignment = published ? await transaction.get(assignmentRef) : null;
          if (assignment?.exists()) {
            const assigned = assignment.data();
            if (assigned.studentId !== studentId) throw new Error('Töölehe õpilane ei ühti.');
            if (assigned.status !== 'new' || Object.keys(assigned.answers || {}).length) {
              throw new Error('Õpilane on töölehega juba alustanud. Koosta uus isiklik tööleht.');
            }
          }
          const version = (Number(current.worksheetDocVersion) || 0) + 1;
          const stored = clean({ ...document, updatedAt: now, updatedBy: user?.uid || '', version, status });
          const title = document.meta.title.trim();
          transaction.set(draftRef, {
            studentId,
            studentName: student.name || '',
            worksheetDoc: stored,
            worksheetDocVersion: version,
            worksheetDocStatus: published ? 'published' : 'draft',
            title,
            createdAt: current.createdAt || now,
            createdBy: current.createdBy || user?.uid || '',
            updatedAt: now,
            updatedBy: user?.uid || '',
          });
          if (published) {
            transaction.set(assignmentRef, {
              studentId,
              studentName: student.name || '',
              lessonTitle: title,
              subject: document.meta.subject || student.subject || 'Eesti keel',
              level: document.meta.level || student.level || '',
              topic: document.meta.module || '',
              worksheetDoc: stored,
              worksheetData: { meta: { title }, blocks: [] },
              assignedBy: user?.uid || '',
              assignedByName: user?.displayName || user?.email || '',
              assignedAt: assignment?.exists() ? assignment.data().assignedAt : now,
              dueDate: assignment?.exists() ? assignment.data().dueDate || '' : '',
              note: assignment?.exists() ? assignment.data().note || '' : '',
              status: 'new',
              score: null,
              completedAt: null,
              answers: {},
              source: 'student_private_worksheet',
              privateWorksheetId: draftRef.id,
            }, { merge: true });
          }
          return { id: draftRef.id, created, title, updatedAt: now, version, status: published ? 'published' : 'draft' };
        });
      },

      async uploadImage(file) {
        if (!String(file?.type || '').startsWith('image/')) throw new Error('Vali pildifail.');
        const { storage } = requireFirebaseClient();
        const { blob, width, height } = await fileToJpegBlob(file);
        const storagePath = `student-worksheets/${studentId}/${Date.now()}_${safeName(file.name).replace(/\.[^.]+$/, '')}.jpg`;
        const src = await upload(storage, storagePath, blob, 'image/jpeg');
        return { src, storagePath, width, height, focus: { x: 50, y: 50 } };
      },

      async uploadAudio(file) {
        if (!String(file?.type || '').startsWith('audio/')) throw new Error('Vali helifail.');
        if (file.size > 19 * 1024 * 1024) throw new Error('Helifail on liiga suur (kuni 19 MB).');
        const { storage } = requireFirebaseClient();
        const storagePath = `student-worksheets/${studentId}/${Date.now()}_${safeName(file.name)}`;
        const src = await upload(storage, storagePath, file, file.type);
        return { src, storagePath, name: file.name };
      },
    };
  },
};
