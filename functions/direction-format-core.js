'use strict';

// „Õppesuunad: individuaalne / grupp” (team 2026-11-18): a study direction has a format, and price and lesson package
// follow the lesson's format. The browser copy is crm-v2/src/features/students/directionFormat.js; the shared functions
// are compared on the same cases in direction-format-core.test.js. Contract: ARCHITECTURE.md „Direction format”.
//
// - a lesson with groupId (a calendar group's attendance record) is a group lesson, every other lesson individual
// - price: studentRevenuePlans.groupPrices[subject] for a group lesson; without it the individual price (fallback)
// - packages: tokenFormat 'group' pays only group lessons of its subject; every other package (incl. all legacy ones)
//   is individual. A card without any group package takes credits exactly as before.

const { packageTiersForLesson, packageSubjectKey } = require('./lesson-tokens-core');

const clean = (value) => String(value ?? '').trim();
const low = (value) => clean(value).replace(/\s+/g, ' ').toLocaleLowerCase('et');

const formatOf = (value) => (value === 'group' ? 'group' : 'individual');
const formatSuffix = (value) => (formatOf(value) === 'group' ? ' · grupp' : '');
const subjectFormatLabel = (subject, value) => `${clean(subject)}${formatSuffix(value)}`;
const lessonFormat = (item = {}) => (clean(item.groupId) || item.isGroup === true ? 'group' : 'individual');

function groupPriceOf(plan, subject) {
  const prices = plan && plan.groupPrices && typeof plan.groupPrices === 'object' ? plan.groupPrices : {};
  const key = Object.prototype.hasOwnProperty.call(prices, subject) ? subject : Object.keys(prices).find((name) => low(name) === low(subject));
  const entry = key === undefined ? null : prices[key];
  const cents = Math.round(Number(entry && entry.lessonPriceCents) || 0);
  return cents > 0 ? { lessonPriceCents: cents, lessonMinutes: Number(entry.lessonMinutes) || 60 } : null;
}

// individual: the plan the old code priced the subject with (combined-invoice-core planForSubject)
function planForFormat(individual = {}, plan = {}, subject = '', format = 'individual') {
  if (formatOf(format) !== 'group') return { plan: individual, fallback: false };
  const own = groupPriceOf(plan, subject);
  if (!own) return { plan: individual, fallback: true };
  return { plan: { ...individual, lessonPriceCents: own.lessonPriceCents, lessonMinutes: own.lessonMinutes }, fallback: false };
}

// the request's format: only 'group' is stored ('' = individual, the old shape)
const requestedFormat = (value) => (clean(value) === 'group' ? 'group' : '');

const isGroupPackage = (item = {}) => Boolean(item) && item.tokenFormat === 'group';

// The packages a lesson may take, in order (lesson-tokens-core packageTiersForLesson + the format):
// - no group package on the card → exactly the old tiers
// - a group lesson → its subject's group packages; none → the old tiers without group packages (fallback: true)
// - an individual lesson → the old tiers without group packages
// tiers null = this lesson is not on packages (takes nothing, owes nothing)
function packageTiersForFormat(packages = [], subjectKey = '', format = 'individual') {
  const list = (Array.isArray(packages) ? packages : []).filter(Boolean);
  if (!list.some(isGroupPackage)) return { tiers: packageTiersForLesson(list, subjectKey), fallback: false };
  const individual = list.filter((item) => !isGroupPackage(item));
  if (formatOf(format) === 'group') {
    const own = list.filter((item) => isGroupPackage(item) && packageSubjectKey(item) === subjectKey);
    if (own.length) return { tiers: [own], fallback: false };
    return { tiers: individual.length ? packageTiersForLesson(individual, subjectKey) : null, fallback: true };
  }
  return { tiers: individual.length ? packageTiersForLesson(individual, subjectKey) : null, fallback: false };
}

// read-only report (functions/tools/direction-format-report.js): tracks without a stored format that read as „Grupp”
// because the card is a member of an active calendar group of that subject and has no other track of that subject
function legacyGroupCandidates(students = [], groups = []) {
  const tracksOf = (student) => (Array.isArray(student.enrollments) && student.enrollments.length ? student.enrollments : [student]).filter(Boolean);
  const subjectOf = (track, student) => clean(track.subject || student.subject) || 'Eesti keel';
  return (students || []).flatMap((student) => {
    const tracks = tracksOf(student);
    return tracks
      .filter((track) => track.active !== false && track.status !== 'ended' && !track.format)
      .map((track) => {
        const subject = subjectOf(track, student);
        if (tracks.filter((item) => low(subjectOf(item, student)) === low(subject)).length > 1) return null;
        const group = (groups || []).find((item) => item && item.active !== false && Array.isArray(item.students) && item.students.includes(student.id) && low(item.subject || 'Eesti keel') === low(subject));
        return group ? { studentId: student.id, name: clean(student.name), subject, groupId: group.id } : null;
      })
      .filter(Boolean);
  });
}

module.exports = { formatOf, formatSuffix, subjectFormatLabel, lessonFormat, groupPriceOf, planForFormat, requestedFormat, isGroupPackage, packageTiersForFormat, legacyGroupCandidates };
