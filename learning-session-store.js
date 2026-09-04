(function(root,factory){
  const dependency=(typeof module==='object'&&module.exports)?require('./learning-session-core.js'):root.KeeleSeppLearningSessionCore;
  const api=factory(dependency);
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KeeleSeppLearningSessionStore=api;
})(typeof window!=='undefined'?window:globalThis,function(core){
  const DEFAULT_API='https://us-central1-keelesepp-5136b.cloudfunctions.net/learningSessionApi';
  const clean=(value,max=240)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);
  const requestId=(prefix='learning')=>{
    const random=(globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g,'');
    return `${prefix}_${random}`.slice(0,120);
  };

  function create({auth,lesson,items=[],studentId='',apiUrl='',onStatus=()=>{}}={}){
    if(!core) throw new Error('KeeleSeppLearningSessionCore is required');
    if(!auth||!lesson) throw new Error('auth and lesson are required');

    const requestedStudentId=clean(studentId,120);
    const endpoint=clean(apiUrl||globalThis.KEELESEPP_LEARNING_SESSION_API_URL||DEFAULT_API,500);
    let mode='preview';
    let sessionData=null;
    let studentData=null;

    const status=(next,message='')=>{mode=next;onStatus({mode:next,message,sessionId:sessionData?.id||''});};
    const currentItem=index=>items[Math.max(0,Math.min(items.length-1,Number(index)||0))]||{};

    async function waitForAuth(){
      if(auth.currentUser) return auth.currentUser;
      return new Promise(resolve=>{
        let settled=false;
        const timer=setTimeout(()=>{if(!settled){settled=true;resolve(null);}},1600);
        const unsubscribe=auth.onAuthStateChanged(user=>{
          if(settled) return;
          settled=true;
          clearTimeout(timer);
          unsubscribe();
          resolve(user||null);
        });
      });
    }

    async function post(action,body={}){
      const user=auth.currentUser||await waitForAuth();
      if(!user) throw new Error('Logi CRM-i sisse, et õppimissessioon salvestada.');
      const token=await user.getIdToken();
      const response=await fetch(endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({action,...body})
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(payload.error||`Learning Session API ${response.status}`);
      if(payload.session) sessionData=payload.session;
      return payload;
    }

    function snapshot(){
      return {
        mode,
        persistent:Boolean(sessionData),
        session:sessionData?{...sessionData}:null,
        student:studentData?{...studentData}:null
      };
    }

    async function init({initialIndex=0,initialRoute='core'}={}){
      if(!requestedStudentId){
        status('preview','Lisa URL-i studentId, et sessioon salvestada.');
        return snapshot();
      }
      const item=currentItem(initialIndex);
      status('loading','Õppimissessiooni avamine…');
      try{
        const result=await post('start_or_resume',{
          studentId:requestedStudentId,
          lessonBlueprintId:lesson.id,
          lessonTitle:lesson.title,
          curriculumGoalIds:lesson.curriculumGoalIds||[],
          cefrLevel:lesson.cefrLevel||lesson.ceFRLevel||'',
          currentIndex:initialIndex,
          currentPhaseId:core.phaseIdForItem(item)||'diagnostic',
          currentActivityId:item.id||'',
          currentRoute:initialRoute,
          skillIds:core.skillIdsForItem({lesson,item})
        });
        studentData={id:result.session.studentId,name:result.session.studentName};
        status(result.resumed?'restored':'active',result.resumed?'Jätkame varem alustatud õppimissessiooni.':'Õppimissessioon salvestatakse.');
        return snapshot();
      }catch(error){
        status('error',error.message||'Õppimissessiooni avamine ebaõnnestus.');
        throw error;
      }
    }

    async function saveProgress({index=0,route='core'}={}){
      if(!sessionData||sessionData.status!=='active') return snapshot();
      const item=currentItem(index);
      try{
        await post('progress',{
          sessionId:sessionData.id,
          currentIndex:index,
          currentPhaseId:core.phaseIdForItem(item)||'diagnostic',
          currentActivityId:item.id||'',
          currentRoute:route,
          skillIds:core.skillIdsForItem({lesson,item})
        });
        status('saved','Edenemine salvestatud.');
        return snapshot();
      }catch(error){status('error',error.message);throw error;}
    }

    async function recordJudgement({index=0,route='core',judgement='',nextRoute=route}={}){
      if(!sessionData||sessionData.status!=='active') return snapshot();
      const item=currentItem(index);
      const mapped=core.mapUiJudgement(judgement);
      if(!mapped) throw new Error('Tundmatu õpetaja hinnang.');
      try{
        const result=await post('judge',{
          requestId:requestId('judge'),
          sessionId:sessionData.id,
          currentIndex:index,
          phaseId:core.phaseIdForItem(item)||'diagnostic',
          activityId:item.id||'',
          skillIds:core.skillIdsForItem({lesson,item}),
          route,
          nextRoute,
          teacherJudgement:mapped,
          note:''
        });
        status('saved',result.idempotent?'Tõend oli juba salvestatud.':'Õpetaja hinnang salvestatud tõendina.');
        return snapshot();
      }catch(error){status('error',error.message);throw error;}
    }

    async function recordVocabulary({index=0,route='core',wordId='',mark=''}={}){
      if(!sessionData||sessionData.status!=='active') return snapshot();
      const item=currentItem(index);
      try{
        await post('vocabulary',{
          requestId:requestId('vocab'),
          sessionId:sessionData.id,
          currentIndex:index,
          phaseId:core.phaseIdForItem(item)||'diagnostic',
          activityId:item.id||'',
          skillIds:core.skillIdsForItem({lesson,item}),
          route,
          nextRoute:route,
          wordId,
          mark
        });
        status('saved','Sõnavara tõend salvestatud.');
        return snapshot();
      }catch(error){status('error',error.message);throw error;}
    }

    async function complete({route='core',scores={},teacherNote='',handoffText=''}={}){
      if(!sessionData) return snapshot();
      if(sessionData.status==='completed'){
        status('completed','Õppimissessioon on juba lõpetatud.');
        return snapshot();
      }
      try{
        await post('complete',{
          requestId:requestId('complete'),
          sessionId:sessionData.id,
          route,
          scores:core.normalizeSummaryScores(scores),
          teacherNote,
          handoffText
        });
        status('completed','Õppimissessioon lõpetatud. Tõendid on säilitatud.');
        return snapshot();
      }catch(error){status('error',error.message);throw error;}
    }

    return {init,snapshot,saveProgress,recordJudgement,recordVocabulary,complete};
  }

  return {DEFAULT_API,requestId,create};
});