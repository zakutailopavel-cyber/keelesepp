(function(){
  'use strict';
  const $=id=>document.getElementById(id),esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const canvas=window.KeeleSeppA4Canvas,bridge=window.KeeleSeppBuilderBridge,workspace=$('a4-workspace');
  if(!canvas||!bridge||!workspace||!$('show-a4'))return;
  let selected='',dragging='';
  const meta=(draft,id)=>draft.authoring.activities[id]||{};
  function update(next,id=selected){bridge.commitDraft(next,id);render();}
  function patchLesson(patch){const next=canvas.normalize(bridge.get());next.authoring.a4={...(next.authoring.a4||{}),...patch};update(next);}
  function blockBody(activity,showAnswers){
    const prompt=activity.routes?.core?.prompt||'';
    const asset=(activity.assets||[]).find(item=>item.type==='image'&&/^https:\/\//i.test(item.url||''));
    const expected=activity.routes?.core?.expected||'';
    return `${asset?`<figure><img src="${esc(asset.url)}" alt="${esc(asset.alt||'')}">${asset.caption?`<figcaption>${esc(asset.caption)}</figcaption>`:''}</figure>`:''}<div class="a4-prompt" contenteditable="true" role="textbox" aria-label="Muuda ülesande teksti" data-edit="${esc(activity.id)}">${esc(prompt).replace(/\n/g,'<br>')}</div>${showAnswers&&expected?`<div class="a4-answer"><strong>Vastus:</strong> ${esc(expected)}</div>`:''}`;
  }
  function card(entry,showAnswers){const {activity,layout}=entry,m=meta(canvas.normalize(bridge.get()),activity.id);return `<article class="a4-block ${selected===activity.id?'selected':''}" style="--span:${layout.span}" draggable="true" data-id="${esc(activity.id)}" data-page="${layout.page}"><div class="a4-insert" aria-hidden="true"></div><div class="a4-block-tools"><button data-grab="${esc(activity.id)}" title="Lohista">⠿</button><button data-span="12" title="Täislaius">1/1</button><button data-span="8" title="Kaks kolmandikku">2/3</button><button data-span="6" title="Pool lehte">1/2</button><button data-span="4" title="Kolmandik">1/3</button><button data-edit-main="${esc(activity.id)}">Muuda</button></div><p class="a4-block-meta">${esc(activity.title)} · ${m.minutes||0} min</p>${blockBody(activity,showAnswers)}</article>`;}
  function render(){
    const draft=canvas.normalize(bridge.get()),count=canvas.pageCount(draft),pages=canvas.pages(draft),settings=draft.authoring.a4||{},cefr=draft.authoring.lesson?.cefr||'';
    workspace.innerHTML=`<header class="a4-modebar"><div><span class="eyebrow">PRINDITAV TÖÖLEHT</span><h2>${esc(draft.title)}</h2><small>A4 · 210 × 297 mm · ${count} ${count===1?'leht':'lehte'} · samad activity ID-d</small></div><div><label class="a4-answer-toggle"><input id="a4-answers" type="checkbox" ${settings.answers?'checked':''}> Näita vastuseid</label><button id="a4-print">Prindi / PDF</button><button id="a4-close" class="primary">Tagasi redaktorisse</button></div></header><div class="a4-shell"><aside class="a4-library"><h3>Tunni plokid</h3><p>Lisa valmis plokk või lohista olemasolevad plokid lehel ümber.</p><div class="a4-quick"><button data-template="interactive-long">＋ Tekst ja vastus</button><button data-template="interactive-gaps">＋ Täida lüngad</button><button data-template="picture">＋ Pildi koht</button><button data-template="roleplay">＋ Rollimäng</button></div><h4>OLEMASOLEV TUND</h4><nav>${draft.activities.map((a,i)=>`<button data-jump="${esc(a.id)}"><span>${i+1}</span>${esc(a.title)}</button>`).join('')}</nav></aside><main class="a4-stage"><div class="a4-pages">${Array.from({length:count},(_,index)=>{const page=index+1;return `<section class="a4-page" data-page="${page}"><div class="a4-running"><span>KeeleSepp · ${esc(cefr)}</span><span>${esc(draft.title)}</span></div>${page===1?`<header class="a4-document-head"><h1>${esc(draft.title)}</h1><div><label>Nimi <input value="${esc(settings.studentName||'')}"></label><label>Kuupäev <input value="${esc(settings.date||new Date().toLocaleDateString('et-EE'))}"></label></div></header>`:''}<div class="a4-grid" data-page-grid="${page}">${(pages[index]||[]).map(entry=>card(entry,settings.answers)).join('')||'<div class="a4-empty">Lohista plokk sellele lehele</div>'}</div><footer>Leht ${page} / ${count}</footer></section>`;}).join('')}<button id="a4-add-page" class="a4-add-page">＋ Lisa uus leht</button></div></main></div>`;
    bind();
  }
  function bind(){
    $('a4-close').onclick=close;$('a4-print').onclick=()=>window.print();$('a4-add-page').onclick=()=>update(canvas.addPage(bridge.get()));$('a4-answers').onchange=e=>patchLesson({answers:e.target.checked});
    const headInputs=workspace.querySelectorAll('.a4-document-head input');
    if(headInputs[0])headInputs[0].onchange=e=>patchLesson({studentName:e.target.value.slice(0,180)});
    if(headInputs[1])headInputs[1].onchange=e=>patchLesson({date:e.target.value.slice(0,40)});
    workspace.querySelectorAll('[data-template]').forEach(button=>button.onclick=()=>{selected=bridge.insertTemplate(button.dataset.template);const next=canvas.normalize(bridge.get());update(next,selected);});
    workspace.querySelectorAll('[data-jump]').forEach(button=>button.onclick=()=>{selected=button.dataset.jump;render();[...workspace.querySelectorAll('[data-id]')].find(x=>x.dataset.id===selected)?.scrollIntoView({behavior:'smooth',block:'center'});});
    workspace.querySelectorAll('.a4-block').forEach(block=>{
      block.onclick=()=>{selected=block.dataset.id;workspace.querySelectorAll('.a4-block.selected').forEach(x=>x.classList.remove('selected'));block.classList.add('selected');};
      block.ondragstart=e=>{dragging=block.dataset.id;e.dataTransfer.effectAllowed='move';block.classList.add('dragging');};block.ondragend=()=>{dragging='';block.classList.remove('dragging');};
      block.ondragover=e=>{if(!dragging||dragging===block.dataset.id)return;e.preventDefault();e.stopPropagation();workspace.querySelectorAll('.a4-block.insert-before').forEach(x=>x.classList.remove('insert-before'));block.classList.add('insert-before');};
      block.ondragleave=()=>block.classList.remove('insert-before');
      block.ondrop=e=>{if(!dragging||dragging===block.dataset.id)return;e.preventDefault();e.stopPropagation();block.classList.remove('insert-before');selected=dragging;update(canvas.move(bridge.get(),dragging,block.dataset.id,Number(block.dataset.page)),dragging);};
      block.querySelectorAll('[data-span]').forEach(button=>button.onclick=e=>{e.stopPropagation();selected=block.dataset.id;update(canvas.setLayout(bridge.get(),selected,{span:Number(button.dataset.span)}),selected);});
      block.querySelector('[data-edit-main]').onclick=e=>{e.stopPropagation();bridge.select(block.dataset.id);close();};
    });
    workspace.querySelectorAll('[data-page-grid]').forEach(grid=>{grid.ondragover=e=>{if(e.target.closest('.a4-block'))return;e.preventDefault();grid.classList.add('drop-ready');};grid.ondragleave=e=>{if(!grid.contains(e.relatedTarget))grid.classList.remove('drop-ready');};grid.ondrop=e=>{if(e.target.closest('.a4-block'))return;e.preventDefault();grid.classList.remove('drop-ready');if(!dragging)return;selected=dragging;update(canvas.move(bridge.get(),dragging,'',Number(grid.dataset.pageGrid)),dragging);};});
    workspace.querySelectorAll('[data-edit]').forEach(editor=>editor.onblur=()=>{const next=canvas.normalize(bridge.get()),activity=next.activities.find(a=>a.id===editor.dataset.edit);if(!activity)return;activity.routes.core.prompt=editor.innerText.trim();update(next,activity.id);});
  }
  function open(){document.body.classList.add('a4-mode');workspace.hidden=false;render();}
  function close(){workspace.hidden=true;document.body.classList.remove('a4-mode');}
  $('show-a4').onclick=open;
})();
