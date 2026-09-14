const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const haldus=fs.readFileSync('haldus.html','utf8');

test('daily teacher navigation exposes one productive workspace',()=>{
  assert.match(haldus,/label:isStaff\?'Minu tööpäev':'Töölaud'/);
  assert.match(haldus,/id:'students',[^\n]*daily:isStaff/);
  assert.match(haldus,/id:'calendar',[^\n]*daily:isStaff/);
  assert.match(haldus,/id:'programs'.*label:'Õppeprogramm',daily:true/s);
  assert.doesNotMatch(haldus,/src="\/haldus-teacher-home\/\?embedded=1"/);
});

test('external teacher tools open inside the CRM workspace',()=>{
  assert.match(haldus,/setEmbeddedWorkspace\(\{id:extItem\.id,label:extItem\.label/);
  assert.match(haldus,/tab==='embedded_workspace'/);
  assert.match(haldus,/<iframe className="workspace-frame" title=\{embeddedWorkspace\.label\}/);
  assert.doesNotMatch(haldus,/if\(extItem\)\{ window\.location\.assign/);
});

test('curriculum worksheet builder stays in the same workspace',()=>{
  assert.match(haldus,/keelesepp-open-workspace/);
  assert.match(haldus,/label:'Valmista tööleht'/);
  assert.doesNotMatch(haldus,/window\.open\(`\/haldus-worksheet\/\?source=curriculum/);
});

test('teacher can set student curriculum position with one number',()=>{
  assert.match(haldus,/PRAEGUNE KOHT PROGRAMMIS/);
  assert.match(haldus,/const saveJourneyPosition=async/);
  assert.match(haldus,/curriculumPlan:plan,curriculumPlanUpdatedAt/);
  assert.match(haldus,/curriculum\.position_set/);
});

test('embedded tools suppress their duplicate headers',()=>{
  const expectations={
    'haldus-exercises/index.html':/embedded-workspace \.top-header/,
    'haldus-worksheet/index.html':/embedded-workspace \.hdr/,
    'live-classroom.html':/embedded-workspace \.topbar/,
    'haldus-whiteboard/index.html':/embedded-workspace \.topbar/,
    'haldus-skillmap/index.html':/embedded-workspace \.top-header/
  };
  for(const [file,pattern] of Object.entries(expectations)){
    const source=fs.readFileSync(file,'utf8');
    assert.match(source,/URLSearchParams\(location\.search\).*embedded/);
    assert.match(source,pattern);
  }
});
