/* global TextEncoder */
import { collection, doc, getDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
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

export class WorksheetConflictError extends Error {
  constructor() { super('Seda töölehte muudeti vahepeal teises aknas. Laadi uusim versioon või salvesta oma töö koopiana.'); this.name = 'WorksheetConflictError'; }
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
    if (lesson.worksheetDoc?.schema === SCHEMA) return { document: lesson.worksheetDoc, source: 'worksheetDoc', lesson, baseUpdatedAt: lesson.worksheetDocUpdatedAt || '', version: Number(lesson.worksheetDocVersion) || 1, status: lesson.worksheetDocStatus || 'published' };
    if (Array.isArray(lesson.worksheetData?.blocks) && lesson.worksheetData.blocks.length) {
      return { document: convertLegacyWorksheet(lesson.worksheetData, lesson), source: 'converted', lesson, baseUpdatedAt: lesson.worksheetDocUpdatedAt || '', version: Number(lesson.worksheetDocVersion) || 0, status: 'draft' };
    }
    const fresh = newDocument();
    fresh.meta = { ...fresh.meta, title: lesson.title || fresh.meta.title, level: lesson.level || fresh.meta.level, module: lesson.topic || '' };
    return { document: fresh, source: 'new', lesson, baseUpdatedAt: lesson.worksheetDocUpdatedAt || '', version: Number(lesson.worksheetDocVersion) || 0, status: 'draft' };
  },

  async save({ lessonId = '', document, user, baseUpdatedAt = '', status = 'draft' }) {
    validateWorksheetDoc(document);
    const { db } = requireFirebaseClient();
    const batch = writeBatch(db);
    const now = new Date().toISOString();
    const lessonRef = lessonId ? doc(db, 'curriculumLessons', lessonId) : doc(collection(db, 'curriculumLessons'));
    const created = !lessonId;
    let current = {};
    if (!created) {
      const snapshot = await getDoc(lessonRef);
      if (!snapshot.exists()) throw new Error('Õppematerjali ei leitud.');
      current = snapshot.data() || {};
      if (baseUpdatedAt && current.worksheetDocUpdatedAt && current.worksheetDocUpdatedAt !== baseUpdatedAt) throw new WorksheetConflictError();
    }
    const version = (Number(current.worksheetDocVersion) || 0) + 1;
    const normalizedStatus = status === 'published' ? 'published' : 'draft';
    const preservePublished = normalizedStatus === 'draft' && !current.publishedWorksheetDoc
      && current.worksheetDoc && (!current.worksheetDocStatus || current.worksheetDocStatus === 'published');
    const stored = clean({ ...document, updatedAt: now, updatedBy: user?.uid || '', version, status: normalizedStatus });
    const common = {
      worksheetDoc: stored,
      worksheetDocSchema: SCHEMA,
      worksheetDocUpdatedAt: now,
      worksheetDocVersion: version,
      worksheetDocStatus: normalizedStatus,
      updatedAt: now,
      ...(preservePublished ? {
        publishedWorksheetDoc: current.worksheetDoc,
        publishedWorksheetDocVersion: Number(current.worksheetDocVersion) || Number(current.worksheetDoc.version) || 1,
        publishedWorksheetDocUpdatedAt: current.worksheetDocUpdatedAt || current.worksheetDoc.updatedAt || now,
      } : {}),
      ...(normalizedStatus === 'published' ? { publishedWorksheetDoc: stored, publishedWorksheetDocVersion: version, publishedWorksheetDocUpdatedAt: now } : {}),
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
    batch.set(doc(db, 'worksheetVersions', `${lessonRef.id}_studio_v${version}`), {
      lessonId: lessonRef.id, version, status: normalizedStatus, worksheetDoc: stored,
      title: document.meta.title, createdAt: now, createdBy: user?.uid || '', createdByName: user?.displayName || user?.email || '', source: 'worksheet-studio-v2',
    });
    batch.set(doc(collection(db, 'activityLog')), {
      type: created ? 'worksheet_doc.created' : 'worksheet_doc.updated',
      label: created ? 'Tööleht loodud konstruktoris' : 'Tööleht muudetud konstruktoris',
      meta: { sourceId: lessonRef.id, title: document.meta.title, blocks: document.blocks.length, version, status: normalizedStatus },
      byUid: user?.uid || '',
      byName: user?.displayName || user?.email || '',
      byRole: user?.roles?.[0] || '',
      createdAt: now,
      date: now.slice(0, 10),
    });
    await batch.commit();
    return { id: lessonRef.id, created, title: document.meta.title, updatedAt: now, version, status: normalizedStatus };
  },

  async listVersions(lessonId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'worksheetVersions'), where('lessonId', '==', lessonId)));
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })).filter((entry) => entry.worksheetDoc?.schema === SCHEMA).sort((a, b) => Number(b.version) - Number(a.version));
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
