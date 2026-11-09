import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { prefetchAppShell, shellPrefetchMode } from './shellPrefetch.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const flush = () => new Promise((resolve) => { globalThis.setTimeout(resolve, 0); });

function fakeWindow(pathname, { readyState = 'complete', idle = true } = {}) {
  const listeners = {};
  return {
    location: { pathname },
    document: { readyState },
    requestIdleCallback: idle ? vi.fn((fn) => fn()) : undefined,
    setTimeout: vi.fn((fn) => fn()),
    addEventListener: vi.fn((type, fn) => { listeners[type] = fn; }),
    fire: (type) => listeners[type]?.(),
  };
}

describe('shellPrefetch', () => {
  it('signed-in addresses load the shell at once, sign-in pages when idle, public links never', () => {
    ['/', '/student', '/parent', '/calendar', '/students/abc', '/live-classroom'].forEach((p) => expect(shellPrefetchMode(p), p).toBe('now'));
    ['/login', '/registreeru', '/login/'].forEach((p) => expect(shellPrefetchMode(p), p).toBe('idle'));
    ['/maksa/inv1', '/tund/tok', '/ajad', '/kontroll', '/maksuandmed/t', '/e-kirjad/t', '/forbidden', '/register'].forEach((p) => expect(shellPrefetchMode(p), p).toBe('none'));
  });

  it('every path outside the shell in routes.jsx is known here', () => {
    const routes = fs.readFileSync(path.join(HERE, 'routes.jsx'), 'utf8');
    const outside = [...routes.matchAll(/<Route path="(\/[^"]+)"/g)].map((match) => match[1].replace(/:[a-zA-Z]+/g, 'x'));
    expect(outside.length).toBeGreaterThan(8);
    outside.forEach((p) => expect(shellPrefetchMode(p), p).not.toBe('now'));
  });

  it('loads now on a signed-in address and swallows a failed download', async () => {
    const load = vi.fn(() => Promise.reject(new Error('offline')));
    expect(prefetchAppShell(fakeWindow('/student'), load)).toBe('now');
    await flush();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('on /login waits for the page load, then idle time', async () => {
    const load = vi.fn(() => Promise.resolve({}));
    const win = fakeWindow('/login', { readyState: 'loading', idle: false });
    prefetchAppShell(win, load);
    await flush();
    expect(load).not.toHaveBeenCalled();
    win.fire('load');
    await flush();
    expect(win.setTimeout).toHaveBeenCalled();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('a public link does not load the shell', async () => {
    const load = vi.fn();
    prefetchAppShell(fakeWindow('/maksa/inv1'), load);
    await flush();
    expect(load).not.toHaveBeenCalled();
  });
});
