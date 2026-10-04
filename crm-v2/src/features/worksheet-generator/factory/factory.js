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
});

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
  return suggestReusablePackIds(lesson).length > 0;
}
