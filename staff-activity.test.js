const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=__dirname;
const tracker=fs.readFileSync(path.join(root,'staff-activity.js'),'utf8');

test('all staff work surfaces load the same active-time tracker',()=>{
  [
    'haldus.html',
    'haldus-calendar.html',
    'haldus-calendar-v3.html',
    'haldus-exercises/index.html',
    'haldus-skillmap/index.html',
    'haldus-worksheet/index.html',
    'live-classroom.html'
  ].forEach(file=>{
    const source=fs.readFileSync(path.join(root,file),'utf8');
    assert.match(source,/src="\/staff-activity\.js"/,file);
  });
});

test('tracker pauses for hidden or idle windows and sends no interaction content',()=>{
  assert.match(tracker,/IDLE_TIMEOUT_MS = 5 \* 60 \* 1000/);
  assert.match(tracker,/document\.visibilityState === 'visible'/);
  assert.match(tracker,/document\.hasFocus/);
  assert.match(tracker,/JSON\.stringify\(\{pageInstanceId,area\}\)/);
  assert.doesNotMatch(tracker,/event\.target\.value/);
  assert.doesNotMatch(tracker,/screenX|screenY|clientX|clientY/);
});
