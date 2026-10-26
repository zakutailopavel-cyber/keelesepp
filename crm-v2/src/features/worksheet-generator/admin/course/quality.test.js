import { harnoProblems, moduleProblems, problemKey, sheetProblems, splitByBaseline, v4ModuleProblems } from './quality.js';

const doc = (level, blocks) => ({ meta: { level }, blocks });
const reading = (words) => ({ id: 'r', type: 'reading', data: { passage: Array.from({ length: words }, () => 'sõna').join(' ') } });

describe('Harno coverage of a module', () => {
  it('asks for listening and one exam-length text of the stage exam', () => {
    const codes = (level, blocks) => harnoProblems({ l1: { practice: doc(level, blocks) } }).map((p) => p.code);
    expect(codes('B2-', [reading(300)])).toEqual(['harno-listening', 'harno-reading']);
    expect(codes('B2-', [reading(450), { id: 'k', type: 'listening', data: {} }])).toEqual([]);
    // A2+ still meets the A2 exam (longest text ~150 words)
    expect(codes('A2+', [reading(130), { id: 'k', type: 'listening', data: {} }])).toEqual([]);
  });
});

describe('a supplement (extra homework sheets, MODULE.supplement)', () => {
  it('keeps the sheet rules but not the module exam coverage', () => {
    const supplement = { l1: { practice: { meta: { level: 'B1+', supplement: true }, blocks: [reading(100)] } } };
    expect(harnoProblems(supplement)).toEqual([]);
    expect(harnoProblems({ l1: { practice: doc('B1+', [reading(100)]) } }).map((p) => p.code)).toEqual(['harno-listening', 'harno-reading']);
  });
});

describe('a diagnostic check (meta.diagnostic: closed scored tasks, parallel versions)', () => {
  const choice = (id) => ({ id, type: 'choice', data: { questions: [{ q: 'Kus sa oled?', options: '*kodus\nkoju' }] } });
  const check = (blocks) => ({ meta: { level: 'A2', phase: 'practice', template: 'v4', design: 'v2', diagnostic: true, shortSheet: true }, blocks });
  it('skips the lesson-shape rules but asks that every task is scored', () => {
    expect(sheetProblems(check([choice('a')])).map((p) => p.code)).not.toContain('length');
    expect(sheetProblems(check([choice('a'), { id: 'w', type: 'writing', data: { prompt: 'Kirjuta.' } }])).map((p) => p.code)).toContain('diagnostic-open');
  });
  it('lets the two versions have the same structure', () => {
    const codes = moduleProblems({ k1: { practice: check([choice('a')]) }, k2: { practice: check([choice('b')]) } }).map((p) => p.code);
    expect(codes).not.toContain('neighbour');
    expect(codes).not.toContain('module-same');
  });
});

describe('quality baseline', () => {
  it('locks only problems that are not known; a fixed problem is reported', () => {
    const known = { lessonId: 'x-1', phase: 'practice', code: 'norm', check: 'did-choice-length-c1', text: '' };
    const fresh = { lessonId: 'x-2', phase: 'transfer', code: 'norm', check: 'did-bank-extra-g1', text: '' };
    const baseline = { m: [problemKey(known), 'x-3|discover|did-errorfix-none-e1'] };
    const split = splitByBaseline('m', [known, fresh], baseline);
    expect(split.known).toEqual([known]);
    expect(split.fresh).toEqual([fresh]);
    expect(split.fixed).toEqual(['x-3|discover|did-errorfix-none-e1']);
  });
});

describe('lesson template v4 (variety instead of a fixed task list)', () => {
  // a role play carries its one-to-one note (teach()), a „review” type stands for B.review
  const make = (type, i) => (type === 'review' ? { id: `b${i}`, type: 'tip', data: { review: true } } : { id: `b${i}`, type, data: type === 'rolecards' ? { teacher: 'Üks-ühele: õpetaja on B.' } : {} });
  const sheet = (phase, types) => ({ meta: { level: 'A2+', phase, template: 'v4', design: 'v2' }, blocks: types.map(make) });
  const v4 = (phase, types) => sheetProblems(sheet(phase, types)).map((p) => p.code).filter((c) => c.startsWith('v4-'));
  it('Avasta: an input, noticing and a talk; no test-like drills before the form is met', () => {
    expect(v4('discover', ['review', 'text', 'listening', 'notice', 'table', 'speaking'])).toEqual([]);
    expect(v4('discover', ['text', 'notice', 'errorfix', 'translation', 'writing'])).toEqual(['v4-review', 'v4-input', 'v4-talk', 'v4-early-drill']);
  });
  it('Harjuta: a type once, at most two drills, ends in use', () => {
    expect(v4('practice', ['reading', 'profiles', 'wordforms', 'transformation', 'cloze', 'rolecards'])).toEqual([]);
    expect(v4('practice', ['gaps', 'gaps', 'errorfix', 'translation', 'dictation'])).toEqual(['v4-repeat', 'v4-drills', 'v4-use']);
  });
  it('Kasuta: a situation with a partner, no drills', () => {
    expect(v4('transfer', ['text', 'reading', 'rolecards', 'guidedletter', 'rubric'])).toEqual([]);
    expect(v4('transfer', ['text', 'errorfix', 'writing', 'speaking', 'rubric'])).toEqual(['v4-transfer-drill', 'v4-partner']);
  });
  it('module: a drill once a lesson, listening, caps on error correction and translation', () => {
    const lesson = (types) => ({ discover: sheet('discover', types), practice: sheet('practice', ['translation', 'errorfix']) });
    const codes = v4ModuleProblems({ l1: lesson(['translation']), l2: lesson(['listening']) }).map((p) => `${p.lessonId} ${p.code}`);
    expect(codes).toEqual(['l1 v4-lesson-repeat', '* v4-listening', '* v4-cap']);
    // v3 and older modules are not checked
    expect(v4ModuleProblems({ l1: { practice: { meta: { template: 'v3' }, blocks: [] } } })).toEqual([]);
  });
});

describe('v4: one-to-one lessons', () => {
  it('a pair or group task says how it runs with the teacher as the partner', () => {
    const doc = (data, type = 'speaking') => ({ meta: { level: 'A2+', phase: 'practice', template: 'v4', design: 'v2' }, blocks: [{ id: 's', type, data }] });
    const codes = (d) => sheetProblems(d).map((p) => p.code);
    expect(codes(doc({ instruction: 'Räägi paarilisega 2 minutit.' }))).toContain('v4-one-to-one');
    expect(codes(doc({ instruction: 'Räägi paarilisega 2 minutit.', teacher: 'Üks-ühele: õpetaja on paariline.' }))).not.toContain('v4-one-to-one');
    // sorting into groups („kahte rühma”) is not group work; a role play always is
    expect(codes(doc({ instruction: 'Sorteeri sõnad kahte rühma.' }, 'categorize'))).not.toContain('v4-one-to-one');
    expect(codes(doc({ instruction: 'A on arst, B on patsient.' }, 'rolecards'))).toContain('v4-one-to-one');
  });
});
