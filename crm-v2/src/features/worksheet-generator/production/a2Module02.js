import roadmap from '../../curriculum/a2Roadmap.json';
import { createGrammarTarget } from '../../curriculum/grammarProgression.js';
import { createVocabularyEntry } from '../../curriculum/textbookVocabulary.js';
import { generateLessonBundle } from '../engine/generator.js';
import { lexicalCoverageReport, planLexicalRecycling, planModuleActivities } from '../engine/modulePlanner.js';
import { generatorProfileForLesson } from '../profiles/index.js';

export const A2_MODULE_02_ID = 'a2-module-02';
export const A2_MODULE_02_VERSION = 1;

const moduleData = roadmap.modules.find((item) => item.id === A2_MODULE_02_ID);
const previousModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-01')?.lessons || []).map((lesson) => lesson.id);
const lessonIds = (moduleData?.lessons || []).map((lesson) => lesson.id);
const nextModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-03')?.lessons || []).map((lesson) => lesson.id);

const vocab = (id, lemma, forms, translationRu, partOfSpeech, topicIds = ['pere-ja-inimesed']) => createVocabularyEntry({
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

export const A2_MODULE_02_CORE_VOCABULARY = Object.freeze([
  vocab('a2m02-ema', 'ema', ['ema', 'ema', 'ema'], 'мама', 'noun'),
  vocab('a2m02-isa', 'isa', ['isa', 'isa', 'isa'], 'папа', 'noun'),
  vocab('a2m02-laps', 'laps', ['laps', 'lapse', 'last'], 'ребёнок', 'noun'),
  vocab('a2m02-abikaasa', 'abikaasa', ['abikaasa', 'abikaasa', 'abikaasat'], 'супруг / супруга', 'noun'),
  vocab('a2m02-ode', 'õde', ['õde', 'õe', 'õde'], 'сестра', 'noun'),
  vocab('a2m02-vend', 'vend', ['vend', 'venna', 'venda'], 'брат', 'noun'),
  vocab('a2m02-vanem', 'vanem', ['vanem', 'vanema', 'vanemat'], 'родитель', 'noun'),
  vocab('a2m02-sober', 'sõber', ['sõber', 'sõbra', 'sõpra'], 'друг', 'noun'),
  vocab('a2m02-sobralik', 'sõbralik', ['sõbralik', 'sõbraliku', 'sõbralikku'], 'дружелюбный', 'adjective'),
  vocab('a2m02-rahulik', 'rahulik', ['rahulik', 'rahuliku', 'rahulikku'], 'спокойный', 'adjective'),
  vocab('a2m02-aktiivne', 'aktiivne', ['aktiivne', 'aktiivse', 'aktiivset'], 'активный', 'adjective'),
  vocab('a2m02-pikk', 'pikk', ['pikk', 'pika', 'pikka'], 'высокий / длинный', 'adjective'),
  vocab('a2m02-luhike', 'lühike', ['lühike', 'lühikese', 'lühikest'], 'короткий / невысокий', 'adjective'),
  vocab('a2m02-noor', 'noor', ['noor', 'noore', 'noort'], 'молодой', 'adjective'),
  vocab('a2m02-vana', 'vana', ['vana', 'vana', 'vana'], 'старый / пожилой', 'adjective'),
  vocab('a2m02-juuksed', 'juuksed', ['juuksed', 'juuste', 'juukseid'], 'волосы', 'noun'),
]);

export const A2_MODULE_02_GRAMMAR = Object.freeze([
  createGrammarTarget({
    id: 'a2-possession-genitive',
    label: 'Kelle? Omastav ja kuuluvus',
    firstLevel: 'A2',
    firstLessonId: 'a2-006',
    masteryLevel: 'A2',
    controlledLessonIds: ['a2-007', 'a2-008'],
    retrievalLessonIds: ['a2-009', 'a2-010', 'a2-011'],
    commonErrorsRu: ['omastava asemel kasutatakse nimetavat', 'minu/sinu/tema ja nimisõna seos jääb ebaselgeks'],
    explanation: 'Omastav vastab küsimusele kelle? ja näitab kuuluvust või seost.',
    contrasts: ['ema nimi', 'minu venna töö', 'tema sõbra auto'],
  }),
  createGrammarTarget({
    id: 'a2-tal-on-description',
    label: 'Tal on + välimuse kirjeldus',
    firstLevel: 'A2',
    firstLessonId: 'a2-008',
    masteryLevel: 'A2',
    controlledLessonIds: ['a2-008', 'a2-009'],
    retrievalLessonIds: ['a2-010', 'a2-018'],
    commonErrorsRu: ['kasutatakse ta on seal, kus vaja tal on', 'mitmuse omadussõna ei sobi nimisõnaga'],
    explanation: 'Välimuse ja omaduste kirjeldamisel kasutame sageli konstruktsiooni tal on.',
    contrasts: ['Ta on pikk.', 'Tal on pikad juuksed.', 'Tal on prillid.'],
  }),
  createGrammarTarget({
    id: 'a2-person-description-questions',
    label: 'Kes? Milline? Kui vana? Kus? Mida teeb?',
    firstLevel: 'A2',
    firstLessonId: 'a2-006',
    masteryLevel: 'A2',
    controlledLessonIds: ['a2-008', 'a2-009'],
    retrievalLessonIds: ['a2-010', 'a2-011'],
    commonErrorsRu: ['küsimussõnad segunevad', 'mida teeb? asemel kasutatakse nimetavat vormi'],
    explanation: 'Inimese profiili mõistmiseks vali küsimussõna selle järgi, millist infot vajad.',
    contrasts: ['Kes ta on?', 'Milline ta on?', 'Kui vana ta on?', 'Kus ta elab?', 'Mida ta teeb?'],
  }),
]);

function enrichProfile(profile, plannedVocabulary) {
  if (!profile) return null;
  return {
    ...profile,
    module: moduleData?.title || 'Pere, inimesed ja kirjeldamine',
    grammarTargets: A2_MODULE_02_GRAMMAR,
    textbookVocabulary: plannedVocabulary,
    currentModuleLessonIds: lessonIds,
    previousModuleLessonIds,
  };
}

export function generateA2Module02({
  levelLexicon = [],
  seed = 'a2-module-02:textbook:v1',
  difficulty = 'core',
} = {}) {
  const lessons = moduleData?.lessons || [];
  const baseProfiles = lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
  const diagnostics = [];

  baseProfiles.forEach((profile, index) => {
    if (!profile) diagnostics.push({
      severity: 'error',
      code: 'A2_MODULE_02_PROFILE_MISSING',
      lessonId: lessons[index]?.id || '',
      message: 'Tunnil puudub valmis generaatoriprofiil.',
    });
  });

  const plannedVocabulary = planLexicalRecycling(A2_MODULE_02_CORE_VOCABULARY, lessonIds, nextModuleLessonIds);
  const lexicalCoverage = lexicalCoverageReport(plannedVocabulary, lessonIds, nextModuleLessonIds);
  if (!lexicalCoverage.ready) diagnostics.push({
    severity: 'error',
    code: 'A2_MODULE_02_LEXICAL_RECYCLING_LOW',
    message: 'Mooduli põhisõnavara kordusplaan ei vasta õpiku standardile.',
  });

  const profiles = baseProfiles.map((profile) => enrichProfile(profile, plannedVocabulary));
  const modulePlan = planModuleActivities({ lessons, profiles, seed, difficulty, countPerPhase: 5 });
  diagnostics.push(...modulePlan.diagnostics);

  const bundles = lessons.map((lesson, index) => {
    const profile = profiles[index];
    const planned = modulePlan.plans[index];
    if (!profile || !planned) return { lessonId: lesson.id, sheets: [], diagnostics: [] };
    const generated = generateLessonBundle({
      lesson,
      profile,
      levelLexicon,
      seed: `${seed}:${lesson.id}`,
      difficulty,
      variant: A2_MODULE_02_VERSION,
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
    moduleId: A2_MODULE_02_ID,
    moduleTitle: moduleData?.title || '',
    version: A2_MODULE_02_VERSION,
    lessonIds,
    plannedVocabulary,
    lexicalCoverage,
    grammarTargets: A2_MODULE_02_GRAMMAR,
    modulePlan,
    bundles,
    diagnostics,
    ready: complete && lexicalCoverage.ready && modulePlan.ready && !diagnostics.some((item) => item.severity === 'error'),
  };
}
