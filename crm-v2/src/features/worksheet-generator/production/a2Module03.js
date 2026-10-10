import roadmap from '../../curriculum/a2Roadmap.json';
import { createGrammarTarget } from '../../curriculum/grammarProgression.js';
import { createVocabularyEntry } from '../../curriculum/textbookVocabulary.js';
import { generateTextbookLessonBundle } from '../engine/generator.js';
import { lexicalCoverageReport, planLexicalRecycling, planModuleActivities, scheduledVocabularyForLesson } from '../engine/modulePlanner.js';
import { generatorProfileForLesson } from '../profiles/index.js';
import { A2_MODULE_02_CORE_VOCABULARY } from './a2Module02.js';

export const A2_MODULE_03_ID = 'a2-module-03';
export const A2_MODULE_03_VERSION = 1;

const moduleData = roadmap.modules.find((item) => item.id === A2_MODULE_03_ID);
const previousModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-02')?.lessons || []).map((lesson) => lesson.id);
const lessonIds = (moduleData?.lessons || []).map((lesson) => lesson.id);
const nextModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-04')?.lessons || []).map((lesson) => lesson.id);

const vocab = (id, lemma, forms, translationRu, partOfSpeech, topicIds = ['paev-ja-aeg']) => createVocabularyEntry({
  id,
  lemma,
  forms,
  translationRu,
  level: 'A2',
  topicIds,
  partOfSpeech,
  collocations: [],
  government: '',
  example: '',
});

export const A2_MODULE_03_CORE_VOCABULARY = Object.freeze([
  vocab('a2m03-arkama', 'ärkama', ['ärkama', 'ärgata', 'ärkan'], 'просыпаться', 'verb'),
  vocab('a2m03-sooma', 'sööma', ['sööma', 'süüa', 'söön'], 'есть', 'verb'),
  vocab('a2m03-minema', 'minema', ['minema', 'minna', 'lähen'], 'идти / ехать', 'verb'),
  vocab('a2m03-tulema', 'tulema', ['tulema', 'tulla', 'tulen'], 'приходить / приезжать', 'verb'),
  vocab('a2m03-puhkama', 'puhkama', ['puhkama', 'puhata', 'puhkan'], 'отдыхать', 'verb'),
  vocab('a2m03-magama', 'magama', ['magama', 'magada', 'magan'], 'спать', 'verb'),
  vocab('a2m03-alustama', 'alustama', ['alustama', 'alustada', 'alustan'], 'начинать', 'verb'),
  vocab('a2m03-lopetama', 'lõpetama', ['lõpetama', 'lõpetada', 'lõpetan'], 'заканчивать', 'verb'),
  vocab('a2m03-kohtuma', 'kohtuma', ['kohtuma', 'kohtuda', 'kohtun'], 'встречаться', 'verb'),
  vocab('a2m03-koristama', 'koristama', ['koristama', 'koristada', 'koristan'], 'убирать', 'verb'),
  vocab('a2m03-jalutama', 'jalutama', ['jalutama', 'jalutada', 'jalutan'], 'гулять', 'verb'),
  vocab('a2m03-hommik', 'hommik', ['hommik', 'hommiku', 'hommikut'], 'утро', 'noun'),
  vocab('a2m03-paev', 'päev', ['päev', 'päeva', 'päeva'], 'день', 'noun'),
  vocab('a2m03-ohtu', 'õhtu', ['õhtu', 'õhtu', 'õhtut'], 'вечер', 'noun'),
  vocab('a2m03-nadal', 'nädal', ['nädal', 'nädala', 'nädalat'], 'неделя', 'noun'),
  vocab('a2m03-nadalavahetus', 'nädalavahetus', ['nädalavahetus', 'nädalavahetuse', 'nädalavahetust'], 'выходные', 'noun'),
]);

export const A2_MODULE_03_GRAMMAR = Object.freeze([
  createGrammarTarget({
    id: 'a2-time-adverbials-word-order',
    label: 'Ajamäärus ja lihtne sõnajärg',
    firstLevel: 'A2',
    firstLessonId: 'a2-011',
    masteryLevel: 'A2',
    controlledLessonIds: ['a2-011', 'a2-013', 'a2-014'],
    retrievalLessonIds: ['a2-015', 'a2-016'],
    commonErrorsRu: ['ajamääruse järel korratakse vene sõnajärge', 'tegusõna jääb liiga kaugele lause algusest'],
    explanation: 'Kui lause algab ajamäärusega, jääb öeldis varakult: Hommikul lähen ma tööle.',
    contrasts: ['Ma lähen hommikul tööle.', 'Hommikul lähen ma tööle.'],
  }),
  createGrammarTarget({
    id: 'a2-clock-time-range',
    label: 'Kellaaeg, enne/pärast ja alates/kuni',
    firstLevel: 'A2',
    firstLessonId: 'a2-012',
    masteryLevel: 'A2',
    controlledLessonIds: ['a2-012', 'a2-014'],
    retrievalLessonIds: ['a2-015', 'a2-016'],
    commonErrorsRu: ['pool seitse tõlgendatakse 7:30 asemel 6:30 valesti', 'alates/kuni konstruktsioon jääb poolikuks'],
    explanation: 'Eesti kellaaeg kasutab järgmise tunni loogikat: pool seitse = 6:30.',
    contrasts: ['kell kuus / pool seitse', 'enne tundi / pärast tööd', 'alates üheksast kuni viieni'],
  }),
  createGrammarTarget({
    id: 'a2-frequency-adverbs',
    label: 'Sagedus: alati, tavaliselt, mõnikord, harva, mitte kunagi',
    firstLevel: 'A2',
    firstLessonId: 'a2-013',
    masteryLevel: 'A2',
    controlledLessonIds: ['a2-013', 'a2-014'],
    retrievalLessonIds: ['a2-015', 'a2-021'],
    commonErrorsRu: ['sagedusmäärus paigutatakse juhuslikult', 'mitte kunagi kasutatakse ilma eituseta'],
    explanation: 'Sagedusmäärus näitab, kui tihti tegevus toimub; mitte kunagi käib koos eitusega.',
    contrasts: ['Ma tavaliselt töötan kodus.', 'Ma ei tööta mitte kunagi pühapäeval.'],
  }),
  createGrammarTarget({
    id: 'a2-sequence-connectors',
    label: 'Tegevuste järjestus: siis, pärast seda, ja, aga',
    firstLevel: 'A2',
    firstLessonId: 'a2-014',
    masteryLevel: 'A2',
    controlledLessonIds: ['a2-014'],
    retrievalLessonIds: ['a2-015', 'a2-021'],
    commonErrorsRu: ['tekst jääb üksikute lausete loendiks', 'siis ja pärast seda korduvad ilma vahelduseta'],
    explanation: 'Sidesõnad ja järjestusmarkerid seovad päevast või nädalast rääkides laused tervikuks.',
    contrasts: ['Kõigepealt …, siis …', 'Pärast seda …', '…, aga …'],
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
    module: moduleData?.title || 'Päev, aeg ja nädal',
    activeVocabulary,
    recycledVocabularyIds: scheduled.filter((item) => previousVocabulary.some((entry) => entry.id === item.id)).map((item) => item.id),
    grammarTargets: A2_MODULE_03_GRAMMAR,
    textbookVocabulary: allVocabulary,
    currentModuleLessonIds: lessonIds,
    previousModuleLessonIds,
  };
}

export function generateA2Module03({
  levelLexicon = [],
  seed = 'a2-module-03:textbook:v1',
  difficulty = 'core',
} = {}) {
  const lessons = moduleData?.lessons || [];
  const baseProfiles = lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
  const diagnostics = [];

  baseProfiles.forEach((profile, index) => {
    if (!profile) diagnostics.push({
      severity: 'error',
      code: 'A2_MODULE_03_PROFILE_MISSING',
      lessonId: lessons[index]?.id || '',
      message: 'Tunnil puudub valmis generaatoriprofiil.',
    });
  });

  const previousVocabulary = planLexicalRecycling(A2_MODULE_02_CORE_VOCABULARY, previousModuleLessonIds, lessonIds);
  const plannedVocabulary = planLexicalRecycling(A2_MODULE_03_CORE_VOCABULARY, lessonIds, nextModuleLessonIds);
  const lexicalCoverage = lexicalCoverageReport(plannedVocabulary, lessonIds, nextModuleLessonIds);
  if (!lexicalCoverage.ready) diagnostics.push({
    severity: 'error',
    code: 'A2_MODULE_03_LEXICAL_RECYCLING_LOW',
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
    const generated = generateTextbookLessonBundle({
      lesson,
      profile,
      levelLexicon,
      seed: `${seed}:${lesson.id}`,
      difficulty,
      variant: A2_MODULE_03_VERSION,
      activityPlan: planned.phases,
    });
    return { lessonId: lesson.id, ...generated };
  });

  diagnostics.push(...bundles.flatMap((bundle) => (bundle.diagnostics || []).map((item) => ({
    ...item,
    lessonId: bundle.lessonId,
  }))));

  const complete = bundles.length === 5 && bundles.every((bundle) =>
    bundle.sheets?.length === 3 &&
    bundle.sheets.map((sheet) => sheet.phase).join(',') === 'discover,practice,transfer');

  return {
    moduleId: A2_MODULE_03_ID,
    moduleTitle: moduleData?.title || '',
    version: A2_MODULE_03_VERSION,
    lessonIds,
    previousVocabulary,
    plannedVocabulary,
    lexicalCoverage,
    grammarTargets: A2_MODULE_03_GRAMMAR,
    modulePlan,
    bundles,
    diagnostics,
    ready: complete && lexicalCoverage.ready && modulePlan.ready && !diagnostics.some((item) => item.severity === 'error'),
  };
}
