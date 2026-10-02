import referenceProfile from '../fixtures/a2b1-016.generator-profile.json';

const PROFILE_LIST = Object.freeze([referenceProfile]);
const PROFILE_BY_LESSON_ID = new Map(PROFILE_LIST.map((profile) => [profile.lessonId, profile]));

export function generatorProfileForLesson(lessonId) {
  return PROFILE_BY_LESSON_ID.get(String(lessonId || '')) || null;
}

export function listGeneratorProfiles() {
  return [...PROFILE_LIST];
}

export function generatorProfileReadiness(lessonId) {
  const profile = generatorProfileForLesson(lessonId);
  return profile
    ? { supported: true, lessonId: profile.lessonId, profileVersion: profile.version, level: profile.level, lessonKind: profile.lessonKind }
    : { supported: false, lessonId: String(lessonId || ''), profileVersion: null, level: null, lessonKind: null };
}
