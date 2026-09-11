(function(){
  'use strict';
  const $=id=>document.getElementById(id),bridge=window.KeeleSeppBuilderBridge,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
  const key='keelesepp.cloud-bindings.v1';let busy=false,client,auth,bindings={};
  try{bindings=JSON.parse(localStorage.getItem(key)||'{}');}catch{}
  if(!bindings||typeof bindings!=='object'||Array.isArray(bindings))bindings={};
  function status(text){$('cloud-status').textContent=text;}
  function bind(record){bindings[record.id]={id:record.id,revision:record.revision,uid:auth.currentUser.uid,lessonId:record.lessonId};try{localStorage.setItem(key,JSON.stringify(bindings));}catch{status('Pilves salvestatud; kohalik taastamine pole saadaval.');}}
  function binding(){const b=bindings[bridge.get().id];return b?.uid===auth?.currentUser?.uid?b:null;}
  const script=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('Sisselogimist ei saanud laadida.'));document.head.append(s);});
  let loading;
  async function connect(){
    if(!loading)loading=(async()=>{
      if(!window.firebase){await script('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');await script('https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js');}
      if(!firebase.apps.length)firebase.initializeApp({apiKey:'AIzaSyAp8emBOh1fIqv72k_O5hkLkXVkfBt1al4',authDomain:'keelesepp-5136b.firebaseapp.com',projectId:'keelesepp-5136b',appId:'1:674098517935:web:e73d04a4ada67874da015a'});
      auth=firebase.auth();if(auth.authStateReady)await auth.authStateReady();else await new Promise(resolve=>{let off;off=auth.onAuthStateChanged(()=>{setTimeout(()=>off?.(),0);resolve();});});
      client=window.KeeleSeppCloudStore.create({auth});
    })().catch(e=>{loading=null;throw e;});
    await loading;if(!auth.currentUser)throw Object.assign(Error('Logi esmalt KeeleSeppa sisse. Kohalik mustand jääb alles.'),{status:401});
  }
  async function run(action){if(busy)return;busy=true;status('Ühendan…');try{await connect();await action();}catch(e){
    status(e.status===409?'Konflikt: pilveolek ei luba seda muudatust. Kohalik töö jäi alles.':e.message);
    bridge.modal('Pilv ei salvestanud muudatusi',`<p>${esc(e.message)}</p><p>Kohalik mustand jääb alles. Ava pilveversioon teadlikult või salvesta kohalik töö uue koopiana.</p><a href="/haldus.html" target="_blank" rel="noopener">Logi KeeleSeppa sisse</a>`);
  }finally{busy=false;}}
  async function save(asNew=false){
    const snapshot=bridge.get(),b=asNew?null:binding();
    const result=await client.call(b?'save':'create',b?{draftId:b.id,revision:b.revision,content:snapshot}:{content:snapshot});
    if(result.draft){
      // Cloud creates identity. Rebind only the same local draft; never replace unrelated user work.
      const latest=bridge.get();if(latest.id===snapshot.id){latest.id=result.draft.id;bridge.replace(latest);}
      bind(result.draft);
    }else{bind({...b,revision:result.revision});}
    status('Pilves salvestatud · r'+(result.draft?.revision||result.revision));
  }
  async function open(id){const result=await client.call('get',{draftId:id});bridge.replace(result.draft.content);bind(result.draft);bridge.close();status(result.draft.status==='archived'?'Arhiveeritud · muudatused salvesta uue koopiana':'Pilvest avatud · r'+result.draft.revision);}
  function confirm(title,action){bridge.confirm(title,'Praegune kohalik mustand võib asenduda. Vajadusel ekspordi esmalt varukoopia.',()=>run(action));}
  async function library(cursor=''){
    const result=await client.call('list',{...(cursor?{cursor}:{})});
    const rows=result.drafts.map(d=>`<article class="cloud-row"><div><b>${esc(d.title)}</b><small>r${d.revision} · ${d.status==='archived'?'Arhiveeritud':'Mustand'} · v${d.versionNumber}</small></div><button data-cloud-open="${esc(d.id)}">Ava</button></article>`).join('')||'<p>Sinu pilveraamatukogu on tühi.</p>';
    bridge.modal('Minu tunnid',`<p>Isiklikud mustandid. Avaldamine ei määra tundi õpilasele.</p>${rows}${result.nextCursor?`<button id="cloud-next">Järgmised</button>`:''}`);
    document.querySelectorAll('[data-cloud-open]').forEach(b=>b.onclick=()=>confirm('Ava pilvemustand?',()=>open(b.dataset.cloudOpen)));
    if($('cloud-next'))$('cloud-next').onclick=()=>run(()=>library(result.nextCursor));status('Pilveraamatukogu avatud');
  }
  async function history(cursor=''){
    const b=binding();if(!b)throw Error('Salvesta tund esmalt pilve.');
    const result=await client.call('history',{draftId:b.id,...(cursor?{cursor}:{})});
    bridge.modal('Avaldatud versioonid',`<p>Muutumatud koopiad. Ajalugu on ainult lugemiseks.</p>${result.versions.map(v=>`<article class="cloud-row"><b>Versioon ${v.versionNumber}</b><small>${esc(v.createdAt)}</small><button data-version="${esc(v.id)}">Vaata</button></article>`).join('')||'<p>Avaldatud versioone veel pole.</p>'}${result.nextCursor?'<button id="history-next">Järgmised</button>':''}`);
    document.querySelectorAll('[data-version]').forEach(button=>button.onclick=()=>run(async()=>{
      const {version}=await client.call('version',{draftId:b.id,lessonVersionId:button.dataset.version});
      bridge.modal('Versioon '+version.versionNumber,`<p>Ainult lugemiseks · ${esc(version.content.title)}</p>${version.content.activities.map(a=>`<article class="cloud-row"><div><b>${esc(a.title)}</b>${['support','core','advanced'].map(r=>`<p><small>${esc(r)}</small><br>${esc(a.routes[r].prompt)}</p>`).join('')}</div></article>`).join('')}<details><summary>Tehnilised andmed · täielik versioon</summary><pre style="white-space:pre-wrap">${esc(JSON.stringify(version,null,2))}</pre></details>`);status('Ajalugu · ainult lugemiseks');
    }));if($('history-next'))$('history-next').onclick=()=>run(()=>history(result.nextCursor));status('Versiooniajalugu avatud');
  }
  $('cloud-save').onclick=()=>run(()=>save());$('cloud-library').onclick=()=>run(()=>library());
  $('cloud-more').onclick=()=>bridge.modal('Pilve toimingud',`<div class="action-menu"><button id="cloud-new-copy">Salvesta kohalik töö uue pilvekoopiana</button><button id="cloud-duplicate">Tee pilvemustandist koopia</button><button id="cloud-history">Versiooniajalugu</button><button id="cloud-publish">Avalda salvestatud pilveversioon</button><button id="cloud-archive">Arhiveeri pilvemustand</button></div><p>Avaldamine loob muutumatu versiooni. See ei avalda vastuseid õpilastele ega muuda õppekava.</p>`);
  document.addEventListener('click',e=>{
    const action=e.target.id;
    if(action==='cloud-new-copy')confirm('Salvesta uue koopiana?',()=>save(true));
    if(action==='cloud-history')run(()=>history());
    if(['cloud-duplicate','cloud-archive','cloud-publish'].includes(action))confirm(action==='cloud-publish'?'Avalda salvestatud versioon?':action==='cloud-archive'?'Arhiveeri mustand?':'Tee pilvekoopia?',async()=>{
      const b=binding();if(!b)throw Error('Salvesta tund esmalt pilve.');
      if(action==='cloud-publish'){
        const latest=await client.call('get',{draftId:b.id});
        if(latest.draft.revision!==b.revision)throw Object.assign(Error('Pilvemustand on muutunud. Ava uusim versioon.'),{status:409});
        if(canonical(latest.draft.content)!==canonical(bridge.get()))throw Error('Salvesta kohalikud muudatused enne avaldamist pilve.');
      }
      const result=await client.call(action.slice(6),{draftId:b.id,revision:b.revision});
      if(action==='cloud-duplicate')await open(result.id);
      else{bind({...b,revision:result.revision});if(result.publication){status('Avaldatud · v'+result.publication.versionNumber);bridge.modal('Tund on avaldatud',`<p>Muutumatu versioon ${esc(result.publication.versionNumber)} on valmis õpilasele määramiseks.</p><a class="primary-link" href="/interactive-lesson/?lessonVersionId=${encodeURIComponent(result.publication.lessonVersionId)}">Määra tund õpilasele →</a>`);}else status('Arhiveeritud');}
    });
  });
  const params=new URLSearchParams(location.search),requestedDraft=params.get('draftId'),requestedActivity=params.get('activityId');
  if(requestedDraft)run(async()=>{await open(requestedDraft);if(requestedActivity)bridge.select(requestedActivity);});
})();
