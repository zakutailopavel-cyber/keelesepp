(function(root,factory){
  const bindings=typeof module==='object'&&module.exports?require('./functions/curriculum-lesson-bindings.js'):root.KeeleSeppCurriculumLessonBindings;
  const api=factory(bindings);
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KeeleSeppTeacherHomeCore=api;
})(typeof window!=='undefined'?window:globalThis,function(bindings){
  const ROUTES=new Set(['support','core','advanced']);
  const REFERENCE_LESSON_ID='est-b1-city-problem-solving-01';
  const REFERENCE_GOAL_ID='EST_B1_CITY_SOLVE_PROBLEM';
  const VOCAB_LESSON_ID='est-b1-city-vocabulary-01';
  const VOCAB_GOAL_ID='EST_B1_CITY_VOCAB';
  const LESSON_BY_GOAL=Object.freeze({
    [VOCAB_GOAL_ID]:VOCAB_LESSON_ID,
    [REFERENCE_GOAL_ID]:REFERENCE_LESSON_ID,
  });
  const SUPPORTED_LESSON_IDS=new Set([...Object.values(LESSON_BY_GOAL),bindings?.SCHOOL.lessonBlueprintId].filter(Boolean));

  const clean=(value,max=240)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);
  const normalize=value=>clean(value,200).toLocaleLowerCase('et-EE').normalize('NFD').replace(/[\u0300-\u036f]/g,'');

  const aliasKey=value=>{
    const first=normalize(value).split(/\s+/)[0]||'';
    if(first==='elena') return 'jelena';
    if(first==='yelyzaveta') return 'elizaveta';
    if(first==='anhelina') return 'angelina';
    return first;
  };

  function teacherMatches(event,actor){
    if(!event||!actor) return false;
    const actorUid=clean(actor.uid,160);
    const eventUid=clean(event.teacherUid,160);
    if(actorUid&&eventUid) return actorUid===eventUid;
    const actorName=aliasKey(actor.name||actor.displayName||actor.email);
    const eventName=aliasKey(event.teacherFull||event.teacher);
    return Boolean(actorName&&eventName&&actorName===eventName);
  }

  const cancelledStatus=value=>['tuhistatud','cancelled','canceled'].includes(normalize(value));
  const timeMinutes=value=>{
    const match=clean(value,10).match(/^(\d{1,2}):(\d{2})$/);
    if(!match) return null;
    const hours=Number(match[1]);
    const minutes=Number(match[2]);
    if(hours<0||hours>23||minutes<0||minutes>59) return null;
    return hours*60+minutes;
  };
  const formatMinutes=value=>{
    const minutes=Math.max(0,Math.min(24*60,Math.round(Number(value)||0)));
    if(minutes===24*60) return '24:00';
    return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
  };
  function lessonEnd(event){
    const start=timeMinutes(event?.time);
    if(start===null) return '';
    return formatMinutes(start+Math.max(5,Number(event?.duration)||60));
  }
  function filterTeacherEvents(events,actor){
    return (Array.isArray(events)?events:[])
      .filter(event=>event&&!cancelledStatus(event.status)&&teacherMatches(event,actor))
      .sort((left,right)=>{
        const leftTime=timeMinutes(left.time);
        const rightTime=timeMinutes(right.time);
        const a=leftTime===null?Number.MAX_SAFE_INTEGER:leftTime;
        const b=rightTime===null?Number.MAX_SAFE_INTEGER:rightTime;
        return a-b||clean(left.studentName,160).localeCompare(clean(right.studentName,160),'et');
      });
  }
  function sanitizeRouteBySkill(value){
    const result={};
    if(!value||typeof value!=='object'||Array.isArray(value)) return result;
    Object.entries(value).slice(0,60).forEach(([rawId,rawRoute])=>{
      const id=clean(rawId,120);
      const route=clean(rawRoute,20);
      if(id&&ROUTES.has(route)) result[id]=route;
    });
    return result;
  }
  const timestampMillis=value=>{
    if(!value) return 0;
    if(typeof value.toMillis==='function') return value.toMillis();
    if(typeof value.toDate==='function') return value.toDate().getTime();
    if(value.seconds!==undefined) return Number(value.seconds)*1000;
    const parsed=Date.parse(value);
    return Number.isFinite(parsed)?parsed:0;
  };
  function latestActiveSession(sessions){
    return (Array.isArray(sessions)?sessions:[])
      .filter(session=>session&&clean(session.status,30)==='active')
      .sort((left,right)=>timestampMillis(right.updatedAt||right.startedAt)-timestampMillis(left.updatedAt||left.startedAt))[0]||null;
  }
  function latestEvidence(evidence){
    return (Array.isArray(evidence)?evidence:[])
      .filter(Boolean)
      .sort((left,right)=>timestampMillis(right.completedAt||right.createdAt)-timestampMillis(left.completedAt||left.createdAt))[0]||null;
  }
  function normalizeRecommendation(value){
    if(!value||typeof value!=='object'||!value.goal) return null;
    return {
      status:clean(value.status,40),
      goal:{id:clean(value.goal.id,160),title:clean(value.goal.title,240)},
      explanation:clean(value.explanation||value.reason||'',800),
    };
  }
  function normalizeCurriculumJourney(value){
    if(!value||typeof value!=='object') return null;
    const next=value.nextItem;
    return {
      valid:value.valid===true,
      completedLessons:Math.max(0,Number(value.completedLessons)||0),
      totalLessons:Math.max(0,Number(value.totalLessons)||0),
      completedTopics:Math.max(0,Number(value.completedTopics)||0),
      totalTopics:Math.max(0,Number(value.totalTopics)||0),
      percent:Math.max(0,Math.min(100,Number(value.percent)||0)),
      nextItem:next?{
        key:clean(next.key,180),
        topicId:clean(next.topicId,160),
        topicName:clean(next.topicName,240),
        lessonIndex:Number.isInteger(next.lessonIndex)&&next.lessonIndex>=0?next.lessonIndex:null,
        lessonNumber:clean(next.lessonNumber,100),
        lessonGoal:clean(next.lessonGoal,500),
        subject:clean(next.subject,100),
        level:clean(next.level,30),
        planned:Boolean(next.planned),
      }:null,
    };
  }
  function learningSummary(context={}){
    const profile=context.profile&&typeof context.profile==='object'?context.profile:{};
    const recommendation=normalizeRecommendation(context.recommendation);
    const curriculumJourney=normalizeCurriculumJourney(context.curriculumJourney);
    const activeSession=latestActiveSession(context.sessions);
    const completed=(context.sessions||[]).filter(session=>session?.status==='completed').sort((a,b)=>timestampMillis(b.completedAt||b.updatedAt)-timestampMillis(a.completedAt||a.updatedAt))[0];
    const evidence=latestEvidence(context.evidence||profile.recentEvidence);
    const reviewWords=Array.isArray(profile.recommendations?.reviewVocabularyIds)
      ?profile.recommendations.reviewVocabularyIds.map(value=>clean(value,80)).filter(Boolean).slice(0,4)
      :[];
    const attention=Array.isArray(profile.attention)
      ?profile.attention.slice(0,3).map(item=>({id:clean(item.id,120),label:clean(item.label||item.id,160),score:Number.isFinite(Number(item.score))?Number(item.score):null,status:clean(item.status,30)}))
      :[];
    return {
      latestHandoff:completed?{lessonTitle:clean(completed.lessonTitle,180),text:clean(completed.handoffText||completed.handoff?.text||completed.teacherNote,6000),completedAt:completed.completedAt||null}:null,
      recommendation,
      curriculumJourney,
      curriculumNext:curriculumJourney?.nextItem||null,
      reviewWords,
      attention,
      latestEvidence:evidence?{title:clean(evidence.title||evidence.lessonTitle||(context.sessions||[]).find(session=>session.id===evidence.sessionId)?.lessonTitle||evidence.kind||'Õppimistõend',180),completedAt:evidence.completedAt||evidence.createdAt||null,source:clean(evidence.lessonBlueprintId?'adaptive_lesson_evidence':evidence.source,60)}:null,
      activeSession:activeSession?{id:clean(activeSession.id,160),lessonBlueprintId:clean(activeSession.lessonBlueprintId,160),lessonTitle:clean(activeSession.lessonTitle,180),routeBySkill:sanitizeRouteBySkill(activeSession.routeBySkill)}:null,
      warning:clean(context.warning,400),
    };
  }
  function lessonHref(studentId,lessonId){
    const id=clean(studentId,120);
    const blueprintId=clean(lessonId,160);
    if(!id||!SUPPORTED_LESSON_IDS.has(blueprintId)) return '';
    return `/haldus-adaptive-lesson/?studentId=${encodeURIComponent(id)}&lessonId=${encodeURIComponent(blueprintId)}`;
  }
  function actionForStudent(studentId,summary){
    const id=clean(studentId,120);
    if(!id) return null;
    const active=summary?.activeSession;
    if(active&&SUPPORTED_LESSON_IDS.has(active.lessonBlueprintId)){
      return {kind:'lesson',label:'Jätka tundi',href:lessonHref(id,active.lessonBlueprintId)};
    }
    const binding=summary?.curriculumJourney?.valid&&!summary.warning
      ?bindings?.forCurriculumItem(summary.curriculumNext):null;
    if(binding) return {kind:'lesson',label:'Alusta tundi',href:lessonHref(id,binding.lessonBlueprintId)};
    return {kind:'profile',label:'Ava õppimisprofiil',href:`/haldus-learning-profile/?studentId=${encodeURIComponent(id)}`};
  }
  function buildTodayCards({events=[],actor=null,studentsById={},learningByStudent={}}={}){
    const visible=filterTeacherEvents(events,actor);
    return visible.map(event=>{
      const studentId=clean(event.studentId,120);
      const student=studentId&&studentsById&&studentsById[studentId]?studentsById[studentId]:null;
      const context=studentId&&learningByStudent&&learningByStudent[studentId]?learningByStudent[studentId]:{};
      const summary=learningSummary(context);
      return {
        eventId:clean(event.id,160),studentId,
        studentName:clean(student?.name||student?.fullName||event.studentName||'Õpilane',160),
        level:clean(student?.level||student?.cefrLevel||event.level,30),
        time:clean(event.time,10),endTime:lessonEnd(event),duration:Math.max(5,Number(event.duration)||60),
        title:clean(event.title||event.subject||'Tund',180),status:clean(event.status,60),summary,
        primaryAction:actionForStudent(studentId,summary),
        profileHref:studentId?`/haldus-learning-profile/?studentId=${encodeURIComponent(studentId)}`:'',
      };
    });
  }
  return {
    REFERENCE_LESSON_ID,REFERENCE_GOAL_ID,VOCAB_LESSON_ID,VOCAB_GOAL_ID,LESSON_BY_GOAL,
    clean,teacherMatches,filterTeacherEvents,lessonEnd,sanitizeRouteBySkill,latestActiveSession,latestEvidence,
    normalizeCurriculumJourney,learningSummary,lessonHref,actionForStudent,buildTodayCards,
  };
});
