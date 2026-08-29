const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const haldus=fs.readFileSync('haldus.html','utf8');
const css=fs.readFileSync('haldus.css','utf8');
const homepage=fs.readFileSync('index.html','utf8');
const library=fs.readFileSync('haldus-exercises/index.html','utf8');
const backend=fs.readFileSync('functions/index.js','utf8');
const vercel=JSON.parse(fs.readFileSync('vercel.json','utf8'));

test('v1 CRM loads detailed curriculum data and provides search plus preview',()=>{
  assert.match(haldus,/src="\/haldus-curriculum-data\.js"/);
  assert.match(haldus,/Õppekavad ja tunnistsenaariumid/);
  assert.match(haldus,/\{id:'programs',icon:'fa-route',label:'Õppekavad'\}/);
  assert.match(haldus,/tab==='programs'&&isStaff&&<ProgramsView db=\{db\}/);
  assert.match(haldus,/Otsi teemat, sõna või tunni eesmärki/);
  assert.match(haldus,/Materjali eelvaade — midagi ei laadita alla/);
  assert.match(haldus,/Ava täielik tunnikava/);
  assert.match(haldus,/Kasuta õppetöös/);
  assert.match(haldus,/Määra õpiteemaks/);
  assert.match(haldus,/Loo tööleht/);
  assert.match(haldus,/localStorage\.setItem\('ws_prefill'/);
  assert.match(haldus,/buildWorksheetPrefill\(actionItem\)/);
  assert.match(haldus,/Lisa õppevarasse/);
  assert.match(haldus,/Saada kodutöö/);
  assert.match(haldus,/Õppekava teema/);
  assert.match(haldus,/function CurriculumProgressCard/);
  assert.match(haldus,/validateStudentMatch/);
  assert.match(css,/\.curriculum-preview-overlay/);
  assert.match(css,/\.curriculum-lessons/);
});

test('curriculum links survive the lesson API and material level is validated',()=>{
  assert.match(haldus,/curriculumTopicId:modalEv\.curriculumTopicId/);
  assert.match(backend,/const curriculumTopicId = cleanText\(values\.curriculumTopicId/);
  assert.match(backend,/Incomplete curriculum lesson link/);
  assert.match(library,/src="\/curriculum-workflow-core\.js"/);
  assert.match(library,/validateMaterialLevel\(data\)/);
  assert.match(library,/Materjali ei salvestatud/);
});

test('curriculum stays private to CRM and is not exposed by the public site',()=>{
  assert.doesNotMatch(homepage,/href="\/oppekavad\/?"/);
  assert.equal(vercel.rewrites.some(item=>item.source==='/oppekavad'||item.source==='/oppekavad/'),false);
  assert.equal(fs.existsSync('oppekavad.html'),false);
});
