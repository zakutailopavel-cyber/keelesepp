export const TEXTBOOK_CONTRACT_VERSION = 1;

export const TEXTBOOK_LEVELS = Object.freeze(['A2', 'B1', 'B2', 'C1']);

export const TEXTBOOK_LEVEL_CONTRACT = Object.freeze({
  A2: Object.freeze({
    curriculumId: 'est-a2-curriculum-v1',
    manifest: '/data/keelesepp-a2-roadmap.json',
    lessonCount: 100,
    moduleCount: 20,
    lessonMinutes: 60,
    receptiveTextWords: [80, 160],
    speakingSeconds: [60, 120],
    writingWords: [40, 90],
    coreVocabularyPerModule: [12, 16],
    previousModuleRecyclePct: [20, 30],
    requiredSkills: ['reading', 'listening', 'speaking', 'writing', 'interaction'],
    assessmentEveryLessons: 5,
  }),
  B1: Object.freeze({
    curriculumId: 'est-a2-b1-roadmap-v1',
    manifest: '/data/keelesepp-a2-b1-roadmap.json',
    lessonCount: 90,
    moduleCount: 18,
    lessonMinutes: 60,
    receptiveTextWords: [140, 260],
    speakingSeconds: [120, 240],
    writingWords: [70, 150],
    coreVocabularyPerModule: [14, 18],
    previousModuleRecyclePct: [20, 30],
    requiredSkills: ['reading', 'listening', 'speaking', 'writing', 'interaction', 'mediation'],
    assessmentEveryLessons: 5,
  }),
  B2: Object.freeze({
    curriculumId: 'est-b1-b2-roadmap-v1',
    manifest: '/data/keelesepp-b1-b2-roadmap.json',
    lessonCount: 90,
    moduleCount: 18,
    lessonMinutes: 60,
    receptiveTextWords: [220, 420],
    speakingSeconds: [240, 360],
    writingWords: [140, 260],
    coreVocabularyPerModule: [16, 22],
    previousModuleRecyclePct: [25, 35],
    requiredSkills: ['reading', 'listening', 'speaking', 'writing', 'interaction', 'mediation', 'argumentation'],
    assessmentEveryLessons: 5,
  }),
  C1: Object.freeze({
    curriculumId: 'est-c1-curriculum-240-v1',
    manifest: '/data/keelesepp-c1-curriculum.json',
    lessonCount: 100,
    moduleCount: 10,
    lessonMinutes: 120,
    receptiveTextWords: [350, 700],
    speakingSeconds: [300, 600],
    writingWords: [220, 420],
    coreVocabularyPerModule: [20, 28],
    previousModuleRecyclePct: [25, 40],
    requiredSkills: ['reading', 'listening', 'speaking', 'writing', 'interaction', 'mediation', 'argumentation', 'synthesis'],
    assessmentEveryLessons: 10,
  }),
});

export const TEXTBOOK_PHASE_CONTRACT = Object.freeze({
  discover: Object.freeze({
    label: 'Avasta',
    purpose: 'meaning-and-noticing',
    requiredFamilies: ['activation', 'context-input', 'comprehension', 'noticing', 'first-use'],
    minBlocks: 7,
    maxBlocks: 9,
  }),
  practice: Object.freeze({
    label: 'Harjuta',
    purpose: 'accuracy-and-flexibility',
    requiredFamilies: ['retrieval', 'form-meaning', 'transformation', 'repair-or-contrast', 'mixed-recycling'],
    minBlocks: 6,
    maxBlocks: 9,
  }),
  transfer: Object.freeze({
    label: 'Kasuta',
    purpose: 'independent-transfer',
    requiredFamilies: ['retrieval', 'scenario', 'extended-production', 'reflection'],
    minBlocks: 4,
    maxBlocks: 8,
  }),
});

export const TEXTBOOK_MODULE_COMPONENTS = Object.freeze([
  'module-opener',
  'lesson-bundles',
  'module-revision',
  'module-assessment',
  'module-project',
]);

export const TEXTBOOK_LESSON_COMPONENTS = Object.freeze([
  'discover',
  'practice',
  'transfer',
  'teacher-notes',
  'answer-key',
  'homework-or-retrieval',
]);

export const LEXICAL_ENCOUNTER_CONTRACT = Object.freeze({
  minimumEncounters: 5,
  requiredModes: ['receptive', 'controlled', 'productive', 'retrieval'],
  preferredSchedule: ['same-lesson', 'next-lesson', 'plus-2-or-3-lessons', 'module-assessment', 'next-module'],
});

export const VOCABULARY_ENTRY_FIELDS = Object.freeze([
  'id',
  'lemma',
  'forms',
  'translationRu',
  'level',
  'topicIds',
  'partOfSpeech',
  'collocations',
  'government',
  'example',
  'activeFromLessonId',
  'recycleLessonIds',
]);

export const TEXTBOOK_ACTIVITY_FAMILIES = Object.freeze([
  'lexical-recognition',
  'classification',
  'context-comprehension',
  'guided-dialogue',
  'controlled-cloze',
  'sentence-reconstruction',
  'error-repair',
  'transformation',
  'mediation',
  'listening-reconstruction',
  'information-gap',
  'sequencing',
  'ranking',
  'decision-path',
  'roleplay',
  'problem-solving',
  'planning',
  'oral-production',
  'written-production',
  'argumentation',
  'synthesis',
  'reflection',
]);

export function textbookLevel(level) {
  const key = String(level || '').trim().toUpperCase();
  return TEXTBOOK_LEVEL_CONTRACT[key] || null;
}

export function textbookLessonCount() {
  return TEXTBOOK_LEVELS.reduce((sum, level) => sum + TEXTBOOK_LEVEL_CONTRACT[level].lessonCount, 0);
}

export function validateTextbookLevelContract(level, contract = textbookLevel(level)) {
  if (!contract) return ['unknown level'];
  const issues = [];
  if (!contract.curriculumId) issues.push('curriculumId missing');
  if (!contract.manifest) issues.push('manifest missing');
  if (!(contract.lessonCount > 0)) issues.push('lessonCount invalid');
  if (!(contract.moduleCount > 0)) issues.push('moduleCount invalid');
  if (!(contract.lessonMinutes >= 60)) issues.push('lessonMinutes invalid');
  if (!Array.isArray(contract.requiredSkills) || contract.requiredSkills.length < 5) issues.push('requiredSkills incomplete');
  if (!Array.isArray(contract.coreVocabularyPerModule) || contract.coreVocabularyPerModule.length !== 2) issues.push('coreVocabularyPerModule invalid');
  return issues;
}
