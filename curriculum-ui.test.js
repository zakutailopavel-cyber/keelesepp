const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const haldus=fs.readFileSync('haldus.html','utf8');
const css=fs.readFileSync('haldus.css','utf8');
const publicPage=fs.readFileSync('oppekavad.html','utf8');
const homepage=fs.readFileSync('index.html','utf8');
const vercel=JSON.parse(fs.readFileSync('vercel.json','utf8'));

test('v1 CRM loads detailed curriculum data and provides search plus preview',()=>{
  assert.match(haldus,/src="\/haldus-curriculum-data\.js"/);
  assert.match(haldus,/Õppekavad ja tunnistsenaariumid/);
  assert.match(haldus,/\{id:'programs',icon:'fa-route',label:'Õppekavad'\}/);
  assert.match(haldus,/tab==='programs'&&isStaff&&<ProgramsView\/>/);
  assert.match(haldus,/Otsi teemat, sõna või tunni eesmärki/);
  assert.match(haldus,/Materjali eelvaade — midagi ei laadita alla/);
  assert.match(haldus,/Ava täielik tunnikava/);
  assert.match(css,/\.curriculum-preview-overlay/);
  assert.match(css,/\.curriculum-lessons/);
});

test('public curriculum page has SEO, level overview and honest official references',()=>{
  assert.match(publicPage,/<link rel="canonical" href="https:\/\/epkoolitus\.ee\/oppekavad\/">/);
  assert.match(publicPage,/11[\s\S]*tasemeprogrammi/);
  assert.match(publicPage,/79[\s\S]*teemaplokki/);
  assert.match(publicPage,/158[\s\S]*tunnikava/);
  assert.match(publicPage,/KeeleSepp ei korralda riiklikku tasemeeksamit/);
  assert.match(publicPage,/https:\/\/harno\.ee\/eesti-keele-tasemeeksamid/);
  assert.match(publicPage,/href="\/haldus\/\?mode=register"/);
});

test('homepage and hosting expose the curriculum page',()=>{
  assert.match(homepage,/href="\/oppekavad\/"/);
  assert.ok(vercel.rewrites.some(item=>item.source==='/oppekavad/'&&item.destination==='/oppekavad.html'));
});
