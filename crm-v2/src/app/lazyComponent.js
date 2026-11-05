import { lazy } from 'react';

// Every on-demand component of the CRM goes through here instead of React's bare `lazy` (lazyComponent.test.js keeps
// it that way).
//
// Why: after a deploy an open tab asks for a file of the old build that is gone. main.jsx then reloads the page once
// and calls `preventDefault()` on Vite's `vite:preloadError` — and Vite resolves that import with `undefined` instead
// of rejecting. React's `lazy` then crashes on `undefined.default` („Cannot read properties of undefined (reading
// 'default')” / „g._result.default”, clientErrors 2026-11-04/05: the room and the observer page) before the reload
// lands. Here such an import waits for the reload (the loading state stays on screen) and, if the page is still there
// after RELOAD_WAIT_MS, fails as a stale-build error, which the error boundaries recognise.
export const RELOAD_WAIT_MS = 10_000;

export function guardLazyModule(module, { wait = RELOAD_WAIT_MS, timer = globalThis.setTimeout } = {}) {
  if (module && module.default) return module;
  if (module == null) {
    return new Promise((_resolve, reject) => {
      timer(() => reject(new Error('Failed to fetch dynamically imported module: a new KeeleSepp version is loading')), wait);
    });
  }
  throw new Error('The on-demand module has no default export');
}

export function lazyComponent(loader) {
  return lazy(() => Promise.resolve(loader()).then((module) => guardLazyModule(module)));
}
