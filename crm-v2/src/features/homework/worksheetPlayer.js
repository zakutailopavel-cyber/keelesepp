function clean(value) {
  return String(value ?? '').trim().toLocaleLowerCase('et').replace(/\s+/g, ' ');
}

function hasAnswer(value) {
  return value !== undefined && value !== null && (typeof value === 'number' || String(value).trim() !== '');
}

function questions(block) {
  return block.questions || [];
}

function options(question) {
  return question.opts || question.options || [];
}

const VISUAL_ANSWER_TYPES = new Set(['input', 'textarea', 'choice', 'checkbox']);

function visualElements(file = {}) {
  return Array.isArray(file?.interactiveOverlay?.elements) ? file.interactiveOverlay.elements : [];
}

function isImageWorksheetFile(file = {}) {
  const type = String(file.type || '').toLocaleLowerCase('en');
  const name = String(file.name || '').toLocaleLowerCase('en');
  return type.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(name);
}

function hasOwnAnswer(answers, key) {
  return Object.prototype.hasOwnProperty.call(answers || {}, key);
}

function hasExpectedAnswer(element = {}) {
  return element.correctAnswer !== undefined && element.correctAnswer !== null && String(element.correctAnswer).trim() !== '';
}

function expectedVisualAnswer(element = {}) {
  const raw = element.correctAnswer;
  if (element.type === 'choice' && /^\d+$/.test(String(raw ?? '').trim())) {
    const index = Number(raw);
    if (Array.isArray(element.options) && element.options[index] !== undefined) return element.options[index];
  }
  if (element.type === 'checkbox') {
    return ['true', '1', 'yes', 'jah', 'checked'].includes(clean(raw));
  }
  return raw;
}

export function visualAnswerKey(fileIndex, element = {}) {
  const id = String(element.id || 'field').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 180);
  return `visual_${fileIndex}_${id}`;
}

export function visualWorksheetPages(files = []) {
  return (Array.isArray(files) ? files : []).map((file, fileIndex) => ({
    file,
    fileIndex,
    elements: visualElements(file),
  })).filter(({ file, elements }) => isImageWorksheetFile(file) && elements.length);
}

export function visualWorksheetProgress(files = [], answers = {}) {
  let answered = 0;
  let total = 0;
  visualWorksheetPages(files).forEach(({ fileIndex, elements }) => {
    elements.filter((element) => VISUAL_ANSWER_TYPES.has(element?.type)).forEach((element) => {
      const key = visualAnswerKey(fileIndex, element);
      total += 1;
      if (element.type === 'checkbox' ? hasOwnAnswer(answers, key) : hasAnswer(answers[key])) answered += 1;
    });
  });
  return { answered, total, complete: total === 0 || answered === total };
}

export function visualAnswerMatches(element = {}, value) {
  if (!hasExpectedAnswer(element)) return null;
  const expected = expectedVisualAnswer(element);
  if (element.type === 'checkbox') return Boolean(value) === Boolean(expected);
  return clean(value) === clean(expected);
}

export function calculateVisualWorksheetResult(files = [], answers = {}) {
  let correct = 0;
  let total = 0;
  const errorLog = [];
  visualWorksheetPages(files).forEach(({ file, fileIndex, elements }) => {
    elements.filter((element) => VISUAL_ANSWER_TYPES.has(element?.type) && hasExpectedAnswer(element)).forEach((element) => {
      const key = visualAnswerKey(fileIndex, element);
      const given = answers[key];
      total += 1;
      if (visualAnswerMatches(element, given)) correct += 1;
      else errorLog.push({
        type: `visual_${element.type}`,
        blockLabel: element.label || file.name || `Leht ${fileIndex + 1}`,
        correct: String(expectedVisualAnswer(element) ?? ''),
        given: hasOwnAnswer(answers, key) ? String(given) : '(vastamata)',
      });
    });
  });
  return {
    score: total ? { correct, total, pct: Math.round((correct / total) * 100) } : null,
    errorLog: errorLog.slice(0, 20),
  };
}

export function mergeWorksheetResults(...results) {
  const valid = results.filter(Boolean);
  const scored = valid.map((result) => result.score).filter((score) => score && Number(score.total) > 0);
  const correct = scored.reduce((sum, score) => sum + Number(score.correct || 0), 0);
  const total = scored.reduce((sum, score) => sum + Number(score.total || 0), 0);
  return {
    score: total ? { correct, total, pct: Math.round((correct / total) * 100) } : null,
    errorLog: valid.flatMap((result) => result.errorLog || []).slice(0, 20),
  };
}

export function parseFillText(text = '') {
  let blankIndex = 0;
  return String(text).split(/\[([^\]]+)\]/g).map((value, index) => (
    index % 2 === 0 ? { type: 'text', value } : { type: 'blank', answer: value, index: blankIndex++ }
  ));
}

export function answerKey(block, ...parts) {
  return [block.id, ...parts].join('_');
}

export function worksheetProgress(blocks = [], answers = {}) {
  let answered = 0;
  let total = 0;
  const add = (key) => { total += 1; if (hasAnswer(answers[key])) answered += 1; };
  blocks.forEach((block) => {
    if (block.type === 'fill') parseFillText(block.text).filter((part) => part.type === 'blank').forEach((part) => add(answerKey(block, part.index)));
    else if (['choice', 'reading'].includes(block.type)) questions(block).forEach((_, index) => add(answerKey(block, index)));
    else if (block.type === 'match') (block.pairs || []).forEach((_, index) => add(answerKey(block, index)));
    else if (['writing', 'order'].includes(block.type)) add(block.id);
    else if (block.type === 'dialogue') (block.lines || []).forEach((line, lineIndex) => parseFillText(line.text).filter((part) => part.type === 'blank').forEach((part) => add(answerKey(block, lineIndex, part.index))));
    else if (['error_correction', 'transformation'].includes(block.type)) (block.sentences || []).forEach((_, index) => add(answerKey(block, index)));
    else if (block.type === 'translate') (block.items || block.pairs || []).forEach((_, index) => add(answerKey(block, index)));
    else if (block.type === 'table') Array.from({ length: Math.max(Number(block.rows) || 0, 1) }, (_, row) => (block.headers || []).forEach((_, column) => add(answerKey(block, row, column))));
  });
  return { answered, total, complete: total === 0 || answered === total };
}

export function calculateWorksheetResult(blocks = [], answers = {}) {
  let correct = 0;
  let total = 0;
  const errorLog = [];
  const check = ({ block, key, expected, type, question = '' }) => {
    total += 1;
    const given = answers[key];
    if (clean(given) === clean(expected)) correct += 1;
    else errorLog.push({
      type,
      blockLabel: block.label || block.instruction || 'Ülesanne',
      ...(question ? { question } : {}),
      correct: String(expected ?? ''),
      given: hasAnswer(given) ? String(given) : '(vastamata)',
    });
  };

  blocks.forEach((block) => {
    if (block.type === 'fill') parseFillText(block.text).filter((part) => part.type === 'blank').forEach((part) => check({ block, key: answerKey(block, part.index), expected: part.answer, type: 'fill' }));
    else if (['choice', 'reading'].includes(block.type)) questions(block).forEach((question, index) => {
      const expectedIndex = Number(question.correct ?? 0);
      const selected = answers[answerKey(block, index)];
      total += 1;
      if (Number(selected) === expectedIndex) correct += 1;
      else errorLog.push({ type: block.type, blockLabel: block.label || block.instruction || 'Valikvastus', question: question.q || question.question || '', correct: options(question)[expectedIndex] || '', given: options(question)[Number(selected)] || '(vastamata)' });
    });
    else if (block.type === 'match') (block.pairs || []).forEach((pair, index) => check({ block, key: answerKey(block, index), expected: pair.r || pair.right, type: 'match', question: pair.l || pair.left }));
    else if (block.type === 'dialogue') (block.lines || []).forEach((line, lineIndex) => parseFillText(line.text).filter((part) => part.type === 'blank').forEach((part) => check({ block, key: answerKey(block, lineIndex, part.index), expected: part.answer, type: 'dialogue' })));
    else if (block.type === 'error_correction') (block.sentences || []).forEach((sentence, index) => check({ block, key: answerKey(block, index), expected: sentence.correct, type: 'error_correction', question: sentence.wrong }));
    else if (block.type === 'translate') (block.items || block.pairs || []).forEach((pair, index) => check({ block, key: answerKey(block, index), expected: pair.to || pair.r || pair.right, type: 'translate', question: pair.from || pair.l || pair.left }));
    else if (block.type === 'order' && block.sentence) check({ block, key: block.id, expected: block.sentence, type: 'order' });
  });
  return {
    score: total ? { correct, total, pct: Math.round((correct / total) * 100) } : null,
    errorLog: errorLog.slice(0, 20),
  };
}

export function blockTitle(type) {
  return ({
    text: 'Juhis', image: 'Pilt', fill: 'Täida lüngad', choice: 'Vali vastus', reading: 'Lugemistekst', writing: 'Kirjutamine', match: 'Sobita paarid', order: 'Järjesta sõnad', table: 'Täida tabel', dialogue: 'Dialoog', error_correction: 'Paranda vead', transformation: 'Muuda lauseid', translate: 'Tõlgi',
  })[type] || 'Ülesanne';
}
