const fs=require('fs'),path=require('path'),assert=require('assert');
const root=__dirname;
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/keelesepp-a2-roadmap.json'),'utf8'));
const modules=manifest.shards.flatMap(p=>JSON.parse(fs.readFileSync(path.join(root,p.replace(/^\//,'')),'utf8')).modules);
const lessons=modules.flatMap(m=>m.lessons);

assert.equal(manifest.id,'est-a2-curriculum-v1');
assert.equal(manifest.subject,'Eesti keel');
assert.equal(manifest.level,'A2');
assert.equal(manifest.lessonMinutes,60);
assert.equal(manifest.contactMinutes,6000);
assert.equal(manifest.moduleCount,20);
assert.equal(manifest.lessonCount,100);
assert.equal(modules.length,20);
assert.equal(lessons.length,100);
assert.equal(new Set(lessons.map(x=>x.id)).size,100);
assert.equal(new Set(lessons.map(x=>x.sourceKey)).size,100);

const allowedKinds=new Set(['grammar','vocabulary','communication','reading','listening','writing','integrated','assessment']);
for(const [i,module] of modules.entries()){
  assert.equal(module.number,i+1,'module number');
  assert.equal(module.id,`a2-module-${String(i+1).padStart(2,'0')}`);
  assert.equal(module.lessons.length,5,module.id+' lesson count');
  assert.ok(module.title&&module.goal&&module.attention,module.id+' metadata');
}
for(const [i,lesson] of lessons.entries()){
  assert.equal(lesson.number,i+1,'lesson number');
  assert.equal(lesson.id,`a2-${String(i+1).padStart(3,'0')}`);
  assert.ok(allowedKinds.has(lesson.kind),lesson.id+' kind');
  assert.equal(lesson.levelStage,'A2');
  for(const key of ['title','goal','focus','practice','success'])assert.ok(String(lesson[key]||'').trim(),lesson.id+' '+key);
}
for(let n=5;n<=100;n+=5)assert.equal(lessons[n-1].kind,'assessment','lesson '+n);

const titles=modules.map(m=>m.title).join(' ').toLowerCase();
for(const needle of ['kodu','linn','söök','pood','tervis','vaba aeg','ilm','reisimine','töö','õppimine'])assert.ok(titles.includes(needle),needle);

const importer=fs.readFileSync(path.join(root,'haldus-a2-roadmap/index.html'),'utf8');
assert.match(importer,/est-a2-curriculum-v1/);
assert.match(importer,/level:'A2'/);
assert.match(importer,/items\.length!==100/);
assert.match(importer,/collection\('curriculumLessons'\)/);
assert.match(importer,/merge:true/);

const library=fs.readFileSync(path.join(root,'haldus-exercises/index.html'),'utf8');
assert.match(library,/keelesepp-a2-roadmap-import-attempt/);
assert.match(library,/curriculumId==='est-a2-curriculum-v1'/);
assert.match(library,/roadmapCount>=100/);
assert.match(library,/\/haldus-a2-roadmap\//);

console.log('A2 roadmap: 20 modules / 100 lessons / 20 assessments / importer PASS');
