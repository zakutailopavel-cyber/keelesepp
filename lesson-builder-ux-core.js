(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./lesson-authoring-core'):root.KeeleSeppLessonAuthoring,typeof module==='object'&&module.exports?require('./lesson-block-templates'):root.KeeleSeppBlockTemplates);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.KeeleSeppBuilderUX=api;})(typeof window!=='undefined'?window:globalThis,function(core,templates){
  const copy=x=>JSON.parse(JSON.stringify(x));
  const SKILLS={vocabulary:'Sõnavara',grammar:'Grammatika',speaking:'Rääkimine',reading:'Lugemine',listening:'Kuulamine',writing:'Kirjutamine'};
  function prepare(input){
    const d=copy(input);d.authoring=d.authoring||{};
    d.authoring.lesson={cefr:'B1',minutes:d.context?.durationMinutes||60,goal:'',topic:'',tags:'',notes:'',skills:[],successCriteria:'',...d.authoring.lesson};
    d.authoring.activities=d.authoring.activities||{};
    d.authoring.phases=d.authoring.phases||copy(d.context?.phases||[]).map(p=>({id:p.id,title:p.title}));
    for(const a of d.activities){if(!d.authoring.activities[a.id]){const phase=d.context?.phases?.find(p=>p.id===a.phaseId);d.authoring.activities[a.id]={minutes:Math.round((a.phaseId==='diagnostic'?d.context?.diagnosticDurationMinutes:phase?.minutes||5)/(d.activities.filter(b=>b.phaseId===a.phaseId).length||1)),layout:'native',reference:!!d.context};}}
    return d;
  }
  const meta=(d,id)=>d.authoring?.activities?.[id]||{};
  function block(templateId,id){
    const t=templates.BLOCKS.find(t=>t.id===templateId);if(!t)throw Error('Tundmatu plokk.');
    return {activity:{schemaVersion:1,id,title:t.title,phaseId:t.phase,skillIds:[t.skill],workspaceType:t.type,routes:Object.fromEntries(core.ROUTES.map(r=>[r,{prompt:t.prompt+(r==='support'?'\nVõid kasutada märksõnu ja üht näidet.':r==='advanced'?'\nLisa põhjendus ja üks uus näide.':''),expected:t.expected,teacherInstruction:t.teacherInstruction,workspaceType:t.type}]))},metadata:{minutes:t.minutes,layout:t.layout,templateId:t.id,reference:false}};
  }
  function insert(input,templateId,id,afterId){const d=prepare(input),b=block(templateId,id);if(d.activities.some(a=>a.id===id))throw Error('ID on juba kasutusel.');const i=d.activities.findIndex(a=>a.id===afterId);d.activities.splice(i<0?d.activities.length:i+1,0,b.activity);d.authoring.activities[id]=b.metadata;return d;}
  function lessonTemplate(templateId,draftId,allocate){
    const t=templates.LESSONS.find(t=>t.id===templateId);if(!t)throw Error('Tundmatu tunnimall.');
    let d=prepare(core.createDraft(draftId));d.title=t.title;d.authoring.lesson.minutes=t.minutes;
    for(const b of t.blocks)d=insert(d,b,allocate());
    const raw=d.activities.map(a=>meta(d,a.id).minutes),total=raw.reduce((a,b)=>a+b,0);let used=0;
    d.activities.forEach((a,i)=>{const m=i===raw.length-1?t.minutes-used:Math.round(raw[i]/total*t.minutes);d.authoring.activities[a.id].minutes=m;used+=m;});
    d.authoring.lesson.skills=[...new Set(d.activities.flatMap(a=>a.skillIds))];return d;
  }
  function reorder(input,id,beforeId,phaseId){
    const d=prepare(input),i=d.activities.findIndex(a=>a.id===id);if(i<0||id===beforeId)return d;
    const [a]=d.activities.splice(i,1);if(phaseId)a.phaseId=phaseId;
    const n=d.activities.findIndex(b=>b.id===beforeId);d.activities.splice(n<0?d.activities.length:n,0,a);return d;
  }
  function move(input,id,delta){const i=input.activities.findIndex(a=>a.id===id),target=i+delta;if(i<0||target<0||target>=input.activities.length||![-1,1].includes(delta))return copy(input);return reorder(input,id,input.activities[target+(delta>0?1:0)]?.id,input.activities[target].phaseId);}
  function duplicate(input,id,newId){const d=prepare(input),i=d.activities.findIndex(a=>a.id===id);if(i<0)throw Error('Vali tegevus.');if(d.activities.some(a=>a.id===newId))throw Error('ID on juba kasutusel.');const a=copy(d.activities[i]);a.id=newId;a.title+=' · koopia';d.activities.splice(i+1,0,a);d.authoring.activities[newId]={...copy(meta(d,id)),reference:false};return d;}
  function remove(input,id){const d=prepare(input);d.activities=d.activities.filter(a=>a.id!==id);delete d.authoring.activities[id];return d;}
  function paste(input,clipboard,newId,afterId){const d=prepare(input);if(d.activities.some(a=>a.id===newId))throw Error('ID on juba kasutusel.');const a=copy(clipboard.activity);a.id=newId;const i=d.activities.findIndex(a=>a.id===afterId);d.activities.splice(i<0?d.activities.length:i+1,0,a);d.authoring.activities[newId]={...copy(clipboard.metadata),reference:false};return d;}
  function reset(input,id){const d=prepare(input),m=meta(d,id),i=d.activities.findIndex(a=>a.id===id);if(!m.templateId)throw Error('Sellel plokil pole algmalli.');const b=block(m.templateId,id);d.activities[i]=b.activity;d.authoring.activities[id]=b.metadata;return d;}
  function adapt(input,id,route){const d=prepare(input),a=d.activities.find(a=>a.id===id);if(!a)return d;const standard=copy(a.routes.core);if(route==='all'){a.routes.support=copy(standard);a.routes.advanced=copy(standard);}else a.routes[route]={...standard,prompt:standard.prompt+(route==='support'?'\nKasuta märksõnu. Alusta ühest näitest.':'\nPõhjenda oma vastust ja too uus näide.')};return d;}
  function phaseName(d,id){return d.authoring?.phases?.find(p=>p.id===id)?.title||templates.PHASES.find(p=>p[0]===id)?.[1]||d.context?.phases?.find(p=>p.id===id)?.title||id;}
  function validate(d){
    const errors=[],warnings=[],tips=[],add=(target,message,activityId='',field='')=>target.push({message,activityId,field});
    const schema=core.validate(d);
    if(!d.title?.trim())add(errors,'Lisa tunni pealkiri.','','title');
    if(!d.activities?.length)add(errors,'Lisa vähemalt üks plokk.');
    for(const a of d.activities||[]){
      if(!a.title?.trim())add(errors,'Lisa ülesande nimi.',a.id,'title');
      if(a.title?.length>180)add(errors,'Pealkiri võib olla kuni 180 märki.',a.id,'title');
      const minutes=meta(d,a.id).minutes;if(minutes!==undefined&&(!Number.isFinite(minutes)||minutes<0||minutes>240))add(errors,'Sisesta kestus 0–240 minutit.',a.id,'minutes');
      if(!a.skillIds?.length)add(errors,'Vali vähemalt üks oskus.',a.id,'skillIds');
      for(const r of core.ROUTES){if(!a.routes?.[r]?.prompt?.trim())add(errors,'Lisa õpilasele ülesanne.',a.id,'prompt-'+r);for(const [field,max] of [['prompt',3000],['expected',3000],['teacherInstruction',4000]])if(a.routes?.[r]?.[field]?.length>max)add(errors,`Tekst võib olla kuni ${max} märki.`,a.id,field+'-'+r);}
      if(a.routes?.support?.prompt===a.routes?.advanced?.prompt)add(warnings,'Toe ja väljakutse tekstid on samad.',a.id);
      if(!a.routes?.core?.teacherInstruction?.trim())add(warnings,'Õpetaja juhis on täitmata.',a.id);
    }
    if(!schema.ok&&!errors.length)add(errors,'Mustandi vorming või välja pikkus ei sobi. Kontrolli välju ja imporditud faili.');
    // Heuristics never mutate the lesson or become curriculum mastery.
    const activities=d.activities||[],settings=d.authoring?.lesson||{};
    if(!activities.some(a=>a.workspaceType==='assessment'))add(warnings,'Lisa tunni lõppu kontroll või refleksioon.');
    if(activities.length>20)add(warnings,'Üle 20 ploki võib muuta tunni liiga tihedaks.');
    if(settings.minutes>120)add(warnings,'Tund on pikem kui kaks tundi; planeeri paus.');
    const sum=activities.reduce((n,a)=>n+(meta(d,a.id).minutes||0),0);
    if(settings.minutes&&Math.abs(sum-settings.minutes)>Math.max(5,settings.minutes*.2))add(warnings,`Plokkide kestus ${sum} min erineb tunni ${settings.minutes} minutist.`);
    for(const skill of settings.skills||[])if(!activities.some(a=>a.skillIds.includes(skill)))add(warnings,`${SKILLS[skill]} on tunni eesmärkides, kuid vastav plokk puudub.`);
    const firstCheck=activities.findIndex(a=>a.workspaceType==='assessment');if(firstCheck>=0&&firstCheck<activities.length/2)add(warnings,'Kontroll on tunni esimeses pooles. Veendu, et see on taotluslik.');
    const titles=new Set();for(const a of activities){if(titles.has(a.title?.trim()))add(warnings,'Sama pealkiri esineb mitu korda.',a.id);titles.add(a.title?.trim());}
    if(!settings.goal?.trim())add(tips,'Sõnasta tunni eesmärk.');
    const checks=[{label:'Tunni pealkiri',ok:!!d.title?.trim()},{label:`${activities.length} ülesannet`,ok:!!activities.length},{label:'Kõik ülesanded sobivas vormis',ok:schema.ok},{label:'Lõppkontroll või refleksioon',ok:activities.some(a=>a.workspaceType==='assessment')},{label:'Tunni eesmärk',ok:!!settings.goal?.trim()},{label:'Õpetaja juhised',ok:!!activities.length&&activities.every(a=>!!a.routes?.core?.teacherInstruction?.trim())}];
    return {ok:schema.ok&&errors.length===0,errors,warnings,tips,checks,health:Math.round(checks.filter(c=>c.ok).length/checks.length*100),minutes:sum};
  }
  function history(initial,limit=50){let current=copy(initial),past=[],future=[],lastKey='',lastTime=0;return {get:()=>copy(current),get canUndo(){return !!past.length;},get canRedo(){return !!future.length;},commit(next,key='',time=Date.now()){if(JSON.stringify(next)===JSON.stringify(current))return false;if(!key||key!==lastKey||time-lastTime>700){past.push(copy(current));if(past.length>limit)past.shift();}current=copy(next);future=[];lastKey=key;lastTime=time;return true;},undo(){if(past.length){future.push(current);current=past.pop();lastKey='';}return copy(current);},redo(){if(future.length){past.push(current);current=future.pop();lastKey='';}return copy(current);}};}
  function autosave({storage,key,onStatus=()=>{},delay=700,schedule=setTimeout,cancel=clearTimeout}){let timer=null,pending=null,saved='';return {restore(){const raw=storage.getItem(key);if(!raw)return null;const d=prepare(core.parse(raw));saved=JSON.stringify(d);return d;},queue(d){pending=copy(d);cancel(timer);onStatus(JSON.stringify(d)===saved?'saved':'dirty');if(JSON.stringify(d)!==saved)timer=schedule(()=>this.flush(),delay);},flush(){cancel(timer);if(!pending)return true;if(!validate(pending).ok){onStatus('dirty');return false;}try{onStatus('saving');storage.setItem(key,core.serialize(pending));saved=JSON.stringify(pending);onStatus('saved');return true;}catch(e){onStatus('error',e.message);return false;}},get dirty(){return !!pending&&JSON.stringify(pending)!==saved;},dispose(){cancel(timer);}};}
  return {copy,SKILLS,prepare,meta,block,insert,lessonTemplate,reorder,move,duplicate,remove,paste,reset,adapt,phaseName,validate,history,autosave};
});
