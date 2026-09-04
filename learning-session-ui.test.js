const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const html=fs.readFileSync('haldus-adaptive-lesson/index.html','utf8');
const store=fs.readFileSync('learning-session-store.js','utf8');
const workspaceCore=fs.readFileSync('lesson-workspace-core.js','utf8');
const lesson=require('./adaptive-lessons/est-b1-city-problem-solving.js');
const vocabLesson=require('./adaptive-lessons/est-b1-city-vocabulary.js');

function inlineScripts(source){
  return [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map(match=>match[1].trim())
    .filter(Boolean);
}

test('Lesson Mode loads Learning Session, workspace and per-skill adaptive cores with Firebase Auth only',()=>{
  assert.match(html,/firebase-auth-compat\.js/);
  assert.match(html,/\/learning-session-core\.js/);
  assert.match(html,/\/learning-session-store\.js/);
  assert.match(html,/\/lesson-workspace-core\.js/);
  assert.match(html,/\/adaptive-skill-engine\.js/);
  assert.doesNotMatch(html,/firebase-firestore-compat\.js/);
});

test('Lesson Mode loads both supported blueprints and selects the requested lessonId',()=>{
  assert.match(html,/\/adaptive-lessons\/est-b1-city-problem-solving\.js/);
  assert.match(html,/\/adaptive-lessons\/est-b1-city-vocabulary\.js/);
  assert.match(html,/DEFAULT_LESSON_ID='est-b1-city-problem-solving-01'/);
  assert.match(html,/URLSearchParams\(location\.search\)\.get\('lessonId'\)/);
  assert.match(html,/KeeleSeppAdaptiveLessons\?\.\[requestedLessonId\]/);
  assert.equal(vocabLesson.id,'est-b1-city-vocabulary-01');
  assert.deepEqual(vocabLesson.curriculumGoalIds,['EST_B1_CITY_VOCAB']);
});

test('Lesson Mode persists only when a studentId is supplied and otherwise preserves preview mode',()=>{
  assert.match(html,/URLSearchParams\(location\.search\)\.get\('studentId'\)/);
  assert.match(store,/if\(!requestedStudentId\)/);
  assert.match(store,/status\('preview'/);
});

test('teacher judgement, vocabulary, navigation and completion call the persistence client',()=>{
  assert.match(html,/sessionStore\.recordJudgement/);
  assert.match(html,/sessionStore\.recordVocabulary/);
  assert.match(html,/sessionStore\.saveProgress/);
  assert.match(html,/sessionStore\.complete/);
});

test('Finish opens summary; completed persistence happens only from explicit handoff action',()=>{
  assert.match(html,/\$\('finish'\)\.onclick=showSummary/);
  assert.match(html,/\$\('handoff-btn'\)\.onclick=async\(\)=>/);
  const finishHandler=(html.match(/\$\('finish'\)\.onclick=([^;]+);/)||[])[1]||'';
  assert.doesNotMatch(finishHandler,/complete/);
});

test('summary fields are derived from lesson evidence skills instead of hardcoding three skills',()=>{
  assert.match(html,/function summarySkillIds\(\)/);
  assert.match(html,/lesson\.diagnostic\?\.items/);
  assert.match(html,/lesson\.stages/);
  assert.match(html,/summarySkillIds\(\)\.reduce/);
});

test('browser client never uses Firestore or writes skillMap directly',()=>{
  assert.doesNotMatch(store,/firebase\.firestore/);
  assert.doesNotMatch(store,/\bdb\.collection\s*\(/);
  assert.doesNotMatch(store,/runTransaction\s*\(/);
  assert.doesNotMatch(store,/FieldValue\./);
  assert.doesNotMatch(store,/skillMap/);
  assert.doesNotMatch(html,/firebase-firestore-compat\.js/);
  assert.doesNotMatch(html,/firebase\.firestore/);
  assert.doesNotMatch(html,/\bdb\.collection\s*\(/);
  assert.doesNotMatch(html,/skillMap\s*=/);
});

test('persistence client authenticates requests and reuses idempotency ids after ambiguous failures',()=>{
  assert.match(store,/getIdToken\(\)/);
  assert.match(store,/Authorization.*Bearer/);
  assert.match(store,/pendingRequestIds=new Map\(\)/);
  assert.match(store,/retryRequestId\(retryKey,'judge'\)/);
  assert.match(store,/retryRequestId\(retryKey,'vocab'\)/);
  assert.match(store,/retryRequestId\(retryKey,'complete'\)/);
  assert.match(store,/clearRetryRequestId\(retryKey\)/);
});

test('judgement persistence includes the deterministic per-skill route patch',()=>{
  assert.match(store,/nextRouteBySkill=\{\}/);
  assert.match(store,/nextRouteBySkill:routePatch/);
  assert.match(store,/JSON\.stringify\(routePatch\)/);
});

test('reference diagnostic tasks explicitly map to evidence skills and workspace type',()=>{
  assert.equal(lesson.id,'est-b1-city-problem-solving-01');
  assert.equal(lesson.diagnostic.workspaceType,'diagnostic');
  assert.equal(lesson.diagnostic.items.length,5);
  lesson.diagnostic.items.forEach(item=>{
    assert.ok(Array.isArray(item.skillIds),item.id);
    assert.ok(item.skillIds.length>0,item.id);
  });
  assert.deepEqual(lesson.diagnostic.items.find(item=>item.id==='d4').skillIds,['grammar','speaking']);
});

test('reference lesson declares different workspace types by pedagogical phase',()=>{
  assert.equal(lesson.stages[0].workspaceType,'vocabulary');
  assert.equal(lesson.stages[1].workspaceType,'controlled_practice');
  assert.equal(lesson.stages[2].workspaceType,'roleplay');
  assert.deepEqual(lesson.stages[2].taskWorkspaceTypes.slice(0,2),['roleplay','transfer']);
  assert.equal(lesson.stages[3].workspaceType,'assessment');
});

test('Lesson Mode renders dedicated workspace families instead of one universal scene card',()=>{
  for(const type of ['diagnostic','vocabulary','controlled_practice','roleplay','transfer','assessment']){
    assert.match(html,new RegExp(`data-workspace=\\"${type}\\"`),type);
  }
  assert.match(html,/renderDiagnostic/);
  assert.match(html,/renderVocabulary/);
  assert.match(html,/renderPractice/);
  assert.match(html,/renderRoleplay/);
  assert.match(html,/renderTransfer/);
  assert.match(html,/renderAssessment/);
  assert.match(workspaceCore,/type!==['"]scene['"]/);
  assert.doesNotMatch(workspaceCore,/scenes\?\.default/);
});

test('diagnostic and assessment keep answer model hidden until teacher explicitly opens control',()=>{
  assert.match(html,/model\.type==='diagnostic'\|\|model\.type==='assessment'/);
  assert.match(html,/expected-box.*classList\.toggle\('hidden'/s);
  assert.match(workspaceCore,/showExpectedInitially:false/);
});

test('Lesson Mode derives current workspace route from routeBySkill, not one permanent global route',()=>{
  assert.match(html,/routeBySkill:\{\}/);
  assert.match(html,/function itemSkillIds/);
  assert.match(html,/skillEngine\.routeForSkills/);
  assert.match(html,/skillEngine\.normalizeRouteBySkill\(snap\.session\.routeBySkill/);
  assert.match(html,/syncRoute\(items\[state\.index\],'core'\)/);
  assert.match(html,/Oskusepõhised rajad/);
});

test('teacher judgement updates per-skill UI before network confirmation and rolls back on failure',()=>{
  const start=html.indexOf("document.querySelectorAll('[data-judge]')");
  const end=html.indexOf("$('prev').onclick",start);
  const handler=html.slice(start,end);
  const decision=handler.indexOf('skillEngine.applyJudgement');
  const optimisticMap=handler.indexOf('state.routeBySkill=decision.routeBySkill');
  const optimisticRoute=handler.indexOf('state.route=decision.effectiveAfter');
  const savingStatus=handler.indexOf("showSavingStatus('Õpetaja hinnangu salvestamine…')");
  const request=handler.indexOf('await sessionStore.recordJudgement');
  assert.ok(decision>=0&&decision<request);
  assert.ok(optimisticMap>=0&&optimisticMap<request);
  assert.ok(optimisticRoute>=0&&optimisticRoute<request);
  assert.ok(savingStatus>=0&&savingStatus<request);
  assert.match(handler,/previousRouteBySkill=\{\.\.\.state\.routeBySkill\}/);
  assert.match(handler,/nextRouteBySkill:decision\.nextBySkill/);
  assert.match(handler,/state\.routeBySkill=previousRouteBySkill/);
  assert.match(handler,/state\.route=previousRoute/);
});

test('vocabulary mark highlights immediately and restores previous mark when persistence fails',()=>{
  const start=html.indexOf('function renderWords');
  const end=html.indexOf('function renderMore',start);
  const handler=html.slice(start,end);
  const optimisticMark=handler.indexOf('state.vocab[wordId]=mark');
  const savingStatus=handler.indexOf("showSavingStatus('Sõnavara tõendi salvestamine…')");
  const request=handler.indexOf('await sessionStore.recordVocabulary');
  assert.ok(optimisticMark>=0&&optimisticMark<request);
  assert.ok(savingStatus>=0&&savingStatus<request);
  assert.match(handler,/previousMark=state\.vocab\[wordId\]/);
  assert.match(handler,/delete state\.vocab\[wordId\]/);
  assert.match(handler,/state\.vocab\[wordId\]=previousMark/);
  assert.match(html,/\.word button\.selected/);
  assert.match(html,/syncWordButtons\(wordId,mark,true\)/);
});

test('active session and pending save have distinct status labels',()=>{
  assert.match(html,/active:'Valmis'/);
  assert.match(html,/saving:'Salvestan…'/);
});

test('inline Lesson Mode scripts parse as JavaScript',()=>{
  const scripts=inlineScripts(html);
  assert.ok(scripts.length>=2);
  scripts.forEach((source,index)=>{
    assert.doesNotThrow(()=>new vm.Script(source,{filename:`lesson-inline-${index}.js`}));
  });
});