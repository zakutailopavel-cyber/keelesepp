from pathlib import Path
import re

p = Path('haldus-exercises/index.html')
s = p.read_text(encoding='utf-8')

css_marker = '/* LIVE LESSON HISTORY */'
assert css_marker in s, 'CSS insertion marker missing'
css = r'''
/* INTERACTIVE WORKSHEET V1 */
.doc-preview-ov{padding:10px!important;}
.doc-preview-box.interactive-preview{width:min(1540px,99vw);height:min(980px,97vh);border-radius:18px;}
.interactive-preview .doc-preview-head{padding:14px 18px;}
.interactive-preview .doc-preview-body{padding:0;background:#D9D7D2;overflow:auto;display:block;}
.iw-toolbar{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.iw-toolbar .btn.active{background:#fff;color:#1C2B3A;border-color:#fff;}
.iw-workspace{min-height:100%;display:flex;align-items:flex-start;justify-content:center;gap:16px;padding:24px;}
.iw-canvas-shell{flex:1;min-width:0;display:flex;justify-content:center;align-items:flex-start;}
.iw-sheet{position:relative;width:min(900px,100%);background:#fff;box-shadow:0 18px 55px rgba(28,43,58,.18);border-radius:3px;overflow:hidden;line-height:0;user-select:none;touch-action:none;}
.iw-sheet>img{display:block;width:100%;height:auto;}
.iw-layer{position:absolute;inset:0;pointer-events:none;}
.iw-element{position:absolute;pointer-events:auto;line-height:1.2;font-family:'IBM Plex Sans',sans-serif;box-sizing:border-box;}
.iw-element.editor{border:2px dashed #C9882A;background:rgba(255,249,235,.18);cursor:move;}
.iw-element.editor.active{border-color:#2F5D50;box-shadow:0 0 0 2px rgba(47,93,80,.2);}
.iw-input,.iw-textarea,.iw-choice{width:100%;height:100%;border:1.5px solid rgba(47,93,80,.5);background:rgba(255,255,255,.92);border-radius:6px;padding:4px 7px;font:inherit;color:#1C2B3A;outline:none;}
.iw-textarea{resize:none;padding:7px;}
.iw-input:focus,.iw-textarea:focus,.iw-choice:focus{border-color:#2F5D50;box-shadow:0 0 0 2px rgba(47,93,80,.12);}
.iw-word{width:100%;height:100%;border:0;background:rgba(255,244,191,.08);cursor:pointer;border-radius:4px;color:transparent;}
.iw-word:hover{background:rgba(255,220,100,.22);outline:1px solid rgba(201,136,42,.45);}
.iw-checkbox{width:100%;height:100%;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.82);border-radius:6px;padding:3px 6px;font-size:.78rem;color:#1C2B3A;}
.iw-checkbox input{width:18px;height:18px;}
.iw-correct{box-shadow:0 0 0 2px rgba(22,101,52,.55)!important;}
.iw-wrong{box-shadow:0 0 0 2px rgba(185,28,28,.5)!important;}
.iw-editor{width:300px;flex:0 0 300px;background:#fff;border:1px solid rgba(28,43,58,.1);border-radius:14px;box-shadow:0 9px 30px rgba(28,43,58,.1);overflow:hidden;position:sticky;top:18px;line-height:1.35;}
.iw-editor-head{padding:14px 15px;border-bottom:1px solid rgba(28,43,58,.08);font-weight:800;}
.iw-tools{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:12px;}
.iw-tool{border:1px solid rgba(28,43,58,.12);background:#F8F7F4;border-radius:9px;padding:8px 7px;font:inherit;font-size:.72rem;font-weight:700;color:#42536A;cursor:pointer;text-align:left;}
.iw-tool.active{border-color:#2F5D50;background:#EAF3EF;color:#245044;}
.iw-editor-body{padding:12px 14px;display:flex;flex-direction:column;gap:9px;max-height:58vh;overflow:auto;}
.iw-editor-body label{display:flex;flex-direction:column;gap:4px;font-size:.69rem;font-weight:800;color:#607086;}
.iw-editor-body input,.iw-editor-body textarea,.iw-editor-body select{width:100%;border:1px solid rgba(28,43,58,.14);border-radius:8px;padding:7px 8px;font:inherit;font-size:.78rem;color:#1C2B3A;background:#fff;}
.iw-editor-note{padding:10px 13px;background:#FFF8E8;border-top:1px solid #F0DFC0;font-size:.7rem;line-height:1.45;color:#7A5A1B;}
.iw-translation{position:fixed;z-index:560;min-width:230px;max-width:340px;background:#fff;border:1px solid rgba(28,43,58,.12);border-radius:13px;box-shadow:0 18px 55px rgba(0,0,0,.22);padding:13px 15px;line-height:1.35;color:#1C2B3A;}
.iw-translation strong{display:block;font-size:1rem;margin-bottom:3px;color:#1C2B3A;}
.iw-translation span{display:block;color:#2F5D50;font-weight:700;margin-bottom:5px;}
.iw-translation small{display:block;color:#718096;}
.iw-empty-overlay{position:absolute;left:50%;top:16px;transform:translateX(-50%);background:rgba(28,43,58,.88);color:#fff;border-radius:999px;padding:7px 11px;font-size:.69rem;line-height:1;pointer-events:none;}
@media(max-width:900px){.iw-workspace{padding:10px}.iw-editor{position:fixed;left:8px;right:8px;bottom:8px;top:auto;width:auto;max-height:52vh;z-index:555}.iw-editor-body{max-height:28vh}.iw-canvas-shell{width:100%}}

'''
s = s.replace(css_marker, css + css_marker, 1)

pattern = re.compile(r"function FileChip\(\{file\}\)\{[\s\S]*?\nfunction FileUploader\(\{onUpload,uploading,setUploading\}\)\{")
match = pattern.search(s)
assert match, 'FileChip/DocumentPreviewModal block missing'
replacement = r'''function FileChip({file,onUpdate}){
  const ext=(file.name||'').split('.').pop().toLowerCase();
  const[preview,setPreview]=useState(false);
  const interactiveCount=file?.interactiveOverlay?.elements?.length||0;
  return(<>
    <button type="button" onClick={()=>setPreview(true)} className="file-chip" title="Vaata töölehte">
      <span className="fi-ext" style={{background:EXT_COLORS[ext]||'#42536A'}}>{ext.slice(0,3).toUpperCase()}</span>
      <span style={{maxWidth:170,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textAlign:'left'}}>{file.name}</span>
      {interactiveCount>0&&<span style={{fontSize:'.62rem',fontWeight:800,color:'#245044',background:'#E5F1EC',padding:'2px 5px',borderRadius:5}}>↯ {interactiveCount}</span>}
      {file.size&&<span style={{fontSize:'.66rem',color:'#8A8176',fontWeight:500}}>{CurriculumDocumentCore.formatBytes(file.size)}</span>}
      <i className="fa-solid fa-eye" style={{fontSize:'.65rem',opacity:.55,marginLeft:2}}/>
    </button>
    {preview&&ReactDOM.createPortal(<DocumentPreviewModal file={file} onUpdate={onUpdate} onClose={()=>setPreview(false)}/>,document.body)}
  </>);
}

function interactiveId(){return 'iw_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);}
function clamp01(n){return Math.max(0,Math.min(1,Number(n)||0));}
function answerStorageKey(file){
  let h=0;const raw=String(file?.url||file?.name||'worksheet');
  for(let i=0;i<raw.length;i++)h=((h<<5)-h+raw.charCodeAt(i))|0;
  return 'keelesepp_iw_'+Math.abs(h);
}

function DocumentPreviewModal({file,onClose,onUpdate}){
  const kind=CurriculumDocumentCore.previewKind(file);
  const ext=CurriculumDocumentCore.extension(file.name).toUpperCase();
  const canEdit=kind==='image'&&typeof onUpdate==='function';
  const[elements,setElements]=useState(()=>Array.isArray(file?.interactiveOverlay?.elements)?file.interactiveOverlay.elements:[]);
  const[editing,setEditing]=useState(false);
  const[tool,setTool]=useState('');
  const[selectedId,setSelectedId]=useState('');
  const[draft,setDraft]=useState(null);
  const[answers,setAnswers]=useState(()=>{try{return JSON.parse(localStorage.getItem(answerStorageKey(file))||'{}')}catch{return {}}});
  const[checked,setChecked]=useState(false);
  const[translation,setTranslation]=useState(null);
  const sheetRef=useRef();
  const elementsRef=useRef(elements);
  useEffect(()=>{elementsRef.current=elements;},[elements]);
  useEffect(()=>{try{localStorage.setItem(answerStorageKey(file),JSON.stringify(answers));}catch{}},[answers,file?.url]);
  const selected=elements.find(el=>el.id===selectedId)||null;
  const updateElements=next=>{setElements(next);elementsRef.current=next;onUpdate?.({...file,interactiveOverlay:{version:1,elements:next}});};
  const updateSelected=patch=>updateElements(elementsRef.current.map(el=>el.id===selectedId?{...el,...patch}:el));
  const removeSelected=()=>{if(!selectedId)return;updateElements(elementsRef.current.filter(el=>el.id!==selectedId));setSelectedId('');};
  const setAnswer=(id,value)=>{setAnswers(prev=>({...prev,[id]:value}));setChecked(false);};
  const startDraw=e=>{
    if(!editing||!tool||kind!=='image'||e.target!==sheetRef.current&&e.target.closest?.('.iw-element'))return;
    const rect=sheetRef.current.getBoundingClientRect();
    const x=clamp01((e.clientX-rect.left)/rect.width),y=clamp01((e.clientY-rect.top)/rect.height);
    sheetRef.current.setPointerCapture?.(e.pointerId);
    setDraft({x,y,w:.001,h:.001,type:tool,pointerId:e.pointerId});
  };
  const moveDraw=e=>{
    if(!draft||draft.pointerId!==e.pointerId)return;
    const rect=sheetRef.current.getBoundingClientRect();
    const px=clamp01((e.clientX-rect.left)/rect.width),py=clamp01((e.clientY-rect.top)/rect.height);
    setDraft(d=>({...d,w:px-d.x,h:py-d.y}));
  };
  const finishDraw=e=>{
    if(!draft||draft.pointerId!==e.pointerId)return;
    const x=draft.w<0?draft.x+draft.w:draft.x,y=draft.h<0?draft.y+draft.h:draft.y;
    const w=Math.max(Math.abs(draft.w),.035),h=Math.max(Math.abs(draft.h),draft.type==='textarea'?.07:.028);
    const el={id:interactiveId(),type:draft.type,x:clamp01(x),y:clamp01(y),w:Math.min(w,1-clamp01(x)),h:Math.min(h,1-clamp01(y)),label:'',placeholder:'',text:'',translation:'',lemma:'',options:['Valik 1','Valik 2'],correctAnswer:''};
    updateElements([...elementsRef.current,el]);setSelectedId(el.id);setDraft(null);setTool('');
  };
  const scoreClass=el=>{
    if(!checked||!el.correctAnswer||['word','textarea'].includes(el.type))return '';
    const actual=String(answers[el.id]??'').trim().toLocaleLowerCase('et');
    const correct=String(el.correctAnswer||'').trim().toLocaleLowerCase('et');
    return actual===correct?' iw-correct':' iw-wrong';
  };
  const renderElement=el=>{
    const style={left:(el.x*100)+'%',top:(el.y*100)+'%',width:(el.w*100)+'%',height:(el.h*100)+'%'};
    const active=selectedId===el.id;
    if(editing)return <div key={el.id} className={'iw-element editor'+(active?' active':'')} style={style} onPointerDown={ev=>{ev.stopPropagation();setSelectedId(el.id);}} title={el.type}><span style={{position:'absolute',left:2,top:1,fontSize:9,lineHeight:1,background:'#C9882A',color:'#fff',padding:'2px 3px',borderRadius:3}}>{el.type}</span></div>;
    if(el.type==='word')return <button key={el.id} type="button" className="iw-element iw-word" style={style} onClick={ev=>{const r=ev.currentTarget.getBoundingClientRect();setTranslation({el,left:Math.min(r.left,window.innerWidth-360),top:Math.min(r.bottom+7,window.innerHeight-150)});}} aria-label={'Tõlge: '+(el.text||'sõna')}>{el.text||'sõna'}</button>;
    if(el.type==='textarea')return <textarea key={el.id} className={'iw-element iw-textarea'+scoreClass(el)} style={style} value={answers[el.id]||''} onChange={e=>setAnswer(el.id,e.target.value)} placeholder={el.placeholder||'Kirjuta siia…'}/>;
    if(el.type==='choice')return <select key={el.id} className={'iw-element iw-choice'+scoreClass(el)} style={style} value={answers[el.id]||''} onChange={e=>setAnswer(el.id,e.target.value)}><option value="">Vali…</option>{(el.options||[]).map((opt,i)=><option value={opt} key={i}>{opt}</option>)}</select>;
    if(el.type==='checkbox')return <label key={el.id} className={'iw-element iw-checkbox'+scoreClass(el)} style={style}><input type="checkbox" checked={Boolean(answers[el.id])} onChange={e=>setAnswer(el.id,e.target.checked)}/><span>{el.label||'Valik'}</span></label>;
    return <input key={el.id} className={'iw-element iw-input'+scoreClass(el)} style={style} value={answers[el.id]||''} onChange={e=>setAnswer(el.id,e.target.value)} placeholder={el.placeholder||''}/>;
  };
  const tools=[['word','Sõna'],['input','Lühivastus'],['textarea','Pikk vastus'],['choice','Valik'],['checkbox','Märkeruut']];
  return(
    <div className="doc-preview-ov" onClick={e=>{e.stopPropagation();if(e.target===e.currentTarget)onClose();}}>
      <div className="doc-preview-box interactive-preview" role="dialog" aria-modal="true" aria-label={'Tööleht: '+file.name}>
        <div className="doc-preview-head">
          <div className="doc-preview-title"><span className="fi-ext" style={{background:EXT_COLORS[ext.toLowerCase()]||'#42536A'}}>{ext.slice(0,3)}</span><div style={{minWidth:0}}><div className="doc-preview-name">{file.name}</div><div className="doc-preview-meta">{kind==='image'?'Interaktiivne tööleht':ext}{elements.length?' · '+elements.length+' elementi':''}</div></div></div>
          <div className="doc-preview-actions iw-toolbar">
            {kind==='image'&&elements.length>0&&!editing&&<button type="button" className="btn btn-ghost btn-sm" style={{color:'#fff',borderColor:'rgba(255,255,255,.25)'}} onClick={()=>setChecked(v=>!v)}><i className="fa-solid fa-check"/> {checked?'Peida kontroll':'Kontrolli'}</button>}
            {canEdit&&<button type="button" className={'btn btn-ghost btn-sm'+(editing?' active':'')} style={!editing?{color:'#fff',borderColor:'rgba(255,255,255,.25)'}:{}} onClick={()=>{setEditing(v=>!v);setTool('');setSelectedId('');setTranslation(null);}}><i className="fa-solid fa-pen-ruler"/> {editing?'Valmis':'Muuda interaktiivseks'}</button>}
            <a href={file.url} download={file.name} className="btn btn-gold btn-sm"><i className="fa-solid fa-download"/> Laadi alla</a>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" style={{color:'#fff',borderColor:'rgba(255,255,255,.25)'}}>✕ Sulge</button>
          </div>
        </div>
        <div className="doc-preview-body">
          {kind==='image'&&<div className="iw-workspace">
            <div className="iw-canvas-shell">
              <div ref={sheetRef} className="iw-sheet" onPointerDown={startDraw} onPointerMove={moveDraw} onPointerUp={finishDraw}>
                <img src={file.url} alt={file.name} draggable="false"/>
                <div className="iw-layer">{elements.map(renderElement)}{draft&&<div className="iw-element editor active" style={{left:((draft.w<0?draft.x+draft.w:draft.x)*100)+'%',top:((draft.h<0?draft.y+draft.h:draft.y)*100)+'%',width:(Math.abs(draft.w)*100)+'%',height:(Math.abs(draft.h)*100)+'%'}}/>}</div>
                {!editing&&!elements.length&&<div className="iw-empty-overlay">Tööleht · interaktiivseid välju pole veel lisatud</div>}
              </div>
            </div>
            {editing&&<aside className="iw-editor">
              <div className="iw-editor-head">Interaktiivne kiht</div>
              <div className="iw-tools">{tools.map(([key,label])=><button type="button" key={key} className={'iw-tool'+(tool===key?' active':'')} onClick={()=>setTool(tool===key?'':key)}>{label}</button>)}</div>
              <div className="iw-editor-body">
                <div style={{fontSize:'.72rem',color:'#718096',lineHeight:1.45}}>{tool?'Lohista hiirega töölehel ala, kuhu element lisada.':'Vali tööriist ja märgi töölehel ala.'}</div>
                {selected&&<>
                  <label>Tüüp<select value={selected.type} onChange={e=>updateSelected({type:e.target.value})}>{tools.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
                  {selected.type==='word'&&<><label>Sõna<input value={selected.text||''} onChange={e=>updateSelected({text:e.target.value})}/></label><label>Vene tõlge<input value={selected.translation||''} onChange={e=>updateSelected({translation:e.target.value})}/></label><label>Algvorm / märkus<input value={selected.lemma||''} onChange={e=>updateSelected({lemma:e.target.value})}/></label></>}
                  {selected.type==='choice'&&<label>Valikud (üks real)<textarea rows="4" value={(selected.options||[]).join('\n')} onChange={e=>updateSelected({options:e.target.value.split('\n').map(v=>v.trim()).filter(Boolean)})}/></label>}
                  {selected.type==='checkbox'&&<label>Silt<input value={selected.label||''} onChange={e=>updateSelected({label:e.target.value})}/></label>}
                  {['input','textarea'].includes(selected.type)&&<label>Kohatäide<input value={selected.placeholder||''} onChange={e=>updateSelected({placeholder:e.target.value})}/></label>}
                  {!['word','textarea'].includes(selected.type)&&<label>Õige vastus<input value={selected.correctAnswer||''} onChange={e=>updateSelected({correctAnswer:e.target.value})} placeholder={selected.type==='checkbox'?'true / false':'vastus'}/></label>}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}><label>Laius %<input type="number" min="2" max="100" value={Math.round(selected.w*100)} onChange={e=>updateSelected({w:Math.max(.02,Math.min(1-selected.x,Number(e.target.value)/100))})}/></label><label>Kõrgus %<input type="number" min="2" max="100" value={Math.round(selected.h*100)} onChange={e=>updateSelected({h:Math.max(.02,Math.min(1-selected.y,Number(e.target.value)/100))})}/></label></div>
                  <button type="button" className="btn btn-sm" style={{background:'#FFF1F2',color:'#9F1239',border:'1px solid #FECDD3'}} onClick={removeSelected}><i className="fa-solid fa-trash"/> Kustuta element</button>
                </>}
              </div>
              <div className="iw-editor-note">Muudatused lähevad tunni faili külge. Lõpetuseks vajuta tunni aknas <strong>Salvesta</strong>.</div>
            </aside>}
          </div>}
          {kind==='pdf'&&<iframe src={file.url+'#view=FitH'} title={file.name} className="doc-preview-frame" style={{width:'100%',height:'100%',minHeight:'78vh',border:0}}/>}
          {kind==='text'&&<iframe src={file.url} title={file.name} className="doc-preview-frame" sandbox=""/>}
          {kind==='download'&&<div className="doc-preview-fallback"><i className="fa-solid fa-file-arrow-down" style={{fontSize:'3rem',color:'#C9882A',marginBottom:18}}/><h3 style={{fontFamily:'Fraunces',fontSize:'1.35rem',marginBottom:8}}>{file.name}</h3><p style={{color:'#718096',lineHeight:1.55,fontSize:'.86rem',marginBottom:20}}>Wordi ja PowerPointi faile brauser turvaliselt ei kuva. Laadi dokument alla ja ava oma seadmes.</p><a href={file.url} download={file.name} className="btn btn-pine"><i className="fa-solid fa-download"/> Laadi dokument alla</a></div>}
        </div>
      </div>
      {translation&&<div className="iw-translation" style={{left:translation.left,top:translation.top}} onClick={()=>setTranslation(null)}><strong>{translation.el.text||'Sõna'}</strong><span>{translation.el.translation||'Tõlge puudub'}</span>{translation.el.lemma&&<small>{translation.el.lemma}</small>}<small style={{marginTop:6}}>Klõpsa sulgemiseks</small></div>}
    </div>
  );
}

function FileUploader({onUpload,uploading,setUploading}){'''
s = s[:match.start()] + replacement + s[match.end():]

old_simple = '<FileChip file={f}/><button onClick={()=>setFiles(p=>p.filter((_,j)=>j!==i))}'
new_simple = '<FileChip file={f} onUpdate={next=>setFiles(p=>p.map((item,j)=>j===i?next:item))}/><button onClick={()=>setFiles(p=>p.filter((_,j)=>j!==i))}'
assert old_simple in s, 'simple FileChip anchor missing'
s = s.replace(old_simple, new_simple, 1)

old_phase = '<FileChip file={f}/>'
if old_phase in s:
    new_phase = "<FileChip file={f} onUpdate={next=>{const newFiles=phFiles.map((item,j)=>j===fi2?next:item);setPhaseData(p=>({...p,[ph.key]:{...(p[ph.key]||{}),files:newFiles}}));}}/>"
    s = s.replace(old_phase, new_phase, 1)

p.write_text(s, encoding='utf-8')
print('patched interactive worksheet v1')
