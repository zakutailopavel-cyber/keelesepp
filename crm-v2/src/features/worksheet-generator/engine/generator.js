import { didacticCheck } from '../../worksheet-studio/didactics/didacticCheck.js';
import { enrichLesson } from './lessonEnrichment.js';
import { SCHEMA } from '../../worksheet-studio/engine/schema.js';
import { materializeFullFocus, materializePhase, createDiversityState } from './content.js';
import { normalizeDifficulty } from './difficulty.js';
import { createLessonDna } from './lessonDna.js';
import { normalizeFocusSelection } from './focus.js';
import { normalizeLessonKind } from './lessonKind.js';
import { planLessonActivities, planPhaseActivities } from './planner.js';
import { PHASES, recipeFor } from './recipes.js';
import { shuffleSeeded } from './seed.js';
import { inspectGeneratedSheet } from './quality.js';
import { inspectVocabularyLevel, selectVocabulary } from './vocabulary.js';

export const GENERATOR_VERSION = '1.1.0';

function diagnostic(severity, code, message) { return { severity, code, message }; }
function profileValid(profile) { return profile?.schema === 'keelesepp.worksheet-generator-profile/1' && Number(profile.version) === 1; }

const PHASE_SUBTITLES = Object.freeze({
  discover: 'Märka tähendust ja keelemustrit kontekstis.',
  practice: 'Harjuta sihtkeelt kontrollitud ülesannetes.',
  transfer: 'Kasuta sihtkeelt iseseisvas suhtluses.',
  full: 'Märka, harjuta ja kasuta sihtkeelt.',
});

function makeDocument({ lesson, profile, phase, displayLabel, focusIds, blocks, seed }) {
  const goals = Object.fromEntries(focusIds.map((id) => {
    const focus = (profile.focuses || []).find((item) => item.id === id);
    return [`focus:${id}`, focus?.label || id];
  }));
  return {
    schema: SCHEMA,
    id: `generated_${profile.lessonId}_${phase}_${seed.replace(/[^a-z0-9]+/gi, '_').slice(-28)}`,
    meta: {
      title: `${profile.title} — ${displayLabel}`,
      subtitle: PHASE_SUBTITLES[phase] || '',
      level: profile.level || lesson?.levelStage || '',
      module: profile.module || '',
      canDo: profile.successCriteria?.[0] || '',
      badge: 'KeeleSepp',
      slogan: 'Rohkem kui lihtsalt keel!',
      footer: { tagline: 'Targem suhtlus. Suurem maailm.', url: 'www.epkoolitus.ee' },
      goals,
    },
    blocks,
  };
}

function fullActivityIds(activityPlan = {}) {
  return [
    ...(activityPlan.discover || []).slice(0, 1),
    ...(activityPlan.practice || []).slice(0, 2),
    ...(activityPlan.transfer || []).filter((id) => !id.endsWith('selfcheck') && !id.endsWith('rubric')).slice(0, 2),
  ];
}

function sheetFor({
  lesson,
  profile,
  phase,
  role = phase,
  focusIds,
  seed,
  generatorVersion,
  contextId,
  state,
  activityIds = [],
  activityPlan = {},
  difficulty = 'core',
  lessonDna = null,
}) {
  const recipe = recipeFor({ phase, lessonKind: normalizeLessonKind(profile.lessonKind || lesson?.tag || lesson?.kind) });
  const resolvedActivityIds = phase === 'full' ? fullActivityIds(activityPlan) : activityIds;
  const blocks = phase === 'full'
    ? materializeFullFocus({ profile, focusIds, contextId, seed, state, activityPlan, difficulty })
    : materializePhase({ phase, profile, focusIds, contextId, seed, state, activityIds: resolvedActivityIds, difficulty, levelStage: lesson?.levelStage || '' });
  const worksheetDoc = makeDocument({ lesson, profile, phase, displayLabel: recipe.displayLabel, focusIds, blocks, seed });
  const sheet = {
    role,
    phase,
    displayLabel: recipe.displayLabel,
    recipeId: recipe.id,
    seed,
    generatorVersion,
    profileVersion: profile.version,
    contextId,
    focusIds,
    activityIds: resolvedActivityIds,
    difficulty,
    lessonDna,
    worksheetDoc,
    diagnostics: [],
  };
  const quality = inspectGeneratedSheet(sheet, { selectedFocusIds: focusIds });
  sheet.diagnostics = quality.diagnostics;
  // self-check against the level's didactic norms (docs/DIDACTIC_ENGINE.md); advisory, never blocks a sheet
  const didactic = didacticCheck(worksheetDoc, { level: lesson?.levelStage || profile.level, phase: phase === 'full' ? 'full' : phase });
  sheet.didactic = { level: didactic.label, score: didactic.score, issues: didactic.issues.map(({ level, code, text }) => ({ level, code, text })) };
  return sheet;
}

function validateInputs(profile, generatorVersion) {
  const diagnostics = [];
  if (!profile) diagnostics.push(diagnostic('error', 'PROFILE_MISSING', 'Tunni generaatoriprofiil puudub.'));
  else if (!profileValid(profile)) diagnostics.push(diagnostic('error', 'PROFILE_VERSION_UNSUPPORTED', 'Generaatoriprofiili versioon ei ole toetatud.'));
  if (!generatorVersion) diagnostics.push(diagnostic('error', 'PROFILE_VERSION_UNSUPPORTED', 'Generaatori versioon puudub.'));
  return diagnostics;
}

function contextsForFocus(profile, focusIds, phase) {
  const contexts = profile.contexts || [];
  const sentences = (profile.banks?.sentences || []).filter((item) => !focusIds.length || (item.focusIds || []).some((id) => focusIds.includes(id)));
  const minimum = phase === 'discover' ? 1 : phase === 'practice' || phase === 'full' ? 1 : 0;
  if (!minimum) return contexts;
  const supported = contexts.filter((context) => sentences.filter((item) => !(item.contextIds || []).length || item.contextIds.includes(context.id)).length >= minimum);
  return supported.length ? supported : contexts;
}

export function generateLessonBundle({
  lesson = {},
  profile,
  levelLexicon = [],
  seed,
  generatorVersion = GENERATOR_VERSION,
  activityHistory = [],
  activityPlan = null,
  difficulty = 'core',
  durationMinutes,
  variant = 0,
  blockedSentences = [],
} = {}) {
  const diagnostics = validateInputs(profile, generatorVersion);
  if (diagnostics.length) return { sheets: [], diagnostics };

  const focusIds = (profile.focuses || []).map((item) => item.id);
  const bundleSeed = seed || `${profile.lessonId}:${profile.version}:${generatorVersion}:0`;
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const lessonDna = createLessonDna({ lesson, profile, difficulty: normalizedDifficulty, mode: 'lesson-bundle', durationMinutes, variant, seed: bundleSeed });
  const vocabulary = selectVocabulary({
    activeVocabulary: profile.activeVocabulary,
    levelLexicon,
    level: profile.level,
    count: 12,
    seed: bundleSeed,
  });
  const vocabularyAudit = inspectVocabularyLevel({
    activeVocabulary: profile.activeVocabulary,
    levelLexicon,
    level: profile.level,
  });
  const contexts = shuffleSeeded(profile.contexts || [], `${bundleSeed}:contexts`);
  if (contexts.length < 3) diagnostics.push(diagnostic('error', 'BANK_INSUFFICIENT', 'Kolme töölehe jaoks on vaja vähemalt kolme konteksti.'));

  const lessonKind = normalizeLessonKind(profile.lessonKind || lesson?.tag || lesson?.kind);
  const plan = activityPlan
    ? { phases: activityPlan, diagnostics: [] }
    : planLessonActivities({
      profile,
      lessonKind,
      seed: bundleSeed,
      activityHistory,
      difficulty: normalizedDifficulty,
      countPerPhase: 5,
    });
  diagnostics.push(...plan.diagnostics);

  const state = createDiversityState({ blocked: blockedSentences });
  const sheets = diagnostics.some((item) => item.severity === 'error')
    ? []
    : PHASES.map((phase, index) => sheetFor({
      lesson,
      profile,
      phase,
      focusIds,
      seed: `${bundleSeed}:${phase}`,
      generatorVersion,
      contextId: contexts[index].id,
      state,
      activityIds: plan.phases[phase],
      difficulty: normalizedDifficulty,
      lessonDna,
    }));

  const allDiagnostics = [...diagnostics, ...vocabulary.diagnostics, ...vocabularyAudit.diagnostics, ...sheets.flatMap((sheet) => sheet.diagnostics)];
  return { sheets, diagnostics: allDiagnostics, activityPlan: plan.phases, lessonDna, vocabularyAudit };
}

// The textbook lesson: the five-task bundle above, then the material checklist's lesson frame
// (docs/MATERIAL_QUALITY_CHECKLIST.md): a text to read when the plan picked none (the profile's guided dialogue in
// Avasta), and engine/lessonEnrichment.js (listening, pair work, warm-up, self-check, stretch, real-life task).
export function generateTextbookLessonBundle(args = {}) {
  const result = generateLessonBundle(args);
  if (!result.sheets?.length) return result;
  const sheets = [...result.sheets];
  const readable = (sheet) => sheet.worksheetDoc.blocks.some((b) => b.type === 'reading' || b.type === 'dialogue');
  const di = sheets.findIndex((sheet) => sheet.phase === 'discover');
  if (di >= 0 && !sheets.some(readable)) {
    const sheet = sheets[di];
    const [dialogue] = materializePhase({ phase: 'discover', profile: args.profile, focusIds: sheet.focusIds || [], contextId: sheet.contextId, seed: `${sheet.seed}:reading`, state: createDiversityState(), activityIds: ['discover-guided-dialogue'], difficulty: sheet.difficulty, levelStage: args.lesson?.levelStage || '' });
    if (dialogue) {
      const doc = sheet.worksheetDoc;
      const closing = doc.blocks.findIndex((b) => b.type === 'selfcheck' || b.type === 'rubric');
      const at = closing < 0 ? doc.blocks.length : closing;
      sheets[di] = { ...sheet, worksheetDoc: { ...doc, blocks: [...doc.blocks.slice(0, at), { ...dialogue, id: 'enr_reading' }, ...doc.blocks.slice(at)] } };
    }
  }
  const enriched = enrichLesson(sheets.map((sheet) => ({ phase: sheet.phase, doc: sheet.worksheetDoc })), { level: args.profile?.level || args.lesson?.levelStage });
  return { ...result, sheets: sheets.map((sheet, index) => ({ ...sheet, worksheetDoc: enriched[index].doc })) };
}

export function generateFocusWorksheet({
  lesson = {},
  profile,
  levelLexicon = [],
  focusIds = [],
  phase = 'full',
  size = 'standard',
  seed,
  generatorVersion = GENERATOR_VERSION,
  focusLibrary = [],
  activityHistory = [],
  difficulty = 'core',
  durationMinutes,
  variant = 0,
  blockedSentences = [],
} = {}) {
  const diagnostics = validateInputs(profile, generatorVersion);
  if (diagnostics.length) return { sheet: null, diagnostics };

  const normalized = normalizeFocusSelection({ profile, selected: focusIds, focusLibrary });
  diagnostics.push(...normalized.diagnostics);
  if (!normalized.focusIds.length && !normalized.diagnostics.length) diagnostics.push(diagnostic('error', 'FOCUS_UNKNOWN', 'Vali vähemalt üks fookus.'));
  if (!['discover', 'practice', 'transfer', 'full'].includes(phase)) diagnostics.push(diagnostic('error', 'NO_SUPPORTED_RECIPE_BLOCKS', `Tundmatu faas: ${phase}`));
  if (diagnostics.some((item) => item.severity === 'error')) return { sheet: null, diagnostics };

  const focusSeed = seed || `${profile.lessonId}:${profile.version}:${generatorVersion}:focus:${normalized.focusIds.join('+')}:0`;
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const lessonDna = createLessonDna({ lesson, profile, focusIds: normalized.focusIds, difficulty: normalizedDifficulty, mode: 'focus-worksheet', durationMinutes, variant, seed: focusSeed });
  const vocabulary = selectVocabulary({
    activeVocabulary: profile.activeVocabulary,
    levelLexicon,
    level: profile.level,
    count: size === 'short' ? 8 : 12,
    seed: focusSeed,
  });
  const vocabularyAudit = inspectVocabularyLevel({
    activeVocabulary: profile.activeVocabulary,
    levelLexicon,
    level: profile.level,
  });
  const context = shuffleSeeded(contextsForFocus(profile, normalized.focusIds, phase), `${focusSeed}:context`)[0];
  if (!context) return { sheet: null, diagnostics: [...diagnostics, diagnostic('error', 'BANK_INSUFFICIENT', 'Fookuse töölehe kontekst puudub.')] };

  const lessonKind = normalizeLessonKind(profile.lessonKind || lesson?.tag || lesson?.kind);
  let activityPlan = {};
  let activityIds = [];
  if (phase === 'full') {
    const planned = planLessonActivities({
      profile,
      lessonKind,
      seed: focusSeed,
      activityHistory,
      difficulty: normalizedDifficulty,
      countPerPhase: 5,
    });
    diagnostics.push(...planned.diagnostics);
    activityPlan = planned.phases;
    activityIds = fullActivityIds(activityPlan);
  } else {
    const planned = planPhaseActivities({
      phase,
      profile,
      lessonKind,
      seed: focusSeed,
      activityHistory,
      difficulty: normalizedDifficulty,
      count: 5,
    });
    diagnostics.push(...planned.diagnostics);
    activityIds = planned.activityIds;
  }

  if (diagnostics.some((item) => item.severity === 'error')) return { sheet: null, diagnostics };

  const sheet = sheetFor({
    lesson,
    profile,
    phase,
    role: 'focus',
    focusIds: normalized.focusIds,
    seed: focusSeed,
    generatorVersion,
    contextId: context.id,
    state: createDiversityState({ blocked: blockedSentences }),
    activityIds,
    activityPlan,
    difficulty: normalizedDifficulty,
    lessonDna,
  });
  return { sheet, diagnostics: [...diagnostics, ...vocabulary.diagnostics, ...vocabularyAudit.diagnostics, ...sheet.diagnostics], lessonDna, vocabularyAudit };
}

export { normalizeFocusSelection } from './focus.js';
export { normalizeDifficulty, difficultySpec, DIFFICULTY_MODES } from './difficulty.js';
export { createLessonDna, lessonDnaFingerprint, LESSON_DNA_SCHEMA } from './lessonDna.js';
export { normalizeLessonKind } from './lessonKind.js';
export { catalogReadiness, planLessonActivities, planPhaseActivities } from './planner.js';
export { ACTIVITY_CATALOG, ACTIVITY_CATALOG_VERSION } from './activityCatalog.js';
export { lexicalCoverageReport, moduleDiversityReport, planLexicalRecycling, planModuleActivities } from './modulePlanner.js';
export { createSeededRandom, sampleSeeded, shuffleSeeded } from './seed.js';
export { inspectVocabularyLevel, normalizeLevel, normalizeLevelLexicon, selectVocabulary } from './vocabulary.js';
