import roadmap from '../../curriculum/a2Roadmap.json';
import { createGrammarTarget } from '../../curriculum/grammarProgression.js';
import { createVocabularyEntry } from '../../curriculum/textbookVocabulary.js';
import { generateTextbookLessonBundle } from '../engine/generator.js';
import { lexicalCoverageReport, planLexicalRecycling, planModuleActivities, scheduledVocabularyForLesson } from '../engine/modulePlanner.js';
import { generatorProfileForLesson } from '../profiles/index.js';
import { A2_MODULE_05_CORE_VOCABULARY } from './a2Module05.js';

export const A2_MODULE_06_ID = 'a2-module-06';
export const A2_MODULE_06_VERSION = 1;

const moduleData = roadmap.modules.find((item) => item.id === A2_MODULE_06_ID);
const previousModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-05')?.lessons || []).map((lesson) => lesson.id);
const lessonIds = (moduleData?.lessons || []).map((lesson) => lesson.id);
const nextModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-07')?.lessons || []).map((lesson) => lesson.id);

const vocab = (id, lemma, forms, translationRu, partOfSpeech, topicIds = ['sook-ja-kohvik']) => createVocabularyEntry({
  id, lemma, forms, translationRu, level: 'A2', topicIds, partOfSpeech,
  collocations: [], government: '', example: '',
});

export const A2_MODULE_06_CORE_VOCABULARY = Object.freeze([
  vocab('a2m06-leib', 'leib', ['leib', 'leiva', 'leiba'], 'хлеб', 'noun'),
  vocab('a2m06-piim', 'piim', ['piim', 'piima', 'piima'], 'молоко', 'noun'),
  vocab('a2m06-liha', 'liha', ['liha', 'liha', 'liha'], 'мясо', 'noun'),
  vocab('a2m06-kala', 'kala', ['kala', 'kala', 'kala'], 'рыба', 'noun'),
  vocab('a2m06-koogivili', 'köögivili', ['köögivili', 'köögivilja', 'köögivilja'], 'овощи', 'noun'),
  vocab('a2m06-puuvili', 'puuvili', ['puuvili', 'puuvilja', 'puuvilja'], 'фрукты', 'noun'),
  vocab('a2m06-supp', 'supp', ['supp', 'supi', 'suppi'], 'суп', 'noun'),
  vocab('a2m06-salat', 'salat', ['salat', 'salati', 'salatit'], 'салат', 'noun'),
  vocab('a2m06-kohv', 'kohv', ['kohv', 'kohvi', 'kohvi'], 'кофе', 'noun'),
  vocab('a2m06-tee', 'tee', ['tee', 'tee', 'teed'], 'чай', 'noun'),
  vocab('a2m06-kilo', 'kilo', ['kilo', 'kilo', 'kilo'], 'килограмм', 'noun'),
  vocab('a2m06-liiter', 'liiter', ['liiter', 'liitri', 'liitrit'], 'литр', 'noun'),
  vocab('a2m06-klaas', 'klaas', ['klaas', 'klaasi', 'klaasi'], 'стакан', 'noun'),
  vocab('a2m06-tass', 'tass', ['tass', 'tassi', 'tassi'], 'чашка', 'noun'),
  vocab('a2m06-tellima', 'tellima', ['tellima', 'tellida', 'tellin'], 'заказывать', 'verb'),
  vocab('a2m06-maksma', 'maksma', ['maksma', 'maksta', 'maksan'], 'платить / стоить', 'verb'),
]);

export const A2_MODULE_06_GRAMMAR = Object.freeze([
  createGrammarTarget({
    id: 'a2-quantity-partitive',
    label: 'Kogus + partitiiv',
    firstLevel: 'A2', firstLessonId: 'a2-027', masteryLevel: 'A2',
    controlledLessonIds: ['a2-027', 'a2-028'], retrievalLessonIds: ['a2-029', 'a2-030', 'a2-032'],
    commonErrorsRu: ['koguse järel kasutatakse nimetavat', 'üks ja mitu kogust saavad sama vormi ilma tähendust kontrollimata'],
    explanation: 'Koguse järel on toidu või joogi sõna tavaliselt partitiivis: kilo õunu, liiter piima, tass kohvi.',
    contrasts: ['üks õun / kaks õuna', 'piim / liiter piima', 'kohv / tass kohvi'],
  }),
  createGrammarTarget({
    id: 'a2-cafe-request',
    label: 'Viisakas tellimus ja täpsustamine',
    firstLevel: 'A2', firstLessonId: 'a2-028', masteryLevel: 'A2',
    controlledLessonIds: ['a2-028'], retrievalLessonIds: ['a2-029', 'a2-030', 'a2-036'],
    commonErrorsRu: ['tahan kasutatakse igas olukorras viisaka tellimuse asemel', 'küsimus Kas teil on…? jääb ilma sobiva vormita'],
    explanation: 'Teeninduses kasuta viisakat soovi: Ma soovin…, Palun mulle…, Kas teil on…?, Arve, palun.',
    contrasts: ['Ma tahan kohvi. / Ma soovin kohvi.', 'Palun mulle tee. / Kas teil on rohelist teed?'],
  }),
  createGrammarTarget({
    id: 'a2-without-form',
    label: 'Ilma + -ta',
    firstLevel: 'A2', firstLessonId: 'a2-028', masteryLevel: 'B1',
    controlledLessonIds: ['a2-028', 'a2-029'], retrievalLessonIds: ['a2-030', 'a2-053'],
    commonErrorsRu: ['ilma järel kasutatakse nimetavat või partitiivi', 'ilma ja koos konstruktsioonid segunevad'],
    explanation: 'Kui ütled, et midagi ei ole toidus või joogis, kasuta ilma + -ta: ilma piimata, ilma sibulata.',
    contrasts: ['piimaga / ilma piimata', 'sibulaga / ilma sibulata'],
  }),
  createGrammarTarget({
    id: 'a2-price-order-listening',
    label: 'Hind, kogus ja tellimuse muutus kuulamisel',
    firstLevel: 'A2', firstLessonId: 'a2-029', masteryLevel: 'A2',
    controlledLessonIds: ['a2-029'], retrievalLessonIds: ['a2-030', 'a2-032'],
    commonErrorsRu: ['eurot ja senti kuuldakse ühe arvuna', 'algne ja muudetud tellimus lähevad segamini'],
    explanation: 'Kuulamisel kontrolli eraldi toodet, kogust, hinda ja seda, mis tellimuses muutus.',
    contrasts: ['2 eurot / 2 eurot 50 senti', 'algne tellimus / lõplik tellimus'],
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
    module: moduleData?.title || 'Söök, jook ja kohvik',
    activeVocabulary,
    recycledVocabularyIds: scheduled
      .filter((item) => previousVocabulary.some((entry) => entry.id === item.id))
      .map((item) => item.id),
    grammarTargets: A2_MODULE_06_GRAMMAR,
    textbookVocabulary: allVocabulary,
    currentModuleLessonIds: lessonIds,
    previousModuleLessonIds,
  };
}

export function generateA2Module06({
  levelLexicon = [],
  seed = 'a2-module-06:textbook:v1',
  difficulty = 'core',
} = {}) {
  const lessons = moduleData?.lessons || [];
  const baseProfiles = lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
  const diagnostics = [];

  baseProfiles.forEach((profile, index) => {
    if (!profile) diagnostics.push({
      severity: 'error',
      code: 'A2_MODULE_06_PROFILE_MISSING',
      lessonId: lessons[index]?.id || '',
      message: 'Tunnil puudub valmis generaatoriprofiil.',
    });
  });

  const previousVocabulary = planLexicalRecycling(A2_MODULE_05_CORE_VOCABULARY, previousModuleLessonIds, lessonIds);
  const plannedVocabulary = planLexicalRecycling(A2_MODULE_06_CORE_VOCABULARY, lessonIds, nextModuleLessonIds);
  const lexicalCoverage = lexicalCoverageReport(plannedVocabulary, lessonIds, nextModuleLessonIds);
  if (!lexicalCoverage.ready) diagnostics.push({
    severity: 'error',
    code: 'A2_MODULE_06_LEXICAL_RECYCLING_LOW',
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
      lesson, profile, levelLexicon,
      seed: `${seed}:${lesson.id}`,
      difficulty,
      variant: A2_MODULE_06_VERSION,
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
    moduleId: A2_MODULE_06_ID,
    moduleTitle: moduleData?.title || '',
    version: A2_MODULE_06_VERSION,
    lessonIds,
    previousVocabulary,
    plannedVocabulary,
    lexicalCoverage,
    grammarTargets: A2_MODULE_06_GRAMMAR,
    modulePlan,
    bundles,
    diagnostics,
    ready: complete && lexicalCoverage.ready && modulePlan.ready && !diagnostics.some((item) => item.severity === 'error'),
  };
}
