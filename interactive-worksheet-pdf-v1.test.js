const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('haldus-exercises/index.html','utf8');
test('PDF worksheets render locally with PDF.js and support page-aware overlays',()=>{
  assert.match(html,/pdf\.min\.js/);
  assert.match(html,/(?:pdfjsLib|lib)\.getDocument\(file\.url\)/);
  assert.match(html,/page:pageNum/);
  assert.match(html,/visibleElements=elements\.filter/);
  assert.match(html,/pdfPageCount/);
  assert.match(html,/Muuda interaktiivseks/);
});
test('PDF interaction does not introduce paid AI APIs',()=>{
  const slice=html.slice(html.indexOf('INTERACTIVE WORKSHEET V1'), html.indexOf('LIVE LESSON HISTORY'));
  assert.doesNotMatch(slice,/api\.openai\.com|google vision|deepl api|azure cognitive/i);
});
