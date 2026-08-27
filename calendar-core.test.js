const test=require('node:test');
const assert=require('node:assert/strict');
const {
  addMinutes,
  generateTimeSlots,
  quickLessonSlot,
  eventOccursOnDate,
  eventsForDate,
  findScheduleConflicts,
  scheduleConflictWarning,
  layoutDayEvents,
  monthGrid,
  shiftMonth,
  buildSchedulePayload,
  buildOccurrenceExceptionPlan
}=require('./calendar-core');

test('calendar uses a real 15-minute grid and calculates lesson end times',()=>{
  const slots=generateTimeSlots('07:00','08:00',15);
  assert.deepEqual(slots,['07:00','07:15','07:30','07:45','08:00']);
  assert.equal(addMinutes('09:45',90),'11:15');
});

test('student quick add uses the visible current day and nearest future quarter hour',()=>{
  assert.deepEqual(
    quickLessonSlot(
      ['2026-07-27','2026-07-28','2026-07-29','2026-07-30','2026-07-31'],
      {now:new Date(2026,6,30,12,33)}
    ),
    {dayIso:'2026-07-30',slot:'12:45'}
  );
  assert.deepEqual(
    quickLessonSlot(
      ['2026-08-03','2026-08-04'],
      {now:new Date(2026,6,30,12,33)}
    ),
    {dayIso:'2026-08-03',slot:'09:00'}
  );
});

test('student quick add moves late-evening creation to tomorrow',()=>{
  assert.deepEqual(
    quickLessonSlot(['2026-07-30'],{now:new Date(2026,6,30,22,10)}),
    {dayIso:'2026-07-31',slot:'09:00'}
  );
});

test('legacy dated and recurring events remain visible without migration',()=>{
  assert.equal(eventOccursOnDate({date:'2026-07-29'},'2026-07-29'),true);
  assert.equal(eventOccursOnDate({day:'Wed',recurring:true,startDate:'2026-07-01'},'2026-07-29'),true);
  assert.equal(eventOccursOnDate({day:'Wed',recurring:true,startDate:'2026-08-01'},'2026-07-29'),false);
  assert.equal(eventOccursOnDate({day:'Wed',recurring:true,startDate:'2026-07-01',excludedDates:['2026-07-29']},'2026-07-29'),false);
});

test('one completed recurring occurrence does not complete the whole series',()=>{
  const series={
    id:'series-one',studentId:'student-one',studentName:'Student One',
    recurring:true,startDate:'2026-08-03',day:'Mon',time:'10:00',status:'Planeeritud',
    occurrenceStatuses:{
      '2026-08-10':{status:'Toimunud',lessonEntryId:'lesson-one'}
    }
  };
  const completed=eventsForDate([series],'2026-08-10')[0];
  const future=eventsForDate([series],'2026-08-17')[0];
  assert.equal(completed.status,'Toimunud');
  assert.equal(completed.lessonEntryId,'lesson-one');
  assert.equal(future.status,'Planeeritud');
  assert.equal(future.lessonEntryId||'','');
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

test('overlap warning confirms the save and explains who is double-booked',()=>{
  const warning=scheduleConflictWarning([
    {
      date:'2026-07-29',
      reasons:['teacher','student'],
      event:{time:'10:00'}
    },
    {
      date:'2026-07-29',
      reasons:['teacher'],
      event:{time:'10:30'}
    }
  ],'Tund lisati');
  assert.equal(
    warning,
    '⚠ Tund lisati, kuid õpetajal ja õpilasel on 2026-07-29 kell 10:00 kattuv tund. Veel 1 kattuvust.'
  );
  assert.equal(scheduleConflictWarning([],'Tund lisati'),'');
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
    teacherUid:'teacher-1',
    studentId:'student-1',
    studentName:'Mari',
    date:'2026-07-29',
    time:'09:15',
    duration:45,
    nowIso:'2026-07-29T08:00:00.000Z'
  });
  assert.equal(payload.studentId,'student-1');
  assert.equal(payload.teacherUid,'teacher-1');
  assert.equal(payload.recurring,false);
  assert.equal(payload.scheduleVersion,2);
  assert.equal(payload.source,'keelesepp');
  assert.equal(payload.createdAtIso,'2026-07-29T08:00:00.000Z');
});

test('single occurrence plan excludes the series date and creates a stable child lesson',()=>{
  const plan=buildOccurrenceExceptionPlan({
    id:'series-1',
    recurring:true,
    startDate:'2026-07-01',
    day:'Wed',
    time:'10:00',
    duration:60,
    teacher:'Pavel',
    teacherUid:'teacher-1',
    studentId:'student-1',
    studentName:'Mari'
  },'2026-07-29',{
    date:'2026-07-30',
    time:'11:15',
    status:'Nihutatud'
  },{nowIso:'2026-07-29T10:00:00.000Z'});
  assert.deepEqual(plan.seriesPatch.excludedDates,['2026-07-29']);
  assert.equal(plan.exception.seriesId,'series-1');
  assert.equal(plan.exception.originalOccurrenceDate,'2026-07-29');
  assert.equal(plan.exception.originalDate,'2026-07-29');
  assert.equal(plan.exception.date,'2026-07-30');
  assert.equal(plan.exception.day,'Thu');
  assert.equal(plan.exception.time,'11:15');
  assert.equal(plan.exception.recurring,false);
  assert.equal(plan.exception.scheduleVersion,3);
  assert.equal(plan.exception.occurrenceKind,'override');
  assert.equal(plan.exception.rescheduledAt,'2026-07-29');
  assert.equal(plan.exception.gcalEventId,undefined);
});

test('single occurrence cancellation remains visible as a cancelled child record',()=>{
  const plan=buildOccurrenceExceptionPlan({
    id:'series-2',
    recurring:true,
    startDate:'2026-07-01',
    day:'Wed',
    time:'12:00',
    studentId:'student-2',
    studentName:'Mark'
  },'2026-07-29',{status:'Tühistatud'});
  assert.equal(plan.exception.date,'2026-07-29');
  assert.equal(plan.exception.status,'Tühistatud');
  assert.equal(plan.exception.occurrenceKind,'cancelled');
  assert.equal(plan.exception.seriesId,'series-2');
});

test('occurrence plan rejects dates outside the active series',()=>{
  assert.equal(buildOccurrenceExceptionPlan({
    id:'series-3',
    recurring:true,
    startDate:'2026-08-01',
    day:'Wed',
    time:'12:00'
  },'2026-07-29',{}),null);
});

test('moved occurrence still conflicts with another date from its own series',()=>{
  const series={
    id:'series-4',
    recurring:true,
    startDate:'2026-07-01',
    day:'Wed',
    time:'10:00',
    duration:60,
    teacher:'Pavel',
    studentId:'student-4',
    excludedDates:['2026-07-29']
  };
  const candidate={
    ...series,
    id:'',
    recurring:false,
    date:'2026-08-05',
    time:'10:15'
  };
  const conflicts=findScheduleConflicts([series],candidate,'2026-08-05',{excludeId:''});
  assert.equal(conflicts.length,1);
  assert.deepEqual(conflicts[0].reasons,['teacher','student']);
});
