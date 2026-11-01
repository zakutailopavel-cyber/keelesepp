// „Ülesanded” for a learner and a family (owner 2026-11-01: „не понимаю разницы между назначенными листами и домашним
// заданием”). Whatever the teacher gave is one thing, a task. The data stays where it is (homework, worksheetAssignments,
// exerciseResults, interactive lessons); only this list merges them, one row per task. Pure: the page passes what it read.
import { goalEntries } from '../worksheet-studio/engine/goals.js';
import { sheetMinutes } from '../worksheet-studio/didactics/timeEstimate.js';
import { localDate } from '../../utils/localDate.js';
import { compareWorks, phaseOf } from './workOrder.js';

export const TASK_STATE = Object.freeze({ TODO: 'todo', WAITING: 'waiting', REVIEWED: 'reviewed' });

// what each of a lesson's sheets is for, in a few words; the order is the order of doing them
export const PHASES = Object.freeze({
  discover: { label: 'Avasta', step: 1, purpose: 'tutvu uue teemaga', ru: 'знакомство с темой' },
  practice: { label: 'Harjuta', step: 2, purpose: 'tee harjutusi', ru: 'тренировка' },
  transfer: { label: 'Kasuta', step: 3, purpose: 'kasuta õpitut ise', ru: 'применяем сами' },
  opik: { label: 'Õpik', step: 0, purpose: 'loe õpikust', ru: 'чтение учебника' },
});

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const dayOf = (value) => clean(value).slice(0, 10);
const DAY = 24 * 60 * 60 * 1000;
const dayMs = (iso) => Date.parse(`${iso}T12:00:00`);
const PHASE_SUFFIX = /\s*·\s*(Avasta|Harjuta|Kasuta|Õpik)\s*$/;

// a goal written for the teacher („Õpilane mõistab …”) is not read by a learner or a parent; „Ma oskan …”, „Kirjutan …” are
export const isTeacherGoal = (text) => /^(õpilane|õpilased|õppija|õppijad)\b/i.test(clean(text));

// the one line that says why: the sheet's own promise („Ma oskan …”), else its first goal said to the learner, else nothing
export function learnerGoal(meta = {}) {
  const canDo = clean(meta?.canDo);
  if (canDo && !isTeacherGoal(canDo)) return canDo;
  const goal = goalEntries(meta?.goals).map(([, label]) => clean(label)).find((label) => label && !isTeacherGoal(label));
  return goal || '';
}

// from the sheet's own blocks (didactics/timeEstimate.js), never for a sheet without them; rounded up to 5 minutes
export function taskMinutes(doc) {
  if (!doc?.blocks?.length) return 0;
  const minutes = sheetMinutes(doc);
  return minutes > 0 ? Math.ceil(minutes / 5) * 5 : 0;
}

const sheetDoc = (item) => item?.worksheetDoc || item?.source?.worksheetDoc || null;
const sheetTitle = (item) => clean(item?.lessonTitle || item?.title || sheetDoc(item)?.meta?.title || item?.worksheetData?.meta?.title).replace(PHASE_SUFFIX, '');
const isReviewed = (item) => item?.reviewStatus === 'reviewed' || (!item?.reviewStatus && Boolean(item?.reviewedAt || item?.teacherFeedback || item?.teacherGrade));

const common = (item = {}) => ({
  studentId: item.studentId || '',
  studentName: item.studentName || '',
  subject: item.subject || '',
  feedback: clean(item.teacherFeedback),
  grade: item.teacherGrade ?? '',
  reviewedAt: item.reviewedAt || '',
});

function fromSheet(sheet, { linked = null, submission = null } = {}) {
  const doc = sheetDoc(sheet);
  const reviewed = isReviewed(sheet) || isReviewed(submission);
  const done = sheet.status === 'done' || Boolean(sheet.completedAt);
  const state = reviewed ? TASK_STATE.REVIEWED : done ? TASK_STATE.WAITING : TASK_STATE.TODO;
  const phase = phaseOf(sheet);
  const percentage = submission?.percentage ?? null;
  return {
    ...common({ ...sheet, ...(submission || {}), subject: sheet.subject }),
    key: `sheet-${sheet.id}`,
    kind: 'sheet',
    state,
    title: sheetTitle(sheet) || clean(linked?.worksheetTitle) || clean(linked?.task) || 'Ülesanne',
    // the teacher's own words, exactly as written
    teacherText: linked && clean(linked.task) !== sheetTitle(sheet) ? clean(linked.task) : '',
    note: clean(linked?.note || sheet.note),
    phase: PHASES[phase] ? phase : '',
    goal: state === TASK_STATE.TODO ? learnerGoal(doc?.meta) : '',
    minutes: state === TASK_STATE.TODO ? taskMinutes(doc) : 0,
    due: dayOf(sheet.dueDate || linked?.due),
    started: Object.keys(sheet.answers || {}).length > 0,
    percentage,
    doneAt: sheet.completedAt || submission?.completedAt || '',
    assignedAt: sheet.assignedAt || '',
    lessonId: sheet.lessonId || '',
    sheet,
    submission,
    homework: linked,
  };
}

function fromHomework(item, result = null) {
  const exercise = Boolean(item.isExercise && item.exerciseId);
  const done = item.status === 'Tehtud' || Boolean(result);
  const reviewed = isReviewed(result);
  return {
    ...common({ ...item, ...(result || {}) }),
    key: `homework-${item.id}`,
    kind: exercise ? 'exercise' : item.kind === 'voice' ? 'voice' : 'homework',
    state: reviewed ? TASK_STATE.REVIEWED : done ? TASK_STATE.WAITING : TASK_STATE.TODO,
    title: clean(item.task || item.exerciseTitle || item.worksheetTitle) || 'Ülesanne',
    teacherText: '',
    note: clean(item.note),
    phase: '',
    goal: '',
    minutes: 0,
    due: dayOf(item.due),
    started: false,
    percentage: result?.percentage ?? null,
    doneAt: result?.completedAt || item.submittedAt || item.updatedAt || (done ? item.date : '') || '',
    assignedAt: item.createdAt || item.date || '',
    lessonId: '',
    homework: item,
    submission: result,
  };
}

function fromSubmission(item) {
  const reviewed = isReviewed(item);
  return {
    ...common(item),
    key: `${item.submissionKind || 'work'}-${item.id}`,
    kind: 'result',
    state: reviewed ? TASK_STATE.REVIEWED : TASK_STATE.WAITING,
    title: clean(item.title).replace(PHASE_SUFFIX, '') || 'Ülesanne',
    teacherText: '',
    note: '',
    phase: PHASES[phaseOf(item.source || item)] ? phaseOf(item.source || item) : '',
    goal: '',
    minutes: 0,
    due: '',
    started: false,
    percentage: item.percentage ?? null,
    doneAt: item.completedAt || '',
    assignedAt: '',
    lessonId: '',
    submission: item,
  };
}

const INTERACTIVE_STATE = { active: TASK_STATE.TODO, submitted: TASK_STATE.WAITING, reviewed: TASK_STATE.REVIEWED };
function fromInteractive(item) {
  return {
    ...common({ studentId: item.studentId, studentName: item.studentName }),
    key: `interactive-${item.id}`,
    kind: 'interactive',
    state: INTERACTIVE_STATE[item.status] || TASK_STATE.TODO,
    title: clean(item.title) || 'Ülesanne',
    teacherText: '',
    note: '',
    phase: '',
    goal: '',
    minutes: 0,
    due: '',
    started: false,
    percentage: null,
    doneAt: item.submittedAt || item.updatedAt || '',
    assignedAt: item.assignedAt || '',
    lessonId: '',
    interactive: item,
  };
}

/**
 * One row per task.
 * - A homework that points at a sheet and the sheet are one task; the sheet's state counts, the teacher's words stay on it.
 * - A homework and its exercise result are one task.
 * - A sheet the learner opened himself from the course is not a task (it lives on „Kursus”) until a teacher has looked at it.
 * - What the teacher closed („Suletud”: nobody will do it any more) is not listed.
 */
export function mergeTasks({ homework = [], assignments = [], submissions = [], interactive = [] } = {}) {
  const sheetIds = new Set(assignments.map((item) => item.id));
  const linkedBySheet = new Map(homework.filter((item) => item.worksheetAssignmentId && sheetIds.has(item.worksheetAssignmentId)).map((item) => [item.worksheetAssignmentId, item]));
  const sheetResults = new Map(submissions.filter((item) => item.submissionKind === 'worksheet').map((item) => [item.id, item]));
  const exerciseResults = new Map();
  const usedResults = new Set();
  submissions.filter((item) => item.submissionKind === 'exercise').forEach((item) => {
    const homeworkId = item.source?.homeworkId || item.homeworkId;
    const seen = homeworkId ? exerciseResults.get(homeworkId) : null;
    // several tries: a reviewed one first, then the newest
    if (homeworkId && (!seen || (isReviewed(item) && !isReviewed(seen)) || (isReviewed(item) === isReviewed(seen) && String(item.completedAt) > String(seen.completedAt)))) exerciseResults.set(homeworkId, item);
  });

  const tasks = [];
  assignments.forEach((sheet) => {
    const submission = sheetResults.get(sheet.id) || null;
    const linked = linkedBySheet.get(sheet.id) || null;
    const reviewed = isReviewed(sheet) || isReviewed(submission);
    if (sheet.source === 'self_study' && !reviewed) return;
    if (linked?.status === 'Suletud' && sheet.status !== 'done' && !sheet.completedAt) return;
    tasks.push(fromSheet(sheet, { linked, submission }));
  });
  homework.forEach((item) => {
    if (item.worksheetAssignmentId && sheetIds.has(item.worksheetAssignmentId)) return;
    if (item.status === 'Suletud') return;
    const result = exerciseResults.get(item.id) || null;
    if (result) usedResults.add(result);
    tasks.push(fromHomework(item, result));
  });
  submissions.forEach((item) => {
    if (usedResults.has(item)) return;
    if (item.submissionKind === 'worksheet' && sheetIds.has(item.id)) return;
    if (item.submissionKind === 'exercise' && exerciseResults.has(item.source?.homeworkId || item.homeworkId) && homework.some((work) => work.id === (item.source?.homeworkId || item.homeworkId))) return;
    if (item.source?.source === 'self_study' && !isReviewed(item)) return;
    tasks.push(fromSubmission(item));
  });
  interactive.forEach((item) => tasks.push(fromInteractive(item)));
  return tasks;
}

const stamp = (value) => (typeof value?.toMillis === 'function' ? value.toMillis() : Date.parse(value || '') || 0);
const orderKey = (task) => ({ dueDate: task.due, assignedAt: task.assignedAt, lessonId: task.lessonId, phase: task.phase, title: task.title });

export const isTaskLate = (task, today = localDate()) => task.state === TASK_STATE.TODO && Boolean(task.due) && task.due < today;

// „Tee nüüd”: what is late first (the oldest deadline leads), then the nearest deadline, no deadline last; inside one
// lesson Avasta → Harjuta → Kasuta. The other two: the newest first.
export function groupTasks(tasks = []) {
  const of = (state) => tasks.filter((task) => task.state === state);
  return {
    todo: of(TASK_STATE.TODO).sort((a, b) => compareWorks(orderKey(a), orderKey(b))),
    waiting: of(TASK_STATE.WAITING).sort((a, b) => stamp(b.doneAt) - stamp(a.doneAt)),
    reviewed: of(TASK_STATE.REVIEWED).sort((a, b) => stamp(b.reviewedAt || b.doneAt) - stamp(a.reviewedAt || a.doneAt)),
  };
}

// the deadline in a child's words; no deadline says nothing
export function taskDueText(due, today = localDate()) {
  if (!due) return '';
  const days = Math.round((dayMs(due) - dayMs(today)) / DAY);
  if (Number.isNaN(days)) return '';
  if (days === 0) return 'Tähtaeg täna';
  if (days === 1) return 'Tähtaeg homme';
  if (days === -1) return 'Tähtaeg oli eile';
  if (days < 0) return `Tähtaeg oli ${-days} päeva tagasi`;
  return `Tähtaeg ${new Date(dayMs(due)).toLocaleDateString('et-EE', { day: 'numeric', month: 'short' })}`;
}

// „1 ülesanne”, „3 ülesannet”
export const taskCount = (count) => `${count} ${count === 1 ? 'ülesanne' : 'ülesannet'}`;
