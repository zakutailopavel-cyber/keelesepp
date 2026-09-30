import { useEffect, useRef } from 'react';
import { BLOCKS } from './engine/registry.js';
import { SCHEMA } from './engine/schema.js';

// Undo / redo for the worksheet builder: snapshots of the whole document (documents are small, ≤ 800 KB).
export const HISTORY_LIMIT = 60;

export function emptyHistory() {
  return { past: [], future: [] };
}

// Remember `previous` before a change; a new change clears redo.
export function pushHistory(history, previous) {
  return { past: [...history.past, previous].slice(-HISTORY_LIMIT), future: [] };
}

export function undoHistory(history, current) {
  if (!history.past.length) return null;
  return { doc: history.past.at(-1), history: { past: history.past.slice(0, -1), future: [current, ...history.future] } };
}

export function redoHistory(history, current) {
  if (!history.future.length) return null;
  return { doc: history.future[0], history: { past: [...history.past, current].slice(-HISTORY_LIMIT), future: history.future.slice(1) } };
}

// Typing inside a field keeps the browser's own text undo.
export function isTextTarget(target) {
  const tag = String(target?.tagName || '').toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || Boolean(target?.isContentEditable);
}

/**
 * Asks before an in-app link would drop unsaved work. The builder runs under a plain BrowserRouter
 * (no navigation blocker), so a capture-phase click listener catches the sidebar and "Õppevara" links;
 * reload and tab close are covered by `beforeunload`.
 */
export function useUnsavedGuard(dirty, message = 'Töölehel on salvestamata muudatusi. Kas lahkud ilma salvestamata?') {
  const dirtyRef = useRef(dirty);
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);
  useEffect(() => {
    const onClick = (event) => {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target?.closest?.('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (!window.confirm(message)) { event.preventDefault(); event.stopPropagation(); }
    };
    const onUnload = (event) => { if (dirtyRef.current) { event.preventDefault(); event.returnValue = ''; } };
    document.addEventListener('click', onClick, true);
    window.addEventListener('beforeunload', onUnload);
    return () => { document.removeEventListener('click', onClick, true); window.removeEventListener('beforeunload', onUnload); };
  }, [message]);
}

// A JSON file is opened only when it is a worksheet of this format with known blocks.
export function parseWorksheetFile(text) {
  let parsed;
  try { parsed = JSON.parse(text); } catch { return null; }
  if (!parsed || parsed.schema !== SCHEMA || typeof parsed.meta !== 'object' || !parsed.meta || !Array.isArray(parsed.blocks)) return null;
  if (parsed.blocks.some((block) => !block || typeof block.id !== 'string' || !BLOCKS[block.type])) return null;
  return parsed;
}
