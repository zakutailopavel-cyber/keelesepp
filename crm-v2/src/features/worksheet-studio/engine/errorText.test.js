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
});
