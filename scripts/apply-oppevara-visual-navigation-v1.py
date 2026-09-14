from pathlib import Path
import os
import re

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / 'haldus-exercises' / 'index.html'
PROJECT_STATE = ROOT / 'docs' / 'PROJECT_STATE.md'
ARCHITECTURE = ROOT / 'ARCHITECTURE.md'
HANDOFF = ROOT / 'docs' / 'HANDOFF_OPPEVARA_VISUAL_NAVIGATION_V1.md'
TEST_PATH = ROOT / 'oppevara-visual-navigation-v1.test.js'

html = HTML_PATH.read_text(encoding='utf-8')


def replace_once(source, old, new, label):
    count = source.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one match, found {count}')
    return source.replace(old, new, 1)


# Preserve the existing styles and add a bounded override layer for this navigation slice.
css = r'''

/* ÕPPEVARA VISUAL NAVIGATION V1 */
.subject-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;max-width:1180px;padding:28px 28px 44px;}
.subj-card{border-radius:16px;min-height:250px;}
.subj-head{padding:22px 22px 16px;}
.subj-icon-wrap{width:44px;height:44px;border-radius:12px;font-size:22px;margin-bottom:12px;}
.subj-topic-preview{display:flex;flex-wrap:wrap;gap:5px;margin-top:13px;}
.subj-topic-preview span{max-width:100%;padding:4px 7px;border-radius:7px;background:rgba(255,255,255,.66);font-size:.68rem;font-weight:700;color:#42536A;line-height:1.25;overflow-wrap:anywhere;}
.level-wrap{max-width:1180px;padding:26px 28px 48px;}
.level-title{margin-bottom:16px;}
.level-row{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;}
.level-chip{padding:18px 18px 16px;min-height:190px;gap:7px;}
.level-lead{font-size:.73rem;line-height:1.45;color:#718096;text-align:left;min-height:32px;}
.level-topic-preview{display:flex;flex-direction:column;gap:5px;width:100%;margin-top:2px;}
.level-topic-preview span{display:block;width:100%;padding:5px 7px;border-radius:7px;background:rgba(255,255,255,.68);font-size:.68rem;line-height:1.28;color:#42536A;text-align:left;font-weight:650;overflow-wrap:anywhere;}
.content-shell{max-width:1500px;grid-template-columns:minmax(260px,300px) minmax(0,1fr);gap:18px;}
.sidebar-btn{align-items:flex-start;gap:8px;line-height:1.35;white-space:normal;}
.sidebar-btn .sb-count{flex-shrink:0;margin-top:1px;}
.lesson-card{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:start;gap:14px;}
.lesson-body{min-width:0;}
.lesson-sheet-preview{appearance:none;width:100%;border:1px solid rgba(47,93,80,.16);background:linear-gradient(135deg,#F8F6F1,#EEF3EF);border-radius:12px;margin-top:9px;padding:10px;display:grid;grid-template-columns:92px minmax(0,1fr) auto;gap:12px;align-items:center;text-align:left;font:inherit;color:#1C2B3A;cursor:pointer;transition:transform .15s,border-color .15s,box-shadow .15s;}
.lesson-sheet-preview:hover{transform:translateY(-1px);border-color:rgba(47,93,80,.38);box-shadow:0 5px 16px rgba(28,43,58,.07);}
.lesson-sheet-paper{width:82px;min-height:104px;background:#fff;border:1px solid rgba(28,43,58,.12);border-radius:4px;box-shadow:0 3px 9px rgba(28,43,58,.1);padding:8px 7px;display:flex;flex-direction:column;gap:5px;overflow:hidden;}
.lesson-sheet-brand{font-family:'Fraunces',Georgia,serif;font-size:.48rem;font-weight:800;color:#2F5D50;letter-spacing:.02em;}
.lesson-sheet-line{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-size:.47rem;line-height:1.35;color:#718096;overflow-wrap:anywhere;}
.lesson-sheet-line.strong{font-size:.55rem;font-weight:800;color:#1C2B3A;-webkit-line-clamp:2;}
.lesson-sheet-line.short{display:block;width:64%;height:4px;border-radius:4px;background:#E8E5DE;margin-top:auto;}
.lesson-sheet-info{min-width:0;display:flex;flex-direction:column;gap:3px;}
.lesson-sheet-info strong{font-size:.78rem;color:#2F5D50;}
.lesson-sheet-info>span{font-size:.69rem;color:#718096;line-height:1.35;}
.lesson-sheet-snippet{display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:#42536A!important;overflow-wrap:anywhere;}
.lesson-sheet-preview>i{font-size:.72rem;color:#2F5D50;opacity:.7;}
@media(max-width:1050px){.subject-grid{grid-template-columns:repeat(2,minmax(0,1fr));}.content-shell{grid-template-columns:250px minmax(0,1fr);}}
@media(max-width:820px){.content-shell{grid-template-columns:1fr;}.lesson-card{grid-template-columns:42px minmax(0,1fr);}.lesson-actions{grid-column:2;justify-content:flex-start;flex-wrap:wrap;}.lesson-sheet-preview{grid-template-columns:78px minmax(0,1fr) auto;}.lesson-sheet-paper{width:70px;min-height:92px;}}
@media(max-width:720px){.subject-grid{grid-template-columns:1fr;padding-left:16px;padding-right:16px;}.level-wrap{padding-left:16px;padding-right:16px;}.level-row{grid-template-columns:1fr;}.lesson-sheet-preview{grid-template-columns:64px minmax(0,1fr);}.lesson-sheet-paper{width:58px;min-height:80px;}.lesson-sheet-preview>i{display:none;}}
'''
html = replace_once(html, '</style>\n</head>', css + '\n</style>\n</head>', 'visual CSS insertion')

# Rich local preview fixtures make the requested B1/B2 path inspectable without Firebase.
fixtures = r'''  {id:'preview-b1-sheet',title:'Kool ja õppimine — tööleht',subject:'Eesti keel',level:'B1',topic:'Kool ja õppimine',type:'material',description:'Harjuta koolielu teemal lugemist ja põhjendatud vastamist.',goal:'Õpilane oskab rääkida õppimisest ja põhjendada oma arvamust.',practice:'Loe teksti, vasta sisuküsimustele ja sõnasta oma seisukoht.',worksheetData:{meta:{title:'Kool ja õppimine',subject:'Eesti keel',level:'B1',name:true,date:true},blocks:[{id:'preview-b1-reading',type:'reading',instruction:'Loe lühike tekst koolipäeva korraldusest ja vasta küsimustele.',passage:'Marii arvab, et koolipäev võiks alata hiljem, sest hommikul on keeruline keskenduda.',questions:[{q:'Miks soovib Marii hilisemat koolipäeva algust?',opts:['Ta soovib rohkem keskendumisaega','Ta tahab vähem õppida','Ta ei käi hommikuti koolis']}]},{id:'preview-b1-writing',type:'writing',task:'Kirjuta 5–6 lauset: milline koolipäev aitab sinu arvates kõige paremini õppida?',lines:6}]},worksheetVersion:1,worksheetStatus:'draft'},
  {id:'preview-b2-source',title:'Arutelu ja põhjendamine',subject:'Eesti keel',level:'B2',topic:'Arutelu ja põhjendamine',type:'lesson',roadmapManaged:true,levelStage:'B2',roadmapTag:'Suhtlus',goal:'Õpilane esitab selge seisukoha ja põhjendab seda vähemalt kahe asjakohase argumendiga.',languageFocus:'Sidendid: kuigi, samas, seetõttu, sellest hoolimata.',practice:'Vali üks igapäevaelu väide, esita oma seisukoht ning reageeri õpetaja vastuväitele.',successCriteria:'Vastus on sidus, põhjendatud ja sisaldab vähemalt kahte B2-tasemele sobivat sidendit.',worksheetPrompt:'Koosta B2 aruteluülesanne, milles õppija peab seisukohta põhjendama ja vastuväitele reageerima.'},
'''
html = replace_once(html, 'const PREVIEW_LESSONS=[\n', 'const PREVIEW_LESSONS=[\n' + fixtures, 'local preview fixtures')

# Mini-preview deliberately reads only learner-facing content fields. It never consumes answer/key fields.
component = r'''
function cleanLessonPreviewText(value){
  return typeof value==='string'?value.replace(/\s+/g,' ').trim():'';
}
function LessonSheetPreview({lesson,onPreviewWorksheet}){
  const blocks=Array.isArray(lesson.worksheetData?.blocks)?lesson.worksheetData.blocks:[];
  const contentKeys=['instruction','task','text','passage','prompt'];
  const firstContentBlock=blocks.find(block=>block&&contentKeys.some(key=>cleanLessonPreviewText(block[key])));
  const blockText=firstContentBlock
    ?contentKeys.map(key=>cleanLessonPreviewText(firstContentBlock[key])).find(Boolean)||''
    :'';
  const sourceText=[lesson.practice,lesson.goal,lesson.description,lesson.worksheetPrompt]
    .map(cleanLessonPreviewText).find(Boolean)||'';
  const previewText=(blockText||sourceText).slice(0,220);
  if(!previewText&&!blocks.length)return null;
  const blockLabel=blocks.length===1?'1 ülesandeplokk':`${blocks.length} ülesandeplokki`;
  const info=blocks.length?`${blockLabel} · A4 eelvaade`:'Töölehe lähteülesanne';
  return(
    <button type="button" className="lesson-sheet-preview" onClick={()=>onPreviewWorksheet?.(lesson)} aria-label={`Ava töölehe eelvaade: ${lesson.title}`}>
      <span className="lesson-sheet-paper" aria-hidden="true">
        <span className="lesson-sheet-brand">KeeleSepp</span>
        <span className="lesson-sheet-line strong">{lesson.title}</span>
        <span className="lesson-sheet-line">{previewText}</span>
        <span className="lesson-sheet-line short"/>
      </span>
      <span className="lesson-sheet-info">
        <strong>{blocks.length?'Töölehe eelvaade':'Lähteülesande eelvaade'}</strong>
        <span>{info}</span>
        <span className="lesson-sheet-snippet">{previewText}</span>
      </span>
      <i className="fa-solid fa-arrow-up-right-from-square"/>
    </button>
  );
}

'''
marker = '// ── TOPIC VIEW ────────────────────────────────────────────────\nfunction TopicView('
if marker not in html:
    raise SystemExit('TopicView marker not found')
html = html.replace('// ── TOPIC VIEW ────────────────────────────────────────────────\n', component + '// ── TOPIC VIEW ────────────────────────────────────────────────\n', 1)

# Long topic names must wrap rather than truncate.
html = replace_once(
    html,
    "<span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1,textAlign:'left'}}>{t}</span>",
    "<span style={{whiteSpace:'normal',overflowWrap:'anywhere',flex:1,textAlign:'left'}}>{t}</span>",
    'topic sidebar wrapping'
)

# Render the visual material preview inside every normal topic lesson card.
lesson_anchor = """                       {lesson.files?.length>0&&<div className=\"file-row\">{lesson.files.map((f,i)=><FileChip key={i} file={f}/>)}</div>}"""
lesson_insert = """                       <LessonSheetPreview lesson={lesson} onPreviewWorksheet={onPreviewWorksheet}/>
                       {lesson.files?.length>0&&<div className=\"file-row\">{lesson.files.map((f,i)=><FileChip key={i} file={f}/>)}</div>}"""
# There is another files row in ExamView, so anchor around roadmap ending.
roadmap_tail = """                       )}
                       {lesson.files?.length>0&&<div className=\"file-row\">{lesson.files.map((f,i)=><FileChip key={i} file={f}/>)}</div>}"""
roadmap_new = """                       )}
                       <LessonSheetPreview lesson={lesson} onPreviewWorksheet={onPreviewWorksheet}/>
                       {lesson.files?.length>0&&<div className=\"file-row\">{lesson.files.map((f,i)=><FileChip key={i} file={f}/>)}</div>}"""
html = replace_once(html, roadmap_tail, roadmap_new, 'lesson mini preview insertion')

# Subject cards show real topics from loaded curriculum data, not a disconnected static count.
subject_old = """          {subjectDefs.map(s=>{
            const cnt=lessons.filter(l=>l.subject===s.key&&!l.__subjectPlaceholder).length;
            return("""
subject_new = """          {subjectDefs.map(s=>{
            const subjectLessons=lessons.filter(l=>l.subject===s.key&&!l.__subjectPlaceholder);
            const cnt=subjectLessons.filter(l=>!l.__placeholder).length;
            const subjectTopics=[...new Set(subjectLessons.filter(l=>!l.examPart).map(l=>l.topic).filter(Boolean))];
            return("""
html = replace_once(html, subject_old, subject_new, 'subject data calculation')
html = replace_once(
    html,
    "<div className=\"subj-sub\">{s.levels.length} taset · {s.topics.length} teemat · {EXAM_PARTS.length} eksami osa</div>",
    "<div className=\"subj-sub\">{s.levels.length} taset · {subjectTopics.length} teemat · {EXAM_PARTS.length} eksami osa</div>",
    'subject topic count'
)
subject_pills_tail = """                  </div>
                </div>
                <div className=\"subj-bar\" style={{background:s.grad}}/>"""
subject_preview = """                  </div>
                  {subjectTopics.length>0&&<div className=\"subj-topic-preview\">
                    {subjectTopics.slice(0,3).map(topic=><span key={topic}>{topic}</span>)}
                    {subjectTopics.length>3&&<span>+{subjectTopics.length-3} teemat</span>}
                  </div>}
                </div>
                <div className=\"subj-bar\" style={{background:s.grad}}/>"""
html = replace_once(html, subject_pills_tail, subject_preview, 'subject real topic preview')

# Level cards compute their own topic list and navigate to the selected level's first real topic.
level_calc_old = """            {subject.levels.map(lv=>{
              const cnt=lessons.filter(l=>l.subject===subject.key&&l.level===lv).length;
              const topicCnt=[...new Set(lessons.filter(l=>l.subject===subject.key&&l.level===lv).map(l=>l.topic).filter(Boolean))].length;
              const examCnt=lessons.filter(l=>l.subject===subject.key&&l.level===lv&&l.examPart).length;
              const hasMat=cnt>0;"""
level_calc_new = """            {subject.levels.map(lv=>{
              const levelLessons=lessons.filter(l=>l.subject===subject.key&&l.level===lv);
              const levelTopics=[...new Set(levelLessons.filter(l=>!l.examPart).map(l=>l.topic).filter(Boolean))];
              const cnt=levelLessons.filter(l=>!l.__placeholder).length;
              const topicCnt=levelTopics.length;
              const examCnt=levelLessons.filter(l=>l.examPart).length;
              const hasMat=cnt>0||topicCnt>0||examCnt>0;"""
html = replace_once(html, level_calc_old, level_calc_new, 'level data calculation')
html = replace_once(
    html,
    "onClick={()=>{const t=topics[0]||'';setNav({subject:subject.key,level:lv,topic:t});}}>",
    "onClick={()=>setNav({subject:subject.key,level:lv,topic:levelTopics[0]||''})}>",
    'level navigation target'
)
level_meta = """                  <div style={{fontSize:'.74rem',color:hasMat?'#7A7167':'#B0A898',lineHeight:1.5,marginTop:2}}>
                    {hasMat
                      ?<>{topicCnt>0&&<span>{topicCnt} teemat</span>}{examCnt>0&&<span style={{marginLeft:6}}>· {examCnt} eksamit</span>}</>
                      :<span>Tühi</span>
                    }
                  </div>
                  <div style={{fontSize:'.76rem',fontWeight:600,color:hasMat?subject.color:'#C0B8B0',marginTop:6,display:'flex',alignItems:'center',gap:4}}>
                    Ava <i className=\"fa-solid fa-arrow-right\" style={{fontSize:'.62rem'}}/>
                  </div>"""
level_meta_new = """                  <div style={{fontSize:'.74rem',color:hasMat?'#7A7167':'#B0A898',lineHeight:1.5,marginTop:2}}>
                    {hasMat
                      ?<>{topicCnt>0&&<span>{topicCnt} teemat</span>}{examCnt>0&&<span style={{marginLeft:6}}>· {examCnt} eksamit</span>}</>
                      :<span>Tühi</span>
                    }
                  </div>
                  <div className=\"level-lead\">{hasMat?'Ava teemad, tunnid ja õppematerjalid.':'Sellele tasemele ei ole veel õppematerjali lisatud.'}</div>
                  {levelTopics.length>0&&<div className=\"level-topic-preview\">
                    {levelTopics.slice(0,3).map(topic=><span key={topic}>{topic}</span>)}
                  </div>}
                  <div style={{fontSize:'.76rem',fontWeight:600,color:hasMat?subject.color:'#C0B8B0',marginTop:'auto',display:'flex',alignItems:'center',gap:4}}>
                    Ava <i className=\"fa-solid fa-arrow-right\" style={{fontSize:'.62rem'}}/>
                  </div>"""
html = replace_once(html, level_meta, level_meta_new, 'level topic previews')

# Curriculum is the primary Õppevara landing surface; explicit ?tab=library remains valid.
html = replace_once(
    html,
    "return ['library','curriculum','exercises','stats','history'].includes(requested)?requested:'library';",
    "return ['library','curriculum','exercises','stats','history'].includes(requested)?requested:'curriculum';",
    'default tab'
)

# Reorder only the first two top tabs; all other navigation remains unchanged.
tabs_old = """        <button className={'top-tab'+(tab==='library'?' active':'')} onClick={()=>setTab('library')}>
          <i className=\"fa-solid fa-book-open\"/> Raamatukogu
          <span className=\"tab-count\">{allLessons.filter(item=>!item.__placeholder).length+allExercises.length}</span>
        </button>
        <button className={'top-tab'+(tab==='curriculum'?' active':'')} onClick={()=>setTab('curriculum')}>
          <i className=\"fa-solid fa-layer-group\"/> Õppekavad
        </button>"""
tabs_new = """        <button className={'top-tab'+(tab==='curriculum'?' active':'')} onClick={()=>setTab('curriculum')}>
          <i className=\"fa-solid fa-layer-group\"/> Õppekavad
        </button>
        <button className={'top-tab'+(tab==='library'?' active':'')} onClick={()=>setTab('library')}>
          <i className=\"fa-solid fa-book-open\"/> Raamatukogu
          <span className=\"tab-count\">{allLessons.filter(item=>!item.__placeholder).length+allExercises.length}</span>
        </button>"""
html = replace_once(html, tabs_old, tabs_new, 'top tab order')

HTML_PATH.write_text(html, encoding='utf-8')

# Static regression test for the exact visual/navigation contract requested in this slice.
TEST_PATH.write_text(r'''const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const library=fs.readFileSync('haldus-exercises/index.html','utf8');

function section(start,end){
  const a=library.indexOf(start);
  const b=library.indexOf(end,a+start.length);
  assert.notEqual(a,-1,`missing section start: ${start}`);
  assert.notEqual(b,-1,`missing section end: ${end}`);
  return library.slice(a,b);
}

test('Õppevara defaults to curriculum while explicit library deep links remain supported',()=>{
  assert.match(library,/return \['library','curriculum','exercises','stats','history'\]\.includes\(requested\)\?requested:'curriculum';/);
  assert.match(library,/params\.get\('tab'\)/);
  assert.match(library,/tab==='library'/);
});

test('Õppekavad is the first primary tab before Raamatukogu',()=>{
  const tabs=section('<div className="top-tabs">','{!showSearch&&tab===\'library\'');
  const curriculum=tabs.indexOf('Õppekavad');
  const libraryIndex=tabs.indexOf('Raamatukogu');
  assert.ok(curriculum>=0&&libraryIndex>=0&&curriculum<libraryIndex);
});

test('lesson cards expose a safe mini material preview that opens WorksheetPreviewModal flow',()=>{
  assert.match(library,/function LessonSheetPreview\(\{lesson,onPreviewWorksheet\}\)/);
  const preview=section('function LessonSheetPreview','// ── TOPIC VIEW');
  assert.match(preview,/lesson\.worksheetData\?\.blocks/);
  assert.match(preview,/\['instruction','task','text','passage','prompt'\]/);
  assert.match(preview,/lesson\.practice,lesson\.goal,lesson\.description,lesson\.worksheetPrompt/);
  assert.match(preview,/Töölehe lähteülesanne/);
  assert.match(preview,/A4 eelvaade/);
  assert.match(preview,/onClick=\{\(\)=>onPreviewWorksheet\?\.\(lesson\)\}/);
  assert.doesNotMatch(preview,/correctAnswer|answerKey|solutions?|teacherContent/);
  assert.match(library,/<LessonSheetPreview lesson=\{lesson\} onPreviewWorksheet=\{onPreviewWorksheet\}\/\>/);
  assert.match(library,/function WorksheetPreviewModal\(\{lesson,onClose,onConduct\}\)/);
  assert.match(library,/onPreviewWorksheet=\{setWsPreview\}/);
});

test('topic sidebar wraps long names instead of ellipsis truncation',()=>{
  assert.match(library,/style=\{\{whiteSpace:'normal',overflowWrap:'anywhere',flex:1,textAlign:'left'\}\}>\{t\}<\/span>/);
});

test('subject and level cards preview real topics and level navigation uses the selected level',()=>{
  assert.match(library,/const subjectTopics=\[\.\.\.new Set\(subjectLessons\.filter\(l=>!l\.examPart\)\.map\(l=>l\.topic\)\.filter\(Boolean\)\)\];/);
  assert.match(library,/className="subj-topic-preview"/);
  assert.match(library,/subjectTopics\.slice\(0,3\)\.map/);
  assert.match(library,/const levelTopics=\[\.\.\.new Set\(levelLessons\.filter\(l=>!l\.examPart\)\.map\(l=>l\.topic\)\.filter\(Boolean\)\)\];/);
  assert.match(library,/className="level-lead"/);
  assert.match(library,/className="level-topic-preview"/);
  assert.match(library,/levelTopics\.slice\(0,3\)\.map/);
  assert.match(library,/level:lv,topic:levelTopics\[0\]\|\|''/);
  assert.doesNotMatch(library,/onClick=\{\(\)=>\{const t=topics\[0\]\|\|'';setNav\(\{subject:subject\.key,level:lv,topic:t\}\);\}\}/);
});
''', encoding='utf-8')

# Navigation behavior changed but data ownership did not; record the client-workspace contract.
architecture = ARCHITECTURE.read_text(encoding='utf-8')
arch_anchor = """The authenticated CRM shell is also the teacher-facing visual workspace. Primary daily and authoring
destinations render in its centre surface while the navigation rail, section header and signed-in profile
remain visible. Independent same-origin teaching applications render as embedded surfaces inside that
shell. Embedded mode removes their duplicate header. Child tools can request another same-origin workspace
through a parent message, so curriculum → worksheet and library → worksheet transitions stay in the centre
surface instead of opening browser tabs. The shell rejects cross-origin workspace requests. This migration
boundary does not change Firebase authentication, authorization or persistence. Curriculum preparation
keeps the complete query, including the stable `curriculumLessonKey`.
"""
arch_new = arch_anchor + """
Inside `haldus-exercises/`, `Õppekavad` is the primary Õppevara landing tab and `Raamatukogu` is the second
primary tab. An explicit `?tab=library` deep link remains valid. Subject → level → topic navigation and
worksheet previews stay inside the same authenticated surface and reuse `CurriculumView`, `TopicView` and
`WorksheetPreviewModal`; this is a presentation/navigation contract only and adds no new persistence model.
"""
if arch_anchor not in architecture:
    raise SystemExit('architecture anchor not found')
ARCHITECTURE.write_text(architecture.replace(arch_anchor, arch_new, 1), encoding='utf-8')

pr_url = os.getenv('OPPEVARA_PR_URL','').strip() or 'https://github.com/zakutailopavel-cyber/keelesepp/pulls'
project = PROJECT_STATE.read_text(encoding='utf-8')
header_pattern = re.compile(
    r"# KeeleSepp Project State\n\nLast verified:.*?\nRepository:.*?\nVerified main:.*?\nCurrent implementation branch:.*?\nCurrent draft PR:.*?\n",
    re.S,
)
new_header = f"""# KeeleSepp Project State

Last verified: 2026-09-14, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main: `cc8e80f8b410793b15d8661f0c65fe1ba9b2f66c` — authoritative base for this slice
Current implementation branch: `codex/oppevara-visual-navigation-v1`
Current draft PR: [{pr_url}]({pr_url})
"""
project, n = header_pattern.subn(new_header, project, count=1)
if n != 1:
    raise SystemExit(f'PROJECT_STATE header replacement expected 1, got {n}')
state_section = f"""
## Õppevara Visual Navigation v1 — DRAFT

This bounded client-side slice makes `Õppekavad` the first/default Õppevara destination while preserving
explicit `?tab=library` deep links. Subject cards are compact and preview real curriculum topics; level cards
show their own real topic examples and navigate using the selected level's first topic. Topic names wrap in
the left rail. B1/B2 lesson cards show a clickable mini material preview: real `worksheetData.blocks` report
their block count and a safe learner-facing fragment, while lessons without worksheet data are explicitly
labelled as a source task rather than a finished worksheet. The click reuses the existing
`WorksheetPreviewModal` and stays in the current KeeleSepp workspace.

Changed files: `haldus-exercises/index.html`, `oppevara-visual-navigation-v1.test.js`,
`docs/PROJECT_STATE.md`, `ARCHITECTURE.md`, and `docs/HANDOFF_OPPEVARA_VISUAL_NAVIGATION_V1.md`.
No Firebase Function, rule, index, schema, migration, production data or paid external API is changed.

Validation:
- focused Node suite: __NODE_TEST_RESULT__
- `git diff --check`: __DIFF_CHECK_RESULT__
- localhost `LOCAL_LIBRARY_PREVIEW` visual smoke and browser console: __BROWSER_RESULT__

Known limitation: the runner cannot inspect Pavel's uncommitted Mac working tree, so the described CSS work
was reproduced as a bounded override layer on the exact `cc8e80f8...` base instead of copying an unavailable
local diff. Review should therefore compare the automatic Vercel preview with the owner's local visual state.

Exactly one next safe step: review the draft Vercel preview through `Õppekavad → Eesti keel → B1/B2 → teema → töölehe eelvaade` and merge only if the visual result matches the intended local design.

"""
project = project.replace('\n## Current objective\n', '\n' + state_section + '## Current objective\n', 1)
PROJECT_STATE.write_text(project, encoding='utf-8')

HANDOFF.write_text(f'''# HANDOFF — Õppevara Visual Navigation v1

Date: 2026-09-14 (Europe/Tallinn)  
Base: `cc8e80f8b410793b15d8661f0c65fe1ba9b2f66c`  
Branch: `codex/oppevara-visual-navigation-v1`  
Draft PR: {pr_url}

## Result

- `Õppekavad` is first and is the default Õppevara tab.
- Explicit `?tab=library` still opens `Raamatukogu`.
- Subject cards preview real loaded topics instead of feeling like isolated empty cards.
- Level cards show short guidance plus up to three real topics and open the first topic from that exact level.
- Long topic names wrap in the left rail.
- Lesson cards include a compact clickable material preview. `worksheetData.blocks` shows block count and the
  first learner-facing content fragment; no answer/key fields are read. Without worksheet data, the card says
  `Töölehe lähteülesanne` and previews only `practice`, `goal`, `description` or `worksheetPrompt`.
- Clicking the mini preview reuses the existing `WorksheetPreviewModal` in the same workspace.
- Local preview fixtures cover both a real B1 worksheet and an honest B2 source-task state.

## Validation

- Focused Node suite: __NODE_TEST_RESULT__
- `git diff --check`: __DIFF_CHECK_RESULT__
- Local `LOCAL_LIBRARY_PREVIEW`: __BROWSER_RESULT__
- Firebase/production deployment: NOT RUN and not required for this client-only slice.

## Data and security impact

Presentation and navigation only. No Firestore/Storage rules, Cloud Functions, schema, migrations, student
records, financial data or production writes are changed. Mini-preview extraction intentionally excludes
answer/key fields.

## Risks / limitations

The execution environment cannot mount `/Users/pavel/Documents/ep koolitus/keelesepp-unified-workspace-v1`,
so it cannot see the owner's exact uncommitted CSS diff. The stated CSS intent was recreated on the exact
remote base as an override layer and must be visually compared in the PR preview. The localhost preview uses
non-production fixtures and is not evidence of production Firebase data shape.

## Next safe step

Review the automatic Vercel preview through `Õppekavad → Eesti keel → B1/B2 → teema → töölehe eelvaade` and
merge only if that visual comparison is accepted.
''', encoding='utf-8')

print('Applied Õppevara Visual Navigation v1 patch.')
