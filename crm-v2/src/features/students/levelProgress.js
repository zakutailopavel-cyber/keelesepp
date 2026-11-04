// Levels and the course a card works on (owner 2026-10-12, „Minu kursus”, the admin's „Teekond sihttasemeni”, the
// „Keeleoskus” curve). The student's older „Minu areng” card (level path, skills against the bar, three next steps) was
// removed on 2026-11-04: the „Keeleoskus” curve (progress-points/) is the one progress card the student and parents see.

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const READY = 70; // a skill / a goal counts as ready from here
const norm = (value) => { const level = String(value || '').toUpperCase().replace(/[^ABC12]/g, '').slice(0, 2); return LEVELS.includes(level) ? level : ''; };

// where a card stands: the way from its level to its target and the course he works on now, the next level's (courses
// are named by the level they lead to: from A2 he takes „Eesti keel B1”). One rule for „Minu kursus” and „Teekond sihttasemeni”.
export function coursePath(level, target) {
  const from = norm(level) || 'A1';
  const to = norm(target) || LEVELS[Math.min(LEVELS.length - 1, LEVELS.indexOf(from) + 1)];
  const a = LEVELS.indexOf(from);
  const b = Math.max(a, LEVELS.indexOf(to));
  const reached = a >= b;
  return { from, to, a, b, reached, step: reached ? from : LEVELS[a + 1], levels: LEVELS.slice(a, b + 1), known: Boolean(norm(level)) };
}

// the same catalogue key for a card learning English: „English B1”
export const courseKeyFor = (step, subject = '') => (/inglise|english/i.test(subject) ? `English ${step}` : step);
