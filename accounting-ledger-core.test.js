const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {
  accountingRegister,
  accountingRegisterCsv,
  financialPeriodControl,
  lessonPaymentRegister,
  lessonPaymentRegisterCsv
}=require('./accounting-ledger-core');

test('monthly control combines lesson, invoice, payment and bank blockers',()=>{
  const control=financialPeriodControl({
    month:'2026-07',
    lessons:[{id:'lesson-a',date:'2026-07-05',status:'Toimunud',studentName:'Mari'}],
    bankTransactions:[{
      id:'bank-a',
      paidAt:'2026-07-06',
      amountCents:3000,
      allocatedAmountCents:0,
      unappliedAmountCents:3000
    }]
  });
  assert.equal(control.canReview,false);
  assert.ok(control.issues.some(issue=>issue.type==='unbilled_lesson'));
  assert.ok(control.issues.some(issue=>issue.type==='bank_unapplied'));
  assert.equal(control.summary.blockingIssueCount,2);
  assert.equal(control.checklist.find(item=>item.id==='lessons').ready,false);
  assert.equal(control.checklist.find(item=>item.id==='bank').ready,false);
});

test('monthly control allows reviewed legacy evidence as a visible warning',()=>{
  const control=financialPeriodControl({
    month:'2026-07',
    lessons:[{
      id:'legacy-lesson',
      date:'2026-07-05',
      status:'Toimunud',
      billingStatus:'invoiced',
      invoiceId:'legacy-invoice',
      invoiceNum:'KS-OLD'
    }],
    invoices:[{
      id:'legacy-invoice',
      num:'KS-OLD',
      date:'2026-07-06',
      amountCents:3000,
      status:'Ootel'
    }]
  });
  assert.equal(control.canReview,true);
  assert.equal(control.summary.warningCount,1);
  assert.equal(control.summary.blockingIssueCount,0);
  assert.equal(control.issues[0].severity,'warning');
});

test('monthly control is ready when exact lesson and payment evidence reconcile',()=>{
  const control=financialPeriodControl({
    month:'2026-07',
    lessons:[{
      id:'lesson-a',
      date:'2026-07-05',
      studentName:'Mari',
      status:'Toimunud',
      billingStatus:'invoiced',
      invoiceId:'invoice-a'
    }],
    invoices:[{
      id:'invoice-a',
      num:'KS-1',
      date:'2026-07-06',
      amountCents:3000,
      paidAmountCents:3000,
      status:'Makstud',
      lines:[{lessonId:'lesson-a',date:'2026-07-05',amountCents:3000}]
    }],
    payments:[{
      id:'payment-a',
      invoiceId:'invoice-a',
      amountCents:3000,
      paidAt:'2026-07-07',
      status:'active',
      bankTransactionId:'bank-a'
    }],
    bankTransactions:[{
      id:'bank-a',
      paidAt:'2026-07-07',
      amountCents:3000,
      allocatedAmountCents:3000,
      unappliedAmountCents:0
    }]
  });
  assert.equal(control.canReview,true);
  assert.equal(control.summary.blockingIssueCount,0);
  assert.equal(control.checklist.every(item=>item.ready),true);
});

test('explicit payment versions allocate partial money to selected lesson rows instead of FIFO',()=>{
  const register=lessonPaymentRegister({
    month:'2026-07',
    lessons:[
      {id:'lesson-a',date:'2026-07-01',studentName:'Mari',status:'Toimunud',billingStatus:'invoiced',invoiceId:'invoice-a'},
      {id:'lesson-b',date:'2026-07-08',studentName:'Mari',status:'Toimunud',billingStatus:'invoiced',invoiceId:'invoice-a'}
    ],
    invoices:[{
      id:'invoice-a',
      num:'KS-EXACT',
      amountCents:6000,
      paidAmountCents:3000,
      lines:[
        {lessonId:'lesson-a',date:'2026-07-01',amountCents:3000},
        {lessonId:'lesson-b',date:'2026-07-08',amountCents:3000}
      ]
    }],
    payments:[{
      id:'payment-a',
      invoiceId:'invoice-a',
      amountCents:3000,
      paidAt:'2026-07-10',
      status:'active',
      lineAllocationId:'allocation-v2',
      lineAllocationVersion:2
    }],
    paymentLineAllocations:[
      {
        id:'allocation-v1',
        paymentId:'payment-a',
        invoiceId:'invoice-a',
        version:1,
        allocatedAmountCents:3000,
        lines:[{lessonId:'lesson-a',allocatedAmountCents:3000}]
      },
      {
        id:'allocation-v2',
        paymentId:'payment-a',
        invoiceId:'invoice-a',
        version:2,
        supersedesAllocationId:'allocation-v1',
        allocatedAmountCents:3000,
        lines:[{lessonId:'lesson-b',allocatedAmountCents:3000}]
      }
    ]
  });
  const first=register.rows.find(row=>row.lessonId==='lesson-a');
  const second=register.rows.find(row=>row.lessonId==='lesson-b');
  assert.equal(first.status,'invoiced_unpaid');
  assert.equal(second.status,'paid');
  assert.equal(second.allocationMethod,'explicit_invoice_lines_v1');
  assert.equal(second.paymentAllocations[0].allocationVersion,2);
  assert.equal(register.summary.explicitAllocationCount,1);
  assert.equal(register.summary.fifoAllocationCount,0);
});

test('old payments retain migration-safe FIFO while broken explicit pointers block review',()=>{
  const shared={
    month:'2026-07',
    lessons:[{id:'lesson-a',date:'2026-07-01',studentName:'Mari',status:'Toimunud',billingStatus:'invoiced',invoiceId:'invoice-a'}],
    invoices:[{
      id:'invoice-a',
      num:'KS-FALLBACK',
      amountCents:3000,
      paidAmountCents:1000,
      lines:[{lessonId:'lesson-a',date:'2026-07-01',amountCents:3000}]
    }]
  };
  const legacy=lessonPaymentRegister({
    ...shared,
    payments:[{id:'payment-old',invoiceId:'invoice-a',amountCents:1000,paidAt:'2026-07-05',status:'active'}]
  });
  assert.equal(legacy.rows[0].allocationMethod,'invoice_fifo_v1');
  assert.equal(legacy.rows[0].status,'partial');

  const broken=financialPeriodControl({
    ...shared,
    payments:[{
      id:'payment-new',
      invoiceId:'invoice-a',
      amountCents:1000,
      paidAt:'2026-07-05',
      status:'active',
      lineAllocationId:'missing-allocation',
      lineAllocationVersion:1
    }]
  });
  assert.equal(broken.canReview,false);
  assert.ok(broken.issues.some(issue=>issue.type==='payment_line_allocation_invalid'));
});

test('CRM loads the accounting ledger and exposes an administrator screen',()=>{
  const html=fs.readFileSync('haldus.html','utf8');
  assert.match(html,/accounting-ledger-core\.js/);
  assert.match(html,/Raamatupidamine/);
  assert.match(html,/Kuu kontroll/);
  assert.match(html,/financial-periods\/review/);
  assert.match(html,/Arvete ja laekumiste register/);
  assert.match(html,/Tunnid ↔ maksed/);
  assert.match(html,/Tundide ja maksete täpne kontroll/);
  assert.match(html,/Lisa maksekorraldus/);
  assert.match(html,/\/payments\/documents/);
  assert.match(html,/\/payments\/line-allocations/);
  assert.match(html,/Jaga tundidele/);
  const storageRules=fs.readFileSync('storage.rules','utf8');
  assert.match(storageRules,/financial\/payment-orders\/\{paymentId\}\/\{documentId\}/);
  assert.match(storageRules,/allow read: if accountingAdmin\(\)/);
  assert.match(storageRules,/application\/pdf\|image\/jpeg\|image\/png\|image\/webp/);
  const firestoreRules=fs.readFileSync('firestore.rules','utf8');
  assert.match(firestoreRules,/match \/financialPeriods\/\{monthId\}/);
  assert.match(firestoreRules,/match \/financialPeriodReviews\/\{reviewId\}/);
  assert.match(firestoreRules,/match \/paymentLineAllocations\/\{allocationId\}/);
  assert.match(firestoreRules,/allow create, update, delete: if false/);
});

test('invoice issuance and reconciled payments form one register row',()=>{
  const register=accountingRegister({
    month:'2026-07',
    invoices:[{
      id:'invoice-a',
      num:'KS-2026-001',
      date:'2026-07-02',
      due:'2026-07-10',
      payerName:'Mari Maas',
      amountCents:10000,
      paidAmountCents:6500
    }],
    payments:[
      {id:'payment-a',invoiceId:'invoice-a',amountCents:4000,paidAt:'2026-07-05',status:'active',bankTransactionId:'bank-a'},
      {
        id:'payment-b',
        invoiceId:'invoice-a',
        amountCents:2500,
        paidAt:'2026-07-08',
        status:'active',
        method:'cash',
        documents:[{
          id:'paymentdoc-a',
          storagePath:'financial/payment-orders/payment-b/paymentdoc-a',
          fileName:'maksekorraldus.pdf',
          contentType:'application/pdf',
          size:1200
        }]
      }
    ],
    bankTransactions:[{
      id:'bank-a',
      paidAt:'2026-07-05',
      payerName:'Mari Maas',
      amountCents:4000,
      allocatedAmountCents:4000,
      unappliedAmountCents:0
    }]
  });
  assert.equal(register.rows.length,1);
  assert.equal(register.rows[0].paidCents,6500);
  assert.equal(register.rows[0].balanceCents,3500);
  assert.equal(register.rows[0].status,'partial');
  assert.deepEqual(register.rows[0].paymentSourceLabels,['Pank','Sularaha']);
  assert.equal(register.rows[0].paymentDocuments.length,1);
  assert.equal(register.rows[0].paymentDocuments[0].paymentId,'payment-b');
  assert.equal(register.summary.issuedCents,10000);
  assert.equal(register.summary.paymentsAppliedCents,6500);
  assert.equal(register.summary.bankReceivedCents,4000);
  assert.equal(register.summary.errorCount,0);
});

test('register separates invoice period from payment period',()=>{
  const register=accountingRegister({
    month:'2026-07',
    invoices:[
      {id:'june',num:'JUNE',date:'2026-06-30',amount:50,paidAmount:50},
      {id:'july',num:'JULY',date:'2026-07-01',amount:80,paidAmount:0}
    ],
    payments:[
      {id:'late',invoiceId:'june',amount:50,paidAt:'2026-07-03',status:'active'}
    ]
  });
  assert.deepEqual(register.rows.map(row=>row.number),['JULY']);
  assert.equal(register.summary.issuedCents,8000);
  assert.equal(register.summary.paymentsAppliedCents,5000);
});

test('register reports invoice and bank reconciliation mismatches',()=>{
  const register=accountingRegister({
    month:'2026-07',
    invoices:[{
      id:'invoice-a',
      num:'KS-1',
      date:'2026-07-02',
      amountCents:10000,
      paidAmountCents:5000
    }],
    payments:[{
      id:'payment-a',
      invoiceId:'invoice-a',
      amountCents:4000,
      paidAt:'2026-07-03',
      status:'active'
    }],
    bankTransactions:[{
      id:'bank-a',
      paidAt:'2026-07-03',
      amountCents:7000,
      allocatedAmountCents:4000,
      unappliedAmountCents:2000
    }]
  });
  assert.equal(register.summary.errorCount,2);
  assert.deepEqual(
    register.issues.map(issue=>issue.type).sort(),
    ['bank_balance_mismatch','invoice_payment_mismatch']
  );
});

test('unapplied bank remainder and open payer credit remain visible',()=>{
  const register=accountingRegister({
    month:'2026-07',
    bankTransactions:[{
      id:'bank-a',
      paidAt:'2026-07-03',
      amountCents:7000,
      allocatedAmountCents:4000,
      unappliedAmountCents:3000
    }],
    payerCredits:[{
      id:'credit-a',
      status:'open',
      availableAmountCents:1200
    }]
  });
  assert.equal(register.summary.attentionCount,1);
  assert.equal(register.summary.bankUnappliedCents,3000);
  assert.equal(register.summary.openCreditCents,1200);
});

test('voided payments never reduce the accounting balance',()=>{
  const register=accountingRegister({
    month:'2026-07',
    invoices:[{
      id:'invoice-a',
      num:'KS-1',
      date:'2026-07-02',
      amountCents:5000,
      paidAmountCents:0
    }],
    payments:[{
      id:'payment-a',
      invoiceId:'invoice-a',
      amountCents:5000,
      paidAt:'2026-07-03',
      status:'voided'
    }]
  });
  assert.equal(register.rows[0].paidCents,0);
  assert.equal(register.rows[0].balanceCents,5000);
  assert.equal(register.summary.paymentsAppliedCents,0);
});

test('resolved overpayment uses only the remaining net payment',()=>{
  const register=accountingRegister({
    month:'2026-07',
    invoices:[{
      id:'invoice-a',
      num:'KS-1',
      date:'2026-07-02',
      amountCents:5000,
      paidAmountCents:5000
    }],
    payments:[{
      id:'payment-a',
      invoiceId:'invoice-a',
      amountCents:7000,
      resolvedAmountCents:2000,
      paidAt:'2026-07-03',
      status:'active'
    }]
  });
  assert.equal(register.rows[0].paidCents,5000);
  assert.equal(register.rows[0].overpaidCents,0);
  assert.equal(register.summary.paymentsAppliedCents,5000);
});

test('CSV export keeps accountant-friendly columns and escaped values',()=>{
  const register=accountingRegister({
    month:'2026-07',
    invoices:[{
      id:'invoice-a',
      num:'KS-1',
      date:'2026-07-02',
      payerName:'Mari "M"',
      desc:'Juuli tunnid',
      amountCents:2500
    }]
  });
  const csv=accountingRegisterCsv(register);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.match(csv,/"Arve nr";"Kuupäev"/);
  assert.match(csv,/"Mari ""M"""/);
  assert.match(csv,/"25\.00"/);
});

test('accounting CSV includes attached payment-order evidence',()=>{
  const register=accountingRegister({
    month:'2026-07',
    invoices:[{
      id:'invoice-a',
      num:'KS-1',
      date:'2026-07-02',
      amountCents:3000
    }],
    payments:[{
      id:'payment-a',
      invoiceId:'invoice-a',
      amountCents:3000,
      paidAt:'2026-07-03',
      status:'active',
      documents:[{
        id:'paymentdoc-a',
        storagePath:'financial/payment-orders/payment-a/paymentdoc-a',
        fileName:'LHV maksekorraldus.pdf',
        contentType:'application/pdf',
        size:1200
      }]
    }]
  });
  const csv=accountingRegisterCsv(register);
  assert.match(csv,/"Maksekorraldused";"Dokumendi ID-d"/);
  assert.match(csv,/"LHV maksekorraldus.pdf";"paymentdoc-a"/);
});

test('lesson payments cover immutable invoice lines oldest first',()=>{
  const register=lessonPaymentRegister({
    month:'2026-07',
    lessons:[
      {id:'lesson-a',date:'2026-07-01',studentName:'Mari',status:'Toimunud',billingStatus:'invoiced',invoiceId:'invoice-a'},
      {id:'lesson-b',date:'2026-07-08',studentName:'Mari',status:'Toimunud',billingStatus:'invoiced',invoiceId:'invoice-a'}
    ],
    invoices:[{
      id:'invoice-a',
      num:'KS-1',
      date:'2026-07-09',
      amountCents:6000,
      effectiveAmountCents:6000,
      lines:[
        {lessonId:'lesson-a',date:'2026-07-01',amountCents:3000},
        {lessonId:'lesson-b',date:'2026-07-08',amountCents:3000}
      ]
    }],
    payments:[{
      id:'payment-a',
      invoiceId:'invoice-a',
      amountCents:4500,
      paidAt:'2026-07-10',
      status:'active',
      bankTransactionId:'bank-a'
    }]
  });
  const first=register.rows.find(row=>row.lessonId==='lesson-a');
  const second=register.rows.find(row=>row.lessonId==='lesson-b');
  assert.equal(first.status,'paid');
  assert.equal(first.paidCents,3000);
  assert.equal(second.status,'partial');
  assert.equal(second.paidCents,1500);
  assert.equal(second.balanceCents,1500);
  assert.equal(first.paymentAllocations[0].paymentId,'payment-a');
  assert.equal(register.summary.paidCents,4500);
  assert.equal(register.summary.balanceCents,1500);
  assert.equal(register.summary.errorCount,0);
});

test('credited lesson lines are excluded without rewriting the original invoice',()=>{
  const register=lessonPaymentRegister({
    month:'2026-07',
    lessons:[
      {id:'lesson-a',date:'2026-07-01',studentName:'Mari',billingStatus:'credited',invoiceId:'invoice-a'},
      {id:'lesson-b',date:'2026-07-08',studentName:'Mari',billingStatus:'invoiced',invoiceId:'invoice-a'}
    ],
    invoices:[{
      id:'invoice-a',
      num:'KS-1',
      date:'2026-07-09',
      amountCents:6000,
      effectiveAmountCents:3000,
      correctedLessonIds:['lesson-a'],
      lines:[
        {lessonId:'lesson-a',date:'2026-07-01',amountCents:3000},
        {lessonId:'lesson-b',date:'2026-07-08',amountCents:3000}
      ]
    }],
    payments:[{
      id:'payment-a',
      invoiceId:'invoice-a',
      amountCents:3000,
      paidAt:'2026-07-10',
      status:'active'
    }]
  });
  const credited=register.rows.find(row=>row.lessonId==='lesson-a');
  const paid=register.rows.find(row=>row.lessonId==='lesson-b');
  assert.equal(credited.status,'credited');
  assert.equal(credited.originalAmountCents,3000);
  assert.equal(credited.amountCents,0);
  assert.equal(paid.status,'paid');
  assert.equal(register.summary.billedCents,3000);
  assert.equal(register.summary.errorCount,0);
});

test('legacy invoice linkage is never presented as exact payment evidence',()=>{
  const register=lessonPaymentRegister({
    month:'2026-07',
    lessons:[{
      id:'lesson-a',
      date:'2026-07-01',
      studentName:'Mari',
      status:'Toimunud',
      billingStatus:'invoiced',
      invoiceId:'legacy-invoice',
      invoiceNum:'KS-OLD'
    }],
    invoices:[{
      id:'legacy-invoice',
      num:'KS-OLD',
      date:'2026-07-02',
      amountCents:3000,
      status:'Makstud'
    }]
  });
  assert.equal(register.rows[0].status,'legacy_invoice');
  assert.equal(register.rows[0].linkExact,false);
  assert.equal(register.summary.legacyCount,1);
  assert.equal(register.summary.errorCount,0);
  assert.equal(register.summary.attentionCount,1);
  assert.equal(register.issues[0].type,'legacy_invoice_without_lesson_line');
});

test('paid invoice snapshot without payment records is reported and never allocated to lessons',()=>{
  const register=lessonPaymentRegister({
    month:'2026-07',
    lessons:[{
      id:'lesson-a',
      date:'2026-07-01',
      studentName:'Mari',
      billingStatus:'invoiced',
      invoiceId:'invoice-a'
    }],
    invoices:[{
      id:'invoice-a',
      num:'KS-1',
      amountCents:3000,
      paidAmountCents:3000,
      status:'Makstud',
      lines:[{lessonId:'lesson-a',date:'2026-07-01',amountCents:3000}]
    }]
  });
  assert.equal(register.rows[0].status,'invoiced_unpaid');
  assert.equal(register.rows[0].paidCents,0);
  assert.ok(register.issues.some(issue=>issue.type==='invoice_paid_without_payment_records'));
  assert.equal(register.summary.errorCount,1);
});

test('absence without billing disposition remains visible for a financial decision',()=>{
  const register=lessonPaymentRegister({
    month:'2026-07',
    lessons:[{
      id:'lesson-a',
      date:'2026-07-01',
      studentName:'Mari',
      status:'Puudus_eta'
    }]
  });
  assert.equal(register.rows[0].status,'unbilled');
  assert.ok(register.issues.some(issue=>issue.type==='absence_billing_disposition_missing'));
  assert.equal(register.summary.attentionCount,1);
});

test('package-covered and unbilled lessons remain financially distinct',()=>{
  const register=lessonPaymentRegister({
    month:'2026-07',
    lessons:[
      {id:'package',date:'2026-07-01',studentName:'Mari',status:'Toimunud',packageConsumptionStatus:'consumed',packageProductName:'10 tundi'},
      {id:'unbilled',date:'2026-07-02',studentName:'Jüri',status:'Toimunud',billingStatus:'unbilled'}
    ]
  });
  assert.equal(register.rows.find(row=>row.lessonId==='package').status,'package_covered');
  assert.equal(register.rows.find(row=>row.lessonId==='unbilled').status,'unbilled');
  assert.equal(register.summary.packageCount,1);
  assert.equal(register.summary.unbilledCount,1);
});

test('lesson register detects duplicate invoice ownership and broken links',()=>{
  const register=lessonPaymentRegister({
    month:'2026-07',
    lessons:[{
      id:'lesson-a',
      date:'2026-07-01',
      studentName:'Mari',
      billingStatus:'invoiced',
      invoiceId:'invoice-a'
    }],
    invoices:[
      {id:'invoice-a',num:'A',amountCents:3000,lines:[{lessonId:'lesson-a',date:'2026-07-01',amountCents:3000}]},
      {id:'invoice-b',num:'B',amountCents:3000,lines:[{lessonId:'lesson-a',date:'2026-07-01',amountCents:3000}]}
    ]
  });
  assert.ok(register.issues.some(issue=>issue.type==='lesson_in_multiple_invoices'));
  assert.ok(register.issues.some(issue=>issue.type==='lesson_invoice_link_mismatch'));
  assert.ok(register.summary.errorCount>=2);
});

test('lesson payment CSV exports stable lesson and invoice identifiers',()=>{
  const register=lessonPaymentRegister({
    month:'2026-07',
    lessons:[{
      id:'lesson-a',
      date:'2026-07-01',
      studentName:'Mari',
      teacher:'Pavel',
      status:'Toimunud',
      billingStatus:'invoiced',
      invoiceId:'invoice-a'
    }],
    invoices:[{
      id:'invoice-a',
      num:'KS-1',
      amountCents:3000,
      lines:[{lessonId:'lesson-a',date:'2026-07-01',amountCents:3000}]
    }]
  });
  const csv=lessonPaymentRegisterCsv(register);
  assert.match(csv,/"Tunni ID";"Arve nr";"Arve ID"/);
  assert.match(csv,/"lesson-a";"KS-1";"invoice-a"/);
  assert.match(csv,/"Täpne ID-seos"/);
});
