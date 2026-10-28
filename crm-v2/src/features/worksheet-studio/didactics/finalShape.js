// The final-shape gates of the B1 course (docs/COURSE_FINAL_SHAPE_B1.md §8, rules V1–V16). Pure and node-importable:
// the course test (admin/course/finalShape.test.js), the summary tool (tools/course-audit/final-shape.mjs) and the unit
// tests (finalShape.test.js) call the same functions.
//
// Input: the course's lessons in order, each { id, num, module, moduleId, assessment, archetype, lead, canDo, goals,
// canDoGoal, sheets: { discover, practice, transfer } } — `lessonsFromModules` builds them from the module files and their
// built sheets. Output: problems [{ rule, check, moduleId, lessonId, phase, text }]; `moduleId` 'course' for a rule of the
// whole course. The tags (block.tag: task, harno, level, fluency, main, topic) come from admin/course/blocks.js tag().
import { blockMinutes } from './timeEstimate.js';
import { isInLesson } from '../engine/inLesson.js';
import {
  ARCHETYPES, FORMAT_INTRO, FORMAT_PRACTICE, LEAD_PAIRS, TASK_CATALOGUE, TEACHING_ARCHETYPES, VARIANT_MIN, VARIANTS,
  harnoFamily, harnoOf, isFinalShapeTask, isReview, skillOf, taskIdOf, taskLevelOf,
} from './taskCatalogue.js';

export const PHASES = ['discover', 'practice', 'transfer'];
const PH = { discover: 'Avasta', practice: 'Harjuta', transfer: 'Kasuta' };
// the numbers of §4–§8 in one place, so the doc and the code can be compared
export const FINAL_SHAPE = Object.freeze({
  v1Distance: 0.4,
  v3: { distinct: 20, perSkill: 3, language: 4 },
  v4: { idShare: 0.12, typeShare: 0.2 },
  v5: { maxPerArchetype: 12, minPerArchetype: 7, minProj: 3, relaxedModule: 18 },
  v11: { input: 0.2, output: 0.25, language: 0.4, fluency: 0.1 },
  v12: { fromModule: 6, washback: 0.25, cornerMinutes: [8, 12] },
  v16: { conditionalFrom: 13 },
  v13: { back: [2, 4] },
  v14: { known: 0.9 },
  v15: { errorfix: 2, translation: 1, dictation: 2 },
  lastPracticeLesson: 89,
  examTimingFromModule: 9,
  mocks: [60, 80, 89, 90],
});

// ---------- input ----------
const moduleNo = (mod) => Number(String(mod.MODULE.id).split('-').pop());
const lessonNum = (id) => Number(String(id).split('-').pop());
// modules → lessons in course order; `sheetsOf(mod)` = registry.js moduleSheets
export function lessonsFromModules(modules, sheetsOf) {
  return modules.flatMap((mod) => Object.entries(sheetsOf(mod)).map(([id, sheets]) => {
    const meta = Object.values(sheets)[0]?.meta || {};
    const source = mod.LESSONS[id] || {};
    return {
      id, num: lessonNum(id), module: moduleNo(mod), moduleId: mod.MODULE.id,
      assessment: Boolean(meta.assessment), archetype: meta.archetype || source.archetype || '', lead: meta.lead || source.lead || null,
      canDo: meta.canDo || source.canDo || '', goals: meta.goals || {}, canDoGoal: source.canDoGoal || 'g_use', level: meta.level, sheets,
    };
  })).sort((a, b) => a.num - b.num);
}

// ---------- helpers ----------
const blocksOf = (doc) => (doc?.blocks || []).filter((b) => !b.data?.artFor && !b.data?.artId);
export const tasksOf = (doc) => blocksOf(doc).filter(isFinalShapeTask);
const lessonTasks = (lesson) => PHASES.flatMap((p) => tasksOf(lesson.sheets[p]).map((b) => ({ b, phase: p })));
const ids = (doc) => tasksOf(doc).map(taskIdOf);
const minutesOf = (b, doc) => blockMinutes(b, doc?.meta?.level, doc?.meta?.design, doc?.meta?.template);
const teaching = (lessons) => lessons.filter((l) => !l.assessment);
const byModule = (lessons) => lessons.reduce((m, l) => { (m[l.module] ||= []).push(l); return m; }, {});
const pct = (x) => `${Math.round(x * 100)} %`;
const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
// keyed text → what the learner reads: [a|b] → a, {*a|b} → a, [[s]] → s, **x** → x
const plain = (s) => String(s || '')
  .replace(/\{([^}]*)\}/g, (_, x) => (x.split('|').find((o) => o.trim().startsWith('*')) || x.split('|')[0]).replace(/^\s*\*/, ''))
  .replace(/\[\[([^\]]*)\]\]/g, '$1').replace(/\[([^\]]*)\]/g, (_, x) => x.split('|')[0]).replace(/\*\*/g, '');
const words = (s) => String(s || '').toLocaleLowerCase('et').match(/[a-zäöüõšž]+(?:-[a-zäöüõšž]+)*/g) || [];
export function editDistance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cur = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length];
}

// ---------- V1, V2: consecutive lessons differ ----------
function sequenceProblems(lessons, out) {
  const list = teaching(lessons);
  for (let i = 1; i < list.length; i += 1) {
    const [a, b] = [list[i - 1], list[i]];
    for (const p of PHASES) {
      if (!a.sheets[p] || !b.sheets[p]) continue;
      const sa = ids(a.sheets[p]); const sb = ids(b.sheets[p]);
      if (sa.length && sa.join() === sb.join()) out.push({ rule: 'V1', check: 'V1-phase', lesson: b, phase: p, text: `${PH[p]}: sama ülesannete jada kui ${a.id} (${sb.join(' > ')})` });
      if (sa[0] && sa[0] === sb[0]) out.push({ rule: 'V2', check: 'V2', lesson: b, phase: p, text: `${PH[p]} algab samamoodi kui ${a.id} (${sb[0]} ${TASK_CATALOGUE[sb[0]]?.name || ''})` });
    }
    const wa = PHASES.flatMap((p) => ids(a.sheets[p])); const wb = PHASES.flatMap((p) => ids(b.sheets[p]));
    const d = editDistance(wa, wb) / Math.max(1, wa.length, wb.length);
    if (d < FINAL_SHAPE.v1Distance) out.push({ rule: 'V1', check: 'V1-lesson', lesson: b, phase: '*', text: `tund erineb eelmisest (${a.id}) ainult ${pct(d)} ulatuses (vähemalt ${pct(FINAL_SHAPE.v1Distance)})` });
  }
}

// ---------- V3, V4: variety inside a module ----------
function moduleVarietyProblems(lessons, out) {
  for (const [, list] of Object.entries(byModule(teaching(lessons)))) {
    const first = list[0];
    const tasks = list.flatMap((l) => lessonTasks(l).map((x) => x.b));
    const notices = list.flatMap((l) => PHASES.flatMap((p) => blocksOf(l.sheets[p]).filter((b) => b.type === 'notice')));
    const count = {};
    [...tasks.map(taskIdOf), ...notices.map(() => 'G01')].forEach((id) => { count[id] = (count[id] || 0) + 1; });
    const distinct = Object.keys(count);
    const at = { lesson: first, moduleOnly: true, phase: '*' };
    if (distinct.length < FINAL_SHAPE.v3.distinct) out.push({ rule: 'V3', check: 'V3-distinct', ...at, text: `moodulis ${distinct.length} erinevat ülesandetüüpi (vähemalt ${FINAL_SHAPE.v3.distinct})` });
    for (const skill of ['R', 'L', 'W', 'S']) {
      const n = distinct.filter((id) => skillOf(id) === skill).length;
      if (n < FINAL_SHAPE.v3.perSkill) out.push({ rule: 'V3', check: `V3-skill-${skill}`, ...at, text: `moodulis ${n} eri ${skill}-ülesannet (vähemalt ${FINAL_SHAPE.v3.perSkill})` });
    }
    const g = distinct.filter((id) => skillOf(id) === 'G').length;
    if (g < FINAL_SHAPE.v3.language) out.push({ rule: 'V3', check: 'V3-skill-G', ...at, text: `moodulis ${g} eri keeleülesannet (vähemalt ${FINAL_SHAPE.v3.language})` });
    Object.entries(TASK_CATALOGUE).forEach(([id, t]) => {
      if (t.min && (count[id] || 0) < t.min) out.push({ rule: 'V3', check: `V3-min-${id}`, ...at, text: `${id} ${t.name}: moodulis ${count[id] || 0} (vähemalt ${t.min})` });
      if (t.max !== null && (count[id] || 0) > t.max) out.push({ rule: 'V4', check: `V4-max-${id}`, ...at, text: `${id} ${t.name}: moodulis ${count[id]} (kuni ${t.max})` });
    });
    const total = tasks.length || 1;
    Object.entries(count).filter(([id]) => id !== 'G01').forEach(([id, n]) => {
      if (n / total > FINAL_SHAPE.v4.idShare) out.push({ rule: 'V4', check: `V4-id-${id}`, ...at, text: `${id} ${TASK_CATALOGUE[id]?.name || ''}: ${pct(n / total)} mooduli ülesannetest (kuni ${pct(FINAL_SHAPE.v4.idShare)})` });
    });
    const types = {};
    tasks.forEach((b) => { types[b.type] = (types[b.type] || 0) + 1; });
    Object.entries(types).forEach(([type, n]) => {
      if (n / total > FINAL_SHAPE.v4.typeShare) out.push({ rule: 'V4', check: `V4-type-${type}`, ...at, text: `plokitüüp ${type}: ${pct(n / total)} mooduli ülesannetest (kuni ${pct(FINAL_SHAPE.v4.typeShare)})` });
    });
  }
}

// ---------- V5: archetype rotation ----------
const pairOf = (l) => (l.lead ? `${l.lead.input}→${l.lead.output}` : '');
function archetypeProblems(lessons, out) {
  const list = teaching(lessons);
  list.forEach((l) => {
    if (!TEACHING_ARCHETYPES.includes(l.archetype)) { out.push({ rule: 'V5', check: 'V5-missing', lesson: l, phase: '*', text: 'tunni tüüp (archetype) ja juhtoskused (lead) puuduvad — shape() / withShapes()' }); return; }
    const a = ARCHETYPES[l.archetype];
    if (!l.lead || !a.input.includes(l.lead.input) || !a.output.includes(l.lead.output)) out.push({ rule: 'V5', check: 'V5-lead', lesson: l, phase: '*', text: `${l.archetype}: juhtoskused ${pairOf(l) || '—'} ei sobi (sisend ${a.input.join('/')}, väljund ${a.output.join('/')})` });
  });
  for (let i = 1; i < list.length; i += 1) {
    if (list[i].archetype && list[i].archetype === list[i - 1].archetype) out.push({ rule: 'V5', check: 'V5-repeat', lesson: list[i], phase: '*', text: `sama tunni tüüp kui ${list[i - 1].id} (${list[i].archetype})` });
  }
  const modules = byModule(list);
  const numbers = Object.keys(modules).map(Number).sort((a, b) => a - b);
  numbers.forEach((m, k) => {
    const mods = modules[m];
    const at = { lesson: mods[0], moduleOnly: true, phase: '*' };
    const shaped = mods.filter((l) => l.archetype);
    if (shaped.length < mods.length) return; // V5-missing says it
    if (new Set(shaped.map((l) => l.archetype)).size < mods.length) out.push({ rule: 'V5', check: 'V5-module', ...at, text: `mooduli ${mods.length} tunnil on ${new Set(shaped.map((l) => l.archetype)).size} eri tüüpi (iga tund eri tüüpi)` });
    const pairs = new Set(shaped.map(pairOf).filter(Boolean));
    const need = m === FINAL_SHAPE.v5.relaxedModule ? Math.min(3, mods.length) : Math.min(4, mods.length);
    if (LEAD_PAIRS.filter((x) => pairs.has(x)).length < need) out.push({ rule: 'V5', check: 'V5-pairs', ...at, text: `moodulis on juhtoskuste paarid ${[...pairs].join(', ') || '—'}; vaja ${need} eri paari neljast (L→S, L→W, R→S, R→W)` });
    const prev = modules[numbers[k - 1]];
    if (k > 0 && prev?.[0]?.archetype && prev[0].archetype === mods[0].archetype && numbers[k - 1] === m - 1) out.push({ rule: 'V5', check: 'V5-opener', ...at, text: `mooduli 1. tund on sama tüüpi kui eelmise mooduli 1. tund (${mods[0].archetype})` });
  });
  const count = {};
  list.forEach((l) => { if (l.archetype) count[l.archetype] = (count[l.archetype] || 0) + 1; });
  TEACHING_ARCHETYPES.forEach((a) => {
    const n = count[a] || 0;
    const min = a === 'PROJ' ? FINAL_SHAPE.v5.minProj : FINAL_SHAPE.v5.minPerArchetype;
    if (n > FINAL_SHAPE.v5.maxPerArchetype) out.push({ rule: 'V5', check: `V5-course-${a}`, course: true, phase: '*', text: `${a}: ${n} tundi kursusel (kuni ${FINAL_SHAPE.v5.maxPerArchetype})` });
    if (n < min) out.push({ rule: 'V5', check: `V5-course-${a}`, course: true, phase: '*', text: `${a}: ${n} tundi kursusel (vähemalt ${min})` });
  });
}

// ---------- V6: Harno format coverage ----------
const PARTS = { W: 'Kirjutamine', L: 'Kuulamine', R: 'Lugemine', S: 'Rääkimine' };
function harnoProblemsCourse(lessons, out) {
  const practice = lessons.filter((l) => l.num <= FINAL_SHAPE.lastPracticeLesson).flatMap((l) => lessonTasks(l)
    .filter(({ b }) => harnoOf(b)).map(({ b }) => ({ format: harnoOf(b), family: harnoFamily(harnoOf(b)), module: l.module, exam: l.assessment })));
  Object.entries(FORMAT_PRACTICE).forEach(([family, need]) => {
    const list = practice.filter((x) => x.family === family);
    const exam = list.filter((x) => x.exam).length;
    const corner = list.length - exam;
    if (list.length < need.total) out.push({ rule: 'V6', check: `V6-total-${family}`, course: true, phase: '*', text: `${family}: harjutatud ${list.length} korda (vähemalt ${need.total})` });
    if (exam < need.exam) out.push({ rule: 'V6', check: `V6-exam-${family}`, course: true, phase: '*', text: `${family}: eksamitundides ${exam} korda (vähemalt ${need.exam})` });
    if (corner < need.corner) out.push({ rule: 'V6', check: `V6-corner-${family}`, course: true, phase: '*', text: `${family}: eksaminurkades ${corner} korda (vähemalt ${need.corner})` });
    const intro = Math.min(...Object.entries(FORMAT_INTRO).filter(([f]) => harnoFamily(f) === family).map(([, m]) => m));
    const modules = [...new Set(list.map((x) => x.module))].sort((a, b) => a - b);
    if (modules.length) {
      const points = [intro, ...modules.filter((m) => m >= intro)];
      const gap = Math.max(0, ...points.slice(1).map((m, i) => m - points[i]));
      if (gap > need.gap) out.push({ rule: 'V6', check: `V6-gap-${family}`, course: true, phase: '*', text: `${family}: kahe harjutuse vahel ${gap} moodulit (kuni ${need.gap}; tutvustatakse moodulis ${intro})` });
    }
  });
  VARIANTS.forEach((v) => {
    const n = practice.filter((x) => x.format === v).length;
    if (n < VARIANT_MIN) out.push({ rule: 'V6', check: `V6-variant-${v}`, course: true, phase: '*', text: `${v}: ${n} korda (vähemalt ${VARIANT_MIN})` });
  });
  // exam lessons from module 9: every part has its header with minutes (exampart); mocks have all four parts
  lessons.filter((l) => l.assessment && l.module >= FINAL_SHAPE.examTimingFromModule).forEach((l) => {
    const blocks = PHASES.flatMap((p) => blocksOf(l.sheets[p]));
    const tasks = lessonTasks(l).map((x) => x.b);
    const parts = new Set(tasks.map((b) => harnoOf(b)).filter(Boolean).map((f) => f.charAt(0)));
    const timed = new Set(blocks.filter((b) => b.type === 'exampart' && Number(b.data?.minutes) > 0).map((b) => b.data.skill));
    const untimed = [...parts].filter((s) => !timed.has(s));
    if (!parts.size) out.push({ rule: 'V6', check: 'V6-exam-tags', lesson: l, phase: '*', text: 'eksamitunni ülesannetel pole Harno silte (tag(block, { harno }))' });
    if (untimed.length) out.push({ rule: 'V6', check: 'V6-timing', lesson: l, phase: '*', text: `eksami osadel ${untimed.map((s) => PARTS[s]).join(', ')} pole aega (B.examPart)` });
    if (FINAL_SHAPE.mocks.includes(l.num)) {
      const missing = Object.keys(PARTS).filter((s) => !parts.has(s));
      if (missing.length) out.push({ rule: 'V6', check: 'V6-mock', lesson: l, phase: '*', text: `proovieksamis puudub ${missing.map((s) => PARTS[s]).join(', ')}` });
    }
  });
}

// ---------- V7, V8: no repeated instruction, no repeated item ----------
export const normInstruction = (s) => String(s || '').toLocaleLowerCase('et')
  .replace(/„[^”"]*[”"]|"[^"]*"|«[^»]*»|\([^)]*\)|\[[^\]]*\]/g, ' ').replace(/\d+/g, ' ').replace(/[–—-]/g, ' ')
  .replace(/[.,!?;:…]/g, ' ').replace(/\s+/g, ' ').trim();
function instructionProblems(lessons, out) {
  const seen = new Map(); // norm → { first lesson id, harno formats in exam lessons, any non-exam use }
  const uses = [];
  lessons.forEach((l) => PHASES.forEach((p) => tasksOf(l.sheets[p]).forEach((b) => {
    const key = normInstruction(b.data?.instruction);
    if (!key) return;
    uses.push({ key, l, p, b });
    const s = seen.get(key) || { lessons: new Set(), formats: new Set(), other: false };
    s.lessons.add(l.id);
    if (l.assessment && harnoOf(b)) s.formats.add(harnoOf(b)); else s.other = true;
    seen.set(key, s);
  })));
  const reported = new Set();
  uses.forEach(({ key, l, p, b }) => {
    const s = seen.get(key);
    if (s.lessons.size < 2) return;
    // the fixed Harno wording of one format in exam lessons (§8 V7 exemption)
    if (!s.other && s.formats.size === 1) return;
    const first = [...s.lessons][0];
    if (l.id === first || reported.has(`${l.id}|${key}`)) return;
    reported.add(`${l.id}|${key}`);
    out.push({ rule: 'V7', check: 'V7', lesson: l, phase: p, text: `${b.id}: sama juhis kui ${first} („${String(b.data.instruction).slice(0, 70)}”)` });
  });
}
export function itemSentences(b) {
  const d = b.data || {};
  switch (b.type) {
    case 'choice': return (d.questions || []).map((q) => q.q);
    case 'examlisten': return [...(d.questions || []).map((q) => q.q), ...(d.statements || []).map((s) => s.text)];
    case 'truefalse': return (d.statements || []).map((s) => s.text);
    case 'gaps': case 'wordorder': case 'dictation': case 'listening': return lines(d.sentences).map(plain);
    case 'errorfix': return (d.rows || []).map((r) => r.wrong);
    case 'transformation': return (d.rows || []).map((r) => r.from);
    case 'translation': return (d.rows || []).map((r) => r.source);
    case 'adsmatch': return (d.situations || []).map((s) => s.text);
    default: return [];
  }
}
function itemProblems(lessons, out) {
  const first = new Map();
  lessons.forEach((l) => PHASES.forEach((p) => tasksOf(l.sheets[p]).forEach((b) => itemSentences(b).forEach((s) => {
    const key = words(s).join(' ');
    if (key.split(' ').length < 4) return;
    const was = first.get(key);
    if (!was) { first.set(key, l.id); return; }
    if (was !== l.id) out.push({ rule: 'V8', check: 'V8', lesson: l, phase: p, text: `${b.id}: sama lause kui ${was} („${s.slice(0, 70)}”)` });
  }))));
}

// ---------- V9, V10: tasks serve the can-do, a smooth path to it ----------
const SKILL_VERBS = [
  ['S', /\b(räägin|jutustan|lepin\b.*\bkokku|lepin kokku|küsin|selgitan suuliselt|tutvustan|arutlen|vestlen|esitlen|helistan)\b/],
  ['W', /\b(kirjutan|vastan kirjale|täidan|koostan kirja)\b/],
  ['L', /\b(saan aru kuuldust|saan kuuldust aru|kuulan)\b/],
  ['R', /\b(loen|leian tekstist)\b/],
];
export const canDoSkills = (canDo) => SKILL_VERBS.filter(([, re]) => re.test(String(canDo || '').toLocaleLowerCase('et'))).map(([skill]) => skill);
export function mainTask(lesson) {
  const tasks = tasksOf(lesson.sheets.transfer);
  return tasks.find((b) => b.tag?.main) || [...tasks].reverse().find((b) => ['S', 'W'].includes(skillOf(taskIdOf(b)))) || null;
}
function goalProblems(lessons, out) {
  teaching(lessons).forEach((l) => {
    const goals = Object.keys(l.goals || {});
    const tasks = lessonTasks(l);
    tasks.filter(({ b }) => goals.length && !goals.includes(b.goal)).forEach(({ b, phase }) => out.push({ rule: 'V9', check: 'V9-goal', lesson: l, phase, text: `${b.id}: eesmärk ${b.goal || '—'} pole tunni eesmärkide hulgas` }));
    goals.forEach((g) => {
      const n = tasks.filter(({ b }) => b.goal === g).length;
      if (n < 2) out.push({ rule: 'V9', check: `V9-thin-${g}`, lesson: l, phase: '*', text: `eesmärki ${g} harjutab ${n} ülesannet (vähemalt 2)` });
    });
    const main = mainTask(l);
    if (!main) out.push({ rule: 'V9', check: 'V9-main', lesson: l, phase: 'transfer', text: 'Kasuta: põhiülesanne (rääkimine või kirjutamine) puudub' });
    else {
      if (main.goal !== l.canDoGoal) out.push({ rule: 'V9', check: 'V9-main-goal', lesson: l, phase: 'transfer', text: `${main.id}: põhiülesande eesmärk on ${main.goal}, tunni oskus („Ma oskan…”) on ${l.canDoGoal}` });
      const skills = canDoSkills(l.canDo);
      const skill = skillOf(taskIdOf(main));
      if (!skills.length) out.push({ rule: 'V9', check: 'V9-cando-verb', lesson: l, phase: '*', text: `„Ma oskan…” ei ütle, mida õpilane teeb (räägin, kirjutan, loen, saan kuuldust aru …): „${l.canDo.slice(0, 80)}”` });
      else if (!skills.includes(skill)) out.push({ rule: 'V9', check: 'V9-cando-skill', lesson: l, phase: 'transfer', text: `„Ma oskan…” on ${skills.join('/')}, Kasuta põhiülesanne ${main.id} on ${skill}` });
    }
    // V10
    PHASES.forEach((p) => {
      if (!l.sheets[p]) return;
      if (!tasksOf(l.sheets[p]).some((b) => b.goal === l.canDoGoal)) out.push({ rule: 'V10', check: 'V10-goal', lesson: l, phase: p, text: `${PH[p]}: ükski ülesanne ei vii tunni oskuse (${l.canDoGoal}) poole` });
    });
    const practice = tasksOf(l.sheets.practice);
    if (practice.length) {
      const [first, last] = [practice[0], practice[practice.length - 1]];
      if (taskLevelOf(first) > 2 || taskLevelOf(last) < 3) out.push({ rule: 'V10', check: 'V10-ladder', lesson: l, phase: 'practice', text: `Harjuta: redel ${practice.map(taskLevelOf).join('-')} (esimene ≤ 2, viimane ≥ 3)` });
    }
    const transfer = tasksOf(l.sheets.transfer);
    const low = transfer.filter((b) => taskLevelOf(b) <= 2);
    if (low.length) out.push({ rule: 'V10', check: 'V10-kasuta', lesson: l, phase: 'transfer', text: `Kasuta: tase ≤ 2 ülesanded (${low.map((b) => `${b.id} ${taskIdOf(b)}`).join(', ')})` });
    if (main && taskLevelOf(main) < 4) out.push({ rule: 'V10', check: 'V10-main-level', lesson: l, phase: 'transfer', text: `Kasuta põhiülesanne ${main.id} (${taskIdOf(main)}) on tasemel ${taskLevelOf(main)} (vaja 4: vaba kasutus)` });
    const discover = blocksOf(l.sheets.discover);
    const levels = new Set([...tasksOf(l.sheets.discover).map(taskLevelOf), ...(discover.some((b) => b.type === 'notice') ? [1] : [])]);
    if (l.sheets.discover && (!levels.has(1) || !levels.has(3))) out.push({ rule: 'V10', check: 'V10-avasta', lesson: l, phase: 'discover', text: 'Avasta: vaja üht märkamisülesannet (tase 1) ja üht juhendatud kasutust (tase 3)' });
  });
}

// ---------- V11, V12: four strands, exam corner and washback ----------
export function strandOf(b) {
  if (b.tag?.fluency || taskIdOf(b) === 'S08') return 'fluency';
  const id = taskIdOf(b);
  if (['L08', 'W09'].includes(id)) return 'language';
  const skill = skillOf(id);
  return skill === 'R' || skill === 'L' ? 'input' : skill === 'S' || skill === 'W' ? 'output' : 'language';
}
function strandProblems(lessons, out) {
  const list = teaching(lessons);
  list.forEach((l, i) => {
    const tasks = lessonTasks(l).map(({ b, phase }) => ({ b, min: minutesOf(b, l.sheets[phase]) }));
    const notices = PHASES.flatMap((p) => blocksOf(l.sheets[p]).filter((b) => b.type === 'notice').map((b) => ({ b, min: minutesOf(b, l.sheets[p]) })));
    const all = [...tasks, ...notices];
    const total = all.reduce((n, x) => n + x.min, 0) || 1;
    const share = (s) => all.filter((x) => (x.b.type === 'notice' ? 'language' : strandOf(x.b)) === s).reduce((n, x) => n + x.min, 0) / total;
    const s = { input: share('input'), output: share('output'), language: share('language'), fluency: share('fluency') };
    const v = FINAL_SHAPE.v11;
    if (s.input < v.input) out.push({ rule: 'V11', check: 'V11-input', lesson: l, phase: '*', text: `tähendusega sisend ${pct(s.input)} tunni ajast (vähemalt ${pct(v.input)})` });
    if (s.output < v.output) out.push({ rule: 'V11', check: 'V11-output', lesson: l, phase: '*', text: `tähendusega väljund ${pct(s.output)} (vähemalt ${pct(v.output)})` });
    if (s.language > v.language) out.push({ rule: 'V11', check: 'V11-language', lesson: l, phase: '*', text: `keeleõpe ${pct(s.language)} (kuni ${pct(v.language)})` });
    if (s.fluency < v.fluency) out.push({ rule: 'V11', check: 'V11-fluency', lesson: l, phase: '*', text: `sujuvusülesanded ${pct(s.fluency)} (vähemalt ${pct(v.fluency)}; tag(block, { fluency: true }) või S08 4-3-2)` });
    // V12 from module 6
    if (l.module < FINAL_SHAPE.v12.fromModule) return;
    const corners = tasks.filter((x) => harnoOf(x.b));
    if (corners.length !== 1) out.push({ rule: 'V12', check: 'V12-corner', lesson: l, phase: '*', text: `eksaminurki ${corners.length} (täpselt 1: üks ülesanne tag(block, { harno }))` });
    const [lo, hi] = FINAL_SHAPE.v12.cornerMinutes;
    corners.filter((x) => x.min < lo || x.min > hi).forEach((x) => out.push({ rule: 'V12', check: 'V12-corner-minutes', lesson: l, phase: '*', text: `eksaminurk ${x.b.id} ≈ ${Math.round(x.min)} min (${lo}–${hi})` }));
    const prev = list[i - 1];
    const prevCorner = prev && prev.module >= FINAL_SHAPE.v12.fromModule ? lessonTasks(prev).map((x) => harnoOf(x.b)).find(Boolean) : null;
    if (corners.length && prevCorner && harnoFamily(harnoOf(corners[0].b)) === harnoFamily(prevCorner)) out.push({ rule: 'V12', check: 'V12-corner-repeat', lesson: l, phase: '*', text: `eksaminurk ${harnoOf(corners[0].b)} on sama vorm kui eelmises tunnis (${prev.id})` });
    const wash = corners.reduce((n, x) => n + x.min, 0) / total;
    if (wash > FINAL_SHAPE.v12.washback) out.push({ rule: 'V12', check: 'V12-washback', lesson: l, phase: '*', text: `eksamivormis ülesanded ${pct(wash)} tunni ajast (kuni ${pct(FINAL_SHAPE.v12.washback)})` });
  });
}

// ---------- V13: spaced retrieval ----------
function reviewProblems(lessons, out) {
  const moduleOfId = new Map(lessons.map((l) => [l.id, l.module]));
  const modules = new Set(lessons.map((l) => l.module));
  const list = teaching(lessons);
  list.forEach((l) => {
    const review = blocksOf(l.sheets.discover).find(isReview);
    if (!review) { out.push({ rule: 'V13', check: 'V13-review', lesson: l, phase: 'discover', text: 'Avasta ei alga kordamisega „Mäletad?” (B.review)' }); return; }
    const from = (review.data.from || []).filter(Boolean);
    const prevIds = lessons.filter((x) => x.num < l.num).slice(-1).map((x) => x.id);
    const prevTeaching = list.filter((x) => x.num < l.num).slice(-1).map((x) => x.id);
    if (![...prevIds, ...prevTeaching].some((id) => from.includes(id)) && (prevIds.length || prevTeaching.length)) out.push({ rule: 'V13', check: 'V13-previous', lesson: l, phase: 'discover', text: `„Mäletad?”: ükski küsimus pole märgitud eelmisest tunnist (from: '${prevTeaching[0] || prevIds[0]}')` });
    const [lo, hi] = FINAL_SHAPE.v13.back;
    const want = [...modules].some((m) => l.module - m >= lo && l.module - m <= hi);
    if (want && !from.some((id) => { const m = moduleOfId.get(id) ?? Math.ceil(lessonNum(id) / 5); return l.module - m >= lo && l.module - m <= hi; })) out.push({ rule: 'V13', check: 'V13-spaced', lesson: l, phase: 'discover', text: `„Mäletad?”: ükski küsimus pole moodulist ${l.module - hi}–${l.module - lo} (from: 'a2b1-0NN')` });
  });
}

// ---------- V14: vocabulary level ----------
// `forms`: a Set (or { has }) of known word forms — the EKI etLex A1–B1 lists (levelForms.*.json, CC BY); the EKI
// „Põhisõnavara sõnastik” is not available as an offline list, so these stand in for it (COURSE_FINAL_SHAPE_B1.md §9)
export const vocabHeadwords = (b) => String(b.data?.words || '').split(/,\s*(?=[^,]*[—–])|\n/).map((w) => w.split(/[—–]/)[0].trim().toLocaleLowerCase('et')).filter(Boolean);
function vocabProblems(lessons, out, forms) {
  const earlier = new Set();
  Object.entries(byModule(lessons)).sort((a, b) => a[0] - b[0]).forEach(([, list]) => {
    const vocab = list.flatMap((l) => PHASES.flatMap((p) => blocksOf(l.sheets[p]).filter((b) => b.type === 'vocab')));
    const topic = new Set(vocab.flatMap((b) => (b.tag?.topic || []).map((w) => String(w).toLocaleLowerCase('et'))));
    const heads = [...new Set(vocab.flatMap(vocabHeadwords))];
    const known = (w) => words(w).every((t) => t.length < 2 || earlier.has(t) || forms?.has?.(t));
    const unknown = heads.filter((w) => !known(w));
    const at = { lesson: list[0], moduleOnly: true, phase: '*' };
    if (heads.length) {
      const share = 1 - unknown.length / heads.length;
      if (share < FINAL_SHAPE.v14.known) out.push({ rule: 'V14', check: 'V14-known', ...at, text: `${pct(share)} sõnavarakasti sõnadest on EKI A1–B1 loendis või varasemas moodulis (vähemalt ${pct(FINAL_SHAPE.v14.known)}): ${unknown.slice(0, 8).join(', ')}${unknown.length > 8 ? ' …' : ''}` });
      const unmarked = unknown.filter((w) => !topic.has(w));
      if (unmarked.length) out.push({ rule: 'V14', check: 'V14-topic', ...at, text: `${unmarked.length} sõna pole loendis ega märgitud teemasõnaks (tag(vocab, { topic: […] })): ${unmarked.slice(0, 8).join(', ')}${unmarked.length > 8 ? ' …' : ''}` });
    }
    heads.forEach((w) => words(w).forEach((t) => earlier.add(t)));
  });
}

// ---------- V15: caps ----------
const DRILL_IDS = ['G03', 'G05', 'G06', 'G07', 'G09', 'G10', 'G13'];
function capProblems(lessons, out) {
  Object.entries(byModule(teaching(lessons))).forEach(([, list]) => {
    const types = {};
    list.forEach((l) => lessonTasks(l).forEach(({ b }) => { types[b.type] = (types[b.type] || 0) + 1; }));
    Object.entries(FINAL_SHAPE.v15).forEach(([type, max]) => {
      if ((types[type] || 0) > max) out.push({ rule: 'V15', check: `V15-${type}`, lesson: list[0], moduleOnly: true, phase: '*', text: `moodulis ${types[type]} × ${type} (kuni ${max})` });
    });
    list.forEach((l) => {
      const drills = tasksOf(l.sheets.transfer).filter((b) => skillOf(taskIdOf(b)) === 'G');
      if (drills.length) out.push({ rule: 'V15', check: 'V15-kasuta', lesson: l, phase: 'transfer', text: `Kasuta: keeleharjutus (${drills.map((b) => `${b.id} ${taskIdOf(b)}`).join(', ')}) — siin on olukord ja tulemus` });
      const seen = lessonTasks(l).map(({ b }) => taskIdOf(b)).filter((id) => DRILL_IDS.includes(id));
      const twice = [...new Set(seen.filter((id, k) => seen.indexOf(id) !== k))];
      if (twice.length) out.push({ rule: 'V15', check: 'V15-lesson', lesson: l, phase: '*', text: `sama vormiharjutus tunnis mitu korda (${twice.join(', ')})` });
    });
  });
}

// ---------- all rules ----------
export const RULES = {
  V1: 'Järjestikused tunnid ei korda ülesannete jada', V2: 'Etapid algavad eri moodi', V3: 'Moodulis palju eri ülesandetüüpe',
  V4: 'Miski ei domineeri', V5: 'Tunnitüüpide roteerumine', V6: 'Harno vormide katvus ja eksami aeg', V7: 'Juhised ei kordu',
  V8: 'Harjutuslaused ei kordu', V9: 'Ülesanded teenivad tunni oskust', V10: 'Sujuv tee eesmärgini (redel)', V11: 'Neli haru (Nation)',
  V12: 'Eksaminurk ja tagasimõju', V13: 'Hajutatud kordamine', V14: 'Sõnavara tase', V15: 'Piirid (vead, tõlge, etteütlus)',
};
// ---------- V16: where the speaking happens (owner 2026-10-28) ----------
// every teaching lesson has a pair / role task done in the lesson (the teacher is the partner) and, in Kasuta, a
// monologue the learner records at home; „Mida sa teeksid?” (tingiv kõneviis) only from module 13, where the form is taught
const CONDITIONAL = /\b(tee|ole|lähe|ütle|vali|ost|aita|soovita|küsi|ela|sõida|kasuta)(ksi[dn]?|ksite|ksime)\b/i;
const speakText = (b) => [b.data?.title, b.data?.instruction, b.data?.questions, b.data?.roleA, b.data?.roleB, b.data?.situation].filter(Boolean).join(' ');
function speakingPlaceProblems(lessons, out) {
  teaching(lessons).forEach((l) => {
    const all = PHASES.flatMap((p) => blocksOf(l.sheets[p]).map((b) => ({ b, phase: p })));
    if (l.sheets.transfer && !blocksOf(l.sheets.transfer).some((b) => b.type === 'speaking' && !isInLesson(b))) {
      out.push({ rule: 'V16', check: 'V16-home-voice', lesson: l, phase: 'transfer', text: 'Kasuta: kodus salvestatav monoloog puudub (speaking-plokk, mis ei ole paaristöö)' });
    }
    if (!all.some(({ b }) => isInLesson(b))) out.push({ rule: 'V16', check: 'V16-in-lesson', lesson: l, phase: '*', text: 'tunnis ei ole ühtki paaris- või rolliülesannet (õpetaja on partner)' });
    if (l.module < FINAL_SHAPE.v16.conditionalFrom) {
      all.filter(({ b }) => ['speaking', 'rolecards', 'speakcard'].includes(b.type) && CONDITIONAL.test(plain(speakText(b))))
        .forEach(({ b, phase }) => out.push({ rule: 'V16', check: 'V16-conditional', lesson: l, phase, text: `${b.id}: tingiv kõneviis enne moodulit ${FINAL_SHAPE.v16.conditionalFrom} (kasuta „Mida sa teed, kui …?”)` }));
    }
  });
}

export function finalShapeProblems(lessons, { forms = null } = {}) {
  const raw = [];
  sequenceProblems(lessons, raw);
  moduleVarietyProblems(lessons, raw);
  archetypeProblems(lessons, raw);
  harnoProblemsCourse(lessons, raw);
  instructionProblems(lessons, raw);
  itemProblems(lessons, raw);
  goalProblems(lessons, raw);
  strandProblems(lessons, raw);
  reviewProblems(lessons, raw);
  vocabProblems(lessons, raw, forms);
  capProblems(lessons, raw);
  speakingPlaceProblems(lessons, raw);
  return raw.map(({ lesson, course, moduleOnly, ...p }) => ({
    ...p,
    moduleId: course ? 'course' : lesson.moduleId,
    lessonId: course || moduleOnly ? '*' : lesson.id,
  }));
}

// the baseline key of a problem (the same shape as quality.js problemKey: lesson | phase | check)
export const finalShapeKey = (p) => [p.lessonId, p.phase, p.check].join('|');
// counts per rule and per module, for the summary tool and the docs
export function summarize(problems) {
  const byRule = {};
  const byCheck = {};
  const byModule = {};
  problems.forEach((p) => {
    byRule[p.rule] = (byRule[p.rule] || 0) + 1;
    byCheck[p.check] = (byCheck[p.check] || 0) + 1;
    (byModule[p.moduleId] ||= {})[p.rule] = (byModule[p.moduleId][p.rule] || 0) + 1;
  });
  return { total: problems.length, byRule, byCheck, byModule };
}
