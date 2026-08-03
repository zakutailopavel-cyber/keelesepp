const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = name => fs.readFileSync(path.join(__dirname, name), 'utf8');

test('legacy CRM switches its core listeners only after teacher scope enforcement', () => {
  for (const name of ['haldus.html', 'haldus-calendar-v3.html']) {
    const html = source(name);
    assert.match(html, /securityMigrations['"]\)\.doc\(['"]teacherUidV1['"]\)/, name);
    assert.match(html, /where\(['"]teacherUid['"],['"]==['"],user\.uid\)/, name);
    for (const collection of ['students', 'lessons', 'schedule']) {
      assert.match(html, new RegExp(`scopedCollection\\(['"]${collection}['"]\\)`), `${name}: ${collection}`);
    }
  }
});

test('legacy write paths persist stable teacher ownership', () => {
  const main = source('haldus.html');
  const calendar = source('haldus-calendar-v3.html');
  const shared = source('haldus-shared.js');
  assert.match(main, /teacherUid:teacherUidForName\(t\)/);
  assert.match(main, /teacherUid:modalEv\.teacherUid\|\|stu\?\.teacherUid/);
  assert.match(main, /resolveTeacherUid=\{teacherUidForName\}/);
  assert.match(calendar, /teacherUid=await resolveTeacherUid\(t,user\)/);
  assert.match(shared, /teacherUidFromDirectory/);
  assert.match(shared, /teacherUid:preferredTeacherUid/);
});
