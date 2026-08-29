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
    assert.ok(built.blocks.some(block=>['match','fill','choice','reading','transformation'].includes(block.type)));
  }
});

test('only a published worksheet is assignable while legacy data remains compatible',()=>{
  const data={meta:{title:'Test'},blocks:[{type:'writing'}]};
  assert.equal(workflow.isAssignableWorksheet({worksheetData:data}),true);
  assert.equal(workflow.isAssignableWorksheet({worksheetStatus:'draft',worksheetData:data}),false);
  assert.equal(workflow.isAssignableWorksheet({worksheetStatus:'draft',worksheetData:{meta:{},blocks:[]},publishedWorksheetData:data}),true);
  assert.equal(workflow.isAssignableWorksheet({worksheetStatus:'published',publishedWorksheetData:data}),true);
  assert.equal(workflow.assignmentDataFor({worksheetStatus:'published',worksheetVersion:3,publishedWorksheetVersion:2,publishedWorksheetData:data}).worksheetVersion,2);
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
