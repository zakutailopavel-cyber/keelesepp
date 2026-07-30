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
  assert.equal(result.skippedLines,0);
  assert.equal(result.rows[0].amount,25);
  assert.equal(result.rows[1].date,'30.07.2026');
  assert.equal(result.rows[2].payer,'Anna, OÜ');
});

test('Swedbank CSV is recognized and only incoming euro payments become registry rows',()=>{
  const header=[
    'Kliendi konto','Dokumendi number','Kuupäev','Saaja/maksja konto',
    'Saaja/maksja nimi','Deebet/Kreedit (D/C)','Summa','Viitenumber',
    'Arhiveerimistunnus','Selgitus','Valuuta','Isikukood või registrikood',
    'Saaja/maksja panga BIC','Makse algataja nimi','Kande viide',
    'Konto teenusepakkuja viide'
  ].map(value=>`"${value}"`).join(',');
  const incoming=[
    'EE917700771011885682','', '2026-05-05','EE672200221023586335',
    'IRINA ŠAŠKOVA','C','25.00','KS-2026-001','2026050532142634',
    'Dalia Sudar','EUR','','HABAEE2X','','ENTRY-1','PROVIDER-1'
  ].map(value=>`"${value}"`).join(',');
  const outgoing=[
    'EE917700771011885682','', '2026-05-06','EE000000000000000000',
    'RENT OÜ','D','400.00','','2026050632142635',
    'Rent','EUR','','HABAEE2X','','ENTRY-2','PROVIDER-2'
  ].map(value=>`"${value}"`).join(',');
  const result=parseStatementDetailed([header,incoming,outgoing].join('\n'));
  assert.equal(result.format,'swedbank_csv');
  assert.equal(result.formatLabel,'Swedbank CSV');
  assert.equal(result.rows.length,1);
  assert.equal(result.outgoingLines,1);
  assert.equal(result.skippedLines,1);
  assert.equal(result.rows[0].payer,'IRINA ŠAŠKOVA');
  assert.equal(result.rows[0].desc,'KS-2026-001 · Dalia Sudar');
  assert.equal(result.rows[0].sourceId,'2026050532142634');
  assert.equal(result.rows[0].counterpartyAccount,'EE672200221023586335');
});

test('bank CSV reports unsupported currencies instead of mixing them into euro invoices',()=>{
  const result=parseStatementDetailed([
    '"Kuupäev","Saaja/maksja nimi","Deebet/Kreedit (D/C)","Summa","Selgitus","Valuuta"',
    '"2026-05-05","Mari","C","25.00","Course","USD"'
  ].join('\n'));
  assert.equal(result.rows.length,0);
  assert.equal(result.unsupportedCurrencyLines,1);
  assert.equal(result.skipped[0].reason,'unsupported_currency');
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
