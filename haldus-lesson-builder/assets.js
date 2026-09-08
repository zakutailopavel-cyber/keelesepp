(function(){
  'use strict';
  const field=(label,input)=>{const wrap=document.createElement('label');wrap.className='field';wrap.append(document.createTextNode(label),input);return wrap;};
  function mount(){
    document.getElementById('asset-editor')?.remove();
    const bridge=window.KeeleSeppBuilderBridge;if(!bridge)return;
    const activity=bridge.get().activities.find(a=>a.id===bridge.selected());if(!activity)return;
    const panel=document.createElement('section');panel.id='asset-editor';panel.className='teacher-fields';
    const heading=document.createElement('div');heading.className='section-label';heading.innerHTML='<h2>Pilt ülesandes</h2><span>Nähtav õpilasele</span>';panel.append(heading);
    const asset=(activity.assets||[])[0];
    if(!asset){
      const add=document.createElement('button');add.id='add-image';add.className='secondary';add.textContent='＋ Lisa pilt veebiaadressilt';add.onclick=()=>bridge.patchAssets([{id:'asset-'+crypto.randomUUID(),type:'image',url:'https://',alt:''}]);panel.append(add);
    }else{
      const url=document.createElement('input');url.id='image-url';url.type='url';url.value=asset.url;url.maxLength=2000;url.placeholder='https://…';url.onchange=()=>bridge.patchAssets([{...asset,url:url.value.trim()}]);
      const alt=document.createElement('input');alt.id='image-alt';alt.value=asset.alt;alt.maxLength=300;alt.placeholder='Kirjelda pilti õpilasele';alt.onchange=()=>bridge.patchAssets([{...asset,alt:alt.value}]);
      const caption=document.createElement('input');caption.id='image-caption';caption.value=asset.caption||'';caption.maxLength=500;caption.placeholder='Soovi korral';caption.onchange=()=>bridge.patchAssets([{...asset,caption:caption.value}]);
      panel.append(field('Pildi HTTPS-aadress',url),field('Alternatiivtekst *',alt),field('Pildiallkiri',caption));
      const error=document.createElement('small');error.className='field-error';try{window.KeeleSeppInteractiveLesson.assetSpec(activity);}catch(e){error.textContent=!/^https:\/\/[^\s]+$/i.test(asset.url)?'Kasuta täielikku HTTPS-aadressi.':!asset.alt.trim()?'Lisa pildile alternatiivtekst.':'Kontrolli pildi andmeid.';}panel.append(error);
      const preview=document.createElement('div');preview.className='asset-editor-preview';if(!error.textContent)window.KeeleSeppResponseView.renderAssets(preview,{assets:[asset]});panel.append(preview);
      const remove=document.createElement('button');remove.id='remove-image';remove.textContent='Eemalda pilt';remove.onclick=()=>bridge.patchAssets([]);panel.append(remove);
    }
    const response=document.getElementById('response-editor'),editor=document.getElementById('editor');response?response.before(panel):editor.append(panel);
  }
  window.addEventListener('keelesepp-editor-rendered',mount);mount();
})();
