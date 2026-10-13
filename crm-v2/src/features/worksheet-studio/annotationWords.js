// one word picked (a double click selects it): the composer also offers „Sõna” — its three key forms and translation,
// added to the student's „Sõnad” with one click (owner 2026-10-13)
const LETTERS = /^[^\p{L}]+|[^\p{L}]+$/gu;
export const singleWord = (text) => { const word = String(text || '').trim().replace(LETTERS, ''); return word && !/\s/.test(word) && word.length <= 60 ? word : ''; };
// a corrected answer for „Minu vead”: the student's sentence with the marked part replaced by the right form
export const correctedAnswer = (value, start, end, fix) => `${String(value).slice(0, start)}${fix}${String(value).slice(end)}`.replace(/\s+/g, ' ').trim();
