// What makes the walking pet feel alive: the time of day, the season and what it remembers about the learner
// (his next lesson, his own sentences from a recorded lesson, his words, how long he was away). Pure functions; the
// component passes in what it knows. Every line is short, in the language being learned, with a Russian hint.

const DAY = 24 * 60 * 60 * 1000;

// morning 5–10, day 10–18, evening 18–22, night 22–5 (local time)
export function dayPart(now = Date.now()) {
  const h = new Date(now).getHours();
  if (h >= 5 && h < 10) return 'morning';
  if (h >= 10 && h < 18) return 'day';
  if (h >= 18 && h < 22) return 'evening';
  return 'night';
}

// christmas (1 Dec – 6 Jan) is also winter
export function season(now = Date.now()) {
  const d = new Date(now);
  const m = d.getMonth();
  if ((m === 11) || (m === 0 && d.getDate() <= 6)) return 'christmas';
  if (m <= 1) return 'winter';
  if (m <= 4) return 'spring';
  if (m <= 7) return 'summer';
  return 'autumn';
}

// a seasonal hat when the pet wears none: Santa's hat at Christmas, a night cap while asleep at night
export function seasonalWear(wearing = {}, { now = Date.now(), asleep = false } = {}) {
  if (wearing.hat) return wearing;
  if (asleep && dayPart(now) === 'night') return { ...wearing, hat: 'nightcap' };
  if (season(now) === 'christmas') return { ...wearing, hat: 'santa' };
  return wearing;
}

const WEEKDAY = {
  et: ['pühapäeval', 'esmaspäeval', 'teisipäeval', 'kolmapäeval', 'neljapäeval', 'reedel', 'laupäeval'],
  en: ['on Sunday', 'on Monday', 'on Tuesday', 'on Wednesday', 'on Thursday', 'on Friday', 'on Saturday'],
  ru: ['в воскресенье', 'в понедельник', 'во вторник', 'в среду', 'в четверг', 'в пятницу', 'в субботу'],
};
const isoDay = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

function when(date, now, lang) {
  const today = isoDay(now);
  const tomorrow = isoDay(now + DAY);
  if (date === today) return { et: 'täna', en: 'today', ru: 'сегодня' }[lang];
  if (date === tomorrow) return { et: 'homme', en: 'tomorrow', ru: 'завтра' }[lang];
  return WEEKDAY[lang][new Date(`${date}T12:00:00`).getDay()];
}

// the first lesson that has not started yet ({ occurrenceDate, time, teacher, status } from calendarView)
export function nextLesson(occurrences = [], now = Date.now()) {
  const today = isoDay(now);
  const d = new Date(now);
  const clock = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return occurrences
    .filter((l) => l.status !== 'Tühistatud' && l.occurrenceDate && (l.occurrenceDate > today || (l.occurrenceDate === today && String(l.time || '') > clock)))
    .sort((a, b) => `${a.occurrenceDate} ${a.time}`.localeCompare(`${b.occurrenceDate} ${b.time}`))[0] || null;
}

const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || '';
const short = (text, max = 60) => { const t = String(text || '').trim(); return t.length > max ? `${t.slice(0, max - 1)}…` : t; };

// Personal lines, most personal first: away for days, the time of day, the next lesson, his own sentence from the
// last recorded lesson, one of his words, the season. `day` picks a different word each day.
export function lifeLines({ now = Date.now(), lastSeenAt = 0, lesson = null, speech = [], words = [], lang = 'et' } = {}) {
  const en = lang === 'en';
  const out = [];
  const add = (key, et, enText, ru) => out.push({ key, text: en ? enText : et, hint: ru });

  const away = lastSeenAt ? Math.floor((now - lastSeenAt) / DAY) : 0;
  if (away >= 3) add('missed', `Ma igatsesin sind! Sind polnud ${away} päeva.`, `I missed you! You were away for ${away} days.`, `Я скучал(а)! Тебя не было ${away} дн.`);

  const part = dayPart(now);
  if (part === 'morning') add('morning', 'Tere hommikust! Mis plaanid täna on?', 'Good morning! What are your plans today?', 'Доброе утро! Какие планы на сегодня?');
  if (part === 'evening') add('evening', 'Tere õhtust! Kordame enne und paar sõna?', 'Good evening! Shall we repeat a few words before bed?', 'Добрый вечер! Повторим пару слов перед сном?');
  if (part === 'night') add('night', 'Juba hilja… Ma olen unine. Head ööd!', 'It is late… I am sleepy. Good night!', 'Уже поздно… Я сонный(ая). Спокойной ночи!');

  if (lesson) {
    const teacher = firstName(lesson.teacher);
    const named = teacher && !/määramata/i.test(lesson.teacher);
    add('lesson',
      `Järgmine tund on ${when(lesson.occurrenceDate, now, 'et')} kell ${lesson.time}.${named ? ` ${teacher} ootab sind!` : ''}`,
      `Your next lesson is ${when(lesson.occurrenceDate, now, 'en')} at ${lesson.time}.${named ? ` ${teacher} is waiting for you!` : ''}`,
      `Следующий урок ${when(lesson.occurrenceDate, now, 'ru')} в ${lesson.time}.${named ? ` ${teacher} ждёт тебя!` : ''}`);
  }

  const last = speech.find((s) => now - (Date.parse(s.date || '') || 0) <= 14 * DAY);
  if (last?.practice?.length) {
    const p = last.practice[0];
    add('said', `Mäletan, tunnis ütlesid „${short(p.said)}”. Õigesti on „${short(p.corrected)}”.`, `I remember: in the lesson you said "${short(p.said)}". Correct: "${short(p.corrected)}".`, `Помню, на уроке ты сказал(а) «${short(p.said)}». Правильно: «${short(p.corrected)}».`);
  } else if (last && last.studentWords >= 20 && last.share >= 50) {
    add('share', `Mäletan, tunnis rääkisid ${last.share}% eesti keeles. Super!`, `I remember: ${last.share}% of what you said in the lesson was in English. Super!`, `Помню, на уроке ты ${last.share}% времени говорил(а) на языке. Супер!`);
  }

  const learning = words.filter((w) => w.word && w.translation && (w.box ?? 0) < 5);
  if (learning.length) {
    const w = learning[Math.floor(now / DAY) % learning.length];
    add('word', `Kas mäletad sõna „${short(w.word, 30)}”? See on „${short(w.translation, 30)}”.`, `Do you remember the word "${short(w.word, 30)}"? It means "${short(w.translation, 30)}".`, `Помнишь слово «${short(w.word, 30)}»? Это «${short(w.translation, 30)}».`);
  }

  const s = season(now);
  if (s === 'christmas') add('season', 'Varsti on jõulud! Mida sa jõuluvanalt soovid?', 'Christmas is coming! What do you wish for?', 'Скоро Рождество! Что ты хочешь получить?');
  else if (s === 'winter') add('season', 'Väljas on talv ja lumi. Mul on soe!', 'It is winter and snowy. I am warm!', 'На улице зима и снег. Мне тепло!');
  else if (s === 'autumn') add('season', 'Sügis! Lehed langevad ja meie õpime.', 'Autumn! Leaves fall and we learn.', 'Осень! Листья падают, а мы учимся.');
  else if (s === 'spring') add('season', 'Kevad! Kõik kasvab — ka sinu keel.', 'Spring! Everything grows — your English too.', 'Весна! Всё растёт — и твой язык тоже.');
  else add('season', 'Suvi! Aga natuke õppida võib ikka.', 'Summer! But a little learning is still fine.', 'Лето! Но немного поучиться всё равно можно.');
  return out;
}

// what the pet says right after it is dropped or tickled
export const REACTIONS = {
  drop: [['Hopsti!', 'Хоп!'], ['Vau, ma lendasin!', 'Ух ты, я летал(а)!'], ['Veel! Veel!', 'Ещё! Ещё!']],
  tickle: [['Hihii, see kõditab!', 'Хи-хи, щекотно!'], ['Pai-pai!', 'Погладь ещё!']],
};
