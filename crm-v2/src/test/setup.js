import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Node 26 has its own experimental global localStorage (undefined without --localstorage-file) that hides jsdom's
// storage: tests use the page's storage, as the browser does (CI runs Node 24, where this changes nothing)
if (typeof window !== 'undefined' && window.document) {
  for (const name of ['localStorage', 'sessionStorage']) {
    let storage = null;
    try { storage = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window), name)?.get?.call(window) || null; } catch { storage = null; }
    if (!storage) {
      const data = new Map();
      storage = { getItem: (k) => (data.has(String(k)) ? data.get(String(k)) : null), setItem: (k, v) => data.set(String(k), String(v)), removeItem: (k) => data.delete(String(k)), clear: () => data.clear(), key: (i) => [...data.keys()][i] ?? null, get length() { return data.size; } };
    }
    if (globalThis[name] !== storage) {
      try { Object.defineProperty(globalThis, name, { value: storage, configurable: true, writable: true }); } catch { /* the environment keeps its own */ }
    }
  }
}

// Keep each jsdom test isolated. Several page suites render the same controls,
// so retaining a prior document makes accessible queries target stale UI.
afterEach(() => {
  cleanup();
});

// Tests never call our production servers (2026-10-14: every test run woke the live TURN function in production —
// 600 requests a night in its log). A request to a Cloud Function, Firebase or another real host fails fast instead;
// tests that need a server pass a fake service or stub fetch themselves.
const realFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = String(input?.url || input || '');
  if (/^https?:\/\//i.test(url) && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(url)) {
    return Promise.reject(new Error(`Tests must not call ${url.replace(/\?.*$/, '')}`));
  }
  return realFetch ? realFetch(input, init) : Promise.reject(new Error('fetch unavailable'));
};
