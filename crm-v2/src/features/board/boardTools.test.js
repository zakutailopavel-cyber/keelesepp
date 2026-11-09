// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { arrowBounds, arrowFromDrag, arrowHeads, arrowPathD, bendPatch, calloutBox, controlPoint, curveMiddle, endpointPatch, headsOf } from './arrows.js';
import { elementBounds, fitSheet, resizePatch } from './boardModel.js';
import { applyStyle, domToSpans, insertText, normalizeSpans, plainText, selectionOffsets, setSelectionOffsets, spansOf, spansToHtml, stepSize, styleAt, textPatch, toggleStyle } from './richText.js';
import { bookmarkElement, bookmarkEmpty, cleanInk, inkPath, isBookmark, normalizeNote, notePatch, noteRecord } from './bookmarkModel.js';
import { reduceRemote, typingMessage, draftMessage } from './liveDrafts.js';

describe('arrows', () => {
  const straight = { type: 'shape', shape: 'arrow', x: 0, y: 0, w: 100, h: 0, strokeWidth: 3 };

  it('an old arrow (no bend, no heads) draws as before: a straight line with one head at its end', () => {
    expect(arrowPathD(straight)).toBe('M 0 0 L 100 0');
    expect(headsOf(straight)).toBe('end');
    const heads = arrowHeads(straight);
    expect(heads).toHaveLength(1);
    expect(heads[0]).toContain('100,0');
  });

  it('draws a double-headed arrow, a line without heads and a callout pointing at its start', () => {
    expect(arrowHeads({ ...straight, heads: 'both' })).toHaveLength(2);
    expect(arrowHeads({ ...straight, heads: 'both' })[1]).toContain('0,0');
    expect(arrowHeads({ ...straight, shape: 'line' })).toHaveLength(0);
    const callout = { ...straight, shape: 'callout', text: 'Siin' };
    expect(arrowHeads(callout)).toHaveLength(1);
    expect(arrowHeads(callout)[0]).toContain('0,0');
  });

  it('bends a curve sideways; its middle handle lies on the curve and dragging it sets the bend', () => {
    const curve = { ...straight, bend: 40 };
    // the normal of a left-to-right arrow points up (y down on screen)
    expect(controlPoint(curve)).toEqual({ x: 50, y: -40 });
    expect(arrowPathD(curve)).toBe('M 0 0 Q 50 -40 100 0');
    expect(curveMiddle(curve)).toEqual({ x: 50, y: -20 });
    expect(bendPatch(straight, { x: 50, y: -20 })).toEqual({ bend: 40 });
    expect(bendPatch(straight, { x: 50, y: 1 })).toEqual({ bend: 0 });
    // a curved head follows the curve: its tip is the end, its wings are not on the straight line
    expect(arrowHeads(curve)[0]).toContain('100,0');
  });

  it('moves one end and keeps the other', () => {
    expect(endpointPatch(straight, 'end', { x: 60, y: 80 })).toEqual({ w: 60, h: 80 });
    const start = endpointPatch(straight, 'start', { x: 20, y: -30 });
    expect(start).toEqual({ x: 20, y: -30, w: 80, h: 30 });
    expect(start.x + start.w).toBe(100);
  });

  it('new arrows from a drag: curve, double, callout', () => {
    expect(arrowFromDrag('arrow', { x: 0, y: 0 }, { x: 30, y: 40 })).toEqual({ shape: 'arrow', x: 0, y: 0, w: 30, h: 40 });
    expect(arrowFromDrag('curve', { x: 0, y: 0 }, { x: 30, y: 40 }).bend).toBe(13);
    expect(arrowFromDrag('double', { x: 0, y: 0 }, { x: 30, y: 40 }).heads).toBe('both');
    expect(arrowFromDrag('callout', { x: 0, y: 0 }, { x: 30, y: 40 })).toMatchObject({ shape: 'callout', text: '' });
  });

  it('bounds hold the curve and the callout label; resizing scales the bend', () => {
    expect(arrowBounds({ ...straight, bend: 40 })).toEqual({ x1: 0, y1: -20, x2: 100, y2: 0 });
    expect(elementBounds({ ...straight, bend: 40 })).toEqual({ x1: 0, y1: -20, x2: 100, y2: 0 });
    const callout = { ...straight, shape: 'callout', text: 'Vaata siia' };
    const box = calloutBox(callout);
    expect(box.x + box.w / 2).toBe(100);
    expect(elementBounds(callout).x2).toBeGreaterThan(100);
    expect(resizePatch({ ...straight, h: 100, bend: 40 }, 100, 100).bend).toBe(80);
  });
});

describe('the worksheet in the middle (owner 2026-11-04)', () => {
  const sheet = { x1: 0, y1: 0, x2: 1000, y2: 2000 };
  it('stands in the middle of a wide board, never larger than 140 %', () => {
    const view = fitSheet(sheet, 2000);
    expect(view.scale).toBe(1.4);
    expect(view.x).toBe(300);
    expect(view.y).toBe(16);
  });
  it('keeps clear of the video tiles and fills the free width on a laptop', () => {
    const view = fitSheet(sheet, 1300, { insetRight: 250 });
    expect(view.scale).toBeCloseTo(1.018, 3);
    expect(view.x).toBe(16);
    const wide = fitSheet(sheet, 1900, { insetRight: 250 });
    expect(wide.x + 1000 * wide.scale).toBeLessThanOrEqual(1900 - 250 - 16);
    expect(wide.x).toBeGreaterThan(16);
  });
});

describe('rich text', () => {
  it('old plain text still renders as one run; spans that do not match the text are ignored', () => {
    expect(spansOf({ text: 'Tere' })).toEqual([{ t: 'Tere' }]);
    expect(spansOf({ text: '' })).toEqual([]);
    expect(spansOf({ text: 'Tere hommikust', spans: [{ t: 'Tere', b: true }] })).toEqual([{ t: 'Tere hommikust' }]);
    expect(spansOf({ text: 'Tere', spans: [{ t: 'Te', b: true }, { t: 're' }] })).toEqual([{ t: 'Te', b: true }, { t: 're' }]);
  });

  it('styles one word or one letter and merges equal neighbours', () => {
    const base = [{ t: 'Tere hommikust' }];
    const word = applyStyle(base, 5, 14, { c: '#DC2626', b: true });
    expect(word).toEqual([{ t: 'Tere ' }, { t: 'hommikust', b: true, c: '#DC2626' }]);
    const letter = applyStyle(word, 0, 1, { u: true, h: '#FEF08A', f: 'serif', s: 32 });
    expect(letter[0]).toEqual({ t: 'T', u: true, h: '#FEF08A', f: 'serif', s: 32 });
    expect(plainText(letter)).toBe('Tere hommikust');
    expect(applyStyle(letter, 0, 1, { u: null, h: null, f: null, s: null })[0]).toEqual({ t: 'Tere ' });
  });

  it('toggles bold on the selection and reports the shared style', () => {
    const spans = [{ t: 'ab', b: true }, { t: 'cd' }];
    expect(styleAt(spans, 0, 2)).toEqual({ b: true });
    expect(styleAt(spans, 0, 4)).toEqual({});
    expect(toggleStyle(spans, 0, 4, 'b')).toEqual([{ t: 'abcd', b: true }]);
    expect(toggleStyle(spans, 0, 2, 'b')).toEqual([{ t: 'abcd' }]);
  });

  it('drops bad values: colours, fonts, sizes', () => {
    expect(normalizeSpans([{ t: 'x', c: 'red', f: 'Comic', s: 400, b: 'yes' }, { t: '' }])).toEqual([{ t: 'x' }]);
    expect(stepSize(18, 1)).toBe(22);
    expect(stepSize(18, -1)).toBe(16);
  });

  it('stores spans only when something is styled (round trip through the element)', () => {
    expect(textPatch({ text: 'a' }, [{ t: 'Tere' }])).toEqual({ text: 'Tere' });
    expect(textPatch({ text: 'a', spans: [{ t: 'a', b: true }] }, [{ t: 'Tere' }])).toEqual({ text: 'Tere', spans: [] });
    const patch = textPatch({ text: '' }, [{ t: 'Te', i: true }, { t: 're' }]);
    expect(patch).toEqual({ text: 'Tere', spans: [{ t: 'Te', i: true }, { t: 're' }] });
    expect(spansOf({ ...patch })).toEqual(patch.spans);
  });

  it('inserts typed text in the style around it', () => {
    expect(insertText([{ t: 'ab', b: true }, { t: 'cd' }], 2, 2, '\n')).toEqual([{ t: 'ab\n', b: true }, { t: 'cd' }]);
    expect(insertText([{ t: 'ab', b: true }, { t: 'cd' }], 0, 0, 'X')).toEqual([{ t: 'Xab', b: true }, { t: 'cd' }]);
    expect(insertText([{ t: 'ab', b: true }, { t: 'cd' }], 1, 3, 'Z')).toEqual([{ t: 'aZ', b: true }, { t: 'd' }]);
  });

  it('the editor HTML reads back to the same runs, newlines included, and keeps the selection by offsets', () => {
    const spans = [{ t: 'Tere\n', b: true }, { t: 'hommikust', c: '#DC2626', s: 26 }];
    const root = document.createElement('div');
    document.body.append(root);
    root.innerHTML = spansToHtml(spans, 18);
    expect(domToSpans(root)).toEqual(spans);
    expect(root.querySelector('span[data-rt]').getAttribute('style')).toContain('font-weight:700');
    root.innerHTML = spansToHtml([{ t: 'ab\n' }], 18);
    expect(root.innerHTML).toContain('data-rt-end');
    expect(domToSpans(root)).toEqual([{ t: 'ab\n' }]);
    // Chrome's own new line: <div> blocks and <br>
    root.innerHTML = 'ab<div>cd</div><div><br></div>';
    expect(plainText(domToSpans(root))).toBe('ab\ncd\n');
    root.innerHTML = spansToHtml(spans, 18);
    setSelectionOffsets(root, 2, 8);
    expect(selectionOffsets(root)).toEqual({ start: 2, end: 8 });
    root.remove();
  });

  it('live typing carries the runs only when they match the text', () => {
    const spans = [{ t: 'Te', b: true }, { t: 're' }];
    const message = typingMessage('', 't1', 'Tere', spans);
    expect(message.spans).toEqual(spans);
    expect(reduceRemote(undefined, message).typing).toMatchObject({ id: 't1', text: 'Tere', spans });
    expect(typingMessage('', 't1', 'Tere!', spans).spans).toBeUndefined();
    expect(typingMessage('', 't1', 'Tere', [{ t: 'Tere' }]).spans).toBeUndefined();
  });

  it('live drafts carry an arrow\'s bend, heads and a callout', () => {
    const draft = draftMessage('', { type: 'shape', shape: 'callout', x: 0, y: 0, w: 10, h: 10, color: '#000000', strokeWidth: 3, bend: 0, heads: 'both', text: 'Siin' }).draft;
    expect(draft).toMatchObject({ shape: 'callout', heads: 'both', text: 'Siin' });
    expect(draft).not.toHaveProperty('bend');
    expect(draftMessage('', { type: 'shape', shape: 'arrow', x: 0, y: 0, w: 10, h: 10, bend: 12 }).draft.bend).toBe(12);
  });
});

describe('bookmark', () => {
  it('handwriting becomes compact paths; bad strokes are dropped', () => {
    expect(inkPath([{ x: 1.234, y: 2 }, { x: 10, y: 20.05 }])).toBe('M1.2 2L10 20.1');
    expect(inkPath([{ x: 5, y: 5 }])).toBe('M5 5l0.1 0');
    expect(cleanInk([{ d: 'M1 1L2 2', c: '#DC2626', w: 3 }, { d: 'javascript:1' }, { d: 'M1 1', c: 'red', w: 99 }])).toEqual([{ d: 'M1 1L2 2', c: '#DC2626', w: 3 }, { d: 'M1 1', c: '#1C2B3A', w: 12 }]);
    expect(bookmarkEmpty({ text: '  ', ink: [] })).toBe(true);
    expect(bookmarkEmpty({ text: '', ink: [{ d: 'M1 1' }] })).toBe(false);
  });

  it('the board element and the student\'s note hold the same content', () => {
    const ink = [{ d: 'M1 1L20 20', c: '#1C2B3A', w: 3 }];
    const element = bookmarkElement({ x: 10.4, y: 20.6, text: 'Kordan: kass → kassi', ink, color: '#DCFCE7', noteId: 'n1' });
    expect(element).toEqual({ type: 'note', bookmark: true, x: 10, y: 21, w: 220, h: 170, text: 'Kordan: kass → kassi', ink, color: '#DCFCE7', noteId: 'n1' });
    expect(isBookmark(element)).toBe(true);
    expect(isBookmark({ type: 'note' })).toBe(false);
    const record = noteRecord({ studentId: 's1', text: element.text, ink, color: element.color, pageId: 'pg', pageTitle: 'Tund 3', user: { uid: 't1', displayName: 'Kati' }, staff: true, now: '2026-11-04T10:00:00.000Z' });
    expect(record).toEqual({ studentId: 's1', kind: 'board', text: 'Kordan: kass → kassi', ink, color: '#DCFCE7', pageId: 'pg', pageTitle: 'Tund 3', byStaff: true, createdByUid: 't1', createdByName: 'Kati', createdAt: '2026-11-04T10:00:00.000Z', updatedAt: '2026-11-04T10:00:00.000Z' });
    expect(normalizeNote('n1', record)).toMatchObject({ id: 'n1', text: element.text, ink, byStaff: true, pageTitle: 'Tund 3' });
    expect(notePatch({ text: 'Uus', ink: [], color: 'bad', now: 'x' })).toEqual({ text: 'Uus', ink: [], updatedAt: 'x' });
  });
});
