import { answerProgress, createBlock } from './registry.js';
import { hardestTasks, nextToOpen, rightAnswers, shownResults, stepView, taskStats } from './liveLesson.js';

const doc = {
  meta: {},
  blocks: [
    { id: 't', type: 'text', data: { text: 'Loe.' } },
    { id: 'g', type: 'gaps', data: { title: 'Lüngad', sentences: 'Ma ärkan [hommikul].\nMa söön [lõunat|lõunasööki].' } },
    { id: 'w', type: 'writing', data: { title: 'Kirjuta', prompt: 'x' } },
    { id: 'tf', type: 'truefalse', data: { title: 'Õ/V', statements: [{ text: 'a', answer: 'true' }, { text: 'b', answer: 'false' }] } },
  ],
};

describe('live worksheet lesson model', () => {
  it('step mode keeps non-task blocks and the opened tasks only', () => {
    expect(stepView(doc, null).hidden).toBe(0);
    const { doc: seen, hidden } = stepView(doc, { on: true, open: ['tf'] });
    expect(seen.blocks.map((b) => b.id)).toEqual(['t', 'tf']);
    expect(hidden).toBe(2);
    expect(nextToOpen(doc, { on: true, open: ['g'] })).toBe('w');
  });

  it('marks and right answers only for shown tasks', () => {
    const answers = { 'g:0.0': 'hommikul', 'g:1.0': 'õhtul', 'tf:0': 'false' };
    expect(shownResults(doc, answers, ['g'])).toEqual({ 'g:0.0': 'ok', 'g:1.0': 'bad' });
    expect(shownResults(doc, { 'g:0.0': 'hommikul' }, ['g'])).toEqual({ 'g:0.0': 'ok' });
    expect(shownResults(doc, answers, [])).toEqual({});
    expect(rightAnswers(doc.blocks[1])).toEqual(['hommikul', 'lõunat / lõunasööki']);
    expect(rightAnswers(doc.blocks[0])).toEqual([]);
  });

  it('task stats: answered / right / wrong and a tone; the hardest first', () => {
    const stats = taskStats(doc, { 'g:0.0': 'hommikul', 'g:1.0': 'õhtul', 'tf:0': 'false', 'tf:1': 'true' });
    expect(stats.map((s) => [s.id, s.num, s.ok, s.answered, s.total, s.tone])).toEqual([
      ['g', 1, 1, 2, 2, 'mixed'], ['w', 2, 0, 0, 1, 'idle'], ['tf', 3, 0, 2, 2, 'hard'],
    ]);
    expect(hardestTasks(stats).map((s) => s.id)).toEqual(['tf', 'g']);
    expect(taskStats(doc, {})[0].tone).toBe('idle');
  });

  it('a written text counts as answered (writing is scored by counters, not by fields)', () => {
    const w = { ...createBlock('writing'), id: 'w2' };
    const sheet = { meta: {}, blocks: [w] };
    const text = 'Hommikul ma ärkan. Päeval ma töötan. Õhtul ma loen.';
    // the student filled in the only field: N/N, no „Kas esitad ikkagi?” for a finished sheet
    expect(answerProgress(sheet, { 'w2:text': text })).toEqual({ answered: 1, total: 1 });
    expect(answerProgress(sheet, {})).toEqual({ answered: 0, total: 1 });
    const [stat] = taskStats(sheet, { 'w2:text': text });
    expect(stat.answered).toBe(stat.total);
    expect(stat.wrong).toBeGreaterThan(0); // too few sentences and keywords: the teacher sees it as hard, not idle
    expect(stat.tone).not.toBe('idle');
  });
});
