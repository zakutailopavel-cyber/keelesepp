const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'haldus-teacher-home/index.html'),'utf8');

test('Teacher Home loads the existing deterministic learning and calendar cores',()=>{
  assert.match(source,/src="\/calendar-core\.js"/);
  assert.match(source,/src="\/learning-profile-core\.js"/);
  assert.match(source,/src="\/learning-profile-evidence-store\.js"/);
  assert.match(source,/src="\/curriculum-goal-core\.js"/);
  assert.match(source,/src="\/curriculum-goals\/b1-city\.js"/);
  assert.match(source,/src="\/teacher-home-core\.js"/);
});

test('Teacher Home remains a read-only projection',()=>{
  assert.match(source,/Read-only õpetaja töölaud/);
  assert.doesNotMatch(source,/db\.collection\([^)]*\)\.doc\([^)]*\)\.(?:set|update|delete)\s*\(/);
  assert.doesNotMatch(source,/db\.collection\([^)]*\)\.add\s*\(/);
  assert.doesNotMatch(source,/\.batch\(\)|\.runTransaction\(/);
});

test('Teacher Home reads schedule through the teacherUid rollout boundary',()=>{
  assert.match(source,/collection\('securityMigrations'\)\.doc\('teacherUidV1'\)\.get\(\)/);
  assert.match(source,/collection\('schedule'\)\.where\('teacherUid','==',state\.user\.uid\)/);
  assert.match(source,/calendar\.eventsForDate\(state\.schedule,state\.dateIso\)/);
  assert.match(source,/homeCore\.filterTeacherEvents\(occurrences,state\.user\)/);
});

test('Teacher Home joins stable student ids instead of guessing by display name',()=>{
  assert.match(source,/owned\.map\(event=>homeCore\.clean\(event\.studentId,120\)\)/);
  assert.match(source,/collection\('students'\)\.doc\(id\)\.get\(\)/);
  assert.match(source,/puudub stabiilne studentId/);
});

test('Teacher Home consumes trusted Adaptive evidence and explicit Live Classroom summaries',()=>{
  assert.match(source,/evidenceStore\.load\(studentId,\{limit:30\}\)/);
  assert.match(source,/collection\('liveClassrooms'\)\.where\('studentId','==',studentId\)/);
  assert.match(source,/profileCore\.buildLearningProfile\(/);
  assert.match(source,/curriculumRecommendation\(profile,sessions\)/);
});

test('Teacher Home exposes Lesson Mode only through the pure supported-goal action contract',()=>{
  assert.match(source,/homeCore\.buildTodayCards\(/);
  assert.match(source,/card\.primaryAction/);
  assert.match(source,/Õppimisprofiil/);
  assert.doesNotMatch(source,/students\.skillMap\s*=/);
});

test('Teacher Home inline scripts parse as JavaScript',()=>{
  const inlineScripts=[...source.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match=>match[1].trim()).filter(Boolean);
  assert.ok(inlineScripts.length>=2);
  inlineScripts.forEach(script=>assert.doesNotThrow(()=>new Function(script)));
});