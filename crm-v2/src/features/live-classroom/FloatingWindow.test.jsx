import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach } from 'vitest';
import FloatingWindow, { FloatingLayer } from './FloatingWindow.jsx';
import { STORAGE_KEY } from './floatingLayout.js';

globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends globalThis.MouseEvent {};

// jsdom has no layout: the layer falls back to the window size (1024 × 768)
const heightFor = (w) => Math.round(w * 0.75);
const topRight = () => ({ ax: 'right', ay: 'top', dx: 14, dy: 56, w: 220, min: false });
function renderWindow(extra = {}) {
  return render(<FloatingLayer>
    <FloatingWindow id="t-remote" label="Video: Mari" restoreLabel="Näita videot: Mari" heightFor={heightFor} defaultLayout={topRight} {...extra}>
      <video data-testid="pilt" />
    </FloatingWindow>
  </FloatingLayer>);
}
const win = () => screen.getByRole('group', { name: 'Video: Mari' });
const saved = () => JSON.parse(globalThis.localStorage.getItem(STORAGE_KEY) || '{}')['t-remote'];

beforeEach(() => { globalThis.localStorage.clear(); });

describe('FloatingWindow', () => {
  it('is placed top right the first time', () => {
    renderWindow();
    expect(win().style.transform).toBe('translate(790px, 56px)');
    expect(win().style.width).toBe('220px');
    expect(win().style.height).toBe('165px');
  });

  it('moves with the pointer (mouse, pen or finger) and remembers the place in this browser', () => {
    renderWindow();
    fireEvent.pointerDown(win(), { clientX: 800, clientY: 60, button: 0 });
    fireEvent.pointerMove(win(), { clientX: 500, clientY: 300 });
    expect(win().className).toContain('is-dragging');
    fireEvent.pointerUp(win(), { clientX: 500, clientY: 300 });
    expect(win().style.transform).toBe('translate(490px, 296px)');
    expect(saved()).toEqual({ ax: 'right', ay: 'top', dx: 314, dy: 296, w: 220, min: false });
  });

  it('snaps to the corner when let go near it and never leaves the board', () => {
    renderWindow();
    fireEvent.pointerDown(win(), { clientX: 800, clientY: 60 });
    fireEvent.pointerMove(win(), { clientX: 30, clientY: 900 });
    fireEvent.pointerUp(win(), { clientX: 30, clientY: 900 });
    expect(win().style.transform).toBe('translate(8px, 595px)');
    expect(saved()).toMatchObject({ ax: 'left', ay: 'bottom', dx: 8, dy: 8 });
  });

  it('uses the remembered place on the next visit', () => {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify({ 't-remote': { ax: 'left', ay: 'bottom', dx: 20, dy: 30, w: 160, min: false } }));
    renderWindow();
    expect(win().style.transform).toBe('translate(20px, 618px)');
    expect(win().style.width).toBe('160px');
  });

  it('resizes from a corner with the aspect kept', () => {
    renderWindow();
    const grip = win().querySelector('[data-resize="left"]');
    fireEvent.pointerDown(grip, { clientX: 790, clientY: 221 });
    fireEvent.pointerMove(win(), { clientX: 690, clientY: 221 });
    fireEvent.pointerUp(win(), { clientX: 690, clientY: 221 });
    expect(win().style.width).toBe('320px');
    expect(win().style.height).toBe('240px');
    expect(win().style.transform).toBe('translate(690px, 56px)');
  });

  it('has size presets that grow towards its own corner', () => {
    renderWindow();
    fireEvent.click(screen.getByRole('button', { name: 'Suur aken' }));
    expect(win().style.width).toBe('380px');
    expect(win().style.transform).toBe('translate(630px, 56px)');
    fireEvent.click(screen.getByRole('button', { name: 'Väike aken' }));
    expect(win().style.width).toBe('160px');
    expect(saved()).toMatchObject({ ax: 'right', dx: 14, w: 160 });
  });

  it('a tap without moving shows the tools (touch screens have no hover)', () => {
    renderWindow();
    fireEvent.pointerDown(win(), { clientX: 800, clientY: 60 });
    fireEvent.pointerUp(win(), { clientX: 801, clientY: 61 });
    expect(win().className).toContain('show-tools');
    expect(win().style.transform).toBe('translate(790px, 56px)');
  });

  it('is minimized into a chip and back; the picture (and sound) stays mounted', () => {
    renderWindow();
    fireEvent.click(screen.getByRole('button', { name: 'Peida video (heli jääb)' }));
    expect(screen.getByTestId('pilt')).toBeInTheDocument();
    expect(saved()).toMatchObject({ min: true });
    fireEvent.click(screen.getByRole('button', { name: 'Näita videot: Mari' }));
    expect(win().className).not.toContain('is-min');
    expect(saved()).toMatchObject({ min: false });
  });

  it('another id in the same place takes its own remembered layout (group strip column ↔ row)', () => {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify({ 't-row': { ax: 'left', ay: 'bottom', dx: 20, dy: 30, w: 160, min: false } }));
    const { rerender } = renderWindow();
    expect(win().style.transform).toBe('translate(790px, 56px)');
    rerender(<FloatingLayer>
      <FloatingWindow id="t-row" label="Video: Mari" heightFor={heightFor} defaultLayout={topRight}><video data-testid="pilt" /></FloatingWindow>
    </FloatingLayer>);
    expect(win().style.transform).toBe('translate(20px, 618px)');
  });

  it('moves with the arrow keys when focused', () => {
    renderWindow();
    fireEvent.keyDown(win(), { key: 'ArrowLeft' });
    fireEvent.keyDown(win(), { key: 'ArrowDown', shiftKey: true });
    expect(win().style.transform).toBe('translate(774px, 104px)');
  });
});
