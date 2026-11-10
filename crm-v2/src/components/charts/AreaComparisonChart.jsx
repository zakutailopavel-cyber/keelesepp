import { useState } from 'react';
import { areaPath, chartKeyStep, describePoint, niceTicks, smoothPath } from './chartPath.js';
import { ChartTable, ChartTip } from './chartParts.jsx';
import { useElementWidth } from './useElementWidth.js';
import './charts.css';

// A line with its area (this period) over a faint dashed line (the period before), Stripe „overview” style. Accessible:
// role="img" with a summary, a crosshair and tooltip that follow the pointer or the arrow keys (the chart is focusable),
// and every point in a visually hidden table. Colours are CSS tokens (light and dark theme); motion respects
// prefers-reduced-motion (charts.css).
//
// points: [{ key, label, longLabel?, value, compare }] — value/compare are numbers (cents), compare may be null
// currentUntil: the last index of `value` that has happened (a period still running stops at today); -1 = none
// tickIndexes: which points get an x-axis label (default: first, middle, last)
export default function AreaComparisonChart({
  points = [], currentUntil = points.length - 1, height = 220, ariaLabel, valueLabel = 'See periood', compareLabel = 'Eelmine periood',
  formatValue = String, formatAxis = formatValue, tickIndexes, caption, series = [],
}) {
  const [ref, width] = useElementWidth(720);
  const [active, setActive] = useState(null);
  const top = 12; const bottom = 28; const right = 8;
  const max = Math.max(1, ...points.map((point) => Math.max(point.value || 0, point.compare || 0, ...series.map((line) => point[line.key] || 0))));
  const ticks = niceTicks(max, 3);
  const scaleTop = ticks[ticks.length - 1];
  const axisWidth = Math.max(38, ...ticks.map((tick) => String(formatAxis(tick)).length * 6.6 + 10));
  const left = axisWidth;
  const plotW = Math.max(40, width - left - right);
  const plotH = height - top - bottom;
  const step = points.length > 1 ? plotW / (points.length - 1) : 0;
  const x = (index) => left + index * step;
  const y = (value) => top + plotH - (Math.max(0, value) / scaleTop) * plotH;
  const base = top + plotH;
  const last = Math.min(currentUntil, points.length - 1);
  const current = last >= 0 ? points.slice(0, last + 1).map((point, index) => [x(index), y(point.value || 0)]) : [];
  // extra lines of this period (series: „Ülekanded”, „Sularaha”), thinner, no area
  const extras = series.map((line) => ({ ...line, path: last >= 0 ? points.slice(0, last + 1).map((point, index) => [x(index), y(point[line.key] || 0)]) : [] }));
  const compare = points.map((point, index) => (point.compare === null || point.compare === undefined ? null : [x(index), y(point.compare)])).filter(Boolean);
  const labels = tickIndexes || (points.length > 2 ? [0, Math.floor((points.length - 1) / 2), points.length - 1] : points.map((_, index) => index));

  const pick = (event) => {
    if (!points.length) return;
    const box = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - box.left) / Math.max(1, box.width)) * width;
    setActive(Math.max(0, Math.min(points.length - 1, Math.round((px - left) / (step || 1)))));
  };
  const keyDown = (event) => {
    if (!points.length) return;
    const next = chartKeyStep(event.key, active ?? Math.max(0, last), points.length);
    if (next === null) return;
    event.preventDefault();
    setActive(next === 'clear' ? null : next);
  };
  const shown = active !== null ? points[active] : null;
  const shownValue = shown && active <= last ? shown.value : null;
  const tipLeft = active !== null ? (x(active) / width) * 100 : 0;

  return <div className="ac-chart" ref={ref}>
    <div className="ac-chart__plot" tabIndex={points.length ? 0 : -1} role="group" aria-label={`${ariaLabel || valueLabel}. Nooleklahvid liiguvad punktide vahel.`}
      onKeyDown={keyDown} onBlur={() => setActive(null)} onPointerMove={pick} onPointerLeave={() => setActive(null)}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel || valueLabel} focusable="false">
        {ticks.map((tick) => <g key={tick}>
          <line className={tick === 0 ? 'ac-chart__base' : 'ac-chart__grid'} x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} />
          <text className="ac-chart__axis" x={left - 8} y={y(tick) + 4} textAnchor="end">{formatAxis(tick)}</text>
        </g>)}
        {labels.map((index) => points[index] ? <text key={`x-${index}`} className="ac-chart__axis" x={x(index)} y={height - 8}
          textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}>{points[index].label}</text> : null)}
        {compare.length > 1 ? <path className="ac-chart__compare" d={smoothPath(compare)} /> : null}
        {current.length > 1 ? <path className="ac-chart__area" d={areaPath(current, base)} /> : null}
        {current.length > 1 ? <path className="ac-chart__line" d={smoothPath(current)} pathLength="1" /> : null}
        {extras.map((line) => (line.path.length > 1 ? <path key={line.key} className={`ac-chart__extra ac-chart__extra--${line.tone || line.key}`} d={smoothPath(line.path)} /> : null))}
        {current.length ? <circle className="ac-chart__end" cx={current[current.length - 1][0]} cy={current[current.length - 1][1]} r="4" /> : null}
        {active !== null ? <g className="ac-chart__cross">
          <line x1={x(active)} x2={x(active)} y1={top} y2={base} />
          {shown.compare !== null && shown.compare !== undefined ? <circle className="ac-chart__dot ac-chart__dot--compare" cx={x(active)} cy={y(shown.compare)} r="4" /> : null}
          {shownValue !== null ? <circle className="ac-chart__dot" cx={x(active)} cy={y(shownValue)} r="5" /> : null}
        </g> : null}
      </svg>
      {/* beside the crosshair; a phone has no room beside it, the card sits centred above the plot instead */}
      <ChartTip point={shown} showValue={shownValue !== null} valueLabel={valueLabel} compareLabel={compareLabel} formatValue={formatValue} series={series}
        className={width < 560 ? 'is-center' : tipLeft > 62 ? 'is-left' : ''} style={width < 560 ? undefined : { left: `${tipLeft}%` }} />
      <span className="sr-only" aria-live="polite">{shown ? describePoint(shown, active, { last, valueLabel, compareLabel, formatValue, series }) : ''}</span>
    </div>
    <ChartTable points={points} last={last} caption={caption} valueLabel={valueLabel} compareLabel={compareLabel} formatValue={formatValue} series={series} />
  </div>;
}
