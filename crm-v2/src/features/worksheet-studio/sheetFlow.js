/* global setTimeout, clearTimeout */
import { createContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

// The student's phone and tablet view of a sheet (owner 2026-11-01: „adapt very badly”, a sheet stopped at zoom 0.3 on a
// phone): the same document, the same answers, the blocks in one readable column instead of a shrunken A4 page. A4 stays
// for print, the constructor and the teacher's marking; Sheet.jsx draws the column when it is given `flow`.

// every phone and portrait tablet, a touch tablet also in landscape; a mouse screen of 1024 px or more keeps A4
export const FLOW_QUERY = '(max-width: 1023px), (pointer: coarse) and (max-width: 1366px)';

// A host that decides for itself says so here (Live Classroom: its reading page true, its board with the teacher's
// drawings false, because those lie on the A4 page); null: the screen decides.
export const SheetFlowContext = createContext(null);

const screenMatches = () => Boolean(globalThis.matchMedia?.(FLOW_QUERY)?.matches);

export function useScreenFlow(enabled = true) {
  const [narrow, setNarrow] = useState(screenMatches);
  // printing from a phone still gives A4 pages: the page is redrawn before the browser takes it
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    if (!enabled) return undefined;
    const query = globalThis.matchMedia?.(FLOW_QUERY);
    const change = () => setNarrow(Boolean(query?.matches));
    change();
    query?.addEventListener?.('change', change);
    const before = () => flushSync(() => setPrinting(true));
    const after = () => setPrinting(false);
    globalThis.addEventListener?.('beforeprint', before);
    globalThis.addEventListener?.('afterprint', after);
    return () => {
      query?.removeEventListener?.('change', change);
      globalThis.removeEventListener?.('beforeprint', before);
      globalThis.removeEventListener?.('afterprint', after);
    };
  }, [enabled]);
  return enabled && narrow && !printing;
}

const FIELD = 'input:not([type=checkbox]):not([type=radio]), textarea, select';
const isField = (el) => Boolean(el?.matches?.(FIELD));

function scrollParentOf(el) {
  for (let node = el?.parentElement; node; node = node.parentElement) {
    const overflow = globalThis.getComputedStyle?.(node)?.overflowY;
    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollHeight > node.clientHeight) return node;
  }
  return globalThis.document?.scrollingElement || null;
}

// How far to scroll so that a field stands in the part of the screen the keyboard leaves free. Pure, tested.
// A field taller than that part (a long text) shows its top; the sticky progress line covers `reserve` px at the top.
export function revealDelta(field, area, reserve = 44) {
  const top = area.top + reserve;
  const bottom = area.bottom - 8;
  if (field.top >= top && field.bottom <= bottom) return 0;
  if (field.bottom - field.top >= bottom - top) return field.top - top;
  return (field.top + field.bottom) / 2 - (top + bottom) / 2;
}

export function revealField(el, viewport = globalThis.visualViewport) {
  const scroller = scrollParentOf(el);
  if (!el?.getBoundingClientRect || !scroller?.getBoundingClientRect) return 0;
  const box = scroller.getBoundingClientRect();
  const isPage = scroller === globalThis.document?.scrollingElement;
  const screenTop = viewport ? viewport.offsetTop : 0;
  const screenBottom = viewport ? viewport.offsetTop + viewport.height : globalThis.innerHeight;
  const area = { top: isPage ? screenTop : Math.max(box.top, screenTop), bottom: isPage ? screenBottom : Math.min(box.bottom, screenBottom) };
  const delta = revealDelta(el.getBoundingClientRect(), area);
  if (delta) scroller.scrollBy?.({ top: delta });
  return delta;
}

// While a sheet is open in the column: the part of the window the on-screen keyboard leaves free is given to the layout
// (--ws-vv-h, --ws-vv-top), the field being typed in is scrolled into it, and html.ws-flow-typing tells the layout to
// put the buttons away until the keyboard closes.
export function useFlowKeyboard(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const root = globalThis.document?.documentElement;
    const viewport = globalThis.visualViewport;
    if (!root) return undefined;
    let timer;
    const measure = () => {
      if (!viewport) return false;
      // a two-finger zoom shrinks the visual viewport too: that is not the keyboard
      if (viewport.scale > 1.01) { root.style.removeProperty('--ws-vv-h'); root.style.removeProperty('--ws-vv-top'); return false; }
      root.style.setProperty('--ws-vv-h', `${Math.round(viewport.height)}px`);
      root.style.setProperty('--ws-vv-top', `${Math.round(viewport.offsetTop)}px`);
      return globalThis.innerHeight - viewport.height > 120;
    };
    const update = () => {
      const open = measure();
      const active = globalThis.document.activeElement;
      root.classList.toggle('ws-flow-typing', open && isField(active));
      if (open && isField(active)) revealField(active, viewport);
    };
    const focused = (event) => {
      if (!isField(event.target)) return;
      clearTimeout(timer);
      // after the keyboard has come up (no resize at all when it was already open, or on a laptop's touch screen)
      timer = setTimeout(() => { update(); revealField(event.target, viewport); }, 320);
    };
    const blurred = () => { clearTimeout(timer); timer = setTimeout(update, 120); };
    update();
    viewport?.addEventListener?.('resize', update);
    viewport?.addEventListener?.('scroll', measure);
    globalThis.document.addEventListener('focusin', focused);
    globalThis.document.addEventListener('focusout', blurred);
    return () => {
      clearTimeout(timer);
      viewport?.removeEventListener?.('resize', update);
      viewport?.removeEventListener?.('scroll', measure);
      globalThis.document.removeEventListener('focusin', focused);
      globalThis.document.removeEventListener('focusout', blurred);
      root.classList.remove('ws-flow-typing');
      root.style.removeProperty('--ws-vv-h');
      root.style.removeProperty('--ws-vv-top');
    };
  }, [enabled]);
}

// Enter in a short answer goes to the next answer of the sheet (the keyboard's „next” key on a phone)
export function focusNextField(event) {
  if (event.key !== 'Enter' || event.isComposing || !event.target?.matches?.('input:not([type=checkbox])')) return;
  const fields = [...event.currentTarget.querySelectorAll('input:not([type=checkbox]):not([readonly]), textarea:not([readonly]), select')];
  const next = fields[fields.indexOf(event.target) + 1];
  if (!next) return;
  event.preventDefault();
  next.focus();
}
