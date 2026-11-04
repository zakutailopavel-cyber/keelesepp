import { TrendingUp } from 'lucide-react';
import ProficiencyChart from './ProficiencyChart.jsx';
import { changeText, curveSummary, formatPercent, pointLabel, shortDate } from './proficiencyCurve.js';
import { useLevelCurve } from './useLevelCurve.js';
import './proficiency.css';

const Ru = ({ children }) => <span className="pd-ru" lang="ru"> · {children}</span>;

/** The curve for the family (or the learner): level % from the coursework, the start set by the teacher, mock exams as markers. */
export function ProficiencyView({ curve, level = '', loading = false }) {
  const head = <header className="pf-head">
    <span className="pf-eyebrow"><TrendingUp size={14} aria-hidden="true" /> Areng<Ru>развитие</Ru></span>
    <h2>{level ? `${level} keeleoskus` : 'Keeleoskus'}<Ru>{level ? `владение языком ${level}` : 'владение языком'}</Ru></h2>
  </header>;
  if (loading) return <section className="pf-card" aria-label="Areng">{head}<p className="pf-empty">Laen…</p></section>;
  const line = curve?.line || [];
  const exams = curve?.exams || [];
  if (!line.length && !exams.length) return <section className="pf-card" aria-label="Areng">{head}
    <p className="pf-empty"><span>Andmeid veel pole.<Ru>данных пока нет</Ru></span><small>Kõver tekib, kui laps on teinud kursuse töölehti või õpetaja on märkinud alguspunkti.</small></p>
  </section>;
  const summary = curveSummary(curve);
  const { latest } = summary;
  return <section className="pf-card" aria-label="Areng">{head}
    {latest ? <div className="pf-now">
      <strong>{formatPercent(latest.percent)}</strong>
      <span>
        {summary.change !== null ? <b className={summary.change >= 0 ? 'is-up' : 'is-down'}>{changeText(summary)}</b> : null}
        <small>{shortDate(latest.date)} · {pointLabel(latest)}</small>
      </span>
    </div> : null}
    <p className="pf-explain">Hinnang tasemele {level}: kursuse eesmärgid, mida laps oskab (alguspunkt õpetajalt). Proovieksam on kontroll. 100 % = tase {level} on käes.<Ru>по целям курса; пробный экзамен — проверка</Ru></p>
    {line.length + exams.length < 2
      ? <p className="pf-empty"><span>Kõver tekib, kui mõõtmisi on vähemalt kaks.<Ru>график появится после второго измерения</Ru></span></p>
      : <ProficiencyChart line={line} exams={exams} level={level} />}
    <details className="pf-table">
      <summary>Näita tabelina<Ru>таблицей</Ru></summary>
      <div className="pf-table__scroll"><table>
        <caption>{level} keeleoskus</caption>
        <thead><tr><th scope="col">Kuupäev</th><th scope="col">Mõõtmine</th><th scope="col">Tulemus</th></tr></thead>
        <tbody>{[...line, ...exams].sort((a, b) => a.date.localeCompare(b.date)).map((point) => <tr key={`${point.date}-${point.kind}`}><th scope="row">{point.date.split('-').reverse().join('.')}</th><td>{pointLabel(point)}{point.kind === 'exam' ? ' (kontroll)' : ''}</td><td>{formatPercent(point.percent)}</td></tr>)}</tbody>
      </table></div>
    </details>
  </section>;
}

// the page passes the child's card ids, his sheets (already read) and the target level
export default function ProficiencyCard({ studentIds = [], assignments = [], targetLevel = '', service, loadGoals }) {
  const { curve, level, loading } = useLevelCurve({ studentIds, assignments, targetLevel, ...(service ? { service } : {}), ...(loadGoals ? { loadGoals } : {}) });
  return <ProficiencyView curve={curve} level={level} loading={loading} />;
}
