const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('./curriculum-goal-core.js');
const graph=require('./curriculum-goals/b1-city.js');
const lesson=require('./adaptive-lessons/est-b1-city-problem-solving.js');

const goals=graph.goals;

test('B1 city graph is internally valid and uses stable goal ids',()=>{
  const result=core.validateGoalGraph(goals);
  assert.equal(result.ok,true,result.errors.join('\n'));
  assert.deepEqual(result.goals.map(goal=>goal.id),[
    'EST_B1_CITY_VOCAB',
    'EST_B1_CITY_EXPLAIN_PROBLEM',
    'EST_B1_CITY_ASK_HELP',
    'EST_B1_CITY_SOLVE_PROBLEM',
    'EST_B1_CITY_TRANSFER'
  ]);
});

test('reference lesson stores the same stable goal id used by the graph',()=>{
  assert.deepEqual(lesson.curriculumGoalIds,['EST_B1_CITY_SOLVE_PROBLEM']);
  const goal=goals.find(item=>item.id===lesson.curriculumGoalIds[0]);
  assert.ok(goal);
  assert.ok(goal.lessonBlueprintIds.includes(lesson.id));
});

test('reference lesson maps exactly to the integrated problem-solving goal',()=>{
  const mapped=core.mapLegacyGoalIds(goals,{
    lessonBlueprintId:'est-b1-city-problem-solving-01',
    level:'B1',
    subject:'Eesti keel',
    topic:'Linn ja teenused'
  });
  assert.equal(mapped[0],'EST_B1_CITY_SOLVE_PROBLEM');
});

test('legacy topic without an exact lesson mapping falls back deterministically to the first entry goal',()=>{
  const mapped=core.mapLegacyGoalIds(goals,{level:'B1',subject:'Eesti keel',topic:'Linn ja teenused'});
  assert.equal(mapped[0],'EST_B1_CITY_VOCAB');
});

test('without completed prerequisites the graph recommends the B1 city vocabulary entry goal',()=>{
  const recommendation=core.recommendNextGoal({
    goals,
    level:'B1',
    subject:'Eesti keel',
    skillMap:{B1_VOCAB_TOPIC:55,B1_SPEAK_DESC:42}
  });
  assert.equal(recommendation.goalId,'EST_B1_CITY_VOCAB');
  assert.equal(recommendation.status,'ready');
  assert.ok(recommendation.reasonCodes.includes('entry_goal'));
});

test('after vocabulary is confirmed the weakest ready speaking prerequisite is recommended next',()=>{
  const recommendation=core.recommendNextGoal({
    goals,
    level:'B1',
    subject:'Eesti keel',
    achievedGoalIds:['EST_B1_CITY_VOCAB'],
    skillMap:{B1_VOCAB_TOPIC:82,B1_SPEAK_DESC:45}
  });
  assert.equal(recommendation.goalId,'EST_B1_CITY_EXPLAIN_PROBLEM');
  assert.equal(recommendation.status,'ready');
  assert.ok(recommendation.reasonCodes.includes('continues_from_completed_goal'));
  assert.ok(recommendation.reasonCodes.includes('critical_skill_focus'));
});

test('integrated problem solving is recommended only after both branch prerequisites are confirmed',()=>{
  const recommendation=core.recommendNextGoal({
    goals,
    level:'B1',
    subject:'Eesti keel',
    achievedGoalIds:['EST_B1_CITY_ASK_HELP','EST_B1_CITY_EXPLAIN_PROBLEM','EST_B1_CITY_VOCAB'],
    skillMap:{B1_VOCAB_TOPIC:74,B1_SPEAK_DESC:68}
  });
  assert.equal(recommendation.goalId,'EST_B1_CITY_SOLVE_PROBLEM');
  assert.equal(recommendation.status,'ready');
  assert.deepEqual(recommendation.readiness.missingPrerequisiteGoalIds,[]);
  assert.ok(recommendation.reasonCodes.includes('prerequisites_met'));
});

test('completed problem solving leads deterministically to transfer',()=>{
  const recommendation=core.recommendNextGoal({
    goals,
    level:'B1',
    subject:'Eesti keel',
    achievedGoalIds:['EST_B1_CITY_SOLVE_PROBLEM','EST_B1_CITY_ASK_HELP','EST_B1_CITY_EXPLAIN_PROBLEM','EST_B1_CITY_VOCAB'],
    skillMap:{B1_VOCAB_TOPIC:78,B1_SPEAK_DESC:72}
  });
  assert.equal(recommendation.goalId,'EST_B1_CITY_TRANSFER');
  assert.equal(recommendation.fromGoalId,'EST_B1_CITY_SOLVE_PROBLEM');
  assert.equal(recommendation.status,'ready');
});

test('an explicit active goal is continued even when old prerequisite history is missing',()=>{
  const recommendation=core.recommendNextGoal({
    goals,
    level:'B1',
    subject:'Eesti keel',
    currentGoalIds:['EST_B1_CITY_SOLVE_PROBLEM'],
    achievedGoalIds:[],
    skillMap:{B1_SPEAK_DESC:60}
  });
  assert.equal(recommendation.goalId,'EST_B1_CITY_SOLVE_PROBLEM');
  assert.equal(recommendation.status,'in_progress');
  assert.ok(recommendation.reasonCodes.includes('active_goal_in_progress'));
  assert.deepEqual(recommendation.readiness.missingPrerequisiteGoalIds,['EST_B1_CITY_EXPLAIN_PROBLEM','EST_B1_CITY_ASK_HELP']);
});

test('missing critical-skill evidence stays unknown instead of becoming zero',()=>{
  const readiness=core.goalReadiness(goals[0],{skillMap:{}});
  assert.equal(readiness.criticalSkills[0].score,null);
  assert.equal(readiness.criticalSkills[0].status,'unknown');
});

test('invalid prerequisite cycles are rejected before recommendation',()=>{
  const invalid=[
    {...goals[0],id:'A',prerequisiteGoalIds:['B'],nextGoalIds:[]},
    {...goals[0],id:'B',prerequisiteGoalIds:['A'],nextGoalIds:[]}
  ];
  const validation=core.validateGoalGraph(invalid);
  assert.equal(validation.ok,false);
  assert.match(validation.errors.join('\n'),/prerequisite cycle/);
  const recommendation=core.recommendNextGoal({goals:invalid,level:'B1',subject:'Eesti keel'});
  assert.equal(recommendation.status,'invalid_graph');
});