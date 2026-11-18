// The data behind the Harno exam blocks (harno.jsx), kept in plain JS so the course builders
// (admin/course/blocks.js) and node tools can import it without JSX.
import { ENGLISH_EXAM_FORMATS, IELTS_RUBRICS } from './examFormats.js';

export const WRITING_GENRES = {
  kusimustik: 'Küsimustik', teade: 'Teade / sõnum', kutse: 'Kutse või kaart', kiri: 'Isiklik kiri', jutt: 'Jutt etteantud pealkirjaga', vastus: 'Vastus kirjale',
  // the English state exam (docs/COURSE_FINAL_SHAPE_EN_B2.md §3.1): EW1 a letter (120 words), EW2 a report or an essay (200 words)
  letter: 'Letter', report: 'Report', essay: 'Essay',
  // the 9th-grade e-exam (docs/EXAM_9KL_E_EKSAM.md §3): W2 is a summary of a chart or an argument
  kokkuvote: 'Kokkuvõte', arutlus: 'Arutlus',
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
  // the English state exam's marking scales (Harno, inglise keele riigieksami eristuskiri 2026/27 §6.1, tables 5, 6a, 6b, 7,
  // checked 2026-11-03; docs/COURSE_FINAL_SHAPE_EN_B2.md §3.1): letter 3 aspects × 0–3 = 9, report / essay 4 × 0–4 = 16
  // (the report's first aspect is „Task completion”, the essay's „Content”), speaking 4 × 0–5 = 20
  EW1: { label: 'Writing, task 1 (letter)', lang: 'en', criteria: [
    { name: 'Task completion', max: 3, hint: 'every point mentioned and expanded, logical paragraphs, letter format (opening, closing, salutation, sign-off); under 60 words: at most 1' },
    { name: 'Vocabulary', max: 3, hint: 'task-specific vocabulary, right tone and register, spelling' },
    { name: 'Grammar', max: 3, hint: 'range and accuracy; errors do not block understanding' },
  ] },
  EW2: { label: 'Writing, task 2 (report or essay)', lang: 'en', criteria: [
    { name: 'Task completion / content', max: 4, hint: 'report: the data fully described and compared; essay: every point developed and supported; about 200 words' },
    { name: 'Organisation', max: 4, hint: 'the genre’s layout, paragraphs, linking words, about 200 words' },
    { name: 'Vocabulary', max: 4, hint: 'range, accuracy and register' },
    { name: 'Grammar', max: 4, hint: 'range and accuracy of structures' },
  ] },
  ES: { label: 'Speaking', lang: 'en', criteria: [
    { name: 'Task completion', max: 5, hint: 'answers every question, compares and gives reasons; at least 1 min 45 s of own talk in each task' },
    { name: 'Vocabulary', max: 5, hint: 'range and accuracy for the topic' },
    { name: 'Grammar', max: 5, hint: 'range and accuracy; errors do not block understanding' },
    { name: 'Fluency and pronunciation', max: 5, hint: 'speaks without long pauses; pronunciation is clear' },
  ] },
  // the 9th-grade e-exam (eristuskiri 2026/27 §6.1): a writing task 2 × 0–5 = 10 by two raters; speaking one holistic
  // 0–10 per rater, two raters → 20
  E9W: { label: 'E-eksam: kirjutamisülesanne (10 p)', criteria: [
    { name: 'Ülesande täitmine ja sisu', max: 5, hint: 'kõik punktid on kirjas ja arendatud; pikkus vastab nõudele; vorm sobib' },
    { name: 'Keelekasutus', max: 5, hint: 'sõnavara, grammatika, õigekiri, lauseehitus, sidusus; vead ei sega mõistmist' },
  ] },
  E9S: { label: 'E-eksam: suuline osa (20 p)', criteria: [
    { name: 'Hindaja 1 (terviklik hinnang)', max: 10, hint: 'ülesande täitmine, info vahetamine, sõnavara ja grammatika, arusaadavus' },
    { name: 'Hindaja 2 (terviklik hinnang)', max: 10, hint: 'teine hindaja (õpetaja) samal skaalal' },
  ] },
  // IELTS writing and speaking: four criteria, each a band 0–9 (examFormats.js)
  ...IELTS_RUBRICS,
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
// The English state exam (inglise keele riigieksam, B1/B2; Harno eristuskiri 2026/27, kinnitatud 31.08.2026, and the 2026
// papers — docs/COURSE_FINAL_SHAPE_EN_B2.md §3.1). One point scale: the raw points are the result's points (listening 40
// items × 0.625 = 25, reading 60 items × 0.5 = 30), so raw = weighted. Its level rule is its own (EN_STATE_RULE), not
// HARNO_PASS: B1 = 50–74 %, B2 = 75–100 %, and no part may be 0 points for a level. `once`: the listening task played only
// once (task 1); `turnSec`: the least own talk in each speaking task (1 min 45 s); `items`, `perItem`: the scored items.
export const EN_STATE_EXAM = 'EN-RE';
export const EN_STATE_RULE = Object.freeze({ levels: [['B2', 0.75], ['B1', 0.5]], noZeroPart: true });
export const EN_STATE_EXAM_DATA = Object.freeze({
  total: 100, language: 'en', name: 'English state exam', rule: EN_STATE_RULE, parts: {
    W: { part: 'Writing', number: 'I', minutes: 90, raw: 25, weighted: 25, tasks: 2, words: [120, 200], taskPoints: [9, 16] },
    L: { part: 'Listening', number: 'II', minutes: 40, raw: 25, weighted: 25, tasks: 5, items: 40, perItem: 0.625, once: [1] },
    R: { part: 'Reading', number: 'III', minutes: 90, raw: 30, weighted: 30, tasks: 7, items: 60, perItem: 0.5 },
    S: { part: 'Speaking', number: 'IV', minutes: 15, raw: 20, weighted: 20, tasks: 2, turnSec: 105 },
  },
});
// The basic-school final exam „eesti keel teise keelena” as a computer-based e-exam (EIS, from spring 2027; Harno
// eristuskiri 2026/27 Lisa 2, docs/EXAM_9KL_E_EKSAM.md §1–2): B1 and B2 combined, every skill 20 points, reading and
// language structure together 40. The written part is on the computer (W 70 min, L 50 min / 35 items, R 95 min / 65
// items, all key-marked but writing); speaking is with an interviewer (24–26 min in pairs). Certificate: B1 at ≥ 60 % of
// the total and no part at 0 points (B2's threshold is not published). `items`: the scored items the part's points are
// converted from (engine/examMode.js partScore).
export const E9_EXAM = 'E9';
export const E9_RULE = Object.freeze({ levels: [['B1', 0.6]], noZeroPart: true });
export const E9_EXAM_DATA = Object.freeze({
  total: 100, language: 'et', name: '9. klassi e-eksam (eesti keel teise keelena)', rule: E9_RULE, parts: {
    W: { part: 'Kirjutamine', number: 'I', minutes: 70, raw: 20, weighted: 20, tasks: 2, words: [100, 160] },
    L: { part: 'Kuulamine', number: 'II', minutes: 50, raw: 20, weighted: 20, tasks: 5, items: 35 },
    R: { part: 'Lugemine ja keele struktuur', number: 'III', minutes: 95, raw: 40, weighted: 40, tasks: 7, items: 65 },
    S: { part: 'Suuline osa', number: 'IV', minutes: 26, from: 24, raw: 20, weighted: 20, tasks: 3 },
  },
});
// a Harno exam of the Estonian course levels (A2 … C1) is listed in HARNO_LEVELS; the English state exam is an exam
// of its own (examFor / COURSE_EXAM), not a level of the Estonian exams; the 9th-grade e-exam neither
export const HARNO_LEVELS = Object.keys(HARNO_EXAMS);
// …and the international English exams of the English B2 course (examFormats.js: IELTS, TOEFL iBT, Cambridge B2 First)
const ALL_EXAMS = { ...HARNO_EXAMS, [EN_STATE_EXAM]: EN_STATE_EXAM_DATA, [E9_EXAM]: E9_EXAM_DATA, ...ENGLISH_EXAM_FORMATS };
export const examFor = (exam) => ALL_EXAMS[exam] || null;
export const isEnglishExam = (exam) => examFor(exam)?.language === 'en';
export const ENGLISH_EXAMS = [EN_STATE_EXAM, ...Object.keys(ENGLISH_EXAM_FORMATS)];
// the course → the exam it leads to (courseSheet.js marks every exam-part header with it)
export const COURSE_EXAM = { a2: 'A2', b1: 'B1', b1noor: 'B1', b2: 'B2', c1: 'C1', b2c1: 'C1', enb2: EN_STATE_EXAM };

// a part's header defaults at a level: { part, minutes, points (= raw, or the weighted points when raw is not
// published), tasks }
export const examPartDefaults = (level, skill) => {
  const p = examFor(level)?.parts[skill];
  return p ? { part: p.part, minutes: p.minutes, points: p.raw ?? p.weighted, tasks: p.tasks, ...(p.items ? { items: p.items } : {}) } : null;
};
// B1 (the first course exam with its own blocks); B.examPart's default when no level is given
export const EXAM_PART_DEFAULTS = Object.fromEntries(['W', 'L', 'R', 'S'].map((s) => [s, examPartDefaults('B1', s)]));

// Harno's result: raw points of a part → the part's points in the result (rounded to 0.1), and the pass rule
export function harnoWeighted(level, skill, raw, max) {
  const p = examFor(level)?.parts[skill];
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

// The English state exam's result: the part points (raws: { W, L, R, S } on the exam's scale, or out of `maxes` when a
// sheet's part is shorter), the total rounded to a whole number (Harno), and the level it gives — 'B2' (≥ 75 %), 'B1'
// (≥ 50 %) or '' — with no part at 0 points. „Passed” in Harno's sense is ≥ 1 %.
export function englishStateResult(raws, maxes = {}) {
  const exam = EN_STATE_EXAM_DATA;
  const parts = Object.fromEntries(Object.keys(exam.parts).map((s) => [s, harnoWeighted(EN_STATE_EXAM, s, raws?.[s], maxes[s])]));
  const total = Math.round(Object.values(parts).reduce((n, v) => n + (v || 0), 0));
  const zero = Object.keys(parts).filter((s) => !parts[s]);
  const share = total / exam.total;
  const level = zero.length && exam.rule.noZeroPart ? '' : (exam.rule.levels.find(([, min]) => share >= min)?.[0] || '');
  return { parts, total, max: exam.total, zero, level, passed: total >= 1 };
}
