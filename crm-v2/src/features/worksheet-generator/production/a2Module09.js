import roadmap from '../../curriculum/a2Roadmap.json';
import { createGrammarTarget } from '../../curriculum/grammarProgression.js';
import { createVocabularyEntry } from '../../curriculum/textbookVocabulary.js';
import { generateLessonBundle } from '../engine/generator.js';
import { lexicalCoverageReport, planLexicalRecycling, planModuleActivities, scheduledVocabularyForLesson } from '../engine/modulePlanner.js';
import { generatorProfileForLesson } from '../profiles/index.js';
import { A2_MODULE_08_CORE_VOCABULARY } from './a2Module08.js';

export const A2_MODULE_09_ID = 'a2-module-09';
export const A2_MODULE_09_VERSION = 1;

const moduleData = roadmap.modules.find((item) => item.id === A2_MODULE_09_ID);
const previousModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-08')?.lessons || []).map((lesson) => lesson.id);
const lessonIds = (moduleData?.lessons || []).map((lesson) => lesson.id);
const nextModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-10')?.lessons || []).map((lesson) => lesson.id);

const vocab = (id, lemma, forms, translationRu, partOfSpeech, topicIds = ['tervis-kehahooldus']) => createVocabularyEntry({
  id, lemma, forms, translationRu, level: 'A2', topicIds, partOfSpeech,
  collocations: [], government: '', example: '',
});

export const A2_MODULE_09_CORE_VOCABULARY = Object.freeze([
  vocab('a2m09-pea', 'pea', ['pea', 'pea', 'pead'], 'голова', 'noun'),
  vocab('a2m09-kurk', 'kurk', ['kurk', 'kurgu', 'kurku'], 'горло', 'noun'),
  vocab('a2m09-koht', 'kõht', ['kõht', 'kõhu', 'kõhtu'], 'живот', 'noun'),
  vocab('a2m09-selg', 'selg', ['selg', 'selja', 'selga'], 'спина', 'noun'),
  vocab('a2m09-kasi', 'käsi', ['käsi', 'käe', 'kätt'], 'рука', 'noun'),
  vocab('a2m09-jalg', 'jalg', ['jalg', 'jala', 'jalga'], 'нога', 'noun'),
  vocab('a2m09-palavik', 'palavik', ['palavik', 'palaviku', 'palavikku'], 'температура / жар', 'noun'),
  vocab('a2m09-koha', 'köha', ['köha', 'köha', 'köha'], 'кашель', 'noun'),
  vocab('a2m09-nohu', 'nohu', ['nohu', 'nohu', 'nohu'], 'насморк', 'noun'),
  vocab('a2m09-vasimus', 'väsimus', ['väsimus', 'väsimuse', 'väsimust'], 'усталость', 'noun'),
  vocab('a2m09-valutama', 'valutama', ['valutama', 'valutada', 'valutab'], 'болеть', 'verb'),
  vocab('a2m09-arst', 'arst', ['arst', 'arsti', 'arsti'], 'врач', 'noun'),
  vocab('a2m09-ravim', 'ravim', ['ravim', 'ravimi', 'ravimit'], 'лекарство', 'noun'),
  vocab('a2m09-vastuvott', 'vastuvõtt', ['vastuvõtt', 'vastuvõtu', 'vastuvõttu'], 'приём', 'noun'),
  vocab('a2m09-puhkama', 'puhkama', ['puhkama', 'puhata', 'puhkan'], 'отдыхать', 'verb'),
  vocab('a2m09-mootma', 'mõõtma', ['mõõtma', 'mõõta', 'mõõdan'], 'измерять', 'verb'),
]);

export const A2_MODULE_09_GRAMMAR = Object.freeze([
  createGrammarTarget({
    id: 'a2-health-state-constructions',
    label: 'Mul on… / Mul valutab… / Mul ei ole…',
    firstLevel: 'A2', firstLessonId: 'a2-042', masteryLevel: 'A2',
    controlledLessonIds: ['a2-042', 'a2-043'], retrievalLessonIds: ['a2-044', 'a2-045', 'a2-051'],
    commonErrorsRu: ['minu kasutatakse mul asemel', 'mul on valutab ühendatakse kaheks konstruktsiooniks'],
    explanation: 'Seisundi kirjeldamisel vali konstruktsioon tähenduse järgi: mul on sümptom, mul valutab kehaosa, mul ei ole sümptomit.',
    contrasts: ['Mul on palavik.', 'Mul valutab pea.', 'Mul ei ole nohu.', 'Mul on vaja arsti aega.'],
  }),
  createGrammarTarget({
    id: 'a2-health-onset-duration',
    label: 'Millal algas? Kui kaua kestab?',
    firstLevel: 'A2', firstLessonId: 'a2-043', masteryLevel: 'A2',
    controlledLessonIds: ['a2-043'], retrievalLessonIds: ['a2-044', 'a2-045', 'a2-059'],
    commonErrorsRu: ['millal ja kui kaua küsimused segunevad', 'kestuse vastuses puudub ajahulk'],
    explanation: 'Millal? küsib alguspunkti; kui kaua? küsib kestust.',
    contrasts: ['Millal see algas? — Eile.', 'Kui kaua see kestab? — Kaks päeva.'],
  }),
  createGrammarTarget({
    id: 'a2-health-recommendations',
    label: 'Lihtsad soovitused ja juhised',
    firstLevel: 'A2', firstLessonId: 'a2-043', masteryLevel: 'A2',
    controlledLessonIds: ['a2-043', 'a2-044'], retrievalLessonIds: ['a2-045', 'a2-054'],
    commonErrorsRu: ['soovitust tõlgendatakse diagnoosina', 'käskiva kõneviisi vorm jäetakse muutmata'],
    explanation: 'Keeleülesandes harjuta soovituse mõistmist ja kordamist: puhake, jooge, mõõtke; päris terviseotsuse puhul järgi arsti või apteekri juhiseid.',
    contrasts: ['Puhake rohkem.', 'Jooge vett.', 'Mõõtke temperatuuri.'],
  }),
  createGrammarTarget({
    id: 'a2-health-frequency-time',
    label: 'Sagedus ja aeg praktilises terviseinfos',
    firstLevel: 'A2', firstLessonId: 'a2-044', masteryLevel: 'A2',
    controlledLessonIds: ['a2-044'], retrievalLessonIds: ['a2-045', 'a2-053'],
    commonErrorsRu: ['korda päevas ja kellaaeg segunevad', 'enne/pärast ajamarker loetakse pealiskaudselt'],
    explanation: 'Praktilises infos erista mitu korda, millal ja kus tegevus toimub.',
    contrasts: ['2 korda päevas', 'pärast sööki', 'kell 14.30', 'kabinet 214'],
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
    module: moduleData?.title || 'Tervis ja kehahooldus',
    activeVocabulary,
    recycledVocabularyIds: scheduled
      .filter((item) => previousVocabulary.some((entry) => entry.id === item.id))
      .map((item) => item.id),
    grammarTargets: A2_MODULE_09_GRAMMAR,
    textbookVocabulary: allVocabulary,
    currentModuleLessonIds: lessonIds,
    previousModuleLessonIds,
  };
}

export function generateA2Module09({
  levelLexicon = [],
  seed = 'a2-module-09:textbook:v1',
  difficulty = 'core',
} = {}) {
  const lessons = moduleData?.lessons || [];
  const baseProfiles = lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
  const diagnostics = [];

  baseProfiles.forEach((profile, index) => {
    if (!profile) diagnostics.push({
      severity: 'error',
      code: 'A2_MODULE_09_PROFILE_MISSING',
      lessonId: lessons[index]?.id || '',
      message: 'Tunnil puudub valmis generaatoriprofiil.',
    });
  });

  const previousVocabulary = planLexicalRecycling(A2_MODULE_08_CORE_VOCABULARY, previousModuleLessonIds, lessonIds);
  const plannedVocabulary = planLexicalRecycling(A2_MODULE_09_CORE_VOCABULARY, lessonIds, nextModuleLessonIds);
  const lexicalCoverage = lexicalCoverageReport(plannedVocabulary, lessonIds, nextModuleLessonIds);
  if (!lexicalCoverage.ready) diagnostics.push({
    severity: 'error',
    code: 'A2_MODULE_09_LEXICAL_RECYCLING_LOW',
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
      variant: A2_MODULE_09_VERSION,
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
    moduleId: A2_MODULE_09_ID,
    moduleTitle: moduleData?.title || '',
    version: A2_MODULE_09_VERSION,
    lessonIds,
    previousVocabulary,
    plannedVocabulary,
    lexicalCoverage,
    grammarTargets: A2_MODULE_09_GRAMMAR,
    modulePlan,
    bundles,
    diagnostics,
    ready: complete && lexicalCoverage.ready && modulePlan.ready && !diagnostics.some((item) => item.severity === 'error'),
  };
}
