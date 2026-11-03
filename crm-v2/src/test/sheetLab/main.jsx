/* global URLSearchParams */
import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthContext } from '../../app/AuthContext.jsx';
import WorksheetPlayer from '../../features/homework/WorksheetPlayer.jsx';
import StudentBoard from '../../features/board/StudentBoard.jsx';
import { RoomWorksheetContent } from '../../features/worksheet-studio/RoomWorksheetPanel.jsx';
import { sampleDocument } from '../../features/worksheet-studio/engine/sample.js';
import { convertLegacyWorksheet } from '../../features/worksheet-studio/engine/legacy.js';
import { catalogueBlocks } from './catalogue.js';
import { overlayFiles, legacyWorksheetData, personalDoc } from './samples.js';
import '../../styles/index.css';

// A page outside the app (vite dev only, not in the production build) that opens the real student player with a real or
// stress sheet and a fake repository. `e2e/layout` measures it; a person can open it too:
//   /sheet-lab.html?set=catalogue&theme=selge&done=1&room=1
const params = new URLSearchParams(globalThis.location.search);
const user = { uid: 'lab-student', displayName: 'Mari Lab', roles: ['student'] };

async function loadDoc(set) {
  if (set === 'catalogue') return { ...sampleDocument(), id: 'lab-catalogue', blocks: catalogueBlocks() };
  if (set === 'sample') return sampleDocument();
  if (set === 'personal') return personalDoc();
  if (set === 'legacy-converted') return convertLegacyWorksheet(legacyWorksheetData(), { title: 'Vana tööleht', level: 'A2' });
  // course:<lessonId>:<phase>[:v3]: a real course sheet; v3: the archived template v3 file, the copy old assignments hold
  const [, lessonId, phase, old] = set.split(':');
  const { COURSE_MODULES, buildCourseSheet } = await import('../../features/worksheet-generator/admin/course/registry.js');
  if (old === 'v3') {
    const files = import.meta.glob('../../features/worksheet-generator/admin/course/archive/v3/*/*.js');
    for (const load of Object.values(files)) {
      const mod = await load();
      if (mod.LESSONS?.[lessonId]) return buildCourseSheet(mod, lessonId, phase);
    }
    throw new Error(`${lessonId} v3: not in the archive`);
  }
  const mod = COURSE_MODULES.find((item) => item.LESSONS?.[lessonId]);
  if (!mod) throw new Error(`${lessonId}: no such lesson`);
  return buildCourseSheet(mod, lessonId, phase);
}

function fakeRepository(pushers, assignment) {
  const log = { drafts: [], submits: [] };
  globalThis.__lab = { log, pushers };
  const failing = () => globalThis.__labFailSave === true;
  // the teacher's live view (role=teacher): the assignment comes through the subscription, a click points at a task
  let live = assignment;
  const push = (patch) => { live = { ...live, ...patch }; pushers.forEach((onNext) => onNext(live)); };
  return {
    setWorksheetLiveFocus: async ({ blockId }) => push({ liveFocus: { blockId } }),
    setWorksheetShown: async ({ shown }) => push({ liveShown: shown }),
    setWorksheetLiveStep: async ({ on, open }) => push({ liveStep: { on, open } }),
    saveSubmissionAnnotations: async () => {},
    saveWorksheetDraft: async (payload) => { log.drafts.push(payload); if (failing()) throw new Error('Võrgu viga'); },
    submitWorksheet: async (payload) => { log.submits.push(payload); },
    saveSelfAssessment: async () => {},
    uploadRecording: async () => ({ url: 'https://example.invalid/rec.webm' }),
    subscribeWorksheetAssignment: (_id, onNext) => { pushers.push(onNext); if (params.get('role') === 'teacher') globalThis.setTimeout(() => onNext(live), 0); return () => {}; },
  };
}

function boardService() {
  const pages = [{ id: 'pg-1', title: 'Tööleht: Labori tööleht' }];
  return {
    subscribePages: (_s, onChange) => { onChange(pages); return () => {}; },
    subscribeElements: (_s, _p, onChange) => { onChange([]); return () => {}; },
    add: async () => 'x', update: async () => {}, remove: async () => {}, clear: async () => 0, addPage: async () => 'pg-2', renamePage: async () => {},
  };
}

function Lab({ assignment }) {
  const pushers = useMemo(() => [], []);
  const repository = useMemo(() => fakeRepository(pushers, assignment), [pushers, assignment]);
  const [open, setOpen] = useState(true);
  const teacher = params.get('role') === 'teacher';
  const auth = useMemo(() => ({ user: teacher ? { uid: 'lab-teacher', displayName: 'Õpetaja Lab', roles: ['teacher'] } : user }), [teacher]);
  if (params.get('room')) {
    const content = <RoomWorksheetContent current={assignment} role={teacher ? 'teacher' : 'student'} homework={repository} />;
    const service = boardService();
    return <AuthContext.Provider value={auth}><div className="lab-room" style={{ position: 'fixed', inset: 0 }}><StudentBoard studentId="lab-student" user={auth.user} staff={teacher} variant="room" service={service} worksheet={{ id: assignment.id, title: 'Labori tööleht', content }} initialPageId="pg-1" /></div></AuthContext.Provider>;
  }
  if (!open) return <button type="button" onClick={() => setOpen(true)}>Ava</button>;
  return <AuthContext.Provider value={auth}><WorksheetPlayer assignment={assignment} repository={repository} readOnly={params.get('readonly') === '1'} onClose={() => setOpen(false)} onSubmitted={() => {}} /></AuthContext.Provider>;
}

async function start() {
  const set = params.get('set') || 'catalogue';
  const base = { id: 'lab-assignment', studentId: 'lab-student', title: 'Labori tööleht', subject: 'Eesti keel', level: 'A2', topic: 'Minu päev', status: params.get('done') ? 'done' : 'open', answers: {} };
  let assignment;
  if (set === 'overlay') assignment = { ...base, files: overlayFiles(), worksheetData: { blocks: [] } };
  else if (set === 'legacy') assignment = { ...base, worksheetData: legacyWorksheetData() };
  else {
    const doc = await loadDoc(set);
    const theme = params.get('theme');
    const density = params.get('density');
    assignment = { ...base, title: doc.meta?.title || base.title, worksheetDoc: { ...doc, meta: { ...doc.meta, ...(theme ? { theme } : {}), ...(density ? { density } : {}) } } };
  }
  const saved = params.get('answers');
  if (saved) assignment.answers = JSON.parse(saved);
  globalThis.__labDoc = assignment.worksheetDoc;
  createRoot(document.getElementById('root')).render(<Lab assignment={assignment} />);
}
start().catch((error) => { document.body.textContent = `LAB ERROR: ${error.message}`; globalThis.__labError = error.message; });
