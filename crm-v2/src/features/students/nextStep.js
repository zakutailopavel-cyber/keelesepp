// „Järgmine samm” on the student's home: exactly one thing to do, one button. Priority (owner 2026-11-01): a lesson
// starting soon → overdue homework → open homework → due word review → nothing left. Pure: the page passes what it knows.
import { TASK_STATE, mergeTasks, taskCount } from '../homework/taskList.js';
import { dailyPlan } from '../vocabulary/dailyReview.js';

export const SOON_MINUTES = 30;
const MINUTE = 60 * 1000;

const clean = (value) => String(value ?? '').trim();
const short = (text, max = 60) => { const t = clean(text); return t.length > max ? `${t.slice(0, max - 1)}…` : t; };
const startOf = (lesson) => new Date(`${lesson.occurrenceDate}T${lesson.time || '00:00'}:00`).getTime();

// the lesson going on now or starting within SOON_MINUTES (occurrences from calendarView)
export function lessonNow(occurrences = [], now = Date.now()) {
  return occurrences
    .filter((lesson) => lesson.status !== 'Tühistatud' && lesson.occurrenceDate && lesson.time)
    .map((lesson) => ({ lesson, start: startOf(lesson) }))
    .filter(({ lesson, start }) => start - now <= SOON_MINUTES * MINUTE && now - start < (Number(lesson.duration) || 60) * MINUTE)
    .sort((a, b) => a.start - b.start)[0]?.lesson || null;
}

// open work given by the teacher, the very list of „Ülesanded” (homework/taskList.js), so home and that page never disagree
export function openWork({ homework = [], assignments = [] } = {}) {
  return mergeTasks({ homework, assignments }).filter((task) => task.state === TASK_STATE.TODO).map((task) => ({ id: task.key, title: task.title, due: task.due }));
}

const dayLabel = (iso) => {
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('et-EE', { day: 'numeric', month: 'short' });
};

export function nextStep({ occurrences = [], homework = [], assignments = [], words = [], today, now = Date.now() }) {
  const soon = lessonNow(occurrences, now);
  if (soon) {
    const started = startOf(soon) <= now;
    return {
      key: 'lesson', title: started ? 'Tund käib praegu' : `Tund algab kell ${soon.time}`,
      detail: [soon.teacher, `${soon.duration || 60} min`].filter(Boolean).join(' · '), button: 'Ava tund', to: '/live-classroom',
    };
  }
  const work = openWork({ homework, assignments });
  const overdue = work.filter((task) => task.due && task.due < today).sort((a, b) => a.due.localeCompare(b.due));
  if (overdue.length) {
    const more = work.length > 1 ? ` · kokku ${taskCount(work.length)}` : '';
    return { key: 'overdue', title: short(overdue[0].title), detail: `Tähtaeg oli ${dayLabel(overdue[0].due)}${more}`, button: 'Tee ära', to: '/homework' };
  }
  if (work.length) {
    const first = [...work].sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))[0];
    const more = work.length > 1 ? `kokku ${taskCount(work.length)}` : '';
    const detail = [first.due ? `Tähtaeg ${dayLabel(first.due)}` : '', more].filter(Boolean).join(' · ') || 'Õpetaja andis selle sulle';
    return { key: 'homework', title: short(first.title), detail, button: 'Tee ära', to: '/homework' };
  }
  const daily = dailyPlan(words, { now, today });
  if (daily.count && !daily.done) {
    const cards = `${daily.count} ${daily.count === 1 ? 'kaart' : 'kaarti'}`;
    return { key: 'review', title: 'Korda sõnu', detail: `${cards}, umbes 5 minutit`, button: 'Alusta', to: daily.count >= 2 ? '/student/sonavara?paev=1' : '/student/sonavara' };
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

// The quiet lines under the day's steps: each appears only when there is something (never an empty block).
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
