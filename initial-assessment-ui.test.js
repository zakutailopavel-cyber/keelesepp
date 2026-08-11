const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('haldus.html','utf8');
const rules=fs.readFileSync('firestore.rules','utf8');

test('student profile exposes a separate initial assessment tab',()=>{
  assert.match(html,/profileTab==='assessment'/);
  assert.match(html,/Esmane hindamine/);
  assert.match(html,/StudentInitialAssessment student=\{currentStu\}/);
});

test('assessment is stored as a student-linked document, not hardcoded per name',()=>{
  assert.match(html,/collection\('studentInitialAssessments'\)\.doc\(student\.id\)/);
  assert.doesNotMatch(html,/Tatjana Kobasova/);
  assert.match(html,/Esmast hindamist ei ole veel tehtud/);
  assert.match(html,/Loo hindamine/);
  assert.match(html,/Salvesta/);
  assert.match(html,/Tühista/);
});

test('rules scope assessment reads to the assigned teacher, admin, or student family',()=>{
  assert.match(rules,/match \/studentInitialAssessments\/\{studentId\}/);
  assert.match(rules,/teacherCanRead\(studentDoc\(studentId\)\)/);
  assert.match(rules,/ownsStudent\(studentId\)/);
  assert.match(rules,/validInitialAssessment\(request\.resource\.data, studentId\)/);
});
