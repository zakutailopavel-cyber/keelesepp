import { ArrowLeft, LibraryBig, MessageSquare, Mic, MicOff, Phone, PhoneOff, Redo2, Send, Undo2, Users, Video, VideoOff, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import './liveRoom.css';

function RemoteTile({ tile }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.srcObject = tile.stream || null; }, [tile.stream]);
  return <figure className={`lr-tile lg-tile ${tile.stream ? 'is-live' : ''}`}>
    <video ref={ref} autoPlay playsInline />
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
  library, callOptions = {}, recordings = [], myInvitation = null, recordingService,
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
  // recording (teacher): one recording per student — the teacher's microphone + that student's audio — on the
  // student's own invitation, so each student gets their own lesson analysis (consent from the student card)
  const [recState, setRecState] = useState({});
  const recordingCount = Object.values(recState).filter((item) => item?.recording).length;

  const place = async (file) => {
    const kind = fileKind(file);
    const size = kind === 'image' ? await imageSize(file.url) : { width: 1000, height: 1414 };
    const id = await boardRef.current?.insertFile({ url: file.url, name: file.name, kind, storagePath: file.storagePath || '', ...size });
    if (id) { setNotice(`„${file.name || 'Materjal'}” on tahvlil.`); setPanel(''); }
  };
  const end = async () => {
    if (!globalThis.confirm('Lõpetada grupitund? Ruum suletakse kõigile, grupi tahvel jääb alles.')) return;
    call.hangUp();
    try { await service.close(roomId); onEnd?.(); } catch (nextError) { setError(nextError?.message || 'Tundi ei saanud lõpetada.'); }
  };

  return (
    <div className="lr lg" role="region" aria-label="Grupitund">
      <header className="lr-top">
        <div className="lr-top__group">
          <button type="button" className="lr-icon" aria-label="Lahku tunniruumist" onClick={() => { call.hangUp(); onLeave?.(); }}><ArrowLeft size={19} /></button>
          <div className="lr-title"><strong>{room?.title || 'Grupitund'}</strong><small><Users size={12} aria-hidden="true" /> {room ? `${room.teacherName} + ${(room.members || []).map((m) => m.studentName).join(', ')}` : 'Laen…'}</small></div>
          {!closed ? <>
            <button type="button" aria-label="Võta tagasi" className="lr-icon" disabled={!history.canUndo} onClick={() => boardRef.current?.undo()}><Undo2 size={18} /></button>
            <button type="button" aria-label="Tee uuesti" className="lr-icon" disabled={!history.canRedo} onClick={() => boardRef.current?.redo()}><Redo2 size={18} /></button>
          </> : null}
        </div>
        <div className="lr-top__group lr-top__center">
          {closed ? <span className="lr-pill">Tund on lõppenud — grupi tahvel jääb alles</span> : call.hasLocalMedia ? <>
            <button type="button" className={`lr-icon ${call.audioEnabled ? '' : 'is-active'}`} aria-label={call.audioEnabled ? 'Lülita mikrofon välja' : 'Lülita mikrofon sisse'} onClick={call.toggleAudio}>{call.audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}</button>
            <button type="button" className={`lr-icon ${call.videoEnabled ? '' : 'is-active'}`} aria-label={call.videoEnabled ? 'Lülita kaamera välja' : 'Lülita kaamera sisse'} onClick={call.toggleVideo}>{call.videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}</button>
            <button type="button" className="lr-icon is-danger" aria-label="Lõpeta kõne" onClick={call.hangUp}><PhoneOff size={19} /></button>
          </> : <button type="button" className="lr-call-start" disabled={call.busy || !room} onClick={call.start}><Phone size={17} /> {teacher ? 'Alusta kõnet' : 'Liitu kõnega'}</button>}
        </div>
        <div className="lr-top__group lr-top__right">
          <button type="button" className={`lr-icon ${panel === 'chat' ? 'is-active' : ''}`} aria-label="Vestlus" title="Vestlus" onClick={() => setPanel(panel === 'chat' ? '' : 'chat')}><MessageSquare size={18} />{unread ? <span className="lr-badge">{unread}</span> : null}</button>
          {teacher && !closed ? <button type="button" className={`lr-text-btn ${panel === 'materials' ? 'is-active' : ''}`} onClick={() => setPanel(panel === 'materials' ? '' : 'materials')}><LibraryBig size={17} /> Materjalid</button> : null}
          {teacher && recordingCount ? <span className="lr-pill lr-rec" role="status"><span className="lr-rec__dot" aria-hidden="true" />Salvestan ({recordingCount})</span> : null}
          {teacher && recordingCount && transcriber.known && !transcriber.online ? <span className="lr-pill lr-rec is-off" title={transcriberLabel(transcriber)}>Mac ei transkribeeri</span> : null}
          {teacher && !closed ? <button type="button" className="lr-text-btn is-danger" onClick={end}>Lõpeta tund</button> : null}
        </div>
      </header>
      {!teacher && myInvitation ? <RecordingIndicator invitation={myInvitation} user={user} {...(recordingService ? { service: recordingService } : {})} /> : null}
      {teacher && !closed ? <div hidden aria-hidden="true">{recordings.map((item) => {
        const tile = call.tiles.find((candidate) => candidate.uid === item.invitation.studentUid);
        return <RoomRecorder key={item.invitation.id} auto invitation={item.invitation} user={user} consent={item.consent} subject={item.subject || ''}
          streams={{ local: call.localStream, remote: tile?.stream || null }}
          onStateChange={(state) => setRecState((current) => (current[item.invitation.id]?.recording === state.recording ? current : { ...current, [item.invitation.id]: state }))}
          {...(recordingService ? { service: recordingService } : {})} />;
      })}</div> : null}
      {error || call.error ? <p className="lr-toast lr-toast--error" role="alert">{error || call.error}</p> : null}
      {notice ? <p className="lr-toast" role="status">{notice}</p> : null}
      <div className="lr-body">
        <main className="lr-stage">
          <StudentBoard studentId={roomId} user={user} staff={teacher} variant="room" controllerRef={boardRef} onHistoryChange={setHistory} newPageTitle={room?.title || 'Grupitund'} service={boardService} />
        </main>
        <aside className={`lr-side lg-side ${panel ? 'has-drawer' : ''}`} aria-label="Video">
          <figure className={`lr-tile lr-tile--self lg-tile ${call.hasLocalMedia ? 'is-live' : ''}`}>
            <video ref={call.localVideoRef} autoPlay playsInline muted />
            {!call.hasLocalMedia ? <span className="lr-tile__avatar" aria-hidden="true">{String(user.displayName || '?').charAt(0).toUpperCase()}</span> : null}
            <figcaption><span>Sina</span></figcaption>
          </figure>
          {call.tiles.map((tile) => <RemoteTile key={tile.uid} tile={tile} />)}
          {panel === 'chat' ? <section className="lr-drawer" aria-label="Vestlus">
            <header><strong>Vestlus</strong><button type="button" className="lr-icon" aria-label="Sulge vestlus" onClick={() => setPanel('')}><X size={18} /></button></header>
            <div className="lr-drawer__body"><GroupChat messages={messages} me={user.uid} closed={closed} onSend={(text) => service.sendMessage(roomId, { text, user, name: myName })} /></div>
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
