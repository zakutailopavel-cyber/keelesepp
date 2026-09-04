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
    'haldus-learning-profile/index.html',
    'haldus-skillmap/index.html',
    'haldus-teacher-home/index.html',
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

test('Learning Profile, Teacher Home and the legacy skill editor have separate activity areas',()=>{
  assert.match(tracker,/haldus-teacher-home'\)\) return 'teacher-home'/);
  assert.match(tracker,/haldus-learning-profile'\)\) return 'learning-profile'/);
  assert.match(tracker,/haldus-skillmap'\)\) return 'skill-map'/);
});

test('verified staff get a direct Teacher Home entry on the legacy CRM home',()=>{
  assert.match(tracker,/TEACHER_HOME_PATH = '\/haldus-teacher-home\/'/);
  assert.match(tracker,/path === '\/haldus' \|\| path === '\/haldus\.html'/);
  assert.match(tracker,/entry\.id = TEACHER_HOME_ENTRY_ID/);
  assert.match(tracker,/entry\.href = TEACHER_HOME_PATH/);
  assert.match(tracker,/entry\.textContent = 'Õpetaja täna →'/);
  assert.match(tracker,/if\(isStaffProfile\(profile\)\)\{\s*ensureTeacherHomeEntry\(\);/);
  assert.match(tracker,/removeTeacherHomeEntry\(\);\s*if\(!user\) return;/);
});