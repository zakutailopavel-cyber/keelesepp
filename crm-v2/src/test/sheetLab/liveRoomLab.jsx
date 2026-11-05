import { useMemo } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import LiveRoom from '../../features/live-classroom/LiveRoom.jsx';
import { worksheetPageTitle } from '../../features/board/boardModel.js';

// sheet-lab ?live=1: the real Live Classroom (student side) around the lab sheet, every service faked in memory — to try
// typing into the sheet with the whole room (tab bar, dock, video windows, poll card, pet) on top. &focus=<blockId> puts
// the teacher's spotlight on a task.
const noop = () => {};
const unsub = () => noop;
const user = { uid: 'lab-student-uid', displayName: 'Mari Lab', roles: ['student'] };
const invitation = { id: 'lab-inv', roomKey: 'lab-inv', studentId: 'lab-student', studentName: 'Mari Lab', teacherName: 'Õpetaja', title: 'Eesti keel', status: 'accepted', respondedAt: new Date().toISOString() };

function services(assignment) {
  // as Firestore does: every saved draft comes back to every listener as a new copy of the assignment
  let sheet = { ...assignment, liveRoomKey: 'lab-inv', liveOpenedAt: new Date().toISOString() };
  const pages = [{ id: 'pg-sheet', title: worksheetPageTitle(sheet.title) }];
  const data = {};
  const boards = new Map();
  let nextId = 0;
  const drafts = [];
  const rooms = new Set();
  const lists = new Set();
  const singles = new Set();
  const emit = () => {
    rooms.forEach((onChange) => onChange([sheet]));
    lists.forEach((onChange) => onChange([sheet]));
    singles.forEach((onChange) => onChange(sheet));
  };
  const patch = (next) => { sheet = { ...sheet, ...next, worksheetDoc: JSON.parse(JSON.stringify(sheet.worksheetDoc)) }; emit(); };
  globalThis.__labLive = { drafts, patch };
  return {
    board: {
      subscribePages: (_s, onChange) => { onChange(pages); return noop; },
      // the board's own parts are kept in memory too (to try „Vali ja täida” on a line or a note over the sheet)
      subscribeElements: (_s, pageId, onChange) => { boards.set(pageId, onChange); onChange(data[pageId] || []); return () => boards.delete(pageId); },
      add: async (_s, pageId, element) => { const id = `el-${(nextId += 1)}`; data[pageId] = [...(data[pageId] || []), { id, ...element, revision: 1 }]; boards.get(pageId)?.([...data[pageId]]); return id; },
      update: async (_s, pageId, element, change) => { data[pageId] = (data[pageId] || []).map((item) => (item.id === element.id ? { ...item, ...change } : item)); boards.get(pageId)?.([...data[pageId]]); },
      remove: async (_s, pageId, id) => { data[pageId] = (data[pageId] || []).filter((item) => item.id !== id); boards.get(pageId)?.([...data[pageId]]); },
      clear: async () => 0, addPage: async () => 'pg-x',
    },
    chat: { subscribeByStudent: (_id, onChange) => { onChange([]); return noop; }, send: async () => {} },
    library: { list: async () => ({ curriculumLessons: [] }), assign: async () => ({}), uploadFile: async () => ({}) },
    homework: {
      subscribeRoomWorksheets: (_q, onChange) => { rooms.add(onChange); onChange([sheet]); return () => rooms.delete(onChange); },
      subscribeStudentLiveWorksheets: (_id, onChange) => { lists.add(onChange); onChange([sheet]); return () => lists.delete(onChange); },
      subscribeWorksheetAssignment: (_id, onChange) => { singles.add(onChange); globalThis.setTimeout(() => onChange(sheet), 0); return () => singles.delete(onChange); },
      saveWorksheetDraft: async (payload) => { drafts.push(payload); globalThis.setTimeout(() => patch({ answers: payload.answers, status: 'in_progress' }), 50); },
      submitWorksheet: async () => {},
      saveSelfAssessment: async () => {},
    },
    call: {
      signalService: { subscribe: unsub, send: async () => {} },
      presenceService: { heartbeat: async () => {}, markOffline: async () => {}, subscribe: (_id, onChange) => { onChange([]); return noop; } },
      mediaDevices: null,
      turnService: { get: async () => null },
    },
    countdown: { subscribe: (_k, _id, onChange) => { onChange(null, {}); return noop; }, set: async () => {} },
    poll: { subscribe: (_k, _id, onChange) => { onChange?.(null); return noop; }, subscribeAnswers: unsub, start: async () => {}, answer: async () => {}, close: async () => {} },
    recording: { subscribeForStudent: unsub },
    words: { subscribe: unsub, add: async () => {}, list: async () => [] },
    pet: { subscribe: unsub, load: async () => null },
  };
}

export default function LiveRoomLab({ assignment, focus = '' }) {
  const s = useMemo(() => services(focus ? { ...assignment, liveFocus: { blockId: focus } } : assignment), [assignment, focus]);
  const auth = useMemo(() => ({ user }), []);
  return <AuthContext.Provider value={auth}><MemoryRouter>
    <LiveRoom invitation={invitation} role="student" user={user} callProps={s.call} boardService={s.board} messagesRepository={s.chat} library={s.library}
      worksheetProps={{ homework: s.homework, library: s.library }} homeworkService={s.homework} recordingService={s.recording} countdownService={s.countdown} pollService={s.poll}
      streams={{ local: null, remote: null }} onLeave={noop} onEndLesson={noop} student={{ subject: 'Eesti keel', recordingConsent: false }} />
  </MemoryRouter></AuthContext.Provider>;
}
