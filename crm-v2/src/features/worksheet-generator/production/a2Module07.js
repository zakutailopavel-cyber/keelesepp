import roadmap from '../../curriculum/a2Roadmap.json';
import { createGrammarTarget } from '../../curriculum/grammarProgression.js';
import { createVocabularyEntry } from '../../curriculum/textbookVocabulary.js';
import { generateLessonBundle } from '../engine/generator.js';
import { lexicalCoverageReport, planLexicalRecycling, planModuleActivities, scheduledVocabularyForLesson } from '../engine/modulePlanner.js';
import { generatorProfileForLesson } from '../profiles/index.js';
import { A2_MODULE_06_CORE_VOCABULARY } from './a2Module06.js';

export const A2_MODULE_07_ID = 'a2-module-07';
export const A2_MODULE_07_VERSION = 1;

const moduleData = roadmap.modules.find((item) => item.id === A2_MODULE_07_ID);
const previousModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-06')?.lessons || []).map((lesson) => lesson.id);
const lessonIds = (moduleData?.lessons || []).map((lesson) => lesson.id);
const nextModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-08')?.lessons || []).map((lesson) => lesson.id);

const vocab = (id, lemma, forms, translationRu, partOfSpeech, topicIds = ['pood-raha-ostud']) => createVocabularyEntry({
  id, lemma, forms, translationRu, level: 'A2', topicIds, partOfSpeech,
  collocations: [], government: '', example: '',
});

export const A2_MODULE_07_CORE_VOCABULARY = Object.freeze([
  vocab('a2m07-kaup', 'kaup', ['kaup', 'kauba', 'kaupa'], 'товар', 'noun'),
  vocab('a2m07-riided', 'riided', ['riided', 'riiete', 'riideid'], 'одежда', 'noun'),
  vocab('a2m07-jalanoud', 'jalanõud', ['jalanõud', 'jalanõude', 'jalanõusid'], 'обувь', 'noun'),
  vocab('a2m07-suurus', 'suurus', ['suurus', 'suuruse', 'suurust'], 'размер', 'noun'),
  vocab('a2m07-varv', 'värv', ['värv', 'värvi', 'värvi'], 'цвет', 'noun'),
  vocab('a2m07-hind', 'hind', ['hind', 'hinna', 'hinda'], 'цена', 'noun'),
  vocab('a2m07-osakond', 'osakond', ['osakond', 'osakonna', 'osakonda'], 'отдел', 'noun'),
  vocab('a2m07-kviitung', 'kviitung', ['kviitung', 'kviitungi', 'kviitungit'], 'чек', 'noun'),
  vocab('a2m07-allahindlus', 'allahindlus', ['allahindlus', 'allahindluse', 'allahindlust'], 'скидка', 'noun'),
  vocab('a2m07-soodustus', 'soodustus', ['soodustus', 'soodustuse', 'soodustust'], 'льгота / скидка', 'noun'),
  vocab('a2m07-tagastus', 'tagastus', ['tagastus', 'tagastuse', 'tagastust'], 'возврат', 'noun'),
  vocab('a2m07-vahetus', 'vahetus', ['vahetus', 'vahetuse', 'vahetust'], 'обмен', 'noun'),
  vocab('a2m07-sobima', 'sobima', ['sobima', 'sobida', 'sobin'], 'подходить', 'verb'),
  vocab('a2m07-proovima', 'proovima', ['proovima', 'proovida', 'proovin'], 'примерять / пробовать', 'verb'),
  vocab('a2m07-odav', 'odav', ['odav', 'odava', 'odavat'], 'дешёвый', 'adjective'),
  vocab('a2m07-kallis', 'kallis', ['kallis', 'kalli', 'kallist'], 'дорогой', 'adjective'),
]);

export const A2_MODULE_07_GRAMMAR = Object.freeze([
  createGrammarTarget({
    id: 'a2-shopping-numbers-prices',
    label: 'Arvud, hinnad, suurused ja kogused',
    firstLevel: 'A2', firstLessonId: 'a2-032', masteryLevel: 'A2',
    controlledLessonIds: ['a2-032', 'a2-033'], retrievalLessonIds: ['a2-034', 'a2-035', 'a2-054'],
    commonErrorsRu: ['euro ja sent jäävad nimetavasse pärast arvu', 'suurus ja hinnanumber lähevad kuulamisel segamini'],
    explanation: 'Pärast arvu kasuta sagedasti partitiivi: 20 eurot, 50 senti, kaks paari kingi.',
    contrasts: ['üks euro / kaks eurot', 'üks paar / kaks paari', 'suurus 42 / hind 42 eurot'],
  }),
  createGrammarTarget({
    id: 'a2-shopping-comparison',
    label: 'Võrdlusaste valiku tegemisel',
    firstLevel: 'A2', firstLessonId: 'a2-033', masteryLevel: 'A2',
    controlledLessonIds: ['a2-033'], retrievalLessonIds: ['a2-035', 'a2-052'],
    commonErrorsRu: ['rohkem odav kasutatakse odavam asemel', 'suuremat/väiksemat vorm ei sobi küsimusega'],
    explanation: 'Kahe variandi võrdlemisel kasuta võrdlusastet: odavam, kallim, suurem, väiksem.',
    contrasts: ['odav / odavam', 'kallis / kallim', 'suur / suurem', 'väike / väiksem'],
  }),
  createGrammarTarget({
    id: 'a2-shopping-service-functions',
    label: 'Suuruse, värvi ja sobivuse täpsustamine',
    firstLevel: 'A2', firstLessonId: 'a2-031', masteryLevel: 'A2',
    controlledLessonIds: ['a2-031', 'a2-033'], retrievalLessonIds: ['a2-035', 'a2-053'],
    commonErrorsRu: ['küsimuses puudub vajalik käändevorm', 'sobima eitus moodustatakse valesti'],
    explanation: 'Ostmisel küsi konkreetset omadust ja reageeri sobivusele: Mis suuruses? Mis värvi? Kas on suuremat? See ei sobi.',
    contrasts: ['Mis suurus? / Mis suurust vajate?', 'sobib / ei sobi', 'Kas on suuremat? / Kas on väiksemat?'],
  }),
  createGrammarTarget({
    id: 'a2-receipt-return-reading',
    label: 'Kviitungi, kampaania ja tagastustingimuste mõistmine',
    firstLevel: 'A2', firstLessonId: 'a2-034', masteryLevel: 'A2',
    controlledLessonIds: ['a2-034'], retrievalLessonIds: ['a2-035', 'a2-038', 'a2-054'],
    commonErrorsRu: ['hind, soodustus ja lõppsumma loetakse üheks infoks', 'tähtaeg ja erand jäetakse omavahel seostamata'],
    explanation: 'Praktilises ostudokumendis otsi eraldi hind, soodustus, tähtaeg, tingimus ja erand.',
    contrasts: ['täishind / soodushind', 'tagastus / vahetus', 'tavaline tingimus / erand'],
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
    module: moduleData?.title || 'Pood, raha ja ostud',
    activeVocabulary,
    recycledVocabularyIds: scheduled
      .filter((item) => previousVocabulary.some((entry) => entry.id === item.id))
      .map((item) => item.id),
    grammarTargets: A2_MODULE_07_GRAMMAR,
    textbookVocabulary: allVocabulary,
    currentModuleLessonIds: lessonIds,
    previousModuleLessonIds,
  };
}

export function generateA2Module07({
  levelLexicon = [],
  seed = 'a2-module-07:textbook:v1',
  difficulty = 'core',
} = {}) {
  const lessons = moduleData?.lessons || [];
  const baseProfiles = lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
  const diagnostics = [];

  baseProfiles.forEach((profile, index) => {
    if (!profile) diagnostics.push({
      severity: 'error',
      code: 'A2_MODULE_07_PROFILE_MISSING',
      lessonId: lessons[index]?.id || '',
      message: 'Tunnil puudub valmis generaatoriprofiil.',
    });
  });

  const previousVocabulary = planLexicalRecycling(A2_MODULE_06_CORE_VOCABULARY, previousModuleLessonIds, lessonIds);
  const plannedVocabulary = planLexicalRecycling(A2_MODULE_07_CORE_VOCABULARY, lessonIds, nextModuleLessonIds);
  const lexicalCoverage = lexicalCoverageReport(plannedVocabulary, lessonIds, nextModuleLessonIds);
  if (!lexicalCoverage.ready) diagnostics.push({
    severity: 'error',
    code: 'A2_MODULE_07_LEXICAL_RECYCLING_LOW',
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
      variant: A2_MODULE_07_VERSION,
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
    moduleId: A2_MODULE_07_ID,
    moduleTitle: moduleData?.title || '',
    version: A2_MODULE_07_VERSION,
    lessonIds,
    previousVocabulary,
    plannedVocabulary,
    lexicalCoverage,
    grammarTargets: A2_MODULE_07_GRAMMAR,
    modulePlan,
    bundles,
    diagnostics,
    ready: complete && lexicalCoverage.ready && modulePlan.ready && !diagnostics.some((item) => item.severity === 'error'),
  };
}
