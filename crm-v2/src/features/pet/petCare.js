// Tamagotchi care: three needs that slowly run down and are filled only by learning.
//   Kõht (food)   ← repeating words of „Minu sõnad” (3 fresh reviews = full; empties in 2 days)
//   Energia       ← homework: full while nothing is open; open homework drains it from the last finished work
//   Rõõm (joy)    ← an attended lesson (lasts a week) or playing in „Lemmik” (`playedAt`, lasts 2 days)
// Since 2026-11-09 the care actions use the cabinet's one card UI (FlashcardSession) and the practice lesson
// („Paranda”); the old word game (gameRounds), „Paranda” rounds (fixRounds) and the care phrases are gone.
// A need is full when there is nothing to do for it (no words due, no open homework), so a student is never
// punished for what the teacher did not give. The pet never dies; a low need only makes it ask.
// Care never gives XP or stars (those come only from CRM data in petModel.js), so playing cannot be farmed.
import { isHomeworkOpen } from '../homework/homeworkStatus.js';
import { isDue } from '../vocabulary/wordsModel.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
export const FEED_WORDS = 3;
export const LOW_NEED = 25;
const FOOD_HOURS = 48;
const ENERGY_DAYS = 5;
const LESSON_JOY_DAYS = 7;
const GAME_JOY_DAYS = 2;

const time = (value) => {
  const t = new Date(String(value || '').length === 10 ? `${value}T12:00:00` : value).getTime();
  return Number.isNaN(t) ? 0 : t;
};
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
// 100 right after `at`, 0 after `span`
const fresh = (at, span, now) => (at && at <= now ? clamp(100 * (1 - (now - at) / span)) : 0);

// `canFix`: the learner has own corrected sentences from a lesson (petLessonStats.practice), so the „Paranda” game counts
export function petNeeds({ words = [], homework = [], submissions = [], lessons = [], playedAt = '', canFix = false, now = Date.now() }) {
  const due = words.filter((w) => isDue(w, now));
  const fedBy = words.reduce((sum, w) => sum + fresh(time(w.reviewedAt), FOOD_HOURS * HOUR, now) / FEED_WORDS, 0);
  const food = due.length ? clamp(fedBy) : 100;

  const open = homework.filter(isHomeworkOpen);
  const lastWork = Math.max(0,
    ...homework.filter((h) => h.status === 'Tehtud').map((h) => time(h.submittedAt || h.updatedAt)),
    ...submissions.filter((s) => s.status === 'done' || s.completedAt).map((s) => time(s.completedAt)),
    ...open.map((h) => time(h.createdAt || h.assignedAt)));
  const energy = open.length ? fresh(lastWork, ENERGY_DAYS * DAY, now) : 100;

  const lastLesson = Math.max(0, ...lessons.filter((l) => !l.status || l.status === 'Toimunud').map((l) => time(l.date)).filter((t) => t <= now));
  const canPlay = playableWords(words).length >= 3 || Boolean(canFix);
  // without the game there is nothing the student could do for joy, so it stays full
  const joy = canPlay ? Math.max(fresh(lastLesson, LESSON_JOY_DAYS * DAY, now), fresh(time(playedAt), GAME_JOY_DAYS * DAY, now)) : 100;

  return { food, energy, joy, dueWords: due.length, openHomework: open.length, canPlay, canWordGame: playableWords(words).length >= 3 };
}

// the lowest need below LOW_NEED, or '' when the pet is fine
export function lowestNeed(needs) {
  const [key, value] = ['food', 'energy', 'joy'].map((k) => [k, needs[k]]).sort((a, b) => a[1] - b[1])[0];
  return value < LOW_NEED ? key : '';
}

// proud and asleep win; a low need only quiets the pet: never tears or shame over a missed day (owner 2026-11-01)
export function careMood(mood, needs) {
  if (mood === 'proud' || mood === 'sleep') return mood;
  return lowestNeed(needs) ? 'calm' : mood;
}

const playableWords = (words) => {
  const seen = new Set();
  return words.filter((w) => {
    const key = String(w.translation || '').trim().toLocaleLowerCase();
    // a „Sinu lause” card holds his sentence, not a translation to pick
    if (!w.word || !key || key.startsWith('sinu lause:') || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
