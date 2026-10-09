import { makeVariant } from './variants.js';
import { checkDocument } from './registry.js';

const doc = () => ({
  schema: 'keelesepp.worksheet/2', id: 'ws1',
  meta: { title: 'Minu päev', goals: {} },
  blocks: [
    { id: 'g', type: 'gaps', opts: {}, data: { title: 'T', instruction: 'Täida.', bank: '', showBank: 'no', sentences: 'Ma ärkan [hommikul].\nMa söön [lõunat|lõunasööki].' } },
    { id: 'c', type: 'choice', opts: { shuffle: true }, data: { title: 'V', questions: [{ q: 'Mis?', options: '*jah\nei\nvõib-olla\nkunagi' }] } },
    { id: 'd', type: 'diagram', opts: {}, data: { title: 'S', instruction: 'Täida.', kind: 'mind', center: 'Päev', nodes: 'hommikul\n- ärkan\n- pesen\npäeval\n- [töötan]\nõhtul' } },
    { id: 't', type: 'table', opts: {}, data: { title: 'Tab', instruction: '', headers: 'a, b, c', rows: 'maja | maja | [maja]\nkool | kooli | kooli\nauto | [auto] | autot' } },
  ],
});

describe('easier / harder copies of a sheet', () => {
  it('the easier copy gives a word bank, helper words, a solved example and fewer options', () => {
    const { doc: easy, changes } = makeVariant(doc(), 'support');
    expect(easy.meta).toMatchObject({ title: 'Minu päev (toetav)', variant: 'support', variantOf: 'ws1' });
    expect(easy.id).not.toBe('ws1');
    expect(easy.blocks.map((b) => b.id)).not.toContain('g');
    const [gaps, choice, diagram, table] = easy.blocks;
    expect(gaps.data).toMatchObject({ showBank: 'yes', bank: 'hommikul, lõunat' });
    expect(gaps.opts.example).toBe(true);
    expect(choice.data.questions[0].options.split('\n')).toEqual(['*jah', 'ei', 'võib-olla']);
    expect(choice.opts.shuffle).toBe(false);
    expect(diagram.data.instruction).toBe('Täida. Abisõnad: töötan.');
    expect(table.data.instruction).toBe('Abisõnad: auto, maja.');
    expect(changes).toEqual(expect.arrayContaining(['sõnapank', 'vähem valikvastuseid']));
    // the copy is still a valid, scorable sheet
    expect(checkDocument(easy, {}).score.total).toBeGreaterThan(0);
  });

  it('the harder copy hides banks and examples, shuffles options and makes more gaps', () => {
    const start = doc();
    start.blocks[0].data.showBank = 'yes';
    start.blocks[0].data.bank = 'hommikul, lõunat';
    start.blocks[0].opts.example = true;
    start.blocks[2].data.instruction = 'Täida. Abisõnad: töötan.';
    const { doc: hard } = makeVariant(start, 'challenge');
    const [gaps, choice, diagram, table] = hard.blocks;
    expect(hard.meta.title).toBe('Minu päev (väljakutse)');
    expect(gaps.data.showBank).toBe('no');
    expect(gaps.opts.example).toBe(false);
    expect(choice.opts.shuffle).toBe(true);
    expect(diagram.data.instruction).toBe('Täida.');
    expect(diagram.data.nodes).toBe('hommikul\n- ärkan\n- [pesen]\npäeval\n- [töötan]\nõhtul');
    expect(makeVariant({ ...start, blocks: [{ ...start.blocks[2], data: { ...start.blocks[2].data, kind: 'cycle', nodes: 'kevad\nsuvi\nsügis\ntalv' } }] }, 'challenge').doc.blocks[0].data.nodes).toBe('kevad\n[suvi]\nsügis\n[talv]');
    expect(table.data.rows.split('\n')[1]).toBe('kool | [kooli] | [kooli]');
    expect(checkDocument(hard, {}).score.total).toBeGreaterThan(checkDocument(start, {}).score.total);
  });

  it('a variant of a variant keeps one suffix; unknown level is refused', () => {
    const once = makeVariant(doc(), 'support').doc;
    expect(makeVariant(once, 'challenge').doc.meta.title).toBe('Minu päev (väljakutse)');
    expect(() => makeVariant(doc(), 'nope')).toThrow();
  });
});
