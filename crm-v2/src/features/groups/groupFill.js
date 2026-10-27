// „Täida grupp” (owner 2026-10-26: „заполнение групп”, „организация групп для групповых уроков”, preschool 5–7).
// Pure: which students and website enquiries fit a group — the same subject, the right age group, a near level (not
// for preschool groups) and free at the group's times (their „Sobivad ajad”, else the times of their past lessons).
// Nothing is written here; the admin adds a student with the normal „Halda” action and calls an enquiry himself.
import { dayOfDate, lessonsOn, studentStateAt } from '../calendar/studentTimesModel.js';
import { shiftDate } from '../calendar/calendarView.js';
import { toMinutes } from '../calendar/calendarGrid.js';

export const AUDIENCES = { adult: 'Täiskasvanud', school: 'Kooliõpilased', preschool: 'Eelkooliealised (5–7 a)' };
export const DEFAULT_CAPACITY = { adult: 8, school: 8, preschool: 6 };
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const clean = (value) => String(value ?? '').trim();
const lower = (value) => clean(value).toLocaleLowerCase('et');

export const capacityOf = (group = {}) => Math.max(1, Number(group.capacity) || DEFAULT_CAPACITY[group.audience] || 8);
export const freeSeats = (group = {}) => Math.max(0, capacityOf(group) - (group.students || []).length);

// age in years from the birth year, else from the school class („5. klass” ≈ 11), else from words on the card
export function ageOf(person = {}, year = new Date().getFullYear()) {
  const born = Number(person.birthYear);
  if (born > 1900 && born <= year) return year - born;
  const grade = lower(person.grade);
  const klass = grade.match(/^(\d{1,2})\.?\s*(klass|kl)?\b/);
  if (klass && Number(klass[1]) >= 1 && Number(klass[1]) <= 12) return Number(klass[1]) + 6;
  if (/lasteaed|eelkool|mudil|koolieel|preschool/.test(grade)) return 6;
  if (/täiskasv|adult/.test(grade)) return 18;
  return null;
}

export function audienceOf(person = {}, year) {
  const age = ageOf(person, year);
  if (age !== null) return age < 7 ? 'preschool' : age < 18 ? 'school' : 'adult';
  if (person.adult === true) return 'adult';
  if (person.adult === false) return 'child';
  return '';
}

const subjectsOf = (person = {}) => {
  const list = Array.isArray(person.enrollments) && person.enrollments.length ? person.enrollments.map((item) => item.subject || person.subject) : [person.subject || person.language];
  return list.map((subject) => lower(subject) || 'eesti keel');
};
const levelOf = (person = {}, subject) => {
  const track = (person.enrollments || []).find((item) => lower(item.subject) === subject);
  return clean(track?.level || person.level).toUpperCase();
};

// the first date on or after today with the group lesson's weekday
export function nextDateOf(day, today) {
  for (let step = 0; step < 7; step += 1) {
    const date = shiftDate(today, step);
    if (dayOfDate(date) === day) return date;
  }
  return today;
}

const TIME_SCORE = { best: 3, ok: 2, unknown: 0, partial: -1, none: -3 };
const TIME_TEXT = { best: 'grupi aeg on ★ eelistatud', ok: 'grupi aeg sobib', unknown: 'sobivad ajad teadmata', partial: 'grupi aeg sobib osaliselt', none: 'grupi aeg ei sobi' };

function judge(person, { group, times, events, today, year }) {
  const subject = lower(group.subject) || 'eesti keel';
  if (!subjectsOf(person).includes(subject)) return null;
  const reasons = [];
  let score = 0;
  // age group
  const audience = audienceOf(person, year);
  const age = ageOf(person, year);
  if (group.audience) {
    const childGroup = group.audience !== 'adult';
    if (audience && audience !== 'child' && audience !== group.audience) return null;
    if (audience === 'child' && !childGroup) return null;
    if (age !== null && ((group.ageFrom && age < Number(group.ageFrom)) || (group.ageTo && age > Number(group.ageTo)))) return null;
    if (age !== null) { score += 2; reasons.push(`vanus ~${age}`); } else if (audience) reasons.push(audience === 'child' ? 'laps (vanus teadmata)' : AUDIENCES[audience]);
    else { score -= 1; reasons.push('vanus teadmata'); }
  }
  // level (a preschool group has none)
  if (group.audience !== 'preschool') {
    const want = LEVELS.indexOf(clean(group.level).toUpperCase());
    const have = LEVELS.indexOf(levelOf(person, subject));
    if (want >= 0 && have >= 0) {
      const gap = Math.abs(want - have);
      if (gap >= 2) return null;
      score += gap ? 1 : 3;
      reasons.push(gap ? `tase ${LEVELS[have]} (naabertase)` : `tase ${LEVELS[have]}`);
    } else reasons.push('tase teadmata');
  }
  // the group's weekly times
  const lessons = group.lessons || [];
  let timeState = lessons.length ? 'best' : 'unknown';
  const clashes = [];
  lessons.forEach((lesson) => {
    const date = nextDateOf(lesson.day, today);
    const state = studentStateAt(times, { date, time: lesson.time, duration: lesson.duration });
    if (TIME_SCORE[state] < TIME_SCORE[timeState]) timeState = state;
    if (person.id) {
      const start = toMinutes(lesson.time);
      const end = start + (Number(lesson.duration) || 60);
      lessonsOn(events, date, { studentIds: [person.id] })
        .filter(({ event }) => event.groupId !== group.id)
        .filter(({ event }) => toMinutes(event.time) < end && start < toMinutes(event.time) + (Number(event.duration) || 60))
        .forEach(({ event }) => clashes.push(event.isGroup ? `grupp ${event.studentName || ''}`.trim() : 'oma tund'));
    }
  });
  if (lessons.length) {
    score += TIME_SCORE[timeState];
    reasons.push(times?.learned && timeState !== 'unknown' ? `${TIME_TEXT[timeState]} (varasemate tundide järgi)` : TIME_TEXT[timeState]);
  }
  if (clashes.length) { score -= 4; reasons.push(`kattub: ${[...new Set(clashes)].join(', ')}`); }
  if (clean(person.group)) reasons.push(`juba grupis „${clean(person.group)}”`);
  // „sobib hästi” only when the group's time is known to suit the student
  const timeKnown = !lessons.length || timeState === 'best' || timeState === 'ok';
  const fit = clashes.length || timeState === 'none' ? 'weak' : score >= 5 && timeKnown ? 'good' : score >= 2 ? 'ok' : 'weak';
  return { score, fit, reasons, timeState };
}

/**
 * students: student cards; leads: website enquiries ({ slots, preferred, adult, level, status });
 * studentTimes: Map studentId → { slots, preferred, learned? } (own „Sobivad ajad” or learned); events: calendar events.
 * → { students: [{ id, name, score, fit, reasons }], leads: [...] } — best first
 */
export function groupCandidates({ group, students = [], leads = [], studentTimes = new Map(), events = [], today, year = Number(String(today).slice(0, 4)) }) {
  const members = new Set(group?.students || []);
  const rank = (list) => list.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'et'));
  const studentRows = students
    .filter((student) => student?.id && student.active !== false && !student.convertedToParent && !members.has(student.id))
    .map((student) => {
      const judged = judge(student, { group, times: studentTimes.get(student.id) || null, events, today, year });
      return judged ? { id: student.id, name: clean(student.name) || 'Õpilane', ...judged } : null;
    })
    .filter(Boolean);
  const leadRows = leads
    .filter((lead) => lead?.id && ['new', 'contacted', ''].includes(lead.status || ''))
    .map((lead) => {
      const judged = judge({ ...lead, id: '', language: lead.language || 'Eesti keel', level: /^[ABC][12]$/i.test(clean(lead.level)) ? lead.level : '' }, { group, times: lead.slots?.length ? { slots: lead.slots, preferred: lead.preferred || [] } : null, events, today, year });
      return judged ? { id: lead.id, name: clean(lead.parentName && lead.adult === false ? `${lead.name} (${lead.parentName})` : lead.name) || 'Huviline', contact: clean(lead.phone || lead.email), ...judged } : null;
    })
    .filter(Boolean);
  return { students: rank(studentRows), leads: rank(leadRows) };
}
