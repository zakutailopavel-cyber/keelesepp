// Small chart helpers shared by the SVG charts (components/charts) and the finance „Ülevaade” (features/finance).
// No chart library: a scale, a round top, a smooth line.

// a round top for a chart's scale (e.g. 3 870 € → 4 000 €)
export function niceMax(value) {
  const top = Math.max(1, Number(value) || 0);
  const step = 10 ** Math.floor(Math.log10(top));
  return [1, 2, 2.5, 5, 10].map((k) => k * step).find((candidate) => candidate >= top) || 10 * step;
}

// gridline values from 0 in round steps (1, 2, 2.5 or 5 × 10ⁿ), about `count` of them, the last at or above `max`
export function niceTicks(max, count = 4) {
  const top = Math.max(1, Number(max) || 0);
  const rough = top / Math.max(1, count);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * magnitude).find((candidate) => candidate >= rough) || 10 * magnitude;
  const steps = Math.max(1, Math.ceil(top / step));
  return Array.from({ length: steps + 1 }, (_, index) => index * step);
}

// a smooth line through the points that never overshoots (monotone cubic, Fritsch–Carlson): money never dips below 0
export function smoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M${points[0][0]},${points[0][1]}`;
  const n = points.length;
  const dx = []; const slope = [];
  for (let i = 0; i < n - 1; i += 1) { dx[i] = points[i + 1][0] - points[i][0]; slope[i] = dx[i] ? (points[i + 1][1] - points[i][1]) / dx[i] : 0; }
  const tangent = [slope[0]];
  for (let i = 1; i < n - 1; i += 1) tangent[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / slope[i - 1] + (dx[i] + 2 * dx[i - 1]) / slope[i]);
  tangent[n - 1] = slope[n - 2];
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < n - 1; i += 1) {
    const h = dx[i] / 3;
    d += ` C${points[i][0] + h},${points[i][1] + h * tangent[i]} ${points[i + 1][0] - h},${points[i + 1][1] - h * tangent[i + 1]} ${points[i + 1][0]},${points[i + 1][1]}`;
  }
  return d;
}

// the area under a line down to the baseline `base`
export function areaPath(points, base) {
  if (!points.length) return '';
  return `${smoothPath(points)} L${points[points.length - 1][0]},${base} L${points[0][0]},${base} Z`;
}

// a point of a comparison chart has a value of the period before
export const hasCompare = (point) => point.compare !== null && point.compare !== undefined;

// „2. november, november 50 €, oktoober 30 €” — what the live region says for a point
// `series`: extra lines of this period ([{ key, label }], the value is point[key]) — „Ülekanded”, „Sularaha”
export function describePoint(point, index, { last, valueLabel, compareLabel, formatValue, series = [] }) {
  const extra = index <= last ? series.map((line) => `${line.label} ${formatValue(point[line.key] || 0)}`) : [];
  return [point.longLabel || point.label, index <= last ? `${valueLabel} ${formatValue(point.value || 0)}` : '', ...extra, hasCompare(point) ? `${compareLabel} ${formatValue(point.compare)}` : ''].filter(Boolean).join(', ');
}

// the arrow keys of a focusable chart: the next index, or null (Escape → 'clear')
export function chartKeyStep(key, from, count) {
  if (key === 'ArrowRight') return Math.min(count - 1, from + 1);
  if (key === 'ArrowLeft') return Math.max(0, from - 1);
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key === 'Escape') return 'clear';
  return null;
}
