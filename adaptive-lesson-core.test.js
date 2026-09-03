const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('./adaptive-lesson-core.js');

test('diagnostic recommends support, core and advanced routes',()=>{
  assert.equal(core.recommendRoute({diagnosticPercent:35}).route,'support');
  assert.equal(core.recommendRoute({diagnosticPercent:70}).route,'core');
  assert.equal(core.recommendRoute({diagnosticPercent:92}).route,'advanced');
});

test('previous mastery influences initial route without dominating the diagnostic',()=>{
  const result=core.recommendRoute({diagnosticPercent:80,previousMastery:40});
  assert.equal(result.score,68);
  assert.equal(result.route,'core');
});

test('stage adjustment can move independently between routes',()=>{
  assert.equal(core.recommendStageAdjustment({currentRoute:'core',stagePercent:40}).route,'support');
  assert.equal(core.recommendStageAdjustment({currentRoute:'support',stagePercent:95,attempts:1,hintCount:0}).route,'advanced');
  assert.equal(core.recommendStageAdjustment({currentRoute:'advanced',stagePercent:76,attempts:1,hintCount:1}).route,'core');
});

test('mastery is skill-specific and does not equal lesson attendance',()=>{
  const result=core.calculateMastery({vocabulary:90,grammar:60,speaking:55,reading:88});
  assert.equal(result.overall,73);
  assert.deepEqual(result.weakSkills,['grammar','speaking']);
  assert.deepEqual(result.strongSkills,['vocabulary','reading']);
});

test('critical weak skill blocks progression even when average is high',()=>{
  const decision=core.nextStepDecision({
    mastery:{vocabulary:100,grammar:69,reading:100,speaking:74,writing:100},
    requiredThreshold:75,
    criticalSkills:['grammar','speaking']
  });
  assert.equal(decision.overall,89);
  assert.equal(decision.canAdvance,false);
  assert.deepEqual(decision.weakCritical,['grammar','speaking']);
  assert.equal(decision.action,'targeted_review');
});

test('vocabulary evidence marks exact words for review',()=>{
  const words=core.vocabularyStatus([
    {id:'harjuma',word:'harjuma'},
    {id:'tegelema',word:'tegelema'},
    {id:'sõltuma',word:'sõltuma'}
  ],{
    harjuma:{score:92},
    tegelema:{score:70},
    sõltuma:{score:40}
  });
  assert.equal(words[0].status,'mastered');
  assert.equal(words[1].status,'learning');
  assert.equal(words[2].status,'needs_review');
});

test('teacher handoff records what to repeat for the next teacher',()=>{
  const vocabulary=core.vocabularyStatus([
    {id:'harjuma',word:'harjuma'},
    {id:'sõltuma',word:'sõltuma'}
  ],{harjuma:90,sõltuma:30});
  const handoff=core.buildTeacherHandoff({
    lesson:{key:'est-b1-city-3',title:'Probleemi lahendamine linnas'},
    student:{id:'student-1',name:'Test Student'},
    route:'core',
    mastery:{vocabulary:78,grammar:62,speaking:58,reading:90},
    vocabulary,
    notes:'Needs sentence frames before free speaking.',
    nextLesson:{key:'est-b1-city-4'}
  });
  assert.equal(handoff.decision.canAdvance,false);
  assert.deepEqual(handoff.reviewWords,['sõltuma']);
  assert.match(handoff.summary,/targeted review/i);
  assert.equal(handoff.nextLessonKey,'est-b1-city-4');
});

test('adaptive blueprint requires all three routes on every stage',()=>{
  const valid=core.validateBlueprint({
    id:'lesson-1',title:'Lesson',goal:'Goal',
    vocabulary:[1,2,3,4,5],
    stages:[
      {id:'diagnostic',title:'Diagnostic',routes:{support:{},core:{},advanced:{}}},
      {id:'practice',title:'Practice',routes:{support:{},core:{},advanced:{}}},
      {id:'transfer',title:'Transfer',routes:{support:{},core:{},advanced:{}}}
    ]
  });
  assert.equal(valid.ok,true);

  const invalid=core.validateBlueprint({
    id:'lesson-2',title:'Lesson',goal:'Goal',vocabulary:[1,2,3,4,5],
    stages:[
      {id:'one',title:'One',routes:{support:{},core:{}}},
      {id:'two',title:'Two',routes:{support:{},core:{},advanced:{}}},
      {id:'three',title:'Three',routes:{support:{},core:{},advanced:{}}}
    ]
  });
  assert.equal(invalid.ok,false);
  assert.match(invalid.errors.join('\n'),/advanced/);
});
