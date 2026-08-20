const test=require('node:test');
const assert=require('node:assert/strict');
const TaxReportCore=require('./tax-report-core');

test('validates and masks Estonian personal codes',()=>{
  assert.equal(TaxReportCore.validPersonalCode('37605030299'),true);
  assert.equal(TaxReportCore.validPersonalCode('37605030298'),false);
  assert.equal(TaxReportCore.maskPersonalCode('37605030299'),'*******0299');
});

test('INF 3 preview joins payment, invoice, student and restricted tax profiles',()=>{
  const preview=TaxReportCore.buildInf3Preview({
    year:2026,
    students:[{id:'student-1',name:'Yana',email:'yana@example.com'}],
    parents:[],
    invoices:[{id:'invoice-1',num:'KS-2026-060',studentId:'student-1',studentName:'Yana',payerName:'Yana',payerEmail:'yana@example.com',targetType:'student'}],
    payments:[{id:'payment-1',invoiceId:'invoice-1',paidAt:'2026-09-05',amountCents:4000,status:'paid'}],
    taxProfiles:[{entityType:'student',entityId:'student-1',personalCode:'37605030299'}]
  });
  assert.equal(preview.summary.readyPaymentCount,1);
  assert.equal(preview.summary.readyAmountCents,4000);
  assert.equal(preview.rows[0].payerCode,'37605030299');
  assert.equal(preview.rows[0].learnerCode,'37605030299');
  assert.match(TaxReportCore.inf3WorkfileCsv(preview),/KS-2026-060/);
});

test('INF 3 preview does not export incomplete, pre-registration or legal-person payments',()=>{
  const preview=TaxReportCore.buildInf3Preview({
    year:2026,
    students:[{id:'student-1',name:'Yana'}],
    invoices:[
      {id:'missing-code',studentId:'student-1',payerName:'Parent'},
      {id:'early',studentId:'student-1',payerName:'Yana',targetType:'student'},
      {id:'company',studentId:'student-1',payerName:'Company',companyRegCode:'12345678'}
    ],
    payments:[
      {id:'p1',invoiceId:'missing-code',paidAt:'2026-03-01',amountCents:1000},
      {id:'p2',invoiceId:'early',paidAt:'2026-02-01',amountCents:1000},
      {id:'p3',invoiceId:'company',paidAt:'2026-03-01',amountCents:1000}
    ],
    taxProfiles:[{entityType:'student',entityId:'student-1',personalCode:'37605030299'}]
  });
  assert.equal(preview.rows.length,0);
  assert.equal(preview.summary.missingPaymentCount,1);
  assert.equal(preview.summary.excludedPaymentCount,2);
  assert.equal(preview.summary.readyAmountCents,0);
});
