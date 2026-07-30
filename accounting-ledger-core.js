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
    const documentsByInvoice=new Map();
    paymentList.forEach(payment=>{
      const invoiceId=String(payment.invoiceId||'');
      const documents=(Array.isArray(payment.documents)?payment.documents:[])
        .filter(document=>document?.storagePath&&document?.fileName)
        .map(document=>({
          ...document,
          paymentId:String(payment.id||document.paymentId||''),
          paymentStatus:String(payment.status||'active')
        }));
      if(!documents.length) return;
      if(!documentsByInvoice.has(invoiceId)) documentsByInvoice.set(invoiceId,[]);
      documentsByInvoice.get(invoiceId).push(...documents);
    });
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
          paymentDocuments:(documentsByInvoice.get(String(invoice.id||''))||[])
            .slice()
            .sort((a,b)=>`${b.uploadedAt||''}:${b.id||''}`.localeCompare(`${a.uploadedAt||''}:${a.id||''}`)),
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
    paymentLineAllocations=[],
    month=''
  }={}){
    const lessonList=Array.isArray(lessons)?lessons:[];
    const invoiceList=Array.isArray(invoices)?invoices:[];
    const paymentList=Array.isArray(payments)?payments:[];
    const allocationList=Array.isArray(paymentLineAllocations)?paymentLineAllocations:[];
    const allocationById=new Map(
      allocationList.filter(item=>item?.id).map(item=>[String(item.id),item])
    );
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
      const allocationOrderedPayments=[
        ...invoicePayments.filter(payment=>payment.lineAllocationId),
        ...invoicePayments.filter(payment=>!payment.lineAllocationId)
      ];
      allocationOrderedPayments.forEach(payment=>{
        let paymentRemaining=paymentNetCents(payment);
        if(payment.lineAllocationId){
          const exact=allocationById.get(String(payment.lineAllocationId));
          const pointerValid=exact
            &&String(exact.paymentId||'')===String(payment.id||'')
            &&String(exact.invoiceId||'')===invoiceId
            &&Number(exact.version||0)===Number(payment.lineAllocationVersion||0);
          if(!pointerValid){
            issues.push({
              type:'payment_line_allocation_invalid',
              severity:'error',
              invoiceId,
              entityId:String(payment.id||''),
              title:'Makse täpse jaotuse versiooni ei leitud',
              detail:`Arve ${invoice.num||invoiceId} · makse ${payment.id||'—'} viitab puuduvale või valele jaotusversioonile.`
            });
            unallocatedPaymentCents+=paymentRemaining;
            return;
          }
          (Array.isArray(exact.lines)?exact.lines:[]).forEach(exactLine=>{
            const lessonId=String(exactLine?.lessonId||'');
            const allocatedCents=Math.max(0,Number(exactLine?.allocatedAmountCents)||0);
            const lineRemaining=remainingByLesson.get(lessonId);
            if(
              lineRemaining===undefined
              ||allocatedCents<=0
              ||allocatedCents>lineRemaining
              ||allocatedCents>paymentRemaining
            ){
              issues.push({
                type:'payment_line_allocation_invalid',
                severity:'error',
                invoiceId,
                lessonId,
                entityId:String(payment.id||''),
                title:'Makse täpne jaotus ei vasta arvereale',
                detail:`Arve ${invoice.num||invoiceId} · makse ${payment.id||'—'} · tund ${lessonId||'puudub'}.`
              });
              return;
            }
            allocationByLesson.get(lessonId).push({
              paymentId:String(payment.id||''),
              paidAt:paymentDate(payment),
              amountCents:allocatedCents,
              source:paymentSource(payment),
              reference:String(payment.reference||''),
              allocationId:String(exact.id||payment.lineAllocationId),
              allocationVersion:Number(exact.version||0),
              allocationMethod:'explicit_invoice_lines_v1'
            });
            remainingByLesson.set(lessonId,lineRemaining-allocatedCents);
            paymentRemaining-=allocatedCents;
          });
          if(paymentRemaining>1){
            issues.push({
              type:'payment_line_allocation_incomplete',
              severity:'attention',
              invoiceId,
              entityId:String(payment.id||''),
              title:'Osa maksest ei ole tunnireale jaotatud',
              detail:`Arve ${invoice.num||invoiceId} · makse ${payment.id||'—'} · jaotamata ${amountFromCents(paymentRemaining)} €.`
            });
          }
          unallocatedPaymentCents+=Math.max(0,paymentRemaining);
          return;
        }
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
            reference:String(payment.reference||''),
            allocationMethod:'invoice_fifo_v1'
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
      if(unallocatedPaymentCents>1&&!issues.some(issue=>
        issue.invoiceId===invoiceId
        &&['payment_line_allocation_incomplete','payment_line_allocation_invalid'].includes(issue.type)
      )){
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
          allocationMethod:allocations.length
            ?unique(allocations.map(item=>item.allocationMethod)).join(',')
            :'',
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
      explicitAllocationCount:rows.filter(row=>row.allocationMethod.includes('explicit_invoice_lines_v1')).length,
      fifoAllocationCount:rows.filter(row=>row.allocationMethod.includes('invoice_fifo_v1')).length,
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

  function financialPeriodControl({
    invoices=[],
    payments=[],
    bankTransactions=[],
    payerCredits=[],
    lessons=[],
    paymentLineAllocations=[],
    month=''
  }={}){
    const invoiceRegister=accountingRegister({
      invoices,
      payments,
      bankTransactions,
      payerCredits,
      month
    });
    const lessonRegister=lessonPaymentRegister({
      lessons,
      invoices,
      payments,
      paymentLineAllocations,
      month
    });
    const issues=[
      ...invoiceRegister.issues.map(issue=>({...issue,source:'invoices'})),
      ...lessonRegister.issues.map(issue=>({
        ...issue,
        source:'lessons',
        severity:issue.type==='legacy_invoice_without_lesson_line'?'warning':issue.severity
      }))
    ];
    const existingLessonIssues=new Set(
      issues.filter(issue=>issue.lessonId||issue.entityId)
        .map(issue=>`${issue.type}:${issue.lessonId||issue.entityId}`)
    );
    lessonRegister.rows
      .filter(row=>row.status==='unbilled')
      .forEach(row=>{
        const alreadyVisible=[...existingLessonIssues].some(key=>key.endsWith(`:${row.lessonId}`));
        if(alreadyVisible) return;
        issues.push({
          type:'unbilled_lesson',
          severity:'attention',
          source:'lessons',
          lessonId:row.lessonId,
          entityId:row.lessonId,
          title:'Tund on arveldamata',
          detail:`${row.date||'—'} · ${row.studentName||'õpilane'} · otsusta arve, pakett või tasuta põhjus.`
        });
      });
    const uniqueIssues=[];
    const issueKeys=new Set();
    issues.forEach(issue=>{
      const key=`${issue.type}:${issue.entityId||issue.lessonId||issue.invoiceId||''}`;
      if(issueKeys.has(key)) return;
      issueKeys.add(key);
      uniqueIssues.push(issue);
    });
    const blockingIssues=uniqueIssues.filter(issue=>['error','attention'].includes(issue.severity));
    const hasBlockingType=prefixes=>blockingIssues.some(issue=>
      prefixes.some(prefix=>String(issue.type||'').startsWith(prefix))
    );
    const checklist=[
      {
        id:'lessons',
        label:'Tundide finantsotsused',
        ready:lessonRegister.summary.unbilledCount===0
          && !hasBlockingType(['absence_','package_','unbilled_']),
        value:`${lessonRegister.summary.lessonCount} tundi · ${lessonRegister.summary.unbilledCount} arveldamata`
      },
      {
        id:'links',
        label:'Tundide ja arvete ID-seosed',
        ready:!hasBlockingType(['lesson_','duplicate_','invoice_line_']),
        value:`${lessonRegister.summary.exactLinkedCount} täpset seost`
      },
      {
        id:'payments',
        label:'Arvete ja maksete koond',
        ready:!hasBlockingType(['invoice_payment_','invoice_paid_','payment_without_','payment_exceeds_','payment_line_']),
        value:`${invoiceRegister.summary.paymentCount} maksekirjet`
      },
      {
        id:'bank',
        label:'Pangatehingute jaotus',
        ready:!hasBlockingType(['bank_']),
        value:`${invoiceRegister.summary.bankTransactionCount} tehingut · ${amountFromCents(invoiceRegister.summary.bankUnappliedCents)} € jaotamata`
      }
    ];
    return {
      month,
      invoiceRegister,
      lessonRegister,
      issues:uniqueIssues,
      blockingIssues,
      canReview:blockingIssues.length===0,
      checklist,
      summary:{
        invoiceCount:invoiceRegister.summary.invoiceCount,
        issuedCents:invoiceRegister.summary.issuedCents,
        paymentCount:invoiceRegister.summary.paymentCount,
        paymentsCents:invoiceRegister.summary.paymentsAppliedCents,
        bankTransactionCount:invoiceRegister.summary.bankTransactionCount,
        bankReceivedCents:invoiceRegister.summary.bankReceivedCents,
        bankUnappliedCents:invoiceRegister.summary.bankUnappliedCents,
        lessonCount:lessonRegister.summary.lessonCount,
        exactLessonLinkCount:lessonRegister.summary.exactLinkedCount,
        unbilledLessonCount:lessonRegister.summary.unbilledCount,
        legacyLessonCount:lessonRegister.summary.legacyCount,
        errorCount:uniqueIssues.filter(issue=>issue.severity==='error').length,
        attentionCount:uniqueIssues.filter(issue=>issue.severity==='attention').length,
        warningCount:uniqueIssues.filter(issue=>issue.severity==='warning').length,
        blockingIssueCount:blockingIssues.length
      }
    };
  }

  const normalizedReference=value=>String(value||'').toUpperCase().replace(/[^A-Z0-9ÕÄÖÜŠŽ]/g,'');
  const referenceAppearsIn=(text,reference)=>{
    const canonical=normalizedReference(reference);
    if(canonical.length<5) return false;
    const alphanumeric='A-Z0-9ÕÄÖÜŠŽ';
    const flexible=canonical.split('').join(`[^${alphanumeric}]*`);
    return new RegExp(`(^|[^${alphanumeric}])${flexible}(?=$|[^${alphanumeric}])`,'u')
      .test(String(text||'').toUpperCase());
  };
  const referenceMatches=(payment,invoice)=>{
    const references=unique([invoice?.paymentReference,invoice?.num])
      .filter(reference=>normalizedReference(reference).length>=5);
    const matchedReference=references.find(reference=>
      referenceAppearsIn(`${payment?.reference||''} ${payment?.note||''}`,reference)
    )||'';
    return {matched:Boolean(matchedReference),matchedReference};
  };
  const invoiceRemainingCents=invoice=>{
    if(Number.isInteger(Number(invoice?.balanceDueCents))) return Math.max(0,Number(invoice.balanceDueCents));
    if(invoice?.balanceDue!==undefined) return Math.max(0,Math.round((Number(invoice.balanceDue)||0)*100));
    const paid=Number.isInteger(Number(invoice?.paidAmountCents))
      ?Math.max(0,Number(invoice.paidAmountCents))
      :Math.max(0,Math.round((Number(invoice?.paidAmount)||0)*100));
    return Math.max(0,invoiceEffectiveCents(invoice)-paid);
  };

  function bankStatementMatchProposal({payment={},invoices=[],students=[]}={}){
    const invoiceList=Array.isArray(invoices)?invoices:[];
    const studentList=Array.isArray(students)?students:[];
    const referenceMatchesList=invoiceList.filter(invoice=>
      unique([invoice?.paymentReference,invoice?.num])
        .filter(reference=>normalizedReference(reference).length>=5)
        .some(reference=>referenceAppearsIn(`${payment?.desc||''} ${payment?.reference||''}`,reference))
    );
    if(referenceMatchesList.length===1){
      const invoice=referenceMatchesList[0];
      return {
        tier:'ref',
        confidence:'high',
        invoice,
        name:invoice.studentName||invoice.parentName||'',
        reason:`Makse selgituses on unikaalne arveviide ${invoice.paymentReference||invoice.num}.`
      };
    }
    if(referenceMatchesList.length>1){
      return {
        tier:'ref-dup',
        confidence:'none',
        candidates:referenceMatchesList,
        name:'',
        reason:'Makse selgituses leitud arveviide ei ole unikaalne.'
      };
    }

    const nameHaystack=String(`${payment?.payer||''} ${payment?.payerName||''} ${payment?.desc||''}`)
      .toLocaleLowerCase('et');
    const scoredStudents=studentList.map(student=>{
      const tokens=unique(
        unique([student?.name,student?.parentName])
          .join(' ')
          .toLocaleLowerCase('et')
          .split(/\s+/)
          .filter(token=>token.length>=3)
      );
      return {
        student,
        hits:tokens.filter(token=>nameHaystack.includes(token)).length
      };
    }).filter(item=>item.hits>0).sort((a,b)=>b.hits-a.hits);
    if(!scoredStudents.length){
      return {tier:'none',confidence:'none',name:'',reason:'Arveviidet ega unikaalset nime ei leitud.'};
    }
    if(scoredStudents.length>1&&scoredStudents[0].hits===scoredStudents[1].hits){
      return {tier:'name-dup',confidence:'none',name:'',reason:'Nime järgi leiti mitu sama tugevat kandidaati.'};
    }
    const student=scoredStudents[0].student;
    const studentInvoices=invoiceList.filter(invoice=>
      invoiceRemainingCents(invoice)>0
      &&(
        String(invoice.studentId||'')===String(student.id||'')
        ||String(invoice.studentName||'').toLocaleLowerCase('et')===String(student.name||'').toLocaleLowerCase('et')
      )
    );
    const paymentCents=Math.max(0,Math.round((Number(payment?.amount)||0)*100));
    const exactAmountInvoices=studentInvoices.filter(invoice=>
      Math.abs(invoiceRemainingCents(invoice)-paymentCents)<=1
    );
    if(exactAmountInvoices.length===1){
      return {
        tier:'name-amount',
        confidence:'medium',
        invoice:exactAmountInvoices[0],
        name:student.name||'',
        reason:'Maksja nimi ja summa vastavad ühele tasumata arvele.'
      };
    }
    return {
      tier:'guess',
      confidence:'low',
      name:student.name||'',
      reason:exactAmountInvoices.length>1
        ?'Nimi sobib, kuid sama summaga arveid on mitu.'
        :'Nimi sobib, kuid summa ei määra üht arvet.'
    };
  }

  function paymentAllocationQueue({
    invoices=[],
    payments=[],
    paymentLineAllocations=[],
    month=''
  }={}){
    const invoiceById=new Map(
      (Array.isArray(invoices)?invoices:[])
        .filter(item=>item?.id)
        .map(item=>[String(item.id),item])
    );
    const activePayments=(Array.isArray(payments)?payments:[])
      .filter(activePayment);
    const allocationList=Array.isArray(paymentLineAllocations)?paymentLineAllocations:[];
    const allocationById=new Map(
      allocationList.filter(item=>item?.id).map(item=>[String(item.id),item])
    );
    const versionsByPayment=new Map();
    allocationList.forEach(allocation=>{
      const paymentId=String(allocation?.paymentId||'');
      if(!paymentId) return;
      if(!versionsByPayment.has(paymentId)) versionsByPayment.set(paymentId,[]);
      versionsByPayment.get(paymentId).push(allocation);
    });
    versionsByPayment.forEach(list=>list.sort((a,b)=>
      Number(b.version||0)-Number(a.version||0)
      ||String(b.createdAt||'').localeCompare(String(a.createdAt||''))
    ));

    const currentAllocationFor=payment=>{
      if(!payment?.lineAllocationId) return null;
      const allocation=allocationById.get(String(payment.lineAllocationId));
      if(
        !allocation
        ||String(allocation.paymentId||'')!==String(payment.id||'')
        ||String(allocation.invoiceId||'')!==String(payment.invoiceId||'')
        ||Number(allocation.version||0)!==Number(payment.lineAllocationVersion||0)
      ) return null;
      return allocation;
    };
    const invalidAllocationInvoiceIds=new Set(activePayments
      .filter(payment=>payment.lineAllocationId&&!currentAllocationFor(payment))
      .map(payment=>String(payment.invoiceId||'')));
    const invoiceLinesById=new Map([...invoiceById].map(([invoiceId,invoice])=>{
      const correctedIds=new Set((invoice?.correctedLessonIds||[]).map(String));
      const lines=(Array.isArray(invoice?.lines)?invoice.lines:[])
        .map((line,index)=>({
          ...line,
          invoiceLineIndex:index,
          lessonId:String(line?.lessonId||''),
          amountCents:cents(line,'amountCents','amount')
        }))
        .filter(line=>line.lessonId&&!correctedIds.has(line.lessonId))
        .sort((a,b)=>`${isoDate(a.date)}:${String(a.invoiceLineIndex).padStart(4,'0')}`
          .localeCompare(`${isoDate(b.date)}:${String(b.invoiceLineIndex).padStart(4,'0')}`));
      return [invoiceId,lines];
    }));
    const confirmedReservedByInvoice=new Map();
    activePayments.forEach(payment=>{
      const allocation=currentAllocationFor(payment);
      if(!allocation) return;
      const invoiceId=String(payment.invoiceId||'');
      if(!confirmedReservedByInvoice.has(invoiceId)) confirmedReservedByInvoice.set(invoiceId,{});
      const reserved=confirmedReservedByInvoice.get(invoiceId);
      (allocation.lines||[]).forEach(line=>{
        const lessonId=String(line?.lessonId||'');
        reserved[lessonId]=(reserved[lessonId]||0)+Math.max(0,Number(line?.allocatedAmountCents)||0);
      });
    });
    const provisionalReservedByInvoice=new Map();
    const processingPayments=activePayments
      .filter(payment=>inMonth(paymentDate(payment),month))
      .sort((a,b)=>`${paymentDate(a)}:${String(a.id||'')}`.localeCompare(`${paymentDate(b)}:${String(b.id||'')}`));
    const rows=processingPayments
      .map(payment=>{
        const paymentId=String(payment.id||'');
        const invoiceId=String(payment.invoiceId||'');
        const invoice=invoiceById.get(invoiceId)||null;
        const invoiceLines=invoiceLinesById.get(invoiceId)||[];
        const currentAllocation=currentAllocationFor(payment);
        const hasPointer=Boolean(payment.lineAllocationId);
        const ownReserved={};
        (currentAllocation?.lines||[]).forEach(line=>{
          ownReserved[String(line?.lessonId||'')]=Math.max(0,Number(line?.allocatedAmountCents)||0);
        });
        const confirmedReserved=confirmedReservedByInvoice.get(invoiceId)||{};
        const provisionalReserved=provisionalReservedByInvoice.get(invoiceId)||{};
        const availableLines=invoiceLines.map(line=>({
          ...line,
          availableCents:Math.max(
            0,
            line.amountCents
              -(confirmedReserved[line.lessonId]||0)
              +(ownReserved[line.lessonId]||0)
              -(provisionalReserved[line.lessonId]||0)
          )
        }));
        const paymentCents=paymentNetCents(payment);
        let remainingCents=paymentCents;
        const suggestedLines=[];
        availableLines.forEach(line=>{
          if(remainingCents<=0||line.availableCents<=0) return;
          const allocatedAmountCents=Math.min(line.availableCents,remainingCents);
          suggestedLines.push({
            lessonId:line.lessonId,
            invoiceLineIndex:line.invoiceLineIndex,
            lessonDate:isoDate(line.date),
            description:String(line.description||line.title||''),
            lineAmountCents:line.amountCents,
            availableCents:line.availableCents,
            allocatedAmountCents
          });
          remainingCents-=allocatedAmountCents;
        });
        const currentAllocatedCents=currentAllocation
          ?Math.max(0,Number(currentAllocation.allocatedAmountCents)||0)
          :0;
        const currentUnallocatedCents=currentAllocation
          ?Math.max(0,paymentCents-currentAllocatedCents)
          :paymentCents;
        let status='needs_confirmation';
        let confidence='low';
        let reason='Makse vajab administraatori kinnitatud tunnijaotust.';
        const referenceEvidence=referenceMatches(payment,invoice);
        if(!invoice||invoiceLines.length===0){
          status='unsupported';
          confidence='none';
          reason='Arvel puuduvad muutumatud tunni ID-ga read.';
        }else if(hasPointer&&!currentAllocation){
          status='invalid';
          confidence='none';
          reason='Makse aktiivse jaotusversiooni viit on vigane või puudub.';
        }else if(invalidAllocationInvoiceIds.has(invoiceId)){
          status='attention';
          confidence='none';
          reason='Sama arve teisel maksel on vigane jaotusviit; paranda see enne jätkamist.';
        }else if(currentAllocation&&currentUnallocatedCents>1){
          status='incomplete';
          confidence='none';
          reason=`Aktiivses versioonis on ${amountFromCents(currentUnallocatedCents).toFixed(2)} € jaotamata.`;
        }else if(currentAllocation){
          status='exact';
          confidence='confirmed';
          reason=`Kinnitatud täpne jaotus · versioon ${Number(currentAllocation.version||0)}.`;
        }else if(remainingCents>1){
          status='attention';
          confidence='none';
          reason=`Tunniridadel ei ole ${amountFromCents(remainingCents).toFixed(2)} € jaoks piisavalt vaba summat.`;
        }else if(
          suggestedLines.length===1
          &&suggestedLines[0].allocatedAmountCents===suggestedLines[0].availableCents
        ){
          const bankSource=paymentSource(payment)==='bank';
          confidence=bankSource&&!referenceEvidence.matched?'medium':'high';
          reason=referenceEvidence.matched
            ?`Summa vastab ühele vabale tunnireale ja makse selgitus sisaldab arveviidet.`
            :bankSource
              ?'Summa vastab ühele vabale tunnireale, kuid pangaselgituses ei leitud arveviidet.'
              :'Summa vastab täpselt ühele vabale tunnireale.';
        }else if(suggestedLines.every(line=>line.allocatedAmountCents===line.availableCents)){
          confidence='medium';
          reason='Summa katab terviklikud tunniread vanimast alates.';
        }else{
          confidence='low';
          reason='Ettepanek sisaldab osalist tunnirida ja vajab hoolikat kontrolli.';
        }
        if(status==='needs_confirmation'&&remainingCents<=1){
          if(!provisionalReservedByInvoice.has(invoiceId)) provisionalReservedByInvoice.set(invoiceId,{});
          const provisional=provisionalReservedByInvoice.get(invoiceId);
          suggestedLines.forEach(line=>{
            provisional[line.lessonId]=(provisional[line.lessonId]||0)+line.allocatedAmountCents;
          });
        }
        return {
          paymentId,
          invoiceId,
          invoice,
          payment,
          invoiceNum:String(invoice?.num||payment.invoiceNum||invoiceId||'—'),
          payer:payerLabel(payment),
          paidAt:paymentDate(payment),
          paymentCents,
          status,
          confidence,
          reason,
          referenceEvidence,
          suggestedLines,
          suggestedCents:paymentCents-Math.max(0,remainingCents),
          suggestionRemainderCents:Math.max(0,remainingCents),
          currentAllocation,
          currentAllocatedCents,
          currentUnallocatedCents,
          history:versionsByPayment.get(paymentId)||[]
        };
      })
      .sort((a,b)=>{
        const rank={invalid:0,incomplete:1,attention:2,needs_confirmation:3,unsupported:4,exact:5};
        return (rank[a.status]??9)-(rank[b.status]??9)
          ||`${b.paidAt}:${b.paymentId}`.localeCompare(`${a.paidAt}:${a.paymentId}`);
      });
    return {
      month,
      rows,
      summary:{
        paymentCount:rows.length,
        needsConfirmationCount:rows.filter(row=>row.status==='needs_confirmation').length,
        attentionCount:rows.filter(row=>['invalid','incomplete','attention','unsupported'].includes(row.status)).length,
        exactCount:rows.filter(row=>row.status==='exact').length,
        highConfidenceCount:rows.filter(row=>row.status==='needs_confirmation'&&row.confidence==='high').length
      }
    };
  }

  const csvCell=value=>`"${String(value??'').replace(/"/g,'""')}"`;
  function accountingRegisterCsv(register={}){
    const header=[
      'Arve nr','Kuupäev','Tähtaeg','Maksja','Kirjeldus',
      'Arve summa','Laekunud','Jääk','Staatus','Makseallikas','Maksekuupäevad',
      'Maksekorraldused','Dokumendi ID-d'
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
      (row.paymentDates||[]).join(', '),
      (row.paymentDocuments||[]).map(document=>document.fileName).join(', '),
      (row.paymentDocuments||[]).map(document=>document.id).filter(Boolean).join(', ')
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
      row.allocationMethod.includes('explicit_invoice_lines_v1')
        ?'Täpne maksejaotus'
        :row.allocationMethod==='invoice_fifo_v1'
          ?'Arve FIFO (vanim tund enne)'
          :'',
      row.linkExact?'Täpne ID-seos':row.status==='package_covered'?'Paketikirje':'Pärand või määramata'
    ].map(csvCell).join(';'));
    return '\uFEFF'+[header.map(csvCell).join(';'),...lines].join('\n');
  }

  return {
    accountingRegister,
    accountingRegisterCsv,
    bankStatementMatchProposal,
    financialPeriodControl,
    amountFromCents,
    invoiceEffectiveCents,
    isoDate,
    lessonPaymentRegister,
    lessonPaymentRegisterCsv,
    lessonPaymentStatusLabel,
    paymentAllocationQueue,
    paymentNetCents,
    statusLabel
  };
});
