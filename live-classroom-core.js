(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.LiveClassroomCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const cleanText=(value,max=2000)=>String(value??'').trim().slice(0,max);
  const escapeHtml=value=>String(value??'')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
  const getRoles=profile=>{
    const roles=new Set(Array.isArray(profile?.roles)?profile.roles:[]);
    if(profile?.role) roles.add(profile.role);
    if(profile?.parentRole||profile?.isParent) roles.add('parent');
    if(profile?.studentRole||profile?.isStudent) roles.add('student');
    return Array.from(roles);
  };
  const isStaff=profile=>getRoles(profile).some(role=>role==='admin'||role==='teacher');
  const sceneTypes=new Set(['welcome','message','choice','short_answer','screen']);
  const normalizeOptions=options=>(Array.isArray(options)?options:String(options||'').split('\n'))
    .map(option=>cleanText(option,180))
    .filter(Boolean)
    .slice(0,8);
  const normalizeSceneSource=source=>{
    if(!source||typeof source!=='object'||Array.isArray(source)) return null;
    const normalized={
      kind:cleanText(source.kind,40),
      id:cleanText(source.id,180),
      type:cleanText(source.type,40)
    };
    return normalized.kind&&normalized.id?normalized:null;
  };
  const normalizeActionUrl=value=>{
    const url=cleanText(value,500);
    if(!url||url.startsWith('//')||url.includes('\\')) return '';
    if(url.startsWith('/haldus-exercises/')||url.startsWith('/haldus-worksheet/')) return url;
    return '';
  };
  const historyEventTypes=new Set([
    'scene_published',
    'material_published',
    'screen_started',
    'screen_stopped',
    'lesson_ended'
  ]);
  const normalizeLessonGoals=goals=>(Array.isArray(goals)?goals:String(goals||'').split('\n'))
    .map(goal=>cleanText(goal,240))
    .filter(Boolean)
    .slice(0,12);
  const normalizeCurriculumGoals=goals=>{
    const seenGoalIds=new Set();
    return(Array.isArray(goals)?goals:[]).reduce((result,goal)=>{
      if(!goal||typeof goal!=='object'||Array.isArray(goal)) return result;
      const id=cleanText(goal.id,80).replace(/[^A-Za-z0-9_-]/g,'');
      const label=cleanText(goal.label,240);
      if(!id||!label||seenGoalIds.has(id)||result.length>=12) return result;
      seenGoalIds.add(id);
      result.push({
        id,
        label,
        skillIds:Array.from(new Set((Array.isArray(goal.skillIds)?goal.skillIds:[])
          .map(skillId=>cleanText(skillId,80).replace(/[^A-Za-z0-9_-]/g,''))
          .filter(Boolean))).slice(0,8)
      });
      return result;
    },[]);
  };
  const applyCurriculumGoalsToSkillMap=(currentSkillMap,skillIds,minimumScore=80)=>{
    const next={...(currentSkillMap&&typeof currentSkillMap==='object'&&!Array.isArray(currentSkillMap)?currentSkillMap:{})};
    Array.from(new Set((Array.isArray(skillIds)?skillIds:[])
      .map(skillId=>cleanText(skillId,80).replace(/[^A-Za-z0-9_-]/g,''))
      .filter(Boolean))).slice(0,48).forEach(skillId=>{
        const current=Number(next[skillId]);
        const normalizedCurrent=Number.isFinite(current)?Math.max(0,Math.min(100,current)):0;
        next[skillId]=Math.max(normalizedCurrent,Math.max(0,Math.min(100,Number(minimumScore)||80)));
      });
    return next;
  };
  const normalizeHomeworkDue=value=>{
    const due=cleanText(value,10);
    return /^\d{4}-\d{2}-\d{2}$/.test(due)?due:'';
  };
  const buildLessonSummary=({
    teacherComment='',
    achievedGoals=[],
    curriculumGoals=[],
    curriculumSubject='',
    curriculumLevel='',
    nextHomework='',
    homeworkDue='',
    homeworkId=''
  }={})=>{
    const normalizedCurriculumGoals=normalizeCurriculumGoals(curriculumGoals);
    const curriculumGoalLabels=normalizedCurriculumGoals.map(goal=>goal.label);
    const summary={
      teacherComment:cleanText(teacherComment,3000),
      achievedGoals:normalizeLessonGoals([
        ...curriculumGoalLabels,
        ...normalizeLessonGoals(achievedGoals)
      ]),
      curriculumGoalIds:normalizedCurriculumGoals.map(goal=>goal.id),
      curriculumGoalLabels,
      curriculumSkillIds:Array.from(new Set(normalizedCurriculumGoals.flatMap(goal=>goal.skillIds))).slice(0,48),
      curriculumSubject:cleanText(curriculumSubject,80),
      curriculumLevel:cleanText(curriculumLevel,40),
      nextHomework:cleanText(nextHomework,2000),
      homeworkDue:normalizeHomeworkDue(homeworkDue),
      homeworkId:cleanText(homeworkId,180)
    };
    if(!summary.teacherComment){
      throw new Error('Lisa enne tunni lõpetamist lühike kokkuvõte.');
    }
    if(!summary.nextHomework){
      summary.homeworkDue='';
      summary.homeworkId='';
    }
    return summary;
  };
  const buildScene=({type='message',title='',body='',options=[],version=1,source=null,actionUrl=''}={})=>{
    const normalizedType=sceneTypes.has(type)?type:'message';
    const scene={
      type:normalizedType,
      title:cleanText(title,160),
      body:cleanText(body,4000),
      options:normalizeOptions(options),
      version:Math.max(1,Number.parseInt(version,10)||1),
      publishedAt:new Date().toISOString()
    };
    const normalizedSource=normalizeSceneSource(source);
    const normalizedActionUrl=normalizeActionUrl(actionUrl);
    if(normalizedSource) scene.source=normalizedSource;
    if(normalizedActionUrl) scene.actionUrl=normalizedActionUrl;
    if(normalizedType==='choice'&&scene.options.length<2){
      throw new Error('Valikvastusega ülesanne vajab vähemalt kahte vastust.');
    }
    if((normalizedType==='message'||normalizedType==='choice'||normalizedType==='short_answer')&&!scene.title&&!scene.body){
      throw new Error('Lisa enne avaldamist pealkiri või juhis.');
    }
    return scene;
  };
  const sceneHistorySnapshot=scene=>{
    const snapshot=buildScene({
      type:scene?.type,
      title:scene?.title,
      body:scene?.body,
      options:scene?.options,
      version:scene?.version,
      source:scene?.source,
      actionUrl:scene?.actionUrl
    });
    snapshot.publishedAt=cleanText(scene?.publishedAt,40)||snapshot.publishedAt;
    return snapshot;
  };
  const buildSceneHistoryEntry=({
    classroomId='',
    room={},
    scene={},
    eventType='scene_published',
    createdAtIso=new Date().toISOString()
  }={})=>{
    const snapshot=sceneHistorySnapshot(scene);
    return{
      classroomId:cleanText(classroomId||room.id,180),
      sceneVersion:snapshot.version,
      eventType:historyEventTypes.has(eventType)?eventType:'scene_published',
      scene:snapshot,
      studentId:cleanText(room.studentId,180),
      studentName:cleanText(room.studentName,160),
      teacherUid:cleanText(room.teacherUid,180),
      teacherName:cleanText(room.teacherName,160),
      createdAtIso:cleanText(createdAtIso,40)
    };
  };
  const sceneAcceptsResponse=scene=>scene?.type==='choice'||scene?.type==='short_answer';
  const isUnsafeDisplaySurface=surface=>String(surface||'').toLowerCase()==='monitor';
  const classroomLink=(origin,roomId)=>`${String(origin||'').replace(/\/$/,'')}/live-classroom/?room=${encodeURIComponent(roomId||'')}`;
  const responseLabel=response=>{
    if(!response) return '';
    return cleanText(response.answer||response.option||'',1000);
  };
  const timestampMillis=value=>{
    if(!value) return 0;
    if(typeof value.toMillis==='function') return value.toMillis();
    if(typeof value.toDate==='function') return value.toDate().getTime();
    const parsed=Date.parse(value);
    return Number.isNaN(parsed)?0:parsed;
  };
  const lessonHistorySortValue=room=>Math.max(
    timestampMillis(room?.endedAt),
    timestampMillis(room?.endedAtIso),
    timestampMillis(room?.updatedAt),
    timestampMillis(room?.createdAt),
    timestampMillis(room?.createdAtIso)
  );
  const lessonDurationMinutes=room=>{
    const started=timestampMillis(room?.startedAt)||timestampMillis(room?.createdAt)||timestampMillis(room?.createdAtIso);
    const ended=timestampMillis(room?.endedAt)||timestampMillis(room?.endedAtIso);
    if(!started||!ended||ended<started) return null;
    return Math.max(1,Math.round((ended-started)/60000));
  };
  const responsesForScene=(responses,sceneVersion)=>(Array.isArray(responses)?responses:[])
    .filter(response=>Number(response?.sceneVersion)===Number(sceneVersion))
    .sort((a,b)=>timestampMillis(a?.createdAt)-timestampMillis(b?.createdAt)
      ||timestampMillis(a?.createdAtIso)-timestampMillis(b?.createdAtIso));
  const isPresenceFresh=(presence,now=Date.now(),maxAgeMs=60000)=>{
    if(!presence||presence.online===false) return false;
    const seenAt=timestampMillis(presence.lastSeen)||timestampMillis(presence.lastSeenIso);
    return seenAt>0&&Math.max(0,Number(now)-seenAt)<=Math.max(1000,Number(maxAgeMs)||60000);
  };
  const classroomErrorMessage=error=>{
    const code=String(error?.code||'').toLowerCase();
    const message=String(typeof error==='string'?error:error?.message||'').trim();
    const combined=`${code} ${message}`.toLowerCase();
    if(combined.includes('permission-denied')||combined.includes('insufficient permission')){
      return 'Sul ei ole sellele klassiruumile ligipääsu. Ava enda tunni link või palu õpetajal uus link saata.';
    }
    if(combined.includes('unauthenticated')||combined.includes('auth/user-token-expired')){
      return 'Sinu sisselogimine on aegunud. Logi CRM-is uuesti sisse ja proovi veel kord.';
    }
    if(combined.includes('unavailable')||combined.includes('network')||combined.includes('offline')){
      return 'Ühendus klassiruumiga katkes. Kontrolli internetti ja proovi uuesti.';
    }
    return cleanText(message,300)||'Klassiruumi ei saanud avada. Proovi uuesti või ava CRM.';
  };
  return {
    cleanText,
    escapeHtml,
    getRoles,
    isStaff,
    normalizeOptions,
    normalizeSceneSource,
    normalizeActionUrl,
    normalizeLessonGoals,
    normalizeCurriculumGoals,
    applyCurriculumGoalsToSkillMap,
    buildLessonSummary,
    buildScene,
    sceneHistorySnapshot,
    buildSceneHistoryEntry,
    sceneAcceptsResponse,
    isUnsafeDisplaySurface,
    classroomLink,
    responseLabel,
    timestampMillis,
    lessonHistorySortValue,
    lessonDurationMinutes,
    responsesForScene,
    isPresenceFresh,
    classroomErrorMessage
  };
});
