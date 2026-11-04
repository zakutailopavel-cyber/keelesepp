import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Sheet from './Sheet.jsx';
import { SCHEMA } from './schema.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

// jsdom has no layout: every task card gets the screen rectangle the test gives it, the notes follow it frame by frame
const gaps = (id) => ({ id, type: 'gaps', width: 'full', tone: 'blue', data: { title: `Ülesanne ${id}`, showBank: 'no', bank: '', sentences: 'Ma ärkan [hommikul].\nMa söön [õhtul].' } });
const doc = { schema: SCHEMA, id: 'd', meta: { title: 'Minu päev' }, blocks: [gaps('a'), gaps('b')] };
const rect = (left, top, w, h) => ({ left, top, right: left + w, bottom: top + h, width: w, height: h, x: left, y: top });
let rects;
let frames;
const flush = () => act(() => { frames.splice(0).forEach((cb) => cb()); });
const note = (id) => globalThis.document.querySelector(`.ws-float-note[data-for-block="${id}"]`);
const card = (container, id) => container.querySelector(`.ws-flow [data-block="${id}"]`);
const pops = { a: { label: 'Õiged vastused', chip: 'Õiged vastused', content: <span className="ws-live-answers">A: hommikul</span> }, b: { label: 'Õiged vastused', chip: 'Õiged vastused', content: <span className="ws-live-answers">B: õhtul</span> } };

beforeEach(() => {
  frames = [];
  rects = { a: rect(20, 100, 400, 300), b: rect(20, 450, 400, 300) };
  vi.stubGlobal('requestAnimationFrame', (cb) => { frames.push(cb); return frames.length; });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.spyOn(globalThis.HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function box() {
    const id = this.dataset?.block;
    if (id && rects[id] && this.matches('.ws-card')) return rects[id];
    if (this.matches?.('input')) return rects.field || rect(0, 0, 0, 0);
    return rect(0, 0, 0, 0);
  });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('the notes of a task float next to it (owner 2026-11-04: no hint inside the task)', () => {
  it('the card stays as it is; one note open beside its task, the other waits as a button; × and the button switch them', () => {
    const { container } = render(<Sheet flow doc={doc} mode="interactive" answers={{}} setAnswer={() => {}} blockPopovers={pops} />);
    flush();
    // nothing of the notes is inside the cards: opening one cannot change the sheet's layout
    expect(card(container, 'a').querySelector('.ws-live-answers, .ws-float-note')).toBeNull();
    expect(card(container, 'b').querySelector('.ws-live-answers, .ws-float-note')).toBeNull();
    // the task nearest the screen's middle gets its note, to its right
    expect(note('a').dataset.mode).toBe('open');
    expect(note('a').style.left).toBe('430px');
    expect(note('a').style.top).toBe('100px');
    expect(note('b').dataset.mode).toBe('pill');
    fireEvent.click(note('b').querySelector('.ws-float-note-open'));
    flush(); flush();
    expect(note('b').dataset.mode).toBe('open');
    expect(note('a').dataset.mode).toBe('pill');
    fireEvent.click(note('b').querySelector('[aria-label="Sulge: Õiged vastused"]'));
    flush(); flush();
    expect(note('b').dataset.mode).toBe('pill');
    expect(note('a').dataset.mode).toBe('open');
  });

  it('follows its task when the board pans and hides while the task is out of sight', () => {
    render(<Sheet flow doc={doc} mode="interactive" answers={{}} setAnswer={() => {}} blockPopovers={{ a: pops.a }} />);
    flush();
    expect(note('a').style.top).toBe('100px');
    rects.a = rect(-30, 160, 400, 300);
    flush();
    expect(note('a').style.left).toBe('380px');
    expect(note('a').style.top).toBe('160px');
    rects.a = rect(20, 2000, 400, 300);
    flush();
    expect(note('a').dataset.mode).toBe('hidden');
    expect(note('a').style.visibility).toBe('hidden');
  });

  it('the task being typed in gets its note, and the note never covers that field', () => {
    const { container } = render(<Sheet flow doc={doc} mode="interactive" answers={{}} setAnswer={() => {}} blockPopovers={pops} />);
    flush();
    expect(note('a').dataset.mode).toBe('open');
    const field = card(container, 'b').querySelector('input');
    rects.field = rect(40, 500, 200, 40);
    act(() => { field.focus(); });
    flush(); flush();
    expect(note('b').dataset.mode).toBe('open');
    expect(note('a').dataset.mode).toBe('pill');
    const left = parseFloat(note('b').style.left);
    expect(left >= 240 || left + 360 <= 40).toBe(true);
  });
});
