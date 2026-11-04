import {
  ArrowLeft, ClipboardList, Eye, Languages, LibraryBig, Menu, MessageSquare, Mic, MicOff, Monitor, MonitorOff,
  MoreHorizontal, Phone, PhoneOff, Presentation, Redo2, RefreshCw, Send, Sparkles, Timer, Undo2, Users, Video, VideoOff, X,
} from 'lucide-react';
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingState } from '../../components/ui/index.js';
import StudentBoard from '../board/StudentBoard.jsx';
import { imageSize, sheetBoardTitle, worksheetPageTitle } from '../board/boardModel.js';
import { CountdownBadge, CountdownControls } from './CountdownTimer.jsx';
import { useCountdown } from './useCountdown.js';
import { QuickPollCard, QuickPollPanel } from './QuickPoll.jsx';
import { useQuickPoll } from './useQuickPoll.js';
import { pageSelectionText } from '../board/selectionText.js';
import { groupSheetTabs } from './sheetTabs.js';
import RoomWorksheetPanel, { RoomWorksheetContent } from '../worksheet-studio/RoomWorksheetPanel.jsx';
import { usePastSheets } from './usePastSheets.jsx';
import MomentButton from './MomentButton.jsx';
import { useRecentLessons } from './useRecentLessons.js';
import TalkMeter from './TalkMeter.jsx';
import RecordingIndicator from '../lesson-recording/RecordingIndicator.jsx';
import RoomPet from '../pet/RoomPet.jsx';
import { transcriberLabel, useTranscriberStatus } from '../lesson-recording/transcriberStatus.js';
import { timestampMillis } from './invitationModel.js';
import { useLiveCall } from './useLiveCall.js';
import { useObserverPeers } from './useLessonObserver.js';
import ObserverMedia from './ObserverMedia.jsx';
import { studentBoardService } from '../../services/firebase/studentBoard.js';
import { homeworkService as firebaseHomework } from '../../services/firebase/homework.js';
import { fileKind } from './roomMaterials.js';
import LessonPlanPanel, { LessonPlanPill } from './LessonPlanPanel.jsx';
import { useLessonPlan } from './useLessonPlan.js';
import { defaultPlanSteps } from './lessonPlan.js';
import { lessonTimingFor } from './lessonLink.js';
import { attendanceMarks, plannedStartMs } from './roomAttendance.js';
import FloatingWindow, { FloatingLayer } from './FloatingWindow.jsx';
import ScreenStage, { StageToggle } from './ScreenStage.jsx';
import { rightInset } from './floatingLayout.js';
import './liveRoom.css';

// the side panels and the teacher's recorder download when they are first opened, so the room (call and board) opens
// sooner; a student never downloads the teacher's tools
// LessonHints (teacher only) builds warm-up sheets, i.e. needs every worksheet block
const LessonHints = lazy(() => import('./LessonHints.jsx'));
const RoomRecorder = lazy(() => import('../lesson-recording/RoomRecorder.jsx'));
const WarmupPanel = lazy(() => import('./WarmupPanel.jsx'));
const LessonWordsPanel = lazy(() => import('../vocabulary/LessonWordsPanel.jsx'));
const LessonHomeworkPanel = lazy(() => import('./LessonHomeworkPanel.jsx'));
const LessonEndPanel = lazy(() => import('./LessonEndPanel.jsx'));
const MaterialsPanel = lazy(() => import('./MaterialsPanel.jsx'));

const dateLabel = (date = new Date()) => new Intl.DateTimeFormat('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
const clock = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${String(h).padStart(2, '0')}:${m}:${s}`;
};
const initial = (name) => String(name || '?').trim().charAt(0).toUpperCase() || '?';
// signal strength from the call state: 3 bars connected, 2 connecting, 1 waiting/reconnecting, 0 otherwise
const BARS = { connected: 3, connecting: 2, reconnecting: 1, waiting: 1 };
// the movable video windows (owner 2026-11-04): the other side 4:3, the own picture 16:10; first placed top right
const remoteHeight = (w) => Math.round(w * 0.75);
const selfHeight = (w) => Math.round(w * 0.625);
const narrow = (bounds) => bounds.w < 700;
const remoteDefault = (bounds) => ({ ax: 'right', ay: 'top', dx: 14, dy: 56, w: narrow(bounds) ? 112 : 220, min: false });
const selfDefault = (bounds) => {
  const remoteW = narrow(bounds) ? 112 : 220;
  return { ax: 'right', ay: 'top', dx: 14, dy: 56 + remoteHeight(remoteW) + 8, w: narrow(bounds) ? 92 : 132, min: narrow(bounds) };
};
const observerDefault = (bounds) => ({ ax: 'left', ay: 'bottom', dx: 14, dy: 14, w: narrow(bounds) ? 96 : 150, min: false });

function Signal({ status, label }) {
  const level = BARS[status] || 0;
  return <span className={`lr-signal lr-signal--${level}`} role="img" aria-label={label}>{[1, 2, 3].map((bar) => <i key={bar} className={bar <= level ? 'is-on' : ''} />)}</span>;
}

function IconButton({ label, active, danger, children, className = '', ...props }) {
  return <button type="button" className={`lr-icon ${active ? 'is-active' : ''} ${danger ? 'is-danger' : ''} ${className}`} aria-label={label} title={label} {...props}>{children}</button>;
}

function Drawer({ title, onClose, children, wide = false }) {
  return <section className={`lr-drawer ${wide ? 'lr-drawer--wide' : ''}`} aria-label={title}>
    <header><strong>{title}</strong><IconButton label="Sulge" onClick={onClose}><X size={18} /></IconButton></header>
    <div className="lr-drawer__body"><Suspense fallback={<LoadingState label="Laen…" />}>{children}</Suspense></div>
  </section>;
}

function ChatPanel({ invitation, user, repository, messages, error }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const listRef = useRef(null);
  useEffect(() => { listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight }); }, [messages.length]);
  const send = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setSendError('');
    try {
      await repository.send({ studentId: invitation.studentId, studentName: invitation.studentName, teacher: invitation.teacherName, text }, user);
      setText('');
    } catch (nextError) {
      setSendError(nextError?.message || 'Sõnumit ei saanud saata.');
    } finally {
      setSending(false);
    }
  };
  return <div className="lr-chat">
    <div className="lr-chat__list" ref={listRef}>
      {messages.slice(-60).map((message) => <div key={message.id} className={`lr-chat__msg ${message.fromUid === user.uid ? 'is-mine' : ''}`}>
        <small>{message.fromName}</small><p>{message.text}</p>
      </div>)}
      {!messages.length ? <p className="lr-muted">Sõnumeid veel pole. Kirjutatu jõuab ka „Suhtlus” lehele.</p> : null}
    </div>
    {error || sendError ? <p className="lr-error" role="alert">{sendError || error}</p> : null}
    <form className="lr-chat__form" onSubmit={send}>
      <input aria-label="Sõnum" placeholder="Kirjuta sõnum…" value={text} maxLength={4000} onChange={(event) => setText(event.target.value)} />
      <IconButton label="Saada" type="submit" disabled={sending || !text.trim()}><Send size={17} /></IconButton>
    </form>
  </div>;
}

// microphone level from the local stream (0…1), so a wrong or muted microphone is visible before speaking
function MicLevel({ stream }) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
    const track = stream?.getAudioTracks?.()[0];
    if (!AudioCtx || !track) return undefined;
    let frame = 0;
    let context;
    try {
      context = new AudioCtx();
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      context.createMediaStreamSource(new globalThis.MediaStream([track])).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (const value of data) peak = Math.max(peak, Math.abs(value - 128));
        setLevel(Math.min(1, peak / 64));
        frame = globalThis.requestAnimationFrame(tick);
      };
      tick();
    } catch { return undefined; }
    return () => { globalThis.cancelAnimationFrame(frame); context?.close?.(); };
  }, [stream]);
  return <div className="lr-meter" role="meter" aria-label="Mikrofoni tase" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)}><i style={{ width: `${Math.round(level * 100)}%` }} /></div>;
}

function DevicesPanel({ call, stream }) {
  if (!call.hasLocalMedia) return <p className="lr-muted">Seadmed ilmuvad, kui kõne on alanud (kaamera ja mikrofon sees).</p>;
  const select = (kind, label, items, value) => <label className="lr-field"><span>{label}</span>
    <select value={value} disabled={call.deviceBusy} onChange={(event) => call.switchDevice(kind, event.target.value)}>
      {!items.some((item) => item.id === value) ? <option value={value}>Vaikimisi</option> : null}
      {items.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select></label>;
  return <div className="lr-devices">
    {select('audio', 'Mikrofon', call.devices.audio, call.selectedDevices.audioId)}
    <MicLevel stream={stream} />
    <p className="lr-muted">Räägi — riba peab liikuma. Kui ei liigu, vali teine mikrofon.</p>
    {select('video', 'Kaamera', call.devices.video, call.selectedDevices.videoId)}
    <p className="lr-muted">Valik jääb selles brauseris meelde.</p>
  </div>;
}

/**
 * The Live Classroom room: full-screen lesson with the call in the top bar, the student's board in the middle,
 * video tiles on the right and drawers for chat, participants, materials and the lesson worksheet.
 */
export default function LiveRoom({
  invitation, role, user, student = null, callProps, boardService, messagesRepository, library, worksheetProps = {},
  recordingService, wordsService, homeworkService, summaryService, petRepository, streams, onLeave, onEndLesson, ending = false, observerProps,
  planService, countdownService, momentsService, pollService, boardCopies,
}) {
  const teacher = role === 'teacher';
  const call = useLiveCall({ autoAnswer: role === 'student', ...callProps, invitation, role, user });
  // an administrator watching the lesson receives this side's camera and microphone; both sides see it
  const watching = useObserverPeers({ ...observerProps, invitationId: invitation.id, user, localStream: call.localStream, enabled: invitation.status === 'accepted' });
  // a guest by lesson link (functions/live-guest.js) has this room only: no chat history, words, pet or uploads of the card
  const guest = user?.guest === true;
  const boardRef = useRef(null);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const [panel, setPanel] = useState('');
  // „Määra õpilasele” from a page's ⋯ menu: the homework panel opens with that page attached
  const [assignPage, setAssignPage] = useState(null);
  const [menu, setMenu] = useState('');
  const [sheet, setSheet] = useState(null);
  const [sheetList, setSheetList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatError, setChatError] = useState('');
  const [seenCount, setSeenCount] = useState(null);
  const [notice, setNotice] = useState('');
  // the badge in the top bar is only an eye: when an administrator starts watching, it is also said in words
  const watchingCount = watching.observers.length;
  const watchedBefore = useRef(0);
  useEffect(() => {
    if (watchingCount > watchedBefore.current) setNotice('Administraator vaatab tundi');
    watchedBefore.current = watchingCount;
  }, [watchingCount]);
  const [now, setNow] = useState(() => Date.now());
  // recording starts by itself with the call when the student card has consent
  const [recState, setRecState] = useState({ recording: false, error: '', recordingId: '', t0: 0 });
  // „Hetk” marks keep their place in the running recording (or only the clock time without one)
  const momentRecording = useMemo(() => (recState.recording && recState.recordingId ? { id: recState.recordingId, t0: recState.t0 } : null), [recState.recording, recState.recordingId, recState.t0]);
  const consent = student ? student.recordingConsent === true : null;
  // is the transcriber on the school Mac running? (the recording itself never depends on it)
  const transcriber = useTranscriberStatus({ ...(recordingService ? { service: recordingService } : {}), enabled: teacher });
  const startedAt = useMemo(() => timestampMillis(invitation.respondedAt) || timestampMillis(invitation.createdAt) || Date.now(), [invitation.createdAt, invitation.respondedAt]);
  const lessonDate = useMemo(() => dateLabel(new Date(startedAt)), [startedAt]);
  const subject = student?.subject || invitation.subject || (teacher ? '' : invitation.title);

  useEffect(() => {
    const timer = globalThis.setInterval(() => setNow(Date.now()), 1000);
    return () => globalThis.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (guest || !messagesRepository?.subscribeByStudent || !invitation.studentId) return undefined;
    try {
      return messagesRepository.subscribeByStudent(invitation.studentId, (items) => {
        setMessages(items);
        setSeenCount((current) => (current === null ? items.length : current));
        setChatError('');
      }, (nextError) => setChatError(nextError?.message || 'Vestlust ei saanud laadida.'));
    } catch (nextError) {
      globalThis.queueMicrotask(() => setChatError(nextError?.message || 'Vestlust ei saanud laadida.'));
      return undefined;
    }
  }, [guest, invitation.studentId, messagesRepository]);
  // messages already there when the room opened are not "new"; the chat badge counts what arrives during the lesson
  const baseline = seenCount ?? messages.length;
  useEffect(() => { if (panel === 'chat') setSeenCount(messages.length); }, [messages.length, panel]);
  const unread = panel === 'chat' ? 0 : messages.slice(baseline).filter((message) => message.fromUid !== user.uid).length;

  // the open worksheet lies on the board as its own page; both switch to it as soon as the teacher opens it
  const onSheet = useCallback((current) => {
    setSheet(current);
    if (current) setPanel((open) => (open === 'tasks' ? '' : open));
  }, []);
  const worksheet = useMemo(() => (sheet ? { id: sheet.id, title: sheetBoardTitle(sheet) } : null), [sheet]);
  // every worksheet of the lesson lies on the board on its own page (newest first)
  const boardSheets = useMemo(() => sheetList.map((item) => ({
    id: item.id,
    title: sheetBoardTitle(item),
    legacyTitle: item.title || item.worksheetDoc?.meta?.title || 'Tööleht',
    content: <RoomWorksheetContent current={item} role={role} {...(worksheetProps.homework ? { homework: worksheetProps.homework } : {})} />,
  })), [role, sheetList, worksheetProps.homework]);
  // -- the teacher's lesson plan and the student's attendance (liveLessonPlans/{invitationId}, staff-only) --
  const timing = useMemo(() => (teacher ? lessonTimingFor(invitation.id) : null), [teacher, invitation.id]);
  const phaseKey = [...new Set(sheetList.map((item) => item.phase || item.worksheetDoc?.meta?.phase || '').filter(Boolean))].sort().join(',');
  const defaultSteps = useMemo(() => defaultPlanSteps({ minutes: timing?.duration || 60, phases: phaseKey ? phaseKey.split(',') : [] }), [timing, phaseKey]);
  const plannedMs = plannedStartMs(timing);
  const planState = useLessonPlan({
    roomKey: invitation.id, kind: 'lesson', user, enabled: teacher, defaultSteps,
    plannedStart: plannedMs ? new Date(plannedMs).toISOString() : '', ...(planService ? { service: planService } : {}),
  });
  const participants = useMemo(() => [{ studentId: invitation.studentId, name: invitation.studentName, joinedAt: invitation.respondedAt, online: call.peerOnline }],
    [invitation.studentId, invitation.studentName, invitation.respondedAt, call.peerOnline]);
  const attendanceStart = plannedMs || timestampMillis(invitation.createdAt) || startedAt;
  const studentMark = attendanceMarks(participants, planState.plan.attendance, attendanceStart)[0] || null;
  const pastSheets = usePastSheets({ homework: worksheetProps.homework || firebaseHomework, studentId: guest ? '' : invitation.studentId || '', role });
  // the teacher's countdown (invitation field `countdown`): the teacher sets it, both see the badge
  // „Täna harjutada” and „Soojendus”: the student's earlier analysed lessons (teacher only, read once)
  const recent = useRecentLessons({ studentId: invitation.studentId, user, enabled: teacher && !guest, ...(recordingService ? { service: recordingService } : {}) });
  const timer = useCountdown({ kind: 'lesson', id: invitation.id, user, teacher, enabled: invitation.status !== 'closed', ...(countdownService ? { service: countdownService } : {}) });
  // „Kiirküsimus” (livePolls/lesson_{invitationId}): the teacher asks, the student answers on a card over the board
  const quick = useQuickPoll({
    kind: 'lesson', roomId: invitation.id, user, teacher, enabled: invitation.status === 'accepted' && !guest,
    participantUids: invitation.studentUid ? [invitation.studentUid] : [], studentIdOf: () => invitation.studentId, timer,
    ...(pollService ? { service: pollService } : {}),
  });
  const pollLive = Boolean(quick.poll && quick.poll.status !== 'closed');

  // the sheet tabs (teacher and student alike): only the latest lesson's sheets; older ones in „Varasemad tunnid” (sheetTabs.js)
  const [openedOlder, setOpenedOlder] = useState(() => new Set());
  const tabGroups = useMemo(() => groupSheetTabs({ roomSheets: sheetList, pastSheets, roomKey: invitation.id, opened: openedOlder }),
    [sheetList, pastSheets, invitation.id, openedOlder]);
  const keepOlder = useCallback((id) => setOpenedOlder((current) => (current.has(id) ? current : new Set([...current, id]))), []);

  // ── the teacher's page and pointer over the call's data channel (nothing is saved) ──
  const [myPage, setMyPage] = useState('');
  const myPageRef = useRef('');
  const [myPageTitle, setMyPageTitle] = useState('');
  // lesson pages the teacher opened in this lesson (for the summary)
  const [pagesSeen, setPagesSeen] = useState([]);
  // an older sheet one lands on (chosen, opened from „Materjalid”, or the teacher led the student there) stays a tab until closed
  const hiddenOlder = tabGroups?.hidden;
  const onPageChange = useCallback((id, title = '') => {
    myPageRef.current = id; setMyPage(id); setMyPageTitle(title);
    if (id && teacher) setPagesSeen((current) => [...current.filter((page) => page.id !== id), { id, title: title || current.find((page) => page.id === id)?.title || 'Leht' }]);
    if (id && title && hiddenOlder?.size) {
      const sheet = pastSheets.find((item) => hiddenOlder.has(item.id) && (worksheetPageTitle(item.title) === title || worksheetPageTitle(item.legacyTitle) === title));
      if (sheet) keepOlder(sheet.id);
    }
  }, [teacher, pastSheets, hiddenOlder, keepOlder]);
  const sheetTabs = useMemo(() => {
    if (!tabGroups) return null;
    const olderIds = new Set(tabGroups.older.flatMap((group) => group.sheets.map((item) => item.id)));
    return {
      hidden: tabGroups.hidden,
      closable: new Set([...openedOlder].filter((id) => olderIds.has(id))),
      onClose: (id) => setOpenedOlder((current) => { const next = new Set(current); next.delete(id); return next; }),
      extra: (paged) => {
        const groups = tabGroups.older.map((group) => ({ ...group, sheets: group.sheets.filter((item) => paged.has(item.id)) })).filter((group) => group.sheets.length);
        if (!groups.length) return null;
        const count = groups.reduce((sum, group) => sum + group.sheets.length, 0);
        return <select key="older" className="lr-older-sheets" aria-label="Varasemad tunnid" title="Varasemate tundide töölehed" value=""
          onChange={(event) => { const id = event.target.value; if (!id) return; keepOlder(id); boardRef.current?.openWorksheet?.(id); }}>
          <option value="">Varasemad tunnid ({count})</option>
          {groups.map((group) => <optgroup key={group.key} label={group.label}>{group.sheets.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</optgroup>)}
        </select>;
      },
    };
  }, [tabGroups, openedOlder, keepOlder]);
  const { roomChannelOpen, sendRoom, onRoomMessage } = call;
  useEffect(() => { if (teacher && roomChannelOpen) sendRoom?.({ t: 'page', pageId: myPage }); }, [teacher, roomChannelOpen, myPage, sendRoom]);
  // the student sees only „Samm X/Y” of the teacher's plan (over the data channel, nothing is saved)
  const planIndex = planState.clock.started && !planState.clock.done ? planState.clock.index : -1;
  const planCount = planState.clock.count;
  useEffect(() => { if (teacher && roomChannelOpen) sendRoom?.({ t: 'step', i: planIndex, n: planCount }); }, [teacher, roomChannelOpen, planIndex, planCount, sendRoom]);
  const [studentStep, setStudentStep] = useState(null);
  const pointerSentAt = useRef(0);
  const sendPointer = useCallback((point) => {
    if (!sendRoom) return;
    const at = Date.now();
    if (point && at - pointerSentAt.current < 50) return;
    pointerSentAt.current = at;
    sendRoom(point ? { t: 'ptr', x: point.x, y: point.y, pageId: myPageRef.current } : { t: 'ptr', off: true });
  }, [sendRoom]);
  // student: follows the teacher to the page they open (can be switched off) and sees the pointer
  const [teacherPage, setTeacherPage] = useState(null);
  const [follow, setFollow] = useState(true);
  const [pointer, setPointer] = useState(null);
  // the live board (both sides): drawings, typing, dragging and cursors go to the board; the teacher may lead the view
  const boardListeners = useRef(new Set());
  const [presenting, setPresenting] = useState(false);
  const [teacherLeads, setTeacherLeads] = useState(false);
  const [followView, setFollowView] = useState(true);
  const leadsRef = useRef(false);
  useEffect(() => {
    if (!onRoomMessage) return undefined;
    return onRoomMessage((message) => {
      if (!teacher && message.t === 'page' && typeof message.pageId === 'string') setTeacherPage(message.pageId.slice(0, 200));
      if (!teacher && message.t === 'ptr') {
        const ok = !message.off && Number.isFinite(message.x) && Number.isFinite(message.y);
        setPointer(ok ? { x: message.x, y: message.y, pageId: String(message.pageId || '') } : null);
      }
      if (!teacher && message.t === 'step') {
        const ok = Number.isInteger(message.i) && Number.isInteger(message.n) && message.i >= 0 && message.i < message.n && message.n <= 12;
        setStudentStep(ok ? { index: message.i, count: message.n } : null);
      }
      if (!teacher && message.t === 'view') {
        // a new lead brings the student along again; the end of it leaves him where he is
        const on = !message.off;
        if (on && !leadsRef.current) setFollowView(true);
        leadsRef.current = on;
        setTeacherLeads(on);
      }
      boardListeners.current.forEach((listener) => listener(message));
    });
  }, [teacher, onRoomMessage]);
  const live = useMemo(() => (roomChannelOpen && sendRoom ? {
    send: sendRoom,
    subscribe: (listener) => { boardListeners.current.add(listener); return () => boardListeners.current.delete(listener); },
    peerName: call.peerName,
  } : null), [roomChannelOpen, sendRoom, call.peerName]);
  useEffect(() => { if (!roomChannelOpen) { leadsRef.current = false; setTeacherLeads(false); } }, [roomChannelOpen]);
  useEffect(() => {
    if (teacher || !follow || teacherPage === null || teacherPage === myPageRef.current) return;
    boardRef.current?.selectPage?.(teacherPage || null);
  }, [teacher, follow, teacherPage]);
  useEffect(() => {
    if (!pointer) return undefined;
    const timer = globalThis.setTimeout(() => setPointer(null), 4000);
    return () => globalThis.clearTimeout(timer);
  }, [pointer]);
  const awayFromTeacher = !teacher && roomChannelOpen && teacherPage !== null && teacherPage !== myPage;

  // the video windows float over the board and can be moved, resized and made small (owner 2026-11-04); a window kept
  // at the right edge leaves the worksheet room beside it (owner 2026-10-23). Picture and sound go on when small.
  const [layouts, setLayouts] = useState({});
  const onLayoutChange = useCallback((id, layout) => setLayouts((current) => (current[id] === layout ? current : { ...current, [id]: layout })), []);
  // the other side's shared screen takes the main area; „Tahvel” goes back to the board while the share lasts
  const remoteScreen = call.remoteScreen || { active: false, stream: null };
  const [stageView, setStageView] = useState('screen');
  const sharingBefore = useRef(false);
  useEffect(() => {
    if (remoteScreen.active && !sharingBefore.current) setStageView('screen');
    sharingBefore.current = remoteScreen.active;
  }, [remoteScreen.active]);
  const showScreen = remoteScreen.active && stageView === 'screen';
  const [wide, setWide] = useState(() => Boolean(globalThis.matchMedia?.('(min-width: 761px)').matches));
  useEffect(() => {
    const query = globalThis.matchMedia?.('(min-width: 761px)');
    if (!query) return undefined;
    const change = () => setWide(query.matches);
    query.addEventListener?.('change', change);
    return () => query.removeEventListener?.('change', change);
  }, []);
  const insetRight = wide && !showScreen ? rightInset(Object.values(layouts), globalThis.innerWidth || 1280) : 0;
  const observerVideo = watching.observers.some((item) => watching.streams?.[item.uid || item.id]?.getVideoTracks?.().length);
  const toggle = (name) => { setMenu(''); setPanel((current) => (current === name ? '' : name)); };
  const place = async (file) => {
    const kind = fileKind(file);
    const size = kind === 'image' ? await imageSize(file.url) : { width: 1000, height: 1414 };
    const id = await boardRef.current?.insertFile({ url: file.url, name: file.name, kind, storagePath: file.storagePath || '', ...size });
    if (id) { setNotice(`„${file.name || 'Materjal'}” on tahvlil.`); setPanel(''); }
  };
  useEffect(() => {
    if (!notice) return undefined;
    const timer = globalThis.setTimeout(() => setNotice(''), 3500);
    return () => globalThis.clearTimeout(timer);
  }, [notice]);
  const uploadImage = library?.uploadFile ? (file) => library.uploadFile({ file, user }) : undefined;
  // the student may show a photo (e.g. a notebook page) on their own board
  const boardUploads = boardService || studentBoardService;
  const studentUpload = boardUploads?.uploadStudentImage ? (file) => boardUploads.uploadStudentImage(invitation.studentId, file) : undefined;

  const peerLabel = call.peerOnline ? 'võrgus' : 'pole võrgus';
  const startCall = teacher ? call.startTeacherCall : call.joinStudentCall;
  const callButton = call.hasLocalMedia
    ? <IconButton label="Lõpeta kõne" danger className="lr-call" disabled={call.busy} onClick={call.hangUp}><PhoneOff size={19} /></IconButton>
    : !teacher && !call.manualJoin
      ? <><span className="lr-pill lr-call-wait" role="status">{call.busy ? 'Ühendan…' : 'Ootan, kuni õpetaja alustab kõnet…'}</span><a className="lr-pill" href={`/kontroll?tund=${encodeURIComponent(invitation.id)}`} target="_blank" rel="noopener">Kontrolli seadet</a></>
      : <button type="button" className="lr-call-start" disabled={call.busy} onClick={startCall}><Phone size={17} /> {teacher ? 'Alusta kõnet' : 'Liitu kõnega'}</button>;

  return (
    <div className="lr" role="region" aria-label="Tunniruum">
      <header className="lr-top">
        <div className="lr-top__group">
          <IconButton label="Lahku tunniruumist" onClick={onLeave}><ArrowLeft size={19} /></IconButton>
          <IconButton label="Tunni info" active={menu === 'info'} onClick={() => setMenu(menu === 'info' ? '' : 'info')}><Menu size={19} /></IconButton>
          <div className="lr-title"><strong>Tund — {lessonDate}</strong><small>{invitation.title}{teacher ? ` · ${invitation.studentName}` : ` · ${invitation.teacherName}`}</small></div>
          <IconButton label="Võta tagasi" disabled={!history.canUndo} onClick={() => boardRef.current?.undo()}><Undo2 size={18} /></IconButton>
          <IconButton label="Tee uuesti" disabled={!history.canRedo} onClick={() => boardRef.current?.redo()}><Redo2 size={18} /></IconButton>
        </div>
        <div className="lr-top__group lr-top__center">
          {subject ? <span className="lr-pill lr-subject">{subject}</span> : null}
          {remoteScreen.active ? <StageToggle view={stageView} onChange={setStageView} /> : null}
          <span className="lr-pill lr-timer" aria-label="Tunni kestus"><span>{clock(now - startedAt)}</span><Signal status={call.status} label={`Ühendus: ${call.statusLabel}`} /></span>
          {teacher ? <LessonPlanPill clock={planState.clock} active={panel === 'plan'} onClick={() => toggle('plan')} /> : null}
          {!teacher && studentStep && roomChannelOpen ? <span className="lr-pill lr-plan-pill" role="status">Samm {studentStep.index + 1}/{studentStep.count}</span> : null}
          {call.hasLocalMedia ? <>
            <IconButton label={call.audioEnabled ? 'Lülita mikrofon välja' : 'Lülita mikrofon sisse'} active={!call.audioEnabled} onClick={call.toggleAudio}>{call.audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}</IconButton>
            <IconButton label={call.videoEnabled ? 'Lülita kaamera välja' : 'Lülita kaamera sisse'} active={!call.videoEnabled} onClick={call.toggleVideo}>{call.videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}</IconButton>
            {teacher || call.canShareScreen ? <IconButton label={call.screenSharing ? 'Lõpeta ekraani jagamine' : 'Jaga ekraani'} active={call.screenSharing} disabled={call.screenBusy} onClick={call.screenSharing ? call.stopScreenShare : call.startScreenShare}>{call.screenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />}</IconButton> : null}
          </> : null}
          {teacher && recState.recording ? (() => {
            // one pill: a Mac that does not transcribe is a warning mark inside it, not a second pill (the bar is full)
            const macOff = transcriber.known && !transcriber.online;
            return <button type="button" className={`lr-pill lr-rec ${macOff ? 'has-warning' : ''}`} onClick={() => { setMenu(''); setPanel('record'); }}
              aria-label={macOff ? 'Tundi salvestatakse, Mac ei transkribeeri — ava salvestamine' : 'Tundi salvestatakse — ava salvestamine'} title={macOff ? transcriberLabel(transcriber) : 'Tundi salvestatakse'}>
              <span className="lr-rec__dot" aria-hidden="true" />Salvestan{macOff ? <span className="lr-rec__warn" aria-hidden="true">!</span> : null}
            </button>;
          })() : null}
          {teacher && !recState.recording && call.hasLocalMedia && consent === false ? <button type="button" className="lr-pill lr-rec is-off" onClick={() => { setMenu(''); setPanel('record'); }}>Ei salvesta</button> : null}
          {teacher && !guest ? <MomentButton invitation={invitation} user={user} recording={momentRecording} {...(momentsService ? { service: momentsService } : {})} /> : null}
          {teacher ? <TalkMeter streams={streams} /> : null}
          {watching.observers.length ? <span className="lr-pill lr-observer" role="img" aria-label="Administraator vaatab tundi" title={`Administraator vaatab tundi: ${watching.observers.map((item) => item.displayName).join(', ')}`}><Eye size={16} /></span> : null}
          {awayFromTeacher ? <button type="button" className="lr-pill lr-follow" onClick={() => boardRef.current?.selectPage?.(teacherPage || null)}>Mine õpetaja lehele</button> : null}
          {teacher && roomChannelOpen ? <button type="button" className={`lr-pill lr-lead ${presenting ? 'is-on' : ''}`} aria-pressed={presenting} aria-label={presenting ? 'Lõpeta vaate juhtimine' : 'Juhi vaadet: õpilane näeb sama kohta'} title={presenting ? 'Õpilane näeb sama kohta, mida sina. Klõps: lõpeta' : 'Õpilane näeb sama kohta ja suurust, mida sina'} onClick={() => setPresenting(!presenting)}><Presentation size={16} aria-hidden="true" /><span className="lr-label">{presenting ? 'Juhin vaadet' : 'Juhi vaadet'}</span></button> : null}
          {!teacher && teacherLeads && !followView && !awayFromTeacher ? <button type="button" className="lr-pill lr-follow" onClick={() => setFollowView(true)}>Jälgi õpetaja vaadet</button> : null}
          {call.canReconnect ? <IconButton label="Taasta ühendus" disabled={call.busy} onClick={call.startTeacherCall}><RefreshCw size={18} /></IconButton> : null}
          {callButton}
        </div>
        <div className="lr-top__group lr-top__right">
          <IconButton label="Rohkem" active={menu === 'more'} onClick={() => setMenu(menu === 'more' ? '' : 'more')}><MoreHorizontal size={19} /></IconButton>
          <IconButton label="Osalejad" active={panel === 'people'} onClick={() => toggle('people')}><Users size={18} /></IconButton>
          {!guest ? <IconButton label="Vestlus" active={panel === 'chat'} onClick={() => toggle('chat')}><MessageSquare size={18} />{unread ? <span className="lr-badge">{unread}</span> : null}</IconButton> : null}
          {teacher ? <IconButton label="Taimer" active={panel === 'timer' || timer.active} onClick={() => toggle('timer')}><Timer size={18} /></IconButton> : null}
          {teacher && !guest ? <IconButton label="Kiirküsimus" active={panel === 'poll' || pollLive} onClick={() => toggle('poll')}><Sparkles size={18} /></IconButton> : null}
          {teacher ? <button type="button" aria-label="Materjalid" title="Materjalid" className={`lr-text-btn ${panel === 'materials' ? 'is-active' : ''}`} onClick={() => toggle('materials')}><LibraryBig size={17} /><span className="lr-label">Materjalid</span></button> : null}
          {!guest ? <button type="button" aria-label="Sõnad" title="Sõnad" className={`lr-text-btn ${panel === 'words' ? 'is-active' : ''}`} onClick={() => toggle('words')}><Languages size={17} /><span className="lr-label">Sõnad</span></button> : null}
          <button type="button" aria-label={sheet ? 'Ülesanded · tööleht on avatud' : 'Ülesanded'} title="Ülesanded" className={`lr-text-btn ${panel === 'tasks' ? 'is-active' : ''}`} onClick={() => { setMenu(''); if (sheet && !teacher) { boardRef.current?.openWorksheet?.(); return; } toggle('tasks'); }}><ClipboardList size={17} /><span className="lr-label">Ülesanded</span>{sheet ? <span className="lr-dot" aria-label="Tööleht on avatud" /> : null}</button>
        </div>
        {menu === 'info' ? <div className="lr-menu lr-menu--left" role="dialog" aria-label="Tunni info">
          <strong>{invitation.title}</strong>
          <dl><dt>Õpetaja</dt><dd>{invitation.teacherName}</dd><dt>Õpilane</dt><dd>{invitation.studentName}</dd>{subject ? <><dt>Aine</dt><dd>{subject}</dd></> : null}<dt>Algus</dt><dd>{new Date(startedAt).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' })}</dd></dl>
          <p className="lr-muted">Tahvel on õpilase oma tahvel: kõik joonistatu jääb alles ka pärast tundi (CRM-is „Tahvel”).</p>
        </div> : null}
        {menu === 'more' ? <div className="lr-menu" role="menu" aria-label="Rohkem">
          {teacher ? <button type="button" role="menuitem" onClick={() => { setMenu(''); boardRef.current?.newPage(`Tund ${lessonDate}`).catch((error) => setNotice(error?.message || 'Uut lehte ei saanud luua.')); }}>Uus tunnileht „Tund {lessonDate}”</button> : null}
          {teacher ? <button type="button" role="menuitem" onClick={() => { setMenu(''); setPanel('plan'); }}>Tunniplaan ja kohalolu</button> : null}
          {teacher ? <button type="button" role="menuitem" onClick={() => { setMenu(''); setPanel('homework'); }}>Anna kodutöö</button> : null}
          {teacher && !guest ? <button type="button" role="menuitem" onClick={() => { setMenu(''); setPanel('warmup'); }}>Soojendus eelmise tunni lausetest</button> : null}
          {teacher ? <button type="button" role="menuitem" onClick={() => { setMenu(''); setPanel('record'); }}>Tunni salvestamine</button> : null}
          {!teacher ? <button type="button" role="menuitemcheckbox" aria-checked={follow} onClick={() => { setMenu(''); setFollow(!follow); }}>{follow ? 'Ära jälgi õpetaja lehte' : 'Jälgi õpetaja lehte'}</button> : null}
          <button type="button" role="menuitem" onClick={() => { setMenu(''); setPanel('devices'); }}>Kaamera ja mikrofon</button>
          <button type="button" role="menuitem" onClick={() => { setMenu(''); onLeave(); }}>Lahku tunniruumist</button>
          {teacher ? <button type="button" role="menuitem" className="is-danger" disabled={ending} onClick={() => { setMenu(''); setPanel('end'); }}>Lõpeta tund</button> : null}
        </div> : null}
      </header>

      {!teacher ? <RecordingIndicator invitation={invitation} user={user} {...(recordingService ? { service: recordingService } : {})} /> : null}
      {call.error ? <p className="lr-toast lr-toast--error" role="alert">{call.error}</p> : null}
      {notice ? <p className="lr-toast" role="status">{notice}</p> : null}

      {/* the board takes the whole width; the video tiles and drawers float over its right edge (owner, 2026-10-09) */}
      <div className="lr-body lr-body--float">
        <main className="lr-stage">
          <StudentBoard
            studentId={invitation.studentId}
            user={user}
            staff={teacher}
            variant="room"
            controllerRef={boardRef}
            onHistoryChange={setHistory}
            newPageTitle={`Tund ${lessonDate}`}
            uploadImage={teacher ? uploadImage : guest ? undefined : studentUpload}
            worksheets={boardSheets}
            pastWorksheets={pastSheets}
            onPageChange={onPageChange}
            {...(teacher ? { onAssignPage: (page) => { setMenu(''); setAssignPage(page); setPanel('homework'); } } : {})}
            {...(teacher ? { onPointer: sendPointer } : { pointer: roomChannelOpen ? pointer : null })}
            live={live}
            {...(teacher ? { presenting: presenting && roomChannelOpen } : { followView: followView && teacherLeads, onFollowBreak: () => setFollowView(false) })}
            {...(boardService ? { service: boardService } : {})}
            insetRight={insetRight}
            sheetTabs={sheetTabs}
          />
          <CountdownBadge timer={timer} />
          {!teacher && !guest ? <QuickPollCard quick={quick} timer={timer} /> : null}
          {teacher && !guest ? <Suspense fallback={null}><LessonHints invitation={invitation} lessons={recent.lessons} loading={recent.loading} hidden={call.screenSharing} onWarmup={() => { setMenu(''); setPanel('warmup'); }} /></Suspense> : null}
          {remoteScreen.active ? <ScreenStage stream={remoteScreen.stream} name={call.peerName} visible={showScreen} /> : null}
          {!teacher && !guest ? <RoomPet user={user} studentId={invitation.studentId} invitationId={invitation.id}
            {...(petRepository ? { repository: petRepository } : {})} {...(wordsService ? { wordsService } : {})} {...(homeworkService ? { homeworkService } : {})} /> : null}
        </main>

        {/* the video windows: moved, resized and made small by hand, remembered in this browser (owner 2026-11-04) */}
        <FloatingLayer inset={{ right: panel && wide ? 362 : 0 }}>
          <FloatingWindow id="room-remote" label={`Video: ${call.peerName}`} heightFor={remoteHeight} defaultLayout={remoteDefault} onLayoutChange={onLayoutChange} restoreLabel={`Näita videot: ${call.peerName}`}
            restoreContent={<><span>{call.peerName}</span><Signal status={call.connected ? 'connected' : call.peerOnline ? 'waiting' : 'idle'} label={`${call.peerName} ${peerLabel}`} /></>}>
            <figure className={`lr-tile lr-tile--remote ${call.connected ? 'is-live' : ''}`}>
              <video ref={call.remoteVideoRef} autoPlay playsInline />
              {!call.connected ? <span className="lr-tile__avatar" aria-hidden="true">{initial(call.peerName)}</span> : null}
              <figcaption><span>{call.peerName}{remoteScreen.active ? ' · jagab ekraani' : ''}</span><Signal status={call.connected ? 'connected' : call.peerOnline ? 'waiting' : 'idle'} label={`${call.peerName} ${peerLabel}`} /></figcaption>
              {!call.connected ? <small className="lr-tile__state">{call.peerOnline ? call.statusLabel : `${call.peerName} ${peerLabel}`}</small> : null}
              {call.needsPlay ? <button type="button" className="lr-tap-play" onClick={call.resumePlayback}>▶ Puuduta, et näha ja kuulda<span>Нажмите, чтобы видеть и слышать</span></button> : null}
            </figure>
          </FloatingWindow>
          <FloatingWindow id="room-self" label="Video: sina" heightFor={selfHeight} defaultLayout={selfDefault} onLayoutChange={onLayoutChange}
            minimizeLabel="Peida oma pilt" restoreLabel="Näita oma pilti" restoreContent={<span>Sina</span>}>
            <figure className={`lr-tile lr-tile--self ${call.hasLocalMedia ? 'is-live' : ''}`}>
              <video ref={call.localVideoRef} autoPlay playsInline muted />
              {!call.hasLocalMedia ? <span className="lr-tile__avatar" aria-hidden="true">{initial(user.displayName)}</span> : null}
              <figcaption><span>Sina{call.screenSharing ? ' · jagad ekraani' : ''}{call.audioOnly ? ' · ainult heli' : ''}</span></figcaption>
            </figure>
          </FloatingWindow>
          {/* a speaking administrator („Räägi kaasa”): always heard; with a camera also in a window of its own */}
          {observerVideo ? <FloatingWindow id="room-observer" label="Video: administraator" heightFor={selfHeight} defaultLayout={observerDefault}
            minimizeLabel="Peida administraatori pilt" restoreLabel="Näita administraatori pilti" restoreContent={<span>Administraator</span>}>
            <ObserverMedia observers={watching.observers} streams={watching.streams || {}} showVideo />
          </FloatingWindow> : <ObserverMedia observers={watching.observers} streams={watching.streams || {}} showVideo={false} />}
        </FloatingLayer>

        <aside className={`lr-side ${panel ? 'has-drawer' : ''}`} aria-label="Paneelid">

          {panel === 'chat' ? <Drawer title="Vestlus" onClose={() => setPanel('')}><ChatPanel invitation={invitation} user={user} repository={messagesRepository} messages={messages} error={chatError} /></Drawer> : null}
          {panel === 'people' ? <Drawer title="Osalejad" onClose={() => setPanel('')}>
            <ul className="lr-people">
              <li><span className="lr-people__avatar">{initial(user.displayName)}</span><span><strong>{user.displayName || 'Sina'} (sina)</strong><small>{teacher ? 'Õpetaja' : 'Õpilane'} · võrgus</small></span></li>
              <li><span className="lr-people__avatar">{initial(call.peerName)}</span><span><strong>{call.peerName}</strong><small>{teacher ? 'Õpilane' : 'Õpetaja'} · {peerLabel}</small></span></li>
            </ul>
          </Drawer> : null}
          {panel === 'devices' ? <Drawer title="Kaamera ja mikrofon" onClose={() => setPanel('')}><DevicesPanel call={call} stream={streams?.local} /></Drawer> : null}
          {panel === 'words' ? <Drawer title="Sõnad" onClose={() => setPanel('')}><LessonWordsPanel studentId={invitation.studentId} invitationId={invitation.id} user={user} teacher={teacher} lang={/inglise|english/i.test(subject) ? 'en' : 'et'} {...(wordsService ? { service: wordsService } : {})} /></Drawer> : null}
          {panel === 'homework' && teacher ? <Drawer title="Kodutöö" onClose={() => { setPanel(''); setAssignPage(null); }}><LessonHomeworkPanel key={assignPage?.id || 'homework'} invitation={invitation} user={user} boardPage={assignPage || (myPage ? { id: myPage, title: myPageTitle || 'Tahvlileht' } : null)} assignPage={Boolean(assignPage)} worksheet={sheet ? { id: sheet.id, title: worksheet?.title || 'Tööleht' } : null} {...(homeworkService ? { service: homeworkService } : {})} /></Drawer> : null}
          {panel === 'end' && teacher ? <Drawer title="Tunni lõpp" onClose={() => setPanel('')}><LessonEndPanel invitation={invitation} user={user} subject={subject} startedAt={new Date(startedAt).toISOString()} pages={pagesSeen} sheets={sheetList.map((item) => ({ id: item.id, title: sheetBoardTitle(item), status: item.status, completedAt: item.completedAt, lessonId: item.lessonId || '' }))} ending={ending} attendance={studentMark} onEnd={() => onEndLesson({ confirmed: true })}
            {...(summaryService ? { summaryService } : {})} {...(wordsService ? { wordsService } : {})} {...(homeworkService ? { homeworkService } : {})} {...(boardCopies ? { boardCopies } : {})} /></Drawer> : null}
          {panel === 'plan' && teacher ? <Drawer title="Tunniplaan" onClose={() => setPanel('')}><LessonPlanPanel planState={planState} participants={participants} startMs={attendanceStart}
            attendanceNote="„Lõpeta tund” viib märke kalendrisse: Kohal / Hilines → Toimunud, Puudub → Puudus (ei teatanud). Hilinemise minutid jäävad tunniplaani." /></Drawer> : null}
          {panel === 'warmup' && teacher ? <Drawer title="Soojendus" onClose={() => setPanel('')}><WarmupPanel invitation={invitation} user={user} student={student} lessons={recent.lessons} loading={recent.loading} error={recent.error} {...((worksheetProps.library || library)?.assign ? { library: worksheetProps.library || library } : {})} {...(worksheetProps.homework ? { homework: worksheetProps.homework } : {})} onPlaced={() => { setPanel(''); setNotice('Soojendus on tahvlil.'); }} /></Drawer> : null}
          {panel === 'timer' && teacher ? <Drawer title="Taimer" onClose={() => setPanel('')}><CountdownControls timer={timer} /></Drawer> : null}
          {panel === 'poll' && teacher ? <Drawer title="Kiirküsimus" onClose={() => setPanel('')}><QuickPollPanel quick={quick} timer={timer} names={invitation.studentUid ? { [invitation.studentUid]: invitation.studentName } : {}}
            pickText={() => boardRef.current?.selectedText?.() || pageSelectionText()} /></Drawer> : null}
          {panel === 'materials' && teacher ? <Drawer title="Materjalid" onClose={() => setPanel('')}><MaterialsPanel library={library} onPlace={place} /></Drawer> : null}
          {/* always mounted: it follows the room's worksheet for both and lets the teacher open one */}
          <div className={panel === 'tasks' ? 'lr-drawer' : 'lr-drawer is-hidden'} aria-hidden={panel !== 'tasks'} role="region" aria-label="Ülesanded">
            <header><strong>Ülesanded</strong><IconButton label="Sulge ülesanded" onClick={() => setPanel('')}><X size={18} /></IconButton></header>
            <div className="lr-drawer__body">
              <RoomWorksheetPanel invitation={invitation} role={role} user={user} onCurrentChange={onSheet} onSheetsChange={setSheetList} showSheet={false} {...worksheetProps} />
              {sheet ? <button type="button" className="lr-text-btn" onClick={() => { setPanel(''); boardRef.current?.openWorksheet?.(); }}><ClipboardList size={16} /> Ava tööleht tahvlil</button> : null}
            </div>
          </div>
          <div className={panel === 'record' && teacher ? 'lr-drawer' : 'lr-drawer is-hidden'} aria-hidden={panel !== 'record'}>
            <header><strong>Tunni salvestamine</strong><IconButton label="Sulge salvestamine" onClick={() => setPanel('')}><X size={18} /></IconButton></header>
            <div className="lr-drawer__body">{teacher ? <><Suspense fallback={null}><RoomRecorder invitation={invitation} user={user} streams={streams} consent={consent} auto onStateChange={setRecState} subject={subject} {...(recordingService ? { service: recordingService } : {})} /></Suspense>{transcriber.known ? <p className={`lr-transcriber ${transcriber.online ? 'is-on' : 'is-off'}`} role="status">{transcriberLabel(transcriber)}</p> : null}</> : null}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
