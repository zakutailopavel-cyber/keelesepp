import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PageErrorBoundary from './PageErrorBoundary.jsx';
import { isStaleBuildError, reloadOnceForNewBuild } from './staleBuild.js';

const memory = () => { const data = new Map(); return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; };

describe('a page of an older build after a deploy', () => {
  it('recognises a missing page file and reloads only once', () => {
    expect(isStaleBuildError(new TypeError('Failed to fetch dynamically imported module: https://crm.epkoolitus.ee/assets/LessonWorksheetStudioPage-abc.js'))).toBe(true);
    expect(isStaleBuildError(new Error('Cannot read properties of undefined'))).toBe(false);
    const storage = memory();
    const location = { reload: vi.fn() };
    expect(reloadOnceForNewBuild(storage, location, 1000)).toBe(true);
    expect(reloadOnceForNewBuild(storage, location, 5000)).toBe(false);
    expect(location.reload).toHaveBeenCalledTimes(1);
    expect(reloadOnceForNewBuild(storage, location, 60000)).toBe(true);
  });

  it('shows a message instead of a blank screen when a page throws', () => {
    const spy = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
    function Broken() { throw new Error('Plokk on vigane'); }
    render(<PageErrorBoundary><Broken /></PageErrorBoundary>);
    expect(screen.getByRole('alert')).toHaveTextContent('Lehte ei saanud avada');
    expect(screen.getByRole('alert')).toHaveTextContent('Plokk on vigane');
    spy.mockRestore();
  });
});
