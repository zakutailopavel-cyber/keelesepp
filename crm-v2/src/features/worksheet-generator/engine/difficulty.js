import { normalizeLevel } from './vocabulary.js';
import { LEVELS, levelKey } from '../../worksheet-studio/didactics/levels.js';

export const DIFFICULTY_MODES = Object.freeze(['support', 'core', 'challenge']);

export function normalizeDifficulty(value) {
  const clean = String(value || 'core').trim().toLowerCase();
  return DIFFICULTY_MODES.includes(clean) ? clean : 'core';
}

const LEVEL_BASE = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

// Amounts follow the level's didactic norms (worksheet-studio/didactics/levels.js, docs/DIDACTIC_ENGINE.md): answers
// per closed task, speaking seconds, writing amount and word bank use. `level` may be a lesson stage (A2+, A2+/B1-).
// support = the profile's lower part, core = the middle, challenge = the upper part.
const lower = ([a, b]) => [a, Math.round((a + b) / 2)];
const upper = ([a, b]) => [Math.round((a + b) / 2), b];
export function difficultySpec({ level = 'A1', mode = 'core' } = {}) { // callers also pass `phase`; the norms do not depend on it
  const normalizedMode = normalizeDifficulty(mode);
  const base = normalizeLevel(level).base || 'A1';
  const rank = LEVEL_BASE[base] || 1;
  const support = normalizedMode === 'support';
  const challenge = normalizedMode === 'challenge';
  const norm = LEVELS[levelKey(level)] || LEVELS.A2;
  const [itemsMin, itemsMax] = norm.items;
  // from B1 on the writing norm is in words; about 12 words per sentence
  const writing = norm.writing.sentences || norm.writing.words.map((w) => Math.round(w / 12));
  const pick = (range) => (support ? lower(range) : challenge ? upper(range) : range);
  return {
    mode: normalizedMode,
    level: base,
    preferCognitiveLoad: support ? Math.max(1, rank) : challenge ? Math.min(5, rank + 3) : Math.min(5, rank + 1),
    showWordBank: norm.bank === 'yes' ? !challenge : norm.bank === 'tip' ? support : false,
    distractorCount: support ? 1 : challenge ? 3 : 2,
    closedItemCount: Math.min(itemsMax, support ? itemsMin : challenge ? itemsMin + 2 : itemsMin + 1),
    clockItemCount: support ? 3 : challenge ? 5 : 4,
    speakingSeconds: pick(norm.speaking),
    writingSentences: pick(writing),
    planningLines: support ? 3 : challenge ? 1 : 2,
  };
}

export function orderActivitiesByDifficulty(activities = [], { level = 'A1', mode = 'core', phase = 'practice', seedOrder = [] } = {}) {
  const spec = difficultySpec({ level, mode, phase });
  const order = new Map(seedOrder.map((item, index) => [item.id || item, index]));
  const direction = spec.mode === 'support' ? 1 : spec.mode === 'challenge' ? -1 : 0;
  if (!direction) return [...activities].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
  return [...activities].sort((a, b) => {
    const load = direction * (Number(a.cognitiveLoad || 1) - Number(b.cognitiveLoad || 1));
    if (load) return load;
    return (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999);
  });
}
