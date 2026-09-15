const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('haldus-exercises/index.html', 'utf8');
const interactiveStart = html.indexOf('INTERACTIVE WORKSHEET V1');
const interactiveEnd = html.indexOf('LIVE LESSON HISTORY');
const interactiveSlice = html.slice(interactiveStart, interactiveEnd);

test('image worksheet preview supports manual interactive overlays without external AI APIs', () => {
  assert.ok(interactiveStart >= 0, 'interactive worksheet section is missing');
  assert.ok(interactiveEnd > interactiveStart, 'interactive worksheet section boundary is missing');
  assert.match(html, /Muuda interaktiivseks/);
  assert.match(html, /interactiveOverlay/);
  assert.match(html, /Vene tõlge/);
  assert.match(html, /Lühivastus/);
  assert.match(html, /Pikk vastus/);
  assert.match(html, /Märkeruut/);
  assert.match(html, /localStorage\.setItem\(answerStorageKey\(file\)/);
  assert.doesNotMatch(interactiveSlice, /api\.openai\.com|google vision|deepl api|azure cognitive/i);
});

test('interactive worksheet overlay is persisted into lesson file state', () => {
  assert.match(html, /onUpdate\?\.\(\{\.\.\.file,interactiveOverlay:\{version:1,elements:next\}\}\)/);
  assert.match(html, /onUpdate=\{next=>setFiles/);
});
