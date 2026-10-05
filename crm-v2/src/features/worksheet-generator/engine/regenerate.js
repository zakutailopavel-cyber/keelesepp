import { BLOCKS } from '../../worksheet-studio/engine/registry.js';
import { activitiesForPhase, activityById } from './activityCatalog.js';
import { createDiversityState, materializePhase } from './content.js';
import { replacementActivityCandidates } from './planner.js';
import { PLACEHOLDERS } from './quality.js';
import { shuffleSeeded } from './seed.js';

const PHASES = ['discover', 'practice', 'transfer'];

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

function fingerprint(value) {
  let hash = 2166136261;
  for (const char of stableStringify(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(36);
}

function diagnostic(severity, code, message, extra = {}) {
  return { severity, code, message, ...extra };
}

function phaseFromBlockId(blockId) {
  const match = String(blockId || '').match(/^gen_(discover|practice|transfer)_\d+$/);
  return match?.[1] || '';
}

function generatedIndex(blockId, phase) {
  const match = String(blockId || '').match(new RegExp(`^gen_${phase}_(\\d+)$`));
  return match ? Number(match[1]) - 1 : -1;
}

function inferActivityId(phase, block, generation) {
  const index = generatedIndex(block?.id, phase);
  const stored = index >= 0 ? generation?.activityIds?.[index] : '';
  const storedActivity = activityById(stored);
  if (storedActivity?.phase === phase && storedActivity.blockType === block?.type) return storedActivity.id;

  const matches = activitiesForPhase(phase).filter((activity) => activity.blockType === block?.type);
  return matches.length === 1 ? matches[0].id : '';
}

function usedActivities(phase, blocks, generation) {
  const result = new Set((generation?.activityIds || []).filter(Boolean));
  (blocks || []).forEach((block) => {
    const inferred = inferActivityId(phase, block, generation);
    if (inferred) result.add(inferred);
  });
  return [...result];
}

function baseBundleSeed(generation, phase) {
  if (generation?.lessonDna?.seed) return String(generation.lessonDna.seed);
  const seed = String(generation?.seed || '');
  const suffix = `:${phase}`;
  return seed.endsWith(suffix) ? seed.slice(0, -suffix.length) : seed;
}

function resolveContextId(profile, generation, phase) {
  if (generation?.contextId) return generation.contextId;
  const contexts = shuffleSeeded(profile?.contexts || [], `${baseBundleSeed(generation, phase)}:contexts`);
  return contexts[PHASES.indexOf(phase)]?.id || contexts[0]?.id || '';
}

function preserveLayout(current, generated) {
  const next = { ...generated, id: current.id, goal: current.goal || generated.goal };
  ['span', 'width', 'tone', 'minHeightMm'].forEach((key) => {
    if (current[key] !== undefined) next[key] = current[key];
  });
  return next;
}

function validReplacement(block) {
  const definition = BLOCKS[block?.type];
  if (!definition?.task) return false;
  if (PLACEHOLDERS.some((placeholder) => stableStringify(block.data || {}).includes(placeholder))) return false;
  if (definition.score && !definition.score(block.data || {}, () => '').length) return false;
  return true;
}

function duplicatesAnotherBlock(replacement, worksheetDoc, blockId) {
  const key = stableStringify({ type: replacement.type, data: replacement.data });
  return (worksheetDoc?.blocks || []).some((block) =>
    block.id !== blockId && stableStringify({ type: block.type, data: block.data }) === key);
}

export function canRegenerateTask({ block, generation } = {}) {
  const phase = generation?.phase || phaseFromBlockId(block?.id);
  return Boolean(
    block?.id &&
    PHASES.includes(phase) &&
    String(block.id).startsWith(`gen_${phase}_`) &&
    BLOCKS[block.type]?.task,
  );
}

export function regenerateTask({
  profile,
  generation = {},
  worksheetDoc,
  blockId,
  difficulty: difficultyOverride = '',
  salt = '',
} = {}) {
  const diagnostics = [];
  if (!profile) return { block: null, diagnostics: [diagnostic('error', 'REGENERATION_PROFILE_MISSING', 'Selle tunni generaatoriprofiil puudub.')] };

  const current = (worksheetDoc?.blocks || []).find((block) => block.id === blockId);
  const phase = generation?.phase || phaseFromBlockId(blockId);
  if (!current || !canRegenerateTask({ block: current, generation })) {
    return { block: null, diagnostics: [diagnostic('error', 'REGENERATION_BLOCK_UNSUPPORTED', 'Seda plokki ei saa automaatselt uuesti genereerida.')] };
  }

  const currentActivityId = inferActivityId(phase, current, generation);
  if (!currentActivityId) {
    return { block: null, diagnostics: [diagnostic('error', 'REGENERATION_SOURCE_UNKNOWN', 'Ülesande didaktilist lähteaktiivsust ei saanud tuvastada.')] };
  }

  const difficulty = difficultyOverride || generation?.difficulty || generation?.lessonDna?.difficulty || 'core';
  const focusIds = generation?.focusIds?.length
    ? generation.focusIds
    : generation?.lessonDna?.focusIds?.length
      ? generation.lessonDna.focusIds
      : (profile.focuses || []).map((item) => item.id);
  const contextId = resolveContextId(profile, generation, phase);
  const seedRoot = `${generation?.seed || generation?.lessonDna?.seed || profile.lessonId}:task:${blockId}:${fingerprint({ type: current.type, data: current.data })}${difficultyOverride ? `:${difficultyOverride}` : ''}${salt ? `:${salt}` : ''}`;
  const lessonKind = generation?.lessonDna?.lessonKind || profile.lessonKind || 'integrated';

  const plan = replacementActivityCandidates({
    phase,
    profile,
    lessonKind,
    difficulty,
    seed: seedRoot,
    currentActivityId,
    usedActivityIds: usedActivities(phase, worksheetDoc.blocks, generation),
  });
  diagnostics.push(...plan.diagnostics);
  if (!plan.activityIds.length) return { block: null, diagnostics };

  const currentKey = stableStringify({ type: current.type, data: current.data });
  for (const activityId of plan.activityIds) {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const generated = materializePhase({
        phase,
        profile,
        focusIds,
        contextId,
        difficulty,
        seed: `${seedRoot}:${activityId}:${attempt}`,
        state: createDiversityState(),
        activityIds: [activityId],
      })[0];
      if (!generated) continue;
      const replacement = preserveLayout(current, generated);
      if (!validReplacement(replacement)) continue;
      if (stableStringify({ type: replacement.type, data: replacement.data }) === currentKey) continue;
      if (duplicatesAnotherBlock(replacement, worksheetDoc, blockId)) continue;

      const mode = activityId === currentActivityId ? 'content' : 'activity';
      if (mode === 'content') {
        diagnostics.push(diagnostic('warning', 'REGENERATION_ACTIVITY_REUSED', 'Sama ülesandetüüp säilitati, kuid sisu genereeriti uuesti.', { activityId }));
      }
      return {
        block: replacement,
        activityId,
        previousActivityId: currentActivityId,
        mode,
        seed: `${seedRoot}:${activityId}:${attempt}`,
        diagnostics,
      };
    }
  }

  return {
    block: null,
    diagnostics: [...diagnostics, diagnostic('error', 'REGENERATION_NO_VARIANT', 'Selle ülesande jaoks ei leitud uut kvaliteetset varianti.')],
  };
}

// Up to `count` different replacements for one task (each differs from the current block and from each other),
// so the teacher can flip through them on the sheet and keep the best one.
export function regenerateTaskOptions({ count = 3, ...input } = {}) {
  const options = [];
  const seen = new Set();
  let last = null;
  for (let index = 0; index < count * 3 && options.length < count; index += 1) {
    const result = regenerateTask({ ...input, salt: index ? `v${index}` : '' });
    last = result;
    if (!result.block) continue;
    const key = stableStringify({ type: result.block.type, data: result.block.data });
    if (seen.has(key)) continue;
    seen.add(key);
    options.push(result);
  }
  return { options, diagnostics: options.length ? [] : last?.diagnostics || [] };
}
