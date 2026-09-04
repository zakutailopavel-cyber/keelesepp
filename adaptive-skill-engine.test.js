const test=require('node:test');
const assert=require('node:assert/strict');
const engine=require('./adaptive-skill-engine.js');

test('routeForSkills chooses the most supportive route required by a multi-skill task',()=>{
  const route=engine.routeForSkills({
    routeBySkill:{vocabulary:'advanced',grammar:'core',speaking:'support'},
    skillIds:['grammar','speaking'],
    fallback:'core'
  });
  assert.equal(route,'support');
});

test('missing skill routes use the bounded fallback instead of inventing a score or route',()=>{
  assert.equal(engine.routeForSkills({routeBySkill:{vocabulary:'advanced'},skillIds:['speaking'],fallback:'core'}),'core');
  assert.equal(engine.routeForSkills({routeBySkill:{},skillIds:[],fallback:'advanced'}),'advanced');
});

test('teacher judgement moves every affected skill one step from its own current route',()=>{
  const result=engine.applyJudgement({
    routeBySkill:{grammar:'support',speaking:'core',vocabulary:'advanced'},
    skillIds:['grammar','speaking'],
    judgement:'too_easy',
    fallback:'core'
  });
  assert.deepEqual(result.nextBySkill,{grammar:'core',speaking:'advanced'});
  assert.equal(result.routeBySkill.vocabulary,'advanced');
  assert.equal(result.effectiveBefore,'support');
  assert.equal(result.effectiveAfter,'core');
  assert.deepEqual(result.changedSkillIds,['grammar','speaking']);
});

test('needs help reduces independence by one step without demoting unrelated skills',()=>{
  const result=engine.applyJudgement({
    routeBySkill:{vocabulary:'advanced',grammar:'advanced',speaking:'support'},
    skillIds:['vocabulary','grammar'],
    judgement:'needs_help'
  });
  assert.deepEqual(result.nextBySkill,{vocabulary:'core',grammar:'core'});
  assert.equal(result.routeBySkill.speaking,'support');
});

test('managed keeps each skill on its own route',()=>{
  const result=engine.applyJudgement({
    routeBySkill:{vocabulary:'advanced',grammar:'core',speaking:'support'},
    skillIds:['vocabulary','speaking'],
    judgement:'managed'
  });
  assert.deepEqual(result.nextBySkill,{vocabulary:'advanced',speaking:'support'});
  assert.deepEqual(result.changedSkillIds,[]);
});

test('UI judgement aliases map to canonical deterministic transitions',()=>{
  assert.equal(engine.transitionRoute('core','help'),'support');
  assert.equal(engine.transitionRoute('support','easy'),'core');
  assert.equal(engine.transitionRoute('advanced','ok'),'advanced');
});

test('route patch is bounded to allowed skills and valid routes',()=>{
  const patched=engine.applyRoutePatch(
    {vocabulary:'core',grammar:'core'},
    {vocabulary:'advanced',grammar:'broken',speaking:'support'},
    ['vocabulary','grammar']
  );
  assert.deepEqual(patched,{vocabulary:'advanced',grammar:'core'});
});

test('invalid judgement is rejected',()=>{
  assert.throws(()=>engine.applyJudgement({skillIds:['speaking'],judgement:'random'}),/Invalid adaptive judgement/);
});
