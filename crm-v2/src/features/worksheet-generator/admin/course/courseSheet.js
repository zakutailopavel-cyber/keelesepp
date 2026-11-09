// How a course module becomes sheets (COURSES, PHASES, buildCourseSheet, moduleSheets), without the course content itself:
// the modules are in courseModules.<course>.js (docs/B1_B2_COURSE_PRODUCTION.md). A page that needs one course loads only
// that course (courseLoaders.js); registry.js is the whole list together, for the tests, tools and all-course pages.
import { withLessonArt } from '../../art/textbookArt.js';
import { withWordStrips } from '../../art/wordStrips.js';
import { withListeningAudio } from './listeningAudio.js';
import { nativeStage } from '../../../worksheet-studio/didactics/levels.js';
import { COURSE_EXAM, EXAM_PART_DEFAULTS, examPartDefaults, isEnglishExam } from '../../../worksheet-studio/engine/blocks/harnoScales.js';
import { B1_LESSON_GOALS } from './b1/lessonGoals.js';
import { A2_LESSON_GOALS } from './a2/lessonGoals.js';
import { B2_LESSON_GOALS } from './b2/lessonGoals.js';
import { C1_LESSON_GOALS } from './c1/lessonGoals.js';
import { EN_B2_LESSON_GOALS } from './en/b2/lessonGoals.js';
import { withSheetLanguage } from './sheetLanguage.js';
import { COURSE_NAMES, ENGLISH_COURSE_NAME } from '../../../curriculum/courseNames.js';
import { STATIONS_DESIGN, teacherPage } from './stations.js';


// display names by the target level (curriculum/courseNames.js, owner 2026-10-29): `label` = name · subtitle (admin
// pages show the part before „ ·”), `badge` is printed on every course sheet as „KeeleSepp · Eesti keel B1 · moodul N”
const named = (key) => ({ label: [COURSE_NAMES[key].name, COURSE_NAMES[key].subtitle].filter(Boolean).join(' · '), name: COURSE_NAMES[key].name, badge: `KeeleSepp · ${COURSE_NAMES[key].name}` });
export const COURSES = {
  a2: named('a2'),
  b1: named('b1'),
  // „B1 noorkeele õppija” (owner 2026-11-10): the A2 → B1 course rebuilt for teens and the 9th-grade exam track
  // (docs/A2B1_COURSE_BLUEPRINT.md §8), lesson design v3 stations; a separate course next to „Eesti keel B1”, so the
  // learners of the current course keep their sheets. Staff see it in „Kursuse tootmine”; nobody is assigned to it.
  b1noor: { label: 'B1 noorkeele õppija · noored ja 9. klass', name: 'B1 noorkeele õppija', badge: 'KeeleSepp · B1 noorkeele õppija' },
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
  // English B1 → B2 to the English state exam (docs/COURSE_FINAL_SHAPE_EN_B2.md): a fixed badge „KeeleSepp · English B2 ·
  // moodul N”, so MODULE.level can carry the stage (English B1+ / B2- / B2) for the level norms; no modules yet
  enb2: named('enB2'),
  // the Sunday children's groups 5–6, 6–7, 8–9 (kids/sheets.js; not in COURSE_MODULES: adult level gates do not apply)
  kids: { label: 'Lasterühmad 5–9 a', name: 'Lasterühmad 5–9 a', badge: 'KeeleSepp lastele' },
};

export const PHASES = {
  discover: { label: '1 Avasta', slot: 1, subtitle: 'Avasta teema kontekstis ja märka keelemustrit.' },
  practice: { label: '2 Harjuta', slot: 2, subtitle: 'Harjuta sihtvorme täpselt ja eri tüüpi ülesannetes.' },
  transfer: { label: '3 Kasuta', slot: 3, subtitle: 'Kasuta õpitut uues olukorras iseseisvalt.' },
};

// the lesson's own goal and sub-goals win over the generic defaults (contract A1–A3)
const LESSON_GOALS = { ...A2_LESSON_GOALS, ...B1_LESSON_GOALS, ...B2_LESSON_GOALS, ...C1_LESSON_GOALS, ...EN_B2_LESSON_GOALS };
export const lessonGoalsFor = (lessonId) => LESSON_GOALS[lessonId] || null;

const GOALS = {
  g_vocab: 'Õpilane kasutab mooduli põhisõnavara uutes lausetes.',
  g_read: 'Õpilane mõistab teksti põhiideed ja detaile.',
  g_notice: 'Õpilane märkab ja selgitab tunni keelemustrit.',
  g_use: 'Õpilane kasutab õpitut suulises ja kirjalikus suhtluses.',
};
// `g_listen` — „saan kuuldust aru”: the scored tasks done on a recording (listening gaps, Harno listening parts, questions
// on a recording heard again, dictation). It is not one of the generic defaults above: a lesson gets it in its
// lessonGoals entry (goals.g_listen + `tags` for its listening tasks) only when ≥ 2 of its tasks train it, so the
// sub-goal rules (≥ 2 tasks per sub-goal, final shape V9) hold. The skill estimate „Kuulamine” reads score.perGoal.g_listen
// (students/skillEstimate.js, docs/PROGRESS_ESTIMATE.md).
export const LISTENING_GOAL = 'g_listen';

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

// an exam part's header shows how the real Harno exam of the course weighs the part and its pass rule (engine/blocks/
// harno.jsx harnoPartLine); a module may name another level on the block (`exam: 'A2'` for an A2-form check in the B1
// course) or none (`exam: ''`)
// An English course (the English state exam, EN-RE) gets the exam's own part header: a B.examPart written without
// `exam` carries the B1 defaults (Estonian part name, B1 minutes and points), so every field still at its B1 default
// takes the English exam's value; a field the module set itself is kept.
function withHarnoExam(blocks, course) {
  const exam = COURSE_EXAM[course];
  if (!exam) return blocks;
  return blocks.map((b) => {
    if (b.type !== 'exampart' || 'exam' in (b.data || {})) return b;
    if (!isEnglishExam(exam)) return { ...b, data: { ...b.data, exam } };
    const was = EXAM_PART_DEFAULTS[b.data?.skill] || {};
    const now = examPartDefaults(exam, b.data?.skill) || {};
    const fill = Object.fromEntries(Object.entries(now).filter(([k]) => b.data?.[k] === undefined || b.data[k] === was[k]));
    return { ...b, data: { ...b.data, ...fill, exam } };
  });
}

// the teacher's answer key explains why each answer is right (engine/answerKey.js): a module may export EXPLAIN =
// { blockId: [one line per item] }, kept apart from the tasks so the sheet file stays readable
function withExplanations(blocks, explain) {
  if (!explain) return blocks;
  return blocks.map((b) => (explain[b.id] ? { ...b, data: { ...b.data, explain: explain[b.id].join('\n') } } : b));
}

// the lesson's textbook picture (art/visuals, docs/TEXTBOOK_ART_BIBLE.md) goes on its sheet where the sheet uses it, and
// word strips (art/words) stand before the tasks that use those words;
// listening blocks get their recorded audio (listeningAudio.json, tools/listening-audio)
// design v3 „stations” (docs/COURSE_DESIGN_STATIONS.md) is opted in per module; the module's exam lesson keeps design v2
// and the module's template (its exam parts are not stations)
function lessonDesign(mod, lesson) {
  if (mod.MODULE.design !== STATIONS_DESIGN) return { design: mod.MODULE.design, template: lesson.template || mod.MODULE.template };
  return lesson.assessment ? { design: 'v2', template: lesson.template || mod.MODULE.template } : { design: STATIONS_DESIGN, template: '' };
}
export function buildCourseSheet(mod, lessonId, phase) {
  const lesson = mod.LESSONS[lessonId];
  if (!lesson?.[phase]) throw new Error(`${lessonId}: etappi ${phase} ei ole.`);
  const course = COURSES[mod.MODULE.course];
  const { design, template } = lessonDesign(mod, lesson);
  const stationLesson = design === STATIONS_DESIGN;
  return withWordStrips(withLessonArt({
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
      // a speaking lesson (`oral: true`, suuline.js): one sheet, five claims on the same scheme; quality.js skips the lesson-shape rules
      ...(lesson.oral ? { oral: true, shortSheet: true } : {}),
      // a check lesson (Kontroll): its Kasuta sheet is the exam's writing and speaking part (gates.js / depth.js)
      ...(lesson.assessment ? { assessment: true } : {}),
      // design v2 (docs/COURSE_DESIGN_COMMUNICATIVE.md): its own variety and depth norms
      ...(design ? { design } : {}),
      // the sheet's language (default Estonian): Estonian-only checks (EKI word lists) skip other languages
      ...(mod.MODULE.language ? { language: mod.MODULE.language } : {}),
      // lesson template v3 (owner 2026-10-18, §11): 5–9 full tasks a sheet in a fixed lesson shape
      ...(template ? { template } : {}),
      // a station lesson's one teacher page (goal, stations with minutes, core 45-min path, alternative, short path, errors)
      ...(stationLesson && lesson.teacherPage ? { teacherPage: teacherPage(lesson) } : {}),
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
    blocks: withSheetLanguage(withHarnoExam(withExplanations(strictSpelling(withListeningAudio(lessonOrder(withLessonGoals(lesson[phase], LESSON_GOALS[lessonId])), lessonId), lesson.level || mod.MODULE.level), mod.EXPLAIN), mod.MODULE.course), mod.MODULE.language),
  }, lessonId, phase), lessonId, phase, undefined, Object.keys(mod.LESSONS));
}

// every sheet a module produces: { [lessonId]: { [phase]: doc } }
export function moduleSheets(mod) {
  return Object.fromEntries(Object.keys(mod.LESSONS).map((lessonId) => [lessonId,
    Object.fromEntries(Object.keys(PHASES).filter((p) => mod.LESSONS[lessonId][p]).map((p) => [p, buildCourseSheet(mod, lessonId, p)]))]));
}
