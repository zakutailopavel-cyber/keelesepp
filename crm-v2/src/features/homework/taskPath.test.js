import { describe, expect, it } from 'vitest';
import { mergeTasks, TASK_STATE } from './taskList.js';
import { buildPath, isOldTask, isWordTask, lessonNodes, nextTask, OLD_DAYS, pathQueue, taskLink, taskMinutes } from './taskPath.js';

const today = '2026-11-10';
const at = (day) => `${day}T16:00:00.000Z`;
const sheet = (lessonId, phase, day, extra = {}) => ({ id: `${lessonId}-${phase}`, studentId: 's', lessonId, lessonTitle: `Tund ${lessonId}`, title: `Tund ${lessonId} · ${phase}`, phase, status: 'new', answers: {}, assignedAt: at(day), dueDate: '', source: 'learning_library', ...extra });
const lesson = (lessonId, day, extra = {}) => ['transfer', 'discover', 'practice'].map((phase) => sheet(lessonId, phase, day, extra));
const work = (id, task, extra = {}) => ({ id, studentId: 's', task, status: 'Ootel', due: '', date: '2026-11-08', ...extra });
const tasksOf = (input) => mergeTasks(input);

describe('word-card tasks (isWordTask)', () => {
  const as = (task, extra = {}) => tasksOf({ homework: [work('h', task, extra)] })[0];
  it('finds the teacher\'s word-card words, Estonian and Russian', () => {
    ['Korda tunni sõnu sõnakaartidega 10 minutit', 'Õpi sõnad', 'Korda tunni sõnu („Minu sõnad” → „Harjuta”)', 'Harjuta uusi sõnu', 'Tee sõnakaardid läbi', 'Повтори слова урока', 'Flashcards: 10 min']
      .forEach((text) => expect(isWordTask(as(text)), text).toBe(true));
  });
  it('a writing task with words, a sheet, a voice task are not', () => {
    ['Kirjuta 5 lauset uute sõnadega', 'Loe tekst ja vasta küsimustele', 'Õpi luuletus', 'Kirjuta sõnaraamatu abil kiri'].forEach((text) => expect(isWordTask(as(text)), text).toBe(false));
    expect(isWordTask(as('Korda sõnu', { kind: 'voice' }))).toBe(false);
    expect(isWordTask(tasksOf({ assignments: [sheet('a', 'discover', '2026-11-09', { lessonTitle: 'Korda sõnu' })] })[0])).toBe(false);
  });
  it('a structured flag wins over the words', () => {
    expect(isWordTask(as('Tee see ära', { kind: 'words' }))).toBe(true);
    expect(isWordTask(as('Tee see ära', { practice: 'words' }))).toBe(true);
  });
  it('opens the cards in „Harjuta”; other tasks open on „Ülesanded”', () => {
    expect(taskLink(as('Õpi sõnad'))).toBe('/student/harjuta?kaardid=h');
    expect(taskLink(as('Kirjuta kiri'))).toBe('/homework?ava=homework-h');
    expect(taskLink({ kind: 'monologue', to: '/student/monoloog' })).toBe('/student/monoloog');
  });
  it('minutes: the sheet\'s own estimate, the number the teacher wrote, else about 5', () => {
    expect(taskMinutes(as('Korda tunni sõnu sõnakaartidega 10 minutit'))).toBe(10);
    expect(taskMinutes(as('Kirjuta kiri'))).toBe(5);
    expect(taskMinutes({ state: TASK_STATE.TODO, minutes: 15 })).toBe(15);
    expect(taskMinutes({ state: TASK_STATE.WAITING, minutes: 15 })).toBe(0);
  });
});

describe('lessons as nodes (lessonNodes)', () => {
  it('a lesson\'s three sheets are one node in the order Avasta → Harjuta → Kasuta, the teacher line once', () => {
    const assignments = lesson('b1-07', '2026-10-09');
    const homework = assignments.map((item) => work(`hw-${item.id}`, 'Testülesanne', { worksheetAssignmentId: item.id, invitationId: 'inv-1' }));
    homework.push(work('hw-words', 'Korda tunni sõnu sõnakaartidega', { invitationId: 'inv-1' }));
    const nodes = lessonNodes(tasksOf({ homework, assignments }), today);
    expect(nodes).toHaveLength(1);
    const [node] = nodes;
    expect(node).toMatchObject({ kind: 'lesson', title: 'Tund b1-07', total: 4, open: 4, state: 'todo', notes: ['Testülesanne'] });
    expect(node.phases.map((item) => item.phase)).toEqual(['discover', 'practice', 'transfer']);
    // the free task given in the same lesson stands in that lesson, after its sheets
    expect(node.steps.map((task) => task.title)).toEqual(['Korda tunni sõnu sõnakaartidega']);
    expect(node.current.phase).toBe('discover');
  });
  it('a lesson given twice keeps both copies visible; a free task alone is its own node', () => {
    const assignments = [...lesson('b1-01', '2026-11-01'), sheet('b1-01', 'discover', '2026-11-08', { id: 'again' })];
    const nodes = lessonNodes(tasksOf({ assignments, homework: [work('x', 'Loe raamatut')] }), today);
    const lessonNode = nodes.find((node) => node.kind === 'lesson');
    expect(lessonNode.total).toBe(4);
    expect(lessonNode.phases).toHaveLength(3);
    expect(lessonNode.steps).toHaveLength(1);
    expect(nodes.find((node) => node.kind === 'task').title).toBe('Loe raamatut');
  });
});

describe('the one order and the next step (pathQueue / nextTask)', () => {
  it('started first, then a deadline soon, then the newest lesson (Avasta first), old work last', () => {
    const assignments = [
      ...lesson('old', '2026-10-01'),
      ...lesson('mid', '2026-11-03'),
      ...lesson('new', '2026-11-09'),
      sheet('begun', 'practice', '2026-11-02', { answers: { a: 'x' } }),
    ];
    const homework = [work('soon', 'Homne töö', { due: '2026-11-11' })];
    const order = pathQueue(tasksOf({ assignments, homework }), today).map((task) => task.key);
    expect(order.slice(0, 5)).toEqual(['sheet-begun-practice', 'homework-soon', 'sheet-new-discover', 'sheet-new-practice', 'sheet-new-transfer']);
    expect(order.slice(-3)).toEqual(['sheet-old-discover', 'sheet-old-practice', 'sheet-old-transfer']);
    expect(nextTask(tasksOf({ assignments: lesson('new', '2026-11-09') }), today).key).toBe('sheet-new-discover');
  });
  it('a recently missed deadline still leads, gently; one older than two weeks does not', () => {
    const recent = work('recent', 'Eilne', { due: '2026-11-09' });
    const old = work('old', 'Ammune', { due: '2026-10-10' });
    const tasks = tasksOf({ homework: [old, recent], assignments: lesson('new', '2026-11-09') });
    expect(nextTask(tasks, today).key).toBe('homework-recent');
    expect(pathQueue(tasks, today).at(-1).key).toBe('homework-old');
  });
  it('the owner\'s case: everything a month old → the newest old lesson is next', () => {
    const tasks = tasksOf({ assignments: [...lesson('a', '2026-10-09', { dueDate: '2026-10-11' }), ...lesson('b', '2026-10-12', { dueDate: '2026-10-14' })] });
    expect(nextTask(tasks, today).key).toBe('sheet-b-discover');
  });
  it('the monthly monologue comes after urgent work and before the lessons', () => {
    const monologue = { key: 'mono', kind: 'monologue', state: TASK_STATE.TODO, title: 'Kuu monoloog', due: '2026-11-30' };
    const tasks = [...tasksOf({ assignments: lesson('new', '2026-11-09'), homework: [work('soon', 'Homme', { due: '2026-11-11' })] }), monologue];
    expect(pathQueue(tasks, today).map((task) => task.key).slice(0, 3)).toEqual(['homework-soon', 'mono', 'sheet-new-discover']);
  });
  it('nothing open → no next step', () => {
    expect(nextTask(tasksOf({ homework: [work('d', 'Tehtud töö', { status: 'Tehtud' })] }), today)).toBeNull();
  });
});

describe('the page (buildPath): old work folded, done work folded', () => {
  it(`work older than ${OLD_DAYS} days folds into „Vanad”; the node holding the next step stays on the path`, () => {
    const assignments = [...lesson('a', '2026-10-01'), ...lesson('b', '2026-10-05'), ...lesson('c', '2026-11-08')];
    const path = buildPath(tasksOf({ assignments }), today);
    expect(path.next.key).toBe('sheet-c-discover');
    expect(path.path.map((node) => node.title)).toEqual(['Tund c']);
    expect(path.old.map((node) => node.title)).toEqual(['Tund b', 'Tund a']);
    expect(path.oldCount).toBe(6);
    expect(isOldTask(path.old[0].tasks[0], today)).toBe(true);
  });
  it('only old work: the newest old lesson leads the path, the others wait folded', () => {
    const path = buildPath(tasksOf({ assignments: [...lesson('a', '2026-10-01'), ...lesson('b', '2026-10-05')] }), today);
    expect(path.path.map((node) => node.title)).toEqual(['Tund b']);
    expect(path.old.map((node) => node.title)).toEqual(['Tund a']);
  });
  it('a lesson half done stays on the path; a lesson all done goes to „Tehtud”', () => {
    const half = lesson('h', '2026-11-08').map((item) => (item.phase === 'discover' ? { ...item, status: 'done', completedAt: at('2026-11-09') } : item));
    const done = lesson('d', '2026-11-05').map((item) => ({ ...item, status: 'done', completedAt: at('2026-11-06') }));
    const path = buildPath(tasksOf({ assignments: [...half, ...done] }), today);
    expect(path.path[0]).toMatchObject({ title: 'Tund h', done: 1, total: 3 });
    expect(path.path[0].current.phase).toBe('practice');
    expect(path.done.map((node) => node.title)).toEqual(['Tund d']);
    expect(path.open).toBe(2);
  });
});
