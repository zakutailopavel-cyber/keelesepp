#!/usr/bin/env node
// docs/CURRICULUM_*_1_12.md → curriculumLessons records, one per topic (owner 2026-11-01: „внеси на сайт все предметы и
// темы”). The docs stay the source. Topics have no lessons or sheets yet, so roadmapManaged stays false: students' course
// map and the sheet generator leave them alone. Ids are by position: re-running after a doc edit must not overwrite.
// Usage: node tools/school-plans/build-records.mjs > records.json
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const docs = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs');
const pad = (n, size = 2) => String(n).padStart(size, '0');
// grade 9 emakeel already has the six exam modules of ek9: its plan sections continue after them
const firstModule = (key, grade) => (key === 'ek' && grade === 9 ? 7 : 1);

const PLANS = [
  { key: 'ek', file: 'CURRICULUM_EMAKEEL_1_12.md', subject: 'Eesti keel', ru: 'эстонский как родной', level: (g) => `${g}. klass emakeel` },
  { key: 'ma', file: 'CURRICULUM_MATEMAATIKA_1_12.md', subject: 'Matemaatika', ru: 'математика', level: (g, stream) => `${g}. klass matemaatika${stream ? ` ${stream}` : ''}` },
  { key: 'en', file: 'CURRICULUM_INGLISE_1_12.md', subject: 'Inglise keel', ru: 'английский', level: (g) => `English ${g}. klass` },
];
const cleanHeading = (text) => text.replace(/\s+/g, ' ').trim();

export function parsePlan(plan, text) {
  const records = [];
  let grade = null; let optional = false; let goal = ''; let stream = ''; let section = '';
  const numbers = new Map(); // level → { lesson, modules: Map(section → number) }
  for (const line of text.split('\n')) {
    const gradeLine = line.match(/^## (\d+)\. klass(.*)$/);
    if (gradeLine) { grade = Number(gradeLine[1]); optional = /по желанию/.test(gradeLine[2]); goal = ''; stream = ''; section = ''; continue; }
    if (/^## /.test(line)) { grade = null; continue; }
    if (grade === null) continue;
    const goalLine = line.match(/^\*\*Eesmärk aasta lõpuks:\*\*\s*(.*)$/);
    if (goalLine) { goal = goalLine[1].trim(); continue; }
    const h3 = line.match(/^### (.+)$/);
    if (h3) {
      const name = cleanHeading(h3[1]);
      const streamName = name.match(/^(Kitsas|Lai) matemaatika$/);
      if (streamName) { stream = streamName[1].toLowerCase(); section = ''; } else section = name;
      continue;
    }
    const h4 = line.match(/^#### (.+)$/);
    if (h4) { section = cleanHeading(h4[1]); continue; }
    const row = line.match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/);
    if (!row || !section || /^(Teema|Topic)$/.test(row[1]) || /^-+$/.test(row[1])) continue;
    const school = /\(school\)|†/.test(row[1]);
    const title = row[1].replace(/\s*\(school\)/g, '').replace(/\s*†/g, '').trim();
    const level = plan.level(grade, stream);
    const state = numbers.get(level) || { lesson: 0, modules: new Map() };
    numbers.set(level, state);
    if (!state.modules.has(section)) state.modules.set(section, firstModule(plan.key, grade) + state.modules.size);
    const moduleNumber = state.modules.get(section);
    state.lesson += 1;
    const slug = `${plan.key}-${pad(grade)}${stream ? `-${stream}` : ''}`;
    const id = `plan-${slug}-${pad(state.lesson, 3)}`;
    records.push({
      id,
      type: 'lesson',
      title,
      description: [
        `План по классам: ${plan.ru}, ${grade} класс${stream ? ` (${stream})` : ''}${optional ? ', по желанию: ранний старт' : ''}.`,
        `Раздел: ${section}.`,
        `Тема: ${title} — ${row[2]}.`,
        ...(school ? ['Темы нет в официальной рекомендации: она из школьных программ или старого текста. Берём, если её проходит школа ученика.'] : []),
        'Пока только тема: урока и листов нет.',
      ].join('\n'),
      descriptionSource: 'school-plan-v1',
      subject: plan.subject,
      level,
      levelStage: level,
      topic: `${pad(moduleNumber)}. ${section}`,
      order: 1000 + state.lesson,
      curriculumId: `school-plan-${slug}-v1`,
      curriculumTitle: `Õppekava: ${level}`,
      roadmapLessonId: id,
      roadmapLessonNumber: state.lesson,
      roadmapModuleId: `${slug}-module-${pad(moduleNumber)}`,
      roadmapModuleNumber: moduleNumber,
      roadmapModuleTitle: section,
      roadmapModuleGoal: goal,
      roadmapKind: 'theme',
      roadmapTag: 'Teema',
      lessonTypeLabel: 'Teema',
      goal: row[2],
      schoolPlanTopic: true,
      roadmapManaged: false,
    });
  }
  return records;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const records = PLANS.flatMap((plan) => parsePlan(plan, readFileSync(join(docs, plan.file), 'utf8')));
  process.stdout.write(JSON.stringify(records));
}
