// The pet on the home page „Täna” (owner 2026-11-01 „make the pet the reason to come back”; 2026-11-09 one daily flow):
// it no longer asks for tasks of its own — nextStep.js decides what to do — the pet only REWARDS: it reacts after each
// step of „Täna”, thanks at the end of the day, a small surprise, and a reward that is always in sight. Pure.
// Growth is derived from real learning (petModel.js) plus the capped practice XP of „Täna” (practice/progress.js);
// nothing here gives XP or stars.
import { localDate } from '../../utils/localDate.js';
import { PET_ITEMS, availableStars } from './petItems.js';
import { roomContents } from './petRoom.js';

const DAY = 24 * 60 * 60 * 1000;
const STAR_XP = 5;
const SENTENCE = 'Sinu lause:';
const clean = (value) => String(value ?? '').trim();
const short = (text, max = 44) => { const t = clean(text); return t.length > max ? `${t.slice(0, max - 1)}…` : t; };
const time = (value) => Date.parse(value || '') || 0;
const isSentence = (word) => String(word?.translation || '').startsWith(SENTENCE);
export const langOf = (subject = '') => (/inglise|english/i.test(subject) ? 'en' : 'et');
const dayOf = (value) => { const t = time(value); return t ? localDate(new Date(t)) : ''; };

// Levels between the three art stages: with one lesson a week the pet still moves on every week (10 XP per lesson).
export const LEVEL_XP = 10;
export const petLevel = (xp = 0) => Math.floor(Math.max(0, xp) / LEVEL_XP) + 1;

// played with in Lemmik today (on any device)
export const playedToday = ({ pet = null, today }) => dayOf(pet?.playedAt) === today;

// The pet's mood in one word for the home card („Tuju”): glad after today's learning, proud of a great week, else calm.
// Never sad or ashamed (owner 2026-11-01).
const MOODS = {
  glad: { et: 'rõõmus', ru: 'радуется' },
  proud: { et: 'uhke', ru: 'гордится' },
  calm: { et: 'rahulik', ru: 'спокоен' },
};
export function moodLabel({ mood = 'calm', done = false }) {
  if (done || mood === 'happy') return { key: 'glad', ...MOODS.glad };
  if (mood === 'proud') return { key: 'proud', ...MOODS.proud };
  return { key: 'calm', ...MOODS.calm };
}

const THANKS = {
  words: { et: 'Aitäh! Sõnad on korratud.', en: 'Thank you! The words are done.', ru: 'Спасибо! Слова повторены.' },
  sentences: { et: 'Tubli! Laused tulevad juba paremini.', en: 'Well done! Your sentences are getting better.', ru: 'Молодец! Фразы получаются всё лучше.' },
  homework: { et: 'Tubli! Ülesanne on tehtud.', en: 'Well done! The task is done.', ru: 'Молодец! Задание сделано.' },
  course: { et: 'Tubli! Üks samm kursusel edasi.', en: 'Well done! One more step in the course.', ru: 'Молодец! Ещё шаг по курсу.' },
  finished: { et: 'Aitäh! Täna on kõik tehtud. Olen sinu üle uhke!', en: 'Thank you! Everything is done today. I am proud of you!', ru: 'Спасибо! Сегодня всё сделано. Я тобой горжусь!' },
  ready: { et: 'Alustame? Mina olen kohe siin.', en: 'Shall we start? I am right here.', ru: 'Начнём? Я рядом.' },
  content: { et: 'Täna on mul kõik hästi. Aitäh!', en: 'I am fine today. Thank you!', ru: 'Сегодня у меня всё хорошо. Спасибо!' },
};
// what the pet says after a step of „Täna” (`kind` = the step's key), at the end (`finished`), or before the start
export function thanksLine(kind, lang = 'et') {
  const row = THANKS[kind] || THANKS.content;
  return { text: row[lang] || row.et, hint: row.ru, lang };
}

// after some days away: glad to see you, never how long it was
const WELCOME = { et: 'Tore, et sa tagasi oled!', en: "I'm so glad you're back!", ru: 'Как здорово, что ты вернулся(ась)!' };
export const WELCOME_AFTER_DAYS = 3;
export function isBackAfterAbsence({ lastSeenAt = 0, lastActivity = 0, now = Date.now() }) {
  const last = Math.max(lastSeenAt, lastActivity);
  return Boolean(last) && now - last >= WELCOME_AFTER_DAYS * DAY;
}
export const welcomeLine = (lang = 'et') => ({ text: WELCOME[lang] || WELCOME.et, hint: WELCOME.ru, lang });

// What is left in plain learning: a word learned is 2 XP; a lesson or a homework at least 10 (petModel.XP).
export function leftInWork(xp) {
  if (xp <= 8) { const n = Math.ceil(xp / 2); return `veel ${n} õpitud sõna`; }
  const n = Math.ceil(xp / 10);
  return n === 1 ? 'veel 1 tund või ülesanne' : `veel ${n} tundi või ülesannet`;
}

// The nearest thing to get: the cheapest item not yet his (bought with earned stars) or the next art stage.
export function nextReward({ progress, pet = {} }) {
  const owned = pet?.owned || [];
  const item = [...PET_ITEMS].sort((a, b) => a.price - b.price).find((candidate) => !owned.includes(candidate.id)) || null;
  const stars = availableStars(progress, pet);
  const itemXp = item ? (item.price - stars) * STAR_XP - ((progress?.xp || 0) % STAR_XP) : Infinity;
  const stageXp = progress?.stageSize ? progress.stageSize - progress.stageXp : Infinity;
  if (item && item.price <= stars) return { kind: 'item', item, name: item.name, ready: true, pct: 100, text: `${item.name} on valmis!` };
  if (!Number.isFinite(itemXp) && !Number.isFinite(stageXp)) return null;
  if (stageXp < itemXp) {
    return { kind: 'stage', name: progress.nextItem || 'uus kuju', ready: false, pct: Math.round((progress.stageXp / progress.stageSize) * 100), text: `${leftInWork(stageXp)} → ${progress.nextItem || 'uus kuju'}` };
  }
  return { kind: 'item', item, name: item.name, ready: false, pct: Math.max(0, Math.min(99, Math.round((stars / item.price) * 100))), text: `${leftInWork(itemXp)} → ${item.name}` };
}

// One-time news when something new was reached since the last look: the stage first, then a reward, then a level.
// `seen` is what this browser last showed; a first look starts counting from now (no flood of old news).
export function growthNews({ progress, reward, seen, name = '' }) {
  const current = { stage: progress.stage, level: petLevel(progress.xp), ready: reward?.ready ? reward.item?.id || '' : '' };
  if (!seen) return { news: null, seen: current };
  const merged = { stage: Math.max(seen.stage || 0, current.stage), level: Math.max(seen.level || 0, current.level), ready: current.ready || seen.ready || '' };
  if (current.stage > (seen.stage || 0)) return { news: { key: 'stage', text: `${name} kasvas suuremaks!`, hint: `${name} подрос(ла)!` }, seen: merged };
  if (current.ready && current.ready !== seen.ready) return { news: { key: 'item', text: `Uus asi on sinu: ${reward.name}!`, hint: 'Новая вещь уже твоя!' }, seen: merged };
  if (current.level > (seen.level || 0)) return { news: { key: 'level', text: `${name} jõudis ${current.level}. tasemele!`, hint: `${name}: уровень ${current.level}!` }, seen: merged };
  return { news: null, seen: merged };
}

// A small surprise after the day's first action: something true about HIS learning, a different one each day.
// Nothing is made up: a line exists only when the data for it exists.
const hash = (text) => [...String(text)].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 1000003, 7);
export function surpriseLines({ words = [], stats = [], progress = {}, lang = 'et', now = Date.now() }) {
  const en = lang === 'en';
  const week = now - 7 * DAY;
  const out = [];
  const add = (key, et, enText, ru) => out.push({ key, text: en ? enText : et, hint: ru, lang });
  const learned = words.find((word) => !isSentence(word) && (word.box || 0) >= 3 && time(word.reviewedAt) >= week);
  if (learned) add('learned', `Sõna „${short(learned.word, 30)}” on sul nüüd selgeks õpitud.`, `You have now learned the word "${short(learned.word, 30)}".`, `Слово «${short(learned.word, 30)}» ты уже выучил(а).`);
  const fixed = words.find((word) => isSentence(word) && (word.box || 0) >= 1 && time(word.reviewedAt) >= week);
  if (fixed) add('fixed', `Sinu lause tuleb juba õigesti: „${short(fixed.word)}”.`, `Your sentence is already right: "${short(fixed.word)}".`, `Твоя фраза уже получается: «${short(fixed.word)}».`);
  const repeated = words.filter((word) => time(word.reviewedAt) >= week).length;
  if (repeated >= 2) add('week', `Viimase seitsme päevaga kordasid ${repeated} sõna.`, `You repeated ${repeated} words in the last seven days.`, `За последние семь дней ты повторил(а) слов: ${repeated}.`);
  const talk = stats.find((stat) => (stat.studentWords || 0) >= 20 && (stat.share || 0) >= 30);
  if (talk) add('share', `Viimases salvestatud tunnis rääkisid ${talk.share}% eesti keeles.`, `In your last recorded lesson ${talk.share}% of what you said was in English.`, `На последнем записанном уроке ты говорил(а) на языке ${talk.share}%.`);
  const example = words.find((word) => clean(word.example) && (word.box || 0) < 5);
  if (example) add('example', `Sinu sõna „${short(example.word, 24)}”: ${short(example.example, 70)}`, `Your word "${short(example.word, 24)}": ${short(example.example, 70)}`, `Твоё слово «${short(example.word, 24)}» в предложении.`);
  if ((progress.lessons || 0) >= 2) add('lessons', `Sul on olnud juba ${progress.lessons} tundi.`, `You have had ${progress.lessons} lessons already.`, `У тебя уже было уроков: ${progress.lessons}.`);
  const { books } = roomContents(progress);
  if (books >= 2) add('books', `Minu riiulil on ${books} raamatut: üks iga õpitud sõna eest.`, `There are ${books} books on my shelf: one for each word you learned.`, `На моей полке ${books} кн.: по одной за каждое выученное слово.`);
  if ((progress.bestStreak || 0) >= 3) add('best', `Kõige rohkem oled õppinud ${progress.bestStreak} päeva järjest.`, `Your longest run of learning is ${progress.bestStreak} days.`, `Дольше всего ты учился(ась) ${progress.bestStreak} дн. подряд.`);
  return out;
}
export function dailySurprise({ today, ...rest }) {
  const lines = surpriseLines(rest);
  return lines.length ? lines[hash(today) % lines.length] : null;
}

// the browser's memory of the loop (never the pet's growth)
const store = {
  get: (key) => { try { return globalThis.localStorage?.getItem(key) ?? null; } catch { return null; } },
  set: (key, value) => { try { globalThis.localStorage?.setItem(key, value); } catch { /* private mode */ } },
};
export function readSeenGrowth(uid) { try { return JSON.parse(store.get(`ks-pet-growth-${uid}`) || 'null'); } catch { return null; } }
export function writeSeenGrowth(uid, seen) { store.set(`ks-pet-growth-${uid}`, JSON.stringify(seen)); }
export function readLoopSeen(uid) { return Number(store.get(`ks-pet-loop-seen-${uid}`)) || 0; }
export function writeLoopSeen(uid, now = Date.now()) { store.set(`ks-pet-loop-seen-${uid}`, String(now)); }
