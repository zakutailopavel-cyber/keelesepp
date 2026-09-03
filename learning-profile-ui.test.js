const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'haldus-learning-profile/index.html'),'utf8');

test('Learning Profile is a read-only staff surface',()=>{
  assert.match(source,/src="\/learning-profile-core\.js"/);
  assert.match(source,/src="\/haldus-programs\.js"/);
  assert.match(source,/src="\/staff-activity\.js"/);
  assert.match(source,/\['teacher','admin'\]\.includes\(state\.user\.role\)/);
  assert.doesNotMatch(source,/\.update\s*\(/);
  assert.doesNotMatch(source,/\.set\s*\(/);
  assert.doesNotMatch(source,/\.add\s*\(/);
  assert.doesNotMatch(source,/\.delete\s*\(/);
});

test('Learning Profile reads exact student summaries instead of attendance as mastery',()=>{
  assert.match(source,/collection\('liveClassrooms'\)\.where\('studentId','==',studentId\)\.get\(\)/);
  assert.match(source,/buildLearningProfile\(\{student,rooms:state\.rooms/);
  assert.match(source,/pelk tunni staatus ei lähe tõendiks/);
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