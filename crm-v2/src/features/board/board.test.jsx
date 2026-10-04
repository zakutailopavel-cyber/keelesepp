import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import BoardPage from './BoardPage.jsx';
import StudentBoard from './StudentBoard.jsx';
import { arrowHead, clampPoint, clampView, fitPage, fitView, movable, pageBounds, screenToWorld, shapeFromDrag, zoomAt } from './boardModel.js';

globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends globalThis.MouseEvent {};

function fakeService(initial = {}) {
  const listeners = new Map();
  const data = { board: [...(initial.board || [])], pages: initial.pages || [], ...Object.fromEntries(Object.entries(initial).filter(([key]) => key.startsWith('page:'))) };
  const emit = (key) => listeners.get(key)?.([...(data[key] || [])]);
  const keyOf = (pageId) => (pageId ? `page:${pageId}` : 'board');
  return {
    data,
    subscribePages: vi.fn((_studentId, onChange) => { onChange(data.pages); return () => {}; }),
    subscribeElements: vi.fn((_studentId, pageId, onChange) => { listeners.set(keyOf(pageId), onChange); onChange([...(data[keyOf(pageId)] || [])]); return () => listeners.delete(keyOf(pageId)); }),
    add: vi.fn(async (_studentId, pageId, element) => { const id = `new-${(data[keyOf(pageId)] || []).length + 1}`; data[keyOf(pageId)] = [...(data[keyOf(pageId)] || []), { id, ...element, revision: 1 }]; emit(keyOf(pageId)); return id; }),
    update: vi.fn(async (_studentId, pageId, element, patch) => { data[keyOf(pageId)] = data[keyOf(pageId)].map((item) => (item.id === element.id ? { ...item, ...patch } : item)); emit(keyOf(pageId)); }),
    remove: vi.fn(async (_studentId, pageId, id) => { data[keyOf(pageId)] = data[keyOf(pageId)].filter((item) => item.id !== id); emit(keyOf(pageId)); }),
    clear: vi.fn(async () => 0),
    addPage: vi.fn(async (_studentId, title) => { const id = `pg-${data.pages.length + 1}`; data.pages = [...data.pages, { id, title }]; return id; }),
    renamePage: vi.fn(async () => {}),
  };
}

const user = { uid: 'stud-1', displayName: 'Mari', roles: ['student'] };

describe('board geometry', () => {
  it('converts screen points, zooms around the cursor and fits the content', () => {
    expect(screenToWorld({ x: 110, y: 60 }, { x: 10, y: 10, scale: 2 })).toEqual({ x: 50, y: 25 });
    const zoomed = zoomAt({ x: 0, y: 0, scale: 1 }, 2, { x: 100, y: 100 });
    expect(screenToWorld({ x: 100, y: 100 }, zoomed)).toEqual({ x: 100, y: 100 });
    expect(zoomAt({ x: 0, y: 0, scale: 3 }, 2, { x: 0, y: 0 }).scale).toBe(3);
    expect(fitView([], 800, 600)).toEqual({ x: 0, y: 0, scale: 1 });
    expect(fitView([{ type: 'note', x: 2000, y: 1000, w: 180, h: 140 }], 800, 600).scale).toBe(1);
    expect(fitView([{ type: 'stroke', points: [{ x: 0, y: 0 }, { x: 4000, y: 100 }] }], 840, 600).scale).toBe(0.2);
  });

  it('keeps rectangles positive and arrows directed', () => {
    expect(shapeFromDrag('rect', { x: 50, y: 50 }, { x: 10, y: 20 })).toEqual({ x: 10, y: 20, w: 40, h: 30 });
    expect(shapeFromDrag('arrow', { x: 50, y: 50 }, { x: 10, y: 20 })).toEqual({ x: 50, y: 50, w: -40, h: -30 });
    expect(arrowHead({ x: 0, y: 0, w: 100, h: 0 })).toContain('100,0');
    expect(movable({ type: 'stroke' })).toBe(false);
    expect(movable({ type: 'image', locked: true })).toBe(false);
    expect(movable({ type: 'note' })).toBe(true);
  });
});

describe('StudentBoard', () => {
  it('shows what was drawn in CRM v1: strokes, shapes, notes, text, images and PDFs', () => {
    const service = fakeService({ board: [
      { id: 's1', type: 'stroke', points: [{ x: 1, y: 1 }, { x: 20, y: 20 }], color: '#1C2B3A', strokeWidth: 4 },
      { id: 'r1', type: 'shape', shape: 'rect', x: 10, y: 10, w: 50, h: 30, color: '#C9882A', strokeWidth: 3 },
      { id: 'n1', type: 'note', x: 100, y: 100, w: 180, h: 140, text: 'Sõnad: kass, koer', color: '#FEF3C7' },
      { id: 't1', type: 'text', x: 300, y: 20, w: 220, h: 40, text: 'Tere!', color: '#1C2B3A', fontSize: 18 },
      { id: 'i1', type: 'image', x: 400, y: 200, w: 200, h: 150, url: 'https://example.com/a.jpg', locked: true },
      { id: 'p1', type: 'pdf', x: 0, y: 400, w: 200, h: 100, url: 'https://example.com/a.pdf', name: 'Tööleht.pdf' },
    ] });
    const { container } = render(<StudentBoard studentId="s-1" user={user} service={service} />);
    expect(container.querySelector('[data-element-id="s1"]').tagName.toLowerCase()).toBe('path');
    expect(container.querySelector('rect[data-element-id="r1"]')).toBeTruthy();
    expect(screen.getByText('Sõnad: kass, koer')).toBeInTheDocument();
    expect(screen.getByText('Tere!')).toBeInTheDocument();
    expect(container.querySelector('image[data-element-id="i1"]').getAttribute('href')).toBe('https://example.com/a.jpg');
    expect(screen.getByRole('link', { name: 'Ava PDF' })).toHaveAttribute('href', 'https://example.com/a.pdf');
    expect(screen.getByText('Sünkroonitud')).toBeInTheDocument();
  });

  it('adds a sticky note, writes in it and erases only unlocked elements', async () => {
    const service = fakeService({ board: [{ id: 'i1', type: 'image', x: 400, y: 200, w: 200, h: 150, url: 'https://example.com/a.jpg', locked: true }] });
    const { container } = render(<StudentBoard studentId="s-1" user={user} service={service} />);
    const svg = screen.getByRole('img', { name: 'Õpilase tahvel' });
    fireEvent.click(screen.getByRole('button', { name: 'Märkmepaber' }));
    await act(async () => { fireEvent.pointerDown(svg, { clientX: 50, clientY: 60, button: 0 }); });
    await waitFor(() => expect(service.add).toHaveBeenCalledWith('s-1', null, expect.objectContaining({ type: 'note', x: 50, y: 60, w: 180, h: 140, text: '' }), user));
    const editor = await screen.findByLabelText('Märkmepaberi tekst');
    fireEvent.change(editor, { target: { value: 'Õpi sõnad' } });
    fireEvent.blur(editor);
    await waitFor(() => expect(service.update).toHaveBeenCalledWith('s-1', null, expect.objectContaining({ id: 'new-2' }), { text: 'Õpi sõnad' }, user));

    fireEvent.click(screen.getByRole('button', { name: 'Kustutaja' }));
    fireEvent.pointerDown(container.querySelector('image[data-element-id="i1"]'), { clientX: 410, clientY: 210, button: 0 });
    expect(await screen.findByRole('alert')).toHaveTextContent('lukus');
    expect(service.remove).not.toHaveBeenCalled();
    fireEvent.pointerDown(container.querySelector('[data-element-id="new-2"]'), { clientX: 60, clientY: 70, button: 0 });
    await waitFor(() => expect(service.remove).toHaveBeenCalledWith('s-1', null, 'new-2'));
  });

  it("a student's eraser leaves the teacher's unlocked image; the teacher can erase it", async () => {
    const board = [{ id: 'i1', type: 'image', x: 400, y: 200, w: 200, h: 150, url: 'https://example.com/a.jpg', locked: false }];
    const service = fakeService({ board });
    const view = render(<StudentBoard studentId="s-1" user={user} staff={false} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: 'Kustutaja' }));
    fireEvent.pointerDown(view.container.querySelector('image[data-element-id="i1"]'), { clientX: 410, clientY: 210, button: 0 });
    expect(await screen.findByRole('alert')).toHaveTextContent('ainult õpetaja');
    expect(service.remove).not.toHaveBeenCalled();
    view.unmount();

    const teacherView = render(<StudentBoard studentId="s-1" user={user} staff service={service} />);
    fireEvent.click(screen.getByRole('button', { name: 'Kustutaja' }));
    fireEvent.pointerDown(teacherView.container.querySelector('image[data-element-id="i1"]'), { clientX: 410, clientY: 210, button: 0 });
    await waitFor(() => expect(service.remove).toHaveBeenCalledWith('s-1', null, 'i1'));
  });

  it('opens straight on a lesson page when the lesson row asks for it', () => {
    const service = fakeService({ pages: [{ id: 'pg1', title: 'Tund 3', order: 1 }], 'page:pg1': [{ id: 'x1', type: 'text', x: 0, y: 0, w: 200, h: 40, text: 'Lehe tekst', color: '#000', fontSize: 18 }] });
    render(<StudentBoard studentId="s-1" user={user} staff service={service} initialPageId="pg1" />);
    expect(screen.getByRole('tab', { name: 'Tund 3' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Lehe tekst')).toBeInTheDocument();
  });

  it('edits an existing text: the text tool or a double click opens it, and the font and size change that text', async () => {
    const service = fakeService({ board: [{ id: 't1', type: 'text', x: 100, y: 100, w: 260, h: 44, text: 'Tere', color: '#111827', fontSize: 18, revision: 1 }] });
    render(<StudentBoard studentId="s-1" user={user} service={service} />);
    const svg = screen.getByRole('img', { name: 'Õpilase tahvel' });
    fireEvent.click(screen.getByRole('button', { name: 'Tekst' }));
    await act(async () => { fireEvent.pointerDown(svg, { clientX: 120, clientY: 110, button: 0 }); });
    const editor = await screen.findByRole('textbox', { name: 'Tekst' });
    expect(service.add).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Käsikiri' }));
    await waitFor(() => expect(service.update).toHaveBeenCalledWith('s-1', null, expect.objectContaining({ id: 't1' }), expect.objectContaining({ fontFamily: 'hand' }), user));
    fireEvent.change(editor, { target: { value: 'Tere hommikust\nKuidas läheb?' } });
    fireEvent.blur(editor);
    await waitFor(() => expect(service.update).toHaveBeenLastCalledWith('s-1', null, expect.objectContaining({ id: 't1' }), expect.objectContaining({ text: 'Tere hommikust\nKuidas läheb?', h: expect.any(Number) }), user));
    expect(service.update.mock.calls.at(-1)[3].h).toBeGreaterThan(44);

    fireEvent.click(screen.getByRole('button', { name: 'Vali ja liiguta' }));
    fireEvent.doubleClick(svg, { clientX: 120, clientY: 110 });
    expect(await screen.findByRole('textbox', { name: 'Tekst' })).toHaveValue('Tere hommikust\nKuidas läheb?');
  });

  it('writes new text in the chosen font and leaves the default font off the element', async () => {
    const service = fakeService();
    render(<StudentBoard studentId="s-1" user={user} service={service} />);
    const svg = screen.getByRole('img', { name: 'Õpilase tahvel' });
    fireEvent.click(screen.getByRole('button', { name: 'Tekst' }));
    await act(async () => { fireEvent.pointerDown(svg, { clientX: 50, clientY: 60, button: 0 }); });
    await waitFor(() => expect(service.add).toHaveBeenCalled());
    expect(service.add.mock.calls[0][2]).not.toHaveProperty('fontFamily');
    fireEvent.blur(await screen.findByRole('textbox', { name: 'Tekst' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tekst' }));
    fireEvent.click(screen.getByRole('button', { name: 'Raamat' }));
    await act(async () => { fireEvent.pointerDown(svg, { clientX: 500, clientY: 400, button: 0 }); });
    await waitFor(() => expect(service.add).toHaveBeenLastCalledWith('s-1', null, expect.objectContaining({ type: 'text', fontFamily: 'serif' }), user));
  });

  it('the student adds a sheet and renames a sheet by double clicking its tab', async () => {
    const service = fakeService({ pages: [{ id: 'pg1', title: 'Tund 3', order: 1 }] });
    render(<StudentBoard studentId="s-1" user={user} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: 'Uus leht' }));
    await waitFor(() => expect(service.addPage).toHaveBeenCalledWith('s-1', 'Leht 2', 2, user));
    fireEvent.doubleClick(screen.getByRole('tab', { name: 'Tund 3' }));
    const input = screen.getByRole('textbox', { name: 'Lehe nimi' });
    fireEvent.change(input, { target: { value: 'Minevik' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.blur(input);
    await waitFor(() => expect(service.renamePage).toHaveBeenCalledWith('s-1', 'pg1', 'Minevik', user));
  });

  it('keeps the board a sheet with edges: the page grows only around older content, panning keeps it on screen', () => {
    expect(pageBounds([])).toEqual({ x1: 0, y1: 0, x2: 1600, y2: 1000 });
    expect(pageBounds([{ type: 'note', x: 1700, y: -50, w: 180, h: 140 }])).toEqual({ x1: 0, y1: -90, x2: 1920, y2: 1000 });
    const bounds = pageBounds([]);
    expect(fitPage(bounds, 832, 532)).toEqual({ scale: 0.5, x: 16, y: 16 });
    expect(clampView({ x: -5000, y: 0, scale: 1 }, bounds, 800, 600).x).toBe(-1520);
    expect(clampPoint({ x: -10, y: 2000 }, bounds)).toEqual({ x: 0, y: 1000 });
  });

  it("the teacher's drawing and notes carry the teacher mark; a student can neither erase nor edit them", async () => {
    const teacherService = fakeService();
    const teacher = render(<StudentBoard studentId="s-1" user={user} staff service={teacherService} />);
    fireEvent.click(screen.getByRole('button', { name: 'Märkmepaber' }));
    await act(async () => { fireEvent.pointerDown(screen.getByRole('img', { name: 'Õpilase tahvel' }), { clientX: 50, clientY: 60, button: 0 }); });
    await waitFor(() => expect(teacherService.add).toHaveBeenCalledWith('s-1', null, expect.objectContaining({ type: 'note', byStaff: true }), user));
    teacher.unmount();

    const board = [{ id: 't1', type: 'text', x: 100, y: 100, w: 260, h: 44, text: 'Õpetaja', color: '#111', fontSize: 18, byStaff: true }, { id: 's1', type: 'stroke', points: [{ x: 400, y: 400 }, { x: 420, y: 420 }], color: '#111', strokeWidth: 4, byStaff: true }];
    const service = fakeService({ board });
    const view = render(<StudentBoard studentId="s-1" user={user} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: 'Kustutaja' }));
    fireEvent.pointerDown(view.container.querySelector('[data-element-id="s1"]'), { clientX: 410, clientY: 410, button: 0 });
    expect(await screen.findByRole('alert')).toHaveTextContent('ainult õpetaja');
    expect(service.remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Tekst' }));
    await act(async () => { fireEvent.pointerDown(screen.getByRole('img', { name: 'Õpilase tahvel' }), { clientX: 120, clientY: 110, button: 0 }); });
    expect(screen.queryByRole('textbox', { name: 'Tekst' })).toBeNull();
    expect(service.add).not.toHaveBeenCalled();
  });

  it('draws a pen stroke and switches to a v1 lesson page', async () => {
    const service = fakeService({ pages: [{ id: 'pg1', title: 'Tund 3', order: 1 }], 'page:pg1': [{ id: 'x1', type: 'text', x: 0, y: 0, w: 200, h: 40, text: 'Lehe tekst', color: '#000', fontSize: 18 }] });
    render(<StudentBoard studentId="s-1" user={user} service={service} />);
    const svg = screen.getByRole('img', { name: 'Õpilase tahvel' });
    fireEvent.pointerDown(svg, { clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerMove(svg, { clientX: 40, clientY: 40 });
    fireEvent.pointerMove(svg, { clientX: 80, clientY: 60 });
    fireEvent.pointerUp(svg, { clientX: 80, clientY: 60 });
    await waitFor(() => expect(service.add).toHaveBeenCalledWith('s-1', null, expect.objectContaining({ type: 'stroke', points: [{ x: 10, y: 10 }, { x: 40, y: 40 }, { x: 80, y: 60 }] }), user));
    fireEvent.click(screen.getByRole('tab', { name: 'Tund 3' }));
    expect(await screen.findByText('Lehe tekst')).toBeInTheDocument();
    expect(service.subscribeElements).toHaveBeenLastCalledWith('s-1', 'pg1', expect.any(Function), expect.any(Function));
  });
});

describe('BoardPage', () => {
  it("opens the board of the student's own card", async () => {
    const studentRepository = { listOwned: vi.fn().mockResolvedValue([{ id: 's-1', name: 'Mari Maas' }]) };
    render(<MemoryRouter initialEntries={['/board']}><AuthContext.Provider value={{ user }}><Routes><Route path="/board" element={<BoardPage studentRepository={studentRepository} boardService={fakeService()} />} /></Routes></AuthContext.Provider></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Mari Maas — tahvel' })).toBeInTheDocument();
    expect(studentRepository.listOwned).toHaveBeenCalledWith('stud-1');
  });

  it("a teacher opens a student's board from the student card", async () => {
    const teacher = { uid: 't-1', displayName: 'Jelena', roles: ['teacher'] };
    const studentRepository = { getById: vi.fn().mockResolvedValue({ id: 's-9', name: 'Jaan Tamm' }) };
    render(<MemoryRouter initialEntries={['/board/s-9']}><AuthContext.Provider value={{ user: teacher }}><Routes><Route path="/board/:studentId" element={<BoardPage studentRepository={studentRepository} boardService={fakeService()} />} /></Routes></AuthContext.Provider></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Jaan Tamm — tahvel' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Õpilase kaart/ })).toHaveAttribute('href', '/students/s-9');
    expect(screen.getByRole('button', { name: /Tühjenda/ })).toBeInTheDocument();
  });
});
