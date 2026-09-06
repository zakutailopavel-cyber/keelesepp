const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('./lesson-authoring-core'),workspace=require('./lesson-workspace-core'),contract=require('./activity-contract-core');
const school=require('./adaptive-lessons/est-b1-school-learning');
const draft=()=>core.fromLesson(school,'draft-test');

test('reference copy pins every existing activity ID and all route text',()=>{
  const copy=core.fromLesson(school,'draft-test');assert.equal(core.validate(copy).ok,true);
  const original=contract.normalizeLesson(school);assert.deepEqual(copy.activities.map(a=>a.id),original.map(a=>a.id));
  assert.deepEqual(copy.activities.map(a=>a.routes),original.map(a=>a.routes));
  copy.activities[0].routes.core.prompt='changed';assert.notEqual(school.diagnostic.items[0].prompt,'changed');
});
test('editing and reordering keep identity and per-activity skill mappings',()=>{
  let d=draft();const id=d.activities[3].id;
  d=core.updateActivity(d,id,{title:'New title',skillIds:['grammar','speaking'],phaseId:'practice'});
  d=core.moveActivity(d,id,-1);assert.equal(d.activities[2].id,id);
  const lesson=core.previewLesson(d),item=workspace.buildItems(lesson).find(a=>a.id===id);
  assert.deepEqual(item.skillIds,['grammar','speaking']);assert.equal(item.stageId,'practice');
  assert.equal(workspace.resolveResumeIndex(workspace.buildItems(lesson),{currentActivityId:id,currentIndex:3}),2);
  assert.throws(()=>core.updateActivity(d,id,{id:'replacement'}),/muutumatu/);
});
test('blank fields and empty/malformed drafts cannot be saved or previewed',()=>{
  const d=core.addActivity(core.createDraft('draft-test'),'act-new');
  assert.equal(core.validate(d).ok,false);assert.throws(()=>core.serialize(d),/ülesanne/);assert.throws(()=>core.previewLesson(d),/ülesanne/);
  for(const invalid of [null,{},[],{schemaVersion:1,kind:'keelesepp-lesson-draft',id:'draft-test',title:'x',activities:[null]}])assert.equal(core.validate(invalid).ok,false);
});
test('new task validation requires all variants before saving',()=>{
  let d=core.addActivity(core.createDraft('draft-test'),'act-stable');
  const routes=Object.fromEntries(core.ROUTES.map(r=>[r,{prompt:`Prompt ${r}`,expected:'Answer',teacherInstruction:'Listen first',workspaceType:'controlled_practice'}]));
  d=core.updateActivity(d,'act-stable',{routes});assert.equal(core.validate(d).ok,true);
  assert.deepEqual(core.parse(core.serialize(d)),d);
});
test('import validates context and normalization errors without executing content',()=>{
  const d=draft();d.activities[0].routes.core.prompt='<script>throw Error("injected")</script>';
  assert.equal(core.parse(core.serialize(d)).activities[0].routes.core.prompt,d.activities[0].routes.core.prompt);
  d.context.vocabulary=[null];assert.throws(()=>core.serialize(d),/Sõnavarakaart/);
  assert.throws(()=>core.parse('x'.repeat(core.MAX_BYTES+1)),/suur/);
  assert.throws(()=>core.parse('{broken'),SyntaxError);
});
test('normalized preview uses the exact existing workspace models and has no persistent identity',()=>{
  const d=draft(),preview=core.previewLesson(d),items=workspace.buildItems(preview),original=workspace.buildItems(school);
  assert.match(preview.id,/^authoring-preview-/);assert.equal(preview.curriculumLessonKey,undefined);
  for(let i=0;i<items.length;i++)for(const route of core.ROUTES){
    assert.deepEqual(workspace.workspaceModel({lesson:preview,item:items[i],currentRoute:route}),workspace.workspaceModel({lesson:school,item:original[i],currentRoute:route}));
  }
});
test('preview loader fails closed for absent or invalid draft tokens',()=>{
  const code=fs.readFileSync('lesson-authoring-preview.js','utf8');
  for(const query of ['?authoringPreview=invalid','?authoringPreview=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa&studentId=real-student']){
    const scope={window:{},location:{search:query},URLSearchParams,sessionStorage:{getItem:()=>null}};
    vm.runInNewContext(code,scope);assert.equal(scope.window.KeeleSeppAuthoringPreview.requested,true);assert.equal(scope.window.KeeleSeppAuthoringPreview.lesson,null);
  }
});
test('valid preview loader reads local JSON through validation without network',()=>{
  const scope={window:{KeeleSeppLessonAuthoring:core},location:{search:'?authoringPreview=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa&studentId=real-student'},URLSearchParams,sessionStorage:{getItem:()=>core.serialize(draft())}};
  vm.runInNewContext(fs.readFileSync('lesson-authoring-preview.js','utf8'),scope);
  assert.equal(scope.window.KeeleSeppAuthoringPreview.lesson.id,'authoring-preview-draft-test');
  const html=fs.readFileSync('haldus-adaptive-lesson/index.html','utf8');
  assert.match(html,/requestedStudentId=authoringPreview\?\.requested\?'':/);
  assert.match(html,/saving:!authoringPreview\?\.requested/);
});
test('UI exposes read-only IDs, escaped values, explicit local save and errors',()=>{
  const app=fs.readFileSync('haldus-lesson-builder/app.js','utf8');new vm.Script(app);
  assert.match(app,/id="activity-id" readonly/);assert.match(app,/if\(!report\(\)\)return/);
  assert.match(app,/localStorage.setItem\(STORAGE,core.serialize\(draft\)\)/);
  assert.doesNotMatch(app,/firebase|fetch\(/);
  assert.match(app,/esc\(v.prompt\)/);assert.match(app,/esc\(m\)/);
});

test('preview duration metadata is numeric and extra imported phase fields stay inert',()=>{
  const d=draft();
  for(const value of ['<img src=x onerror=alert(1)>',-1,Infinity,241]){
    d.context.phases[0].minutes=value;assert.equal(core.validate(d).ok,false);
  }
  d.context.phases[0].minutes=6;d.context.phases[0].untrusted='ignored';
  const preview=core.previewLesson(d);assert.equal(preview.stages[0].untrusted,undefined);
  assert.equal(preview.diagnostic.durationMinutes,school.diagnostic.durationMinutes);
  d.context.diagnosticDurationMinutes='<script>';assert.throws(()=>core.previewLesson(d),/kestus/);
});
