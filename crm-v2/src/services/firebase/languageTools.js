import { requireFirebaseClient } from './client.js';

// Word tools on our server (Cloud Function languageApi): translation by TartuNLP (Neurotõlge) and Estonian word
// forms from EKI Ekilex. Only the word itself is sent; answers are cached on the server.
const defaultLanguageApiUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/languageApi';

// /own-word answers within ~5 s on the server (partial when a service is slow); the browser gives up a little later
export const OWN_WORD_CLIENT_TIMEOUT_MS = 8000;
export const TIMEOUT_MESSAGE = 'Keeletööriist ei vastanud õigel ajal.';

async function request(path, body, { timeoutMs = 0 } = {}) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub.');
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(import.meta.env.VITE_LANGUAGE_API_URL || defaultLanguageApiUrl).replace(/\/$/, '');
  const controller = timeoutMs > 0 && typeof globalThis.AbortController === 'function' ? new globalThis.AbortController() : null;
  const timer = controller ? globalThis.setTimeout(() => controller.abort(), timeoutMs) : 0;
  try {
    return await globalThis.fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      ...(controller ? { signal: controller.signal } : {}),
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error(TIMEOUT_MESSAGE);
    throw error;
  } finally {
    if (timer) globalThis.clearTimeout(timer);
  }
}

async function post(path, body, options) {
  const response = await request(path, body, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Keeletööriist ei vastanud.');
  return data;
}

export const languageToolsService = {
  // EKI „Õppeteksti hindamine” through languageApi: { words, wordLevels, unknownWords, formLevels, aboveWords, aboveForms, lix }
  evaluate({ text, level }) {
    return post('/evaluate', { text, level });
  },
  // { translation, forms: { available, found, forms: [{ code, label, ru, value }], line } }
  lookupWord({ word, src = 'et', tgt = 'ru' }) {
    if (src !== 'et') return post('/translate', { text: word, src, tgt }).then((data) => ({ word, translation: data.result || '', forms: { available: false, forms: [], line: '' } }));
    return post('/word', { word, tgt });
  },
  // the three key forms of words on a student's cards (EKI, cached on the server): { forms: { word: [a, b, c] } }
  keyForms(words = []) {
    return post('/key-forms', { words });
  },
  // the learner's double-click on a worksheet word: forms + translation; the server saves it in the learner's „Sõnad”
  lookupStudentWord({ studentId, word, tgt = 'ru' }) {
    return post('/student-word', { studentId, word, tgt });
  },
  // „Lisa oma sõna”: spelling (EKI etLex + Ekilex), base form, forms and a translation (TartuNLP); saves nothing.
  // { text, lang, tgt, status: ok|suggest|unknown|unchecked, words: [{ text, lemma, known, suggestions }], suggestion,
  //   lemma, translation, translationOf, forms: { line, forms }, sources, partial, missing: ['spelling'|'forms'|'translation'] }
  checkOwnWord({ text, lang = 'et', tgt = 'ru' }) {
    return post('/own-word', { text, lang, tgt }, { timeoutMs: OWN_WORD_CLIENT_TIMEOUT_MS });
  },
  // „Lause lahti”: { text, translation, tokens: [{ text, lemma, pos, posEt, posRu, formEt, formRu, gloss, level, punct, space }],
  // expressions: [{ phrase, ru, government, tokens }] } (EKI etLex morphology + TartuNLP, cached on the server)
  analyzeSentence({ text, tgt = 'ru' }) {
    return post('/analyze', { text, tgt });
  },
  // Estonian speech (TartuNLP Neurokõne) → a WAV Blob; the constructor saves it like an uploaded audio file.
  async speak({ text, speaker = 'mari', speed = 1 }) {
    const response = await request('/speak', { text, speaker, speed });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Kõnesüntees ei vastanud.');
    }
    return response.blob();
  },
};
