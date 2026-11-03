import { clockLabel, defaultPlanSteps, emptyPlan, goToStep, nextStep, normalizeSteps, planClock, scaleSteps, startPlan } from './lessonPlan.js';

const labels = (steps) => steps.map((step) => `${step.label} ${step.minutes}`);
const T0 = Date.parse('2026-11-04T10:00:00.000Z');
const min = (n) => n * 60_000;

describe('lesson plan: default agenda and scaling', () => {
  it('a 60-minute lesson gets Soojendus 5 · Avasta 15 · Harjuta 20 · Kasuta 15 · Kokkuvõte 5', () => {
    expect(labels(defaultPlanSteps())).toEqual(['Soojendus 5', 'Avasta 15', 'Harjuta 20', 'Kasuta 15', 'Kokkuvõte 5']);
  });

  it('is scaled to the calendar lesson length, whole minutes, the sum exact', () => {
    const steps = defaultPlanSteps({ minutes: 45 });
    expect(steps.reduce((acc, step) => acc + step.minutes, 0)).toBe(45);
    expect(labels(steps)).toEqual(['Soojendus 4', 'Avasta 11', 'Harjuta 15', 'Kasuta 11', 'Kokkuvõte 4']);
    const ninety = defaultPlanSteps({ minutes: 90 });
    expect(ninety.reduce((acc, step) => acc + step.minutes, 0)).toBe(90);
    expect(scaleSteps([{ label: 'a', minutes: 1 }, { label: 'b', minutes: 1 }, { label: 'c', minutes: 1 }], 10).map((s) => s.minutes).reduce((a, b) => a + b)).toBe(10);
    // shorter than one minute a step: left as it is
    expect(scaleSteps([{ label: 'a', minutes: 5 }, { label: 'b', minutes: 5 }], 1).map((s) => s.minutes)).toEqual([5, 5]);
  });

  it('keeps only the worksheet phases present in the room', () => {
    expect(labels(defaultPlanSteps({ minutes: 60, phases: ['practice'] }))).toEqual(['Soojendus 10', 'Harjuta 40', 'Kokkuvõte 10']);
    expect(defaultPlanSteps({ phases: ['opik'] }).map((s) => s.label)).toEqual(['Soojendus', 'Avasta', 'Harjuta', 'Kasuta', 'Kokkuvõte']);
  });

  it('normalises edited steps (label, minutes 1–240, at most 12)', () => {
    const steps = normalizeSteps([{ label: '  ', minutes: 0 }, { id: 'x', label: 'Lugemine', minutes: '500' }, ...Array.from({ length: 20 }, () => ({ label: 'n', minutes: 2 }))]);
    expect(steps).toHaveLength(12);
    expect(steps[0]).toMatchObject({ label: 'Samm 1', minutes: 1, spentMs: 0 });
    expect(steps[1]).toMatchObject({ id: 'x', label: 'Lugemine', minutes: 240 });
  });
});

describe('lesson plan: the timer is derived from the timestamps', () => {
  const plan = emptyPlan(defaultPlanSteps());

  it('does not run before „Alusta”', () => {
    const clock = planClock(plan, T0);
    expect(clock).toMatchObject({ started: false, done: false, index: 0, count: 5, stepMs: 0, totalMs: 0, plannedTotalMs: min(60) });
  });

  it('runs per step and in total from startedAt / stepStartedAt (a reload gives the same clock)', () => {
    const started = startPlan(plan, T0);
    expect(started.startedAt).toBe('2026-11-04T10:00:00.000Z');
    const reloaded = JSON.parse(JSON.stringify(started));
    expect(planClock(reloaded, T0 + min(3))).toMatchObject({ index: 0, stepMs: min(3), totalMs: min(3), over: false });
    expect(planClock(reloaded, T0 + min(6)).over).toBe(true);
  });

  it('„Järgmine samm” closes the running step and starts the next one; going back adds to the earlier time', () => {
    let current = startPlan(plan, T0);
    current = nextStep(current, T0 + min(7));
    expect(current.steps[0].spentMs).toBe(min(7));
    expect(planClock(current, T0 + min(10))).toMatchObject({ index: 1, stepMs: min(3), totalMs: min(10), over: false });
    current = goToStep(current, 0, T0 + min(12));
    expect(planClock(current, T0 + min(13))).toMatchObject({ index: 0, stepMs: min(8) });
    expect(current.steps[1].spentMs).toBe(min(5));
  });

  it('after the last step the plan is done and the clock stops per step', () => {
    let current = startPlan(emptyPlan(defaultPlanSteps({ minutes: 10, phases: ['practice'] })), T0);
    current = nextStep(nextStep(nextStep(current, T0 + min(1)), T0 + min(8)), T0 + min(11));
    const clock = planClock(current, T0 + min(20));
    expect(clock).toMatchObject({ done: true, index: 3, step: null, stepMs: 0, totalMs: min(20) });
    expect(current.stepStartedAt).toBe('');
    expect(current.steps.map((s) => s.spentMs)).toEqual([min(1), min(7), min(3)]);
  });

  it('labels the clock m:ss / h:mm:ss', () => {
    expect(clockLabel(0)).toBe('0:00');
    expect(clockLabel(min(12) + 5000)).toBe('12:05');
    expect(clockLabel(min(61))).toBe('1:01:00');
  });
});
