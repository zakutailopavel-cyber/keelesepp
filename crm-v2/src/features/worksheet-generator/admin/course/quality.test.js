import { harnoProblems, problemKey, sheetProblems, splitByBaseline, v4ModuleProblems } from './quality.js';

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
  const sheet = (phase, types) => ({ meta: { level: 'A2+', phase, template: 'v4', design: 'v2' }, blocks: types.map((type, i) => ({ id: `b${i}`, type, data: {} })) });
  const v4 = (phase, types) => sheetProblems(sheet(phase, types)).map((p) => p.code).filter((c) => c.startsWith('v4-'));
  it('Avasta: an input, noticing and a talk; no test-like drills before the form is met', () => {
    expect(v4('discover', ['text', 'listening', 'notice', 'table', 'speaking'])).toEqual([]);
    expect(v4('discover', ['text', 'notice', 'errorfix', 'translation', 'writing'])).toEqual(['v4-input', 'v4-talk', 'v4-early-drill']);
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
