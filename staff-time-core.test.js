const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {
  historicalActivityByDay,
  historicalActivitySummary
}=require('./staff-time-core');

test('CRM loads historical time core and keeps the estimate visibly separate',()=>{
  const html=fs.readFileSync('haldus.html','utf8');
  assert.match(html,/src="\/staff-time-core\.js"/);
  assert.match(html,/Ajalooline aktiivsuse hinnang päevade kaupa/);
  assert.match(html,/PROGRAM_ACTIVITY_LAUNCH_DATE='2026-07-29'/);
  assert.match(html,/activityLog=\{activityLog\}/);
});

test('historical estimate joins nearby actions and starts a new block after idle time',()=>{
  const days=historicalActivityByDay([
    {byUid:'admin',date:'2026-06-03',createdAt:'2026-06-03T08:00:00.000Z'},
    {byUid:'admin',date:'2026-06-03',createdAt:'2026-06-03T08:10:00.000Z'},
    {byUid:'admin',date:'2026-06-03',createdAt:'2026-06-03T10:00:00.000Z'}
  ],{month:'2026-06',beforeDate:'2026-07-29'});
  assert.equal(days.length,1);
  assert.equal(days[0].estimateMinutes,20);
  assert.equal(days[0].sessionCount,2);
  assert.equal(days[0].eventCount,3);
  assert.equal(days[0].confidence,'very_low');
});

test('historical estimate excludes exact-tracking dates and other staff',()=>{
  const days=historicalActivityByDay([
    {byUid:'admin',date:'2026-07-28',createdAt:'2026-07-28T08:00:00.000Z'},
    {byUid:'admin',date:'2026-07-29',createdAt:'2026-07-29T08:00:00.000Z'},
    {byUid:'teacher',date:'2026-07-28',createdAt:'2026-07-28T08:00:00.000Z'}
  ],{month:'2026-07',beforeDate:'2026-07-29',staffUids:['admin']});
  assert.deepEqual(days.map(day=>day.date),['2026-07-28']);
});

test('historical summary keeps staff and days separate',()=>{
  const summary=historicalActivitySummary([
    {byUid:'admin',date:'2026-06-01',createdAt:'2026-06-01T08:00:00.000Z'},
    {byUid:'admin',date:'2026-06-02',createdAt:'2026-06-02T08:00:00.000Z'},
    {byUid:'teacher',date:'2026-06-01',createdAt:'2026-06-01T08:00:00.000Z'}
  ],{month:'2026-06'});
  assert.equal(summary.days.length,3);
  assert.deepEqual(
    summary.staff.map(item=>[item.staffUid,item.estimateMinutes,item.dayCount]).sort(),
    [['admin',10,2],['teacher',5,1]]
  );
});

test('duplicate timestamps never inflate historical time',()=>{
  const days=historicalActivityByDay([
    {byUid:'admin',date:'2026-06-01',createdAt:'2026-06-01T08:00:00.000Z'},
    {byUid:'admin',date:'2026-06-01',createdAt:'2026-06-01T08:00:00.000Z'}
  ],{month:'2026-06'});
  assert.equal(days[0].eventCount,1);
  assert.equal(days[0].estimateMinutes,5);
});
