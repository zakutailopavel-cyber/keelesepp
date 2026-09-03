const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const page=fs.readFileSync('haldus-adaptive-lesson/index.html','utf8');
const lesson=fs.readFileSync('adaptive-lessons/est-b1-city-problem-solving.js','utf8');

test('adaptive lesson workspace loads pure core and reference lesson',()=>{
  assert.match(page,/src="\/adaptive-lesson-core\.js"/);
  assert.match(page,/src="\/adaptive-lessons\/est-b1-city-problem-solving\.js"/);
  assert.match(page,/ei salvesta Firestore'i/);
});

test('teacher workspace uses wide lesson-first three-column layout',()=>{
  assert.match(page,/grid-template-columns:255px minmax\(520px,1fr\) 300px/);
  assert.match(page,/Tunni etapid/);
  assert.match(page,/Sõnavara – aktiivne/);
  assert.match(page,/Tööriistad õpetajale/);
  assert.match(page,/Praegune rada/);
});

test('diagnostic shows one question at a time with simple teacher judgement',()=>{
  assert.match(page,/Küsimus \$\{state\.diagIndex\+1\}/);
  assert.match(page,/data-diag-eval="help"/);
  assert.match(page,/data-diag-eval="ok"/);
  assert.match(page,/data-diag-eval="easy"/);
  assert.match(page,/Vajab abi/);
  assert.match(page,/Sai hakkama/);
  assert.match(page,/Liiga kerge/);
});

test('stage adaptation is driven by teacher judgement instead of technical counters',()=>{
  assert.match(page,/data-stage-eval="help"/);
  assert.match(page,/data-stage-eval="ok"/);
  assert.match(page,/data-stage-eval="easy"/);
  assert.match(page,/routeForRating/);
  assert.doesNotMatch(page,/Etapi tulemus %/);
  assert.doesNotMatch(page,/Katseid/);
  assert.doesNotMatch(page,/Vihjeid/);
});

test('prototype keeps detailed mastery secondary and unassessed values empty',()=>{
  assert.match(page,/Tunni kokkuvõte/);
  assert.match(page,/tühi väli ei tähenda nulli/);
  assert.match(page,/if\(input\.value!==''\)mastery\[input\.dataset\.mastery\]=Number\(input\.value\)/);
});

test('vocabulary can be marked weak or known for handoff evidence',()=>{
  assert.match(page,/state\.vocabStatus/);
  assert.match(page,/data-vocab/);
  assert.match(page,/status:state\.vocabStatus\[word\.id\]\|\|'unassessed'/);
});

test('reference lesson contains diagnostic and all adaptive variants',()=>{
  assert.match(lesson,/diagnostic:\{/);
  assert.match(lesson,/support:\{/);
  assert.match(lesson,/core:\{/);
  assert.match(lesson,/advanced:\{/);
  assert.match(lesson,/masteryPolicy:\{/);
});
