// „Ülesanded” as a path (owner 2026-11-10: „где наш формат дуалинго” → „делай Ülesanded как дуалинго”). The flat list
// of big red cards became: ONE next step on top, then the lessons as nodes (a lesson's Avasta / Harjuta / Kasuta are one
// node with 1/3 · 2/3 · 3/3), the teacher's free tasks as simple steps near their lesson, work older than OLD_DAYS
// folded into „Vanad ülesanded”, done work folded into „Tehtud”. Pure: works on the rows of taskList.js mergeTasks().
// Nothing is hidden for good and nothing is written — only the order and the grouping change.
//
// The ONE order of open work (pathQueue), used here for „Järgmine samm” and by students/nextStep.js for „Täna” and
// „Harjuta”, so the three never disagree:
//   1. a sheet already started (not old) — finish what you began
//   2. a deadline within DUE_SOON_DAYS or missed in the last OLD_DAYS days, the earliest deadline first
//   3. the monthly monologue
//   4. the newest lesson first, inside it Avasta → Harjuta → Kasuta, then its free tasks
//   5. the rest of the recent work (free tasks without a lesson), newest first
//   6. old work (older than OLD_DAYS): the newest lesson first — still doable, only not in the way
import { PHASES, TASK_STATE } from './taskList.js';
import { localDate } from '../../utils/localDate.js';

export const OLD_DAYS = 14;
export const DUE_SOON_DAYS = 2;
const PHASE_RANK = { discover: 1, practice: 2, transfer: 3, opik: 4 };
export const PATH_PHASES = ['discover', 'practice', 'transfer'];
const DAY = 24 * 60 * 60 * 1000;
// a free task without its own estimate: about 5 minutes (as „Täna” counts it)
export const TASK_MINUTES = 5;

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const dayMs = (iso) => Date.parse(`${iso}T12:00:00`);
const stampDay = (value) => {
  if (!value) return '';
  if (typeof value?.toDate === 'function') return localDate(value.toDate());
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const time = Date.parse(text);
  return Number.isFinite(time) ? localDate(new Date(time)) : '';
};
export const daysBetween = (from, to) => (from && to ? Math.round((dayMs(to) - dayMs(from)) / DAY) : 0);

// the day a task belongs to: when it was given (the sheet's assignment, the homework's date), else its deadline
export function taskDay(task = {}) {
  return stampDay(task.assignedAt) || stampDay(task.homework?.date) || stampDay(task.homework?.createdAt) || stampDay(task.due) || stampDay(task.doneAt);
}

// old = still open, and its deadline (or, without one, the day it was given) is more than OLD_DAYS days ago
export function isOldTask(task = {}, today = localDate()) {
  if (task.state !== TASK_STATE.TODO) return false;
  const ref = task.due || taskDay(task);
  return Boolean(ref) && daysBetween(ref, today) > OLD_DAYS;
}
export const isLateTask = (task = {}, today = localDate()) => task.state === TASK_STATE.TODO && Boolean(task.due) && task.due < today;

/**
 * A task about the word cards: „Korda tunni sõnu sõnakaartidega 10 minutit”, „Õpi sõnad”, „Korda tunni sõnu („Minu
 * sõnad” → „Harjuta”)”. A structured flag wins (`homework.kind === 'words'`, `homework.practice === 'words'`; none is
 * written yet); else the teacher's words: cards, or a repeat / learn verb followed by „sõna…”. „Kirjuta lauseid uute
 * sõnadega” is a writing task, not a word task. Sheets, exercises, voice tasks and the monologue never are.
 */
const CARD_WORDS = /(sõnakaar|sõnakaard|kaartidega|kaarte|flashcard|карточк)/iu;
const REPEAT_WORDS = /(^|[^\p{L}])(korda|kordama|korrake|harjuta|harjutage|õpi|õppige|õppida|õppima)(?![\p{L}])[^.!?\n]{0,40}?sõn/iu;
const RUSSIAN_REPEAT = /(повтор|выуч|учи)[\p{L}]*[^.!?\n]{0,30}?слов/iu;
export function isWordTask(task = {}) {
  const homework = task.homework || null;
  if (homework?.kind === 'words' || homework?.practice === 'words') return true;
  if (task.kind !== 'homework' || !homework) return false;
  const text = [task.title, task.note].map(clean).join(' ');
  return CARD_WORDS.test(text) || REPEAT_WORDS.test(text) || RUSSIAN_REPEAT.test(text);
}

// „10 minutit”, „10 min” in the teacher's words
const minutesInText = (text) => { const match = clean(text).match(/(\d{1,2})\s*(min|minutit|minuti|мин)/i); return match ? Number(match[1]) : 0; };
// how long, in minutes: the sheet's own estimate, the number the teacher wrote, else about 5
export function taskMinutes(task = {}) {
  if (task.state !== TASK_STATE.TODO) return 0;
  if (Number(task.minutes) > 0) return Number(task.minutes);
  return minutesInText(`${task.title} ${task.note}`) || TASK_MINUTES;
}

// where the task opens from outside the page (Täna / Harjuta): word cards in „Harjuta”, the monologue page, else this
// page with the task opened (`?ava=` — a sheet starts at once, any other task is scrolled to)
export function taskLink(task = {}) {
  if (task.kind === 'monologue') return task.to || '/student/monoloog';
  if (isWordTask(task) && task.homework?.id) return `/student/harjuta?kaardid=${encodeURIComponent(task.homework.id)}`;
  return `/homework?ava=${encodeURIComponent(task.key || '')}`;
}

/**
 * The lesson a task belongs to: a sheet by its course lesson (`lessonId`); a free homework by the lesson it was given in
 * (`invitationId`) when a sheet of that lesson was given there too; a homework pointing at its sheet is already one row
 * with the sheet. Anything else stands on its own.
 */
function lessonKeys(tasks = []) {
  const byInvitation = new Map();
  tasks.forEach((task) => {
    const lessonId = task.sheet?.lessonId || task.lessonId;
    const invitationId = task.homework?.invitationId;
    if (lessonId && invitationId && !byInvitation.has(invitationId)) byInvitation.set(invitationId, `lesson:${task.studentId}:${lessonId}`);
  });
  return (task) => {
    const lessonId = task.sheet?.lessonId || task.lessonId;
    if (lessonId) return `lesson:${task.studentId}:${lessonId}`;
    const invitationId = task.homework?.invitationId;
    if (invitationId && byInvitation.has(invitationId)) return byInvitation.get(invitationId);
    if (invitationId) return `live:${task.studentId}:${invitationId}`;
    return `task:${task.key}`;
  };
}

const rankOf = (task) => PHASE_RANK[task.phase] || 9;
// the newest lesson first; lessons given together (one batch, the same day) in course order
const byDayDesc = (a, b) => String(b.day).localeCompare(String(a.day)) || String(a.key).localeCompare(String(b.key), 'et', { numeric: true });
const notesOf = (tasks) => [...new Set(tasks.flatMap((task) => [task.teacherText, task.note]).map(clean).filter(Boolean))];

/**
 * One node per lesson (or per free task without a lesson):
 *   { key, kind: 'lesson' | 'task', title, day, tasks (Avasta → Harjuta → Kasuta, then the rest), phases (the three
 *     steps, each { phase, task | null }), steps (free tasks and sheets without a phase), notes (the teacher's words,
 *     each once), open, done, total, current (the first open task), state: 'todo' | 'done', old, late }
 */
export function lessonNodes(tasks = [], today = localDate()) {
  const keyOf = lessonKeys(tasks);
  const groups = new Map();
  tasks.forEach((task) => {
    const key = keyOf(task);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(task);
  });
  return [...groups.entries()].map(([key, list]) => {
    const ordered = [...list].sort((a, b) => rankOf(a) - rankOf(b) || String(taskDay(a)).localeCompare(String(taskDay(b))));
    const sheets = ordered.filter((task) => PATH_PHASES.includes(task.phase));
    const lesson = key.startsWith('lesson:') || key.startsWith('live:');
    const open = ordered.filter((task) => task.state === TASK_STATE.TODO);
    const days = ordered.map(taskDay).filter(Boolean).sort();
    const first = sheets[0] || ordered[0];
    // one sheet per step (the open one when a lesson was given twice); any second copy stays visible as a step
    const phases = PATH_PHASES.map((phase) => {
      const same = sheets.filter((task) => task.phase === phase);
      return { phase, task: same.find((task) => task.state === TASK_STATE.TODO) || same[0] || null };
    }).filter((item) => item.task);
    const inPhases = new Set(phases.map((item) => item.task));
    return {
      key,
      kind: lesson && (sheets.length || ordered.length > 1) ? 'lesson' : 'task',
      title: first?.title || 'Ülesanne',
      day: days[days.length - 1] || '',
      tasks: ordered,
      phases,
      steps: ordered.filter((task) => !inPhases.has(task)),
      notes: notesOf(ordered),
      open: open.length,
      done: ordered.length - open.length,
      total: ordered.length,
      current: open[0] || null,
      state: open.length ? 'todo' : 'done',
      old: open.length > 0 && open.every((task) => isOldTask(task, today)),
      late: open.some((task) => isLateTask(task, today)),
    };
  });
}

/** The one order of open work (see the top of the file). Each task once. */
export function pathQueue(tasks = [], today = localDate()) {
  const open = tasks.filter((task) => task.state === TASK_STATE.TODO);
  const nodes = lessonNodes(tasks, today).filter((node) => node.state === 'todo').sort(byDayDesc);
  const fresh = (task) => !isOldTask(task, today);
  const soon = localDate(new Date(dayMs(today) + DUE_SOON_DAYS * DAY));
  const queue = [];
  const add = (task) => { if (task && !queue.includes(task)) queue.push(task); };
  open.filter((task) => task.started && fresh(task)).sort((a, b) => String(taskDay(b)).localeCompare(String(taskDay(a)))).forEach(add);
  open.filter((task) => fresh(task) && task.kind !== 'monologue' && task.due && task.due <= soon).sort((a, b) => a.due.localeCompare(b.due)).forEach(add);
  open.filter((task) => task.kind === 'monologue').forEach(add);
  nodes.filter((node) => !node.old).forEach((node) => node.tasks.filter((task) => task.state === TASK_STATE.TODO).forEach(add));
  nodes.filter((node) => node.old).forEach((node) => node.tasks.filter((task) => task.state === TASK_STATE.TODO).forEach(add));
  open.forEach(add);
  return queue;
}

export const nextTask = (tasks = [], today = localDate()) => pathQueue(tasks, today)[0] || null;

const lastDone = (node) => node.tasks.map((task) => String(task.reviewedAt || task.doneAt || '')).sort().pop() || '';

/**
 * The page: { next, path (open lessons and tasks, newest first; the one holding `next` first), old (all open work in
 * them is older than OLD_DAYS), done (everything done, the latest first), open (count of open tasks), oldCount }.
 */
export function buildPath(tasks = [], today = localDate()) {
  const nodes = lessonNodes(tasks, today);
  const next = nextTask(tasks, today);
  const todo = nodes.filter((node) => node.state === 'todo');
  const holding = (node) => Boolean(next && node.tasks.includes(next));
  const path = todo.filter((node) => !node.old || holding(node)).sort((a, b) => Number(holding(b)) - Number(holding(a)) || byDayDesc(a, b));
  const old = todo.filter((node) => node.old && !holding(node)).sort(byDayDesc);
  const done = nodes.filter((node) => node.state === 'done').sort((a, b) => lastDone(b).localeCompare(lastDone(a)));
  return {
    next,
    path,
    old,
    done,
    open: tasks.filter((task) => task.state === TASK_STATE.TODO).length,
    oldCount: old.reduce((sum, node) => sum + node.open, 0),
  };
}

// „Avasta 1/3” — the step's short name and its place among the three
export const phaseInfo = (phase) => PHASES[phase] || null;
