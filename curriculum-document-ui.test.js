const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('haldus-exercises/index.html','utf8');

test('curriculum upload validates files and exposes clear progress',()=>{
  assert.match(html,/CurriculumDocumentCore\.validate\(file\)/);
  assert.match(html,/accept=\{CurriculumDocumentCore\.ACCEPT\}/);
  assert.match(html,/Maksimaalne suurus on 20 MB|kuni 20 MB/);
  assert.match(html,/Laadimine… \{progress\}%/);
});

test('attachments open a same-page preview with PDF and image renderers',()=>{
  assert.match(html,/function DocumentPreviewModal/);
  assert.match(html,/kind==='pdf'&&<iframe/);
  assert.match(html,/kind==='image'&&<img/);
  assert.match(html,/ReactDOM\.createPortal/);
  assert.doesNotMatch(html,/function FileChip\(\{file\}\)\{[\s\S]{0,500}target="_blank"/);
});
