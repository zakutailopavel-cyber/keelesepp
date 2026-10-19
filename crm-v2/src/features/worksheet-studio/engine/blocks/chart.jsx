/* eslint-disable react-refresh/only-export-components -- block definitions are plain objects that carry View/Editor components */
import { Area, Select, Text } from '../../editor/fields.jsx';
import { CHART_KINDS, MAX_ROWS, MAX_SERIES, chartRows, chartScale, chartSeries, formatValue } from './chartModel.js';

// „Andmediagramm” (owner 2026-10-18): the input of a data summary — Harno C1 writing task 1 asks for a ~180-word
// summary of a diagram or graph. Not a task by itself: the learner writes about it in the next block. Drawn as SVG in
// the sheet's colours (navy, green, lime, grey), so it prints the same as it shows; every value is also written on it.

const COLOURS = ['#0b2a4f', '#267743', '#9cc31d', '#9aa7b4'];
const W = 640;
const H = 300;
const PAD = { left: 48, right: 16, top: 16, bottom: 44 };

function ChartSvg({ data }) {
  const series = chartSeries(data);
  const names = series.length ? series : [''];
  const rows = chartRows(data);
  const { top, ticks } = chartScale(data);
  const kind = data.kind === 'line' ? 'line' : 'bar';
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const y = (value) => PAD.top + plotH - (value / top) * plotH;
  const band = plotW / Math.max(1, rows.length);
  const unit = data.unit ? ` ${data.unit}` : '';
  const label = `${data.chartTitle || 'Diagramm'}: ${rows.map((row) => `${row.label} ${row.values.map((value, index) => `${names[index] ? `${names[index]} ` : ''}${formatValue(value)}${unit}`).join(', ')}`).join('; ')}`;
  return (
    <svg className="ws-chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} stroke="#d5dce3" strokeWidth={tick === 0 ? 1.4 : 0.8} />
          <text x={PAD.left - 6} y={y(tick) + 4} textAnchor="end" className="ws-chart-tick">{formatValue(tick)}</text>
        </g>
      ))}
      {rows.map((row, ri) => (
        <text key={`l${ri}`} x={PAD.left + band * ri + band / 2} y={H - PAD.bottom + 18} textAnchor="middle" className="ws-chart-cat">{row.label}</text>
      ))}
      {kind === 'bar' ? rows.map((row, ri) => {
        const inner = band * 0.78;
        const barW = inner / names.length;
        return row.values.map((value, si) => (value === null ? null : (
          <g key={`b${ri}-${si}`}>
            <rect x={PAD.left + band * ri + (band - inner) / 2 + barW * si + 1} y={y(value)} width={Math.max(2, barW - 2)} height={Math.max(0, PAD.top + plotH - y(value))} fill={COLOURS[si % COLOURS.length]} />
            <text x={PAD.left + band * ri + (band - inner) / 2 + barW * si + barW / 2} y={y(value) - 4} textAnchor="middle" className="ws-chart-value">{formatValue(value)}</text>
          </g>
        )));
      }) : names.map((name, si) => {
        const points = rows.map((row, ri) => (row.values[si] === null ? null : [PAD.left + band * ri + band / 2, y(row.values[si]), row.values[si]])).filter(Boolean);
        return (
          <g key={`s${si}`}>
            <polyline points={points.map(([px, py]) => `${px},${py}`).join(' ')} fill="none" stroke={COLOURS[si % COLOURS.length]} strokeWidth="2.4" />
            {points.map(([px, py, value], pi) => (
              <g key={pi}>
                <circle cx={px} cy={py} r="3.6" fill="#fff" stroke={COLOURS[si % COLOURS.length]} strokeWidth="2" />
                <text x={px} y={py - 8} textAnchor="middle" className="ws-chart-value">{formatValue(value)}</text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export const chart = {
  type: 'chart', label: 'Andmediagramm (tulbad, joon)', group: 'Skeemid', icon: 'ChartColumn', task: false, width: 'full', tone: 'white',
  create: () => ({
    chartTitle: 'Kuidas eestlased raamatuid loevad (% vastanutest)', kind: 'bar', unit: '%',
    series: 'Paberraamat, E-raamat, Audioraamat', rows: '2015 | 62 | 8 | 3\n2020 | 55 | 15 | 9\n2025 | 48 | 22 | 17',
    source: 'Allikas: väljamõeldud näidisandmed',
  }),
  View: ({ data }) => {
    const series = chartSeries(data);
    return (
      <figure className="ws-chart">
        {data.chartTitle ? <figcaption className="ws-chart-title">{data.chartTitle}</figcaption> : null}
        <ChartSvg data={data} />
        {series.length > 1 ? <ul className="ws-chart-legend">{series.map((name, index) => <li key={name}><i style={{ background: COLOURS[index % COLOURS.length] }} />{name}</li>)}</ul> : null}
        {data.source ? <p className="ws-chart-source">{data.source}</p> : null}
      </figure>
    );
  },
  Editor: ({ data, set }) => (
    <>
      <Text label="Diagrammi pealkiri" value={data.chartTitle} onChange={(chartTitle) => set({ chartTitle })} />
      <Select label="Kuju" value={data.kind === 'line' ? 'line' : 'bar'} onChange={(kind) => set({ kind })} options={CHART_KINDS} />
      <Text label={`Read (kuni ${MAX_SERIES}, komaga)`} value={data.series} onChange={(series) => set({ series })} placeholder="Paberraamat, E-raamat" />
      <Area label={`Andmed (iga rida: silt | väärtus | väärtus …, kuni ${MAX_ROWS} rida)`} rows={6} value={data.rows} onChange={(rows) => set({ rows })} hint="Näide: 2020 | 55 | 15. Koma või punkt kümnendmurrus." />
      <Text label="Ühik (valikuline)" value={data.unit} onChange={(unit) => set({ unit })} placeholder="%" />
      <Text label="Allikas (valikuline)" value={data.source} onChange={(source) => set({ source })} />
    </>
  ),
};
