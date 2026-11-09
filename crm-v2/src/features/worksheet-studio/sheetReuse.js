// Reuse in the constructor (owner 2026-11-04): blocks of sheets saved in the CRM in „Kogu”, „Kopeeri / Teisalda…” of a
// block to another phase sheet, and whole-sheet / whole-lesson templates („Salvesta mallina”, „Uus mallist”).
// Pure logic only; Firestore reads and writes go through the repositories passed in (services/firebase/sheetReuse.js,
// lessonWorksheets.js, worksheetSheetTemplates.js), so all of it is unit-tested without Firebase.
import { parseQuery, sheetEntries } from './blockLibrary.js';
import { newDocument, newId, SCHEMA } from './engine/schema.js';

// the phase sheets of a lesson a block can go to (ids of curriculumLessons/{id}/worksheets/{worksheetId})
export const PHASE_SHEETS = [
  { id: 'discover', label: 'Avasta', role: 'discover', slot: 1, displayLabel: '1 Avasta' },
  { id: 'practice', label: 'Harjuta', role: 'practice', slot: 2, displayLabel: '2 Harjuta' },
  { id: 'transfer', label: 'Kasuta', role: 'transfer', slot: 3, displayLabel: '3 Kasuta' },
  { id: 'opik', label: 'Õpik', role: 'focus', slot: 4, displayLabel: 'Õpik' },
];
export const phaseLabel = (id) => PHASE_SHEETS.find((p) => p.id === id)?.label || '';
const MISSING = 'Töölehte ei leitud.';
const clone = (value) => JSON.parse(JSON.stringify(value));

// ---------- blocks between sheets ----------

// copies with new ids; the goals the blocks use come along when the target sheet has no goal with that key
export function appendBlocks(doc, blocks, sourceMeta = {}) {
  const fresh = blocks.map((block) => ({ ...clone(block), id: newId() }));
  const goals = { ...(doc.meta?.goals || {}) };
  for (const block of fresh) {
    if (block.goal && !goals[block.goal] && sourceMeta.goals?.[block.goal]) goals[block.goal] = sourceMeta.goals[block.goal];
  }
  return { doc: { ...doc, meta: { ...doc.meta, goals }, blocks: [...(doc.blocks || []), ...fresh] }, ids: fresh.map((b) => b.id) };
}

export const removeBlock = (doc, blockId) => ({ ...doc, blocks: doc.blocks.filter((b) => b.id !== blockId) });

// an empty phase sheet for a phase that has none yet
export function emptyPhaseDoc(worksheetId, lesson = {}) {
  const fresh = newDocument();
  return { ...fresh, meta: { ...fresh.meta, title: lesson.title || phaseLabel(worksheetId) || fresh.meta.title, level: lesson.level || fresh.meta.level } };
}

// the fields lessonWorksheets.saveDraft needs when it creates a phase sheet
export function newPhaseFields(worksheetId) {
  const phase = PHASE_SHEETS.find((p) => p.id === worksheetId);
  return phase ? { role: phase.role, slot: phase.slot, displayLabel: phase.displayLabel, source: 'manual' } : { source: 'manual' };
}

/**
 * Puts copies of blocks at the end of a lesson's phase sheet, as a draft (never published). Uses the conflict-checked
 * lessonWorksheets.saveDraft: the sheet is read, the blocks added and saved with the read's updatedAt; when someone saved
 * it in between, it is read again once and the copy is added to the newer sheet.
 */
export async function copyBlocksToPhase({ repository, lessonId, worksheetId, blocks, sourceMeta = {}, lesson = {}, user }) {
  if (!blocks?.length) throw new Error('Pole midagi kopeerida.');
  for (let attempt = 0; ; attempt += 1) {
    let record = null;
    try {
      record = await repository.load(lessonId, worksheetId);
    } catch (error) {
      if (error?.message !== MISSING) throw error;
    }
    const base = record?.worksheetDoc?.schema === SCHEMA ? record.worksheetDoc : emptyPhaseDoc(worksheetId, lesson);
    const { doc, ids } = appendBlocks(base, blocks, sourceMeta);
    try {
      const saved = await repository.saveDraft({
        lessonId, worksheetId, worksheetDoc: doc, user, baseUpdatedAt: record?.worksheetDocUpdatedAt || '',
        ...(record ? {} : newPhaseFields(worksheetId)),
      });
      return { ...saved, ids, created: !record };
    } catch (error) {
      if (error?.name !== 'LessonWorksheetConflictError' || attempt >= 1) throw error;
    }
  }
}

// ---------- „Kogu”: sheets saved in the CRM ----------

const isLessonWithPhases = (lesson) => Object.keys(lesson?.worksheetPhases || {}).length > 0;

// standalone sheets (curriculumLessons with a worksheetDoc): their blocks are on the lesson document itself
export function standaloneEntries(lessons) {
  return lessons.flatMap((lesson) => {
    const doc = lesson.worksheetDoc;
    if (doc?.schema !== SCHEMA || lesson.archived || lesson.deleted) return [];
    const status = lesson.worksheetDocStatus === 'published' ? 'avaldatud' : 'mustand';
    return sheetEntries(doc, {
      lessonId: lesson.id, phase: '', level: doc.meta?.level || lesson.level, topic: lesson.topic || doc.meta?.module || '', lesson: doc.meta?.title || lesson.title || '',
      extraTags: ['salvestatud', 'leht', status], source: 'saved', keyPrefix: 'saved:', sheetTitle: doc.meta?.title || lesson.title || '', status,
    });
  });
}

// phase sheets of one lesson (records of lessonWorksheets.list)
export function phaseEntries(lesson, records) {
  return records.flatMap((record) => {
    const doc = record.worksheetDoc;
    if (doc?.schema !== SCHEMA) return [];
    const status = record.worksheetDocStatus === 'published' ? 'avaldatud' : 'mustand';
    const phase = record.worksheetId || record.id || '';
    return sheetEntries(doc, {
      lessonId: lesson.id, phase, level: doc.meta?.level || lesson.level, topic: lesson.roadmapModuleTitle || lesson.module || lesson.topic || '', lesson: lesson.title || doc.meta?.title || '',
      extraTags: ['salvestatud', 'tund', status], source: 'saved', keyPrefix: 'saved:', sheetTitle: `${lesson.title || doc.meta?.title || ''}${phaseLabel(phase) ? ` · ${phaseLabel(phase)}` : ''}`, status,
    });
  });
}

const lessonText = (lesson) => [lesson.title, lesson.level, lesson.levelStage, lesson.topic, lesson.module, lesson.roadmapModuleTitle, lesson.id]
  .filter(Boolean).join(' ').toLocaleLowerCase('et');

/**
 * Lessons whose phase sheets are worth reading for a query: lessons with phase sheets whose title / level / module /
 * id contain every word of the query (the #tags of skill or block type are not about the lesson, so they are ignored
 * here unless they name a level). At most `max`, so a broad query never reads hundreds of lessons.
 */
export function lessonsToLoad(lessons, query, { max = 12, always = [] } = {}) {
  const { tags, terms } = parseQuery(query);
  const levels = tags.filter((t) => /^[abc][12]$/.test(t));
  const wanted = [...terms.filter((t) => t.length >= 3), ...levels];
  const withPhases = lessons.filter(isLessonWithPhases);
  const pinned = withPhases.filter((l) => always.includes(l.id));
  if (!wanted.length || !terms.some((t) => t.length >= 3)) return { lessons: pinned, more: 0 };
  const hits = withPhases.filter((l) => !always.includes(l.id) && wanted.every((t) => lessonText(l).includes(t)));
  return { lessons: [...pinned, ...hits.slice(0, max)], more: Math.max(0, hits.length - max) };
}

// roadmap lessons a block can be copied to, filtered by a typed text
export function targetLessons(lessons, text = '', max = 30) {
  const q = String(text || '').toLocaleLowerCase('et').trim();
  const list = lessons
    .filter((l) => l.type === 'lesson' || l.roadmapManaged || l.roadmapLessonId || isLessonWithPhases(l))
    .filter((l) => !q || lessonText(l).includes(q))
    .sort((a, b) => String(a.levelStage || a.level || '').localeCompare(String(b.levelStage || b.level || ''), 'et')
      || (Number(a.roadmapLessonNumber || a.order) || 0) - (Number(b.roadmapLessonNumber || b.order) || 0)
      || String(a.title || '').localeCompare(String(b.title || ''), 'et'));
  return { items: list.slice(0, max), total: list.length };
}

// ---------- templates (worksheetTemplates) ----------

export const TEMPLATE_KINDS = { sheet: 'Leht', lesson: 'Terve tund' };
const MAX_TEMPLATE_BYTES = 900 * 1024;

// a sheet as stored in a template: no save stamps, no student-facing state
export function cleanSheet(doc) {
  const { updatedAt, updatedBy, version, status, ...rest } = clone(doc); // eslint-disable-line no-unused-vars
  return rest;
}

export function templateRecord({ kind, title, sheets }) {
  const name = String(title || '').trim().slice(0, 120);
  if (!name) throw new Error('Anna mallile nimi.');
  if (!['sheet', 'lesson'].includes(kind)) throw new Error('Malli liik on vigane.');
  const list = (sheets || []).filter((s) => s?.doc?.schema === SCHEMA).map((s) => ({ phase: String(s.phase || ''), label: String(s.label || phaseLabel(s.phase) || s.doc.meta?.title || ''), doc: cleanSheet(s.doc) }));
  if (!list.length) throw new Error('Mallis pole ühtegi lehte.');
  if (kind === 'sheet' && list.length !== 1) throw new Error('Lehe mallis on üks leht.');
  if (list.length > 6) throw new Error('Mallis võib olla kuni 6 lehte.');
  if (!list.some((s) => s.doc.blocks?.length)) throw new Error('Mallis pole ühtegi plokki.');
  const record = { kind, title: name, level: String(list[0].doc.meta?.level || '').slice(0, 20), sheets: list };
  if (new globalThis.TextEncoder().encode(JSON.stringify(record)).length > MAX_TEMPLATE_BYTES) throw new Error('Mall on liiga suur (üle 900 kB). Salvesta lehed eraldi mallidena.');
  return record;
}

// a template sheet as the current sheet: the current document's id stays, every block gets a new id
export function applySheetTemplate(templateDoc, current) {
  const doc = clone(templateDoc);
  return { ...doc, schema: SCHEMA, id: current?.id || doc.id || newId('ws'), blocks: (doc.blocks || []).map((b) => ({ ...b, id: newId() })) };
}

const isEmptySheet = (record) => !record || !(record.worksheetDoc?.blocks?.length);

/**
 * What a lesson template does on a lesson: the sheet of the open phase goes into the editor; other phases get a draft
 * only when they have no sheet or an empty one — a sheet with blocks is never overwritten.
 * `existing`: { [worksheetId]: record | null }.
 */
export function lessonTemplatePlan(template, existing = {}, currentPhase = '') {
  return (template?.sheets || []).filter((s) => PHASE_SHEETS.some((p) => p.id === s.phase)).map((sheet) => {
    const label = phaseLabel(sheet.phase);
    if (sheet.phase === currentPhase) return { phase: sheet.phase, label, action: 'current', sheet };
    if (isEmptySheet(existing[sheet.phase])) return { phase: sheet.phase, label, action: 'fill', sheet };
    return { phase: sheet.phase, label, action: 'skip', sheet, reason: 'lehel on juba plokid' };
  });
}

// writes the „fill” rows of a plan as drafts (conflict-checked saveDraft); the open phase is the caller's
export async function applyLessonTemplate({ repository, lessonId, plan, existing = {}, user }) {
  const done = []; const failed = [];
  for (const row of plan.filter((r) => r.action === 'fill')) {
    const record = existing[row.phase] || null;
    try {
      await repository.saveDraft({
        lessonId, worksheetId: row.phase, worksheetDoc: applySheetTemplate(row.sheet.doc, record?.worksheetDoc), user,
        baseUpdatedAt: record?.worksheetDocUpdatedAt || '', ...(record ? {} : newPhaseFields(row.phase)),
      });
      done.push(row.label);
    } catch (error) {
      failed.push(`${row.label}: ${error.message || 'viga'}`);
    }
  }
  return { done, failed };
}

export function filterTemplates(list, text = '') {
  const q = String(text || '').toLocaleLowerCase('et').trim();
  return list.filter((t) => !q || `${t.title} ${t.level || ''} ${t.ownerName || ''} ${TEMPLATE_KINDS[t.kind] || ''}`.toLocaleLowerCase('et').includes(q));
}
