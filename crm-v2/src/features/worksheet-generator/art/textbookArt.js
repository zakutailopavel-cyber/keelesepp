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

// the worksheet image block for one illustration (artId marks it so it is never added twice)
export function artBlock(visual) {
  const format = FORMATS[visual.format] || FORMATS.scene;
  return {
    id: `art_${visual.id}`,
    type: 'image',
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
  blocks.splice(at, 0, ...missing.map(artBlock));
  return { ...doc, blocks };
}

export const missingArt = (doc, lessonId, phase, visuals = ALL_VISUALS) => visualsFor(lessonId, phase, visuals).filter((visual) => !hasArt(doc, visual));
