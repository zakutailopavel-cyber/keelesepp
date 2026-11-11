/* global localStorage */
import { useEffect } from 'react';
import { FLOW_QUERY } from '../sheetFlow.js';

// The constructor on a tablet (owner 2026-11-11: „editing the Õpik is awkward in the Õpik tab, especially on a tablet”).
// A finger, no hover, an on-screen keyboard over the lower ~40 % of the screen.

// a tablet or a narrow window: the block drawer starts closed (the page gets the width) and a block's settings open as a
// sheet at the bottom of the screen instead of floating beside the page
export const TABLET_QUERY = '(max-width: 1180px), (pointer: coarse)';
const COLUMN_KEY = 'ks-studio-column';

export const screenMatches = (query) => Boolean(globalThis.matchMedia?.(query)?.matches);

// „Suur tekst”: the sheet as one column at its real text size instead of the A4 page shrunk to the screen. The teacher's
// own choice is remembered in this browser; without one a touch tablet (and any screen under 1024 px) starts with it.
export function initialColumnView() {
  try {
    const stored = localStorage.getItem(COLUMN_KEY);
    if (stored === 'on' || stored === 'off') return stored === 'on';
  } catch { /* storage may be disabled */ }
  return screenMatches(FLOW_QUERY);
}
export function rememberColumnView(on) {
  try { localStorage.setItem(COLUMN_KEY, on ? 'on' : 'off'); } catch { /* storage may be disabled */ }
}

// How much of the window's bottom the on-screen keyboard covers (0 without one): the layout viewport's height minus the
// visible part. A browser without visualViewport reports 0.
export function keyboardInset(view = globalThis.visualViewport, innerHeight = globalThis.innerHeight) {
  if (!view || !innerHeight) return 0;
  return Math.max(0, Math.round(innerHeight - view.height - (view.offsetTop || 0)));
}

const EDITABLE = 'input, textarea, select, [contenteditable], [contenteditable] *';

// Keeps the field being typed in above the keyboard: `--st-kb` (px) on the studio lifts the bottom sheet over the
// keyboard, and a focused field the keyboard covers is scrolled into the visible part.
// `ready`: the studio's element exists (it is drawn once the sheet has loaded)
export function useKeyboardSafeArea(rootRef, ready = true) {
  useEffect(() => {
    const view = globalThis.visualViewport;
    const root = rootRef.current;
    if (!view || !root) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const inset = keyboardInset(view);
      root.style.setProperty('--st-kb', `${inset}px`);
      root.classList.toggle('has-keyboard', inset > 80);
      const active = globalThis.document?.activeElement;
      if (!inset || !active?.matches?.(EDITABLE)) return;
      const box = active.getBoundingClientRect();
      const visibleBottom = (view.offsetTop || 0) + view.height;
      if (box.bottom > visibleBottom - 8 || box.top < (view.offsetTop || 0)) active.scrollIntoView?.({ block: 'center' });
    };
    const schedule = () => { if (!frame) frame = globalThis.requestAnimationFrame?.(update) || (update(), 0); };
    view.addEventListener('resize', schedule);
    view.addEventListener('scroll', schedule);
    globalThis.document?.addEventListener('focusin', schedule);
    update();
    return () => {
      view.removeEventListener('resize', schedule);
      view.removeEventListener('scroll', schedule);
      globalThis.document?.removeEventListener('focusin', schedule);
      if (frame) globalThis.cancelAnimationFrame?.(frame);
    };
  }, [rootRef, ready]);
}
