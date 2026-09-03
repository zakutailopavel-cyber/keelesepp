(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.AdaptiveLessonCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const ROUTES=['support','core','advanced'];
  const SKILLS=['vocabulary','grammar','reading','listening','speaking','writing'];
  const clamp=(value,min=0,max=100)=>Math.max(min,Math.min(max,Number(value)||0));
  const text=value=>String(value??'').trim();

  function routeLabel(route){
    return ({support:'Tugi',core:'Põhirada',advanced:'Edasijõudnud'})[route]||'Põhirada';
  }

  function scoreDiagnostic(items=[]){
    const rows=(Array.isArray(items)?items:[]).filter(item=>Number.isFinite(Number(item?.score))&&Number.isFinite(Number(item?.max))&&Number(item.max)>0);
    const earned=rows.reduce((sum,item)=>sum+Number(item.score),0);
    const possible=rows.reduce((sum,item)=>sum+Number(item.max),0);
    const percent=possible?Math.round(earned/possible*100):0;
    return {earned,possible,percent,count:rows.length};
  }

  function recommendRoute({diagnosticPercent=0,previousMastery=null,confidence='normal'}={}){
    const diagnostic=clamp(diagnosticPercent);
    const prior=previousMastery===null||previousMastery===undefined?null:clamp(previousMastery);
    const blended=prior===null?diagnostic:Math.round(diagnostic*0.7+prior*0.3);
    const low=confidence==='low'?52:45;
    const high=confidence==='low'?88:82;
    if(blended<low) return {route:'support',score:blended,reason:'Learner needs more scaffolding before independent practice.'};
    if(blended>=high) return {route:'advanced',score:blended,reason:'Learner demonstrates enough control for reduced scaffolding and transfer tasks.'};
    return {route:'core',score:blended,reason:'Learner is within the expected band for the lesson category.'};
  }

  function normalizeMastery(input={}){
    const output={};
    SKILLS.forEach(skill=>{
      if(input[skill]===null||input[skill]===undefined||input[skill]==='') return;
      output[skill]=clamp(input[skill]);
    });
    return output;
  }

  function calculateMastery(input={},weights={}){
    const mastery=normalizeMastery(input);
    const entries=Object.entries(mastery);
    if(!entries.length) return {overall:null,skills:mastery,weakSkills:[],strongSkills:[]};
    let weighted=0;
    let totalWeight=0;
    entries.forEach(([skill,value])=>{
      const weight=Math.max(0,Number(weights[skill]??1));
      weighted+=value*weight;
      totalWeight+=weight;
    });
    const overall=totalWeight?Math.round(weighted/totalWeight):Math.round(entries.reduce((sum,[,value])=>sum+value,0)/entries.length);
    return {
      overall,
      skills:mastery,
      weakSkills:entries.filter(([,value])=>value<70).map(([skill])=>skill),
      strongSkills:entries.filter(([,value])=>value>=85).map(([skill])=>skill)
    };
  }

  function recommendStageAdjustment({currentRoute='core',stagePercent=0,attempts=1,hintCount=0}={}){
    const route=ROUTES.includes(currentRoute)?currentRoute:'core';
    const score=clamp(stagePercent);
    const attemptsCount=Math.max(1,Number(attempts)||1);
    const hints=Math.max(0,Number(hintCount)||0);
    if(score<55||attemptsCount>=3||hints>=3){
      return {route:'support',changed:route!=='support',reason:'Stage performance shows that more scaffolding is needed.'};
    }
    if(score>=90&&attemptsCount===1&&hints===0){
      return {route:'advanced',changed:route!=='advanced',reason:'Stage was completed accurately without support; increase transfer and independence.'};
    }
    return {route:'core',changed:route!=='core',reason:'Keep the expected lesson route for this stage.'};
  }

  function vocabularyStatus(words=[],evidence={}){
    return (Array.isArray(words)?words:[]).map(entry=>{
      const id=text(entry.id||entry.word);
      const score=clamp(evidence[id]?.score??evidence[id]??0);
      return {
        ...entry,
        id,
        score,
        status:score>=85?'mastered':score>=65?'learning':'needs_review'
      };
    });
  }

  function nextStepDecision({mastery={},requiredThreshold=75,criticalSkills=['speaking','grammar'],vocabulary=[]}={}){
    const result=calculateMastery(mastery);
    const threshold=clamp(requiredThreshold);
    const weakCritical=(criticalSkills||[]).filter(skill=>result.skills[skill]!==undefined&&result.skills[skill]<threshold);
    const weakWords=(vocabulary||[]).filter(word=>word.status==='needs_review'||word.score<threshold);
    const canAdvance=result.overall!==null&&result.overall>=threshold&&weakCritical.length===0;
    return {
      canAdvance,
      overall:result.overall,
      weakCritical,
      weakSkills:result.weakSkills,
      reviewWordIds:weakWords.map(word=>word.id),
      action:canAdvance?'advance':'targeted_review'
    };
  }

  function buildTeacherHandoff({lesson={},student={},route='core',mastery={},vocabulary=[],notes='',nextLesson=null}={}){
    const masteryResult=calculateMastery(mastery);
    const decision=nextStepDecision({mastery,vocabulary});
    const reviewWords=(vocabulary||[]).filter(word=>decision.reviewWordIds.includes(word.id)).map(word=>word.word||word.id);
    return {
      schemaVersion:1,
      studentId:text(student.id),
      studentName:text(student.name),
      lessonKey:text(lesson.key||lesson.id),
      lessonTitle:text(lesson.title||lesson.lessonNumber||lesson.topicName),
      route:ROUTES.includes(route)?route:'core',
      routeLabel:routeLabel(route),
      mastery:masteryResult,
      decision,
      reviewWords,
      teacherNotes:text(notes),
      nextLessonKey:text(nextLesson?.key||nextLesson?.id),
      summary:[
        masteryResult.overall===null?'Mastery not scored.':`Overall mastery ${masteryResult.overall}%.`,
        decision.weakSkills.length?`Review skills: ${decision.weakSkills.join(', ')}.`:'No skill below 70%.',
        reviewWords.length?`Review vocabulary: ${reviewWords.join(', ')}.`:'No vocabulary marked for review.',
        decision.canAdvance?'Proceed to the next lesson.':'Start the next session with targeted review.'
      ].join(' ')
    };
  }

  function validateBlueprint(blueprint={}){
    const errors=[];
    const warnings=[];
    if(!text(blueprint.id)) errors.push('Lesson id is required.');
    if(!text(blueprint.title)) errors.push('Lesson title is required.');
    if(!text(blueprint.goal)) errors.push('Lesson goal is required.');
    if(!Array.isArray(blueprint.vocabulary)||blueprint.vocabulary.length<5) warnings.push('Use at least 5 lesson-specific vocabulary items.');
    if(!Array.isArray(blueprint.stages)||blueprint.stages.length<3) errors.push('Adaptive lesson requires at least 3 stages.');
    (blueprint.stages||[]).forEach((stage,index)=>{
      if(!text(stage.id)) errors.push(`Stage ${index+1} id is required.`);
      if(!text(stage.title)) errors.push(`Stage ${index+1} title is required.`);
      const routes=stage.routes||{};
      ROUTES.forEach(route=>{
        if(!routes[route]) errors.push(`Stage ${index+1} is missing route ${route}.`);
      });
    });
    return {ok:errors.length===0,errors,warnings};
  }

  return {
    ROUTES,
    SKILLS,
    routeLabel,
    scoreDiagnostic,
    recommendRoute,
    normalizeMastery,
    calculateMastery,
    recommendStageAdjustment,
    vocabularyStatus,
    nextStepDecision,
    buildTeacherHandoff,
    validateBlueprint
  };
});
