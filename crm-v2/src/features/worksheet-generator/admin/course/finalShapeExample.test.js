import * as example from './finalShapeExample.js';
import { moduleSheets } from './registry.js';
import { finalShapeProblems, lessonsFromModules } from '../../../worksheet-studio/didactics/finalShape.js';
import { keysProblems } from '../../../worksheet-studio/didactics/gates.js';

// The example of docs/FINAL_SHAPE_AUTHORING.md must stay a lesson that passes the lesson rules (V9–V13, V15).
// The module and course rules (V1–V8, V14) need a whole module and course, so they are not asked of one lesson.
const LESSON_RULES = ['V9', 'V10', 'V11', 'V12', 'V13', 'V15'];
describe('the final-shape example lesson', () => {
  const lessons = lessonsFromModules([example], moduleSheets);
  it('passes every lesson rule', () => {
    const problems = finalShapeProblems(lessons).filter((p) => LESSON_RULES.includes(p.rule) && p.lessonId !== '*');
    expect(problems.map((p) => `${p.phase} ${p.check}: ${p.text}`)).toEqual([]);
  });
  it('carries its archetype and has working answer keys', () => {
    expect(lessons[0]).toMatchObject({ archetype: 'KUUL', lead: { input: 'L', output: 'W' } });
    const errors = Object.values(moduleSheets(example)['naidis-031']).flatMap((doc) => keysProblems(doc).filter((p) => p.level === 'error'));
    expect(errors).toEqual([]);
  });
});
