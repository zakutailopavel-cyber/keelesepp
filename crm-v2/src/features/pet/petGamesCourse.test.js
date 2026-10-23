import { COURSE_MODULES, moduleSheets } from '../worksheet-generator/admin/course/registry.js';
import { GAMES, courseTopics, learnerTopics, sheetLanguage } from './petGames.js';

// The pet's topic games come from the course sheets of the lessons a learner has had. This runs the extraction over
// every lesson of the Estonian courses, so a content rewrite cannot silently leave a lesson without games.
const MIN_GAMES = 2;

function courseLessons() {
  return COURSE_MODULES.filter((mod) => (mod.MODULE.language || 'et') === 'et').flatMap((mod) => {
    const sheets = moduleSheets(mod);
    return Object.keys(mod.LESSONS).filter((id) => !mod.LESSONS[id].assessment).map((id) => ({ id, phases: sheets[id] }));
  });
}

describe('pet games on the real course', () => {
  const lessons = courseLessons();

  it('every non-assessment lesson of the Estonian courses gives at least two games', () => {
    expect(lessons.length).toBeGreaterThan(100);
    const poor = [];
    const totals = Object.fromEntries(GAMES.map((g) => [g.key, 0]));
    for (const lesson of lessons) {
      const records = Object.entries(lesson.phases).map(([phase, doc]) => ({ id: phase, worksheetDoc: doc }));
      const [topic] = learnerTopics(courseTopics([{ date: '2026-10-01', topicLessonId: lesson.id, topic: lesson.id }], { [lesson.id]: records }));
      const games = topic?.games || [];
      games.forEach((g) => { totals[g] += 1; });
      if (games.length < MIN_GAMES) poor.push(`${lesson.id}: ${games.join(', ') || '—'}`);
    }
    expect(totals.catch + totals.order).toBeGreaterThan(lessons.length);
    expect(poor).toEqual([]);
  });

  it('the English course is not Estonian', () => {
    const en = COURSE_MODULES.find((mod) => mod.MODULE.course === 'en');
    const [id] = Object.keys(en.LESSONS);
    const doc = Object.values(moduleSheets(en)[id])[0];
    expect(sheetLanguage(doc, id)).toBe('en');
  });
});
