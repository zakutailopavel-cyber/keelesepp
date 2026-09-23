const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('haldus.html','utf8');
const css = fs.readFileSync('haldus.css','utf8');

test('task workspace exposes board, list and three compatible statuses',()=>{
  assert.match(html,/taskView.*board/);
  assert.match(html,/id:'open',label:'Uus'/);
  assert.match(html,/id:'in_progress',label:'Töös'/);
  assert.match(html,/id:'done',label:'Valmis'/);
  assert.match(html,/tasks-view-switch/);
});

test('task detail drawer edits existing Firestore task fields',()=>{
  for(const field of ['title','status','assignedTo','dueDate','priority','category']){
    assert.match(html,new RegExp(`updateTask\\(selectedTask,\\{${field}`));
  }
  assert.match(html,/\.doc\(task\.id\)\.set\(next,\{merge:true\}\)/);
  assert.match(html,/task\.updated/);
});

test('task workspace keeps discussion and responsive presentation',()=>{
  assert.match(html,/replyTask\(selectedTask/);
  assert.match(html,/tasks-drawer-overlay/);
  assert.match(css,/\.tasks-board\{/);
  assert.match(css,/@media\(max-width:640px\).*\.tasks-board/);
});
