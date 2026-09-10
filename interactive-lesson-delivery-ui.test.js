const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const app=fs.readFileSync('interactive-lesson/app.js','utf8');
const cloud=fs.readFileSync('haldus-lesson-builder/cloud.js','utf8');
const api=fs.readFileSync('functions/interactive-lesson-api.js','utf8');

test('published Builder version hands off directly to preselected assignment',()=>{
  assert.match(cloud,/lessonVersionId=\$\{encodeURIComponent\(result\.publication\.lessonVersionId\)\}/);
  assert.match(app,/get\('lessonVersionId'\)/);
  assert.match(app,/select\.value=requestedVersion/);
});

test('assignment requires both an immutable version and a student',()=>{
  assert.match(app,/button\.disabled=!select\.value\|\|!input\.value/);
});

test('teacher assignment list and open view use teacher-facing identity and status',()=>{
  assert.match(api,/studentName:r\.studentName\|\|studentNameById\.get\(r\.studentId\)/);
  assert.match(app,/r\.studentName/);
  assert.match(app,/Õpilane pole veel vastuseid saatnud/);
  assert.match(app,/Õpilase vastused ootavad tagasisidet/);
});
