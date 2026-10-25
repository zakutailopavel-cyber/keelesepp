// How long a learner works on a sheet (owner 2026-10-10: a lesson is 60 min, one sheet should take 40–50 min; the
// first course sheets were done in ~10 min). Minutes per block from its type, number of items, text length and the
// level's reading speed. Rates are calibrated on the owner's observation (first course sheets, ~10–15 min of real
// work): a gap ≈ 20 s, a choice ≈ 15 s, a written sentence ≈ 1 min.
import { levelKey } from './levels.js';
import { groupItems } from '../engine/schema.js';

export const SHEET_MINUTES = { min: 40, max: 55 };
const WPM = { A1: 50, A2: 60, 'A2+': 70, 'B1-': 80, B1: 90, 'B1+': 100, 'B2-': 105, B2: 110, C1: 130, EK9: 140, EK12: 160 };

const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
const words = (v) => String(v || '').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const gapsIn = (v) => (String(v || '').match(/\[[^\]]*\]/g) || []).length;
const list = (v) => String(v || '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

// minutes for one block at a level
// design v2 (docs/COURSE_DESIGN_COMMUNICATIVE.md): speaking and role play are pair work in class — both partners talk on
// every question and the roles are swapped, so they take longer than one learner's answer
// Lesson template v4 (docs/METHODOLOGY_STANDARD.md §3, owner 2026-10-22): the older rates count a meaning item (sort,
// match, true/false, a gap of a scheme or a card) at 7–20 s — less than reading it — while a translated sentence takes
// 48 s, so a sheet reached its minutes with drills. v4 counts a meaning item as reading + deciding.
const V4_RATES = { choice: 0.4, truefalse: 0.3, match: 0.35, categorize: 0.25, crossword: 0.45, diagram: 0.5, profiles: 0.5 };
export function blockMinutes(block, level = 'A2', design = '', template = '') {
  const d = block?.data || {};
  const v4 = template === 'v4' ? V4_RATES : null;
  const wpm = WPM[levelKey(level)] || 70;
  if (design === 'v2' && block?.type === 'speaking') return Math.min(10, lines(d.questions).length * Math.max(1, (Number(d.maxSec) || 120) / 60 / 2) * 2 + 1);
  if (design === 'v2' && block?.type === 'rolecards') return 9;
  switch (block?.type) {
    case 'reading': return (words(d.passage) / wpm) * 1.5 + lines(d.questions).length * 0.6;
    case 'listening': return (words(d.transcript || d.sentences) / 110) * 2 + Math.max(gapsIn(d.sentences), lines(d.sentences).length) * 0.4;
    case 'gaps': return lines(d.sentences).length * 0.35;
    case 'choice': return (d.questions || []).length * (v4?.choice || 0.3);
    // a text with option gaps: read the text, then about 20 s per gap
    case 'cloze': return (words(String(d.passage || '').replace(/\{[^}]*\}/g, 'x')) / wpm) * 1.5 + (String(d.passage || '').match(/\{/g) || []).length * 0.35;
    // a text with form gaps: read it, about 25 s per written form
    case 'formtext': return (words(String(d.passage || '').replace(/\[[^\]]*\]\s*\([^)]*\)/g, 'x')) / wpm) * 1.5 + (String(d.passage || '').match(/\]\s*\(/g) || []).length * 0.4;
    // a text with sentence gaps: read the text and the sentences, then about 40 s per gap
    case 'insertion': return (words(String(d.passage || '').replace(/\[\[|\]\]/g, '') + ' ' + (d.extra || '')) / wpm) * 1.5 + (String(d.passage || '').match(/\[\[/g) || []).length * 0.7;
    // Harno R1: read the ads, then match each situation (≈ 30 s)
    case 'adsmatch': return (words((d.ads || []).map((a) => `${a.title || ''} ${a.text || ''}`).join(' ')) / wpm) * 1.5 + (d.situations || []).length * 0.5;
    // exam listening: the recording (played `plays` times) and about 25 s per item
    case 'examlisten': return (words(d.transcript) / 110) * (Number(d.plays) || 2) + ((d.questions || []).length + (d.statements || []).length + (d.pairs || []).length) * 0.4;
    // the Harno writing card: a questionnaire ≈ 50 s an answer; a text ≈ 1 min per 10 words + reading and planning the card
    case 'examwriting': return lines(d.questions).length ? lines(d.questions).length * 0.8 + 1 : ((Number(d.minWords) || 50) + (Number(d.maxWords) || 70)) / 2 / 10 + 3;
    // an agreement or a phone call in pairs: preparation, the talk, roles swapped
    case 'speakcard': return 8;
    case 'examrubric': return 1;
    case 'exampart': return 0.3;
    case 'truefalse': return (d.statements || []).length * (v4?.truefalse || 0.2);
    case 'match': return (d.pairs || []).length * (v4?.match || 0.2);
    case 'manymatch': return lines(d.left).length * 0.3;
    case 'categorize': return (d.groups || []).reduce((n, g) => n + groupItems(g).length, 0) * (v4?.categorize || 0.12);
    case 'wordforms': return (d.rows || []).length * 0.3;
    case 'errorfix': return (d.rows || []).length * 0.6;
    case 'transformation': return (d.rows || []).length * 0.6;
    case 'wordorder': return lines(d.sentences).length * 0.5;
    case 'table': return gapsIn(d.rows) * 0.25 + (gapsIn(d.rows) ? 0 : lines(d.rows).length * 1);
    case 'translation': return (d.rows || []).length * 0.8;
    case 'dictation': return lines(d.sentences).length * 0.8;
    case 'crossword': return (d.rows || []).length * (v4?.crossword || 0.3);
    case 'dialogue': return Math.max(gapsIn(JSON.stringify(d.lines || [])) * 0.3, (d.lines || []).length * 0.15);
    case 'clock': return (d.items || []).length * 0.25;
    // reading a data chart before writing about it
    case 'chart': return 2;
    case 'diagram': return Math.max(0.5, gapsIn(JSON.stringify(d)) * (v4?.diagram || 0.3));
    case 'pictures': return (d.items || []).length * 0.25;
    // character / ID cards: read the facts, fill the gaps of the sentences
    case 'profiles': return (d.people || []).reduce((n, p) => n + lines(p.facts).length * 0.1 + gapsIn(p.sentences) * (v4?.profiles || 0.35), 0);
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
  return Math.round((doc?.blocks || []).reduce((n, b) => n + blockMinutes(b, level, doc?.meta?.design, doc?.meta?.template), 0));
}
