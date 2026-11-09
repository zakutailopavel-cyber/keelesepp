import { useCallback, useEffect, useRef, useState } from 'react';

// The desktop side menu can shrink to an icon rail (owner 2026-11-09: „more screen”). The choice is kept per device;
// hovering / focusing the rail for a moment slides the full menu out over the page (no layout shift).
// Phones (≤ 800 px, the breakpoint of index.css) keep the off-canvas menu: nothing here applies there.
export const SIDEBAR_STORAGE_KEY = 'keelesepp.sidebar';
export const DESKTOP_QUERY = '(min-width: 801px)';
export const PEEK_DELAY_MS = 140;
// without a saved choice: a laptop-size window (≤ 1280 px) starts with the rail, a wide screen with the full menu
const COLLAPSED_BELOW_PX = 1280;

function readStored() {
  try {
    const value = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return value === 'collapsed' || value === 'expanded' ? value : null;
  } catch { return null; }
}

function writeStored(value) {
  try { window.localStorage.setItem(SIDEBAR_STORAGE_KEY, value); } catch { /* private mode: the choice lasts for this visit */ }
}

function desktopNow() {
  try { return typeof window.matchMedia === 'function' ? window.matchMedia(DESKTOP_QUERY).matches : true; } catch { return true; }
}

export function initialCollapsed() {
  const stored = readStored();
  if (stored) return stored === 'collapsed';
  return typeof window !== 'undefined' && window.innerWidth > 0 && window.innerWidth < COLLAPSED_BELOW_PX;
}

function typingTarget(target) {
  return Boolean(target?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]'));
}

export default function useSidebarRail() {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [desktop, setDesktop] = useState(desktopNow);
  const [peek, setPeek] = useState(false);
  const timer = useRef(null);
  // after Esc or a click on a menu item the menu stays shut until the pointer / focus has left it once
  const held = useRef(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const query = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(query.matches);
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  const clearTimer = () => { if (timer.current) { window.clearTimeout(timer.current); timer.current = null; } };
  useEffect(() => clearTimer, []);

  const rail = collapsed && desktop;

  const toggle = useCallback(() => {
    clearTimer();
    setPeek(false);
    setCollapsed((was) => {
      const next = !was;
      writeStored(next ? 'collapsed' : 'expanded');
      return next;
    });
  }, []);

  // „[” switches the menu, as in many editors (not while typing, not with a modifier)
  useEffect(() => {
    if (!desktop) return undefined;
    const onKey = (event) => {
      if (event.key !== '[' || event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return;
      if (typingTarget(event.target)) return;
      event.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [desktop, toggle]);

  const open = () => {
    if (!rail || held.current || peek || timer.current) return;
    timer.current = window.setTimeout(() => { timer.current = null; setPeek(true); }, PEEK_DELAY_MS);
  };
  const close = () => { clearTimer(); setPeek(false); };
  const release = () => { held.current = false; close(); };
  const shut = () => { held.current = true; close(); };

  const handlers = rail ? {
    onMouseEnter: open,
    onMouseLeave: release,
    onFocus: open,
    onBlur: (event) => { if (!event.currentTarget.contains(event.relatedTarget)) release(); },
    onKeyDown: (event) => { if (event.key === 'Escape' && (peek || timer.current)) { event.stopPropagation(); shut(); } },
  } : {};

  return { collapsed, rail, peek: rail && peek, toggle, handlers, onNavigate: rail ? shut : undefined };
}
