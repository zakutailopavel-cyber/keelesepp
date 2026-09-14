const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const libraryCore=require('./learning-library-core.js');

const haldus=fs.readFileSync('haldus-exercises/index.html','utf8');
const library=fs.readFileSync('crm-v2/src/services/firebase/library.js','utf8');
const homework=fs.readFileSync('crm-v2/src/services/firebase/homework.js','utf8');
const player=fs.readFileSync('crm-v2/src/features/homework/WorksheetPlayer.jsx','utf8');
const styles=fs.readFileSync('crm-v2/src/styles/index.css','utf8');

test('visual overlays classify an image material as a worksheet',()=>{
  const item=libraryCore.libraryItem('curriculum',{id:'visual-1',type:'material',files:[{name:'page.png',interactiveOverlay:{version:1,elements:[{id:'a',type:'input'}]}}]});
  assert.equal(item.type,'worksheet');
  assert.equal(item.assignMode,'worksheet');
});

test('worksheet assignment snapshots visual pages and overlay metadata',()=>{
  assert.match(haldus,/files:\(item\.source\.files\|\|\[\]\)\.map/);
  assert.match(haldus,/interactiveOverlay:file\.interactiveOverlay/);
  assert.match(library,/files: storedFiles\(item\.source\.files \|\| \[\]\)/);
  assert.match(library,/storedInteractiveOverlay/);
  assert.match(homework,/files: Array\.isArray\(data\.files\) \? data\.files : \[\]/);
});

test('student player renders answer controls on the original image and submits them through existing assignment flow',()=>{
  assert.match(player,/function VisualWorksheetPage/);
  assert.match(player,/className="visual-worksheet-canvas"/);
  assert.match(player,/visualAnswerKey\(page\.fileIndex, element\)/);
  assert.match(player,/element\.type === 'input'/);
  assert.match(player,/element\.type === 'textarea'/);
  assert.match(player,/element\.type === 'choice'/);
  assert.match(player,/element\.type === 'checkbox'/);
  assert.match(player,/repository\.submitWorksheet\(\{ assignmentId: assignment\.id, answers, \.\.\.result \}\)/);
  assert.match(styles,/\.visual-worksheet-layer\{position:absolute;inset:0\}/);
});
