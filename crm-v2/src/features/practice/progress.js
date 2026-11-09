// „Täna” progress and practice XP (owner 2026-11-09: one daily flow, one progress meter). Pure.
//
// Stored on the student's own account, `users/{uid}.practice` (presence.js; rules validPresence):
//   today      { date: 'YYYY-MM-DD', day: int (UTC day number of that date), done: [step keys], xp: int ≤ DAILY_XP_CAP }
//   xp         int — practice XP of all days (only ever grows; one day adds at most DAILY_XP_CAP)
//   learnDays  ['YYYY-MM-DD'] ≤ 60 — days with at least one finished „Täna” step (the streak)
// The old keys (errorsDate, errorsPct, days: „Minu vead”) are kept as they are.
//
// XP comes only from finished real items, announced by the practice itself (events.js): one point per word card or
// sentence / grammar item answered right. Homework XP stays derived from the submitted records (petModel.js), so it is
// never counted twice. The cap per day keeps it from being farmed; the rules check the same cap.
import { localDate } from '../../utils/localDate.js';

export const DAILY_XP_CAP = 30;
export const LEARN_DAYS = 60;
export const DAILY_GOAL_MINUTES = 10;
export const STEP_KEYS = ['lesson', 'homework', 'words', 'sentences', 'course', 'pet'];
const DAY_MS = 24 * 60 * 60 * 1000;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

const int = (value) => Math.max(0, Math.floor(Number(value) || 0));

// the UTC day number of a calendar date (the rules compare it with the server's time)
export const dayNumber = (date) => (ISO.test(String(date || '')) ? Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY_MS) : 0);

// XP of one practice event: words → right cards, sentences / grammar → items right the first time
export function xpOf(event = {}) {
  const kind = String(event.kind || '');
  if (kind === 'words') return Math.min(int(event.correct), int(event.reviewed) || int(event.correct));
  if (kind === 'grammar' || kind === 'sentences') return Math.min(int(event.correct), int(event.items) || int(event.correct));
  return 0;
}

// today's part of the stored map (a map of another day is empty)
export function todayOf(practice, date = localDate()) {
  const today = practice?.today;
  if (!today || today.date !== date) return { date, day: dayNumber(date), done: [], xp: 0 };
  return { date, day: dayNumber(date), done: (Array.isArray(today.done) ? today.done : []).filter((key) => STEP_KEYS.includes(key)), xp: Math.min(DAILY_XP_CAP, int(today.xp)) };
}

/**
 * The practice map after one more thing done today: `done` step keys and / or `xp` gained. The day's XP never passes
 * DAILY_XP_CAP and the total grows by exactly what the day really gained. A step finished adds the day to learnDays.
 */
export function nextPracticeToday(current = {}, { date = localDate(), done = [], xp = 0 } = {}) {
  const base = current && typeof current === 'object' ? current : {};
  const today = todayOf(base, date);
  const added = [...new Set(done.filter((key) => STEP_KEYS.includes(key) && !today.done.includes(key)))];
  const dayXp = Math.min(DAILY_XP_CAP, today.xp + int(xp));
  const gained = dayXp - today.xp;
  const doneAll = [...today.done, ...added];
  const learnDays = doneAll.length
    ? [...new Set([...(Array.isArray(base.learnDays) ? base.learnDays : []), date])].filter((day) => ISO.test(day)).sort().slice(-LEARN_DAYS)
    : (Array.isArray(base.learnDays) ? base.learnDays : []);
  return {
    ...base,
    today: { date, day: dayNumber(date), done: doneAll, xp: dayXp },
    xp: int(base.xp) + gained,
    learnDays,
  };
}

// days in a row with a finished step, ending today or yesterday (a streak is not lost before the day is over)
export function learnStreak(learnDays = [], today = localDate()) {
  const days = new Set(learnDays);
  const back = (date, n) => localDate(new Date(Date.parse(`${date}T12:00:00`) - n * DAY_MS));
  let cursor = days.has(today) ? today : back(today, 1);
  let streak = 0;
  while (days.has(cursor)) { streak += 1; cursor = back(cursor, 1); }
  return streak;
}

// the browser's copy (staff preview, a failed save, the moment before Firestore answers)
const KEY = (uid) => `ks-tana-${uid || 'anon'}`;
export function readLocalPractice(uid, storage = globalThis.localStorage) {
  try { return JSON.parse(storage?.getItem(KEY(uid)) || 'null') || {}; } catch { return {}; }
}
export function writeLocalPractice(uid, practice, storage = globalThis.localStorage) {
  try { storage?.setItem(KEY(uid), JSON.stringify({ today: practice.today, xp: practice.xp, learnDays: practice.learnDays })); } catch { /* private mode */ }
}

// the newer of two copies of today's progress (the account and this browser): more done wins, then more XP
export function newerPractice(a = {}, b = {}) {
  const score = (p) => (p?.today ? (dayNumber(p.today.date) * 1000) + (p.today.done?.length || 0) * 100 + (p.today.xp || 0) : 0);
  const pick = score(b) > score(a) ? b : a;
  return { ...a, ...b, today: pick.today, xp: Math.max(int(a.xp), int(b.xp)), learnDays: [...new Set([...(a.learnDays || []), ...(b.learnDays || [])])].sort().slice(-LEARN_DAYS) };
}
