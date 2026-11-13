// A picture inside a text (owner 2026-11-11): data model, schema check, drawing on the sheet, editing, print and the
// phone column. Old sheets (no `figure`, no `shape`) draw exactly as before.
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Sheet from './Sheet.jsx';
import FloatFigure from './FloatFigure.jsx';
import { sampleDocument } from './sample.js';
import { BLOCKS } from './registry.js';
import { MAX_FIGURES, dropPlace, figureParagraphs, figureProblem, figuresOf, figuresPatch, frameClass, newFigure, normalizeFigure, shapeAspect, snapWidth } from './figureFloat.js';
import { SPLITTABLE } from './pageSplit.js';
import { findEditable } from './inlineEdit.js';
import { validateWorksheetDoc } from '../../../services/firebase/worksheetDocs.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
vi.mock('../../../services/firebase/storageClient.js', () => ({}));

const img = { src: 'https://example.invalid/anna.webp', width: 1600, height: 1067 };
const textBlock = (figure) => ({ id: 'txt', type: 'text', data: { heading: 'Kus? Kuhu? Kust?', text: 'Esimene lõik.\n\nTeine lõik.\n\nKolmas lõik.', ...(figure === undefined ? {} : { figure }) } });
const docWith = (...blocks) => ({ ...sampleDocument(), blocks });

describe('figureFloat model', () => {
  it('normalizes a stored figure; unknown values and modes fall back (a later „free” mode draws as float)', () => {
    expect(normalizeFigure(null)).toBeNull();
    expect(normalizeFigure({ side: 'top', width: 5, shape: 'star', border: 'gold', at: -2, mode: 'free' })).toMatchObject({ mode: 'float', side: 'right', width: 20, shape: 'rect', border: 'none', at: 0, locked: false });
    expect(newFigure(img)).toMatchObject({ mode: 'float', img, side: 'right', width: 33, at: 0, shape: 'rect', locked: false });
  });

  it('snaps a dragged width to 25 / 33 / 50 / 100 when near, else to 5 %', () => {
    expect(snapWidth(31)).toBe(33);
    expect(snapWidth(48)).toBe(50);
    expect(snapWidth(41)).toBe(40);
    expect(snapWidth(140)).toBe(100);
    expect(snapWidth(3)).toBe(20);
  });

  it('a drop lands by the third of the column and the paragraph above the pointer', () => {
    const box = { left: 0, width: 300 };
    expect(dropPlace({ x: 20, y: 5 }, box, [0, 100, 200])).toEqual({ side: 'left', at: 0 });
    expect(dropPlace({ x: 150, y: 150 }, box, [0, 100, 200])).toEqual({ side: 'center', at: 1 });
    expect(dropPlace({ x: 290, y: 250 }, box, [0, 100, 200])).toEqual({ side: 'right', at: 2 });
  });

  it('frames: classes for shape and border; a circle is square, an oval 4:3', () => {
    expect(frameClass({})).toBe('');
    expect(frameClass({ shape: 'circle', border: 'lime' })).toBe('shape-circle border-lime');
    expect(shapeAspect('circle', '16:9')).toBe('1:1');
    expect(shapeAspect('oval', '1:1')).toBe('4:3');
    expect(shapeAspect(undefined, '16:9')).toBe('16:9');
  });
});

describe('schema check (validateWorksheetDoc)', () => {
  it('keeps accepting old sheets and accepts a valid picture in a text and a framed picture', () => {
    expect(validateWorksheetDoc(sampleDocument())).toBe(true);
    expect(validateWorksheetDoc(docWith(textBlock(newFigure(img)), { id: 'p', type: 'image', data: { img, aspect: '4:3', shape: 'circle', border: 'ink' } }))).toBe(true);
    expect(validateWorksheetDoc(docWith(textBlock(null)))).toBe(true);
  });

  it('refuses unknown shapes, sides, modes and widths', () => {
    expect(figureProblem(textBlock({ ...newFigure(img), side: 'top' }))).toMatch(/asukoht/);
    expect(figureProblem(textBlock({ ...newFigure(img), width: 150 }))).toMatch(/20–100/);
    expect(figureProblem(textBlock({ ...newFigure(img), mode: 'free' }))).toMatch(/paigutus/);
    expect(figureProblem({ type: 'image', data: { shape: 'star' } })).toMatch(/kuju/);
    expect(() => validateWorksheetDoc(docWith(textBlock({ ...newFigure(img), border: 'gold' })))).toThrow(/raam/);
  });
});

describe('drawing on the sheet', () => {
  it('an old text block draws as before (no figure, no wrapper class)', () => {
    const { container } = render(<Sheet doc={docWith(textBlock())} mode="print" />);
    const block = container.querySelector('.ws-page .ws-textblock');
    expect(block.className).toBe('ws-textblock');
    expect(container.querySelector('.ws-ffig')).toBeNull();
    expect([...block.querySelectorAll('p')].map((p) => p.textContent)).toEqual(['Esimene lõik.', 'Teine lõik.', 'Kolmas lõik.']);
  });

  it('the picture stands before its paragraph, floated, framed, sized; print has no tools and it is on one page once', () => {
    const doc = docWith(textBlock({ ...newFigure(img), side: 'left', width: 50, at: 1, shape: 'circle', border: 'lime', caption: 'Anna' }));
    const { container } = render(<Sheet doc={doc} mode="print" />);
    const figures = container.querySelectorAll('.ws-page .ws-ffig');
    expect(figures).toHaveLength(1);
    const figure = figures[0];
    expect(figure.className).toContain('is-left');
    expect(figure.className).toContain('shape-circle border-lime');
    expect(figure.className).toContain('has-caption');
    expect(figure.style.width).toBe('50%');
    expect(figure.nextElementSibling.textContent).toBe('Teine lõik.');
    expect(figure.querySelector('figcaption').textContent).toBe('Anna');
    expect(figure.querySelector('.ws-photo').style.aspectRatio).toMatch(/^1( \/ 1)?$/);
    expect(container.querySelector('.ws-ffig-handle')).toBeNull();
    // the hidden measuring copy also has it (so the page split measures the text with its picture)
    expect(container.querySelectorAll('.ws-measure .ws-ffig')).toHaveLength(1);
  });

  it('a long sheet still packs into pages with the picture text whole on one page', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ id: `t${i}`, type: 'text', data: { text: `Lõik ${i}.` } }));
    const doc = docWith(...many.slice(0, 15), textBlock({ ...newFigure(img), at: 2 }), ...many.slice(15));
    const { container } = render(<Sheet doc={doc} mode="print" />);
    const pages = [...container.querySelectorAll('.ws-page')];
    expect(pages.filter((page) => page.querySelector('[data-block="txt"]'))).toHaveLength(1);
  });

  it('the phone column draws the same picture (CSS stacks it)', () => {
    const { container } = render(<div className="ws-narrow"><Sheet flow doc={docWith(textBlock(newFigure(img)))} mode="interactive" answers={{}} setAnswer={() => {}} /></div>);
    expect(container.querySelector('.ws-root.is-flow .ws-ffig.is-right')).not.toBeNull();
  });
});

describe('editing the picture', () => {
  it('in the constructor the tools are buttons; the lock is one undoable change and hides the move / size tools', () => {
    const onPatch = vi.fn();
    const doc = docWith(textBlock(newFigure(img)));
    const { container, rerender } = render(<Sheet doc={doc} mode="edit" selectedId="txt" onSelect={() => {}} onPatch={onPatch} />);
    const tools = () => [...container.querySelectorAll('.ws-page .ws-ffig-handle')].map((el) => el.getAttribute('aria-label'));
    expect(tools()).toEqual(['Lohista pilt teise kohta', 'Muuda pildi laiust', 'Lukusta pilt']);
    fireEvent.click(screen.getAllByRole('button', { name: 'Lukusta pilt' })[0]);
    expect(onPatch).toHaveBeenCalledWith('txt', { figures: [expect.objectContaining({ locked: true, side: 'right', at: 0 })], figure: null });
    rerender(<Sheet doc={docWith(textBlock({ ...newFigure(img), locked: true }))} mode="edit" selectedId="txt" onSelect={() => {}} onPatch={onPatch} />);
    expect(tools()).toEqual(['Ava pildi lukk']);
  });

  it('dragging the corner sets the width; dragging the grip moves it to the other side', () => {
    const onChange = vi.fn();
    const { container } = render(<div className="ws-textblock" data-figure-column=""><FloatFigure figure={newFigure(img)} onChange={onChange} /><p>Üks.</p></div>);
    const column = container.querySelector('.ws-textblock');
    const figure = container.querySelector('.ws-ffig');
    column.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, right: 1000, bottom: 600, height: 600 });
    figure.getBoundingClientRect = () => ({ left: 670, right: 1000, top: 0, bottom: 300, width: 330, height: 300 });
    container.querySelector('p').getBoundingClientRect = () => ({ top: 0 });
    const size = screen.getByRole('button', { name: 'Muuda pildi laiust' });
    fireEvent.pointerDown(size, { clientX: 670, clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(size, { clientX: 500, clientY: 300, pointerId: 1 });
    fireEvent.pointerUp(size, { clientX: 500, clientY: 300, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ width: 50 }));
    const move = screen.getByRole('button', { name: 'Lohista pilt teise kohta' });
    fireEvent.pointerDown(move, { clientX: 700, clientY: 20, pointerId: 2 });
    fireEvent.pointerUp(move, { clientX: 60, clientY: 40, pointerId: 2 });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ side: 'left', at: 0 }));
  });

  it('tapping the picture is not a text edit; its caption is', () => {
    const block = textBlock({ ...newFigure(img), caption: 'Anna' });
    const { container } = render(<Sheet doc={docWith(block)} mode="print" />);
    const root = container.querySelector('.ws-page [data-block="txt"]');
    expect(findEditable(root.querySelector('.ws-ffig img') || root.querySelector('.ws-photo-empty') || root.querySelector('.ws-ffig .ws-photo'), root, block.data)).toBeNull();
    expect(findEditable(root.querySelector('figcaption'), root, block.data)).toMatchObject({ path: ['figure', 'caption'] });
    expect(findEditable(root.querySelectorAll('.ws-textblock p')[1], root, block.data)).toBeNull();
  });

  it('the inspector adds a picture to a text and removes it again', () => {
    const set = vi.fn();
    const Editor = BLOCKS.text.Editor;
    const { rerender } = render(<Editor data={{ text: 'Üks.\n\nKaks.' }} set={set} />);
    fireEvent.click(screen.getByRole('button', { name: /Lisa pilt teksti sisse/ }));
    expect(set).toHaveBeenLastCalledWith({ figures: [expect.objectContaining({ mode: 'float', side: 'right', width: 33 })], figure: null });
    rerender(<Editor data={{ text: 'Üks.\n\nKaks.', figure: newFigure(img) }} set={set} />);
    expect(screen.getByRole('option', { name: '2. lõik' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Eemalda pilt tekstist' }));
    expect(set).toHaveBeenLastCalledWith({ figures: null, figure: null });
  });
});

describe('several pictures and the reading text (2026-11-13)', () => {
  const fig = (patch) => ({ ...newFigure(img), ...patch });
  it('figuresOf reads the list, else the older single picture; figuresPatch clears the older field', () => {
    expect(figuresOf({})).toEqual([]);
    expect(figuresOf({ figure: fig({ at: 1 }) })).toHaveLength(1);
    expect(figuresOf({ figure: fig(), figures: [fig({ at: 0 }), fig({ at: 2 })] }).map((f) => f.at)).toEqual([0, 2]);
    expect(figuresOf({ figures: [fig(), fig(), fig(), fig()] })).toHaveLength(MAX_FIGURES);
    expect(figuresPatch([])).toEqual({ figures: null, figure: null });
    expect(figureParagraphs('reading', { passage: 'Üks.\n\n\n\n  \n\nKaks.' })).toEqual(['Üks.', 'Kaks.']);
  });

  it('schema: a list of up to three valid pictures passes; more, a bad one or a non-list is refused', () => {
    const block = (figures) => ({ id: 'r', type: 'reading', data: { passage: 'A.', questions: '', figures } });
    expect(figureProblem(block([fig(), fig({ side: 'left' })]))).toBe('');
    expect(figureProblem(block(null))).toBe('');
    expect(figureProblem(block([fig(), fig(), fig(), fig()]))).toMatch(/kuni 3/);
    expect(figureProblem(block([fig(), fig({ shape: 'star' })]))).toMatch(/kuju/);
    expect(figureProblem(block({}))).toMatch(/vigased/);
  });

  it('two pictures in a text: each before its own paragraph; moving the second keeps the first', () => {
    const onPatch = vi.fn();
    const block = { id: 'txt', type: 'text', data: { text: 'Üks.\n\nKaks.\n\nKolm.', figures: [fig({ at: 0, caption: 'A' }), fig({ at: 2, side: 'left', caption: 'B' })] } };
    const { container } = render(<Sheet doc={docWith(block)} mode="edit" selectedId="txt" onSelect={() => {}} onPatch={onPatch} />);
    const column = container.querySelector('.ws-page .ws-textblock');
    expect(column.className).toContain('has-figure');
    expect([...column.children].map((el) => el.tagName === 'FIGURE' ? `F:${el.querySelector('figcaption').textContent}` : el.textContent)).toEqual(['F:A', 'Üks.', 'Kaks.', 'F:B', 'Kolm.']);
    fireEvent.click(column.querySelectorAll('.ws-ffig-handle.is-lock')[1]);
    expect(onPatch).toHaveBeenLastCalledWith('txt', { figures: [expect.objectContaining({ caption: 'A', locked: false }), expect.objectContaining({ caption: 'B', locked: true, at: 2 })], figure: null });
  });

  it('the reading text takes pictures; a split part draws only its own and stores a change against the whole text', () => {
    const onPatch = vi.fn();
    const data = { passageTitle: 'Mari', passage: 'P1.\n\nP2.\n\nP3.\n\nP4.', questions: 'Q? [a]', figures: [fig({ at: 0, caption: 'A' }), fig({ at: 3, caption: 'B' })] };
    const whole = render(<Sheet doc={docWith({ id: 'rd', type: 'reading', data })} mode="print" />);
    expect([...whole.container.querySelectorAll('.ws-page .ws-passage figcaption')].map((el) => el.textContent)).toEqual(['A', 'B']);
    whole.unmount();
    const part = SPLITTABLE.reading.slice(data, 2, 5).data;
    expect(part).toMatchObject({ passage: 'P3.\n\nP4.', figureFrom: 2, figureLast: true });
    const View = BLOCKS.reading.View;
    const ctx = { get: () => undefined, set: () => {}, state: () => undefined, patch: (p) => onPatch('rd', p) };
    const { container } = render(<View data={part} ctx={ctx} />);
    const passage = container.querySelector('.ws-passage');
    expect([...passage.children].map((el) => el.tagName === 'FIGURE' ? 'F' : el.textContent)).toEqual(['P3.', 'F', 'P4.']);
    fireEvent.click(passage.querySelector('.ws-ffig-handle.is-lock'));
    expect(onPatch).toHaveBeenLastCalledWith('rd', { figures: [expect.objectContaining({ caption: 'A', at: 0 }), expect.objectContaining({ caption: 'B', at: 3, locked: true })], figure: null });
    const first = SPLITTABLE.reading.slice(data, 0, 2).data;
    expect(first).toMatchObject({ figureFrom: 0, figureLast: false });
  });

  it('the reading inspector adds pictures up to three; the second goes left by the next paragraph', () => {
    const set = vi.fn();
    const Editor = BLOCKS.reading.Editor;
    const data = { passage: 'Üks.\n\nKaks.', questions: '', figures: [fig({ at: 0 })] };
    const { rerender } = render(<Editor data={data} set={set} />);
    fireEvent.click(screen.getByRole('button', { name: /Lisa veel üks pilt/ }));
    expect(set).toHaveBeenLastCalledWith({ figures: [expect.objectContaining({ at: 0 }), expect.objectContaining({ side: 'left', at: 1 })], figure: null });
    rerender(<Editor data={{ ...data, figures: [fig(), fig(), fig()] }} set={set} />);
    expect(screen.queryByRole('button', { name: /Lisa .*pilt/ })).toBeNull();
    expect(screen.getByText(/rohkem ei mahu/)).toBeInTheDocument();
  });
});
