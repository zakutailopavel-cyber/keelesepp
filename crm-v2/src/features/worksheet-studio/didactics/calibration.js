// Calibration of the level norms from real answers (docs/DIDACTIC_ENGINE.md, step 7): over all submitted worksheets,
// per level × task type the share of right answers. A combination that learners mostly fail (under 50%) or nearly
// always solve (over 92%) with enough answers is a sign the norms or the generator's amounts need tuning.
import { BLOCKS, scoreDocument } from '../engine/registry.js';
import { LEVEL_ORDER, levelKey } from './levels.js';

export const MIN_ANSWERS = 20;

export function calibrate(assignments = []) {
  const cells = new Map(); // "level|type" → { level, type, right, total, sheets:Set }
  for (const a of assignments) {
    if (a?.status !== 'done' || !a.worksheetDoc?.blocks?.length) continue;
    const level = levelKey(a.worksheetDoc.meta?.level);
    let perBlock = {};
    try { perBlock = scoreDocument(a.worksheetDoc, a.answers || {}).perBlock; } catch { continue; }
    for (const block of a.worksheetDoc.blocks) {
      const items = perBlock[block.id];
      if (!items?.length || !BLOCKS[block.type]) continue;
      const key = `${level}|${block.type}`;
      const cell = cells.get(key) || { level, type: block.type, right: 0, total: 0, sheets: new Set() };
      cell.right += items.filter((i) => i.ok).length;
      cell.total += items.length;
      cell.sheets.add(a.id);
      cells.set(key, cell);
    }
  }
  return [...cells.values()].map((c) => {
    const pct = Math.round((c.right / c.total) * 100);
    const verdict = c.total < MIN_ANSWERS ? 'few' : pct < 50 ? 'hard' : pct > 92 ? 'easy' : 'ok';
    return { level: c.level, type: c.type, label: BLOCKS[c.type]?.label || c.type, right: c.right, total: c.total, sheets: c.sheets.size, pct, verdict };
  }).sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level) || b.total - a.total);
}
