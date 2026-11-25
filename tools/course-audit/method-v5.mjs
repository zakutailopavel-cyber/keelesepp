#!/usr/bin/env node
// Methodology v5 „lesson budget” report for the B1 (a2b1), B2 (b1b2) and A2 (a2) course modules (docs/METHODOLOGY_B1_B2_V5.md,
// docs/METHODOLOGY_A2_V5.md,
// gates G1–G13 in crm-v2/src/features/worksheet-generator/admin/course/methodV5.js). Read-only: builds the sheets from the
// module files and prints blocks and minutes per sheet, per lesson, and every v5 violation — so a content agent sees the
// gaps before adding the module to strictModulesV5.json. No network, no writes.
//
//   node tools/course-audit/method-v5.mjs --course b1 --module 1      # B1 module 1 (a2b1-module-01)
//   node tools/course-audit/method-v5.mjs --course b2 --module 17     # B2 module 17 (b1b2-module-17)
//   node tools/course-audit/method-v5.mjs --course a2 --module 1      # A2 module 1 (a2-module-01)
//   node tools/course-audit/method-v5.mjs --course b2                 # every B2 module, counts per gate
//   node tools/course-audit/method-v5.mjs --course b1 --module 1 --gate G1,G3   # only these gates
//   node tools/course-audit/method-v5.mjs --course b1 --module 1 --json
//   (from crm-v2: npm run course:method-v5 -- --course b1 --module 1)
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = join(ROOT, 'crm-v2/src/features/worksheet-generator/admin/course');
const { COURSE_MODULES } = await import(pathToFileURL(join(SRC, 'registry.js')).href);
const { methodV5Report, formatMethodV5Report } = await import(pathToFileURL(join(SRC, 'methodV5.js')).href);

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const COURSE = arg('--course') || 'b1';
const MODULE = arg('--module');
const GATES = arg('--gate') ? arg('--gate').split(',').map((g) => g.trim().toUpperCase()) : null;
if (!['b1', 'b2', 'a2'].includes(COURSE)) { console.error('--course b1 | b2 | a2'); process.exit(1); }

const prefix = { b1: 'a2b1-module-', b2: 'b1b2-module-', a2: 'a2-module-' }[COURSE];
const modules = COURSE_MODULES.filter((m) => m.MODULE.course === COURSE && String(m.MODULE.id).startsWith(prefix)
  && (!MODULE || m.MODULE.id === `${prefix}${String(MODULE).padStart(2, '0')}` || m.MODULE.id === MODULE));
if (!modules.length) { console.error(`no module ${MODULE || ''} in course ${COURSE}`); process.exit(1); }

const reports = modules.map((m) => methodV5Report(m));
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(reports, null, 1));
} else if (modules.length === 1 || MODULE) {
  reports.forEach((r) => console.log(formatMethodV5Report(r, { gates: GATES }).join('\n')));
} else {
  reports.forEach((r) => console.log(`${r.id.padEnd(16)} ${String(r.problems.length).padStart(4)}  ${Object.entries(r.byGate).map(([g, n]) => `${g}:${n}`).join(' ')}`));
}
