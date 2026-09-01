const test=require('node:test');
const assert=require('node:assert/strict');
const workflow=require('./worksheet-workflow-core');

test('worksheet templates provide editable, checkable language tasks',()=>{
  for(const template of workflow.TEMPLATES){
    const built=workflow.buildTemplate(template.id,{subject:'Inglise keel',level:'A2',topic:'Family'});
    assert.equal(built.templateId,template.id);
    assert.equal(built.subject,'Inglise keel');
    assert.ok(built.title.includes('Family'));
    assert.ok(built.blocks.length>=2);
    assert.ok(built.blocks.some(block=>['match','fill','choice','reading','transformation','audio','dictation','voice_recording'].includes(block.type)));
  }
});

test('listening and speaking templates create editable media tasks',()=>{
  const listening=workflow.buildTemplate('listening',{subject:'Eesti keel',level:'A2',topic:'Pere'});
  assert.deepEqual(listening.blocks.map(block=>block.type),['audio','dictation','multi_select']);
  assert.equal(listening.blocks[0].showTranscriptAfterSubmit,true);
  const speaking=workflow.buildTemplate('speaking',{subject:'Inglise keel',level:'B1',topic:'Travel'});
  assert.equal(speaking.blocks[1].type,'voice_recording');
  assert.equal(speaking.blocks[1].maxSeconds,90);
});

test('only a published worksheet is assignable while legacy data remains compatible',()=>{
  const data={meta:{title:'Test'},blocks:[{type:'writing'}]};
  assert.equal(workflow.isAssignableWorksheet({worksheetData:data}),true);
  assert.equal(workflow.isAssignableWorksheet({worksheetStatus:'draft',worksheetData:data}),false);
  assert.equal(workflow.isAssignableWorksheet({worksheetStatus:'draft',worksheetData:{meta:{},blocks:[]},publishedWorksheetData:data}),true);
  assert.equal(workflow.isAssignableWorksheet({worksheetStatus:'published',publishedWorksheetData:data}),true);
  assert.equal(workflow.assignmentDataFor({worksheetStatus:'published',worksheetVersion:3,publishedWorksheetVersion:2,publishedWorksheetData:data}).worksheetVersion,2);
});

test('assigned worksheet keeps exact curriculum ownership from a material',()=>{
  const data={meta:{title:'Tervitused'},blocks:[{type:'writing'}]};
  const snapshot=workflow.assignmentDataFor({
    worksheetStatus:'published',publishedWorksheetData:data,
    sourceKey:'curriculum:est-a1-01:1',subject:'Eesti keel',level:'A1',topic:'Tervitused'
  });
  assert.equal(snapshot.curriculumFields.curriculumTopicId,'est-a1-01');
  assert.equal(snapshot.curriculumFields.curriculumLessonIndex,1);
  assert.equal(snapshot.curriculumFields.curriculumSubject,'Eesti keel');
});

test('retry assignment preserves ownership and starts a clean auditable attempt',()=>{
  const original={id:'assignment-1',lessonId:'material-1',lessonTitle:'Tervitused',subject:'Eesti keel',level:'A1',topic:'Tervitused',status:'done',worksheetData:{meta:{title:'Tervitused'},blocks:[{type:'fill',text:'[Tere]'}]},studentId:'student-1',studentName:'Student',score:{pct:55},errorLog:[{type:'fill'}],sourceKey:'curriculum:est-a1-01:0'};
  const retry=workflow.buildRetryAssignment(original,{uid:'teacher-1',displayName:'Teacher'},'2026-08-31T12:00:00.000Z');
  assert.equal(retry.studentId,'student-1');
  assert.equal(retry.curriculumTopicId,'est-a1-01');
  assert.equal(retry.retryOfAssignmentId,'assignment-1');
  assert.equal(retry.retryNumber,1);
  assert.equal(retry.previousScorePct,55);
  assert.equal(retry.status,'new');
  assert.deepEqual(retry.answers,{});
  assert.equal(retry.score,null);
});

test('publishing creates immutable version fields and a published snapshot',()=>{
  const worksheetData={meta:{title:'Pere'},blocks:[{type:'match',pairs:[{l:'pere',r:'family'}]}]};
  const fields=workflow.buildVersionFields({status:'published',version:4,worksheetData,worksheetQuality:{percent:100},now:'2026-08-29T12:00:00.000Z'});
  assert.equal(fields.worksheetStatus,'published');
  assert.equal(fields.worksheetVersion,4);
  assert.equal(fields.publishedWorksheetVersion,4);
  assert.deepEqual(fields.publishedWorksheetData,worksheetData);
  worksheetData.blocks[0].pairs[0].l='changed';
  assert.equal(fields.publishedWorksheetData.blocks[0].pairs[0].l,'pere');
});

test('draft updates do not replace the previous published snapshot',()=>{
  const fields=workflow.buildVersionFields({status:'draft',version:5,worksheetData:{meta:{},blocks:[]},worksheetQuality:{percent:20},now:'2026-08-29T12:00:00.000Z'});
  assert.equal(fields.worksheetStatus,'draft');
  assert.equal(Object.hasOwn(fields,'publishedWorksheetData'),false);
  assert.equal(workflow.nextVersion(5),6);
});
