// Depth audit of the published course (owner 2026-10-14): crm-v2/src/features/worksheet-studio/didactics/depth.js over
// every published sheet of the read-only export (export.cjs). Read-only; prints a summary and writes course-depth.json.
//   node tools/course-audit/depth.mjs course-audit-raw.json [out.json]
import { readFileSync, writeFileSync } from 'node:fs';
import { depthProblems, depthScore } from '../../crm-v2/src/features/worksheet-studio/didactics/depth.js';

const [raw = 'course-audit-raw.json', out = 'course-depth.json'] = process.argv.slice(2);
const lessons = JSON.parse(readFileSync(raw, 'utf8'));
const PHASE = { discover: 'Avasta', practice: 'Harjuta', transfer: 'Kasuta' };
const rows = [];
for (const lesson of lessons) {
  for (const [phase, sheet] of Object.entries(lesson.phases || {})) {
    if (!sheet || sheet.status !== 'published') continue;
    const doc = { meta: { level: lesson.level, phase }, blocks: (sheet.blocks || []).map((b, i) => ({ id: `${b.t}-${i + 1}`, type: b.t, data: b.d || {} })) };
    const problems = depthProblems(doc);
    rows.push({ id: lesson.id, level: lesson.level, mod: lesson.mod, num: lesson.num, title: lesson.title, phase: PHASE[phase] || phase, score: depthScore(problems), problems });
  }
}
writeFileSync(out, JSON.stringify(rows, null, 1));
const levels = ['A2', 'B1', 'B2', 'C1'];
const key = (level) => levels.find((l) => String(level || '').toUpperCase().startsWith(l)) || String(level);
for (const level of levels) {
  const list = rows.filter((r) => key(r.level) === level);
  if (!list.length) continue;
  const counts = {};
  list.forEach((r) => r.problems.forEach((p) => { counts[p.code] = (counts[p.code] || 0) + 1; }));
  const clean = list.filter((r) => !r.problems.length).length;
  const avg = Math.round(list.reduce((n, r) => n + r.score, 0) / list.length);
  console.log(`\n== ${level}: ${list.length} lehte, puhtaid ${clean}, keskmine ${avg}/100`);
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([code, n]) => console.log(`  ${String(n).padStart(4)}  ${code}`));
}
console.log('\n== kõige õhemad 15');
rows.slice().sort((a, b) => a.score - b.score).slice(0, 15).forEach((r) => console.log(`  ${String(r.score).padStart(3)}  ${r.id} ${r.phase} „${r.title}” — ${r.problems.map((p) => p.text).join(' · ')}`));
