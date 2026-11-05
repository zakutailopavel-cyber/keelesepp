import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Suspense } from 'react';
import { act, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { guardLazyModule, lazyComponent } from './lazyComponent.js';
import { isStaleBuildError } from './staleBuild.js';
import RoomPartBoundary from '../features/live-classroom/RoomPartBoundary.jsx';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function sourceFiles(dir = SRC, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (/\.(jsx?|tsx?)$/.test(entry.name) && !/\.(test|testkit)\./.test(entry.name)) out.push(full);
  }
  return out;
}

// every on-demand component: file → the module it loads
function lazyTargets() {
  const targets = [];
  for (const file of sourceFiles()) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/lazyComponent\(\s*\(\)\s*=>\s*import\(\s*'([^']+)'\s*\)/g)) {
      targets.push({ from: path.relative(SRC, file), target: path.resolve(path.dirname(file), match[1]) });
    }
  }
  return targets;
}

describe('on-demand components (clientErrors 2026-11-04/05: „reading \'default\'” in the room)', () => {
  it('nothing uses React\'s bare lazy — every loader goes through lazyComponent', () => {
    const offenders = sourceFiles()
      .filter((file) => !file.endsWith(`${path.sep}lazyComponent.js`))
      .filter((file) => /\blazy\s*\(/.test(fs.readFileSync(file, 'utf8').replace(/lazyComponent\s*\(/g, '')));
    expect(offenders.map((file) => path.relative(SRC, file))).toEqual([]);
  });

  it('every lazily loaded file has a default export', () => {
    const targets = lazyTargets();
    expect(targets.length).toBeGreaterThan(60);
    const missing = targets.filter(({ target }) => !fs.existsSync(target) || !/export default\b/.test(fs.readFileSync(target, 'utf8')));
    expect(missing).toEqual([]);
  });

  it('the lesson room parts resolve to a component as .default', async () => {
    const room = lazyTargets().filter(({ from }) => /live-classroom|worksheet-studio|board[\\/]/.test(from));
    expect(room.length).toBeGreaterThan(10);
    for (const { target } of room) {
      const module = await import(/* @vite-ignore */ target);
      expect(['function', 'object'], target).toContain(typeof module.default);
      expect(module.default, target).toBeTruthy();
    }
    const { loadLiveRoom } = await import('../features/live-classroom/liveRoomPrefetch.js');
    expect(typeof (await loadLiveRoom()).default).toBe('function');
  }, 60_000);

  it('a module without default fails loudly; an import Vite resolved to undefined waits, then fails as a stale build', async () => {
    const component = () => null;
    const module = { default: component };
    expect(guardLazyModule(module)).toBe(module);
    expect(() => guardLazyModule({ Named: component })).toThrow(/no default export/);
    let fire;
    const pending = guardLazyModule(undefined, { wait: 5, timer: (callback) => { fire = callback; } });
    fire();
    await expect(pending).rejects.toSatisfy((error) => isStaleBuildError(error));
  });

  it('an undefined import (reload under way) keeps the loading state instead of crashing on .default', async () => {
    const Lazy = lazyComponent(() => Promise.resolve(undefined));
    render(<RoomPartBoundary label="Tunniruumi"><Suspense fallback={<p>Laen tunniruumi…</p>}><Lazy /></Suspense></RoomPartBoundary>);
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByText('Laen tunniruumi…')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('a failing room part', () => {
  it('shows „Laadi uuesti” in its place, the rest of the room stays', () => {
    const spy = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
    const reporter = { report: vi.fn() };
    function Broken() { throw new TypeError("Cannot read properties of undefined (reading 'default')"); }
    render(<div>
      <p>Tahvel</p>
      <RoomPartBoundary label="Vihjeid" reporter={reporter}><Broken /></RoomPartBoundary>
    </div>);
    expect(screen.getByText('Tahvel')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Vihjeid ei saanud avada.');
    expect(screen.getByRole('button', { name: 'Laadi uuesti' })).toBeInTheDocument();
    expect(reporter.report).toHaveBeenCalledWith('render', expect.any(TypeError), expect.any(Object));
    spy.mockRestore();
  });

  it('a part of an older build reloads the page on „Laadi uuesti” and is not reported', () => {
    const spy = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
    const reporter = { report: vi.fn() };
    const location = { reload: vi.fn() };
    function Stale() { throw new TypeError('Failed to fetch dynamically imported module: /assets/LessonHints-old.js'); }
    render(<RoomPartBoundary reporter={reporter} location={location}><Stale /></RoomPartBoundary>);
    expect(screen.getByRole('alert')).toHaveTextContent('KeeleSepp uuenes tunni ajal.');
    screen.getByRole('button', { name: 'Laadi uuesti' }).click();
    expect(location.reload).toHaveBeenCalledTimes(1);
    expect(reporter.report).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
