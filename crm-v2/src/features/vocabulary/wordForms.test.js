import { describe, expect, it } from 'vitest';
import { keyForms, loadWordForms } from './wordForms.js';

describe('key forms on word cards', () => {
  const dictionary = { soodustus: ['soodustus', 'soodustuse', 'soodustust'], tegema: ['tegema', 'teha', 'teeb'] };
  it('takes the word\'s own EKI line first, then the dictionary', () => {
    expect(keyForms('kass', 'kass, kassi, kassi, kasse', dictionary)).toEqual(['kass', 'kassi', 'kassi']);
    expect(keyForms('Soodustus', '', dictionary)).toEqual(['soodustus', 'soodustuse', 'soodustust']);
    expect(keyForms('„tegema”,', '', dictionary)).toEqual(['tegema', 'teha', 'teeb']);
  });
  it('gives nothing for phrases and unknown words', () => {
    expect(keyForms('rong jäi hiljaks', '', dictionary)).toEqual([]);
    expect(keyForms('xyz', '', dictionary)).toEqual([]);
  });
  it('the shipped file has the forms of course words', async () => {
    const { readFileSync } = await import('node:fs');
    const forms = JSON.parse(readFileSync(`${globalThis.process.cwd()}/public/word-forms.json`, 'utf8')).forms;
    expect(forms.pood).toEqual(['pood', 'poe', 'poodi']);
    expect(forms.lugema).toEqual(['lugema', 'lugeda', 'loeb']);
    expect(forms.kool).toEqual(['kool', 'kooli', 'kooli']);
    expect(Object.keys(forms).length).toBeGreaterThan(8000);
  });
  it('a failed download leaves the cards without forms', async () => {
    expect(await loadWordForms(() => Promise.reject(new Error('offline')))).toEqual({});
  });
});
