(function(root){
  'use strict';
  function render(container,activity,value,onChange){
    container.replaceChildren();const s=activity.response;if(!s)return false;
    const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
    const group=el('fieldset'),legend=el('legend',s.required?'Sinu vastus *':'Sinu vastus');group.append(legend);container.append(group);
    if(s.mode==='short_text'||s.mode==='long_text'){
      const input=el(s.mode==='long_text'?'textarea':'input');input.setAttribute('aria-label','Sinu vastus');input.maxLength=s.mode==='short_text'?500:10000;input.value=typeof value==='string'?value:'';input.oninput=()=>onChange(input.value);group.append(input);return false;
    }
    if(s.mode==='gaps'){
      const parts=String(activity.prompt||'').split(/_{3,}/g);
      if(parts.length===s.items.length+1){group.className='inline-gaps';group.replaceChildren();parts.forEach((part,index)=>{group.append(document.createTextNode(part));if(index<s.items.length){const item=s.items[index],input=el('input');input.maxLength=500;input.value=value?.[item.id]||'';input.setAttribute('aria-label',item.label);input.oninput=()=>{value={...value,[item.id]:input.value};onChange(value);};group.append(input);}});return true;}
    }
    s.items.forEach(item=>{
      const label=el('label'),input=el('input');
      if(s.mode==='gaps'){input.maxLength=500;input.value=value?.[item.id]||'';input.oninput=()=>{value={...value,[item.id]:input.value};onChange(value);};label.append(el('span',item.label),input);}
      else{input.type=s.mode==='single_choice'?'radio':'checkbox';input.name='response-'+activity.id;input.value=item.id;input.checked=s.mode==='single_choice'?value===item.id:Array.isArray(value)&&value.includes(item.id);input.onchange=()=>{if(s.mode==='single_choice'){value=item.id;}else{const selected=new Set(Array.isArray(value)?value:[]);input.checked?selected.add(item.id):selected.delete(item.id);value=[...selected];}onChange(value);};label.append(input,el('span',item.label));}
      group.append(label);
    });return false;
  }
  function renderAssets(container,activity){
    container.replaceChildren();
    (activity.assets||[]).forEach(asset=>{const figure=document.createElement('figure'),img=document.createElement('img');figure.className='lesson-image';img.src=asset.url;img.alt=asset.alt;img.loading='lazy';img.referrerPolicy='no-referrer';figure.append(img);if(asset.caption){const caption=document.createElement('figcaption');caption.textContent=asset.caption;figure.append(caption);}container.append(figure);});
  }
  root.KeeleSeppResponseView={render,renderAssets};
})(typeof window!=='undefined'?window:globalThis);
