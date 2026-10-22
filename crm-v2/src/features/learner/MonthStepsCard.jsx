import { Target } from 'lucide-react';
import { useMemo } from 'react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { STEP_LABEL, monthSteps } from './monthSteps.js';
import './learner.css';

// „Kuu sammud” (monthSteps.js): the month's lesson steps and how well each is mastered; nothing before the first sheet
export default function MonthStepsCard({ assignments = [], name = '', compact = false, limit = compact ? 6 : 12 }) {
  const month = useMemo(() => monthSteps(assignments), [assignments]);
  if (!month.total) return null;
  const pct = Math.round((month.mastered / month.total) * 100);
  const lessons = [...new Set(month.steps.map((step) => step.lesson))];
  let shown = 0;
  return <section className={`ms-card ${compact ? 'is-compact' : ''}`} aria-label={name ? `Kuu sammud: ${name}` : 'Kuu sammud'}>
    <header className="ms-head">
      <span className="ls-eyebrow"><Target size={13} aria-hidden="true" /> Kuu sammud{name ? ` · ${name}` : ''}</span>
      <h3>{month.mastered} / {month.total} sammu selge<span lang="ru"> · шагов усвоено</span></h3>
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

// the family's view: one card per child (the same assignments the student sees)
export function ChildrenMonthSteps({ students = [], repository = homeworkService }) {
  const ids = students.map((student) => student.id).join('|');
  const state = useAsyncData(() => (ids ? repository.listWorksheetAssignmentsByStudentIds(ids.split('|')).catch(() => []) : Promise.resolve([])), [repository, ids]);
  const all = state.data || [];
  return <>{students.map((student) => <MonthStepsCard key={student.id} compact name={students.length > 1 ? student.name : ''} assignments={all.filter((item) => item.studentId === student.id)} />)}</>;
}
