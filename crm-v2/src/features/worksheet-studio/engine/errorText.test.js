import { describeAutoErrors } from './errorText.js';

const doc = { blocks: [
  { id: 'intro', type: 'text', data: { text: 'Tere' } },
  { id: 'b1', type: 'gaps', data: { title: 'Tingiv kõneviis', sentences: 'Kui mul oleks aega, ma [õpiksin] rohkem.\nMa [töötaksin|teeksin tööd] kodus.' } },
] };

describe('auto-check errors in words', () => {
  it('names the task, the place, the student answer and the right one', () => {
    const [first, second, missing] = describeAutoErrors(doc, [
      { key: 'b1:0.0', answer: 'õppin' },
      { key: 'b1:1.0', answer: 'töötan' },
      { key: 'gone:2', answer: '' },
    ]);
    expect(first.text).toBe('Ülesanne 1 · Tingiv kõneviis — lause 1, lünk 1: õpilane kirjutas „õppin”, õige „õpiksin”');
    expect(second.expected).toBe('töötaksin / teeksin tööd');
    expect(missing.text).toBe('Ülesanne — 3. vastus: vastus puudub');
  });

  const options = { blocks: [
    { id: 'c', type: 'choice', data: { title: 'Vali', questions: [{ q: 'Ma pean …', options: 'teen\n*tegema\nteha' }, { q: 'Mitu', options: '*a\nb\n*c' }] } },
    { id: 'tf', type: 'truefalse', data: { title: 'Õ/V', statements: [{ text: 'x', answer: 'true' }] } },
    { id: 'cl', type: 'cloze', data: { title: 'Tekst', passage: 'Ma {*lähen|läksin} koju.' } },
    { id: 'm', type: 'match', data: { title: 'Paarid', pairs: [{ left: 'üks', right: 'one' }, { left: 'kaks', right: 'two' }, { left: 'kolm', right: 'three' }] } },
    { id: 'cat', type: 'categorize', data: { title: 'Grupid', groups: [{ name: 'Puuvili', words: 'õun' }, { name: 'Köögivili', words: 'kurk' }] } },
  ] };
  const text = (key, answer) => describeAutoErrors(options, [{ key, answer }])[0];

  it('a picked option is shown as its text, not its number (the option 0 too)', () => {
    expect(text('c:0', '0').text).toBe('Ülesanne 1 · Vali — 1. vastus: õpilane valis „teen”, õige „tegema”');
    expect(text('c:0', '2').answer).toBe('teha');
    expect(text('c:1', '0,1').answer).toBe('a + b');
    expect(text('tf:0', 'false').answer).toBe('Vale');
    expect(text('cl:0', '1').answer).toBe('läksin');
    expect(text('cat:w0', '1').answer).toBe('Köögivili');
  });

  it('a match shows the words on both sides, also on an older sheet saved with letters', () => {
    // the right column is rotated: three, one, two
    expect(text('m:r0', '1')).toMatchObject({ answer: 'üks', expected: 'kolm' });
    expect(text('m:0', 'A')).toMatchObject({ answer: 'three', expected: 'one' });
  });

  it('an option no longer on the sheet is said, not shown as a number; an empty answer stays „vastus puudub”', () => {
    expect(text('c:0', '9').text).toContain('õpilase valikut ei leitud');
    expect(text('c:0', '').text).toContain('vastus puudub');
  });
});
