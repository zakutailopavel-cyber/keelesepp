import { vi } from 'vitest';
import { fitRect, viewRect } from './boardModel.js';
import { EMPTY_REMOTE, createThrottle, cursorMessage, draftMessage, dropStale, moveMessage, reduceRemote, remoteOnPage, typingMessage, viewMessage } from './liveDrafts.js';

describe('live board messages', () => {
  it('builds the messages one side sends', () => {
    expect(draftMessage('p1', { type: 'stroke', points: [{ x: 1.234, y: 2 }], color: '#ff0000', strokeWidth: 3 })).toEqual({ t: 'd', pageId: 'p1', draft: { type: 'stroke', points: [{ x: 1.23, y: 2 }], color: '#ff0000', strokeWidth: 3 } });
    expect(draftMessage('', null)).toEqual({ t: 'd', pageId: '', draft: null });
    expect(typingMessage('', 'e1', 'Tere')).toEqual({ t: 'typing', pageId: '', id: 'e1', text: 'Tere' });
    expect(typingMessage('', '')).toEqual({ t: 'typing', pageId: '', id: '', text: '' });
    expect(moveMessage('', ['a', 'b'], 5, -3)).toEqual({ t: 'move', pageId: '', ids: ['a', 'b'], dx: 5, dy: -3 });
    expect(cursorMessage('', { x: 1, y: 2 })).toEqual({ t: 'cur', pageId: '', x: 1, y: 2, typing: false });
    expect(cursorMessage('', null)).toEqual({ t: 'cur', off: true });
    expect(viewMessage('', null)).toEqual({ t: 'view', off: true });
  });

  it('keeps the other side’s live state and checks everything that arrives', () => {
    let state = reduceRemote(EMPTY_REMOTE, { t: 'd', pageId: 'p1', draft: { type: 'stroke', points: [{ x: 1, y: 1 }, { x: 'x' }], color: 'url(javascript:1)' } }, 1000);
    expect(state.draft).toEqual({ pageId: 'p1', at: 1000, draft: { type: 'stroke', points: [{ x: 1, y: 1 }], color: '#1C2B3A', strokeWidth: 4 } });
    expect(reduceRemote(state, { t: 'd', draft: { type: 'image', url: 'x' } }).draft).toBeNull();
    state = reduceRemote(state, { t: 'typing', pageId: 'p1', id: 'e1', text: 'x'.repeat(5000) }, 1000);
    expect(state.typing.text).toHaveLength(4000);
    state = reduceRemote(state, { t: 'move', pageId: 'p1', ids: ['e1'], dx: 3, dy: 4 }, 1000);
    expect(state.move).toMatchObject({ ids: ['e1'], dx: 3, dy: 4 });
    expect(reduceRemote(state, { t: 'move', pageId: 'p1', ids: [], dx: 0, dy: 0 }).move).toBeNull();
    expect(reduceRemote(state, { t: 'view', x1: 5, y1: 5, x2: 1, y2: 9 })).toBe(state); // an empty rectangle is ignored
    expect(reduceRemote(state, { t: 'nope' })).toBe(state);
    expect(reduceRemote(state, null)).toBe(state);
  });

  it('drops what a vanished side left behind and shows only the open page', () => {
    let state = reduceRemote(EMPTY_REMOTE, { t: 'd', pageId: '', draft: { type: 'shape', shape: 'rect', x: 0, y: 0, w: 5, h: 5 } }, 0);
    state = reduceRemote(state, { t: 'cur', pageId: 'p2', x: 1, y: 1 }, 0);
    expect(dropStale(state, 1000)).toBe(state);
    const later = dropStale(state, 7000);
    expect(later.draft).toBeNull();
    expect(later.cursor).not.toBeNull();
    expect(remoteOnPage(state, '').draft).not.toBeNull();
    expect(remoteOnPage(state, '').cursor).toBeNull();
    expect(remoteOnPage(state, 'p2').cursor).toMatchObject({ x: 1, y: 1 });
  });

  it('sends at most one message per kind in a moment, never loses the last one, sends an end at once', () => {
    vi.useFakeTimers();
    try {
      const sent = [];
      const push = createThrottle((message) => sent.push(message), 40, { clock: () => Date.now() });
      push('d', 1); push('d', 2); push('d', 3); push('cur', 'c');
      expect(sent).toEqual([1, 'c']);
      vi.advanceTimersByTime(40);
      expect(sent).toEqual([1, 'c', 3]);
      push('d', 4); push('d', 'end', { now: true });
      vi.advanceTimersByTime(100);
      expect(sent).toEqual([1, 'c', 3, 'end']);
      push.dispose();
    } finally { vi.useRealTimers(); }
  });
});

describe('the teacher’s view on the student’s screen', () => {
  it('reads the visible part and shows it whole, or by width for a worksheet', () => {
    expect(viewRect({ x: -100, y: -50, scale: 2 }, 800, 500)).toEqual({ x1: 50, y1: 25, x2: 450, y2: 275 });
    expect(viewRect({ x: 0, y: 0, scale: 1 }, 0, 500)).toBeNull();
    expect(fitRect({ x1: 0, y1: 0, x2: 400, y2: 250 }, 800, 500)).toEqual({ scale: 2, x: 0, y: 0 });
    // a narrower screen: the same middle, smaller
    expect(fitRect({ x1: 0, y1: 0, x2: 400, y2: 250 }, 400, 500)).toEqual({ scale: 1, x: 0, y: 125 });
    expect(fitRect({ x1: 100, y1: 300, x2: 600, y2: 600 }, 1000, 400, { byWidth: true })).toEqual({ scale: 2, x: -200, y: -600 });
  });
});
