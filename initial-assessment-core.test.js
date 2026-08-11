const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('./initial-assessment-core.js');

test('new assessment is universal and linked to the selected student',()=>{
  const assessment=core.buildInitialAssessment(
    {id:'student-42',level:'B1',targetLevel:'B2'},
    {uid:'teacher-1',displayName:'Õpetaja'},
    '2026-08-11T08:00:00.000Z'
  );
  assert.equal(assessment.studentId,'student-42');
  assert.equal(assessment.currentLevel,'B1');
  assert.equal(assessment.targetLevel,'B2');
  assert.equal(assessment.grammarData.length,20);
  assert.equal(assessment.vocabularyData.length,15);
  assert.equal(assessment.skillsData.length,6);
  assert.ok(assessment.grammarData.every(row=>row.score===null));
});

test('zero is a tested score while empty value remains not tested',()=>{
  assert.equal(core.normalizeScore(0),0);
  assert.equal(core.normalizeScore('0'),0);
  assert.equal(core.statusForScore(0),'needs_work');
  assert.equal(core.normalizeScore(''),null);
  assert.equal(core.normalizeScore(null),null);
  assert.equal(core.statusForScore(null),'not_tested');
});

test('scores are rounded and constrained to the diagnostic range',()=>{
  assert.equal(core.normalizeScore(74.6),75);
  assert.equal(core.normalizeScore(-8),0);
  assert.equal(core.normalizeScore(180),100);
  assert.equal(core.normalizeScore('not-a-number'),null);
});

test('normalization preserves ownership and creation metadata',()=>{
  const source=core.buildInitialAssessment(
    {id:'student-a',level:'A2',targetLevel:'B1'},
    {uid:'teacher-old',displayName:'Vana õpetaja'},
    '2026-08-01T10:00:00.000Z'
  );
  source.grammarData[0].score=0;
  source.grammarData[0].status='needs_work';
  const saved=core.normalizeAssessment(
    source,
    {id:'student-a'},
    {uid:'teacher-new',displayName:'Uus õpetaja'},
    '2026-08-11T10:00:00.000Z'
  );
  assert.equal(saved.studentId,'student-a');
  assert.equal(saved.createdAt,'2026-08-01T10:00:00.000Z');
  assert.equal(saved.createdByUid,'teacher-old');
  assert.equal(saved.updatedByUid,'teacher-new');
  assert.equal(saved.grammarData[0].score,0);
});
