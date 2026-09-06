const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const contract=require('./activity-contract-core');
const workspace=require('./lesson-workspace-core');
const sessionCore=require('./learning-session-core');
const storeCore=require('./learning-session-store');
const school=require('./adaptive-lessons/est-b1-school-learning');
const clone=x=>JSON.parse(JSON.stringify(x));
const lessons=[school,require('./adaptive-lessons/est-b1-city-vocabulary'),require('./adaptive-lessons/est-b1-city-problem-solving')];
function legacySchool(){const result=clone(school);result.stages.forEach(s=>Object.values(s.routes).forEach(r=>{r.tasks=r.tasks.map(t=>t.prompt);}));return result;}

test('all existing blueprints normalize deterministically without input mutation',()=>{
  for(const lesson of lessons){
    const before=clone(lesson),a=contract.normalizeLesson(lesson);
    assert.deepEqual(a,contract.normalizeLesson(lesson));
    assert.deepEqual(lesson,before);
    assert.equal(contract.validateActivities(a).ok,true);
    assert.equal(new Set(a.map(x=>x.id)).size,a.length);
    for(const item of workspace.buildItems(lesson)) for(const route of contract.ROUTES){
      const model=workspace.workspaceModel({lesson,item,currentRoute:route});
      assert.equal(typeof model.prompt,'string');assert.ok(model.prompt.length);
    }
  }
});

test('school keeps all 12 historic evidence IDs and the exact legacy teaching models',()=>{
  const legacy=legacySchool();
  const current=workspace.buildItems(school),previous=workspace.buildItems(legacy);
  assert.equal(current.length,12);
  assert.deepEqual(current.map(x=>x.id),['school-d-vocabulary','school-d-grammar','school-d-speaking','school-vocabulary-0','school-vocabulary-1','school-grammar-0','school-grammar-1','school-speaking-0','school-transfer-0','school-assessment-vocabulary-0','school-assessment-grammar-0','school-assessment-speaking-0']);
  for(let i=0;i<current.length;i++) for(const route of contract.ROUTES){
    assert.deepEqual(workspace.workspaceModel({lesson:school,item:current[i],currentRoute:route}),workspace.workspaceModel({lesson:legacy,item:previous[i],currentRoute:route}));
  }
});

test('text edits and independent route reordering do not change logical identity',()=>{
  const changed=clone(school),stage=changed.stages[0];
  stage.routes.support.tasks.reverse();stage.routes.advanced.tasks.reverse();
  stage.taskWorkspaceTypes=['vocabulary','controlled_practice'];
  stage.routes.core.tasks[0].prompt='Edited text';
  const items=workspace.buildItems(changed),item=items.find(i=>i.id==='school-vocabulary-0');
  assert.deepEqual(items.map(i=>i.id),workspace.buildItems(school).map(i=>i.id));
  assert.equal(workspace.taskText(changed,item,'support'),school.stages[0].routes.support.tasks[0].prompt);
  assert.equal(workspace.taskText(changed,item,'advanced'),school.stages[0].routes.advanced.tasks[0].prompt);
  assert.equal(workspace.taskText(changed,item,'core'),'Edited text');
  assert.equal(workspace.workspaceTypeFor(changed,item,'advanced'),'vocabulary');
});

test('resume follows persisted activity ID after reorder/insertion, legacy index remains supported',()=>{
  const changed=clone(school);const stage=changed.stages[0];
  for(const r of contract.ROUTES)stage.routes[r].tasks.unshift({id:'school-new-independent',prompt:'New activity'});
  const items=workspace.buildItems(changed);
  assert.equal(items[contract.resolveResumeIndex(items,{currentActivityId:'school-vocabulary-0',currentIndex:3})].id,'school-vocabulary-0');
  assert.equal(contract.resolveResumeIndex(items,{currentIndex:4}),4);
  assert.throws(()=>contract.resolveResumeIndex(items,{currentActivityId:'removed',currentIndex:4}),/Saved activity/);
  assert.equal(contract.resolveResumeIndex(items,{currentIndex:Infinity}),0);
});

test('explicit task IDs are required, unique and must match across all routes',()=>{
  for(const mutate of [
    l=>{delete l.stages[0].routes.core.tasks[0].id;},
    l=>{delete l.stages[0].routes.core.tasks;},
    l=>{l.stages[1].id=l.stages[0].id;},
    l=>{l.stages[0].routes.support.tasks.pop();},
    l=>{l.stages[0].routes.support.tasks[0].id='other';},
    l=>{l.stages[0].routes.core.tasks[1].id=l.stages[0].routes.core.tasks[0].id;},
    l=>{l.stages[0].routes.core.tasks[0]='mixed';},
    l=>{l.diagnostic.items[0].id='summary-vocabulary';},
    l=>{l.stages[0].routes.core.tasks[0].workspaceType='invented';},
    l=>{l.diagnostic.items[0].id=l.diagnostic.items[1].id;}
  ]){const bad=clone(school);mutate(bad);assert.throws(()=>contract.normalizeLesson(bad),/Invalid activity contract/);}
});

test('optional capabilities are copied as inert metadata and malformed shapes are rejected',()=>{
  const lesson=clone(school),task=lesson.stages[0].routes.core.tasks[0];
  Object.assign(task,{responseMode:'spoken',assets:[{id:'future-scene',kind:'image'}],progression:{mode:'teacher'},collaboration:{mode:'pair'},evaluation:{rubricRef:'future-rubric'}});
  const activity=contract.normalizeLesson(lesson).find(a=>a.id===task.id);
  assert.deepEqual(activity.routes.core.evaluation,task.evaluation);
  assert.equal(activity.responseMode,'spoken');
  activity.assets[0].id='changed';assert.equal(task.assets[0].id,'future-scene');
  task.assets='wrong';assert.throws(()=>contract.normalizeLesson(lesson),/assets/);
  task.assets=[];task.progression='execute code';assert.throws(()=>contract.normalizeLesson(lesson),/progression/);
});

test('normalized items retain teacher, word, summary and phase evidence contracts',()=>{
  const session={id:'test-session',studentId:'test-student',teacherUid:'test-teacher',lessonBlueprintId:school.id};
  for(const item of workspace.buildItems(school))for(const route of contract.ROUTES){
    for(const event of [sessionCore.buildTeacherEvidence({session,lesson:school,item,route,judgement:'managed'}),sessionCore.buildVocabularyEvidence({session,lesson:school,item,route,wordId:'tund',mark:'known'})]){
      assert.equal(event.activityId,item.id);assert.equal(event.phaseId,item.stageId);assert.equal(sessionCore.validateEvidence(event).ok,true);
    }
  }
  assert.deepEqual(sessionCore.buildSummaryEvidence({session,lesson:school,scores:{vocabulary:50,grammar:'',speaking:70}}).map(e=>e.activityId),['summary-vocabulary','summary-speaking']);
});

test('existing persistence client sends normalized identity for start/progress/judgement/word and resumes it',async()=>{
  const items=workspace.buildItems(school),index=3,item=items[index],calls=[];
  const session={id:'test-session',status:'active',studentId:'test-student',studentName:'Test',currentActivityId:item.id,currentIndex:index,routeBySkill:{vocabulary:'core'}};
  const original=global.fetch;
  global.fetch=async(url,options)=>{const body=JSON.parse(options.body);calls.push(body);return {ok:true,json:async()=>({session,resumed:true,vocabularyMarks:{tund:'known'}})};};
  try{
    const store=storeCore.create({lesson:school,items,studentId:'test-student',apiUrl:'http://localhost/test',auth:{currentUser:{getIdToken:async()=>'test-token'}}});
    const restored=await store.init({initialIndex:index});
    assert.equal(contract.resolveResumeIndex(items,restored.session),index);assert.deepEqual(restored.vocabularyMarks,{tund:'known'});
    await store.saveProgress({index});await store.recordJudgement({index,judgement:'ok'});await store.recordVocabulary({index,wordId:'tund',mark:'known'});
    await store.complete({scores:{vocabulary:50},handoffText:'Test handoff'});
    for(const call of calls.slice(0,4)){assert.equal(call.activityId||call.currentActivityId,item.id);assert.equal(call.phaseId||call.currentPhaseId,item.stageId);}
    assert.equal(calls[4].handoffText,'Test handoff');assert.deepEqual(calls[4].scores,{vocabulary:50});
  }finally{global.fetch=original;}
});

test('browser UMD modules load in actual Lesson Mode script order without CommonJS',()=>{
  const html=fs.readFileSync('haldus-adaptive-lesson/index.html','utf8');
  const context=vm.createContext({});
  for(const [,path] of html.matchAll(/<script src="\/(.*?)"><\/script>/g)){
    if(path==='adaptive-lessons/scenes.js')continue;
    vm.runInContext(fs.readFileSync(path,'utf8'),context,{filename:path});
  }
  for(const lesson of Object.values(context.KeeleSeppAdaptiveLessons)){
    const items=context.KeeleSeppLessonWorkspaceCore.buildItems(lesson);
    assert.ok(items.length);assert.ok(items.every(i=>i.id&&i.activity.schemaVersion===1));
  }
  assert.match(html,/state.index=workspaceCore.resolveResumeIndex\(items,snap.session\)/);
});
