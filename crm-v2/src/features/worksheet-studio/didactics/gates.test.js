import { keysProblems, levelProblems, moduleGates, sheetGates } from './gates.js';

const codes = (list) => list.map((p) => p.code);

describe('quality gates', () => {
  it('keys: duplicate options, a correction equal to the error, an empty gap, a missing bank word', () => {
    const doc = { meta: { level: 'B1' }, blocks: [
      { id: 'c', type: 'choice', data: { title: 'Vali', questions: [{ q: 'X?', options: '*kass\nkoer\nKass' }] } },
      { id: 'f', type: 'errorfix', data: { title: 'Paranda', rows: [{ wrong: 'Ma lähen kooli.', answer: 'Ma lähen kooli.' }] } },
      { id: 'g', type: 'gaps', data: { title: 'Lüngad', sentences: 'Ma [] kodus.\nTa [on] tööl.', bank: 'olen', showBank: 'yes' } },
      { id: 's', type: 'categorize', data: { title: 'Sorteeri', groups: [{ name: 'A', words: 'üks, kaks' }, { name: 'B', words: 'kaks, kolm' }] } },
    ] };
    expect(codes(keysProblems(doc))).toEqual(['choice-duplicate', 'fix-same', 'gap-empty', 'bank-missing', 'sort-duplicate']);
  });

  it('level: a B2 Avasta needs a 220-word text, a 140-word letter and 4 minutes of speaking', () => {
    const doc = { meta: { level: 'B2', phase: 'discover' }, blocks: [
      { id: 'r', type: 'reading', data: { passage: 'Lühike tekst. '.repeat(50) } },
      { id: 'l', type: 'guidedletter', data: { minWords: 100 } },
      { id: 'sp', type: 'speaking', data: { maxSec: 120 } },
    ] };
    expect(codes(levelProblems(doc))).toEqual(['text-short', 'writing-short', 'speaking-short']);
  });

  it('module: a sentence used on two sheets and lesson words that never come back', () => {
    const sheet = (blocks) => ({ meta: { level: 'B1' }, blocks });
    const sheets = { l1: {
      discover: sheet([{ id: 'v', type: 'vocab', data: { words: 'kõigepealt — сначала, seejärel — затем, harjumus — привычка' } }, { id: 'g', type: 'gaps', data: { sentences: 'Kõigepealt keedan ma hommikul kohvi.' } }]),
      practice: sheet([{ id: 'g', type: 'gaps', data: { sentences: 'Kõigepealt keedan ma hommikul kohvi.' } }]),
    } };
    expect(codes(moduleGates(sheets))).toEqual(['repeated-sentence', 'vocabulary-not-recycled']);
    expect(codes(moduleGates({ l2: { discover: sheet([]) } }))).toEqual(['no-vocabulary']);
  });

  it('sheetGates names the gate of every problem', () => {
    const problems = sheetGates({ meta: { level: 'B1', phase: 'practice' }, blocks: [{ id: 'f', type: 'errorfix', data: { title: 'P', rows: [{ wrong: 'a b c', answer: 'a b c' }] } }] });
    expect(new Set(problems.map((p) => p.gate))).toEqual(new Set(['depth', 'keys']));
  });
});

describe('sort items that are whole sentences', () => {
  it('a sentence with a comma stays one item (it was cut in two before)', async () => {
    const { groupItems } = await import('../engine/schema.js');
    expect(groupItems({ words: 'Kui lause on valmis, jääb hetk mööda.\nSeetõttu soovitavad õpetajad keelekohvikuid.', lines: true })).toEqual(['Kui lause on valmis, jääb hetk mööda.', 'Seetõttu soovitavad õpetajad keelekohvikuid.']);
    expect(groupItems({ words: 'ärkan, söön' })).toEqual(['ärkan', 'söön']);
    const { B } = await import('../../worksheet-generator/admin/course/blocks.js');
    const block = B.categorize('s', 'Sorteeri', 'Sorteeri laused.', [['Õige', ['Kui lause on valmis, jääb hetk mööda.']], ['Vale', ['Kui lause on valmis, hetk jääb mööda.']]]);
    expect(block.data.groups[0]).toEqual({ name: 'Õige', words: 'Kui lause on valmis, jääb hetk mööda.', lines: true });
    expect(keysProblems({ blocks: [block] })).toEqual([]);
  });
});
