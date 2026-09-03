const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const page=fs.readFileSync('haldus-adaptive-lesson/index.html','utf8');
const lesson=fs.readFileSync('adaptive-lessons/est-b1-city-problem-solving.js','utf8');

test('adaptive lesson prototype loads pure core and reference lesson',()=>{
  assert.match(page,/src="\/adaptive-lesson-core\.js"/);
  assert.match(page,/src="\/adaptive-lessons\/est-b1-city-problem-solving\.js"/);
  assert.match(page,/kohalik sessioon · ei salvesta Firestore'i/);
});

test('teacher can switch all three adaptive routes and stages',()=>{
  assert.match(page,/routeNames=\{support:/);
  assert.match(page,/data-route/);
  assert.match(page,/data-stage/);
  assert.match(page,/recommendStageAdjustment/);
  assert.match(page,/Soovita järgmist rada/);
});

test('prototype keeps unassessed mastery fields empty instead of forcing zero',()=>{
  assert.match(page,/if\(input\.value!==''\)mastery\[input\.dataset\.mastery\]=Number\(input\.value\)/);
  assert.match(page,/Tühi väli ≠ 0/);
});

test('reference lesson contains diagnostic and support core advanced variants',()=>{
  assert.match(lesson,/diagnostic:\{/);
  assert.match(lesson,/support:\{/);
  assert.match(lesson,/core:\{/);
  assert.match(lesson,/advanced:\{/);
  assert.match(lesson,/masteryPolicy:\{/);
});
