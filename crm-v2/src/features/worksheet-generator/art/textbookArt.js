import a2Module01 from './visuals/a2-module-01.js';
import a2Module02 from './visuals/a2-module-02.js';
import a2Module03 from './visuals/a2-module-03.js';
import a2Module04 from './visuals/a2-module-04.js';
import a2Module05 from './visuals/a2-module-05.js';
import a2Module06 from './visuals/a2-module-06.js';
import a2Module07 from './visuals/a2-module-07.js';
import a2Module08 from './visuals/a2-module-08.js';
import a2Module09 from './visuals/a2-module-09.js';
import a2Module10 from './visuals/a2-module-10.js';
import a2Module11 from './visuals/a2-module-11.js';
import a2Module12 from './visuals/a2-module-12.js';
import a2Module13 from './visuals/a2-module-13.js';
import a2Module14 from './visuals/a2-module-14.js';
import a2Module15 from './visuals/a2-module-15.js';
import a2Module16 from './visuals/a2-module-16.js';
import a2Module17 from './visuals/a2-module-17.js';
import b1Module01 from './visuals/b1-module-01.js';
import b1Module02 from './visuals/b1-module-02.js';
import b1Module03 from './visuals/b1-module-03.js';
import b1Module04 from './visuals/b1-module-04.js';
import b1Module05 from './visuals/b1-module-05.js';
import b1Module06 from './visuals/b1-module-06.js';
import b1Module07 from './visuals/b1-module-07.js';
import b1Module08 from './visuals/b1-module-08.js';
import b1Module09 from './visuals/b1-module-09.js';
import b1Module10 from './visuals/b1-module-10.js';
import b2Module01 from './visuals/b2-module-01.js';
import b2Module02 from './visuals/b2-module-02.js';
import b2Module03 from './visuals/b2-module-03.js';
import b2Module04 from './visuals/b2-module-04.js';
import b2Module05 from './visuals/b2-module-05.js';
import b2Module06 from './visuals/b2-module-06.js';
import b2Module07 from './visuals/b2-module-07.js';
import b2Module08 from './visuals/b2-module-08.js';
import b2Module09 from './visuals/b2-module-09.js';
import b2Module10 from './visuals/b2-module-10.js';
import b2Module11 from './visuals/b2-module-11.js';
import b2Module12 from './visuals/b2-module-12.js';
import b2Module13 from './visuals/b2-module-13.js';
import b2Module14 from './visuals/b2-module-14.js';
import b2Module15 from './visuals/b2-module-15.js';
import b2Module16 from './visuals/b2-module-16.js';
import b2Module17 from './visuals/b2-module-17.js';
import b2Module18 from './visuals/b2-module-18.js';
import c1Module01 from './visuals/c1-module-01.js';
import c1Module02 from './visuals/c1-module-02.js';
import c1Module03 from './visuals/c1-module-03.js';
import c1Module04 from './visuals/c1-module-04.js';
import c1Module05 from './visuals/c1-module-05.js';
import c1Module06 from './visuals/c1-module-06.js';
import c1Module07 from './visuals/c1-module-07.js';
import c1Module08 from './visuals/c1-module-08.js';
import c1Module09 from './visuals/c1-module-09.js';
import c1Module10 from './visuals/c1-module-10.js';

import { rowsOf } from '../../worksheet-studio/engine/layout.js';

// Textbook illustrations (docs/TEXTBOOK_ART_BIBLE.md): the content agent adds one visuals file per module under
// ./visuals and lists it here; the image files live in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
const MODULES = [a2Module01, a2Module02, a2Module03, a2Module04, a2Module05, a2Module06, a2Module07, a2Module08, a2Module09, a2Module10, a2Module11, a2Module12, a2Module13, a2Module14, a2Module15, a2Module16, a2Module17, b1Module01, b1Module02, b1Module03, b1Module04, b1Module05, b1Module06, b1Module07, b1Module08, b1Module09, b1Module10, b2Module01, b2Module02, b2Module03, b2Module04, b2Module05, b2Module06, b2Module07, b2Module08, b2Module09, b2Module10, b2Module11, b2Module12, b2Module13, b2Module14, b2Module15, b2Module16, b2Module17, b2Module18, c1Module01, c1Module02, c1Module03, c1Module04, c1Module05, c1Module06, c1Module07, c1Module08, c1Module09, c1Module10];

const PHASES = new Set(['discover', 'practice', 'transfer']);
const FORMATS = { scene: { aspect: '3:2', width: 1600, height: 1067 }, object: { aspect: '1:1', width: 1600, height: 1600 }, opener: { aspect: '3:4', width: 1200, height: 1600 } };

// lesson id → level folder: a2-001 → a2, a2b1-016 → b1, b1b2-004 → b2, est-c1-010 → c1
export function artLevel(lessonId) {
  const id = String(lessonId || '');
  if (id.startsWith('a2b1-')) return 'b1';
  if (id.startsWith('b1b2-')) return 'b2';
  if (id.startsWith('est-c1-')) return 'c1';
  if (id.startsWith('a2-')) return 'a2';
  return '';
}

export const visualLessonId = (visual) => String(visual?.id || '').replace(/-(avasta|harjuta|kasuta)-\d+$/, '');
export const visualSrc = (visual) => `/textbook-art/${artLevel(visualLessonId(visual))}/${visualLessonId(visual)}/${visual.id}.webp`;

export const ALL_VISUALS = Object.freeze(MODULES.flat().filter((visual) => visual?.id && PHASES.has(visual.phase) && artLevel(visualLessonId(visual))));

export function visualsFor(lessonId, phase, visuals = ALL_VISUALS) {
  return visuals.filter((visual) => visualLessonId(visual) === lessonId && (!phase || visual.phase === phase));
}

// Picture questions beside the illustration. A brief gives its own `prompts` (owner 2026-10-18: „вопросы рядом с
// картинкой никак не связаны с ней” — every picture had the same three A2 questions). Without them: at A2 the simple
// phase questions, from B1 on questions that tie the picture to the lesson; both are marked `generic` and a v3 sheet
// does not pass with them (quality.js).
const PHASE_PROMPTS = {
  discover: ['Kes on pildil?', 'Kus nad on?', 'Mis toimub?'],
  practice: ['Mida inimesed teevad?', 'Mida nad ütlevad?', 'Kirjelda pilti 2–3 lausega.'],
  transfer: ['Mis olukord see on?', 'Mida sina selles olukorras teeksid?', 'Räägi paarilisega.'],
};
const LEVEL_PROMPTS = ['Mida pilt näitab? Nimeta kaks detaili.', 'Kuidas on pilt seotud tunni teemaga?', 'Kas oled pildiallkirjaga nõus? Miks?'];
const ART_SPAN = 8;
const PROMPT_SPAN = 4;

// the „Vaata pilti” card that sits beside the picture: the picture's learning job for the learner
export function artPromptBlock(visual) {
  const own = Array.isArray(visual.prompts) && visual.prompts.length;
  const level = artLevel(visualLessonId(visual));
  const prompts = own ? visual.prompts : level && level !== 'a2' ? LEVEL_PROMPTS : PHASE_PROMPTS[visual.phase] || PHASE_PROMPTS.discover;
  return { id: `artq_${visual.id}`, type: 'notice', span: PROMPT_SPAN, width: 'half', data: { title: 'Vaata pilti', lines: prompts.join('\n'), artFor: visual.id, ...(own ? {} : { generic: true }) } };
}

// the worksheet image block for one illustration (artId marks it so it is never added twice); ⅔ of the row
export function artBlock(visual) {
  const format = FORMATS[visual.format] || FORMATS.scene;
  return {
    id: `art_${visual.id}`,
    type: 'image',
    span: ART_SPAN,
    width: 'half',
    data: {
      img: { src: visualSrc(visual), width: format.width, height: format.height, focus: { x: 50, y: 50 } },
      aspect: format.aspect,
      caption: visual.caption || '',
      alt: visual.alt || visual.caption || '',
      bubble: '',
      artId: visual.id,
    },
  };
}

const hasArt = (doc, visual) => (doc?.blocks || []).some((block) => block?.data?.artId === visual.id);

// Where a scene picture stands (owner 2026-10-30: „иллюстрации должны … эргономично дополнять рабочие листы на протяжении
// всего урока”): where it is used. A brief may name the place (`place: '<blockId>'`); otherwise directly before the first
// speaking or writing task, or earlier when a block before that task talks about the picture; a sheet with no such task
// keeps it after the opening text. A hint or a text in front of the task stays with the task, and a row is never split.
const USES_PICTURE = new Set(['speaking', 'rolecards', 'speakcard', 'writing', 'guidedletter']);
const SCENE_LEAD_INS = new Set(['notice', 'tip', 'text', 'heading', 'phrasebank']);
const OWN_PICTURES = new Set(['image', 'picmatch', 'pictures', 'scenelabel', 'picrows']);
const NOT_READ = new Set(['teacher', 'explain', 'transcript', 'audio', 'img', 'alt', 'caption']);
const added = (block) => Boolean(block?.data?.artId || block?.data?.artFor);
const isLeadIn = (block) => SCENE_LEAD_INS.has(block?.type) && !block?.data?.review && !added(block);
const readText = (value) => (typeof value === 'string' ? value : Array.isArray(value) ? value.map(readText).join(' ')
  : value && typeof value === 'object' ? Object.entries(value).filter(([key]) => !NOT_READ.has(key)).map(([, item]) => readText(item)).join(' ') : '');
const talksAboutPicture = (block) => !added(block) && !OWN_PICTURES.has(block?.type) && !block?.data?.img && /\bpil(t|di|ti)/i.test(readText(block?.data));
function toRowStart(blocks, index) {
  let start = 0;
  for (const row of rowsOf(blocks)) {
    if (index < start + row.length) return start;
    start += row.length;
  }
  return index;
}
export function scenePlace(blocks, visual) {
  const named = visual?.place ? blocks.findIndex((block) => block?.id === visual.place) : -1;
  if (named >= 0) return toRowStart(blocks, named);
  const top = ['text', 'notice', 'tip'].includes(blocks[0]?.type) ? 1 : 0;
  const used = blocks.findIndex((block) => USES_PICTURE.has(block?.type) && !block?.data?.artFor);
  const told = blocks.findIndex(talksAboutPicture);
  const first = used < 0 ? told : told < 0 ? used : Math.min(used, told);
  if (first < 0) return top;
  let at = first;
  while (at > 0 && isLeadIn(blocks[at - 1])) at -= 1;
  return Math.max(top, toRowStart(blocks, at));
}

// adds the lesson's illustrations for this phase where the sheet uses them, once
export function withLessonArt(doc, lessonId, phase, visuals = ALL_VISUALS) {
  const missing = visualsFor(lessonId, phase, visuals).filter((visual) => !hasArt(doc, visual));
  if (!doc || !missing.length) return doc;
  const blocks = [...(doc.blocks || [])];
  missing.forEach((visual) => blocks.splice(scenePlace(blocks, visual), 0, artBlock(visual), artPromptBlock(visual)));
  return { ...doc, blocks };
}

// Sheets made before the picture had its own row: the half-width picture left half a row empty. Give it ⅔ of the
// row and the „Vaata pilti” card beside it. Returns the same doc when nothing needs fixing.
export function withArtLayout(doc, visuals = ALL_VISUALS) {
  const blocks = doc?.blocks || [];
  const legacy = blocks.filter((block) => block?.type === 'image' && block.data?.artId && !block.span);
  if (!legacy.length) return doc;
  const next = [];
  for (const block of blocks) {
    if (!(block?.type === 'image' && block.data?.artId && !block.span)) { next.push(block); continue; }
    const visual = visuals.find((item) => item.id === block.data.artId) || { id: block.data.artId, phase: 'discover' };
    next.push({ ...block, span: ART_SPAN, width: 'half' });
    if (!blocks.some((item) => item?.data?.artFor === block.data.artId)) next.push(artPromptBlock(visual));
  }
  return { ...doc, blocks: next };
}

export const missingArt = (doc, lessonId, phase, visuals = ALL_VISUALS) => visualsFor(lessonId, phase, visuals).filter((visual) => !hasArt(doc, visual));
