const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const app=fs.readFileSync('interactive-lesson/app.js','utf8');
const cloud=fs.readFileSync('haldus-lesson-builder/cloud.js','utf8');
const api=fs.readFileSync('functions/interactive-lesson-api.js','utf8');
const responseView=fs.readFileSync('interactive-response-view.js','utf8');
const builderHtml=fs.readFileSync('haldus-lesson-builder/index.html','utf8');
const builderAi=fs.readFileSync('haldus-lesson-builder/ai.js','utf8');
const generationApi=fs.readFileSync('api/generate-activity.js','utf8');

test('published Builder version hands off directly to preselected assignment',()=>{
  assert.match(cloud,/lessonVersionId=\$\{encodeURIComponent\(result\.publication\.lessonVersionId\)\}/);
  assert.match(app,/get\('lessonVersionId'\)/);
  assert.match(app,/select\.value=requestedVersion/);
});

test('staff can generate exactly one bounded editable activity',()=>{
  assert.match(builderHtml,/id="generate-activity"/);
  assert.match(builderAi,/fetch\('\/api\/generate-activity'/);
  assert.match(builderAi,/bridge\.insertGenerated\(result\)/);
  assert.match(generationApi,/claude-haiku-4-5-20251001/);
  assert.match(generationApi,/max_tokens:700/);
  assert.match(generationApi,/checkRateLimit\(`activity:\$\{decoded\.uid\}`,10\)/);
  assert.match(generationApi,/requireStaff\(req\)/);
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

test('staff student preview is explicit, audited and read-only',()=>{
  const html=fs.readFileSync('interactive-lesson/index.html','utf8');
  assert.match(app,/Kontrolli õpilase vaadet/);
  assert.match(app,/api\('previewStart'/);
  assert.match(app,/role==='student_preview'/);
  assert.match(app,/editable=role==='student'/);
  assert.match(app,/viewAsStudent:true/);
  assert.match(html,/Proovivastuseid ei salvestata ega saadeta/);
  assert.match(api,/student_preview\.started/);
  assert.match(api,/if\(!teacher\(a\)\)fail\(403,'Teacher required'\)/);
  assert.match(api,/Student outside teacher scope/);
  assert.match(api,/Preview student mismatch/);
  assert.match(api,/!preview&&teacher\(a\)/);
});

test('student lesson is a focused sequential player and preview answers stay local',()=>{
  const html=fs.readFileSync('interactive-lesson/index.html','utf8');
  const css=fs.readFileSync('interactive-lesson/style.css','utf8');
  assert.match(html,/id="progress-count"/);
  assert.match(html,/id="previous"/);
  assert.match(html,/id="next"/);
  assert.match(html,/id="outline"/);
  assert.match(app,/testable=editable\|\|role==='student_preview'/);
  assert.match(app,/Proovivastus on ainult selles kontrollvaates/);
  assert.match(app,/\$\('previous'\)\.onclick/);
  assert.match(app,/\$\('next'\)\.onclick/);
  assert.match(css,/article\{background:var\(--paper\)/);
});

test('legacy blanks render inline and teachers can open the exact block in Builder',()=>{
  const html=fs.readFileSync('interactive-lesson/index.html','utf8');
  assert.match(responseView,/split\(\/_\{3,\}\//);
  assert.match(responseView,/group\.className='inline-gaps'/);
  assert.match(app,/\$\('prompt'\)\.hidden=inline/);
  assert.match(html,/id="edit-activity"/);
  assert.match(html,/id="edit-dialog"/);
  assert.match(app,/haldus-lesson-builder\/\?draftId=/);
  assert.match(app,/\$\('edit-dialog'\)\.showModal\(\)/);
  assert.match(cloud,/params\.get\('draftId'\)/);
  assert.match(cloud,/bridge\.select\(requestedActivity\)/);
});
