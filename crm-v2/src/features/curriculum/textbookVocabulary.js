export const TEXTBOOK_VOCABULARY_SCHEMA = 'keelesepp.textbook-vocabulary/1';

export const VOCABULARY_STATUSES = Object.freeze(['new', 'current-module', 'previous-module', 'long-gap']);

export function createVocabularyEntry({
  id,
  lemma,
  forms = [],
  translationRu,
  level,
  topicIds = [],
  partOfSpeech = '',
  collocations = [],
  government = '',
  example = '',
  activeFromLessonId = '',
  recycleLessonIds = [],
  sourceLexiconLemma = '',
} = {}) {
  return {
    schema: TEXTBOOK_VOCABULARY_SCHEMA,
    id: String(id || '').trim(),
    lemma: String(lemma || '').trim(),
    forms: [...forms],
    translationRu: String(translationRu || '').trim(),
    level: String(level || '').trim(),
    topicIds: [...topicIds],
    partOfSpeech: String(partOfSpeech || '').trim(),
    collocations: [...collocations],
    government: String(government || '').trim(),
    example: String(example || '').trim(),
    activeFromLessonId: String(activeFromLessonId || '').trim(),
    recycleLessonIds: [...recycleLessonIds],
    sourceLexiconLemma: String(sourceLexiconLemma || lemma || '').trim(),
  };
}

export function validateVocabularyEntry(entry = {}) {
  const issues = [];
  if (entry.schema !== TEXTBOOK_VOCABULARY_SCHEMA) issues.push('schema invalid');
  if (!entry.id) issues.push('id missing');
  if (!entry.lemma) issues.push('lemma missing');
  if (!entry.translationRu) issues.push('translationRu missing');
  if (!entry.level) issues.push('level missing');
  if (!Array.isArray(entry.forms) || entry.forms.length < 3) issues.push('three learner forms required');
  if (!entry.activeFromLessonId) issues.push('activeFromLessonId missing');
  return issues;
}

export function vocabularyStatusForLesson(entry = {}, lessonId = '', { currentModuleLessonIds = [], previousModuleLessonIds = [] } = {}) {
  const id = String(lessonId || '');
  if (!id) return '';
  if (id === entry.activeFromLessonId) return 'new';
  if (currentModuleLessonIds.includes(id) && (entry.recycleLessonIds || []).includes(id)) return 'current-module';
  if (previousModuleLessonIds.includes(entry.activeFromLessonId) && (entry.recycleLessonIds || []).includes(id)) return 'previous-module';
  if ((entry.recycleLessonIds || []).includes(id)) return 'long-gap';
  return '';
}

export function hasRequiredLexicalEncounters(entry = {}) {
  return new Set([entry.activeFromLessonId, ...(entry.recycleLessonIds || [])].filter(Boolean)).size >= 5;
}
