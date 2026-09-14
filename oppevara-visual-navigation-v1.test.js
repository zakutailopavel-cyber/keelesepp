const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const library=fs.readFileSync('haldus-exercises/index.html','utf8');

function section(start,end){
  const a=library.indexOf(start);
  const b=library.indexOf(end,a+start.length);
  assert.notEqual(a,-1,`missing section start: ${start}`);
  assert.notEqual(b,-1,`missing section end: ${end}`);
  return library.slice(a,b);
}

test('Õppevara defaults to curriculum while explicit library deep links remain supported',()=>{
  assert.match(library,/return \['library','curriculum','exercises','stats','history'\]\.includes\(requested\)\?requested:'curriculum';/);
  assert.match(library,/params\.get\('tab'\)/);
  assert.match(library,/tab==='library'/);
});

test('Õppekavad is the first primary tab before Raamatukogu',()=>{
  const tabs=section('<div className="top-tabs">','{!showSearch&&tab===\'library\'');
  const curriculum=tabs.indexOf('Õppekavad');
  const libraryIndex=tabs.indexOf('Raamatukogu');
  assert.ok(curriculum>=0&&libraryIndex>=0&&curriculum<libraryIndex);
});

test('lesson cards expose a safe mini material preview that opens WorksheetPreviewModal flow',()=>{
  assert.match(library,/function LessonSheetPreview\(\{lesson,onPreviewWorksheet\}\)/);
  const preview=section('function LessonSheetPreview','// ── TOPIC VIEW');
  assert.match(preview,/lesson\.worksheetData\?\.blocks/);
  assert.match(preview,/\['instruction','task','text','passage','prompt'\]/);
  assert.match(preview,/lesson\.practice,lesson\.goal,lesson\.description,lesson\.worksheetPrompt/);
  assert.match(preview,/Töölehe lähteülesanne/);
  assert.match(preview,/A4 eelvaade/);
  assert.match(preview,/onClick=\{\(\)=>onPreviewWorksheet\?\.\(lesson\)\}/);
  assert.doesNotMatch(preview,/correctAnswer|answerKey|solutions?|teacherContent/);
  assert.match(library,/<LessonSheetPreview lesson=\{lesson\} onPreviewWorksheet=\{onPreviewWorksheet\}\/\>/);
  assert.match(library,/function WorksheetPreviewModal\(\{lesson,onClose,onConduct\}\)/);
  assert.match(library,/onPreviewWorksheet=\{setWsPreview\}/);
});

test('topic sidebar wraps long names instead of ellipsis truncation',()=>{
  assert.match(library,/style=\{\{whiteSpace:'normal',overflowWrap:'anywhere',flex:1,textAlign:'left'\}\}>\{t\}<\/span>/);
});

test('subject and level cards preview real topics and level navigation uses the selected level',()=>{
  assert.match(library,/const subjectTopics=\[\.\.\.new Set\(subjectLessons\.filter\(l=>!l\.examPart\)\.map\(l=>l\.topic\)\.filter\(Boolean\)\)\];/);
  assert.match(library,/className="subj-topic-preview"/);
  assert.match(library,/subjectTopics\.slice\(0,3\)\.map/);
  assert.match(library,/const levelTopics=\[\.\.\.new Set\(levelLessons\.filter\(l=>!l\.examPart\)\.map\(l=>l\.topic\)\.filter\(Boolean\)\)\];/);
  assert.match(library,/className="level-lead"/);
  assert.match(library,/className="level-topic-preview"/);
  assert.match(library,/levelTopics\.slice\(0,3\)\.map/);
  assert.match(library,/level:lv,topic:levelTopics\[0\]\|\|''/);
  assert.doesNotMatch(library,/onClick=\{\(\)=>\{const t=topics\[0\]\|\|'';setNav\(\{subject:subject\.key,level:lv,topic:t\}\);\}\}/);
});
