(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.KeeleSeppCloudStore=api;})(typeof window!=='undefined'?window:globalThis,function(){
  function create({auth,fetch:fetcher=globalThis.fetch,endpoint='https://us-central1-keelesepp-5136b.cloudfunctions.net/lessonDraftsApi'}){
    async function call(action,data={}){
      const user=auth.currentUser;if(!user)throw Object.assign(new Error('Logi sisse õpetaja või administraatorina.'),{status:401});
      const token=await user.getIdToken();
      const response=await fetcher(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({...data,action})});
      const result=await response.json().catch(()=>({error:'Pilveteenus pole veel saadaval. Kohalik mustand jääb alles.'}));
      if(!response.ok)throw Object.assign(new Error(result.error||'Pilvesalvestus ebaõnnestus.'),{status:response.status});
      return result;
    }
    return {call};
  }
  return {create};
});
