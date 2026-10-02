import { SCHEMA } from '../../worksheet-studio/engine/schema.js';
import { materializeFullFocus, materializePhase, createDiversityState } from './content.js';
import { normalizeFocusSelection } from './focus.js';
import { normalizeLessonKind } from './lessonKind.js';
import { PHASES, recipeFor } from './recipes.js';
import { shuffleSeeded } from './seed.js';
import { inspectGeneratedSheet } from './quality.js';
import { selectVocabulary } from './vocabulary.js';

export const GENERATOR_VERSION = '1.0.0';

function diagnostic(severity, code, message) { return { severity, code, message }; }
function profileValid(profile) { return profile?.schema === 'keelesepp.worksheet-generator-profile/1' && Number(profile.version) === 1; }

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
      subtitle: lesson?.goal || '',
      level: profile.level || lesson?.levelStage || '',
      module: lesson?.module || lesson?.topic || '',
      canDo: profile.successCriteria?.[0] || lesson?.success || '',
      badge: 'KeeleSepp',
      slogan: 'Rohkem kui lihtsalt keel!',
      footer: { tagline: 'Targem suhtlus. Suurem maailm.', url: 'www.epkoolitus.ee' },
      goals,
    },
    blocks,
  };
}

function sheetFor({ lesson, profile, phase, role = phase, focusIds, seed, generatorVersion, contextId, state }) {
  const recipe = recipeFor({ phase, lessonKind: normalizeLessonKind(profile.lessonKind || lesson?.tag || lesson?.kind) });
  const blocks = phase === 'full'
    ? materializeFullFocus({ profile, focusIds, contextId, seed, state })
    : materializePhase({ phase, profile, focusIds, contextId, seed, state });
  const worksheetDoc = makeDocument({ lesson, profile, phase, displayLabel: recipe.displayLabel, focusIds, blocks, seed });
  const sheet = { role, displayLabel: recipe.displayLabel, recipeId: recipe.id, seed, generatorVersion, profileVersion: profile.version, contextId, focusIds, worksheetDoc, diagnostics: [] };
  const quality = inspectGeneratedSheet(sheet, { selectedFocusIds: focusIds });
  sheet.diagnostics = quality.diagnostics;
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
  const minimum = phase === 'discover' ? 2 : phase === 'practice' || phase === 'full' ? 1 : 0;
  if (!minimum) return contexts;
  const supported = contexts.filter((context) => sentences.filter((item) => !(item.contextIds || []).length || item.contextIds.includes(context.id)).length >= minimum);
  return supported.length ? supported : contexts;
}

export function generateLessonBundle({ lesson = {}, profile, levelLexicon = [], seed, generatorVersion = GENERATOR_VERSION } = {}) {
  const diagnostics = validateInputs(profile, generatorVersion);
  if (diagnostics.length) return { sheets: [], diagnostics };
  const focusIds = (profile.focuses || []).map((item) => item.id);
  const bundleSeed = seed || `${profile.lessonId}:${profile.version}:${generatorVersion}:0`;
  const vocabulary = selectVocabulary({ activeVocabulary: profile.activeVocabulary, levelLexicon, level: profile.level, count: 12, seed: bundleSeed });
  const contexts = shuffleSeeded(profile.contexts || [], `${bundleSeed}:contexts`);
  if (contexts.length < 3) diagnostics.push(diagnostic('error', 'BANK_INSUFFICIENT', 'Kolme töölehe jaoks on vaja vähemalt kolme konteksti.'));
  const state = createDiversityState();
  const sheets = diagnostics.some((item) => item.severity === 'error') ? [] : PHASES.map((phase, index) => sheetFor({ lesson, profile, phase, focusIds, seed: `${bundleSeed}:${phase}`, generatorVersion, contextId: contexts[index].id, state }));
  const allDiagnostics = [...diagnostics, ...vocabulary.diagnostics, ...sheets.flatMap((sheet) => sheet.diagnostics)];
  return { sheets, diagnostics: allDiagnostics };
}

export function generateFocusWorksheet({ lesson = {}, profile, levelLexicon = [], focusIds = [], phase = 'full', size = 'standard', seed, generatorVersion = GENERATOR_VERSION, focusLibrary = [] } = {}) {
  const diagnostics = validateInputs(profile, generatorVersion);
  if (diagnostics.length) return { sheet: null, diagnostics };
  const normalized = normalizeFocusSelection({ profile, selected: focusIds, focusLibrary });
  diagnostics.push(...normalized.diagnostics);
  if (!normalized.focusIds.length && !normalized.diagnostics.length) diagnostics.push(diagnostic('error', 'FOCUS_UNKNOWN', 'Vali vähemalt üks fookus.'));
  if (!['discover', 'practice', 'transfer', 'full'].includes(phase)) diagnostics.push(diagnostic('error', 'NO_SUPPORTED_RECIPE_BLOCKS', `Tundmatu faas: ${phase}`));
  if (diagnostics.some((item) => item.severity === 'error')) return { sheet: null, diagnostics };
  const focusSeed = seed || `${profile.lessonId}:${profile.version}:${generatorVersion}:focus:${normalized.focusIds.join('+')}:0`;
  const vocabulary = selectVocabulary({ activeVocabulary: profile.activeVocabulary, levelLexicon, level: profile.level, count: size === 'short' ? 8 : 12, seed: focusSeed });
  const context = shuffleSeeded(contextsForFocus(profile, normalized.focusIds, phase), `${focusSeed}:context`)[0];
  if (!context) return { sheet: null, diagnostics: [...diagnostics, diagnostic('error', 'BANK_INSUFFICIENT', 'Fookuse töölehe kontekst puudub.')] };
  const sheet = sheetFor({ lesson, profile, phase, role: 'focus', focusIds: normalized.focusIds, seed: focusSeed, generatorVersion, contextId: context.id, state: createDiversityState() });
  return { sheet, diagnostics: [...diagnostics, ...vocabulary.diagnostics, ...sheet.diagnostics] };
}

export { normalizeFocusSelection } from './focus.js';
export { normalizeLessonKind } from './lessonKind.js';
export { createSeededRandom, sampleSeeded, shuffleSeeded } from './seed.js';
export { normalizeLevel, normalizeLevelLexicon, selectVocabulary } from './vocabulary.js';
