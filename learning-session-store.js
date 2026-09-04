(function(root,factory){
  const api=factory(root.KeeleSeppLearningSessionCore);
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KeeleSeppLearningSessionStore=api;
})(typeof window!=='undefined'?window:globalThis,function(core){
  const clean=(value,max=240)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);

  function create({db,auth,lesson,items=[],studentId='',onStatus=()=>{}}={}){
    if(!core) throw new Error('KeeleSeppLearningSessionCore is required');
    if(!db||!auth||!lesson) throw new Error('db, auth and lesson are required');

    const requestedStudentId=clean(studentId,120);
    let sessionRef=null;
    let sessionData=null;
    let studentData=null;
    let teacherData=null;
    let mode='preview';

    const serverTimestamp=()=>firebase.firestore.FieldValue.serverTimestamp();
    const status=(next,message='')=>{mode=next;onStatus({mode:next,message,sessionId:sessionRef?.id||''});};

    function currentItem(index){
      return items[Math.max(0,Math.min(items.length-1,Number(index)||0))]||{};
    }

    async function waitForAuth(){
      if(auth.currentUser) return auth.currentUser;
      return new Promise(resolve=>{
        let settled=false;
        const timer=setTimeout(()=>{if(!settled){settled=true;resolve(null);}},1500);
        const unsubscribe=auth.onAuthStateChanged(user=>{
          if(settled) return;
          settled=true;
          clearTimeout(timer);
          unsubscribe();
          resolve(user||null);
        });
      });
    }

    async function init({initialIndex=0,initialRoute='core'}={}){
      if(!requestedStudentId){
        status('preview','Lisa URL-i studentId, et sessioon Firebase’i salvestada.');
        return snapshot();
      }
      status('loading','Õppimissessiooni avamine…');
      const user=await waitForAuth();
      if(!user){
        status('signed_out','Logi CRM-i sisse, et õppimissessioon salvestada.');
        return snapshot();
      }

      const [userSnap,studentSnap]=await Promise.all([
        db.collection('users').doc(user.uid).get(),
        db.collection('students').doc(requestedStudentId).get()
      ]);
      if(!studentSnap.exists) throw new Error('Õpilast ei leitud või puudub sellele ligipääs.');
      teacherData=userSnap.exists?{uid:user.uid,email:user.email,...userSnap.data()}:{uid:user.uid,email:user.email};
      if(!['admin','teacher'].includes(teacherData.role)&&teacherData.email!=='zakutailo.pavel@gmail.com'){
        throw new Error('Õppimissessiooni saab salvestada ainult õpetaja või administraator.');
      }
      studentData={id:studentSnap.id,...studentSnap.data()};

      const sessionsSnap=await db.collection('learningSessions').where('teacherUid','==',user.uid).get();
      const active=sessionsSnap.docs
        .map(doc=>({id:doc.id,ref:doc.ref,...doc.data()}))
        .filter(entry=>entry.status==='active'&&entry.studentId===requestedStudentId&&entry.lessonBlueprintId===lesson.id)
        .sort((a,b)=>(b.updatedAt?.toMillis?.()||b.startedAt?.toMillis?.()||0)-(a.updatedAt?.toMillis?.()||a.startedAt?.toMillis?.()||0))[0];

      if(active){
        sessionRef=active.ref;
        sessionData={...active};
        delete sessionData.ref;
        status('restored','Jätkame varem alustatud õppimissessiooni.');
        return snapshot();
      }

      const item=currentItem(initialIndex);
      const draft=core.buildSessionDraft({
        student:studentData,
        teacher:{uid:user.uid,displayName:teacherData.displayName||teacherData.name||teacherData.email||''},
        lesson,
        currentItem:item,
        currentIndex:initialIndex,
        currentRoute:initialRoute
      });
      const validation=core.validateSessionDraft(draft);
      if(!validation.ok) throw new Error(validation.errors.join('; '));
      sessionRef=db.collection('learningSessions').doc();
      await sessionRef.set({...draft,startedAt:serverTimestamp(),updatedAt:serverTimestamp()});
      sessionData={id:sessionRef.id,...draft};
      status('active','Õppimissessioon salvestatakse.');
      return snapshot();
    }

    function snapshot(){
      return {
        mode,
        persistent:Boolean(sessionRef&&sessionData),
        session:sessionData?{...sessionData,id:sessionRef.id}:null,
        student:studentData?{...studentData}:null,
        teacher:teacherData?{...teacherData}:null
      };
    }

    async function saveProgress({index=0,route='core'}={}){
      if(!sessionRef||!sessionData||sessionData.status!=='active') return snapshot();
      const item=currentItem(index);
      const skillIds=core.skillIdsForItem({lesson,item});
      const progress=core.nextSessionProgress({session:sessionData,lesson,item,index,route,evidenceDelta:0,skillIds});
      await sessionRef.update({...progress,updatedAt:serverTimestamp()});
      sessionData={...sessionData,...progress};
      status('saved','Edenemine salvestatud.');
      return snapshot();
    }

    async function appendEvidence({evidence,index,route,skillIds=[]}={}){
      if(!sessionRef||!sessionData) return snapshot();
      const evidenceRef=db.collection('learningEvidence').doc();
      const item=currentItem(index);
      await db.runTransaction(async transaction=>{
        const snap=await transaction.get(sessionRef);
        if(!snap.exists||snap.data().status!=='active') throw new Error('Õppimissessioon ei ole enam aktiivne.');
        const current={id:snap.id,...snap.data()};
        const progress=core.nextSessionProgress({session:current,lesson,item,index,route,evidenceDelta:1,skillIds});
        transaction.set(evidenceRef,{...evidence,id:evidenceRef.id,createdAt:serverTimestamp(),createdAtIso:new Date().toISOString()});
        transaction.update(sessionRef,{...progress,lastEvidenceAt:serverTimestamp(),updatedAt:serverTimestamp()});
        sessionData={...current,...progress};
      });
      status('saved','Tõend salvestatud.');
      return {...snapshot(),evidenceId:evidenceRef.id};
    }

    async function recordJudgement({index=0,route='core',judgement='',nextRoute=route}={}){
      if(!sessionRef||!sessionData) return snapshot();
      const item=currentItem(index);
      const skillIds=core.skillIdsForItem({lesson,item});
      const evidence=core.buildTeacherEvidence({
        session:{...sessionData,id:sessionRef.id},lesson,item,route,judgement,kind:'teacher_judgement'
      });
      const validation=core.validateEvidence(evidence);
      if(!validation.ok) throw new Error(validation.errors.join('; '));
      return appendEvidence({evidence,index,route:nextRoute,skillIds});
    }

    async function recordVocabulary({index=0,route='core',wordId='',mark=''}={}){
      if(!sessionRef||!sessionData) return snapshot();
      const item=currentItem(index);
      const evidence=core.buildVocabularyEvidence({
        session:{...sessionData,id:sessionRef.id},lesson,item,route,wordId,mark
      });
      const validation=core.validateEvidence(evidence);
      if(!validation.ok) throw new Error(validation.errors.join('; '));
      return appendEvidence({evidence,index,route,skillIds:evidence.skillIds});
    }

    async function complete({route='core',scores={},teacherNote='',handoffText=''}={}){
      if(!sessionRef||!sessionData) return snapshot();
      const finalEvidence=core.buildSummaryEvidence({session:{...sessionData,id:sessionRef.id},lesson,route,scores});
      const evidenceRefs=finalEvidence.map(()=>db.collection('learningEvidence').doc());
      await db.runTransaction(async transaction=>{
        const snap=await transaction.get(sessionRef);
        if(!snap.exists) throw new Error('Õppimissessiooni ei leitud.');
        const current={id:snap.id,...snap.data()};
        if(current.status==='completed'){
          sessionData=current;
          return;
        }
        if(current.status!=='active') throw new Error('Ainult aktiivset sessiooni saab lõpetada.');
        const addedSkills=core.unique(finalEvidence.flatMap(entry=>entry.skillIds));
        finalEvidence.forEach((evidence,index)=>{
          const ref=evidenceRefs[index];
          transaction.set(ref,{...evidence,id:ref.id,createdAt:serverTimestamp(),createdAtIso:new Date().toISOString()});
        });
        const nextCount=(Number(current.evidenceCount)||0)+finalEvidence.length;
        const assessed=core.unique([...(current.assessedSkillIds||[]),...addedSkills]);
        const handoff={schemaVersion:1,text:clean(handoffText,6000),generatedAtIso:new Date().toISOString()};
        transaction.update(sessionRef,{
          status:'completed',
          currentPhaseId:'summary',
          currentActivityId:'summary',
          currentRoute:core.ROUTES.includes(route)?route:'core',
          evidenceCount:nextCount,
          assessedSkillIds:assessed,
          teacherNote:clean(teacherNote,3000),
          handoff,
          completedAt:serverTimestamp(),
          updatedAt:serverTimestamp()
        });
        sessionData={...current,status:'completed',currentPhaseId:'summary',currentActivityId:'summary',currentRoute:route,evidenceCount:nextCount,assessedSkillIds:assessed,teacherNote:clean(teacherNote,3000),handoff};
      });
      status('completed','Õppimissessioon lõpetatud. Tõendid on säilitatud.');
      return snapshot();
    }

    return {init,snapshot,saveProgress,recordJudgement,recordVocabulary,complete};
  }

  return {create};
});