// „Minu sõnad ja vead” (owner 2026-10-23: понятный прогресс — „ты знаешь 840 слов”): plain numbers from the student's
// own cards, the same for the student and the family. A word counts as learned at Leitner box 3 (known three times,
// spread over days); a „Sinu lause” card in box 3 is a mistake he no longer makes.
const DAY = 86400000;
const SENTENCE = 'Sinu lause:';
const time = (value) => Date.parse(value || '') || 0;

export function wordGrowth(words = [], now = Date.now()) {
  const sentences = words.filter((word) => String(word.translation || '').startsWith(SENTENCE));
  const plain = words.filter((word) => !String(word.translation || '').startsWith(SENTENCE));
  const learned = plain.filter((word) => (word.box || 0) >= 3).length;
  const month = (word) => now - time(word.createdAt) <= 30 * DAY;
  return {
    words: plain.length,
    learned,
    newThisMonth: plain.filter(month).length,
    learning: plain.filter((word) => (word.box || 0) < 3 && (word.reviews || 0) > 0).length,
    mistakes: sentences.length,
    fixed: sentences.filter((word) => (word.box || 0) >= 3).length,
  };
}
