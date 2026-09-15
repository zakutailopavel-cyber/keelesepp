const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('haldus-exercises/index.html', 'utf8');

test('PDF worksheets use PDF.js with page-aware interactive overlays', () => {
  assert.match(html, /pdf\.min\.js/);
  assert.match(html, /lib\.getDocument\(file\.url\)/);
  assert.match(html, /page:pageNum/);
  assert.match(html, /visibleElements=elements\.filter/);
  assert.match(html, /pdfPageCount/);
  assert.match(html, /Muuda interaktiivseks/);
  assert.match(html, /Vastus hüpikaknas/);
  assert.match(html, /setActivePrompt\(el\)/);
  assert.match(html, /iw-answer-dialog/);
  assert.doesNotMatch(html, /kind==='pdf'&&<iframe/);
});

test('PDF worksheet rendering does not send document content to an AI service', () => {
  const start = html.indexOf('INTERACTIVE WORKSHEET V1');
  const end = html.indexOf('LIVE LESSON HISTORY');
  assert.ok(start >= 0 && end > start, 'interactive worksheet section is present');
  assert.doesNotMatch(html.slice(start, end), /api\.openai\.com|google vision|deepl api|azure cognitive/i);
});
