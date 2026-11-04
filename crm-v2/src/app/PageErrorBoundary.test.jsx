import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PageErrorBoundary from './PageErrorBoundary.jsx';

function Broken() { throw new TypeError('Cannot read properties of undefined'); }

describe('PageErrorBoundary', () => {
  it('shows the message and reports the crash as „render”', () => {
    const reporter = { report: vi.fn() };
    const quiet = vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
    render(<PageErrorBoundary reporter={reporter}><Broken /></PageErrorBoundary>);
    quiet.mockRestore();
    expect(screen.getByText('Lehte ei saanud avada')).toBeInTheDocument();
    expect(reporter.report).toHaveBeenCalledTimes(1);
    expect(reporter.report.mock.calls[0][0]).toBe('render');
    expect(reporter.report.mock.calls[0][1]).toBeInstanceOf(TypeError);
  });
});
