const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=__dirname;
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/keelesepp-b1-b2-roadmap.json'),'utf8'));
const modules=manifest.shards.flatMap(url=>JSON.parse(fs.readFileSync(path.join(root,url.replace(/^\//,'')),'utf8')).modules);
const lessons=modules.flatMap(module=>module.lessons);

test('B1-B2 roadmap has 18 modules and 90 ordered unique lessons',()=>{
  assert.equal(modules.length,18);
  assert.equal(lessons.length,90);
  assert.equal(new Set(lessons.map(lesson=>lesson.id)).size,90);
  assert.deepEqual(lessons.map(lesson=>lesson.number),Array.from({length:90},(_,index)=>index+1));
});

test('every roadmap lesson has authoring fields and each fifth lesson is assessment',()=>{
  for(const lesson of lessons){
    for(const key of ['id','sourceKey','tag','levelStage','title','goal','focus','practice','success']) assert.ok(lesson[key],`lesson ${lesson.number}: ${key}`);
  }
  for(let number=5;number<=90;number+=5) assert.equal(lessons[number-1].kind,'assessment',`lesson ${number}`);
});

test('roadmap is integrated into the existing B2 curriculum instead of a separate level',()=>{
  assert.equal(manifest.subject,'Eesti keel');
  assert.equal(manifest.level,'B2');
  const html=fs.readFileSync(path.join(root,'haldus-b1-b2-roadmap/index.html'),'utf8');
  assert.match(html,/level:'B2'/);
  assert.match(html,/description:''/);
  assert.match(html,/collection\('curriculumLessons'\)/);
  assert.match(html,/worksheetPrompt:prompt\(m,l\)/);
  assert.match(html,/location\.replace\('\/haldus-exercises\//);
  assert.doesNotMatch(html,/Kopeeri prompt<\/button>/);
  assert.doesNotMatch(html,/Lisa tööleht<input/);
});

test('existing Õppekavad UI already supports worksheet attachments on curriculum lessons',()=>{
  const html=fs.readFileSync(path.join(root,'haldus-exercises/index.html'),'utf8');
  assert.match(html,/lesson\.files\?\.length>0/);
  assert.match(html,/onEdit\(lesson\)/);
  assert.match(html,/storage\.ref\('curriculum\/'\+Date\.now\(\)\+'_'\+file\.name\)/);
});
