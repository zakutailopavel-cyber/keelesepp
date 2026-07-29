(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.HaldusQuality=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const DAY_IDS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const safeInteger=value=>{
    const parsed=Number.parseInt(value,10);
    return Number.isFinite(parsed)?parsed:0;
  };

  const legacyPackageSummary=student=>{
    const rawTotal=safeInteger(student?.packageTotal);
    const rawUsed=safeInteger(student?.packageUsed);
    const total=Math.max(0,rawTotal);
    const used=Math.max(0,rawUsed);
    const rawRemaining=rawTotal-rawUsed;
    return {
      total,
      used,
      remaining:Math.max(0,total-used),
      rawTotal,
      rawUsed,
      rawRemaining,
      invalid:rawTotal<0||rawUsed<0||rawUsed>rawTotal
    };
  };

  const scheduleEventOccursOnDate=(event,dateIso)=>{
    if(!event||!dateIso||event.status==='Tühistatud') return false;
    if(Array.isArray(event.excludedDates)&&event.excludedDates.includes(String(dateIso))) return false;
    if(event.date) return String(event.date)===String(dateIso);
    const date=new Date(`${dateIso}T12:00:00`);
    if(Number.isNaN(date.getTime())) return false;
    if(event.startDate&&String(dateIso)<String(event.startDate)) return false;
    if(event.recurring===false) return false;
    return String(event.day||'')===DAY_IDS[date.getDay()];
  };

  const duplicateInvoiceNumbers=invoices=>{
    const groups=new Map();
    (Array.isArray(invoices)?invoices:[]).forEach(invoice=>{
      const number=String(invoice?.num||'').trim().toUpperCase();
      if(!number) return;
      if(!groups.has(number)) groups.set(number,[]);
      groups.get(number).push(invoice);
    });
    return Array.from(groups.entries())
      .filter(([,items])=>items.length>1)
      .map(([number,items])=>({number,items,count:items.length}))
      .sort((a,b)=>a.number.localeCompare(b.number,'et'));
  };

  const dataQualitySummary=({students=[],invoices=[]}={})=>{
    const invalidPackages=(Array.isArray(students)?students:[])
      .map(student=>({student,summary:legacyPackageSummary(student)}))
      .filter(item=>item.summary.invalid);
    const duplicateInvoices=duplicateInvoiceNumbers(invoices);
    return {
      invalidPackages,
      duplicateInvoices,
      issueCount:invalidPackages.length+duplicateInvoices.length
    };
  };

  return {
    legacyPackageSummary,
    scheduleEventOccursOnDate,
    duplicateInvoiceNumbers,
    dataQualitySummary
  };
});
