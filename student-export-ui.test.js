const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('haldus.html','utf8');
const shared=fs.readFileSync('haldus-shared.js','utf8');

test('student roster exposes scoped filters without changing the database workspace',()=>{
  assert.match(html,/function StudentsList\(\{students,lessons,isAdmin/);
  assert.match(html,/Kõik õpetajad/);
  assert.match(html,/Kõik õppeained/);
  assert.match(html,/Kõik tasemed/);
  assert.match(html,/Kõik klassid/);
  assert.match(html,/Kõik grupid/);
  assert.match(html,/Toimunud tundidega/);
  assert.match(html,/Paketijääk olemas/);
  assert.match(html,/Lähtesta filtrid/);
  assert.match(html,/students=\{myStudents\}/);
  assert.match(html,/teacher:canonicalTeacherName\(row\.teacher\)/);
  assert.match(html,/\.map\(\(row,index\)=>\(\{\.\.\.row,index:index\+1\}\)\)/);
});

test('current filtered student selection can be exported to Word, PDF, and Excel',()=>{
  assert.match(html,/src="\/student-export-core\.js"/);
  assert.match(html,/StudentExportCore\.downloadWord\(visibleRows,metadata\)/);
  assert.match(html,/StudentExportCore\.downloadPdf\(visibleRows,metadata\)/);
  assert.match(html,/StudentExportCore\.downloadExcel\(visibleRows,metadata\)/);
  assert.match(html,/Filtrid ja väljavõte kasutavad ainult praegu nähtavaid õpilasi/);
  assert.match(shared,/KeeleSepp CRM · 27\.08\.2026\.3/);
});
