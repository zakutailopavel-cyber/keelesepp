const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const page=fs.readFileSync('haldus-adaptive-lesson/index.html','utf8');
const lesson=fs.readFileSync('adaptive-lessons/est-b1-city-problem-solving.js','utf8');

test('lesson mode loads adaptive core and reference lesson',()=>{
  assert.match(page,/src="\/adaptive-lesson-core\.js"/);
  assert.match(page,/src="\/adaptive-lessons\/est-b1-city-problem-solving\.js"/);
  assert.match(page,/class="lesson-mode"/);
  assert.match(page,/ei salvesta Firestore'i/);
});

test('live lesson removes CRM navigation and keeps only three teaching zones',()=>{
  assert.match(page,/grid-template-columns:220px minmax\(0,1fr\) 245px/);
  assert.match(page,/Tunni käik/);
  assert.match(page,/Praegused sõnad/);
  assert.doesNotMatch(page,/Avaleht/);
  assert.doesNotMatch(page,/Aruanded/);
  assert.doesNotMatch(page,/Seaded/);
});

test('teacher sees one activity and three semantic judgements',()=>{
  assert.match(page,/Üks ülesanne korraga/);
  assert.match(page,/data-judge="help"/);
  assert.match(page,/data-judge="ok"/);
  assert.match(page,/data-judge="easy"/);
  assert.match(page,/Vajab abi/);
  assert.match(page,/Sai hakkama/);
  assert.match(page,/Liiga kerge/);
});

test('algorithmic details stay out of the main lesson flow',()=>{
  assert.doesNotMatch(page,/Etapi tulemus %/);
  assert.doesNotMatch(page,/Katseid/);
  assert.doesNotMatch(page,/Vihjeid/);
  assert.doesNotMatch(page,/summary-strip/);
  assert.match(page,/Õpetaja abi/);
  assert.match(page,/class="method hidden"/);
});

test('semantic judgement changes support route without changing CEFR',()=>{
  assert.match(page,/function routeFor\(rating\)/);
  assert.match(page,/support:'🟢 Toega'/);
  assert.match(page,/core:'🔵 Standard'/);
  assert.match(page,/advanced:'🟣 Edasijõudnu'/);
  assert.match(page,/B1/);
});

test('vocabulary evidence remains available without dominating the activity',()=>{
  assert.match(page,/lesson\.vocabulary\.slice\(0,6\)/);
  assert.match(page,/data-word/);
  assert.match(page,/state\.vocab\[w\.id\]/);
  assert.match(page,/Näita kogu sõnavara/);
});

test('detailed mastery is only requested in the final summary and missing values stay absent',()=>{
  assert.match(page,/Tunni kokkuvõte/);
  assert.match(page,/if\(i\.value!==''\)mastery\[i\.dataset\.mastery\]=Number\(i\.value\)/);
  assert.match(page,/class="summary hidden"/);
});

test('reference lesson still contains diagnostic and all adaptive variants',()=>{
  assert.match(lesson,/diagnostic:\{/);
  assert.match(lesson,/support:\{/);
  assert.match(lesson,/core:\{/);
  assert.match(lesson,/advanced:\{/);
  assert.match(lesson,/masteryPolicy:\{/);
});
