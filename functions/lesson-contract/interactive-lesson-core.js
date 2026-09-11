(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.KeeleSeppInteractiveLesson=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const MODES=['short_text','long_text','single_choice','multiple_choice','gaps'];
  const ROUTES=['support','core','advanced'];
  const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
  const reserved=x=>['__proto__','constructor','prototype'].includes(x);
  const validId=x=>!reserved(x)&&typeof x==='string'&&/^[a-zA-Z0-9_-]{1,140}$/.test(x);
  const text=(x,max)=>typeof x==='string'&&x.trim().length>0&&x.length<=max;
  const fail=message=>{throw new Error(message);};
  function assetSpec(activity){
    if(activity?.assets===undefined)return [];
    if(!Array.isArray(activity.assets)||activity.assets.length>5)fail('Invalid lesson assets');
    const seen=new Set();
    return activity.assets.map(asset=>{
      if(!object(asset)||Object.keys(asset).some(k=>!['id','type','url','alt','caption'].includes(k))||!validId(asset.id)||seen.has(asset.id)||asset.type!=='image'||!text(asset.url,2000)||!/^https:\/\/[^\s]+$/i.test(asset.url)||!text(asset.alt,300)||asset.caption!==undefined&&(typeof asset.caption!=='string'||asset.caption.length>500))fail('Invalid lesson asset');
      seen.add(asset.id);return{id:asset.id,type:'image',url:asset.url,alt:asset.alt,...(asset.caption!==undefined?{caption:asset.caption}:{})};
    });
  }
  function responseSpec(activity){
    const spec=activity?.evaluation?.response;
    if(spec===undefined){
      const gapCount=Math.max(0,...ROUTES.map(route=>(String(activity?.routes?.[route]?.prompt||'').match(/_{3,}/g)||[]).length));
      return gapCount?{schemaVersion:1,mode:'gaps',required:true,items:Array.from({length:gapCount},(_,index)=>({id:'legacy-gap-'+(index+1),label:'Lünk '+(index+1)}))}:null;
    }
    if(!object(spec)||spec.schemaVersion!==1||!MODES.includes(spec.mode))fail('Invalid response type');
    if(activity.responseMode!==spec.mode)fail('Response mode mismatch');
    const allowed=['schemaVersion','mode','required','items'];
    if(Object.keys(spec).some(k=>!allowed.includes(k)))fail('Unknown response configuration');
    if(typeof spec.required!=='boolean')fail('Response required must be boolean');
    const result={schemaVersion:1,mode:spec.mode,required:spec.required};
    if(['single_choice','multiple_choice','gaps'].includes(spec.mode)){
      const min=spec.mode==='gaps'?1:2;
      if(!Array.isArray(spec.items)||spec.items.length<min||spec.items.length>20)fail('Provide '+min+'–20 answer fields');
      const seen=new Set();result.items=spec.items.map(item=>{
        if(!object(item)||!validId(item.id)||seen.has(item.id)||!text(item.label,300)||Object.keys(item).some(k=>!['id','label'].includes(k)))fail('Invalid or duplicate answer field');
        seen.add(item.id);return{id:item.id,label:item.label};
      });
    }else if(spec.items!==undefined)fail('Text answer cannot have choices');
    return result;
  }
  function project(lesson,route='core'){
    if(!ROUTES.includes(route))fail('Invalid route');
    if(!lesson||!Array.isArray(lesson.activities))fail('Invalid lesson');
    const seen=new Set();
    return{title:lesson.title,activities:lesson.activities.map(a=>{
      if(typeof a.id!=='string'||reserved(a.id)||seen.has(a.id))fail('Duplicate activity ID');seen.add(a.id);
      const v=a.routes?.[route];if(!v||typeof v.prompt!=='string')fail('Missing prompt');
      // Deliberate allowlist: never copy evaluation, expected, teacherInstruction or context.
      return{id:a.id,title:a.title,phaseId:a.phaseId,skillIds:[...a.skillIds],prompt:v.prompt,assets:assetSpec(a),response:responseSpec(a)};
    })};
  }
  function validateAnswers(lesson,answers,{submit=false,route='core'}={}){
    const activities=project(lesson,route).activities;
    if(!object(answers))fail('Answers must be an object');
    const ids=new Set(activities.filter(a=>a.response).map(a=>a.id));
    if(Object.keys(answers).some(id=>!ids.has(id)))fail('Unknown answer activity');
    const result={};
    for(const a of activities){
      const s=a.response;if(!s)continue;const value=answers[a.id];
      if(value===undefined){if(submit&&s.required)fail('Answer required: '+a.title);continue;}
      let complete=false;
      if(s.mode==='short_text'||s.mode==='long_text'){
        if(typeof value!=='string'||value.length>(s.mode==='short_text'?500:10000))fail('Answer text too long or invalid');
        result[a.id]=value;complete=Boolean(value.trim());
      }else if(s.mode==='single_choice'){
        if(typeof value!=='string'||(value!==''&&!s.items.some(i=>i.id===value)))fail('Unknown choice');
        result[a.id]=value;complete=value!=='';
      }else if(s.mode==='multiple_choice'){
        if(!Array.isArray(value)||value.length>s.items.length||new Set(value).size!==value.length||value.some(v=>!s.items.some(i=>i.id===v)))fail('Invalid selected choices');
        result[a.id]=[...value];complete=value.length>0;
      }else{
        if(!object(value)||Object.keys(value).some(k=>!s.items.some(i=>i.id===k))||Object.values(value).some(v=>typeof v!=='string'||v.length>500))fail('Invalid gap answers');
        result[a.id]={...value};complete=s.items.every(i=>Boolean(value[i.id]?.trim()));
      }
      if(submit&&s.required&&!complete)fail('Answer required: '+a.title);
    }
    if(JSON.stringify(result).length>100000)fail('Answers too large');
    return result;
  }
  function studentOwns(uid,studentId,student){
    return Boolean(uid&&(uid===studentId||student.linkedUserId===uid||student.studentUid===uid||(Array.isArray(student.linkedUserIds)&&student.linkedUserIds.includes(uid))));
  }
  return{MODES,responseSpec,assetSpec,project,validateAnswers,studentOwns};
});
