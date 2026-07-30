const test=require('node:test');
const assert=require('node:assert/strict');
const {
  parseStatement,
  parseStatementDetailed
}=require('./bank-statement-core');

test('bank statement parser accepts tab, semicolon and quoted CSV rows',()=>{
  const result=parseStatementDetailed([
    'Kuupäev;Maksja;Selgitus;Summa',
    '30.07.2026\tMari Maas\tKS-2026-041\t25,00 €',
    '2026-07-30;Jüri Tamm;KS-2026-042;30.50',
    '2026-07-30,\"Anna, OÜ\",KS-2026-043,40.00'
  ].join('\n'));
  assert.equal(result.rows.length,3);
  assert.equal(result.skippedLines,1);
  assert.equal(result.rows[0].amount,25);
  assert.equal(result.rows[1].date,'30.07.2026');
  assert.equal(result.rows[2].payer,'Anna, OÜ');
});

test('bank statement parser reports invalid rows instead of silently accepting them',()=>{
  const result=parseStatementDetailed([
    '30.07.2026;Mari;KS-1;25',
    '31.02.2026;Mari;KS-2;25',
    '30.07.2026;;KS-3;25',
    '30.07.2026;Mari;KS-4;-4',
    '30.07.2026;Mari;too;many;columns'
  ].join('\n'));
  assert.equal(result.rows.length,1);
  assert.equal(result.skippedLines,4);
  assert.deepEqual(
    result.skipped.map(item=>item.reason),
    ['invalid_date','missing_payer','invalid_amount','expected_four_columns']
  );
});

test('duplicate bank rows keep stable but unique import ids',()=>{
  const rows=parseStatement([
    '30.07.2026;Mari;KS-1;25',
    '30.07.2026;Mari;KS-1;25'
  ].join('\n'));
  assert.equal(rows.length,2);
  assert.notEqual(rows[0].id,rows[1].id);
  assert.match(rows[1].id,/_2$/);
});
