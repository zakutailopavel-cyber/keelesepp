import { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/index.js';
import { lessonTrend } from './lessonTrend.js';

const dateLabel = (iso) => (iso ? new Date(iso).toLocaleDateString('et-EE', { day: 'numeric', month: 'numeric' }) : '—');
const num = (n) => (n === null || n === undefined ? '—' : String(n).replace('.', ','));

// the four numbers shown as small lines (one series each, the title names it); `better` says which way is good
const METRICS = [
  { key: 'share', label: 'Õpilase osa kõnest', unit: '%', better: 'up' },
  { key: 'words', label: 'Õpilase sõnu', unit: '', better: 'up' },
  { key: 'utterance', label: 'Keskmine lausung', unit: ' sõna', better: 'up' },
  { key: 'per100', label: 'Vigu 100 sõna kohta', unit: '', better: 'down' },
];

function Sparkline({ rows, metric }) {
  const points = rows.map((r, i) => ({ i, v: r[metric.key], r })).filter((p) => p.v !== null && p.v !== undefined);
  if (!points.length) return <p className="lesson-trend__none">pole andmeid</p>;
  const W = 220; const H = 56; const pad = 6;
  const max = Math.max(...points.map((p) => p.v), metric.key === 'share' ? 100 : 1);
  const x = (i) => (rows.length > 1 ? pad + (i / (rows.length - 1)) * (W - pad * 2) : W / 2);
  const y = (v) => H - pad - (v / max) * (H - pad * 2);
  const path = points.map((p, k) => `${k ? 'L' : 'M'}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  return <svg className="lesson-trend__spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${metric.label} tundide kaupa`}>
    <line className="lesson-trend__base" x1={pad} x2={W - pad} y1={H - pad} y2={H - pad} />
    {points.length > 1 ? <path className="lesson-trend__line" d={path} /> : null}
    {points.map((p) => <circle key={p.i} className="lesson-trend__dot" cx={x(p.i)} cy={y(p.v)} r={p === points[points.length - 1] ? 4 : 3}>
      <title>{`${dateLabel(p.r.date)}: ${num(p.v)}${metric.unit}`}</title>
    </circle>)}
  </svg>;
}

function Tile({ rows, metric }) {
  const values = rows.map((r) => r[metric.key]).filter((v) => v !== null && v !== undefined);
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const delta = last !== undefined && prev !== undefined ? Math.round((last - prev) * 10) / 10 : null;
  const good = delta === null || delta === 0 ? '' : (delta > 0) === (metric.better === 'up') ? 'is-good' : 'is-bad';
  return <div className="lesson-trend__tile">
    <span>{metric.label}</span>
    <strong>{last === undefined ? '—' : `${num(last)}${metric.unit}`}</strong>
    {delta !== null ? <small className={good}>{delta > 0 ? '+' : ''}{num(delta)} eelmise tunniga võrreldes</small> : <small>&nbsp;</small>}
    <Sparkline rows={rows} metric={metric} />
  </div>;
}

// Student card → „Tunnid”: the learner's numbers per analysed lesson (staff only, the same recordings as the lesson
// analyses: a teacher sees the lessons they recorded, an admin all)
export default function LessonTrendCard({ lessons = [], className = '' }) {
  const rows = useMemo(() => lessonTrend(lessons), [lessons]);
  const [all, setAll] = useState(false);
  if (!rows.length) return null;
  const shown = all ? rows : rows.slice(-12);
  const dismissed = rows.reduce((n, r) => n + r.dismissed, 0);
  return <Card className={`lesson-trend ${className}`.trim()}>
    <div className="section-heading"><div><span className="eyebrow">Live Classroom · ainult õpetajale</span><h2><TrendingUp size={18} aria-hidden="true" /> Areng tundide kaupa</h2></div></div>
    <p className="form-hint">Arvud tulevad tunni tekstist ja kooli arvuti analüüsist ({rows.length} {rows.length === 1 ? 'tund' : 'tundi'}){dismissed ? `; „Pole viga” märgitud vead (${dismissed}) ei lähe arvesse` : ''}.</p>
    <div className="lesson-trend__tiles">{METRICS.map((m) => <Tile key={m.key} rows={shown} metric={m} />)}</div>
    <div className="lesson-trend__table-wrap">
      <table className="lesson-trend__table">
        <thead><tr><th scope="col">Tund</th><th scope="col">Osa kõnest</th><th scope="col">Sõnu</th><th scope="col">Lausung</th><th scope="col">Vigu / 100 sõna</th><th scope="col">Sagedasemad vead</th><th scope="col">Uusi sõnu</th></tr></thead>
        <tbody>{[...shown].reverse().map((r) => <tr key={r.id}>
          <th scope="row">{dateLabel(r.date)}</th>
          <td>{r.share}%</td>
          <td>{r.words}</td>
          <td>{num(r.utterance)}</td>
          <td>{r.per100 === null ? <span className="lesson-trend__none">ei analüüsitud</span> : `${num(r.per100)} (${r.errors})`}</td>
          <td>{r.kinds.length ? r.kinds.map((k) => `${k.kind} ${k.count}`).join(', ') : '—'}</td>
          <td>{r.newWords === null ? <span className="lesson-trend__none" title="Esimene tund: pole millega võrrelda">{r.distinct} eri sõna</span> : r.newWords}</td>
        </tr>)}</tbody>
      </table>
    </div>
    {rows.length > 12 ? <button type="button" className="lesson-trend__more" onClick={() => setAll((v) => !v)}>{all ? 'Näita viimast 12 tundi' : `Näita kõiki ${rows.length} tundi`}</button> : null}
    <p className="form-hint">Osa kõnest — õpilase rääkimise aeg; lausung — keskmine sõnade arv õpilase repliigis; vead — ainult õppekeelsetes lausetes; uued sõnad — eri sõnad, mida õpilane neis tundides varem ei öelnud.</p>
  </Card>;
}
