const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const crm=fs.readFileSync('haldus.html','utf8');
const library=fs.readFileSync('haldus-exercises/index.html','utf8');
const rules=fs.readFileSync('firestore.rules','utf8');

test('CRM assignment picker exposes only published worksheet snapshots',()=>{
  assert.match(crm,/worksheet-workflow-core\.js/);
  assert.match(crm,/WorksheetWorkflow\?\.isAssignableWorksheet/);
  assert.match(crm,/WorksheetWorkflow\.assignmentDataFor/);
  assert.match(crm,/worksheetVersion: effectiveSnapshot\.worksheetVersion/);
});

test('worksheet library opens the selected material in the editor',()=>{
  assert.match(library,/lessonId:lesson\.id,worksheetStatus:lesson\.worksheetStatus\|\|'published'/);
  assert.match(library,/localStorage\.setItem\('ws_prefill'/);
  assert.match(library,/window\.open\('\/haldus-worksheet\/\?edit='/);
});

test('worksheet version history is staff readable and append only',()=>{
  assert.match(rules,/match \/worksheetVersions\/\{versionId\}/);
  assert.match(rules,/allow read, create: if isStaff\(\)/);
  assert.match(rules,/allow update, delete: if false/);
});

test('visual worksheet blocks are visible in library preview and student player',()=>{
  assert.match(library,/diagram:'Skeem',comic:'Koomiks'/);
  assert.match(library,/block\.type==='diagram'/);
  assert.match(library,/block\.type==='comic'/);
  assert.match(crm,/diagram:'Skeem',comic:'Koomiks'/);
  assert.match(crm,/block\.type==='diagram'/);
  assert.match(crm,/block\.type==='comic'/);
});
