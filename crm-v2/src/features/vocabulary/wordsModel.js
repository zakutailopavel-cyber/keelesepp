// Lesson vocabulary: words the teacher adds during a lesson go to the student's own word list
// (`studentWords/{id}`), which the student practises with flashcards (Leitner boxes 0–5).

export const WORD_LIMITS = Object.freeze({ word: 120, translation: 200, example: 400, forms: 200 });
// days until the next review for each box; box 0 = new or forgotten (today)
export const BOX_DAYS = Object.freeze([0, 1, 3, 7, 14, 30]);
const DAY = 24 * 60 * 60 * 1000;

const text = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

// key forms from the word tools (Ekilex): [{ code, label, ru, value }] — at most 8, short strings only
export function cleanFormItems(items = []) {
  return (Array.isArray(items) ? items : []).slice(0, 8)
    .map((item) => ({ code: text(item?.code, 20), label: text(item?.label, 40), value: text(item?.value, 60) }))
    .filter((item) => item.code && item.label && item.value);
}

export function cleanWord(input = {}) {
  const formItems = cleanFormItems(input.formItems);
  return {
    word: text(input.word, WORD_LIMITS.word),
    translation: text(input.translation, WORD_LIMITS.translation),
    example: text(input.example, WORD_LIMITS.example),
    forms: text(input.forms, WORD_LIMITS.forms),
    ...(formItems.length ? { formItems } : {}),
  };
}

export function normalizeWord(id, data = {}) {
  const box = Number.isInteger(data.box) ? Math.min(5, Math.max(0, data.box)) : 0;
  return {
    id,
    studentId: data.studentId || '',
    invitationId: data.invitationId || '',
    word: data.word || '',
    translation: data.translation || '',
    example: data.example || '',
    forms: data.forms || '',
    formItems: Array.isArray(data.formItems) ? data.formItems : [],
    createdByName: data.createdByName || '',
    createdAt: data.createdAt || '',
    box,
    dueAt: data.dueAt || data.createdAt || '',
    reviews: Number.isInteger(data.reviews) ? data.reviews : 0,
  };
}

// knew → one box up (max 5); did not know → back to box 0, due now
export function review(word, knew, now = new Date()) {
  const box = knew ? Math.min(5, (word.box || 0) + 1) : 0;
  return {
    box,
    dueAt: new Date(now.getTime() + BOX_DAYS[box] * DAY).toISOString(),
    reviewedAt: now.toISOString(),
    reviews: (word.reviews || 0) + 1,
  };
}

export function isDue(word, now = Date.now()) {
  const due = Date.parse(word?.dueAt || '');
  return !Number.isFinite(due) || due <= now;
}

// due words first (the oldest due first), then the rest by box
export function practiceOrder(words = [], now = Date.now()) {
  return [...words].filter((word) => isDue(word, now))
    .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)) || a.box - b.box);
}

export function newestFirst(words = []) {
  return [...words].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function sameWord(words = [], word = '') {
  const key = text(word, WORD_LIMITS.word).toLocaleLowerCase('et');
  return key ? words.find((item) => item.word.toLocaleLowerCase('et') === key) || null : null;
}

// A practice question for a word with forms: alternate between the meaning card and one of its forms
// (the base form is not asked). Deterministic per word and review count, so a reload asks the same.
export function formQuestion(word) {
  const asked = (word?.formItems || []).filter((item) => item.code !== 'SgN' && item.code !== 'Sup' && item.value !== word.word);
  if (!asked.length || (word.reviews || 0) % 2 === 0) return null;
  return asked[Math.floor((word.reviews || 0) / 2) % asked.length];
}

export function sameForm(answer, expected) {
  const norm = (value) => String(value || '').trim().toLocaleLowerCase('et').replace(/\s+/g, ' ');
  return Boolean(norm(answer)) && norm(expected).split(/\s*[,/]\s*/).includes(norm(answer));
}
