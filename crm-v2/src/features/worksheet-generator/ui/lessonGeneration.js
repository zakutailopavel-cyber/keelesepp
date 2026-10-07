import { ACTIVITY_CATALOG_VERSION, generateFocusWorksheet, generateLessonBundle, GENERATOR_VERSION } from '../engine/generator.js';
import { focusPhaseLabel, focusWorksheetId } from '../engine/focusWorksheet.js';
import { withLessonArt } from '../art/textbookArt.js';

export const CORE_SHEETS = Object.freeze([
  { id: 'discover', label: '1 Avasta', slot: 1, hint: 'Märka ja saa aru' },
  { id: 'practice', label: '2 Harjuta', slot: 2, hint: 'Harjuta täpsust' },
  { id: 'transfer', label: '3 Kasuta', slot: 3, hint: 'Kasuta iseseisvalt' },
]);

export const coreSheetMeta = (worksheetId) => CORE_SHEETS.find((meta) => meta.id === worksheetId) || null;

export function generationMeta(sheet, { scope, variant, size = 'standard', levelVocabulary = null }) {
  return {
    generatorVersion: sheet.generatorVersion,
    recipeId: sheet.recipeId,
    seed: sheet.seed,
    scope,
    phase: sheet.phase,
    focusIds: sheet.focusIds,
    contextId: sheet.contextId,
    profileVersion: sheet.profileVersion,
    size,
    activityIds: sheet.activityIds,
    activityCatalogVersion: ACTIVITY_CATALOG_VERSION,
    didacticPlanVersion: 1,
    difficulty: sheet.difficulty,
    lessonDna: sheet.lessonDna,
    variant,
    levelVocabulary: levelVocabulary?.source ? { source: levelVocabulary.source, wordCount: levelVocabulary.wordCount || 0 } : null,
  };
}

// Generates the three core sheets (Avasta, Harjuta, Kasuta) and saves them as drafts. Returns the variant number.
// onlyMissing: phases that already have a sheet (draft or published, generated or hand-made) are left untouched.
export async function generateCoreSheets({ repository, lessonId, lesson, profile, sheets, levelVocabulary, difficulty, user, onlyMissing = false }) {
  const byId = new Map(sheets.map((sheet) => [sheet.worksheetId || sheet.id, sheet]));
  const existing = CORE_SHEETS.map(({ id }) => byId.get(id)).filter(Boolean);
  const previousActivityIds = existing.flatMap((sheet) => sheet?.generation?.activityIds || []);
  const variant = Math.max(0, ...existing.map((sheet) => Number(sheet?.generation?.variant) || Number(sheet?.worksheetDocVersion) || 0)) + 1;
  const result = generateLessonBundle({
    lesson,
    profile,
    levelLexicon: levelVocabulary.lexicon,
    activityHistory: previousActivityIds,
    difficulty,
    variant,
    seed: `${lessonId}:${profile.version}:${GENERATOR_VERSION}:${variant}`,
  });
  const blocking = result.diagnostics.filter((item) => item.severity === 'error');
  if (blocking.length || result.sheets.length !== 3) throw new Error(blocking.map((item) => item.message).join(' ') || 'Kolme töölehte ei saanud luua.');
  await Promise.all(result.sheets.map((sheet, index) => {
    const meta = CORE_SHEETS[index];
    const current = byId.get(meta.id);
    if (onlyMissing && current) return null;
    return repository.saveDraft({
      lessonId,
      worksheetId: meta.id,
      role: meta.id,
      slot: meta.slot,
      displayLabel: meta.label,
      worksheetDoc: withLessonArt(sheet.worksheetDoc, lessonId, meta.id),
      user,
      baseUpdatedAt: current?.worksheetDocUpdatedAt || '',
      generation: generationMeta(sheet, { scope: 'lesson-bundle', variant, levelVocabulary }),
    });
  }));
  return { variant };
}

// Generates one focus sheet and saves it as a draft. Returns its id, label and variant.
export async function generateFocusSheet({ repository, lessonId, lesson, profile, sheets, levelVocabulary, difficulty, focusId, phase, user }) {
  const focus = (profile.focuses || []).find((item) => item.id === focusId);
  if (!focus) throw new Error('Valitud fookust ei leitud.');
  const worksheetId = focusWorksheetId({ focusIds: [focusId], phase });
  const current = sheets.find((sheet) => (sheet.worksheetId || sheet.id) === worksheetId);
  const variant = Math.max(0, Number(current?.generation?.variant) || Number(current?.worksheetDocVersion) || 0) + 1;
  const result = generateFocusWorksheet({
    lesson,
    profile,
    levelLexicon: levelVocabulary.lexicon,
    focusIds: [focusId],
    phase,
    difficulty,
    variant,
    activityHistory: current?.generation?.activityIds || [],
    seed: `${lessonId}:${profile.version}:${GENERATOR_VERSION}:focus:${focusId}:${phase}:${variant}`,
  });
  const blocking = result.diagnostics.filter((item) => item.severity === 'error');
  if (blocking.length || !result.sheet) throw new Error(blocking.map((item) => item.message).join(' ') || 'Fookuse töölehte ei saanud luua.');
  const displayLabel = `${focus.label} · ${focusPhaseLabel(phase)}`;
  await repository.saveDraft({
    lessonId,
    worksheetId,
    role: 'focus',
    slot: null,
    displayLabel,
    worksheetDoc: result.sheet.worksheetDoc,
    user,
    baseUpdatedAt: current?.worksheetDocUpdatedAt || '',
    generation: generationMeta(result.sheet, { scope: 'focus', variant, levelVocabulary }),
  });
  return { worksheetId, displayLabel, variant, existed: Boolean(current) };
}

// One core sheet generated again without saving: the constructor shows it first, the teacher decides.
export function previewCoreSheet({ lessonId, lesson, profile, sheets, levelVocabulary, difficulty, worksheetId }) {
  const index = CORE_SHEETS.findIndex((meta) => meta.id === worksheetId);
  if (index < 0) throw new Error('Seda lehte ei saa eraldi genereerida.');
  const byId = new Map(sheets.map((sheet) => [sheet.worksheetId || sheet.id, sheet]));
  const existing = CORE_SHEETS.map(({ id }) => byId.get(id)).filter(Boolean);
  const variant = Math.max(0, ...existing.map((sheet) => Number(sheet?.generation?.variant) || Number(sheet?.worksheetDocVersion) || 0)) + 1;
  const result = generateLessonBundle({
    lesson,
    profile,
    levelLexicon: levelVocabulary.lexicon,
    activityHistory: existing.flatMap((sheet) => sheet?.generation?.activityIds || []),
    difficulty,
    variant,
    seed: `${lessonId}:${profile.version}:${GENERATOR_VERSION}:${variant}:${worksheetId}`,
  });
  const sheet = result.sheets[index];
  const blocking = result.diagnostics.filter((item) => item.severity === 'error');
  if (blocking.length || !sheet) throw new Error(blocking.map((item) => item.message).join(' ') || 'Lehte ei saanud luua.');
  return { worksheetDoc: withLessonArt(sheet.worksheetDoc, lessonId, worksheetId), generation: generationMeta(sheet, { scope: 'lesson-sheet', variant, levelVocabulary }), variant };
}
