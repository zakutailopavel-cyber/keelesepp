const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('./teacher-home-core.js');

test('teacher matching prefers stable uid and keeps legacy name aliases narrow',()=>{
  assert.equal(core.teacherMatches({teacherUid:'teacher-1',teacher:'Other'},{uid:'teacher-1',name:'Pavel Zakutailo'}),true);
  assert.equal(core.teacherMatches({teacherUid:'teacher-2',teacher:'Pavel'},{uid:'teacher-1',name:'Pavel Zakutailo'}),false);
  assert.equal(core.teacherMatches({teacher:'Elena Petrova'},{uid:'teacher-1',name:'Jelena Tamm'}),true);
  assert.equal(core.teacherMatches({teacher:'Other Teacher'},{uid:'teacher-1',name:'Pavel Zakutailo'}),false);
});

test('teacher day projection removes cancelled lessons and sorts by start time',()=>{
  const events=core.filterTeacherEvents([
    {id:'later',teacherUid:'t1',time:'15:00',studentName:'B'},
    {id:'cancelled',teacherUid:'t1',time:'12:00',status:'Tühistatud'},
    {id:'other',teacherUid:'t2',time:'10:00'},
    {id:'first',teacherUid:'t1',time:'09:30',studentName:'A'},
  ],{uid:'t1',name:'Pavel'});
  assert.deepEqual(events.map(item=>item.id),['first','later']);
  assert.equal(core.lessonEnd({time:'09:30',duration:60}),'10:30');
});

test('route map projection exposes only bounded canonical adaptive routes',()=>{
  assert.deepEqual(core.sanitizeRouteBySkill({
    vocabulary:'support',
    grammar:'core',
    speaking:'advanced',
    bad:'extreme',
    empty:'',
  }),{
    vocabulary:'support',
    grammar:'core',
    speaking:'advanced',
  });
});

test('learning summary preserves missing evidence as missing rather than zero',()=>{
  const summary=core.learningSummary({
    profile:{
      attention:[{id:'B1_SPEAK_DESC',label:'Rääkimine',score:42,status:'focus'}],
      recommendations:{reviewVocabularyIds:[]},
      recentEvidence:[],
    },
    sessions:[],
    evidence:[],
  });
  assert.equal(summary.latestEvidence,null);
  assert.equal(summary.recommendation,null);
  assert.equal(summary.activeSession,null);
  assert.equal(summary.attention[0].score,42);
  assert.equal(Object.prototype.hasOwnProperty.call(summary,'average'),false);
});

test('latest active adaptive session carries the persisted per-skill routes',()=>{
  const summary=core.learningSummary({
    sessions:[
      {id:'old',status:'active',updatedAt:'2026-09-04T09:00:00Z',lessonBlueprintId:core.REFERENCE_LESSON_ID,routeBySkill:{vocabulary:'core'}},
      {id:'new',status:'active',updatedAt:'2026-09-04T10:00:00Z',lessonBlueprintId:core.REFERENCE_LESSON_ID,routeBySkill:{vocabulary:'support',grammar:'core',speaking:'advanced'}},
    ],
  });
  assert.equal(summary.activeSession.id,'new');
  assert.deepEqual(summary.activeSession.routeBySkill,{vocabulary:'support',grammar:'core',speaking:'advanced'});
});

test('supported active lesson resumes, supported recommendation starts, otherwise profile opens',()=>{
  assert.deepEqual(core.actionForStudent('student 1',{
    activeSession:{lessonBlueprintId:core.REFERENCE_LESSON_ID}
  }),{
    kind:'lesson',
    label:'Jätka tundi',
    href:'/haldus-adaptive-lesson/?studentId=student%201'
  });
  assert.equal(core.actionForStudent('student-2',{
    recommendation:{goal:{id:core.REFERENCE_GOAL_ID}}
  }).label,'Alusta tundi');
  assert.equal(core.actionForStudent('student-3',{
    recommendation:{goal:{id:'ANOTHER_GOAL'}}
  }).label,'Ava õppimisprofiil');
});

test('today cards join schedule to student and learning context without inventing legacy ownership',()=>{
  const cards=core.buildTodayCards({
    actor:{uid:'t1',name:'Pavel'},
    events:[
      {id:'lesson-1',teacherUid:'t1',studentId:'s1',studentName:'Old name',time:'14:00',duration:45,title:'Eesti keel'},
      {id:'legacy',teacher:'Pavel',studentName:'Legacy Student',time:'16:00',duration:60},
    ],
    studentsById:{s1:{id:'s1',name:'Aleksandr',level:'B1'}},
    learningByStudent:{
      s1:{
        profile:{attention:[],recommendations:{reviewVocabularyIds:['rike']},recentEvidence:[]},
        recommendation:{status:'ready',goal:{id:core.REFERENCE_GOAL_ID,title:'Lahendab linnaprobleemi'}},
      }
    }
  });
  assert.equal(cards.length,2);
  assert.equal(cards[0].studentName,'Aleksandr');
  assert.equal(cards[0].endTime,'14:45');
  assert.deepEqual(cards[0].summary.reviewWords,['rike']);
  assert.equal(cards[0].primaryAction.label,'Alusta tundi');
  assert.equal(cards[1].studentId,'');
  assert.equal(cards[1].primaryAction,null);
  assert.equal(cards[1].studentName,'Legacy Student');
});