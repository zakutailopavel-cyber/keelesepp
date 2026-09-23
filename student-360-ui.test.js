const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('haldus.html','utf8');
const css = fs.readFileSync('haldus.css','utf8');

test('student profile exposes one 360 hub over existing records',()=>{
  assert.match(html,/className="student-360-hub"/);
  for(const id of ['student-learning','student-worksheets','student-messages','student-homework','student-lessons','student-finance']){
    assert.match(html,new RegExp(`id="${id}"`));
  }
  assert.match(html,/scrollIntoView\(\{behavior:'smooth'/);
});

test('student attention summary derives operational signals without a new store',()=>{
  assert.match(html,/pendingHomework/);
  assert.match(html,/unpaidStudentAmount/);
  assert.match(html,/unreadStudentMessages/);
  assert.match(html,/currentStu\.curriculumPlan/);
  assert.doesNotMatch(html,/collection\('student360'/);
});

test('student 360 navigation is responsive',()=>{
  assert.match(css,/\.student-360-nav\{/);
  assert.match(css,/@media\(max-width:700px\).*\.student-360-nav/);
  assert.match(css,/\.student-360-anchor\{scroll-margin-top/);
});
