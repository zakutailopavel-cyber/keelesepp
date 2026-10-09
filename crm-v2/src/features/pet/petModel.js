// What the pet looks like and says, derived only from data the CRM already has (lessons, submitted work,
// results per lesson goal). Nothing here can be "farmed": the student cannot write any of these inputs.

export const PET_KINDS = ['siil', 'rebane', 'kakk', 'draakon'];
// speech: per recorded lesson up to 5 XP, one per 20% of what the learner said in the lesson language (petLessonStats)
export const XP = { lesson: 10, submission: 15, goal: 5, homework: 10, word: 2, streakDay: 3, speech: 5 };
export const speechXp = (stat) => Math.max(0, Math.min(XP.speech, Math.floor((Number(stat?.share) || 0) / 20)));
// a word counts as learned once it reached Leitner box 3 (known three times in a row, spread over days)
export const WORD_LEARNED_BOX = 3;
const STREAK_XP_CAP = 30;
export const STAGE_AT = [0, 100, 300]; // xp where Beebi, Noor, Täiskasvanu start

const DAY = 24 * 60 * 60 * 1000;
const time = (value) => {
  const t = new Date(String(value || '').length === 10 ? `${value}T12:00:00` : value).getTime();
  return Number.isNaN(t) ? 0 : t;
};

// Lesson journal statuses: 'Toimunud' held; 'Puudus_eta' / 'Puudus_p' / 'Puudus…' absent; 'Tühistatud' cancelled;
// 'Planeeritud' not yet. A record without a status is an older journal entry of a held lesson.
export function isAttended(lesson) {
  const status = String(lesson?.status || '');
  return !status || status === 'Toimunud';
}

// goals fully reached in one submitted worksheet (score.perGoal: { goalId: { ok, total } })
function goalsReached(submission) {
  const perGoal = submission?.score?.perGoal || submission?.source?.score?.perGoal || {};
  return Object.entries(perGoal).filter(([id, g]) => id !== '_none' && g?.total > 0 && g.ok === g.total).length;
}

const dayKey = (t) => new Date(t).toISOString().slice(0, 10);

// Days in a row with any learning (attended lesson, submitted work, homework marked done, word practice), ending
// today or yesterday (a streak is not lost before the day is over).
export function learningStreak(activityTimes = [], now = Date.now()) {
  const days = new Set(activityTimes.filter((t) => t && t <= now).map(dayKey));
  let cursor = days.has(dayKey(now)) ? now : now - DAY;
  let streak = 0;
  while (days.has(dayKey(cursor))) { streak += 1; cursor -= DAY; }
  return streak;
}

export function petProgress({ lessons = [], submissions = [], homework = [], words = [], speech = [], now = Date.now() }) {
  // only lessons the student actually attended feed the pet (absences 'Puudus_*' and cancellations do not)
  const held = lessons.filter((l) => isAttended(l) && time(l.date) && time(l.date) <= now);
  const done = submissions.filter((s) => s.status === 'done' || s.completedAt);
  const goals = done.reduce((n, s) => n + goalsReached(s), 0);
  // homework the student (or teacher) marked done, and words learned in „Minu sõnad”
  const homeworkDone = homework.filter((h) => h.status === 'Tehtud');
  const learnedWords = words.filter((w) => (w.box || 0) >= WORD_LEARNED_BOX).length;
  const activity = [
    ...held.map((l) => time(l.date)), ...done.map((s) => time(s.completedAt)),
    ...homeworkDone.map((h) => time(h.submittedAt || h.updatedAt)), ...words.map((w) => time(w.reviewedAt)),
  ];
  const streak = learningStreak(activity, now);
  const xp = held.length * XP.lesson + done.length * XP.submission + goals * XP.goal
    + homeworkDone.length * XP.homework + learnedWords * XP.word + Math.min(STREAK_XP_CAP, streak * XP.streakDay)
    + speech.reduce((sum, stat) => sum + speechXp(stat), 0);
  const stage = xp >= STAGE_AT[2] ? 3 : xp >= STAGE_AT[1] ? 2 : 1;
  const from = STAGE_AT[stage - 1];
  const to = STAGE_AT[stage] ?? null;
  const lastLesson = Math.max(0, ...held.map((l) => time(l.date)));
  const lastWork = Math.max(0, ...done.map((s) => time(s.completedAt)));
  const lastGoal = Math.max(0, ...done.filter((s) => goalsReached(s) > 0).map((s) => time(s.completedAt)));
  const last = Math.max(lastLesson, lastWork, ...activity.filter((t) => t <= now));
  let mood = 'calm';
  if (lastGoal && now - lastGoal <= 3 * DAY) mood = 'proud';
  else if (last && now - last <= 2 * DAY) mood = 'happy';
  else if (!last || now - last > 14 * DAY) mood = xp ? 'sleep' : 'calm';
  return {
    xp, stage, mood, goals, lessons: held.length, submissions: done.length,
    homework: homeworkDone.length, learnedWords, streak, stars: Math.floor(xp / 5), speechLessons: speech.length,
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
    speech: (n) => (n >= 50 ? `Tunnis rääkisid ${n}% eesti keeles. Tubli!` : `Tunnis rääkisid ${n}% eesti keeles. Järgmine kord veel rohkem!`),
  },
  ru: {
    greet: (name) => `Привет! Я ${name}.`,
    lessonToday: (t) => `Сегодня в ${t} урок. Ты готов(а)?`,
    homework: (n) => (n === 1 ? 'У тебя одно домашнее задание. Сделаем?' : `У тебя ${n} домашних заданий. Сделаем?`),
    proud: 'Ты выполнил(а) цель урока! Я тобой горжусь.',
    sleep: 'Ой, я спал(а). Хорошо, что ты вернулся(ась)!',
    fine: 'Всё сделано. Молодец!',
    speech: (n) => (n >= 50 ? `На уроке ты говорил(а) по-эстонски ${n}% времени. Молодец!` : `На уроке ты говорил(а) по-эстонски ${n}%. В следующий раз ещё больше!`),
  },
  en: {
    greet: (name) => `Hi! I'm ${name}.`,
    lessonToday: (t) => `You have a lesson today at ${t}. Ready?`,
    homework: (n) => (n === 1 ? 'You have one homework task. Shall we do it?' : `You have ${n} homework tasks. Shall we do it?`),
    proud: 'You reached a lesson goal! I am proud of you.',
    sleep: 'Oh, I was sleeping. Good to see you again!',
    fine: 'Everything is done. Well done!',
    speech: (n) => (n >= 50 ? `In the lesson ${n}% of what you said was in English. Great!` : `In the lesson ${n}% of what you said was in English. Even more next time!`),
  },
};

// One short line in the language the student is learning (English learners get English), with a Russian hint.
// `lastSpeech`: the latest recorded lesson's numbers (petLessonStats), praised for 3 days after the lesson
export function petGreeting({ petName, progress, pendingHomework = 0, lessonToday = '', subject = '', lastSpeech = null, now = Date.now() }) {
  const lang = /inglise|english/i.test(subject) ? 'en' : 'et';
  const pick = (p) => {
    if (progress.mood === 'sleep') return p.sleep;
    if (progress.mood === 'proud') return p.proud;
    if (lastSpeech && now - (Date.parse(lastSpeech.date || '') || 0) <= 3 * DAY && lastSpeech.studentWords >= 20) return p.speech(lastSpeech.share);
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
