import { areaPath, smoothPath } from './chartPath.js';
import { useElementWidth } from './useElementWidth.js';
import './charts.css';

// A small trend line for a metric card: the last periods, oldest first, the last one emphasised. role="img" with the
// values in its label (a screen reader hears the trend, not a picture).
export default function Sparkline({ values = [], height = 44, label = 'Trend', formatValue = String, tone = 'neutral' }) {
  const [ref, width] = useElementWidth(200);
  const pad = 4;
  const clean = values.map((value) => Math.max(0, Number(value) || 0));
  const max = Math.max(1, ...clean);
  const step = clean.length > 1 ? (width - pad * 2) / (clean.length - 1) : 0;
  const points = clean.map((value, index) => [pad + index * step, pad + (height - pad * 2) * (1 - value / max)]);
  const base = height - 1;
  const description = `${label}: ${clean.map((value) => formatValue(value)).join(', ')}`;
  return <div className={`spark spark--${tone}`} ref={ref}>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={description} focusable="false">
      <line className="spark__base" x1="0" x2={width} y1={base} y2={base} />
      {points.length > 1 ? <path className="spark__area" d={areaPath(points, base)} /> : null}
      {points.length > 1 ? <path className="spark__line" d={smoothPath(points)} /> : null}
      {points.length ? <circle className="spark__end" cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="3" /> : null}
    </svg>
  </div>;
}
