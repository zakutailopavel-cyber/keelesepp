/* global TextEncoder */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  downloadLevelVocabulary,
  LEVEL_VOCABULARY_MAX_BYTES,
  LEVEL_VOCABULARY_STORAGE_PATH,
  levelVocabularyService,
  validateLevelVocabularyPayload,
} from './levelVocabulary.js';

describe('level vocabulary Storage adapter', () => {
  beforeEach(() => levelVocabularyService.clearCache());

  it('validates the legacy level/type vocabulary shape without rewriting it', () => {
    const payload = {
      A1: { noun: ['kodu', 'pere'], verb: ['olema'] },
      A2: { noun: ['kohtumine'] },
    };
    expect(validateLevelVocabularyPayload(payload)).toEqual({ lexicon: payload, wordCount: 4 });
  });

  it('downloads the existing eesti_soned.json object through the authenticated Storage SDK', async () => {
    const payload = { A2: { adverb: ['hommikul', 'õhtul'] } };
    const refFn = vi.fn((storage, path) => ({ storage, path }));
    const getBytesFn = vi.fn().mockResolvedValue(new TextEncoder().encode(JSON.stringify(payload)));

    const result = await downloadLevelVocabulary({
      storage: { name: 'storage' },
      refFn,
      getBytesFn,
    });

    expect(refFn).toHaveBeenCalledWith({ name: 'storage' }, LEVEL_VOCABULARY_STORAGE_PATH);
    expect(getBytesFn).toHaveBeenCalledWith({ storage: { name: 'storage' }, path: LEVEL_VOCABULARY_STORAGE_PATH }, LEVEL_VOCABULARY_MAX_BYTES);
    expect(result).toEqual({
      lexicon: payload,
      wordCount: 2,
      storagePath: 'eesti_soned.json',
      source: 'firebase-storage:eesti_soned.json',
    });
  });

  it('fails closed on empty or invalid vocabulary downloads', async () => {
    expect(() => validateLevelVocabularyPayload({})).toThrow('ei sisalda ühtegi sõna');
    await expect(downloadLevelVocabulary({
      storage: {},
      refFn: () => ({}),
      getBytesFn: async () => new TextEncoder().encode('not-json'),
    })).rejects.toThrow('JSON-i ei saanud lugeda');
  });
});
