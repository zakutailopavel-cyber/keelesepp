const test=require('node:test');
const assert=require('node:assert/strict');
const {
  legacyPackageSummary,
  scheduleEventOccursOnDate,
  duplicateInvoiceNumbers,
  dataQualitySummary
}=require('./haldus-quality');

test('dashboard counts only schedule entries that occur on the selected date',()=>{
  assert.equal(scheduleEventOccursOnDate({date:'2026-07-28',status:'Planeeritud'},'2026-07-28'),true);
  assert.equal(scheduleEventOccursOnDate({date:'2026-07-29',status:'Planeeritud'},'2026-07-28'),false);
  assert.equal(scheduleEventOccursOnDate({day:'Tue',recurring:true,startDate:'2026-07-01',status:'Planeeritud'},'2026-07-28'),true);
  assert.equal(scheduleEventOccursOnDate({day:'Tue',recurring:true,startDate:'2026-08-01',status:'Planeeritud'},'2026-07-28'),false);
  assert.equal(scheduleEventOccursOnDate({day:'Tue',recurring:true,status:'Tühistatud'},'2026-07-28'),false);
});

test('legacy package display never exposes a negative balance',()=>{
  assert.deepEqual(legacyPackageSummary({packageTotal:0,packageUsed:1}),{
    total:0,
    used:1,
    remaining:0,
    rawTotal:0,
    rawUsed:1,
    rawRemaining:-1,
    invalid:true
  });
  assert.equal(legacyPackageSummary({packageTotal:10,packageUsed:3}).remaining,7);
});

test('duplicate invoice numbers are grouped without changing historical records',()=>{
  const groups=duplicateInvoiceNumbers([
    {id:'one',num:'KS-2026-037'},
    {id:'two',num:'ks-2026-037'},
    {id:'three',num:'KS-2026-038'}
  ]);
  assert.equal(groups.length,1);
  assert.equal(groups[0].number,'KS-2026-037');
  assert.equal(groups[0].count,2);
});

test('data quality summary combines package and invoice issues',()=>{
  const summary=dataQualitySummary({
    students:[{id:'student',packageTotal:4,packageUsed:5}],
    invoices:[{id:'one',num:'KS-1'},{id:'two',num:'KS-1'}]
  });
  assert.equal(summary.invalidPackages.length,1);
  assert.equal(summary.duplicateInvoices.length,1);
  assert.equal(summary.issueCount,2);
});
