const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const crm=fs.readFileSync('haldus.html','utf8');
const home=fs.readFileSync('haldus-teacher-home/index.html','utf8');
const builder=fs.readFileSync('haldus-lesson-builder/index.html','utf8');
const builderCss=fs.readFileSync('haldus-lesson-builder/style.css','utf8');

test('daily dashboard and lesson builder are internal workspace destinations',()=>{
  assert.match(crm,/id:'dashboard'.*daily:isStaff/);
  assert.match(crm,/id:'lesson_builder'.*daily:true/);
  assert.doesNotMatch(crm,/id:'dashboard'.*isExternal:true/);
  assert.doesNotMatch(crm,/id:'lesson_builder'.*isExternal:true/);
  assert.match(crm,/hidden=\{tab!=='lesson_builder'\}/);
});

test('workspace keeps a consistent title and signed-in profile header',()=>{
  assert.match(crm,/aria-label="Kasutaja profiil"/);
  assert.match(crm,/className="workspace-surface-header"/);
  assert.match(crm,/label:isStaff\?'Minu tööpäev':'Töölaud'/);
  assert.match(crm,/>Valmista tund</);
  assert.match(crm,/user\.displayName\|\|user\.email/);
});

test('embedded destinations remove duplicate chrome without removing builder actions',()=>{
  assert.match(home,/workspace-embedded \.top\{display:none\}/);
  assert.match(home,/keelesepp-workspace-navigate/);
  assert.match(builder,/classList\.add\('workspace-embedded'\)/);
  assert.match(builderCss,/workspace-embedded \.topbar \.brand/);
  assert.match(builder,/id="save" class="primary"/);
  assert.match(builder,/id="show-preview"/);
});

test('embedded tools and lesson builder stay inside the workspace shell',()=>{
  assert.match(crm,/title=\{embeddedWorkspace\.label\} src=\{embeddedWorkspace\.href\}/);
  assert.match(crm,/useState\('\/haldus-lesson-builder\/\?embedded=1'\)/);
  assert.match(crm,/src=\{builderHref\}/);
  assert.match(crm,/hidden=\{isStaff&&\(tab==='embedded_workspace'\|\|tab==='lesson_builder'\)\}/);
});

test('curriculum preparation links keep their context inside the workspace',()=>{
  assert.match(crm,/url\.searchParams\.set\('embedded','1'\)/);
  assert.match(crm,/setBuilderHref\(url\.pathname\+'\?'\+url\.searchParams\.toString\(\)\)/);
  assert.match(home,/parent\.postMessage\(\{type:'keelesepp-workspace-navigate'/);
});
