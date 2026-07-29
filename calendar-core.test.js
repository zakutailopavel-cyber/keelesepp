const test=require('node:test');
const assert=require('node:assert/strict');
const {
  addMinutes,
  generateTimeSlots,
  eventOccursOnDate,
  findScheduleConflicts,
  layoutDayEvents,
  monthGrid,
  shiftMonth,
  buildSchedulePayload
}=require('./calendar-core');

test('calendar uses a real 15-minute grid and calculates lesson end times',()=>{
  const slots=generateTimeSlots('07:00','08:00',15);
  assert.deepEqual(slots,['07:00','07:15','07:30','07:45','08:00']);
  assert.equal(addMinutes('09:45',90),'11:15');
});

test('legacy dated and recurring events remain visible without migration',()=>{
  assert.equal(eventOccursOnDate({date:'2026-07-29'},'2026-07-29'),true);
  assert.equal(eventOccursOnDate({day:'Wed',recurring:true,startDate:'2026-07-01'},'2026-07-29'),true);
  assert.equal(eventOccursOnDate({day:'Wed',recurring:true,startDate:'2026-08-01'},'2026-07-29'),false);
  assert.equal(eventOccursOnDate({day:'Wed',recurring:true,startDate:'2026-07-01',excludedDates:['2026-07-29']},'2026-07-29'),false);
});

test('overlapping teacher and student bookings are reported',()=>{
  const existing=[
    {id:'one',date:'2026-07-29',time:'09:30',duration:60,teacher:'Pavel',studentId:'student-1',studentName:'Mari'},
    {id:'cancelled',date:'2026-07-29',time:'09:00',duration:120,teacher:'Pavel',studentId:'student-2',status:'Tühistatud'}
  ];
  const candidate={date:'2026-07-29',time:'10:15',duration:45,teacher:'Pavel Zakutailo',studentId:'student-3',studentName:'Jaan'};
  const conflicts=findScheduleConflicts(existing,candidate,'2026-07-29');
  assert.equal(conflicts.length,1);
  assert.deepEqual(conflicts[0].reasons,['teacher']);

  const studentConflict=findScheduleConflicts(existing,{...candidate,teacher:'Jelena',studentId:'student-1'},'2026-07-29');
  assert.deepEqual(studentConflict[0].reasons,['student']);
});

test('month grid is Monday-first and contains six stable weeks',()=>{
  const grid=monthGrid('2026-07-15');
  assert.equal(grid.length,42);
  assert.equal(grid[0].iso,'2026-06-29');
  assert.equal(grid[2].iso,'2026-07-01');
  assert.equal(shiftMonth('2026-12-10',1),'2027-01-01');
});

test('day layout keeps duration scale and places simultaneous lessons side by side',()=>{
  const layout=layoutDayEvents([
    {id:'one',date:'2026-07-29',time:'09:00',duration:60},
    {id:'two',date:'2026-07-29',time:'09:30',duration:45},
    {id:'three',date:'2026-07-29',time:'12:00',duration:30}
  ],'2026-07-29',{startMinute:7*60,endMinute:21*60,pixelsPerMinute:1});
  assert.equal(layout[0].top,120);
  assert.equal(layout[0].height,60);
  assert.equal(layout[0].laneCount,2);
  assert.equal(layout[1].laneCount,2);
  assert.equal(layout[2].laneCount,1);
  assert.equal(layout[2].widthPercent,100);
});

test('new schedule payload keeps stable student ownership and version metadata',()=>{
  const payload=buildSchedulePayload({
    teacher:'Pavel',
    studentId:'student-1',
    studentName:'Mari',
    date:'2026-07-29',
    time:'09:15',
    duration:45,
    nowIso:'2026-07-29T08:00:00.000Z'
  });
  assert.equal(payload.studentId,'student-1');
  assert.equal(payload.recurring,false);
  assert.equal(payload.scheduleVersion,2);
  assert.equal(payload.source,'keelesepp');
  assert.equal(payload.createdAtIso,'2026-07-29T08:00:00.000Z');
});
