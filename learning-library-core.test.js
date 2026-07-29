const test=require('node:test');
const assert=require('node:assert/strict');
const {
  buildLibraryItems,
  filterLibraryItems,
  curriculumType,
  groupLibraryItems,
  itemsInLibraryPath,
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

test('groups materials into subject, level or age and curriculum topic folders',()=>{
  const items=buildLibraryItems(
    [
      {id:'p1',title:'Pere tunnikava',subject:'Eesti keel',level:'A1',topic:'Minu pere',type:'lesson'},
      {id:'w1',title:'Pere tööleht',subject:'Eesti keel',level:'A1',topic:'Minu pere',worksheetData:{blocks:[{type:'fill'}]}},
      {id:'kids',title:'Tähed',subject:'Eesti keel',ageGroup:'6–7 aastat',topic:'Tähestik',type:'material'}
    ],
    [{id:'e1',title:'Family match',subject:'Inglise keel',level:'A1',topic:'My family',type:'match'}]
  );

  assert.deepEqual(groupLibraryItems(items,'subject').map(folder=>[folder.label,folder.count]),[
    ['Eesti keel',3],
    ['Inglise keel',1]
  ]);
  const estonian=itemsInLibraryPath(items,{subject:'Eesti keel'});
  assert.deepEqual(groupLibraryItems(estonian,'stage').map(folder=>folder.label),['6–7 aastat','A1']);
  const a1=itemsInLibraryPath(items,{subject:'Eesti keel',stage:'A1'});
  assert.deepEqual(groupLibraryItems(a1,'topic').map(folder=>[folder.label,folder.count]),[['Minu pere',2]]);
});

test('keeps legacy records visible in safe ungrouped folders',()=>{
  const items=buildLibraryItems(
    [{id:'legacy',title:'Vana materjal',type:'material'}],
    [
      {id:'exam',title:'Kuulamine',subject:'Eesti keel',level:'B1',examPart:'kuulamine'},
      {id:'legacy-exam',title:'Kirjutamine',subject:'Eesti keel',level:'B1',topic:'__exam__kirjutamine'}
    ]
  );

  assert.equal(groupLibraryItems(items,'subject').at(-1).label,'Muu õppevara');
  const examItems=itemsInLibraryPath(items,{subject:'Eesti keel',stage:'B1'});
  assert.deepEqual(groupLibraryItems(examItems,'topic').map(folder=>folder.label),[
    'Eksam: Kirjutamine',
    'Eksam: Kuulamine'
  ]);
  assert.equal(itemsInLibraryPath(items,{subject:'__ungrouped__'}).length,1);
});

test('prefers an explicit curriculum folder while preserving topic search',()=>{
  const [item]=buildLibraryItems([
    {
      id:'linked',
      title:'Sõnavara',
      subject:'Eesti keel',
      level:'A2',
      topic:'Igapäevaelu',
      curriculumTitle:'A2 kevadkursus',
      type:'material'
    }
  ],[]);

  assert.equal(groupLibraryItems([item],'topic')[0].label,'A2 kevadkursus');
  assert.equal(filterLibraryItems([item],{query:'igapäevaelu'}).length,1);
});
