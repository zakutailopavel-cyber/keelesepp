const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const terms = fs.readFileSync('tingimused.html', 'utf8');
const crm = fs.readFileSync('haldus.html', 'utf8');
const firestoreRules = fs.readFileSync('firestore.rules', 'utf8');

test('public terms page contains the approved eight-section text and supplied version date', () => {
  assert.equal((terms.match(/<h2>[1-8]\./g) || []).length, 8);
  assert.match(terms, /Käesolevad kasutustingimused reguleerivad KeeleSepp veebilehe/);
  assert.match(terms, /Jooksva kuu õppetundide eest tuleb tasuda hiljemalt sama kuu 10\. kuupäevaks/);
  assert.match(terms, /tarbijavaidluste komisjoni poole/);
  assert.match(terms, /Viimati uuendatud:<\/strong> 10\.08\.2025/);
});

test('v1 registration requires and records acceptance of the legal terms', () => {
  assert.match(crm, /const \[acceptedTerms,setAcceptedTerms\] = useState\(false\)/);
  assert.match(crm, /if\(!acceptedTerms\)\{setErr\('Konto loomiseks nõustu kasutustingimustega\.'/);
  assert.match(crm, /href="\/tingimused\/"/);
  assert.match(crm, /href="\/privaatsus\/"/);
  assert.equal((crm.match(/termsVersion:'2025-08-10'/g) || []).length, 2);
  assert.equal((crm.match(/termsAcceptedAt:new Date\(\)\.toISOString\(\)/g) || []).length, 2);
});

test('Firestore self-registration rules accept the recorded terms fields', () => {
  assert.match(firestoreRules, /safeSelfUserCreate\(\)[\s\S]*'termsAcceptedAt',[\s\S]*'termsVersion'/);
  assert.match(firestoreRules, /data\.termsVersion\.matches\('\^\\\\d\{4\}-\\\\d\{2\}-\\\\d\{2\}\$'\)/);
});

test('v1 does not silently keep an orphaned Authentication account', () => {
  assert.match(crm, /await res\.user\.delete\(\)\.catch\(\(\)=>null\)/);
  assert.match(crm, /Konto profiil puudub\. Palun võta ühendust kooli administraatoriga\./);
});
