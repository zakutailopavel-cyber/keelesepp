// Runs the advisory material checklist over every worksheet the repository produces in code and renders a Markdown
// report (docs/MATERIAL_QUALITY_AUDIT.md). Sheets made by hand in the CRM live in Firestore and are not covered.
import { withLessonArt } from '../../art/textbookArt.js';
import { generateA2Module01 } from '../../production/a2Module01.js';
import { generateA2Module02 } from '../../production/a2Module02.js';
import { generateA2Module03 } from '../../production/a2Module03.js';
import { generateA2Module04 } from '../../production/a2Module04.js';
import { generateA2Module05 } from '../../production/a2Module05.js';
import { generateA2Module06 } from '../../production/a2Module06.js';
import { generateA2Module07 } from '../../production/a2Module07.js';
import { generateA2Module08 } from '../../production/a2Module08.js';
import { generateA2Module09 } from '../../production/a2Module09.js';
import { generateA2Module10 } from '../../production/a2Module10.js';
import { buildModule1Worksheet, MODULE1_LESSON_IDS, MODULE1_PHASES } from '../module1ThreePhase.js';
import { LESSON_CODES, MODULE_CODES, moduleChecklist } from './materialChecklist.js';
import { COURSE_MODULES, moduleSheets } from './registry.js';

const A2_GENERATORS = [generateA2Module01, generateA2Module02, generateA2Module03, generateA2Module04, generateA2Module05, generateA2Module06, generateA2Module07, generateA2Module08, generateA2Module09, generateA2Module10];

const art = (doc, lessonId) => withLessonArt(doc, lessonId, doc.meta?.phase);

// [{ group, id, title, lessons: { [lessonId]: [doc, …] } }]
export function collectWorks() {
  const a2 = A2_GENERATORS.map((generate, index) => {
    const result = generate();
    return {
      group: 'A2',
      id: result.moduleId,
      title: `A2 moodul ${index + 1}: ${result.moduleTitle}`,
      lessons: Object.fromEntries(result.bundles.map((bundle) => [bundle.lessonId, bundle.sheets.map((sheet) => art({ ...sheet.worksheetDoc, meta: { ...sheet.worksheetDoc.meta, phase: sheet.worksheetDoc.meta?.phase || sheet.phase } }, bundle.lessonId))])),
    };
  });
  const b1m1 = {
    group: 'B1',
    id: 'b1-module-01',
    title: 'B1 moodul 1 (A2 → B1)',
    lessons: Object.fromEntries(MODULE1_LESSON_IDS.map((lessonId) => [lessonId, MODULE1_PHASES.map((phase) => art(buildModule1Worksheet(lessonId, phase), lessonId))])),
  };
  const course = COURSE_MODULES.map((mod) => ({
    group: String(mod.MODULE.course || '').toUpperCase(),
    id: mod.MODULE.id,
    title: `${String(mod.MODULE.course).toUpperCase()} ${mod.MODULE.title}`,
    lessons: Object.fromEntries(Object.entries(moduleSheets(mod)).map(([lessonId, phases]) => [lessonId, Object.values(phases).map((doc) => art(doc, lessonId))])),
  }));
  return [...a2, b1m1, ...course];
}

export function auditWorks(works = collectWorks()) {
  return works.map((work) => ({ ...work, result: moduleChecklist(work.lessons) }));
}

const pct = (n, total) => (total ? Math.round((100 * n) / total) : 0);

export const CODE_LABELS = {
  A1: 'Neli osaoskust tunnis',
  A2: 'Paaris- või rühmatöö',
  A3: 'Teksti kasutatakse edasi',
  A5: 'Avasta algab olukorraga',
  J1: 'Kontrollitud → vaba',
  J2: 'Tugi loovülesandele',
  J3: 'Lühike selge tööjuhis',
  J5: 'Enesehinnang lehel',
  K1: 'Avatud ülesanne',
  K2: 'Pilt tunnis',
  K4: 'Ülesanne väljaspool klassi',
  J4: 'Diferentseerimine',
};

// share of lessons (or modules) where a criterion has no problem
export function summarize(audited) {
  const rows = {};
  for (const group of [...new Set(audited.map((w) => w.group))]) {
    const works = audited.filter((w) => w.group === group);
    const lessons = works.flatMap((w) => Object.values(w.result.lessons));
    rows[group] = {
      modules: works.length,
      lessons: lessons.length,
      sheets: works.reduce((sum, w) => sum + Object.values(w.lessons).flat().length, 0),
      pass: {
        ...Object.fromEntries(LESSON_CODES.map((code) => [code, pct(lessons.filter((p) => !p.some((x) => x.code === code)).length, lessons.length)])),
        ...Object.fromEntries(MODULE_CODES.map((code) => [code, pct(works.filter((w) => !w.result.module.some((x) => x.code === code)).length, works.length)])),
      },
    };
  }
  return rows;
}

export function renderAuditMarkdown(audited, { date, commit }) {
  const summary = summarize(audited);
  const groups = Object.keys(summary);
  const codes = [...LESSON_CODES, ...MODULE_CODES];
  const lines = [
    '# Õppematerjalide kvaliteedi audit',
    '',
    `Kontrollitud: ${date}, \`main\` ${commit}. Kriteeriumid: [MATERIAL_QUALITY_CHECKLIST.md](MATERIAL_QUALITY_CHECKLIST.md). Genereeritud: \`WRITE_MATERIAL_AUDIT=1 npx vitest run src/features/worksheet-generator/admin/course/materialAudit.test.js\`.`,
    '',
    'Hõlmab kõiki lehti, mida repositoorium koodis toodab (A2 moodulid 1–10, B1 moodul 1, kursuse moodulid B1/B2/C1). CRM-is käsitsi tehtud ja ainult Firestore\'is olevad lehed (nt Avasta 001–050 üleviidud versioonid) ei ole kaetud.',
    '',
    '## Kokkuvõte: mitu % tundidest vastab (K4, J4: % moodulitest)',
    '',
    `| Kriteerium | ${groups.join(' | ')} |`,
    `|---|${groups.map(() => '---:').join('|')}|`,
    `| Moodulid / tunnid / lehed | ${groups.map((g) => `${summary[g].modules} / ${summary[g].lessons} / ${summary[g].sheets}`).join(' | ')} |`,
    ...codes.map((code) => `| ${code} ${CODE_LABELS[code]} | ${groups.map((g) => `${summary[g].pass[code]}%`).join(' | ')} |`),
    '',
    '## Moodulite kaupa',
    '',
  ];
  for (const work of audited) {
    const lessonEntries = Object.entries(work.result.lessons);
    const counts = Object.fromEntries(codes.map((code) => [code, lessonEntries.filter(([, p]) => p.some((x) => x.code === code)).length]));
    const failing = LESSON_CODES.filter((code) => counts[code]).map((code) => `${code} ${counts[code]}/${lessonEntries.length}`);
    const moduleIssues = work.result.module.map((x) => x.code);
    lines.push(`### ${work.title} (\`${work.id}\`)`);
    lines.push('');
    lines.push(failing.length || moduleIssues.length
      ? `- Tunnid, kus kriteerium ei täitu: ${failing.join(', ') || '—'}${moduleIssues.length ? `; moodul: ${moduleIssues.join(', ')}` : ''}`
      : '- Kõik automaatsed kriteeriumid täidetud.');
    const details = lessonEntries.filter(([, p]) => p.length).slice(0, 5);
    details.forEach(([lessonId, problems]) => {
      const uniq = [...new Map(problems.map((p) => [`${p.code}${p.phase}${p.text}`, p])).values()].slice(0, 4);
      lines.push(`  - \`${lessonId}\`: ${uniq.map((p) => `${p.code}${p.phase && p.phase !== '*' ? ` (${p.phase})` : ''} ${p.text}`).join(' · ')}`);
    });
    if (lessonEntries.filter(([, p]) => p.length).length > details.length) lines.push(`  - … veel ${lessonEntries.filter(([, p]) => p.length).length - details.length} tundi`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}
