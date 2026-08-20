const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync(require.resolve('./haldus.html'),'utf8');
const rules=fs.readFileSync(require.resolve('./firestore.rules'),'utf8');

test('v1 finance contains the EHIS and INF 3 workspace',()=>{
  assert.match(html,/function TaxReportsView/);
  assert.match(html,/EHIS ID/);
  assert.match(html,/2141297/);
  assert.match(html,/261556 · alates 17\.02\.2026/);
  assert.match(html,/TaxReportCore\.buildInf3Preview/);
  assert.match(html,/TaxReportCore\.inf3WorkfileCsv/);
  assert.match(html,/TaxReportCore\.inf3IssuesCsv/);
});

test('tax personal codes are stored outside ordinary user and student profiles',()=>{
  assert.match(html,/db\.collection\('taxPersonProfiles'\)/);
  assert.match(rules,/match \/taxPersonProfiles\/\{profileId\}/);
  assert.match(rules,/allow read: if isAdmin\(\)/);
  assert.match(rules,/request\.resource\.data\.personalCode\.matches\('\^\[0-9\]\{11\}\$'\)/);
});

test('non-VAT accounting guidance treats gross paid amount as the expense',()=>{
  assert.match(html,/KM-kohustuslane: ei/);
  assert.match(html,/Raamatupidamiskulu/);
  assert.match(html,/Sisendkäibemaksu ei arvata maha/);
  assert.match(html,/Dokumendil sisalduv KM \(informatiivne\)/);
});
