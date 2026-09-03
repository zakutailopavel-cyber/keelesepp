const test=require('node:test');
const assert=require('node:assert/strict');
const {
  clampScore,
  skillStatus,
  normalizeSummaryEvidence,
  buildLearningProfile
}=require('./learning-profile-core.js');

test('clampScore preserves missing evidence and clamps numeric input',()=>{
  assert.equal(clampScore(null),null);
  assert.equal(clampScore(''),null);
  assert.equal(clampScore('61'),61);
  assert.equal(clampScore(-4),0);
  assert.equal(clampScore(108),100);
  assert.equal(clampScore('x'),null);
});

test('skillStatus keeps focus/caution/developing/strong bands deterministic',()=>{
  assert.equal(skillStatus(null),'untested');
  assert.equal(skillStatus(49),'focus');
  assert.equal(skillStatus(50),'caution');
  assert.equal(skillStatus(69),'caution');
  assert.equal(skillStatus(70),'developing');
  assert.equal(skillStatus(80),'strong');
});

test('normalizeSummaryEvidence reads live classroom summary v2 without inventing scores',()=>{
  const evidence=normalizeSummaryEvidence({
    id:'room-1',
    title:'Linn ja teenused',
    studentId:'student-1',
    endedAt:'2026-09-03T12:00:00.000Z',
    summaryVersion:2,
    lessonSummary:{
      teacherComment:'Speaking still needs support.',
      curriculumGoalIds:['goal-1'],
      curriculumGoalLabels:['Küsib viisakalt abi'],
      curriculumSkillIds:['B1_SPEAK_DESC'],
      nextHomework:'Harjuta dialoogi.'
    }
  });
  assert.deepEqual(evidence.skillIds,['B1_SPEAK_DESC']);
  assert.deepEqual(evidence.goalIds,['goal-1']);
  assert.deepEqual(evidence.goalLabels,['Küsib viisakalt abi']);
  assert.equal(evidence.teacherComment,'Speaking still needs support.');
  assert.equal('score' in evidence,false);
});

test('buildLearningProfile uses student skillMap as canonical projection',()=>{
  const profile=buildLearningProfile({
    student:{
      id:'student-1',
      name:'Mari',
      level:'B1',
      skillMap:{B1_SPEAK_DESC:42,B1_VOCAB_TOPIC:88,B1_CONDITIONAL:64,broken:'nope'}
    },
    rooms:[],
    skillLabels:{
      B1_SPEAK_DESC:'Kirjeldamine ja jutustamine',
      B1_VOCAB_TOPIC:'Teemapõhine sõnavara',
      B1_CONDITIONAL:'Tingiv kõneviis'
    }
  });
  assert.equal(profile.summary.assessedCount,3);
  assert.equal(profile.summary.focusCount,1);
  assert.equal(profile.summary.cautionCount,1);
  assert.equal(profile.summary.strongCount,1);
  assert.deepEqual(profile.recommendations.focusSkillIds,['B1_SPEAK_DESC']);
  assert.deepEqual(profile.recommendations.cautionSkillIds,['B1_CONDITIONAL']);
  assert.equal(profile.skills.find(x=>x.id==='B1_VOCAB_TOPIC').score,88);
});

test('buildLearningProfile includes only selected student evidence and sorts newest first',()=>{
  const profile=buildLearningProfile({
    student:{id:'student-1',skillMap:{}},
    rooms:[
      {id:'old',studentId:'student-1',endedAt:'2026-09-01T10:00:00Z',lessonSummary:{teacherComment:'old'}},
      {id:'other',studentId:'student-2',endedAt:'2026-09-04T10:00:00Z',lessonSummary:{teacherComment:'other'}},
      {id:'new',studentId:'student-1',endedAt:'2026-09-03T10:00:00Z',lessonSummary:{teacherComment:'new'}}
    ]
  });
  assert.deepEqual(profile.recentEvidence.map(x=>x.id),['new','old']);
});

test('attendance without lessonSummary is not promoted to learning evidence',()=>{
  const profile=buildLearningProfile({
    student:{id:'student-1',skillMap:{}},
    rooms:[{id:'room-1',studentId:'student-1',status:'ended',endedAt:'2026-09-03T10:00:00Z'}]
  });
  assert.equal(profile.summary.evidenceCount,0);
  assert.deepEqual(profile.recentEvidence,[]);
});
