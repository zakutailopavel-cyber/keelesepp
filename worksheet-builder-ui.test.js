const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const worksheet=fs.readFileSync('haldus-worksheet/index.html','utf8');

test('worksheet builder accepts curriculum prefill and keeps ownership when saving',()=>{
  assert.match(worksheet,/src="\/curriculum-workflow-core\.js"/);
  assert.match(worksheet,/_prefill\?\.ai\?\.prompt/);
  assert.match(worksheet,/Täienda AI-ga/);
  assert.match(worksheet,/sourceType:'curriculum_workspace'/);
  assert.match(worksheet,/curriculumTopicId:source\.topicId/);
  assert.match(worksheet,/docs\.find\(doc=>doc\.sourceKey===`curriculum:/);
  assert.match(worksheet,/validateMaterialLevel\(record\)/);
});

test('worksheet builder has a visible quality gate and responsive editing layout',()=>{
  assert.match(worksheet,/analyzeWorksheet\(meta,blocks\)/);
  assert.match(worksheet,/Töölehe kvaliteet/);
  assert.match(worksheet,/Tööleht läbis kvaliteedikontrolli/);
  assert.match(worksheet,/@media\(max-width:760px\)/);
  assert.match(worksheet,/\.workspace\{display:flex;flex-direction:column/);
});

test('AI generation uses subject-specific CEFR profiles through C2',()=>{
  assert.match(worksheet,/const ENGLISH_CEFR_PROFILES=/);
  assert.match(worksheet,/const getCefrProfile=/);
  assert.match(worksheet,/targetSubject==='Inglise keel'\?'INGLISE':'EESTI'/);
  assert.match(worksheet,/Kõik õpilasele nähtavad tekstid \$\{targetLanguage\} KEELES/);
  assert.match(worksheet,/English CEFR profile active/);
  assert.match(worksheet,/EKI sõnavara on saadaval ainult eesti keele töölehtedele/);
  assert.match(worksheet,/C2:\{/);
});

test('worksheet builder protects unfinished work and offers teaching templates',()=>{
  assert.match(worksheet,/worksheet-workflow-core\.js/);
  assert.match(worksheet,/WS_DRAFT_KEY='keelesepp_ws_autodraft_v1'/);
  assert.match(worksheet,/Taastasime automaatselt sinu salvestamata töö/);
  assert.match(worksheet,/tab==='templates'/);
  assert.match(worksheet,/WorksheetWorkflow\.buildTemplate/);
});

test('worksheet saves immutable versions and only publishes quality checked work',()=>{
  assert.match(worksheet,/db\.collection\('worksheetVersions'\)\.doc/);
  assert.match(worksheet,/WorksheetWorkflow\?\.buildVersionFields/);
  assert.match(worksheet,/worksheetStatus==='published'&&!finalQuality\?\.ready/);
  assert.match(worksheet,/worksheetVersion:savedWorksheetVersion\|\|1/);
  assert.match(worksheet,/Salvesta uus versioon/);
});
