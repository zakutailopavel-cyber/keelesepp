// The data behind the Harno exam blocks (harno.jsx), kept in plain JS so the course builders
// (admin/course/blocks.js) and node tools can import it without JSX.

export const WRITING_GENRES = {
  kusimustik: 'Küsimustik', teade: 'Teade / sõnum', kutse: 'Kutse või kaart', kiri: 'Isiklik kiri', jutt: 'Jutt etteantud pealkirjaga', vastus: 'Vastus kirjale',
};
// Harno does not publish its internal per-criterion split for B1; these criteria are our inference (documented in
// COURSE_FINAL_SHAPE_B1.md §2.4) and keep a module exam on the same raw scale as the real exam.
export const PASS_SHARE = 0.8; // owner 2026-10-26: the course certificate needs ≥ 80 % in every exam part
export const RUBRIC_SCALES = {
  W1: { label: 'Kirjutamine, 1. ülesanne', criteria: [
    { name: 'Sisupunkt 1 on kirjas', max: 1 }, { name: 'Sisupunkt 2 on kirjas', max: 1 }, { name: 'Sisupunkt 3 on kirjas', max: 1 }, { name: 'Sisupunkt 4 on kirjas', max: 1 },
    { name: 'Keel ja vorm', max: 4, hint: 'pöördumine ja lõpetus sobivad adressaadile; vead ei sega mõistmist; pikkus ±20 %' },
  ] },
  W2: { label: 'Kirjutamine, 2. ülesanne', criteria: [
    { name: 'Ülesande täitmine ja sisu', max: 3, hint: 'kõik punktid, teemas, sõnum on arusaadav' },
    { name: 'Ülesehitus ja sidusus', max: 3, hint: 'algus ja lõpp, lõigud, sidesõnad (sest, kuna, et, siis, pärast seda)' },
    { name: 'Sõnavara', max: 3, hint: 'piisav ja täpne, vähe kordusi' },
    { name: 'Grammatika ja õigekiri', max: 3, hint: 'vead ei sega mõistmist' },
  ] },
  S: { label: 'Rääkimine', criteria: [
    { name: 'Ülesande täitmine ja suhtlus', max: 5, hint: 'vastused on arendatud, kokkulepe on tehtud, kaardi info on küsitud ja antud' },
    { name: 'Sujuvus ja sidusus', max: 5, hint: 'räägib pausideta, mõtted on seotud' },
    { name: 'Sõnavara', max: 5, hint: 'sõnad sobivad teemaga ja olukorraga' },
    { name: 'Grammatika ja hääldus', max: 5, hint: 'vead ei sega mõistmist, hääldus on arusaadav' },
  ] },
};
// The real Harno level exams, verified 2026-11-03 (docs/HARNO_LEVEL_REQUIREMENTS.md „Verified exam table”): per part the
// minutes, the raw points (`raw`: one point an item; writing and speaking by the rating scale) and the points the part
// gives in the result (`weighted`, 20 at A2, 25 from B1); `from` = the shorter end when Harno gives a range (30–35 min). `raw: null` = Harno does not publish the raw scale (B2 writing
// and speaking). Order = the exam's order: writing, listening, reading (the written part), then speaking.
export const HARNO_PASS = { share: 0.6, noZeroPart: true }; // every level: ≥ 60 % of the total and no part with 0 points
export const HARNO_EXAMS = {
  A2: { total: 80, parts: {
    W: { part: 'Kirjutamine', minutes: 30, raw: 20, weighted: 20, tasks: 2 },
    L: { part: 'Kuulamine', minutes: 30, raw: 25, weighted: 20, tasks: 4 },
    R: { part: 'Lugemine', minutes: 50, raw: 30, weighted: 20, tasks: 5 },
    S: { part: 'Rääkimine', minutes: 15, raw: 20, weighted: 20, tasks: 2 },
  } },
  B1: { total: 100, parts: {
    W: { part: 'Kirjutamine', minutes: 35, raw: 20, weighted: 25, tasks: 2 },
    L: { part: 'Kuulamine', minutes: 35, from: 30, raw: 30, weighted: 25, tasks: 4 },
    R: { part: 'Lugemine', minutes: 50, raw: 33, weighted: 25, tasks: 4 },
    S: { part: 'Rääkimine', minutes: 15, raw: 20, weighted: 25, tasks: 2 },
  } },
  B2: { total: 100, parts: {
    W: { part: 'Kirjutamine', minutes: 80, raw: null, weighted: 25, tasks: 2 },
    L: { part: 'Kuulamine', minutes: 40, from: 35, raw: 32, weighted: 25, tasks: 4 },
    R: { part: 'Lugemine', minutes: 70, raw: 35, weighted: 25, tasks: 4 },
    S: { part: 'Rääkimine', minutes: 20, raw: null, weighted: 25, tasks: 2 },
  } },
  C1: { total: 100, parts: {
    W: { part: 'Kirjutamine', minutes: 90, raw: 24, weighted: 25, tasks: 2 },
    L: { part: 'Kuulamine', minutes: 45, raw: 27, weighted: 25, tasks: 3 },
    R: { part: 'Lugemine', minutes: 60, raw: 34, weighted: 25, tasks: 3 },
    S: { part: 'Rääkimine', minutes: 20, raw: 20, weighted: 25, tasks: 2 },
  } },
};
export const HARNO_LEVELS = Object.keys(HARNO_EXAMS);
// the course → the Harno exam it leads to (courseSheet.js marks every exam-part header with it)
export const COURSE_EXAM = { a2: 'A2', b1: 'B1', b2: 'B2', c1: 'C1', b2c1: 'C1' };

// a part's header defaults at a level: { part, minutes, points (= raw, or the weighted points when raw is not
// published), tasks }
export const examPartDefaults = (level, skill) => {
  const p = HARNO_EXAMS[level]?.parts[skill];
  return p ? { part: p.part, minutes: p.minutes, points: p.raw ?? p.weighted, tasks: p.tasks } : null;
};
// B1 (the first course exam with its own blocks); B.examPart's default when no level is given
export const EXAM_PART_DEFAULTS = Object.fromEntries(['W', 'L', 'R', 'S'].map((s) => [s, examPartDefaults('B1', s)]));

// Harno's result: raw points of a part → the part's points in the result (rounded to 0.1), and the pass rule
export function harnoWeighted(level, skill, raw, max) {
  const p = HARNO_EXAMS[level]?.parts[skill];
  const outOf = Number(max) || p?.raw || p?.weighted;
  if (!p || !outOf) return null;
  return Math.round((Math.max(0, Number(raw) || 0) / outOf) * p.weighted * 10) / 10;
}
// raws: { W, L, R, S } raw points (maxes: the same keys when a sheet's part is shorter than the real one)
export function harnoResult(level, raws, maxes = {}) {
  const exam = HARNO_EXAMS[level];
  if (!exam) return null;
  const parts = Object.fromEntries(Object.keys(exam.parts).map((s) => [s, harnoWeighted(level, s, raws?.[s], maxes[s])]));
  const total = Math.round(Object.values(parts).reduce((n, v) => n + (v || 0), 0) * 10) / 10;
  const zero = Object.keys(parts).filter((s) => !parts[s]);
  return { parts, total, max: exam.total, need: Math.ceil(exam.total * HARNO_PASS.share), zero, passed: total >= exam.total * HARNO_PASS.share && !zero.length };
}
