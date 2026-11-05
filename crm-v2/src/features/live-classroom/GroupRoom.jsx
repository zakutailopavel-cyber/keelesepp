import { ArrowLeft, Columns2, LibraryBig, Rows2, MessageSquare, Mic, MicOff, MoreHorizontal, Phone, PhoneOff, Redo2, Send, Sparkles, Timer, Undo2, Users, Video, VideoOff, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CountdownBadge, CountdownControls } from './CountdownTimer.jsx';
import { useCountdown } from './useCountdown.js';
import { QuickPollCard, QuickPollPanel } from './QuickPoll.jsx';
import { useQuickPoll } from './useQuickPoll.js';
import { pageSelectionText } from '../board/selectionText.js';
import { saveGroupBoardCopies } from './groupBoardCopies.js';
import StudentBoard from '../board/StudentBoard.jsx';
import { imageSize } from '../board/boardModel.js';
import { groupBoardService } from '../../services/firebase/studentBoard.js';
import { liveGroupRoomsService } from '../../services/firebase/liveGroupRooms.js';
import MaterialsPanel from './MaterialsPanel.jsx';
import { fileKind } from './roomMaterials.js';
import { useGroupCall } from './useGroupCall.js';
import RoomRecorder from '../lesson-recording/RoomRecorder.jsx';
import RecordingIndicator from '../lesson-recording/RecordingIndicator.jsx';
import { transcriberLabel, useTranscriberStatus } from '../lesson-recording/transcriberStatus.js';
import LessonPlanPanel, { LessonPlanPill } from './LessonPlanPanel.jsx';
import { useLessonPlan } from './useLessonPlan.js';
import { defaultPlanSteps } from './lessonPlan.js';
import { timestampMillis } from './invitationModel.js';
import FloatingWindow, { FloatingLayer } from './FloatingWindow.jsx';
import { stripHeight } from './floatingLayout.js';
import MomentButton from './MomentButton.jsx';
import GroupTalkMeter from './GroupTalkMeter.jsx';
import GroupLessonHints from './GroupLessonHints.jsx';
import GroupDeviceCheckNotice from '../device-check/GroupDeviceCheckNotice.jsx';
import { groupRoomFoldSteps, useTopBarFit } from './topBarFit.js';
import './liveRoom.css';

// the group's video tiles in one movable strip (owner 2026-11-04): a column on the right by default, or a row
const ORIENTATION_KEY = 'keelesepp.liveGroupStrip';
const readOrientation = () => { try { return globalThis.localStorage?.getItem(ORIENTATION_KEY) === 'row' ? 'row' : 'column'; } catch { return 'column'; } };
// the layer lies between the page tab bar and the tool dock (as in the 1:1 room), so the strip never covers them
const FLOAT_INSET = Object.freeze({ top: 52, bottom: 66 });
const columnDefault = (bounds) => ({ ax: 'right', ay: 'top', dx: 14, dy: 4, w: bounds.w < 700 ? 96 : 180, min: false });
const rowDefault = (bounds) => ({ ax: 'left', ay: 'bottom', dx: 14, dy: 4, w: Math.min(bounds.w - 28, 760), min: false });

function RemoteTile({ tile }) {
  const ref = useRef(null);
  // phones block a video with sound until a tap: then the tile offers one
  const [needsPlay, setNeedsPlay] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.srcObject = tile.stream || null;
    const played = tile.stream ? video.play?.() : null;
    if (played?.catch) played.then(() => setNeedsPlay(false)).catch((error) => { if (error?.name === 'NotAllowedError') setNeedsPlay(true); });
  }, [tile.stream]);
  return <figure className={`lr-tile lg-tile ${tile.stream ? 'is-live' : ''}`}>
    <video ref={ref} autoPlay playsInline />
    {needsPlay ? <button type="button" className="lr-tap-play" onClick={() => ref.current?.play?.().then(() => setNeedsPlay(false)).catch(() => {})}>▶ Puuduta<span>Нажмите</span></button> : null}
    {!tile.stream ? <span className="lr-tile__avatar" aria-hidden="true">{String(tile.name || '?').charAt(0).toUpperCase()}</span> : null}
    <figcaption><span>{tile.name}</span><small>{tile.stream ? '' : tile.online ? ' · võrgus' : ' · pole võrgus'}</small></figcaption>
  </figure>;
}

function GroupChat({ messages, me, closed, onSend }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const listRef = useRef(null);
  useEffect(() => { listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight }); }, [messages.length]);
  const send = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    setError('');
    try { await onSend(text); setText(''); } catch (nextError) { setError(nextError?.message || 'Sõnumit ei saanud saata.'); }
  };
  return <div className="lr-chat">
    <div className="lr-chat__list" ref={listRef}>
      {messages.slice(-100).map((message) => <div key={message.id} className={`lr-chat__msg ${message.fromUid === me ? 'is-mine' : ''}`}><small>{message.fromName}</small><p>{message.text}</p></div>)}
      {!messages.length ? <p className="lr-muted">Grupi vestlus: kõik tunnis osalejad näevad sõnumeid.</p> : null}
    </div>
    {error ? <p className="lr-error" role="alert">{error}</p> : null}
    {closed ? <p className="lr-muted">Tund on lõppenud — vestlus jääb lugemiseks.</p> : <form className="lr-chat__form" onSubmit={send}>
      <input aria-label="Sõnum" placeholder="Kirjuta sõnum…" value={text} maxLength={2000} onChange={(event) => setText(event.target.value)} />
      <button type="submit" className="lr-icon" aria-label="Saada" disabled={!text.trim()}><Send size={17} /></button>
    </form>}
  </div>;
}

/**
 * A group lesson (owner, 2026-10-04): a teacher and up to 4 students on one group board, everyone sees everyone
 * (WebRTC mesh). The group board stays after the lesson; each student keeps their own board as well.
 */
export default function GroupRoom({
  roomId, role, user, onLeave, onEnd, turnInvitationId = '', service = liveGroupRoomsService, boardService = groupBoardService,
  library, callOptions = {}, recordings = [], myInvitation = null, recordingService, invitations = [], planService, countdownService, pollService, boardCopies,
  momentsService, deviceCheck,
}) {
  const teacher = role === 'teacher';
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [panel, setPanel] = useState('');
  const [notice, setNotice] = useState('');
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const boardRef = useRef(null);
  useEffect(() => {
    try { return service.subscribe(roomId, setRoom, (nextError) => setError(nextError?.message || 'Grupitundi ei saanud avada.')); } catch (nextError) { globalThis.queueMicrotask(() => setError(nextError?.message || 'Grupitundi ei saanud avada.')); return undefined; }
  }, [roomId, service]);
  const call = useGroupCall({ room, role, user, turnInvitationId, service, ...callOptions });
  const [messages, setMessages] = useState([]);
  const transcriber = useTranscriberStatus({ ...(recordingService ? { service: recordingService } : {}), enabled: Boolean(teacher) });
  const [seen, setSeen] = useState(null);
  useEffect(() => {
    if (!service.subscribeMessages) return undefined;
    try {
      return service.subscribeMessages(roomId, (items) => { setMessages(items); setSeen((count) => (count === null ? items.length : count)); }, () => {});
    } catch { return undefined; }
  }, [roomId, service]);
  useEffect(() => { if (panel === 'chat') setSeen(messages.length); }, [messages.length, panel]);
  const unread = panel === 'chat' ? 0 : messages.slice(seen ?? messages.length).filter((message) => message.fromUid !== user.uid).length;
  const myName = teacher ? room?.teacherName : (room?.members || []).find((member) => member.studentUid === user.uid)?.studentName;
  const closed = room?.status === 'closed';
  // the teacher's countdown on the group room doc (`countdown`): every member reads it, only the teacher sets it
  const timer = useCountdown({ kind: 'group', id: roomId, user, teacher, enabled: Boolean(room) && !closed, ...(countdownService ? { service: countdownService } : {}) });
  // „Kiirküsimus” (livePolls/group_{roomId}): every member answers on a card, the teacher sees who answered what
  const members = useMemo(() => room?.members || [], [room]);
  const memberNames = useMemo(() => Object.fromEntries(members.map((member) => [member.studentUid, member.studentName])), [members]);
  const quick = useQuickPoll({
    kind: 'group', roomId, user, teacher, enabled: Boolean(room) && !closed, participantUids: room?.memberUids || [], timer,
    studentIdOf: (uid) => members.find((member) => member.studentUid === uid)?.studentId || '',
    ...(pollService ? { service: pollService } : {}),
  });
  // -- the teacher's lesson plan and the members' attendance (liveLessonPlans/{roomId}, staff-only) --
  const defaultSteps = useMemo(() => defaultPlanSteps({ minutes: 60 }), []);
  const planState = useLessonPlan({ roomKey: roomId, kind: 'group', user, enabled: teacher, defaultSteps, ...(planService ? { service: planService } : {}) });
  const [presence, setPresence] = useState([]);
  useEffect(() => {
    if (!teacher || !service.subscribePresence) return undefined;
    try { return service.subscribePresence(roomId, setPresence, () => {}); } catch { return undefined; }
  }, [teacher, roomId, service]);
  const participants = (room?.members || []).map((member) => {
    const invitation = invitations.find((item) => item.studentId === member.studentId && item.status === 'accepted');
    const seen = presence.find((item) => item.uid === member.studentUid);
    return { studentId: member.studentId, name: member.studentName, joinedAt: invitation?.respondedAt || null, online: Boolean(seen?.online) };
  });
  const roomStart = timestampMillis(room?.createdAt) || 0;
  // recording (teacher): one recording per student — the teacher's microphone + that student's audio — on the
  // student's own invitation, so each student gets their own lesson analysis (consent from the student card)
  const [recState, setRecState] = useState({});
  const recordingCount = Object.values(recState).filter((item) => item?.recording).length;
  // „Hetk” (teacher): one press marks the moment for every student in the lesson, each on his own invitation and,
  // while his recording runs, at its place in it (so each student's lesson analysis plays it)
  const momentTargets = useMemo(() => invitations.filter((item) => item.status === 'accepted').map((invitation) => {
    const rec = recState[invitation.id];
    return { invitation, recording: rec?.recording && rec.recordingId ? { id: rec.recordingId, t0: rec.t0 } : null };
  }), [invitations, recState]);
  // the members' invitations into this room: „Täna harjutada” skips this lesson's own (unfinished) analysis
  const hintMembers = members.map((member) => ({ studentId: member.studentId, name: member.studentName, invitationId: invitations.find((item) => item.studentId === member.studentId)?.id || '' }));
  const [deviceNoticeHidden, setDeviceNoticeHidden] = useState(false);
  const anyoneConnected = call.tiles.some((tile) => tile.stream);

  const place = async (file) => {
    const kind = fileKind(file);
    const size = kind === 'image' ? await imageSize(file.url) : { width: 1000, height: 1414 };
    const id = await boardRef.current?.insertFile({ url: file.url, name: file.name, kind, storagePath: file.storagePath || '', ...size });
    if (id) { setNotice(`„${file.name || 'Materjal'}” on tahvlil.`); setPanel(''); }
  };
  const [orientation, setOrientation] = useState(readOrientation);
  const flip = () => setOrientation((current) => {
    const next = current === 'row' ? 'column' : 'row';
    try { globalThis.localStorage?.setItem(ORIENTATION_KEY, next); } catch { /* private mode */ }
    return next;
  });
  const tileCount = 1 + call.tiles.length;
  const row = orientation === 'row';
  const heightFor = useCallback((w) => stripHeight(tileCount, row)(w), [tileCount, row]);
  const presets = row ? { s: 90 * tileCount, m: 150 * tileCount, l: 230 * tileCount } : { s: 120, m: 180, l: 280 };

  const end = async () => {
    if (!globalThis.confirm('Lõpetada grupitund? Ruum suletakse kõigile, grupi tahvel jääb alles ja iga õpilane saab selle koopia („Tunni tahvlid”).')) return;
    // „Tunni tahvlid”: a read-only copy of the group board on every member's own board
    try {
      await saveGroupBoardCopies({ roomId, room, user, boardService, ...(boardCopies ? { copies: boardCopies } : {}) });
    } catch (nextError) {
      if (!globalThis.confirm(`${nextError?.message || 'Tahvli koopiat ei saanud salvestada.'} Lõpetada tund ikkagi (õpilased koopiat ei saa)?`)) return;
    }
    call.hangUp();
    try { await service.close(roomId); onEnd?.(); } catch (nextError) { setError(nextError?.message || 'Tundi ei saanud lõpetada.'); }
  };

  // one row in the top bar; what does not fit folds into „⋯” (topBarFit.js)
  const headerRef = useRef(null);
  const [menu, setMenu] = useState(false);
  const foldSteps = useMemo(() => groupRoomFoldSteps({ teacher, closed }), [teacher, closed]);
  const fold = useTopBarFit(headerRef, foldSteps, [call.hasLocalMedia, recordingCount > 0, transcriber.known && !transcriber.online].map(Number).join(''));
  const folded = (name) => fold.has(name);
  const menuItems = [...fold].filter((name) => name !== 'labels');
  const pick = (name) => { setMenu(false); setPanel(panel === name ? '' : name); };

  return (
    <div className="lr lg" role="region" aria-label="Grupitund">
      <header className={`lr-top ${folded('labels') ? 'is-compact' : ''}`} ref={headerRef}>
        <div className="lr-top__group lr-top__left">
          <button type="button" className="lr-icon" aria-label="Lahku tunniruumist" onClick={() => { call.hangUp(); onLeave?.(); }}><ArrowLeft size={19} /></button>
          <div className="lr-title"><strong>{room?.title || 'Grupitund'}</strong><small><Users size={12} aria-hidden="true" /> {room ? `${room.teacherName} + ${(room.members || []).map((m) => m.studentName).join(', ')}` : 'Laen…'}</small></div>
          {!closed && !folded('history') ? <>
            <button type="button" aria-label="Võta tagasi" className="lr-icon" disabled={!history.canUndo} onClick={() => boardRef.current?.undo()}><Undo2 size={18} /></button>
            <button type="button" aria-label="Tee uuesti" className="lr-icon" disabled={!history.canRedo} onClick={() => boardRef.current?.redo()}><Redo2 size={18} /></button>
          </> : null}
        </div>
        <div className="lr-top__group lr-top__center">
          {!teacher && myInvitation ? <RecordingIndicator invitation={myInvitation} user={user} {...(recordingService ? { service: recordingService } : {})} /> : null}
          {closed ? <span className="lr-pill">Tund on lõppenud — grupi tahvel jääb alles</span> : call.hasLocalMedia ? <>
            <button type="button" className={`lr-icon ${call.audioEnabled ? '' : 'is-active'}`} aria-label={call.audioEnabled ? 'Lülita mikrofon välja' : 'Lülita mikrofon sisse'} onClick={call.toggleAudio}>{call.audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}</button>
            <button type="button" className={`lr-icon ${call.videoEnabled ? '' : 'is-active'}`} aria-label={call.videoEnabled ? 'Lülita kaamera välja' : 'Lülita kaamera sisse'} onClick={call.toggleVideo}>{call.videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}</button>
            <button type="button" className="lr-icon is-danger" aria-label="Lõpeta kõne" onClick={call.hangUp}><PhoneOff size={19} /></button>
          </> : <button type="button" className="lr-call-start" disabled={call.busy || !room} onClick={call.start}><Phone size={17} /> {teacher ? 'Alusta kõnet' : 'Liitu kõnega'}</button>}
        </div>
        <div className="lr-top__group lr-top__right">
          {menuItems.length ? <button type="button" className={`lr-icon ${menu ? 'is-active' : ''}`} aria-label="Rohkem" title="Rohkem" aria-expanded={menu} onClick={() => setMenu(!menu)}><MoreHorizontal size={19} /></button> : null}
          {!folded('chat') ? <button type="button" className={`lr-icon ${panel === 'chat' ? 'is-active' : ''}`} aria-label="Vestlus" title="Vestlus" onClick={() => setPanel(panel === 'chat' ? '' : 'chat')}><MessageSquare size={18} />{unread ? <span className="lr-badge">{unread}</span> : null}</button> : null}
          {teacher && !closed && !folded('timer') ? <button type="button" className={`lr-icon ${panel === 'timer' || timer.active ? 'is-active' : ''}`} aria-label="Taimer" title="Taimer" onClick={() => setPanel(panel === 'timer' ? '' : 'timer')}><Timer size={18} /></button> : null}
          {teacher && !closed && !folded('poll') ? <button type="button" className={`lr-icon ${panel === 'poll' || (quick.poll && quick.poll.status !== 'closed') ? 'is-active' : ''}`} aria-label="Kiirküsimus" title="Kiirküsimus" onClick={() => setPanel(panel === 'poll' ? '' : 'poll')}><Sparkles size={18} /></button> : null}
          {teacher && !closed && !folded('materials') ? <button type="button" aria-label="Materjalid" title="Materjalid" className={`lr-text-btn ${panel === 'materials' ? 'is-active' : ''}`} onClick={() => setPanel(panel === 'materials' ? '' : 'materials')}><LibraryBig size={17} /><span className="lr-label">Materjalid</span></button> : null}
          {teacher && recordingCount ? <span className="lr-pill lr-rec" role="status"><span className="lr-rec__dot" aria-hidden="true" />Salvestan ({recordingCount})</span> : null}
          {teacher && recordingCount && transcriber.known && !transcriber.online ? <span className="lr-pill lr-rec is-off" title={transcriberLabel(transcriber)}>Mac ei transkribeeri</span> : null}
          {teacher && !closed ? <MomentButton targets={momentTargets} groupRoomId={roomId} user={user} {...(momentsService ? { service: momentsService } : {})} /> : null}
          {teacher && !closed ? <GroupTalkMeter local={call.localStream} remotes={call.tiles} members={members.map((member) => ({ id: member.studentUid, name: member.studentName }))} /> : null}
          {teacher && !folded('plan') ? <LessonPlanPill clock={planState.clock} active={panel === 'plan'} onClick={() => setPanel(panel === 'plan' ? '' : 'plan')} /> : null}
          {teacher && !closed ? <button type="button" className="lr-text-btn is-danger" onClick={end}>Lõpeta tund</button> : null}
        </div>
        {menu && menuItems.length ? <div className="lr-menu" role="menu" aria-label="Rohkem">
          {folded('history') && !closed ? <>
            <button type="button" role="menuitem" disabled={!history.canUndo} onClick={() => { setMenu(false); boardRef.current?.undo(); }}><Undo2 size={16} aria-hidden="true" /> Võta tagasi</button>
            <button type="button" role="menuitem" disabled={!history.canRedo} onClick={() => { setMenu(false); boardRef.current?.redo(); }}><Redo2 size={16} aria-hidden="true" /> Tee uuesti</button>
          </> : null}
          {folded('chat') ? <button type="button" role="menuitem" onClick={() => pick('chat')}><MessageSquare size={16} aria-hidden="true" /> Vestlus{unread ? ` (${unread} uut)` : ''}</button> : null}
          {teacher && folded('plan') ? <button type="button" role="menuitem" onClick={() => pick('plan')}>Tunniplaan ja kohalolu</button> : null}
          {teacher && !closed && folded('timer') ? <button type="button" role="menuitem" onClick={() => pick('timer')}><Timer size={16} aria-hidden="true" /> Taimer{timer.active ? ' · käib' : ''}</button> : null}
          {teacher && !closed && folded('poll') ? <button type="button" role="menuitem" onClick={() => pick('poll')}><Sparkles size={16} aria-hidden="true" /> Kiirküsimus</button> : null}
          {teacher && !closed && folded('materials') ? <button type="button" role="menuitem" onClick={() => pick('materials')}><LibraryBig size={16} aria-hidden="true" /> Materjalid</button> : null}
        </div> : null}
      </header>
      {teacher && !closed ? <div hidden aria-hidden="true">{recordings.map((item) => {
        const tile = call.tiles.find((candidate) => candidate.uid === item.invitation.studentUid);
        return <RoomRecorder key={item.invitation.id} auto invitation={item.invitation} user={user} consent={item.consent} subject={item.subject || ''}
          streams={{ local: call.localStream, remote: tile?.stream || null }}
          onStateChange={(state) => setRecState((current) => (current[item.invitation.id]?.recording === state.recording ? current : { ...current, [item.invitation.id]: state }))}
          {...(recordingService ? { service: recordingService } : {})} />;
      })}</div> : null}
      {/* the members' last „Seadme kontroll” (fail / warn / none saved): until someone's video is connected */}
      {error || call.error ? <p className="lr-toast lr-toast--error" role="alert">{error || call.error}</p> : null}
      {notice ? <p className="lr-toast" role="status">{notice}</p> : null}
      <div className="lr-body lr-body--float">
        <main className="lr-stage">
          <StudentBoard studentId={roomId} user={user} staff={teacher} variant="room" controllerRef={boardRef} onHistoryChange={setHistory} newPageTitle={room?.title || 'Grupitund'} service={boardService} />
          {/* the left column over the board (as in the 1:1 room): countdown, device warning, „Täna harjutada” */}
          <div className="lr-stack">
            {!closed ? <CountdownBadge timer={timer} /> : null}
            {teacher && !closed && !anyoneConnected && !deviceNoticeHidden && members.length ? <GroupDeviceCheckNotice className="dcn-room" viewer={user}
              students={members.map((member) => ({ studentId: member.studentId, studentUid: member.studentUid, name: member.studentName }))}
              onClose={() => setDeviceNoticeHidden(true)} {...(deviceCheck ? { service: deviceCheck } : {})} /> : null}
            {teacher && !closed ? <GroupLessonHints members={hintMembers} user={user} {...(recordingService ? { service: recordingService } : {})} /> : null}
          </div>
          {!teacher && !closed ? <QuickPollCard quick={quick} timer={timer} /> : null}
        </main>
        <FloatingLayer inset={{ ...FLOAT_INSET, right: panel && globalThis.innerWidth > 760 ? 362 : 0 }}>
          <FloatingWindow key={orientation} id={`group-${orientation}`} label="Grupi video" heightFor={heightFor} presets={presets}
            defaultLayout={row ? rowDefault : columnDefault} minWidth={row ? 200 : 90} restoreContent={<span>Video ({tileCount})</span>}
            controls={<button type="button" aria-label={row ? 'Pildid veergu' : 'Pildid ritta'} title={row ? 'Pildid veergu' : 'Pildid ritta'} onClick={flip}>{row ? <Rows2 size={14} aria-hidden="true" /> : <Columns2 size={14} aria-hidden="true" />}</button>}>
            <div className={`lg-strip ${row ? 'is-row' : ''}`}>
              <figure className={`lr-tile lr-tile--self lg-tile ${call.hasLocalMedia ? 'is-live' : ''}`}>
                <video ref={call.localVideoRef} autoPlay playsInline muted />
                {!call.hasLocalMedia ? <span className="lr-tile__avatar" aria-hidden="true">{String(user.displayName || '?').charAt(0).toUpperCase()}</span> : null}
                <figcaption><span>Sina</span></figcaption>
              </figure>
              {call.tiles.map((tile) => <RemoteTile key={tile.uid} tile={tile} />)}
            </div>
          </FloatingWindow>
        </FloatingLayer>
        <aside className={`lr-side lg-side ${panel ? 'has-drawer' : ''}`} aria-label="Paneelid">
          {panel === 'chat' ? <section className="lr-drawer" aria-label="Vestlus">
            <header><strong>Vestlus</strong><button type="button" className="lr-icon" aria-label="Sulge vestlus" onClick={() => setPanel('')}><X size={18} /></button></header>
            <div className="lr-drawer__body"><GroupChat messages={messages} me={user.uid} closed={closed} onSend={(text) => service.sendMessage(roomId, { text, user, name: myName })} /></div>
          </section> : null}
          {panel === 'plan' && teacher ? <section className="lr-drawer" aria-label="Tunniplaan">
            <header><strong>Tunniplaan</strong><button type="button" className="lr-icon" aria-label="Sulge tunniplaan" onClick={() => setPanel('')}><X size={18} /></button></header>
            <div className="lr-drawer__body"><LessonPlanPanel planState={planState} participants={participants} startMs={roomStart}
              attendanceNote="Grupiruum ei ole kalendri grupitunniga seotud: märked jäävad tunniplaani. Kalendri kohalolu (ja tunnid) märgi grupi tunnis kalendris." /></div>
          </section> : null}
          {panel === 'timer' && teacher ? <section className="lr-drawer" aria-label="Taimer">
            <header><strong>Taimer</strong><button type="button" className="lr-icon" aria-label="Sulge taimer" onClick={() => setPanel('')}><X size={18} /></button></header>
            <div className="lr-drawer__body"><CountdownControls timer={timer} /></div>
          </section> : null}
          {panel === 'poll' && teacher ? <section className="lr-drawer" aria-label="Kiirküsimus">
            <header><strong>Kiirküsimus</strong><button type="button" className="lr-icon" aria-label="Sulge kiirküsimus" onClick={() => setPanel('')}><X size={18} /></button></header>
            <div className="lr-drawer__body"><QuickPollPanel quick={quick} timer={timer} names={memberNames} pickText={() => boardRef.current?.selectedText?.() || pageSelectionText()} /></div>
          </section> : null}
          {panel === 'materials' && teacher ? <section className="lr-drawer" aria-label="Materjalid">
            <header><strong>Materjalid</strong><button type="button" className="lr-icon" aria-label="Sulge" onClick={() => setPanel('')}><X size={18} /></button></header>
            <div className="lr-drawer__body"><MaterialsPanel library={library} onPlace={place} /></div>
          </section> : null}
        </aside>
      </div>
    </div>
  );
}
