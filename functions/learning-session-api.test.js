"use strict";

const test=require('node:test');
const assert=require('node:assert/strict');
const admin=require('firebase-admin');

if(!admin.apps.length) admin.initializeApp({projectId:'demo-keelesepp-learning-unit'});
const { _test }=require('./learning-session-api');

test('request ids are bounded and reject unsafe values',()=>{
  assert.equal(_test.cleanRequestId('judge_learning_0001'),'judge_learning_0001');
  assert.throws(()=>_test.cleanRequestId('short'),/requestId/);
  assert.throws(()=>_test.cleanRequestId('bad id with spaces'),/requestId/);
});

test('route and index validation is strict',()=>{
  assert.equal(_test.cleanRoute('support'),'support');
  assert.equal(_test.cleanRoute('core'),'core');
  assert.equal(_test.cleanIndex(4),4);
  assert.throws(()=>_test.cleanRoute('expert'),/route/);
  assert.throws(()=>_test.cleanIndex(-1),/currentIndex/);
  assert.throws(()=>_test.cleanIndex(1.5),/currentIndex/);
});

test('summary scores preserve unassessed fields and explicit zero',()=>{
  assert.deepEqual(_test.normalizeScores({vocabulary:72,grammar:'',speaking:null,reading:0}),{vocabulary:72,reading:0});
  assert.throws(()=>_test.normalizeScores({speaking:101}),/speaking/);
  assert.throws(()=>_test.normalizeScores({grammar:'abc'}),/grammar/);
});

test('legacy teacher aliases are narrow and deterministic',()=>{
  assert.equal(_test.teacherNameMatches('Pavel','Pavel Zakutailo'),true);
  assert.equal(_test.teacherNameMatches('Jelena','Elena Petrova'),true);
  assert.equal(_test.teacherNameMatches('Pavel','Other Teacher'),false);
  assert.equal(_test.teacherNameMatches('','Pavel'),false);
});

test('routeBySkill and assessed-skill merges deduplicate stable ids',()=>{
  assert.deepEqual(_test.mergeRouteBySkill({vocabulary:'core'},['grammar','grammar'],'support'),{vocabulary:'core',grammar:'support'});
  assert.deepEqual(_test.applyRouteBySkillPatch({vocabulary:'core'},{grammar:'support'}),{vocabulary:'core',grammar:'support'});
  assert.deepEqual(_test.mergeAssessedSkills(['vocabulary'],['grammar','vocabulary']),['vocabulary','grammar']);
});

test('trusted route transition moves one step from each skill own route',()=>{
  assert.equal(_test.transitionRoute('advanced','needs_help'),'core');
  assert.equal(_test.transitionRoute('core','needs_help'),'support');
  assert.equal(_test.transitionRoute('support','too_easy'),'core');
  assert.equal(_test.transitionRoute('core','too_easy'),'advanced');
  assert.equal(_test.transitionRoute('advanced','managed'),'advanced');
});

test('multi-skill effective route uses the most supportive required route',()=>{
  assert.equal(_test.routeForSkills({grammar:'core',speaking:'support'},['grammar','speaking'],'advanced'),'support');
  assert.equal(_test.routeForSkills({grammar:'advanced'},['grammar','speaking'],'core'),'core');
});

test('per-skill route patch is bounded to affected skills and deterministic judgement transitions',()=>{
  const current={grammar:'support',speaking:'core',vocabulary:'advanced'};
  const patch=_test.cleanPerSkillRoutePatch(
    {grammar:'core',speaking:'advanced'},
    ['grammar','speaking'],
    current,
    'too_easy',
    'core'
  );
  assert.deepEqual(patch,{grammar:'core',speaking:'advanced'});
  assert.throws(()=>_test.cleanPerSkillRoutePatch(
    {grammar:'advanced',speaking:'advanced'},
    ['grammar','speaking'],
    current,
    'too_easy',
    'core'
  ),/Invalid per-skill route transition/);
  assert.throws(()=>_test.cleanPerSkillRoutePatch(
    {grammar:'core',speaking:'advanced',vocabulary:'support'},
    ['grammar','speaking'],
    current,
    'too_easy',
    'core'
  ),/unrelated skill/);
  assert.throws(()=>_test.cleanPerSkillRoutePatch(
    {grammar:'core'},
    ['grammar','speaking'],
    current,
    'too_easy',
    'core'
  ),/cover every affected skill/);
});

test('idempotent evidence must belong to the same session identity',()=>{
  const session={studentId:'student-1',teacherUid:'teacher-1',lessonBlueprintId:'lesson-1'};
  const same={sessionId:'session-1',studentId:'student-1',teacherUid:'teacher-1',lessonBlueprintId:'lesson-1'};
  assert.doesNotThrow(()=>_test.assertSameEvidenceIdentity(same,session,'session-1'));
  assert.throws(()=>_test.assertSameEvidenceIdentity({...same,sessionId:'session-2'},session,'session-1'),/different learning evidence/);
  assert.throws(()=>_test.assertSameEvidenceIdentity({...same,teacherUid:'teacher-2'},session,'session-1'),/different learning evidence/);
});
