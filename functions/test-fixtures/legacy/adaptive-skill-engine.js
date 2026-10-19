(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KeeleSeppAdaptiveSkillEngine=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const ROUTES=['support','core','advanced'];
  const ROUTE_RANK={support:0,core:1,advanced:2};
  const JUDGEMENTS=['needs_help','managed','too_easy'];
  const JUDGEMENT_ALIASES={help:'needs_help',ok:'managed',easy:'too_easy'};

  const text=(value,max=120)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);
  const unique=values=>Array.from(new Set((Array.isArray(values)?values:[]).map(value=>text(value)).filter(Boolean)));

  function normalizeRoute(value,fallback='core'){
    return ROUTES.includes(value)?value:(ROUTES.includes(fallback)?fallback:'core');
  }

  function normalizeJudgement(value){
    const normalized=JUDGEMENT_ALIASES[value]||value;
    return JUDGEMENTS.includes(normalized)?normalized:null;
  }

  function normalizeRouteBySkill(input={}){
    const output={};
    Object.entries(input&&typeof input==='object'?input:{}).forEach(([skillId,route])=>{
      const id=text(skillId);
      if(id&&ROUTES.includes(route)) output[id]=route;
    });
    return output;
  }

  function transitionRoute(currentRoute='core',judgement='managed'){
    const route=normalizeRoute(currentRoute);
    const signal=normalizeJudgement(judgement);
    if(!signal) throw new Error('Invalid adaptive judgement');
    if(signal==='managed') return route;
    if(signal==='needs_help') return route==='advanced'?'core':'support';
    return route==='support'?'core':'advanced';
  }

  function routeForSkills({routeBySkill={},skillIds=[],fallback='core'}={}){
    const routes=normalizeRouteBySkill(routeBySkill);
    const safeFallback=normalizeRoute(fallback);
    const ids=unique(skillIds);
    if(!ids.length) return safeFallback;
    return ids
      .map(id=>normalizeRoute(routes[id],safeFallback))
      .sort((left,right)=>ROUTE_RANK[left]-ROUTE_RANK[right])[0];
  }

  function applyJudgement({routeBySkill={},skillIds=[],judgement='managed',fallback='core'}={}){
    const ids=unique(skillIds);
    const before=normalizeRouteBySkill(routeBySkill);
    const safeFallback=normalizeRoute(fallback);
    const signal=normalizeJudgement(judgement);
    if(!signal) throw new Error('Invalid adaptive judgement');
    const after={...before};
    const nextBySkill={};
    const changedSkillIds=[];

    ids.forEach(skillId=>{
      const current=normalizeRoute(before[skillId],safeFallback);
      const next=transitionRoute(current,signal);
      after[skillId]=next;
      nextBySkill[skillId]=next;
      if(next!==current) changedSkillIds.push(skillId);
    });

    return {
      judgement:signal,
      skillIds:ids,
      routeBySkill:after,
      nextBySkill,
      changedSkillIds,
      effectiveBefore:routeForSkills({routeBySkill:before,skillIds:ids,fallback:safeFallback}),
      effectiveAfter:routeForSkills({routeBySkill:after,skillIds:ids,fallback:safeFallback})
    };
  }

  function applyRoutePatch(routeBySkill={},patch={},allowedSkillIds=null){
    const output=normalizeRouteBySkill(routeBySkill);
    const allowed=allowedSkillIds===null?null:new Set(unique(allowedSkillIds));
    Object.entries(patch&&typeof patch==='object'?patch:{}).forEach(([skillId,route])=>{
      const id=text(skillId);
      if(!id||!ROUTES.includes(route)) return;
      if(allowed&&!allowed.has(id)) return;
      output[id]=route;
    });
    return output;
  }

  function routeLabel(route){
    return ({support:'Toega',core:'Standard',advanced:'Edasijõudnu'})[normalizeRoute(route)]||'Standard';
  }

  return {
    ROUTES,
    ROUTE_RANK,
    JUDGEMENTS,
    normalizeRoute,
    normalizeJudgement,
    normalizeRouteBySkill,
    transitionRoute,
    routeForSkills,
    applyJudgement,
    applyRoutePatch,
    routeLabel
  };
});
