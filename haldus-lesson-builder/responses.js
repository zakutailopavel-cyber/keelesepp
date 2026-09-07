(function(){
  'use strict';
  const labels={short_text:'Lühivastus',long_text:'Pikem vastus',single_choice:'Üks valik',multiple_choice:'Mitu valikut',gaps:'Täida lüngad'};
  function mount(){
    document.getElementById('response-editor')?.remove();
    const bridge=window.KeeleSeppBuilderBridge;if(!bridge)return;
    const a=bridge.get().activities.find(a=>a.id===bridge.selected());if(!a)return;
    const panel=document.createElement('section');panel.id='response-editor';panel.className='teacher-fields';
    panel.innerHTML='<h2>Õpilane saab vastata</h2><label class="field">Vastuse vorm<select id="response-mode"><option value="">Ilma vastuseväljata</option></select></label><div id="response-settings"></div><h3>Proovi õpilasena</h3><p class="hint">Proovivastuseid ei salvestata ega saadeta serverisse.</p><div id="response-try"></div>';
    const editor=document.getElementById('editor'),teacherFields=editor.querySelector('details.teacher-fields');teacherFields?teacherFields.before(panel):editor.append(panel);
    const select=panel.querySelector('select');Object.entries(labels).forEach(([value,text])=>select.add(new Option(text,value)));
    const spec=a.evaluation?.response;select.value=spec?.mode||'';
    select.onchange=()=>{const mode=select.value;if(!mode)return bridge.patchResponse(null);bridge.patchResponse({schemaVersion:1,mode,required:true,...(['single_choice','multiple_choice','gaps'].includes(mode)?{items:[{id:crypto.randomUUID(),label:'Esimene'},{id:crypto.randomUUID(),label:'Teine'}]}:{})});};
    if(!spec)return;
    const settings=panel.querySelector('#response-settings');const required=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=spec.required;check.onchange=()=>bridge.patchResponse({...spec,required:check.checked});required.append(check,document.createTextNode('Vastus on kohustuslik'));settings.append(required);
    if(spec.items){
      spec.items.forEach((item,i)=>{const row=document.createElement('div');row.className='field-grid';const input=document.createElement('input');input.maxLength=300;input.value=item.label;input.setAttribute('aria-label',(spec.mode==='gaps'?'Lünk ':'Valik ')+(i+1));input.onchange=()=>bridge.patchResponse({...spec,items:spec.items.map(x=>x.id===item.id?{...x,label:input.value}:x)});const del=document.createElement('button');del.textContent='Eemalda';del.disabled=spec.items.length<=(spec.mode==='gaps'?1:2);del.onclick=()=>bridge.patchResponse({...spec,items:spec.items.filter(x=>x.id!==item.id)});row.append(input,del);settings.append(row);});
      const add=document.createElement('button');add.textContent=spec.mode==='gaps'?'+ Lisa lünk':'+ Lisa valik';add.disabled=spec.items.length>=20;add.onclick=()=>bridge.patchResponse({...spec,items:[...spec.items,{id:crypto.randomUUID(),label:'Uus'}]});settings.append(add);
    }
    try{window.KeeleSeppResponseView.render(panel.querySelector('#response-try'),{...a,response:window.KeeleSeppInteractiveLesson.responseSpec(a)},undefined,()=>{});}catch(e){panel.querySelector('#response-try').textContent=e.message;}
  }
  window.addEventListener('keelesepp-editor-rendered',mount);mount();
})();
