// The B1 sheet check of 2026-10-12 (PR #571) corrected blocks of the Avasta upgrades (avastaModule1–10.js) that are
// already published. Re-running an upgrade never replaces a block that exists, so these corrections are applied as a
// three-way patch: avastaFixes20261012.json holds, per sheet („<lessonId>:<phase>”: the Avasta upgrades and the three
// phases of module 1, admin/module1ThreePhase.js), each corrected block's data before and after the check.
// A published block is replaced only when it still equals the „before” version; a block changed since (a teacher's
// edit, a later script) is left alone and reported. Meta (title, canDo, a goal) the same way.
import FIXES from './avastaFixes20261012.json';

// order-insensitive comparison (a stored map may come back with its keys in another order)
const stable = (value) => {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
};
const same = (a, b) => JSON.stringify(stable(a ?? null)) === JSON.stringify(stable(b ?? null));

// [{ lessonId, phase }] of every corrected sheet
export const AVASTA_FIX_SHEETS = Object.freeze(Object.keys(FIXES).map((key) => { const [lessonId, phase] = key.split(':'); return { lessonId, phase }; }));

const readMeta = (meta, key) => (key.startsWith('goals.') ? meta?.goals?.[key.slice(6)] : meta?.[key]);
const writeMeta = (meta, key, value) => (key.startsWith('goals.') ? { ...meta, goals: { ...(meta.goals || {}), [key.slice(6)]: value } } : { ...meta, [key]: value });

// → { document, updated: [ids], already: [ids], skipped: [ids] } (meta keys as „meta:<key>”)
export function applyAvastaFixes(lessonId, phase, document, fixes = FIXES) {
  const fix = fixes[`${lessonId}:${phase}`];
  const result = { document, updated: [], already: [], skipped: [] };
  if (!fix || !document?.blocks) return result;
  const blocks = document.blocks.map((block) => {
    const f = fix.blocks?.[block.id];
    if (!f) return block;
    if (block.type !== f.type) { result.skipped.push(block.id); return block; }
    if (same(block.data, f.after)) { result.already.push(block.id); return block; }
    if (same(block.data, f.before)) { result.updated.push(block.id); return { ...block, data: f.after }; }
    result.skipped.push(block.id);
    return block;
  });
  let meta = document.meta || {};
  Object.entries(fix.meta || {}).forEach(([key, [before, after]]) => {
    const now = readMeta(meta, key);
    if (now === after) result.already.push(`meta:${key}`);
    else if (now === before) { meta = writeMeta(meta, key, after); result.updated.push(`meta:${key}`); } else result.skipped.push(`meta:${key}`);
  });
  result.document = { ...document, meta, blocks };
  return result;
}
