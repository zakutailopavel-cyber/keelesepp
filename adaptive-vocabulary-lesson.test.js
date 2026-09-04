const test=require('node:test');
const assert=require('node:assert/strict');
const lesson=require('./adaptive-lessons/est-b1-city-vocabulary.js');
const goalGraph=require('./curriculum-goals/b1-city.js');
const workspace=require('./lesson-workspace-core.js');

test('B1 city vocabulary goal is bound to its own stable Lesson Mode blueprint',()=>{
  assert.equal(lesson.id,'est-b1-city-vocabulary-01');
  assert.equal(lesson.cefrLevel,'B1');
  assert.deepEqual(lesson.curriculumGoalIds,['EST_B1_CITY_VOCAB']);
  const goal=goalGraph.goals.find(item=>item.id==='EST_B1_CITY_VOCAB');
  assert.ok(goal);
  assert.deepEqual(goal.lessonBlueprintIds,[lesson.id]);
});

test('vocabulary diagnostic collects vocabulary evidence without answer-leaking workspace',()=>{
  assert.equal(lesson.diagnostic.workspaceType,'diagnostic');
  assert.equal(lesson.diagnostic.items.length,4);
  lesson.diagnostic.items.forEach(item=>{
    assert.deepEqual(item.skillIds,['vocabulary'],item.id);
    assert.ok(item.prompt);
    assert.ok(item.expected);
  });
});

test('every adaptive route keeps stable task slots for the same vocabulary goal',()=>{
  lesson.stages.forEach(stage=>{
    const expected=stage.routes.core.tasks.length;
    assert.ok(expected>0,stage.id);
    for(const route of ['support','core','advanced']){
      assert.equal(stage.routes[route].tasks.length,expected,`${stage.id}:${route}`);
    }
    assert.equal(stage.skill,'vocabulary',stage.id);
  });
});

test('vocabulary lesson uses phase-specific workspaces and a genuine transfer task',()=>{
  assert.equal(lesson.stages[0].workspaceType,'vocabulary');
  assert.equal(lesson.stages[1].workspaceType,'controlled_practice');
  assert.equal(lesson.stages[2].workspaceType,'roleplay');
  assert.deepEqual(lesson.stages[2].taskWorkspaceTypes,['roleplay','transfer','roleplay']);
  assert.equal(lesson.stages[3].workspaceType,'assessment');
  const items=workspace.buildItems(lesson);
  assert.ok(items.length>lesson.diagnostic.items.length);
  items.forEach(item=>assert.deepEqual(item.skillIds,['vocabulary'],item.id));
  assert.ok(items.some(item=>workspace.workspaceTypeFor(lesson,item,'core')==='transfer'));
});

test('vocabulary lesson keeps mastery writes outside the adaptive runtime',()=>{
  assert.equal(lesson.masteryPolicy.canonical,'students.skillMap');
  assert.equal(lesson.masteryPolicy.automaticWrite,false);
  assert.match(lesson.successCriteria.join(' '),/8 teemapõhist sõna/);
});