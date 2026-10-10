import roadmap from '../../curriculum/a2Roadmap.json';
import { createGrammarTarget } from '../../curriculum/grammarProgression.js';
import { createVocabularyEntry } from '../../curriculum/textbookVocabulary.js';
import { generateTextbookLessonBundle } from '../engine/generator.js';
import { lexicalCoverageReport, planLexicalRecycling, planModuleActivities, scheduledVocabularyForLesson } from '../engine/modulePlanner.js';
import { generatorProfileForLesson } from '../profiles/index.js';
import { A2_MODULE_07_CORE_VOCABULARY } from './a2Module07.js';

export const A2_MODULE_08_ID = 'a2-module-08';
export const A2_MODULE_08_VERSION = 1;

const moduleData = roadmap.modules.find((item) => item.id === A2_MODULE_08_ID);
const previousModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-07')?.lessons || []).map((lesson) => lesson.id);
const lessonIds = (moduleData?.lessons || []).map((lesson) => lesson.id);
const nextModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-09')?.lessons || []).map((lesson) => lesson.id);

const vocab = (id, lemma, forms, translationRu, partOfSpeech, topicIds = ['teenused-asjaajamine']) => createVocabularyEntry({
  id, lemma, forms, translationRu, level: 'A2', topicIds, partOfSpeech,
  collocations: [], government: '', example: '',
});

export const A2_MODULE_08_CORE_VOCABULARY = Object.freeze([
  vocab('a2m08-aeg', 'aeg', ['aeg', 'aja', 'aega'], 'время / запись', 'noun'),
  vocab('a2m08-broneering', 'broneering', ['broneering', 'broneeringu', 'broneeringut'], 'бронирование / запись', 'noun'),
  vocab('a2m08-kuupaev', 'kuupäev', ['kuupäev', 'kuupäeva', 'kuupäeva'], 'дата', 'noun'),
  vocab('a2m08-kellaaeg', 'kellaaeg', ['kellaaeg', 'kellaaja', 'kellaaega'], 'время по часам', 'noun'),
  vocab('a2m08-vastuvott', 'vastuvõtt', ['vastuvõtt', 'vastuvõtu', 'vastuvõttu'], 'приём', 'noun'),
  vocab('a2m08-teenus', 'teenus', ['teenus', 'teenuse', 'teenust'], 'услуга', 'noun'),
  vocab('a2m08-avaldus', 'avaldus', ['avaldus', 'avalduse', 'avaldust'], 'заявление', 'noun'),
  vocab('a2m08-vorm', 'vorm', ['vorm', 'vormi', 'vormi'], 'форма / бланк', 'noun'),
  vocab('a2m08-allkiri', 'allkiri', ['allkiri', 'allkirja', 'allkirja'], 'подпись', 'noun'),
  vocab('a2m08-isikukood', 'isikukood', ['isikukood', 'isikukoodi', 'isikukoodi'], 'личный код', 'noun'),
  vocab('a2m08-teenindaja', 'teenindaja', ['teenindaja', 'teenindaja', 'teenindajat'], 'сотрудник обслуживания', 'noun'),
  vocab('a2m08-kusimus', 'küsimus', ['küsimus', 'küsimuse', 'küsimust'], 'вопрос / причина обращения', 'noun'),
  vocab('a2m08-kinnitama', 'kinnitama', ['kinnitama', 'kinnitada', 'kinnitan'], 'подтверждать', 'verb'),
  vocab('a2m08-muutma', 'muutma', ['muutma', 'muuta', 'muudan'], 'менять', 'verb'),
  vocab('a2m08-esitama', 'esitama', ['esitama', 'esitada', 'esitan'], 'предоставлять / подавать', 'verb'),
  vocab('a2m08-taitma', 'täitma', ['täitma', 'täita', 'täidan'], 'заполнять', 'verb'),
]);

export const A2_MODULE_08_GRAMMAR = Object.freeze([
  createGrammarTarget({
    id: 'a2-service-booking-functions',
    label: 'Aja broneerimine, muutmine ja kinnitamine',
    firstLevel: 'A2', firstLessonId: 'a2-036', masteryLevel: 'A2',
    controlledLessonIds: ['a2-036'], retrievalLessonIds: ['a2-039', 'a2-040', 'a2-043'],
    commonErrorsRu: ['aega kasutatakse nimetavas käändes soovi järel', 'uus aeg jääb kõne lõpus kinnitamata'],
    explanation: 'Teenuse aja kokkuleppimisel ütle eesmärk, küsi sobivat aega, paku vajadusel alternatiivi ja kinnita lõplik kuupäev ning kellaaeg.',
    contrasts: ['Soovin aega reedeks.', 'Kas kell kaks sobib?', 'Kas on võimalik varem?', 'Jah, kinnitan selle aja.'],
  }),
  createGrammarTarget({
    id: 'a2-service-modals',
    label: 'Pean + ma; saan, võin, tohin + da',
    firstLevel: 'A2', firstLessonId: 'a2-037', masteryLevel: 'A2',
    controlledLessonIds: ['a2-037', 'a2-038'], retrievalLessonIds: ['a2-039', 'a2-040', 'a2-062'],
    commonErrorsRu: ['pean järel kasutatakse da-infinitiivi', 'saan/võin/tohin järel kasutatakse ma-infinitiivi'],
    explanation: 'Pean väljendab kohustust ja kasutab ma-infinitiivi; saan, võin ja tohin väljendavad võimalust või luba ning kasutavad da-infinitiivi.',
    contrasts: ['pean täitma', 'saan täita', 'võin maksta', 'tohin siseneda'],
  }),
  createGrammarTarget({
    id: 'a2-form-instructions',
    label: 'Vormi juhised ja kohustuslik info',
    firstLevel: 'A2', firstLessonId: 'a2-038', masteryLevel: 'A2',
    controlledLessonIds: ['a2-038'], retrievalLessonIds: ['a2-040', 'a2-054'],
    commonErrorsRu: ['kohustuslikud väljad jäävad eristamata vabatahtlikest', 'juhise käskiv vorm tõlgendatakse kirjeldusena'],
    explanation: 'Vormi lugedes erista kohustuslik väli, juhis ja järgmine samm; käsud nagu täitke, valige ja kirjutage näitavad tegevust.',
    contrasts: ['kohustuslik / vabatahtlik', 'täitke / valige / kirjutage', 'allkiri / kuupäev'],
  }),
  createGrammarTarget({
    id: 'a2-phone-service-repair',
    label: 'Telefonikõne: täpsustamine ja parandamine',
    firstLevel: 'A2', firstLessonId: 'a2-039', masteryLevel: 'A2',
    controlledLessonIds: ['a2-039'], retrievalLessonIds: ['a2-040', 'a2-044'],
    commonErrorsRu: ['õppija jätab arusaamatu info täpsustamata', 'nimi, aeg ja järgmine samm lähevad kuulamisel segamini'],
    explanation: 'Telefonis kinnita põhifaktid ja kasuta parandamisstrateegiaid: korrake palun, kas ma sain õigesti aru, oodake palun.',
    contrasts: ['Korrake, palun.', 'Kas ma sain õigesti aru?', 'Oodake, palun.', 'Mis küsimuses?'],
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
    module: moduleData?.title || 'Teenused ja asjaajamine',
    activeVocabulary,
    recycledVocabularyIds: scheduled
      .filter((item) => previousVocabulary.some((entry) => entry.id === item.id))
      .map((item) => item.id),
    grammarTargets: A2_MODULE_08_GRAMMAR,
    textbookVocabulary: allVocabulary,
    currentModuleLessonIds: lessonIds,
    previousModuleLessonIds,
  };
}

export function generateA2Module08({
  levelLexicon = [],
  seed = 'a2-module-08:textbook:v1',
  difficulty = 'core',
} = {}) {
  const lessons = moduleData?.lessons || [];
  const baseProfiles = lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
  const diagnostics = [];

  baseProfiles.forEach((profile, index) => {
    if (!profile) diagnostics.push({
      severity: 'error',
      code: 'A2_MODULE_08_PROFILE_MISSING',
      lessonId: lessons[index]?.id || '',
      message: 'Tunnil puudub valmis generaatoriprofiil.',
    });
  });

  const previousVocabulary = planLexicalRecycling(A2_MODULE_07_CORE_VOCABULARY, previousModuleLessonIds, lessonIds);
  const plannedVocabulary = planLexicalRecycling(A2_MODULE_08_CORE_VOCABULARY, lessonIds, nextModuleLessonIds);
  const lexicalCoverage = lexicalCoverageReport(plannedVocabulary, lessonIds, nextModuleLessonIds);
  if (!lexicalCoverage.ready) diagnostics.push({
    severity: 'error',
    code: 'A2_MODULE_08_LEXICAL_RECYCLING_LOW',
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
      variant: A2_MODULE_08_VERSION,
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
    moduleId: A2_MODULE_08_ID,
    moduleTitle: moduleData?.title || '',
    version: A2_MODULE_08_VERSION,
    lessonIds,
    previousVocabulary,
    plannedVocabulary,
    lexicalCoverage,
    grammarTargets: A2_MODULE_08_GRAMMAR,
    modulePlan,
    bundles,
    diagnostics,
    ready: complete && lexicalCoverage.ready && modulePlan.ready && !diagnostics.some((item) => item.severity === 'error'),
  };
}
