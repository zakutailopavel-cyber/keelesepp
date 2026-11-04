import { TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import { childProgress } from './childProgress.js';
import './progressCard.css';

// „Areng” (owner 2026-11-04): the child's months as four small charts side by side, one measure each with its own scale
// (never two scales on one chart). Pointing at a month shows that month in all four; a table holds the same numbers.
const METRICS = [
  { id: 'lessons', title: 'Tunnid', ru: 'уроки', kind: 'bar', value: (point) => point.lessons, text: (value) => `${value} ${value === 1 ? 'tund' : 'tundi'}`, note: (point) => (point.missed ? `${point.missed} puudus` : '') },
  { id: 'homework', title: 'Kodutööd õigel ajal', ru: 'д/з вовремя', kind: 'line', max: 100, value: (point) => point.homeworkPct, text: (value) => `${value} %`, note: (point) => (point.homeworkDue ? `${point.homeworkOnTime} / ${point.homeworkDue}` : 'tähtaegu polnud') },
  { id: 'words', title: 'Sõnu sõnastikus', ru: 'слов в словаре', kind: 'line', value: (point) => point.words, text: (value) => String(value), note: () => '' },
  { id: 'oskan', title: '„Oskan” eesmärke', ru: 'целей «умею»', kind: 'line', value: (point) => point.oskan, text: (value) => String(value), note: () => '' },
];

const W = 300;
const H = 112;
const PAD = { left: 8, right: 8, top: 14, bottom: 22 };

function niceMax(values, fixed) {
  if (fixed) return fixed;
  const max = Math.max(0, ...values.filter((value) => value !== null));
  if (max <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / step) * step;
}

function MiniChart({ metric, points, active, onActive }) {
  const values = points.map(metric.value);
  const max = niceMax(values, metric.max);
  const band = (W - PAD.left - PAD.right) / points.length;
  const x = (index) => PAD.left + band * index + band / 2;
  const y = (value) => PAD.top + (H - PAD.top - PAD.bottom) * (1 - value / max);
  const base = H - PAD.bottom;
  // a line only between neighbouring months that both have a value; a gap stays a gap
  const segments = [];
  values.forEach((value, index) => {
    if (value === null || index === 0 || values[index - 1] === null) return;
    segments.push(`M${x(index - 1)},${y(values[index - 1])}L${x(index)},${y(value)}`);
  });
  const shown = values[active];
  const last = values.length - 1;
  return <figure className="pc-chart" aria-labelledby={`pc-${metric.id}`}>
    <figcaption id={`pc-${metric.id}`}>
      <span>{metric.title}<span className="pd-ru" lang="ru"> · {metric.ru}</span></span>
      <strong>{shown === null || shown === undefined ? '—' : metric.text(shown)}</strong>
      <small>{[points[active]?.label, active === last ? 'kuu pooleli' : '', shown === null ? 'andmeid pole' : metric.note(points[active])].filter(Boolean).join(' · ')}</small>
    </figcaption>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${metric.title}: ${points.map((point, index) => `${point.label} ${values[index] === null ? 'andmeid pole' : metric.text(values[index])}`).join(', ')}`} onMouseLeave={() => onActive(null)}>
      {[0, 0.5, 1].map((share) => <line key={share} className="pc-grid" x1={PAD.left} x2={W - PAD.right} y1={y(max * share)} y2={y(max * share)} />)}
      <text className="pc-axis" x={PAD.left} y={PAD.top - 4} textAnchor="start">{metric.max ? `${max} %` : max}</text>
      {points.map((point, index) => index === active ? <rect key={`a-${point.month}`} className="pc-active" x={x(index) - band / 2 + 2} y={PAD.top - 2} width={band - 4} height={base - PAD.top + 2} rx="6" /> : null)}
      {metric.kind === 'bar' ? values.map((value, index) => (value ? <path key={points[index].month} className="pc-bar"
        d={(() => { const width = Math.min(26, band * 0.5); const left = x(index) - width / 2; const top = y(value); const r = Math.min(4, base - top); return `M${left},${base}V${top + r}Q${left},${top} ${left + r},${top}H${left + width - r}Q${left + width},${top} ${left + width},${top + r}V${base}Z`; })()} /> : null))
        : <>
          {segments.map((d) => <path key={d} className="pc-line" d={d} />)}
          {values.map((value, index) => (value === null ? null : <circle key={points[index].month} className="pc-dot" cx={x(index)} cy={y(value)} r={index === active ? 5 : 4} />))}
        </>}
      <line className="pc-base" x1={PAD.left} x2={W - PAD.right} y1={base} y2={base} />
      {/* the newest value written by its mark, only where there is room above it */}
      {values[last] !== null && active !== last && y(values[last]) - 8 >= PAD.top + 8 ? <text className="pc-value" x={x(last)} y={y(values[last]) - 8} textAnchor="middle">{metric.max ? `${values[last]}%` : values[last]}</text> : null}
      {points.map((point, index) => <text key={`l-${point.month}`} className={`pc-month ${index === active ? 'is-active' : ''}`} x={x(index)} y={H - 6} textAnchor="middle">{point.label}</text>)}
      {/* hit targets: the whole month column, bigger than the mark */}
      {points.map((point, index) => <rect key={`h-${point.month}`} className="pc-hit" x={x(index) - band / 2} y="0" width={band} height={H} onMouseEnter={() => onActive(index)} onClick={() => onActive(index)}>
        <title>{`${point.label}: ${values[index] === null ? 'andmeid pole' : metric.text(values[index])}`}</title>
      </rect>)}
    </svg>
  </figure>;
}

function NoData({ metric }) {
  return <figure className="pc-chart is-empty"><figcaption><span>{metric.title}<span className="pd-ru" lang="ru"> · {metric.ru}</span></span><small>Andmeid veel pole<span lang="ru"> · данных пока нет</span></small></figcaption></figure>;
}

export function ProgressView({ progress, name = '' }) {
  const { points, series } = progress;
  const [picked, setPicked] = useState(null);
  const active = picked === null || picked >= points.length ? points.length - 1 : picked;
  const title = <header className="pc-head"><span className="pc-eyebrow"><TrendingUp size={14} aria-hidden="true" /> Areng<span className="pd-ru" lang="ru"> · развитие</span></span><h2>{name ? `${name} kuude kaupa` : 'Kuude kaupa'}<span className="pd-ru" lang="ru"> · по месяцам</span></h2></header>;
  if (!points.length) return <section className="pc-card" aria-label="Areng">{title}<p className="pc-empty"><span>Andmeid veel pole.<span className="pd-ru" lang="ru"> · данных пока нет</span></span><small>Graafik tekib, kui lapsel on tunde, kodutöid või sõnu.</small></p></section>;
  if (points.length < 2) {
    const point = points[0];
    return <section className="pc-card" aria-label="Areng">{title}
      <p className="pc-empty"><span>Graafik tekib, kui andmeid on vähemalt 2 kuu kohta.<span className="pd-ru" lang="ru"> · график появится, когда будут данные хотя бы за 2 месяца</span></span></p>
      <div className="pc-tiles">{METRICS.map((metric) => {
        const value = series[metric.id] ? metric.value(point) : null;
        return <div key={metric.id} className="pc-tile"><small>{metric.title}</small><strong>{value === null ? '—' : metric.text(value)}</strong><span>{value === null ? 'andmeid veel pole' : [point.label, metric.note(point)].filter(Boolean).join(' · ')}</span></div>;
      })}</div>
    </section>;
  }
  return <section className="pc-card" aria-label="Areng">{title}
    <p className="pc-help">Puuduta kuud, et näha selle kuu numbreid.<span className="pd-ru" lang="ru"> · нажмите на месяц</span></p>
    <div className="pc-grid-wrap">
      {METRICS.map((metric) => (series[metric.id] ? <MiniChart key={metric.id} metric={metric} points={points} active={active} onActive={(index) => index !== null && setPicked(index)} /> : <NoData key={metric.id} metric={metric} />))}
    </div>
    <details className="pc-table">
      <summary>Näita tabelina<span className="pd-ru" lang="ru"> · таблицей</span></summary>
      <div className="pc-table__scroll"><table>
        <caption>Areng kuude kaupa</caption>
        <thead><tr><th scope="col">Kuu</th>{METRICS.map((metric) => <th key={metric.id} scope="col">{metric.title}</th>)}</tr></thead>
        <tbody>{points.map((point) => <tr key={point.month}><th scope="row">{point.label} {point.month.slice(0, 4)}</th>{METRICS.map((metric) => {
          const value = series[metric.id] ? metric.value(point) : null;
          return <td key={metric.id}>{value === null ? '—' : metric.text(value)}{value !== null && metric.note(point) ? <small> ({metric.note(point)})</small> : null}</td>;
        })}</tr>)}</tbody>
      </table></div>
    </details>
  </section>;
}

// the page passes what it already read for the child; the words come live from the child's own dictionary
export default function ProgressCard({ records = [], lessons = [], tasks = [], assignments = [], today, name = '', wordsService }) {
  const words = useStudentWords(records.map((record) => record.id), ...(wordsService ? [wordsService] : []));
  const progress = useMemo(() => childProgress({ lessons, tasks, words, assignments, today }), [assignments, lessons, tasks, today, words]);
  return <ProgressView progress={progress} name={name} />;
}
