const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const library=fs.readFileSync('haldus-exercises/index.html','utf8');
const builder=fs.readFileSync('haldus-worksheet/index.html','utf8');

test('Õppevara deduplicates live curriculum snapshots before rendering',()=>{
  assert.match(library,/dedupeCurriculumLessons\(records\)/);
  assert.match(library,/snapshot=>\{\s*const records=snapshot\.docs\.map/);
});

test('worksheet opening is explicit and available from the document title',()=>{
  assert.match(library,/className="lesson-title lesson-title-open"/);
  assert.match(library,/hasWorksheet\?'Ava tööleht':'Ava kirje'/);
  assert.match(library,/event\.key==='Escape'/);
});

test('teachers can rename a curriculum document without rewriting published history',()=>{
  assert.match(library,/const renameLesson=async lesson=>/);
  assert.match(library,/Dokumendi uus nimi/);
  assert.match(library,/updates\.worksheetData=\{\.\.\.lesson\.worksheetData,meta:/);
  assert.doesNotMatch(library,/updates\.publishedWorksheetData/);
});

test('worksheet save locks an existing lesson id and offers automatic topic naming',()=>{
  assert.match(builder,/worksheetTargetId\(\{lessonId,selectedLessonId,lessonMode\}\)/);
  assert.match(builder,/Uut duplikaati ei looda/);
  assert.match(builder,/Nimeta automaatselt valitud kirje või teema järgi/);
  assert.match(builder,/Algset õppekava kirjet ei leitud\. Uut duplikaati ei loodud\./);
});
