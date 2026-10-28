// „Ilma ajata” (owner 2026-10-27): the active students the planner cannot place — no „Sobivad ajad” of their own and no
// /ajad answer joined to the card — with the parent's contacts, so the school can send them the /ajad link.
import { timesFromLeads, withLeadTimes } from '../calendar/leadTimes.js';

const clean = (value) => String(value ?? '').trim();

export function studentsWithoutTimes({ students = [], own = [], leads = [], lessons = [] } = {}) {
  const active = students.filter((student) => student?.id && student.active !== false && !student.convertedToParent);
  const times = withLeadTimes(new Map(own.map((entry) => [entry.studentId || entry.id, entry])), timesFromLeads(leads, active));
  const lastOf = (id) => lessons.filter((lesson) => lesson.studentId === id && (!lesson.status || lesson.status === 'Toimunud')).map((lesson) => String(lesson.date || '')).sort().pop() || '';
  return active.filter((student) => !times.get(student.id)?.slots?.length).map((student) => ({
    id: student.id, name: clean(student.name) || 'Õpilane', teacher: clean(student.teacher), level: clean(student.level),
    parentName: clean(student.parentName), phone: clean(student.parentPhone || student.phone), email: clean(student.parentEmail || student.email),
    lastLesson: lastOf(student.id),
  })).sort((a, b) => a.teacher.localeCompare(b.teacher, 'et') || a.name.localeCompare(b.name, 'et'));
}

// the text to send (the school sends it itself: phone, WhatsApp, e-mail)
export const ajadMessage = (link) => [
  `Tere! Palun märkige siin, millal teile tund sobib (ka laupäev ja pühapäev; ★ = kõige parem aeg): ${link}`,
  `Здравствуйте! Пожалуйста, отметьте здесь, когда вам удобно заниматься (включая субботу и воскресенье; ★ — самое удобное время): ${link}`,
  'KeeleSepp',
].join('\n\n');

export const contactsText = (rows = []) => rows.map((row) => [row.name, row.parentName ? `vanem ${row.parentName}` : '', row.phone, row.email, row.teacher].filter(Boolean).join(' · ')).join('\n');
