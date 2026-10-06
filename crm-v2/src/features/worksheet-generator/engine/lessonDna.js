import { normalizeDifficulty } from './difficulty.js';
import { normalizeLessonKind } from './lessonKind.js';
import { normalizeLevel } from './vocabulary.js';
import { grammarStateForLesson } from '../../curriculum/grammarProgression.js';
import { vocabularyStatusForLesson } from '../../curriculum/textbookVocabulary.js';

export const LESSON_DNA_SCHEMA = 'keelesepp.lesson-dna/1';

const PRIORITY_SKILLS = Object.freeze({
  grammar: ['grammar', 'vocabulary', 'reading', 'speaking', 'writing'],
  vocabulary: ['vocabulary', 'reading', 'speaking', 'writing'],
  communication: ['speaking', 'interaction', 'listening', 'writing'],
  reading: ['reading', 'vocabulary', 'speaking', 'writing'],
  listening: ['listening', 'vocabulary', 'speaking', 'writing'],
  writing: ['writing', 'planning', 'vocabulary', 'grammar'],
  assessment: ['reading', 'listening', 'grammar', 'vocabulary', 'speaking', 'writing'],
  integrated: ['vocabulary', 'grammar', 'reading', 'listening', 'speaking', 'writing'],
});

const uniq = (items) => [...new Set((items || []).filter(Boolean).map(String))];

export function createLessonDna({
  lesson = {},
  profile = {},
  focusIds,
  difficulty = 'core',
  mode = 'lesson-bundle',
  durationMinutes,
  variant = 0,
  seed = '',
} = {}) {
  const lessonKind = normalizeLessonKind(profile.lessonKind || lesson.tag || lesson.kind);
  const normalizedLevel = normalizeLevel(profile.level || lesson.levelStage || lesson.level || 'A1');
  const selectedFocusIds = uniq(focusIds?.length ? focusIds : (profile.focuses || []).map((item) => item.id));
  const targetVocabularyIds = uniq((profile.activeVocabulary || []).map((item) => item.id || item.word));
  const targetSet = new Set(targetVocabularyIds);
  const recycledVocabularyIds = uniq(profile.recycledVocabularyIds || []).filter((id) => !targetSet.has(id));
  const lessonId = String(profile.lessonId || lesson.id || '');
  const grammarPlan = (profile.grammarTargets || []).filter((item) => item?.id).map((target) => ({ id: String(target.id), state: grammarStateForLesson(target, lessonId) }));
  const vocabularyPlan = (profile.textbookVocabulary || []).filter((item) => item?.id).map((entry) => ({
    id: String(entry.id),
    status: vocabularyStatusForLesson(entry, lessonId, {
      currentModuleLessonIds: profile.currentModuleLessonIds || [],
      previousModuleLessonIds: profile.previousModuleLessonIds || [],
    }),
  })).filter((item) => item.status);

  return {
    schema: LESSON_DNA_SCHEMA,
    lessonId,
    profileVersion: Number(profile.version) || 0,
    level: normalizedLevel.base || 'A1',
    levelModifier: normalizedLevel.modifier || '',
    lessonKind,
    mode: String(mode || 'lesson-bundle'),
    difficulty: normalizeDifficulty(difficulty),
    durationMinutes: Math.max(15, Math.min(240, Number(durationMinutes || profile.durationMinutes || lesson.durationMinutes) || 60)),
    focusIds: selectedFocusIds,
    targetVocabularyIds,
    recycledVocabularyIds,
    grammarPlan,
    vocabularyPlan,
    prioritySkills: PRIORITY_SKILLS[lessonKind] || PRIORITY_SKILLS.integrated,
    variant: Math.max(0, Number(variant) || 0),
    seed: String(seed || ''),
  };
}

export function lessonDnaFingerprint(dna = {}) {
  return [
    dna.schema || LESSON_DNA_SCHEMA,
    dna.lessonId || '',
    `p${Number(dna.profileVersion) || 0}`,
    dna.level || '',
    dna.lessonKind || '',
    dna.mode || '',
    dna.difficulty || 'core',
    `v${Number(dna.variant) || 0}`,
    (dna.focusIds || []).join('+'),
    (dna.grammarPlan || []).map((item) => `${item.id}:${item.state}`).join('+'),
    (dna.vocabularyPlan || []).map((item) => `${item.id}:${item.status}`).join('+'),
    dna.seed || '',
  ].join(':');
}
