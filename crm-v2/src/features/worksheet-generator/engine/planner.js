import { activitiesForPhase, activityById } from './activityCatalog.js';
import { orderActivitiesByDifficulty } from './difficulty.js';
import { normalizeLessonKind } from './lessonKind.js';
import { shuffleSeeded } from './seed.js';
import { normalizeLevel } from './vocabulary.js';

const LEVEL_RANK = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

const PHASE_REQUIREMENTS = {
  discover: ['input', 'noticing', 'reflection'],
  practice: ['accuracy', 'controlled'],
  transfer: ['oral', 'written', 'reflection'],
};

function diagnostic(severity, code, message, extra = {}) {
  return { severity, code, message, ...extra };
}

function countBank(profile, key) {
  return Array.isArray(profile?.banks?.[key]) ? profile.banks[key].length : 0;
}

function focusVocabularyCount(profile) {
  const focusIds = new Set((profile?.focuses || []).map((item) => item.id));
  return (profile?.activeVocabulary || []).filter((item) => (item.focusIds || []).some((id) => focusIds.has(id))).length;
}

function requirementAvailable(profile, requirement) {
  const vocabulary = profile?.activeVocabulary || [];
  switch (requirement) {
    case 'vocabulary': return vocabulary.length >= 3;
    case 'vocabularyTranslations': return vocabulary.filter((item) => item.translation).length >= 3;
    case 'vocabularyTranslations3': return vocabulary.filter((item) => item.translation).length >= 3;
    case 'focusVocabulary': return focusVocabularyCount(profile) >= 3;
    case 'sentences1': return countBank(profile, 'sentences') >= 1;
    case 'sentences2': return countBank(profile, 'sentences') >= 2;
    case 'errorPairs': return countBank(profile, 'errorPairs') >= 2;
    case 'translations': return countBank(profile, 'translations') >= 2;
    case 'transformations': return countBank(profile, 'transformations') >= 2;
    case 'dialogues': return countBank(profile, 'dialogues') >= 1;
    case 'listeningScripts': return countBank(profile, 'listeningScripts') >= 1;
    case 'readingDocuments': return countBank(profile, 'readingDocuments') >= 1;
    case 'speakingOrSuccess': return countBank(profile, 'speakingPrompts') >= 1 || (profile?.successCriteria || []).length >= 1;
    case 'writingOrSuccess': return countBank(profile, 'writingPrompts') >= 1 || (profile?.successCriteria || []).length >= 1;
    case 'writingPrompts': return countBank(profile, 'writingPrompts') >= 1;
    case 'formalLetterPrompt': return countBank(profile, 'formalLetterPrompts') >= 1;
    case 'successCriteria': return (profile?.successCriteria || []).length >= 1;
    case 'contextTimes': return (profile?.contexts || []).some((context) => (context.times || []).length >= 3);
    default: return false;
  }
}

function normalizeHistory(activityHistory) {
  if (Array.isArray(activityHistory)) return activityHistory.filter(Boolean);
  if (Array.isArray(activityHistory?.recentActivityIds)) return activityHistory.recentActivityIds.filter(Boolean);
  return [];
}

function levelFits(activity, level) {
  const base = normalizeLevel(level).base || 'A1';
  const rank = LEVEL_RANK[base] || 1;
  const min = LEVEL_RANK[activity.minLevel] || 1;
  const max = LEVEL_RANK[activity.maxLevel] || 5;
  const maxLoad = Math.min(5, rank + 3);
  return rank >= min && rank <= max && Number(activity.cognitiveLoad || 1) <= maxLoad;
}

function lessonKindFits(activity, lessonKind) {
  const kinds = activity.lessonKinds || [];
  return !kinds.length || kinds.includes(lessonKind);
}

function eligibleActivities({ phase, profile, lessonKind }) {
  return activitiesForPhase(phase).filter((activity) =>
    levelFits(activity, profile?.level) &&
    lessonKindFits(activity, lessonKind) &&
    (activity.needs || []).every((need) => requirementAvailable(profile, need)));
}

function takeCandidate(candidates, selected, usedFamilies, predicate = () => true) {
  const strict = candidates.find((item) => !selected.includes(item.id) && !usedFamilies.has(item.family) && predicate(item));
  const relaxed = strict || candidates.find((item) => !selected.includes(item.id) && predicate(item));
  if (!relaxed) return null;
  selected.push(relaxed.id);
  usedFamilies.add(relaxed.family);
  return relaxed;
}

export function planPhaseActivities({
  phase,
  profile = {},
  lessonKind = 'integrated',
  seed = 'worksheet',
  activityHistory = [],
  difficulty = 'core',
  count = 5,
} = {}) {
  const diagnostics = [];
  if (!PHASE_REQUIREMENTS[phase]) {
    return { activityIds: [], diagnostics: [diagnostic('error', 'DIDACTIC_PHASE_UNKNOWN', `Tundmatu didaktiline faas: ${phase}`)] };
  }

  const normalizedKind = normalizeLessonKind(lessonKind);
  const candidates = eligibleActivities({ phase, profile, lessonKind: normalizedKind });
  if (candidates.length < count) {
    diagnostics.push(diagnostic('error', 'DIDACTIC_PLAN_INSUFFICIENT', `${phase}: sobivaid ülesandetüüpe on ${candidates.length}, vaja on vähemalt ${count}.`, { phase }));
    return { activityIds: [], diagnostics };
  }

  const recent = new Set(normalizeHistory(activityHistory));
  const shuffled = shuffleSeeded(candidates, `${seed}:${phase}:catalog`);
  const difficultyOrdered = orderActivitiesByDifficulty(shuffled, { level: profile?.level, mode: difficulty, phase, seedOrder: shuffled });
  const fresh = difficultyOrdered.filter((item) => !recent.has(item.id));
  const cooled = difficultyOrdered.filter((item) => recent.has(item.id));
  const ordered = [...fresh, ...cooled];
  const selected = [];
  const usedFamilies = new Set();

  for (const tag of PHASE_REQUIREMENTS[phase]) {
    const picked = takeCandidate(ordered, selected, usedFamilies, (item) => (item.tags || []).includes(tag));
    if (!picked) diagnostics.push(diagnostic('warning', 'DIDACTIC_REQUIREMENT_UNAVAILABLE', `${phase}: omadust "${tag}" ei saanud eraldi ülesandega katta.`, { phase, tag }));
  }

  while (selected.length < count) {
    const picked = takeCandidate(ordered, selected, usedFamilies);
    if (!picked) {
      const fallback = ordered.find((item) => !selected.includes(item.id));
      if (!fallback) break;
      selected.push(fallback.id);
    }
  }

  if (selected.length < count) {
    diagnostics.push(diagnostic('error', 'DIDACTIC_PLAN_INSUFFICIENT', `${phase}: plaani jäi ainult ${selected.length} ülesannet.`, { phase }));
  }

  const repeated = selected.filter((id) => recent.has(id));
  if (repeated.length) {
    diagnostics.push(diagnostic('warning', 'ACTIVITY_COOLDOWN_REUSED', `${phase}: ${repeated.length} ülesandetüüpi tuli uuesti kasutada, sest värskeid sobivaid variante ei jätkunud.`, { phase, activityIds: repeated }));
  }

  return { activityIds: selected.slice(0, count), diagnostics };
}

function ensurePhaseActivity({ phase, activityIds, profile, lessonKind, activityId }) {
  if (!activityId || activityIds.includes(activityId)) return activityIds;
  const candidate = eligibleActivities({ phase, profile, lessonKind }).find((activity) => activity.id === activityId);
  if (!candidate) return activityIds;
  return [...activityIds.slice(0, Math.max(0, activityIds.length - 1)), candidate.id];
}

function ensureLessonKindSkill({ phase, activityIds, profile, lessonKind, skill }) {
  if (!skill || activityIds.some((id) => (activityById(id)?.skills || []).includes(skill))) return activityIds;
  const candidate = eligibleActivities({ phase, profile, lessonKind })
    .find((activity) => (activity.skills || []).includes(skill) && !activityIds.includes(activity.id));
  if (!candidate) return activityIds;
  return [...activityIds.slice(0, Math.max(0, activityIds.length - 1)), candidate.id];
}

export function planLessonActivities({
  profile = {},
  lessonKind = 'integrated',
  seed = 'worksheet',
  activityHistory = [],
  difficulty = 'core',
  countPerPhase = 5,
} = {}) {
  const phases = {};
  const diagnostics = [];
  ['discover', 'practice', 'transfer'].forEach((phase) => {
    const plan = planPhaseActivities({
      phase,
      profile,
      lessonKind,
      seed,
      activityHistory,
      difficulty,
      count: countPerPhase,
    });
    phases[phase] = plan.activityIds;
    diagnostics.push(...plan.diagnostics);
  });

  const normalizedKind = normalizeLessonKind(lessonKind);
  if (normalizedKind === 'listening' || (normalizedKind === 'grammar' && countBank(profile, 'listeningScripts') > 0)) {
    phases.practice = ensurePhaseActivity({ phase: 'practice', activityIds: phases.practice, profile, lessonKind: normalizedKind, activityId: 'practice-listening-comprehension' });
  }
  if (normalizedKind === 'writing') {
    phases.transfer = ensureLessonKindSkill({ phase: 'transfer', activityIds: phases.transfer, profile, lessonKind: normalizedKind, skill: 'writing' });
  }
  if (normalizedKind === 'reading') {
    phases.practice = ensurePhaseActivity({ phase: 'practice', activityIds: phases.practice, profile, lessonKind: normalizedKind, activityId: 'practice-functional-reading' });
  }
  if (normalizedKind === 'communication') {
    phases.transfer = ensureLessonKindSkill({ phase: 'transfer', activityIds: phases.transfer, profile, lessonKind: normalizedKind, skill: 'speaking' });
  }
  return { phases, diagnostics };
}


export function replacementActivityCandidates({
  phase,
  profile = {},
  lessonKind = 'integrated',
  difficulty = 'core',
  seed = 'worksheet',
  currentActivityId,
  usedActivityIds = [],
} = {}) {
  const current = activityById(currentActivityId);
  if (!current || current.phase !== phase) {
    return {
      activityIds: [],
      diagnostics: [diagnostic('error', 'REGENERATION_SOURCE_UNKNOWN', 'Valitud genereeritud ülesande lähteaktiivsust ei leitud.', { phase, activityId: currentActivityId })],
    };
  }

  const normalizedKind = normalizeLessonKind(lessonKind);
  const eligible = eligibleActivities({ phase, profile, lessonKind: normalizedKind });
  const shuffled = shuffleSeeded(eligible, `${seed}:${phase}:replacement`);
  const ordered = orderActivitiesByDifficulty(shuffled, { level: profile?.level, mode: difficulty, phase, seedOrder: shuffled });
  const used = new Set((usedActivityIds || []).filter(Boolean));
  const requiredTags = new Set(PHASE_REQUIREMENTS[phase] || []);
  const protectedTags = (current.tags || []).filter((tag) => requiredTags.has(tag));
  const currentSkills = new Set(current.skills || []);
  const primarySkill = current.skills?.[0] || '';

  const compatible = ordered.filter((candidate) =>
    candidate.id !== current.id &&
    protectedTags.every((tag) => (candidate.tags || []).includes(tag)));

  const buckets = [
    compatible.filter((candidate) => !used.has(candidate.id) && primarySkill && candidate.skills?.[0] === primarySkill),
    compatible.filter((candidate) => !used.has(candidate.id) && (candidate.skills || []).some((skill) => currentSkills.has(skill))),
    compatible.filter((candidate) => !used.has(candidate.id)),
    compatible.filter((candidate) => primarySkill && candidate.skills?.[0] === primarySkill),
    compatible.filter((candidate) => (candidate.skills || []).some((skill) => currentSkills.has(skill))),
    compatible,
  ];

  const result = [];
  buckets.flat().forEach((candidate) => {
    if (!result.includes(candidate.id)) result.push(candidate.id);
  });
  result.push(current.id);

  return { activityIds: result, diagnostics: [] };
}

export function catalogReadiness(profile = {}, lessonKind = 'integrated') {
  const normalizedKind = normalizeLessonKind(lessonKind);
  return Object.fromEntries(['discover', 'practice', 'transfer'].map((phase) => {
    const activities = eligibleActivities({ phase, profile, lessonKind: normalizedKind });
    return [phase, {
      available: activities.length,
      activityIds: activities.map((item) => item.id),
      families: [...new Set(activities.map((item) => item.family))],
    }];
  }));
}
