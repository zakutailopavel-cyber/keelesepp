import { Target } from 'lucide-react';
import { useMemo } from 'react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { STEP_LIGHT, monthGoalSteps } from './goalLights.js';
import { STEP_LABEL, monthSteps } from './monthSteps.js';
import './learner.css';

const LIGHT_ORDER = ['mastered', 'practise', 'review', 'todo'];

// „Kuu sammud” (monthSteps.js): the month's lesson steps and how well each is mastered; nothing before the first sheet.
// `lights` (the learner's own „Minu areng”, owner 2026-11-04): the same „Oskan” rule and traffic lights as the parent's
// „Mida õpime praegu” (goalLights.js), no percentages. Staff views (LearnerSnapshotCard) keep the percentages.
export default function MonthStepsCard({ assignments = [], name = '', compact = false, limit = compact ? 6 : 12, ruHint = true, lights = false }) {
  const month = useMemo(() => (lights ? monthGoalSteps(assignments) : monthSteps(assignments)), [assignments, lights]);
  if (!month.total) return null;
  if (lights) return <LightsCard month={month} name={name} compact={compact} limit={limit} ruHint={ruHint} />;
  const pct = Math.round((month.mastered / month.total) * 100);
  const lessons = [...new Set(month.steps.map((step) => step.lesson))];
  let shown = 0;
  return <section className={`ms-card ${compact ? 'is-compact' : ''}`} aria-label={name ? `Kuu sammud: ${name}` : 'Kuu sammud'}>
    <header className="ms-head">
      <span className="ls-eyebrow"><Target size={13} aria-hidden="true" /> Kuu sammud{name ? ` · ${name}` : ''}</span>
      <h3>{month.mastered} / {month.total} sammu selge{ruHint ? <span lang="ru"> · шагов усвоено</span> : null}</h3>
      <i className="ms-bar" aria-hidden="true"><b style={{ width: `${pct}%` }} /></i>
      <small>{[month.practise ? `${month.practise} harjuta veel` : '', month.review ? `${month.review} kordame` : '', month.todo ? `${month.todo} veel tegemata` : ''].filter(Boolean).join(' · ')}</small>
    </header>
    {lessons.map((lesson) => {
      const steps = month.steps.filter((step) => step.lesson === lesson && shown < limit && ++shown);
      return steps.length ? <div key={lesson} className="ms-lesson"><strong>{lesson}</strong>
        <ul>{steps.map((step) => <li key={step.key} className={`is-${step.state}`}><span>{step.goal}</span><em>{STEP_LABEL[step.state]}{step.pct !== null ? ` · ${step.pct}%` : ''}</em></li>)}</ul>
      </div> : null;
    })}
    {month.total > limit ? <p className="ls-muted">+ veel {month.total - limit} sammu</p> : null}
  </section>;
}

function LightsCard({ month, name, compact, limit, ruHint }) {
  const lessons = [...new Set(month.steps.map((step) => step.lesson))];
  let shown = 0;
  return <section className={`ms-card ms-lights ${compact ? 'is-compact' : ''}`} aria-label={name ? `Kuu sammud: ${name}` : 'Kuu sammud'}>
    <header className="ms-head">
      <span className="ls-eyebrow"><Target size={13} aria-hidden="true" /> Kuu sammud{name ? ` · ${name}` : ''}</span>
      <h3>Kuu eesmärgid{ruHint ? <span lang="ru"> · цели месяца</span> : null}</h3>
      <p className="ms-counts">{LIGHT_ORDER.filter((state) => month[state]).map((state) => <span key={state} className={`ms-pill is-${state}`}><i aria-hidden="true" />{month[state]} {STEP_LIGHT[state].label.toLowerCase()}</span>)}</p>
    </header>
    {lessons.map((lesson) => {
      const steps = month.steps.filter((step) => step.lesson === lesson && shown < limit && ++shown);
      return steps.length ? <div key={lesson} className="ms-lesson"><strong>{lesson}</strong>
        <ul>{steps.map((step) => <li key={step.key} className={`is-${step.state}`}><span><i className="ms-dot" aria-hidden="true" />{step.goal}</span><em>{STEP_LIGHT[step.state].label}{ruHint ? <span lang="ru"> · {STEP_LIGHT[step.state].ru}</span> : null}</em></li>)}</ul>
      </div> : null;
    })}
    {month.total > limit ? <p className="ls-muted">+ veel {month.total - limit} eesmärki</p> : null}
  </section>;
}

// the family's view: one card per child (the same assignments the student sees)
export function ChildrenMonthSteps({ students = [], repository = homeworkService }) {
  const ids = students.map((student) => student.id).join('|');
  const state = useAsyncData(() => (ids ? repository.listWorksheetAssignmentsByStudentIds(ids.split('|')).catch(() => []) : Promise.resolve([])), [repository, ids]);
  const all = state.data || [];
  return <>{students.map((student) => <MonthStepsCard key={student.id} compact name={students.length > 1 ? student.name : ''} assignments={all.filter((item) => item.studentId === student.id)} />)}</>;
}
