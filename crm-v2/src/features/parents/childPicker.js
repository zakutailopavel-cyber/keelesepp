// Choosing a child for a parent (Oleksiy 2026-11-06: „Невозможно добавить родителю архивированного ученика”): the
// pickers list active cards first and archived cards under their own „Arhiveeritud” header (as „Halda” in Grupid,
// #1123). One search covers both. Cards in the „Prügikast” (or purged) and merged-away cards are never offered.

const norm = (value) => String(value ?? '').trim().toLocaleLowerCase('et');
const digits = (value) => String(value ?? '').replace(/\D/g, '');

export const isArchivedCard = (student = {}) => student.active === false;
export const isTrashedCard = (student = {}) => Boolean(student.deletedAt || student.purgedAt);
const isMergedAway = (student = {}) => Boolean(student.mergedInto || student.mergedIntoStudentId);

// a card a parent can be linked to: active or archived, not in the trash, not merged into another card
export const isLinkableCard = (student = {}) => Boolean(student.id) && !isTrashedCard(student) && !isMergedAway(student) && !student.convertedToParent;

// name, e-mail, phone, parent name / e-mail / phone (and subject / teacher, as the old search did)
export function matchesChildSearch(student = {}, query = '') {
  const needle = norm(query);
  if (!needle) return true;
  const contacts = Array.isArray(student.parentContacts) ? student.parentContacts : [];
  const text = [student.name, ...(student.nameAliases || []), student.email, student.phone, student.parentName, student.parentEmail, student.parentPhone, student.subject, student.teacher,
    ...contacts.flatMap((item) => [item?.name, item?.email, item?.phone])];
  if (text.some((value) => norm(value).includes(needle))) return true;
  const phone = digits(query);
  return phone.length >= 4 && [student.phone, student.parentPhone, ...contacts.map((item) => item?.phone)].some((value) => digits(value).includes(phone));
}

// { active, archived } — both filtered by the search, trashed / merged cards left out
export function childPickerGroups(students = [], query = '') {
  const found = students.filter((student) => isLinkableCard(student) && matchesChildSearch(student, query));
  return { active: found.filter((student) => !isArchivedCard(student)), archived: found.filter(isArchivedCard) };
}

export const ARCHIVED_LINK_QUESTION = 'Õpilane on arhiveeritud — kas taastada aktiivseks?';
