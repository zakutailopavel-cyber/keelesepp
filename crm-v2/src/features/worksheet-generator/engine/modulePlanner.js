import { activityById } from './activityCatalog.js';
import { normalizeLessonKind } from './lessonKind.js';
import { planLessonActivities } from './planner.js';

export const MODULE_PLANNER_SCHEMA = 'keelesepp.module-planner/1';
const PHASES = ['discover', 'practice', 'transfer'];
const uniq = (items) => [...new Set((items || []).filter(Boolean))];
const familyOf = (id) => activityById(id)?.family || '';

function familyPattern(phases = {}) {
  return PHASES.map((phase) => (phases[phase] || []).map(familyOf).filter(Boolean).join('>')).join('|');
}

export function moduleDiversityReport(lessonPlans = []) {
  const diagnostics = [];
  const phaseFamilies = Object.fromEntries(PHASES.map((phase) => [phase, new Set()]));
  const patterns = new Map();

  lessonPlans.forEach((lesson, lessonIndex) => {
    PHASES.forEach((phase) => (lesson?.phases?.[phase] || []).forEach((id) => {
      const family = familyOf(id);
      if (family) phaseFamilies[phase].add(family);
    }));
    const pattern = familyPattern(lesson?.phases);
    patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
    const allIds = PHASES.flatMap((phase) => lesson?.phases?.[phase] || []);
    if (new Set(allIds).size !== allIds.length) diagnostics.push({
      severity: 'warning', code: 'MODULE_ACTIVITY_REPEAT_WITHIN_LESSON', lessonIndex,
      message: 'Samas tunnis kordub sama tegevus mitmes kohas.',
    });
  });

  const repeated = [...patterns.entries()].filter(([, count]) => count >= 3);
  if (repeated.length) diagnostics.push({
    severity: 'error', code: 'MODULE_FAMILY_REPETITION',
    message: 'Vähemalt kolm tundi kasutavad sama ülesandeperekondade mustrit.',
    patterns: repeated.map(([pattern, count]) => ({ pattern, count })),
  });
  if (lessonPlans.length >= 5 && phaseFamilies.practice.size < 4) diagnostics.push({
    severity: 'error', code: 'MODULE_PRACTICE_VARIETY_LOW',
    message: `Harjuta kasutab moodulis ainult ${phaseFamilies.practice.size} ülesandeperekonda; vaja vähemalt 4.`,
  });
  if (lessonPlans.length >= 5 && phaseFamilies.transfer.size < 3) diagnostics.push({
    severity: 'error', code: 'MODULE_TRANSFER_VARIETY_LOW',
    message: `Kasuta kasutab moodulis ainult ${phaseFamilies.transfer.size} ülesandeperekonda; vaja vähemalt 3.`,
  });
  if (lessonPlans.length >= 5 && phaseFamilies.discover.size < 3) diagnostics.push({
    severity: 'warning', code: 'MODULE_DISCOVER_VARIETY_LOW',
    message: `Avasta kasutab moodulis ainult ${phaseFamilies.discover.size} ülesandeperekonda; soovitus vähemalt 3.`,
  });

  return {
    schema: MODULE_PLANNER_SCHEMA,
    lessonCount: lessonPlans.length,
    phaseFamilies: Object.fromEntries(PHASES.map((phase) => [phase, [...phaseFamilies[phase]]])),
    diagnostics,
    ready: !diagnostics.some((item) => item.severity === 'error'),
  };
}

function lexicalIntroductionLesson(index, total, lessonIds) {
  const ids = (lessonIds || []).filter(Boolean);
  if (!ids.length) return '';
  if (ids.length < 3) return ids[Math.min(index, ids.length - 1)];
  const firstCount = Math.min(8, total);
  const secondCount = Math.min(5, Math.max(0, total - firstCount));
  if (index < firstCount) return ids[0];
  if (index < firstCount + secondCount) return ids[1];
  return ids[2];
}

export function planLexicalRecycling(coreEntries = [], lessonIds = [], nextModuleLessonIds = []) {
  const ids = (lessonIds || []).filter(Boolean);
  const nextIds = (nextModuleLessonIds || []).filter(Boolean);
  if (!ids.length) return [];
  return (coreEntries || []).map((entry, index) => {
    const intro = entry.activeFromLessonId || lexicalIntroductionLesson(index, coreEntries.length, ids);
    const actualIntroIndex = Math.max(0, ids.indexOf(intro));
    const later = ids.filter((_, i) => i > actualIntroIndex);
    const desired = uniq([later[0], later[1], ids[ids.length - 1], nextIds[0]]).filter(Boolean);
    return {
      ...entry,
      activeFromLessonId: intro,
      recycleLessonIds: uniq([...(entry.recycleLessonIds || []), ...desired]).filter((id) => id !== intro),
    };
  });
}

export function lexicalCoverageReport(entries = [], lessonIds = [], nextModuleLessonIds = []) {
  const current = new Set(lessonIds || []);
  const next = new Set(nextModuleLessonIds || []);
  const rows = (entries || []).map((entry) => {
    const all = uniq([entry.activeFromLessonId, ...(entry.recycleLessonIds || [])]);
    const inModule = all.filter((id) => current.has(id));
    const inNext = all.filter((id) => next.has(id));
    return {
      id: entry.id, lemma: entry.lemma,
      currentModuleEncounters: inModule, currentModuleCount: inModule.length,
      nextModuleEncounters: inNext,
      introducedInModule: current.has(entry.activeFromLessonId),
    };
  });
  const insufficient = rows.filter((row) => row.introducedInModule && row.currentModuleCount < 3);
  const noNextReturn = rows.filter((row) => row.introducedInModule && row.nextModuleEncounters.length === 0);
  const requireNextReturn = (nextModuleLessonIds || []).length > 0;
  return { rows, insufficient, noNextReturn, ready: insufficient.length === 0 && (!requireNextReturn || noNextReturn.length === 0) };
}

export function planModuleActivities({
  lessons = [],
  profiles = [],
  seed = 'module',
  difficulty = 'core',
  countPerPhase = 5,
} = {}) {
  const diagnostics = [];
  const plans = [];
  const history = [];

  lessons.forEach((lesson, index) => {
    const profile = profiles[index];
    if (!profile) {
      diagnostics.push({ severity: 'error', code: 'MODULE_PROFILE_MISSING', lessonIndex: index, message: 'Tunni generaatoriprofiil puudub.' });
      return;
    }
    const lessonKind = normalizeLessonKind(profile.lessonKind || lesson?.tag || lesson?.kind);
    const planned = planLessonActivities({
      profile,
      lessonKind,
      seed: `${seed}:${profile.lessonId || lesson?.id || index}`,
      activityHistory: history,
      difficulty,
      countPerPhase,
    });
    diagnostics.push(...planned.diagnostics.map((item) => ({ ...item, lessonIndex: index })));
    plans.push({ lessonId: profile.lessonId || lesson?.id || '', phases: planned.phases });
    history.push(...PHASES.flatMap((phase) => planned.phases[phase] || []));
  });

  const diversity = moduleDiversityReport(plans);
  diagnostics.push(...diversity.diagnostics);
  return {
    schema: MODULE_PLANNER_SCHEMA,
    plans,
    diversity,
    diagnostics,
    ready: !diagnostics.some((item) => item.severity === 'error'),
  };
}

export function scheduledVocabularyForLesson(entries = [], lessonId = '', focusIds = []) {
  const id = String(lessonId || '');
  if (!id) return [];
  const focuses = (focusIds || []).filter(Boolean);
  return (entries || [])
    .filter((entry) => entry?.activeFromLessonId === id || (entry?.recycleLessonIds || []).includes(id))
    .map((entry) => ({
      id: entry.id,
      word: entry.lemma,
      translation: entry.translationRu,
      lexicalType: entry.partOfSpeech || 'other',
      focusIds: focuses,
      textbookForms: entry.forms || [],
    }))
    .filter((entry) => entry.word && entry.translation);
}
