const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const source=fs.readFileSync('./haldus-lesson-builder/ai.js','utf8');

test('AI generation waits for Firebase to restore the signed-in teacher',()=>{
  assert.match(source,/authStateReady/);
  assert.match(source,/onAuthStateChanged/);
  assert.ok(source.indexOf('onAuthStateChanged')<source.indexOf('if(!auth.currentUser)'));
});
