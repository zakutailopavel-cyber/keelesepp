(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.AccountingLedgerCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const cents=(record,centsField,amountField)=>{
    const centsValue=Number(record?.[centsField]);
    if(Number.isInteger(centsValue)) return Math.max(0,centsValue);
    return Math.max(0,Math.round((Number(record?.[amountField])||0)*100));
  };
  const amountFromCents=value=>Number((Number(value||0)/100).toFixed(2));
  const isoDate=value=>{
    if(!value) return '';
    if(typeof value==='string'){
      const match=value.match(/^\d{4}-\d{2}-\d{2}/);
      return match?match[0]:'';
    }
    if(typeof value?.toDate==='function') return value.toDate().toISOString().slice(0,10);
    if(value instanceof Date&&!Number.isNaN(value.getTime())) return value.toISOString().slice(0,10);
    return '';
  };
  const monthOf=value=>isoDate(value).slice(0,7);
  const inMonth=(value,month)=>!month||monthOf(value)===month;
  const invoiceDate=invoice=>isoDate(invoice?.date||invoice?.issuedAt||invoice?.createdAt);
  const paymentDate=payment=>isoDate(payment?.paidAt||payment?.createdAt);
  const payerLabel=record=>
    String(
      record?.payerName
      ||record?.parentName
      ||record?.studentName
      ||record?.payerEmail
      ||record?.parentEmail
      ||'—'
    ).trim()||'—';
  const invoiceEffectiveCents=invoice=>{
    if(Number.isInteger(Number(invoice?.effectiveAmountCents))){
      return Math.max(0,Number(invoice.effectiveAmountCents));
    }
    if(invoice?.effectiveAmount!==undefined){
      return Math.max(0,Math.round((Number(invoice.effectiveAmount)||0)*100));
    }
    return cents(invoice,'amountCents','amount');
  };
  const paymentNetCents=payment=>{
    const gross=cents(payment,'amountCents','amount');
    const resolved=cents(payment,'resolvedAmountCents','resolvedAmount');
    return Math.max(0,gross-resolved);
  };
  const activePayment=payment=>payment&&payment.status!=='voided'&&paymentNetCents(payment)>0;
  const paymentSource=payment=>{
    if(payment?.sourceCreditId) return 'credit';
    if(payment?.bankTransactionId||payment?.bankExternalId) return 'bank';
    return String(payment?.method||'manual').toLowerCase();
  };
  const sourceLabel=source=>({
    bank:'Pank',
    credit:'Ettemakse',
    cash:'Sularaha',
    manual:'Käsitsi',
    other:'Muu'
  }[source]||source||'Muu');
  const invoiceStatus=(balanceCents,paidCents,overpaidCents,invoice)=>{
    if(invoice?.status==='Krediteeritud'||invoice?.paymentStatus==='credited') return 'credited';
    if(overpaidCents>0) return 'overpaid';
    if(balanceCents===0&&invoiceEffectiveCents(invoice)>0) return 'paid';
    if(paidCents>0) return 'partial';
    const due=isoDate(invoice?.due);
    const today=new Date().toISOString().slice(0,10);
    return due&&due<today?'overdue':'unpaid';
  };
  const statusLabel=status=>({
    paid:'Makstud',
    partial:'Osaliselt makstud',
    unpaid:'Tasumata',
    overdue:'Tähtaja ületanud',
    overpaid:'Enammakstud',
    credited:'Krediteeritud'
  }[status]||status);
  const unique=values=>[...new Set(values.filter(Boolean))];

  function accountingRegister({
    invoices=[],
    payments=[],
    bankTransactions=[],
    payerCredits=[],
    month=''
  }={}){
    const invoiceList=Array.isArray(invoices)?invoices:[];
    const paymentList=Array.isArray(payments)?payments:[];
    const bankList=Array.isArray(bankTransactions)?bankTransactions:[];
    const creditList=Array.isArray(payerCredits)?payerCredits:[];
    const invoiceById=new Map(invoiceList.filter(item=>item?.id).map(item=>[item.id,item]));
    const activePayments=paymentList.filter(activePayment);
    const paymentsByInvoice=new Map();
    activePayments.forEach(payment=>{
      const invoiceId=String(payment.invoiceId||'');
      if(!paymentsByInvoice.has(invoiceId)) paymentsByInvoice.set(invoiceId,[]);
      paymentsByInvoice.get(invoiceId).push(payment);
    });

    const rows=invoiceList
      .filter(invoice=>inMonth(invoiceDate(invoice),month))
      .map(invoice=>{
        const amountCents=invoiceEffectiveCents(invoice);
        const linkedPayments=(paymentsByInvoice.get(invoice.id)||[])
          .slice()
          .sort((a,b)=>paymentDate(a).localeCompare(paymentDate(b)));
        const ledgerPaidCents=linkedPayments.reduce((sum,payment)=>sum+paymentNetCents(payment),0);
        const hasSnapshot=invoice.paidAmountCents!==undefined||invoice.paidAmount!==undefined;
        const snapshotPaidCents=hasSnapshot
          ? cents(invoice,'paidAmountCents','paidAmount')
          : invoice.status==='Makstud'
            ? amountCents
            : 0;
        const paidCents=linkedPayments.length?ledgerPaidCents:snapshotPaidCents;
        const balanceCents=Math.max(0,amountCents-paidCents);
        const overpaidCents=Math.max(
          0,
          cents(invoice,'overpaidAmountCents','overpaidAmount'),
          paidCents-amountCents
        );
        const sources=unique(linkedPayments.map(paymentSource));
        if(!sources.length&&invoice.status==='Makstud') sources.push('legacy');
        return {
          id:String(invoice.id||''),
          number:String(invoice.num||invoice.id||'—'),
          date:invoiceDate(invoice),
          due:isoDate(invoice.due),
          payer:payerLabel(invoice),
          description:String(invoice.desc||invoice.description||''),
          amountCents,
          paidCents,
          ledgerPaidCents,
          snapshotPaidCents,
          balanceCents,
          overpaidCents,
          status:invoiceStatus(balanceCents,paidCents,overpaidCents,invoice),
          paymentCount:linkedPayments.length,
          paymentDates:unique(linkedPayments.map(paymentDate)),
          paymentSources:sources,
          paymentSourceLabels:sources.map(source=>source==='legacy'?'Vana märge':sourceLabel(source)),
          paymentIds:linkedPayments.map(payment=>payment.id).filter(Boolean),
          reconciliationMismatch:hasSnapshot&&Math.abs(snapshotPaidCents-ledgerPaidCents)>1,
          legacyPaid:!linkedPayments.length&&invoice.status==='Makstud',
          raw:invoice
        };
      })
      .sort((a,b)=>`${b.date}:${b.number}`.localeCompare(`${a.date}:${a.number}`));

    const periodPayments=activePayments.filter(payment=>inMonth(paymentDate(payment),month));
    const periodBanks=bankList.filter(transaction=>inMonth(transaction.paidAt||transaction.createdAt,month));
    const openCredits=creditList.filter(credit=>
      credit?.status!=='closed'&&cents(credit,'availableAmountCents','availableAmount')>0
    );
    const issues=[];
    rows.filter(row=>row.reconciliationMismatch).forEach(row=>{
      issues.push({
        type:'invoice_payment_mismatch',
        severity:'error',
        entityId:row.id,
        title:`Arve ${row.number}: maksete summa ei ühti`,
        detail:`Arvel ${amountFromCents(row.snapshotPaidCents)} €, maksete registris ${amountFromCents(row.ledgerPaidCents)} €.`
      });
    });
    periodPayments.filter(payment=>!invoiceById.has(payment.invoiceId)).forEach(payment=>{
      issues.push({
        type:'payment_without_invoice',
        severity:'error',
        entityId:String(payment.id||''),
        title:'Makse ilma arvelingita',
        detail:`${paymentDate(payment)} · ${payerLabel(payment)} · ${amountFromCents(paymentNetCents(payment))} €.`
      });
    });
    periodBanks.forEach(transaction=>{
      const amountCents=cents(transaction,'amountCents','amount');
      const allocatedCents=cents(transaction,'allocatedAmountCents','allocatedAmount');
      const unappliedCents=cents(transaction,'unappliedAmountCents','unappliedAmount');
      if(Math.abs(amountCents-allocatedCents-unappliedCents)>1){
        issues.push({
          type:'bank_balance_mismatch',
          severity:'error',
          entityId:String(transaction.id||''),
          title:'Pangatehingu jaotus ei klapi',
          detail:`${isoDate(transaction.paidAt||transaction.createdAt)} · ${payerLabel(transaction)} · tehing ${amountFromCents(amountCents)} €, jaotatud ${amountFromCents(allocatedCents)} €, jääk ${amountFromCents(unappliedCents)} €.`
        });
      }else if(unappliedCents>0){
        issues.push({
          type:'bank_unapplied',
          severity:'attention',
          entityId:String(transaction.id||''),
          title:'Pangatehingul on jaotamata jääk',
          detail:`${isoDate(transaction.paidAt||transaction.createdAt)} · ${payerLabel(transaction)} · ${amountFromCents(unappliedCents)} €.`
        });
      }
    });

    const summary={
      invoiceCount:rows.length,
      issuedCents:rows.reduce((sum,row)=>sum+row.amountCents,0),
      paidOnInvoicesCents:rows.reduce((sum,row)=>sum+Math.min(row.amountCents,row.paidCents),0),
      outstandingCents:rows.reduce((sum,row)=>sum+row.balanceCents,0),
      paymentCount:periodPayments.length,
      paymentsAppliedCents:periodPayments.reduce((sum,payment)=>sum+paymentNetCents(payment),0),
      bankTransactionCount:periodBanks.length,
      bankReceivedCents:periodBanks.reduce((sum,transaction)=>sum+cents(transaction,'amountCents','amount'),0),
      bankUnappliedCents:periodBanks.reduce((sum,transaction)=>sum+cents(transaction,'unappliedAmountCents','unappliedAmount'),0),
      openCreditCount:openCredits.length,
      openCreditCents:openCredits.reduce((sum,credit)=>sum+cents(credit,'availableAmountCents','availableAmount'),0),
      errorCount:issues.filter(issue=>issue.severity==='error').length,
      attentionCount:issues.filter(issue=>issue.severity==='attention').length
    };
    return {
      month,
      rows,
      issues,
      summary,
      periodPayments,
      periodBanks,
      openCredits
    };
  }

  const csvCell=value=>`"${String(value??'').replace(/"/g,'""')}"`;
  function accountingRegisterCsv(register={}){
    const header=[
      'Arve nr','Kuupäev','Tähtaeg','Maksja','Kirjeldus',
      'Arve summa','Laekunud','Jääk','Staatus','Makseallikas','Maksekuupäevad'
    ];
    const lines=(register.rows||[]).map(row=>[
      row.number,
      row.date,
      row.due,
      row.payer,
      row.description,
      amountFromCents(row.amountCents).toFixed(2),
      amountFromCents(row.paidCents).toFixed(2),
      amountFromCents(row.balanceCents).toFixed(2),
      statusLabel(row.status),
      (row.paymentSourceLabels||[]).join(', '),
      (row.paymentDates||[]).join(', ')
    ].map(csvCell).join(';'));
    return '\uFEFF'+[header.map(csvCell).join(';'),...lines].join('\n');
  }

  return {
    accountingRegister,
    accountingRegisterCsv,
    amountFromCents,
    invoiceEffectiveCents,
    isoDate,
    paymentNetCents,
    statusLabel
  };
});
