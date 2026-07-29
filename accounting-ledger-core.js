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
  const lessonPaymentStatusLabel=status=>({
    paid:'Makstud',
    partial:'Osaliselt makstud',
    invoiced_unpaid:'Arvel · tasumata',
    unbilled:'Arveldamata',
    package_covered:'Paketist kaetud',
    free:'Tasuta',
    cancelled:'Tühistatud · tasuta',
    written_off:'Mahakantud',
    credited:'Krediteeritud',
    legacy_invoice:'Vana arve · seos puudub',
    not_billable:'Ei kuulu arveldamisele'
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

  function lessonPaymentRegister({
    lessons=[],
    invoices=[],
    payments=[],
    month=''
  }={}){
    const lessonList=Array.isArray(lessons)?lessons:[];
    const invoiceList=Array.isArray(invoices)?invoices:[];
    const paymentList=Array.isArray(payments)?payments:[];
    const lessonById=new Map(lessonList.filter(item=>item?.id).map(item=>[String(item.id),item]));
    const invoiceById=new Map(invoiceList.filter(item=>item?.id).map(item=>[String(item.id),item]));
    const activePayments=paymentList.filter(activePayment);
    const paymentsByInvoice=new Map();
    activePayments.forEach(payment=>{
      const invoiceId=String(payment.invoiceId||'');
      if(!paymentsByInvoice.has(invoiceId)) paymentsByInvoice.set(invoiceId,[]);
      paymentsByInvoice.get(invoiceId).push(payment);
    });
    paymentsByInvoice.forEach(list=>list.sort((a,b)=>
      `${paymentDate(a)}:${a.id||''}`.localeCompare(`${paymentDate(b)}:${b.id||''}`)
    ));

    const issues=[];
    const rowByLessonId=new Map();
    const lineOwners=new Map();
    invoiceList.forEach(invoice=>{
      const invoiceId=String(invoice.id||'');
      const correctedIds=new Set((invoice.correctedLessonIds||[]).map(String));
      const lines=(Array.isArray(invoice.lines)?invoice.lines:[])
        .map((line,index)=>({
          ...line,
          _index:index,
          lessonId:String(line?.lessonId||''),
          amountCents:cents(line,'amountCents','amount')
        }))
        .filter(line=>line.lessonId)
        .sort((a,b)=>`${isoDate(a.date)}:${String(a._index).padStart(4,'0')}`.localeCompare(`${isoDate(b.date)}:${String(b._index).padStart(4,'0')}`));
      if(!lines.length) return;
      const duplicateWithinInvoice=new Set();
      const seenInInvoice=new Set();
      lines.forEach(line=>{
        if(seenInInvoice.has(line.lessonId)) duplicateWithinInvoice.add(line.lessonId);
        seenInInvoice.add(line.lessonId);
        if(!lineOwners.has(line.lessonId)) lineOwners.set(line.lessonId,[]);
        lineOwners.get(line.lessonId).push(invoiceId);
      });
      duplicateWithinInvoice.forEach(lessonId=>issues.push({
        type:'duplicate_lesson_line',
        severity:'error',
        lessonId,
        invoiceId,
        title:'Sama tund on arvel mitu korda',
        detail:`Arve ${invoice.num||invoiceId} sisaldab tundi ${lessonId} rohkem kui ühe korra.`
      }));

      const activeLines=lines.filter(line=>!correctedIds.has(line.lessonId));
      const allocationByLesson=new Map(activeLines.map(line=>[line.lessonId,[]]));
      const remainingByLesson=new Map(activeLines.map(line=>[line.lessonId,line.amountCents]));
      const invoicePayments=paymentsByInvoice.get(invoiceId)||[];
      const hasPaymentSnapshot=invoice.paidAmountCents!==undefined||invoice.paidAmount!==undefined;
      const snapshotPaidCents=hasPaymentSnapshot
        ?cents(invoice,'paidAmountCents','paidAmount')
        :invoice.status==='Makstud'
          ?invoiceEffectiveCents(invoice)
          :0;
      const ledgerPaidCents=invoicePayments.reduce((sum,payment)=>sum+paymentNetCents(payment),0);
      if(snapshotPaidCents>0&&invoicePayments.length===0){
        issues.push({
          type:'invoice_paid_without_payment_records',
          severity:'error',
          invoiceId,
          title:'Arvel on tasumise märge, kuid maksekirjed puuduvad',
          detail:`Arve ${invoice.num||invoiceId}: ${amountFromCents(snapshotPaidCents)} € ei saa tõendatult ühegi tunniga siduda.`
        });
      }else if(hasPaymentSnapshot&&Math.abs(snapshotPaidCents-ledgerPaidCents)>1){
        issues.push({
          type:'invoice_payment_snapshot_mismatch',
          severity:'error',
          invoiceId,
          title:'Arve maksekoond ja maksekirjed ei ühti',
          detail:`Arve ${invoice.num||invoiceId}: koond ${amountFromCents(snapshotPaidCents)} €, aktiivsed maksekirjed ${amountFromCents(ledgerPaidCents)} €.`
        });
      }
      let unallocatedPaymentCents=0;
      invoicePayments.forEach(payment=>{
        let paymentRemaining=paymentNetCents(payment);
        activeLines.forEach(line=>{
          if(paymentRemaining<=0) return;
          const lineRemaining=remainingByLesson.get(line.lessonId)||0;
          if(lineRemaining<=0) return;
          const allocatedCents=Math.min(lineRemaining,paymentRemaining);
          allocationByLesson.get(line.lessonId).push({
            paymentId:String(payment.id||''),
            paidAt:paymentDate(payment),
            amountCents:allocatedCents,
            source:paymentSource(payment),
            reference:String(payment.reference||'')
          });
          remainingByLesson.set(line.lessonId,lineRemaining-allocatedCents);
          paymentRemaining-=allocatedCents;
        });
        unallocatedPaymentCents+=paymentRemaining;
      });
      const activeLineTotal=activeLines.reduce((sum,line)=>sum+line.amountCents,0);
      const effectiveAmount=invoiceEffectiveCents(invoice);
      if(Math.abs(activeLineTotal-effectiveAmount)>1){
        issues.push({
          type:'invoice_line_total_mismatch',
          severity:'error',
          invoiceId,
          title:'Arve summa ja tunniread ei ühti',
          detail:`Arve ${invoice.num||invoiceId}: kehtivad tunniread ${amountFromCents(activeLineTotal)} €, arve kehtiv summa ${amountFromCents(effectiveAmount)} €.`
        });
      }
      if(unallocatedPaymentCents>1){
        issues.push({
          type:'payment_exceeds_lesson_lines',
          severity:'error',
          invoiceId,
          title:'Arve makse ületab kehtivaid tunniridu',
          detail:`Arve ${invoice.num||invoiceId}: ${amountFromCents(unallocatedPaymentCents)} € ei ole võimalik ühegi kehtiva tunnireaga siduda.`
        });
      }

      lines.forEach(line=>{
        const lesson=lessonById.get(line.lessonId);
        if(!lesson){
          issues.push({
            type:'invoice_line_missing_lesson',
            severity:'error',
            lessonId:line.lessonId,
            invoiceId,
            title:'Arverea tundi ei leitud',
            detail:`Arve ${invoice.num||invoiceId} viitab puuduvale tunnile ${line.lessonId}.`
          });
          return;
        }
        const corrected=correctedIds.has(line.lessonId)||lesson.billingStatus==='credited';
        const allocations=corrected?[]:(allocationByLesson.get(line.lessonId)||[]);
        const paidCents=allocations.reduce((sum,item)=>sum+item.amountCents,0);
        const balanceCents=corrected?0:Math.max(0,line.amountCents-paidCents);
        const status=corrected
          ?'credited'
          :paidCents<=0
            ?'invoiced_unpaid'
            :balanceCents>0
              ?'partial'
              :'paid';
        const linkExact=String(lesson.invoiceId||'')===invoiceId
          && ['invoiced','credited'].includes(String(lesson.billingStatus||''));
        if(!linkExact){
          issues.push({
            type:'lesson_invoice_link_mismatch',
            severity:'error',
            lessonId:line.lessonId,
            invoiceId,
            title:'Tunni ja arve seos ei ühti',
            detail:`${isoDate(lesson.date)||line.date||line.lessonId} · ${lesson.studentName||'õpilane'} · arve ${invoice.num||invoiceId}.`
          });
        }
        rowByLessonId.set(line.lessonId,{
          lessonId:line.lessonId,
          date:isoDate(lesson.date||line.date),
          studentId:String(lesson.studentId||invoice.studentId||''),
          studentName:String(lesson.studentName||invoice.studentName||'—'),
          teacher:String(lesson.teacher||''),
          topic:String(lesson.topic||lesson.title||line.description||''),
          lessonStatus:String(lesson.status||''),
          invoiceId,
          invoiceNum:String(invoice.num||invoiceId||'—'),
          invoiceDate:invoiceDate(invoice),
          lineIndex:line._index,
          amountCents:corrected?0:line.amountCents,
          originalAmountCents:line.amountCents,
          paidCents,
          balanceCents,
          status,
          linkExact,
          allocationMethod:allocations.length?'invoice_fifo_v1':'',
          paymentAllocations:allocations,
          paymentDates:unique(allocations.map(item=>item.paidAt)),
          paymentSources:unique(allocations.map(item=>item.source)),
          packageName:'',
          rawLesson:lesson
        });
      });
    });

    lineOwners.forEach((owners,lessonId)=>{
      const distinct=unique(owners);
      if(distinct.length>1){
        issues.push({
          type:'lesson_in_multiple_invoices',
          severity:'error',
          lessonId,
          title:'Tund on mitmel arvel',
          detail:`Tund ${lessonId} esineb arvetel ${distinct.map(id=>invoiceById.get(id)?.num||id).join(', ')}.`
        });
      }
    });

    lessonList.forEach(lesson=>{
      const lessonId=String(lesson.id||'');
      if(!lessonId||rowByLessonId.has(lessonId)) return;
      const billingStatus=String(lesson.billingStatus||'');
      const packageStatus=String(lesson.packageConsumptionStatus||'');
      let status='not_billable';
      if(packageStatus==='consumed') status='package_covered';
      else if(billingStatus==='free') status='free';
      else if(billingStatus==='cancelled_on_time') status='cancelled';
      else if(billingStatus==='written_off') status='written_off';
      else if(billingStatus==='credited') status='credited';
      else if(lesson.invoiceId||billingStatus==='invoiced') status='legacy_invoice';
      else if(
        billingStatus==='late_cancel_billable'
        ||billingStatus==='unbilled'
        ||(lesson.status==='Toimunud'&&!billingStatus)
        ||(['Puudus_p','Puudus_eta'].includes(lesson.status)&&!billingStatus)
      ) status='unbilled';
      if(status==='legacy_invoice'){
        issues.push({
          type:'legacy_invoice_without_lesson_line',
          severity:'attention',
          lessonId,
          invoiceId:String(lesson.invoiceId||''),
          title:'Vana arve ei sisalda tunni rida',
          detail:`${isoDate(lesson.date)} · ${lesson.studentName||'õpilane'} · täpset maksekattet ei saa taastada.`
        });
      }
      if(packageStatus==='needs_attention'){
        status='unbilled';
        issues.push({
          type:'package_needs_attention',
          severity:'attention',
          lessonId,
          title:'Tunnil puudub paketijääk',
          detail:`${isoDate(lesson.date)} · ${lesson.studentName||'õpilane'} · paketi katet ei saanud kinnitada.`
        });
      }
      if(['Puudus_p','Puudus_eta'].includes(lesson.status)&&!billingStatus){
        issues.push({
          type:'absence_billing_disposition_missing',
          severity:'attention',
          lessonId,
          title:'Puudumise finantsotsus puudub',
          detail:`${isoDate(lesson.date)} · ${lesson.studentName||'õpilane'} · määra, kas tühistamine oli tasuta või kuulub arveldamisele.`
        });
      }
      rowByLessonId.set(lessonId,{
        lessonId,
        date:isoDate(lesson.date),
        studentId:String(lesson.studentId||''),
        studentName:String(lesson.studentName||'—'),
        teacher:String(lesson.teacher||''),
        topic:String(lesson.topic||lesson.title||''),
        lessonStatus:String(lesson.status||''),
        invoiceId:String(lesson.invoiceId||''),
        invoiceNum:String(lesson.invoiceNum||invoiceById.get(String(lesson.invoiceId||''))?.num||''),
        invoiceDate:'',
        lineIndex:null,
        amountCents:0,
        originalAmountCents:0,
        paidCents:0,
        balanceCents:0,
        status,
        linkExact:false,
        allocationMethod:'',
        paymentAllocations:[],
        paymentDates:[],
        paymentSources:[],
        packageName:String(lesson.packageProductName||''),
        rawLesson:lesson
      });
    });

    const rows=[...rowByLessonId.values()]
      .filter(row=>inMonth(row.date,month))
      .sort((a,b)=>`${b.date}:${b.studentName}:${b.lessonId}`.localeCompare(`${a.date}:${a.studentName}:${a.lessonId}`));
    const relevantLessonIds=new Set(rows.map(row=>row.lessonId));
    const relevantInvoiceIds=new Set(rows.map(row=>row.invoiceId).filter(Boolean));
    const visibleIssues=issues.filter(issue=>
      (!issue.lessonId&&!issue.invoiceId)
      ||(issue.lessonId&&relevantLessonIds.has(issue.lessonId))
      ||(issue.invoiceId&&relevantInvoiceIds.has(issue.invoiceId))
    );
    const summary={
      lessonCount:rows.length,
      exactLinkedCount:rows.filter(row=>row.linkExact).length,
      paidCount:rows.filter(row=>row.status==='paid').length,
      partialCount:rows.filter(row=>row.status==='partial').length,
      invoicedUnpaidCount:rows.filter(row=>row.status==='invoiced_unpaid').length,
      unbilledCount:rows.filter(row=>row.status==='unbilled').length,
      packageCount:rows.filter(row=>row.status==='package_covered').length,
      excludedCount:rows.filter(row=>['free','cancelled','written_off','credited','not_billable'].includes(row.status)).length,
      legacyCount:rows.filter(row=>row.status==='legacy_invoice').length,
      billedCents:rows.reduce((sum,row)=>sum+row.amountCents,0),
      paidCents:rows.reduce((sum,row)=>sum+row.paidCents,0),
      balanceCents:rows.reduce((sum,row)=>sum+row.balanceCents,0),
      errorCount:visibleIssues.filter(issue=>issue.severity==='error').length,
      attentionCount:visibleIssues.filter(issue=>issue.severity==='attention').length
    };
    return {month,rows,issues:visibleIssues,summary};
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

  function lessonPaymentRegisterCsv(register={}){
    const header=[
      'Tunni kuupäev','Õpilane','Õpetaja','Teema','Tunni ID','Arve nr','Arve ID',
      'Tunni hind','Kaetud','Jääk','Staatus','Makse ID-d','Maksekuupäevad',
      'Makseallikad','Jaotusmeetod','Seose täpsus'
    ];
    const lines=(register.rows||[]).map(row=>[
      row.date,
      row.studentName,
      row.teacher,
      row.topic,
      row.lessonId,
      row.invoiceNum,
      row.invoiceId,
      amountFromCents(row.amountCents).toFixed(2),
      amountFromCents(row.paidCents).toFixed(2),
      amountFromCents(row.balanceCents).toFixed(2),
      lessonPaymentStatusLabel(row.status),
      (row.paymentAllocations||[]).map(item=>item.paymentId).filter(Boolean).join(', '),
      (row.paymentDates||[]).join(', '),
      (row.paymentSources||[]).map(sourceLabel).join(', '),
      row.allocationMethod==='invoice_fifo_v1'?'Arve FIFO (vanim tund enne)':'',
      row.linkExact?'Täpne ID-seos':row.status==='package_covered'?'Paketikirje':'Pärand või määramata'
    ].map(csvCell).join(';'));
    return '\uFEFF'+[header.map(csvCell).join(';'),...lines].join('\n');
  }

  return {
    accountingRegister,
    accountingRegisterCsv,
    amountFromCents,
    invoiceEffectiveCents,
    isoDate,
    lessonPaymentRegister,
    lessonPaymentRegisterCsv,
    lessonPaymentStatusLabel,
    paymentNetCents,
    statusLabel
  };
});
