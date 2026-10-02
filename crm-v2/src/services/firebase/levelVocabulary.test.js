import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  downloadLevelVocabulary,
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

  it('downloads the existing eesti_soned.json object through injected Storage dependencies', async () => {
    const payload = { A2: { adverb: ['hommikul', 'õhtul'] } };
    const refFn = vi.fn((storage, path) => ({ storage, path }));
    const getDownloadUrl = vi.fn().mockResolvedValue('https://storage.invalid/eesti_soned.json');
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockResolvedValue(payload) });

    const result = await downloadLevelVocabulary({
      storage: { name: 'storage' },
      refFn,
      getDownloadUrl,
      fetchFn,
    });

    expect(refFn).toHaveBeenCalledWith({ name: 'storage' }, LEVEL_VOCABULARY_STORAGE_PATH);
    expect(getDownloadUrl).toHaveBeenCalledWith({ storage: { name: 'storage' }, path: LEVEL_VOCABULARY_STORAGE_PATH });
    expect(fetchFn).toHaveBeenCalledWith('https://storage.invalid/eesti_soned.json');
    expect(result).toEqual({
      lexicon: payload,
      wordCount: 2,
      storagePath: 'eesti_soned.json',
      source: 'firebase-storage:eesti_soned.json',
    });
  });

  it('fails closed on empty or unsuccessful vocabulary downloads', async () => {
    expect(() => validateLevelVocabularyPayload({})).toThrow('ei sisalda ühtegi sõna');
    await expect(downloadLevelVocabulary({
      storage: {},
      refFn: () => ({}),
      getDownloadUrl: async () => 'https://storage.invalid/eesti_soned.json',
      fetchFn: async () => ({ ok: false, status: 403 }),
    })).rejects.toThrow('HTTP 403');
  });
});
