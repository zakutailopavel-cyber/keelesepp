const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('./lesson-workspace-core.js');
const lesson=require('./adaptive-lessons/est-b1-city-problem-solving.js');

function itemBy(items,id){return items.find(item=>item.id===id);}

test('reference lesson builds stable phase-specific activity plan',()=>{
  const items=core.buildItems(lesson);
  assert.equal(items.length,14);
  assert.equal(itemBy(items,'d1').workspaceType,'diagnostic');
  assert.equal(itemBy(items,'stage-1-vocabulary-0').workspaceType,'vocabulary');
  assert.equal(itemBy(items,'stage-2-language-0').workspaceType,'controlled_practice');
  assert.equal(itemBy(items,'stage-3-speaking-transfer-0').workspaceType,'roleplay');
  assert.equal(itemBy(items,'stage-3-speaking-transfer-1').workspaceType,'transfer');
  assert.equal(itemBy(items,'stage-4-exit-0').workspaceType,'assessment');
});

test('diagnostic and assessment never request the generic scene or reveal expected answer by default',()=>{
  const items=core.buildItems(lesson);
  const diagnostic=core.workspaceModel({lesson,item:itemBy(items,'d1'),currentRoute:'core'});
  const assessment=core.workspaceModel({lesson,item:itemBy(items,'stage-4-exit-0'),currentRoute:'core'});
  assert.equal(diagnostic.type,'diagnostic');
  assert.equal(diagnostic.showScene,false);
  assert.equal(diagnostic.showExpectedInitially,false);
  assert.equal(assessment.type,'assessment');
  assert.equal(assessment.showExpectedInitially,false);
  assert.equal(core.sceneForWorkspace({scenes:{default:{src:'leak.jpg'}},item:itemBy(items,'d1'),type:diagnostic.type}),null);
});

test('vocabulary workspace changes scaffolding without changing CEFR level',()=>{
  const item=itemBy(core.buildItems(lesson),'stage-1-vocabulary-0');
  const support=core.workspaceModel({lesson,item,currentRoute:'support'});
  const standard=core.workspaceModel({lesson,item,currentRoute:'core'});
  const advanced=core.workspaceModel({lesson,item,currentRoute:'advanced'});
  assert.equal(support.type,'vocabulary');
  assert.equal(support.words.length,6);
  assert.equal(support.showTranslations,true);
  assert.equal(standard.words.length,10);
  assert.equal(standard.showTranslations,false);
  assert.equal(advanced.words.length,12);
  assert.equal(lesson.cefrLevel,'B1');
});

test('controlled practice exposes patterns only when scaffolding is appropriate',()=>{
  const item=itemBy(core.buildItems(lesson),'stage-2-language-0');
  const support=core.workspaceModel({lesson,item,currentRoute:'support'});
  const advanced=core.workspaceModel({lesson,item,currentRoute:'advanced'});
  assert.equal(support.type,'controlled_practice');
  assert.ok(support.patterns.length>=3);
  assert.equal(support.showPatterns,true);
  assert.equal(advanced.showPatterns,false);
});

test('roleplay and transfer are materially different workspace models',()=>{
  const items=core.buildItems(lesson);
  const roleplay=core.workspaceModel({lesson,item:itemBy(items,'stage-3-speaking-transfer-0'),currentRoute:'core'});
  const transfer=core.workspaceModel({lesson,item:itemBy(items,'stage-3-speaking-transfer-1'),currentRoute:'core'});
  assert.equal(roleplay.type,'roleplay');
  assert.ok(roleplay.studentRole.length>0);
  assert.ok(roleplay.teacherRole.length>0);
  assert.ok(roleplay.steps.length>=4);
  assert.equal(transfer.type,'transfer');
  assert.match(transfer.rule,/Uus olukord/);
  assert.notEqual(roleplay.prompt,transfer.prompt);
});

test('generic scene lookup never falls back to one universal default scene',()=>{
  const scene={src:'exact.jpg'};
  assert.deepEqual(core.sceneForWorkspace({scenes:{activity1:scene,default:{src:'default.jpg'}},item:{id:'activity1'},type:'scene'}),scene);
  assert.equal(core.sceneForWorkspace({scenes:{default:{src:'default.jpg'}},item:{id:'missing'},type:'scene'}),null);
  assert.equal(core.sceneForWorkspace({scenes:{activity1:scene},item:{id:'activity1'},type:'vocabulary'}),null);
});