function clean(value) {
  return String(value ?? '').trim().toLocaleLowerCase('et').replace(/\s+/g, ' ');
}

function hasAnswer(value) {
  return value !== undefined && value !== null && (typeof value === 'number' || String(value).trim() !== '');
}

export function parseExerciseFill(text = '') {
  let answerIndex = 0;
  return String(text).split(/\[([^\]]+)\]/g).map((value, index) => index % 2 === 0
    ? { type: 'text', value }
    : { type: 'blank', answer: value, index: answerIndex++ });
}

export function exerciseProgress(exercise = {}, answers = {}) {
  const type = exercise.type || 'fill';
  if (type === 'fill') {
    const blanks = parseExerciseFill(exercise.text).filter((part) => part.type === 'blank');
    return { answered: blanks.filter((blank) => hasAnswer(answers[blank.index])).length, total: blanks.length };
  }
  if (['choice', 'reading'].includes(type)) {
    const questions = exercise.questions || [];
    return { answered: questions.filter((_, index) => hasAnswer(answers[index])).length, total: questions.length };
  }
  if (type === 'match' || type === 'translate') {
    const pairs = exercise.items || exercise.pairs || [];
    return { answered: pairs.filter((_, index) => hasAnswer(answers[index])).length, total: pairs.length };
  }
  if (type === 'writing') return { answered: hasAnswer(answers.text) ? 1 : 0, total: 1 };
  if (type === 'order') return { answered: hasAnswer(answers.sentence) ? 1 : 0, total: 1 };
  return { answered: 0, total: 0 };
}

export function evaluateExercise(exercise = {}, answers = {}) {
  const type = exercise.type || 'fill';
  let correct = 0;
  let total = 0;
  if (type === 'fill') parseExerciseFill(exercise.text).filter((part) => part.type === 'blank').forEach((blank) => { total += 1; if (clean(answers[blank.index]) === clean(blank.answer)) correct += 1; });
  else if (['choice', 'reading'].includes(type)) (exercise.questions || []).forEach((question, index) => { total += 1; if (Number(answers[index]) === Number(question.correct ?? 0)) correct += 1; });
  else if (type === 'match') (exercise.pairs || []).forEach((pair, index) => { total += 1; if (clean(answers[index]) === clean(pair.r || pair.right)) correct += 1; });
  else if (type === 'translate') (exercise.items || exercise.pairs || []).forEach((pair, index) => { total += 1; if (clean(answers[index]) === clean(pair.to || pair.r || pair.translation || pair.right)) correct += 1; });
  else if (type === 'order') { total = 1; correct = clean(answers.sentence) === clean(exercise.sentence || exercise.text) ? 1 : 0; }
  if (type === 'writing') {
    const text = String(answers.text || '').trim();
    return { answers, text, wordCount: text ? text.split(/\s+/).length : 0 };
  }
  return total ? { answers, correct, total } : { answers };
}

export function exerciseTypeLabel(type) {
  return ({ fill: 'Täida lüngad', choice: 'Vali vastus', writing: 'Kirjutamine', order: 'Koosta lause', match: 'Sobita paarid', reading: 'Lugemine', translate: 'Tõlkimine' })[type] || 'Harjutus';
}
