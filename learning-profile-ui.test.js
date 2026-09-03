const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'haldus-learning-profile/index.html'),'utf8');

test('Learning Profile is a read-only staff surface',()=>{
  assert.match(source,/src="\/learning-profile-core\.js"/);
  assert.match(source,/src="\/haldus-programs\.js"/);
  assert.match(source,/src="\/staff-activity\.js"/);
  assert.match(source,/const isStaff=state\.isAdmin\|\|state\.user\.role==='teacher'/);
  assert.doesNotMatch(source,/db\.collection\([^)]*\)\.doc\([^)]*\)\.(?:set|update|delete)\s*\(/);
  assert.doesNotMatch(source,/db\.collection\([^)]*\)\.add\s*\(/);
});

test('Learning Profile reads structured summaries instead of attendance as mastery',()=>{
  assert.match(source,/db\.collection\('liveClassrooms'\)\.where\('studentId','==',studentId\)/);
  assert.match(source,/if\(!state\.isAdmin\) query=query\.where\('teacherUid','==',state\.user\.uid\)/);
  assert.match(source,/buildLearningProfile\(\{student,rooms:state\.rooms/);
  assert.match(source,/pelk tunni staatus ei lähe tõendiks/);
});

test('Learning Profile respects teacherUid rollout for student lists',()=>{
  assert.match(source,/collection\('securityMigrations'\)\.doc\('teacherUidV1'\)\.get\(\)/);
  assert.match(source,/state\.teacherScopeReadEnforced=migration\.exists&&migration\.data\(\)\?\.readEnforced===true/);
  assert.match(source,/db\.collection\('students'\)\.where\('teacherUid','==',fb\.uid\)/);
});

test('Learning Profile exposes teacher decision support without claiming curriculum recommendation',()=>{
  assert.match(source,/Mida korrata järgmisena/);
  assert.match(source,/Tugevad oskused/);
  assert.match(source,/Hiljutine õppimistõendus/);
  assert.match(source,/ei anna piisavat alust järgmise õppekava eesmärgi automaatseks valimiseks/);
});

test('Learning Profile uses the existing shared skill catalog for labels',()=>{
  assert.match(source,/Object\.values\(window\.HaldusSkillCatalog\|\|\{\}\)\.flat\(\)/);
});

test('Learning Profile inline scripts parse as JavaScript',()=>{
  const inlineScripts=[...source.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match=>match[1].trim())
    .filter(Boolean);
  assert.ok(inlineScripts.length>=2);
  inlineScripts.forEach(script=>assert.doesNotThrow(()=>new Function(script)));
});