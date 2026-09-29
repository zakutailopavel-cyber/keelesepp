/* global TextEncoder */
import { collection, doc, getDoc, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { requireFirebaseClient } from './client.js';
import { convertLegacyWorksheet } from '../../features/worksheet-studio/engine/legacy.js';
import { newDocument, SCHEMA } from '../../features/worksheet-studio/engine/schema.js';
import { BLOCKS } from '../../features/worksheet-studio/engine/registry.js';
import { fileToJpegBlob } from '../../features/worksheet-studio/engine/image.js';

// Worksheet Studio persistence.
// A worksheet document lives on its curriculum lesson as `worksheetDoc` (existing collection, existing
// staff-write rule). The v1 `worksheetData` field is never modified, so CRM v1 keeps working unchanged.
// Photos and audio go to the existing `curriculum/` Storage prefix (staff write, signed-in read).

const MAX_DOC_BYTES = 800 * 1024; // Firestore documents are capped at 1 MiB; keep headroom for other fields
const MAX_BLOCKS = 150;
const MAX_AUDIO_BYTES = 19 * 1024 * 1024;

function safeName(name = 'fail') {
  return String(name).normalize('NFKD').replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').slice(-60) || 'fail';
}

export function validateWorksheetDoc(document) {
  if (!document || document.schema !== SCHEMA) throw new Error('Töölehe vorming on tundmatu.');
  if (!String(document.meta?.title || '').trim()) throw new Error('Sisesta töölehe pealkiri.');
  if (!Array.isArray(document.blocks)) throw new Error('Töölehel puuduvad plokid.');
  if (document.blocks.length > MAX_BLOCKS) throw new Error(`Töölehel võib olla kuni ${MAX_BLOCKS} plokki.`);
  const unknown = document.blocks.find((block) => !BLOCKS[block?.type]);
  if (unknown) throw new Error(`Tundmatu ploki tüüp: ${unknown?.type}`);
  const json = JSON.stringify(document);
  // photos must be uploaded files, never inline data, or the document would exceed Firestore limits
  if (json.includes('"data:')) throw new Error('Mõni foto või heli ei ole veel üles laaditud. Lisa see uuesti.');
  if (new TextEncoder().encode(json).length > MAX_DOC_BYTES) throw new Error('Tööleht on liiga suur. Jaga see kaheks.');
  return true;
}

// Drop editor-only noise before storing (e.g. undefined values Firestore rejects).
const clean = (value) => JSON.parse(JSON.stringify(value));

async function upload(storage, path, blob, contentType) {
  const storageRef = ref(storage, path);
  await new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, blob, { contentType });
    task.on('state_changed', null, reject, resolve);
  });
  return getDownloadURL(storageRef);
}

export const worksheetDocsService = {
  // Returns { document, source: 'worksheetDoc' | 'converted' | 'new', lesson }
  async load(lessonId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'curriculumLessons', lessonId));
    if (!snapshot.exists()) throw new Error('Õppematerjali ei leitud.');
    const lesson = { id: snapshot.id, ...snapshot.data() };
    if (lesson.worksheetDoc?.schema === SCHEMA) return { document: lesson.worksheetDoc, source: 'worksheetDoc', lesson };
    if (Array.isArray(lesson.worksheetData?.blocks) && lesson.worksheetData.blocks.length) {
      return { document: convertLegacyWorksheet(lesson.worksheetData, lesson), source: 'converted', lesson };
    }
    const fresh = newDocument();
    fresh.meta = { ...fresh.meta, title: lesson.title || fresh.meta.title, level: lesson.level || fresh.meta.level, module: lesson.topic || '' };
    return { document: fresh, source: 'new', lesson };
  },

  async save({ lessonId = '', document, user }) {
    validateWorksheetDoc(document);
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    const stored = clean({ ...document, updatedAt: now, updatedBy: user?.uid || '' });
    const lessonRef = lessonId ? doc(db, 'curriculumLessons', lessonId) : doc(collection(db, 'curriculumLessons'));
    const created = !lessonId;
    const common = {
      worksheetDoc: stored,
      worksheetDocSchema: SCHEMA,
      worksheetDocUpdatedAt: now,
      updatedAt: now,
    };
    if (created) {
      batch.set(lessonRef, {
        ...common,
        title: document.meta.title.trim(),
        type: 'material',
        subject: document.meta.subject || 'Eesti keel',
        level: document.meta.level || '',
        topic: document.meta.module || '',
        description: document.meta.subtitle || '',
        files: [],
        authorUid: user?.uid || '',
        authorName: user?.displayName || user?.email || '',
        createdAt: now.slice(0, 10),
      });
    } else {
      batch.set(lessonRef, common, { merge: true });
    }
    batch.set(doc(collection(db, 'activityLog')), {
      type: created ? 'worksheet_doc.created' : 'worksheet_doc.updated',
      label: created ? 'Tööleht loodud konstruktoris' : 'Tööleht muudetud konstruktoris',
      meta: { sourceId: lessonRef.id, title: document.meta.title, blocks: document.blocks.length },
      byUid: user?.uid || '',
      byName: user?.displayName || user?.email || '',
      byRole: user?.roles?.[0] || '',
      createdAt: now,
      date: now.slice(0, 10),
    });
    await batch.commit();
    return { id: lessonRef.id, created, title: document.meta.title };
  },

  async uploadImage(file) {
    if (!String(file?.type || '').startsWith('image/')) throw new Error('Vali pildifail.');
    const { storage } = requireFirebaseClient();
    const { blob, width, height } = await fileToJpegBlob(file);
    const storagePath = `curriculum/ws_${Date.now()}_${safeName(file.name).replace(/\.[^.]+$/, '')}.jpg`;
    const src = await upload(storage, storagePath, blob, 'image/jpeg');
    return { src, storagePath, width, height, focus: { x: 50, y: 50 } };
  },

  async uploadAudio(file) {
    if (!String(file?.type || '').startsWith('audio/')) throw new Error('Vali helifail.');
    if (file.size > MAX_AUDIO_BYTES) throw new Error('Helifail on liiga suur (kuni 19 MB).');
    const { storage } = requireFirebaseClient();
    const storagePath = `curriculum/ws_audio_${Date.now()}_${safeName(file.name)}`;
    const src = await upload(storage, storagePath, file, file.type);
    return { src, storagePath, name: file.name };
  },
};
