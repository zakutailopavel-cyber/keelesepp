(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.KeeleSeppAuthoringPresentation=api;})(typeof window!=='undefined'?window:globalThis,function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(model,layout){
    if(!layout||layout==='native')return null;
    const lines=model.prompt.split(/\n/).map(s=>s.trim()).filter(Boolean),prompt=`<p class="ap-prompt">${esc(model.prompt)}</p>`;
    const rowList=tag=>`<${tag}>${lines.map(s=>`<li>${esc(s)}</li>`).join('')}</${tag}>`;
    const renders={text:()=>prompt,image:()=>`${prompt}<div class="ap-placeholder" role="img" aria-label="Pildi koht; pilti pole lisatud">▧<br>Pildi koht<br><small>Õpetaja näitab pilti eraldi</small></div>`,cards:()=>`<div class="ap-cards">${lines.map((s,i)=>`<div><small>SÕNA ${i+1}</small><p>${esc(s)}</p></div>`).join('')}</div>`,flashcard:()=>`<div class="ap-cards flash">${lines.map(s=>`<div>${esc(s)}</div>`).join('')}</div>`,questions:()=>rowList('ol'),comparison:()=>`<div class="ap-columns">${lines.map((s,i)=>`<div><small>${i===0?'VÕRDLE':'SEL GITA'.replace(' ','')}</small><p>${esc(s)}</p></div>`).join('')}</div>`,roleplay:()=>`<div class="ap-role"><span>MINU ROLL</span>${prompt}</div>`,dialogue:()=>`<div class="ap-dialogue">${lines.map((s,i)=>`<p><b>${i%2?'B':'A'}</b> ${esc(s)}</p>`).join('')}</div>`,checklist:()=>`<ul class="ap-check">${lines.map(s=>`<li>□ ${esc(s)}</li>`).join('')}</ul>`,reading:()=>`<article class="ap-reading"><small>LOE JA MÕTLE</small>${prompt}</article>`,exam:()=>`<article class="ap-exam"><small>ISESEISEV ÜLESANNE</small>${prompt}<div class="ap-lines" aria-hidden="true"></div></article>`,reflection:()=>`<div class="ap-reflection">${lines.map(s=>`<p>${esc(s)}</p>`).join('')}</div>`,teacher:()=>`<div class="ap-teacher"><small>TEGUTSE KOOS ÕPETAJAGA</small>${prompt}</div>`};
    return renders[layout]?`<section class="authoring-layout" data-layout="${layout}">${renders[layout]()}</section>`:null;
  }
  return {render,esc};
});
