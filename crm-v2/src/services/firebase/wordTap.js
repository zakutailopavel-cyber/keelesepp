import { doc, getDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { languageToolsService } from './languageTools.js';
import { studentWordsService } from './studentWords.js';

// „Puuduta sõna” on the lesson board (features/board/wordTap.js): the base form and translation come from languageApi
// /own-word (saves nothing), the word goes to `studentWords`, the translation language is the student card's
// `preferredLanguage`. One read of the card per student and session; a card that cannot be read (a group board, no
// rights) just gives ''.
const languages = new Map();

export const wordTapService = {
  checkOwnWord: (input) => languageToolsService.checkOwnWord(input),
  words: studentWordsService,
  preferredLanguage(studentId) {
    if (!studentId) return Promise.resolve('');
    if (!languages.has(studentId)) {
      languages.set(studentId, (async () => {
        try {
          const { db } = requireFirebaseClient();
          const snap = await getDoc(doc(db, 'students', studentId));
          return snap.exists() ? String(snap.data()?.preferredLanguage || '') : '';
        } catch {
          return '';
        }
      })());
    }
    return languages.get(studentId);
  },
};
