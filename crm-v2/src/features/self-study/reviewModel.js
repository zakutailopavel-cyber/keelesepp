// The student's own corrected sentences („Sinu lause” word cards). Since 2026-11-09 („Täna”, one practice UI) they are
// practised as practice-engine items (practice/engine/ownSentences.js, merged with the sentences of his recorded
// lessons); the old drill (ReviewDrill, buildReview, heldLessons) was removed.

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const key = (value) => clean(value).toLocaleLowerCase('et');
export const ERROR_PREFIX = 'Sinu lause:';

// the student's own corrected sentences („Pärast tundi” saves them as word cards: word = right, translation = his)
export function ownErrors(words = []) {
  return words
    .filter((word) => clean(word?.translation).startsWith(ERROR_PREFIX) && clean(word?.word))
    .map((word) => ({ said: clean(clean(word.translation).slice(ERROR_PREFIX.length)), corrected: clean(word.word) }))
    .filter((error) => error.said && key(error.said) !== key(error.corrected));
}
