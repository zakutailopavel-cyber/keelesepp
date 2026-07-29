const test=require('node:test');
const assert=require('node:assert/strict');
const {
  buildLibraryItems,
  filterLibraryItems,
  curriculumType,
  assignmentKind
}=require('./learning-library-core');

test('classifies curriculum records without changing their source data',()=>{
  const worksheet={id:'w1',title:'Minu pere',type:'material',worksheetData:{blocks:[{type:'writing'}]}};
  const testRecord={id:'t1',title:'B1 test',type:'test',worksheetData:{blocks:[{type:'choice'}]}};
  const plan={id:'p1',title:'Tunnikava',phaseData:{org:{0:'Tervitus'}}};

  assert.equal(curriculumType(worksheet),'worksheet');
  assert.equal(curriculumType(testRecord),'test');
  assert.equal(curriculumType(plan),'lesson');
  assert.equal(worksheet.type,'material');
});

test('builds one searchable library from lessons and exercises',()=>{
  const items=buildLibraryItems(
    [
      {id:'l1',title:'Reisimine',subject:'Eesti keel',level:'B1',type:'lesson'},
      {id:'hidden',title:'Placeholder',__placeholder:true}
    ],
    [{id:'e1',title:'My family',subject:'Inglise keel',level:'A1',type:'choice'}]
  );

  assert.equal(items.length,2);
  assert.deepEqual(items.map(item=>item.kind),['curriculum','exercise']);
  assert.equal(filterLibraryItems(items,{query:'reisimine'}).length,1);
  assert.equal(filterLibraryItems(items,{subject:'Inglise keel',level:'A1'}).length,1);
  assert.equal(filterLibraryItems(items,{type:'exercise'}).length,1);
});

test('uses the student workbook for worksheets and homework links for exercises',()=>{
  const [worksheet,exercise]=buildLibraryItems(
    [{id:'w1',title:'Tööleht',worksheetData:{blocks:[{type:'fill'}]}}],
    [{id:'e1',title:'Harjutus',type:'fill'}]
  );

  assert.equal(assignmentKind(worksheet),'worksheet');
  assert.equal(assignmentKind(exercise),'exercise');
});
