const test = require('node:test');
const assert = require('node:assert/strict');
const { _test } = require('./learning-profile-evidence-api');

const {
  cleanLimit,
  teacherNameMatches,
  timestampMillis,
  projectEvidence,
  projectSession,
  selectLatestEvidence,
} = _test;

test('profile evidence limit is bounded and rejects invalid input', () => {
  assert.equal(cleanLimit(undefined), 60);
  assert.equal(cleanLimit(1), 1);
  assert.equal(cleanLimit(500), 100);
  assert.throws(() => cleanLimit(0), /Invalid evidence limit/);
  assert.throws(() => cleanLimit('x'), /Invalid evidence limit/);
});

test('teacher aliases remain narrow and deterministic', () => {
  assert.equal(teacherNameMatches('Pavel', 'Pavel Zakutailo'), true);
  assert.equal(teacherNameMatches('Elena', 'Jelena Petrova'), true);
  assert.equal(teacherNameMatches('Pavel', 'Other Teacher'), false);
  assert.equal(teacherNameMatches('', 'Pavel'), false);
});

test('profile evidence projection exposes learning fields without arbitrary session data', () => {
  const projected = projectEvidence({
    id: 'ev-1',
    data: () => ({
      sessionId: 'session-1',
      studentId: 'student-1',
      teacherUid: 'teacher-1',
      lessonBlueprintId: 'lesson-1',
      phaseId: 'vocabulary',
      activityId: 'word-rike',
      skillIds: ['vocabulary', 'vocabulary'],
      vocabularyIds: ['rike'],
      route: 'support',
      teacherJudgement: 'needs_help',
      kind: 'vocabulary_mark',
      source: 'teacher',
      note: 'Needs repetition',
      createdAtIso: '2026-09-04T10:00:00.000Z',
      secretField: 'must not leak',
    }),
  });
  assert.equal(projected.id, 'ev-1');
  assert.deepEqual(projected.skillIds, ['vocabulary']);
  assert.deepEqual(projected.vocabularyIds, ['rike']);
  assert.equal(projected.secretField, undefined);
});

test('session projection exposes bounded teacher handoff context', () => {
  const projected = projectSession({
    id: 'session-1',
    data: () => ({
      studentId: 'student-1',
      teacherUid: 'teacher-1',
      teacherName: 'Pavel',
      lessonTitle: 'Probleemi lahendamine linnas',
      curriculumGoalIds: ['goal-1'],
      status: 'completed',
      handoff: { text: 'Start with vocabulary review.' },
      internalField: 'must not leak',
    }),
  });
  assert.equal(projected.handoffText, 'Start with vocabulary review.');
  assert.equal(projected.internalField, undefined);
});

test('latest evidence is sorted newest first before the limit is applied', () => {
  const selected = selectLatestEvidence([
    { id: 'old', createdAt: '2026-09-01T10:00:00Z' },
    { id: 'new', createdAt: '2026-09-04T10:00:00Z' },
    { id: 'mid', createdAt: '2026-09-03T10:00:00Z' },
  ], 2);
  assert.deepEqual(selected.map((item) => item.id), ['new', 'mid']);
  assert.ok(timestampMillis(selected[0].createdAt) > timestampMillis(selected[1].createdAt));
});
