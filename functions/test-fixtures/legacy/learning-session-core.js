(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KeeleSeppLearningSessionCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const ROUTES=['support','core','advanced'];
  const JUDGEMENTS=['needs_help','managed','too_easy'];
  const SOURCES=['teacher','task-rule','system'];

  const text=(value,max=240)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);
  const unique=values=>Array.from(new Set((Array.isArray(values)?values:[]).map(value=>text(value,120)).filter(Boolean)));
  const score=value=>{
    if(value===null||value===undefined||value==='') return null;
    const number=Number(value);
    if(!Number.isFinite(number)) return null;
    return Math.max(0,Math.min(100,Math.round(number)));
  };

  function mapUiJudgement(value){
    return ({help:'needs_help',ok:'managed',easy:'too_easy'})[value]||null;
  }

  function phaseIdForItem(item={}){
    if(item.kind==='diagnostic') return 'diagnostic';
    return text(item.stageId||item.phaseId||'',100);
  }

  function skillIdsForItem({lesson={},item={}}={}){
    if(Array.isArray(item.skillIds)&&item.skillIds.length) return unique(item.skillIds);
    if(item.kind==='diagnostic'){
      const diagnostic=(lesson.diagnostic?.items||[]).find(entry=>entry.id===item.id);
      if(Array.isArray(diagnostic?.skillIds)&&diagnostic.skillIds.length) return unique(diagnostic.skillIds);
      return [];
    }
    const stage=(lesson.stages||[]).find(entry=>entry.id===item.stageId);
    return stage?.skill?unique([stage.skill]):[];
  }

  function routeBySkillWith(current={},skillIds=[],route='core'){
    const result={};
    Object.entries(current||{}).forEach(([key,value])=>{
      if(ROUTES.includes(value)&&text(key,120)) result[text(key,120)]=value;
    });
    const safeRoute=ROUTES.includes(route)?route:'core';
    unique(skillIds).forEach(id=>{result[id]=safeRoute;});
    return result;
  }

  function buildSessionDraft({student={},teacher={},lesson={},currentItem={},currentIndex=0,currentRoute='core'}={}){
    const studentId=text(student.id||student.studentId,120);
    const teacherUid=text(teacher.uid||teacher.id,160);
    const lessonBlueprintId=text(lesson.id,160);
    if(!studentId||!teacherUid||!lessonBlueprintId) throw new Error('studentId, teacherUid and lesson.id are required');
    const route=ROUTES.includes(currentRoute)?currentRoute:'core';
    const skillIds=skillIdsForItem({lesson,item:currentItem});
    return {
      schemaVersion:1,
      studentId,
      studentName:text(student.name||student.fullName||'Õpilane',160),
      teacherUid,
      teacherName:text(teacher.name||teacher.displayName||teacher.email||'',160),
      lessonBlueprintId,
      lessonTitle:text(lesson.title||lessonBlueprintId,180),
      curriculumGoalIds:unique(lesson.curriculumGoalIds||[]),
      cefrLevel:text(lesson.cefrLevel||lesson.ceFRLevel||'',20),
      status:'active',
      currentIndex:Math.max(0,Math.round(Number(currentIndex)||0)),
      currentPhaseId:phaseIdForItem(currentItem)||'diagnostic',
      currentActivityId:text(currentItem.id||'',140),
      currentRoute:route,
      routeBySkill:routeBySkillWith({},skillIds,route),
      evidenceCount:0,
      assessedSkillIds:[],
      teacherNote:'',
      handoff:null
    };
  }

  function buildTeacherEvidence({session={},lesson={},item={},route='core',judgement=null,taskResult=null,vocabularyIds=[],note='',kind='teacher_judgement'}={}){
    const mapped=JUDGEMENTS.includes(judgement)?judgement:mapUiJudgement(judgement);
    const safeRoute=ROUTES.includes(route)?route:'core';
    const normalizedScore=score(taskResult);
    const evidence={
      schemaVersion:1,
      sessionId:text(session.id,160),
      studentId:text(session.studentId,120),
      teacherUid:text(session.teacherUid,160),
      lessonBlueprintId:text(session.lessonBlueprintId||lesson.id,160),
      phaseId:phaseIdForItem(item)||'unknown',
      activityId:text(item.id||'',140),
      skillIds:skillIdsForItem({lesson,item}),
      vocabularyIds:unique(vocabularyIds),
      route:safeRoute,
      source:'teacher',
      kind:text(kind,40)||'teacher_judgement',
      note:text(note,800)
    };
    if(mapped) evidence.teacherJudgement=mapped;
    if(normalizedScore!==null) evidence.taskResult=normalizedScore;
    return evidence;
  }

  function buildVocabularyEvidence({session={},lesson={},item={},route='core',wordId='',mark=''}={}){
    const vocabularyId=text(wordId,120);
    if(!vocabularyId) throw new Error('wordId is required');
    const judgement=mark==='weak'?'needs_help':mark==='known'?'managed':null;
    if(!judgement) throw new Error('vocabulary mark must be weak or known');
    const evidence=buildTeacherEvidence({
      session,
      lesson,
      item,
      route,
      judgement,
      vocabularyIds:[vocabularyId],
      kind:'vocabulary_mark'
    });
    evidence.skillIds=unique(['vocabulary',...evidence.skillIds]);
    return evidence;
  }

  function normalizeSummaryScores(input={}){
    const output={};
    ['vocabulary','grammar','speaking','reading','listening','writing'].forEach(skill=>{
      const value=score(input[skill]);
      if(value!==null) output[skill]=value;
    });
    return output;
  }

  function buildSummaryEvidence({session={},lesson={},route='core',scores={},phaseId='stage-4-exit'}={}){
    return Object.entries(normalizeSummaryScores(scores)).map(([skill,value])=>({
      schemaVersion:1,
      sessionId:text(session.id,160),
      studentId:text(session.studentId,120),
      teacherUid:text(session.teacherUid,160),
      lessonBlueprintId:text(session.lessonBlueprintId||lesson.id,160),
      phaseId:text(phaseId,100)||'summary',
      activityId:`summary-${skill}`,
      skillIds:[skill],
      vocabularyIds:[],
      route:ROUTES.includes(route)?route:'core',
      source:'teacher',
      kind:'summary_score',
      taskResult:value,
      note:''
    }));
  }

  function nextSessionProgress({session={},lesson={},item={},index=0,route='core',evidenceDelta=0,skillIds=[]}={}){
    const safeRoute=ROUTES.includes(route)?route:'core';
    const assessed=unique([...(session.assessedSkillIds||[]),...skillIds]);
    return {
      currentIndex:Math.max(0,Math.round(Number(index)||0)),
      currentPhaseId:phaseIdForItem(item)||session.currentPhaseId||'diagnostic',
      currentActivityId:text(item.id||'',140),
      currentRoute:safeRoute,
      routeBySkill:routeBySkillWith(session.routeBySkill||{},skillIds,safeRoute),
      evidenceCount:Math.max(0,Math.round(Number(session.evidenceCount)||0)+Math.max(0,Math.round(Number(evidenceDelta)||0))),
      assessedSkillIds:assessed
    };
  }

  function validateSessionDraft(data={}){
    const errors=[];
    if(data.schemaVersion!==1) errors.push('schemaVersion must be 1');
    if(!text(data.studentId,120)) errors.push('studentId is required');
    if(!text(data.teacherUid,160)) errors.push('teacherUid is required');
    if(!text(data.lessonBlueprintId,160)) errors.push('lessonBlueprintId is required');
    if(data.status!=='active') errors.push('new session status must be active');
    if(!ROUTES.includes(data.currentRoute)) errors.push('currentRoute is invalid');
    if(!Number.isInteger(data.currentIndex)||data.currentIndex<0) errors.push('currentIndex is invalid');
    if(data.evidenceCount!==0) errors.push('new session evidenceCount must be 0');
    return {ok:errors.length===0,errors};
  }

  function validateEvidence(data={}){
    const errors=[];
    if(data.schemaVersion!==1) errors.push('schemaVersion must be 1');
    ['sessionId','studentId','teacherUid','lessonBlueprintId','phaseId','activityId','kind'].forEach(key=>{
      if(!text(data[key],180)) errors.push(`${key} is required`);
    });
    if(!Array.isArray(data.skillIds)) errors.push('skillIds must be an array');
    if(!Array.isArray(data.vocabularyIds)) errors.push('vocabularyIds must be an array');
    if(!ROUTES.includes(data.route)) errors.push('route is invalid');
    if(!SOURCES.includes(data.source)) errors.push('source is invalid');
    if(data.teacherJudgement!==undefined&&!JUDGEMENTS.includes(data.teacherJudgement)) errors.push('teacherJudgement is invalid');
    if(data.taskResult!==undefined&&score(data.taskResult)===null) errors.push('taskResult is invalid');
    return {ok:errors.length===0,errors};
  }

  return {
    ROUTES,
    JUDGEMENTS,
    SOURCES,
    score,
    unique,
    mapUiJudgement,
    phaseIdForItem,
    skillIdsForItem,
    routeBySkillWith,
    buildSessionDraft,
    buildTeacherEvidence,
    buildVocabularyEvidence,
    normalizeSummaryScores,
    buildSummaryEvidence,
    nextSessionProgress,
    validateSessionDraft,
    validateEvidence
  };
});