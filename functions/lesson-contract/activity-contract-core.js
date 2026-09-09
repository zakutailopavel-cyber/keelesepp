(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KeeleSeppActivityContract=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const ROUTES=['support','core','advanced'];
  const WORKSPACE_TYPES=['diagnostic','vocabulary','controlled_practice','scene','roleplay','transfer','assessment','summary'];
  const OPTIONAL=['responseMode','assets','progression','collaboration','evaluation'];
  const list=value=>Array.isArray(value)?value:[];
  const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
  const idValid=value=>typeof value==='string'&&value.length>0&&value.length<=140&&value===value.trim()&&!/\s/.test(value);
  const copy=value=>JSON.parse(JSON.stringify(value));
  function validateAssets(value,path,errors){
    if(value===undefined)return;
    if(!Array.isArray(value)){errors.push(`${path}.assets must be an array`);return;}
    if(value.length>5)errors.push(`${path}.assets may contain at most 5 items`);
    const ids=new Set();
    value.forEach((asset,index)=>{
      const itemPath=`${path}.assets[${index}]`;
      if(!object(asset)){errors.push(`${itemPath} must be an object`);return;}
      if(Object.keys(asset).some(key=>!['id','type','url','alt','caption'].includes(key)))errors.push(`${itemPath} contains unknown fields`);
      if(!idValid(asset.id)||ids.has(asset.id))errors.push(`${itemPath}.id is invalid or duplicated`);
      ids.add(asset.id);
      if(asset.type!=='image')errors.push(`${itemPath}.type must be image`);
      if(typeof asset.url!=='string'||asset.url.length>2000||!/^https:\/\/[^\s]+$/i.test(asset.url))errors.push(`${itemPath}.url must be a valid HTTPS URL`);
      if(typeof asset.alt!=='string'||!asset.alt.trim()||asset.alt.length>300)errors.push(`${itemPath}.alt must contain 1–300 characters`);
      if(asset.caption!==undefined&&(typeof asset.caption!=='string'||asset.caption.length>500))errors.push(`${itemPath}.caption must contain at most 500 characters`);
    });
  }
  function metadata(source){
    const result={};
    OPTIONAL.forEach(key=>{if(source?.[key]!==undefined) result[key]=copy(source[key]);});
    return result;
  }
  function inferType(stage,index){
    if(/vocab/i.test(stage.id)) return 'vocabulary';
    if(/language|grammar|practice/i.test(stage.id)) return 'controlled_practice';
    if(/speaking|role/i.test(stage.id)) return index===1?'transfer':'roleplay';
    if(/exit|assessment|check/i.test(stage.id)) return 'assessment';
    return 'scene';
  }
  function typeFor(stage,variant,task,index,coreIndex=index){
    const candidate=task?.workspaceType||variant?.taskWorkspaceTypes?.[index]||stage.taskWorkspaceTypes?.[coreIndex]||variant?.workspaceType||stage.workspaceType;
    if(object(task)&&candidate!==undefined) return candidate;
    return WORKSPACE_TYPES.includes(candidate)?candidate:inferType(stage,coreIndex);
  }
  function validateActivities(activities){
    const errors=[],ids=new Set();
    if(!Array.isArray(activities)) return {ok:false,errors:['activities must be an array']};
    function checkMeta(value,path){
      if(value.responseMode!==undefined&&(typeof value.responseMode!=='string'||!value.responseMode.trim())) errors.push(`${path}.responseMode must be a nonempty string`);
      validateAssets(value.assets,path,errors);
      for(const key of ['progression','collaboration','evaluation']) if(value[key]!==undefined&&!object(value[key])) errors.push(`${path}.${key} must be an object`);
    }
    activities.forEach((a,index)=>{
      const path=`activities[${index}]`;
      if(!object(a)){errors.push(`${path} must be an object`);return;}
      if(a.schemaVersion!==1) errors.push(`${path}.schemaVersion must be 1`);
      if(!idValid(a.id)||a.id==='summary'||(typeof a.id==='string'&&a.id.startsWith('summary-'))) errors.push(`${path}.id is invalid or reserved`);
      if(ids.has(a.id)) errors.push(`${path}.id is duplicated: ${a.id}`);
      ids.add(a.id);
      if(!idValid(a.phaseId)||a.phaseId.length>100) errors.push(`${path}.phaseId is invalid`);
      if(!WORKSPACE_TYPES.includes(a.workspaceType)) errors.push(`${path}.workspaceType is invalid`);
      if(!Array.isArray(a.skillIds)||a.skillIds.some(id=>!idValid(id)||id.length>120)) errors.push(`${path}.skillIds is invalid`);
      checkMeta(a,path);
      ROUTES.forEach(route=>{
        const v=a.routes?.[route];
        if(!object(v)){errors.push(`${path}.routes.${route} is required`);return;}
        if(typeof v.prompt!=='string') errors.push(`${path}.${route}.prompt must be a string`);
        if(!WORKSPACE_TYPES.includes(v.workspaceType)) errors.push(`${path}.${route}.workspaceType is invalid`);
        for(const key of ['expected','teacherInstruction']) if(typeof v[key]!=='string') errors.push(`${path}.${route}.${key} must be a string`);
        checkMeta(v,`${path}.${route}`);
      });
    });
    return {ok:errors.length===0,errors};
  }
  function normalizeLesson(lesson={}){
    const activities=[],errors=[],phaseIds=new Set();
    list(lesson.diagnostic?.items).forEach((entry,index)=>{
      const variant={prompt:entry.prompt||'',expected:entry.expected||'',teacherInstruction:lesson.diagnostic?.instruction||'',workspaceType:'diagnostic',...metadata(entry)};
      activities.push({schemaVersion:1,id:entry.id||`diagnostic-${index}`,phaseId:'diagnostic',skillIds:[...list(entry.skillIds)],workspaceType:'diagnostic',...metadata(entry),routes:Object.fromEntries(ROUTES.map(r=>[r,copy(variant)])),source:{kind:'diagnostic',stage:0,taskIndex:index},title:'Diagnostika'});
    });
    list(lesson.stages).forEach((stage,stageIndex)=>{
      if(phaseIds.has(stage.id)||stage.id==='diagnostic') errors.push(`${stage.id}: phase id is duplicated or reserved`);
      phaseIds.add(stage.id);
      if(!Array.isArray(stage.routes?.core?.tasks)) errors.push(`${stage.id}: core tasks must be an array`);
      const tasks=list(stage.routes?.core?.tasks);
      const structured=tasks.some(object);
      if(structured&&tasks.some(t=>!object(t))) errors.push(`${stage.id}: cannot mix string and object tasks`);
      ROUTES.forEach(route=>{
        const rt=list(stage.routes?.[route]?.tasks);
        if(structured&&(rt.length!==tasks.length||rt.some(t=>!object(t)||!tasks.some(c=>c.id===t.id))||new Set(rt.map(t=>t.id)).size!==rt.length)) errors.push(`${stage.id}.${route}: task ids must match core exactly`);
      });
      tasks.forEach((task,index)=>{
        const id=structured?task.id:`${stage.id}-${index}`;
        const variants={};
        ROUTES.forEach(route=>{
          const variant=stage.routes?.[route]||stage.routes?.core||stage.routes?.support||stage.routes?.advanced||{};
          const routeTasks=list(variant.tasks);
          const routeIndex=structured?routeTasks.findIndex(t=>t?.id===id):index;
          const selected=routeTasks[routeIndex]??task;
          variants[route]={
            prompt:structured?selected?.prompt:selected,
            workspaceType:typeFor(stage,variant,selected,routeIndex,index),
            expected:selected?.expected??list(variant.expectedAnswerExamples)[0]??variant.success??stage.checkpoint??'Jälgi kommunikatiivse eesmärgi täitmist.',
            teacherInstruction:selected?.teacherInstruction??variant.teacherInstruction??'Kohanda toe hulka, kuid hoia eesmärk sama.',
            ...metadata(selected)
          };
        });
        activities.push({schemaVersion:1,id,phaseId:stage.id,skillIds:stage.skill?[stage.skill]:[],workspaceType:variants.core.workspaceType,...metadata(structured?task:{}),routes:variants,source:{kind:'stage',stage:stageIndex+1,taskIndex:index},title:stage.title});
      });
    });
    const validation=validateActivities(activities);
    errors.push(...validation.errors);
    if(errors.length) throw new Error(`Invalid activity contract: ${errors.join('; ')}`);
    return activities;
  }
  function resolveResumeIndex(items,session={}){
    const index=items.findIndex(item=>item.id===session.currentActivityId);
    if(index>=0) return index;
    if(session.currentActivityId) throw new Error(`Saved activity is no longer available: ${session.currentActivityId}`);
    const legacyIndex=Number(session.currentIndex);
    return Math.max(0,Math.min(items.length-1,Number.isFinite(legacyIndex)?Math.floor(legacyIndex):0));
  }
  return {ROUTES,WORKSPACE_TYPES,normalizeLesson,validateActivities,resolveResumeIndex};
});
