import { askConfirm } from '../../components/ui/ConfirmHost.jsx';
import { ListChecks } from 'lucide-react';
import { useState } from 'react';
import { clockLabel, goToStep, MAX_STEPS, nextStep, normalizeSteps, startPlan } from './lessonPlan.js';
import { ATTENDANCE_LABEL, attendanceMarks, markLabel, markValue } from './roomAttendance.js';

// The pill in the top bar: the current step and its time (red when over), or „Tunniplaan”.
export function LessonPlanPill({ clock, active, onClick }) {
  const label = !clock.started ? 'Tunniplaan' : clock.done ? 'Plaan tehtud' : `${clock.step.label} ${clockLabel(clock.stepMs)} / ${clock.step.minutes}:00`;
  return <button type="button" className={`lr-pill lr-plan-pill ${clock.over ? 'is-over' : ''} ${active ? 'is-active' : ''}`} onClick={onClick}
    aria-label={clock.started && !clock.done ? `Tunniplaan: samm ${clock.index + 1}/${clock.count} ${clock.step.label}${clock.over ? ', aeg on läbi' : ''}` : 'Tunniplaan'}>
    <ListChecks size={15} aria-hidden="true" /><span className="lr-label">{label}</span>
  </button>;
}

function PlanEditor({ steps, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => steps.map((step) => ({ ...step })));
  const set = (index, patch) => setDraft((current) => current.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  const total = draft.reduce((acc, step) => acc + (Number(step.minutes) || 0), 0);
  return <div className="lr-plan-edit">
    {draft.map((step, index) => <div key={step.id} className="lr-plan-edit__row">
      <input aria-label={`Samm ${index + 1}`} value={step.label} maxLength={60} onChange={(event) => set(index, { label: event.target.value })} />
      <input aria-label={`Samm ${index + 1} minutid`} type="number" min={1} max={240} value={step.minutes} onChange={(event) => set(index, { minutes: event.target.value })} />
      <button type="button" className="lr-text-btn" aria-label={`Eemalda samm ${index + 1}`} disabled={draft.length <= 1} onClick={() => setDraft((current) => current.filter((_, i) => i !== index))}>✕</button>
    </div>)}
    <p className="lr-muted">Kokku {total} min</p>
    <div className="lr-plan__actions">
      <button type="button" className="lr-text-btn" disabled={draft.length >= MAX_STEPS} onClick={() => setDraft((current) => [...current, { id: `step${Date.now().toString(36)}`, label: 'Uus samm', minutes: 5, spentMs: 0 }])}>+ Lisa samm</button>
      <button type="button" className="lr-text-btn" onClick={onCancel}>Loobu</button>
      <button type="button" className="lr-text-btn is-primary" onClick={() => onSave(normalizeSteps(draft))}>Salvesta plaan</button>
    </div>
  </div>;
}

function AttendanceRow({ mark, onMark }) {
  const [late, setLate] = useState(mark.lateMinutes || 6);
  return <li className="lr-attendance__row">
    <span><strong>{mark.name}</strong><small>{mark.auto ? `Soovitus: ${markLabel(mark)}` : markLabel(mark)}{mark.joinedAt ? ` · liitus ${new Date(mark.joinedAt).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' })}` : ''}</small></span>
    <span className="lr-attendance__buttons" role="group" aria-label={`Kohalolu: ${mark.name}`}>
      {['present', 'late', 'absent'].map((status) => <button key={status} type="button" aria-pressed={!mark.auto && mark.status === status}
        className={`lr-text-btn ${mark.status === status ? (mark.auto ? 'is-suggested' : 'is-active') : ''}`} onClick={() => onMark(mark, status, late)}>{ATTENDANCE_LABEL[status]}</button>)}
      {mark.status === 'late' ? <label className="lr-attendance__late"><input type="number" min={1} max={240} aria-label={`Hilinemine minutites: ${mark.name}`} value={late}
        onChange={(event) => setLate(event.target.value)} onBlur={() => { if (Number(late) !== mark.lateMinutes) onMark(mark, 'late', late); }} /> min</label> : null}
    </span>
  </li>;
}

/**
 * Drawer content: the agenda with a timer per step and in total, „Järgmine samm”, editing, and the attendance of the
 * participants (prefilled from who joined and when; a click saves the teacher's mark).
 */
export default function LessonPlanPanel({ planState, participants = [], startMs = 0, attendanceNote = '' }) {
  const { plan, clock, save, error, now } = planState;
  const [editing, setEditing] = useState(false);
  const marks = attendanceMarks(participants, plan.attendance, startMs);
  const mark = (item, status, lateMinutes) => save({ ...plan, attendance: { ...plan.attendance, [item.studentId]: markValue(item, status, lateMinutes) } });
  const plannedMin = Math.round(clock.plannedTotalMs / 60_000);
  return <div className="lr-plan">
    {editing ? <PlanEditor steps={plan.steps} onCancel={() => setEditing(false)} onSave={(steps) => {
      setEditing(false);
      save({ ...plan, steps, current: clock.started ? Math.min(plan.current, steps.length) : 0 });
    }} /> : <>
      <p className="lr-plan__total" role="status">{clock.started ? <>Tund {clockLabel(clock.totalMs)} / {plannedMin} min{clock.started && !clock.done ? ` · samm ${clock.index + 1}/${clock.count}` : ''}</> : `Plaan ${plannedMin} min — kell käivitub nupust „Alusta”.`}</p>
      <ol className="lr-plan__steps">
        {plan.steps.map((step, index) => {
          const current = clock.started && !clock.done && index === clock.index;
          const spent = current ? clock.stepMs : step.spentMs;
          const state = current ? 'is-current' : clock.started && (clock.done || index < clock.index) ? 'is-done' : '';
          return <li key={step.id} className={`${state} ${current && clock.over ? 'is-over' : ''}`}>
            <button type="button" className="lr-plan__step" disabled={!clock.started || current} onClick={() => save(goToStep(plan, index, now))} aria-label={`${step.label}, ${step.minutes} min${current ? ' (praegu)' : ''}`}>
              <span>{step.label}</span>
              <small>{spent ? `${clockLabel(spent)} / ` : ''}{step.minutes} min{current && clock.over ? ' · aeg läbi' : ''}</small>
            </button>
          </li>;
        })}
      </ol>
      <div className="lr-plan__actions">
        {!clock.started ? <button type="button" className="lr-text-btn is-primary" onClick={() => save(startPlan(plan, Date.now()))}>Alusta</button>
          : !clock.done ? <button type="button" className="lr-text-btn is-primary" onClick={() => save(nextStep(plan, Date.now()))}>{clock.index + 1 >= clock.count ? 'Lõpeta plaan' : 'Järgmine samm'}</button> : null}
        <button type="button" className="lr-text-btn" onClick={() => setEditing(true)}>Muuda plaani</button>
        {clock.started ? <button type="button" className="lr-text-btn" onClick={async () => { if ((await askConfirm('Alustada kell otsast?'))) save(startPlan(plan, Date.now())); }}>Alusta uuesti</button> : null}
      </div>
    </>}
    <h3 className="lr-plan__heading">Kohalolu</h3>
    {marks.length ? <ul className="lr-attendance">{marks.map((item) => <AttendanceRow key={`${item.studentId}:${item.status}:${item.lateMinutes}`} mark={item} onMark={mark} />)}</ul> : <p className="lr-muted">Õpilasi ei ole.</p>}
    {attendanceNote ? <p className="lr-muted">{attendanceNote}</p> : null}
    {error ? <p className="lr-error" role="alert">{error}</p> : null}
  </div>;
}
