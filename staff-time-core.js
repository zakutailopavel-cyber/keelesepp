(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.StaffTimeCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const DEFAULT_SESSION_GAP_MINUTES=15;
  const DEFAULT_EVENT_CREDIT_MINUTES=5;
  const MAX_DAILY_ESTIMATE_MINUTES=12*60;

  const eventDate=value=>{
    if(value&&typeof value.toDate==='function') return value.toDate();
    const date=value instanceof Date?new Date(value.getTime()):new Date(String(value||''));
    return Number.isNaN(date.getTime())?null:date;
  };

  const validIsoDay=value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value||'').slice(0,10))
    ?String(value).slice(0,10)
    :'';

  const confidenceForEvents=(eventCount,sessionCount)=>{
    if(eventCount>=20&&sessionCount>=2) return 'medium';
    if(eventCount>=5) return 'low';
    return 'very_low';
  };

  const historicalActivityByDay=(logs,{
    month='',
    beforeDate='',
    staffUids=null,
    sessionGapMinutes=DEFAULT_SESSION_GAP_MINUTES,
    eventCreditMinutes=DEFAULT_EVENT_CREDIT_MINUTES
  }={})=>{
    const allowedStaff=Array.isArray(staffUids)?new Set(staffUids.filter(Boolean)):null;
    const cleanMonth=/^\d{4}-\d{2}$/.test(month)?month:'';
    const cleanBefore=validIsoDay(beforeDate);
    const maxGap=Math.max(1,Math.min(120,Math.round(Number(sessionGapMinutes)||DEFAULT_SESSION_GAP_MINUTES)));
    const eventCredit=Math.max(1,Math.min(30,Math.round(Number(eventCreditMinutes)||DEFAULT_EVENT_CREDIT_MINUTES)));
    const groups=new Map();

    (Array.isArray(logs)?logs:[]).forEach(item=>{
      const staffUid=String(item?.byUid||'').trim();
      const created=eventDate(item?.createdAt);
      const day=validIsoDay(item?.date)||(created?created.toISOString().slice(0,10):'');
      if(!staffUid||!created||!day) return;
      if(allowedStaff&&!allowedStaff.has(staffUid)) return;
      if(cleanMonth&&day.slice(0,7)!==cleanMonth) return;
      if(cleanBefore&&day>=cleanBefore) return;
      const key=`${staffUid}:${day}`;
      if(!groups.has(key)) groups.set(key,{staffUid,date:day,times:[]});
      groups.get(key).times.push(created.getTime());
    });

    return Array.from(groups.values()).map(group=>{
      const times=Array.from(new Set(group.times)).sort((a,b)=>a-b);
      let estimateMinutes=times.length?eventCredit:0;
      let sessionCount=times.length?1:0;
      for(let index=1;index<times.length;index+=1){
        const gapMinutes=Math.max(0,Math.floor((times[index]-times[index-1])/60000));
        if(gapMinutes===0) continue;
        if(gapMinutes<=maxGap) estimateMinutes+=gapMinutes;
        else{
          estimateMinutes+=eventCredit;
          sessionCount+=1;
        }
      }
      estimateMinutes=Math.min(MAX_DAILY_ESTIMATE_MINUTES,estimateMinutes);
      return{
        staffUid:group.staffUid,
        date:group.date,
        eventCount:times.length,
        sessionCount,
        estimateMinutes,
        firstActivityAt:new Date(times[0]).toISOString(),
        lastActivityAt:new Date(times[times.length-1]).toISOString(),
        confidence:confidenceForEvents(times.length,sessionCount)
      };
    }).sort((a,b)=>b.date.localeCompare(a.date)||a.staffUid.localeCompare(b.staffUid));
  };

  const historicalActivitySummary=(logs,options={})=>{
    const days=historicalActivityByDay(logs,options);
    const byStaff=new Map();
    days.forEach(day=>{
      const current=byStaff.get(day.staffUid)||{
        staffUid:day.staffUid,
        estimateMinutes:0,
        eventCount:0,
        sessionCount:0,
        dayCount:0
      };
      current.estimateMinutes+=day.estimateMinutes;
      current.eventCount+=day.eventCount;
      current.sessionCount+=day.sessionCount;
      current.dayCount+=1;
      byStaff.set(day.staffUid,current);
    });
    return{days,staff:Array.from(byStaff.values())};
  };

  return{
    DEFAULT_EVENT_CREDIT_MINUTES,
    DEFAULT_SESSION_GAP_MINUTES,
    MAX_DAILY_ESTIMATE_MINUTES,
    confidenceForEvents,
    historicalActivityByDay,
    historicalActivitySummary
  };
});
