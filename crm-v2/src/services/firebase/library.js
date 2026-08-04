import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { requireFirebaseClient } from './client.js';

const MAX_MATERIAL_FILE_SIZE = 19 * 1024 * 1024;
const SAFE_MATERIAL_TYPE = /^(image\/|application\/pdf$|text\/|audio\/|video\/|application\/vnd\.|application\/msword$)/;
const EXERCISE_TYPES = new Set(['fill', 'choice', 'writing', 'order', 'match', 'reading', 'translate']);

function records(snapshot) {
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

function storedFiles(files = []) {
  return files.map(({ name, url, size, type, storagePath }) => ({
    name: String(name || 'Fail'),
    url: String(url || ''),
    size: Number(size) || 0,
    type: String(type || ''),
    ...(storagePath ? { storagePath } : {}),
  })).filter((file) => file.url);
}

function exerciseContent(values, type) {
  if (type === 'fill') {
    const text = String(values.text || '').trim();
    if (!/\[[^\]]+\]/.test(text)) throw new Error('Märgi vähemalt üks õige vastus nurksulgudega.');
    return { text };
  }
  if (type === 'writing') {
    const task = String(values.task || '').trim();
    if (!task) throw new Error('Sisesta kirjutamisülesanne.');
    return { task, lines: Math.min(Math.max(Number(values.lines) || 5, 1), 20) };
  }
  if (type === 'order') {
    const sentence = String(values.sentence || '').trim();
    if (sentence.split(/\s+/).length < 2) throw new Error('Sisesta vähemalt kahest sõnast koosnev lause.');
    return { sentence };
  }
  if (type === 'match' || type === 'translate') {
    const pairs = (values.pairs || []).map((pair) => ({ left: String(pair.left || '').trim(), right: String(pair.right || '').trim() })).filter((pair) => pair.left || pair.right);
    if (!pairs.length || pairs.some((pair) => !pair.left || !pair.right)) throw new Error('Täida vähemalt üks paar täielikult.');
    return type === 'match'
      ? { pairs: pairs.map((pair) => ({ l: pair.left, r: pair.right })) }
      : { items: pairs.map((pair) => ({ from: pair.left, to: pair.right })) };
  }
  if (type === 'choice' || type === 'reading') {
    const questions = (values.questions || []).map((question) => ({
      question: String(question.question || '').trim(),
      options: (question.options || []).map((option) => String(option || '').trim()).filter(Boolean),
      correct: Number(question.correct) || 0,
    })).filter((question) => question.question || question.options.length);
    if (type === 'choice' && !questions.length) throw new Error('Lisa vähemalt üks valikvastustega küsimus.');
    if (questions.some((question) => !question.question || question.options.length < 2 || question.correct < 0 || question.correct >= question.options.length)) throw new Error('Täida küsimus, vähemalt kaks vastust ja vali õige vastus.');
    if (type === 'reading') {
      const passage = String(values.passage || '').trim();
      if (!passage) throw new Error('Sisesta lugemistekst.');
      return { passage, questions };
    }
    return { questions };
  }
  throw new Error('Tundmatu harjutuse tüüp.');
}

function validateWorksheetBlocks(blocks) {
  for (const block of blocks) {
    if (block.type === 'text' && !String(block.content || block.text || '').trim()) throw new Error('Täida tekstiploki sisu.');
    if (block.type === 'fill' && !/\[[^\]]+\]/.test(String(block.text || ''))) throw new Error('Märgi lünkharjutuse vastus nurksulgudega.');
    if (block.type === 'writing' && !String(block.task || '').trim()) throw new Error('Täida kirjutamisülesande sisu.');
    if (block.type === 'order' && String(block.sentence || '').trim().split(/\s+/).length < 2) throw new Error('Täida sõnade järjestamise lause.');
    if (['choice', 'reading'].includes(block.type)) {
      const questions = block.questions || [];
      if (block.type === 'choice' && !questions.length) throw new Error('Lisa valikvastuste plokki vähemalt üks küsimus.');
      if (block.type === 'reading' && !String(block.passage || '').trim()) throw new Error('Täida lugemistekst.');
      if (questions.some((question) => {
        const options = question.opts || question.options || [];
        const correct = Number(question.correct) || 0;
        return !String(question.q || question.question || '').trim() || options.filter((option) => String(option || '').trim()).length < 2 || correct < 0 || correct >= options.length || !String(options[correct] || '').trim();
      })) throw new Error('Täida küsimus, vähemalt kaks vastust ja vali õige vastus.');
    }
    if (block.type === 'match' && (!(block.pairs || []).length || block.pairs.some((pair) => !String(pair.l || '').trim() || !String(pair.r || '').trim()))) throw new Error('Täida sobitamise paarid.');
    if (block.type === 'dialogue' && (!(block.lines || []).length || block.lines.some((line) => !String(line.speaker || '').trim() || !String(line.text || '').trim()))) throw new Error('Täida dialoogi read.');
    if (block.type === 'error_correction' && (!(block.sentences || []).length || block.sentences.some((sentence) => !String(sentence.wrong || '').trim() || !String(sentence.correct || '').trim()))) throw new Error('Täida vigased ja õiged laused.');
    if (block.type === 'transformation' && (!(block.sentences || []).length || block.sentences.some((sentence) => !String(sentence || '').trim()))) throw new Error('Täida muudetavad laused.');
    if (block.type === 'table' && !(block.headers || []).some((header) => String(header || '').trim())) throw new Error('Lisa tabelile vähemalt üks veerg.');
    if (block.type === 'image') {
      let imageUrl;
      try { imageUrl = new globalThis.URL(String(block.imageUrl || '')); } catch { throw new Error('Lisa pildiplokile korrektne pildi URL.'); }
      if (!['https:', 'http:'].includes(imageUrl.protocol)) throw new Error('Lisa pildiplokile korrektne pildi URL.');
    }
  }
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
      files: storedFiles(values.files),
      updatedAt: now,
    };

    if (materialType === 'worksheet' || materialType === 'test') {
      const blocks = Array.isArray(values.blocks) ? values.blocks : [];
      if (!blocks.length) throw new Error('Lisa vähemalt üks töölehe ülesanne.');
      validateWorksheetBlocks(blocks);
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
  async uploadFile({ file, user, onProgress = () => {} }) {
    if (!file || !file.size) throw new Error('Vali üleslaadimiseks fail.');
    if (file.size > MAX_MATERIAL_FILE_SIZE) throw new Error('Fail on liiga suur. Maksimaalne suurus on 19 MB.');
    if (!SAFE_MATERIAL_TYPE.test(file.type || '')) throw new Error('Seda failivormingut ei saa õppematerjalile lisada.');
    const { storage } = requireFirebaseClient();
    const safeName = String(file.name || 'file').normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-120);
    const storagePath = `curriculum/${Date.now()}_${user.uid}_${safeName}`;
    const storageRef = ref(storage, storagePath);
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
    await new Promise((resolve, reject) => task.on('state_changed',
      (snapshot) => onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      reject,
      resolve));
    const url = await getDownloadURL(task.snapshot.ref);
    return { name: file.name, url, size: file.size, type: file.type, storagePath };
  },
  async deleteUploadedFile(file) {
    if (!String(file?.storagePath || '').startsWith('curriculum/')) return;
    const { storage } = requireFirebaseClient();
    await deleteObject(ref(storage, file.storagePath));
  },
  async saveExercise({ item = null, values, user }) {
    const title = String(values.title || '').trim();
    const subject = String(values.subject || '').trim();
    const type = String(values.exerciseType || item?.source?.type || 'fill');
    if (!title) throw new Error('Sisesta harjutuse pealkiri.');
    if (!subject) throw new Error('Sisesta õppeaine.');
    if (!EXERCISE_TYPES.has(type)) throw new Error('Tundmatu harjutuse tüüp.');
    const now = new Date().toISOString();
    const payload = {
      title,
      type,
      subject,
      level: String(values.level || '').trim(),
      topic: String(values.topic || '').trim(),
      description: String(values.description || '').trim(),
      tags: String(values.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 20),
      ...exerciseContent(values, type),
      updatedAt: now,
    };
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    const exerciseRef = item?.sourceId ? doc(db, 'exercises', item.sourceId) : doc(collection(db, 'exercises'));
    const created = !item?.sourceId;
    if (created) {
      batch.set(exerciseRef, { ...payload, assignCount: 0, authorUid: user.uid, authorName: user.displayName || user.email || '', createdAt: now });
    } else {
      batch.set(exerciseRef, payload, { merge: true });
    }
    batch.set(doc(collection(db, 'activityLog')), {
      type: created ? 'learning_exercise.created' : 'learning_exercise.updated',
      label: created ? 'Harjutus loodud' : 'Harjutus muudetud',
      meta: { sourceId: item?.sourceId || exerciseRef.id || '', exerciseType: type, title },
      byUid: user.uid,
      byName: user.displayName || user.email || '',
      byRole: user.roles?.[0] || '',
      createdAt: now,
      date: now.slice(0, 10),
    });
    await batch.commit();
    return { id: item?.sourceId || exerciseRef.id || '', title, created };
  },
};
