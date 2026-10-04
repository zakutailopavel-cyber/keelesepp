import { normalizeLevel } from './vocabulary.js';

export const DIFFICULTY_MODES = Object.freeze(['support', 'core', 'challenge']);

export function normalizeDifficulty(value) {
  const clean = String(value || 'core').trim().toLowerCase();
  return DIFFICULTY_MODES.includes(clean) ? clean : 'core';
}

const LEVEL_BASE = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

export function difficultySpec({ level = 'A1', mode = 'core', phase = 'practice' } = {}) {
  const normalizedMode = normalizeDifficulty(mode);
  const base = normalizeLevel(level).base || 'A1';
  const rank = LEVEL_BASE[base] || 1;
  const support = normalizedMode === 'support';
  const challenge = normalizedMode === 'challenge';
  const productionBoost = phase === 'transfer' ? 1 : 0;

  return {
    mode: normalizedMode,
    level: base,
    preferCognitiveLoad: support ? Math.max(1, rank) : challenge ? Math.min(5, rank + 3) : Math.min(5, rank + 1),
    showWordBank: support || (!challenge && rank <= 2),
    distractorCount: support ? 1 : challenge ? 3 : 2,
    closedItemCount: support ? 2 : challenge ? 4 : 3,
    clockItemCount: support ? 3 : challenge ? 5 : 4,
    speakingSeconds: support ? [45, 90] : challenge ? [90 + productionBoost * 30, 180] : [60, 120],
    writingSentences: support ? [4, 7] : challenge ? [8 + productionBoost * 2, 14] : [6, 10],
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
