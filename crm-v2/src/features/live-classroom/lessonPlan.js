// Live Classroom lesson plan (teacher only): a short agenda of steps with minutes and a timer per step and in total.
// The plan lives in `liveLessonPlans/{roomKey}` (staff-only); the clock is never written — it is derived from the
// `startedAt` / `stepStartedAt` timestamps and each finished step's `spentMs`, so a reload keeps the running timer.

export const MAX_STEPS = 12;
const BASE_MINUTES = 60;
// the default agenda of a 60-minute lesson; the worksheet phases (Avasta / Harjuta / Kasuta) are kept only when known
const DEFAULT_STEPS = [
  { id: 'warmup', label: 'Soojendus', minutes: 5 },
  { id: 'discover', label: 'Avasta', minutes: 15, phase: 'discover' },
  { id: 'practice', label: 'Harjuta', minutes: 20, phase: 'practice' },
  { id: 'transfer', label: 'Kasuta', minutes: 15, phase: 'transfer' },
  { id: 'summary', label: 'Kokkuvõte', minutes: 5 },
];
const PHASES = ['discover', 'practice', 'transfer'];

const cleanMinutes = (value) => Math.min(240, Math.max(1, Math.round(Number(value) || 0)));

// Steps scaled to `total` minutes: proportional, whole minutes, at least 1 each, the sum exactly `total`.
export function scaleSteps(steps, total) {
  const target = Math.round(Number(total) || 0);
  const sum = steps.reduce((acc, step) => acc + step.minutes, 0);
  if (!steps.length || target < steps.length || !sum) return steps.map((step) => ({ ...step }));
  const scaled = steps.map((step) => ({ ...step, minutes: Math.max(1, Math.round((step.minutes * target) / sum)) }));
  let diff = target - scaled.reduce((acc, step) => acc + step.minutes, 0);
  // the rounding rest goes to (or comes from) the longest steps
  const order = scaled.map((step, index) => index).sort((a, b) => scaled[b].minutes - scaled[a].minutes);
  for (let i = 0; diff !== 0 && i < 1000; i += 1) {
    const step = scaled[order[i % order.length]];
    if (diff > 0) { step.minutes += 1; diff -= 1; } else if (step.minutes > 1) { step.minutes -= 1; diff += 1; }
  }
  return scaled;
}

/**
 * The default plan of a room: Soojendus 5 · Avasta 15 · Harjuta 20 · Kasuta 15 · Kokkuvõte 5, scaled to the calendar
 * lesson length (`minutes`, default 60). `phases`: the worksheet phases of the lesson in the room; when some are
 * known only those phases stay (a lesson with only „Harjuta” gets Soojendus · Harjuta · Kokkuvõte).
 */
export function defaultPlanSteps({ minutes = BASE_MINUTES, phases = [] } = {}) {
  const known = PHASES.filter((phase) => phases.includes(phase));
  const steps = DEFAULT_STEPS
    .filter((step) => !step.phase || !known.length || known.includes(step.phase))
    .map(({ id, label, minutes: stepMinutes }) => ({ id, label, minutes: stepMinutes, spentMs: 0 }));
  return scaleSteps(steps, Number(minutes) > 0 ? minutes : BASE_MINUTES);
}

export const emptyPlan = (steps) => ({ steps, current: 0, startedAt: '', stepStartedAt: '' });

const ms = (iso) => {
  const value = Date.parse(String(iso || ''));
  return Number.isFinite(value) ? value : 0;
};

// Steps as stored: label (≤ 60 characters), minutes 1–240, spent time; at most 12.
export function normalizeSteps(steps = []) {
  return (Array.isArray(steps) ? steps : []).slice(0, MAX_STEPS).map((step, index) => ({
    id: String(step?.id || `step${index + 1}`).slice(0, 40),
    label: String(step?.label || '').trim().slice(0, 60) || `Samm ${index + 1}`,
    minutes: cleanMinutes(step?.minutes),
    spentMs: Math.max(0, Math.round(Number(step?.spentMs) || 0)),
  }));
}

/**
 * The clock of the plan at `now` (nothing is stored per second):
 * total — since the plan was started; step — the current step's time (earlier visits + the running one);
 * over — the step ran longer than planned; done — every step is finished.
 */
export function planClock(plan, now = Date.now()) {
  const steps = plan?.steps || [];
  const started = ms(plan?.startedAt);
  const index = Math.min(Math.max(0, Number(plan?.current) || 0), steps.length);
  const done = Boolean(steps.length) && index >= steps.length;
  const step = done ? null : steps[index] || null;
  const running = started && !done ? ms(plan?.stepStartedAt) : 0;
  const stepMs = step ? (step.spentMs || 0) + (running ? Math.max(0, now - running) : 0) : 0;
  const plannedMs = step ? step.minutes * 60_000 : 0;
  const plannedTotalMs = steps.reduce((acc, item) => acc + item.minutes * 60_000, 0);
  return {
    started: Boolean(started),
    done,
    index,
    count: steps.length,
    step,
    stepMs,
    stepPlannedMs: plannedMs,
    over: Boolean(step) && stepMs > plannedMs,
    totalMs: started ? Math.max(0, now - started) : 0,
    plannedTotalMs,
  };
}

// Start the clock (the first step runs from now).
export function startPlan(plan, now = Date.now()) {
  const at = new Date(now).toISOString();
  return { ...plan, current: 0, startedAt: at, stepStartedAt: at, steps: (plan.steps || []).map((step) => ({ ...step, spentMs: 0 })) };
}

// Move to step `index` (the running step keeps its time); index = steps.length finishes the plan.
export function goToStep(plan, index, now = Date.now()) {
  const steps = (plan.steps || []).map((step) => ({ ...step }));
  const target = Math.min(Math.max(0, index), steps.length);
  if (!ms(plan.startedAt)) return { ...plan, steps, current: Math.min(target, Math.max(0, steps.length - 1)) };
  const current = Math.min(Number(plan.current) || 0, steps.length);
  const running = ms(plan.stepStartedAt);
  if (steps[current] && running) steps[current].spentMs = (steps[current].spentMs || 0) + Math.max(0, now - running);
  const at = new Date(now).toISOString();
  return { ...plan, steps, current: target, stepStartedAt: target < steps.length ? at : '' };
}

export const nextStep = (plan, now = Date.now()) => goToStep(plan, (Number(plan.current) || 0) + 1, now);

// m:ss (or h:mm:ss)
export function clockLabel(value) {
  const total = Math.max(0, Math.floor((Number(value) || 0) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
