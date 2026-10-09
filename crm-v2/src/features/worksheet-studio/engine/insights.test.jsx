import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { addAlternative, sheetInsights } from './insights.js';
import InsightsPanel from '../InsightsPanel.jsx';

const doc = {
  meta: {},
  blocks: [
    { id: 'g', type: 'gaps', data: { title: 'Lüngad', sentences: 'Ma ärkan [hommikul].\n\nMa söön [lõunat].' } },
    { id: 'd', type: 'dialogue', data: { title: 'Dialoog', speakerA: 'A', speakerB: 'B', lines: [{ who: 'A', text: 'Tere, [Jaan]!' }] } },
    { id: 'tf', type: 'truefalse', data: { title: 'Õ/V', statements: [{ text: 'a', answer: 'true' }] } },
  ],
};
const sub = (answers, status = 'done') => ({ status, worksheetDoc: doc, answers });

describe('sheet insights', () => {
  it('per task share of right answers, average, and a „wrong” answer written by many', () => {
    const list = [
      sub({ 'g:0.0': 'hommikuti', 'g:1.0': 'lõunat', 'd:0.0': 'Jaan', 'tf:0': 'true' }),
      sub({ 'g:0.0': 'Hommikuti', 'g:1.0': 'lõunat', 'd:0.0': 'Jaan', 'tf:0': 'true' }),
      sub({ 'g:0.0': 'hommikul', 'g:1.0': 'õhtul', 'd:0.0': 'Jaan', 'tf:0': 'true' }),
      sub({ 'g:0.0': 'x' }, 'in_progress'),
    ];
    const ins = sheetInsights(doc, list);
    expect(ins).toMatchObject({ assigned: 4, submitted: 3 });
    expect(ins.tasks.map((t) => [t.blockId, t.pct])).toEqual([['g', 50], ['d', 100], ['tf', 100]]);
    expect(ins.hints[0]).toMatchObject({ kind: 'same-answer', blockId: 'g', key: '0.0', answer: 'hommikuti', count: 2, canAdd: true });
    expect(ins.hints.filter((h) => h.kind === 'easy').map((h) => h.blockId)).toEqual(['d', 'tf']);
  });

  it('„Lisa õigeks” adds the answer to that gap only once; dialogue lines too', () => {
    const next = addAlternative(doc.blocks[0], '0.0', 'hommikuti');
    expect(next.data.sentences).toBe('Ma ärkan [hommikul|hommikuti].\n\nMa söön [lõunat].');
    expect(addAlternative(next, '0.0', 'Hommikuti').data.sentences).toBe(next.data.sentences);
    expect(addAlternative(doc.blocks[0], '1.0', 'lõunasööki').data.sentences).toBe('Ma ärkan [hommikul].\n\nMa söön [lõunat|lõunasööki].');
    expect(addAlternative(doc.blocks[1], '0.0', 'Jaanus').data.lines[0].text).toBe('Tere, [Jaan|Jaanus]!');
    expect(addAlternative(doc.blocks[0], 'x', 'a')).toBe(doc.blocks[0]);
  });

  it('the panel lists the tasks and adds a right answer from a hint', async () => {
    const list = [sub({ 'g:0.0': 'hommikuti', 'g:1.0': 'lõunat' }), sub({ 'g:0.0': 'hommikuti', 'g:1.0': 'lõunat' })];
    const onAdd = vi.fn();
    const onSelect = vi.fn();
    render(<InsightsPanel lessonId="l1" doc={doc} load={async () => list} onSelect={onSelect} onAddAlternative={onAdd} />);
    expect(await screen.findByText('esitanud')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Lüngad/ }));
    expect(onSelect).toHaveBeenCalledWith('g');
    fireEvent.click(screen.getByRole('button', { name: /Lisa õigeks/ }));
    expect(onAdd).toHaveBeenCalledWith('g', '0.0', 'hommikuti');
    expect(screen.getByText(/Lisatud/)).toBeInTheDocument();
  });

  it('the panel says when nobody has submitted yet', async () => {
    render(<InsightsPanel lessonId="l1" doc={doc} load={async () => [sub({}, 'new')]} onSelect={vi.fn()} onAddAlternative={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/pole veel keegi esitanud \(määratud 1 õpilasele\)/)).toBeInTheDocument());
  });
});
