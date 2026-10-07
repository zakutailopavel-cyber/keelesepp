import a2Module01 from './visuals/a2-module-01.js';

// Textbook illustrations (docs/TEXTBOOK_ART_BIBLE.md): the content agent adds one visuals file per module under
// ./visuals and lists it here; the image files live in crm-v2/public/textbook-art/<level>/<lessonId>/<id>.webp.
const MODULES = [a2Module01];

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

// Picture questions beside the illustration (a brief may give its own `prompts`), by phase, simple A2 Estonian.
const PHASE_PROMPTS = {
  discover: ['Kes on pildil?', 'Kus nad on?', 'Mis toimub?'],
  practice: ['Mida inimesed teevad?', 'Mida nad ütlevad?', 'Kirjelda pilti 2–3 lausega.'],
  transfer: ['Mis olukord see on?', 'Mida sina selles olukorras teeksid?', 'Räägi paarilisega.'],
};
const ART_SPAN = 8;
const PROMPT_SPAN = 4;

// the „Vaata pilti” card that sits beside the picture: the picture's learning job for the learner
export function artPromptBlock(visual) {
  const prompts = Array.isArray(visual.prompts) && visual.prompts.length ? visual.prompts : PHASE_PROMPTS[visual.phase] || PHASE_PROMPTS.discover;
  return { id: `artq_${visual.id}`, type: 'notice', span: PROMPT_SPAN, width: 'half', data: { title: 'Vaata pilti', lines: prompts.join('\n'), artFor: visual.id } };
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

// adds the lesson's illustrations for this phase after the opening text of the sheet, once
export function withLessonArt(doc, lessonId, phase, visuals = ALL_VISUALS) {
  const missing = visualsFor(lessonId, phase, visuals).filter((visual) => !hasArt(doc, visual));
  if (!doc || !missing.length) return doc;
  const blocks = [...(doc.blocks || [])];
  const at = ['text', 'notice', 'tip'].includes(blocks[0]?.type) ? 1 : 0;
  blocks.splice(at, 0, ...missing.flatMap((visual) => [artBlock(visual), artPromptBlock(visual)]));
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
