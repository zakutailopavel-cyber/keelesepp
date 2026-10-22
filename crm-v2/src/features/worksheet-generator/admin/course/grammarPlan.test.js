import { COURSE_MODULES } from './registry.js';
import { GRAMMAR_PLAN, grammarGaps } from './grammarPlan.js';

const lessonsOf = (course) => Object.fromEntries(COURSE_MODULES.filter((m) => m.MODULE.course === course).flatMap((m) => Object.entries(m.LESSONS).map(([id, lesson]) => [id, { lesson, module: m.MODULE.id }])));

describe('grammar plan of the levels (docs/METHODOLOGY_STANDARD.md §5)', () => {
  it.each(Object.keys(GRAMMAR_PLAN))('%s: every listed lesson exists and teaches with a notice block', (course) => {
    const lessons = lessonsOf(course);
    const modules = new Set(Object.values(lessons).map((l) => l.module));
    const problems = GRAMMAR_PLAN[course].flatMap((item) => [
      ...item.lessons.filter((id) => !lessons[id]).map((id) => `${item.id}: tundi ${id} pole`),
      ...item.lessons.filter((id) => lessons[id] && !['discover', 'practice', 'transfer'].some((p) => (lessons[id].lesson[p] || []).some((b) => b.type === 'notice'))).map((id) => `${item.id}: ${id} — märkamise plokki pole`),
      ...(item.module && !modules.has(item.module) ? [`${item.id}: moodulit ${item.module} pole`] : []),
    ]);
    expect(problems).toEqual([]);
  });

  // the course's grammar gaps; when a lesson starts to teach an item, add it to the plan and remove the item here
  it('lists the known gaps', () => {
    expect(grammarGaps().map((g) => `${g.level} ${g.id}`)).toEqual([
      'a2 short-illative', 'a2 pluperfect', 'a2 impersonal', 'a2 participles', 'a2 des-form',
      
      'b2 nominalisation', 'b2 change', 'b2 essive', 'b2 subject', 'b2 clitics',
      'c1 nuks', 'c1 indirect-questions',
    ]);
  });
});
