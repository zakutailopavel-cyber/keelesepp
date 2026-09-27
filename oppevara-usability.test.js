const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('./oppevara-usability-core');

test('flags the observed test copy and empty lesson records',()=>{
  assert.deepEqual(core.lessonIssues({title:'Mina',description:'gaegkgavn gegegegeg'}),['Sisu näib olevat testtekst']);
  assert.deepEqual(core.lessonIssues({title:'—'}),['Pealkiri puudub','Õppesisu puudub']);
});

test('requires real questions for reading exercises',()=>{
  const result=core.readiness({title:'Vastake igale küsimusele',type:'reading',passage:'Lugege tekst läbi.'},'exercise');
  assert.equal(result.key,'needs_review');
  assert.deepEqual(result.issues,['Küsimused puuduvad']);
});

test('flags an exercise that promises questions but contains none',()=>{
  const result=core.readiness({title:'Vastake igale küsimusele',type:'writing',task:'Vastake küsimustele 1–10.'},'exercise');
  assert.equal(result.key,'needs_review');
  assert.deepEqual(result.issues,['Lubatud küsimused puuduvad']);
});

test('accepts complete exercises and preserves explicit drafts',()=>{
  assert.equal(core.readiness({title:'Vali vastus',type:'choice',questions:[{question:'Kuhu Mari läheb?',options:['Kooli','Koju']}]},'exercise').key,'ready');
  assert.equal(core.readiness({title:'Tööleht',description:'Harjuta olevikku.',worksheetStatus:'draft'},'lesson').key,'draft');
});

test('worksheet instructions cannot promise missing questions',()=>{
  const result=core.lessonIssues({title:'Lugemine',worksheetData:{blocks:[{type:'reading',passage:'Tekst',instruction:'Vasta küsimustele 1–10.'}]}});
  assert.deepEqual(result,['Töölehe küsimused puuduvad']);
});
