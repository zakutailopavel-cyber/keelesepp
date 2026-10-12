// „Õpi ise” (owner 2026-10-12): the course on one's own. Progress of a lesson = its three sheets (Avasta, Harjuta,
// Kasuta) from the student's worksheet assignments (self-study or given by the teacher), whatever the source.
export const PHASES = [
  { key: 'discover', label: 'Avasta' },
  { key: 'practice', label: 'Harjuta' },
  { key: 'transfer', label: 'Kasuta' },
];

const phaseOf = (assignment) => assignment.phase || assignment.worksheetDoc?.meta?.phase || '';
const pct = (assignment) => {
  const score = assignment.score;
  if (score && Number.isFinite(score.pct)) return score.pct;
  if (score && score.total) return Math.round((score.correct / score.total) * 100);
  return null;
};

// { `${lessonId}|${phase}`: { status: 'done' | 'started', pct, assignment } } — a done sheet wins over an open one
export function progressMap(assignments = []) {
  const map = {};
  for (const assignment of assignments) {
    const phase = phaseOf(assignment);
    if (!assignment.lessonId || !phase) continue;
    const key = `${assignment.lessonId}|${phase}`;
    const done = assignment.status === 'done' || Boolean(assignment.completedAt);
    const entry = { status: done ? 'done' : 'started', pct: done ? pct(assignment) : null, assignment };
    if (!map[key] || (done && map[key].status !== 'done')) map[key] = entry;
  }
  return map;
}

export function lessonProgress(lessonId, map) {
  const phases = PHASES.map((phase) => ({ ...phase, ...(map[`${lessonId}|${phase.key}`] || { status: 'none', pct: null }) }));
  return { phases, done: phases.filter((phase) => phase.status === 'done').length };
}

// where to go on: the first lesson of the level that was started but is not finished, else the first untouched one
export function nextLesson(lessons = [], map = {}) {
  const started = lessons.find((lesson) => { const p = lessonProgress(lesson.id, map); return p.done < 3 && p.phases.some((ph) => ph.status !== 'none'); });
  return started || lessons.find((lesson) => lessonProgress(lesson.id, map).phases.every((ph) => ph.status === 'none')) || null;
}
