import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AreaComparisonChart from './AreaComparisonChart.jsx';
import MetricCard, { DeltaChip, MoneyValue } from './MetricCard.jsx';
import Sparkline from './Sparkline.jsx';
import UPlotComparisonChart from './UPlotComparisonChart.jsx';
import { uplotData, uplotOptions, withAlpha } from './uplotOptions.js';
import { niceTicks, smoothPath } from './chartPath.js';
import { formatMoney, formatMoneyShort, moneyParts } from './format.js';

const NBSP = ' ';

describe('money format', () => {
  it('groups thousands always (Intl et-EE leaves 1234 ungrouped) and puts the euro sign after', () => {
    expect(formatMoney(123456)).toBe(`1${NBSP}234,56${NBSP}€`);
    expect(formatMoney(12345678)).toBe(`123${NBSP}456,78${NBSP}€`);
    expect(formatMoney(0)).toBe(`0,00${NBSP}€`);
    expect(formatMoney(-2550)).toBe(`−25,50${NBSP}€`);
    expect(formatMoney(123456, { decimals: 0 })).toBe(`1${NBSP}235${NBSP}€`);
    expect(moneyParts(99)).toEqual({ sign: '', number: '0,99', symbol: '€' });
  });

  it('axis labels are short', () => {
    expect(formatMoneyShort(250000)).toBe(`2,5k${NBSP}€`);
    expect(formatMoneyShort(400000)).toBe(`4k${NBSP}€`);
    expect(formatMoneyShort(1500000)).toBe(`15k${NBSP}€`);
    expect(formatMoneyShort(9900)).toBe(`99${NBSP}€`);
  });
});

describe('chart helpers', () => {
  it('gridlines go up in round steps past the maximum', () => {
    expect(niceTicks(387000, 3)).toEqual([0, 200000, 400000]);
    expect(niceTicks(155500, 3)).toEqual([0, 100000, 200000]);
    expect(niceTicks(0, 3)).toEqual([0, 0.5, 1]);
  });

  it('a smooth line passes through every point and never overshoots a flat stretch', () => {
    const d = smoothPath([[0, 10], [10, 10], [20, 0]]);
    expect(d.startsWith('M0,10')).toBe(true);
    expect(d).toContain(' 10,10');
    expect(d.endsWith('20,0')).toBe(true);
    // the flat part keeps its y (tangent 0 where the slope changes sign or is 0)
    expect(d.split(' C')[1]).toMatch(/,10 /);
  });
});

const points = [
  { key: 'a', label: '1. nov', longLabel: '1. november', value: 0, compare: 1000 },
  { key: 'b', label: '2. nov', longLabel: '2. november', value: 5000, compare: 3000 },
  { key: 'c', label: '3. nov', longLabel: '3. november', value: 5000, compare: 9000 },
];

describe('AreaComparisonChart', () => {
  it('is an image with a name and every point in a hidden table; a future point has no value', () => {
    const { container } = render(<AreaComparisonChart points={points} currentUntil={1} ariaLabel="Laekunud november" valueLabel="november" compareLabel="oktoober" formatValue={(v) => `${v / 100} €`} />);
    expect(screen.getByRole('img', { name: 'Laekunud november' })).toBeInTheDocument();
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(4);
    expect(within(rows[2]).getByText('50 €')).toBeInTheDocument();
    expect(within(rows[3]).getByText('—')).toBeInTheDocument();
    expect(within(rows[3]).getByText('90 €')).toBeInTheDocument();
    // the line stops at today: two points of this period, three of the period before
    expect(container.querySelector('.ac-chart__line')).toBeInTheDocument();
    expect(container.querySelector('.ac-chart__compare')).toBeInTheDocument();
  });

  it('the arrow keys move a crosshair and say the point aloud', () => {
    const { container } = render(<AreaComparisonChart points={points} currentUntil={2} valueLabel="november" compareLabel="oktoober" formatValue={(v) => `${v / 100} €`} />);
    const plot = screen.getByRole('group');
    expect(plot).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(plot, { key: 'Home' });
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('1. november, november 0 €, oktoober 10 €');
    fireEvent.keyDown(plot, { key: 'ArrowRight' });
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('2. november, november 50 €, oktoober 30 €');
    expect(container.querySelector('.ac-chart__cross')).toBeInTheDocument();
    fireEvent.keyDown(plot, { key: 'Escape' });
    expect(container.querySelector('.ac-chart__cross')).not.toBeInTheDocument();
  });

  it('draws nothing broken without points', () => {
    render(<AreaComparisonChart points={[]} ariaLabel="Tühi" />);
    expect(screen.getByRole('img', { name: 'Tühi' })).toBeInTheDocument();
  });
});

describe('metric card pieces', () => {
  it('the sparkline says its values', () => {
    render(<Sparkline values={[100, 200, 300]} label="Arveldatud" formatValue={(v) => `${v}`} />);
    expect(screen.getByRole('img', { name: 'Arveldatud: 100, 200, 300' })).toBeInTheDocument();
  });

  it('the delta chip shows direction in words and colours only meaning', () => {
    const { container, rerender } = render(<DeltaChip percent={12} good="up" />);
    expect(container.firstChild).toHaveClass('delta-chip--good');
    expect(container.firstChild).toHaveTextContent('kasv 12');
    rerender(<DeltaChip percent={12} good="down" />);
    expect(container.firstChild).toHaveClass('delta-chip--bad');
    rerender(<DeltaChip percent={-4} good={null} />);
    expect(container.firstChild).toHaveClass('delta-chip--neutral');
    expect(container.firstChild).toHaveTextContent('langus 4');
    rerender(<DeltaChip percent={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('a card: title, value with a lighter euro sign, caption, „Vaata”', () => {
    const onView = vi.fn();
    const { container } = render(<MetricCard title="Arveldatud" cents={529000} delta={15} caption="31 arvet" trend={[1, 2, 3]} onView={onView} viewHint="Vaata perioodi arveid" />);
    expect(screen.getByRole('heading', { name: 'Arveldatud' })).toBeInTheDocument();
    expect(container.querySelector('.money-value__number').textContent).toBe(`5${NBSP}290,00`);
    expect(container.querySelector('.money-value__symbol')).toHaveTextContent('€');
    expect(screen.getByText('31 arvet')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Vaata perioodi arveid' }));
    expect(onView).toHaveBeenCalled();
  });

  it('MoneyValue keeps the minus sign', () => {
    const { container } = render(<MoneyValue cents={-100} />);
    expect(container.textContent).toBe(`−1,00${NBSP}€`);
  });
});

describe('uPlot headline chart', () => {
  it('data: this period stops at today, the period before keeps going', () => {
    expect(uplotData(points, 1)).toEqual([[0, 1, 2], [0, 5000, null], [1000, 3000, 9000]]);
  });

  it('extra lines of this period (Ülekanded / Sularaha): own columns, own token colour, stop at today', () => {
    const split = points.map((point, index) => ({ ...point, transfer: index * 1000, cash: 500 }));
    const series = [{ key: 'transfer', label: 'Ülekanded', tone: 'transfer' }, { key: 'cash', label: 'Sularaha', tone: 'cash' }];
    expect(uplotData(split, 1, series).slice(3)).toEqual([[0, 1000, null], [500, 500, null]]);
    const options = uplotOptions({ points: split, currentUntil: 1, series, colors: { line: '#087e6b', compare: '#98a2b3', transfer: '#175cd3', cash: '#b54708', axis: '#667085', surface: '#fff' } });
    expect(options.series).toHaveLength(5);
    expect(options.series[3]).toMatchObject({ label: 'Ülekanded', stroke: '#175cd3' });
    expect(options.series[4]).toMatchObject({ label: 'Sularaha', stroke: '#b54708' });
    expect(options.series[3].fill).toBeUndefined();
  });

  it('options: token colours, round gridlines, labelled ticks, the end point only, dashed comparison', () => {
    const spline = vi.fn(() => 'spline-path');
    const options = uplotOptions({ points, currentUntil: 1, width: 500, height: 200, tickIndexes: [0, 2], formatAxis: (v) => `${v / 100} €`, colors: { line: '#087e6b', compare: '#98a2b3', grid: '#eef0f3', axis: '#667085', surface: '#fff' }, spline });
    expect(options.width).toBe(500);
    expect(options.legend.show).toBe(false);
    expect(options.scales.y.range).toEqual([0, 10000]);
    expect(options.axes[1].splits()).toEqual([0, 5000, 10000]);
    expect(options.axes[1].values(null, [0, 5000])).toEqual(['0 €', '50 €']);
    expect(options.axes[0].values(null, options.axes[0].splits())).toEqual(['1. nov', '3. nov']);
    expect(options.axes[1].grid.stroke).toBe('#eef0f3');
    expect(options.series[1]).toMatchObject({ stroke: '#087e6b', width: 2, fill: 'rgba(8,126,107,0.09)', paths: 'spline-path' });
    // today's dot is drawn on the canvas at the last point of this period
    const ctx = { save: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(), stroke: vi.fn(), restore: vi.fn() };
    options.hooks.draw[0]({ ctx, valToPos: (value, scale) => (scale === 'x' ? value * 100 : value / 100) });
    expect(ctx.arc).toHaveBeenCalledWith(100, 50, expect.any(Number), 0, Math.PI * 2);
    expect(options.series[2]).toMatchObject({ stroke: '#98a2b3', dash: [4, 4] });
  });

  it('alpha of hex and rgb token values', () => {
    expect(withAlpha('#6ac9b4', 0.1)).toBe('rgba(106,201,180,0.1)');
    expect(withAlpha('#fff', 0.5)).toBe('rgba(255,255,255,0.5)');
    expect(withAlpha('rgb(8, 126, 107)', 0.2)).toBe('rgba(8,126,107,0.2)');
  });

  it('without a canvas (tests, old devices) the SVG chart stands in, with the same accessible parts', () => {
    render(<UPlotComparisonChart points={points} currentUntil={1} ariaLabel="Laekunud" valueLabel="november" compareLabel="oktoober" formatValue={(v) => `${v / 100} €`} />);
    expect(screen.getByRole('img', { name: 'Laekunud' }).tagName.toLowerCase()).toBe('svg');
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(4);
  });
});
