import { describe, expect, it } from 'vitest';
import { correctionMarks, tokenize } from './correctionMarks.js';

const picked = (text, result) => result.marks.map((m) => [text.slice(m.start, m.end), m.parandus]);

describe('correctionMarks: a sentence correction → word-level marks', () => {
  it('the essay sentence: only the wrong words and the missing comma, never the whole sentence', () => {
    const text = 'On palju sellisedi situatsioone kui õpetaja paneb plaju ülesandeid.';
    const res = correctionMarks(text, { said: text, corrected: 'On palju selliseid situatsioone, kui õpetaja paneb palju ülesandeid.' });
    expect(picked(text, res)).toEqual([['sellisedi', 'selliseid'], ['situatsioone', '+ ,'], ['plaju', 'palju']]);
    expect(res.marks[1].selgitus).toBe('Lisa koma sõna „situatsioone” järele.');
    expect(res.marks.every((m) => m.end - m.start < 15)).toBe(true);
    expect(res.missed).toEqual([]);
  });

  it('owner\'s other errors: spelling, õ/õppetaja, olla → olema, comma before „et” and „aga”', () => {
    const text = 'Ma arvan et teadmsied on tähtsad aga õppetaja peab anult kontroollida ja olla range.';
    const res = correctionMarks(text, { said: text, corrected: 'Ma arvan, et teadmised on tähtsad, aga õpetaja peab ainult kontrollima ja olema range.' });
    expect(picked(text, res)).toEqual([
      ['arvan', '+ ,'], ['teadmsied', 'teadmised'], ['tähtsad', '+ ,'], ['õppetaja', 'õpetaja'], ['anult kontroollida', 'ainult kontrollima'], ['olla', 'olema'],
    ]);
  });

  it('finds the sentence again in a text with line breaks and several spaces (the checker collapses whitespace)', () => {
    const text = 'Tere!\n\nMinu  arvates   on\nplaju tadmised  vaja.  Head aega.';
    const res = correctionMarks(text, { said: 'Minu arvates on plaju tadmised vaja.', corrected: 'Minu arvates on palju teadmisi vaja.' });
    expect(picked(text, res)).toEqual([['plaju tadmised', 'palju teadmisi']]);
  });

  it('offsets stay exact with õäöü before the mark', () => {
    const text = 'Õpilane ütles, et ööbik läks õue ja söö õuna.';
    const res = correctionMarks(text, { said: 'Õpilane ütles, et ööbik läks õue ja söö õuna.', corrected: 'Õpilane ütles, et ööbik läks õue ja sõi õuna.' });
    const at = text.indexOf('söö');
    expect(res.marks).toEqual([{ start: at, end: at + 3, selectedText: 'söö', parandus: 'sõi', selgitus: '' }]);
  });

  it('a deleted word is marked with „–”; an added word on the word before; at the start on the first word', () => {
    const t1 = 'Ma olen olen kodus.';
    expect(picked(t1, correctionMarks(t1, { said: t1, corrected: 'Ma olen kodus.' }))).toEqual([['olen', '–']]);
    const t2 = 'Olen ära teinud kirjad.';
    const r2 = correctionMarks(t2, { said: t2, corrected: 'Olen ära teinud kirjad läbi.' });
    expect(picked(t2, r2)).toEqual([['kirjad', '+ läbi']]);
    expect(r2.marks[0].selgitus).toBe('Lisa „läbi” sõna „kirjad” järele.');
    const t3 = 'käisin poes.';
    const r3 = correctionMarks(t3, { said: t3, corrected: 'Eile käisin poes.' });
    expect(picked(t3, r3)).toEqual([['käisin', '+ Eile']]);
    expect(r3.marks[0].selgitus).toContain('ette');
  });

  it('a missing full stop and a wrong case ending', () => {
    const text = 'Ma näen koer';
    expect(picked(text, correctionMarks(text, { said: text, corrected: 'Ma näen koera.' }))).toEqual([['koer', 'koera.']]);
  });

  it('a long run of word-for-word swaps is split into one mark per word', () => {
    const text = 'ma lähe kooli homme hommikul vara bussiga koos sõbraga';
    const res = correctionMarks(text, { said: text, corrected: 'ma lähen kooli homme hommikul vara bussiga koos sõbraga' });
    expect(picked(text, res)).toEqual([['lähe', 'lähen']]);
    const swaps = 'aa bb cc dd ee ff gg hh ii jj kk ll mm';
    const r2 = correctionMarks(swaps, { said: swaps, corrected: 'aa BB CC DD EE ff gg hh ii jj kk ll mm' });
    expect(picked(swaps, r2)).toEqual([['bb', 'BB'], ['cc', 'CC'], ['dd', 'DD'], ['ee', 'EE']]);
  });

  it('a sentence where most words changed is marked once as a rewrite', () => {
    const text = 'Mina tahta minna kino eile.';
    const res = correctionMarks(text, { said: text, corrected: 'Eile tahtsin ma kinno minna.' });
    expect(res.marks).toHaveLength(1);
    expect(res.marks[0]).toMatchObject({ start: 0, end: text.length, parandus: 'Eile tahtsin ma kinno minna.', selgitus: 'Sõnasta lause ümber.' });
  });

  it('when the sentence is not in the text, each changed word is searched for; what is not found is listed, not framed', () => {
    const text = 'Täna on plaju tööd. Homme ka.';
    const res = correctionMarks(text, { said: 'Täna on plaju tööd ja vähe aega.', corrected: 'Täna on palju tööd ja väga vähe aega.' });
    expect(picked(text, res)).toEqual([['plaju', 'palju']]);
    expect(res.missed).toEqual([{ said: '', corrected: 'väga' }]);
    expect(res.marks.some((m) => m.start === 0 && m.end === text.length)).toBe(false);
  });

  it('a word is not found inside another word', () => {
    const text = 'Kassid ja kass.';
    const res = correctionMarks(text, { said: 'Üks kass on siin.', corrected: 'Üks kass oli siin.' });
    expect(res.marks).toEqual([]);
    expect(res.missed).toEqual([{ said: 'on', corrected: 'oli' }]);
  });

  it('no change → no marks; tokenizer keeps punctuation as its own tokens', () => {
    expect(correctionMarks('Tere.', { said: 'Tere.', corrected: 'Tere.' })).toEqual({ marks: [], missed: [] });
    expect(tokenize('Tere, Anna-Liis!').map((t) => t.text)).toEqual(['Tere', ',', 'Anna-Liis', '!']);
  });
});
