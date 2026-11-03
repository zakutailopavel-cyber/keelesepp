// Which skill a worksheet task trains. One table for „Areng” (autoSkills.js: a checked task is evidence for its skill)
// and for „Ülesanded” (a hint „Kuulamine 0% → 70%” opens the tasks that move exactly that skill). Pure, no engine import.
export const TASK_SKILL = Object.freeze({
  gaps: 'Grammatika', choice: 'Grammatika', wordforms: 'Grammatika', errorfix: 'Grammatika', transformation: 'Grammatika',
  wordorder: 'Grammatika', table: 'Grammatika', categorize: 'Grammatika',
  match: 'Sõnavara', manymatch: 'Sõnavara', crossword: 'Sõnavara', wordsearch: 'Sõnavara', pictures: 'Sõnavara', clock: 'Sõnavara', vocab: 'Sõnavara',
  reading: 'Lugemine', truefalse: 'Lugemine',
  listening: 'Kuulamine', dictation: 'Kuulamine',
  writing: 'Kirjutamine', guidedletter: 'Kirjutamine', translation: 'Kirjutamine',
});

// the skills a sheet has tasks for (a block left out of the score still shows what the sheet trains)
export function sheetSkills(doc) {
  return new Set((doc?.blocks || []).map((block) => TASK_SKILL[block?.type]).filter(Boolean));
}

// skills whose tasks live on worksheets, with the words „Ülesanded” uses when it shows only them
export const SKILL_TASKS = Object.freeze({
  Grammatika: { tasks: 'grammatikaülesandeid', ru: 'заданий по грамматике' },
  Sõnavara: { tasks: 'sõnavaraülesandeid', ru: 'заданий на слова' },
  Lugemine: { tasks: 'lugemisülesandeid', ru: 'заданий на чтение' },
  Kuulamine: { tasks: 'kuulamisülesandeid', ru: 'заданий на слух' },
  Kirjutamine: { tasks: 'kirjutamisülesandeid', ru: 'письменных заданий' },
});

export const isTaskSkill = (skill) => Object.hasOwn(SKILL_TASKS, skill);

// „/homework?oskus=Kuulamine”: the hint's way to the tasks of one skill
export const skillTasksPath = (skill) => `/homework?oskus=${encodeURIComponent(skill)}`;
