const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('haldus.html','utf8');
const server=fs.readFileSync('functions/index.js','utf8');
const css=fs.readFileSync('haldus.css','utf8');

test('lesson modal exposes one primary completion action with prefilled workflow fields',()=>{
  assert.match(html,/Ühe klõpsuga lõpetamine/);
  assert.match(html,/Lõpeta tund ühe klõpsuga/);
  assert.match(html,/attendanceStatus:completionAttendance/);
  assert.match(html,/homeworkTask:String\(lNextNotes/);
  assert.match(html,/nextCurriculumPlan:nextPlan/);
  assert.match(html,/followUpTitle:String\(completionFollowUp/);
  assert.match(html,/completion\.attendanceStatus==='warned'\?'Puudus_p'/);
});

test('completion request is handled in the lesson journal transaction',()=>{
  assert.match(server,/cleanLessonCompletionInput/);
  assert.match(server,/transaction\.set\(lessonRef/);
  assert.match(server,/transaction\.set\(scheduleRef/);
  assert.match(server,/transaction\.set\(studentRef/);
  assert.match(server,/transaction\.set\(homeworkRef/);
  assert.match(server,/transaction\.set\(followUpRef/);
  assert.match(server,/completion: req\.body\?\.completion/);
  assert.match(server,/Attendance and lesson status do not match/);
});

test('one-click completion presentation is responsive',()=>{
  assert.match(css,/\.lesson-complete-panel\{/);
  assert.match(css,/@media\(max-width:600px\).*\.lesson-complete-grid/);
});
