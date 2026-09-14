from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def rep(path,old,new,label):
    p=ROOT/path
    s=p.read_text(encoding='utf-8')
    n=s.count(old)
    if n!=1: raise SystemExit(f'{label}: expected 1 match, got {n}')
    p.write_text(s.replace(old,new,1),encoding='utf-8')

# Student can explicitly persist work-in-progress through the same assignment boundary.
rep(Path('crm-v2/src/services/firebase/homework.js'),
"""  async submitWorksheet({ assignmentId, answers, score, errorLog }) {
    if (!assignmentId) throw new Error('Töölehte ei leitud.');""",
"""  async saveWorksheetDraft({ assignmentId, answers }) {
    if (!assignmentId) throw new Error('Töölehte ei leitud.');
    const { db } = requireFirebaseClient();
    const updatedAt = new Date().toISOString();
    const payload = { status: 'in_progress', answers: answers || {}, updatedAt };
    await updateDoc(doc(db, 'worksheetAssignments', assignmentId), payload);
    return payload;
  },
  async submitWorksheet({ assignmentId, answers, score, errorLog }) {
    if (!assignmentId) throw new Error('Töölehte ei leitud.');""",
'draft repository method')

# Reusable read-only visual worksheet is also shown to the teacher in submission review.
rep(Path('crm-v2/src/features/homework/WorksheetPlayer.jsx'),
"""export default function WorksheetPlayer({ assignment, repository, readOnly = false, onClose, onSubmitted }) {""",
"""export function VisualWorksheetSubmissionPreview({ files = [], answers = {} }) {
  const pages = useMemo(() => visualWorksheetPages(files), [files]);
  if (!pages.length) return null;
  return <div className=\"visual-worksheet-pages visual-worksheet-pages--review\">{pages.map((page) => <VisualWorksheetPage page={page} answers={answers} done readOnly onAnswer={() => {}} key={`${page.file.url || page.file.name}-${page.fileIndex}`} />)}</div>;
}

export default function WorksheetPlayer({ assignment, repository, readOnly = false, onClose, onSubmitted }) {""",
'export teacher preview')

rep(Path('crm-v2/src/features/homework/WorksheetPlayer.jsx'),
"""  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');""",
"""  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [error, setError] = useState('');""",
'draft state')

rep(Path('crm-v2/src/features/homework/WorksheetPlayer.jsx'),
"""  const submit = async () => {
    if (!progress.complete) { setError(`Täida kõik vastused (${progress.answered}/${progress.total}).`); return; }""",
"""  const saveDraft = async () => {
    setSavingDraft(true); setError('');
    try {
      await repository.saveWorksheetDraft({ assignmentId: assignment.id, answers });
      setDraftSaved(true); onSubmitted?.();
    } catch (saveError) { setError(saveError.message || 'Töölehe salvestamine ebaõnnestus.'); }
    finally { setSavingDraft(false); }
  };

  const submit = async () => {
    if (!progress.complete) { setError(`Täida kõik vastused (${progress.answered}/${progress.total}).`); return; }""",
'draft save handler')

rep(Path('crm-v2/src/features/homework/WorksheetPlayer.jsx'),
"""    ? <><span className=\"worksheet-progress\">{progress.answered}/{progress.total} vastust</span><Button variant=\"secondary\" onClick={onClose}>Sulge</Button><Button loading={saving} onClick={submit}><Send size={17} /> Esita tööleht</Button></>""",
"""    ? <><span className=\"worksheet-progress\">{progress.answered}/{progress.total} vastust{draftSaved ? ' · Salvestatud' : ''}</span><Button variant=\"secondary\" loading={savingDraft} onClick={saveDraft}>Salvesta</Button><Button variant=\"secondary\" onClick={onClose}>Sulge</Button><Button loading={saving} onClick={submit}><Send size={17} /> Esita tööleht</Button></>""",
'draft footer')

rep(Path('crm-v2/src/features/homework/HomeworkPage.jsx'),
"""import WorksheetPlayer from './WorksheetPlayer.jsx';""",
"""import WorksheetPlayer, { VisualWorksheetSubmissionPreview } from './WorksheetPlayer.jsx';""",
'teacher preview import')

rep(Path('crm-v2/src/features/homework/HomeworkPage.jsx'),
"""        <section><h3>Õpilase vastused</h3><AnswerList answers={reviewing.answers} /></section>""",
"""        {reviewing.submissionKind === 'worksheet' ? <section><h3>Tööleht vastustega</h3><VisualWorksheetSubmissionPreview files={reviewing.source?.files || []} answers={reviewing.answers || {}} /></section> : null}
        <section><h3>Õpilase vastused</h3><AnswerList answers={reviewing.answers} /></section>""",
'teacher review sheet')

# Review layout uses the same original image at a slightly tighter spacing.
rep(Path('crm-v2/src/styles/index.css'),
""".visual-worksheet-pages+.worksheet-blocks{padding-top:0}""",
""".visual-worksheet-pages+.worksheet-blocks{padding-top:0}.visual-worksheet-pages--review{padding:0;gap:16px}.visual-worksheet-pages--review .visual-worksheet-page{width:100%;box-shadow:none}""",
'teacher review css')

# Strengthen focused regression contract.
p=ROOT/'visual-worksheet-student-v1.test.js'
s=p.read_text(encoding='utf-8')
old="""const player=fs.readFileSync('crm-v2/src/features/homework/WorksheetPlayer.jsx','utf8');
const styles=fs.readFileSync('crm-v2/src/styles/index.css','utf8');"""
new="""const player=fs.readFileSync('crm-v2/src/features/homework/WorksheetPlayer.jsx','utf8');
const homeworkPage=fs.readFileSync('crm-v2/src/features/homework/HomeworkPage.jsx','utf8');
const styles=fs.readFileSync('crm-v2/src/styles/index.css','utf8');"""
if s.count(old)!=1: raise SystemExit('test imports anchor mismatch')
s=s.replace(old,new,1)
old="""  assert.match(styles,/\\.visual-worksheet-layer\\{position:absolute;inset:0\\}/);
});
"""
new="""  assert.match(styles,/\\.visual-worksheet-layer\\{position:absolute;inset:0\\}/);
});

test('visual worksheet supports draft saving and teacher reviews the same page with answers',()=>{
  assert.match(homework,/async saveWorksheetDraft\\(\\{ assignmentId, answers \\}\\)/);
  assert.match(player,/repository\\.saveWorksheetDraft\\(\\{ assignmentId: assignment\\.id, answers \\}\\)/);
  assert.match(player,/export function VisualWorksheetSubmissionPreview/);
  assert.match(homeworkPage,/VisualWorksheetSubmissionPreview files=\\{reviewing\\.source\\?\\.files \\|\\| \\[\\]\\} answers=\\{reviewing\\.answers \\|\\| \\{\\}\\}/);
});
"""
if s.count(old)!=1: raise SystemExit('test extension anchor mismatch')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# Document draft-save and teacher review behavior in the current slice section.
p=ROOT/'docs/PROJECT_STATE.md'
s=p.read_text(encoding='utf-8')
old="""`submitWorksheet` write boundary. Open responses are required for completion but are not auto-scored unless the
teacher explicitly configured `correctAnswer`; word-translation hotspots remain informational."""
new="""`submitWorksheet` write boundary. Open responses are required for completion but are not auto-scored unless the
teacher explicitly configured `correctAnswer`; word-translation hotspots remain informational. Students can
explicitly save an `in_progress` draft, and teacher review re-renders the same worksheet page with submitted
answers positioned over the original image."""
if s.count(old)!=1: raise SystemExit('PROJECT_STATE slice text anchor mismatch')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

print('patched visual worksheet draft save + teacher review')
