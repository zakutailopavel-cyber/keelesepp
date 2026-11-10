// The teacher's word tools on a live worksheet (owner 2026-10-13): a double-clicked word → three key forms (EKI) and
// translation (TartuNLP) → the student's „Sõnad”; a corrected answer → the student's „Minu vead”.
import { languageToolsService } from '../../services/firebase/languageTools.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { cleanFormItems, sameWord } from '../vocabulary/wordsModel.js';
import { ERROR_PREFIX } from '../self-study/reviewModel.js';

// nouns and adjectives: nimetav, omastav, osastav; verbs: ma-, da-tegevusnimi and ta-vorm (as the cards show them)
export function threeForms(items = []) {
  const by = new Map((Array.isArray(items) ? items : []).map((form) => [form.code, form.value]));
  const codes = by.has('Sup') ? ['Sup', 'Inf', 'IndPrSg3'] : ['SgN', 'SgG', 'SgP'];
  const values = codes.map((code) => by.get(code)).filter(Boolean);
  return values.length === 3 ? values : [];
}

// Word answers are the same for every student: kept for the session, so a word clicked again (or prefetched when
// the composer opened on another tab) answers at once. A failed half is forgotten, so the next click asks again.
const LOOKUP_CACHE_LIMIT = 300;
const lookupCache = new Map();
export function clearWordLookupCache() { lookupCache.clear(); }

function remembered(key, start) {
  if (lookupCache.has(key)) return lookupCache.get(key);
  const promise = Promise.resolve().then(start);
  promise.catch(() => { if (lookupCache.get(key) === promise) lookupCache.delete(key); });
  lookupCache.set(key, promise);
  if (lookupCache.size > LOOKUP_CACHE_LIMIT) lookupCache.delete(lookupCache.keys().next().value);
  return promise;
}

function formsCard(word, forms) {
  const items = forms?.forms || [];
  return { word: (forms?.found && forms.headword) || word, forms: threeForms(items), formItems: cleanFormItems(items) };
}

export function liveWordTools({ studentId, invitationId = '', user, tools = languageToolsService, words = studentWordsService }) {
  if (!studentId || !user || typeof tools?.lookupWord !== 'function' || typeof words?.add !== 'function') return null;
  const split = typeof tools.translate === 'function' && typeof tools.wordForms === 'function';
  return {
    // → { word, translation, forms: [3], formItems }. The translation (TartuNLP, fast) and the forms (EKI, may try
    // several headwords in a row) are asked in parallel; onTranslation / onForms report each half as soon as it is in.
    async lookup(word, { onTranslation, onForms } = {}) {
      const key = String(word || '').trim().toLocaleLowerCase('et');
      if (!split) {
        const found = await remembered(`w:${key}`, () => tools.lookupWord({ word }));
        return { ...formsCard(word, found?.forms), translation: found?.translation || '' };
      }
      const translation = remembered(`t:${key}`, () => tools.translate({ text: word, src: 'et', tgt: 'ru' }))
        .then((text) => { onTranslation?.(text || ''); return text || ''; }, () => { onTranslation?.(''); return ''; });
      const forms = remembered(`f:${key}`, () => tools.wordForms({ word }))
        .then((found) => formsCard(word, found), () => formsCard(word, null))
        .then((card) => { onForms?.(card); return card; });
      const [tr, card] = await Promise.all([translation, forms]);
      return { ...card, translation: tr };
    },
    async add(card) {
      const existing = typeof words.listForStudent === 'function' ? await words.listForStudent(studentId) : [];
      if (sameWord(existing, card.word)) return { already: true };
      return words.add({ studentId, invitationId, user, ...card });
    },
    addError({ said, corrected }) {
      return words.add({ studentId, invitationId, user, word: corrected, translation: `${ERROR_PREFIX} ${said}` });
    },
  };
}
