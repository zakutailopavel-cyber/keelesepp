import ProficiencyChart from './ProficiencyChart.jsx';
import { changeText, curveSummary, formatPercent, pointLabel } from './proficiencyCurve.js';
import { useLevelCurve } from './useLevelCurve.js';
import './proficiency.css';
import { LoadingState } from '../../components/ui/index.js';

const Ru = ({ children }) => <span className="pd-ru" lang="ru"> · {children}</span>;
const WORDS = {
  parent: { title: (level, name) => `${name ? `${name} ` : ''}${level} keeleoskus`, ru: (level) => `владение языком ${level}`, who: 'laps oskab', empty: 'Kõver tekib, kui laps on teinud kursuse töölehti või õpetaja on märkinud alguspunkti.' },
  student: { title: (level) => `Sinu ${level} keeleoskus`, ru: (level) => `твоё владение языком ${level}`, who: 'sa oskad', empty: 'Kõver tekib, kui oled teinud kursuse töölehti või õpetaja on märkinud alguspunkti.' },
};

/**
 * The level curve for the family or the learner (owner 2026-11-04, quiet version): one heading line (level, the value
 * now, the change since the start), the chart, „Mida see näitab?” and the table behind small toggles.
 */
export function ProficiencyView({ curve, level = '', loading = false, audience = 'parent', name = '' }) {
  const words = WORDS[audience] || WORDS.parent;
  const title = level ? words.title(level, name) : 'Keeleoskus';
  const line = curve?.line || [];
  const exams = curve?.exams || [];
  const summary = curveSummary(curve);
  const { latest } = summary;
  const head = <header className="pf-head">
    <h2>{title}{level ? <Ru>{words.ru(level)}</Ru> : null}</h2>
    {latest ? <p className="pf-now"><strong>{formatPercent(latest.percent)}</strong>{summary.change !== null ? <b className={summary.change >= 0 ? 'is-up' : 'is-down'}>{changeText(summary)}</b> : null}</p> : null}
  </header>;
  if (loading) return <section className="pf-card" aria-label="Areng">{head}<LoadingState inline className="pf-empty" label="Laen…" /></section>;
  if (!line.length && !exams.length) return <section className="pf-card" aria-label="Areng">{head}
    <p className="pf-empty"><span>Andmeid veel pole.<Ru>данных пока нет</Ru></span><small>{words.empty}</small></p>
  </section>;
  return <section className="pf-card" aria-label="Areng">{head}
    {line.length + exams.length < 2
      ? <p className="pf-empty"><span>Kõver tekib, kui mõõtmisi on vähemalt kaks.<Ru>график появится после второго измерения</Ru></span></p>
      : <ProficiencyChart line={line} exams={exams} level={level} />}
    <div className="pf-more">
      <details className="pf-info">
        <summary>ⓘ Mida see näitab?<Ru>что это?</Ru></summary>
        <p>Hinnang tasemele {level}: kui suur osa kursuse eesmärkidest {words.who} (eesmärk on „Oskan”, kui vähemalt kahes töölehes on kokku vähemalt 70 % õige). Alguspunkti paneb õpetaja. Proovieksam on kontroll, see kõverat ei muuda. 100 % = tase {level} on käes.</p>
        <p lang="ru">Оценка уровня {level}: какая часть целей курса освоена (цель освоена, если хотя бы в двух листах вместе не меньше 70 % правильно). Начальную точку ставит учитель. Пробный экзамен — проверка, кривую он не меняет.</p>
      </details>
      <details className="pf-table">
        <summary>Näita tabelina</summary>
        <div className="pf-table__scroll"><table>
          <caption>{title}</caption>
          <thead><tr><th scope="col">Kuupäev</th><th scope="col">Mõõtmine</th><th scope="col">Tulemus</th></tr></thead>
          <tbody>{[...line, ...exams].sort((a, b) => a.date.localeCompare(b.date)).map((point) => <tr key={`${point.date}-${point.kind}`}><th scope="row">{point.date.split('-').reverse().join('.')}</th><td>{pointLabel(point)}{point.kind === 'exam' ? ' (kontroll)' : ''}</td><td>{formatPercent(point.percent)}</td></tr>)}</tbody>
        </table></div>
      </details>
    </div>
  </section>;
}

// the page passes the learner's card ids, his sheets (already read) and the target level
export default function ProficiencyCard({ studentIds = [], assignments = [], targetLevel = '', service, loadGoals, audience = 'parent', name = '' }) {
  const { curve, level, loading } = useLevelCurve({ studentIds, assignments, targetLevel, ...(service ? { service } : {}), ...(loadGoals ? { loadGoals } : {}) });
  return <ProficiencyView curve={curve} level={level} loading={loading} audience={audience} name={name} />;
}
