(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.CalendarCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const DAY_IDS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const normalize=value=>String(value||'')
    .toLocaleLowerCase('et-EE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .trim();

  const parseLocalDate=value=>{
    const match=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!match) return null;
    const date=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]),12,0,0,0);
    return Number.isNaN(date.getTime())?null:date;
  };

  const toLocalISODate=value=>{
    const date=value instanceof Date?value:new Date(value);
    if(Number.isNaN(date.getTime())) return '';
    return [
      date.getFullYear(),
      String(date.getMonth()+1).padStart(2,'0'),
      String(date.getDate()).padStart(2,'0')
    ].join('-');
  };

  const dayIdForDate=value=>{
    const date=parseLocalDate(value);
    return date?DAY_IDS[date.getDay()]:'';
  };

  const timeToMinutes=value=>{
    const match=String(value||'').match(/^(\d{1,2}):(\d{2})$/);
    if(!match) return null;
    const hour=Number(match[1]);
    const minute=Number(match[2]);
    if(hour<0||hour>23||minute<0||minute>59) return null;
    return hour*60+minute;
  };

  const minutesToTime=value=>{
    const total=Math.max(0,Math.min(24*60-1,Math.round(Number(value)||0)));
    return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
  };

  const addMinutes=(time,duration)=>{
    const start=timeToMinutes(time);
    if(start===null) return '';
    const total=start+Math.max(0,Number(duration)||0);
    if(total>=24*60) return '24:00';
    return minutesToTime(total);
  };

  const generateTimeSlots=(start='07:00',end='21:00',step=15)=>{
    const from=timeToMinutes(start);
    const to=timeToMinutes(end);
    const size=Math.max(5,Number(step)||15);
    if(from===null||to===null||to<from) return [];
    const result=[];
    for(let minute=from;minute<=to;minute+=size) result.push(minutesToTime(minute));
    return result;
  };

  const eventOccursOnDate=(event,dateIso)=>{
    if(!event||!dateIso) return false;
    if(Array.isArray(event.excludedDates)&&event.excludedDates.includes(dateIso)) return false;
    if(event.date) return event.date===dateIso;
    if(event.recurring===false) return false;
    if(event.startDate&&dateIso<event.startDate) return false;
    if(event.endDate&&dateIso>event.endDate) return false;
    return Boolean(event.day)&&event.day===dayIdForDate(dateIso);
  };

  const eventsForDate=(events,dateIso)=>
    (events||[]).filter(event=>eventOccursOnDate(event,dateIso));

  const eventInterval=(event,dateIso)=>{
    if(!eventOccursOnDate(event,dateIso)) return null;
    const start=timeToMinutes(event.time);
    if(start===null) return null;
    const duration=Math.max(5,Number(event.duration)||60);
    return {start,end:start+duration,duration};
  };

  const sameTeacher=(left,right)=>{
    const teacherKey=value=>normalize(value).split(/\s+/)[0]||'';
    const a=teacherKey(left?.teacherFull||left?.teacher);
    const b=teacherKey(right?.teacherFull||right?.teacher);
    return Boolean(a&&b&&a===b);
  };

  const sameStudent=(left,right)=>{
    if(left?.studentId&&right?.studentId) return left.studentId===right.studentId;
    const a=normalize(left?.studentName);
    const b=normalize(right?.studentName);
    return Boolean(a&&b&&a===b);
  };

  const findScheduleConflicts=(events,candidate,dateIso,options={})=>{
    const interval=eventInterval(candidate,dateIso);
    if(!interval) return [];
    const excludeId=options.excludeId||candidate.id||'';
    return (events||[]).flatMap(event=>{
      if(!event||event.id===excludeId||event.status==='Tühistatud') return [];
      const other=eventInterval(event,dateIso);
      if(!other||interval.start>=other.end||other.start>=interval.end) return [];
      const reasons=[];
      if(sameTeacher(event,candidate)) reasons.push('teacher');
      if(sameStudent(event,candidate)) reasons.push('student');
      return reasons.length?[{event,reasons,date:dateIso,overlapStart:Math.max(interval.start,other.start),overlapEnd:Math.min(interval.end,other.end)}]:[];
    });
  };

  const scheduleConflictWarning=(conflicts,action='Tund salvestati')=>{
    const list=Array.isArray(conflicts)?conflicts.filter(Boolean):[];
    if(!list.length) return '';
    const first=list[0];
    const reasons=Array.isArray(first.reasons)?first.reasons:[];
    const owner=reasons.includes('teacher')&&reasons.includes('student')
      ?'õpetajal ja õpilasel'
      :reasons.includes('teacher')
        ?'õpetajal'
        :'õpilasel';
    const date=String(first.date||'').trim();
    const time=String(first.event?.time||'').trim();
    const where=[date,time?`kell ${time}`:''].filter(Boolean).join(' ');
    const more=list.length>1?` Veel ${list.length-1} kattuvust.`:'';
    return `⚠ ${action}, kuid ${owner} on${where?' '+where:''} kattuv tund.${more}`;
  };

  const layoutDayEvents=(events,dateIso,options={})=>{
    const startMinute=Number.isFinite(options.startMinute)?options.startMinute:7*60;
    const endMinute=Number.isFinite(options.endMinute)?options.endMinute:21*60+15;
    const pixelsPerMinute=Number(options.pixelsPerMinute)||1;
    const items=eventsForDate(events,dateIso)
      .map(event=>{
        const interval=eventInterval(event,dateIso);
        if(!interval||interval.end<=startMinute||interval.start>=endMinute) return null;
        return {
          event,
          start:Math.max(startMinute,interval.start),
          end:Math.min(endMinute,interval.end),
          originalStart:interval.start,
          originalEnd:interval.end
        };
      })
      .filter(Boolean)
      .sort((left,right)=>left.start-right.start||right.end-left.end);

    const positioned=[];
    let cluster=[];
    let clusterEnd=-1;
    const finishCluster=()=>{
      if(!cluster.length) return;
      const laneCount=Math.max(...cluster.map(item=>item.lane))+1;
      cluster.forEach(item=>{
        item.laneCount=laneCount;
        item.leftPercent=(item.lane/laneCount)*100;
        item.widthPercent=100/laneCount;
      });
      positioned.push(...cluster);
      cluster=[];
      clusterEnd=-1;
    };

    items.forEach(item=>{
      if(cluster.length&&item.start>=clusterEnd) finishCluster();
      const active=cluster.filter(existing=>existing.end>item.start);
      const used=new Set(active.map(existing=>existing.lane));
      let lane=0;
      while(used.has(lane)) lane++;
      cluster.push({...item,lane});
      clusterEnd=Math.max(clusterEnd,item.end);
    });
    finishCluster();

    return positioned.map(item=>({
      ...item,
      top:(item.start-startMinute)*pixelsPerMinute,
      height:Math.max(18,(item.end-item.start)*pixelsPerMinute)
    }));
  };

  const monthGrid=anchorIso=>{
    const anchor=parseLocalDate(anchorIso)||new Date();
    const first=new Date(anchor.getFullYear(),anchor.getMonth(),1,12,0,0,0);
    const mondayOffset=(first.getDay()+6)%7;
    const start=new Date(first);
    start.setDate(first.getDate()-mondayOffset);
    return Array.from({length:42},(_,index)=>{
      const date=new Date(start);
      date.setDate(start.getDate()+index);
      const iso=toLocalISODate(date);
      return {
        iso,
        dayId:DAY_IDS[date.getDay()],
        day:date.getDate(),
        inMonth:date.getMonth()===anchor.getMonth(),
        isToday:iso===toLocalISODate(new Date())
      };
    });
  };

  const shiftMonth=(anchorIso,offset)=>{
    const anchor=parseLocalDate(anchorIso)||new Date();
    const shifted=new Date(anchor.getFullYear(),anchor.getMonth()+Number(offset||0),1,12,0,0,0);
    return toLocalISODate(shifted);
  };

  const monthLabel=anchorIso=>{
    const anchor=parseLocalDate(anchorIso)||new Date();
    return anchor.toLocaleDateString('et-EE',{month:'long',year:'numeric'});
  };

  const buildSchedulePayload=(input={})=>{
    const date=String(input.date||'');
    const recurring=Boolean(input.recurring);
    const nowIso=input.nowIso||new Date().toISOString();
    return {
      teacher:String(input.teacher||'').trim(),
      teacherUid:String(input.teacherUid||'').trim(),
      studentId:String(input.studentId||'').trim(),
      studentName:String(input.studentName||'').trim(),
      ...(recurring
        ?{day:input.day||dayIdForDate(date),recurring:true,startDate:date}
        :{date,day:input.day||dayIdForDate(date),recurring:false}),
      time:String(input.time||'09:00'),
      duration:Math.max(5,Number(input.duration)||60),
      status:input.status||'Planeeritud',
      source:input.source||'keelesepp',
      scheduleVersion:2,
      createdAt:input.createdAt||date||nowIso.slice(0,10),
      createdAtIso:input.createdAtIso||nowIso,
      updatedAtIso:nowIso
    };
  };

  const buildOccurrenceExceptionPlan=(series,originalDate,changes={},options={})=>{
    const date=String(originalDate||'').trim();
    if(!series?.id||!series.recurring||!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    if(!eventOccursOnDate(series,date)) return null;
    const targetDate=String(changes.date||date).trim();
    if(!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) return null;
    const excludedDates=[...new Set([
      ...(Array.isArray(series.excludedDates)?series.excludedDates:[]),
      date
    ].filter(value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value||''))))].sort();
    if(excludedDates.length>500) return null;
    const nowIso=options.nowIso||new Date().toISOString();
    const copied={};
    [
      'teacher','teacherFull','teacherUid','studentId','studentName','title',
      'notes','comment','subject','level','group','groupId','classroom'
    ].forEach(key=>{
      if(series[key]!==undefined&&series[key]!==null&&series[key]!=='') copied[key]=series[key];
    });
    const status=changes.status||series.status||'Planeeritud';
    return {
      seriesPatch:{
        excludedDates,
        updatedAtIso:nowIso
      },
      exception:{
        ...copied,
        date:targetDate,
        day:dayIdForDate(targetDate),
        time:String(changes.time||series.time||'09:00'),
        duration:Math.max(5,Number(changes.duration)||Number(series.duration)||60),
        status,
        recurring:false,
        source:'keelesepp',
        scheduleVersion:3,
        seriesId:String(series.id),
        originalOccurrenceDate:date,
        originalDate:date,
        originalTime:String(series.time||''),
        occurrenceKind:status==='Tühistatud'?'cancelled':'override',
        ...(status==='Tühistatud'
          ?{canceledAt:nowIso.slice(0,10)}
          :status==='Nihutatud'
            ?{rescheduledAt:nowIso.slice(0,10)}
            :{}),
        createdAt:targetDate,
        createdAtIso:nowIso,
        updatedAtIso:nowIso
      }
    };
  };

  return {
    DAY_IDS,
    normalize,
    parseLocalDate,
    toLocalISODate,
    dayIdForDate,
    timeToMinutes,
    minutesToTime,
    addMinutes,
    generateTimeSlots,
    eventOccursOnDate,
    eventsForDate,
    eventInterval,
    findScheduleConflicts,
    scheduleConflictWarning,
    layoutDayEvents,
    monthGrid,
    shiftMonth,
    monthLabel,
    buildSchedulePayload,
    buildOccurrenceExceptionPlan
  };
});
