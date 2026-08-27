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

test('student planner quick add keeps the student and exposes editable date and time',()=>{
  assert.match(html,/openPlannerStudentPopup\(event,student\)/);
  assert.match(html,/type="date" value=\{createPopup\.dayIso\}/);
  assert.match(html,/select value=\{createPopup\.slot\}/);
  assert.doesNotMatch(html,/weekDays\[0\]\?\.iso\|\|today\(\),TIMES\[2\]\|\|'09:00'/);
  assert.doesNotMatch(html,/onMouseEnter=.*openCreatePopup/);
});

test('mobile schedule opens a usable day view and moves the planner below the calendar',()=>{
  const css=fs.readFileSync(require.resolve('./haldus.css'),'utf8');
  assert.match(html,/isCompactSchedule\?'day':'week'/);
  assert.match(html,/className="calendar-mobile-days"/);
  assert.match(html,/className="calendar-layout"/);
  assert.match(html,/className="calendar-aside"/);
  assert.match(css,/\.calendar-layout\{flex-direction:column!important/);
  assert.match(css,/\.calendar-grid-inner\.is-day\{min-width:0!important/);
  assert.match(css,/\.calendar-aside\{width:100%!important/);
});

test('a completed calendar lesson can be saved without entering a topic',()=>{
  assert.match(html,/placeholder="Tunni teema \(valikuline\)"/);
  assert.match(html,/if\(!modalEv\) return;/);
  assert.match(html,/topic:String\(lTopic\|\|''\)\.trim\(\)/);
  assert.doesNotMatch(html,/if\(!modalEv\|\|!lTopic\.trim\(\)\)/);
});
