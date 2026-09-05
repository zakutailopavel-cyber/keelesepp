const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'haldus-teacher-home/index.html'),'utf8');

test('Teacher Home loads real curriculum plus existing deterministic learning cores',()=>{
  assert.match(source,/src="\/calendar-core\.js"/);
  assert.match(source,/src="\/haldus-curriculum-data\.js"/);
  assert.match(source,/src="\/curriculum-workflow-core\.js/);
  assert.match(source,/src="\/learning-profile-core\.js"/);
  assert.match(source,/src="\/learning-profile-evidence-store\.js"/);
  assert.match(source,/src="\/teacher-home-core\.js"/);
});

test('Teacher Home remains a read-only projection',()=>{
  assert.match(source,/Read-only õpetaja töölaud/);
  assert.doesNotMatch(source,/db\.collection\([^)]*\)\.doc\([^)]*\)\.(?:set|update|delete)\s*\(/);
  assert.doesNotMatch(source,/db\.collection\([^)]*\)\.add\s*\(/);
  assert.doesNotMatch(source,/\.batch\(\)|\.runTransaction\(/);
});

test('Teacher Home reads schedule and curriculum progress through existing rollout boundaries',()=>{
  assert.match(source,/collection\('securityMigrations'\)\.doc\('teacherUidV1'\)\.get\(\)/);
  assert.match(source,/collection\('schedule'\)\.where\('teacherUid','==',state\.user\.uid\)/);
  assert.match(source,/collection\('lessons'\)\.where\('teacherUid','==',state\.user\.uid\)/);
  assert.match(source,/collection\('curriculumProgressEvents'\)\.where\('studentId','in',ids\)/);
  assert.match(source,/curriculumWorkflow\.buildStudentJourney\(curriculum,student,curriculumRows\.lessons\|\|\[\],\[\],\[\],curriculumRows\.progressEvents\|\|\[\]\)/);
});

test('Teacher Home joins stable student ids instead of guessing by display name',()=>{
  assert.match(source,/owned\.map\(event=>homeCore\.clean\(event\.studentId,120\)\)/);
  assert.match(source,/collection\('students'\)\.doc\(id\)\.get\(\)/);
  assert.match(source,/puudub stabiilne studentId/);
});

test('pilot B1 city graph is gated by explicit adaptive session context',()=>{
  assert.match(source,/function adaptiveRecommendation\(profile,sessions\)/);
  assert.match(source,/if\(!explicitSession\) return null/);
  assert.doesNotMatch(source,/function curriculumRecommendation\(/);
});

test('Teacher Home renders real curriculum next lesson instead of pilot goal as curriculum truth',()=>{
  assert.match(source,/const next=summary\.curriculumNext/);
  assert.match(source,/Järgmine õppekava tund/);
  assert.match(source,/next\.topicName/);
  assert.match(source,/next\.lessonGoal/);
  assert.doesNotMatch(source,/Järgmine õppekava eesmärk/);
});

test('Teacher Home inline scripts parse as JavaScript',()=>{
  const inlineScripts=[...source.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(match=>match[1].trim()).filter(Boolean);
  assert.ok(inlineScripts.length>=2);
  inlineScripts.forEach(script=>assert.doesNotThrow(()=>new Function(script)));
});
