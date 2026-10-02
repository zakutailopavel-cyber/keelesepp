import { generatorProfileReadiness } from './profiles/index.js';

export const GENERATOR_COVERAGE_STATUSES = Object.freeze({
  READY_EMBEDDED: 'ready-embedded',
  READY_STATIC: 'ready-static',
  DRAFT: 'draft',
  MISSING: 'missing',
  ERROR: 'error',
});

export const GENERATOR_COVERAGE_LABELS = Object.freeze({
  'ready-embedded': 'Valmis · sisupakett',
  'ready-static': 'Valmis · fallback',
  draft: 'Mustand',
  missing: 'Puudub',
  error: 'Viga',
});

const STRUCTURAL_ERROR_CODES = new Set([
  'PROFILE_INVALID',
  'PROFILE_SCHEMA_UNSUPPORTED',
  'PROFILE_VERSION_UNSUPPORTED',
  'PROFILE_LESSON_MISMATCH',
]);

const PHASE_KEYS = Object.freeze(['discover', 'practice', 'transfer']);

function phaseAvailability(catalog = {}) {
  return Object.fromEntries(PHASE_KEYS.map((phase) => [phase, Number(catalog?.[phase]?.available) || 0]));
}

function statusFor(readiness, lesson) {
  if (readiness.ready) {
    return readiness.source === 'embedded'
      ? GENERATOR_COVERAGE_STATUSES.READY_EMBEDDED
      : GENERATOR_COVERAGE_STATUSES.READY_STATIC;
  }
  if (!lesson?.generatorProfile) return GENERATOR_COVERAGE_STATUSES.MISSING;
  const diagnostics = readiness.diagnostics || [];
  return diagnostics.some((item) => STRUCTURAL_ERROR_CODES.has(item.code))
    ? GENERATOR_COVERAGE_STATUSES.ERROR
    : GENERATOR_COVERAGE_STATUSES.DRAFT;
}

function lessonLevel(lesson, readiness) {
  return String(lesson?.levelStage || lesson?.level || readiness?.level || '').trim() || '—';
}

export function generatorCoverageForLesson(lesson = {}) {
  const lessonId = String(lesson.id || '').trim();
  if (!lessonId) return null;

  const readiness = generatorProfileReadiness(lessonId, lesson);
  const embeddedDraft = readiness.embeddedDraft || null;
  const diagnostics = readiness.ready && embeddedDraft
    ? embeddedDraft.diagnostics || []
    : readiness.diagnostics || [];

  return {
    lessonId,
    title: String(lesson.title || lessonId),
    level: lessonLevel(lesson, readiness),
    lessonKind: readiness.lessonKind || lesson.roadmapKind || lesson.roadmapTag || lesson.kind || '',
    module: String(lesson.roadmapModuleTitle || lesson.topic || lesson.curriculumTitle || ''),
    order: Number(lesson.roadmapLessonNumber || lesson.order) || 0,
    status: statusFor(readiness, lesson),
    source: readiness.source,
    ready: Boolean(readiness.ready),
    fallback: Boolean(readiness.fallback),
    hasEmbeddedDraft: Boolean(embeddedDraft),
    phaseAvailability: phaseAvailability(readiness.catalog),
    diagnostics,
    errorCount: diagnostics.filter((item) => item.severity === 'error').length,
    counts: readiness.counts || {},
    updatedAt: lesson.generatorProfileUpdatedAt || '',
  };
}

export function buildGeneratorCoverage(lessons = []) {
  const rows = (lessons || [])
    .map(generatorCoverageForLesson)
    .filter(Boolean)
    .sort((a, b) => String(a.level).localeCompare(String(b.level), 'et')
      || a.order - b.order
      || String(a.title).localeCompare(String(b.title), 'et'));

  const summary = Object.values(GENERATOR_COVERAGE_STATUSES).reduce((acc, status) => {
    acc[status] = rows.filter((row) => row.status === status).length;
    return acc;
  }, { total: rows.length });

  return {
    rows,
    summary,
    levels: [...new Set(rows.map((row) => row.level))].sort((a, b) => a.localeCompare(b, 'et')),
  };
}
