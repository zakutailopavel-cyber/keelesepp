// How long a learner works on a sheet (owner 2026-10-10: a lesson is 60 min, one sheet should take 40–50 min; the
// first course sheets were done in ~10 min). Minutes per block from its type, number of items, text length and the
// level's reading speed. Rates are calibrated on the owner's observation (first course sheets, ~10–15 min of real
// work): a gap ≈ 20 s, a choice ≈ 15 s, a written sentence ≈ 1 min.
import { levelKey } from './levels.js';

export const SHEET_MINUTES = { min: 40, max: 55 };
const WPM = { A1: 50, A2: 60, 'A2+': 70, 'B1-': 80, B1: 90, B2: 110, C1: 130 };

const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
const words = (v) => String(v || '').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const gapsIn = (v) => (String(v || '').match(/\[[^\]]*\]/g) || []).length;
const list = (v) => String(v || '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

// minutes for one block at a level
export function blockMinutes(block, level = 'A2') {
  const d = block?.data || {};
  const wpm = WPM[levelKey(level)] || 70;
  switch (block?.type) {
    case 'reading': return (words(d.passage) / wpm) * 1.5 + lines(d.questions).length * 0.6;
    case 'listening': return (words(d.transcript || d.sentences) / 110) * 2 + Math.max(gapsIn(d.sentences), lines(d.sentences).length) * 0.4;
    case 'gaps': return lines(d.sentences).length * 0.35;
    case 'choice': return (d.questions || []).length * 0.3;
    case 'truefalse': return (d.statements || []).length * 0.2;
    case 'match': return (d.pairs || []).length * 0.2;
    case 'manymatch': return lines(d.left).length * 0.3;
    case 'categorize': return (d.groups || []).reduce((n, g) => n + list(g.words).length, 0) * 0.12;
    case 'wordforms': return (d.rows || []).length * 0.3;
    case 'errorfix': return (d.rows || []).length * 0.6;
    case 'transformation': return (d.rows || []).length * 0.6;
    case 'wordorder': return lines(d.sentences).length * 0.5;
    case 'table': return gapsIn(d.rows) * 0.25 + (gapsIn(d.rows) ? 0 : lines(d.rows).length * 1);
    case 'translation': return (d.rows || []).length * 0.8;
    case 'dictation': return lines(d.sentences).length * 0.8;
    case 'crossword': return (d.rows || []).length * 0.3;
    case 'dialogue': return Math.max(gapsIn(JSON.stringify(d.lines || [])) * 0.3, (d.lines || []).length * 0.15);
    case 'clock': return (d.items || []).length * 0.25;
    case 'diagram': return Math.max(0.5, gapsIn(JSON.stringify(d)) * 0.3);
    case 'pictures': return (d.items || []).length * 0.25;
    case 'speaking': return ((Number(d.minSec) || 60) + (Number(d.maxSec) || 120)) / 2 / 60 + 1;
    case 'rolecards': return 5;
    case 'planning': return lines(d.prompts).length * 0.5;
    case 'writing': return ((Number(d.minSent) || 5) + (Number(d.maxSent) || 7)) / 2 * 1.1;
    case 'guidedletter': return ((Number(d.minWords) || 60) + (Number(d.maxWords) || 90)) / 2 / 10 + 2;
    case 'vocab': return list(d.words).length * 0.08;
    case 'phrasebank': return 1;
    case 'selfcheck': case 'rubric': return 1;
    case 'text': case 'tip': case 'notice': return 0.5;
    case 'image': return 0.3;
    default: return 0.5;
  }
}

// the whole sheet, rounded to whole minutes
export function sheetMinutes(doc) {
  const level = doc?.meta?.level || 'A2';
  return Math.round((doc?.blocks || []).reduce((n, b) => n + blockMinutes(b, level), 0));
}
