const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync(require.resolve('./haldus.html'),'utf8');

test('calendar creation and rescheduling no longer return early on overlaps',()=>{
  assert.doesNotMatch(html,/Tundi ei lisatud: .* kattuv tund/);
  assert.doesNotMatch(html,/Aega ei muudetud: .* kattuv tund/);
  assert.doesNotMatch(html,/Sellel ajal on õpetajal või õpilasel juba tund/);
});

test('all calendar save surfaces use the same non-blocking warning',()=>{
  const warningCalls=html.match(/scheduleConflictWarning\(conflicts,/g)||[];
  assert.ok(warningCalls.length>=5);
  assert.match(html,/conflictCount:conflicts\.length/);
});
