import { useLayoutEffect, useMemo, useReducer } from 'react';

// The room's top bar on a small screen (owner 2026-11-05, a Windows laptop 1366×768 at 125 %: the last icon was cut
// off by the window edge). The bar is one row; when it does not fit, the lower-priority buttons fold into „⋯” one step
// at a time, in a fixed order. Step 'labels' first drops the words next to the icons („Juhi vaadet”, „Hetk”, …).
// Microphone, camera, leave / end the call, the recording mark and the lesson clock never fold.

/** Fold order of the 1:1 room (lowest priority first); only the steps whose button is in the bar. */
export function liveRoomFoldSteps({ teacher = false, guest = false } = {}) {
  if (teacher) return ['labels', 'people', 'materials', ...(guest ? [] : ['words', 'poll']), 'timer', 'history', ...(guest ? [] : ['chat']), 'tasks', 'plan', 'norec'];
  return ['labels', 'people', ...(guest ? [] : ['words']), 'history', ...(guest ? [] : ['chat']), 'tasks'];
}

/** Fold order of the group room. */
export function groupRoomFoldSteps({ teacher = false, closed = false } = {}) {
  if (closed) return ['history'];
  return teacher ? ['labels', 'materials', 'poll', 'timer', 'history', 'chat', 'plan'] : ['history', 'chat'];
}

/**
 * The fold state: `count` steps are folded. A measure that overflows folds one more step; after the bar grew
 * (`resize`) one step is unfolded at a time while it still fits, and a width where unfolding failed is remembered
 * (`blockedAt`) so the bar does not flicker between two states. Another set of steps (`key`) starts again from
 * nothing folded; other buttons in the bar (`content`: the call started or ended) try to unfold again.
 */
export const FOLD_START = Object.freeze({ count: 0, expanding: false, blockedAt: 0, width: 0, key: '', content: '' });
export function foldReducer(state, action) {
  const max = action.max ?? 0;
  if (action.type === 'measure') {
    if (action.key !== state.key) return { ...FOLD_START, width: state.width, key: action.key, content: action.content };
    if (action.content !== state.content) {
      return { ...state, content: action.content, blockedAt: 0, ...(state.count > 0 ? { count: state.count - 1, expanding: true } : {}) };
    }
    if (action.overflow && state.count < max) {
      return { ...state, count: state.count + 1, expanding: false, blockedAt: state.expanding ? action.width : state.blockedAt };
    }
    if (!action.overflow && state.expanding) {
      return state.count > 0 ? { ...state, count: state.count - 1 } : { ...state, expanding: false };
    }
    return state;
  }
  if (action.type === 'resize') {
    if (action.width === state.width) return state;
    const next = { ...state, width: action.width };
    if (action.width > state.width && state.count > 0 && action.width > state.blockedAt) return { ...next, count: state.count - 1, expanding: true };
    return next;
  }
  return state;
}

const SLACK = 1;
/** Does any group of the bar stick out of the bar, or is the shrinking group (title) squeezed below its content? */
export function barOverflows(header) {
  if (!header?.getBoundingClientRect) return false;
  const box = header.getBoundingClientRect();
  const style = globalThis.getComputedStyle?.(header);
  const left = box.left + (parseFloat(style?.paddingLeft) || 0);
  const right = box.right - (parseFloat(style?.paddingRight) || 0);
  if (header.scrollWidth > header.clientWidth + SLACK) return true;
  for (const group of header.querySelectorAll(':scope > .lr-top__group')) {
    if (group.scrollWidth > group.clientWidth + SLACK && globalThis.getComputedStyle?.(group).overflowX !== 'auto') return true;
    for (const item of group.children) {
      const rect = item.getBoundingClientRect();
      if (!rect.width) continue;
      if (rect.right > right + SLACK || rect.left < left - SLACK) return true;
    }
  }
  return false;
}

/**
 * Folds the bar's steps until it fits. `steps` are the fold steps in order, `content` any string that changes when
 * the bar's buttons change. → a Set of the folded step ids.
 */
export function useTopBarFit(ref, steps, content = '') {
  const max = steps.length;
  const key = steps.join(',');
  const [state, dispatch] = useReducer(foldReducer, FOLD_START);
  // after every render: one more step when the bar still does not fit (layout effects run before the browser paints)
  useLayoutEffect(() => {
    const header = ref.current;
    if (!header) return;
    dispatch({ type: 'measure', overflow: barOverflows(header), width: header.clientWidth, max, key, content });
  });
  useLayoutEffect(() => {
    const header = ref.current;
    const Observer = globalThis.ResizeObserver;
    if (!header || typeof Observer !== 'function') return undefined;
    const observer = new Observer(() => dispatch({ type: 'resize', width: header.clientWidth }));
    observer.observe(header);
    return () => observer.disconnect();
  }, [ref]);
  const count = state.key === key ? Math.min(state.count, max) : 0;
  return useMemo(() => new Set(key ? key.split(',').slice(0, count) : []), [key, count]);
}
