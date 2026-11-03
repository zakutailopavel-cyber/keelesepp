import { describe, expect, it } from 'vitest';
import { PHASES, TASK_STATE, groupTasks, isTaskLate, learnerGoal, mergeTasks, taskCount, taskDueText, taskMinutes, tasksForSkill } from './taskList.js';

const TODAY = '2026-11-10';
const sheet = (id, extra = {}) => ({ id, studentId: 's1', title: 'Minu päev · Avasta', lessonTitle: 'Minu päev', phase: 'discover', status: 'new', answers: {}, ...extra });
const work = (id, extra = {}) => ({ id, studentId: 's1', task: `Ülesanne ${id}`, status: 'Ootel', due: '', ...extra });
const result = (id, kind, extra = {}) => ({ id, submissionKind: kind, studentId: 's1', title: 'Töö', reviewStatus: 'pending', completedAt: '2026-11-09T10:00:00.000Z', ...extra });

describe('mergeTasks: one row per task, whatever collection it lives in', () => {
  it('homework, sheets, exercise results and old interactive lessons become one list', () => {
    const tasks = mergeTasks({
      homework: [work('h1')],
      assignments: [sheet('a1')],
      submissions: [result('x1', 'exercise', { title: 'Vaba harjutus' })],
      interactive: [{ id: 'i1', title: 'Vana tund', status: 'active' }],
    });
    expect(tasks.map((task) => task.kind).sort()).toEqual(['homework', 'interactive', 'result', 'sheet']);
  });

  it('a homework pointing at a sheet is one task, in the sheet\'s state, and keeps the teacher\'s words', () => {
    const [task, ...rest] = mergeTasks({
      homework: [work('h1', { task: 'Tee see leht lõpuni', worksheetAssignmentId: 'a1', worksheetTitle: 'Minu päev', due: '2026-11-12', note: 'Vaata lk 2' })],
      assignments: [sheet('a1', { dueDate: '2026-11-12' })],
    });
    expect(rest).toEqual([]);
    expect(task).toMatchObject({ kind: 'sheet', title: 'Minu päev', teacherText: 'Tee see leht lõpuni', note: 'Vaata lk 2', due: '2026-11-12', state: TASK_STATE.TODO });
  });

  it('a linked homework whose sheet cannot be read stays a task of its own', () => {
    const tasks = mergeTasks({ homework: [work('h1', { worksheetAssignmentId: 'gone' })], assignments: [] });
    expect(tasks).toHaveLength(1);
    expect(tasks[0].kind).toBe('homework');
  });

  it('a submitted sheet is listed once, with its result', () => {
    const tasks = mergeTasks({ assignments: [sheet('a1', { status: 'done', completedAt: '2026-11-09T10:00:00.000Z' })], submissions: [result('a1', 'worksheet', { percentage: 80 })] });
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ state: TASK_STATE.WAITING, percentage: 80, title: 'Minu päev' });
  });

  it('a homework and its exercise result are one task; the reviewed try wins', () => {
    const tasks = mergeTasks({
      homework: [work('h1', { isExercise: true, exerciseId: 'e1', status: 'Tehtud' })],
      submissions: [
        result('r1', 'exercise', { homeworkId: 'h1', completedAt: '2026-11-09T12:00:00.000Z' }),
        result('r2', 'exercise', { homeworkId: 'h1', reviewStatus: 'reviewed', teacherFeedback: 'Tubli', completedAt: '2026-11-08T12:00:00.000Z' }),
      ],
    });
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ kind: 'exercise', state: TASK_STATE.REVIEWED, feedback: 'Tubli' });
  });

  it('reads the homework id of a result from the stored document too', () => {
    const tasks = mergeTasks({ homework: [work('h1', { isExercise: true, exerciseId: 'e1', status: 'Tehtud' })], submissions: [result('r1', 'exercise', { source: { homeworkId: 'h1' } })] });
    expect(tasks).toHaveLength(1);
  });

  it('a sheet opened from the course is not a task until a teacher looked at it', () => {
    const own = sheet('a1', { source: 'self_study' });
    expect(mergeTasks({ assignments: [own] })).toEqual([]);
    expect(mergeTasks({ assignments: [{ ...own, status: 'done', completedAt: '2026-11-09' }] })).toEqual([]);
    expect(mergeTasks({ submissions: [result('a1', 'worksheet', { source: { source: 'self_study' } })] })).toEqual([]);
    expect(mergeTasks({ assignments: [{ ...own, status: 'done', reviewStatus: 'reviewed', teacherFeedback: 'Hea' }] })[0].state).toBe(TASK_STATE.REVIEWED);
  });

  it('what the teacher closed is not listed, the sheet behind it neither', () => {
    expect(mergeTasks({ homework: [work('h1', { status: 'Suletud' })] })).toEqual([]);
    expect(mergeTasks({ homework: [work('h1', { status: 'Suletud', worksheetAssignmentId: 'a1' })], assignments: [sheet('a1')] })).toEqual([]);
  });

  it('never invents a reviewed state: an automatic percentage is not the teacher', () => {
    const [task] = mergeTasks({ submissions: [result('a1', 'worksheet', { percentage: 90 })] });
    expect(task.state).toBe(TASK_STATE.WAITING);
    expect(task.feedback).toBe('');
  });

  it('old records with feedback and no review status count as reviewed', () => {
    const [task] = mergeTasks({ assignments: [sheet('a1', { status: 'done', teacherGrade: 4 })] });
    expect(task.state).toBe(TASK_STATE.REVIEWED);
    expect(task.grade).toBe(4);
  });

  it('interactive lessons follow their own status', () => {
    const states = mergeTasks({ interactive: ['active', 'submitted', 'reviewed'].map((status) => ({ id: status, status, title: status })) }).map((task) => task.state);
    expect(states).toEqual([TASK_STATE.TODO, TASK_STATE.WAITING, TASK_STATE.REVIEWED]);
  });
});

describe('groupTasks: Tee nüüd / Tehtud / Õpetaja vaatas üle', () => {
  it('what is late comes first, then the nearest deadline, no deadline last', () => {
    const tasks = mergeTasks({ homework: [work('none'), work('soon', { due: '2026-11-12' }), work('late2', { due: '2026-11-09' }), work('late1', { due: '2026-11-01' })] });
    expect(groupTasks(tasks).todo.map((task) => task.homework.id)).toEqual(['late1', 'late2', 'soon', 'none']);
  });

  it('inside one lesson the three sheets go in their order, whatever order they come', () => {
    const lesson = (id, phase) => sheet(id, { phase, lessonId: 'l1', assignedAt: '2026-11-01T10:00:00.000Z', dueDate: '2026-11-20' });
    const tasks = mergeTasks({ assignments: [lesson('c', 'transfer'), lesson('a', 'discover'), lesson('b', 'practice')] });
    expect(groupTasks(tasks).todo.map((task) => task.phase)).toEqual(['discover', 'practice', 'transfer']);
  });

  it('done work: the newest first; reviewed work: the newest review first', () => {
    const tasks = mergeTasks({
      homework: [work('old', { status: 'Tehtud', submittedAt: '2026-11-01T10:00:00.000Z' }), work('new', { status: 'Tehtud', submittedAt: '2026-11-09T10:00:00.000Z' })],
      assignments: [
        sheet('r1', { status: 'done', reviewStatus: 'reviewed', reviewedAt: '2026-11-02T10:00:00.000Z' }),
        sheet('r2', { status: 'done', reviewStatus: 'reviewed', reviewedAt: '2026-11-08T10:00:00.000Z' }),
      ],
    });
    const groups = groupTasks(tasks);
    expect(groups.waiting.map((task) => task.homework.id)).toEqual(['new', 'old']);
    expect(groups.reviewed.map((task) => task.sheet.id)).toEqual(['r2', 'r1']);
  });

  it('a late task is only an open one', () => {
    expect(isTaskLate({ state: TASK_STATE.TODO, due: '2026-11-09' }, TODAY)).toBe(true);
    expect(isTaskLate({ state: TASK_STATE.TODO, due: TODAY }, TODAY)).toBe(false);
    expect(isTaskLate({ state: TASK_STATE.WAITING, due: '2026-11-09' }, TODAY)).toBe(false);
    expect(isTaskLate({ state: TASK_STATE.TODO, due: '' }, TODAY)).toBe(false);
  });
});

describe('the card says only what is known', () => {
  it('why: the sheet\'s promise, else a goal said to the learner, else nothing', () => {
    expect(learnerGoal({ canDo: 'Ma räägin oma päevast.', goals: { a: 'Õpilane teab sõnu.' } })).toBe('Ma räägin oma päevast.');
    expect(learnerGoal({ goals: { a: 'Õpilane teab sõnu.', b: 'Kirjutan lauseid.' } })).toBe('Kirjutan lauseid.');
    expect(learnerGoal({ goals: [{ id: 'a', label: 'Ma oskan lugeda.' }] })).toBe('Ma oskan lugeda.');
    expect(learnerGoal({ goals: { a: 'Õpilane teab sõnu.' } })).toBe('');
    expect(learnerGoal({})).toBe('');
    expect(learnerGoal(undefined)).toBe('');
  });

  it('a done task has no goal or time line, a plain task has none at all', () => {
    const meta = { canDo: 'Ma loen.' };
    const blocks = [{ type: 'gaps', data: { sentences: Array(20).fill('Ma [loen].').join('\n') } }];
    const [open] = mergeTasks({ assignments: [sheet('a1', { worksheetDoc: { meta, blocks } })] });
    expect(open.goal).toBe('Ma loen.');
    expect(open.minutes).toBeGreaterThan(0);
    const [done] = mergeTasks({ assignments: [sheet('a1', { status: 'done', worksheetDoc: { meta, blocks } })] });
    expect(done.goal).toBe('');
    expect(done.minutes).toBe(0);
    const [plain] = mergeTasks({ homework: [work('h1')] });
    expect(plain).toMatchObject({ goal: '', minutes: 0 });
  });

  it('time comes from the sheet\'s own blocks, rounded up to five minutes; no blocks, no time', () => {
    expect(taskMinutes({ meta: {}, blocks: [{ type: 'gaps', data: { sentences: Array(20).fill('Ma [loen].').join('\n') } }] })).toBe(10);
    expect(taskMinutes({ blocks: [] })).toBe(0);
    expect(taskMinutes(null)).toBe(0);
  });

  it('the deadline in words; no deadline says nothing', () => {
    expect(taskDueText('', TODAY)).toBe('');
    expect(taskDueText(TODAY, TODAY)).toBe('Tähtaeg täna');
    expect(taskDueText('2026-11-11', TODAY)).toBe('Tähtaeg homme');
    expect(taskDueText('2026-11-09', TODAY)).toBe('Tähtaeg oli eile');
    expect(taskDueText('2026-11-07', TODAY)).toBe('Tähtaeg oli 3 päeva tagasi');
    expect(taskDueText('2026-11-20', TODAY)).toMatch(/^Tähtaeg 20/);
    expect(taskDueText('not a date', TODAY)).toBe('');
  });

  it('the three phases say what they are for and keep their order', () => {
    expect(['discover', 'practice', 'transfer'].map((phase) => PHASES[phase].step)).toEqual([1, 2, 3]);
    expect(['discover', 'practice', 'transfer'].map((phase) => PHASES[phase].label)).toEqual(['Avasta', 'Harjuta', 'Kasuta']);
    Object.values(PHASES).forEach((phase) => { expect(phase.purpose).toBeTruthy(); expect(phase.ru).toBeTruthy(); });
  });

  it('counts in correct Estonian', () => {
    expect(taskCount(1)).toBe('1 ülesanne');
    expect(taskCount(3)).toBe('3 ülesannet');
  });

  it('never shows a stored title with the technical phase suffix', () => {
    const [task] = mergeTasks({ assignments: [sheet('a1', { lessonTitle: '', worksheetDoc: null, title: 'Tund · Harjuta', phase: 'practice' })] });
    expect(task.title).toBe('Tund');
  });
});

describe('tasksForSkill: the tasks behind a hint „Kuulamine 0% → 70%”', () => {
  const doc = (...types) => ({ meta: {}, blocks: types.map((type, i) => ({ id: `b${i}`, type, data: {} })) });
  const tasks = mergeTasks({
    homework: [work('h1')],
    assignments: [sheet('listen', { worksheetDoc: doc('text', 'listening') }), sheet('dict', { worksheetDoc: doc('dictation', 'gaps') }), sheet('gram', { worksheetDoc: doc('gaps') })],
    submissions: [result('r1', 'worksheet', { source: { worksheetDoc: doc('listening') } }), result('x1', 'exercise')],
  });
  it('only sheets with a task of that skill, a handed-in one too; plain homework says nothing about a skill', () => {
    expect(tasksForSkill(tasks, 'Kuulamine').map((task) => task.key)).toEqual(['sheet-listen', 'sheet-dict', 'worksheet-r1']);
    expect(tasksForSkill(tasks, 'Grammatika').map((task) => task.key)).toEqual(['sheet-dict', 'sheet-gram']);
    expect(tasksForSkill(tasks, 'Kirjutamine')).toEqual([]);
  });
  it('no skill: every task', () => {
    expect(tasksForSkill(tasks, '')).toBe(tasks);
  });
});
