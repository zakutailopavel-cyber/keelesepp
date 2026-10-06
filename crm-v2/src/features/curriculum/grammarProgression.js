export const GRAMMAR_PROGRESSION_SCHEMA = 'keelesepp.grammar-progression/1';

export const GRAMMAR_STATES = Object.freeze(['new', 'recycled', 'assumed']);
export const GRAMMAR_MASTERY_STAGES = Object.freeze(['introduced', 'controlled', 'guided', 'independent', 'automatic']);

export function createGrammarTarget({
  id,
  label,
  firstLevel,
  firstLessonId,
  masteryLevel,
  prerequisites = [],
  controlledLessonIds = [],
  retrievalLessonIds = [],
  commonErrorsRu = [],
  explanation = '',
  contrasts = [],
} = {}) {
  return {
    schema: GRAMMAR_PROGRESSION_SCHEMA,
    id: String(id || '').trim(),
    label: String(label || '').trim(),
    firstLevel: String(firstLevel || '').trim(),
    firstLessonId: String(firstLessonId || '').trim(),
    masteryLevel: String(masteryLevel || '').trim(),
    prerequisites: [...prerequisites],
    controlledLessonIds: [...controlledLessonIds],
    retrievalLessonIds: [...retrievalLessonIds],
    commonErrorsRu: [...commonErrorsRu],
    explanation: String(explanation || '').trim(),
    contrasts: [...contrasts],
  };
}

export function validateGrammarTarget(target = {}) {
  const issues = [];
  if (target.schema !== GRAMMAR_PROGRESSION_SCHEMA) issues.push('schema invalid');
  if (!target.id) issues.push('id missing');
  if (!target.label) issues.push('label missing');
  if (!target.firstLevel) issues.push('firstLevel missing');
  if (!target.firstLessonId) issues.push('firstLessonId missing');
  if (!target.masteryLevel) issues.push('masteryLevel missing');
  return issues;
}

export function grammarStateForLesson(target = {}, lessonId = '') {
  const id = String(lessonId || '');
  if (!id) return '';
  if (id === target.firstLessonId) return 'new';
  if ((target.controlledLessonIds || []).includes(id) || (target.retrievalLessonIds || []).includes(id)) return 'recycled';
  return 'assumed';
}

export const GRAMMAR_PROGRESSION_EXAMPLES = Object.freeze([
  createGrammarTarget({
    id: 'local-cases-kus-kuhu-kust',
    label: 'Kus? Kuhu? Kust?',
    firstLevel: 'A2',
    firstLessonId: 'a2-017',
    masteryLevel: 'B1',
    controlledLessonIds: ['a2-018', 'a2-019', 'a2-021'],
    retrievalLessonIds: ['a2-020', 'a2b1-011', 'a2b1-012', 'a2b1-013'],
    commonErrorsRu: [
      'смешение -s/-st/-sse и -l/-lt/-le',
      'использование именительного падежа после глагола движения',
    ],
    explanation: 'Valik sõltub tähendusest: kus? = asukoht, kuhu? = siht, kust? = lähtekoht.',
    contrasts: ['koolis / kooli / koolist', 'laual / lauale / laualt'],
  }),
]);
