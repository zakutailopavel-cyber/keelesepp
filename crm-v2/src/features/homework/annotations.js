const FALLBACK_IGNORED_KEYS = new Set(['answers', 'correct', 'total', 'wordCount', 'score', 'pct']);

function textValue(value) {
  return typeof value === 'string' && value.trim() ? value : '';
}

export function submissionWritingFields(submission = {}) {
  const answers = submission.answers && typeof submission.answers === 'object' ? submission.answers : {};
  const fields = [];
  const seen = new Set();
  const add = (blockId, label, value) => {
    const text = textValue(value);
    const id = String(blockId || '').trim();
    if (!id || !text || seen.has(id)) return;
    seen.add(id);
    fields.push({ blockId: id, label: label || 'Kirjalik vastus', text });
  };

  const blocks = submission.source?.worksheetData?.blocks || submission.worksheetData?.blocks || [];
  blocks.forEach((block, index) => {
    if (block?.type !== 'writing') return;
    add(block.id || `block-${index}`, block.instruction || block.task || block.prompt || `Kirjalik vastus ${index + 1}`, answers[block.id || `block-${index}`]);
  });

  if (submission.submissionKind === 'exercise') {
    add('exercise-writing', 'Kirjalik vastus', answers.text || answers.answers?.text);
  }

  Object.entries(answers).forEach(([key, value], index) => {
    if (FALLBACK_IGNORED_KEYS.has(key) || seen.has(key)) return;
    add(key, `Kirjalik vastus ${index + 1}`, value);
  });
  return fields;
}

export function validAnnotationsForText(text = '', annotations = [], blockId = '') {
  const result = [];
  const sorted = (Array.isArray(annotations) ? annotations : [])
    .filter((item) => !item?.dismissed && item?.blockId === blockId)
    .map((item) => ({ ...item, start: Number(item.start), end: Number(item.end) }))
    .filter((item) => Number.isInteger(item.start) && Number.isInteger(item.end) && item.start >= 0 && item.end > item.start && item.end <= text.length)
    .filter((item) => !item.selectedText || text.slice(item.start, item.end) === item.selectedText)
    .sort((a, b) => a.start - b.start || a.end - b.end);
  let cursor = 0;
  sorted.forEach((item) => {
    if (item.start < cursor) return;
    result.push(item);
    cursor = item.end;
  });
  return result;
}

export function splitAnnotatedText(text = '', annotations = [], blockId = '') {
  const parts = [];
  let cursor = 0;
  validAnnotationsForText(text, annotations, blockId).forEach((annotation) => {
    if (annotation.start > cursor) parts.push({ type: 'text', text: text.slice(cursor, annotation.start) });
    parts.push({ type: 'annotation', text: text.slice(annotation.start, annotation.end), annotation });
    cursor = annotation.end;
  });
  if (cursor < text.length || !parts.length) parts.push({ type: 'text', text: text.slice(cursor) });
  return parts;
}

export function createTextAnnotation({ blockId, start, end, selectedText, parandus, selgitus }) {
  const correction = String(parandus || '').trim();
  const explanation = String(selgitus || '').trim();
  if (!String(selectedText || '').trim()) throw new Error('Vali tekstist parandatav fragment.');
  if (!correction && !explanation) throw new Error('Lisa parandus või selgitus.');
  const createdAt = new Date().toISOString();
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    blockId: String(blockId || ''),
    start: Number(start),
    end: Number(end),
    selectedText: String(selectedText),
    parandus: correction,
    selgitus: explanation,
    createdAt,
    dismissed: false,
  };
}
