const test=require('node:test');
const assert=require('node:assert/strict');
const {
  getRoles,
  isStaff,
  buildScene,
  buildSceneHistoryEntry,
  buildLessonSummary,
  normalizeCurriculumGoals,
  applyCurriculumGoalsToSkillMap,
  normalizeActionUrl,
  sceneAcceptsResponse,
  isUnsafeDisplaySurface,
  classroomLink,
  lessonHistorySortValue,
  lessonDurationMinutes,
  responsesForScene,
  isPresenceFresh,
  classroomErrorMessage
}=require('./live-classroom-core');

test('combined roles are normalized for classroom access',()=>{
  assert.deepEqual(getRoles({role:'parent',studentRole:true}).sort(),['parent','student']);
  assert.equal(isStaff({role:'teacher'}),true);
  assert.equal(isStaff({role:'student'}),false);
});

test('choice scenes require at least two useful options',()=>{
  assert.throws(()=>buildScene({type:'choice',title:'Vali',options:['üks','']}),/vähemalt kahte/);
  const scene=buildScene({type:'choice',title:'Vali',options:[' A ','B'],version:4});
  assert.deepEqual(scene.options,['A','B']);
  assert.equal(scene.version,4);
  assert.equal(sceneAcceptsResponse(scene),true);
});

test('message scenes are bounded and classroom links are stable',()=>{
  const scene=buildScene({type:'message',body:'x'.repeat(5000)});
  assert.equal(scene.body.length,4000);
  assert.equal(classroomLink('https://www.epkoolitus.ee/','room one'),'https://www.epkoolitus.ee/live-classroom/?room=room%20one');
});

test('library scenes keep only public source metadata and safe internal links',()=>{
  const scene=buildScene({
    type:'short_answer',
    title:'Kirjuta',
    body:'Vasta küsimusele.',
    version:2,
    source:{
      kind:'exercise',
      id:'exercise-1',
      type:'exercise',
      answerKey:'must-not-leak'
    },
    actionUrl:'/haldus-exercises/?exercise=exercise-1&student=student-1'
  });

  assert.deepEqual(scene.source,{kind:'exercise',id:'exercise-1',type:'exercise'});
  assert.equal(scene.actionUrl,'/haldus-exercises/?exercise=exercise-1&student=student-1');
  assert.equal(JSON.stringify(scene).includes('answerKey'),false);
});

test('external and malformed classroom action links are rejected',()=>{
  assert.equal(normalizeActionUrl('https://evil.example/task'),'');
  assert.equal(normalizeActionUrl('//evil.example/task'),'');
  assert.equal(normalizeActionUrl('javascript:alert(1)'),'');
  assert.equal(normalizeActionUrl('/haldus-exercises/'),'\/haldus-exercises\/');
});

test('scene history keeps a bounded public snapshot and stable ownership metadata',()=>{
  const entry=buildSceneHistoryEntry({
    classroomId:'room-1',
    room:{
      studentId:'student-1',
      studentName:'Mari',
      teacherUid:'teacher-1',
      teacherName:'Pavel'
    },
    scene:{
      type:'short_answer',
      title:'Kirjuta vastus',
      body:'Selgita oma valikut.',
      options:[],
      version:3,
      publishedAt:'2026-07-29T08:00:00.000Z',
      source:{kind:'exercise',id:'exercise-1',type:'exercise',answerKey:'private'},
      actionUrl:'/haldus-exercises/?exercise=exercise-1'
    },
    eventType:'material_published',
    createdAtIso:'2026-07-29T08:00:00.000Z'
  });

  assert.equal(entry.classroomId,'room-1');
  assert.equal(entry.sceneVersion,3);
  assert.equal(entry.eventType,'material_published');
  assert.deepEqual(entry.scene.source,{kind:'exercise',id:'exercise-1',type:'exercise'});
  assert.equal(JSON.stringify(entry).includes('answerKey'),false);
});

test('lesson summary is bounded and keeps homework tied to the completed room',()=>{
  const summary=buildLessonSummary({
    teacherComment:`  Harjutasime minevikku. ${'x'.repeat(4000)}  `,
    achievedGoals:'Moodustab minevikulauseid\n\nKasutab uut sõnavara\n'.repeat(8),
    nextHomework:'Tee harjutus 4.',
    homeworkDue:'2026-08-05',
    homeworkId:'live-classroom-room-1'
  });

  assert.equal(summary.teacherComment.length,3000);
  assert.equal(summary.achievedGoals.length,12);
  assert.equal(summary.achievedGoals[0],'Moodustab minevikulauseid');
  assert.equal(summary.nextHomework,'Tee harjutus 4.');
  assert.equal(summary.homeworkDue,'2026-08-05');
  assert.equal(summary.homeworkId,'live-classroom-room-1');
});

test('lesson summary requires a teacher comment and drops orphan homework metadata',()=>{
  assert.throws(()=>buildLessonSummary({nextHomework:'Ülesanne'}),/kokkuvõte/);
  assert.deepEqual(
    buildLessonSummary({
      teacherComment:'Tunni kokkuvõte',
      homeworkDue:'not-a-date',
      homeworkId:'orphan'
    }),
    {
      teacherComment:'Tunni kokkuvõte',
      achievedGoals:[],
      curriculumGoalIds:[],
      curriculumGoalLabels:[],
      curriculumSkillIds:[],
      curriculumSubject:'',
      curriculumLevel:'',
      nextHomework:'',
      homeworkDue:'',
      homeworkId:''
    }
  );
});

test('curriculum goals keep stable evidence and only raise confirmed skills',()=>{
  const curriculumGoals=normalizeCurriculumGoals([
    {id:'A2_BASIC_TENSES',label:'Kasutab põhilisi ajavorme',skillIds:['A2_PRESENT_FULL','A2_PAST_BASIC','A2_PAST_BASIC']},
    {id:'A2_BASIC_TENSES',label:'Duplikaat',skillIds:['SHOULD_NOT_APPEAR']},
    {id:'bad id!',label:'Puhastatud ID',skillIds:['A2_READ_TEXT']}
  ]);
  assert.deepEqual(curriculumGoals,[
    {id:'A2_BASIC_TENSES',label:'Kasutab põhilisi ajavorme',skillIds:['A2_PRESENT_FULL','A2_PAST_BASIC']},
    {id:'badid',label:'Puhastatud ID',skillIds:['A2_READ_TEXT']}
  ]);

  const summary=buildLessonSummary({
    teacherComment:'Harjutasime ajavorme.',
    achievedGoals:'Iseseisev lisatulemus',
    curriculumGoals:[curriculumGoals[0]],
    curriculumSubject:'Eesti keel',
    curriculumLevel:'A2'
  });
  assert.deepEqual(summary.curriculumGoalIds,['A2_BASIC_TENSES']);
  assert.deepEqual(summary.curriculumGoalLabels,['Kasutab põhilisi ajavorme']);
  assert.deepEqual(summary.curriculumSkillIds,['A2_PRESENT_FULL','A2_PAST_BASIC']);
  assert.deepEqual(summary.achievedGoals,['Kasutab põhilisi ajavorme','Iseseisev lisatulemus']);

  assert.deepEqual(
    applyCurriculumGoalsToSkillMap(
      {A2_PRESENT_FULL:55,A2_PAST_BASIC:92,UNRELATED:30},
      summary.curriculumSkillIds
    ),
    {A2_PRESENT_FULL:80,A2_PAST_BASIC:92,UNRELATED:30}
  );
});

test('lesson history helpers order rooms, calculate duration and pair responses to scenes',()=>{
  const room={
    startedAt:'2026-07-29T08:00:00.000Z',
    endedAt:'2026-07-29T08:47:00.000Z'
  };
  assert.equal(lessonHistorySortValue(room),Date.parse(room.endedAt));
  assert.equal(lessonDurationMinutes(room),47);
  assert.equal(lessonDurationMinutes({createdAtIso:'invalid'}),null);
  assert.deepEqual(
    responsesForScene([
      {id:'later',sceneVersion:2,createdAtIso:'2026-07-29T08:05:00.000Z'},
      {id:'other',sceneVersion:3,createdAtIso:'2026-07-29T08:02:00.000Z'},
      {id:'earlier',sceneVersion:2,createdAtIso:'2026-07-29T08:03:00.000Z'}
    ],2).map(item=>item.id),
    ['earlier','later']
  );
});

test('whole-monitor sharing is rejected by the privacy guard',()=>{
  assert.equal(isUnsafeDisplaySurface('monitor'),true);
  assert.equal(isUnsafeDisplaySurface('window'),false);
  assert.equal(isUnsafeDisplaySurface('browser'),false);
  assert.equal(isUnsafeDisplaySurface(undefined),false);
});

test('presence becomes offline when the heartbeat is stale or explicitly stopped',()=>{
  const now=Date.parse('2026-07-28T20:00:00.000Z');
  assert.equal(isPresenceFresh({online:true,lastSeenIso:'2026-07-28T19:59:30.000Z'},now),true);
  assert.equal(isPresenceFresh({online:true,lastSeenIso:'2026-07-28T19:58:00.000Z'},now),false);
  assert.equal(isPresenceFresh({online:false,lastSeenIso:'2026-07-28T19:59:59.000Z'},now),false);
  assert.equal(isPresenceFresh(null,now),false);
});

test('technical classroom errors are translated into useful guidance',()=>{
  assert.match(classroomErrorMessage({code:'permission-denied',message:'Missing or insufficient permissions.'}),/ligipääsu/);
  assert.match(classroomErrorMessage({code:'unavailable'}),/Ühendus/);
  assert.equal(classroomErrorMessage('Klassiruumi ei leitud.'),'Klassiruumi ei leitud.');
});
