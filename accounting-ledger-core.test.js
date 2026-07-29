const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {
  accountingRegister,
  accountingRegisterCsv
}=require('./accounting-ledger-core');

test('CRM loads the accounting ledger and exposes an administrator screen',()=>{
  const html=fs.readFileSync('haldus.html','utf8');
  assert.match(html,/accounting-ledger-core\.js/);
  assert.match(html,/Raamatupidamine/);
  assert.match(html,/Arvete ja laekumiste register/);
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
      {id:'payment-b',invoiceId:'invoice-a',amountCents:2500,paidAt:'2026-07-08',status:'active',method:'cash'}
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
