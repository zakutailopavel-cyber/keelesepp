const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('./whiteboard-core.js');

test('freehand strokes are persisted without nested arrays',()=>{
  const persisted=core.persistElement({type:'stroke',points:[[1,2],[3.5,4]],color:'#000'});
  assert.deepEqual(persisted.points,[{x:1,y:2},{x:3.5,y:4}]);
  assert.equal(persisted.points.some(Array.isArray),false);
});

test('persisted Firestore point maps are hydrated for drawing and hit testing',()=>{
  const hydrated=core.hydrateElement({type:'stroke',points:[{x:7,y:8},{x:9,y:10}]});
  assert.deepEqual(hydrated.points,[[7,8],[9,10]]);
});

test('legacy nested and flat point formats remain readable',()=>{
  assert.deepEqual(core.toInternalPoints([[1,2],[3,4]]),[[1,2],[3,4]]);
  assert.deepEqual(core.toInternalPoints([1,2,3,4]),[[1,2],[3,4]]);
});
