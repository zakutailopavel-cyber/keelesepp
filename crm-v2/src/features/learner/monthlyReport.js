// „Kuu aruanne vanemale” (owner 2026-10-23: the admin sends it after checking — never automatic): the month in plain
// lines for the family, Estonian then Russian. Built from the lesson journal, studentWords (wordGrowth), the month's
// lesson steps (monthSteps) and homework; the admin reads and edits it before it goes to the student's conversation.
import { CLOSED_HOMEWORK } from '../homework/homeworkStatus.js';
import { wordGrowth } from '../vocabulary/wordGrowth.js';
import { monthSteps } from './monthSteps.js';

const DAY = 86400000;
const time = (value) => (typeof value?.toMillis === 'function' ? value.toMillis() : Date.parse(value || '') || 0);
const MONTHS_ET = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
const MONTHS_RU = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

export function monthlyReport({ student = {}, lessons = [], words = [], assignments = [], homework = [], now = Date.now() } = {}) {
  const from = now - 30 * DAY;
  const date = new Date(now);
  const inMonth = (value) => time(value) >= from && time(value) <= now;
  const journal = lessons.filter((lesson) => inMonth(lesson.date) && lesson.status !== 'Planeeritud');
  const held = journal.filter((lesson) => !lesson.status || lesson.status === 'Toimunud').length;
  const missed = journal.filter((lesson) => String(lesson.status || '').startsWith('Puudus')).length;
  const growth = wordGrowth(words, now);
  const learnedNow = words.filter((word) => (word.box || 0) >= 3 && inMonth(word.reviewedAt) && !String(word.translation || '').startsWith('Sinu lause:')).length;
  const month = monthSteps(assignments, { now });
  const toWork = month.steps.filter((step) => step.state === 'review' || step.state === 'practise').slice(0, 2).map((step) => step.goal);
  const given = homework.filter((item) => inMonth(item.createdAt || item.date));
  const doneHomework = given.filter((item) => item.status === 'Tehtud').length;
  const openHomework = given.filter((item) => !CLOSED_HOMEWORK.includes(item.status)).length;
  const name = student.name || '';
  const et = [
    `Kuu kokkuvõte · ${MONTHS_ET[date.getMonth()]} ${date.getFullYear()}${name ? ` · ${name}` : ''}`,
    `Tunde: ${held}${missed ? ` (puudumisi ${missed})` : ''}.`,
    `Sõnad: ${learnedNow} selgeks õpitud sel kuul, kokku ${growth.learned}; uusi sõnu ${growth.newThisMonth}.`,
    month.total ? `Tundide sammud: ${month.mastered}/${month.total} selge.` : '',
    given.length ? `Kodutööd: ${doneHomework}/${given.length} tehtud${openHomework ? `, ${openHomework} pooleli` : ''}.` : '',
    toWork.length ? `Järgmisel kuul harjutame: ${toWork.join('; ')}.` : 'Järgmisel kuul jätkame uute teemadega.',
  ].filter(Boolean);
  const ru = [
    `Итоги месяца · ${MONTHS_RU[date.getMonth()]} ${date.getFullYear()}${name ? ` · ${name}` : ''}`,
    `Уроков: ${held}${missed ? ` (пропусков ${missed})` : ''}.`,
    `Слова: в этом месяце выучено ${learnedNow}, всего ${growth.learned}; новых слов ${growth.newThisMonth}.`,
    month.total ? `Шаги уроков: усвоено ${month.mastered} из ${month.total}.` : '',
    given.length ? `Домашние задания: выполнено ${doneHomework} из ${given.length}${openHomework ? `, ${openHomework} в процессе` : ''}.` : '',
    toWork.length ? `В следующем месяце работаем над: ${toWork.join('; ')}.` : 'В следующем месяце продолжаем новые темы.',
  ].filter(Boolean);
  return [...et, '', ...ru].join('\n');
}
