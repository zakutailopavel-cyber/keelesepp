(function(root,factory){
  const contract=typeof module==='object'&&module.exports?require('./activity-contract-core'):root.KeeleSeppActivityContract;
  const api=factory(contract);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.KeeleSeppLessonAuthoring=api;
})(typeof window!=='undefined'?window:globalThis,function(contract){
  const copy=x=>JSON.parse(JSON.stringify(x));
  const ROUTES=contract.ROUTES;
  const TYPES=contract.WORKSPACE_TYPES.filter(t=>t!=='summary');
  const SKILLS=['vocabulary','grammar','speaking','reading','listening','writing'];
  const MAX_BYTES=1000000;
  const validMinutes=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=240;
  function validate(draft){
    const errors=[];
    if(!draft||draft.schemaVersion!==1||draft.kind!=='keelesepp-lesson-draft')return {ok:false,errors:['Tund: tundmatu mustandi vorming.']};
    if(typeof draft.id!=='string'||!/^draft-[a-zA-Z0-9_-]+$/.test(draft.id))errors.push('Tund: vigane mustandi ID.');
    if(typeof draft.title!=='string'||!draft.title.trim()||draft.title.length>180)errors.push('Tund: lisa pealkiri (kuni 180 märki).');
    const result=contract.validateActivities(draft.activities);errors.push(...result.errors);
    if(!Array.isArray(draft.activities)||!draft.activities.length||draft.activities.length>100)errors.push('Tund peab sisaldama 1–100 tegevust.');
    for(const [index,a] of (Array.isArray(draft.activities)?draft.activities:[]).entries()){
      if(!a||typeof a!=='object')continue;
      const label=`Tegevus ${index+1}`;
      if(typeof a.title!=='string'||!a.title.trim()||a.title.length>180)errors.push(`${label}: lisa pealkiri (kuni 180 märki).`);
      if(!TYPES.includes(a.workspaceType))errors.push(`${label}: vali toetatud tööruum.`);
      if(!Array.isArray(a.skillIds)||!a.skillIds.length||a.skillIds.some(id=>!SKILLS.includes(id)))errors.push(`${label}: vali vähemalt üks toetatud oskus.`);
      if((a.phaseId==='diagnostic')!==(a.workspaceType==='diagnostic'))errors.push(`${label}: diagnostika tööruumi etapp peab olema diagnostic.`);
      for(const r of ROUTES){const v=a.routes?.[r];if(!v)continue;
        if(typeof v.prompt!=='string'||!v.prompt.trim()||v.prompt.length>3000)errors.push(`${label} / ${r}: lisa ülesanne (kuni 3000 märki).`);
        if(v.workspaceType!==a.workspaceType)errors.push(`${label} / ${r}: tööruum peab vastama tegevusele.`);
        if(typeof v.expected==='string'&&v.expected.length>3000)errors.push(`${label} / ${r}: kontrollvastus on liiga pikk.`);
        if(typeof v.teacherInstruction==='string'&&v.teacherInstruction.length>4000)errors.push(`${label} / ${r}: õpetaja juhis on liiga pikk.`);
      }
    }
    const context=draft.context;
    if(context!==undefined){
      if(!context||typeof context!=='object'||Array.isArray(context))errors.push('Tunni taustandmed on vigased.');
      else{
        if(context.durationMinutes!==undefined&&!validMinutes(context.durationMinutes))errors.push('Tunni kestus on vigane.');
        if(context.diagnosticDurationMinutes!==undefined&&!validMinutes(context.diagnosticDurationMinutes))errors.push('Diagnostika kestus on vigane.');
        for(const key of ['vocabulary','languageFocus','successCriteria','phases'])if(context[key]!==undefined&&!Array.isArray(context[key]))errors.push(`Taustandmed: ${key} peab olema loend.`);
        for(const w of Array.isArray(context.vocabulary)?context.vocabulary:[])if(!w||['id','word','translation','example'].some(k=>typeof w[k]!=='string'))errors.push('Sõnavarakaart on vigane.');
        for(const f of Array.isArray(context.languageFocus)?context.languageFocus:[])if(!f||typeof f.id!=='string'||typeof f.label!=='string'||!Array.isArray(f.patterns)||f.patterns.some(x=>typeof x!=='string'))errors.push('Lausemall on vigane.');
        if(Array.isArray(context.successCriteria)&&context.successCriteria.some(x=>typeof x!=='string'))errors.push('Hindamiskriteeriumid on vigased.');
        for(const p of Array.isArray(context.phases)?context.phases:[])if(!p||typeof p.id!=='string'||typeof p.title!=='string'||(p.minutes!==undefined&&!validMinutes(p.minutes))||(p.successCriteria!==undefined&&(!Array.isArray(p.successCriteria)||p.successCriteria.some(x=>typeof x!=='string'))))errors.push('Etapi taustandmed on vigased.');
      }
    }
    try{if(JSON.stringify(draft).length>MAX_BYTES)errors.push('Mustand on liiga suur.');}catch{errors.push('Mustand peab olema JSON.');}
    return {ok:!errors.length,errors};
  }
  function checked(draft){const result=validate(draft);if(!result.ok)throw new Error(result.errors.join('\n'));return copy(draft);}
  function createDraft(id){return {schemaVersion:1,kind:'keelesepp-lesson-draft',id,title:'Uus tund',activities:[]};}
  function fromLesson(lesson,id){
    return {schemaVersion:1,kind:'keelesepp-lesson-draft',id,title:lesson.title,
      // Context is copied only for nonpersistent rendering, never published as the source lesson.
      context:{durationMinutes:lesson.durationMinutes||0,diagnosticDurationMinutes:lesson.diagnostic?.durationMinutes||0,phases:lesson.stages.map(s=>({id:s.id,title:s.title,minutes:s.minutes||0,...(s.successCriteria?{successCriteria:copy(s.successCriteria)}:{})})),vocabulary:copy(lesson.vocabulary||[]),languageFocus:copy(lesson.languageFocus||[]),successCriteria:copy(lesson.successCriteria||[])},
      activities:contract.normalizeLesson(lesson).map(a=>{const item=copy(a);delete item.source;return item;})};
  }
  function addActivity(draft,id){
    if(draft.activities.some(a=>a.id===id))throw new Error('Tegevuse ID on juba kasutusel.');
    const next=copy(draft);next.activities.push({schemaVersion:1,id,title:'Uus tegevus',phaseId:'practice',skillIds:['vocabulary'],workspaceType:'controlled_practice',routes:Object.fromEntries(ROUTES.map(r=>[r,{prompt:'',expected:'',teacherInstruction:'',workspaceType:'controlled_practice'}]))});return next;
  }
  function updateActivity(draft,id,patch){
    if('id' in patch||'schemaVersion' in patch)throw new Error('Tegevuse ID on muutumatu.');
    const next=copy(draft),item=next.activities.find(a=>a.id===id);if(!item)throw new Error('Tegevust ei leitud.');
    for(const key of ['title','phaseId','skillIds','workspaceType','routes'])if(key in patch)item[key]=copy(patch[key]);
    if(patch.workspaceType)for(const r of ROUTES)item.routes[r].workspaceType=patch.workspaceType;
    return next;
  }
  function moveActivity(draft,id,delta){
    const next=copy(draft),index=next.activities.findIndex(a=>a.id===id),target=index+delta;
    if(![-1,1].includes(delta)||index<0||target<0||target>=next.activities.length)return next;
    // Imported legacy strings are normalized and pinned before becoming an editable draft.
    if(!next.activities.every(a=>typeof a.id==='string'&&a.id))throw new Error('Järjestamine vajab püsivaid ID-sid.');
    [next.activities[index],next.activities[target]]=[next.activities[target],next.activities[index]];return next;
  }
  function serialize(draft){return JSON.stringify(checked(draft),null,2);}
  function parse(raw){if(typeof raw!=='string'||raw.length>MAX_BYTES)throw new Error('Fail on liiga suur.');return checked(JSON.parse(raw));}
  function previewLesson(draft){
    const value=checked(draft),activities=value.activities,phases=[...new Set(activities.filter(a=>a.phaseId!=='diagnostic').map(a=>a.phaseId))];
    const context=value.context||{};
    return {id:'authoring-preview-'+value.id,title:value.title,durationMinutes:context.durationMinutes||0,category:'Mustandi eelvaade',
      diagnostic:{durationMinutes:context.diagnosticDurationMinutes||0,items:activities.filter(a=>a.phaseId==='diagnostic').map(a=>({id:a.id,skillIds:a.skillIds}))},
      stages:phases.map(id=>{const p=(context.phases||[]).find(p=>p.id===id);return {id,title:p?.title||id,minutes:p?.minutes||0,...(p?.successCriteria?{successCriteria:copy(p.successCriteria)}:{})};}),vocabulary:Array.isArray(context.vocabulary)?copy(context.vocabulary):[],languageFocus:Array.isArray(context.languageFocus)?copy(context.languageFocus):[],successCriteria:Array.isArray(context.successCriteria)?copy(context.successCriteria):[],
      authoringActivities:activities.map(a=>({...a,source:{kind:a.phaseId==='diagnostic'?'diagnostic':'stage',stage:a.phaseId==='diagnostic'?0:phases.indexOf(a.phaseId)+1,taskIndex:activities.filter(b=>b.phaseId===a.phaseId).findIndex(b=>b.id===a.id)}}))};
  }
  return {ROUTES,TYPES,SKILLS,MAX_BYTES,validate,createDraft,fromLesson,addActivity,updateActivity,moveActivity,serialize,parse,previewLesson};
});
