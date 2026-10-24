// „Teated” (owner 2026-10-24): labels, the admin form, text with links and the answers export.
// The audience is matched on the server (functions/announcements-core.js); `cardMatches` below only counts the
// cards for the administrator's form and must follow the same rule (subject + level on one active enrollment).
import { cellsOf, summaryOf } from '../availability-poll/pollModel.js';

export const AUDIENCE_LABELS = { students: 'Õpilased', parents: 'Lapsevanemad', both: 'Õpilased ja lapsevanemad' };
export const TYPE_LABELS = { read: 'Loetud („Sain aru”)', question: 'Küsimus', availability: 'Sobivad ajad' };
export const MODE_LABELS = { text: 'Vaba tekst', single: 'Üks valik', multiple: 'Mitu valikut' };
export const STATUS_LABELS = { draft: 'Mustand', published: 'Avaldatud', archived: 'Arhiveeritud' };
export const STATUS_TONES = { draft: 'neutral', published: 'success', archived: 'neutral' };
const DAY_NAMES = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' };

const STAFF = ['admin', 'teacher', 'finance'];
// a student or parent account (not staff): only they are stopped by an announcement
export const isLearnerAccount = (roles = []) => roles.some((role) => role === 'student' || role === 'parent') && !roles.some((role) => STAFF.includes(role));

const clean = (value) => String(value ?? '').trim();
const lower = (value) => clean(value).toLocaleLowerCase('et');

export function emptyForm(today) {
  return {
    title: '', body: '', audience: 'both', subjects: [], levels: [], studentIds: [],
    activeFrom: today, activeTo: '', responseType: 'read',
    question: { mode: 'single', options: ['', ''], allowOther: false }, allowChange: false,
  };
}

export function formOf(item) {
  return {
    title: item.title, body: item.body, audience: item.audience, subjects: [...item.subjects], levels: [...item.levels],
    studentIds: [...item.studentIds], activeFrom: item.activeFrom, activeTo: item.activeTo, responseType: item.responseType,
    question: item.responseType === 'question' ? { ...item.question, options: item.question.options.length ? [...item.question.options] : ['', ''] } : { mode: 'single', options: ['', ''], allowOther: false },
    allowChange: item.allowChange,
  };
}

// what is missing before saving (an empty object = ready)
export function formErrors(form) {
  const errors = {};
  if (!clean(form.title)) errors.title = 'Pealkiri on puudu.';
  if (!clean(form.body)) errors.body = 'Tekst on puudu.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.activeFrom)) errors.activeFrom = 'Alguskuupäev on puudu.';
  if (form.activeTo && form.activeTo < form.activeFrom) errors.activeTo = 'Lõpp ei saa olla enne algust.';
  if (form.responseType === 'question' && form.question.mode !== 'text') {
    const options = form.question.options.map(clean).filter(Boolean);
    if (options.length < 2) errors.options = 'Lisa vähemalt kaks vastusevarianti.';
    else if (new Set(options).size !== options.length) errors.options = 'Vastusevariandid korduvad.';
  }
  return errors;
}

export function cardMatches(form, student = {}) {
  if (student.active === false || student.convertedToParent) return false;
  if (form.studentIds.length && !form.studentIds.includes(student.id)) return false;
  if (!form.subjects.length && !form.levels.length) return true;
  const subjects = form.subjects.map(lower);
  const levels = form.levels.map(lower);
  const enrollments = Array.isArray(student.enrollments) && student.enrollments.length ? student.enrollments : [{ subject: student.subject || 'Eesti keel', level: student.level, targetLevel: student.targetLevel }];
  return enrollments.filter((item) => item.active !== false).some((item) => (
    (!subjects.length || subjects.includes(lower(item.subject || student.subject || 'Eesti keel')))
    && (!levels.length || levels.includes(lower(item.level || student.level)) || levels.includes(lower(item.targetLevel)))
  ));
}

export function subjectsAndLevels(students = []) {
  const subjects = new Set();
  const levels = new Set();
  students.forEach((student) => {
    const enrollments = Array.isArray(student.enrollments) && student.enrollments.length ? student.enrollments : [student];
    enrollments.forEach((item) => {
      if (clean(item.subject || student.subject)) subjects.add(clean(item.subject || student.subject));
      if (clean(item.level || student.level)) levels.add(clean(item.level || student.level));
    });
  });
  const sort = (values) => [...values].sort((a, b) => a.localeCompare(b, 'et', { numeric: true }));
  return { subjects: sort(subjects), levels: sort(levels) };
}

// plain text → lines of { text | link } parts; only http(s) links become links (no HTML from the administrator)
const LINK = /(https?:\/\/[^\s<>"]+[^\s<>".,;:!?)\]])/g;
export function textLines(body = '') {
  return String(body).split(/\r?\n/).map((line) => line.split(LINK).filter((part) => part !== '').map((part) => (/^https?:\/\//.test(part) ? { link: part } : { text: part })));
}

export function availabilityText(slots = [], preferred = []) {
  return summaryOf(cellsOf(slots, preferred)).map((row) => `${DAY_NAMES[row.day]} ${row.ranges.join(', ')}${row.best.length ? ` (★ ${row.best.join(', ')})` : ''}`).join('; ');
}

export function answerText(type, row) {
  if (!row?.answered && !row?.answeredAt) return '';
  if (type === 'read') return 'Loetud';
  if (type === 'availability') return availabilityText(row.slots, row.preferred);
  const answer = row.answer || {};
  return [answer.text, ...(answer.choices || []), answer.other ? `Muu: ${answer.other}` : ''].filter(Boolean).join('; ');
}

export const localToday = (date = new Date()) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
export const when = (value) => (value ? new Date(value).toLocaleString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');
export const day = (value) => (value ? value.split('-').reverse().join('.') : '');

// Excel in Estonia opens „;” separated UTF-8 with a BOM
export function reportCsv(announcement, rows = []) {
  const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const header = ['Õpilane / laps', 'Kes vastab', 'Roll', 'Olek', 'Vastatud', 'Vastaja', 'Vastus'];
  const lines = rows.map((row) => [
    row.studentName, (row.names || []).join(', '), row.kind === 'parent' ? 'Lapsevanem' : 'Õpilane',
    row.answered ? 'Vastatud' : 'Ootab', when(row.updatedAt || row.answeredAt), row.answeredByName, answerText(announcement.responseType, row),
  ].map(cell).join(';'));
  return `\uFEFF${[header.map(cell).join(';'), ...lines].join('\r\n')}`;
}
