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
  assert.deepEqual(_test.mergeAssessedSkills(['vocabulary'],['grammar','vocabulary']),['vocabulary','grammar']);
});
