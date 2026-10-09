import { requireFirebaseClient } from './client.js';

// Word tools on our server (Cloud Function languageApi): translation by TartuNLP (Neurotõlge) and Estonian word
// forms from EKI Ekilex. Only the word itself is sent; answers are cached on the server.
const defaultLanguageApiUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/languageApi';

async function request(path, body) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub.');
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(import.meta.env.VITE_LANGUAGE_API_URL || defaultLanguageApiUrl).replace(/\/$/, '');
  return globalThis.fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function post(path, body) {
  const response = await request(path, body);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Keeletööriist ei vastanud.');
  return data;
}

export const languageToolsService = {
  // { translation, forms: { available, found, forms: [{ code, label, ru, value }], line } }
  lookupWord({ word, src = 'et', tgt = 'ru' }) {
    if (src !== 'et') return post('/translate', { text: word, src, tgt }).then((data) => ({ word, translation: data.result || '', forms: { available: false, forms: [], line: '' } }));
    return post('/word', { word, tgt });
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
