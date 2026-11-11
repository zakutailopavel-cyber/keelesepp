import { collection, doc, getDoc, getDocs, query, runTransaction, setDoc, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

export const LESSON_WORKSHEET_SCHEMA = 'keelesepp.lesson-worksheet/1';
const ROLES = new Set(['discover', 'practice', 'transfer', 'focus']);
const CORE_IDS = new Set(['discover', 'practice', 'transfer']);
// „Õpik” (owner 2026-10-21): a lesson's textbook sheet — the rule and exercises of a licensed textbook for the lesson's
// grammar, next to the three core sheets. Its state is kept on the lesson like theirs.
export const TEXTBOOK_SHEET_ID = 'opik';
const SUMMARY_IDS = new Set([...CORE_IDS, TEXTBOOK_SHEET_ID]);
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

// Short state of the three core sheets on the lesson itself, so Õppevara shows Avasta / Harjuta / Kasuta without
// reading every lesson's worksheets.
export function phaseSummary(record) {
  return {
    title: String(record?.title || record?.worksheetDoc?.meta?.title || '').trim(),
    status: record?.worksheetDocStatus === 'published' ? 'published' : 'draft',
    version: Number(record?.worksheetDocVersion) || 0,
    publishedVersion: Number(record?.publishedWorksheetDocVersion) || 0,
    updatedAt: String(record?.worksheetDocUpdatedAt || record?.updatedAt || ''),
    // the Õpik page's review („Ootab avaldamist” / turned down), so the admin's list needs no sheet reads
    ...(record?.review?.state ? { review: record.review.state, reviewBy: String(record.review.byName || ''), reviewAt: String(record.review.at || '') } : {}),
  };
}

// „Õpik” (owner 2026-11-11): teachers edit and „Salvesta”, only an admin „Avalda”-s. A saved change waits for the admin
// („Ootab avaldamist”); the admin publishes it or turns it down with a note back to the teacher. firestore.rules
// (`opikTeacherSave`) holds the same line for everyone who is not an admin.
export const needsPublishApproval = (worksheetId) => worksheetId === TEXTBOOK_SHEET_ID;
export const canPublishSheet = (worksheetId, user) => !needsPublishApproval(worksheetId) || Boolean(user?.roles?.includes?.('admin'));

function userName(user) {
  return user?.displayName || user?.email || '';
}

export class GeneratorProfileConflictError extends Error {
  constructor() {
    super('Generaatori sisupaketti muudeti vahepeal teises aknas. Laadi uusim versioon ja proovi uuesti.');
    this.name = 'GeneratorProfileConflictError';
  }
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
  // the check knows every block type (engine/registry.js, ~200 KB): loaded on save, so reading course sheets (the
  // student's home, the pet) does not download every block
  const { validateWorksheetDoc } = await import('./worksheetDocs.js');
  validateWorksheetDoc(worksheetDoc);
  const normalizedRole = normalizeRole(role, worksheetId);
  const normalizedStatus = status === 'published' ? 'published' : 'draft';
  if (source !== undefined && !['generated', 'manual'].includes(source)) throw new Error('Töölehe allikas on vigane.');
  if (slot !== undefined && slot !== null && ![1, 2, 3, 4].includes(slot)) throw new Error('Töölehe järjekorranumber on vigane.');

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
      // a saved Õpik draft waits for the admin; publishing clears it
      ...(needsPublishApproval(worksheetId) && normalizedStatus === 'draft' ? { review: { state: 'pending', byUid: user?.uid || '', byName: userName(user), at: now } } : {}),
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
    if (SUMMARY_IDS.has(worksheetId)) transaction.set(lesson, { worksheetPhases: { [worksheetId]: phaseSummary(record) } }, { merge: true });
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

  async listGeneratorLessons() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'curriculumLessons'));
    return snapshot.docs
      .map((entry) => ({ id: entry.id, ...entry.data() }))
      .filter((entry) => entry.type === 'lesson' || entry.roadmapManaged || entry.roadmapLessonId || entry.generatorProfile)
      .sort((a, b) => String(a.levelStage || a.level || '').localeCompare(String(b.levelStage || b.level || ''), 'et')
        || (Number(a.roadmapLessonNumber || a.order) || 0) - (Number(b.roadmapLessonNumber || b.order) || 0)
        || String(a.title || '').localeCompare(String(b.title || ''), 'et'));
  },


  async saveGeneratorProfile({ lessonId, profile, user, baseUpdatedAt = '' }) {
    if (!ID_PATTERN.test(String(lessonId || ''))) throw new Error('Tunni ID on vigane.');
    if (!profile || profile.schema !== 'keelesepp.worksheet-generator-profile/1' || Number(profile.version) !== 1) {
      throw new Error('Generaatoriprofiili skeem või versioon on vigane.');
    }
    if (String(profile.lessonId || '') !== String(lessonId)) throw new Error('Generaatoriprofiil kuulub teisele tunnile.');
    const serialized = JSON.stringify(profile);
    if (serialized.length > 250000) throw new Error('Generaatoriprofiil on liiga suur.');

    const { db } = requireFirebaseClient();
    const lessonRef = doc(db, 'curriculumLessons', lessonId);
    const now = new Date().toISOString();
    return runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(lessonRef);
      if (!snapshot.exists()) throw new Error('Õppetundi ei leitud.');
      const current = snapshot.data();
      if (current.generatorProfileUpdatedAt && baseUpdatedAt !== current.generatorProfileUpdatedAt) {
        throw new GeneratorProfileConflictError();
      }
      const revision = (Number(current.generatorProfileRevision) || 0) + 1;
      const stored = clean(profile);
      transaction.set(lessonRef, {
        generatorProfile: stored,
        generatorProfileRevision: revision,
        generatorProfileUpdatedAt: now,
        generatorProfileUpdatedBy: user?.uid || '',
        generatorProfileUpdatedByName: userName(user),
      }, { merge: true });
      return {
        profile: stored,
        revision,
        updatedAt: now,
        updatedBy: user?.uid || '',
      };
    });
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

  // admin: write the Avasta / Harjuta / Kasuta summary onto lessons whose sheets were saved before the summary existed
  async syncPhases(lessons) {
    const { db } = requireFirebaseClient();
    let updated = 0;
    for (const lesson of lessons) {
      if (!ID_PATTERN.test(String(lesson?.id || ''))) continue;
      const snapshot = await getDocs(collection(db, 'curriculumLessons', lesson.id, 'worksheets'));
      const phases = {};
      for (const entry of snapshot.docs) {
        const data = entry.data();
        if (data.schema === LESSON_WORKSHEET_SCHEMA && SUMMARY_IDS.has(entry.id)) phases[entry.id] = phaseSummary(data);
      }
      if (!Object.keys(phases).length || JSON.stringify(phases) === JSON.stringify(lesson.worksheetPhases || {})) continue;
      await setDoc(doc(db, 'curriculumLessons', lesson.id), { worksheetPhases: phases }, { merge: true });
      updated += 1;
    }
    return { updated };
  },

  saveDraft(input) {
    return persist({ ...input, status: 'draft' });
  },

  publish(input) {
    return persist({ ...input, status: 'published' });
  },

  // admin: a waiting Õpik change is turned down with a note for the teacher; the draft stays for the teacher to fix, the
  // students keep the published page
  async rejectReview({ lessonId, worksheetId, note, user, baseUpdatedAt = '' }) {
    assertIdentity(lessonId, worksheetId);
    if (!needsPublishApproval(worksheetId)) throw new Error('Seda lehte ei avaldata kinnitusega.');
    const text = String(note || '').trim();
    if (text.length < 3 || text.length > 1000) throw new Error('Kirjuta õpetajale lühike põhjus (3–1000 märki).');
    const { db } = requireFirebaseClient();
    const { lesson, worksheet } = refs(db, lessonId, worksheetId);
    const now = new Date().toISOString();
    return runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(worksheet);
      if (!snapshot.exists()) throw new Error('Töölehte ei leitud.');
      const current = snapshot.data();
      if (baseUpdatedAt && baseUpdatedAt !== current.worksheetDocUpdatedAt) throw new LessonWorksheetConflictError();
      if (current.review?.state !== 'pending') throw new Error('Sellel lehel pole ootavat muudatust.');
      const review = { ...current.review, state: 'rejected', note: text, rejectedBy: user?.uid || '', rejectedByName: userName(user), rejectedAt: now };
      const record = { ...current, review, updatedAt: now, updatedBy: user?.uid || '' };
      transaction.set(worksheet, record);
      transaction.set(lesson, { worksheetPhases: { [worksheetId]: phaseSummary(record) } }, { merge: true });
      return record;
    });
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
