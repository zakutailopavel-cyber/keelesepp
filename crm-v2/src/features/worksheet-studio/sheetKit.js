// The worksheet constructor for outside authors (the ChatGPT connector, functions/sheet-builder-api.js): the block
// catalogue with a filled example of every block, the same checks as the constructor (quality.js) and a normaliser that
// gives a hand-written sheet the ids, widths and tones the editor needs. Bundled into functions/generated/sheet-kit.cjs
// by `npm run build:sheet-kit` (crm-v2) — rebuild after changing blocks or checks; sheetKit.test.js fails when stale.
import { BLOCKS, checkDocument } from './engine/registry.js';
import { SCHEMA, TONES, newDocument } from './engine/schema.js';
import { sampleDocument } from './engine/sample.js';
import { analyzeWorksheet } from './quality.js';

export const KIT_SCHEMA = SCHEMA;
export const MAX_BLOCKS = 80;
export const MAX_DOC_BYTES = 700000;
export const PHASES = ['discover', 'practice', 'transfer', 'opik'];

const plain = (value) => JSON.parse(JSON.stringify(value ?? null));

export function blockCatalog() {
  return Object.values(BLOCKS).map((def) => ({
    type: def.type,
    label: def.label,
    group: def.group || '',
    task: Boolean(def.task),
    width: def.width || 'half',
    tone: def.tone || 'white',
    ...(def.variants?.length
      ? { variants: def.variants.map((v) => ({ variant: v.variant, label: v.label, hint: v.hint || '', example: plain(def.create(v.variant)) })) }
      : { example: plain(def.create()) }),
  }));
}

export const blockTypes = () => Object.keys(BLOCKS).sort();
export const sampleSheet = () => plain(sampleDocument());
export const tones = () => Object.keys(TONES);

let counter = 0;
const id = (prefix) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}`;

// a sheet from outside → the editor's shape: schema, meta defaults, every block with id / width / span / tone
export function normalizeSheet(input = {}) {
  const base = newDocument();
  const doc = plain(input) || {};
  const meta = { ...base.meta, ...(doc.meta || {}), footer: { ...base.meta.footer, ...(doc.meta?.footer || {}) }, goals: { ...(doc.meta?.goals || {}) } };
  const seen = new Set();
  const blocks = (Array.isArray(doc.blocks) ? doc.blocks : []).map((block) => {
    const def = BLOCKS[block?.type];
    let blockId = String(block?.id || '').trim();
    if (!/^[A-Za-z0-9_-]{1,60}$/.test(blockId) || seen.has(blockId)) blockId = id('b');
    seen.add(blockId);
    const width = block?.width === 'full' || block?.width === 'half' ? block.width : def?.width || 'half';
    return {
      ...block,
      id: blockId,
      width,
      span: width === 'full' ? 12 : 6,
      tone: TONES[block?.tone] ? block.tone : def?.tone || 'white',
      data: block?.data && typeof block.data === 'object' ? block.data : {},
    };
  });
  return { schema: SCHEMA, id: /^ws_[A-Za-z0-9_-]{1,60}$/.test(String(doc.id || '')) ? doc.id : id('ws'), meta, blocks };
}

// { ready, errors: [text], issues: [{ level, code, text }], minutes } — errors stop saving, issues are the constructor's
export function checkSheet(doc) {
  const errors = [];
  if (!doc || doc.schema !== SCHEMA) errors.push(`schema peab olema "${SCHEMA}".`);
  if (!String(doc?.meta?.title || '').trim()) errors.push('meta.title puudub.');
  if (!Array.isArray(doc?.blocks) || !doc.blocks.length) errors.push('blocks on tühi.');
  if ((doc?.blocks || []).length > MAX_BLOCKS) errors.push(`Kuni ${MAX_BLOCKS} plokki.`);
  (doc?.blocks || []).forEach((block, index) => { if (!BLOCKS[block?.type]) errors.push(`blocks[${index}]: tundmatu tüüp "${block?.type}". Lubatud: ${blockTypes().join(', ')}.`); });
  const json = JSON.stringify(doc || {});
  if (json.includes('"data:')) errors.push('Pilte ja heli ei saa lisada data:-aadressina; jäta pilt tühjaks, õpetaja lisab selle konstruktoris.');
  if (new globalThis.TextEncoder().encode(json).length > MAX_DOC_BYTES) errors.push('Tööleht on liiga suur; jaga see kaheks.');
  if (errors.length) return { ready: false, errors, issues: [], minutes: 0 };
  let quality = { issues: [], ready: true, minutes: 0 };
  try { quality = analyzeWorksheet(doc); } catch (error) { errors.push(`Kontroll katkes: ${error.message}`); }
  try { checkDocument(doc, {}); } catch (error) { errors.push(`Mõni plokk ei ole loetav: ${error.message}`); }
  const issues = (quality.issues || []).map(({ level, code, text }) => ({ level, code, text }));
  return { ready: !errors.length && !issues.some((issue) => issue.level === 'error'), errors, issues, minutes: quality.minutes || 0 };
}
