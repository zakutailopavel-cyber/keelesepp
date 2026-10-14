// „Kursuse valmidus”: how much of the course passes every quality gate (worksheet-studio/didactics/gates.js).
// Computed from the sheets in code (admin/course/*); a sheet edited by hand in the CRM is checked in its constructor.
import { moduleGates, sheetGates } from '../../../worksheet-studio/didactics/gates.js';
import { moduleSheets } from './registry.js';

export function lessonReport(phases = {}, moduleProblems = [], lessonId = '') {
  const sheets = Object.fromEntries(Object.entries(phases).map(([phase, doc]) => [phase, sheetGates(doc)]));
  const lessonModule = moduleProblems.filter((p) => p.lessonId === lessonId || (p.lessonId === '*' && String(p.text).includes(lessonId)));
  const count = Object.values(sheets).reduce((n, list) => n + list.length, 0) + lessonModule.length;
  return { sheets, module: lessonModule, count, ready: count === 0 };
}

export function moduleReport(mod) {
  const sheets = moduleSheets(mod);
  const moduleProblems = moduleGates(sheets);
  const lessons = Object.fromEntries(Object.entries(sheets).map(([lessonId, phases]) => [lessonId, lessonReport(phases, moduleProblems, lessonId)]));
  const gates = {};
  Object.values(lessons).forEach((lesson) => [...Object.values(lesson.sheets).flat(), ...lesson.module].forEach((p) => { gates[p.gate] = (gates[p.gate] || 0) + 1; }));
  const values = Object.values(lessons);
  return { id: mod.MODULE.id, course: mod.MODULE.course, title: mod.MODULE.title, lessons, total: values.length, ready: values.filter((l) => l.ready).length, gates };
}

export function courseReadiness(modules = []) {
  const reports = modules.map(moduleReport);
  const byCourse = {};
  reports.forEach((r) => {
    const c = byCourse[r.course] || { course: r.course, total: 0, ready: 0, gates: {}, modules: [] };
    c.total += r.total; c.ready += r.ready; c.modules.push(r);
    Object.entries(r.gates).forEach(([gate, n]) => { c.gates[gate] = (c.gates[gate] || 0) + n; });
    byCourse[r.course] = c;
  });
  return byCourse;
}

export const GATE_LABEL = { depth: 'sügavus', keys: 'vastused', level: 'tase (Harno)', unique: 'kordused', vocab: 'sõnavara' };
