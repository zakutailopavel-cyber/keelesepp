import { B } from './blocks.js';
import { LISTENING_VOICES, hasListeningVoice } from './listeningAudio.js';
import { COURSES, buildCourseSheet, moduleSheets } from './courseSheet.js';
import { castNames, isLetterTask, isPhoneTask, moduleAcademicProblems, moduleRound2Problems, opinionQuestions, statSentences, thinkType } from './academicValue.js';
import { harnoFor } from '../../../worksheet-studio/didactics/levels.js';
import { didacticCheck } from '../../../worksheet-studio/didactics/didacticCheck.js';
import { PROFILES, canDoSkills, finalShapeProblems } from '../../../worksheet-studio/didactics/finalShape.js';
import { examPartOf, harnoFamilyEN, isHarnoFormat, defaultTaskId, HARNO_FORMATS_EN } from '../../../worksheet-studio/didactics/taskCatalogue.js';

// English B2 (course enb2, docs/COURSE_FINAL_SHAPE_EN_B2.md §9) before its module 1: a small hand-made module shows what the
// engine does with an English B2 sheet — badge, exam header, English labels, level norms and the gates' English wording.
const MOD = {
  MODULE: { id: 'en-b2-module-01', course: 'enb2', title: 'Who we are', level: 'English B1+', language: 'en', design: 'v2', template: 'v4' },
  LESSONS: {
    'en-b2-001': {
      title: 'Generations', canDo: 'I can talk about how generations differ.',
      discover: [
        B.topicOpener('en_b2_001_d_open', 'Who we are', ['Estonia has about 1.37 million people.'], 'Statistics Estonia, 2025', ['What do you think?', 'Where you live, is it the same?', 'What will change in ten years?']),
        B.know('en_b2_001_d_know', 'Most young people in Estonia speak at least two foreign languages.', 'Eurostat, 2023'),
      ],
      transfer: [B.examPart('en_b2_001_t_part', 'W', { note: 'Write the letter.' })],
    },
  },
};

describe('English B2 course sheets', () => {
  const sheets = moduleSheets(MOD)['en-b2-001'];
  it('prints the fixed badge with the module number and keeps the stage as the sheet level', () => {
    expect(COURSES.enb2.badge).toBe('KeeleSepp · English B2');
    expect(sheets.discover.meta).toMatchObject({ badge: 'KeeleSepp · English B2 · moodul 1', level: 'English B1+', language: 'en' });
  });
  it('gives the opener and the fact box English labels', () => {
    const [opener, know] = sheets.discover.blocks.filter((b) => b.data?.opener || b.data?.know);
    expect(opener.data.text).toMatch(/\*Source: Statistics Estonia, 2025\*\n\nThink about it:/);
    expect(know.data).toMatchObject({ title: 'Did you know?', text: 'Most young people in Estonia speak at least two foreign languages. *Source: Eurostat, 2023.*' });
  });
  it('marks every exam part with the English state exam and its own part defaults', () => {
    const part = buildCourseSheet(MOD, 'en-b2-001', 'transfer').blocks.find((b) => b.type === 'exampart');
    expect(part.data).toMatchObject({ exam: 'EN-RE', part: 'Writing', minutes: 90, points: 25, tasks: 2, note: 'Write the letter.', lang: 'en' });
  });
});

describe('level norms of English B2 (harnoFor)', () => {
  it('returns the English state exam profile for the English stages, not the Estonian B2 exam', () => {
    for (const level of ['English B2', 'English B2-', 'English B1+']) expect(harnoFor(level)).toMatchObject({ level: 'English state exam', writing: [[120, 120], [200, 200]], monologue: 105, options: 3 });
    expect(harnoFor('B2', 'en').level).toBe('English state exam');
    expect(harnoFor('B2')).toMatchObject({ level: 'B2', monologue: 60, options: 4 });
    expect(harnoFor('English B1').level).toBe('B1');
  });
  it('asks for 3 options in a choice task on an English B2 sheet, 4 on an Estonian B2 sheet', () => {
    const choice = { id: 'c', type: 'choice', data: { questions: [{ q: 'She ___ there.', options: '*lives\nlive\nliving' }] } };
    const fourOn = (meta) => didacticCheck({ meta: { level: 'B2', ...meta }, blocks: [choice] }).checks.find((c) => c.code === 'choice-four-c');
    expect(fourOn({}).ok).toBe(false);
    expect(fourOn({ level: 'English B2', language: 'en' }).ok).toBe(true);
  });
});

describe('academic-value gates in English', () => {
  it('knows the English cast and English cues', () => {
    expect(castNames("Kaisa's brother met Markus and Ellie.", 'en')).toEqual(['Kaisa', 'Markus', 'Ellie']);
    expect(castNames('Kaisa and Markus', 'et')).toEqual(['Markus']);
    expect(opinionQuestions({ type: 'speaking', data: { questions: 'Do you agree with the writer?\nWhat did Kaisa say?' } }, 'en')).toEqual(['Do you agree with the writer?']);
    expect(statSentences('According to a survey, 40 per cent of pupils read daily. You get 20 points.', 'en')).toEqual(['According to a survey, 40 per cent of pupils read daily.']);
    expect(thinkType('Is it the same where you live?', 'en')).toBe('home');
    expect(thinkType('What will change in the future?', 'en')).toBe('prediction');
    expect(isPhoneTask({ type: 'speaking', data: { instruction: 'Call the hotel.' } }, 'en')).toBe(true);
    expect(isLetterTask({ type: 'writing', data: { instruction: 'Write an e-mail to the school.' } }, 'en')).toBe(true);
  });
  it('checks an English module with English wording and leaves the Estonian rules alone', () => {
    const sheets = moduleSheets(MOD);
    const r1 = moduleAcademicProblems(sheets, { profile: 'enb2' });
    // the opener's source line and its home question are found in English; it is short (B1+: 250–350 words)
    const opener = r1.find((p) => p.code === 'av-opener');
    expect(opener.text).toMatch(/sõna \(ENB2: 250–350\)/);
    expect(opener.text).not.toMatch(/allikarida|ükski küsimus/);
    expect(r1.some((p) => p.code === 'av-know')).toBe(false);
    const home = { ...MOD, LESSONS: { 'en-b2-001': { ...MOD.LESSONS['en-b2-001'], practice: [B.speaking('s', 'Talk.', 'Compare your home country with Estonia. What is your home country famous for? Would you live in your home country again?', [], [60, 120])] } } };
    expect(moduleRound2Problems(moduleSheets(home)).find((p) => p.code === 'av-homecountry').text).toMatch(/„your home country” 3 korda/);
  });
});

describe('final shape of English B2 (profile enb2)', () => {
  it('has a format id for every state-exam task, families and parts', () => {
    expect(Object.keys(HARNO_FORMATS_EN)).toHaveLength(17);
    expect(isHarnoFormat('ER5a')).toBe(true);
    expect([examPartOf('EL1'), examPartOf('ES2'), examPartOf('R1')]).toEqual(['L', 'S', 'R']);
    expect([harnoFamilyEN('EW2r'), harnoFamilyEN('EW2e'), harnoFamilyEN('ER5a')]).toEqual(['EW2', 'EW2', 'ER5a']);
    expect(defaultTaskId({ type: 'examwriting', data: { genre: 'report' } })).toBe('W15');
    const { intro, practice, family } = PROFILES.enb2;
    expect(Object.keys(intro).sort()).toEqual(Object.keys(HARNO_FORMATS_EN).sort());
    expect(Math.max(...Object.values(intro))).toBe(6);
    expect(new Set(Object.keys(intro).map(family))).toEqual(new Set(Object.keys(practice)));
    expect(PROFILES.enb2.shape.mocks).toEqual([30, 50]);
  });
  it('reads English can-dos, skips the EKI word lists and wants the mocks 030 and 050 complete', () => {
    expect(canDoSkills('I can write a letter of application.', 'en')).toEqual(['W']);
    expect(canDoSkills('I can talk about my plans.', 'en')).toEqual(['S']);
    const lesson = (num, more = {}) => ({
      id: `en-b2-${String(num).padStart(3, '0')}`, num, module: Math.ceil(num / 5), moduleId: `en-b2-module-${String(Math.ceil(num / 5)).padStart(2, '0')}`, canDo: 'I can write a report.', goals: { g_use: 'use' }, canDoGoal: 'g_use',
      sheets: { transfer: { meta: { level: 'English B2', language: 'en' }, blocks: [{ id: `w${num}`, type: 'writing', goal: 'g_use', data: {}, tag: { task: 'W15', harno: 'EW2r' } }, { id: `v${num}`, type: 'vocab', data: { words: 'outcome — tulemus' } }] } },
      ...more,
    });
    const problems = finalShapeProblems([lesson(7), lesson(30, { assessment: true, archetype: 'PROOV' })], { profile: 'enb2' });
    expect(problems.filter((p) => p.rule === 'V14')).toEqual([]);
    expect(problems.filter((p) => p.check === 'V9-cando-verb')).toEqual([]);
    expect(problems.find((p) => p.check === 'V6-mock').text).toMatch(/Kuulamine, Lugemine, Rääkimine/);
    expect(problems.find((p) => p.check === 'V6-timing').text).toMatch(/Kirjutamine/);
    expect(problems.find((p) => p.check === 'V6-total-EW2').text).toMatch(/^EW2: harjutatud 2 korda \(vähemalt 6\)/);
  });
});

describe('English listening audio (owner 2026-11-03: no TTS yet)', () => {
  it('has a voice for Estonian only; English texts are read by the teacher', () => {
    expect(hasListeningVoice('et')).toBe(true);
    expect(hasListeningVoice('en')).toBe(false);
    expect(LISTENING_VOICES.en).toBeNull();
  });
});
