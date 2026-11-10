import { useEffect, useRef, useState } from 'react';
import AreaComparisonChart from './AreaComparisonChart.jsx';
import { ChartTable, ChartTip } from './chartParts.jsx';
import { chartKeyStep, describePoint } from './chartPath.js';
import { uplotData, uplotOptions } from './uplotOptions.js';
import { useElementWidth } from './useElementWidth.js';
import './charts.css';

// The headline chart with uPlot (owner 2026-11-09: MIT, ~22 KB gzip, canvas). uPlot is loaded on demand — only the
// pages that show this chart download it. Same props as AreaComparisonChart, which stays the fallback (no canvas, e.g.
// tests; or the chunk failed to load). Accessible the same way: role="img" with a name, a focusable plot whose arrow keys
// move the crosshair and speak the point, and every point in a visually hidden table. Colours are the CSS tokens of
// the chart scope (`--chart-line` …), read with getComputedStyle and read again when the theme changes.

const canvasAvailable = () => typeof globalThis.document !== 'undefined'
  && !/jsdom/i.test(globalThis.navigator?.userAgent || '')
  && typeof globalThis.HTMLCanvasElement !== 'undefined';

function tokenColors(node, series = []) {
  const style = globalThis.getComputedStyle(node);
  const read = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
  const extra = Object.fromEntries(series.map((line) => [line.tone || line.key, read(`--chart-${line.tone || line.key}`, '#667085')]));
  return { ...extra, line: read('--chart-line', '#087e6b'), compare: read('--chart-compare', '#98a2b3'), grid: read('--chart-grid', '#eef0f3'), axis: read('--chart-axis', '#667085'), surface: read('--surface', '#fff') };
}
const NO_SERIES = [];

// a number that changes whenever the light/dark theme changes (the „Teema” menu or the system setting)
function useThemeVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((value) => value + 1);
    const observer = typeof globalThis.MutationObserver === 'function' ? new globalThis.MutationObserver(bump) : null;
    observer?.observe(globalThis.document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const media = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
    media?.addEventListener?.('change', bump);
    return () => { observer?.disconnect(); media?.removeEventListener?.('change', bump); };
  }, []);
  return version;
}

export default function UPlotComparisonChart(props) {
  const [mode, setMode] = useState(() => (canvasAvailable() ? 'loading' : 'svg'));
  const [UPlot, setUPlot] = useState(null);
  useEffect(() => {
    if (mode !== 'loading') return undefined;
    let live = true;
    Promise.all([import('uplot'), import('uplot/dist/uPlot.min.css')])
      .then(([module]) => { if (live) { setUPlot(() => module.default); setMode('uplot'); } })
      .catch(() => { if (live) setMode('svg'); });
    return () => { live = false; };
  }, [mode]);
  if (mode === 'svg') return <AreaComparisonChart {...props} />;
  return <CanvasChart {...props} UPlot={UPlot} />;
}

function CanvasChart({
  UPlot, points = [], currentUntil = points.length - 1, height = 220, ariaLabel, valueLabel = 'See periood', compareLabel = 'Eelmine periood',
  formatValue = String, formatAxis = formatValue, tickIndexes, caption, series = NO_SERIES,
}) {
  const [ref, width] = useElementWidth(720);
  const plotRef = useRef(null);
  const chartRef = useRef(null);
  const [active, setActive] = useState(null);
  const [tipX, setTipX] = useState(0);
  const theme = useThemeVersion();
  const last = Math.min(currentUntil, points.length - 1);

  useEffect(() => {
    const node = plotRef.current;
    if (!UPlot || !node || !ref.current) return undefined;
    const options = uplotOptions({
      points, currentUntil, width, height, tickIndexes, formatAxis, valueLabel, compareLabel, series, colors: tokenColors(ref.current, series), spline: UPlot.paths?.spline,
      onCursor: (index, chart) => {
        setActive(index);
        if (index !== null) setTipX(chart.over.offsetLeft + chart.valToPos(index, 'x'));
      },
    });
    const chart = new UPlot(options, uplotData(points, currentUntil, series), node);
    chartRef.current = chart;
    return () => { chart.destroy(); chartRef.current = null; };
  }, [UPlot, points, currentUntil, width, height, tickIndexes, formatAxis, valueLabel, compareLabel, series, theme, ref]);

  const moveTo = (index) => {
    const chart = chartRef.current;
    if (!chart) return;
    if (index === null) { chart.setCursor({ left: -10, top: -10 }); setActive(null); return; }
    const point = points[index];
    const value = index <= last ? point.value || 0 : point.compare || 0;
    chart.setCursor({ left: chart.valToPos(index, 'x'), top: chart.valToPos(value, 'y') });
  };
  const keyDown = (event) => {
    if (!points.length) return;
    const next = chartKeyStep(event.key, active ?? Math.max(0, last), points.length);
    if (next === null) return;
    event.preventDefault();
    moveTo(next === 'clear' ? null : next);
  };
  const shown = active !== null ? points[active] : null;
  const narrow = width < 560;

  return <div className="ac-chart" ref={ref}>
    <div className="ac-chart__plot ac-chart__plot--canvas" tabIndex={points.length ? 0 : -1} role="group" aria-label={`${ariaLabel || valueLabel}. Nooleklahvid liiguvad punktide vahel.`}
      onKeyDown={keyDown} onBlur={() => moveTo(null)}>
      <div ref={plotRef} role="img" aria-label={ariaLabel || valueLabel} style={{ height }} />
      <ChartTip point={shown} showValue={shown !== null && active <= last} valueLabel={valueLabel} compareLabel={compareLabel} formatValue={formatValue} series={series}
        className={narrow ? 'is-center' : tipX > width * 0.62 ? 'is-left' : ''} style={narrow ? undefined : { left: `${tipX}px` }} />
      <span className="sr-only" aria-live="polite">{shown ? describePoint(shown, active, { last, valueLabel, compareLabel, formatValue, series }) : ''}</span>
    </div>
    <ChartTable points={points} last={last} caption={caption} valueLabel={valueLabel} compareLabel={compareLabel} formatValue={formatValue} series={series} />
  </div>;
}
