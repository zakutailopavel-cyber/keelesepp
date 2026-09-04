const test=require('node:test');
const assert=require('node:assert/strict');
const {
  clampScore,
  skillStatus,
  normalizeSummaryEvidence,
  normalizeAdaptiveEvidence,
  latestVocabularyReviewIds,
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

test('normalizeAdaptiveEvidence joins session context without promoting it to mastery',()=>{
  const evidence=normalizeAdaptiveEvidence({
    id:'ev-1',sessionId:'session-1',studentId:'student-1',createdAt:'2026-09-04T10:00:00Z',
    kind:'summary_score',skillIds:['speaking'],taskResult:61,route:'support'
  },{
    'session-1':{lessonTitle:'Probleemi lahendamine linnas',teacherName:'Pavel',status:'completed',curriculumGoalIds:['goal-1']}
  });
  assert.equal(evidence.source,'adaptive_lesson_evidence');
  assert.equal(evidence.title,'Probleemi lahendamine linnas');
  assert.equal(evidence.taskResult,61);
  assert.deepEqual(evidence.goalIds,['goal-1']);
  assert.equal('mastery' in evidence,false);
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
    adaptiveEvidence:[{id:'ev-1',studentId:'student-1',sessionId:'s-1',skillIds:['B1_SPEAK_DESC'],kind:'summary_score',taskResult:95,createdAt:'2026-09-04T10:00:00Z'}],
    learningSessions:[{id:'s-1',lessonTitle:'Adaptive lesson'}],
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
  assert.equal(profile.skills.find(x=>x.id==='B1_SPEAK_DESC').score,42,'adaptive evidence must not overwrite canonical skillMap');
});

test('buildLearningProfile merges live summaries and adaptive evidence newest first',()=>{
  const profile=buildLearningProfile({
    student:{id:'student-1',skillMap:{}},
    rooms:[
      {id:'old',studentId:'student-1',endedAt:'2026-09-01T10:00:00Z',lessonSummary:{teacherComment:'old'}},
      {id:'other',studentId:'student-2',endedAt:'2026-09-04T10:00:00Z',lessonSummary:{teacherComment:'other'}}
    ],
    adaptiveEvidence:[
      {id:'adaptive-new',studentId:'student-1',sessionId:'s-1',createdAt:'2026-09-03T10:00:00Z',kind:'teacher_judgement',skillIds:['speaking'],teacherJudgement:'managed'},
      {id:'adaptive-other',studentId:'student-2',sessionId:'s-2',createdAt:'2026-09-05T10:00:00Z',kind:'teacher_judgement'}
    ],
    learningSessions:[{id:'s-1',lessonTitle:'Adaptive lesson'}]
  });
  assert.deepEqual(profile.recentEvidence.map(x=>x.id),['adaptive-new','old']);
  assert.equal(profile.summary.adaptiveEvidenceCount,1);
  assert.equal(profile.summary.liveSummaryCount,1);
});

test('latest vocabulary mark decides whether a word stays in review',()=>{
  const normalized=[
    {completedAtMillis:100,vocabularyIds:['rike'],teacherJudgement:'needs_help'},
    {completedAtMillis:200,vocabularyIds:['rike'],teacherJudgement:'managed'},
    {completedAtMillis:150,vocabularyIds:['hilinema'],teacherJudgement:'needs_help'}
  ];
  assert.deepEqual(latestVocabularyReviewIds(normalized),['hilinema']);
});

test('buildLearningProfile exposes review vocabulary from adaptive evidence without changing skillMap',()=>{
  const profile=buildLearningProfile({
    student:{id:'student-1',skillMap:{vocabulary:64}},
    adaptiveEvidence:[
      {id:'v1',studentId:'student-1',sessionId:'s-1',createdAt:'2026-09-04T09:00:00Z',kind:'vocabulary_mark',skillIds:['vocabulary'],vocabularyIds:['rike'],teacherJudgement:'needs_help'},
      {id:'v2',studentId:'student-1',sessionId:'s-1',createdAt:'2026-09-04T10:00:00Z',kind:'vocabulary_mark',skillIds:['vocabulary'],vocabularyIds:['hilinema'],teacherJudgement:'needs_help'}
    ],
    learningSessions:[{id:'s-1',lessonTitle:'Adaptive lesson'}]
  });
  assert.deepEqual(profile.recommendations.reviewVocabularyIds,['hilinema','rike']);
  assert.equal(profile.skillMap.vocabulary,64);
});

test('attendance without lessonSummary is not promoted to learning evidence',()=>{
  const profile=buildLearningProfile({
    student:{id:'student-1',skillMap:{}},
    rooms:[{id:'room-1',studentId:'student-1',status:'ended',endedAt:'2026-09-03T10:00:00Z'}]
  });
  assert.equal(profile.summary.evidenceCount,0);
  assert.deepEqual(profile.recentEvidence,[]);
});

test('recent achieved goals stay context and do not become automatic next-goal recommendations',()=>{
  const profile=buildLearningProfile({
    student:{id:'student-1',skillMap:{}},
    rooms:[{
      id:'room-1',
      studentId:'student-1',
      endedAt:'2026-09-03T10:00:00Z',
      lessonSummary:{
        curriculumGoalIds:['goal-achieved'],
        curriculumGoalLabels:['Küsib viisakalt abi']
      }
    }]
  });
  assert.deepEqual(profile.recommendations.recentGoalIds,['goal-achieved']);
  assert.deepEqual(profile.recommendations.nextGoalIds,[]);
});
