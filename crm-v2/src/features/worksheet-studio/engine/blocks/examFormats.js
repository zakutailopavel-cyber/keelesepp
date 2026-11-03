// The international English exams the English B2 course also prepares for (owner 2026-11-03: besides the Harno English
// state exam, IELTS, TOEFL iBT and Cambridge B2 First; docs/COURSE_FINAL_SHAPE_EN_B2.md). Same shape as the Harno exams
// in harnoScales.js (parts W / L / R / S with minutes, tasks, items), so B.examPart can carry `exam: 'IELTS-A'` etc. and the
// exam-part header (harno.jsx) prints the exam's own English section header, time and score scale. Module 10 can then
// hold a full-length mock in each format — written by KeeleSepp, never copied from official papers.
//
// Every number was read on the exam owner's site on 2026-11-03 (the URLs are in `sources`); [INF] marks our inference.
//   part fields: part (English name), minutes (and `from` for a range), tasks (parts / sections / task types), items
//   (scored questions), words (reading text in all, or writing [task 1, task 2] lengths), note (a line for the header)
//   scale: how the result is reported, and the band that means B2

export const IELTS_ACADEMIC = 'IELTS-A';
export const IELTS_GENERAL = 'IELTS-GT';
export const TOEFL_IBT = 'TOEFL';
export const B2_FIRST = 'B2F';

const IELTS_SOURCES = [
  'https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening',
  'https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading',
  'https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-writing',
  'https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking',
  'https://ielts.org/take-a-test/test-types/ielts-general-training-test',
];
// IELTS: Listening and Speaking are the same in both tests; Reading and Writing Task 1 differ
const IELTS_SCALE = {
  kind: 'band', min: 0, max: 9, step: 0.5,
  // [INF] the commonly used IELTS ↔ CEFR mapping (not read on ielts.org): B2 = 5.5–6.5
  b2: [5.5, 6.5],
  note: 'Each part gets a band score from 0 to 9 (whole or half bands); the overall band is the average of the four.',
};
const ieltsListening = { part: 'Listening', minutes: 30, tasks: 4, items: 40, raw: 40, note: '4 parts, 40 questions (10 a part), about 30 minutes; one mark for each correct answer.' };
const ieltsSpeaking = { part: 'Speaking', minutes: 14, from: 11, tasks: 3, raw: null, note: 'A face-to-face interview in 3 parts: introduction and interview (4–5 min), a long turn from a task card (1 min to prepare, up to 2 min of talk), a discussion (4–5 min).' };

export const ENGLISH_EXAM_FORMATS = Object.freeze({
  [IELTS_ACADEMIC]: {
    name: 'IELTS Academic', language: 'en', order: ['L', 'R', 'W', 'S'], scale: IELTS_SCALE, sources: IELTS_SOURCES,
    parts: {
      L: ieltsListening,
      R: { part: 'Reading', minutes: 60, tasks: 3, items: 40, raw: 40, words: [2150, 2750], note: '3 sections, 40 questions, 60 minutes including transfer time; 2,150–2,750 words in all.' },
      W: { part: 'Writing', minutes: 60, tasks: 2, raw: null, words: [150, 250], taskMinutes: [20, 40], note: 'Task 1 (describe visual information): at least 150 words, about 20 minutes. Task 2 (an essay): at least 250 words, about 40 minutes; Task 2 counts twice as much as Task 1.' },
      S: ieltsSpeaking,
    },
  },
  [IELTS_GENERAL]: {
    name: 'IELTS General Training', language: 'en', order: ['L', 'R', 'W', 'S'], scale: IELTS_SCALE,
    sources: [...IELTS_SOURCES.slice(0, 1), 'https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-reading', 'https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-writing', IELTS_SOURCES[3]],
    parts: {
      L: ieltsListening,
      R: { part: 'Reading', minutes: 60, tasks: 3, items: 40, raw: 40, words: [2150, 2375], note: '3 sections of increasing difficulty (everyday texts, workplace texts, one longer text), 40 questions, 60 minutes; 2,150–2,375 words in all.' },
      W: { part: 'Writing', minutes: 60, tasks: 2, raw: null, words: [150, 250], taskMinutes: [20, 40], note: 'Task 1 (a letter): at least 150 words, about 20 minutes. Task 2 (an essay): at least 250 words, about 40 minutes; Task 2 counts twice as much as Task 1.' },
      S: ieltsSpeaking,
    },
  },
  // the TOEFL iBT since 21 January 2026: four sections, scores 1–6 in half bands (CEFR-aligned); a comparable 0–120 total
  // is also reported for two years
  [TOEFL_IBT]: {
    name: 'TOEFL iBT', language: 'en', order: ['R', 'L', 'W', 'S'],
    scale: {
      kind: 'band', min: 1, max: 6, step: 0.5,
      // ETS score-scale table: 4 and 4.5 = B2 (ets.org/toefl/institutions/ibt/score-scale-update.html)
      b2: [4, 4.5],
      note: 'Each section is scored 1–6 in half bands; the overall score is the average of the four, rounded to the nearest half band. A comparable 0–120 total is also reported until January 2028.',
    },
    sources: ['https://www.ets.org/toefl/test-takers/ibt/about/content.html', 'https://www.ets.org/toefl/test-takers/ibt/scores/understand-scores.html', 'https://www.ets.org/toefl/institutions/ibt/score-scale-update.html'],
    parts: {
      R: { part: 'Reading', minutes: 30, tasks: 3, items: 50, raw: null, note: 'Complete the Words, Read in Daily Life, Read an Academic Passage: 50 items, about 30 minutes.' },
      L: { part: 'Listening', minutes: 29, tasks: 4, items: 47, raw: null, note: 'Listen and Choose a Response, a Conversation, an Announcement, an Academic Talk: 47 items, about 29 minutes.' },
      W: { part: 'Writing', minutes: 23, tasks: 3, items: 12, raw: null, note: 'Build a Sentence, Write an Email, Write for an Academic Discussion: 12 items, about 23 minutes.' },
      S: { part: 'Speaking', minutes: 8, tasks: 2, items: 11, raw: null, note: 'Listen and Repeat, Take an Interview: 11 items, about 8 minutes.' },
    },
  },
  // Cambridge B2 First: the Cambridge English Scale, 160–179 = B2 (grade C 160–172, B 173–179), 180–190 grade A (C1),
  // 140–159 a B1 certificate
  [B2_FIRST]: {
    name: 'Cambridge B2 First', language: 'en', order: ['R', 'W', 'L', 'S'],
    scale: {
      kind: 'cambridge', min: 140, max: 190, step: 1, b2: [160, 179],
      note: 'Cambridge English Scale: 160–179 = B2 (grade C 160–172, grade B 173–179), 180–190 = grade A (C1), 140–159 = a B1 certificate.',
    },
    sources: ['https://www.cambridgeenglish.org/exams-and-tests/qualifications/first/format/', 'https://www.cambridgeenglish.org/exams-and-tests/first/results/'],
    parts: {
      R: { part: 'Reading and Use of English', minutes: 75, tasks: 7, items: 52, raw: 52, share: 0.4, words: [2200, 2500], note: '7 parts, 52 questions, 1 hour 15 minutes, 40 % of the marks: multiple-choice cloze (8), open cloze (8), word formation (8), key word transformations (6), multiple choice (6), gapped text (6), multiple matching (10).' },
      W: { part: 'Writing', minutes: 80, tasks: 2, raw: null, share: 0.2, words: [140, 190], note: '2 parts, 1 hour 20 minutes, 20 % of the marks: a compulsory essay and one task chosen from four; 140–190 words each.' },
      // [INF] Listening and Speaking 20 % each: the rest of the marks split as the other papers (Cambridge reports five equal skill scores)
      L: { part: 'Listening', minutes: 40, tasks: 4, items: 30, raw: 30, share: 0.2, note: '4 parts, 30 questions, about 40 minutes: multiple choice (8), sentence completion (10), multiple matching (5), multiple choice (7).' },
      S: { part: 'Speaking', minutes: 14, tasks: 4, raw: null, share: 0.2, note: '4 parts, 14 minutes per pair of candidates (20 minutes for three). In a one-to-one lesson the teacher is the partner.' },
    },
  },
});
export const ENGLISH_EXAM_IDS = Object.keys(ENGLISH_EXAM_FORMATS);

// a band or scale score → is it B2 (or above) on that exam? `null` for an unknown exam
export function reachesB2(exam, score) {
  const s = ENGLISH_EXAM_FORMATS[exam]?.scale;
  if (!s) return null;
  return Number(score) >= s.b2[0];
}

// the IELTS rating criteria (ielts.org writing and speaking pages): four criteria, each a band 0–9
export const IELTS_RUBRICS = {
  IW: { label: 'IELTS Writing', lang: 'en', criteria: [
    { name: 'Task achievement / task response', max: 9 }, { name: 'Coherence and cohesion', max: 9 },
    { name: 'Lexical resource', max: 9 }, { name: 'Grammatical range and accuracy', max: 9 },
  ] },
  IS: { label: 'IELTS Speaking', lang: 'en', criteria: [
    { name: 'Fluency and coherence', max: 9 }, { name: 'Lexical resource', max: 9 },
    { name: 'Grammatical range and accuracy', max: 9 }, { name: 'Pronunciation', max: 9 },
  ] },
};
