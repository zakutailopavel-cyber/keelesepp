// Builds crm-v2/src/features/curriculum/lessonPlanData.json: the lesson plan text (description) of every roadmap
// lesson in data/ (A2, A2→B1, B1→B2, C1), plus the old module text a lesson may still carry as its description.
// Run after changing data/*.json or lessonPlans.js:  node scripts/build-lesson-plans.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { c1LessonPlan, roadmapLessonPlan } from '../crm-v2/src/features/curriculum/lessonPlans.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(root, 'data');
const load = (prefix) => fs.readdirSync(dataDir)
  .filter((file) => file.startsWith(`${prefix}-`) && /-\d+\.json$/.test(file)).sort()
  .flatMap((file) => {
    const doc = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    return (doc.modules || [doc.module]).flatMap((module) => module.lessons.map((lesson) => [module, lesson]));
  });

const plans = {};
for (const prefix of ['keelesepp-a2-roadmap', 'keelesepp-a2-b1-roadmap', 'keelesepp-b1-b2-roadmap']) {
  for (const [module, lesson] of load(prefix)) plans[lesson.id] = { description: roadmapLessonPlan(module, lesson), previous: module.goal || '' };
}
for (const [module, lesson] of load('keelesepp-c1-curriculum')) plans[lesson.id] = { description: c1LessonPlan(module, lesson), previous: module.description || '' };

const out = path.join(root, 'crm-v2/src/features/curriculum/lessonPlanData.json');
fs.writeFileSync(out, `${JSON.stringify(plans, null, 1)}\n`);
const lengths = Object.values(plans).map((plan) => plan.description.length);
console.log(`${Object.keys(plans).length} lesson plans → ${path.relative(root, out)} (longest ${Math.max(...lengths)} chars)`);
