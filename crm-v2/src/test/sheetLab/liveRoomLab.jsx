import { useMemo, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import LiveRoom from '../../features/live-classroom/LiveRoom.jsx';
import { worksheetPageTitle } from '../../features/board/boardModel.js';
import DeviceCheckNotice from '../../features/device-check/DeviceCheckNotice.jsx';

// sheet-lab ?live=1: the real Live Classroom (student side) around the lab sheet, every service faked in memory — to try
// typing into the sheet with the whole room (tab bar, dock, video windows, poll card, pet) on top. &focus=<blockId> puts
// the teacher's spotlight on a task.
// Room layout checks (small screens): &liveRole=teacher shows the teacher's room; &call=1 uses the browser's camera
// (Chromium --use-fake-device-for-media-stream) and shows the call buttons after „Alusta kõnet” / „Liitu kõnega”;
// &rec=1 the student's „Tundi salvestatakse”; &timer=1 a running countdown; &poll=1 a quick poll for the student;
// &hints=1 the teacher's „Täna harjutada” box; &device=1 the teacher's warning about the student's device.
const noop = () => {};
const params = new globalThis.URLSearchParams(globalThis.location?.search || '');
const flag = (name) => params.get(name) === '1';
const deviceService = { forStudent: async () => ({ deviceCheck: { status: 'warn', issues: ['speaker'], browser: 'Chrome / Windows', at: new Date().toISOString() } }) };
const unsub = () => noop;
const teacherRole = params.get('liveRole') === 'teacher';
const user = teacherRole ? { uid: 'lab-teacher-uid', displayName: 'Pavel Zakutailo', roles: ['teacher'] } : { uid: 'lab-student-uid', displayName: 'Mari Lab', roles: ['student'] };
const invitation = { id: 'lab-inv', roomKey: 'lab-inv', studentId: 'lab-student', studentUid: 'lab-student-uid', studentName: 'Mari Lab', teacherName: 'Pavel Zakutailo', title: 'Eesti keel', status: 'accepted', respondedAt: new Date().toISOString() };

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
      mediaDevices: flag('call') ? globalThis.navigator?.mediaDevices || null : null,
      turnService: { get: async () => null },
      ...(flag('call') && !teacherRole ? { autoAnswer: false } : {}),
    },
    countdown: { subscribe: (_k, _id, onChange) => { onChange(flag('timer') ? { running: true, remainingMs: 300000, durationMs: 300000, label: 'Lugemine', updatedAt: Date.now() } : null, {}); return noop; }, set: async () => {} },
    poll: {
      subscribe: (_k, _id, onChange) => { onChange?.(flag('poll') ? { status: 'open', round: 1, mode: 'choice', question: 'Kumb on õige?', options: ['Ma lähen koju', 'Ma lähe koju'], correctIndex: 0 } : null); return noop; },
      subscribeAnswers: unsub, subscribeMyAnswer: unsub, subscribeKey: unsub, start: async () => {}, answer: async () => {}, close: async () => {},
    },
    recording: {
      subscribeForStudent: (_q, onChange) => { onChange(flag('rec') ? [{ id: 'rec-1', status: 'recording' }] : []); return noop; },
      subscribeTranscribers: (onChange) => { onChange([]); return noop; },
      listForStudent: async () => (flag('hints') ? [{ id: 'r1', invitationId: 'inv-old', startedAt: '2026-11-01T10:00:00Z', analysis: { errors: [
        { said: 'Täna ma olen väsinud.', corrected: 'Täna olen ma väsinud.', kind: 'sõnajärg', startMs: 1000 },
        { said: 'Eile ma läksin poodi.', corrected: 'Eile läksin ma poodi.', kind: 'sõnajärg', startMs: 2000 },
      ] } }] : []),
    },
    plan: { subscribe: (_k, onChange) => { onChange(null); return noop; }, save: async () => {} },
    moments: { add: async (r) => ({ id: 'm1', ...r }), addMany: async (rs) => rs.map((r, i) => ({ id: `m${i}`, ...r })), setLabel: async () => {}, remove: async () => {} },
    words: { subscribe: unsub, add: async () => {}, list: async () => [] },
    pet: { subscribe: unsub, load: async () => null },
  };
}

export default function LiveRoomLab({ assignment, focus = '' }) {
  const s = useMemo(() => services(focus ? { ...assignment, liveFocus: { blockId: focus } } : assignment), [assignment, focus]);
  const auth = useMemo(() => ({ user }), []);
  // the teacher's „Kõneaeg” pill shows once there is a local stream (the fake camera)
  const [streams, setStreams] = useState({ local: null, remote: null });
  return <AuthContext.Provider value={auth}><MemoryRouter>
    <LiveRoom invitation={invitation} role={teacherRole ? 'teacher' : 'student'} user={user} planService={s.plan} momentsService={s.moments} callProps={{ ...s.call, onMediaStreams: setStreams }} boardService={s.board} messagesRepository={s.chat} library={s.library}
      worksheetProps={{ homework: s.homework, library: s.library }} homeworkService={s.homework} recordingService={s.recording} countdownService={s.countdown} pollService={s.poll}
      stageNotice={teacherRole && flag('device') ? <DeviceCheckNotice className="dcn-room" viewer={user} studentId="lab-student" onClose={noop} service={deviceService} /> : null}
      streams={streams} onLeave={noop} onEndLesson={noop} student={{ subject: 'Eesti keel', recordingConsent: false }} />
  </MemoryRouter></AuthContext.Provider>;
}
