// Pieces shared by the SVG chart and the uPlot chart: the hover card, the spoken line and the hidden data table.
// `series` = extra lines of this period ([{ key, label, tone }], value point[key]); tone names the colour token
// `--chart-<tone>` and the key `ac-key--<tone>` (charts.css).

import { hasCompare } from './chartPath.js';

export function ChartTip({ point, showValue, valueLabel, compareLabel, formatValue, series = [], className = '', style }) {
  if (!point) return null;
  return <div className={`ac-chart__tip ${className}`} style={style} aria-hidden="true">
    <b>{point.longLabel || point.label}</b>
    {showValue ? <span className="ac-chart__tip-row"><i className="ac-key ac-key--value" />{valueLabel}<strong>{formatValue(point.value || 0)}</strong></span> : null}
    {showValue ? series.map((line) => <span key={line.key} className="ac-chart__tip-row ac-chart__tip-row--sub"><i className={`ac-key ac-key--${line.tone || line.key}`} />{line.label}<strong>{formatValue(point[line.key] || 0)}</strong></span>) : null}
    {hasCompare(point) ? <span className="ac-chart__tip-row"><i className="ac-key ac-key--compare" />{compareLabel}<strong>{formatValue(point.compare)}</strong></span> : null}
  </div>;
}

// every point as a table for screen readers (the picture itself is role="img")
export function ChartTable({ points, last, caption, valueLabel, compareLabel, formatValue, series = [] }) {
  return <div className="sr-only"><table>
    {caption ? <caption>{caption}</caption> : null}
    <thead><tr><th scope="col">Aeg</th><th scope="col">{valueLabel}</th>{series.map((line) => <th key={line.key} scope="col">{line.label}</th>)}<th scope="col">{compareLabel}</th></tr></thead>
    <tbody>{points.map((point, index) => <tr key={point.key || index}><th scope="row">{point.longLabel || point.label}</th><td>{index <= last ? formatValue(point.value || 0) : '—'}</td>{series.map((line) => <td key={line.key}>{index <= last ? formatValue(point[line.key] || 0) : '—'}</td>)}<td>{hasCompare(point) ? formatValue(point.compare) : '—'}</td></tr>)}</tbody>
  </table></div>;
}
