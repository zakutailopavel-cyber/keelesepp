const test=require('node:test');
const assert=require('node:assert/strict');
const {programs,skillCatalog}=require('./haldus-programs');

test('curriculum outcomes have unique stable ids and point to visible skills',()=>{
  const outcomeIds=new Set();
  const skillIds=new Set(Object.values(skillCatalog).flat().map(skill=>skill.id));

  programs.forEach(program=>{
    assert.ok(program.level);
    assert.ok(Array.isArray(program.outcomes)&&program.outcomes.length>0);
    program.outcomes.forEach(outcome=>{
      assert.match(outcome.id,/^[A-Za-z0-9_-]+$/);
      assert.ok(outcome.label);
      assert.equal(outcomeIds.has(outcome.id),false,`duplicate outcome id: ${outcome.id}`);
      outcomeIds.add(outcome.id);
      assert.ok(outcome.skillIds.length>0,`missing skills for ${outcome.id}`);
      outcome.skillIds.forEach(skillId=>{
        assert.equal(skillIds.has(skillId),true,`${outcome.id} points to unknown skill ${skillId}`);
      });
    });
  });
});

test('each supported curriculum level has a student skill catalog',()=>{
  programs.forEach(program=>{
    assert.ok(Array.isArray(skillCatalog[program.level]),`missing skill catalog for ${program.level}`);
    assert.ok(skillCatalog[program.level].length>0);
  });
});
