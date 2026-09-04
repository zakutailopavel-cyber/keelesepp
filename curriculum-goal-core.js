(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KeeleSeppCurriculumGoalCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const cleanText=(value,max=240)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);
  const unique=values=>Array.from(new Set((Array.isArray(values)?values:[]).map(value=>cleanText(value,160)).filter(Boolean)));
  const normalizeToken=value=>cleanText(value,240).toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
  const clampScore=value=>{
    if(value===null||value===undefined||value==='') return null;
    const number=Number(value);
    if(!Number.isFinite(number)) return null;
    return Math.max(0,Math.min(100,Math.round(number)));
  };

  function normalizeGoal(input={}){
    const goal=input&&typeof input==='object'?input:{};
    return {
      id:cleanText(goal.id,160),
      curriculumId:cleanText(goal.curriculumId,160),
      unitId:cleanText(goal.unitId,160),
      subject:cleanText(goal.subject||'Eesti keel',80),
      level:cleanText(goal.level,20),
      title:cleanText(goal.title,200),
      description:cleanText(goal.description,800),
      sequence:Number.isFinite(Number(goal.sequence))?Number(goal.sequence):9999,
      targetSkillIds:unique(goal.targetSkillIds),
      criticalSkillIds:unique(goal.criticalSkillIds),
      prerequisiteGoalIds:unique(goal.prerequisiteGoalIds),
      nextGoalIds:unique(goal.nextGoalIds),
      successCriteria:unique(goal.successCriteria).map(item=>cleanText(item,320)),
      lessonBlueprintIds:unique(goal.lessonBlueprintIds),
      legacyTopics:unique(goal.legacyTopics).map(normalizeToken),
      legacyTitles:unique(goal.legacyTitles).map(normalizeToken),
      aliases:unique(goal.aliases)
    };
  }

  function normalizeGoals(goals=[]){
    return (Array.isArray(goals)?goals:[]).map(normalizeGoal).filter(goal=>goal.id);
  }

  function goalIndex(goals=[]){
    return Object.fromEntries(normalizeGoals(goals).map(goal=>[goal.id,goal]));
  }

  function validateGoalGraph(goals=[]){
    const normalized=normalizeGoals(goals);
    const errors=[];
    const seen=new Set();
    normalized.forEach(goal=>{
      if(seen.has(goal.id)) errors.push(`duplicate goal id: ${goal.id}`);
      seen.add(goal.id);
      if(!goal.curriculumId) errors.push(`${goal.id}: curriculumId is required`);
      if(!goal.unitId) errors.push(`${goal.id}: unitId is required`);
      if(!goal.level) errors.push(`${goal.id}: level is required`);
      if(!goal.title) errors.push(`${goal.id}: title is required`);
      if(!goal.targetSkillIds.length) errors.push(`${goal.id}: targetSkillIds is required`);
      if(!goal.successCriteria.length) errors.push(`${goal.id}: successCriteria is required`);
    });

    const ids=new Set(normalized.map(goal=>goal.id));
    normalized.forEach(goal=>{
      [...goal.prerequisiteGoalIds,...goal.nextGoalIds].forEach(ref=>{
        if(!ids.has(ref)) errors.push(`${goal.id}: missing goal reference ${ref}`);
        if(ref===goal.id) errors.push(`${goal.id}: self reference is not allowed`);
      });
    });

    const index=Object.fromEntries(normalized.map(goal=>[goal.id,goal]));
    const visiting=new Set();
    const visited=new Set();
    const stack=[];
    const visit=id=>{
      if(visiting.has(id)){
        const start=Math.max(0,stack.indexOf(id));
        errors.push(`prerequisite cycle: ${[...stack.slice(start),id].join(' -> ')}`);
        return;
      }
      if(visited.has(id)||!index[id]) return;
      visiting.add(id); stack.push(id);
      index[id].prerequisiteGoalIds.forEach(visit);
      stack.pop(); visiting.delete(id); visited.add(id);
    };
    normalized.forEach(goal=>visit(goal.id));

    return {ok:errors.length===0,errors,goals:normalized};
  }

  function normalizeSkillMap(skillMap={}){
    const output={};
    Object.entries(skillMap&&typeof skillMap==='object'&&!Array.isArray(skillMap)?skillMap:{}).forEach(([id,value])=>{
      const skillId=cleanText(id,160);
      const score=clampScore(value);
      if(skillId&&score!==null) output[skillId]=score;
    });
    return output;
  }

  function scopeGoals(goals,{level='',subject=''}={}){
    const safeLevel=cleanText(level,20);
    const safeSubject=cleanText(subject,80);
    return normalizeGoals(goals).filter(goal=>(!safeLevel||goal.level===safeLevel)&&(!safeSubject||goal.subject===safeSubject));
  }

  function legacyMatchScore(goal={},context={}){
    const lessonBlueprintId=cleanText(context.lessonBlueprintId,160);
    const topic=normalizeToken(context.topic||context.category||'');
    const title=normalizeToken(context.title||context.lessonTitle||'');
    let score=0;
    if(lessonBlueprintId&&goal.lessonBlueprintIds.includes(lessonBlueprintId)) score+=1000;
    if(topic&&goal.legacyTopics.includes(topic)) score+=120;
    if(title){
      if(goal.legacyTitles.includes(title)) score+=80;
      else if(goal.legacyTitles.some(alias=>alias&&title.includes(alias))) score+=40;
    }
    return score;
  }

  function mapLegacyGoalIds(goals=[],context={}){
    const scoped=scopeGoals(goals,{level:context.level,subject:context.subject});
    return scoped
      .map(goal=>({goal,score:legacyMatchScore(goal,context)}))
      .filter(item=>item.score>0)
      .sort((a,b)=>b.score-a.score||a.goal.sequence-b.goal.sequence||a.goal.id.localeCompare(b.goal.id))
      .map(item=>item.goal.id);
  }

  function goalReadiness(goalInput={},context={}){
    const goal=normalizeGoal(goalInput);
    const achieved=new Set(unique(context.achievedGoalIds));
    const skillMap=normalizeSkillMap(context.skillMap);
    const threshold=Math.max(1,Math.min(100,Number(context.masteryThreshold)||70));
    const missingPrerequisiteGoalIds=goal.prerequisiteGoalIds.filter(id=>!achieved.has(id));
    const criticalSkills=goal.criticalSkillIds.map(id=>({
      id,
      score:Object.prototype.hasOwnProperty.call(skillMap,id)?skillMap[id]:null
    })).map(item=>({
      ...item,
      status:item.score===null?'unknown':item.score<50?'focus':item.score<threshold?'caution':'ready'
    }));
    return {
      ready:missingPrerequisiteGoalIds.length===0,
      missingPrerequisiteGoalIds,
      criticalSkills,
      weakCriticalSkillIds:criticalSkills.filter(item=>item.score!==null&&item.score<threshold).map(item=>item.id),
      unknownCriticalSkillIds:criticalSkills.filter(item=>item.score===null).map(item=>item.id),
      masteryThreshold:threshold
    };
  }

  function attentionRank(readiness){
    if(readiness.criticalSkills.some(item=>item.status==='focus')) return 0;
    if(readiness.criticalSkills.some(item=>item.status==='caution')) return 1;
    if(readiness.criticalSkills.some(item=>item.status==='unknown')) return 2;
    return 3;
  }

  function recommendationReasons({goal,readiness,mode='',fromGoalId='',legacyMatched=false}={}){
    const reasons=[];
    if(mode==='current') reasons.push('active_goal_in_progress');
    if(mode==='successor') reasons.push('continues_from_completed_goal');
    if(legacyMatched) reasons.push('legacy_context_match');
    if(goal.prerequisiteGoalIds.length&&readiness.ready) reasons.push('prerequisites_met');
    if(!goal.prerequisiteGoalIds.length) reasons.push('entry_goal');
    if(readiness.criticalSkills.some(item=>item.status==='focus')) reasons.push('critical_skill_focus');
    else if(readiness.criticalSkills.some(item=>item.status==='caution')) reasons.push('critical_skill_caution');
    else if(readiness.criticalSkills.some(item=>item.status==='unknown')) reasons.push('critical_skill_evidence_missing');
    if(!readiness.ready) reasons.push('prerequisites_missing');
    return {reasonCodes:unique(reasons),fromGoalId:cleanText(fromGoalId,160)};
  }

  function buildRecommendation(goal,context={}){
    if(!goal) return null;
    const readiness=goalReadiness(goal,context);
    const reasonData=recommendationReasons({
      goal,
      readiness,
      mode:context.mode,
      fromGoalId:context.fromGoalId,
      legacyMatched:Boolean(context.legacyMatched)
    });
    return {
      goal,
      goalId:goal.id,
      status:context.mode==='current'?'in_progress':readiness.ready?'ready':'blocked',
      readiness,
      reasonCodes:reasonData.reasonCodes,
      fromGoalId:reasonData.fromGoalId,
      legacyMatched:Boolean(context.legacyMatched)
    };
  }

  function recommendNextGoal({goals=[],achievedGoalIds=[],currentGoalIds=[],skillMap={},level='',subject='',legacyContext={},masteryThreshold=70}={}){
    const validation=validateGoalGraph(goals);
    if(!validation.ok) return {goal:null,goalId:'',status:'invalid_graph',reasonCodes:['invalid_graph'],errors:validation.errors};

    const scoped=scopeGoals(validation.goals,{level,subject});
    if(!scoped.length) return {goal:null,goalId:'',status:'no_scope_goals',reasonCodes:['no_scope_goals'],errors:[]};
    const index=Object.fromEntries(scoped.map(goal=>[goal.id,goal]));
    const achievedOrdered=unique(achievedGoalIds).filter(id=>index[id]);
    const achieved=new Set(achievedOrdered);
    const current=unique(currentGoalIds).filter(id=>index[id]&&!achieved.has(id));
    const legacyGoalIds=mapLegacyGoalIds(scoped,{...legacyContext,level:level||legacyContext.level,subject:subject||legacyContext.subject});

    if(current.length){
      const goal=index[current[0]];
      return {...buildRecommendation(goal,{achievedGoalIds:achievedOrdered,skillMap,masteryThreshold,mode:'current',legacyMatched:legacyGoalIds.includes(goal.id)}),errors:[]};
    }

    const successorCandidates=[];
    achievedOrdered.forEach(fromGoalId=>{
      (index[fromGoalId]?.nextGoalIds||[]).forEach(goalId=>{
        if(index[goalId]&&!achieved.has(goalId)&&!successorCandidates.some(item=>item.goalId===goalId)) successorCandidates.push({goalId,fromGoalId});
      });
    });
    const readySuccessors=successorCandidates
      .map(item=>({item,goal:index[item.goalId],readiness:goalReadiness(index[item.goalId],{achievedGoalIds:achievedOrdered,skillMap,masteryThreshold})}))
      .filter(row=>row.readiness.ready)
      .sort((a,b)=>attentionRank(a.readiness)-attentionRank(b.readiness)||a.goal.sequence-b.goal.sequence||a.goal.id.localeCompare(b.goal.id));
    if(readySuccessors.length){
      const selected=readySuccessors[0];
      return {...buildRecommendation(selected.goal,{achievedGoalIds:achievedOrdered,skillMap,masteryThreshold,mode:'successor',fromGoalId:selected.item.fromGoalId,legacyMatched:legacyGoalIds.includes(selected.goal.id)}),errors:[]};
    }

    const mappedGoal=legacyGoalIds.map(id=>index[id]).find(goal=>goal&&!achieved.has(goal.id));
    if(mappedGoal){
      return {...buildRecommendation(mappedGoal,{achievedGoalIds:achievedOrdered,skillMap,masteryThreshold,mode:'legacy',legacyMatched:true}),errors:[]};
    }

    const candidates=scoped.filter(goal=>!achieved.has(goal.id)).map(goal=>({
      goal,
      readiness:goalReadiness(goal,{achievedGoalIds:achievedOrdered,skillMap,masteryThreshold})
    }));
    const ready=candidates.filter(item=>item.readiness.ready)
      .sort((a,b)=>attentionRank(a.readiness)-attentionRank(b.readiness)||a.goal.sequence-b.goal.sequence||a.goal.id.localeCompare(b.goal.id));
    if(ready.length){
      return {...buildRecommendation(ready[0].goal,{achievedGoalIds:achievedOrdered,skillMap,masteryThreshold,mode:'ready'}),errors:[]};
    }

    const blocked=candidates.sort((a,b)=>a.readiness.missingPrerequisiteGoalIds.length-b.readiness.missingPrerequisiteGoalIds.length||attentionRank(a.readiness)-attentionRank(b.readiness)||a.goal.sequence-b.goal.sequence||a.goal.id.localeCompare(b.goal.id));
    if(blocked.length){
      return {...buildRecommendation(blocked[0].goal,{achievedGoalIds:achievedOrdered,skillMap,masteryThreshold,mode:'blocked'}),errors:[]};
    }

    return {goal:null,goalId:'',status:'complete',reasonCodes:['graph_complete'],errors:[]};
  }

  function explainRecommendationEt(recommendation={},goalLookup={}){
    if(!recommendation||!recommendation.goal) return recommendation?.status==='complete'?'Selle õpieesmärkide lõigu kõik eesmärgid on kinnitatud.':'Järgmise eesmärgi soovitust ei ole.';
    const goal=recommendation.goal;
    const parts=[];
    if(recommendation.reasonCodes?.includes('active_goal_in_progress')) parts.push('See eesmärk on juba aktiivses õpitegevuses, seega jätka sama eesmärgiga kuni uue tõendini.');
    else if(recommendation.reasonCodes?.includes('continues_from_completed_goal')) parts.push('Eelmine kinnitatud eesmärk on saavutatud ja eesmärgigraafik suunab siit järgmise seotud eesmärgi juurde.');
    else if(recommendation.reasonCodes?.includes('legacy_context_match')) parts.push('Viimase tunni või teema pärandkontekst on kaardistatud selle stabiilse õpieesmärgiga.');
    else if(recommendation.reasonCodes?.includes('entry_goal')) parts.push('See on valitud B1 teemaploki lähte-eesmärk, millel ei ole eelnevat kohustuslikku eesmärki.');

    const weak=recommendation.readiness?.criticalSkills?.filter(item=>item.status==='focus'||item.status==='caution')||[];
    const unknown=recommendation.readiness?.criticalSkills?.filter(item=>item.status==='unknown')||[];
    if(weak.length) parts.push(`Kriitiline oskus vajab skillMapi järgi veel tähelepanu: ${weak.map(item=>`${item.id} ${item.score}%`).join(', ')}.`);
    else if(unknown.length) parts.push(`Kriitilise oskuse kohta puudub veel piisav mastery-tõend: ${unknown.map(item=>item.id).join(', ')}. Süsteem ei käsitle puuduvat tõendit nullina.`);

    const missing=recommendation.readiness?.missingPrerequisiteGoalIds||[];
    if(missing.length) parts.push(`Enne täielikku valmisolekut puudub kinnitatud prerequisite-tõend: ${missing.map(id=>goalLookup[id]?.title||id).join(', ')}.`);
    else if(goal.prerequisiteGoalIds.length) parts.push('Kõik selle eesmärgi stabiilsed prerequisite-eesmärgid on kinnitatud.');

    return parts.join(' ');
  }

  return {
    cleanText,
    unique,
    clampScore,
    normalizeGoal,
    normalizeGoals,
    goalIndex,
    validateGoalGraph,
    normalizeSkillMap,
    scopeGoals,
    legacyMatchScore,
    mapLegacyGoalIds,
    goalReadiness,
    recommendNextGoal,
    explainRecommendationEt
  };
});