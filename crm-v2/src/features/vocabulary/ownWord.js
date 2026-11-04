// „Lisa oma sõna” (owner 2026-11-04): the student adds a word or a short phrase to „Minu sõnad”. The server
// (languageApi /own-word) checks the spelling, gives the base form and a translation; everything stays editable and
// nothing is forced. Pure helpers here; the form is OwnWordForm.jsx.

export const OWN_WORD_MAX = 60;
export const OWN_WORD_WORDS = 4;

// the student's language for the translation; Russian by default, remembered per browser
export const TRANSLATION_LANGUAGES = Object.freeze([
  { value: 'ru', label: 'русский' },
  { value: 'en', label: 'English' },
  { value: 'uk', label: 'українська' },
]);
const TGT_KEY = 'keelesepp.ownWord.tgt';

export function rememberedTarget(storage = globalThis.localStorage) {
  try {
    const value = storage?.getItem?.(TGT_KEY) || '';
    return TRANSLATION_LANGUAGES.some((item) => item.value === value) ? value : 'ru';
  } catch {
    return 'ru';
  }
}

export function rememberTarget(value, storage = globalThis.localStorage) {
  try { storage?.setItem?.(TGT_KEY, value); } catch { /* private window: the choice is not kept */ }
}

// the languages a student can add words in: Estonian always, English when a card has an English course
export function wordLanguagesFor(students = []) {
  const subjects = (Array.isArray(students) ? students : []).flatMap((student) => [
    student?.subject, ...(Array.isArray(student?.enrollments) ? student.enrollments.map((item) => item?.subject) : []),
  ]).map((value) => String(value || '').toLocaleLowerCase('et'));
  const english = subjects.some((value) => /inglise|english|англ/.test(value));
  return english ? ['et', 'en'] : ['et'];
}

const key = (value) => String(value ?? '').replace(/\s+/g, ' ').trim().replace(/[.!?,;:]+$/, '').toLocaleLowerCase('et');

// a word already in the list: the same text (case, spaces, end punctuation ignored) or the same base form
export function findDuplicate(words = [], text = '', lemma = '', exceptId = '') {
  const keys = [key(text), key(lemma)].filter(Boolean);
  if (!keys.length) return null;
  return (Array.isArray(words) ? words : []).find((item) => item && item.id !== exceptId && keys.includes(key(item.word))) || null;
}

const VERDICTS = ['ok', 'suggest', 'unknown', 'unchecked'];
const text = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

// the server's answer → a safe shape for the form (missing / odd fields become empty)
export function parseCheck(data = {}) {
  const words = (Array.isArray(data?.words) ? data.words : []).map((word) => ({
    text: text(word?.text, 80),
    lemma: text(word?.lemma, 80),
    known: word?.known === true ? true : word?.known === false ? false : null,
    compound: word?.compound === true,
    suggestions: (Array.isArray(word?.suggestions) ? word.suggestions : []).map((item) => text(item, 80)).filter(Boolean).slice(0, 3),
  }));
  const status = VERDICTS.includes(data?.status) ? data.status : 'unchecked';
  const forms = Array.isArray(data?.forms?.forms) ? data.forms.forms : [];
  return {
    status,
    words,
    suggestion: text(data?.suggestion, 120),
    lemma: text(data?.lemma, 120),
    translation: text(data?.translation, 200),
    translationOf: text(data?.translationOf, 120),
    formsLine: text(data?.forms?.line, 200),
    formItems: forms,
    sources: Array.isArray(data?.sources) ? data.sources.map((item) => text(item, 60)).filter(Boolean) : [],
    error: '',
  };
}

// the check never blocks adding: when the service fails the student gets an empty translation and writes it himself
export async function checkWord(service, { text: value, lang = 'et', tgt = 'ru' }) {
  try {
    if (typeof service?.checkOwnWord !== 'function') throw new Error('Kontroll pole saadaval.');
    return parseCheck(await service.checkOwnWord({ text: value, lang, tgt }));
  } catch (error) {
    return { ...parseCheck({}), error: error?.message || 'Kontroll ei õnnestunud.' };
  }
}

// a short line for the verdict, Estonian with the Russian the student UI shows next to it
export function verdictText(check) {
  if (!check) return '';
  if (check.error) return 'Kontroll ei õnnestunud — võid sõna ikka lisada. · Проверка не удалась, слово можно добавить.';
  const unknown = check.words.filter((word) => word.known === false).map((word) => word.text);
  if (check.status === 'ok') return check.words.length > 1 ? 'Kõik sõnad on sõnastikus. · Все слова есть в словаре.' : 'Sõna on sõnastikus. · Слово есть в словаре.';
  if (check.status === 'suggest' || check.status === 'unknown') return `Sõnastikust ei leitud: ${unknown.join(', ')}. Kontrolli kirjapilti. · Нет в словаре — проверь написание.`;
  if (check.words.some((word) => word.compound)) return 'Liitsõna — sõnastikus eraldi pole, kontrolli ise. · Сложное слово, проверь сам.';
  return 'Õigekirja ei saanud kontrollida. · Написание не проверено.';
}

// the verdict saved with the word: it holds only while the text is the one that was checked
export function savedVerdict(check, checkedText, currentText) {
  if (!check || check.error || key(checkedText) !== key(currentText)) return 'unchecked';
  return check.status;
}

export const CHECK_LABEL = Object.freeze({ ok: 'kontrollitud', suggest: 'kontrolli kirjapilti', unknown: 'sõnastikus pole', unchecked: 'kontrollimata' });
