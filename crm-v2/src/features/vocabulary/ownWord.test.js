import { vi } from 'vitest';
import { checkWord, findDuplicate, parseCheck, rememberedTarget, savedVerdict, verdictText, wordLanguagesFor } from './ownWord.js';

describe('ownWord: the server answer', () => {
  it('parses the spelling result into a safe shape', () => {
    const check = parseCheck({
      status: 'suggest', suggestion: 'raamatukogu', lemma: '', translation: 'библиотека', translationOf: 'raamatukoggu',
      words: [{ text: 'raamatukoggu', lemma: 'raamatukoggu', known: false, suggestions: ['raamatukogu', 'raamatukogud', '', 'a', 'b'] }],
      forms: { line: 'kass, kassi', forms: [{ code: 'SgN', label: 'ainsuse nimetav', value: 'kass' }] }, sources: ['EKI etLex'],
    });
    expect(check.status).toBe('suggest');
    expect(check.words[0]).toEqual({ text: 'raamatukoggu', lemma: 'raamatukoggu', known: false, compound: false, suggestions: ['raamatukogu', 'raamatukogud', 'a'] });
    expect(check.formsLine).toBe('kass, kassi');
    expect(check.formItems).toHaveLength(1);
    expect(verdictText(check)).toMatch(/Sõnastikust ei leitud: raamatukoggu/);
  });

  it('treats odd or missing fields as unchecked', () => {
    const check = parseCheck({ status: 'great', words: [{ text: 'x', known: 'yes' }] });
    expect(check.status).toBe('unchecked');
    expect(check.words[0].known).toBeNull();
    expect(check.translation).toBe('');
    expect(parseCheck(null).words).toEqual([]);
    expect(verdictText(parseCheck({ status: 'ok', words: [{ text: 'kass', known: true }] }))).toMatch(/Sõna on sõnastikus/);
  });

  it('falls back to an empty translation when the service fails — the word can still be added', async () => {
    const service = { checkOwnWord: vi.fn().mockRejectedValue(new Error('Keeletööriist ei vastanud.')) };
    const check = await checkWord(service, { text: 'kass', lang: 'et', tgt: 'ru' });
    expect(service.checkOwnWord).toHaveBeenCalledWith({ text: 'kass', lang: 'et', tgt: 'ru' });
    expect(check).toMatchObject({ status: 'unchecked', translation: '', error: 'Keeletööriist ei vastanud.' });
    expect(verdictText(check)).toMatch(/võid sõna ikka lisada/);
    expect((await checkWord({}, { text: 'kass' })).error).toBeTruthy();
  });
});

describe('ownWord: duplicates and verdicts', () => {
  const words = [{ id: 'w1', word: 'Raamatukogu' }, { id: 'w2', word: 'tere hommikust' }];
  it('finds the same word ignoring case, spaces, end punctuation, or by its base form', () => {
    expect(findDuplicate(words, ' raamatukogu ')?.id).toBe('w1');
    expect(findDuplicate(words, 'Tere   hommikust!')?.id).toBe('w2');
    expect(findDuplicate(words, 'raamatukogus', 'raamatukogu')?.id).toBe('w1');
    expect(findDuplicate(words, 'raamatukogus')).toBeNull();
    expect(findDuplicate(words, 'raamatukogu', '', 'w1')).toBeNull();
    expect(findDuplicate(words, '')).toBeNull();
  });

  it('saves the verdict only for the text that was checked', () => {
    const check = parseCheck({ status: 'ok', words: [{ text: 'kass', known: true }] });
    expect(savedVerdict(check, 'kass', 'Kass')).toBe('ok');
    expect(savedVerdict(check, 'kass', 'kassid')).toBe('unchecked');
    expect(savedVerdict(null, '', 'kass')).toBe('unchecked');
    expect(savedVerdict({ ...check, error: 'x' }, 'kass', 'kass')).toBe('unchecked');
  });

  it('offers English for a card with an English course; translation language defaults to Russian', () => {
    expect(wordLanguagesFor([{ subject: 'Eesti keel' }])).toEqual(['et']);
    expect(wordLanguagesFor([{ subject: 'Eesti keel', enrollments: [{ subject: 'Inglise keel' }] }])).toEqual(['et', 'en']);
    expect(rememberedTarget({ getItem: () => 'uk' })).toBe('uk');
    expect(rememberedTarget({ getItem: () => 'xx' })).toBe('ru');
    expect(rememberedTarget({ getItem: () => { throw new Error('blocked'); } })).toBe('ru');
  });
});
