/* global TextDecoder */
import { getBytes, ref } from 'firebase/storage';
import { requireFirebaseClient } from './client.js';

export const LEVEL_VOCABULARY_STORAGE_PATH = 'eesti_soned.json';
export const LEVEL_VOCABULARY_MAX_BYTES = 10 * 1024 * 1024;

let cachedLoad = null;

function countWords(value) {
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + (typeof item === 'string' || item?.word || item?.lemma ? 1 : 0), 0);
  if (!value || typeof value !== 'object') return 0;
  return Object.values(value).reduce((sum, item) => sum + countWords(item), 0);
}

export function validateLevelVocabularyPayload(payload) {
  if (!payload || (typeof payload !== 'object' && !Array.isArray(payload))) throw new Error('Tasemesõnastiku JSON ei ole objekt ega massiiv.');
  const wordCount = countWords(payload);
  if (!wordCount) throw new Error('Tasemesõnastik ei sisalda ühtegi sõna.');
  return { lexicon: payload, wordCount };
}

export async function downloadLevelVocabulary({
  storage,
  storagePath = LEVEL_VOCABULARY_STORAGE_PATH,
  refFn = ref,
  getBytesFn = getBytes,
  decoder = new TextDecoder(),
} = {}) {
  if (!storage) throw new Error('Firebase Storage puudub.');
  if (typeof getBytesFn !== 'function') throw new Error('Firebase Storage getBytes puudub.');
  const storageRef = refFn(storage, storagePath);
  const bytes = await getBytesFn(storageRef, LEVEL_VOCABULARY_MAX_BYTES);
  let payload;
  try {
    payload = JSON.parse(decoder.decode(bytes));
  } catch {
    throw new Error('Tasemesõnastiku JSON-i ei saanud lugeda.');
  }
  const validated = validateLevelVocabularyPayload(payload);
  return {
    ...validated,
    source: `firebase-storage:${storagePath}`,
    storagePath,
  };
}

export const levelVocabularyService = {
  async load({ force = false } = {}) {
    if (!cachedLoad || force) {
      const { storage } = requireFirebaseClient();
      cachedLoad = downloadLevelVocabulary({ storage }).catch((error) => {
        cachedLoad = null;
        throw error;
      });
    }
    return cachedLoad;
  },
  clearCache() {
    cachedLoad = null;
  },
};
