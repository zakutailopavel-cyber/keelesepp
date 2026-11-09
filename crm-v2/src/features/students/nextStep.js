// The ONE decider of what a student does next (owner 2026-11-09 „Täna”: one clear daily flow, so a student never wonders
// what to do). Everything that asks „what now?” reads this file: the home page „Täna” (its steps and the one button),
// the walking pet's hint (companionModel.js) and the pet on the home page (it only rewards, it asks for nothing).
//
// Today's steps, in this order (todaySteps):
//   live       a lesson going on now or starting within SOON_MINUTES — an interrupt, not a step: „Ava tund”
//   homework   what the teacher gave (homework/taskList.js): overdue first, then due soon, the monthly monologue, the rest
//   words      the spaced repetition queue of his own words (vocabulary/dailyReview.js)
//   sentences  one practice lesson: course sentences and grammar of his level + his own wrong sentences (practice/)
//   course     the self-study course („Kursus”), only on a self-study card (isSelfStudent)
//   (pet)      the end of the day's flow: the pet thanks and shows the reward — not a step of its own
// A step with nothing to do is „empty” and skipped. A step is done by what really happened today (work submitted, the
// day's cards answered) or by the stored tick of „Täna” (practice/progress.js).
//
// nextStep() is the same order as one line (key, title, detail, button, to) for places that show a single thing.
// Pure: the page passes what it knows. `tasks` are extra rows of the task list (the monologue, homework/taskList.js
// shape), so home and „Ülesanded” never disagree.
import { TASK_STATE, groupTasks, mergeTasks, taskCount } from '../homework/taskList.js';
import { dailyPlan } from '../vocabulary/dailyReview.js';
import { DAILY_GOAL_MINUTES } from '../practice/progress.js';
import { toIsoDate } from '../calendar/calendarView.js';

export const SOON_MINUTES = 30;
export const DUE_SOON_DAYS = 2;
export const STEP_ORDER = ['homework', 'words', 'sentences', 'course'];
const MINUTE = 60 * 1000;
export const ERROR_PREFIX = 'Sinu lause:';
const SENTENCE_MINUTES = 4;
const COURSE_MINUTES = 10;
const HOMEWORK_MINUTES = 10;

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
// a time from the server is UTC: the learner's own day (between midnight and 02:00 the UTC date is still yesterday)
const dayOf = (value) => { const s = String(value || ''); if (s.length <= 10) return s; const d = new Date(s); return Number.isNaN(d.getTime()) ? s.slice(0, 10) : toIsoDate(d); };
export const isOwnSentence = (word) => String(word?.translation || '').startsWith(ERROR_PREFIX);

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
// disagree; the monologue has its own place in the order, so it is not counted here
export function openWork({ homework = [], assignments = [], tasks = [] } = {}) {
  const extra = tasks.filter((task) => task && task.kind !== 'monologue');
  return groupTasks([...mergeTasks({ homework, assignments }), ...extra]).todo.map((task) => ({ id: task.key, title: task.title, due: task.due, minutes: task.minutes || 0 }));
}

const openMonologue = (tasks = []) => tasks.find((task) => task?.kind === 'monologue' && task.state === TASK_STATE.TODO) || null;

/**
 * The homework step's queue: overdue (oldest deadline first), due within DUE_SOON_DAYS, the monthly monologue, the rest
 * in the order of „Tee nüüd”. Each: { id, title, due, minutes, to, kind: 'overdue' | 'due-soon' | 'monologue' | 'homework' }.
 */
export function homeworkQueue({ homework = [], assignments = [], tasks = [], today }) {
  const work = openWork({ homework, assignments, tasks });
  const soonDue = addDays(today, DUE_SOON_DAYS);
  const byDue = (a, b) => a.due.localeCompare(b.due);
  const overdue = work.filter((task) => task.due && task.due < today).sort(byDue);
  const dueSoon = work.filter((task) => task.due && task.due >= today && task.due <= soonDue).sort(byDue);
  const rest = work.filter((task) => !overdue.includes(task) && !dueSoon.includes(task));
  const monologue = openMonologue(tasks);
  return [
    ...overdue.map((task) => ({ ...task, kind: 'overdue', to: '/homework' })),
    ...dueSoon.map((task) => ({ ...task, kind: 'due-soon', to: '/homework' })),
    ...(monologue ? [{ id: monologue.key, title: monologue.title || 'Kuu monoloog', due: monologue.due || '', minutes: 5, kind: 'monologue', to: monologue.to || '/homework' }] : []),
    ...rest.map((task) => ({ ...task, kind: 'homework', to: '/homework' })),
  ];
}

// work submitted or marked done today (the homework step is ticked by what really happened)
export function workDoneToday({ homework = [], submissions = [], today }) {
  return submissions.some((item) => dayOf(item.completedAt) === today)
    || homework.some((item) => item.status === 'Tehtud' && dayOf(item.doneAt || item.submittedAt || item.updatedAt) === today);
}

// a self-study sheet the learner opened himself on „Kursus” and has not finished; the newest first
export function selfStudyOpen(assignments = []) {
  const stamp = (item) => Date.parse(item.updatedAt || item.startedAt || item.assignedAt || '') || 0;
  return assignments
    .filter((item) => item.source === 'self_study' && item.status !== 'done' && !item.completedAt)
    .sort((a, b) => stamp(b) - stamp(a))[0] || null;
}
const selfStudyDoneToday = (assignments = [], today) => assignments.some((item) => item.source === 'self_study' && dayOf(item.completedAt) === today);

// the words step works on his own words; his own wrong sentences go to the sentences step
export const ownWords = (words = []) => words.filter((word) => !isOwnSentence(word));

const dayLabel = (iso) => {
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('et-EE', { day: 'numeric', month: 'short' });
};
const lessonDetail = (lesson) => [lesson.teacher, `${lesson.duration || 60} min`].filter(Boolean).join(' · ');
const cardsText = (n) => `${n} ${n === 1 ? 'kaart' : 'kaarti'}`;

/**
 * Today's flow. `sentences`: { available, own } — whether a practice lesson can be built for him (his level has course
 * items, or he has own wrong sentences) and how many own sentences wait. `done`: step keys ticked today (progress.js).
 * → { live, steps: [{ key, label, ru, detail, minutes, state: 'todo' | 'done' | 'empty', to, queue? }], todo, minutes,
 *     goal, finished }
 */
export function todaySteps({
  occurrences = [], homework = [], assignments = [], submissions = [], tasks = [], words = [], sentences = { available: false, own: 0 },
  selfStudent = false, done = [], today, now = Date.now(),
}) {
  const ticked = new Set(done);
  const live = lessonNow(occurrences, now);
  const steps = [];

  const queue = homeworkQueue({ homework, assignments, tasks, today });
  const workToday = workDoneToday({ homework, submissions, today });
  const late = queue.filter((task) => task.kind === 'overdue').length;
  steps.push({
    key: 'homework', label: 'Ülesanded', ru: 'задания', to: queue[0]?.to || '/homework', queue,
    state: ticked.has('homework') || (workToday && !late) ? 'done' : queue.length ? 'todo' : 'empty',
    detail: queue.length ? [short(queue[0].title, 48), queue[0].kind === 'overdue' ? `tähtaeg oli ${dayLabel(queue[0].due)}` : '', queue.length > 1 ? `kokku ${taskCount(queue.length)}` : ''].filter(Boolean).join(' · ') : workToday ? 'Tehtud täna' : '',
    minutes: queue.length ? Math.max(5, queue[0].minutes || HOMEWORK_MINUTES) : 0,
  });

  const daily = dailyPlan(ownWords(words), { now, today });
  steps.push({
    key: 'words', label: 'Sõnad', ru: 'слова', to: '/student/sonavara',
    state: ticked.has('words') || daily.done ? 'done' : daily.count ? 'todo' : daily.reviewedToday ? 'done' : 'empty',
    detail: daily.count ? [cardsText(daily.count), daily.forgotten ? `${daily.forgotten} ununeb` : ''].filter(Boolean).join(' · ') : daily.reviewedToday ? 'Korratud täna' : '',
    minutes: daily.count ? Math.max(1, Math.min(5, Math.round(daily.count * 0.4))) : 0,
  });

  steps.push({
    key: 'sentences', label: 'Laused ja grammatika', ru: 'фразы и грамматика', to: '/student/vead',
    state: ticked.has('sentences') ? 'done' : sentences.available || sentences.own > 0 ? 'todo' : 'empty',
    detail: sentences.own > 0 ? `${sentences.own} ${sentences.own === 1 ? 'sinu lause' : 'sinu lauset'} tunnist + harjutused` : sentences.available ? 'Lühike harjutus sinu tasemel' : '',
    minutes: sentences.available || sentences.own > 0 ? SENTENCE_MINUTES : 0,
  });

  if (selfStudent) {
    const open = selfStudyOpen(assignments);
    steps.push({
      key: 'course', label: 'Kursus', ru: 'курс', to: '/student/kursus',
      state: ticked.has('course') || selfStudyDoneToday(assignments, today) ? 'done' : 'todo',
      detail: open ? short(open.lessonTitle || open.title, 48) || 'Jätka alustatud tundi' : 'Järgmine tund kursusel',
      minutes: COURSE_MINUTES,
    });
  }

  const todo = steps.filter((step) => step.state === 'todo');
  const active = steps.filter((step) => step.state !== 'empty');
  return {
    live: live ? { ...live, started: startOf(live) <= now } : null,
    steps,
    todo,
    minutes: todo.reduce((sum, step) => sum + step.minutes, 0),
    goal: DAILY_GOAL_MINUTES,
    // all that could be done today is done (a day with nothing at all is not „finished”)
    finished: active.length > 0 && todo.length === 0,
  };
}

/** One line: the first thing to do now (the walking pet's hint and anything else that shows a single next step). */
export function nextStep({ occurrences = [], homework = [], assignments = [], tasks = [], words = [], sentences = { available: false, own: 0 }, done = [], today, now = Date.now() }) {
  const soon = lessonNow(occurrences, now);
  if (soon) {
    const started = startOf(soon) <= now;
    return { key: 'lesson', title: started ? 'Tund käib praegu' : `Tund algab kell ${soon.time}`, detail: lessonDetail(soon), button: 'Ava tund', to: '/live-classroom', lesson: soon };
  }
  const queue = homeworkQueue({ homework, assignments, tasks, today });
  const work = queue.filter((task) => task.kind !== 'monologue');
  const more = work.length > 1 ? `kokku ${taskCount(work.length)}` : '';
  const first = (kind) => queue.find((task) => task.kind === kind);
  const overdue = first('overdue');
  if (overdue) return { key: 'overdue', title: short(overdue.title), detail: [`Tähtaeg oli ${dayLabel(overdue.due)}`, more].filter(Boolean).join(' · '), button: 'Tee ära', to: '/homework' };
  const dueSoon = first('due-soon');
  if (dueSoon) {
    const when = dueSoon.due === today ? 'Tähtaeg täna' : dueSoon.due === addDays(today, 1) ? 'Tähtaeg homme' : `Tähtaeg ${dayLabel(dueSoon.due)}`;
    return { key: 'due-soon', title: short(dueSoon.title), detail: [when, more].filter(Boolean).join(' · '), button: 'Tee ära', to: '/homework' };
  }
  const later = lessonLaterToday(occurrences, today, now);
  if (later) return { key: 'lesson-today', title: `Täna kell ${later.time} on tund`, detail: lessonDetail(later), button: 'Vaata tunniplaani', to: '#tunniplaan' };
  const monologue = first('monologue');
  if (monologue) {
    const detail = [monologue.due ? `Tähtaeg ${dayLabel(monologue.due)}` : '', 'räägi 2 minutit'].filter(Boolean).join(' · ');
    return { key: 'monologue', title: short(monologue.title) || 'Kuu monoloog', detail, button: 'Salvesta', to: monologue.to };
  }
  const rest = first('homework');
  if (rest) {
    // the order of „Tee nüüd”: without deadlines the oldest lesson first, not the last one given
    const detail = [rest.due ? `Tähtaeg ${dayLabel(rest.due)}` : '', more].filter(Boolean).join(' · ') || 'Õpetaja andis selle sulle';
    return { key: 'homework', title: short(rest.title), detail, button: 'Tee ära', to: '/homework' };
  }
  const daily = dailyPlan(ownWords(words), { now, today });
  if (daily.count && !daily.done && !done.includes('words')) {
    return { key: 'review', title: 'Korda sõnu', detail: `${cardsText(daily.count)}, umbes 5 minutit`, button: 'Alusta', to: '/student' };
  }
  if ((sentences.available || sentences.own > 0) && !done.includes('sentences')) {
    return { key: 'sentences', title: 'Laused ja grammatika', detail: 'Lühike harjutus, umbes 4 minutit', button: 'Alusta', to: '/student' };
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

// The quiet lines at the bottom of „Täna”: each appears only when there is something (never an empty block).
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
