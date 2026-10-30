// The course modules produced in code (docs/B1_B2_COURSE_PRODUCTION.md). Each module file exports MODULE and LESSONS
// ({ [lessonId]: { title, canDo, practice?, transfer?, discover? } }); the admin page „Kursuse tootmine” previews
// and publishes them lesson by lesson. Avasta sheets that are already published are not part of these files unless a
// module says so.
import { withLessonArt } from '../../art/textbookArt.js';
import { withListeningAudio } from './listeningAudio.js';
import { nativeStage } from '../../../worksheet-studio/didactics/levels.js';
import { B1_LESSON_GOALS } from './b1/lessonGoals.js';
import { A2_LESSON_GOALS } from './a2/lessonGoals.js';
import { B2_LESSON_GOALS } from './b2/lessonGoals.js';
import { C1_LESSON_GOALS } from './c1/lessonGoals.js';
import * as a2m01 from './a2/module01.js';
import * as a2m02 from './a2/module02.js';
import * as a2m03 from './a2/module03.js';
import * as a2m04 from './a2/module04.js';
import * as a2m05 from './a2/module05.js';
import * as a2m06 from './a2/module06.js';
import * as a2m07 from './a2/module07.js';
import * as a2m08 from './a2/module08.js';
import * as a2m09 from './a2/module09.js';
import * as a2m10 from './a2/module10.js';
import * as a2m11 from './a2/module11.js';
import * as a2m12 from './a2/module12.js';
import * as a2m13 from './a2/module13.js';
import * as a2m14 from './a2/module14.js';
import * as a2m15 from './a2/module15.js';
import * as a2m16 from './a2/module16.js';
import * as a2m17 from './a2/module17.js';
import * as a2m18 from './a2/module18.js';
import * as a2m19 from './a2/module19.js';
import * as a2m20 from './a2/module20.js';
import * as b1m01 from './b1/module01.js';
import * as b1m02 from './b1/module02.js';
import * as b1m03 from './b1/module03.js';
import * as b1m04 from './b1/module04.js';
import * as b1m05 from './b1/module05.js';
import * as b1m06 from './b1/module06.js';
import * as b1m07 from './b1/module07.js';
import * as b1m08 from './b1/module08.js';
import * as b1m09 from './b1/module09.js';
import * as b1m10 from './b1/module10.js';
import * as b1m11 from './b1/module11.js';
import * as b1m12 from './b1/module12.js';
import * as b1m13 from './b1/module13.js';
import * as b1m14 from './b1/module14.js';
import * as b1m15 from './b1/module15.js';
import * as b1m16 from './b1/module16.js';
import * as b1m17 from './b1/module17.js';
import * as b1m18 from './b1/module18.js';
import * as b2m01 from './b2/module01.js';
import * as b2m02 from './b2/module02.js';
import * as b2m03 from './b2/module03.js';
import * as b2m04 from './b2/module04.js';
import * as b2m05 from './b2/module05.js';
import * as b2m06 from './b2/module06.js';
import * as b2m07 from './b2/module07.js';
import * as b2m08 from './b2/module08.js';
import * as b2m09 from './b2/module09.js';
import * as b2m10 from './b2/module10.js';
import * as b2m11 from './b2/module11.js';
import * as b2m12 from './b2/module12.js';
import * as b2m13 from './b2/module13.js';
import * as b2m14 from './b2/module14.js';
import * as b2m15 from './b2/module15.js';
import * as b2m16 from './b2/module16.js';
import * as b2m17 from './b2/module17.js';
import * as b2m18 from './b2/module18.js';
import * as b2kaanded from './b2/kaanded.js';
import * as a2lihtminevik from './a2/lihtminevik.js';
import * as a2kohakaanded from './a2/kohakaanded.js';
import * as c1m01 from './c1/module01.js';
import * as c1m02 from './c1/module02.js';
import * as c1m03 from './c1/module03.js';
import * as c1m04 from './c1/module04.js';
import * as c1m05 from './c1/module05.js';
import * as c1m06 from './c1/module06.js';
import * as c1m07 from './c1/module07.js';
import * as c1m08 from './c1/module08.js';
import * as c1m09 from './c1/module09.js';
import * as c1m10 from './c1/module10.js';
import * as ek9m01 from './ek9/module01.js';
import * as ena2m01 from './en/a2/module01.js';
import * as ena2m02 from './en/a2/module02.js';
import * as enb1m01 from './en/b1/module01.js';
import * as enb1m02 from './en/b1/module02.js';
import * as enb1m03 from './en/b1/module03.js';
import * as enb1m04 from './en/b1/module04.js';
import * as enb1m05 from './en/b1/module05.js';
import * as enb1m06 from './en/b1/module06.js';
import * as enb1m07 from './en/b1/module07.js';
import * as enb1m08 from './en/b1/module08.js';
import * as enb1m09 from './en/b1/module09.js';
import * as enb1m10 from './en/b1/module10.js';
import * as ena2m03 from './en/a2/module03.js';
import * as ena2m04 from './en/a2/module04.js';
import * as ena2m05 from './en/a2/module05.js';
import * as ena2m06 from './en/a2/module06.js';
import * as ena2m07 from './en/a2/module07.js';
import * as ena2m08 from './en/a2/module08.js';
import * as ena2m09 from './en/a2/module09.js';
import * as ena2m10 from './en/a2/module10.js';
import { COURSE_NAMES, ENGLISH_COURSE_NAME } from '../../../curriculum/courseNames.js';

export const COURSE_MODULES = [a2m01, a2m02, a2m03, a2m04, a2m05, a2m06, a2m07, a2m08, a2m09, a2m10, a2m11, a2m12, a2m13, a2m14, a2m15, a2m16, a2m17, a2m18, a2m19, a2m20, a2lihtminevik, a2kohakaanded, b1m01, b1m02, b1m03, b1m04, b1m05, b1m06, b1m07, b1m08, b1m09, b1m10, b1m11, b1m12, b1m13, b1m14, b1m15, b1m16, b1m17, b1m18, b2m01, b2m02, b2m03, b2m04, b2m05, b2m06, b2m07, b2m08, b2m09, b2m10, b2m11, b2m12, b2m13, b2m14, b2m15, b2m16, b2m17, b2m18, b2kaanded, c1m01, c1m02, c1m03, c1m04, c1m05, c1m06, c1m07, c1m08, c1m09, c1m10, ek9m01, ena2m01, ena2m02, enb1m01, enb1m02, enb1m03, enb1m04, enb1m05, enb1m06, enb1m07, enb1m08, enb1m09, enb1m10, ena2m03, ena2m04, ena2m05, ena2m06, ena2m07, ena2m08, ena2m09, ena2m10];

// display names by the target level (curriculum/courseNames.js, owner 2026-10-29): `label` = name · subtitle (admin
// pages show the part before „ ·”), `badge` is printed on every course sheet as „KeeleSepp · Eesti keel B1 · moodul N”
const named = (key) => ({ label: [COURSE_NAMES[key].name, COURSE_NAMES[key].subtitle].filter(Boolean).join(' · '), name: COURSE_NAMES[key].name, badge: `KeeleSepp · ${COURSE_NAMES[key].name}` });
export const COURSES = {
  a2: named('a2'),
  b1: named('b1'),
  b2: named('b2'),
  c1: named('c1'),
  // the course to the Harno C1 exam (docs/COURSE_FINAL_SHAPE_C1.md, docs/B2_C1_CURRICULUM.md); no modules yet
  b2c1: named('b2c1'),
  // Estonian as a mother tongue (docs/NATIVE_ESTONIAN_9_12_PLAN.md): exam preparation for grades 9 and 12
  ek9: { label: '9. klass emakeel · eesti keel emakeelena', name: '9. klass emakeel', badge: 'KeeleSepp · 9. klass emakeel' },
  ek12: { label: '12. klass emakeel · eesti keel emakeelena', name: '12. klass emakeel', badge: 'KeeleSepp · 12. klass emakeel' },
  // English (docs/ENGLISH_COURSE_PLAN.md): A1 → B1 by CEFR level, the B1 aim of the Estonian basic school exam; the badge
  // names the module's own level (MODULE.level „English A2” / „English B1”)
  en: { label: ENGLISH_COURSE_NAME, name: ENGLISH_COURSE_NAME, badge: 'KeeleSepp · English', badgeByLevel: true },
  // the Sunday children's groups 5–6, 6–7, 8–9 (kids/sheets.js; not in COURSE_MODULES: adult level gates do not apply)
  kids: { label: 'Lasterühmad 5–9 a', name: 'Lasterühmad 5–9 a', badge: 'KeeleSepp lastele' },
};

export const PHASES = {
  discover: { label: '1 Avasta', slot: 1, subtitle: 'Avasta teema kontekstis ja märka keelemustrit.' },
  practice: { label: '2 Harjuta', slot: 2, subtitle: 'Harjuta sihtvorme täpselt ja eri tüüpi ülesannetes.' },
  transfer: { label: '3 Kasuta', slot: 3, subtitle: 'Kasuta õpitut uues olukorras iseseisvalt.' },
};

// the lesson's own goal and sub-goals win over the generic defaults (contract A1–A3)
const LESSON_GOALS = { ...A2_LESSON_GOALS, ...B1_LESSON_GOALS, ...B2_LESSON_GOALS, ...C1_LESSON_GOALS };
export const lessonGoalsFor = (lessonId) => LESSON_GOALS[lessonId] || null;

const GOALS = {
  g_vocab: 'Õpilane kasutab mooduli põhisõnavara uutes lausetes.',
  g_read: 'Õpilane mõistab teksti põhiideed ja detaile.',
  g_notice: 'Õpilane märkab ja selgitab tunni keelemustrit.',
  g_use: 'Õpilane kasutab õpitut suulises ja kirjalikus suhtluses.',
};

// every task trains one of the lesson's own sub-goals (contract A3): a lesson's `tags` set a task's real sub-goal, and in
// a lesson with three sub-goals (checks, grammar lessons) a task tagged with a missing one counts as language form
export function withLessonGoals(blocks = [], entry = null) {
  if (!entry?.goals) return blocks;
  return blocks.map((b) => {
    const goal = entry.tags?.[b.id] || b.goal;
    const own = !goal || entry.goals[goal] ? goal : 'g_notice';
    return own === b.goal ? b : { ...b, goal: own };
  });
}

export function moduleNumber(mod) { return Number(String(mod.MODULE.id).split('-').pop()); }

// The author's order is the lesson's order (docs/COURSE_FINAL_SHAPE_B1.md §9, audit 2026-10-26 problem 1: the old rank
// pushed planning → speaking / writing / role cards to the end of every sheet, so every lesson ended „speak → write”).
// Only what is pedagogically required is still moved, stable inside each group:
// - the rubric (the checklist or the exam-scale rubric) judges the product of the sheet, so it comes after every task;
// - the self-check („Kontrolli end”) closes the sheet, after the rubric.
// Everything else — an opening text, input before its questions, a plan before the speech, the final task — is where
// the author put it; the gates (finalShape.js V1/V2) check that consecutive lessons do not repeat one rhythm.
const RANK = { rubric: 4, examrubric: 4, selfcheck: 5 };
export function lessonOrder(blocks = []) {
  return blocks.map((b, i) => ({ b, i, r: RANK[b.type] || 1 })).sort((x, y) => x.r - y.r || x.i - y.i).map((x) => x.b);
}

// the mother-tongue course (9. / 12. klass) checks commas, capitals and letters: its gap, fix and rewrite tasks are
// scored strictly (engine/schema.js strictNorm)
const STRICT_TYPES = new Set(['gaps', 'errorfix', 'transformation']);
function strictSpelling(blocks, level) {
  if (!nativeStage(level)) return blocks;
  return blocks.map((b) => (STRICT_TYPES.has(b.type) ? { ...b, data: { ...b.data, strict: true } } : b));
}

// the teacher's answer key explains why each answer is right (engine/answerKey.js): a module may export EXPLAIN =
// { blockId: [one line per item] }, kept apart from the tasks so the sheet file stays readable
function withExplanations(blocks, explain) {
  if (!explain) return blocks;
  return blocks.map((b) => (explain[b.id] ? { ...b, data: { ...b.data, explain: explain[b.id].join('\n') } } : b));
}

// the lesson's textbook picture (art/visuals, docs/TEXTBOOK_ART_BIBLE.md) goes on its sheet after the opening text;
// listening blocks get their recorded audio (listeningAudio.json, tools/listening-audio)
export function buildCourseSheet(mod, lessonId, phase) {
  const lesson = mod.LESSONS[lessonId];
  if (!lesson?.[phase]) throw new Error(`${lessonId}: etappi ${phase} ei ole.`);
  const course = COURSES[mod.MODULE.course];
  return withLessonArt({
    schema: 'keelesepp.worksheet/2',
    id: `ws_${lessonId}_${phase}`,
    meta: {
      title: lesson.title,
      subtitle: (mod.MODULE.phases?.[phase] || PHASES[phase]).subtitle,
      level: lesson.level || mod.MODULE.level,
      module: mod.MODULE.title,
      canDo: LESSON_GOALS[lessonId]?.canDo || lesson.canDo,
      goals: LESSON_GOALS[lessonId]?.goals || lesson.goals || GOALS,
      phase,
      displayLabel: (mod.MODULE.phases?.[phase] || PHASES[phase]).label,
      // modules written before the 40–55 min rule are marked until they are expanded (docs/B1_B2_COURSE_PRODUCTION.md)
      // a lesson may mark its own short sheets: `shortSheet: true` (every phase) or a list of phases — a spaced-review sheet
      // or a short use task of a supplement (a2/lihtminevik.js), 10–30 min by design
      ...(mod.MODULE.shortSheets || lesson.shortSheet === true || (Array.isArray(lesson.shortSheet) && lesson.shortSheet.includes(phase)) ? { shortSheet: true } : {}),
      // a diagnostic check (`diagnostic: true`, a2/kohakaanded.js): closed scored tasks, a baseline and a parallel re-test;
      // quality.js skips the lesson-shape rules for it
      ...(lesson.diagnostic ? { diagnostic: true, shortSheet: true } : {}),
      // a check lesson (Kontroll): its Kasuta sheet is the exam's writing and speaking part (gates.js / depth.js)
      ...(lesson.assessment ? { assessment: true } : {}),
      // design v2 (docs/COURSE_DESIGN_COMMUNICATIVE.md): its own variety and depth norms
      ...(mod.MODULE.design ? { design: mod.MODULE.design } : {}),
      // the sheet's language (default Estonian): Estonian-only checks (EKI word lists) skip other languages
      ...(mod.MODULE.language ? { language: mod.MODULE.language } : {}),
      // lesson template v3 (owner 2026-10-18, §11): 5–9 full tasks a sheet in a fixed lesson shape
      ...(lesson.template || mod.MODULE.template ? { template: lesson.template || mod.MODULE.template } : {}),
      // the lesson's archetype and lead skills (docs/COURSE_FINAL_SHAPE_B1.md §4; blocks.js shape / withShapes): the
      // final-shape gates read them from the sheets
      ...(lesson.archetype ? { archetype: lesson.archetype } : {}),
      ...(lesson.lead ? { lead: lesson.lead } : {}),
      // a supplement (extra homework sheets, not a roadmap module) is named, not numbered
      ...(mod.MODULE.supplement ? { supplement: true } : {}),
      badge: `${course.badgeByLevel && mod.MODULE.level ? `KeeleSepp · ${mod.MODULE.level}` : course.badge} · ${mod.MODULE.supplement ? mod.MODULE.title : `moodul ${moduleNumber(mod)}`}`,
      slogan: 'Rohkem kui lihtsalt keel!',
      footer: { tagline: 'Targem suhtlus. Suurem maailm.', url: 'www.epkoolitus.ee' },
    },
    blocks: withExplanations(strictSpelling(withListeningAudio(lessonOrder(withLessonGoals(lesson[phase], LESSON_GOALS[lessonId])), lessonId), lesson.level || mod.MODULE.level), mod.EXPLAIN),
  }, lessonId, phase);
}

// every sheet a module produces: { [lessonId]: { [phase]: doc } }
export function moduleSheets(mod) {
  return Object.fromEntries(Object.keys(mod.LESSONS).map((lessonId) => [lessonId,
    Object.fromEntries(Object.keys(PHASES).filter((p) => mod.LESSONS[lessonId][p]).map((p) => [p, buildCourseSheet(mod, lessonId, p)]))]));
}
