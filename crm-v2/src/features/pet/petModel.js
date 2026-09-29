// What the pet looks like and says, derived only from data the CRM already has (lessons, submitted work,
// results per lesson goal). Nothing here can be "farmed": the student cannot write any of these inputs.

export const PET_KINDS = ['siil', 'rebane', 'kakk', 'draakon'];
export const XP = { lesson: 10, submission: 15, goal: 5 };
export const STAGE_AT = [0, 100, 300]; // xp where Beebi, Noor, Täiskasvanu start

const DAY = 24 * 60 * 60 * 1000;
const time = (value) => {
  const t = new Date(String(value || '').length === 10 ? `${value}T12:00:00` : value).getTime();
  return Number.isNaN(t) ? 0 : t;
};

// goals fully reached in one submitted worksheet (score.perGoal: { goalId: { ok, total } })
function goalsReached(submission) {
  const perGoal = submission?.score?.perGoal || submission?.source?.score?.perGoal || {};
  return Object.entries(perGoal).filter(([id, g]) => id !== '_none' && g?.total > 0 && g.ok === g.total).length;
}

export function petProgress({ lessons = [], submissions = [], now = Date.now() }) {
  const held = lessons.filter((l) => l.status !== 'Tühistatud' && time(l.date) && time(l.date) <= now);
  const done = submissions.filter((s) => s.status === 'done' || s.completedAt);
  const goals = done.reduce((n, s) => n + goalsReached(s), 0);
  const xp = held.length * XP.lesson + done.length * XP.submission + goals * XP.goal;
  const stage = xp >= STAGE_AT[2] ? 3 : xp >= STAGE_AT[1] ? 2 : 1;
  const from = STAGE_AT[stage - 1];
  const to = STAGE_AT[stage] ?? null;
  const lastLesson = Math.max(0, ...held.map((l) => time(l.date)));
  const lastWork = Math.max(0, ...done.map((s) => time(s.completedAt)));
  const lastGoal = Math.max(0, ...done.filter((s) => goalsReached(s) > 0).map((s) => time(s.completedAt)));
  const last = Math.max(lastLesson, lastWork);
  let mood = 'calm';
  if (lastGoal && now - lastGoal <= 3 * DAY) mood = 'proud';
  else if (last && now - last <= 2 * DAY) mood = 'happy';
  else if (!last || now - last > 14 * DAY) mood = xp ? 'sleep' : 'calm';
  return {
    xp, stage, mood, goals, lessons: held.length, submissions: done.length,
    stageXp: xp - from, stageSize: to ? to - from : null,
    nextItem: stage === 1 ? 'sall' : stage === 2 ? 'lõpetaja müts' : null,
  };
}

const PHRASES = {
  et: {
    greet: (name) => `Tere! Mina olen ${name}.`,
    lessonToday: (t) => `Täna kell ${t} on tund. Kas oled valmis?`,
    homework: (n) => (n === 1 ? 'Sul on üks kodutöö. Teeme ära?' : `Sul on ${n} kodutööd. Teeme ära?`),
    proud: 'Sa täitsid tunni eesmärgi! Olen sinu üle uhke.',
    sleep: 'Oi, ma magasin. Hea, et sa tagasi oled!',
    fine: 'Kõik on tehtud. Tubli!',
  },
  ru: {
    greet: (name) => `Привет! Я ${name}.`,
    lessonToday: (t) => `Сегодня в ${t} урок. Ты готов(а)?`,
    homework: (n) => (n === 1 ? 'У тебя одно домашнее задание. Сделаем?' : `У тебя ${n} домашних заданий. Сделаем?`),
    proud: 'Ты выполнил(а) цель урока! Я тобой горжусь.',
    sleep: 'Ой, я спал(а). Хорошо, что ты вернулся(ась)!',
    fine: 'Всё сделано. Молодец!',
  },
  en: {
    greet: (name) => `Hi! I'm ${name}.`,
    lessonToday: (t) => `You have a lesson today at ${t}. Ready?`,
    homework: (n) => (n === 1 ? 'You have one homework task. Shall we do it?' : `You have ${n} homework tasks. Shall we do it?`),
    proud: 'You reached a lesson goal! I am proud of you.',
    sleep: 'Oh, I was sleeping. Good to see you again!',
    fine: 'Everything is done. Well done!',
  },
};

// One short line in the language the student is learning (English learners get English), with a Russian hint.
export function petGreeting({ petName, progress, pendingHomework = 0, lessonToday = '', subject = '' }) {
  const lang = /inglise|english/i.test(subject) ? 'en' : 'et';
  const pick = (p) => {
    if (progress.mood === 'sleep') return p.sleep;
    if (progress.mood === 'proud') return p.proud;
    if (lessonToday) return p.lessonToday(lessonToday);
    if (pendingHomework) return p.homework(pendingHomework);
    return progress.xp ? p.fine : p.greet(petName);
  };
  return { text: pick(PHRASES[lang]), hint: pick(PHRASES.ru), lang };
}

export function validPetName(value) {
  const name = String(value || '').trim();
  if (!name) return 'Anna oma sõbrale nimi.';
  if (name.length > 24) return 'Nimi võib olla kuni 24 tähemärki.';
  return '';
}
