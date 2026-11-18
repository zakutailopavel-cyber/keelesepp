// „Õppesuunad: individuaalne / grupp” (team 2026-11-18, #student_card): a study direction of a card has a format. One
// learner may take Eesti keel individually AND in a group, each with its own price and its own lesson package.
// ARCHITECTURE.md „Direction format (2026-11-18)” is the contract. The server keeps the same rules in functions/direction-format-core.js
// (functions/direction-format-core.test.js imports this file and compares the shared functions).
//
// Data:
// - students/{id}.enrollments[i].format: 'group' (absent = 'individual'), optional groupId (the calendar group)
// - studentRevenuePlans/{id}.groupPrices: { "<subject>": { lessonPriceCents, lessonMinutes } } — the group price of a
//   subject; subjectPrices / the card's price stay the individual price (and the fallback)
// - a package invoice / its package: format: 'group' / tokenFormat: 'group' (absent = individual or a legacy package)
// - a lesson is a group lesson when it carries groupId (groups.setAttendance writes it)

const clean = (value) => String(value ?? '').trim();
const low = (value) => clean(value).replace(/\s+/g, ' ').toLocaleLowerCase('et');

export const DIRECTION_FORMATS = [
  { value: 'individual', label: 'Individuaalne', short: 'individuaalne' },
  { value: 'group', label: 'Grupp', short: 'grupp' },
];

export const formatOf = (value) => (value === 'group' ? 'group' : 'individual');
export const formatLabel = (value) => (formatOf(value) === 'group' ? 'Grupp' : 'Individuaalne');
// „Eesti keel · grupp” on invoice lines, package lines and balances; the individual (and every legacy) line keeps the
// plain subject, so nothing that was printed before changes
export const formatSuffix = (value) => (formatOf(value) === 'group' ? ' · grupp' : '');
export const subjectFormatLabel = (subject, value) => `${clean(subject)}${formatSuffix(value)}`;

// a lesson / calendar event of a calendar group is a group lesson; everything else is individual
export const lessonFormat = (item = {}) => (clean(item.groupId) || item.isGroup === true ? 'group' : 'individual');

// the group price of a subject: its key as written, else ignoring case; null when none (a price of 0 is none)
export function groupPriceOf(plan, subject) {
  const prices = plan && plan.groupPrices && typeof plan.groupPrices === 'object' ? plan.groupPrices : {};
  const key = Object.prototype.hasOwnProperty.call(prices, subject) ? subject : Object.keys(prices).find((name) => low(name) === low(subject));
  const entry = key === undefined ? null : prices[key];
  const cents = Math.round(Number(entry?.lessonPriceCents) || 0);
  return cents > 0 ? { lessonPriceCents: cents, lessonMinutes: Number(entry.lessonMinutes) || 60 } : null;
}

// The price a lesson of this subject and format is billed at. `individual` is the plan the old code used for the subject
// (subjectPrices / the card's price, as each caller already resolves it). A group lesson takes the subject's group
// price; without one it falls back to the individual price and says so (fallback: true → a warning for the admin).
export function planForFormat(individual = {}, plan = {}, subject = '', format = 'individual') {
  if (formatOf(format) !== 'group') return { plan: individual, fallback: false };
  const own = groupPriceOf(plan, subject);
  if (!own) return { plan: individual, fallback: true };
  return { plan: { ...individual, lessonPriceCents: own.lessonPriceCents, lessonMinutes: own.lessonMinutes }, fallback: false };
}

// the tracks of a card as stored (a card without enrollments is one track of its own fields)
const tracksOf = (student = {}) => (Array.isArray(student.enrollments) && student.enrollments.length ? student.enrollments : [student]).filter(Boolean);
const trackSubject = (track, student) => clean(track.subject || student.subject) || 'Eesti keel';
const isOpen = (track = {}) => track.active !== false && track.status !== 'ended';

// the calendar groups this card is a member of, for one subject ('' = any)
export function memberGroups(student = {}, groups = [], subject = '') {
  return (groups || []).filter((group) => group && group.active !== false && Array.isArray(group.students) && group.students.includes(student.id)
    && (!subject || low(group.subject || 'Eesti keel') === low(subject)));
}

// The format of one track. Stored → as stored. Not stored: 'individual' (every existing enrollment reads so), unless the
// card is a member of a calendar group of that subject and has no other track of that subject — then it is clearly a
// group already: shown as „Grupp” with inferred: true (nothing is written; the admin confirms it by saving).
export function trackFormat(track = {}, { student = {}, groups = [] } = {}) {
  if (track.format === 'group' || track.format === 'individual') return { format: track.format, inferred: false, groupId: clean(track.groupId) };
  const subject = trackSubject(track, student);
  const twins = tracksOf(student).filter((item) => low(trackSubject(item, student)) === low(subject)).length > 1;
  const member = twins ? [] : memberGroups(student, groups, subject);
  if (member.length) return { format: 'group', inferred: true, groupId: member[0].id };
  return { format: 'individual', inferred: false, groupId: '' };
}

// subjects whose lessons are split by format on invoices and balances: a stored group track (open) or a stored group
// price. Inferred groups do NOT split: a card nobody touched bills exactly as before.
export function groupSubjects(student = {}, plan = null) {
  const fromTracks = tracksOf(student).filter((track) => isOpen(track) && track.format === 'group').map((track) => trackSubject(track, student));
  const fromPrices = Object.keys(plan?.groupPrices || {});
  const out = [];
  [...fromTracks, ...fromPrices].forEach((subject) => { if (!out.some((item) => low(item) === low(subject))) out.push(subject); });
  return out;
}
export const splitsFormat = (student, plan, subject) => groupSubjects(student, plan).some((item) => low(item) === low(subject));

// the formats a subject of the card can be invoiced / packaged in: always individual; group when it splits
export const formatsFor = (student, plan, subject) => (splitsFormat(student, plan, subject) ? ['individual', 'group'] : ['individual']);

// Backward compatibility report (no writes): the tracks without a stored format that read as „Grupp” because the card
// is a member of a calendar group of that subject. functions/tools/direction-format-report.js runs the same rule
// read-only over all cards.
export function legacyGroupCandidates(students = [], groups = []) {
  return (students || []).flatMap((student) => tracksOf(student)
    .filter((track) => isOpen(track) && !track.format)
    .map((track) => ({ track, read: trackFormat(track, { student, groups }) }))
    .filter(({ read }) => read.inferred)
    .map(({ track, read }) => ({ studentId: student.id, name: clean(student.name), subject: trackSubject(track, student), groupId: read.groupId })));
}
