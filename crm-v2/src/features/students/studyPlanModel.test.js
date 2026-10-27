import { describe, expect, it } from 'vitest';
import { autoPlan, lessonResults, lessonState, movePlanLesson, nextPlannedLesson, planRows, recommendLessons } from './studyPlanModel.js';
import { suggestTopic } from '../calendar/lessonTopic.js';

const lesson = (id, n, moduleTitle = 'Moodul 1') => ({ id, title: `Tund ${n}`, number: n, level: 'B1', moduleKey: moduleTitle, moduleTitle });
const lessons = [lesson('l1', 1), lesson('l2', 2), lesson('l3', 3), lesson('l4', 4, 'Moodul 2'), lesson('l5', 5, 'Moodul 2')];
const catalog = { levels: [{ key: 'B1', label: 'B1', modules: [{ key: 'm1', label: 'Moodul 1', lessons: lessons.slice(0, 3) }, { key: 'm2', label: 'Moodul 2', lessons: lessons.slice(3) }] }], byId: new Map(lessons.map((item) => [item.id, item])) };

describe('Õppeplaan', () => {
  const assignments = [
    { lessonId: 'l1', status: 'done', score: { pct: 92 }, completedAt: '2026-10-01' },
    { lessonId: 'l2', status: 'done', score: { correct: 3, total: 10 }, completedAt: '2026-10-05' },
    { lessonId: 'l2', status: 'done', score: { pct: 50 }, completedAt: '2026-10-06' },
    { lessonId: 'l4', status: 'new' },
  ];
  const records = [{ topicLessonId: 'l3', date: '2026-10-10', status: 'Toimunud' }, { topicLessonId: 'l5', date: '2026-10-11', status: 'Puudus_p' }];
  const results = lessonResults({ assignments, records });

  it('sums the student results per course lesson', () => {
    expect(results.get('l1')).toMatchObject({ pct: 92, sheets: 1 });
    expect(results.get('l2')).toMatchObject({ pct: 40, sheets: 2, last: '2026-10-06' });
    expect(results.get('l3')).toMatchObject({ pct: null, held: true });
    expect(results.has('l4')).toBe(false);
    expect(results.has('l5')).toBe(false);
    expect(['l1', 'l2', 'l3', 'l4'].map((id) => lessonState(results.get(id)))).toEqual(['mastered', 'repeat', 'done', 'new']);
  });

  it('recommends weak lessons to repeat first, then new lessons in course order; never what is learned or planned', () => {
    const recommended = recommendLessons({ catalog, level: 'B1', results });
    expect(recommended.map((item) => [item.lesson.id, item.kind])).toEqual([['l2', 'repeat'], ['l4', 'next'], ['l5', 'next']]);
    expect(recommended[0].reason).toBe('Korda: tulemus 40%');
    expect(recommendLessons({ catalog, level: 'B1', results, plan: { lessons: [{ id: 'l4' }] } }).map((item) => item.lesson.id)).toEqual(['l2', 'l5']);
    expect(autoPlan({ catalog, level: 'B1', results })).toEqual([{ id: 'l2', status: 'planned' }, { id: 'l4', status: 'planned' }, { id: 'l5', status: 'planned' }]);
  });

  it('shows the plan with results, moves lessons, and gives the calendar the next open lesson', () => {
    const plan = { updatedAt: '2026-10-20', lessons: [{ id: 'l3', status: 'planned' }, { id: 'l2', status: 'skipped' }, { id: 'l4', status: 'planned' }] };
    expect(planRows({ plan, catalog, results }).map((row) => row.state)).toEqual(['done', 'skipped', 'new']);
    expect(nextPlannedLesson({ plan, catalog, results }).id).toBe('l4');
    expect(movePlanLesson(plan.lessons, 'l4', -1).map((item) => item.id)).toEqual(['l3', 'l4', 'l2']);
    // the calendar: l3 was held before the plan (kept to repeat), so it is the next topic; after it is held again → l4
    expect(suggestTopic(catalog, { studentLevel: 'B1', history: records, plan }).id).toBe('l3');
    expect(suggestTopic(catalog, { studentLevel: 'B1', history: [{ topicLessonId: 'l3', date: '2026-10-21' }], plan }).id).toBe('l4');
    expect(suggestTopic(catalog, { studentLevel: 'B1', history: [] }).id).toBe('l1');
  });
});

describe('plan pace', () => {
  it('lessons left, weeks to the target, lessons a week needed and the timetable now', async () => {
    const { planPace, weeklyLessonsNow } = await import('./studyPlanModel.js');
    const plan = { targetDate: '2026-12-31', lessons: Array.from({ length: 20 }, (_, i) => ({ id: `x${i}`, status: i === 0 ? 'skipped' : 'planned' })) };
    const schedule = [{ recurring: true, status: 'Planeeritud' }, { recurring: true, status: 'Planeeritud', endDate: '2026-10-01' }, { recurring: false }];
    const today = '2026-10-27';
    expect(weeklyLessonsNow(schedule, today)).toBe(1);
    expect(planPace({ plan, doneIds: new Set(['x1', 'x2']), today, weeklyNow: 1 })).toEqual({ remaining: 17, weeks: 10, needed: 2, weeklyNow: 1, status: 'behind' });
    expect(planPace({ plan, today, weeklyNow: 2 }).status).toBe('ok');
    expect(planPace({ plan: { ...plan, targetDate: '' }, today })).toBeNull();
  });

  it('the planner gives a student at least the lessons a week the plan needs', async () => {
    const { planningRequests } = await import('../calendar/plannerModel.js');
    const student = { id: 's1', name: 'Mia', teacher: 'Pavel', teacherUid: 't1', subject: 'Eesti keel', studyPlan: { targetDate: '2026-12-31', lessons: Array.from({ length: 30 }, (_, i) => ({ id: `x${i}`, status: 'planned' })) } };
    const [request] = planningRequests({ students: [student], today: '2026-10-27', lessons: [{ studentId: 's1', topicLessonId: 'x0', status: 'Toimunud' }] });
    expect(request.perWeek).toBe(3); // 29 lessons in 10 weeks
    const [plain] = planningRequests({ students: [{ ...student, studyPlan: null }], today: '2026-10-27' });
    expect(plain.perWeek).toBe(1);
  });
});
