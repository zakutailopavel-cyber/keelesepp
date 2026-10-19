import { render, screen } from '@testing-library/react';
import { createBlock } from '../registry.js';
import Sheet from '../Sheet.jsx';
import { sampleDocument } from '../sample.js';
import { chartRows, chartScale, chartSeries, niceMax } from './chartModel.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
const doc = (blocks) => ({ ...sampleDocument(), blocks });

describe('chart (data diagram for a Harno C1 summary)', () => {
  it('reads series and rows, a decimal comma and a missing value', () => {
    const data = { series: 'Paber, E-raamat', rows: '2015 | 62 | 8,5\n2020 | 55\n\n2025 | x | 22' };
    expect(chartSeries(data)).toEqual(['Paber', 'E-raamat']);
    expect(chartRows(data)).toEqual([
      { label: '2015', values: [62, 8.5] },
      { label: '2020', values: [55, null] },
      { label: '2025', values: [null, 22] },
    ]);
    expect(chartScale(data).top).toBe(100);
    expect([niceMax(7), niceMax(18), niceMax(0)]).toEqual([10, 20, 1]);
  });

  it('draws bars with their values, a legend and the source; a line chart draws one line per series', () => {
    const bar = createBlock('chart');
    const { container, rerender } = render(<Sheet doc={doc([bar])} mode="print" />);
    expect(container.querySelectorAll('.ws-root > .ws-page .ws-chart-svg rect')).toHaveLength(9);
    expect(screen.getAllByText('Paberraamat').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/väljamõeldud näidisandmed/).length).toBeGreaterThan(0);
    expect(container.querySelector('.ws-chart-svg').getAttribute('aria-label')).toMatch(/2015 Paberraamat 62 %/);
    const line = { ...bar, data: { ...bar.data, kind: 'line' } };
    rerender(<Sheet doc={doc([line])} mode="print" />);
    expect(container.querySelectorAll('.ws-root > .ws-page .ws-chart-svg polyline')).toHaveLength(3);
  });
});
