const test=require('node:test');
const assert=require('node:assert/strict');
const {
  getRoles,
  isStaff,
  buildScene,
  sceneAcceptsResponse,
  isUnsafeDisplaySurface,
  classroomLink
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

test('whole-monitor sharing is rejected by the privacy guard',()=>{
  assert.equal(isUnsafeDisplaySurface('monitor'),true);
  assert.equal(isUnsafeDisplaySurface('window'),false);
  assert.equal(isUnsafeDisplaySurface('browser'),false);
  assert.equal(isUnsafeDisplaySurface(undefined),false);
});
