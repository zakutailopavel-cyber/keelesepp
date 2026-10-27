// „Mis grupil puudub” (owner 2026-10-27: „админ открывает группу и видит, кого я добавил и чего не хватает”). Pure.
import { ageOf, capacityOf } from './groupFill.js';
import { INTEREST } from './groupContacts.js';

// → [{ key, ok, text }] — the open points first
export function groupGaps(group = {}, members = [], { studentTimes = new Map(), year = new Date().getFullYear() } = {}) {
  const capacity = capacityOf(group);
  const former = members.filter((student) => student.active === false);
  const outside = members.filter((student) => { const age = ageOf(student, year); return age !== null && ((group.ageFrom && age < Number(group.ageFrom)) || (group.ageTo && age > Number(group.ageTo))); });
  const noTimes = members.filter((student) => !studentTimes.get(student.id)?.slots?.length);
  const noContact = members.filter((student) => !(student.parentPhone || student.phone || student.parentEmail || student.email));
  const interested = members.filter((student) => student.groupInterest?.status === 'interested').length;
  const list = [
    { key: 'teacher', ok: Boolean(group.teacherUid || group.teacher), text: group.teacherUid || group.teacher ? `Õpetaja: ${group.teacher}` : 'Õpetaja puudub' },
    { key: 'times', ok: (group.lessons || []).length > 0, text: (group.lessons || []).length ? `${group.lessons.length} tunniaega nädalas` : 'Tunniajad puuduvad — lisa aeg' },
    { key: 'seats', ok: members.length > 0 && members.length <= capacity, text: members.length > capacity ? `Liiga palju õpilasi: ${members.length}/${capacity} kohta` : `${members.length}/${capacity} kohta` },
    { key: 'agreed', ok: members.length > 0 && interested === members.length, text: `Nõus (huvitatud): ${interested}/${members.length}` },
    { key: 'former', ok: !former.length, text: former.length ? `${former.length} endist õpilast (arhiivis) — taasta, kui nad tulevad` : 'Kõik õpilased aktiivsed' },
    { key: 'ages', ok: !outside.length, text: outside.length ? `${outside.length} väljaspool vanust ${group.ageFrom || '…'}–${group.ageTo || '…'}: ${outside.map((s) => s.name).join(', ')}` : 'Vanused sobivad' },
    { key: 'studentTimes', ok: !noTimes.length, text: noTimes.length ? `${noTimes.length} õpilase sobivad ajad teadmata` : 'Kõigi sobivad ajad teada' },
    { key: 'contacts', ok: !noContact.length, text: noContact.length ? `${noContact.length} õpilasel puuduvad kontaktid: ${noContact.map((s) => s.name).join(', ')}` : 'Kõigil on kontakt' },
  ];
  return [...list.filter((item) => !item.ok), ...list.filter((item) => item.ok)];
}

export const interestLabel = (student) => INTEREST[student?.groupInterest?.status || ''] || INTEREST[''];
