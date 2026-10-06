import { canBuildPatternProfile, createPatternProfile } from '../patterns/profileFromPatterns.js';
import { sanitizeGeneratorProfile, validateGeneratorProfile } from '../profiles/authoring.js';
import {
  CONTENT_LIBRARY_SCHEMA,
  CONTENT_LIBRARY_VERSION,
  LESSON_CONTENT_BLUEPRINTS,
  REUSABLE_CONTENT_LIBRARY,
} from './contentLibrary.js';

export const CONTENT_PACK_FACTORY_SCHEMA = 'keelesepp.content-pack-factory/1';
export const CONTENT_PACK_FACTORY_VERSION = 1;

const PACK_KEYWORDS = Object.freeze({
  introduction: ['tutvumine', 'viisakus', 'представ', 'знаком'],
  'basic-questions': ['küsim', 'вопрос'],
  'olema-present': ['olema', 'быть'],
  'present-common-verbs': ['olevik', 'elan', 'räägin', 'настоящ'],
  'personal-info': ['isikuand', 'ankeet', 'личн', 'анкет'],
  'numbers-dates': ['arvud', 'kuupäev', 'kontakt', 'числ', 'дат'],
  'family-relations': ['pere', 'lähed', 'sugulas', 'семь', 'близк'],
  'possession-genitive': ['genitiiv', 'omastav', 'kelle oma', 'принадлеж'],
  'appearance-character': ['välimus', 'iseloom', 'внешн', 'характер'],
  'people-profiles': ['minu inimesed', 'isikukirjeld'],
  'daily-routine': ['minu päev', 'päevakava', 'распорядок'],
  'clock-time': ['kellaaeg', 'ajaväljend'],
  frequency: ['kui tihti', 'sagedus', 'частотн'],
  'week-plan': ['minu nädal', 'nädalaplaan'],
});

// Lessons without a hand-written pack whose roadmap focus is a covered grammar point: the profile is generated from
// grammar patterns + the Vabamorf lexicon (patterns/). Only lessons where the patterns really teach the lesson focus.
export const LESSON_GRAMMAR_POINTS = Object.freeze({
  'a2-016': ['adjective-agreement'],
  'a2-017': ['local-inner'],
  'a2-018': ['surface-local'],
  'a2-019': ['local-cases', 'adjective-agreement'],
  'a2-020': ['local-inner', 'surface-local', 'adjective-agreement'],
  'a2-021': ['local-cases'],
  'a2-026': ['partitive-object'],
  'a2-027': ['partitive-object', 'numeral-partitive'],
  'a2-023': ['imperative'],
  'a2-025': ['local-cases', 'imperative'],
  'a2-030': ['partitive-object', 'numeral-partitive'],
  'a2-032': ['numeral-partitive'],
  'a2-033': ['comparison', 'adjective-agreement'],
  'a2-035': ['numeral-partitive', 'comparison'],
  'a2-037': ['modal-verbs'],
  'a2-040': ['modal-verbs', 'imperative'],
  'a2-042': ['mul-on'],
  'a2-045': ['mul-on', 'imperative'],
  'a2-047': ['meeldima'],
  'a2-050': ['meeldima', 'infinitive-want'],
  'a2-052': ['comparison'],
  'a2-055': ['comparison'],
  'a2-059': ['past-simple'],
  'a2-060': ['past-simple', 'local-cases'],
  'a2-062': ['modal-verbs', 'infinitive-want'],
  'a2-064': ['imperative'],
  'a2-065': ['modal-verbs', 'imperative'],
  'a2-068': ['infinitive-want'],
  'a2-070': ['infinitive-want', 'modal-verbs'],
  'a2-072': ['imperative', 'modal-verbs'],
  'a2-076': ['past-simple'],
  'a2-077': ['past-simple'],
  'a2-080': ['past-simple'],
  'a2-081': ['future-present'],
  'a2-085': ['future-present'],
});

export function lessonGrammarPoints(lesson = {}) {
  const lessonId = String(lesson.id || '');
  if (LESSON_CONTENT_BLUEPRINTS[lessonId]) return [];
  return [...(LESSON_GRAMMAR_POINTS[lessonId] || [])];
}

const arrays = (packs, key) => packs.flatMap((pack) => pack[key] || []);

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    const id = String(item?.id || '');
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function suggestReusablePackIds(lesson = {}) {
  const explicit = LESSON_CONTENT_BLUEPRINTS[String(lesson.id || '')]?.packIds;
  if (explicit) return [...explicit];
  if (lessonGrammarPoints(lesson).length) return [];
  const searchable = [lesson.title, lesson.goal, lesson.languageFocus, lesson.focus, lesson.practice]
    .map((value) => String(value || '').toLocaleLowerCase('et'))
    .join(' ');
  return Object.entries(PACK_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => searchable.includes(keyword)))
    .map(([id]) => id);
}

export function createContentPackDraft(lesson = {}, { packIds = suggestReusablePackIds(lesson) } = {}) {
  const lessonId = String(lesson.id || '').trim();
  const blueprint = LESSON_CONTENT_BLUEPRINTS[lessonId] || {};
  const selectedIds = [...new Set((packIds || []).filter((id) => REUSABLE_CONTENT_LIBRARY[id]))];
  const packs = selectedIds.map((id) => REUSABLE_CONTENT_LIBRARY[id]);
  const grammarPoints = packs.length ? [] : lessonGrammarPoints(lesson);
  if (lessonId && grammarPoints.length && canBuildPatternProfile(grammarPoints)) {
    const profile = createPatternProfile({ ...lesson, id: lessonId }, grammarPoints);
    const readiness = validateGeneratorProfile(profile, { lessonId, lesson });
    return {
      schema: CONTENT_PACK_FACTORY_SCHEMA,
      version: CONTENT_PACK_FACTORY_VERSION,
      status: readiness.ready ? 'ready' : 'draft',
      source: 'patterns',
      profile,
      readiness,
      selectedPackIds: [],
      grammarPoints,
      missingSources: [],
      library: { schema: CONTENT_LIBRARY_SCHEMA, version: CONTENT_LIBRARY_VERSION },
    };
  }
  const missingSources = [];
  if (!lessonId) missingSources.push('Tunni ID puudub.');
  if (!packs.length) missingSources.push('Sobivat kontrollitud sisupanka ei leitud.');

  if (missingSources.length) {
    return {
      schema: CONTENT_PACK_FACTORY_SCHEMA,
      version: CONTENT_PACK_FACTORY_VERSION,
      status: 'missing-sources',
      profile: null,
      readiness: null,
      selectedPackIds: selectedIds,
      missingSources,
      library: { schema: CONTENT_LIBRARY_SCHEMA, version: CONTENT_LIBRARY_VERSION },
    };
  }

  const profile = sanitizeGeneratorProfile({
    lessonId,
    lessonKind: blueprint.lessonKind || lesson.roadmapKind || lesson.kind,
    level: lesson.levelStage || lesson.level || 'A2',
    title: blueprint.title || lesson.title || lessonId,
    focuses: uniqueById(packs.map((pack) => pack.focus)),
    activeVocabulary: uniqueById(arrays(packs, 'vocabulary')),
    contexts: uniqueById(arrays(packs, 'contexts')),
    banks: {
      sentences: uniqueById(arrays(packs, 'sentences')),
      dialogues: uniqueById(arrays(packs, 'dialogues')),
      errorPairs: uniqueById(arrays(packs, 'errorPairs')),
      translations: uniqueById(arrays(packs, 'translations')),
      transformations: uniqueById(arrays(packs, 'transformations')),
      speakingPrompts: uniqueById(arrays(packs, 'speakingPrompts')),
      writingPrompts: uniqueById(arrays(packs, 'writingPrompts')),
    },
    successCriteria: [...new Set(arrays(packs, 'successCriteria'))],
  }, { lessonId, lesson });
  const readiness = validateGeneratorProfile(profile, { lessonId, lesson });

  return {
    schema: CONTENT_PACK_FACTORY_SCHEMA,
    version: CONTENT_PACK_FACTORY_VERSION,
    status: readiness.ready ? 'ready' : 'draft',
    profile,
    readiness,
    selectedPackIds: selectedIds,
    missingSources,
    library: { schema: CONTENT_LIBRARY_SCHEMA, version: CONTENT_LIBRARY_VERSION },
  };
}

export function canCreateContentPackDraft(lesson = {}) {
  return suggestReusablePackIds(lesson).length > 0 || lessonGrammarPoints(lesson).length > 0;
}
