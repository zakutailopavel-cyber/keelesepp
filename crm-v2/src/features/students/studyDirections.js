// „Õppesuunad” (owner 2026-10-24: „самому ставить учебные направления”): the school's own list of study directions,
// kept by the administrator in Seaded → Õppesuunad (Firestore `studyDirections`). Until the list is saved the
// built-in directions below are used, so nothing breaks; a subject already written on a card that is not in the list
// stays valid and is still offered (old values are never rewritten).
import { subjectName } from './subjects.js';

const clean = (value) => String(value ?? '').trim();
const lower = (value) => clean(value).toLocaleLowerCase('et');

export const LANGUAGE_LEVELS = ['Eelkool', 'A1', 'A2', 'B1', 'B2', 'C1'];
export const SCHOOL_GRADES = Array.from({ length: 12 }, (_, index) => `${index + 1}. klass`);

// the subjects the school had before the list could be edited (subjects.js SUBJECT_CHOICES + Õppevara's Emakeel)
export const DEFAULT_DIRECTIONS = [
  { id: 'eesti-keel', name: 'Eesti keel', shortLabel: 'ET', color: '#2f6fed', levels: LANGUAGE_LEVELS, aliases: ['Eesti', 'Estonian'], status: 'active', order: 1 },
  { id: 'inglise-keel', name: 'Inglise keel', shortLabel: 'EN', color: '#c2410c', levels: LANGUAGE_LEVELS, aliases: ['English', 'Inglise'], status: 'active', order: 2 },
  { id: 'matemaatika', name: 'Matemaatika', shortLabel: 'MA', color: '#15803d', levels: SCHOOL_GRADES, aliases: ['Matem'], status: 'active', order: 3 },
  { id: 'emakeel', name: 'Emakeel', shortLabel: 'EK', color: '#7c3aed', levels: SCHOOL_GRADES, aliases: ['Eesti keel emakeelena'], status: 'active', order: 4 },
  { id: 'vene-keel', name: 'Vene keel', shortLabel: 'RU', color: '#be123c', levels: LANGUAGE_LEVELS, aliases: ['Russian'], status: 'active', order: 5 },
];

export function directionId(name) {
  return lower(name).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'suund';
}

// "A1, A2\nB1" → ['A1', 'A2', 'B1']
export function parseList(text) {
  const seen = new Set();
  return String(text || '').split(/[,;\n]+/).map(clean).filter((item) => item && !seen.has(lower(item)) && seen.add(lower(item)));
}

export function normalizeDirection(id, data = {}) {
  const name = subjectName(data.name);
  return {
    id: clean(id) || directionId(name),
    name,
    shortLabel: clean(data.shortLabel).slice(0, 6).toUpperCase(),
    color: /^#[0-9a-f]{6}$/i.test(clean(data.color)) ? clean(data.color) : '',
    levels: Array.isArray(data.levels) ? data.levels.map(clean).filter(Boolean).slice(0, 30) : [],
    aliases: Array.isArray(data.aliases) ? data.aliases.map(clean).filter(Boolean).slice(0, 20) : [],
    status: data.status === 'archived' ? 'archived' : 'active',
    order: Number.isInteger(data.order) ? data.order : 0,
    ...(clean(data.createdAt) ? { createdAt: clean(data.createdAt) } : {}),
  };
}

const byOrder = (a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, 'et');

// the stored list, or the built-in one (marked fallback) while nothing is stored
export function directionList(stored = []) {
  const list = (stored || []).map((item) => normalizeDirection(item.id, item)).filter((item) => item.name);
  if (list.length) return list.sort(byOrder);
  return DEFAULT_DIRECTIONS.map((item) => ({ ...normalizeDirection(item.id, item), fallback: true }));
}

export const activeDirections = (list = []) => directionList(list).filter((item) => item.status === 'active');

// the direction a subject written on a card belongs to: its name or one of its aliases (any case); archived ones too,
// so an old card still shows its colour
export function findDirection(subject, list = []) {
  const key = lower(subject);
  if (!key) return null;
  const all = directionList(list);
  return all.find((item) => lower(item.name) === key) || all.find((item) => item.aliases.some((alias) => lower(alias) === key)) || null;
}

// how a subject is written on a card from now on: the direction's name when it matches, else the old value as it was
export function canonicalSubject(subject, list = []) {
  return findDirection(subject, list)?.name || subjectName(subject);
}

// subjects to pick from: the active directions, plus values already on the cards that the list does not know
export function subjectOptions(list = [], current = []) {
  const names = activeDirections(list).map((item) => item.name);
  const extra = (current || []).map(subjectName).filter((value) => value && !findDirection(value, list));
  return [...new Set([...names, ...extra])];
}

// levels of a direction ('' = not set first); a direction without levels uses the language levels
export function levelOptions(subject, list = [], current = '') {
  const direction = findDirection(subject, list);
  const levels = direction?.levels?.length ? direction.levels : LANGUAGE_LEVELS;
  return [...new Set(['', ...levels, ...(clean(current) ? [clean(current)] : [])])];
}

// a direction ready to store (the rules accept exactly these keys)
export function directionPayload(values = {}, user = {}, order = 0) {
  const direction = normalizeDirection(values.id, values);
  if (!direction.name) throw new Error('Õppesuuna nimi on kohustuslik.');
  if (direction.name.length > 80) throw new Error('Nimi on liiga pikk (kuni 80 märki).');
  return {
    name: direction.name,
    shortLabel: direction.shortLabel,
    color: direction.color,
    levels: direction.levels,
    aliases: direction.aliases,
    status: direction.status,
    order: Math.max(0, Math.min(999, Number.isInteger(values.order) ? values.order : order)),
    updatedAt: new Date().toISOString(),
    updatedByUid: user.uid || '',
    updatedByName: user.displayName || user.email || '',
  };
}

// how many cards use each subject (active tracks), for the settings list
export function subjectUsage(students = [], list = []) {
  const counts = new Map();
  for (const student of students) {
    if (student?.active === false || student?.mergedInto) continue;
    const tracks = Array.isArray(student.enrollments) && student.enrollments.length ? student.enrollments : [student];
    const subjects = new Set(tracks.filter((t) => t && t.active !== false && t.status !== 'ended').map((t) => canonicalSubject(t.subject || student.subject || 'Eesti keel', list)));
    subjects.forEach((subject) => counts.set(subject, (counts.get(subject) || 0) + 1));
  }
  return counts;
}
