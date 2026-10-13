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

export function liveWordTools({ studentId, invitationId = '', user, tools = languageToolsService, words = studentWordsService }) {
  if (!studentId || !user || typeof tools?.lookupWord !== 'function' || typeof words?.add !== 'function') return null;
  return {
    async lookup(word) {
      const found = await tools.lookupWord({ word });
      const items = found?.forms?.forms || [];
      return { word: (found?.forms?.found && found.forms.headword) || word, translation: found?.translation || '', forms: threeForms(items), formItems: cleanFormItems(items) };
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
