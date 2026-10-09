import { calibrate } from './calibration.js';
import { createBlock } from '../engine/registry.js';

describe('calibration', () => {
  it('per level and task type: share of right answers and a verdict when there are enough answers', () => {
    const tf = { ...createBlock('truefalse'), id: 'tf', data: { title: 'T', statements: Array.from({ length: 10 }, (_, i) => ({ text: `L${i}`, answer: 'true' })) } };
    const doc = { meta: { level: 'A2' }, blocks: [tf] };
    const right = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tf:${i}`, 'true']));
    const wrong = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`tf:${i}`, i < 3 ? 'true' : 'false']));
    const rows = calibrate([
      { id: 'a', status: 'done', worksheetDoc: doc, answers: wrong },
      { id: 'b', status: 'done', worksheetDoc: doc, answers: wrong },
      { id: 'c', status: 'new', worksheetDoc: doc, answers: right },
    ]);
    expect(rows).toEqual([{ level: 'A2', type: 'truefalse', label: 'Õige / vale', right: 6, total: 20, sheets: 2, pct: 30, verdict: 'hard' }]);
    expect(calibrate([{ id: 'a', status: 'done', worksheetDoc: doc, answers: right }])[0].verdict).toBe('few');
  });
});
