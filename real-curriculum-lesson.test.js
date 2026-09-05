const test=require('node:test');
const assert=require('node:assert/strict');
const bindings=require('./functions/curriculum-lesson-bindings');
const lesson=require('./adaptive-lessons/est-b1-school-learning');
const workspace=require('./lesson-workspace-core');
const session=require('./learning-session-core');
const home=require('./teacher-home-core');
const engine=require('./adaptive-skill-engine');
const curriculum=require('./haldus-curriculum-data');
const workflow=require('./curriculum-workflow-core');
const fs=require('node:fs');
const vm=require('node:vm');

test('real curriculum first lesson launches its own blueprint, never the city pilot',()=>{
  const journey=workflow.buildStudentJourney(curriculum,{subject:'Eesti keel',level:'B1'},[],[],[],[]);
  assert.equal(journey.nextItem.key,'est-b1-01:0');
  assert.equal(journey.nextItem.lessonGoal,bindings.SCHOOL.lessonGoal);
  const summary=home.learningSummary({curriculumJourney:journey});
  assert.equal(home.actionForStudent('Robert-test',summary).href,`/haldus-adaptive-lesson/?studentId=Robert-test&lessonId=${lesson.id}`);
  assert.equal(bindings.forCurriculumItem(journey.nextItem).lessonBlueprintId,lesson.id);
  for(const patch of [{key:'est-b1-01:1'},{lessonIndex:1},{lessonIndex:null},{topicId:'est-b1-02'},{subject:'Inglise keel'},{level:'A1'}]){
    assert.equal(bindings.forCurriculumItem({...journey.nextItem,...patch}),null);
  }
  assert.equal(home.actionForStudent('test',home.learningSummary({curriculumJourney:journey,warning:'Missing progress'})).kind,'profile');
  assert.equal(home.actionForStudent('test',home.learningSummary({curriculumJourney:{...journey,valid:false}})).kind,'profile');
});

test('all phases use stable equal route slots, three independently adaptive skills, and 60 minutes',()=>{
  const items=workspace.buildItems(lesson);
  assert.deepEqual([...new Set(items.map(i=>workspace.workspaceTypeFor(lesson,i)))],['diagnostic','vocabulary','controlled_practice','roleplay','transfer','assessment']);
  assert.deepEqual([...new Set(items.flatMap(i=>session.skillIdsForItem({lesson,item:i})))],['vocabulary','grammar','speaking']);
  assert.equal(lesson.diagnostic.durationMinutes+lesson.stages.reduce((n,s)=>n+s.minutes,0)+5,60,'five minutes reserved for summary');
  for(const stage of lesson.stages) for(const route of ['support','core','advanced']) assert.equal(stage.routes[route].tasks.length,stage.routes.core.tasks.length);
  let routes={};
  for(const [skill,judgement] of [['vocabulary','easy'],['grammar','ok'],['speaking','help']]) routes=engine.applyJudgement({routeBySkill:routes,skillIds:[skill],judgement}).routeBySkill;
  assert.deepEqual(routes,{vocabulary:'advanced',grammar:'core',speaking:'support'});
  assert.equal(lesson.masteryPolicy.automaticWrite,false);
});

test('diagnostic and assessment hide answers and vocabulary assessment criteria do not give the words',()=>{
  for(const item of workspace.buildItems(lesson)){
    const model=workspace.workspaceModel({lesson,item});
    if(['diagnostic','assessment'].includes(model.type)) assert.equal(model.showExpectedInitially,false);
    if(item.stageId==='school-assessment-vocabulary') assert.doesNotMatch(model.criteria.join(' '),/õpetaja|kodutöö|hinne/);
    if(model.type==='transfer') assert.match(model.prompt,/veebikurs/);
  }
});

test('completed handoff returns to Teacher Home without marking curriculum achieved',()=>{
  const journey=workflow.buildStudentJourney(curriculum,{subject:'Eesti keel',level:'B1'},[],[],[],[]);
  const summary=home.learningSummary({curriculumJourney:journey,sessions:[{id:'completed',status:'completed',lessonBlueprintId:lesson.id,lessonTitle:lesson.title,handoffText:'Korda sõna hinne.',completedAt:'2026-09-05T11:00:00Z'}]});
  assert.equal(summary.latestHandoff.text,'Korda sõna hinne.');
  assert.equal(summary.activeSession,null);
  assert.equal(summary.curriculumNext.key,bindings.SCHOOL.key);
  assert.equal(summary.latestEvidence,null);
});

test('browser scripts parse and load shared binding before the real lesson and home routing',()=>{
  for(const file of ['haldus-adaptive-lesson/index.html','haldus-teacher-home/index.html']){
    const html=fs.readFileSync(file,'utf8');
    for(const [,src,inline] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) if(!src.includes('src=')) new vm.Script(inline,{filename:file});
    assert.ok(html.indexOf('/functions/curriculum-lesson-bindings.js')<html.indexOf(file.includes('teacher-home')?'/teacher-home-core.js':'/adaptive-lessons/est-b1-school-learning.js'));
  }
});


test('Learning Profile requires explicit pilot context and shows completed handoff separately from scores',()=>{
  const html=fs.readFileSync('haldus-learning-profile/index.html','utf8');
  assert.match(html,/if\(!explicitGraphContext\) return null/);
  assert.match(html,/Viimaste tundide handoff/);
  assert.match(html,/esc\(session.handoffText\|\|session.teacherNote\)/);
});
