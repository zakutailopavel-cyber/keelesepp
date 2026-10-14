import { depthProblems, depthScore, DEPTH } from './depth.js';

const gaps = (n, hint = false) => ({ id: `g${n}`, type: 'gaps', data: { sentences: Array.from({ length: n }, (_, i) => `Eile õhtul ma [lugesin]${hint ? ' (lugema)' : ''} oma toas pikka raamatut ${i}.`).join('\n') } });
const fix = (n) => ({ id: `f${n}`, type: 'errorfix', data: { rows: Array.from({ length: n }, () => ({ wrong: 'Eile ma lähen pärast tööd koos sõbraga poodi.', answer: 'x' })) } });
const tr = (n) => ({ id: `t${n}`, type: 'transformation', data: { rows: Array.from({ length: n }, () => ({ from: 'Ma lähen homme hommikul vara tööle bussiga.', prompt: 'p', answer: 'x' })) } });
const speaking = { id: 'sp', type: 'speaking', data: { minSec: 120, maxSec: 240 } };
const writing = { id: 'wr', type: 'writing', data: { minSent: 8, maxSent: 10 } };
const codes = (doc) => depthProblems(doc).map((p) => p.code);

describe('worksheet depth', () => {
  it('a sheet of a few five-item tasks padded with speaking and writing is thin', () => {
    const doc = { meta: { level: 'B1' }, blocks: [gaps(5), fix(5), tr(5), speaking, writing] };
    expect(codes(doc)).toEqual(expect.arrayContaining(['thin', 'short-tasks', 'live-fast']));
    expect(depthScore(depthProblems(doc))).toBeLessThan(60);
  });

  it('a full B1 sheet passes', () => {
    const doc = { meta: { level: 'B1' }, blocks: [gaps(12), fix(12), tr(12), gaps(12), fix(12), tr(12), speaking] };
    expect(depthProblems(doc)).toEqual([]);
  });

  it('flags base forms given in brackets from B1 on, not at A2', () => {
    expect(codes({ meta: { level: 'B1' }, blocks: [gaps(10, true)] })).toContain('hinted');
    expect(codes({ meta: { level: 'A2' }, blocks: [gaps(10, true)] })).not.toContain('hinted');
  });

  it('a dictation without sentences leaves the teacher nothing to read', () => {
    const doc = { meta: { level: 'A2' }, blocks: [{ id: 'd', type: 'dictation', data: { sentences: '' } }] };
    expect(depthProblems(doc).find((p) => p.code === 'dictation-empty')).toMatchObject({ level: 'error', blocks: ['d'] });
  });

  it('short sentences for the level and too few whole sentences to write', () => {
    const doc = { meta: { level: 'C1' }, blocks: [{ id: 'g', type: 'gaps', data: { sentences: 'Ma [olen].\nTa [on].\nMe [oleme].\nNad [on].' } }] };
    expect(codes(doc)).toEqual(expect.arrayContaining(['short-sentences', 'no-sentences']));
    expect(DEPTH.C1.items).toBe(10);
  });
});
