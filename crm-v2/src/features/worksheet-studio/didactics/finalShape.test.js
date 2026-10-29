import { describe, expect, it } from 'vitest';
import { canDoSkills, editDistance, finalShapeProblems, mainTask, normInstruction, strandOf } from './finalShape.js';
import { defaultTaskId, taskIdOf, taskLevelOf, TASK_CATALOGUE } from './taskCatalogue.js';

// Small hand-made lessons for each rule of docs/COURSE_FINAL_SHAPE_B1.md §8. A block is { id, type, goal, data, tag };
// `t(id, task, more)` makes a task of that catalogue id (the block type does not matter once the tag is there).
const TYPE = { R: 'reading', L: 'listening', W: 'writing', S: 'speaking', G: 'gaps' };
const t = (id, task, { goal = 'g_use', data = {}, ...tag } = {}) => ({ id, type: TYPE[task[0]], goal, data: { ...data }, tag: { task, ...tag } });
const sheet = (blocks, meta = {}) => ({ meta: { level: 'B1', design: 'v2', template: 'v4', ...meta }, blocks });
const review = (from = []) => ({ id: 'rev', type: 'tip', data: { title: 'Mäletad?', text: from.map((_, i) => `Küsimus ${i}`).join('\n'), review: true, from } });
const GOALS = { g_vocab: 'sõnad', g_read: 'loeb', g_notice: 'vorm', g_use: 'kasutab' };
let counter = 0;
const lesson = (num, { module = Math.ceil(num / 5), assessment = false, archetype = '', lead = null, canDo = 'Ma räägin oma päevast.', d = [], p = [], tr = [] } = {}) => ({
  id: `a2b1-${String(num).padStart(3, '0')}`, num, module, moduleId: `a2b1-module-${String(module).padStart(2, '0')}`, assessment, archetype, lead, canDo, goals: GOALS, canDoGoal: 'g_use',
  sheets: { discover: sheet(d.length ? d : [t(`d${counter += 1}`, 'R02', { goal: 'g_read' })], { assessment }), practice: sheet(p.length ? p : [t(`p${counter += 1}`, 'G03', { goal: 'g_notice' })], { assessment }), transfer: sheet(tr.length ? tr : [t(`t${counter += 1}`, 'S03')], { assessment }) },
});
const checks = (problems, prefix) => problems.filter((x) => x.check.startsWith(prefix));

describe('task catalogue', () => {
  it('has the 63 types of §3 and the 8 B2 types with a skill, a level 1–4 and per-module bounds', () => {
    expect(Object.keys(TASK_CATALOGUE)).toHaveLength(71);
    Object.entries(TASK_CATALOGUE).forEach(([id, x]) => {
      expect('RLWSG').toContain(id[0]);
      expect([1, 2, 3, 4]).toContain(x.level);
    });
    expect(TASK_CATALOGUE.S03).toMatchObject({ level: 4, min: 1, max: 2, exam: ['S1b'] });
  });
  it('gives a block its tag, else the default of its type and data', () => {
    expect(defaultTaskId({ type: 'reading' })).toBe('R02');
    expect(defaultTaskId({ type: 'examlisten', data: { mode: 'truefalse' } })).toBe('L05');
    expect(defaultTaskId({ type: 'speakcard', data: { mode: 'phone' } })).toBe('S04');
    expect(defaultTaskId({ type: 'guidedletter', data: { maxWords: 60 } })).toBe('W02');
    expect(defaultTaskId({ type: 'tip', data: { review: true } })).toBe('G12');
    expect(taskIdOf({ type: 'reading', tag: { task: 'R13' } })).toBe('R13');
    expect(taskLevelOf({ type: 'reading' })).toBe(2);
    expect(taskLevelOf({ type: 'reading', tag: { level: 3 } })).toBe(3);
  });
});

describe('helpers', () => {
  it('edit distance and instruction normalising', () => {
    expect(editDistance(['a', 'b', 'c'], ['a', 'c'])).toBe(1);
    expect(normInstruction('Kuula 2 korda ja kirjuta „Tere”-sõna (näide).')).toBe('kuula korda ja kirjuta sõna');
  });
  it('reads the skill of a can-do and the strand of a task', () => {
    expect(canDoSkills('Ma lepin sõbraga kokku, kuhu minna, ja kirjutan kutse.')).toEqual(['S', 'W']);
    expect(canDoSkills('Ma moodustan lihtmineviku vorme.')).toEqual([]);
    expect(strandOf(t('x', 'S02'))).toBe('output');
    expect(strandOf(t('x', 'S02', { fluency: true }))).toBe('fluency');
    expect(strandOf(t('x', 'L08'))).toBe('language');
  });
  it('finds the main Kasuta task: the tag, else the last speaking / writing task', () => {
    const l = lesson(6, { tr: [t('a', 'S03'), t('b', 'W02'), t('c', 'R02')] });
    expect(mainTask(l).id).toBe('b');
    l.sheets.transfer.blocks[0].tag.main = true;
    expect(mainTask(l).id).toBe('a');
  });
});

describe('V1, V2: consecutive lessons', () => {
  it('flags the same sequence in a phase, a near-identical lesson and the same opening', () => {
    const same = () => ({ d: [t(`a${counter += 1}`, 'R02', { goal: 'g_read' }), t(`b${counter += 1}`, 'G01')], p: [t(`c${counter += 1}`, 'G03')], tr: [t(`e${counter += 1}`, 'S03')] });
    const problems = finalShapeProblems([lesson(6, same()), lesson(7, same())]);
    expect(checks(problems, 'V1-phase').map((x) => x.phase)).toEqual(['discover', 'practice', 'transfer']);
    expect(checks(problems, 'V1-lesson')).toHaveLength(1);
    expect(checks(problems, 'V2')).toHaveLength(3);
    expect(checks(problems, 'V1-phase')[0].lessonId).toBe('a2b1-007');
  });
  it('passes different lessons', () => {
    const a = lesson(6, { d: [t('a1', 'R02'), t('a2', 'G02')], p: [t('a3', 'G03'), t('a4', 'W09')], tr: [t('a5', 'S03')] });
    const b = lesson(7, { d: [t('b1', 'L02'), t('b2', 'G04')], p: [t('b3', 'G13'), t('b4', 'S11')], tr: [t('b5', 'W04')] });
    expect(checks(finalShapeProblems([a, b]), 'V1-')).toEqual([]);
    expect(checks(finalShapeProblems([a, b]), 'V2')).toEqual([]);
  });
});

describe('V3, V4: a module is varied and nothing dominates', () => {
  it('flags a module of few types and a dominating id', () => {
    const lessons = [6, 7, 8, 9].map((n) => lesson(n, { d: [t(`d${n}`, 'R02'), t(`e${n}`, 'R02')], p: [t(`p${n}`, 'G03')], tr: [t(`t${n}`, 'S02')] }));
    const problems = finalShapeProblems(lessons);
    expect(checks(problems, 'V3-distinct')).toHaveLength(1);
    expect(checks(problems, 'V3-skill-L')).toHaveLength(1);
    expect(checks(problems, 'V4-id-R02')).toHaveLength(1);
    expect(checks(problems, 'V4-max-R02')).toHaveLength(1);
    expect(checks(problems, 'V3-min-S04')).toHaveLength(1);
    expect(problems.find((x) => x.check === 'V3-distinct').lessonId).toBe('*');
  });
  it('passes a module that uses ≥ 20 ids with ≥ 3 per skill and ≥ 4 language ids', () => {
    const sets = [
      ['R01', 'L01', 'G01', 'G02', 'W02', 'S02'], ['R03', 'L02', 'G03', 'G04', 'W04', 'S03'],
      ['R05', 'L03', 'G01', 'G08', 'W05', 'S04'], ['R08', 'L05', 'G09', 'G13', 'W11', 'S11'],
    ];
    const lessons = sets.map((ids, k) => lesson(26 + k, { d: ids.slice(0, 2).map((id) => t(`${id}-${k}`, id)), p: ids.slice(2, 4).map((id) => t(`${id}-${k}`, id)), tr: ids.slice(4).map((id) => t(`${id}-${k}`, id)) }));
    const problems = finalShapeProblems(lessons);
    expect(checks(problems, 'V3')).toEqual([]);
    expect(checks(problems, 'V4-id')).toEqual([]);
  });
});

describe('V5: archetype rotation', () => {
  it('flags a missing shape, a repeat, a wrong lead and a module without the four input → output pairs', () => {
    const shaped = (n, archetype, input, output) => lesson(n, { archetype, lead: { input, output } });
    const lessons = [shaped(6, 'LUGU', 'R', 'W'), shaped(7, 'LUGU', 'R', 'W'), shaped(8, 'KUUL', 'R', 'S'), lesson(9)];
    const problems = finalShapeProblems(lessons);
    expect(checks(problems, 'V5-missing').map((x) => x.lessonId)).toEqual(['a2b1-009']);
    expect(checks(problems, 'V5-repeat').map((x) => x.lessonId)).toEqual(['a2b1-007']);
    expect(checks(problems, 'V5-lead').map((x) => x.lessonId)).toEqual(['a2b1-008']);
    expect(checks(problems, 'V5-course-PROJ')).toHaveLength(1);
  });
  it('passes a module with four archetypes and the four pairs, and flags the same opener in the next module', () => {
    const plan = [['LUGU', 'R', 'W'], ['KUUL', 'L', 'S'], ['AVAS', 'R', 'S'], ['PROJ', 'L', 'W']];
    const mod = (m) => plan.map(([a, i, o], k) => lesson((m - 1) * 5 + k + 1, { module: m, archetype: a, lead: { input: i, output: o } }));
    const problems = finalShapeProblems([...mod(2), ...mod(3)]);
    expect(checks(problems, 'V5-module')).toEqual([]);
    expect(checks(problems, 'V5-pairs')).toEqual([]);
    expect(checks(problems, 'V5-opener')).toHaveLength(1);
  });
});

describe('V6: Harno format coverage and exam timing', () => {
  it('counts the formats from the harno tags and asks for part timing in exam lessons from module 9', () => {
    const exam = lesson(45, { assessment: true, archetype: 'EKS', d: [t('r1', 'R01', { harno: 'R1' })], p: [t('l1', 'L02', { harno: 'L2' })], tr: [t('w1', 'W02', { harno: 'W1b' })] });
    let problems = finalShapeProblems([exam]);
    expect(checks(problems, 'V6-total-R1')[0].text).toContain('1 korda');
    expect(checks(problems, 'V6-variant-R3a')).toHaveLength(1);
    expect(checks(problems, 'V6-timing')[0].text).toContain('Lugemine');
    const part = (skill) => ({ id: `part-${skill}`, type: 'exampart', data: { skill, minutes: 30 } });
    exam.sheets.discover.blocks.unshift(part('R'));
    exam.sheets.practice.blocks.unshift(part('L'));
    exam.sheets.transfer.blocks.unshift(part('W'));
    problems = finalShapeProblems([exam]);
    expect(checks(problems, 'V6-timing')).toEqual([]);
  });
  it('flags a gap between two practices and a mock without all parts', () => {
    const corner = (num, harno) => lesson(num, { d: [t(`c${num}`, 'R01', { harno })] });
    const mock = lesson(60, { assessment: true, d: [t('m1', 'R01', { harno: 'R1' })] });
    const problems = finalShapeProblems([corner(26, 'R1'), corner(56, 'R1'), mock]);
    expect(checks(problems, 'V6-gap-R1')[0].text).toContain('6 moodulit');
    expect(checks(problems, 'V6-mock')[0].text).toContain('Kuulamine');
  });
});

describe('V7, V8: no repeated instruction or item', () => {
  it('flags an instruction used in two lessons, but not the fixed wording of one exam format', () => {
    const a = lesson(6, { d: [t('a', 'R02', { data: { instruction: 'Loe teksti ja vasta 5 küsimusele.' } })] });
    const b = lesson(7, { d: [t('b', 'R02', { data: { instruction: 'Loe teksti ja vasta 6 küsimusele.' } })] });
    expect(checks(finalShapeProblems([a, b]), 'V7').map((x) => x.lessonId)).toEqual(['a2b1-007']);
    const e1 = lesson(45, { assessment: true, d: [t('x', 'R01', { harno: 'R1', data: { instruction: 'Leia igale olukorrale kuulutus.' } })] });
    const e2 = lesson(50, { assessment: true, d: [t('y', 'R01', { harno: 'R1', data: { instruction: 'Leia igale olukorrale kuulutus.' } })] });
    expect(checks(finalShapeProblems([e1, e2]), 'V7')).toEqual([]);
  });
  it('flags the same item sentence in two lessons, not inside a review', () => {
    const q = { questions: [{ q: 'Mida Anna eile poest ostis?', options: '*leiba\npiima\nmune' }] };
    const a = lesson(6, { p: [{ id: 'a', type: 'choice', goal: 'g_read', data: { instruction: 'A.', ...q } }] });
    const b = lesson(7, { p: [{ id: 'b', type: 'choice', goal: 'g_read', data: { instruction: 'B.', ...q } }] });
    expect(checks(finalShapeProblems([a, b]), 'V8')).toHaveLength(1);
  });
});

describe('V9, V10: the tasks lead to the can-do', () => {
  it('flags a can-do without a skill verb, a main task of the wrong skill and a thin goal', () => {
    const l = lesson(6, { canDo: 'Ma moodustan lihtmineviku vorme.', tr: [t('a', 'W02')] });
    let problems = finalShapeProblems([l]);
    expect(checks(problems, 'V9-cando-verb')).toHaveLength(1);
    expect(checks(problems, 'V9-thin-g_vocab')).toHaveLength(1);
    l.canDo = 'Ma räägin sõbrale oma päevast.';
    problems = finalShapeProblems([l]);
    expect(checks(problems, 'V9-cando-skill')[0].text).toContain('W');
  });
  it('checks the Harjuta ladder, low levels in Kasuta and the level-4 main task', () => {
    const l = lesson(6, { d: [t('n', 'G01'), t('u', 'S02')], p: [t('a', 'S11'), t('b', 'G03')], tr: [t('c', 'R02', { goal: 'g_read' }), t('e', 'S02')] });
    const problems = finalShapeProblems([l]);
    expect(checks(problems, 'V10-ladder')[0].text).toContain('3-2');
    expect(checks(problems, 'V10-kasuta')[0].text).toContain('c R02');
    expect(checks(problems, 'V10-main-level')[0].text).toContain('S02');
    expect(checks(problems, 'V10-avasta')).toEqual([]);
  });
});

describe('V11, V12: strands, exam corner, washback', () => {
  it('asks for fluency time and exactly one exam corner from module 6', () => {
    const l = lesson(26, { d: [t('a', 'R02', { goal: 'g_read' })], p: [t('b', 'G03')], tr: [t('c', 'S03')] });
    const problems = finalShapeProblems([l]);
    expect(checks(problems, 'V11-fluency')).toHaveLength(1);
    expect(checks(problems, 'V12-corner')[0].text).toContain('eksaminurki 0');
  });
  it('flags the same corner format twice in a row and too much exam time', () => {
    const big = { passage: 'sõna '.repeat(900), questions: [] };
    const a = lesson(26, { d: [t('a', 'R01', { harno: 'R1' })] });
    const b = lesson(27, { d: [{ id: 'b', type: 'reading', goal: 'g_read', data: { instruction: 'Loe.', ...big }, tag: { task: 'R02', harno: 'R2' } }] });
    const c = lesson(28, { d: [t('c', 'R01', { harno: 'R1' })] });
    const problems = finalShapeProblems([a, b, c]);
    expect(checks(problems, 'V12-corner-repeat')).toEqual([]);
    expect(checks(problems, 'V12-washback').map((x) => x.lessonId)).toContain('a2b1-027');
    const again = finalShapeProblems([a, c]);
    expect(checks(again, 'V12-corner-repeat')).toHaveLength(1);
  });
});

describe('V13: spaced retrieval', () => {
  it('asks for a review that names the previous lesson and a module 2–4 back', () => {
    const early = lesson(6);
    const prev = lesson(20);
    const now = lesson(21, { d: [review(['a2b1-020']), t('x', 'R02')] });
    let problems = finalShapeProblems([early, prev, now]);
    expect(checks(problems, 'V13-previous').map((x) => x.lessonId)).not.toContain('a2b1-021');
    expect(checks(problems, 'V13-spaced').map((x) => x.lessonId)).toContain('a2b1-021');
    now.sheets.discover.blocks[0].data.from = ['a2b1-020', 'a2b1-006'];
    problems = finalShapeProblems([early, prev, now]);
    expect(checks(problems, 'V13-spaced').map((x) => x.lessonId)).not.toContain('a2b1-021');
    expect(checks(problems, 'V13-review').map((x) => x.lessonId)).toContain('a2b1-020');
  });
});

describe('V14: vocabulary level', () => {
  it('counts a word as known when it is in the level list or an earlier module, and asks to mark the rest', () => {
    const vocab = (id, words, topic) => ({ id, type: 'vocab', goal: 'g_vocab', data: { words: words.join(', ') }, ...(topic ? { tag: { topic } } : {}) });
    const forms = new Set(['eile', 'töötama']);
    const m1 = lesson(6, { d: [vocab('v1', ['eile — вчера', 'kontor — офис']), t('x', 'R02')] });
    const m2 = lesson(11, { d: [vocab('v2', ['kontor — офис', 'töötama — работать', 'raamatupidaja — бухгалтер']), t('y', 'R02')] });
    let problems = finalShapeProblems([m1, m2], { forms });
    expect(checks(problems, 'V14-topic').map((x) => x.moduleId)).toEqual(['a2b1-module-02', 'a2b1-module-03']);
    m2.sheets.discover.blocks[0].tag = { topic: ['raamatupidaja'] };
    problems = finalShapeProblems([m1, m2], { forms });
    expect(checks(problems, 'V14-topic').map((x) => x.moduleId)).toEqual(['a2b1-module-02']);
    expect(checks(problems, 'V14-known').map((x) => x.moduleId)).toEqual(['a2b1-module-02', 'a2b1-module-03']);
  });
});

describe('V15: caps', () => {
  it('caps error correction a module and allows no language drill in Kasuta', () => {
    const fix = (id) => ({ id, type: 'errorfix', goal: 'g_notice', data: { instruction: `Paranda ${id}.`, rows: [] } });
    const lessons = [6, 7, 8].map((n) => lesson(n, { p: [fix(`f${n}`)], tr: n === 8 ? [t('g', 'G03'), t('s', 'S03')] : [] }));
    const problems = finalShapeProblems(lessons);
    expect(checks(problems, 'V15-errorfix')).toHaveLength(1);
    expect(checks(problems, 'V15-kasuta').map((x) => x.lessonId)).toEqual(['a2b1-008']);
  });
});

describe('the B2 profile (COURSE_FINAL_SHAPE_B2.md)', () => {
  const b2 = (num, more = {}) => ({ ...lesson(num, more), moduleId: `b1b2-module-${String(more.module || Math.ceil(num / 5)).padStart(2, '0')}` });
  it('asks for the B2 speaking types instead of the B1 ones', () => {
    const list = [6, 7, 8, 9].map((n) => b2(n));
    expect(checks(finalShapeProblems(list), 'V3-min-S04')).toHaveLength(1);
    const problems = finalShapeProblems(list, { profile: 'b2' });
    expect(checks(problems, 'V3-min-S04')).toHaveLength(0);
    expect(checks(problems, 'V3-min-S16')).toHaveLength(1);
    expect(checks(problems, 'V3-min-S17')).toHaveLength(1);
  });
  it('counts the B2 formats and their families (W2a / W2b → W2, R2a / R2b → R2)', () => {
    const list = [b2(6, { tr: [t('w', 'W14', { harno: 'W2b' })] })];
    const problems = finalShapeProblems(list, { profile: 'b2' });
    expect(problems.find((x) => x.check === 'V6-total-W2').text).toMatch(/^W2: harjutatud 1 korda/);
    expect(checks(problems, 'V6-variant-W2b')[0].text).toMatch(/1 korda/);
    expect(checks(problems, 'V6-total-S1b')).toHaveLength(0);
  });
  it('wants an exam corner from module 2 and allows tingiv kõneviis from the start', () => {
    const say = { id: 's', type: 'speaking', goal: 'g_use', data: { instruction: 'Mida sa teeksid?' }, tag: { task: 'S14' } };
    const list = [b2(6, { module: 2, tr: [say] })];
    expect(checks(finalShapeProblems(list, { profile: 'b2' }), 'V12-corner')).toHaveLength(1);
    expect(checks(finalShapeProblems(list, { profile: 'b2' }), 'V16-conditional')).toHaveLength(0);
    expect(checks(finalShapeProblems(list), 'V12-corner')).toHaveLength(0);
    expect(checks(finalShapeProblems(list), 'V16-conditional')).toHaveLength(1);
  });
  it('refuses an unknown profile', () => {
    expect(() => finalShapeProblems([], { profile: 'c1' })).toThrow(/profiil/);
  });
});

describe('the A2 profile (COURSE_FINAL_SHAPE_A2.md)', () => {
  const a2 = (num, more = {}) => ({ ...lesson(num, more), moduleId: `a2-module-${String(more.module || Math.ceil(num / 5)).padStart(2, '0')}` });
  it('asks for the A2 speaking types (picture S06, idea card S05) and forbids tingiv kõneviis in speaking', () => {
    const say = { id: 's', type: 'speaking', goal: 'g_use', data: { instruction: 'Mida sa teeksid?' }, tag: { task: 'S02' } };
    const list = [6, 7, 8, 9].map((n) => a2(n, { module: 2, tr: n === 6 ? [say] : [] }));
    const problems = finalShapeProblems(list, { profile: 'a2' });
    expect(checks(problems, 'V3-min-S06')).toHaveLength(1);
    expect(checks(problems, 'V3-min-S05')).toHaveLength(1);
    expect(checks(problems, 'V3-min-S04')).toHaveLength(0);
    expect(checks(problems, 'V16-conditional')).toHaveLength(1);
  });
  it('counts the A2 formats (R5 the letter cloze, W2a / W2b → W2)', () => {
    const problems = finalShapeProblems([a2(6, { tr: [t('w', 'W05', { harno: 'W2b' })] })], { profile: 'a2' });
    expect(problems.find((x) => x.check === 'V6-total-W2').text).toMatch(/^W2: harjutatud 1 korda/);
    expect(problems.some((x) => x.check === 'V6-total-R5')).toBe(true);
  });
});
