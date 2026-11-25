// One lesson sheet given to one student again (audit 2026-11-24, finding 05: „Tee küsimine ja juhatamine” three times on
// one student). A sheet is the same when its course lesson (`lessonId`) and its phase (Avasta / Harjuta / Kasuta, when
// it has one) are the same. Staff assigning it again choose: „Jätka olemasolevat” (the default: nothing new is written,
// the open copy is used) or „Loo uus katse” (a new assignment marked `attempt: n`). Existing assignments are never
// changed or deleted. Pure: the service and the pages pass what they read.

const clean = (value) => String(value ?? '').trim();

// still open for the student: not handed in, not reviewed. A sheet the student opened on his own („Õpi ise”) is his,
// not a teacher's task, and is never reused for one.
export function isOpenAssignment(item = {}) {
  if (!item || item.source === 'self_study') return false;
  if (item.status === 'done' || item.completedAt) return false;
  if (item.reviewStatus === 'reviewed' || item.reviewedAt) return false;
  return true;
}

// one task of a sheet given alone (Õppevara „&plokk=”) carries its block id and is another thing than the whole sheet
export const sheetKey = ({ lessonId = '', phase = '', block = '' } = {}) => (clean(lessonId) ? `${clean(lessonId)}|${clean(phase)}|${clean(block)}` : '');
export const isSameSheet = (item, sheet) => Boolean(sheetKey(sheet)) && sheetKey(item) === sheetKey(sheet);

const stamp = (value) => (typeof value?.toMillis === 'function' ? value.toMillis() : Date.parse(value || '') || 0);
const started = (item) => Object.keys(item?.answers || {}).length > 0;
// the copy to continue: one already begun, then the newest
export const byContinueOrder = (a, b) => Number(started(b)) - Number(started(a)) || stamp(b.assignedAt) - stamp(a.assignedAt);

/** The student's open copies of this sheet, the one to continue first. */
export function openRepeats(assignments = [], { studentId, lessonId, phase = '', block = '' } = {}) {
  return assignments
    .filter((item) => item.studentId === studentId && isSameSheet(item, { lessonId, phase, block }) && isOpenAssignment(item))
    .sort(byContinueOrder);
}

/** The number of the next try: every copy this student had of the sheet (done or not), plus one. */
export function nextAttempt(assignments = [], { studentId, lessonId, phase = '', block = '' } = {}) {
  const copies = assignments.filter((item) => item.studentId === studentId && isSameSheet(item, { lessonId, phase, block }));
  const highest = copies.reduce((max, item) => Math.max(max, Number(item.attempt) || 1), 0);
  return Math.max(copies.length, highest) + 1;
}

export const REPEAT_CHOICE = Object.freeze({ ASK: 'ask', CONTINUE: 'continue', NEW: 'new' });

// thrown by libraryService.assign({ repeats: 'ask' }) before anything is written; `repeats` lists what is open
export class RepeatAssignmentError extends Error {
  constructor(repeats = []) {
    super(repeatMessage(repeats));
    this.code = 'assignment/repeat';
    this.repeats = repeats;
  }
}

const day = (value) => {
  const time = stamp(value);
  return time ? new Date(time).toLocaleDateString('et-EE', { day: 'numeric', month: 'numeric' }) : '';
};

// „See leht on õpilasel juba pooleli: Mari Maasik (antud 12.11).” — names after a colon, no case endings to guess
export function repeatMessage(repeats = []) {
  if (!repeats.length) return '';
  const people = [...new Set(repeats.map((item) => item.studentName || item.studentId))];
  const sheets = new Set(repeats.map((item) => sheetKey(item))).size;
  const what = sheets > 1 ? 'Need lehed on' : 'See leht on';
  if (people.length === 1) {
    const when = repeats.length === 1 ? day(repeats[0].existing?.assignedAt) : '';
    return `${what} õpilasel juba pooleli: ${people[0]}${when ? ` (antud ${when})` : ''}.`;
  }
  return `${what} juba pooleli ${people.length} õpilasel: ${people.join(', ')}.`;
}
