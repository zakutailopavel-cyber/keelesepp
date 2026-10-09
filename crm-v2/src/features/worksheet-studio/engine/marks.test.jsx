import { fireEvent, render, screen } from '@testing-library/react';
import { MAX_MARKS, addMark, marksOf, moveMark, newMark, removeMark, resizeMark, updateMark } from './marksModel.js';
import MarksLayer from './Marks.jsx';
import { editSource } from './inlineEdit.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

describe('free layer (marks)', () => {
  it('adds marks of each kind inside the card, a second one a little lower, at most 20', () => {
    let block = { id: 'b1', type: 'gaps', data: {} };
    const first = addMark(block, 'note');
    block = first.block;
    const second = addMark(block, 'note');
    expect(second.mark.y).toBeGreaterThan(first.mark.y);
    expect(marksOf(second.block)).toHaveLength(2);
    expect(addMark(block, 'nope').mark).toBeNull();
    let full = { marks: Array.from({ length: MAX_MARKS }, () => newMark('label')) };
    expect(addMark(full, 'label').mark).toBeNull();
    full = removeMark(full, full.marks[0].id);
    expect(marksOf(full)).toHaveLength(MAX_MARKS - 1);
    expect(updateMark({ marks: [{ id: 'a', kind: 'label', text: 'x' }] }, 'a', { color: 'red' }).marks[0].color).toBe('red');
  });

  it('moving keeps the mark in the card; handles move arrow ends and grow boxes', () => {
    const note = { ...newMark('note'), x: 90, w: 30 };
    expect(moveMark(note, 50, 0).x).toBe(70);
    const arrow = newMark('arrow');
    const moved = moveMark(arrow, -100, 0);
    expect(Math.min(moved.x1, moved.x2)).toBe(0);
    expect(moved.x2 - moved.x1).toBeCloseTo(arrow.x2 - arrow.x1);
    expect(resizeMark(arrow, 'end', 90, 10)).toMatchObject({ x2: 90, y2: 10, x1: arrow.x1 });
    expect(resizeMark({ ...newMark('circle'), x: 10, y: 10 }, 'size', 50, 40)).toMatchObject({ w: 40, h: 30 });
    expect(resizeMark({ ...newMark('sticker'), x: 10 }, 'size', 18, 0, 2.5).size).toBe(20);
  });

  it('draws marks; in edit mode the selected one gets colours and a delete button', () => {
    const onChange = vi.fn();
    const block = { id: 'b1', marks: [{ ...newMark('note'), id: 'n1', text: 'Vaata siia!' }, { ...newMark('sticker'), id: 's1' }] };
    render(<MarksLayer block={block} editable onChange={onChange} />);
    expect(screen.getByText('Vaata siia!')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Vaata siia!'));
    fireEvent.click(screen.getByRole('button', { name: 'Värv green' }));
    expect(onChange.mock.calls[0][0].marks[0].color).toBe('green');
    fireEvent.click(screen.getByRole('button', { name: 'Kustuta märge' }));
    expect(onChange.mock.calls[1][0].marks.map((m) => m.id)).toEqual(['s1']);
    fireEvent.click(screen.getByLabelText('Kleebis ⭐'));
    fireEvent.click(screen.getByRole('button', { name: 'Kleebis 💡' }));
    expect(onChange.mock.calls[2][0].marks.find((m) => m.id === 's1').emoji).toBe('💡');
  });

  it('a printed or student sheet shows the marks without tools', () => {
    render(<MarksLayer block={{ marks: [{ ...newMark('label'), id: 'l1', text: 'NB!' }] }} />);
    fireEvent.click(screen.getByText('NB!'));
    expect(screen.queryByRole('toolbar')).toBeNull();
  });
});

describe('editing source lines on the sheet', () => {
  it('edits the n-th non-empty line of a newline field; empty removes it', () => {
    const data = { sentences: 'Ma ärkan [hommikul].\n\nMa söön [lõunat].' };
    const src = editSource(data, 'sentences#1');
    expect(src.value).toBe('Ma söön [lõunat].');
    expect(src.write('Ma söön [õhtusööki].')).toEqual({ path: ['sentences'], value: 'Ma ärkan [hommikul].\n\nMa söön [õhtusööki].' });
    expect(src.write('  ')).toEqual({ path: ['sentences'], value: 'Ma ärkan [hommikul].\n' });
    expect(editSource(data, 'sentences#5')).toBeNull();
  });

  it('edits nested strings and nested newline fields; keeps a mind-map dash', () => {
    const data = { lines: [{ who: 'A', text: 'Tere!' }], questions: [{ q: 'Mis?', options: '*jah\nei' }], nodes: 'hommikul\n- ärkan' };
    expect(editSource(data, 'lines.0.text').write('Tere, [Jaan]!')).toEqual({ path: ['lines', 0, 'text'], value: 'Tere, [Jaan]!' });
    expect(editSource(data, 'lines.0.text').write(' ')).toBeNull();
    expect(editSource(data, 'questions.0.options#0').value).toBe('*jah');
    expect(editSource(data, 'nodes#1').value).toBe('- ärkan');
    expect(editSource(data, 'lines.0')).toBeNull();
  });
});

describe('Sheet: double-click a line with gaps', () => {
  it('opens its source text with the gaps in brackets and saves it back', async () => {
    const { default: Sheet } = await import('./Sheet.jsx');
    const { newDocument } = await import('./schema.js');
    const doc = newDocument();
    doc.blocks = [{ id: 'g1', type: 'gaps', width: 'half', span: 6, tone: 'blue', data: { title: 'T', instruction: '', bank: '', showBank: 'no', sentences: 'Ma ärkan [hommikul].\nMa söön [lõunat].' } }];
    const onEditText = vi.fn();
    const { container } = render(<Sheet doc={doc} mode="edit" onEditText={onEditText} onSelect={() => {}} />);
    const line = [...container.querySelectorAll('.ws-page [data-edit="sentences#1"]')][0];
    fireEvent.doubleClick(line);
    const field = screen.getByLabelText('Muuda rida (lünk nurksulgudes)');
    expect(field.value).toBe('Ma söön [lõunat].');
    fireEvent.change(field, { target: { value: 'Ma söön [õhtusööki].' } });
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onEditText).toHaveBeenCalledWith('g1', ['sentences'], 'Ma ärkan [hommikul].\nMa söön [õhtusööki].');
    expect(screen.queryByLabelText('Muuda rida (lünk nurksulgudes)')).toBeNull();
  });
});
