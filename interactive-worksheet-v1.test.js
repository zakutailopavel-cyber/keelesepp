const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('haldus-exercises/index.html', 'utf8');

test('image worksheet preview supports manual interactive overlays without external AI APIs', () => {
  assert.match(html, /INTERACTIVE WORKSHEET V1/);
  assert.match(html, /Muuda interaktiivseks/);
  assert.match(html, /interactiveOverlay/);
  assert.match(html, /Vene tõlge/);
  assert.match(html, /Lühivastus/);
  assert.match(html, /Pikk vastus/);
  assert.match(html, /Märkeruut/);
  assert.match(html, /localStorage\.setItem\(answerStorageKey\(file\)/);
  assert.doesNotMatch(html, /openai\.com|api\.openai\.com|vision api|google vision/i);
});

test('interactive worksheet overlay is persisted into lesson file state', () => {
  assert.match(html, /onUpdate\?\.\(\{\.\.\.file,interactiveOverlay:\{version:1,elements:next\}\}\)/);
  assert.match(html, /onUpdate=\{next=>setFiles/);
});
