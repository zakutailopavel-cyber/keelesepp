(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KeeleSeppLearningProfileEvidenceStore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const DEFAULT_API='https://us-central1-keelesepp-5136b.cloudfunctions.net/learningProfileEvidenceApi';
  const clean=(value,max=240)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);

  function create({auth,apiUrl='',fetchImpl=globalThis.fetch}={}){
    if(!auth) throw new Error('auth is required');
    if(typeof fetchImpl!=='function') throw new Error('fetch implementation is required');
    const endpoint=clean(apiUrl||globalThis.KEELESEPP_LEARNING_PROFILE_EVIDENCE_API_URL||DEFAULT_API,500);

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

    async function load(studentId,{limit=60}={}){
      const id=clean(studentId,120);
      if(!id) return {student:null,evidence:[],sessions:[]};
      const user=auth.currentUser||await waitForAuth();
      if(!user) throw new Error('Logi CRM-i sisse, et õppimistõendeid vaadata.');
      const token=await user.getIdToken();
      const response=await fetchImpl(endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body:JSON.stringify({studentId:id,limit})
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(payload.error||`Learning Profile Evidence API ${response.status}`);
      return {
        student:payload.student&&typeof payload.student==='object'?payload.student:null,
        evidence:Array.isArray(payload.evidence)?payload.evidence:[],
        sessions:Array.isArray(payload.sessions)?payload.sessions:[]
      };
    }

    return {load};
  }

  return {DEFAULT_API,create};
});
