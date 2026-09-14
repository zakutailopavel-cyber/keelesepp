from pathlib import Path

p=Path('haldus-exercises/index.html')
s=p.read_text(encoding='utf-8')

# Load PDF.js locally in-browser from a static CDN. This is a library, not a paid AI/API call.
needle='<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n'
assert needle in s, 'Babel script marker missing'
insert=needle+'<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>\n'
s=s.replace(needle,insert,1)

# Canvas needs the same A4 sizing behavior as images.
s=s.replace('.iw-sheet>img{display:block;width:100%;height:auto;}', '.iw-sheet>img,.iw-sheet>canvas{display:block;width:100%;height:auto;}')
css_marker='.iw-empty-overlay{position:absolute;left:50%;top:16px;transform:translateX(-50%);background:rgba(28,43,58,.88);color:#fff;border-radius:999px;padding:7px 11px;font-size:.69rem;line-height:1;pointer-events:none;}'
assert css_marker in s, 'interactive worksheet CSS marker missing'
s=s.replace(css_marker, css_marker+"\n.iw-page-nav{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:9px;padding:3px 5px;color:#fff;font-size:.72rem;font-weight:800;}\n.iw-page-nav button{width:26px;height:26px;border:0;border-radius:6px;background:rgba(255,255,255,.12);color:#fff;cursor:pointer;}\n.iw-page-nav button:disabled{opacity:.35;cursor:default;}\n.iw-pdf-status{position:absolute;left:50%;top:16px;transform:translateX(-50%);z-index:3;background:rgba(28,43,58,.9);color:#fff;border-radius:999px;padding:7px 11px;font-size:.69rem;line-height:1;pointer-events:none;}\n.iw-pdf-error{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:30px;background:#fff;color:#9f1239;font-size:.82rem;line-height:1.5;z-index:3;}",1)

# Make PDF a first-class interactive visual type.
s=s.replace("  const canEdit=kind==='image'&&typeof onUpdate==='function';", "  const isInteractiveVisual=['image','pdf'].includes(kind);\n  const canEdit=isInteractiveVisual&&typeof onUpdate==='function';")

# PDF-specific state.
needle="  const[translation,setTranslation]=useState(null);\n  const sheetRef=useRef();"
assert needle in s, 'translation state marker missing'
s=s.replace(needle, "  const[translation,setTranslation]=useState(null);\n  const[pageNum,setPageNum]=useState(1);\n  const[pdfDoc,setPdfDoc]=useState(null);\n  const[pdfPageCount,setPdfPageCount]=useState(1);\n  const[pdfBusy,setPdfBusy]=useState(false);\n  const[pdfError,setPdfError]=useState('');\n  const sheetRef=useRef();\n  const pdfCanvasRef=useRef();",1)

# Load and render PDF pages completely client-side with PDF.js.
needle="  useEffect(()=>{elementsRef.current=elements;},[elements]);\n  useEffect(()=>{try{localStorage.setItem(answerStorageKey(file),JSON.stringify(answers));}catch{}},[answers,file?.url]);"
assert needle in s, 'worksheet effects marker missing'
extra="""  useEffect(()=>{elementsRef.current=elements;},[elements]);
  useEffect(()=>{try{localStorage.setItem(answerStorageKey(file),JSON.stringify(answers));}catch{}},[answers,file?.url]);
  useEffect(()=>{
    if(kind!=='pdf')return;
    let cancelled=false;
    setPdfError('');setPdfBusy(true);setPdfDoc(null);setPageNum(1);
    const lib=window.pdfjsLib;
    if(!lib){setPdfBusy(false);setPdfError('PDF.js ei laadinud. Värskenda lehte ja proovi uuesti.');return;}
    lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const task=lib.getDocument(file.url);
    task.promise.then(doc=>{if(cancelled)return;setPdfDoc(doc);setPdfPageCount(doc.numPages||1);setPdfBusy(false);}).catch(err=>{if(cancelled)return;console.error('PDF worksheet load failed:',err);setPdfBusy(false);setPdfError('PDF-i avamine interaktiivses režiimis ebaõnnestus.');});
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
    }).then(()=>{if(!cancelled)setPdfBusy(false);}).catch(err=>{if(cancelled)return;console.error('PDF worksheet page render failed:',err);setPdfBusy(false);setPdfError('PDF-i lehe kuvamine ebaõnnestus.');});
    return()=>{cancelled=true;};
  },[kind,pdfDoc,pageNum]);"""
s=s.replace(needle,extra,1)

# Keep selection/page model page-aware.
needle="  const selected=elements.find(el=>el.id===selectedId)||null;"
assert needle in s
s=s.replace(needle, needle+"\n  const visibleElements=elements.filter(el=>(Number(el.page)||1)===pageNum);",1)

# Drawing works on images and PDFs.
s=s.replace("    if(!editing||!tool||kind!=='image'||e.target!==sheetRef.current&&e.target.closest?.('.iw-element'))return;", "    if(!editing||!tool||!isInteractiveVisual||(e.target!==sheetRef.current&&e.target.closest?.('.iw-element')))return;")

# Persist page number with every overlay element.
old="    const el={id:interactiveId(),type:draft.type,x:clamp01(x),y:clamp01(y),w:Math.min(w,1-clamp01(x)),h:Math.min(h,1-clamp01(y)),label:'',placeholder:'',text:'',translation:'',lemma:'',options:['Valik 1','Valik 2'],correctAnswer:''};"
assert old in s, 'element creation marker missing'
new="    const el={id:interactiveId(),page:pageNum,type:draft.type,x:clamp01(x),y:clamp01(y),w:Math.min(w,1-clamp01(x)),h:Math.min(h,1-clamp01(y)),label:'',placeholder:'',text:'',translation:'',lemma:'',options:['Valik 1','Valik 2'],correctAnswer:''};"
s=s.replace(old,new,1)

# Better metadata title.
s=s.replace("{kind==='image'?'Interaktiivne tööleht':ext}{elements.length?' · '+elements.length+' elementi':''}", "{isInteractiveVisual?'Interaktiivne tööleht':ext}{kind==='pdf'?' · '+pdfPageCount+' lk':''}{elements.length?' · '+elements.length+' elementi':''}")

# Check button works for both images and PDFs.
s=s.replace("{kind==='image'&&elements.length>0&&!editing&&<button", "{isInteractiveVisual&&elements.length>0&&!editing&&<button")

# Add PDF page navigation before the edit button.
needle="            {canEdit&&<button type=\"button\" className={'btn btn-ghost btn-sm'+(editing?' active':'')}"
assert needle in s, 'edit toolbar marker missing'
nav="""            {kind==='pdf'&&pdfPageCount>1&&<div className=\"iw-page-nav\"><button type=\"button\" disabled={pageNum<=1} onClick={()=>{setPageNum(p=>Math.max(1,p-1));setSelectedId('');setTranslation(null);}}>‹</button><span>{pageNum} / {pdfPageCount}</span><button type=\"button\" disabled={pageNum>=pdfPageCount} onClick={()=>{setPageNum(p=>Math.min(pdfPageCount,p+1));setSelectedId('');setTranslation(null);}}>›</button></div>}
"""+needle
s=s.replace(needle,nav,1)

# Replace image-only workspace + PDF iframe with a shared visual workspace.
start="          {kind==='image'&&<div className=\"iw-workspace\">"
end="          {kind==='pdf'&&<iframe src={file.url+'#view=FitH'} title={file.name} className=\"doc-preview-frame\" style={{width:'100%',height:'100%',minHeight:'78vh',border:0}}/>}"
assert start in s and end in s, 'workspace/PDF iframe markers missing'
start_i=s.index(start)
end_i=s.index(end,start_i)+len(end)
old_block=s[start_i:end_i]
# Reuse the existing editor markup by transforming only the visual wrapper and element list.
block=old_block
block=block.replace(start, "          {isInteractiveVisual&&<div className=\"iw-workspace\">")
block=block.replace("                <img src={file.url} alt={file.name} draggable=\"false\"/>", "                {kind==='image'?<img src={file.url} alt={file.name} draggable=\"false\"/>:<canvas ref={pdfCanvasRef} aria-label={file.name+' leht '+pageNum}/>}\n                {kind==='pdf'&&pdfBusy&&<div className=\"iw-pdf-status\">PDF leht laadib…</div>}\n                {kind==='pdf'&&pdfError&&<div className=\"iw-pdf-error\">{pdfError}</div>}")
block=block.replace("<div className=\"iw-layer\">{elements.map(renderElement)}", "<div className=\"iw-layer\">{visibleElements.map(renderElement)}")
block=block.replace("{!editing&&!elements.length&&<div className=\"iw-empty-overlay\">", "{!editing&&!visibleElements.length&&<div className=\"iw-empty-overlay\">")
block=block.replace(end, '')
s=s[:start_i]+block+s[end_i:]

# Add selected page indication to editor panel.
needle="              <div className=\"iw-editor-head\">Interaktiivne kiht</div>"
assert needle in s
s=s.replace(needle, "              <div className=\"iw-editor-head\">Interaktiivne kiht{kind==='pdf'&&<span style={{float:'right',fontSize:'.68rem',color:'#718096'}}>lk {pageNum}</span>}</div>",1)

p.write_text(s,encoding='utf-8')
print('patched PDF.js interactive worksheet support')
