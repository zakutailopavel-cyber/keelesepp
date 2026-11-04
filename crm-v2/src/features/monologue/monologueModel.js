// „Kuu monoloog” (owner 2026-11-04): once a month the student speaks for two minutes on the same fixed prompt of their
// level, so that recordings of different months can be compared. Pure helpers; the data lives in `studentMonologues`
// (one document per student card and month, id `{studentId}_{YYYY-MM}`, see services/firebase/studentMonologues.js).
import { tracksOf } from '../students/subjects.js';

export const MONOLOGUE_SECONDS = 120;
export const NOTE_MAX = 500;

// Fixed prompts. Never change the text of an existing id: the months are compared because the prompt stays the same.
// A new wording gets a new id.
export const MONOLOGUE_PROMPTS = Object.freeze({
  'et-self-v1': {
    id: 'et-self-v1',
    title: 'Räägi endast, oma päevast ja plaanidest',
    ru: 'Расскажи о себе, своём дне и планах',
    hints: ['Kes sa oled ja kus sa elad?', 'Milline on sinu tavaline päev?', 'Mida sa plaanid järgmisel kuul või aastal teha?'],
  },
  'et-argument-v1': {
    id: 'et-argument-v1',
    title: 'Kas inimesed peaksid töötama või õppima rohkem kodus? Põhjenda oma arvamust.',
    ru: 'Должны ли люди больше работать или учиться из дома? Обоснуй своё мнение.',
    hints: ['Ütle oma seisukoht.', 'Too kaks põhjust ja näide oma elust.', 'Mida arvavad need, kes on teisel arvamusel?', 'Tee kokkuvõte.'],
  },
});

// which prompt a level gets; A1 and pre-school do not record a monologue yet
const PROMPT_OF_LEVEL = { A2: 'et-self-v1', B1: 'et-self-v1', B2: 'et-argument-v1', C1: 'et-argument-v1' };
export const MONOLOGUE_LEVELS = Object.keys(PROMPT_OF_LEVEL);

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

// the Estonian track's level of a card ('' when the card has no Estonian track at A2–C1)
export function monologueLevel(student) {
  if (!student) return '';
  const track = tracksOf(student).find((item) => item.subject === 'Eesti keel' && PROMPT_OF_LEVEL[clean(item.level).toUpperCase()]);
  return track ? clean(track.level).toUpperCase() : '';
}

export const promptForLevel = (level) => MONOLOGUE_PROMPTS[PROMPT_OF_LEVEL[clean(level).toUpperCase()]] || null;
export const promptById = (id) => MONOLOGUE_PROMPTS[id] || null;

const pad = (n) => String(n).padStart(2, '0');
// the local month of a date, 'YYYY-MM'
export const monthOf = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
export const isMonth = (value) => /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ''));
export const monologueId = (studentId, month) => `${studentId}_${month}`;

// „november 2026”
export function monthLabel(month) {
  if (!isMonth(month)) return String(month || '');
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 15).toLocaleDateString('et-EE', { month: 'long', year: 'numeric' });
}

// the last day of a month, 'YYYY-MM-DD' (the task's deadline)
export function monthEnd(month) {
  const [y, m] = month.split('-').map(Number);
  return `${month}-${pad(new Date(y, m, 0).getDate())}`;
}

// Storage: under the student's homework prefix, one file per month (re-recording overwrites it)
export const audioExtension = (type) => (/mp4|aac|m4a/.test(type) ? 'm4a' : /ogg/.test(type) ? 'ogg' : 'webm');
export const monologueAudioPath = (studentId, month, type) => `homework/${studentId}/monologues/${month}.${audioExtension(type)}`;

export const cleanNote = (text) => String(text ?? '').replace(/\r\n?/g, '\n').trim().slice(0, NOTE_MAX);

// The record the student writes. `seconds` is clamped to what the rules accept (1–130).
export function monologueRecord({ student, uid, month, level, audioPath, contentType, seconds, now = new Date().toISOString() }) {
  const prompt = promptForLevel(level);
  return {
    studentId: student.id,
    studentUid: uid,
    month,
    promptId: prompt?.id || '',
    level,
    audioPath,
    contentType: String(contentType || 'audio/webm').split(';')[0],
    seconds: Math.max(1, Math.min(MONOLOGUE_SECONDS + 10, Math.round(Number(seconds) || 1))),
    createdAt: now,
    updatedAt: now,
  };
}

// The learner's task of this month in „Ülesanded” (homework/taskList.js shape), or null when there is none:
// a card without an Estonian A2–C1 track has no monologue. Done when this month's recording exists.
export function monologueTask({ student, monologues = [], today = new Date() } = {}) {
  const level = monologueLevel(student);
  if (!level) return null;
  const month = monthOf(today);
  const done = monologues.find((item) => item.studentId === student.id && item.month === month) || null;
  const prompt = promptForLevel(level);
  return {
    studentId: student.id,
    studentName: student.name || '',
    subject: 'Eesti keel',
    feedback: '',
    grade: '',
    reviewedAt: '',
    key: `monologue-${student.id}-${month}`,
    kind: 'monologue',
    state: done ? 'waiting' : 'todo',
    title: `Kuu monoloog · ${monthLabel(month)}`,
    teacherText: '',
    note: '',
    phase: '',
    goal: done ? '' : `Räägi 2 minutit: „${prompt.title}”`,
    minutes: done ? 0 : 5,
    due: done ? '' : monthEnd(month),
    started: false,
    percentage: null,
    doneAt: done ? done.updatedAt || done.createdAt || '' : '',
    assignedAt: `${month}-01`,
    lessonId: '',
    monologue: done,
    month,
    level,
  };
}

// words of a transcript text (when the transcriber has written one), counted like a reader would
export const countWords = (text) => (clean(text).match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) || []).length;

// duration, words and words per minute of one recording; words only when a transcript exists
export function monologueStats(item = {}) {
  const seconds = Number(item.seconds) || 0;
  const words = Number.isFinite(item.wordCount) ? item.wordCount : item.transcriptText ? countWords(item.transcriptText) : null;
  const wpm = Number.isFinite(item.wpm) ? item.wpm : words != null && seconds >= 10 ? Math.round((words / seconds) * 60) : null;
  return { seconds, words, wpm };
}

// the transcriber's error check of this take only (a re-record makes the old one stale): the top topics, short
// („Падеж после глагола и места: kuhu? …” → „Падеж после глагола и места”), for the teacher's line
export function analysisFor(item = {}, analyses = {}) {
  const a = analyses[item.id];
  if (!a || !a.take || a.take !== (item.updatedAt || item.createdAt)) return null;
  const topics = (a.focus || []).slice(0, 3).map((t) => ({ label: String(t.topic).split(':')[0].trim(), count: t.count }));
  return { checked: a.checked, errors: a.errors || [], topics };
}

// newest month first
export const sortMonologues = (items = []) => [...items].sort((a, b) => String(b.month).localeCompare(String(a.month)));

// „Võrdle”: the two months shown side by side by default — the newest and the oldest (the clearest change)
export function defaultPair(items = []) {
  const sorted = sortMonologues(items);
  if (sorted.length < 2) return [];
  return [sorted[sorted.length - 1].id, sorted[0].id];
}
