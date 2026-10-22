// „Õpilase pilt” (owner 2026-10-23: „то, что выведет платформу на новый уровень”): before a lesson the teacher sees in
// one place what the student has done since the last lesson, which words he is forgetting, where his worksheets went
// wrong and what is still open — so the lesson starts from the student, not from the plan. Built only from data the
// CRM already has (studentWords, worksheetAssignments, homework, the lesson journal); nothing is written here.
// The first part of the learner profile: words first, then rules and errors.

import { CLOSED_HOMEWORK } from '../homework/homeworkStatus.js';

const DAY = 86400000;
export const LEARNED_BOX = 3;
export const RECENT_DAYS = 14;

const time = (value) => {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

// „täna”, „eile”, „3 päeva tagasi”, „2 nädalat tagasi”
export function agoLabel(at, now = Date.now()) {
  if (!at) return '';
  const days = Math.floor((startOfDay(now) - startOfDay(at)) / DAY);
  if (days <= 0) return 'täna';
  if (days === 1) return 'eile';
  if (days < 14) return `${days} päeva tagasi`;
  if (days < 60) return `${Math.floor(days / 7)} nädalat tagasi`;
  return `${Math.floor(days / 30)} kuud tagasi`;
}
function startOfDay(ms) {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

// a word the student was asked again and did not know: back in box 0 after at least one review
export const isForgotten = (word) => (word?.box || 0) === 0 && (word?.reviews || 0) > 0;
const isDue = (word, now) => !word?.dueAt || time(word.dueAt) <= now;

// the student's own work: the newest moment he practised words, filled in a sheet or finished homework
function activities({ words, assignments, homework }) {
  const list = [];
  words.forEach((word) => { const at = time(word.reviewedAt); if (at) list.push({ at, kind: 'words' }); });
  assignments.forEach((item) => {
    const at = time(item.completedAt) || (item.status === 'in_progress' ? time(item.updatedAt) : 0);
    if (at) list.push({ at, kind: 'sheet' });
  });
  homework.forEach((item) => { const at = item.status === 'Tehtud' ? time(item.submittedAt || item.updatedAt) : 0; if (at) list.push({ at, kind: 'homework' }); });
  return list.sort((a, b) => b.at - a.at);
}
const KIND_LABEL = { words: 'sõnu', sheet: 'töölehte', homework: 'kodutööd' };

// the auto-check's errors of the newest submitted sheets, in the teacher's words
function sheetErrors(assignments, now, describe) {
  return assignments
    .filter((item) => item.status === 'done' && now - time(item.completedAt) <= RECENT_DAYS * DAY)
    .sort((a, b) => time(b.completedAt) - time(a.completedAt))
    .slice(0, 5)
    .map((item) => {
      const score = item.score && Number(item.score.total) ? Math.round((Number(item.score.correct) / Number(item.score.total)) * 100) : null;
      const errors = (item.errorLog || []).length;
      let details = [];
      try { details = describe ? describe(item.worksheetDoc, item.errorLog || []).slice(0, 3).map((line) => clean(line?.text ?? line)).filter(Boolean) : []; } catch { details = []; }
      return { id: item.id, title: clean(item.title) || 'Tööleht', at: time(item.completedAt), score, errors, details };
    });
}

/**
 * words: studentWords; assignments: worksheetAssignments (normalized); homework: homework records; lessons: the journal
 * (normalizeLesson: date, topic, status); describe(worksheetDoc, errorLog) → readable error lines (engine/errorText.js).
 */
export function learnerSnapshot({ words = [], assignments = [], homework = [], lessons = [], now = Date.now(), describe = null } = {}) {
  const done = activities({ words, assignments, homework });
  const last = done[0] || null;
  const week = done.filter((item) => now - item.at <= 7 * DAY);
  const practisedWords = new Set(words.filter((word) => now - time(word.reviewedAt) <= 7 * DAY).map((word) => word.id)).size;

  const forgotten = words.filter(isForgotten).sort((a, b) => time(b.reviewedAt) - time(a.reviewedAt));
  const learned = words.filter((word) => (word.box || 0) >= LEARNED_BOX).length;
  const due = words.filter((word) => isDue(word, now)).length;
  const neverPractised = words.filter((word) => !(word.reviews > 0)).length;

  const open = homework.filter((item) => !CLOSED_HOMEWORK.includes(item.status));
  const overdue = open.filter((item) => item.due && time(item.due) && time(item.due) + DAY <= now);
  const openSheets = assignments.filter((item) => item.status !== 'done' && item.source !== 'self_study');

  const held = lessons.filter((lesson) => !lesson.status || lesson.status === 'Toimunud')
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const lastLesson = held[0] ? { date: held[0].date || '', topic: clean(held[0].topic || held[0].title), notes: clean(held[0].notes).slice(0, 240) } : null;

  const sheets = sheetErrors(assignments, now, describe);
  const signals = [];
  if (!last || now - last.at > 7 * DAY) signals.push({ tone: 'warning', text: last ? `Pole iseseisvalt õppinud ${agoLabel(last.at, now)}.` : 'Pole veel iseseisvalt õppinud.' });
  if (forgotten.length) signals.push({ tone: 'warning', text: `${forgotten.length} sõna ununeb — alusta tundi nende kordamisega.` });
  if (overdue.length) signals.push({ tone: 'warning', text: `${overdue.length} kodutööd on tähtajast üle.` });
  const weak = sheets.filter((sheet) => sheet.score !== null && sheet.score < 70);
  if (weak.length) signals.push({ tone: 'warning', text: `Tööleht „${weak[0].title}”: ${weak[0].score}% — vaata vead üle.` });
  if (!signals.length && last) signals.push({ tone: 'success', text: 'Õpib järjepidevalt — võib minna uue teemaga edasi.' });

  return {
    lastActivity: last ? { at: last.at, label: agoLabel(last.at, now), kind: KIND_LABEL[last.kind] } : null,
    week: { total: week.length, words: practisedWords, sheets: week.filter((item) => item.kind === 'sheet').length, homework: week.filter((item) => item.kind === 'homework').length },
    words: { total: words.length, learned, due, neverPractised, forgotten: forgotten.slice(0, 12).map((word) => ({ id: word.id, word: clean(word.word), translation: clean(word.translation) })) },
    sheets,
    homework: { open: open.length, overdue: overdue.map((item) => ({ id: item.id, task: clean(item.task || item.title) || 'Kodutöö', due: item.due || '' })).slice(0, 5) },
    openSheets: openSheets.length,
    lastLesson,
    signals,
  };
}

// the text of a review page for the lesson board: the forgotten words, one per line
export function reviewPageText(snapshot) {
  const lines = (snapshot?.words?.forgotten || []).map((item) => (item.translation ? `${item.word} — ${item.translation}` : item.word));
  return lines.length ? ['Kordame:', ...lines].join('\n') : '';
}
