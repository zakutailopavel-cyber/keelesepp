// „Kuu sammud” (owner 2026-10-23: цель на месяц — мини-шаги из самих уроков и то, как они усвоены): the „Ma oskan …”
// goals of the lessons a student worked on in the last 30 days, each with how well it is mastered — from the auto-check
// per goal of his submitted sheets (score.perGoal). No invented targets: only the course's own steps.
import { goalEntries } from '../worksheet-studio/engine/goals.js';

const DAY = 86400000;
export const MASTERED = 80;
export const PRACTISE = 50;
const time = (value) => (typeof value?.toMillis === 'function' ? value.toMillis() : Date.parse(value || '') || 0);
const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

export const stepState = (pct) => (pct === null ? 'todo' : pct >= MASTERED ? 'mastered' : pct >= PRACTISE ? 'practise' : 'review');
export const STEP_LABEL = { mastered: 'Selge', practise: 'Harjuta veel', review: 'Kordame', todo: 'Veel tegemata' };

export function monthSteps(assignments = [], { now = Date.now(), days = 30 } = {}) {
  const from = now - days * DAY;
  const steps = new Map();
  assignments
    .filter((item) => time(item.completedAt || item.assignedAt) >= from && (item.worksheetDoc?.meta?.goals))
    .sort((a, b) => time(a.completedAt || a.assignedAt) - time(b.completedAt || b.assignedAt))
    .forEach((item) => {
      const lesson = clean(item.lessonTitle || item.worksheetDoc.meta.title || item.title) || 'Tund';
      const perGoal = item.status === 'done' ? item.score?.perGoal || {} : {};
      goalEntries(item.worksheetDoc.meta.goals).forEach(([id, label]) => {
        const text = clean(label);
        if (!text) return;
        const key = `${lesson}|${text}`;
        const step = steps.get(key) || { key, lesson, goal: text, ok: 0, total: 0 };
        const result = perGoal[id];
        if (result?.total) { step.ok += Number(result.ok) || 0; step.total += Number(result.total) || 0; }
        steps.set(key, step);
      });
    });
  const list = [...steps.values()].map((step) => {
    const pct = step.total ? Math.round((step.ok / step.total) * 100) : null;
    return { ...step, pct, state: stepState(pct) };
  });
  const counts = list.reduce((sum, step) => ({ ...sum, [step.state]: (sum[step.state] || 0) + 1 }), {});
  return { steps: list, total: list.length, mastered: counts.mastered || 0, practise: counts.practise || 0, review: counts.review || 0, todo: counts.todo || 0 };
}
