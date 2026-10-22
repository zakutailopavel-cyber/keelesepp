import { describe, expect, it } from 'vitest';
import { answerKeyOf } from './answerKey.js';

const doc = { meta: { title: 'Proov' }, blocks: [
  { id: 'g', type: 'gaps', data: { title: 'Lüngad', sentences: 'Ta läks [kooli|tööle] hommikul.\nMa [olen] kodus ja [loen].', explain: 'Kuhu? sisseütlev.\nOlevik.' } },
  { id: 'c', type: 'choice', data: { title: 'Valik', questions: [{ q: 'Mis?', options: '*õige\nvale' }] } },
  { id: 't', type: 'truefalse', data: { title: 'Õ/V', statements: [{ text: 'Väide', answer: 'false' }] } },
  { id: 'e', type: 'errorfix', data: { title: 'Paranda', rows: [{ wrong: 'Ta ütles et tuleb.', answer: 'Ta ütles, et tuleb.' }], explain: 'Koma „et” ette.' } },
  { id: 's', type: 'categorize', data: { title: 'Sorteeri', groups: [{ name: 'Fakt', words: 'a, b' }, { name: 'Arvamus', words: 'c' }] } },
  { id: 'r', type: 'reading', data: { title: 'Loe', passage: 'Tekst.', questions: 'Miks? [sest]\nKus?' } },
  { id: 'x', type: 'text', data: { heading: 'Ei ole ülesanne', text: '…' } },
] };

describe('teacher answer key', () => {
  const key = answerKeyOf(doc);
  it('lists every task with its answers in the learner’s order and skips non-tasks', () => {
    expect(key.map((t) => t.id)).toEqual(['g', 'c', 't', 'e', 's', 'r']);
    expect(key[0].items).toMatchObject([{ n: 1, prompt: 'Ta läks ___ hommikul.', answer: 'kooli / tööle', why: 'Kuhu? sisseütlev.' }, { n: 2, answer: 'olen · loen', why: 'Olevik.' }]);
    expect(key[1].items[0]).toMatchObject({ prompt: 'Mis?', answer: 'õige', why: '' });
    expect(key[2].items[0].answer).toBe('Vale');
    expect(key[3].items[0]).toMatchObject({ prompt: 'Ta ütles et tuleb.', answer: 'Ta ütles, et tuleb.', why: 'Koma „et” ette.' });
    expect(key[4].items.map((it) => `${it.prompt}:${it.answer}`)).toEqual(['a:Fakt', 'b:Fakt', 'c:Arvamus']);
    expect(key[5].items).toMatchObject([{ prompt: 'Miks?', answer: 'sest' }, { prompt: 'Kus?', answer: '' }]);
  });
});

describe('teacher notes in the key', () => {
  it('shows an open task with its note, numbered as on the sheet', () => {
    const doc = { blocks: [
      { id: 'i', type: 'text', data: { text: 'Sissejuhatus' } },
      { id: 'g', type: 'gaps', data: { title: 'Lüngad', sentences: 'Ma [olen] kodus.' } },
      { id: 'r', type: 'rolecards', data: { title: 'Arsti juures', roleA: 'Arst', roleB: 'Patsient', teacher: 'Üks-ühele: õpetaja on arst.' } },
      { id: 's', type: 'speaking', data: { title: 'Räägi', questions: 'Mida sa tegid?' } },
    ] };
    const key = answerKeyOf(doc);
    expect(key.map((t) => [t.id, t.num])).toEqual([['g', 1], ['r', 2]]);
    expect(key[1]).toMatchObject({ note: 'Üks-ühele: õpetaja on arst.', items: [] });
  });
});
