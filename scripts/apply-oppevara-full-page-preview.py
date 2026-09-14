from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / 'haldus-exercises' / 'index.html'
TEST = ROOT / 'oppevara-visual-navigation-v1.test.js'
HANDOFF = ROOT / 'docs' / 'HANDOFF_OPPEVARA_VISUAL_NAVIGATION_V1.md'
PROJECT_STATE = ROOT / 'docs' / 'PROJECT_STATE.md'

html = HTML.read_text(encoding='utf-8')

css_marker = "/* ── LESSON BUILDER ──────────────────────────────────────────── */"
if css_marker not in html:
    raise SystemExit('CSS insertion marker not found')

full_page_css = r'''/* FULL-PAGE FILE WORKSHEET PREVIEW */
.ws-file-preview-box{max-width:1120px;}
.ws-file-preview-box .ws-prev-body{display:block;padding:22px 20px 44px;background:#D9D7D2;}
.ws-file-document{width:100%;max-width:980px;margin:0 auto;}
.ws-file-summary{margin:0 auto 18px;max-width:900px;background:rgba(255,255,255,.88);border:1px solid rgba(28,43,58,.1);border-radius:12px;padding:11px 14px;color:#42536A;font-size:.82rem;line-height:1.5;}
.ws-file-pages{width:100%;display:flex;flex-direction:column;align-items:center;gap:28px;}
.ws-file-page{width:min(900px,100%);}
.ws-file-page-surface{width:100%;background:#fff;border:1px solid rgba(28,43,58,.12);border-radius:6px;overflow:hidden;box-shadow:0 12px 38px rgba(28,43,58,.16);}
.ws-file-page-image{display:block;width:100%;height:auto;max-height:none;object-fit:contain;background:#fff;}
.ws-file-page-pdf{display:block;width:100%;height:min(1180px,78vh);min-height:760px;border:0;background:#fff;}
.ws-file-page-fallback{min-height:360px;display:flex;align-items:center;justify-content:center;padding:32px;background:#fff;}
.ws-file-page-meta{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 4px 0;color:#607086;font-size:.72rem;line-height:1.35;}
.ws-file-page-name{min-width:0;overflow-wrap:anywhere;}
.ws-file-page-name strong{color:#1C2B3A;margin-right:7px;}
.ws-file-page-download{flex-shrink:0;color:#2F5D50;text-decoration:none;font-weight:800;display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:7px;}
.ws-file-page-download:hover{background:rgba(47,93,80,.08);}
@media(max-width:760px){.ws-file-preview-box .ws-prev-body{padding:12px 8px 28px}.ws-file-pages{gap:18px}.ws-file-page-pdf{min-height:68vh;height:72vh}.ws-file-page-meta{align-items:flex-start;flex-direction:column;gap:4px}.ws-file-page-download{padding-left:0}}

'''
if '.ws-file-preview-box{max-width:1120px;}' not in html:
    html = html.replace(css_marker, full_page_css + css_marker, 1)

fn_start = html.find('function WorksheetPreviewModal({lesson,onClose,onConduct}) {')
if fn_start < 0:
    raise SystemExit('WorksheetPreviewModal start not found')
structured_start = html.find('  const{meta={},blocks=[]}=ws;', fn_start)
if structured_start < 0:
    raise SystemExit('WorksheetPreviewModal structured branch marker not found')

new_head = r'''function WorksheetPreviewModal({lesson,onClose,onConduct}) {
  const ws=lesson.worksheetData;
  if(!ws) {
    const files=Array.isArray(lesson.files)?lesson.files:[];
    const downloadFiles=()=>{
      files.forEach((file,index)=>{
        const a=document.createElement('a');
        a.href=file.url;
        a.download=file.name||`${lesson.title||'tooleht'}-${index+1}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    };
    return(
      <div className="ws-prev-ov" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
        <div className="ws-prev-box ws-file-preview-box">
          <div className="ws-prev-head">
            <div>
              <div style={{color:'#fff',fontWeight:700,fontSize:'.95rem'}}>{lesson.title}</div>
              <div style={{color:'rgba(255,255,255,.45)',fontSize:'.75rem'}}>{lesson.subject} · {lesson.level} · {lesson.topic}{files.length?` · ${files.length} ${files.length===1?'lehekülg/fail':'lehekülge/faili'}`:''}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              {files.length>0&&<button onClick={downloadFiles} className="btn btn-gold btn-sm"><i className="fa-solid fa-download"/> {files.length>1?`Laadi ${files.length} faili`:'Laadi alla'}</button>}
              <button onClick={onClose} className="btn btn-ghost btn-sm" style={{color:'#fff',borderColor:'rgba(255,255,255,.2)'}}>✕ Sulge</button>
            </div>
          </div>
          <div className="ws-prev-body">
            <div className="ws-file-document">
              {lesson.description&&<div className="ws-file-summary">{lesson.description}</div>}
              {files.length>0
                ?<div className="ws-file-pages">{files.map((f,i)=>{
                  const kind=CurriculumDocumentCore.previewKind(f);
                  const isPdf=kind==='pdf';
                  const isImage=kind==='image';
                  return(
                    <section key={(f.url||f.name||'file')+'-'+i} className="ws-file-page">
                      <div className="ws-file-page-surface">
                        {isImage&&<img className="ws-file-page-image" src={f.url} alt={f.name||`Töölehe lehekülg ${i+1}`}/>}
                        {isPdf&&<iframe className="ws-file-page-pdf" src={f.url+'#view=FitH&toolbar=0&navpanes=0'} title={f.name||`Tööleht ${i+1}`}/>}
                        {!isImage&&!isPdf&&<div className="ws-file-page-fallback"><FileChip file={f}/></div>}
                      </div>
                      <div className="ws-file-page-meta">
                        <div className="ws-file-page-name"><strong>{isPdf?'PDF-dokument':isImage?`Lehekülg ${i+1}`:`Fail ${i+1}`}</strong>{f.name||'Nimetu fail'}{f.size?` · ${CurriculumDocumentCore.formatBytes(f.size)}`:''}</div>
                        <a className="ws-file-page-download" href={f.url} download={f.name||''}><i className="fa-solid fa-download"/> Laadi alla</a>
                      </div>
                    </section>
                  );
                })}</div>
                :<div style={{textAlign:'center',padding:'42px 0',color:'#718096',fontSize:'.84rem',background:'#fff',borderRadius:12}}>
                  <i className="fa-solid fa-folder-open" style={{fontSize:'1.6rem',marginBottom:8,display:'block',opacity:.3}}/>
                  Failid puuduvad
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

'''
html = html[:fn_start] + new_head + html[structured_start:]
HTML.write_text(html, encoding='utf-8')

# Extend focused regression coverage.
test_text = TEST.read_text(encoding='utf-8')
if "file-backed worksheet preview renders attachments as full worksheet pages" not in test_text:
    test_text += r'''

test('file-backed worksheet preview renders attachments as full worksheet pages',()=>{
  const modal=section('function WorksheetPreviewModal({lesson,onClose,onConduct}) {','  const{meta={},blocks=[]}=ws;');
  assert.match(modal,/className="ws-prev-box ws-file-preview-box"/);
  assert.match(modal,/className="ws-file-pages"/);
  assert.match(modal,/CurriculumDocumentCore\.previewKind\(f\)/);
  assert.match(modal,/className="ws-file-page-image"/);
  assert.match(modal,/className="ws-file-page-pdf"/);
  assert.match(modal,/Lehekülg \$\{i\+1\}/);
  assert.doesNotMatch(modal,/className="ws-a4"/);
  assert.doesNotMatch(modal,/maxHeight:300/);
  assert.match(library,/\.ws-file-page-image\{display:block;width:100%;height:auto;max-height:none/);
});
'''
    TEST.write_text(test_text, encoding='utf-8')

# Record the refinement in current handoff/state docs without rewriting prior history.
handoff = HANDOFF.read_text(encoding='utf-8')
needle = "- Local preview fixtures cover both a real B1 worksheet and an honest B2 source-task state.\n"
addition = needle + "- File-backed worksheets now render as full-size document pages: each image attachment is a separate large page, while PDF attachments use a full-width embedded document view instead of a tiny file thumbnail inside one artificial A4 sheet.\n"
if needle in handoff and 'File-backed worksheets now render as full-size document pages' not in handoff:
    handoff = handoff.replace(needle, addition, 1)
    HANDOFF.write_text(handoff, encoding='utf-8')

state = PROJECT_STATE.read_text(encoding='utf-8')
state_needle = "`WorksheetPreviewModal` and stays in the current KeeleSepp workspace.\n"
state_add = state_needle + "Attached image/PDF worksheets are also treated as documents rather than small attachments: image files render as full-size pages and PDFs receive a full-width embedded preview.\n"
if state_needle in state and 'Attached image/PDF worksheets are also treated as documents' not in state:
    state = state.replace(state_needle, state_add, 1)
    PROJECT_STATE.write_text(state, encoding='utf-8')

print('Applied full-page file worksheet preview refinement.')
