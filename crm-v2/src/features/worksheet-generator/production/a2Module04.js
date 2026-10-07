import roadmap from '../../curriculum/a2Roadmap.json';
import { createGrammarTarget } from '../../curriculum/grammarProgression.js';
import { createVocabularyEntry } from '../../curriculum/textbookVocabulary.js';
import { generateLessonBundle } from '../engine/generator.js';
import { lexicalCoverageReport, planLexicalRecycling, planModuleActivities, scheduledVocabularyForLesson } from '../engine/modulePlanner.js';
import { generatorProfileForLesson } from '../profiles/index.js';
import { A2_MODULE_03_CORE_VOCABULARY } from './a2Module03.js';

export const A2_MODULE_04_ID = 'a2-module-04';
export const A2_MODULE_04_VERSION = 1;

const moduleData = roadmap.modules.find((item) => item.id === A2_MODULE_04_ID);
const previousModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-03')?.lessons || []).map((lesson) => lesson.id);
const lessonIds = (moduleData?.lessons || []).map((lesson) => lesson.id);
const nextModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-05')?.lessons || []).map((lesson) => lesson.id);

const vocab = (id, lemma, forms, translationRu, partOfSpeech, topicIds = ['kodu-ja-umbrus']) => createVocabularyEntry({
  id, lemma, forms, translationRu, level: 'A2', topicIds, partOfSpeech,
  collocations: [], government: '', example: '',
});

export const A2_MODULE_04_CORE_VOCABULARY = Object.freeze([
  vocab('a2m04-tuba', 'tuba', ['tuba', 'toa', 'tuba'], 'комната', 'noun'),
  vocab('a2m04-kook', 'köök', ['köök', 'köögi', 'kööki'], 'кухня', 'noun'),
  vocab('a2m04-vannituba', 'vannituba', ['vannituba', 'vannitoa', 'vannituba'], 'ванная комната', 'noun'),
  vocab('a2m04-esik', 'esik', ['esik', 'esiku', 'esikut'], 'прихожая', 'noun'),
  vocab('a2m04-rodu', 'rõdu', ['rõdu', 'rõdu', 'rõdu'], 'балкон', 'noun'),
  vocab('a2m04-laud', 'laud', ['laud', 'laua', 'lauda'], 'стол', 'noun'),
  vocab('a2m04-tool', 'tool', ['tool', 'tooli', 'tooli'], 'стул', 'noun'),
  vocab('a2m04-diivan', 'diivan', ['diivan', 'diivani', 'diivanit'], 'диван', 'noun'),
  vocab('a2m04-kapp', 'kapp', ['kapp', 'kapi', 'kappi'], 'шкаф', 'noun'),
  vocab('a2m04-korrus', 'korrus', ['korrus', 'korruse', 'korrust'], 'этаж', 'noun'),
  vocab('a2m04-lift', 'lift', ['lift', 'lifti', 'lifti'], 'лифт', 'noun'),
  vocab('a2m04-parkla', 'parkla', ['parkla', 'parkla', 'parklat'], 'парковка', 'noun'),
  vocab('a2m04-bussipeatus', 'bussipeatus', ['bussipeatus', 'bussipeatuse', 'bussipeatust'], 'автобусная остановка', 'noun'),
  vocab('a2m04-apteek', 'apteek', ['apteek', 'apteegi', 'apteeki'], 'аптека', 'noun'),
  vocab('a2m04-asuma', 'asuma', ['asuma', 'asuda', 'asun'], 'находиться / располагаться', 'verb'),
  vocab('a2m04-liikuma', 'liikuma', ['liikuma', 'liikuda', 'liigun'], 'двигаться / перемещаться', 'verb'),
]);

export const A2_MODULE_04_GRAMMAR = Object.freeze([
  createGrammarTarget({
    id: 'a2-inner-local-cases',
    label: 'Sisekohakäänded: Kus? Kuhu? Kust?',
    firstLevel: 'A2', firstLessonId: 'a2-017', masteryLevel: 'A2',
    controlledLessonIds: ['a2-017', 'a2-019'], retrievalLessonIds: ['a2-020', 'a2-021', 'a2-025'],
    commonErrorsRu: ['kuhu-vorm asendatakse kus-vormiga', 'kodusse kasutatakse seal, kus loomulik vorm on koju'],
    explanation: 'Sisekohakäänded väljendavad sees olemist, sisse liikumist ja seest väljumist.',
    contrasts: ['poes / poodi / poest', 'koolis / kooli / koolist', 'toas / tuppa / toast'],
  }),
  createGrammarTarget({
    id: 'a2-outer-local-cases',
    label: 'Väliskohakäänded: Kus? Kuhu? Kust?',
    firstLevel: 'A2', firstLessonId: 'a2-018', masteryLevel: 'A2',
    controlledLessonIds: ['a2-018', 'a2-019'], retrievalLessonIds: ['a2-020', 'a2-021', 'a2-025'],
    commonErrorsRu: ['-l/-le/-lt segunevad sisekohakäänetega', 'töö ja arst valitakse mehaaniliselt vale sarjaga'],
    explanation: 'Väliskohakäänded väljendavad pinnal/asukohas olemist, sinna liikumist ja sealt tulemist.',
    contrasts: ['tööl / tööle / töölt', 'laual / lauale / laualt', 'arstil / arstile / arstilt'],
  }),
  createGrammarTarget({
    id: 'a2-local-case-choice',
    label: 'Sise- ja väliskohakäänete valik',
    firstLevel: 'A2', firstLessonId: 'a2-017', masteryLevel: 'B1',
    controlledLessonIds: ['a2-018', 'a2-019'], retrievalLessonIds: ['a2-020', 'a2-021', 'a2-025', 'a2-046'],
    commonErrorsRu: ['õppija valib ainult küsimuse, aga mitte sõna loomulikku käändesarja'],
    explanation: 'Kõigepealt vali tähendus Kus/Kuhu/Kust, seejärel sõnale sobiv sise- või välissari.',
    contrasts: ['poes, aga turul', 'koolis, aga tööl', 'toas, aga laual'],
  }),
  createGrammarTarget({
    id: 'a2-spatial-relations',
    label: 'Asukoht: lähedal, kõrval, vastas',
    firstLevel: 'A2', firstLessonId: 'a2-019', masteryLevel: 'A2',
    controlledLessonIds: ['a2-019'], retrievalLessonIds: ['a2-020', 'a2-046'],
    commonErrorsRu: ['kõrval järel jääb omastav kasutamata', 'lähedal ja lähedale segunevad'],
    explanation: 'Asukoha kirjeldamisel kasutame sageli omastavat: poe kõrval, maja vastas, kodu lähedal.',
    contrasts: ['poe kõrval', 'maja vastas', 'kodu lähedal'],
  }),
]);

function enrichProfile(profile, plannedVocabulary, previousVocabulary, lessonId) {
  if (!profile) return null;
  const focusIds = (profile.focuses || []).map((item) => item.id);
  const allVocabulary = [...previousVocabulary, ...plannedVocabulary];
  const scheduled = scheduledVocabularyForLesson(allVocabulary, lessonId, focusIds);
  const seen = new Set();
  const activeVocabulary = [...scheduled, ...(profile.activeVocabulary || [])].filter((item) => {
    const key = String(item.word || '').toLocaleLowerCase('et');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    ...profile,
    module: moduleData?.title || 'Kodu ja ümbrus',
    activeVocabulary,
    recycledVocabularyIds: scheduled
      .filter((item) => previousVocabulary.some((entry) => entry.id === item.id))
      .map((item) => item.id),
    grammarTargets: A2_MODULE_04_GRAMMAR,
    textbookVocabulary: allVocabulary,
    currentModuleLessonIds: lessonIds,
    previousModuleLessonIds,
  };
}

export function generateA2Module04({
  levelLexicon = [],
  seed = 'a2-module-04:textbook:v1',
  difficulty = 'core',
} = {}) {
  const lessons = moduleData?.lessons || [];
  const baseProfiles = lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
  const diagnostics = [];

  baseProfiles.forEach((profile, index) => {
    if (!profile) diagnostics.push({
      severity: 'error',
      code: 'A2_MODULE_04_PROFILE_MISSING',
      lessonId: lessons[index]?.id || '',
      message: 'Tunnil puudub valmis generaatoriprofiil.',
    });
  });

  const previousVocabulary = planLexicalRecycling(A2_MODULE_03_CORE_VOCABULARY, previousModuleLessonIds, lessonIds);
  const plannedVocabulary = planLexicalRecycling(A2_MODULE_04_CORE_VOCABULARY, lessonIds, nextModuleLessonIds);
  const lexicalCoverage = lexicalCoverageReport(plannedVocabulary, lessonIds, nextModuleLessonIds);
  if (!lexicalCoverage.ready) diagnostics.push({
    severity: 'error',
    code: 'A2_MODULE_04_LEXICAL_RECYCLING_LOW',
    message: 'Mooduli põhisõnavara kordusplaan ei vasta õpiku standardile.',
  });

  const profiles = baseProfiles.map((profile, index) =>
    enrichProfile(profile, plannedVocabulary, previousVocabulary, lessons[index]?.id));
  const modulePlan = planModuleActivities({ lessons, profiles, seed, difficulty, countPerPhase: 5 });
  diagnostics.push(...modulePlan.diagnostics);

  const bundles = lessons.map((lesson, index) => {
    const profile = profiles[index];
    const planned = modulePlan.plans[index];
    if (!profile || !planned) return { lessonId: lesson.id, sheets: [], diagnostics: [] };
    const generated = generateLessonBundle({
      lesson, profile, levelLexicon,
      seed: `${seed}:${lesson.id}`,
      difficulty,
      variant: A2_MODULE_04_VERSION,
      activityPlan: planned.phases,
    });
    return { lessonId: lesson.id, ...generated };
  });

  diagnostics.push(...bundles.flatMap((bundle) => (bundle.diagnostics || []).map((item) => ({
    ...item, lessonId: bundle.lessonId,
  }))));

  const complete = bundles.length === 5 && bundles.every((bundle) =>
    bundle.sheets?.length === 3 &&
    bundle.sheets.map((sheet) => sheet.phase).join(',') === 'discover,practice,transfer');

  return {
    moduleId: A2_MODULE_04_ID,
    moduleTitle: moduleData?.title || '',
    version: A2_MODULE_04_VERSION,
    lessonIds,
    previousVocabulary,
    plannedVocabulary,
    lexicalCoverage,
    grammarTargets: A2_MODULE_04_GRAMMAR,
    modulePlan,
    bundles,
    diagnostics,
    ready: complete && lexicalCoverage.ready && modulePlan.ready && !diagnostics.some((item) => item.severity === 'error'),
  };
}
