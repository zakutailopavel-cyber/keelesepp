// Course names by the TARGET level (owner 2026-10-29, like Harno / Töötukassa): „Eesti keel B1”, not „A2 → B1 õpitee”.
// Display only — the internal ids (est-a2-b1-roadmap-v1, a2b1-…, course keys a2/b1/b2/c1/b2c1) never change.
// One source for every place a course name is shown: the course registry (admin pages, the worksheet badge „KeeleSepp ·
// Eesti keel B1 · moodul N”), Õppevara groups, the student's „Minu kursus”, the textbook cover.
export const COURSE_NAMES = {
  a2: { level: 'A2', name: 'Eesti keel A2', subtitle: 'algajale · Harno A2 eksamini', curriculumId: 'est-a2-curriculum-v1' },
  b1: { level: 'B1', name: 'Eesti keel B1', subtitle: 'A2 tasemelt · Harno B1 eksamini', curriculumId: 'est-a2-b1-roadmap-v1' },
  b2: { level: 'B2', name: 'Eesti keel B2', subtitle: 'B1 tasemelt · Harno B2 eksamini', curriculumId: 'est-b1-b2-roadmap-v1' },
  c1: { level: 'C1', name: 'C1 süvakursus', subtitle: 'B2+ · 240 ak h', curriculumId: 'est-c1-curriculum-240-v1' },
  // owner 2026-10-30: the course that leads to the Harno C1 exam, like B1→B2 leads to B2 (docs/COURSE_FINAL_SHAPE_C1.md).
  // The level „C1” keeps meaning the süvakursus in level-keyed places (Õppevara, Minu kursus); this one is found by its
  // course key and curriculum id (`sharesLevel`)
  b2c1: { level: 'C1', sharesLevel: true, name: 'Eesti keel C1', subtitle: 'B2 tasemelt · Harno C1 eksamini', curriculumId: 'est-b2-c1-roadmap-v1' },
  enA2: { level: 'English A2', name: 'English A2', subtitle: '', curriculumId: 'en-a2-v1' },
  enB1: { level: 'English B1', name: 'English B1', subtitle: '', curriculumId: 'en-b1-v1' },
};
// the English course as a whole (its modules carry English A2 / English B1)
export const ENGLISH_COURSE_NAME = 'English A1–B1';

const BY_LEVEL = new Map(Object.values(COURSE_NAMES).filter((course) => !course.sharesLevel).map((course) => [course.level, course]));
const BY_CURRICULUM = new Map(Object.values(COURSE_NAMES).map((course) => [course.curriculumId, course]));

// 'B1' → { name: 'Eesti keel B1', … }; 'English A2' → English A2; anything else → null
export const courseForLevel = (level) => BY_LEVEL.get(String(level || '').trim()) || null;
export const courseNameForLevel = (level) => courseForLevel(level)?.name || '';
export const courseNameForCurriculum = (curriculumId) => BY_CURRICULUM.get(String(curriculumId || '').trim())?.name || '';

// Sheets saved before 2026-10-29 carry the old badge („KeeleSepp A2 → B1 · moodul 3”, „KeeleSepp English · moodul 2”) in
// Firestore (published sheets, versions, students' assignments). The sheet shows the new name without republishing; a
// badge a teacher typed by hand is shown as written.
const LEGACY_BADGES = [
  [/^KeeleSepp A1 → A2(?=$| ·)/, 'KeeleSepp · Eesti keel A2'],
  [/^KeeleSepp A2 → B1(?=$| ·)/, 'KeeleSepp · Eesti keel B1'],
  [/^KeeleSepp B1 → B2(?=$| ·)/, 'KeeleSepp · Eesti keel B2'],
  [/^KeeleSepp B2 → C1(?=$| ·)/, 'KeeleSepp · C1 süvakursus'],
];
export function courseBadge(badge, level) {
  const text = String(badge ?? '');
  if (/^KeeleSepp English(?=$| ·)/.test(text)) {
    const english = /^English [AB][12]$/.test(String(level || '')) ? level : ENGLISH_COURSE_NAME;
    return text.replace(/^KeeleSepp English/, `KeeleSepp · ${english}`);
  }
  for (const [pattern, name] of LEGACY_BADGES) if (pattern.test(text)) return text.replace(pattern, name);
  return badge;
}
