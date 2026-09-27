const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('./didactics-library-core');

test('derives a readable title and stable safe storage path',()=>{
  assert.equal(core.titleFromFileName('eesti_keel_A2-opetajaraamat.pdf'),'eesti keel A2 opetajaraamat');
  assert.match(core.storagePath('teacher-1','Õpetaja raamat.pdf',123),/^didactics\/teacher-1\/123_/);
});

test('validates didactic book formats and 100 MB limit',()=>{
  assert.equal(core.validateFile({name:'book.epub',size:1024}).ok,true);
  assert.equal(core.validateFile({name:'archive.zip',size:1024}).ok,false);
  assert.equal(core.validateFile({name:'huge.pdf',size:101*1024*1024}).ok,false);
});

test('searches author tags subject and file name while combining filters',()=>{
  const items=[
    {title:'Eesti keele mängud',author:'Mari Maasikas',category:'Mäng',subject:'Eesti keel',language:'Eesti',tags:['A2']},
    {title:'Teacher handbook',author:'John Doe',category:'Õpetajaraamat',subject:'Inglise keel',language:'Inglise',file:{name:'handbook.pdf'}}
  ];
  assert.deepEqual(core.filterItems(items,{query:'maasikas',category:'all',subject:'all',language:'all'}).map(item=>item.title),['Eesti keele mängud']);
  assert.deepEqual(core.filterItems(items,{query:'handbook',category:'Õpetajaraamat',subject:'Inglise keel',language:'Inglise'}).map(item=>item.title),['Teacher handbook']);
});

test('builds upload drafts from shared bulk metadata',()=>{
  assert.deepEqual(core.uploadDraft({name:'B1 grammar.pdf'},{category:'Metoodika',subject:'Eesti keel',level:'B1',language:'Vene',tags:['grammatika']}),{
    title:'B1 grammar',author:'',description:'',category:'Metoodika',subject:'Eesti keel',level:'B1',language:'Vene',tags:['grammatika'],status:'active'
  });
});
