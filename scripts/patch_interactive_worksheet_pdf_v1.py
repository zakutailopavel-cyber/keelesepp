from pathlib import Path

p=Path('haldus-exercises/index.html')
s=p.read_text(encoding='utf-8')

# PDF.js is a client-side library only; no paid AI/API is used.
needle='<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n'
assert needle in s, 'Babel script marker missing'
assert 'pdf.min.js' not in s, 'PDF.js already present'
s=s.replace(needle, needle+'<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>\n', 1)

old='.iw-sheet>img{display:block;width:100%;height:auto;}'
assert old in s, 'worksheet image CSS marker missing'
s=s.replace(old, '.iw-sheet>img,.iw-sheet>canvas{display:block;width:100%;height:auto;}', 1)

css_marker='.iw-empty-overlay{position:absolute;left:50%;top:16px;transform:translateX(-50%);background:rgba(28,43,58,.88);color:#fff;border-radius:999px;padding:7px 11px;font-size:.69rem;line-height:1;pointer-events:none;}'
assert css_marker in s, 'interactive worksheet CSS marker missing'
s=s.replace(css_marker, css_marker+"\n.iw-page-nav{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:9px;padding:3px 5px;color:#fff;font-size:.72rem;font-weight:800;}\n.iw-page-nav button{width:26px;height:26px;border:0;border-radius:6px;background:rgba(255,255,255,.12);color:#fff;cursor:pointer;}\n.iw-page-nav button:disabled{opacity:.35;cursor:default;}\n.iw-pdf-status{position:absolute;left:50%;top:16px;transform:translateX(-50%);z-index:3;background:rgba(28,43,58,.9);color:#fff;border-radius:999px;padding:7px 11px;font-size:.69rem;line-height:1;pointer-events:none;}\n.iw-pdf-error{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:30px;background:#fff;color:#9f1239;font-size:.82rem;line-height:1.5;z-index:3;}", 1)

old="  const canEdit=kind==='image'&&typeof onUpdate==='function';"
assert old in s, 'canEdit marker missing'
s=s.replace(old, "  const isInteractiveVisual=['image','pdf'].includes(kind);\n  const canEdit=isInteractiveVisual&&typeof onUpdate==='function';", 1)

old="  const[translation,setTranslation]=useState(null);\n  const sheetRef=useRef();"
assert old in s, 'translation state marker missing'
s=s.replace(old, "  const[translation,setTranslation]=useState(null);\n  const[pageNum,setPageNum]=useState(1);\n  const[pdfDoc,setPdfDoc]=useState(null);\n  const[pdfPageCount,setPdfPageCount]=useState(1);\n  const[pdfBusy,setPdfBusy]=useState(false);\n  const[pdfError,setPdfError]=useState('');\n  const sheetRef=useRef();\n  const pdfCanvasRef=useRef();", 1)

old="  useEffect(()=>{elementsRef.current=elements;},[elements]);\n  useEffect(()=>{try{localStorage.setItem(answerStorageKey(file),JSON.stringify(answers));}catch{}},[answers,file?.url]);"
assert old in s, 'worksheet effects marker missing'
new="""  useEffect(()=>{elementsRef.current=elements;},[elements]);
  useEffect(()=>{try{localStorage.setItem(answerStorageKey(file),JSON.stringify(answers));}catch{}},[answers,file?.url]);
  useEffect(()=>{
    if(kind!=='pdf')return;
    let cancelled=false;
    setPdfError('');setPdfBusy(true);setPdfDoc(null);setPageNum(1);
    const lib=window.pdfjsLib;
    if(!lib){setPdfBusy(false);setPdfError('PDF.js ei laadinud. Värskenda lehte ja proovi uuesti.');return;}
    lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const task=lib.getDocument(file.url);
    task.promise.then(doc=>{
      if(cancelled)return;
      setPdfDoc(doc);setPdfPageCount(doc.numPages||1);setPdfBusy(false);
    }).catch(err=>{
      if(cancelled)return;
      console.error('PDF worksheet load failed:',err);
      setPdfBusy(false);setPdfError('PDF-i avamine interaktiivses režiimis ebaõnnestus.');
    });
    return()=>{cancelled=true;try{task.destroy();}catch{}};
  },[kind,file.url]);
  useEffect(()=>{
    if(kind!=='pdf'||!pdfDoc||!pdfCanvasRef.current)return;
    let cancelled=false;
    setPdfBusy(true);setPdfError('');
    pdfDoc.getPage(pageNum).then(page=>{
      if(cancelled)return null;
      const canvas=pdfCanvasRef.current;
      const viewport=page.getViewport({scale:1.65});
      canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
      const ctx=canvas.getContext('2d',{alpha:false});
      return page.render({canvasContext:ctx,viewport}).promise;
    }).then(()=>{if(!cancelled)setPdfBusy(false);}).catch(err=>{
      if(cancelled)return;
      console.error('PDF worksheet page render failed:',err);
      setPdfBusy(false);setPdfError('PDF-i lehe kuvamine ebaõnnestus.');
    });
    return()=>{cancelled=true;};
  },[kind,pdfDoc,pageNum]);"""
s=s.replace(old,new,1)

old="  const selected=elements.find(el=>el.id===selectedId)||null;"
assert old in s, 'selected marker missing'
s=s.replace(old, old+"\n  const visibleElements=elements.filter(el=>(Number(el.page)||1)===pageNum);", 1)

old="    if(!editing||!tool||kind!=='image'||e.target!==sheetRef.current&&e.target.closest?.('.iw-element'))return;"
assert old in s, 'draw guard marker missing'
s=s.replace(old, "    if(!editing||!tool||!isInteractiveVisual||(e.target!==sheetRef.current&&e.target.closest?.('.iw-element')))return;", 1)

old="    const el={id:interactiveId(),type:draft.type,x:clamp01(x),y:clamp01(y),w:Math.min(w,1-clamp01(x)),h:Math.min(h,1-clamp01(y)),label:'',placeholder:'',text:'',translation:'',lemma:'',options:['Valik 1','Valik 2'],correctAnswer:''};"
assert old in s, 'element creation marker missing'
s=s.replace(old, "    const el={id:interactiveId(),page:pageNum,type:draft.type,x:clamp01(x),y:clamp01(y),w:Math.min(w,1-clamp01(x)),h:Math.min(h,1-clamp01(y)),label:'',placeholder:'',text:'',translation:'',lemma:'',options:['Valik 1','Valik 2'],correctAnswer:''};", 1)

old="{kind==='image'?'Interaktiivne tööleht':ext}{elements.length?' · '+elements.length+' elementi':''}"
assert old in s, 'preview meta marker missing'
s=s.replace(old, "{isInteractiveVisual?'Interaktiivne tööleht':ext}{kind==='pdf'?' · '+pdfPageCount+' lk':''}{elements.length?' · '+elements.length+' elementi':''}", 1)

old="{kind==='image'&&elements.length>0&&!editing&&<button"
assert old in s, 'check button marker missing'
s=s.replace(old, "{isInteractiveVisual&&elements.length>0&&!editing&&<button", 1)

old="            {canEdit&&<button type=\"button\" className={'btn btn-ghost btn-sm'+(editing?' active':'')}"
assert old in s, 'edit button marker missing'
nav="""            {kind==='pdf'&&pdfPageCount>1&&<div className="iw-page-nav"><button type="button" disabled={pageNum<=1} onClick={()=>{setPageNum(p=>Math.max(1,p-1));setSelectedId('');setTranslation(null);}}>‹</button><span>{pageNum} / {pdfPageCount}</span><button type="button" disabled={pageNum>=pdfPageCount} onClick={()=>{setPageNum(p=>Math.min(pdfPageCount,p+1));setSelectedId('');setTranslation(null);}}>›</button></div>}
"""+old
s=s.replace(old, nav, 1)

old="          {kind==='image'&&<div className=\"iw-workspace\">"
assert old in s, 'image workspace marker missing'
s=s.replace(old, "          {isInteractiveVisual&&<div className=\"iw-workspace\">", 1)

old='                <img src={file.url} alt={file.name} draggable="false"/>'
assert old in s, 'image tag marker missing'
s=s.replace(old, "                {kind==='image'?<img src={file.url} alt={file.name} draggable=\"false\"/>:<canvas ref={pdfCanvasRef} aria-label={file.name+' leht '+pageNum}/>}\n                {kind==='pdf'&&pdfBusy&&<div className=\"iw-pdf-status\">PDF leht laadib…</div>}\n                {kind==='pdf'&&pdfError&&<div className=\"iw-pdf-error\">{pdfError}</div>}", 1)

old='<div className="iw-layer">{elements.map(renderElement)}'
assert old in s, 'overlay render marker missing'
s=s.replace(old, '<div className="iw-layer">{visibleElements.map(renderElement)}', 1)

old='{!editing&&!elements.length&&<div className="iw-empty-overlay">'
assert old in s, 'empty overlay marker missing'
s=s.replace(old, '{!editing&&!visibleElements.length&&<div className="iw-empty-overlay">', 1)

old='              <div className="iw-editor-head">Interaktiivne kiht</div>'
assert old in s, 'editor head marker missing'
s=s.replace(old, "              <div className=\"iw-editor-head\">Interaktiivne kiht{kind==='pdf'&&<span style={{float:'right',fontSize:'.68rem',color:'#718096'}}>lk {pageNum}</span>}</div>", 1)

old="          {kind==='pdf'&&<iframe src={file.url+'#view=FitH'} title={file.name} className=\"doc-preview-frame\" style={{width:'100%',height:'100%',minHeight:'78vh',border:0}}/>}\n"
assert old in s, 'old PDF iframe marker missing'
s=s.replace(old, '', 1)

p.write_text(s,encoding='utf-8')
print('patched PDF.js interactive worksheet support')
