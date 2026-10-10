import roadmap from '../../curriculum/a2Roadmap.json';
import { createGrammarTarget } from '../../curriculum/grammarProgression.js';
import { createVocabularyEntry } from '../../curriculum/textbookVocabulary.js';
import { generateTextbookLessonBundle } from '../engine/generator.js';
import { lexicalCoverageReport, planLexicalRecycling, planModuleActivities, scheduledVocabularyForLesson } from '../engine/modulePlanner.js';
import { generatorProfileForLesson } from '../profiles/index.js';

export const A2_MODULE_01_ID = 'a2-module-01';
export const A2_MODULE_01_VERSION = 1;

const moduleData = roadmap.modules.find((item) => item.id === A2_MODULE_01_ID);
const lessonIds = (moduleData?.lessons || []).map((lesson) => lesson.id);
const nextModuleLessonIds = (roadmap.modules.find((item) => item.id === 'a2-module-02')?.lessons || []).map((lesson) => lesson.id);

const vocab = (id, lemma, forms, translationRu, partOfSpeech, topicIds = ['eneseinfo']) => createVocabularyEntry({
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

export const A2_MODULE_01_CORE_VOCABULARY = Object.freeze([
  vocab('a2m01-nimi', 'nimi', ['nimi', 'nime', 'nime'], 'имя', 'noun'),
  vocab('a2m01-aadress', 'aadress', ['aadress', 'aadressi', 'aadressi'], 'адрес', 'noun'),
  vocab('a2m01-telefoninumber', 'telefoninumber', ['telefoninumber', 'telefoninumbri', 'telefoninumbrit'], 'номер телефона', 'noun'),
  vocab('a2m01-sunniaeg', 'sünniaeg', ['sünniaeg', 'sünniaja', 'sünniaega'], 'дата рождения', 'noun'),
  vocab('a2m01-e-post', 'e-post', ['e-post', 'e-posti', 'e-posti'], 'электронная почта', 'noun'),
  vocab('a2m01-kodakondsus', 'kodakondsus', ['kodakondsus', 'kodakondsuse', 'kodakondsust'], 'гражданство', 'noun'),
  vocab('a2m01-elukoht', 'elukoht', ['elukoht', 'elukoha', 'elukohta'], 'место жительства', 'noun'),
  vocab('a2m01-keel', 'keel', ['keel', 'keele', 'keelt'], 'язык', 'noun'),
  vocab('a2m01-elama', 'elama', ['elama', 'elada', 'elan'], 'жить', 'verb'),
  vocab('a2m01-tootama', 'töötama', ['töötama', 'töötada', 'töötan'], 'работать', 'verb'),
  vocab('a2m01-oppima', 'õppima', ['õppima', 'õppida', 'õpin'], 'учиться', 'verb'),
  vocab('a2m01-raakima', 'rääkima', ['rääkima', 'rääkida', 'räägin'], 'говорить', 'verb'),
  vocab('a2m01-tutvuma', 'tutvuma', ['tutvuma', 'tutvuda', 'tutvun'], 'знакомиться', 'verb'),
  vocab('a2m01-kordama', 'kordama', ['kordama', 'korrata', 'kordan'], 'повторять', 'verb'),
  vocab('a2m01-opilane', 'õpilane', ['õpilane', 'õpilase', 'õpilast'], 'ученик', 'noun'),
  vocab('a2m01-opetaja', 'õpetaja', ['õpetaja', 'õpetaja', 'õpetajat'], 'учитель', 'noun'),
]);

export const A2_MODULE_01_GRAMMAR = Object.freeze([
  createGrammarTarget({
    id: 'a2-personal-pronouns-and-olema',
    label: 'Isikulised asesõnad + olema olevikus',
    firstLevel: 'A2',
    firstLessonId: 'a2-001',
    masteryLevel: 'A2',
    controlledLessonIds: ['a2-002', 'a2-003'],
    retrievalLessonIds: ['a2-004', 'a2-005', 'a2-006'],
    commonErrorsRu: ['asesõna ja verbivormi mittevastavus', 'ei + on asemel ei ole'],
    explanation: 'Olevikus muutub olema isiku järgi: olen, oled, on, oleme, olete, on.',
    contrasts: ['ma olen / ma ei ole', 'sa oled / sa ei ole', 'ta on / ta ei ole'],
  }),
  createGrammarTarget({
    id: 'a2-present-common-verbs',
    label: 'Sagedased tegusõnad olevikus',
    firstLevel: 'A2',
    firstLessonId: 'a2-003',
    masteryLevel: 'A2',
    controlledLessonIds: ['a2-003', 'a2-004'],
    retrievalLessonIds: ['a2-005', 'a2-006', 'a2-009'],
    commonErrorsRu: ['mina-vormi asemel kasutatakse tema-vormi', 'eituses jäetakse põhiverb valesse vormi'],
    explanation: 'Olevikus vali verbivorm tegija järgi ja kasuta eituses ei + olevikuvorm.',
    contrasts: ['ma elan / ta elab', 'ma töötan / ma ei tööta', 'ma räägin / me räägime'],
  }),
  createGrammarTarget({
    id: 'a2-basic-question-forms',
    label: 'Põhiküsimused eneseinfo kohta',
    firstLevel: 'A2',
    firstLessonId: 'a2-001',
    masteryLevel: 'A2',
    controlledLessonIds: ['a2-002', 'a2-004'],
    retrievalLessonIds: ['a2-005', 'a2-009'],
    commonErrorsRu: ['küsimussõna järel kasutatakse vale isikuvormi', 'küsimuse sõnajärg muutub vene keele mõjul'],
    explanation: 'Küsimussõna näitab, millist infot küsitakse: mis, kus, kust, millal, kui vana.',
    contrasts: ['Mis su nimi on?', 'Kus sa elad?', 'Kust sa pärit oled?', 'Millal sul tund on?'],
  }),
]);

function enrichProfile(profile, plannedVocabulary, lessonId) {
  if (!profile) return null;
  const focusIds = (profile.focuses || []).map((item) => item.id);
  const scheduled = scheduledVocabularyForLesson(plannedVocabulary, lessonId, focusIds);
  const seen = new Set();
  const activeVocabulary = [...scheduled, ...(profile.activeVocabulary || [])].filter((item) => {
    const key = String(item.word || '').toLocaleLowerCase('et');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return {
    ...profile,
    module: moduleData?.title || 'A2 lähtepunkt ja eneseinfo',
    activeVocabulary,
    recycledVocabularyIds: scheduled.filter((item) => plannedVocabulary.find((entry) => entry.id === item.id)?.activeFromLessonId !== lessonId).map((item) => item.id),
    grammarTargets: A2_MODULE_01_GRAMMAR,
    textbookVocabulary: plannedVocabulary,
    currentModuleLessonIds: lessonIds,
    previousModuleLessonIds: [],
  };
}

export function generateA2Module01({
  levelLexicon = [],
  seed = 'a2-module-01:textbook:v1',
  difficulty = 'core',
} = {}) {
  const lessons = moduleData?.lessons || [];
  const baseProfiles = lessons.map((lesson) => generatorProfileForLesson(lesson.id, lesson));
  const diagnostics = [];

  baseProfiles.forEach((profile, index) => {
    if (!profile) diagnostics.push({
      severity: 'error',
      code: 'A2_MODULE_01_PROFILE_MISSING',
      lessonId: lessons[index]?.id || '',
      message: 'Tunnil puudub valmis generaatoriprofiil.',
    });
  });

  const plannedVocabulary = planLexicalRecycling(A2_MODULE_01_CORE_VOCABULARY, lessonIds, nextModuleLessonIds);
  const lexicalCoverage = lexicalCoverageReport(plannedVocabulary, lessonIds, nextModuleLessonIds);
  if (!lexicalCoverage.ready) diagnostics.push({
    severity: 'error',
    code: 'A2_MODULE_01_LEXICAL_RECYCLING_LOW',
    message: 'Mooduli põhisõnavara kordusplaan ei vasta õpiku standardile.',
  });

  const profiles = baseProfiles.map((profile, index) => enrichProfile(profile, plannedVocabulary, lessons[index]?.id));
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
      variant: A2_MODULE_01_VERSION,
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
    moduleId: A2_MODULE_01_ID,
    moduleTitle: moduleData?.title || '',
    version: A2_MODULE_01_VERSION,
    lessonIds,
    plannedVocabulary,
    lexicalCoverage,
    grammarTargets: A2_MODULE_01_GRAMMAR,
    modulePlan,
    bundles,
    diagnostics,
    ready: complete && lexicalCoverage.ready && modulePlan.ready && !diagnostics.some((item) => item.severity === 'error'),
  };
}
