const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('haldus-adaptive-lesson/index.html','utf8');
const store=fs.readFileSync('learning-session-store.js','utf8');
const lesson=require('./adaptive-lessons/est-b1-city-problem-solving.js');

function inlineScripts(source){
  return [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map(match=>match[1].trim())
    .filter(Boolean);
}

test('Lesson Mode loads Learning Session core/store and Firebase Auth only',()=>{
  assert.match(html,/firebase-auth-compat\.js/);
  assert.match(html,/\/learning-session-core\.js/);
  assert.match(html,/\/learning-session-store\.js/);
  assert.doesNotMatch(html,/firebase-firestore-compat\.js/);
});

test('Lesson Mode persists only when a studentId is supplied and otherwise preserves preview mode',()=>{
  assert.match(html,/URLSearchParams\(location\.search\)\.get\('studentId'\)/);
  assert.match(store,/if\(!requestedStudentId\)/);
  assert.match(store,/status\('preview'/);
});

test('teacher judgement, vocabulary, navigation and completion call the persistence client',()=>{
  assert.match(html,/sessionStore\.recordJudgement/);
  assert.match(html,/sessionStore\.recordVocabulary/);
  assert.match(html,/sessionStore\.saveProgress/);
  assert.match(html,/sessionStore\.complete/);
});

test('Finish opens summary; completed persistence happens only from explicit handoff action',()=>{
  assert.match(html,/\$\('finish'\)\.onclick=showSummary/);
  assert.match(html,/\$\('handoff-btn'\)\.onclick=async\(\)=>/);
  const finishHandler=(html.match(/\$\('finish'\)\.onclick=([^;]+);/)||[])[1]||'';
  assert.doesNotMatch(finishHandler,/complete/);
});

test('browser client never writes Firestore or skillMap directly',()=>{
  assert.doesNotMatch(store,/collection\(['"]learningSessions/);
  assert.doesNotMatch(store,/collection\(['"]learningEvidence/);
  assert.doesNotMatch(store,/\.set\(|\.update\(|runTransaction/);
  assert.doesNotMatch(store,/skillMap/);
  assert.doesNotMatch(html,/skillMap\s*=/);
});

test('persistence client authenticates requests and reuses idempotency ids after ambiguous failures',()=>{
  assert.match(store,/getIdToken\(\)/);
  assert.match(store,/Authorization.*Bearer/);
  assert.match(store,/pendingRequestIds=new Map\(\)/);
  assert.match(store,/retryRequestId\(retryKey,'judge'\)/);
  assert.match(store,/retryRequestId\(retryKey,'vocab'\)/);
  assert.match(store,/retryRequestId\(retryKey,'complete'\)/);
  assert.match(store,/clearRetryRequestId\(retryKey\)/);
});

test('reference diagnostic tasks explicitly map to evidence skills',()=>{
  assert.equal(lesson.id,'est-b1-city-problem-solving-01');
  assert.equal(lesson.diagnostic.items.length,5);
  lesson.diagnostic.items.forEach(item=>{
    assert.ok(Array.isArray(item.skillIds),item.id);
    assert.ok(item.skillIds.length>0,item.id);
  });
  assert.deepEqual(lesson.diagnostic.items.find(item=>item.id==='d4').skillIds,['grammar','speaking']);
});

test('inline Lesson Mode scripts parse as JavaScript',()=>{
  const scripts=inlineScripts(html);
  assert.ok(scripts.length>=2);
  scripts.forEach((source,index)=>{
    assert.doesNotThrow(()=>new vm.Script(source,{filename:`lesson-inline-${index}.js`}));
  });
});