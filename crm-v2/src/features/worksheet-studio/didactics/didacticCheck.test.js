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
      task('gaps', { sentences: 'Ma ärkan [hommikul] kell seitse.\nTa joob [kohvi] ja sööb leiba.\nMeie pere elab [Tallinnas].\nMa lähen [kooli] bussiga.\nMa elan [kodus] koos perega.', bank: 'hommikul, õhtul, poes, kohvi, Tallinnas, kooli, kodus', showBank: 'yes' }),
      task('choice', { questions: [1, 2, 3, 4, 5].map((n) => ({ q: `Mis kell ${n}?`, options: '*Kell on seitse.\nKell on kaheksa.\nKell on üheksa.' })) }),
      task('speaking', { minSec: 45, maxSec: 90, questions: 'Mis kell sa ärkad?' }),
    ];
    const a2 = didacticCheck({ meta: { level: 'A2' }, blocks });
    expect(a2.issues).toEqual([]);
    expect(a2.score).toBe(100);
    const b2 = didacticCheck({ meta: { level: 'B2' }, blocks });
    // Harno B2 gives four options in a choice
    expect(b2.issues.map((i) => i.code)).toEqual(expect.arrayContaining(['did-sentence-avg', `${blocks[1].id}:did-choice-four-${blocks[1].id}`]));
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

describe('solvable only with the language (level audit 2026-10-12)', () => {
  const codes = (level, blocks) => didacticCheck({ meta: { level }, blocks }).issues.map((i) => `${i.level} ${i.code.split(':').pop().replace(/-[a-z]+-[a-z0-9]{4}$/, '')}`);
  it('finds tasks solved by elimination, by length or by an absolute word', () => {
    const gaps = task('gaps', { sentences: 'Ma elan [Tallinnas] koos perega.\nTa töötab [koolis] õpetajana.\nMe sõidame [bussiga] tööle.\nMul on [kaks] venda.\nMa õpin [õhtul] eesti keelt.', bank: 'Tallinnas, koolis, bussiga, kaks, õhtul', showBank: 'yes' });
    const choice = task('choice', { questions: [1, 2, 3, 4, 5].map(() => ({ q: 'Mida sa ütled, kui oled hiljaks jäänud?', options: '*Vabandust, ma jäin bussist maha ja tulin järgmisega.\nPakk!\nKoer.' })) });
    const tf = task('truefalse', { statements: [['Mari elab Tartus.', 'true'], ['Mari käib alati jala.', 'false'], ['Mari töötab ainult hommikul.', 'false'], ['Maril on kaks last.', 'true'], ['Mari õpib eesti keelt.', 'true']].map(([text, answer]) => ({ text, answer })) });
    const found = codes('B1', [gaps, choice, tf]);
    expect(found).toEqual(expect.arrayContaining(['warning did-bank-extra', 'warning did-choice-length', 'tip did-tf-absolute']));
    // at A2 the same faults are tips, not warnings
    expect(codes('A2', [gaps])).toContain('tip did-bank-extra');
  });

  it('finds tasks that cannot be solved or need no work', () => {
    const forms = task('wordforms', { rows: [['raamat', '', 'raamatut'], ['raamat', '', 'raamatus'], ['õppima', 'õppima', 'õppima'], ['ema', 'kelle?', 'ema'], ['isa', 'kelle?', 'isa']].map(([base, prompt, answer]) => ({ base, prompt, answer })) });
    const fix = task('errorfix', { rows: [['Ma lähen kooli.', 'Ma lähen kooli.'], ['Ma lähen koolis.', 'Ma lähen kooli.']].map(([wrong, answer]) => ({ wrong, answer })) });
    const sort = task('categorize', { groups: [{ name: 'Kus?', words: 'koolis, kodus' }, { name: 'Kuhu?', words: 'kodus, koolis' }] });
    const ru = task('choice', { questions: [1, 2, 3, 4, 5].map(() => ({ q: 'Mida tähendab „keel”?', options: '*язык\nдом\nкогда' })) });
    const found = codes('B1', [forms, fix, sort, ru]);
    expect(found).toEqual(expect.arrayContaining(['warning did-forms-which', 'warning did-forms-given', 'warning did-errorfix-none', 'warning did-categorize-same', 'warning did-choice-russian']));
  });

  it('flags reading questions answered by copying from B1- on', () => {
    const passage = 'Mari elab Tartus ja töötab raamatukogus. Hommikul sõidab ta bussiga tööle. Õhtul käib ta ujumas.';
    const reading = task('reading', { passage, questions: 'Kus Mari elab? [Tartus]\nKus ta töötab? [raamatukogus]\nMillega ta sõidab? [bussiga]\nKuhu ta õhtul läheb? [ujuma|ujumas]' });
    expect(codes('B1', [reading])).toContain('tip did-reading-copy');
    expect(codes('A2', [reading])).not.toContain('tip did-reading-copy');
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
