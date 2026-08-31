const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync(require.resolve('./haldus.html'),'utf8');
const functionsSource=fs.readFileSync(require.resolve('./functions/index.js'),'utf8');

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

test('calendar exposes an actionable queue for visible schedule conflicts',()=>{
  assert.match(html,/scheduleConflictRows\(filteredSch,dates\)/);
  assert.match(html,/Ajaplaani konfliktid/);
  assert.match(html,/onClick=\{\(\)=>focusConflict\(row\)\}/);
  assert.match(html,/data-calendar-event-id/);
  assert.match(html,/Näita →/);
});

test('Google Calendar errors are translated and manual sync retries failed lessons',()=>{
  assert.match(html,/googleCalendarErrorGuidance\(activeError\)/);
  assert.match(html,/reconnectRequired\?'Ühenda uuesti'/);
  assert.match(html,/activeError&&!reconnectRequired\?'Proovi uuesti'/);
  assert.match(functionsSource,/backfillScheduleToGoogle\(uid, connection, \{ force: true \}\)/);
  assert.ok(functionsSource.indexOf('backfillScheduleToGoogle(uid, connection, { force: true })')<functionsSource.indexOf('const result = await syncTeacherCalendar(uid, connection)'));
  assert.match(functionsSource,/shouldApplyExplicitGoogleDeletion/);
  assert.doesNotMatch(functionsSource,/event\.source === "gcal"[\s\S]{0,300}!importedDocIds\.has/);
});

test('teacher can preview and safely clear only their future schedule from the visible week',()=>{
  assert.match(html,/Eemalda minu tunnid alates \$\{clearFromLabel\}/);
  assert.match(html,/\/schedule\/clear-future\/preview/);
  assert.match(html,/\/schedule\/clear-future\/apply/);
  assert.match(html,/Varasem ajalugu jääb alles/);
  assert.match(html,/Toimunud tunnid, arved ja maksed ei muutu/);
  assert.match(html,/setShowCanceled\(false\)/);
  assert.match(html,/includeExternalGoogle:true/);
  assert.match(html,/seotud sündmust eemaldatakse ka Google Calendarist/);
  assert.match(functionsSource,/req\.path === "\/schedule\/clear-future\/preview"/);
  assert.match(functionsSource,/req\.path === "\/schedule\/clear-future\/apply"/);
  assert.match(functionsSource,/schedule\.future_cleared/);
});

test('the exact sync incident can be recovered without reopening intentionally cleared lessons',()=>{
  assert.match(functionsSource,/req\.path === "\/schedule\/sync-recovery\/preview"/);
  assert.match(functionsSource,/req\.path === "\/schedule\/sync-recovery\/latest-preview"/);
  assert.match(functionsSource,/req\.path === "\/schedule\/sync-recovery\/apply"/);
  assert.match(functionsSource,/item\.status === "Tühistatud"/);
  assert.match(functionsSource,/!item\.gcalSyncRecoveredAt/);
  assert.match(functionsSource,/gcalSyncRecoveredAt/);
  assert.match(functionsSource,/schedule\.sync_recovered/);
  assert.match(html,/Kontrolli ekslikult tühistatud tunde/);
});
