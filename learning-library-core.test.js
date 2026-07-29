const test=require('node:test');
const assert=require('node:assert/strict');
const {
  buildLibraryItems,
  filterLibraryItems,
  curriculumType,
  groupLibraryItems,
  itemsInLibraryPath,
  libraryPathFromSearch,
  searchWithLibraryPath,
  normalizeLibraryPath,
  classroomSceneDraft,
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

test('uses a stable curriculum id for folders when one is available',()=>{
  const [item]=buildLibraryItems([{
    id:'linked',
    curriculumId:'plan-a2-spring',
    curriculumTitle:'A2 kevadkursus',
    topic:'Igapäevaelu',
    title:'Sõnavara'
  }],[]);

  const [folder]=groupLibraryItems([item],'topic');
  assert.equal(folder.key,'__curriculum__:plan-a2-spring');
  assert.equal(folder.label,'A2 kevadkursus');
  assert.equal(itemsInLibraryPath([item],{topic:folder.key}).length,1);
});

test('serializes a library path without losing unrelated query parameters',()=>{
  const search=searchWithLibraryPath('?preview=library&exercise=keep',{
    subject:'Eesti keel',
    stage:'A2',
    topic:'Minu pere'
  });

  assert.deepEqual(libraryPathFromSearch(search),{
    subject:'Eesti keel',
    stage:'A2',
    topic:'Minu pere'
  });
  const params=new URLSearchParams(search);
  assert.equal(params.get('preview'),'library');
  assert.equal(params.get('exercise'),'keep');
});

test('clears stale child folders while keeping the deepest valid path',()=>{
  const items=buildLibraryItems([{
    id:'one',
    subject:'Eesti keel',
    level:'A1',
    topic:'Pere',
    title:'Pere'
  }],[]);

  assert.deepEqual(normalizeLibraryPath(items,{
    subject:'Eesti keel',
    stage:'A1',
    topic:'Puuduv'
  }),{
    subject:'Eesti keel',
    stage:'A1',
    topic:''
  });
  assert.deepEqual(normalizeLibraryPath(items,{
    subject:'Puuduv',
    stage:'A1',
    topic:'Pere'
  }),{
    subject:'',
    stage:'',
    topic:''
  });
});

test('creates a public choice scene without its answer key',()=>{
  const [item]=buildLibraryItems([],[{
    id:'choice-1',
    title:'Vali õige vastus',
    type:'choice',
    questions:[{question:'Ma ___ kooli.',options:['lähen','läheb'],correct:0}]
  }]);
  const scene=classroomSceneDraft(item);

  assert.equal(scene.type,'choice');
  assert.deepEqual(scene.options,['lähen','läheb']);
  assert.deepEqual(scene.source,{kind:'exercise',id:'choice-1',type:'exercise'});
  assert.equal(JSON.stringify(scene).includes('"correct"'),false);
});

test('removes fill answers and correct order from public classroom scenes',()=>{
  const [fill,order]=buildLibraryItems([],[
    {id:'fill-1',title:'Lüngad',type:'fill',text:'Ma [lähen] täna [kooli].'},
    {id:'order-1',title:'Lause',type:'order',sentence:'Mina lähen täna kooli'}
  ]);

  const fillScene=classroomSceneDraft(fill);
  const orderScene=classroomSceneDraft(order);
  assert.equal(fillScene.body,'Ma _____ täna _____.');
  assert.equal(fillScene.body.includes('lähen'),false);
  assert.equal(fillScene.body.includes('kooli'),false);
  assert.equal(orderScene.body.includes('Mina lähen täna kooli'),false);
  assert.match(orderScene.body,/lähen · täna · kooli · Mina/);
});

test('publishes the first supported worksheet block and omits internal worksheet data',()=>{
  const [item]=buildLibraryItems([{
    id:'worksheet-1',
    title:'Tööleht',
    worksheetData:{
      answerKey:'private',
      blocks:[
        {type:'image',imageUrl:'https://private.example/image.png'},
        {type:'writing',task:'Kirjuta oma päevast.',teacherAnswer:'private'}
      ]
    }
  }],[]);
  const scene=classroomSceneDraft(item);

  assert.equal(scene.type,'short_answer');
  assert.equal(scene.body,'Kirjuta oma päevast.');
  assert.deepEqual(Object.keys(scene.source).sort(),['id','kind','type']);
  assert.equal(JSON.stringify(scene).includes('private'),false);
});
