import a2DiagnosticProfile from '../fixtures/a2-001.generator-profile.json';
import referenceProfile from '../fixtures/a2b1-016.generator-profile.json';
import { validateGeneratorProfile } from './authoring.js';

const PROFILE_LIST = Object.freeze([a2DiagnosticProfile, referenceProfile]);
const PROFILE_BY_LESSON_ID = new Map(PROFILE_LIST.map((profile) => [profile.lessonId, profile]));

function staticProfile(lessonId) {
  return PROFILE_BY_LESSON_ID.get(String(lessonId || '')) || null;
}

export function embeddedGeneratorProfile(lessonId, lesson = {}) {
  const raw = lesson?.generatorProfile;
  if (!raw || typeof raw !== 'object') return null;
  const result = validateGeneratorProfile(raw, { lessonId, lesson });
  return { ...result, source: 'embedded' };
}

export function resolveGeneratorProfile(lessonId, lesson = {}) {
  const embedded = embeddedGeneratorProfile(lessonId, lesson);
  if (embedded?.ready && embedded.profile) return embedded;

  const fallback = staticProfile(lessonId);
  if (fallback) {
    const validated = validateGeneratorProfile(fallback, { lessonId, lesson: { ...lesson, id: lessonId } });
    return {
      ...validated,
      profile: fallback,
      source: 'static',
      embeddedDraft: embedded,
      fallback: true,
    };
  }

  return embedded || {
    profile: null,
    ready: false,
    source: 'none',
    diagnostics: [{ severity: 'error', code: 'PROFILE_MISSING', message: 'Sellel tunnil puudub generaatori sisupakett.' }],
    counts: {},
    catalog: {},
  };
}

export function generatorProfileForLesson(lessonId, lesson = {}) {
  const resolved = resolveGeneratorProfile(lessonId, lesson);
  return resolved.ready ? resolved.profile : null;
}

export function profileDraftForLesson(lessonId, lesson = {}) {
  const embedded = embeddedGeneratorProfile(lessonId, lesson);
  if (embedded?.profile) return { profile: embedded.profile, source: 'embedded', readiness: embedded };
  const fallback = staticProfile(lessonId);
  if (fallback) {
    const readiness = validateGeneratorProfile(fallback, { lessonId, lesson: { ...lesson, id: lessonId } });
    return { profile: readiness.profile || fallback, source: 'static', readiness };
  }
  return { profile: null, source: 'none', readiness: null };
}

export function listGeneratorProfiles() {
  return [...PROFILE_LIST];
}

export function generatorProfileReadiness(lessonId, lesson = {}) {
  const resolved = resolveGeneratorProfile(lessonId, lesson);
  return {
    supported: Boolean(resolved.ready && resolved.profile),
    ready: Boolean(resolved.ready),
    source: resolved.source,
    fallback: Boolean(resolved.fallback),
    lessonId: resolved.profile?.lessonId || String(lessonId || ''),
    profileVersion: resolved.profile?.version || null,
    level: resolved.profile?.level || null,
    lessonKind: resolved.profile?.lessonKind || null,
    diagnostics: resolved.diagnostics || [],
    counts: resolved.counts || {},
    catalog: resolved.catalog || {},
    embeddedDraft: resolved.embeddedDraft || null,
  };
}
