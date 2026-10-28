// „Sobivad ajad” sent through the public /ajad link (no login) arrive as website enquiries (websiteLeads, source
// 'availability') and were never joined to the student card: half of the answers were not seen in the calendar, the
// planner or „Täida grupp” (owner 2026-10-27: „почему-то половину ответов не вижу”). Pure: find the card(s) of the
// person who answered and use the answer as the card's times when the card has none of its own, or an older one.
const norm = (value) => String(value || '').toLocaleLowerCase('et').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}@.+]/gu, ' ').replace(/\s+/g, ' ').trim();
const nameKey = (value) => norm(value).split(' ').filter((word) => word.length > 1).sort().join(' ');
const phoneKey = (value) => { const digits = String(value || '').replace(/\D/g, '').replace(/^372/, ''); return digits.length >= 7 ? digits.slice(-8) : ''; };
const time = (value) => (typeof value?.toDate === 'function' ? value.toDate().toISOString() : String(value || ''));

// the cards of the person who sent the answer: by the learner's name first (two children of one parent share the
// parent's e-mail and phone); by e-mail / phone only when that points to one person
export function leadStudentIds(lead = {}, students = []) {
  const live = students.filter((student) => student?.id && student.active !== false && !student.convertedToParent);
  const name = nameKey(lead.name);
  const byName = name ? live.filter((student) => nameKey(student.name) === name) : [];
  if (byName.length) return byName.map((student) => student.id);
  const email = norm(lead.email);
  const phone = phoneKey(lead.phone);
  const byContact = live.filter((student) => (email && [student.email, student.parentEmail, student.contactEmail].map(norm).includes(email))
    || (phone && [student.phone, student.parentPhone].map(phoneKey).includes(phone)));
  const people = new Set(byContact.map((student) => nameKey(student.name)));
  return people.size === 1 ? byContact.map((student) => student.id) : [];
}

// → Map studentId → { studentId, slots, preferred, changedAt, fromLead: true, leadId } (the newest answer per card)
export function timesFromLeads(leads = [], students = []) {
  const out = new Map();
  leads.filter((lead) => lead?.source === 'availability' && lead.slots?.length && lead.status !== 'closed')
    .sort((a, b) => time(a.createdAt).localeCompare(time(b.createdAt)))
    .forEach((lead) => leadStudentIds(lead, students).forEach((studentId) => out.set(studentId, {
      studentId, slots: [...lead.slots], preferred: (lead.preferred || []).filter((slot) => lead.slots.includes(slot)),
      changedAt: time(lead.createdAt), changedByRole: 'learner-link', fromLead: true, leadId: lead.id,
    })));
  return out;
}

// the card's own times unless the /ajad answer is newer (or the card has none)
export function withLeadTimes(own = new Map(), fromLeads = new Map()) {
  const out = new Map(own);
  fromLeads.forEach((value, studentId) => {
    const current = out.get(studentId);
    if (!current?.slots?.length || String(value.changedAt) > String(current.changedAt || time(current.updatedAt))) out.set(studentId, value);
  });
  return out;
}
