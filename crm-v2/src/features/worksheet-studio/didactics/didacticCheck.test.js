import { didacticCheck, measureBlock } from './didacticCheck.js';
import { levelKey } from './levels.js';

const task = (type, data, extra = {}) => ({ id: `${type}-${Math.random().toString(36).slice(2, 6)}`, type, data: { title: 'T', instruction: 'Täida.', ...data }, ...extra });

describe('didactic check', () => {
  it('reads lesson stages and plain levels', () => {
    expect(['A1', 'a2', 'A2+', 'A2+/B1-', 'B1-', 'B1', 'B2', 'C1', 'Eelkool', ''].map(levelKey)).toEqual(['A1', 'A2', 'A2+', 'B1-', 'B1-', 'B1', 'B2', 'C1', 'A1', 'A2']);
    // B1 → B2 course stages
    expect(['B1+', 'B1+/B2-', 'B2-', 'B2'].map(levelKey)).toEqual(['B1+', 'B1+', 'B2-', 'B2']);
  });

  it('measures the solved sentences and the answers of a task', () => {
    expect(measureBlock(task('gaps', { sentences: 'Ma ärkan [hommikul|varakult] kell 7.\nTa joob [kohvi].' }))).toEqual({ sentences: ['Ma ärkan hommikul kell 7.', 'Ta joob kohvi.'], items: 2 });
  });

  it('a simple A2 sheet passes; the same sheet is too easy and too supported for B2', () => {
    const blocks = [
      task('gaps', { sentences: 'Ma ärkan [hommikul] kell seitse.\nTa joob [kohvi] ja sööb leiba.\nMeie pere elab [Tallinnas].\nMa lähen [kooli] bussiga.', bank: 'hommikul, kohvi, Tallinnas, kooli', showBank: 'yes' }),
      task('choice', { questions: [1, 2, 3, 4].map((n) => ({ q: `Mis kell ${n}?`, options: '*Kell on seitse.\nKell on kaheksa.' })) }),
      task('speaking', { minSec: 45, maxSec: 90, questions: 'Mis kell sa ärkad?' }),
    ];
    const a2 = didacticCheck({ meta: { level: 'A2' }, blocks });
    expect(a2.issues).toEqual([]);
    expect(a2.score).toBe(100);
    const b2 = didacticCheck({ meta: { level: 'B2' }, blocks });
    expect(b2.issues.map((i) => i.code)).toEqual(expect.arrayContaining(['did-sentence-avg', `${blocks[0].id}:did-bank-${blocks[0].id}`]));
    expect(b2.issues.find((i) => i.code === 'did-sentence-avg').level).toBe('warning');
    expect(b2.score).toBeLessThan(100);
  });

  it('asks for an inference question in B1 reading and production at A2+ and above', () => {
    const passage = Array.from({ length: 30 }, () => 'Mari elab väikeses linnas ja töötab poes.').join(' ');
    const doc = { meta: { level: 'B1' }, blocks: [
      task('reading', { passage, questions: 'Kus Mari elab? [linnas]\nKus ta töötab? [poes]\nMis linnas? [väikeses]\nKellega? [üksi]\nMillal? [päeval]' }),
      task('truefalse', { statements: [1, 2, 3, 4, 5].map((n) => ({ text: `Mari töötab poes ${n}.`, answer: 'true' })) }),
      task('match', { pairs: [1, 2, 3, 4, 5].map((n) => ({ left: `a${n}`, right: `b${n}` })) }),
    ] };
    const codes = didacticCheck(doc).issues.map((i) => i.code);
    expect(codes.some((c) => c.endsWith(`did-reading-inf-${doc.blocks[0].id}`))).toBe(true);
    expect(codes).toContain('did-productive');
    expect(codes).toContain('did-closed-share');
  });
});

describe('lesson phases', () => {
  it('Avasta and Harjuta sheets do not need production; Kasuta does', async () => {
    const { sheetPhase } = await import('./didacticCheck.js');
    expect(sheetPhase({ meta: { title: 'Pere — Harjuta' } })).toBe('practice');
    expect(sheetPhase({ meta: { title: 'Pere', subtitle: 'Märka tähendust ja keelemustrit kontekstis.' } })).toBe('discover');
    expect(sheetPhase({ meta: { title: 'Pere' } })).toBe('full');
    const closed = [1, 2, 3].map(() => task('gaps', { sentences: 'Ma elan [Tallinnas] koos perega.\nTa töötab [koolis] õpetajana.\nMe sõidame [bussiga] tööle.\nMul on [kaks] venda.' }));
    expect(didacticCheck({ meta: { level: 'B1', title: 'Pere — Harjuta' }, blocks: closed }).issues.map((i) => i.code)).not.toContain('did-productive');
    expect(didacticCheck({ meta: { level: 'B1', title: 'Pere — Kasuta' }, blocks: closed }).issues.map((i) => i.code)).toContain('did-productive');
  });
});

describe('vocabulary level (EKI lists)', () => {
  it('finds words above the level, counts compounds by their harder part and skips names', async () => {
    const { wordLevel } = await import('./levelVocabulary.js');
    const forms = { A1: new Set(['ma', 'elan', 'koos', 'emaga', 'koolis', 'käin', 'sõbralik', 'mul', 'kaks', 'venda']), A2: new Set(['arvutiga']), B1: new Set(['keskkonna', 'tarbimine']) };
    expect(wordLevel('Koolis', forms)).toBe('A1');
    expect(wordLevel('keskkonnasõbralik', forms)).toBe('B1');
    expect(wordLevel('xyzzy', forms)).toBeNull();
    const sentences = Array.from({ length: 4 }, () => 'Ma elan koos emaga ja Mari käin koolis tarbimine.');
    const doc = { meta: { level: 'A2' }, blocks: [task('gaps', { sentences: sentences.map((x) => x.replace('koolis', '[koolis]')).join('\n') })] };
    const issue = didacticCheck(doc, { forms }).issues.find((i) => i.code === 'did-vocabulary');
    expect(issue.text).toMatch(/tarbimine/);
    expect(issue.text).not.toMatch(/mari/i);
    expect(didacticCheck(doc).issues.find((i) => i.code === 'did-vocabulary')).toBeUndefined();
  });
});
