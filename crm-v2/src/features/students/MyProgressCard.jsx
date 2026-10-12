import { ArrowRight, Flag, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { READY } from './levelProgress.js';

const STATE = { ready: 'Valmis', close: 'Peaaegu', weak: 'Harjuta veel', unknown: 'Andmeid veel ei ole' };

/** „Minu areng”: the way from the student's level to his target, his skills against the bar and what to do next. */
export default function MyProgressCard({ progress }) {
  if (!progress) return null;
  const { from, to, step, reached, readiness, overall, skills, path, hints } = progress;
  return (
    <section className="my-progress" aria-label="Minu areng">
      <header className="my-progress__head">
        <div>
          <span className="eyebrow">Minu areng</span>
          <h2>{reached ? `Eesmärk ${to} on käes!` : `${from} → ${to}`}</h2>
          <p>{reached ? 'Räägi õpetajaga uuest eesmärgist.' : `Praegu: tase ${step} · ${readiness}% valmis`}<span lang="ru"> · {reached ? 'цель достигнута' : `сейчас идёшь к ${step}`}</span></p>
        </div>
        <strong className="my-progress__big" aria-label={`${overall}% teest`}>{overall}%<small>teest</small></strong>
      </header>

      <ol className="my-progress__path" aria-label="Tasemed">
        {path.map((item) => (
          <li key={item.level} className={`is-${item.state}`}>
            <span className="my-progress__dot">{item.target ? <Flag size={14} aria-hidden="true" /> : item.level}</span>
            <small>{item.level}{item.state === 'current' ? ` · ${item.pct}%` : ''}</small>
            {item.state === 'current' ? <i className="my-progress__bar"><b style={{ width: `${item.pct}%` }} /></i> : null}
          </li>
        ))}
      </ol>

      <div className="my-progress__skills">
        {skills.map((s) => (
          <div key={s.skill} className={`is-${s.state}`} title={s.basis || ''}>
            <span>{s.skill}</span>
            <i><b style={{ width: `${s.pct ?? 0}%` }} /><em style={{ left: `${READY}%` }} aria-hidden="true" /></i>
            <small>{s.pct === null ? STATE.unknown : `${s.pct}% · ${STATE[s.state]}`}</small>
          </div>
        ))}
      </div>

      {hints.length ? <div className="my-progress__hints">
        <h3><Lightbulb size={16} aria-hidden="true" /> Mida veel teha?</h3>
        <ul>{hints.map((h) => (
          <li key={h.key}><div><strong>{h.et}</strong><small lang="ru">{h.ru}</small></div><Link to={h.to} aria-label={`Ava: ${h.et}`}><ArrowRight size={16} /></Link></li>
        ))}</ul>
      </div> : null}
    </section>
  );
}
