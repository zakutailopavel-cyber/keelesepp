// „Järgmine samm” on the student's home: exactly one thing to do, one button. Priority (owner 2026-11-01, extended
// 2026-11-04 when the first screen of the cabinet was redone):
//   1. a lesson going on now or starting within SOON_MINUTES („Ava tund”)
//   2. overdue homework (the oldest deadline first)
//   3. homework due within DUE_SOON_DAYS
//   4. a lesson later today (its time; the button leads to „Tunniplaan” on the same page, where „Ei saa tulla?” is)
//   5. the monthly monologue („Kuu monoloog”: a task-list row of kind 'monologue') not yet recorded this month
//   6. other open homework (no deadline or a far one)
//   7. words due for review (`studentWords` dueAt, vocabulary/dailyReview.js)
//   8. a self-study lesson the learner started on „Kursus” and has not finished
//   9. nothing left („Praegu on kõik tehtud”)
// Pure: the page passes what it knows. `tasks` are extra rows of the task list (homework/taskList.js shape), e.g. the
// monologue; they are handled by their `kind` and `state`, so home and „Ülesanded” never disagree.
import { TASK_STATE, groupTasks, mergeTasks, taskCount } from '../homework/taskList.js';
import { dailyPlan } from '../vocabulary/dailyReview.js';

export const SOON_MINUTES = 30;
export const DUE_SOON_DAYS = 2;
const MINUTE = 60 * 1000;
const ERROR_PREFIX = 'Sinu lause:';

const clean = (value) => String(value ?? '').trim();
const short = (text, max = 60) => { const t = clean(text); return t.length > max ? `${t.slice(0, max - 1)}…` : t; };
const startOf = (lesson) => new Date(`${lesson.occurrenceDate}T${lesson.time || '00:00'}:00`).getTime();
const planned = (lesson) => lesson.status !== 'Tühistatud' && Boolean(lesson.occurrenceDate) && Boolean(lesson.time);
const pad = (n) => String(n).padStart(2, '0');
const addDays = (iso, days) => {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// the lesson going on now or starting within SOON_MINUTES (occurrences from calendarView)
export function lessonNow(occurrences = [], now = Date.now()) {
  return occurrences
    .filter(planned)
    .map((lesson) => ({ lesson, start: startOf(lesson) }))
    .filter(({ lesson, start }) => start - now <= SOON_MINUTES * MINUTE && now - start < (Number(lesson.duration) || 60) * MINUTE)
    .sort((a, b) => a.start - b.start)[0]?.lesson || null;
}

// the next lesson later today that has not started yet
export function lessonLaterToday(occurrences = [], today, now = Date.now()) {
  return occurrences
    .filter((lesson) => planned(lesson) && lesson.occurrenceDate === today && startOf(lesson) > now)
    .sort((a, b) => startOf(a) - startOf(b))[0] || null;
}

// open work given by the teacher, the very list of „Ülesanded” (homework/taskList.js), so home and that page never
// disagree; the monologue has its own place in the priority, so it is not counted here
export function openWork({ homework = [], assignments = [], tasks = [] } = {}) {
  const extra = tasks.filter((task) => task && task.kind !== 'monologue');
  return groupTasks([...mergeTasks({ homework, assignments }), ...extra]).todo.map((task) => ({ id: task.key, title: task.title, due: task.due }));
}

// a self-study sheet the learner opened himself on „Kursus” and has not finished; the newest first
export function selfStudyOpen(assignments = []) {
  const stamp = (item) => Date.parse(item.updatedAt || item.startedAt || item.assignedAt || '') || 0;
  return assignments
    .filter((item) => item.source === 'self_study' && item.status !== 'done' && !item.completedAt)
    .sort((a, b) => stamp(b) - stamp(a))[0] || null;
}

const dayLabel = (iso) => {
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('et-EE', { day: 'numeric', month: 'short' });
};
const lessonDetail = (lesson) => [lesson.teacher, `${lesson.duration || 60} min`].filter(Boolean).join(' · ');

export function nextStep({ occurrences = [], homework = [], assignments = [], tasks = [], words = [], today, now = Date.now() }) {
  const soon = lessonNow(occurrences, now);
  if (soon) {
    const started = startOf(soon) <= now;
    return { key: 'lesson', title: started ? 'Tund käib praegu' : `Tund algab kell ${soon.time}`, detail: lessonDetail(soon), button: 'Ava tund', to: '/live-classroom' };
  }
  const work = openWork({ homework, assignments, tasks });
  const more = work.length > 1 ? `kokku ${taskCount(work.length)}` : '';
  const overdue = work.filter((task) => task.due && task.due < today).sort((a, b) => a.due.localeCompare(b.due));
  if (overdue.length) {
    return { key: 'overdue', title: short(overdue[0].title), detail: [`Tähtaeg oli ${dayLabel(overdue[0].due)}`, more].filter(Boolean).join(' · '), button: 'Tee ära', to: '/homework' };
  }
  const soonDue = addDays(today, DUE_SOON_DAYS);
  const dueSoon = work.filter((task) => task.due && task.due <= soonDue).sort((a, b) => a.due.localeCompare(b.due));
  if (dueSoon.length) {
    const first = dueSoon[0];
    const when = first.due === today ? 'Tähtaeg täna' : first.due === addDays(today, 1) ? 'Tähtaeg homme' : `Tähtaeg ${dayLabel(first.due)}`;
    return { key: 'due-soon', title: short(first.title), detail: [when, more].filter(Boolean).join(' · '), button: 'Tee ära', to: '/homework' };
  }
  const later = lessonLaterToday(occurrences, today, now);
  if (later) {
    return { key: 'lesson-today', title: `Täna kell ${later.time} on tund`, detail: lessonDetail(later), button: 'Vaata tunniplaani', to: '#tunniplaan' };
  }
  const monologue = tasks.find((task) => task?.kind === 'monologue' && task.state === TASK_STATE.TODO);
  if (monologue) {
    const detail = [monologue.due ? `Tähtaeg ${dayLabel(monologue.due)}` : '', 'räägi 2 minutit'].filter(Boolean).join(' · ');
    return { key: 'monologue', title: short(monologue.title) || 'Kuu monoloog', detail, button: 'Salvesta', to: monologue.to || '/homework' };
  }
  if (work.length) {
    const first = work[0]; // the order of „Tee nüüd”: without deadlines the oldest lesson first, not the last one given
    const detail = [first.due ? `Tähtaeg ${dayLabel(first.due)}` : '', more].filter(Boolean).join(' · ') || 'Õpetaja andis selle sulle';
    return { key: 'homework', title: short(first.title), detail, button: 'Tee ära', to: '/homework' };
  }
  const daily = dailyPlan(words, { now, today });
  if (daily.count && !daily.done) {
    const cards = `${daily.count} ${daily.count === 1 ? 'kaart' : 'kaarti'}`;
    return { key: 'review', title: 'Korda sõnu', detail: `${cards}, umbes 5 minutit`, button: 'Alusta', to: daily.count >= 2 ? '/student/sonavara?paev=1' : '/student/sonavara' };
  }
  const course = selfStudyOpen(assignments);
  if (course) {
    return { key: 'self-study', title: short(course.lessonTitle || course.title) || 'Kursuse tund', detail: 'Alustasid seda ise kursusel', button: 'Jätka', to: '/student/kursus' };
  }
  return { key: 'done', title: 'Praegu on kõik tehtud', detail: 'Tubli! Kui tahad, vaata, mis kursusel edasi tuleb.', button: 'Ava kursus', to: '/student/kursus' };
}

// When the learner last saw his results („Ülesanded” opened). Browser only: on a new device feedback of the last
// FEEDBACK_DAYS counts as new again, and nothing else depends on it.
export const FEEDBACK_DAYS = 14;
const seenKey = (uid) => `ks-feedback-seen-${uid}`;
export function feedbackSeenAt(uid) { try { return Number(globalThis.localStorage?.getItem(seenKey(uid))) || 0; } catch { return 0; } }
export function markFeedbackSeen(uid, now = Date.now()) { try { globalThis.localStorage?.setItem(seenKey(uid), String(now)); } catch { /* private mode */ } }

// reviewed by the teacher (a grade or a comment), after the last look; an automatic percentage is not teacher feedback
export function newFeedback(submissions = [], seenAt = 0, now = Date.now()) {
  const from = Math.max(seenAt, now - FEEDBACK_DAYS * 24 * 60 * MINUTE);
  return submissions.filter((item) => item.reviewStatus === 'reviewed' && (item.teacherFeedback || item.teacherGrade) && (Date.parse(item.reviewedAt || '') || 0) > from);
}

// The quiet lines under the first screen: each appears only when there is something (never an empty block).
export function homeNotes({ feedback = [], announcements = [], unpaidCents = 0, money = (cents) => String(cents) } = {}) {
  const notes = [];
  if (feedback.length) {
    notes.push({ key: 'feedback', text: feedback.length === 1 ? `Õpetaja vaatas üle: ${short(feedback[0].title, 44)}` : `Õpetaja vaatas üle ${taskCount(feedback.length)}`, to: '/homework#vaadatud' });
  }
  const asked = announcements.filter((item) => item.announcement?.responseType === 'availability');
  const unread = announcements.filter((item) => item.announcement?.responseType !== 'availability');
  if (unread.length) notes.push({ key: 'announcement', text: unread.length === 1 ? `Uus teade: ${short(unread[0].announcement?.title, 48)}` : `${unread.length} uut teadet koolilt`, to: '/student/areng#teated' });
  if (unpaidCents > 0) notes.push({ key: 'invoice', text: `Tasumata arve: ${money(unpaidCents)}` });
  // the school has really asked (an open „Sobivad ajad” announcement), not merely „the times are empty”
  if (asked.length) notes.push({ key: 'availability', text: 'Kool küsib, millal sulle tund sobib', to: '/student/areng#sobivad-ajad' });
  return notes;
}

/**
 * „Minu õppimine” under the first screen (owner 2026-11-01: the cabinet was overloaded): one short row per section with
 * a small count instead of long blocks. Every section stays one tap away; a count appears only when it is not zero.
 * `path` is todayPath(): its line for tasks, words and mistakes says what was done today.
 */
export function homeSections({ homework = [], assignments = [], tasks = [], words = [], path = null, today, now = Date.now() } = {}) {
  const step = (key) => path?.steps?.find((item) => item.key === key) || null;
  const open = openWork({ homework, assignments, tasks }).length + tasks.filter((task) => task?.kind === 'monologue' && task.state === TASK_STATE.TODO).length;
  const daily = dailyPlan(words, { now, today });
  const mistakes = words.filter((word) => String(word.translation || '').startsWith(ERROR_PREFIX)).length;
  const own = words.length - mistakes;
  return [
    { key: 'tasks', label: 'Ülesanded', to: '/homework', count: open, detail: step('work')?.done ? 'tehtud täna' : open ? 'ootab tegemist' : 'mida õpetaja andis', done: Boolean(step('work')?.done) },
    { key: 'words', label: 'Sõnad', to: '/student/sonavara', count: daily.done ? 0 : daily.count, detail: daily.done ? 'korratud täna' : daily.count ? 'kaarti kordamiseks' : own ? `${own} sõna` : 'lisa oma sõna', done: daily.done },
    { key: 'mistakes', label: 'Minu vead', to: '/student/vead', count: mistakes, detail: step('mistakes')?.done ? 'harjutatud täna' : mistakes ? 'lauset tundidest' : 'märkmed tunnist', done: Boolean(step('mistakes')?.done) },
    { key: 'boards', label: 'Tunni tahvlid', to: '/board', count: 0, detail: 'tundide lehed', done: false },
    { key: 'progress', label: 'Minu areng', to: '/student/areng', count: 0, detail: 'vaata, kuidas läheb', done: false },
  ];
}
