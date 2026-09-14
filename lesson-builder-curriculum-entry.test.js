const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('haldus-lesson-builder/index.html','utf8');
const app=fs.readFileSync('haldus-lesson-builder/app.js','utf8');

test('Builder loads curriculum data before its application',()=>{
  assert.ok(html.indexOf('/haldus-curriculum-data.js')<html.indexOf('/haldus-lesson-builder/app.js'));
  assert.ok(html.indexOf('/curriculum-workflow-core.js')<html.indexOf('/haldus-lesson-builder/app.js'));
});

test('Builder accepts a stable curriculum lesson key and opens template choice',()=>{
  assert.match(app,/get\('curriculumLessonKey'\)/);
  assert.match(app,/flattenCurriculum\(window\.HaldusCurriculum\)\.find\(item=>item\.key===requestedCurriculumKey\)/);
  assert.match(app,/ux\.curriculumStarter\(item,uuid\('draft'\)\)/);
  assert.match(app,/curriculumStartOptions\(item\)/);
  assert.match(app,/data-quick-template=\"language60\"/);
  assert.match(app,/data-quick-template=\"worksheet\"/);
  assert.match(app,/library\('lessons',true\)/);
  assert.match(app,/ux\.applyLessonTemplate\(draft,templateId/);
  assert.doesNotMatch(app,/studentId.*curriculumStarter/);
});
