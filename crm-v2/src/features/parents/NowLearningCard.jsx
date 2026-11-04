import { BookOpen } from 'lucide-react';
import { useMemo } from 'react';
import { STEP_LIGHT, monthGoalSteps } from '../learner/goalLights.js';
import { nowLearning } from './nowLearning.js';
import './nowLearning.css';

const ORDER = ['mastered', 'practise', 'review', 'todo'];

// „Mida õpime praegu”: the module of the latest lesson, the month's lesson topics and the month's „Ma oskan …” steps as
// traffic lights (Oskan / Harjutan / Kordame). The family sees the state, not the percentages (those are for teachers).
export default function NowLearningCard({ lessons = [], assignments = [], today, limit = 6 }) {
  const now = useMemo(() => nowLearning({ lessons, today }), [lessons, today]);
  const month = useMemo(() => monthGoalSteps(assignments), [assignments]);
  const steps = [...month.steps].sort((a, b) => ORDER.indexOf(a.state) - ORDER.indexOf(b.state)).slice(0, limit);
  const nothing = !now.module && !now.topics.length && !month.total;
  return <section className="pc-card nl-card" aria-label="Mida õpime praegu">
    <header className="pc-head"><span className="pc-eyebrow"><BookOpen size={14} aria-hidden="true" /> Mida õpime praegu<span className="pd-ru" lang="ru"> · что изучаем сейчас</span></span>
      {now.module ? <h2>{now.module}{now.level ? <small> · {now.level}</small> : null}</h2> : null}
    </header>
    {nothing ? <p className="pc-empty"><span>Andmeid veel pole.<span className="pd-ru" lang="ru"> · данных пока нет</span></span></p> : null}
    {now.topics.length ? <div className="nl-block"><small>Tundide teemad viimase kuu jooksul<span className="pd-ru" lang="ru"> · темы уроков за месяц</span></small>
      <ul className="nl-topics">{now.topics.slice(0, 5).map((topic) => <li key={topic}>{topic}</li>)}</ul>
      {now.topics.length > 5 ? <p className="pd-muted">+ veel {now.topics.length - 5}</p> : null}
    </div> : null}
    {month.total ? <div className="nl-block"><small>Kuu eesmärgid<span className="pd-ru" lang="ru"> · цели месяца</span></small>
      <p className="nl-counts">{ORDER.filter((state) => month[state]).map((state) => <span key={state} className={`nl-pill is-${STEP_LIGHT[state].tone}`}><i aria-hidden="true" />{month[state]} {STEP_LIGHT[state].label.toLowerCase()}</span>)}</p>
      <ul className="nl-steps">{steps.map((step) => <li key={step.key} className={`is-${STEP_LIGHT[step.state].tone}`}><i aria-hidden="true" /><span>{step.goal}</span><em>{STEP_LIGHT[step.state].label}<span className="pd-ru" lang="ru"> · {STEP_LIGHT[step.state].ru}</span></em></li>)}</ul>
      {month.total > limit ? <p className="pd-muted">+ veel {month.total - limit} eesmärki</p> : null}
    </div> : null}
  </section>;
}
