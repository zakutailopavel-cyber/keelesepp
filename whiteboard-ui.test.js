const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('haldus-whiteboard/index.html','utf8');

test('whiteboard loads the Firestore-safe serialization adapter',()=>{
  assert.match(html,/whiteboard-core\.js\?v=20260902\.1/);
  assert.match(html,/WhiteboardCore\.persistElement\(fields\)/);
  assert.match(html,/WhiteboardCore\.hydrateElement\(fields\)/);
});

test('text and note editors open after pointer focus settles',()=>{
  assert.match(html,/function scheduleTextEditor\(el,isNew\)/);
  assert.match(html,/requestAnimationFrame\(\(\)=>\{/);
  assert.match(html,/scheduleTextEditor\(el,true\)/);
  assert.match(html,/ta\.style\.position = 'fixed'/);
  assert.match(html,/ta\.setAttribute\('aria-label'/);
});

test('double click editing is handled by the board rather than a pointer-disabled selection box',()=>{
  assert.match(html,/svg\.addEventListener\('dblclick', e=>\{/);
  assert.match(html,/openTextEditor\(hit,false\)/);
  assert.doesNotMatch(html,/box\.addEventListener\('dblclick'/);
});

test('color palette is mounted outside the clipped toolbar',()=>{
  assert.match(html,/document\.body\.appendChild\(pop\)/);
  assert.match(html,/pop\.style\.position='fixed'/);
  assert.doesNotMatch(html,/document\.getElementById\('toolbar'\)\.appendChild\(pop\)/);
});

test('undo waits for an in-flight eraser deletion',()=>{
  assert.match(html,/pendingHistoryWrites:new Set\(\)/);
  assert.match(html,/await waitForPendingHistoryWrites\(\);\s*const action = state\.history\.pop\(\)/);
  assert.match(html,/return trackHistoryWrite\(task\)/);
});
