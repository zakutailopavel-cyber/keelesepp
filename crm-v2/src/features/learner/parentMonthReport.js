// „Kuu kokkuvõte vanemale” (owner 2026-10-23 / 2026-11-04): a short message to the family about one calendar month,
// drafted from stored data only — lessons held (count, never money or lessons left), topics, simple numbers from the
// lesson recordings, the word list and homework — in the parent's language (student `preferredLanguage`, default ru).
// Template text, no AI. The admin reads and edits it, copies it to wherever he writes to the family and marks it sent;
// nothing is ever sent from here on its own. Never invents teacher feedback: every sentence comes from a number or a
// title below, a section without data is left out.
import { localDate } from '../../utils/localDate.js';
import { groupRecordings } from '../lesson-recording/lessonTimeline.js';
import { monthSteps } from './monthSteps.js';

export const REPORT_LANGUAGES = ['ru', 'et', 'en', 'uk'];
export const LANGUAGE_LABEL = { ru: 'vene', et: 'eesti', en: 'inglise', uk: 'ukraina' };
// a share of sentences with errors is compared only when both months have this many checked sentences
export const MIN_CHECKED = 20;
// a change smaller than this (percentage points) is not called a change
export const MIN_SHARE_CHANGE = 5;
const MIN_LONGEST = 5;
const MAX_TOPICS = 6;

const CYRILLIC = /[а-яёієїґ]/i;
const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const toDate = (value) => (typeof value?.toDate === 'function' ? value.toDate() : value instanceof Date ? value : new Date(value || ''));
// 'YYYY-MM' of a stored date: plain 'YYYY-MM-DD' strings as written, timestamps by the school's (browser's) day
export function monthOf(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}(-\d{2})?$/.test(value.trim())) return value.trim().slice(0, 7);
  const date = toDate(value);
  return Number.isNaN(date.getTime()) ? '' : localDate(date).slice(0, 7);
}
const dayOf = (value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim();
  const date = toDate(value);
  return Number.isNaN(date.getTime()) ? '' : localDate(date);
};

export function previousMonth(key) {
  const [y, m] = key.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}
// the last full month in the first 10 days of a month, else the month so far
export function defaultMonth(now = Date.now()) {
  const today = localDate(new Date(now));
  return Number(today.slice(8, 10)) <= 10 ? previousMonth(today.slice(0, 7)) : today.slice(0, 7);
}
export function reportLanguage(student = {}) {
  const value = String(student.preferredLanguage || '').toLowerCase();
  return REPORT_LANGUAGES.includes(value) ? value : 'ru';
}

// ── topics: course lesson titles from the lessons and sheets, board page titles of the lesson summaries ──
const GENERIC_TITLE = /^(leht|tahvel|tööleht|tund|uus leht|tühi leht|õpilase töö|page|board|lesson)(\s*\d+)?$/i;
const PHASE_SUFFIX = /\s*[·•|-]\s*(avasta|harjuta|kasuta|õpik)\s*$/i;
export function plainTopic(value) {
  const text = clean(value).replace(PHASE_SUFFIX, '').replace(/^(tööleht|leht)\s*[:·-]\s*/i, '').slice(0, 120);
  return text && !GENERIC_TITLE.test(text) ? text : '';
}
function topicsOf({ month, lessons, assignments, summaries }) {
  const seen = new Set();
  const out = [];
  const add = (value) => {
    const topic = plainTopic(value);
    const key = topic.toLocaleLowerCase('et');
    if (topic && !seen.has(key)) { seen.add(key); out.push(topic); }
  };
  lessons.filter((l) => l.status === 'Toimunud' && monthOf(l.date) === month)
    .sort((a, b) => String(a.date).localeCompare(String(b.date))).forEach((l) => add(l.topic));
  assignments.filter((a) => monthOf(a.completedAt || a.assignedAt) === month)
    .forEach((a) => add(a.lessonTitle || a.worksheetDoc?.meta?.title));
  summaries.filter((s) => monthOf(s.startedAt || s.endedAt) === month)
    .forEach((s) => (s.pages || []).forEach((p) => add(p.title)));
  return out.slice(0, MAX_TOPICS);
}

// ── recordings: share of checked sentences with errors (the Mac's GEC errors, not the teacher's recasts), the longest
// learner sentence in the lesson language, error topics ──
const words = (text) => String(text || '').split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
function longestSentence(recording) {
  const lang = recording.language === 'en' ? 'en' : 'et';
  let max = 0;
  for (const line of recording.transcript || []) {
    if (line.speaker === 'teacher') continue;
    if (line.lang ? line.lang !== lang : CYRILLIC.test(String(line.text || ''))) continue;
    for (const sentence of String(line.text || '').split(/[.!?…]+/)) max = Math.max(max, words(sentence));
  }
  return max;
}
function recordingMonth(lessons) {
  const analysed = lessons.filter((r) => r.analysis && !r.analysis.error && Array.isArray(r.analysis.errors));
  const counted = analysed.filter((r) => Number(r.analysis.checked) > 0);
  const checked = counted.reduce((n, r) => n + Number(r.analysis.checked), 0);
  const errors = counted.reduce((n, r) => n + r.analysis.errors.filter((e) => e?.source !== 'teacher').length, 0);
  const topics = new Map();
  for (const r of analysed) {
    for (const t of Array.isArray(r.analysis.focus) ? r.analysis.focus : []) {
      if (!t?.topic || !(t.count > 0)) continue;
      const key = t.key || clean(String(t.topic).split('(')[0].split(':')[0]);
      const item = topics.get(key) || { key, topic: t.topic, count: 0 };
      item.count += t.count;
      topics.set(key, item);
    }
  }
  return {
    analysed: analysed.length,
    checked,
    share: checked ? Math.round((errors / checked) * 100) : null,
    longest: lessons.reduce((max, r) => Math.max(max, longestSentence(r)), 0),
    topics: [...topics.values()].sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key))),
  };
}

export function monthFacts({ month, now = Date.now(), lessons = [], words: wordList = [], assignments = [], summaries = [], recordings = [], homework = [] } = {}) {
  const today = localDate(new Date(now));
  const prev = previousMonth(month);
  const partial = today.slice(0, 7) === month;
  const held = lessons.filter((l) => l.status === 'Toimunud' && monthOf(l.date) === month && dayOf(l.date) <= today).length;

  const grouped = groupRecordings(recordings.filter((r) => r?.status === 'done' || (Array.isArray(r?.transcript) && r.transcript.length)));
  const inMonth = (key) => grouped.filter((r) => monthOf(r.startedAt) === key);
  const cur = recordingMonth(inMonth(month));
  const before = recordingMonth(inMonth(prev));
  const errorShare = cur.checked >= MIN_CHECKED && before.checked >= MIN_CHECKED
    ? { now: cur.share, prev: before.share, checkedNow: cur.checked, checkedPrev: before.checked } : null;
  const longest = cur.longest >= MIN_LONGEST ? { now: cur.longest, prev: before.longest || null } : null;
  // a topic is „better” when last month it came up at least 3 times and now at most half as often per analysed lesson
  const improved = cur.analysed && before.analysed ? before.topics.filter((t) => {
    if (t.count < 3) return false;
    const now = cur.topics.find((x) => x.key === t.key)?.count || 0;
    return now / cur.analysed <= (t.count / before.analysed) / 2;
  }).slice(0, 1) : [];
  const focus = cur.topics.filter((t) => t.count >= 2 && !improved.some((x) => x.key === t.key)).slice(0, 2);

  const plainWords = wordList.filter((w) => !String(w.translation || '').startsWith('Sinu lause:'));
  const newWords = plainWords.filter((w) => monthOf(w.createdAt) === month).length;

  const due = homework.filter((h) => h.status !== 'Suletud' && /^\d{4}-\d{2}-\d{2}$/.test(String(h.due || '')) && monthOf(h.due) === month && h.due <= today);
  const onTime = due.filter((h) => h.status === 'Tehtud' && h.submittedAt && dayOf(h.submittedAt) && dayOf(h.submittedAt) <= h.due).length;

  // the course's own lesson steps still to practise, when the recordings give no error topics
  const monthSheets = assignments.filter((a) => monthOf(a.completedAt || a.assignedAt) === month);
  const steps = focus.length ? [] : monthSteps(monthSheets, { now, days: 100000 }).steps
    .filter((s) => s.state === 'review' || s.state === 'practise').slice(0, 2).map((s) => s.goal);

  return {
    month, prevMonth: prev, partial, until: partial ? today : '',
    lessonsHeld: held,
    topics: topicsOf({ month, lessons, assignments, summaries }),
    errorShare,
    shareNow: cur.share, checkedNow: cur.checked, sharePrev: before.share, checkedPrev: before.checked,
    longest,
    words: { total: plainWords.length, newInMonth: newWords },
    homework: due.length ? { onTime, total: due.length } : null,
    improved: improved.map((t) => ({ key: t.key, topic: t.topic })),
    focus: focus.map((t) => ({ key: t.key, topic: t.topic, count: t.count })),
    steps,
  };
}

// ── text ──
const MONTHS = {
  ru: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  et: ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  uk: ['січень', 'лютий', 'березень', 'квітень', 'травень', 'червень', 'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень'],
};
export function monthLabel(key, language = 'et') {
  const [y, m] = key.split('-').map(Number);
  return `${(MONTHS[language] || MONTHS.et)[m - 1]} ${y}`;
}
// Russian / Ukrainian: 1 слово, 2–4 слова, 5+ слов
function slavic(n, [one, few, many]) {
  const d = n % 10; const h = n % 100;
  if (d === 1 && h !== 11) return one;
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return few;
  return many;
}
const TOPIC_LABEL = {
  order: { ru: 'порядок слов в предложении', et: 'sõnajärg lauses', en: 'word order in a sentence', uk: 'порядок слів у реченні' },
  cases: { ru: 'падежи после глаголов и мест (куда? где? откуда?)', et: 'käänded tegusõna ja koha järel (kuhu? kus? kust?)', en: 'case endings after verbs and places (where to? where? where from?)', uk: 'відмінки після дієслів і місць (куди? де? звідки?)' },
  verb: { ru: 'формы глагола', et: 'tegusõna vormid', en: 'verb forms', uk: 'форми дієслова' },
  form: { ru: 'формы слов (падеж и число)', et: 'sõnavormid (kääne ja arv)', en: 'word forms (case and number)', uk: 'форми слів (відмінок і число)' },
  missing: { ru: 'пропущенные короткие слова (on, et, see)', et: 'puuduvad lühikesed sõnad (on, et, see)', en: 'missing short words (on, et, see)', uk: 'пропущені короткі слова (on, et, see)' },
  extra: { ru: 'лишние слова в предложении', et: 'liigsed sõnad lauses', en: 'extra words in a sentence', uk: 'зайві слова в реченні' },
  vocab: { ru: 'выбор слова', et: 'sõnavalik', en: 'word choice', uk: 'вибір слова' },
};
export const topicLabel = (t, language) => TOPIC_LABEL[t.key]?.[language] || clean(String(t.topic || '').split('(')[0].split(':')[0]);

const T = {
  ru: {
    hello: (p) => (p ? `Здравствуйте, ${p}!` : 'Здравствуйте!'),
    title: (m, n, until) => `Коротко об учёбе за месяц: ${m}${until ? ` (по ${until})` : ''}${n ? ` — ${n}` : ''}.`,
    lessons: (n) => (n ? `Уроков за месяц: ${n}.` : 'В этом месяце уроков не было.'),
    covered: 'Что мы прошли:',
    progress: 'Как продвигаемся:',
    next: 'Над чем работаем дальше:',
    share: (a, b) => `Фраз с ошибками стало меньше: ${a} % → ${b} % (по записям уроков).`,
    longest: (n, p) => `Самая длинная фраза на уроке — ${n} ${slavic(n, ['слово', 'слова', 'слов'])}${p ? ` (в прошлом месяце — ${p})` : ''}.`,
    improved: (t) => `Меньше ошибок в теме: ${t}.`,
    words: (total, added) => `В личном словаре ${total} ${slavic(total, ['слово', 'слова', 'слов'])}${added ? `, за месяц добавлено ${added}` : ''}.`,
    homework: (n, m) => `Домашние задания сданы вовремя: ${n} из ${m}.`,
    goal: (g) => `«${g}»`,
    onward: 'продолжаем по программе курса.',
    closing: ['Если есть вопросы — пишите, с удовольствием ответим.', 'С уважением, KeeleSepp'],
  },
  et: {
    hello: (p) => (p ? `Tere, ${p}!` : 'Tere!'),
    title: (m, n, until) => `Lühidalt kuu õppimisest: ${m}${until ? ` (kuni ${until})` : ''}${n ? ` — ${n}` : ''}.`,
    lessons: (n) => (n ? `Tunde sel kuul: ${n}.` : 'Sel kuul tunde ei olnud.'),
    covered: 'Mida läbisime:',
    progress: 'Kuidas edeneb:',
    next: 'Millega edasi tegeleme:',
    share: (a, b) => `Vigadega lauseid on vähem: ${a} % → ${b} % (tunnisalvestuste põhjal).`,
    longest: (n, p) => `Pikim lause tunnis — ${n} sõna${p ? ` (eelmisel kuul ${p})` : ''}.`,
    improved: (t) => `Vähem vigu teemas: ${t}.`,
    words: (total, added) => `Isiklikus sõnastikus on ${total} sõna${added ? `, sel kuul lisandus ${added}` : ''}.`,
    homework: (n, m) => `Kodutööd õigel ajal tehtud: ${n}/${m}.`,
    goal: (g) => `„${g}”`,
    onward: 'jätkame kursuse kava järgi.',
    closing: ['Küsimuste korral kirjutage julgelt.', 'Parimate soovidega, KeeleSepp'],
  },
  en: {
    hello: (p) => (p ? `Hello, ${p}!` : 'Hello!'),
    title: (m, n, until) => `A short summary of the month: ${m}${until ? ` (until ${until})` : ''}${n ? ` — ${n}` : ''}.`,
    lessons: (n) => (n ? `Lessons this month: ${n}.` : 'There were no lessons this month.'),
    covered: 'What we covered:',
    progress: 'Progress:',
    next: 'What we will work on next:',
    share: (a, b) => `Fewer sentences with mistakes: ${a}% → ${b}% (from the lesson recordings).`,
    longest: (n, p) => `Longest sentence in a lesson: ${n} words${p ? ` (last month ${p})` : ''}.`,
    improved: (t) => `Fewer mistakes in: ${t}.`,
    words: (total, added) => `The personal word list has ${total} ${total === 1 ? 'word' : 'words'}${added ? `, ${added} added this month` : ''}.`,
    homework: (n, m) => `Homework done on time: ${n} of ${m}.`,
    goal: (g) => `“${g}”`,
    onward: 'we continue with the course plan.',
    closing: ['If you have any questions, just write to us.', 'Best regards, KeeleSepp'],
  },
  uk: {
    hello: (p) => (p ? `Добрий день, ${p}!` : 'Добрий день!'),
    title: (m, n, until) => `Коротко про навчання за місяць: ${m}${until ? ` (до ${until})` : ''}${n ? ` — ${n}` : ''}.`,
    lessons: (n) => (n ? `Уроків за місяць: ${n}.` : 'Цього місяця уроків не було.'),
    covered: 'Що ми пройшли:',
    progress: 'Як просуваємося:',
    next: 'Над чим працюємо далі:',
    share: (a, b) => `Речень із помилками поменшало: ${a} % → ${b} % (за записами уроків).`,
    longest: (n, p) => `Найдовше речення на уроці — ${n} ${slavic(n, ['слово', 'слова', 'слів'])}${p ? ` (минулого місяця — ${p})` : ''}.`,
    improved: (t) => `Менше помилок у темі: ${t}.`,
    words: (total, added) => `В особистому словнику ${total} ${slavic(total, ['слово', 'слова', 'слів'])}${added ? `, за місяць додано ${added}` : ''}.`,
    homework: (n, m) => `Домашні завдання здано вчасно: ${n} з ${m}.`,
    goal: (g) => `«${g}»`,
    onward: 'продовжуємо за програмою курсу.',
    closing: ['Якщо будуть питання — пишіть, охоче відповімо.', 'З повагою, KeeleSepp'],
  },
};
const firstName = (value) => clean(value).split(' ')[0] || '';
const shortDate = (day) => (day ? `${day.slice(8, 10)}.${day.slice(5, 7)}` : '');

// the progress lines the message may carry: improvements and neutral counts only (the admin sees every number in the
// card, also a share that went up)
export function progressLines(facts, language = 'ru') {
  const t = T[language] || T.ru;
  const lines = [];
  if (facts.errorShare && facts.errorShare.prev - facts.errorShare.now >= MIN_SHARE_CHANGE) lines.push(t.share(facts.errorShare.prev, facts.errorShare.now));
  if (facts.longest) lines.push(t.longest(facts.longest.now, facts.longest.prev && facts.longest.prev < facts.longest.now ? facts.longest.prev : 0));
  facts.improved.forEach((x) => lines.push(t.improved(topicLabel(x, language))));
  if (facts.words.total) lines.push(t.words(facts.words.total, facts.words.newInMonth));
  if (facts.homework) lines.push(t.homework(facts.homework.onTime, facts.homework.total));
  return lines;
}

export function parentMessage({ facts, student = {}, language = reportLanguage(student) }) {
  const lang = T[language] ? language : 'ru';
  const t = T[lang];
  const bullets = (items) => items.map((x) => `• ${x}`);
  const next = facts.focus.length ? facts.focus.map((x) => topicLabel(x, lang)) : facts.steps.map((g) => t.goal(g));
  const progress = progressLines(facts, lang);
  const parts = [
    [t.hello(firstName(student.parentName))],
    [t.title(monthLabel(facts.month, lang), clean(student.name), shortDate(facts.until)), t.lessons(facts.lessonsHeld)],
    facts.topics.length ? [t.covered, ...bullets(facts.topics)] : [],
    progress.length ? [t.progress, ...bullets(progress)] : [],
    [t.next, ...(next.length ? bullets(next) : [`• ${t.onward}`])],
    t.closing,
  ];
  return parts.filter((p) => p.length).map((p) => p.join('\n')).join('\n\n');
}

// what the admin sees next to the draft (Estonian): every number, also the ones the message leaves out
export function factsForAdmin(facts) {
  const out = [`Tunde (Toimunud): ${facts.lessonsHeld}`, `Teemasid: ${facts.topics.length}`];
  out.push(facts.checkedNow
    ? `Vigadega lauseid: ${facts.shareNow} % (${facts.checkedNow} kontrollitud lauset)${facts.checkedPrev ? `, eelmisel kuul ${facts.sharePrev} % (${facts.checkedPrev})` : ''}${facts.errorShare ? '' : ` — võrdluseks on vaja mõlemas kuus ≥ ${MIN_CHECKED} lauset`}`
    : 'Vigadega lauseid: analüüsitud salvestusi pole');
  out.push(facts.longest ? `Pikim lause: ${facts.longest.now} sõna${facts.longest.prev ? ` (eelmisel kuul ${facts.longest.prev})` : ''}` : 'Pikim lause: andmed puuduvad');
  out.push(`Sõnu: ${facts.words.total}, sel kuul uusi ${facts.words.newInMonth}`);
  out.push(facts.homework ? `Kodutööd õigel ajal: ${facts.homework.onTime}/${facts.homework.total}` : 'Kodutöid tähtajaga sel kuul pole');
  if (facts.focus.length) out.push(`Vigade teemad: ${facts.focus.map((x) => `${topicLabel(x, 'et')} (${x.count})`).join('; ')}`);
  if (facts.improved.length) out.push(`Paranes: ${facts.improved.map((x) => topicLabel(x, 'et')).join('; ')}`);
  return out;
}
