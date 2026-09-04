const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('./learning-session-core.js');

const lesson={
  id:'est-b1-city-problem-solving-01',
  title:'Probleemi lahendamine linnas',
  cefrLevel:'B1',
  diagnostic:{items:[{id:'d1',skillIds:['vocabulary']},{id:'d2',skillIds:['speaking']}]},
  stages:[
    {id:'stage-1-vocabulary',skill:'vocabulary'},
    {id:'stage-2-language',skill:'grammar'},
    {id:'stage-3-speaking-transfer',skill:'speaking'},
    {id:'stage-4-exit',skill:'speaking'}
  ]
};

const student={id:'student-1',name:'Maria'};
const teacher={uid:'teacher-1',displayName:'Pavel'};
const diagnosticItem={kind:'diagnostic',id:'d1'};
const stageItem={kind:'stage',id:'stage-2-language-0',stageId:'stage-2-language'};

function session(){
  return {id:'session-1',studentId:'student-1',teacherUid:'teacher-1',lessonBlueprintId:lesson.id,evidenceCount:2,assessedSkillIds:['vocabulary'],routeBySkill:{vocabulary:'core'}};
}

test('buildSessionDraft creates an active session without mastery projection writes',()=>{
  const draft=core.buildSessionDraft({student,teacher,lesson,currentItem:diagnosticItem});
  assert.equal(draft.status,'active');
  assert.equal(draft.studentId,'student-1');
  assert.equal(draft.teacherUid,'teacher-1');
  assert.equal(draft.lessonBlueprintId,lesson.id);
  assert.equal(draft.evidenceCount,0);
  assert.deepEqual(draft.assessedSkillIds,[]);
  assert.equal(draft.routeBySkill.vocabulary,'core');
  assert.equal('skillMap' in draft,false);
  assert.equal(core.validateSessionDraft(draft).ok,true);
});

test('UI judgements map to canonical evidence judgements',()=>{
  assert.equal(core.mapUiJudgement('help'),'needs_help');
  assert.equal(core.mapUiJudgement('ok'),'managed');
  assert.equal(core.mapUiJudgement('easy'),'too_easy');
  assert.equal(core.mapUiJudgement('unknown'),null);
});

test('diagnostic evidence uses explicit diagnostic skill mapping',()=>{
  const evidence=core.buildTeacherEvidence({session:session(),lesson,item:diagnosticItem,route:'core',judgement:'help'});
  assert.deepEqual(evidence.skillIds,['vocabulary']);
  assert.equal(evidence.phaseId,'diagnostic');
  assert.equal(evidence.teacherJudgement,'needs_help');
  assert.equal(evidence.kind,'teacher_judgement');
  assert.equal(core.validateEvidence(evidence).ok,true);
});

test('stage evidence derives skill from the stage contract',()=>{
  const evidence=core.buildTeacherEvidence({session:session(),lesson,item:stageItem,route:'support',judgement:'managed'});
  assert.deepEqual(evidence.skillIds,['grammar']);
  assert.equal(evidence.phaseId,'stage-2-language');
  assert.equal(evidence.route,'support');
});

test('vocabulary marks become append-only vocabulary evidence',()=>{
  const weak=core.buildVocabularyEvidence({session:session(),lesson,item:stageItem,route:'core',wordId:'rike',mark:'weak'});
  assert.equal(weak.kind,'vocabulary_mark');
  assert.equal(weak.teacherJudgement,'needs_help');
  assert.deepEqual(weak.vocabularyIds,['rike']);
  assert.ok(weak.skillIds.includes('vocabulary'));

  const known=core.buildVocabularyEvidence({session:session(),lesson,item:stageItem,route:'advanced',wordId:'lahendus',mark:'known'});
  assert.equal(known.teacherJudgement,'managed');
  assert.equal(known.route,'advanced');
});

test('summary scores preserve missing assessments as missing, not zero',()=>{
  const scores=core.normalizeSummaryScores({vocabulary:'81',grammar:'',speaking:null,reading:0});
  assert.deepEqual(scores,{vocabulary:81,reading:0});
  const evidence=core.buildSummaryEvidence({session:session(),lesson,route:'core',scores});
  assert.equal(evidence.length,2);
  assert.deepEqual(evidence.map(item=>item.skillIds[0]),['vocabulary','reading']);
  assert.deepEqual(evidence.map(item=>item.taskResult),[81,0]);
});

test('nextSessionProgress increments evidence count and preserves assessed skills',()=>{
  const progress=core.nextSessionProgress({session:session(),lesson,item:stageItem,index:6,route:'support',evidenceDelta:1,skillIds:['grammar']});
  assert.equal(progress.currentIndex,6);
  assert.equal(progress.currentRoute,'support');
  assert.equal(progress.evidenceCount,3);
  assert.deepEqual(progress.assessedSkillIds,['vocabulary','grammar']);
  assert.equal(progress.routeBySkill.grammar,'support');
  assert.equal(progress.routeBySkill.vocabulary,'core');
});

test('score clamps explicit numeric evidence but does not invent missing values',()=>{
  assert.equal(core.score('101'),100);
  assert.equal(core.score('-3'),0);
  assert.equal(core.score(''),null);
  assert.equal(core.score(undefined),null);
});

test('session draft rejects missing identity fields',()=>{
  assert.throws(()=>core.buildSessionDraft({student:{},teacher,lesson,currentItem:diagnosticItem}),/studentId/);
  assert.throws(()=>core.buildSessionDraft({student,teacher:{},lesson,currentItem:diagnosticItem}),/teacherUid/);
});

test('invalid evidence cannot pass validation',()=>{
  const evidence=core.buildTeacherEvidence({session:session(),lesson,item:stageItem,route:'core',judgement:'ok'});
  evidence.route='wrong';
  assert.equal(core.validateEvidence(evidence).ok,false);
});