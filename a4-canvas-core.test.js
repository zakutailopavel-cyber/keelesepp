const test=require('node:test');
const assert=require('node:assert/strict');
const a4=require('./a4-canvas-core');
const authoring=require('./lesson-authoring-core');
const ux=require('./lesson-builder-ux-core');

const lesson=()=>({authoring:{activities:{a:{minutes:5},b:{minutes:6}}},activities:[{id:'a'},{id:'b'}]});

test('normalizes presentation metadata without changing stable activity IDs',()=>{
  const source=lesson(),draft=a4.normalize(source);
  assert.deepEqual(draft.activities.map(x=>x.id),['a','b']);
  assert.deepEqual(draft.authoring.activities.a.a4,{page:1,span:12,order:0});
  assert.equal(source.authoring.activities.a.a4,undefined);
});

test('supports deterministic 12-column widths and page placement',()=>{
  let draft=a4.setLayout(lesson(),'a',{span:8,page:2});
  draft=a4.setLayout(draft,'b',{span:4,page:2});
  assert.equal(a4.pageCount(draft),2);
  assert.deepEqual(a4.pages(draft)[1].map(x=>[x.activity.id,x.layout.span]),[['a',8],['b',4]]);
});

test('reorders presentation while preserving lesson activity identity and order',()=>{
  const source=lesson(),draft=a4.move(source,'b','a',1);
  assert.deepEqual(draft.activities.map(x=>x.id),['a','b']);
  assert.deepEqual(a4.pages(draft)[0].map(x=>x.activity.id),['b','a']);
});

test('rejects widths outside the supported grid',()=>{
  assert.throws(()=>a4.setLayout(lesson(),'a',{span:7}),/4, 6, 8 või 12/);
});

test('A4 presentation metadata survives the normalized cloud contract',()=>{
  let sequence=0;
  const source=ux.lessonTemplate('language60','draft-a4',()=>`stable-${sequence++}`);
  let draft=a4.setLayout(source,source.activities[0].id,{span:8,page:1});
  draft=a4.setLayout(draft,source.activities[1].id,{span:4,page:1});
  draft.authoring.a4={pageCount:2,answers:true,studentName:'Õpilane',date:'14.09.2026'};
  const restored=authoring.parse(authoring.serialize(draft));
  assert.deepEqual(restored.authoring.a4,draft.authoring.a4);
  assert.deepEqual(restored.authoring.activities[source.activities[0].id].a4,{page:1,span:8,order:0});
  assert.deepEqual(restored.activities.map(item=>item.id),source.activities.map(item=>item.id));
});

test('invalid A4 layout metadata is rejected before cloud save',()=>{
  let sequence=0;
  const draft=a4.normalize(ux.lessonTemplate('language60','draft-a4',()=>`stable-${sequence++}`));
  draft.authoring.activities[draft.activities[0].id].a4.span=7;
  assert.equal(authoring.validate(draft).ok,false);
});
