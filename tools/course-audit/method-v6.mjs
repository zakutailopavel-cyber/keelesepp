#!/usr/bin/env node
// Methodology v6 report for the A2 (a2), B1 (a2b1) and B2 (b1b2) course modules (docs/METHODOLOGY_V6.md, gates G14–G25
// in crm-v2/src/features/worksheet-generator/admin/course/methodV6.js). Read-only unless --write-baseline: builds the
// sheets from the module files and prints every v6 violation — the retrofit backlog of a module rewritten under v5, or
// the gaps of a new module before it is added to strictModulesV6.json. A v6 module must also pass v5 (method-v5.mjs).
// No network.
//
//   node tools/course-audit/method-v6.mjs --course b1 --module 13     # one module, every violation
//   node tools/course-audit/method-v6.mjs --course b2                 # every module of the course: retrofit count per gate
//   node tools/course-audit/method-v6.mjs --course a2 --module 4 --gate G14,G15
//   node tools/course-audit/method-v6.mjs --retrofit                  # the v5-rewritten modules vs methodV6Baseline.json
//   node tools/course-audit/method-v6.mjs --retrofit --write-baseline # rewrite methodV6Baseline.json (only to lower it)
//   node tools/course-audit/method-v6.mjs ... --json | --no-lexis
//   (from crm-v2: npm run course:method-v6 -- --course b1 --module 13)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = join(ROOT, 'crm-v2/src/features/worksheet-generator/admin/course');
const LEX = join(ROOT, 'crm-v2/src/features/worksheet-studio/didactics');
const { COURSE_MODULES } = await import(pathToFileURL(join(SRC, 'registry.js')).href);
const { methodV6Report, formatMethodV6Report } = await import(pathToFileURL(join(SRC, 'methodV6.js')).href);

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const has = (name) => process.argv.includes(name);
const COURSE = arg('--course');
const MODULE = arg('--module');
const GATES = arg('--gate') ? arg('--gate').split(',').map((g) => g.trim().toUpperCase()) : null;
const BASELINE_FILE = join(SRC, 'methodV6Baseline.json');
const STRICT_V5 = JSON.parse(readFileSync(join(SRC, 'strictModulesV5.json'), 'utf8'));
const BASELINE = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));

// the EKI level word forms (levelForms.*.json, {"forms": "a\nb\n…"}) for the lexical profile G22
const forms = has('--no-lexis') ? null : Object.fromEntries(['A1', 'A2', 'B1', 'B2']
  .map((l) => [l, new Set(String(JSON.parse(readFileSync(join(LEX, `levelForms.${l}.json`), 'utf8')).forms || '').split('\n'))]));

const prefix = { b1: 'a2b1-module-', b2: 'b1b2-module-', a2: 'a2-module-' };
let modules;
if (has('--retrofit')) {
  const ids = ['a2', 'b1', 'b2'].flatMap((c) => STRICT_V5[c] || []);
  modules = COURSE_MODULES.filter((m) => ids.includes(m.MODULE.id));
} else {
  if (!['b1', 'b2', 'a2'].includes(COURSE)) { console.error('--course a2 | b1 | b2 (or --retrofit)'); process.exit(1); }
  modules = COURSE_MODULES.filter((m) => m.MODULE.course === COURSE && String(m.MODULE.id).startsWith(prefix[COURSE])
    && (!MODULE || m.MODULE.id === `${prefix[COURSE]}${String(MODULE).padStart(2, '0')}` || m.MODULE.id === MODULE));
}
if (!modules.length) { console.error(`no module ${MODULE || ''} in course ${COURSE || ''}`); process.exit(1); }

const reports = modules.map((m) => methodV6Report(m, { forms }));
if (has('--write-baseline')) {
  const next = Object.fromEntries(reports.map((r) => [r.id, { total: r.total, byGate: Object.fromEntries(Object.entries(r.byGate).filter(([, n]) => n)) }]));
  writeFileSync(BASELINE_FILE, `${JSON.stringify({ ...BASELINE, ...next }, null, 2)}\n`);
  console.log(`methodV6Baseline.json: ${reports.length} modules written`);
} else if (has('--json')) {
  console.log(JSON.stringify(reports, null, 1));
} else if (MODULE) {
  reports.forEach((r) => console.log(formatMethodV6Report(r, { gates: GATES, baseline: BASELINE[r.id]?.total ?? null }).join('\n')));
} else {
  reports.forEach((r) => console.log(`${r.id.padEnd(16)} ${String(r.total).padStart(4)}${BASELINE[r.id] ? ` /${String(BASELINE[r.id].total).padStart(4)}` : '      '}  ${Object.entries(r.byGate).filter(([, n]) => n).map(([g, n]) => `${g}:${n}`).join(' ')}`));
  console.log(`total ${reports.reduce((m, r) => m + r.total, 0)}`);
}
