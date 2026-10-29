#!/usr/bin/env node
// How far the B1 course (or, with --course b2, the B1→B2 course: docs/COURSE_FINAL_SHAPE_B2.md) is from its final shape
// (docs/COURSE_FINAL_SHAPE_B1.md §8, gates V1–V16 in
// crm-v2/src/features/worksheet-studio/didactics/finalShape.js). Read-only: builds the sheets from the module files, runs
// the gates and prints counts per rule and per module, so a content agent sees what to fix. No network, no writes.
//
//   node tools/course-audit/final-shape.mjs                 # counts per rule, per check, per module (+ audit measurements)
//   node tools/course-audit/final-shape.mjs --module 7      # every problem of module 7 (lesson, phase, rule, text)
//   node tools/course-audit/final-shape.mjs --rule V12      # every problem of one rule
//   node tools/course-audit/final-shape.mjs --json          # the raw problems as JSON
//   node tools/course-audit/final-shape.mjs --course b2 --module 3   # the same for the B1→B2 course
//   (from crm-v2: npm run course:final-shape -- --module 7)
import fs from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = join(ROOT, 'crm-v2/src/features');
const load = (p) => import(pathToFileURL(join(SRC, p)).href);
const { COURSE_MODULES, moduleSheets } = await load('worksheet-generator/admin/course/registry.js');
const { finalShapeProblems, finalShapeKey, lessonsFromModules, summarize, RULES, tasksOf, PHASES } = await load('worksheet-studio/didactics/finalShape.js');
const { taskIdOf } = await load('worksheet-studio/didactics/taskCatalogue.js');

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const MODULE = arg('--module');
const RULE = arg('--rule');
const COURSE = arg('--course') || 'b1';
if (!['a2', 'b1', 'b2'].includes(COURSE)) { console.error('--course a2 | b1 | b2'); process.exit(1); }

// the EKI etLex word forms (V14): A1–B1, for the B1→B2 course A1–B2
const forms = new Set([...(COURSE === 'a2' ? ['A1', 'A2'] : ['A1', 'A2', 'B1']), ...(COURSE === 'b2' ? ['B2'] : [])].flatMap((level) => String(JSON.parse(fs.readFileSync(join(SRC, `worksheet-studio/didactics/levelForms.${level}.json`), 'utf8')).forms || '').split('\n')));
const modules = COURSE_MODULES.filter((m) => m.MODULE.course === COURSE && !m.MODULE.supplement);
const lessons = lessonsFromModules(modules, moduleSheets);
const problems = finalShapeProblems(lessons, { forms, profile: COURSE });
const baselineFile = join(SRC, `worksheet-generator/admin/course/${{ a2: 'finalShapeBaselineA2.json', b2: 'finalShapeBaselineB2.json' }[COURSE] || 'finalShapeBaseline.json'}`);
const baseline = fs.existsSync(baselineFile) ? JSON.parse(fs.readFileSync(baselineFile, 'utf8')) : {};

if (process.argv.includes('--json')) { console.log(JSON.stringify(problems, null, 1)); process.exit(0); }

const pad = (s, n) => String(s).padEnd(n);
const num = (s, n = 5) => String(s).padStart(n);
if (MODULE || RULE) {
  const moduleId = MODULE ? modules.find((m) => Number(String(m.MODULE.id).split('-').pop()) === Number(MODULE))?.MODULE.id : null;
  const list = problems.filter((p) => (!moduleId || p.moduleId === moduleId) && (!RULE || p.rule === RULE));
  list.forEach((p) => console.log(`${pad(p.lessonId, 9)} ${pad(p.phase, 9)} ${pad(p.check, 18)} ${p.text}`));
  console.log(`\n${list.length} problems`);
  process.exit(0);
}

const s = summarize(problems);
const known = new Map();
Object.values(baseline).flat().forEach((k) => known.set(k, (known.get(k) || 0) + 1));
const fresh = problems.filter((p) => { const k = finalShapeKey(p); if (known.get(k)) { known.set(k, known.get(k) - 1); return false; } return true; });
console.log(`${{ a2: 'A2', b2: 'B1→B2' }[COURSE] || 'B1'} course final shape — ${lessons.length} lessons (${lessons.filter((l) => !l.assessment).length} teaching), ${modules.length} modules`);
console.log(`problems: ${s.total} (in the baseline ${s.total - fresh.length}, new ${fresh.length})\n`);
console.log('per rule');
Object.keys(RULES).forEach((r) => console.log(`  ${pad(r, 4)} ${num(s.byRule[r] || 0)}  ${RULES[r]}`));
console.log('\nper check (top 30)');
Object.entries(s.byCheck).sort((a, b) => b[1] - a[1]).slice(0, 30).forEach(([c, n]) => console.log(`  ${pad(c, 22)} ${num(n)}`));
console.log('\nper module');
const rules = Object.keys(RULES);
console.log(`  ${pad('module', 16)}${rules.map((r) => num(r, 5)).join('')}  total`);
[...modules.map((m) => m.MODULE.id), 'course'].forEach((id) => {
  const row = s.byModule[id] || {};
  console.log(`  ${pad(id, 16)}${rules.map((r) => num(row[r] || 0, 5)).join('')}  ${num(Object.values(row).reduce((a, b) => a + b, 0))}`);
});

// measurements ported from the 2026-10-26 audit (keelesepp-audit-b1-script.mjs): what the gates do not count directly
const FAMILY = { reading: 'SISEND', listening: 'SISEND', examlisten: 'SISEND', adsmatch: 'SISEND', dialogue: 'SISEND', profiles: 'SISEND', insertion: 'EKSAMITEKST', cloze: 'EKSAMITEKST',
  truefalse: 'MÕISTMINE', choice: 'MÕISTMINE', match: 'MÕISTMINE', manymatch: 'MÕISTMINE', table: 'REEGEL', categorize: 'REEGEL', planning: 'PLAAN',
  speaking: 'RÄÄGI', rolecards: 'RÄÄGI', speakcard: 'RÄÄGI', writing: 'KIRJUTA', guidedletter: 'KIRJUTA', examwriting: 'KIRJUTA' };
const teaching = lessons.filter((l) => !l.assessment);
const endings = {};
teaching.forEach((l) => PHASES.forEach((p) => {
  const fam = tasksOf(l.sheets[p]).map((b) => FAMILY[b.type] || 'VORM').filter((f, i, a) => f !== a[i - 1]);
  const k = fam.slice(-2).join(' > ');
  endings[k] = (endings[k] || 0) + 1;
}));
console.log('\naudit measurements (teaching lessons)');
console.log(`  sheet endings: ${Object.entries(endings).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => `${k} ${n}`).join(' · ')}`);
const letters = teaching.flatMap((l) => PHASES.flatMap((p) => (l.sheets[p]?.blocks || []).filter((b) => ['guidedletter', 'examwriting'].includes(b.type) && !b.data?.questions)));
console.log(`  letters with a word target: ${letters.length}, of them asking ≥ 90 words: ${letters.filter((b) => Number(b.data.minWords) >= 90).length}; writing tasks in sentences: ${teaching.flatMap((l) => PHASES.flatMap((p) => (l.sheets[p]?.blocks || []).filter((b) => b.type === 'writing'))).length}`);
const closed = teaching.flatMap((l) => PHASES.flatMap((p) => tasksOf(l.sheets[p]))).filter((b) => ['choice', 'truefalse', 'gaps', 'match', 'cloze', 'adsmatch', 'examlisten'].includes(b.type));
const items = (b) => (b.data.questions?.length || 0) + (b.data.statements?.length || 0) + (b.data.pairs?.length || 0) + (b.data.situations?.length || 0) + String(b.data.sentences || '').split('\n').filter((x) => x.trim()).length + (String(b.data.passage || '').match(/\{/g) || []).length;
console.log(`  closed tasks under 10 items (B1 norm 10): ${closed.filter((b) => items(b) < 10).length} of ${closed.length}`);
const tagged = teaching.flatMap((l) => PHASES.flatMap((p) => tasksOf(l.sheets[p]))).filter((b) => b.tag?.task || b.tag?.harno).length;
const allTasks = teaching.flatMap((l) => PHASES.flatMap((p) => tasksOf(l.sheets[p])));
console.log(`  tasks with a tag: ${tagged} of ${allTasks.length}; lessons with an archetype: ${lessons.filter((l) => l.archetype).length} of ${lessons.length}`);
const ids = {};
allTasks.forEach((b) => { const id = taskIdOf(b); ids[id] = (ids[id] || 0) + 1; });
console.log(`  catalogue ids in use: ${Object.keys(ids).length} of 61; most used: ${Object.entries(ids).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, n]) => `${k} ${n}`).join(', ')}`);
const exams = lessons.filter((l) => l.assessment);
const listenIn = (l) => PHASES.flatMap((p) => (l.sheets[p]?.blocks || []).filter((b) => ['listening', 'examlisten'].includes(b.type))).length;
console.log(`  exam lessons: ${exams.length}; with 4 listening tasks: ${exams.filter((l) => listenIn(l) >= 4).length}; with part timing (exampart): ${exams.filter((l) => PHASES.some((p) => (l.sheets[p]?.blocks || []).some((b) => b.type === 'exampart'))).length}`);
