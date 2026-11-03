import { render } from '@testing-library/react';
import Sheet from '../Sheet.jsx';
import { sampleDocument } from '../sample.js';
import { B } from '../../../worksheet-generator/admin/course/blocks.js';
import { withSheetLanguage } from '../../../worksheet-generator/admin/course/sheetLanguage.js';
import { examPartHeading, harnoPartLine } from './harno.jsx';
import {
  COURSE_EXAM, EN_STATE_EXAM, EN_STATE_EXAM_DATA, ENGLISH_EXAMS, HARNO_LEVELS, RUBRIC_SCALES, WRITING_GENRES, englishStateResult, examFor, examPartDefaults, harnoResult, isEnglishExam,
} from './harnoScales.js';
import { B2_FIRST, ENGLISH_EXAM_FORMATS, IELTS_ACADEMIC, IELTS_GENERAL, TOEFL_IBT, reachesB2 } from './examFormats.js';
import { rubricTotal } from './harno.jsx';

// The English state exam (Harno eristuskiri 2026/27) and the international exams of the English B2 course
// (docs/COURSE_FINAL_SHAPE_EN_B2.md): the exam data, the English part headers and the English labels of the blocks.
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
const doc = (blocks) => ({ ...sampleDocument(), blocks });
const card = (container, id) => container.querySelector(`.ws-page [data-block="${id}"]`);
const sum = (parts, key) => Object.values(parts).reduce((n, p) => n + (p[key] || 0), 0);

describe('the English state exam data (eristuskiri 2026/27)', () => {
  it('has the four parts with their minutes, points, tasks and items', () => {
    const { parts } = EN_STATE_EXAM_DATA;
    expect(parts.W).toMatchObject({ part: 'Writing', minutes: 90, raw: 25, tasks: 2, words: [120, 200], taskPoints: [9, 16] });
    expect(parts.L).toMatchObject({ part: 'Listening', minutes: 40, raw: 25, tasks: 5, items: 40, perItem: 0.625, once: [1] });
    expect(parts.R).toMatchObject({ part: 'Reading', minutes: 90, raw: 30, tasks: 7, items: 60, perItem: 0.5 });
    expect(parts.S).toMatchObject({ part: 'Speaking', minutes: 15, raw: 20, tasks: 2, turnSec: 105 });
    expect(sum(parts, 'raw')).toBe(100);
    expect(parts.L.items * parts.L.perItem).toBe(25);
    expect(parts.R.items * parts.R.perItem).toBe(30);
    expect(parts.W.taskPoints[0] + parts.W.taskPoints[1]).toBe(25);
  });
  it('is not one of the Estonian Harno levels, and enb2 leads to it', () => {
    expect(HARNO_LEVELS).not.toContain(EN_STATE_EXAM);
    expect(COURSE_EXAM.enb2).toBe(EN_STATE_EXAM);
    expect(isEnglishExam(EN_STATE_EXAM)).toBe(true);
    expect(isEnglishExam('B2')).toBe(false);
    expect(examPartDefaults(EN_STATE_EXAM, 'L')).toEqual({ part: 'Listening', minutes: 40, points: 25, tasks: 5, items: 40 });
  });
  it('gives B2 at 75 %, B1 at 50 %, nothing with a part at 0, and rounds the total to a whole number', () => {
    expect(englishStateResult({ W: 19, L: 19, R: 23, S: 15 })).toMatchObject({ total: 76, level: 'B2', passed: true });
    expect(englishStateResult({ W: 19, L: 19, R: 22.5, S: 14.5 })).toMatchObject({ total: 75, level: 'B2' });
    expect(englishStateResult({ W: 18, L: 18, R: 22, S: 15 }).level).toBe('B1');
    expect(englishStateResult({ W: 10, L: 10, R: 20, S: 10 }).level).toBe('B1');
    expect(englishStateResult({ W: 10, L: 10, R: 19, S: 10 }).level).toBe('');
    expect(englishStateResult({ W: 25, L: 25, R: 30, S: 0 })).toMatchObject({ total: 80, level: '', zero: ['S'], passed: true });
    // a shorter module check: its own maximum, scaled to the part's points
    expect(englishStateResult({ W: 9, L: 10, R: 12, S: 16 }, { W: 9, L: 10, R: 12, S: 20 }).parts).toEqual({ W: 25, L: 25, R: 30, S: 16 });
    // the Estonian pass rule (60 %) is not used for it
    expect(harnoResult(EN_STATE_EXAM, {})).toBeNull();
  });
  it('has the marking scales: letter 3 × 0–3, report / essay 4 × 0–4, speaking 4 × 0–5', () => {
    expect(RUBRIC_SCALES.EW1.criteria.map((c) => c.max)).toEqual([3, 3, 3]);
    expect(rubricTotal(RUBRIC_SCALES.EW1.criteria)).toBe(9);
    expect(rubricTotal(RUBRIC_SCALES.EW2.criteria)).toBe(16);
    expect(RUBRIC_SCALES.ES.criteria.map((c) => c.name)).toEqual(['Task completion', 'Vocabulary', 'Grammar', 'Fluency and pronunciation']);
    expect(rubricTotal(RUBRIC_SCALES.ES.criteria)).toBe(20);
    expect([WRITING_GENRES.letter, WRITING_GENRES.report, WRITING_GENRES.essay]).toEqual(['Letter', 'Report', 'Essay']);
  });
});

describe('the international English exams (owner 2026-11-03)', () => {
  it('has IELTS Academic and General Training, TOEFL iBT and B2 First with the official numbers', () => {
    expect(ENGLISH_EXAMS).toEqual([EN_STATE_EXAM, IELTS_ACADEMIC, IELTS_GENERAL, TOEFL_IBT, B2_FIRST]);
    const ielts = ENGLISH_EXAM_FORMATS[IELTS_ACADEMIC];
    expect(ielts.parts.L).toMatchObject({ minutes: 30, tasks: 4, items: 40 });
    expect(ielts.parts.R).toMatchObject({ minutes: 60, tasks: 3, items: 40, words: [2150, 2750] });
    expect(ielts.parts.W).toMatchObject({ minutes: 60, tasks: 2, words: [150, 250], taskMinutes: [20, 40] });
    expect(ielts.parts.S).toMatchObject({ minutes: 14, from: 11, tasks: 3 });
    expect(ENGLISH_EXAM_FORMATS[IELTS_GENERAL].parts.R.words).toEqual([2150, 2375]);
    expect(ENGLISH_EXAM_FORMATS[IELTS_GENERAL].parts.L).toBe(ielts.parts.L);
    const toefl = ENGLISH_EXAM_FORMATS[TOEFL_IBT];
    expect(toefl.order).toEqual(['R', 'L', 'W', 'S']);
    expect(['R', 'L', 'W', 'S'].map((s) => [toefl.parts[s].minutes, toefl.parts[s].items])).toEqual([[30, 50], [29, 47], [23, 12], [8, 11]]);
    expect(toefl.scale).toMatchObject({ min: 1, max: 6, step: 0.5, b2: [4, 4.5] });
    const fce = ENGLISH_EXAM_FORMATS[B2_FIRST];
    expect(['R', 'W', 'L', 'S'].map((s) => fce.parts[s].minutes)).toEqual([75, 80, 40, 14]);
    expect([fce.parts.R.items, fce.parts.R.tasks, fce.parts.L.items, fce.parts.S.tasks]).toEqual([52, 7, 30, 4]);
    expect(fce.scale.b2).toEqual([160, 179]);
    for (const e of Object.values(ENGLISH_EXAM_FORMATS)) {
      expect(e.sources.length).toBeGreaterThan(0);
      expect(Object.keys(e.parts).sort()).toEqual(['L', 'R', 'S', 'W']);
    }
  });
  it('tells whether a score is B2 on each exam', () => {
    expect(reachesB2(B2_FIRST, 160)).toBe(true);
    expect(reachesB2(B2_FIRST, 159)).toBe(false);
    expect(reachesB2(TOEFL_IBT, 4)).toBe(true);
    expect(reachesB2(IELTS_ACADEMIC, 5)).toBe(false);
    expect(reachesB2('B2', 90)).toBeNull();
  });
  it('gives each part a header in English with the exam name, time and score scale', () => {
    expect(examFor(TOEFL_IBT).name).toBe('TOEFL iBT');
    expect(examPartDefaults(B2_FIRST, 'R')).toMatchObject({ part: 'Reading and Use of English', minutes: 75, points: 52, tasks: 7, items: 52 });
    expect(examPartHeading({ exam: IELTS_ACADEMIC, skill: 'L', part: 'Listening' })).toBe('IELTS Academic · Listening');
    expect(harnoPartLine(TOEFL_IBT, 'S', 0, 8)).toMatch(/^TOEFL iBT, Speaking: Listen and Repeat, Take an Interview.*1–6 in half bands/);
    expect(harnoPartLine(B2_FIRST, 'R', 52, 75)).toMatch(/160–179 = B2/);
  });
});

describe('English labels on English sheets', () => {
  const know = B.know('k1', 'Estonia has about 2,200 islands.', 'Statistics Estonia');
  const opener = B.topicOpener('o1', 'Who we are', ['Young people in Estonia speak several languages.'], 'Statistics Estonia, 2024', ['What do you think?', 'Where you live, is it the same?', 'What will change?']);
  it('swaps „Kas teadsid?”, „Allikas:” and „Mõtle kaasa” for English and leaves Estonian sheets as they are', () => {
    const [k, o] = withSheetLanguage([know, opener], 'en');
    expect(k.data.title).toBe('Did you know?');
    expect(k.data.text).toBe('Estonia has about 2,200 islands. *Source: Statistics Estonia.*');
    expect(o.data.text).toContain('*Source: Statistics Estonia, 2024*');
    expect(o.data.text).toContain('\n\nThink about it:\n\n1. What do you think?');
    expect(o.data.text).not.toMatch(/Allikas|Mõtle kaasa/);
    expect(withSheetLanguage([know, opener], undefined)).toEqual([know, opener]);
    expect(withSheetLanguage([know], 'et')[0]).toBe(know);
  });
  it('prints the state exam header, listening note, word target and rubric total in English', () => {
    const part = { ...B.examPart('p2', 'L', { exam: EN_STATE_EXAM, ...examPartDefaults(EN_STATE_EXAM, 'L') }) };
    const listen = B.examListen('l1', 'Podcast.', 'Complete the sentences with no more than two words.', 'choice', 'Host: Welcome.', [['What is the podcast about?', 'music', 'sport', 'food']], 'g_read', 1);
    const write = B.examWriting('w1', 'Write a letter.', 'Write about 120 words.', 'letter', { situation: 'You want to volunteer.', points: ['why', 'your experience'], words: [120, 120] });
    const rubric = { ...B.rubricSpeaking('rs'), data: { ...B.rubricSpeaking('rs').data, scale: 'ES', criteria: RUBRIC_SCALES.ES.criteria } };
    const blocks = withSheetLanguage([part, listen, write, rubric], 'en');
    const { container } = render(<Sheet doc={doc(blocks)} mode="print" />);
    const header = card(container, 'p2');
    expect(header.querySelector('h4').textContent).toBe('Part II · Listening');
    expect(header.querySelector('.ws-exampart-facts').textContent).toMatch(/40 minutes.*5 tasks.*40 questions.*25 points/);
    expect(header.querySelector('.ws-exampart-harno').textContent).toMatch(/^As in the English state exam: Part II Listening takes 40 minutes and gives 25 of the 100 points \(40 questions, 0.625 points each\)\. Task 1 is played only once, the others twice\. B2 = 75–100 % of the total, B1 = 50–74 %; no part may be 0 points\.$/);
    expect(header.textContent).toContain('Start: ______ End: ______');
    expect(card(container, 'l1').querySelector('.ws-listen-note').textContent).toBe('You will hear the recording only once.');
    expect(card(container, 'w1').querySelector('.ws-taskcard-kind').textContent).toBe('Letter · 120 words');
    expect(card(container, 'w1').textContent).toContain('Words: ______ (target 120 words)');
    expect(card(container, 'rs').querySelector('.ws-examrubric-total').textContent).toBe('Total: ___ / 20 points · target at least 16 (80 %)');
  });
  it('keeps the Estonian exam blocks Estonian', () => {
    const { container } = render(<Sheet doc={doc([B.examPart('p', 'L', { exam: 'B1' })])} mode="print" />);
    expect(card(container, 'p').querySelector('h4').textContent).toBe('Kuulamine');
    expect(card(container, 'p').textContent).toContain('Algus: ______ Lõpp: ______');
  });
});
