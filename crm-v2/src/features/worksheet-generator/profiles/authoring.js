import { normalizeLessonKind } from '../engine/lessonKind.js';
import { catalogReadiness, planLessonActivities } from '../engine/planner.js';
import { normalizeLevel } from '../engine/vocabulary.js';

export const GENERATOR_PROFILE_SCHEMA = 'keelesepp.worksheet-generator-profile/1';
export const GENERATOR_PROFILE_VERSION = 1;

const LIMITS = Object.freeze({
  focuses: 12,
  vocabulary: 100,
  contexts: 16,
  sentences: 160,
  dialogues: 30,
  errorPairs: 100,
  translations: 100,
  transformations: 100,
  prompts: 60,
  criteria: 20,
  slots: 16,
  slotValues: 24,
});

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/;
const clean = (value, max = 1000) => String(value ?? '').trim().slice(0, max);
const uniq = (items) => [...new Set((items || []).map((item) => clean(item, 96)).filter(Boolean))];

function safeId(value, fallback = '') {
  const id = clean(value, 96);
  return ID_PATTERN.test(id) ? id : fallback;
}

function boundedArray(items, max) {
  return Array.isArray(items) ? items.slice(0, max) : [];
}

function refs(values, allowed) {
  const selected = uniq(values);
  return allowed?.size ? selected.filter((id) => allowed.has(id)) : selected;
}

function slots(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).slice(0, LIMITS.slots).map(([key, values]) => [
    clean(key, 64),
    boundedArray(values, LIMITS.slotValues).map((item) => clean(item, 240)).filter(Boolean),
  ]).filter(([key, values]) => key && values.length));
}

function diagnostic(severity, code, message, extra = {}) {
  return { severity, code, message, ...extra };
}

export function sanitizeGeneratorProfile(input = {}, { lessonId = '', lesson = {} } = {}) {
  const resolvedLessonId = safeId(lessonId || input.lessonId || lesson.id);
  if (!resolvedLessonId) throw new Error('Tunni ID on vigane.');

  const focuses = boundedArray(input.focuses, LIMITS.focuses).map((item, index) => ({
    id: safeId(item?.id, `focus-${index + 1}`),
    type: clean(item?.type || 'communication', 40),
    label: clean(item?.label || item?.id || `Fookus ${index + 1}`, 180),
    patterns: boundedArray(item?.patterns, 20).map((value) => clean(value, 240)).filter(Boolean),
    aliases: boundedArray(item?.aliases, 20).map((value) => clean(value, 240)).filter(Boolean),
  }));
  const focusIds = new Set(focuses.map((item) => item.id));

  const activeVocabulary = boundedArray(input.activeVocabulary, LIMITS.vocabulary).map((item, index) => ({
    id: safeId(item?.id, `v-${index + 1}`),
    word: clean(item?.word || item?.lemma, 120),
    translation: clean(item?.translation, 240),
    lexicalType: clean(item?.lexicalType || item?.type || 'other', 40),
    focusIds: refs(item?.focusIds, focusIds),
  })).filter((item) => item.word);

  const contexts = boundedArray(input.contexts, LIMITS.contexts).map((item, index) => ({
    id: safeId(item?.id, `context-${index + 1}`),
    label: clean(item?.label || item?.id || `Kontekst ${index + 1}`, 180),
    tags: boundedArray(item?.tags, 20).map((value) => clean(value, 80)).filter(Boolean),
    names: boundedArray(item?.names, 20).map((value) => clean(value, 120)).filter(Boolean),
    times: boundedArray(item?.times, 30).map((value) => clean(value, 40)).filter(Boolean),
  }));
  const contextIds = new Set(contexts.map((item) => item.id));

  const sentences = boundedArray(input.banks?.sentences, LIMITS.sentences).map((item, index) => ({
    id: safeId(item?.id, `s${index + 1}`),
    focusIds: refs(item?.focusIds, focusIds),
    contextIds: refs(item?.contextIds, contextIds),
    difficulty: Math.max(1, Math.min(5, Number(item?.difficulty) || 1)),
    text: clean(item?.text, 800),
    slots: slots(item?.slots),
    // pattern sentences carry their exact gap answer and same-word wrong options
    ...(clean(item?.answer, 120) ? {
      answer: clean(item.answer, 120),
      distractors: boundedArray(item?.distractors, 8).map((value) => clean(value, 120)).filter(Boolean),
    } : {}),
  })).filter((item) => item.text);

  const errorPairs = boundedArray(input.banks?.errorPairs, LIMITS.errorPairs).map((item, index) => ({
    id: safeId(item?.id, `e${index + 1}`),
    focusIds: refs(item?.focusIds, focusIds),
    wrong: clean(item?.wrong, 800),
    correct: clean(item?.correct, 800),
  })).filter((item) => item.wrong && item.correct);

  const translations = boundedArray(input.banks?.translations, LIMITS.translations).map((item, index) => ({
    id: safeId(item?.id, `t${index + 1}`),
    focusIds: refs(item?.focusIds, focusIds),
    sourceLang: clean(item?.sourceLang || 'ru', 12),
    source: clean(item?.source, 800),
    target: clean(item?.target, 800),
    alternatives: boundedArray(item?.alternatives, 12).map((value) => clean(value, 800)).filter(Boolean),
  })).filter((item) => item.source);

  const transformations = boundedArray(input.banks?.transformations, LIMITS.transformations).map((item, index) => ({
    id: safeId(item?.id, `tr${index + 1}`),
    focusIds: refs(item?.focusIds, focusIds),
    from: clean(item?.from || item?.source, 800),
    prompt: clean(item?.prompt || item?.instruction, 500),
    answer: clean(item?.answer || item?.to, 800),
    alternatives: boundedArray(item?.alternatives, 12).map((value) => clean(value, 800)).filter(Boolean),
  })).filter((item) => item.from && item.answer);

  const dialogues = boundedArray(input.banks?.dialogues, LIMITS.dialogues).map((item, index) => ({
    id: safeId(item?.id, `d${index + 1}`),
    focusIds: refs(item?.focusIds, focusIds),
    contextIds: refs(item?.contextIds, contextIds),
    speakers: boundedArray(item?.speakers, 4).map((value) => clean(value, 120)).filter(Boolean),
    lines: boundedArray(item?.lines, 24).map((line) => ({
      who: clean(line?.who, 40),
      text: clean(line?.text, 800),
      answerAlternatives: boundedArray(line?.answerAlternatives, 12).map((value) => clean(value, 240)).filter(Boolean),
    })).filter((line) => line.text),
  })).filter((item) => item.lines.length);

  const promptBank = (name, prefix) => boundedArray(input.banks?.[name], LIMITS.prompts).map((item, index) => ({
    id: safeId(item?.id, `${prefix}${index + 1}`),
    focusIds: refs(item?.focusIds, focusIds),
    contextIds: refs(item?.contextIds, contextIds),
    text: clean(item?.text, 1200),
  })).filter((item) => item.text);

  return {
    schema: GENERATOR_PROFILE_SCHEMA,
    version: GENERATOR_PROFILE_VERSION,
    lessonId: resolvedLessonId,
    lessonKind: normalizeLessonKind(input.lessonKind || lesson.roadmapKind || lesson.roadmapTag || lesson.tag || lesson.kind),
    level: normalizeLevel(input.level || lesson.levelStage || lesson.level || 'A1').base || 'A1',
    title: clean(input.title || lesson.title || resolvedLessonId, 240),
    activeVocabulary,
    focuses,
    contexts,
    banks: {
      sentences,
      errorPairs,
      translations,
      transformations,
      dialogues,
      speakingPrompts: promptBank('speakingPrompts', 'sp'),
      writingPrompts: promptBank('writingPrompts', 'w'),
    },
    successCriteria: boundedArray(input.successCriteria, LIMITS.criteria).map((value) => clean(value, 500)).filter(Boolean),
  };
}

export function scaffoldGeneratorProfile(lesson = {}) {
  const lessonId = safeId(lesson.id);
  if (!lessonId) throw new Error('Tunni ID on vigane.');
  const focusText = clean(lesson.languageFocus || lesson.goal || lesson.title, 240);
  const criterion = clean(lesson.successCriteria || lesson.success || lesson.goal, 500);
  return sanitizeGeneratorProfile({
    lessonId,
    lessonKind: lesson.roadmapKind || lesson.roadmapTag || lesson.kind,
    level: lesson.levelStage || lesson.level,
    title: lesson.title,
    focuses: focusText ? [{ id: 'lesson-focus', type: 'communication', label: focusText }] : [],
    activeVocabulary: [],
    contexts: [],
    banks: { sentences: [], errorPairs: [], translations: [], transformations: [], dialogues: [], speakingPrompts: [], writingPrompts: [] },
    successCriteria: criterion ? [criterion] : [],
  }, { lessonId, lesson });
}

export function validateGeneratorProfile(input, { lessonId = '', lesson = {} } = {}) {
  const diagnostics = [];
  let profile;
  try {
    profile = sanitizeGeneratorProfile(input, { lessonId, lesson });
  } catch (error) {
    return { profile: null, ready: false, diagnostics: [diagnostic('error', 'PROFILE_INVALID', error.message)] };
  }

  if (input?.schema && input.schema !== GENERATOR_PROFILE_SCHEMA) diagnostics.push(diagnostic('error', 'PROFILE_SCHEMA_UNSUPPORTED', 'Generaatoriprofiili skeem ei ole toetatud.'));
  if (input?.version && Number(input.version) !== GENERATOR_PROFILE_VERSION) diagnostics.push(diagnostic('error', 'PROFILE_VERSION_UNSUPPORTED', 'Generaatoriprofiili versioon ei ole toetatud.'));
  if (profile.lessonId !== String(lessonId || profile.lessonId)) diagnostics.push(diagnostic('error', 'PROFILE_LESSON_MISMATCH', 'Generaatoriprofiil kuulub teisele tunnile.'));
  if (!profile.focuses.length) diagnostics.push(diagnostic('error', 'PROFILE_FOCUS_MISSING', 'Lisa vähemalt üks keele- või suhtlusfookus.'));
  if (profile.activeVocabulary.filter((item) => item.translation).length < 3) diagnostics.push(diagnostic('error', 'PROFILE_VOCABULARY_LOW', 'Lisa vähemalt kolm tõlkega sihtsõna või väljendit.'));
  if (profile.contexts.length < 3) diagnostics.push(diagnostic('error', 'PROFILE_CONTEXTS_LOW', 'Kolme põhilehe jaoks on vaja vähemalt kolme konteksti.'));
  if (profile.banks.sentences.length < 5) diagnostics.push(diagnostic('error', 'PROFILE_SENTENCES_LOW', 'Lisa vähemalt viis kontrollitud näidislauset.'));
  if (!profile.successCriteria.length) diagnostics.push(diagnostic('error', 'PROFILE_CRITERIA_MISSING', 'Lisa vähemalt üks edukriteerium.'));

  const catalog = catalogReadiness(profile, profile.lessonKind);
  Object.entries(catalog).forEach(([phase, info]) => {
    if (info.available < 5) diagnostics.push(diagnostic('error', 'PROFILE_PHASE_NOT_READY', `${phase}: sobivaid ülesandetüüpe on ${info.available}, vaja on vähemalt 5.`, { phase }));
  });

  const plan = planLessonActivities({ profile, lessonKind: profile.lessonKind, seed: 'profile-readiness', countPerPhase: 5 });
  diagnostics.push(...plan.diagnostics.filter((item) => item.severity === 'error'));
  const ready = !diagnostics.some((item) => item.severity === 'error');

  return {
    profile,
    ready,
    diagnostics,
    catalog,
    counts: {
      focuses: profile.focuses.length,
      vocabulary: profile.activeVocabulary.length,
      contexts: profile.contexts.length,
      sentences: profile.banks.sentences.length,
      dialogues: profile.banks.dialogues.length,
      errorPairs: profile.banks.errorPairs.length,
      translations: profile.banks.translations.length,
      transformations: profile.banks.transformations.length,
      speakingPrompts: profile.banks.speakingPrompts.length,
      writingPrompts: profile.banks.writingPrompts.length,
    },
  };
}
