import roadmap from '../../curriculum/a2Roadmap.json';
import { createGrammarTarget } from '../../curriculum/grammarProgression.js';
import { createVocabularyEntry } from '../../curriculum/textbookVocabulary.js';
import { generateTextbookLessonBundle } from '../engine/generator.js';
import { lexicalCoverageReport, planLexicalRecycling, planModuleActivities, scheduledVocabularyForLesson } from '../engine/modulePlanner.js';
import { generatorProfileForLesson } from '../profiles/index.js';
import { A2_MODULE_04_CORE_VOCABULARY } from './a2Module04.js';

export const A2_MODULE_05_ID = 'a2-module-05';
export const A2_MODULE_05_VERSION = 1;

const moduleData = roadmap.modules.find((item) => item.id === A2_MODULE_05_ID);
const previousModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-04')?.lessons || []).map((lesson) => lesson.id);
const lessonIds = (moduleData?.lessons || []).map((lesson) => lesson.id);
const nextModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-06')?.lessons || []).map((lesson) => lesson.id);

const vocab = (id, lemma, forms, translationRu, partOfSpeech, topicIds = ['linn-ja-tee']) => createVocabularyEntry({
  id, lemma, forms, translationRu, level: 'A2', topicIds, partOfSpeech,
  collocations: [], government: '', example: '',
});

export const A2_MODULE_05_CORE_VOCABULARY = Object.freeze([
  vocab('a2m05-apteek', 'apteek', ['apteek', 'apteegi', 'apteeki'], 'аптека', 'noun'),
  vocab('a2m05-pank', 'pank', ['pank', 'panga', 'panka'], 'банк', 'noun'),
  vocab('a2m05-postkontor', 'postkontor', ['postkontor', 'postkontori', 'postkontorit'], 'почтовое отделение', 'noun'),
  vocab('a2m05-raamatukogu', 'raamatukogu', ['raamatukogu', 'raamatukogu', 'raamatukogu'], 'библиотека', 'noun'),
  vocab('a2m05-jaam', 'jaam', ['jaam', 'jaama', 'jaama'], 'вокзал / станция', 'noun'),
  vocab('a2m05-polikliinik', 'polikliinik', ['polikliinik', 'polikliiniku', 'polikliinikut'], 'поликлиника', 'noun'),
  vocab('a2m05-turg', 'turg', ['turg', 'turu', 'turgu'], 'рынок', 'noun'),
  vocab('a2m05-keskus', 'keskus', ['keskus', 'keskuse', 'keskust'], 'центр', 'noun'),
  vocab('a2m05-ristmik', 'ristmik', ['ristmik', 'ristmiku', 'ristmikku'], 'перекрёсток', 'noun'),
  vocab('a2m05-peatus', 'peatus', ['peatus', 'peatuse', 'peatust'], 'остановка', 'noun'),
  vocab('a2m05-marsruut', 'marsruut', ['marsruut', 'marsruudi', 'marsruuti'], 'маршрут', 'noun'),
  vocab('a2m05-kaart', 'kaart', ['kaart', 'kaardi', 'kaarti'], 'карта', 'noun'),
  vocab('a2m05-sissepaas', 'sissepääs', ['sissepääs', 'sissepääsu', 'sissepääsu'], 'вход', 'noun'),
  vocab('a2m05-valjapaas', 'väljapääs', ['väljapääs', 'väljapääsu', 'väljapääsu'], 'выход', 'noun'),
  vocab('a2m05-poorama', 'pöörama', ['pöörama', 'pöörata', 'pööran'], 'поворачивать', 'verb'),
  vocab('a2m05-uletama', 'ületama', ['ületama', 'ületada', 'ületan'], 'переходить / пересекать', 'verb'),
]);

export const A2_MODULE_05_GRAMMAR = Object.freeze([
  createGrammarTarget({
    id: 'a2-city-local-cases',
    label: 'Linnakohtade Kus? Kuhu? Kust? vormid',
    firstLevel: 'A2', firstLessonId: 'a2-021', masteryLevel: 'A2',
    controlledLessonIds: ['a2-021', 'a2-022'], retrievalLessonIds: ['a2-023', 'a2-025', 'a2-046'],
    commonErrorsRu: ['asukoha ja suuna vorm segunevad', 'turul/turule/turult ning poes/poodi/poest valitakse sama mudeli järgi'],
    explanation: 'Linnakohaga vali esmalt tähendus Kus/Kuhu/Kust ja siis sellele sõnale loomulik käändesari.',
    contrasts: ['apteegis / apteeki / apteegist', 'jaamas / jaama / jaamast', 'turul / turule / turult'],
  }),
  createGrammarTarget({
    id: 'a2-route-questions',
    label: 'Tee küsimine ja täpsustamine',
    firstLevel: 'A2', firstLessonId: 'a2-022', masteryLevel: 'A2',
    controlledLessonIds: ['a2-022', 'a2-023'], retrievalLessonIds: ['a2-025', 'a2-046'],
    commonErrorsRu: ['küsimuses kasutatakse kus-vormi sihtkoha asemel', 'õppija ei kontrolli, kas sai juhisest õigesti aru'],
    explanation: 'Marsruudi küsimisel kombineeri asukoha küsimus, sihtkoha vorm ja vähemalt üks täpsustav küsimus.',
    contrasts: ['Kus asub pank?', 'Kuidas ma panka saan?', 'Kas see on siit kaugel?', 'Kas ma sain õigesti aru?'],
  }),
  createGrammarTarget({
    id: 'a2-imperative-route',
    label: 'Käskiv kõneviis: juhis ja keeld',
    firstLevel: 'A2', firstLessonId: 'a2-023', masteryLevel: 'A2',
    controlledLessonIds: ['a2-023'], retrievalLessonIds: ['a2-025', 'a2-038', 'a2-064'],
    commonErrorsRu: ['käskivas kõneviisis kasutatakse oleviku isikuvormi', 'keeld moodustatakse ei abil ära asemel'],
    explanation: 'Lihtsas juhises kasuta käskiva kõneviisi vormi; keelus kasuta ära + verb.',
    contrasts: ['mine / ära mine', 'pööra / ära pööra', 'oota / ära oota'],
  }),
  createGrammarTarget({
    id: 'a2-functional-city-reading',
    label: 'Praktilise linnainfo mõistmine ja vahendamine',
    firstLevel: 'A2', firstLessonId: 'a2-024', masteryLevel: 'A2',
    controlledLessonIds: ['a2-024'], retrievalLessonIds: ['a2-025', 'a2-034', 'a2-038'],
    commonErrorsRu: ['õppija otsib üksikut tuttavat sõna ega kontrolli kogu tingimust', 'lahtiolekuaeg ja erand jäävad seostamata'],
    explanation: 'Sildil või teates otsi eesmärgi jaoks vajalikku infot: millal, kus, mis muutub ja mida inimene peab tegema.',
    contrasts: ['avatud / suletud', 'tööpäev / nädalavahetus', 'tavaline peatus / ajutine peatus'],
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
    module: moduleData?.title || 'Linn, kohad ja tee',
    activeVocabulary,
    recycledVocabularyIds: scheduled
      .filter((item) => previousVocabulary.some((entry) => entry.id === item.id))
      .map((item) => item.id),
    grammarTargets: A2_MODULE_05_GRAMMAR,
    textbookVocabulary: allVocabulary,
    currentModuleLessonIds: lessonIds,
    previousModuleLessonIds,
  };
}

export function generateA2Module05({
  levelLexicon = [],
  seed = 'a2-module-05:textbook:v1',
  difficulty = 'core',
} = {}) {
  const lessons = moduleData?.lessons || [];
  const baseProfiles = lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
  const diagnostics = [];

  baseProfiles.forEach((profile, index) => {
    if (!profile) diagnostics.push({
      severity: 'error',
      code: 'A2_MODULE_05_PROFILE_MISSING',
      lessonId: lessons[index]?.id || '',
      message: 'Tunnil puudub valmis generaatoriprofiil.',
    });
  });

  const previousVocabulary = planLexicalRecycling(A2_MODULE_04_CORE_VOCABULARY, previousModuleLessonIds, lessonIds);
  const plannedVocabulary = planLexicalRecycling(A2_MODULE_05_CORE_VOCABULARY, lessonIds, nextModuleLessonIds);
  const lexicalCoverage = lexicalCoverageReport(plannedVocabulary, lessonIds, nextModuleLessonIds);
  if (!lexicalCoverage.ready) diagnostics.push({
    severity: 'error',
    code: 'A2_MODULE_05_LEXICAL_RECYCLING_LOW',
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
      variant: A2_MODULE_05_VERSION,
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
    moduleId: A2_MODULE_05_ID,
    moduleTitle: moduleData?.title || '',
    version: A2_MODULE_05_VERSION,
    lessonIds,
    previousVocabulary,
    plannedVocabulary,
    lexicalCoverage,
    grammarTargets: A2_MODULE_05_GRAMMAR,
    modulePlan,
    bundles,
    diagnostics,
    ready: complete && lexicalCoverage.ready && modulePlan.ready && !diagnostics.some((item) => item.severity === 'error'),
  };
}
