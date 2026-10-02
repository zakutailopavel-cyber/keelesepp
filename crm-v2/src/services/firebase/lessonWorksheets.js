import { collection, doc, getDoc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { validateWorksheetDoc } from './worksheetDocs.js';

export const LESSON_WORKSHEET_SCHEMA = 'keelesepp.lesson-worksheet/1';
const ROLES = new Set(['discover', 'practice', 'transfer', 'focus']);
const CORE_IDS = new Set(['discover', 'practice', 'transfer']);
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;

const clean = (value) => JSON.parse(JSON.stringify(value));

function assertIdentity(lessonId, worksheetId) {
  if (!ID_PATTERN.test(String(lessonId || ''))) throw new Error('Tunni ID on vigane.');
  if (!ID_PATTERN.test(String(worksheetId || ''))) throw new Error('Töölehe ID on vigane.');
}

function normalizeRole(role, worksheetId) {
  const normalized = String(role || (CORE_IDS.has(worksheetId) ? worksheetId : 'focus'));
  if (!ROLES.has(normalized)) throw new Error('Töölehe roll on vigane.');
  if (CORE_IDS.has(worksheetId) && normalized !== worksheetId) throw new Error('Põhitöölehe ID ja roll ei ühti.');
  return normalized;
}

function userName(user) {
  return user?.displayName || user?.email || '';
}

export class LessonWorksheetConflictError extends Error {
  constructor() {
    super('Seda töölehte muudeti vahepeal teises aknas. Laadi uusim versioon ja proovi uuesti.');
    this.name = 'LessonWorksheetConflictError';
  }
}

function refs(db, lessonId, worksheetId) {
  return {
    lesson: doc(db, 'curriculumLessons', lessonId),
    worksheet: doc(db, 'curriculumLessons', lessonId, 'worksheets', worksheetId),
  };
}

async function persist({
  lessonId,
  worksheetId,
  worksheetDoc,
  user,
  baseUpdatedAt = '',
  status = 'draft',
  role,
  slot,
  displayLabel = '',
  source,
  generation,
  contentOrigin,
}) {
  assertIdentity(lessonId, worksheetId);
  validateWorksheetDoc(worksheetDoc);
  const normalizedRole = normalizeRole(role, worksheetId);
  const normalizedStatus = status === 'published' ? 'published' : 'draft';
  if (source !== undefined && !['generated', 'manual'].includes(source)) throw new Error('Töölehe allikas on vigane.');
  if (slot !== undefined && slot !== null && ![1, 2, 3].includes(slot)) throw new Error('Töölehe järjekorranumber on vigane.');

  const { db } = requireFirebaseClient();
  const { lesson, worksheet } = refs(db, lessonId, worksheetId);
  const now = new Date().toISOString();

  return runTransaction(db, async (transaction) => {
    const [lessonSnapshot, worksheetSnapshot] = await Promise.all([
      transaction.get(lesson),
      transaction.get(worksheet),
    ]);
    if (!lessonSnapshot.exists()) throw new Error('Õppetundi ei leitud.');

    const current = worksheetSnapshot.exists() ? worksheetSnapshot.data() : null;
    if (current && baseUpdatedAt !== current.worksheetDocUpdatedAt) throw new LessonWorksheetConflictError();
    const version = (Number(current?.worksheetDocVersion) || 0) + 1;
    const storedDoc = clean({
      ...worksheetDoc,
      updatedAt: now,
      updatedBy: user?.uid || '',
      version,
      status: normalizedStatus,
    });
    const preservedGeneration = generation === undefined ? current?.generation : clean(generation);
    const record = {
      schema: LESSON_WORKSHEET_SCHEMA,
      lessonId,
      worksheetId,
      role: normalizedRole,
      slot: slot ?? current?.slot ?? null,
      displayLabel: String(displayLabel || current?.displayLabel || storedDoc.meta?.title || '').trim(),
      title: String(storedDoc.meta?.title || '').trim(),
      source: source || current?.source || 'generated',
      ...(preservedGeneration ? { generation: preservedGeneration } : {}),
      ...(contentOrigin ? { contentOrigin: clean(contentOrigin) } : current?.contentOrigin ? { contentOrigin: current.contentOrigin } : {}),
      worksheetDoc: storedDoc,
      worksheetDocStatus: normalizedStatus,
      worksheetDocVersion: version,
      worksheetDocUpdatedAt: now,
      createdAt: current?.createdAt || now,
      createdBy: current?.createdBy || user?.uid || '',
      updatedAt: now,
      updatedBy: user?.uid || '',
      ...(current?.publishedWorksheetDoc ? {
        publishedWorksheetDoc: current.publishedWorksheetDoc,
        publishedWorksheetDocVersion: current.publishedWorksheetDocVersion,
        publishedWorksheetDocUpdatedAt: current.publishedWorksheetDocUpdatedAt,
      } : {}),
      ...(normalizedStatus === 'published' ? {
        publishedWorksheetDoc: storedDoc,
        publishedWorksheetDocVersion: version,
        publishedWorksheetDocUpdatedAt: now,
      } : {}),
    };
    const versionRef = doc(db, 'worksheetVersions', `${lessonId}_${worksheetId}_studio_v${version}`);
    transaction.set(worksheet, record);
    transaction.set(versionRef, {
      lessonId,
      worksheetId,
      role: normalizedRole,
      version,
      status: normalizedStatus,
      worksheetDoc: storedDoc,
      ...(preservedGeneration ? { generation: preservedGeneration } : {}),
      title: record.title,
      createdAt: now,
      createdBy: user?.uid || '',
      createdByName: userName(user),
      source: 'lesson-worksheet-v1',
    });
    return { ...record, created: !current };
  });
}

export const lessonWorksheetsService = {
  async loadLesson(lessonId) {
    if (!ID_PATTERN.test(String(lessonId || ''))) throw new Error('Tunni ID on vigane.');
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'curriculumLessons', lessonId));
    if (!snapshot.exists()) throw new Error('Õppetundi ei leitud.');
    return { id: snapshot.id, ...snapshot.data() };
  },

  async load(lessonId, worksheetId) {
    assertIdentity(lessonId, worksheetId);
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(refs(db, lessonId, worksheetId).worksheet);
    if (!snapshot.exists()) throw new Error('Töölehte ei leitud.');
    return { id: snapshot.id, ...snapshot.data() };
  },

  async list(lessonId) {
    if (!ID_PATTERN.test(String(lessonId || ''))) throw new Error('Tunni ID on vigane.');
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'curriculumLessons', lessonId, 'worksheets'));
    return snapshot.docs
      .map((entry) => ({ id: entry.id, ...entry.data() }))
      .filter((entry) => entry.schema === LESSON_WORKSHEET_SCHEMA)
      .sort((a, b) => (Number(a.slot) || 99) - (Number(b.slot) || 99) || String(a.title).localeCompare(String(b.title), 'et'));
  },

  saveDraft(input) {
    return persist({ ...input, status: 'draft' });
  },

  publish(input) {
    return persist({ ...input, status: 'published' });
  },

  async listVersions(lessonId, worksheetId) {
    assertIdentity(lessonId, worksheetId);
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'worksheetVersions'), where('lessonId', '==', lessonId)));
    return snapshot.docs
      .map((entry) => ({ id: entry.id, ...entry.data() }))
      .filter((entry) => entry.worksheetId === worksheetId)
      .sort((a, b) => Number(b.version) - Number(a.version));
  },
};
