// Course production tools (docs/CODEX_TASKS_B1B2_IDEAL.md). Skipped in normal runs; run from crm-v2:
//   COURSE_REPORT=b1b2-module-02 npx vitest run src/features/worksheet-generator/admin/course/courseTools.test.js --reporter=verbose
//     → every lesson of the module: minutes per sheet and every gate problem (READY = passes all gates)
//   COURSE_DUMP=/tmp/m02.json COURSE_DUMP_MODULE=b1b2-module-02 npx vitest run …/courseTools.test.js
//     → the module's built sheets as JSON for tools/course-audit/language.py
/* global console */
import { writeFileSync } from 'node:fs';
import { COURSE_MODULES, buildCourseSheet, moduleSheets } from './registry.js';
import { moduleReport } from './readiness.js';
import { sheetMinutes } from '../../../worksheet-studio/didactics/timeEstimate.js';

const env = globalThis.process?.env || {};
const find = (id) => COURSE_MODULES.find((m) => m.MODULE.id === id);

describe.skipIf(!env.COURSE_REPORT)('course report', () => {
  it('prints the gates of a module', () => {
    const mod = find(env.COURSE_REPORT);
    expect(mod, `module ${env.COURSE_REPORT}`).toBeTruthy();
    const report = moduleReport(mod);
    const out = [`${mod.MODULE.id}: ${report.ready}/${report.total} lessons ready`];
    for (const [lessonId, lesson] of Object.entries(report.lessons)) {
      out.push(`\n## ${lessonId} ${mod.LESSONS[lessonId].title} ${lesson.ready ? 'READY' : ''}`);
      for (const [phase, list] of Object.entries(lesson.sheets)) {
        out.push(`  ${phase} (${sheetMinutes(buildCourseSheet(mod, lessonId, phase))} min): ${list.map((p) => `[${p.gate}] ${p.text}`).join(' | ') || 'OK'}`);
      }
      lesson.module.forEach((p) => out.push(`  module: [${p.gate}] ${p.text}`));
    }
    console.log(out.join('\n'));
  });
});

describe.skipIf(!env.COURSE_DUMP)('course dump', () => {
  it('writes the built sheets', () => {
    const modules = env.COURSE_DUMP_MODULE ? [find(env.COURSE_DUMP_MODULE)] : COURSE_MODULES;
    const sheets = modules.flatMap((mod) => Object.entries(moduleSheets(mod)).flatMap(([lessonId, phases]) => Object.entries(phases)
      .map(([phase, doc]) => ({ course: mod.MODULE.course, module: mod.MODULE.id, lessonId, phase, doc }))));
    writeFileSync(env.COURSE_DUMP, JSON.stringify(sheets));
  });
});
