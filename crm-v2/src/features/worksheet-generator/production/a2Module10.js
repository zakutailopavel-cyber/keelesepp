import roadmap from '../../curriculum/a2Roadmap.json';
import { createGrammarTarget } from '../../curriculum/grammarProgression.js';
import { createVocabularyEntry } from '../../curriculum/textbookVocabulary.js';
import { generateTextbookLessonBundle } from '../engine/generator.js';
import { lexicalCoverageReport, planLexicalRecycling, planModuleActivities, scheduledVocabularyForLesson } from '../engine/modulePlanner.js';
import { generatorProfileForLesson } from '../profiles/index.js';
import { A2_MODULE_09_CORE_VOCABULARY } from './a2Module09.js';

export const A2_MODULE_10_ID = 'a2-module-10';
export const A2_MODULE_10_VERSION = 1;

const moduleData = roadmap.modules.find((item) => item.id === A2_MODULE_10_ID);
const previousModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-09')?.lessons || []).map((lesson) => lesson.id);
const lessonIds = (moduleData?.lessons || []).map((lesson) => lesson.id);
const nextModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-11')?.lessons || []).map((lesson) => lesson.id);

const vocab = (id, lemma, forms, translationRu, partOfSpeech, topicIds = ['vaba-aeg-meelelahutus']) => createVocabularyEntry({
  id, lemma, forms, translationRu, level: 'A2', topicIds, partOfSpeech,
  collocations: [], government: '', example: '',
});

export const A2_MODULE_10_CORE_VOCABULARY = Object.freeze([
  vocab('a2m10-hobi', 'hobi', ['hobi', 'hobi', 'hobi'], 'хобби', 'noun'),
  vocab('a2m10-sport', 'sport', ['sport', 'spordi', 'sporti'], 'спорт', 'noun'),
  vocab('a2m10-kino', 'kino', ['kino', 'kino', 'kino'], 'кино', 'noun'),
  vocab('a2m10-muusika', 'muusika', ['muusika', 'muusika', 'muusikat'], 'музыка', 'noun'),
  vocab('a2m10-raamat', 'raamat', ['raamat', 'raamatu', 'raamatut'], 'книга', 'noun'),
  vocab('a2m10-kontsert', 'kontsert', ['kontsert', 'kontserdi', 'kontserti'], 'концерт', 'noun'),
  vocab('a2m10-mang', 'mäng', ['mäng', 'mängu', 'mängu'], 'игра', 'noun'),
  vocab('a2m10-jalutamine', 'jalutamine', ['jalutamine', 'jalutamise', 'jalutamist'], 'прогулка', 'noun'),
  vocab('a2m10-lugemine', 'lugemine', ['lugemine', 'lugemise', 'lugemist'], 'чтение', 'noun'),
  vocab('a2m10-meeldima', 'meeldima', ['meeldima', 'meeldida', 'meeldib'], 'нравиться', 'verb'),
  vocab('a2m10-kutsuma', 'kutsuma', ['kutsuma', 'kutsuda', 'kutsun'], 'приглашать', 'verb'),
  vocab('a2m10-kohtuma', 'kohtuma', ['kohtuma', 'kohtuda', 'kohtun'], 'встречаться', 'verb'),
  vocab('a2m10-valima', 'valima', ['valima', 'valida', 'valin'], 'выбирать', 'verb'),
  vocab('a2m10-uritus', 'üritus', ['üritus', 'ürituse', 'üritust'], 'мероприятие', 'noun'),
  vocab('a2m10-pilet', 'pilet', ['pilet', 'pileti', 'piletit'], 'билет', 'noun'),
  vocab('a2m10-registreerimine', 'registreerimine', ['registreerimine', 'registreerimise', 'registreerimist'], 'регистрация', 'noun'),
]);

export const A2_MODULE_10_GRAMMAR = Object.freeze([
  createGrammarTarget({
    id: 'a2-meeldima-preferences',
    label: 'Mulle meeldib + nimisõna / da-infinitiiv',
    firstLevel: 'A2', firstLessonId: 'a2-047', masteryLevel: 'A2',
    controlledLessonIds: ['a2-047', 'a2-048'], retrievalLessonIds: ['a2-049', 'a2-050', 'a2-054'],
    commonErrorsRu: ['mina meeldib kasutatakse mulle meeldib asemel', 'meeldib järel kasutatakse ma-infinitiivi'],
    explanation: 'Eelistuse väljendamisel kasuta mulle meeldib + nimisõna või da-infinitiiv: mulle meeldib muusika; mulle meeldib lugeda.',
    contrasts: ['Mulle meeldib muusika.', 'Mulle meeldib lugeda.', 'Mulle ei meeldi mängida.'],
  }),
  createGrammarTarget({
    id: 'a2-leisure-infinitive-choice',
    label: 'Tahan + da ja meeldib + da',
    firstLevel: 'A2', firstLessonId: 'a2-047', masteryLevel: 'A2',
    controlledLessonIds: ['a2-047', 'a2-048'], retrievalLessonIds: ['a2-050', 'a2-068'],
    commonErrorsRu: ['tahan järel kasutatakse ma-vormi', 'tegevuse nimisõna ja da-infinitiiv segunevad'],
    explanation: 'Lihtsas vaba aja kõnes kasutavad tahan ja mulle meeldib da-infinitiivi: tahan minna, meeldib lugeda.',
    contrasts: ['tahan kinno minna', 'mulle meeldib kinos käia', 'mulle meeldib lugemine / mulle meeldib lugeda'],
  }),
  createGrammarTarget({
    id: 'a2-invitation-negotiation',
    label: 'Kutse, nõustumine, keeldumine ja uus ettepanek',
    firstLevel: 'A2', firstLessonId: 'a2-048', masteryLevel: 'A2',
    controlledLessonIds: ['a2-048'], retrievalLessonIds: ['a2-049', 'a2-050', 'a2-058'],
    commonErrorsRu: ['keeldumine jääb liiga järsuks', 'aja muutmisel ei kinnitata uut kokkulepet'],
    explanation: 'Kutse dialoogis esita kutse, vasta viisakalt ja paku vajadusel uus aeg või koht.',
    contrasts: ['Kas tahad kaasa tulla?', 'Hea mõte!', 'Kahjuks ma ei saa.', 'Kas hiljem sobib?'],
  }),
  createGrammarTarget({
    id: 'a2-event-information',
    label: 'Ürituse aeg, koht, hind ja tingimus',
    firstLevel: 'A2', firstLessonId: 'a2-049', masteryLevel: 'A2',
    controlledLessonIds: ['a2-049'], retrievalLessonIds: ['a2-050', 'a2-057'],
    commonErrorsRu: ['algus ja kestus segunevad', 'tasuta ja registreerimine loetakse sama tingimusena'],
    explanation: 'Ürituse info lugemisel erista algus, kestus, koht, hind ja osalemise tingimus.',
    contrasts: ['algus kell 19.00', 'kestus 2 tundi', 'pilet 12 €', 'tasuta, kuid registreerimine vajalik'],
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
    module: moduleData?.title || 'Vaba aeg ja meelelahutus',
    activeVocabulary,
    recycledVocabularyIds: scheduled
      .filter((item) => previousVocabulary.some((entry) => entry.id === item.id))
      .map((item) => item.id),
    grammarTargets: A2_MODULE_10_GRAMMAR,
    textbookVocabulary: allVocabulary,
    currentModuleLessonIds: lessonIds,
    previousModuleLessonIds,
  };
}

export function generateA2Module10({
  levelLexicon = [],
  seed = 'a2-module-10:textbook:v1',
  difficulty = 'core',
} = {}) {
  const lessons = moduleData?.lessons || [];
  const baseProfiles = lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
  const diagnostics = [];

  baseProfiles.forEach((profile, index) => {
    if (!profile) diagnostics.push({
      severity: 'error',
      code: 'A2_MODULE_10_PROFILE_MISSING',
      lessonId: lessons[index]?.id || '',
      message: 'Tunnil puudub valmis generaatoriprofiil.',
    });
  });

  const previousVocabulary = planLexicalRecycling(A2_MODULE_09_CORE_VOCABULARY, previousModuleLessonIds, lessonIds);
  const plannedVocabulary = planLexicalRecycling(A2_MODULE_10_CORE_VOCABULARY, lessonIds, nextModuleLessonIds);
  const lexicalCoverage = lexicalCoverageReport(plannedVocabulary, lessonIds, nextModuleLessonIds);
  if (!lexicalCoverage.ready) diagnostics.push({
    severity: 'error',
    code: 'A2_MODULE_10_LEXICAL_RECYCLING_LOW',
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
      variant: A2_MODULE_10_VERSION,
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
    moduleId: A2_MODULE_10_ID,
    moduleTitle: moduleData?.title || '',
    version: A2_MODULE_10_VERSION,
    lessonIds,
    previousVocabulary,
    plannedVocabulary,
    lexicalCoverage,
    grammarTargets: A2_MODULE_10_GRAMMAR,
    modulePlan,
    bundles,
    diagnostics,
    ready: complete && lexicalCoverage.ready && modulePlan.ready && !diagnostics.some((item) => item.severity === 'error'),
  };
}
