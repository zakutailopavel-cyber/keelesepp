// The options and data of the headline chart drawn by uPlot (UPlotComparisonChart.jsx). Pure: no uPlot import, so it is
// tested without a canvas. Colours come in from the CSS tokens (read by the component with getComputedStyle).
import { niceTicks } from './chartPath.js';

// a hex or rgb() colour with an alpha, for the area under the line (canvas has no color-mix)
export function withAlpha(color, alpha) {
  const value = String(color || '').trim();
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const digits = hex[1].length === 3 ? hex[1].split('').map((d) => d + d).join('') : hex[1];
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16));
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const rgb = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const [r, g, b] = rgb[1].split(/[\s,/]+/).filter(Boolean);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return value || `rgba(8,126,107,${alpha})`;
}

// [x, this period (null after today), the period before]
export function uplotData(points = [], currentUntil = points.length - 1) {
  return [
    points.map((_, index) => index),
    points.map((point, index) => (index <= currentUntil ? point.value || 0 : null)),
    points.map((point) => (point.compare === null || point.compare === undefined ? null : point.compare)),
  ];
}

// the uPlot options; `colors` = { line, compare, grid, axis, surface }, `spline` = uPlot.paths.spline (optional)
export function uplotOptions({ points = [], currentUntil = points.length - 1, width = 640, height = 220, tickIndexes, formatAxis = String, colors = {}, spline, onCursor, valueLabel = 'See periood', compareLabel = 'Eelmine periood' }) {
  const max = Math.max(1, ...points.map((point) => Math.max(point.value || 0, point.compare || 0)));
  const ticks = niceTicks(max, 3);
  const top = ticks[ticks.length - 1];
  const labels = tickIndexes || (points.length > 2 ? [0, Math.floor((points.length - 1) / 2), points.length - 1] : points.map((_, index) => index));
  const axisSize = Math.max(40, ...ticks.map((tick) => String(formatAxis(tick)).length * 6.6 + 14));
  const font = '11px "DM Sans", system-ui, sans-serif';
  const last = Math.min(currentUntil, points.length - 1);
  const path = spline ? spline() : undefined;
  return {
    width, height,
    padding: [12, 28, 0, 0],
    legend: { show: false },
    cursor: { x: true, y: false, drag: { x: false, y: false, setScale: false }, points: { size: 9, width: 2, fill: colors.surface || '#fff' } },
    select: { show: false },
    scales: { x: { time: false, range: [0, Math.max(1, points.length - 1)] }, y: { range: [0, top] } },
    axes: [
      { stroke: colors.axis, font, size: 28, gap: 6, grid: { show: false }, ticks: { show: false }, splits: () => labels, values: (_, splits) => splits.map((index) => points[index]?.label ?? '') },
      { stroke: colors.axis, font, size: axisSize, gap: 8, grid: { stroke: colors.grid, width: 1 }, ticks: { show: false }, splits: () => ticks, values: (_, splits) => splits.map((value) => formatAxis(value)) },
    ],
    series: [
      {},
      { label: valueLabel, stroke: colors.line, width: 2, fill: withAlpha(colors.line, 0.09), paths: path, spanGaps: false, points: { show: false, size: 9, width: 2, stroke: colors.line, fill: colors.surface } },
      { label: compareLabel, stroke: colors.compare, width: 1.5, dash: [4, 4], paths: path, points: { show: false } },
    ],
    hooks: {
      // today's point: a filled dot with a ring of the card colour where this period's line stops
      draw: [(u) => {
        if (last < 0 || !u.ctx || typeof u.valToPos !== 'function') return;
        const ratio = globalThis.devicePixelRatio || 1;
        const cx = u.valToPos(last, 'x', true);
        const cy = u.valToPos(points[last].value || 0, 'y', true);
        u.ctx.save();
        u.ctx.setLineDash?.([]); // the dashed comparison line leaves its dash on the context
        u.ctx.beginPath();
        u.ctx.arc(cx, cy, 4 * ratio, 0, Math.PI * 2);
        u.ctx.fillStyle = colors.line;
        u.ctx.lineWidth = 2 * ratio;
        u.ctx.strokeStyle = colors.surface;
        u.ctx.fill();
        u.ctx.stroke();
        u.ctx.restore();
      }],
      ...(onCursor ? { setCursor: [(u) => onCursor(u.cursor.idx ?? null, u)] } : {}),
    },
  };
}
