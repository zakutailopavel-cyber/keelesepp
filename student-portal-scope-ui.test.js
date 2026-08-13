const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('haldus.html','utf8');
const rules=fs.readFileSync('firestore.rules','utf8');

test('student and parent bootstrap uses explicit ownership queries',()=>{
  assert.match(html,/const ownershipFields=\['linkedUserId','studentUid','linkedParentId','parentUid','guardianUid'\]/);
  assert.match(html,/db\.collection\('students'\)\.where\(field,'==',user\.uid\)/);
  assert.match(html,/studentsByQuery\.forEach\(items=>items\.forEach\(student=>merged\.set\(student\.id,student\)\)\)/);
  assert.match(rules,/function ownsStudentProfile\(studentId, student\)/);
  assert.match(rules,/allow read: if isAdmin\(\) \|\| teacherCanRead\(resource\.data\) \|\| ownsStudentProfile\(studentId, resource\.data\)/);
});

test('non-staff data subscriptions are constrained to owned student ids',()=>{
  assert.match(html,/if\(!user\|\|isStaff\) return undefined/);
  assert.match(html,/\['lessons',setLes\]/);
  assert.match(html,/\['homework',setHw\]/);
  assert.match(html,/\['schedule',setSch\]/);
  assert.match(html,/\['messages',setMessages\]/);
  assert.match(html,/\['worksheetAssignments',setAllWsAssignments\]/);
  assert.match(html,/db\.collection\(name\)\.where\('studentId','in',ids\)/);
});

test('dashboard and invoice screen keep completed lessons and unpaid invoices visible',()=>{
  assert.match(html,/dashboardVisibleLessons\.length\} kokku/);
  assert.match(html,/\[\.\.\.dashboardVisibleLessons\]\.sort/);
  assert.match(html,/const pending = invoices\.filter\(inv=>inv\.status==='Ootel'\)/);
  assert.match(html,/studentIds[\s\S]*db\.collection\('invoices'\)\.where\('studentId','in',ids\)/);
});
