const test=require('node:test');
const assert=require('node:assert/strict');
const {
  buildPdfDefinition,
  buildStudentExportRows,
  buildWordDocument,
  excelTableRows,
  exportBaseName,
}=require('./student-export-core');

const students=[
  {id:'student-1',name:'Milan Grozovski',active:true,subject:'Eesti keel',level:'A1',targetLevel:'B1',grade:'6. klass',teacher:'Pavel Zakutailo',email:'milan@example.com',packageTotal:10,packageUsed:3,createdAt:'2026-08-14'},
  {id:'student-2',name:'Аріна & Co',active:false,level:'A2',targetLevel:'B1'},
];
const lessons=[
  {id:'lesson-1',studentId:'student-1',studentName:'Milan',date:'2026-08-18',status:'Toimunud'},
  {id:'lesson-2',studentId:'student-1',date:'2026-08-20',status:'Tühistatud'},
  {id:'lesson-3',studentId:'another-student',studentName:'Milan Grozovski',date:'2026-08-21',status:'Toimunud'},
];

test('student export rows keep typed totals and never borrow another explicit student id',()=>{
  const rows=buildStudentExportRows({students,lessons});
  assert.equal(rows[0].completedLessons,1);
  assert.equal(rows[0].totalLessons,1);
  assert.equal(rows[0].lastLessonDate,'2026-08-18');
  assert.equal(rows[0].packageRemaining,7);
  assert.equal(rows[1].status,'Arhiveeritud');
  assert.equal(typeof excelTableRows(rows)[0][13],'number');
  assert.ok(excelTableRows(rows)[0][15] instanceof Date);
});

test('Word export is UTF-8 compatible, escaped, and repeats a real table header',()=>{
  const rows=buildStudentExportRows({students,lessons});
  const html=buildWordDocument(rows,{generatedAt:'2026-08-19',generatedBy:'Pavel',filterSummary:'Aktiivsed'});
  assert.match(html,/meta charset="UTF-8"/);
  assert.match(html,/thead\{display:table-header-group\}/);
  assert.match(html,/Аріна &amp; Co/);
  assert.doesNotMatch(html,/Аріна & Co<\/td>/);
});

test('PDF export uses landscape pages, repeating headers, and preserves Unicode text',()=>{
  const rows=buildStudentExportRows({students,lessons});
  const definition=buildPdfDefinition(rows,{generatedAt:'2026-08-19'});
  assert.equal(definition.pageOrientation,'landscape');
  assert.equal(definition.content[2].table.headerRows,1);
  assert.ok(JSON.stringify(definition).includes('Аріна & Co'));
});

test('export filename is deterministic and uses the selected date',()=>{
  assert.equal(exportBaseName({generatedAt:'2026-08-19T15:00:00Z'}),'keelesepp-opilased-2026-08-19');
});
