// Teacher's skill grades on a checked work → the student's skill map (students.skillMap, 0–100), shown in „Areng”.
// Same rule as the methodology's skill map updater: a grade is read as a result in percent and moves the skill by
// +5 / +3 / +1 / 0 / −3; a skill the student does not have yet starts at that percent. Re-checking a work first takes
// back what its previous check changed, so a work never counts twice.

export const CORE_SKILLS = ['Lugemine', 'Kuulamine', 'Kirjutamine', 'Rääkimine', 'Grammatika', 'Sõnavara'];
export const GRADE_PERCENT = { 1: 20, 2: 45, 3: 65, 4: 80, 5: 95 };
export const GRADE_LABEL = { 1: '1 – nõrk', 2: '2 – vajab tööd', 3: '3 – rahuldav', 4: '4 – hea', 5: '5 – väga hea' };

export function scoreToDelta(pct) {
  if (pct >= 90) return 5;
  if (pct >= 75) return 3;
  if (pct >= 60) return 1;
  if (pct >= 40) return 0;
  return -3;
}

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

// skills offered for a student: the six core skills plus whatever the map already holds
export function skillList(skillMap = {}) {
  return [...new Set([...CORE_SKILLS, ...Object.keys(skillMap || {})])];
}

// Which skills a worksheet trains, read from its block types (a suggestion; the teacher decides).
const BLOCK_SKILL = {
  reading: 'Lugemine', text: 'Lugemine', truefalse: 'Lugemine',
  listening: 'Kuulamine', dictation: 'Kuulamine', audio: 'Kuulamine',
  writing: 'Kirjutamine', letter: 'Kirjutamine', essay: 'Kirjutamine', errorfix: 'Kirjutamine',
  speaking: 'Rääkimine', dialogue: 'Rääkimine', describe: 'Rääkimine', picturetalk: 'Rääkimine',
  gaps: 'Grammatika', choice: 'Grammatika', wordforms: 'Grammatika', order: 'Grammatika', table: 'Grammatika',
  vocab: 'Sõnavara', match: 'Sõnavara', crossword: 'Sõnavara', sort: 'Sõnavara',
};
export function suggestedSkills(worksheetDoc) {
  const found = new Set();
  for (const block of worksheetDoc?.blocks || []) {
    const skill = BLOCK_SKILL[block?.type];
    if (skill) found.add(skill);
  }
  return [...found];
}

// grades: { skill: 1..5 }; previous: { deltas, created } stored by the last check of the same work.
// Returns the skill values to write (null = remove a skill that only this work had created), and what to store.
export function applySkillGrades(skillMap = {}, grades = {}, previous = {}) {
  const base = { ...skillMap };
  const before = previous?.deltas || {};
  const createdBefore = new Set(previous?.created || []);
  for (const [skill, delta] of Object.entries(before)) {
    if (!(skill in base)) continue;
    if (createdBefore.has(skill)) delete base[skill];
    else base[skill] = clamp(Number(base[skill]) - Number(delta || 0));
  }
  const values = {};
  const deltas = {};
  const created = [];
  for (const [skill, grade] of Object.entries(grades || {})) {
    const pct = GRADE_PERCENT[Number(grade)];
    if (!pct) continue;
    if (skill in base) {
      deltas[skill] = scoreToDelta(pct);
      values[skill] = clamp(Number(base[skill]) + deltas[skill]);
    } else {
      deltas[skill] = 0;
      created.push(skill);
      values[skill] = pct;
    }
  }
  // skills graded last time but not now go back to their value before that check
  for (const skill of Object.keys(before)) {
    if (skill in values) continue;
    values[skill] = skill in base ? base[skill] : null;
  }
  return { values, deltas, created };
}
