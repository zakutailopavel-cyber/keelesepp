// „Kellele pakkuda grupitunde” (owner 2026-10-27: „интегрировать базу данных родителей, с кем связаться и предложить
// групповые занятия, чтобы админ видел все имеющиеся данные и мог формировать группы”). Pure: one row per learner —
// current and former student cards and website enquiries — with the age group, subject, level, the parent and the
// contacts, whether there are lessons now, suitable times, the group and the group offer status.
import { eventOccursOn, shiftDate } from '../calendar/calendarView.js';
import { ageOf, audienceOf } from './groupFill.js';

export const INTEREST = { '': 'Pakkumata', offered: 'Pakutud', interested: 'Huvitatud', declined: 'Ei soovi' };
const clean = (value) => String(value ?? '').trim();
const lower = (value) => clean(value).toLocaleLowerCase('et');

const subjectsOf = (student) => {
  const tracks = Array.isArray(student.enrollments) && student.enrollments.length ? student.enrollments : [student];
  return [...new Set(tracks.map((track) => clean(track.subject || student.subject) || 'Eesti keel'))];
};
const levelOf = (student) => clean(student.level || student.enrollments?.[0]?.level).toUpperCase();
const phoneOf = (person) => clean(person.parentPhone || person.phone || person.parentContacts?.[0]?.phone);
const emailOf = (person) => clean(person.parentEmail || person.email || person.parentContacts?.[0]?.email);

// the student's lessons in the next 4 weeks and his last held lesson
function lessonsOf(studentId, events, journal, today) {
  const own = events.filter((event) => !event.isGroup && event.studentId === studentId && event.status !== 'Tühistatud');
  const ahead = Array.from({ length: 28 }, (_, index) => shiftDate(today, index)).some((date) => own.some((event) => eventOccursOn(event, date)));
  const last = journal.filter((lesson) => lesson.studentId === studentId && (!lesson.status || lesson.status === 'Toimunud')).map((lesson) => String(lesson.date || '')).sort().pop() || '';
  return { ahead, last };
}

export function contactRows({ students = [], leads = [], events = [], journal = [], studentTimes = new Map(), groups = [], today, year = Number(String(today).slice(0, 4)) } = {}) {
  const inGroup = new Map(groups.flatMap((group) => (group.students || []).map((id) => [id, group.name])));
  const cards = students.filter((student) => student?.id && !student.convertedToParent).map((student) => {
    const { ahead, last } = lessonsOf(student.id, events, journal, today);
    return {
      id: student.id, kind: 'student', name: clean(student.name) || 'Õpilane', active: student.active !== false,
      age: ageOf(student, year), audience: audienceOf(student, year), subjects: subjectsOf(student), level: levelOf(student),
      parentName: clean(student.parentName), phone: phoneOf(student), email: emailOf(student),
      lessonsAhead: ahead, lastLesson: last, hasTimes: Boolean(studentTimes.get(student.id)?.slots?.length),
      group: inGroup.get(student.id) || clean(student.group), interest: student.groupInterest || { status: '' },
    };
  });
  const enquiries = leads.filter((lead) => lead?.id && !['converted', 'closed'].includes(lead.status)).map((lead) => ({
    id: lead.id, kind: 'lead', name: clean(lead.name) || 'Huviline', active: false,
    age: ageOf(lead, year), audience: audienceOf(lead, year), subjects: [clean(lead.language) || 'Eesti keel'], level: /^[ABC][12]$/i.test(clean(lead.level)) ? clean(lead.level).toUpperCase() : '',
    parentName: clean(lead.parentName), phone: clean(lead.phone), email: clean(lead.email),
    lessonsAhead: false, lastLesson: '', hasTimes: Boolean(lead.slots?.length), group: '', interest: { status: '' }, createdAt: clean(lead.createdAt).slice(0, 10),
  }));
  return [...cards, ...enquiries].sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name, 'et'));
}

// filters: { query, who: 'all' | 'active' | 'former' | 'leads' | 'noLessons', audience, subject, level, interest }
export function filterContacts(rows = [], filters = {}) {
  const query = lower(filters.query);
  return rows.filter((row) => {
    if (filters.who === 'active' && !(row.kind === 'student' && row.active)) return false;
    if (filters.who === 'former' && !(row.kind === 'student' && !row.active)) return false;
    if (filters.who === 'leads' && row.kind !== 'lead') return false;
    if (filters.who === 'noLessons' && (row.kind !== 'student' || row.lessonsAhead || row.group)) return false;
    if (filters.audience && row.audience !== filters.audience && !(filters.audience !== 'adult' && row.audience === 'child')) return false;
    if (filters.subject && !row.subjects.some((subject) => lower(subject) === lower(filters.subject))) return false;
    if (filters.level && row.level !== filters.level) return false;
    if (filters.interest !== undefined && filters.interest !== 'all' && (row.interest?.status || '') !== filters.interest) return false;
    if (query && !lower([row.name, row.parentName, row.phone, row.email].join(' ')).includes(query)) return false;
    return true;
  });
}
