// The course modules produced in code (docs/B1_B2_COURSE_PRODUCTION.md). Each module file exports MODULE and LESSONS
// ({ [lessonId]: { title, canDo, practice?, transfer?, discover? } }); the admin page „Kursuse tootmine” previews
// and publishes them lesson by lesson. Avasta sheets that are already published are not part of these files unless a
// module says so.
import * as b1m02 from './b1/module02.js';
import * as b1m03 from './b1/module03.js';
import * as b1m04 from './b1/module04.js';
import * as b1m05 from './b1/module05.js';
import * as b1m06 from './b1/module06.js';
import * as b1m07 from './b1/module07.js';
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
import * as c1m01 from './c1/module01.js';
import * as c1m02 from './c1/module02.js';
import * as c1m03 from './c1/module03.js';
import * as c1m04 from './c1/module04.js';
import * as c1m05 from './c1/module05.js';
import * as c1m06 from './c1/module06.js';
import * as c1m07 from './c1/module07.js';
import * as c1m08 from './c1/module08.js';
import * as c1m09 from './c1/module09.js';

export const COURSE_MODULES = [b1m02, b1m03, b1m04, b1m05, b1m06, b1m07, b2m01, b2m02, b2m03, b2m04, b2m05, b2m06, b2m07, b2m08, b2m09, b2m10, b2m11, b2m12, b2m13, b2m14, b2m15, b2m16, b2m17, b2m18, c1m01, c1m02, c1m03, c1m04, c1m05, c1m06, c1m07, c1m08, c1m09];

export const COURSES = {
  b1: { label: 'B1 · A2 → B1 õpitee', badge: 'KeeleSepp A2 → B1' },
  b2: { label: 'B2 · B1 → B2 õpitee', badge: 'KeeleSepp B1 → B2' },
  c1: { label: 'C1 · B2 → C1 õpitee', badge: 'KeeleSepp B2 → C1' },
};

export const PHASES = {
  discover: { label: '1 Avasta', slot: 1, subtitle: 'Avasta teema kontekstis ja märka keelemustrit.' },
  practice: { label: '2 Harjuta', slot: 2, subtitle: 'Harjuta sihtvorme täpselt ja eri tüüpi ülesannetes.' },
  transfer: { label: '3 Kasuta', slot: 3, subtitle: 'Kasuta õpitut uues olukorras iseseisvalt.' },
};

const GOALS = {
  g_vocab: 'Õpilane kasutab mooduli põhisõnavara uutes lausetes.',
  g_read: 'Õpilane mõistab teksti põhiideed ja detaile.',
  g_notice: 'Õpilane märkab ja selgitab tunni keelemustrit.',
  g_use: 'Õpilane kasutab õpitut suulises ja kirjalikus suhtluses.',
};

export function moduleNumber(mod) { return Number(String(mod.MODULE.id).split('-').pop()); }

// controlled work first, free use after it, the self-check last (didactic norm „kontrollitud → vaba”); an opening
// situation (text / tip) stays on top. Stable: the author's order holds inside each group.
const RANK = { planning: 2, speaking: 3, writing: 3, rolecards: 3, guidedletter: 3, rubric: 4, selfcheck: 5 };
export function lessonOrder(blocks = []) {
  const head = ['text', 'tip'].includes(blocks[0]?.type) ? [blocks[0]] : [];
  const rest = blocks.slice(head.length).map((b, i) => ({ b, i, r: RANK[b.type] || 1 }));
  return [...head, ...rest.sort((x, y) => x.r - y.r || x.i - y.i).map((x) => x.b)];
}

export function buildCourseSheet(mod, lessonId, phase) {
  const lesson = mod.LESSONS[lessonId];
  if (!lesson?.[phase]) throw new Error(`${lessonId}: etappi ${phase} ei ole.`);
  const course = COURSES[mod.MODULE.course];
  return {
    schema: 'keelesepp.worksheet/2',
    id: `ws_${lessonId}_${phase}`,
    meta: {
      title: lesson.title,
      subtitle: PHASES[phase].subtitle,
      level: lesson.level || mod.MODULE.level,
      module: mod.MODULE.title,
      canDo: lesson.canDo,
      goals: GOALS,
      phase,
      displayLabel: PHASES[phase].label,
      // modules written before the 40–55 min rule are marked until they are expanded (docs/B1_B2_COURSE_PRODUCTION.md)
      ...(mod.MODULE.shortSheets ? { shortSheet: true } : {}),
      badge: `${course.badge} · moodul ${moduleNumber(mod)}`,
      slogan: 'Rohkem kui lihtsalt keel!',
      footer: { tagline: 'Targem suhtlus. Suurem maailm.', url: 'www.epkoolitus.ee' },
    },
    blocks: lessonOrder(lesson[phase]),
  };
}

// every sheet a module produces: { [lessonId]: { [phase]: doc } }
export function moduleSheets(mod) {
  return Object.fromEntries(Object.keys(mod.LESSONS).map((lessonId) => [lessonId,
    Object.fromEntries(Object.keys(PHASES).filter((p) => mod.LESSONS[lessonId][p]).map((p) => [p, buildCourseSheet(mod, lessonId, p)]))]));
}
