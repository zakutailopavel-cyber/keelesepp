import ProficiencyChart from './ProficiencyChart.jsx';
import { changeText, curveSummary, doneSheetCount, formatPercent, isThinCurve, pointLabel } from './proficiencyCurve.js';
import { useLevelCurve } from './useLevelCurve.js';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import { wordGrowth } from '../vocabulary/wordGrowth.js';
import './proficiency.css';
import { LoadingState } from '../../components/ui/index.js';

const Ru = ({ children }) => <span className="pd-ru" lang="ru"> · {children}</span>;
const WORDS = {
  parent: { title: (level, name) => `${name ? `${name} ` : ''}${level} keeleoskus`, ru: (level) => `владение языком ${level}`, who: 'laps oskab', did: 'Laps on juba teinud', thin: 'Protsent tekib, kui laps on teinud vähemalt kolm kursuse töölehte ja mõni eesmärk on kahes lehes õnnestunud.', empty: 'Kõver tekib, kui laps on teinud kursuse töölehti või õpetaja on märkinud alguspunkti.' },
  student: { title: (level) => `Sinu ${level} keeleoskus`, ru: (level) => `твоё владение языком ${level}`, who: 'sa oskad', did: 'Sa oled juba teinud', thin: 'Protsent tekib, kui oled teinud vähemalt kolm kursuse töölehte ja mõni eesmärk on kahes lehes õnnestunud.', empty: 'Kõver tekib, kui oled teinud kursuse töölehti või õpetaja on märkinud alguspunkti.' },
};

/**
 * The level curve for the family or the learner (owner 2026-11-04, quiet version): one heading line (level, the value
 * now, the change since the start), the chart, „Mida see näitab?” and the table behind small toggles.
 */
export function ProficiencyView({ curve, level = '', loading = false, audience = 'parent', name = '', doneSheets = 0, learnedWords = 0 }) {
  const words = WORDS[audience] || WORDS.parent;
  const title = level ? words.title(level, name) : 'Keeleoskus';
  const line = curve?.line || [];
  const exams = curve?.exams || [];
  const summary = curveSummary(curve);
  const { latest } = summary;
  // too few measurements: no percentage (a 0 % would read as „knows nothing”), what was done instead
  const thin = isThinCurve(curve);
  const head = <header className="pf-head">
    <h2>{title}{level ? <Ru>{words.ru(level)}</Ru> : null}</h2>
    {latest && !thin ? <p className="pf-now"><strong>{formatPercent(latest.percent)}</strong>{summary.change !== null ? <b className={summary.change >= 0 ? 'is-up' : 'is-down'}>{changeText(summary)}</b> : null}</p> : null}
  </header>;
  if (loading) return <section className="pf-card" aria-label="Areng">{head}<LoadingState inline className="pf-empty" label="Laen…" /></section>;
  if (!line.length && !exams.length) return <section className="pf-card" aria-label="Areng">{head}
    <p className="pf-empty"><span>Andmeid veel pole.<Ru>данных пока нет</Ru></span><small>{words.empty}</small></p>
  </section>;
  if (thin) return <section className="pf-card" aria-label="Areng">{head}
    <div className="pf-empty pf-thin" role="status">
      <span>Andmeid on veel vähe.<Ru>данных пока мало</Ru></span>
      {doneSheets || learnedWords ? <ul className="pf-did" aria-label={words.did}>
        {doneSheets ? <li><strong>{doneSheets}</strong> {doneSheets === 1 ? 'tööleht tehtud' : 'töölehte tehtud'}<Ru>листов сделано</Ru></li> : null}
        {learnedWords ? <li><strong>{learnedWords}</strong> sõna selgeks õpitud<Ru>слов выучено</Ru></li> : null}
      </ul> : null}
      <small>{words.thin}</small>
    </div>
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
// `wordsService`: the live word lists (studentWords), for the „learned words” of the neutral state
export default function ProficiencyCard({ studentIds = [], assignments = [], targetLevel = '', service, loadGoals, wordsService, audience = 'parent', name = '' }) {
  const { curve, level, loading } = useLevelCurve({ studentIds, assignments, targetLevel, ...(service ? { service } : {}), ...(loadGoals ? { loadGoals } : {}) });
  const words = useStudentWords(isThinCurve(curve) ? studentIds : [], ...(wordsService ? [wordsService] : []));
  return <ProficiencyView curve={curve} level={level} loading={loading} audience={audience} name={name} doneSheets={doneSheetCount(assignments)} learnedWords={wordGrowth(words).learned} />;
}
