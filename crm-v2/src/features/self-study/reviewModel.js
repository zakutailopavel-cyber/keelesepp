// „Kordamine” (owner 2026-10-12): the course worksheets belong to the lesson with the teacher, the student does not go
// through them on his own. Between lessons he repeats what was already held: a short drill (≈10 tasks, 5–10 minutes)
// built here without AI from the words of the held lesson, their three key forms and his own corrected sentences.
import { checkAnswer } from '../vocabulary/deckModel.js';

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const key = (value) => clean(value).toLocaleLowerCase('et');
export const ERROR_PREFIX = 'Sinu lause:';

// lessons held with the teacher (done lessons with a course topic), newest first, each once
export function heldLessons(lessons = [], catalog) {
  if (!catalog?.byId) return [];
  const seen = new Set();
  return [...lessons]
    .filter((lesson) => lesson?.topicLessonId && catalog.byId.has(lesson.topicLessonId))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .filter((lesson) => !seen.has(lesson.topicLessonId) && seen.add(lesson.topicLessonId))
    .map((lesson) => ({ ...catalog.byId.get(lesson.topicLessonId), heldAt: String(lesson.date || '').slice(0, 10) }));
}

// the student's own corrected sentences („Pärast tundi” saves them as word cards: word = right, translation = his)
export function ownErrors(words = []) {
  return words
    .filter((word) => clean(word?.translation).startsWith(ERROR_PREFIX) && clean(word?.word))
    .map((word) => ({ said: clean(clean(word.translation).slice(ERROR_PREFIX.length)), corrected: clean(word.word) }))
    .filter((error) => error.said && key(error.said) !== key(error.corrected));
}

// deterministic random (same seed → same drill)
export function seeded(seed = 1) {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, random) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

const single = (text) => !/\s/.test(clean(text));

/**
 * cards: [{ front, back }] (Estonian → meaning); forms(word) → [nimetav, omastav, osastav] or []; errors: ownErrors().
 * Returns at most `size` tasks of five kinds, mixed so that the same kind never comes twice in a row when avoidable:
 * meaning (choose), recall (write the Estonian word), forms (write omastav + osastav), fix (choose the right sentence),
 * order (put his corrected sentence together).
 */
export function buildReview({ cards = [], forms = () => [], errors = [], seed = 1, size = 10 } = {}) {
  const random = seeded(seed);
  const deck = shuffle(cards.filter((card) => clean(card.front) && clean(card.back)), random);
  const pools = { meaning: [], recall: [], forms: [], fix: [], order: [] };
  deck.forEach((card, index) => {
    const others = shuffle(deck.filter((other) => key(other.back) !== key(card.back)), random).slice(0, 3).map((other) => clean(other.back));
    if (others.length >= 2 && index % 2 === 0) pools.meaning.push({ kind: 'meaning', ask: clean(card.front), options: shuffle([clean(card.back), ...others], random), answer: clean(card.back) });
    else pools.recall.push({ kind: 'recall', ask: clean(card.back), answer: clean(card.front) });
    const three = single(card.front) ? forms(clean(card.front)) || [] : [];
    if (three.length >= 3 && key(three[0]) === key(card.front)) pools.forms.push({ kind: 'forms', ask: three[0], hint: clean(card.back), answer: [three[1], three[2]] });
  });
  shuffle(errors, random).forEach((error, index) => {
    const parts = clean(error.corrected).split(' ');
    if (index % 2 === 0 || parts.length < 3 || parts.length > 9) pools.fix.push({ kind: 'fix', options: shuffle([error.corrected, error.said], random), answer: error.corrected });
    else pools.order.push({ kind: 'order', pieces: shuffle(parts, random), answer: error.corrected });
  });
  const order = ['fix', 'meaning', 'forms', 'recall', 'order'];
  const tasks = [];
  while (tasks.length < size && order.some((kind) => pools[kind].length)) {
    for (const kind of order) {
      if (tasks.length >= size) break;
      const task = pools[kind].shift();
      if (task) tasks.push({ ...task, id: `${kind}-${tasks.length}` });
    }
  }
  return tasks;
}

// 'right' | 'almost' | 'wrong'; `given` is a string, or [omastav, osastav] for forms
export function checkTask(task, given) {
  if (task.kind === 'forms') {
    const results = task.answer.map((expected, index) => checkAnswer(given?.[index], expected));
    if (results.every((result) => result === 'right')) return 'right';
    return results.every((result) => result !== 'wrong') ? 'almost' : 'wrong';
  }
  if (task.kind === 'meaning' || task.kind === 'fix') return key(given) === key(task.answer) ? 'right' : 'wrong';
  if (task.kind === 'order') return key(given).replace(/[.,!?]/g, '') === key(task.answer).replace(/[.,!?]/g, '') ? 'right' : 'wrong';
  return checkAnswer(given, task.answer);
}
