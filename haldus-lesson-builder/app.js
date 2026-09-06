(function(){
  'use strict';
  const core=window.KeeleSeppLessonAuthoring,$=id=>document.getElementById(id);
  const STORAGE='keelesepp.lesson-authoring.v1',PREVIEW='keelesepp.authoring-preview.';
  const names={support:'Support · Toega',core:'Core · Standard',advanced:'Advanced · Edasijõudnu'};
  const skills={vocabulary:'Sõnavara',grammar:'Grammatika',speaking:'Rääkimine',reading:'Lugemine',listening:'Kuulamine',writing:'Kirjutamine'};
  const types={diagnostic:'Diagnostika',vocabulary:'Sõnavara',controlled_practice:'Harjutamine',scene:'Olukord',roleplay:'Rollimäng',transfer:'Ülekanne',assessment:'Lõppkontroll'};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const id=prefix=>prefix+'-'+crypto.randomUUID();
  let draft=core.createDraft(id('draft')),selected='',route='core',dirty=false,showErrors=false,previewToken='';
  function errors(messages){$('errors').hidden=!messages.length;$('errors').innerHTML=messages.length?'<p>Enne salvestamist paranda järgmised väljad:</p><ul>'+messages.map(m=>'<li>'+esc(m)+'</li>').join('')+'</ul>':'';}
  function report(){const result=core.validate(draft);errors(result.errors);return result.ok;}
  function changed(){dirty=true;$('save-state').textContent='Salvestamata muudatused';if(showErrors)report();renderList();}
  function select(activityId){selected=activityId;renderList();renderEditor();}
  function renderList(){
    $('total').textContent=draft.activities.length;
    $('activities').innerHTML=draft.activities.map((a,i)=>`<li><button data-id="${esc(a.id)}" aria-current="${a.id===selected}"><span class="number">${i+1}</span><span>${esc(a.title||'Nimetu tegevus')}<small>${esc(a.phaseId)} · ${esc(types[a.workspaceType]||a.workspaceType)}</small></span></button></li>`).join('');
    $('activities').querySelectorAll('button').forEach(b=>b.onclick=()=>select(b.dataset.id));
  }
  function patch(update){draft=core.updateActivity(draft,selected,update);changed();}
  function renderEditor(){
    const a=draft.activities.find(x=>x.id===selected);
    if(!a){$('editor').innerHTML='<p>Lisa esimene tegevus või kopeeri koolitund.</p>';return;}
    const index=draft.activities.indexOf(a),v=a.routes[route];
    $('editor').innerHTML=`<div class="id-row"><label>Püsiv activity ID<input id="activity-id" readonly value="${esc(a.id)}"></label><button id="up" ${index===0?'disabled':''} aria-label="Liiguta tegevus üles">↑</button><button id="down" ${index===draft.activities.length-1?'disabled':''} aria-label="Liiguta tegevus alla">↓</button></div><p class="muted">ID jääb samaks teksti, raskusraja ja järjestuse muutmisel.</p>
    <label>Tegevuse pealkiri<input id="activity-title" maxlength="180" value="${esc(a.title)}"></label><div class="grid"><label>Etapp · phaseId<input id="phase" value="${esc(a.phaseId)}" maxlength="100"></label><label>Tööruum<select id="workspace-type">${core.TYPES.map(t=>`<option value="${t}" ${t===a.workspaceType?'selected':''}>${types[t]}</option>`).join('')}</select></label></div>
    <fieldset><legend>Hinnatavad oskused</legend><div class="skills">${core.SKILLS.map(s=>`<label><input type="checkbox" data-skill="${s}" ${a.skillIds.includes(s)?'checked':''}>${skills[s]}</label>`).join('')}</div></fieldset>
    <div class="routes" aria-label="Raskusrada">${core.ROUTES.map(r=>`<button data-route="${r}" aria-pressed="${r===route}">${names[r]}</button>`).join('')}</div>
    <div class="variant-fields"><label>Ülesanne · ${names[route]}<textarea id="prompt" maxlength="3000">${esc(v.prompt)}</textarea></label><label>Kontrollvastus · ainult õpetajale<textarea id="expected" maxlength="3000">${esc(v.expected)}</textarea></label><label>Õpetaja juhis<textarea id="instruction" maxlength="4000">${esc(v.teacherInstruction)}</textarea></label></div>`;
    $('activity-title').oninput=e=>patch({title:e.target.value});$('phase').oninput=e=>patch({phaseId:e.target.value});
    $('workspace-type').onchange=e=>{const value=e.target.value;patch({workspaceType:value,...(value==='diagnostic'?{phaseId:'diagnostic'}:draft.activities.find(x=>x.id===selected).phaseId==='diagnostic'?{phaseId:'practice'}:{})});renderEditor();};
    $('editor').querySelectorAll('[data-skill]').forEach(el=>el.onchange=()=>patch({skillIds:[...$('editor').querySelectorAll('[data-skill]:checked')].map(c=>c.dataset.skill)}));
    $('editor').querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{route=b.dataset.route;renderEditor();});
    for(const [field,key] of [['prompt','prompt'],['expected','expected'],['instruction','teacherInstruction']])$(field).oninput=e=>{const current=draft.activities.find(x=>x.id===selected);patch({routes:{...current.routes,[route]:{...current.routes[route],[key]:e.target.value}}});};
    $('up').onclick=()=>move(-1);$('down').onclick=()=>move(1);
  }
  function move(delta){draft=core.moveActivity(draft,selected,delta);changed();renderEditor();}
  function replace(next){draft=next;selected=draft.activities[0]?.id||'';route='core';dirty=true;showErrors=false;errors([]);$('lesson-title').value=draft.title;$('save-state').textContent='Salvestamata mustand';renderList();renderEditor();closePreview();}
  function mayReplace(){return !dirty||confirm('Salvestamata muudatused asendatakse. Kas jätkata?');}
  function closePreview(){const frame=$('preview-frame');frame.removeAttribute('src');$('preview-panel').hidden=true;if(previewToken){try{sessionStorage.removeItem(PREVIEW+previewToken);}catch{}previewToken='';}}
  $('lesson-title').oninput=e=>{draft.title=e.target.value;changed();};
  $('new').onclick=()=>{if(mayReplace())replace(core.createDraft(id('draft')));};
  $('school').onclick=()=>{if(mayReplace())replace(core.fromLesson(window.KeeleSeppAdaptiveLessons['est-b1-school-learning-01'],id('draft')));};
  $('add').onclick=()=>{const activityId=id('act');draft=core.addActivity(draft,activityId);selected=activityId;changed();renderEditor();};
  $('save').onclick=()=>{showErrors=true;if(!report())return;try{localStorage.setItem(STORAGE,core.serialize(draft));dirty=false;$('save-state').textContent='Salvestatud selles brauseris';}catch(e){errors(['Salvestamine ebaõnnestus. Ekspordi mustand failina. '+e.message]);}};
  $('export').onclick=()=>{showErrors=true;if(!report())return;const blob=new Blob([core.serialize(draft)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=draft.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  $('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>core.MAX_BYTES)throw new Error('Fail on liiga suur.');const next=core.parse(await file.text());if(mayReplace())replace(next);}catch(error){errors(['Import ebaõnnestus: '+error.message]);}finally{e.target.value='';}};
  $('preview').onclick=()=>{showErrors=true;if(!report())return;try{closePreview();previewToken=crypto.randomUUID();sessionStorage.setItem(PREVIEW+previewToken,core.serialize(draft));$('preview-frame').src='/haldus-adaptive-lesson/?authoringPreview='+encodeURIComponent(previewToken);$('preview-panel').hidden=false;$('preview-panel').scrollIntoView({behavior:'smooth'});}catch(e){errors(['Eelvaadet ei saa avada: '+e.message]);}};
  $('close-preview').onclick=closePreview;
  addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  try{const saved=localStorage.getItem(STORAGE);if(saved){draft=core.parse(saved);selected=draft.activities[0]?.id||'';$('save-state').textContent='Taastatud sellest brauserist';}}catch(error){errors(['Salvestatud mustandit ei saanud avada. Alusta uut või impordi varukoopia. '+error.message]);}
  $('lesson-title').value=draft.title;renderList();renderEditor();
})();
