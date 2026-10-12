import { harnoProblems, problemKey, splitByBaseline } from './quality.js';

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
