const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const page=fs.readFileSync('haldus-exercises/index.html','utf8');

test('empty subjects and levels are clearly unavailable',()=>{
  assert.match(page,/className=\{'subj-card'\+\(isAvailable\?'':' is-empty'\)\}/);
  assert.match(page,/aria-disabled=\{!isAvailable\}/);
  assert.match(page,/disabled=\{!hasMat\}/);
  assert.match(page,/Pole veel valmis/);
});

test('lesson and exercise cards display readiness checks',()=>{
  assert.match(page,/function ReadinessBadge/);
  assert.match(page,/<ReadinessBadge item=\{lesson\}/);
  assert.match(page,/<ReadinessBadge item=\{ex\} kind="exercise"/);
  assert.match(page,/Vajab kontrolli/);
  assert.match(page,/readinessFilter/);
});

test('destructive card actions live behind an overflow menu',()=>{
  assert.match(page,/className="more-actions"/);
  assert.match(page,/title="Rohkem toiminguid"/);
  assert.doesNotMatch(page,/isTeacher&&onDelete&&<button onClick=\{\(\)=>onDelete\(ex\)\}/);
});

test('curriculum navigation creates recoverable history entries',()=>{
  assert.match(page,/window\.history\.pushState\(\{oppevara:true\}/);
  assert.match(page,/window\.addEventListener\('popstate',restore\)/);
});

test('standalone data does not flash false zero states while loading',()=>{
  assert.match(page,/const\[contentLoading,setContentLoading\]/);
  assert.match(page,/Laadin õppevara…/);
  assert.match(page,/setContentLoading\(false\)/);
});
