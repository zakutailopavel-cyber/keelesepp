(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.TaxReportCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const digits=value=>String(value||'').replace(/\D/g,'');
  const normalize=value=>String(value||'')
    .toLocaleLowerCase('et-EE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/\s+/g,' ')
    .trim();
  const isoDate=value=>{
    if(!value) return '';
    if(typeof value==='string') return (value.match(/^\d{4}-\d{2}-\d{2}/)||[])[0]||'';
    if(typeof value?.toDate==='function') return value.toDate().toISOString().slice(0,10);
    if(value instanceof Date&&!Number.isNaN(value.getTime())) return value.toISOString().slice(0,10);
    return '';
  };
  const cents=(record,centsField,amountField)=>{
    const direct=Number(record?.[centsField]);
    if(Number.isInteger(direct)) return Math.max(0,direct);
    return Math.max(0,Math.round((Number(record?.[amountField])||0)*100));
  };
  const paymentNetCents=payment=>Math.max(0,
    cents(payment,'amountCents','amount')-cents(payment,'resolvedAmountCents','resolvedAmount')
  );
  const paymentDate=payment=>isoDate(payment?.paidAt||payment?.paymentDate||payment?.date||payment?.createdAt);
  const activePayment=payment=>payment&&payment.status!=='voided'&&paymentNetCents(payment)>0;
  const profileKey=(entityType,entityId)=>`${entityType}:${String(entityId||'').trim()}`;

  function validPersonalCode(value){
    const code=digits(value);
    if(code.length!==11) return false;
    const first=Number(code[0]);
    if(first<1||first>6) return false;
    const century=first<=2?1800:first<=4?1900:2000;
    const year=century+Number(code.slice(1,3));
    const month=Number(code.slice(3,5));
    const day=Number(code.slice(5,7));
    const date=new Date(Date.UTC(year,month-1,day));
    if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day) return false;
    const values=code.split('').map(Number);
    const firstWeights=[1,2,3,4,5,6,7,8,9,1];
    const secondWeights=[3,4,5,6,7,8,9,1,2,3];
    let check=values.slice(0,10).reduce((sum,value,index)=>sum+value*firstWeights[index],0)%11;
    if(check===10){
      check=values.slice(0,10).reduce((sum,value,index)=>sum+value*secondWeights[index],0)%11;
      if(check===10) check=0;
    }
    return check===values[10];
  }

  const maskPersonalCode=value=>{
    const code=digits(value);
    return code.length===11?`*******${code.slice(-4)}`:'';
  };

  const findParent=(invoice,parents)=>{
    const id=String(invoice?.parentUid||invoice?.linkedParentId||invoice?.guardianUid||'');
    if(id){
      const byId=parents.find(parent=>String(parent.id||parent.uid||'')===id);
      if(byId) return byId;
    }
    const email=normalize(invoice?.payerEmail||invoice?.parentEmail||invoice?.guardianEmail);
    if(email){
      const byEmail=parents.find(parent=>normalize(parent.email)===email);
      if(byEmail) return byEmail;
    }
    return null;
  };

  const personFromProfile=(profilesByKey,entityType,entityId,name,role)=>{
    const key=profileKey(entityType,entityId);
    const profile=profilesByKey.get(key)||{};
    const personalCode=digits(profile.personalCode);
    return {key,entityType,entityId:String(entityId||''),name:String(name||'').trim()||'Nimi puudub',role,personalCode,valid:validPersonalCode(personalCode)};
  };

  function buildInf3Preview({year,students=[],parents=[],invoices=[],payments=[],taxProfiles=[],ehisRegisteredFrom='2026-02-17'}={}){
    const selectedYear=Number(year)||new Date().getFullYear();
    const studentById=new Map((students||[]).filter(item=>item?.id).map(item=>[String(item.id),item]));
    const invoiceById=new Map((invoices||[]).filter(item=>item?.id).map(item=>[String(item.id),item]));
    const profilesByKey=new Map((taxProfiles||[]).map(profile=>[
      profileKey(profile.entityType,profile.entityId),profile
    ]));
    const peopleByKey=new Map();
    const records=[];

    (payments||[]).filter(activePayment).forEach(payment=>{
      const paidAt=paymentDate(payment);
      if(!paidAt||Number(paidAt.slice(0,4))!==selectedYear) return;
      const invoice=invoiceById.get(String(payment.invoiceId||''));
      const amountCents=paymentNetCents(payment);
      const base={paymentId:String(payment.id||''),invoiceId:String(payment.invoiceId||''),invoiceNumber:String(invoice?.num||invoice?.number||payment.invoiceNumber||''),paidAt,amountCents};
      if(!invoice){
        records.push({...base,status:'missing',reasons:['Arve seos puudub']});
        return;
      }
      const student=studentById.get(String(invoice.studentId||''));
      if(!student){
        records.push({...base,status:'missing',reasons:['Õpilase seos puudub'],payerName:String(invoice.payerName||invoice.parentName||'')});
        return;
      }
      const learner=personFromProfile(profilesByKey,'student',student.id,student.name||invoice.studentName,'learner');
      peopleByKey.set(learner.key,learner);
      const parent=findParent(invoice,parents||[]);
      const payerName=String(invoice.payerName||invoice.parentName||parent?.displayName||student.parentName||student.name||'').trim();
      const payerEmail=normalize(invoice.payerEmail||invoice.parentEmail||parent?.email||student.parentEmail||student.email);
      const payerIsLearner=!parent&&(
        normalize(payerName)===normalize(student.name)
        || (payerEmail&&payerEmail===normalize(student.email))
        || invoice.targetType==='student'
      );
      const payer= payerIsLearner
        ? {...learner,role:'payer',name:payerName||learner.name}
        : personFromProfile(
          profilesByKey,
          parent?'user':'payer',
          parent?String(parent.id||parent.uid):payerEmail||normalize(payerName),
          payerName||parent?.displayName,
          'payer'
        );
      peopleByKey.set(payer.key,payer);
      const reasons=[];
      if(!learner.valid) reasons.push('Õppija isikukood puudub või on vigane');
      if(!payer.valid) reasons.push('Maksja isikukood puudub või on vigane');
      const legalPayer=Boolean(invoice.payerRegCode||invoice.companyRegCode||parent?.companyRegCode);
      if(legalPayer) reasons.push('Maksja on juriidiline isik');
      const beforeRegistration=!ehisRegisteredFrom||paidAt<ehisRegisteredFrom;
      if(beforeRegistration) reasons.push('Makse on varasem kui EHIS registreering');
      const status=legalPayer||beforeRegistration?'excluded':reasons.length?'missing':'ready';
      records.push({
        ...base,status,reasons,studentId:String(student.id),studentName:String(student.name||invoice.studentName||''),
        learnerKey:learner.key,learnerCode:learner.personalCode,payerKey:payer.key,payerName:payer.name,payerCode:payer.personalCode,
        trainingType:'2'
      });
    });

    const grouped=new Map();
    records.filter(record=>record.status==='ready').forEach(record=>{
      const key=[record.payerCode,record.learnerCode,record.trainingType].join('|');
      const current=grouped.get(key)||{
        payerName:record.payerName,payerCode:record.payerCode,studentName:record.studentName,learnerCode:record.learnerCode,
        trainingType:record.trainingType,amountCents:0,paymentIds:[],invoiceNumbers:[]
      };
      current.amountCents+=record.amountCents;
      current.paymentIds.push(record.paymentId);
      if(record.invoiceNumber&&!current.invoiceNumbers.includes(record.invoiceNumber)) current.invoiceNumbers.push(record.invoiceNumber);
      grouped.set(key,current);
    });
    const rows=[...grouped.values()].sort((a,b)=>a.payerName.localeCompare(b.payerName,'et')||a.studentName.localeCompare(b.studentName,'et'));
    const total=(status)=>records.filter(record=>record.status===status).reduce((sum,record)=>sum+record.amountCents,0);
    return {
      year:selectedYear,
      records,
      rows,
      people:[...peopleByKey.values()].sort((a,b)=>a.name.localeCompare(b.name,'et')),
      summary:{
        paymentCount:records.length,
        readyPaymentCount:records.filter(record=>record.status==='ready').length,
        missingPaymentCount:records.filter(record=>record.status==='missing').length,
        excludedPaymentCount:records.filter(record=>record.status==='excluded').length,
        readyAmountCents:total('ready'),missingAmountCents:total('missing'),excludedAmountCents:total('excluded')
      }
    };
  }

  const csvCell=value=>`"${String(value??'').replace(/"/g,'""')}"`;
  const csv=(headers,rows)=>'\ufeff'+[headers,...rows].map(row=>row.map(csvCell).join(';')).join('\r\n');

  function inf3WorkfileCsv(preview){
    return csv(
      ['Aasta','Maksja nimi','Maksja isikukood','Õppija nimi','Õppija isikukood','Koolituse liik','Tasutud summa EUR','Arved','Maksete ID-d'],
      (preview?.rows||[]).map(row=>[
        preview.year,row.payerName,row.payerCode,row.studentName,row.learnerCode,row.trainingType,
        (row.amountCents/100).toFixed(2),row.invoiceNumbers.join(', '),row.paymentIds.join(', ')
      ])
    );
  }

  function inf3IssuesCsv(preview){
    return csv(
      ['Aasta','Staatus','Põhjus','Maksja','Õppija','Arve','Makse kuupäev','Summa EUR','Makse ID'],
      (preview?.records||[]).filter(record=>record.status!=='ready').map(record=>[
        preview.year,record.status,record.reasons.join('; '),record.payerName||'',record.studentName||'',record.invoiceNumber,
        record.paidAt,(record.amountCents/100).toFixed(2),record.paymentId
      ])
    );
  }

  return {
    buildInf3Preview,
    inf3IssuesCsv,
    inf3WorkfileCsv,
    maskPersonalCode,
    normalizePersonalCode:digits,
    profileKey,
    validPersonalCode
  };
});
