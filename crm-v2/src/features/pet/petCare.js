// Tamagotchi care: three needs that slowly run down and are filled only by learning.
//   Kõht (food)   ← repeating words of „Minu sõnad” (3 fresh reviews = full; empties in 2 days)
//   Energia       ← homework: full while nothing is open; open homework drains it from the last finished work
//   Rõõm (joy)    ← an attended lesson (lasts a week) or the word game (lasts 2 days; needs 3 words with translation)
// A need is full when there is nothing to do for it (no words due, no open homework), so a student is never
// punished for what the teacher did not give. The pet never dies; when a need is low it is only sad.
// Care never gives XP or stars (those come only from CRM data in petModel.js), so playing cannot be farmed.
import { isHomeworkOpen } from '../homework/homeworkStatus.js';
import { isDue } from '../vocabulary/wordsModel.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
export const FEED_WORDS = 3;
export const GAME_ROUNDS = 4;
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

export function petNeeds({ words = [], homework = [], submissions = [], lessons = [], playedAt = '', now = Date.now() }) {
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
  const canPlay = playableWords(words).length >= 3;
  // without the game there is nothing the student could do for joy, so it stays full
  const joy = canPlay ? Math.max(fresh(lastLesson, LESSON_JOY_DAYS * DAY, now), fresh(time(playedAt), GAME_JOY_DAYS * DAY, now)) : 100;

  return { food, energy, joy, dueWords: due.length, openHomework: open.length, canPlay };
}

// the lowest need below LOW_NEED, or '' when the pet is fine
export function lowestNeed(needs) {
  const [key, value] = ['food', 'energy', 'joy'].map((k) => [k, needs[k]]).sort((a, b) => a[1] - b[1])[0];
  return value < LOW_NEED ? key : '';
}

// proud and asleep win; otherwise a low need makes the pet sad
export function careMood(mood, needs) {
  if (mood === 'proud' || mood === 'sleep') return mood;
  return lowestNeed(needs) ? 'sad' : mood;
}

// words for feeding: the due ones first (oldest due first), at most FEED_WORDS
export const feedingWords = (words = [], now = Date.now()) => words.filter((w) => isDue(w, now))
  .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt))).slice(0, FEED_WORDS);

const playableWords = (words) => {
  const seen = new Set();
  return words.filter((w) => {
    const key = String(w.translation || '').trim().toLocaleLowerCase();
    if (!w.word || !key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// The word game: GAME_ROUNDS questions „word → pick the translation (1 of 3)”. `random` is injectable for tests.
export function gameRounds(words = [], random = Math.random) {
  const pool = playableWords(words);
  if (pool.length < 3) return [];
  const shuffle = (list) => list.map((v) => [random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  return shuffle(pool).slice(0, GAME_ROUNDS).map((word) => ({
    id: word.id,
    word: word.word,
    answer: word.translation,
    options: shuffle([word.translation, ...shuffle(pool.filter((w) => w !== word)).slice(0, 2).map((w) => w.translation)]),
  }));
}

const PHRASES = {
  et: {
    food: 'Mul on kõht tühi. Kordame kolm sõna?',
    energy: 'Olen väsinud. Teeme kodutöö ära?',
    joy: 'Mul on igav. Mängime sõnamängu?',
  },
  ru: {
    food: 'Я проголодался(ась). Повторим три слова?',
    energy: 'Я устал(а). Сделаем домашку?',
    joy: 'Мне скучно. Сыграем в игру со словами?',
  },
  en: {
    food: "I'm hungry. Shall we repeat three words?",
    energy: "I'm tired. Shall we do the homework?",
    joy: "I'm bored. Shall we play the word game?",
  },
};

export function careGreeting(need, lang = 'et') {
  return { text: PHRASES[lang]?.[need] || PHRASES.et[need], hint: PHRASES.ru[need], lang };
}
