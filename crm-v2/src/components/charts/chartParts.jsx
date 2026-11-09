// Pieces shared by the SVG chart and the uPlot chart: the hover card, the spoken line and the hidden data table.

import { hasCompare } from './chartPath.js';

export function ChartTip({ point, showValue, valueLabel, compareLabel, formatValue, className = '', style }) {
  if (!point) return null;
  return <div className={`ac-chart__tip ${className}`} style={style} aria-hidden="true">
    <b>{point.longLabel || point.label}</b>
    {showValue ? <span className="ac-chart__tip-row"><i className="ac-key ac-key--value" />{valueLabel}<strong>{formatValue(point.value || 0)}</strong></span> : null}
    {hasCompare(point) ? <span className="ac-chart__tip-row"><i className="ac-key ac-key--compare" />{compareLabel}<strong>{formatValue(point.compare)}</strong></span> : null}
  </div>;
}

// every point as a table for screen readers (the picture itself is role="img")
export function ChartTable({ points, last, caption, valueLabel, compareLabel, formatValue }) {
  return <div className="sr-only"><table>
    {caption ? <caption>{caption}</caption> : null}
    <thead><tr><th scope="col">Aeg</th><th scope="col">{valueLabel}</th><th scope="col">{compareLabel}</th></tr></thead>
    <tbody>{points.map((point, index) => <tr key={point.key || index}><th scope="row">{point.longLabel || point.label}</th><td>{index <= last ? formatValue(point.value || 0) : '—'}</td><td>{hasCompare(point) ? formatValue(point.compare) : '—'}</td></tr>)}</tbody>
  </table></div>;
}
