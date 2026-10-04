import {
  ArrowLeft, ClipboardList, FileImage, FileText, LibraryBig, Menu, MessageSquare, Mic, MicOff, Monitor, MonitorOff,
  MoreHorizontal, Phone, PhoneOff, Redo2, RefreshCw, Search, Send, Undo2, Users, Video, VideoOff, X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StudentBoard from '../board/StudentBoard.jsx';
import { imageSize } from '../board/boardModel.js';
import RoomWorksheetPanel from '../worksheet-studio/RoomWorksheetPanel.jsx';
import RoomRecorder from '../lesson-recording/RoomRecorder.jsx';
import RecordingIndicator from '../lesson-recording/RecordingIndicator.jsx';
import { timestampMillis } from './invitationModel.js';
import { useLiveCall } from './useLiveCall.js';
import './liveRoom.css';

const dateLabel = (date = new Date()) => new Intl.DateTimeFormat('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
const clock = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${String(h).padStart(2, '0')}:${m}:${s}`;
};
const initial = (name) => String(name || '?').trim().charAt(0).toUpperCase() || '?';
const fileKind = (file) => {
  const value = `${file?.contentType || file?.type || ''} ${file?.name || ''} ${file?.url || ''}`.toLocaleLowerCase('et');
  if (/image\/|\.(png|jpe?g|gif|webp)(\?|$)/.test(value)) return 'image';
  if (/application\/pdf|\.pdf(\?|$)/.test(value)) return 'pdf';
  return '';
};
// signal strength from the call state: 3 bars connected, 2 connecting, 1 waiting/reconnecting, 0 otherwise
const BARS = { connected: 3, connecting: 2, reconnecting: 1, waiting: 1 };

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
    <div className="lr-drawer__body">{children}</div>
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

function MaterialsPanel({ library, onPlace }) {
  const [state, setState] = useState({ loading: true, items: [], error: '' });
  const [query, setQuery] = useState('');
  const [placing, setPlacing] = useState('');
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => library.list())
      .then((result) => { if (alive) setState({ loading: false, items: (result.curriculumLessons || []).filter((lesson) => (lesson.files || []).some(fileKind)), error: '' }); })
      .catch((nextError) => { if (alive) setState({ loading: false, items: [], error: nextError?.message || 'Materjale ei saanud laadida.' }); });
    return () => { alive = false; };
  }, [library]);
  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('et');
    return state.items.filter((lesson) => !q || `${lesson.title} ${lesson.level} ${lesson.topic}`.toLocaleLowerCase('et').includes(q)).slice(0, 60);
  }, [query, state.items]);
  const place = async (file) => {
    setPlacing(file.url);
    try { await onPlace(file); } finally { setPlacing(''); }
  };
  return <div className="lr-materials">
    <label className="lr-search"><Search size={16} /><input aria-label="Otsi materjali" placeholder="Otsi materjali…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    <p className="lr-muted">Pilt või PDF läheb tahvlile — mõlemad saate selle peale kirjutada. Konstruktori töölehed avad nupust „Ülesanded”.</p>
    {state.loading ? <p className="lr-muted">Laen materjale…</p> : null}
    {state.error ? <p className="lr-error" role="alert">{state.error}</p> : null}
    {visible.map((lesson) => <article key={lesson.id} className="lr-material">
      <strong>{lesson.title || 'Materjal'}</strong>
      <small>{[lesson.level, lesson.topic].filter(Boolean).join(' · ')}</small>
      <div>{(lesson.files || []).filter(fileKind).map((file) => <button type="button" key={file.url} disabled={placing === file.url} onClick={() => place(file)}>
        {fileKind(file) === 'pdf' ? <FileText size={14} /> : <FileImage size={14} />}<span>{file.name || 'Fail'}</span><em>Tahvlile</em>
      </button>)}</div>
    </article>)}
    {!state.loading && !visible.length ? <p className="lr-muted">Pildi- või PDF-materjale ei leitud.</p> : null}
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
  recordingService, streams, onLeave, onEndLesson, ending = false,
}) {
  const teacher = role === 'teacher';
  const call = useLiveCall({ ...callProps, invitation, role, user });
  const boardRef = useRef(null);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const [panel, setPanel] = useState('');
  const [menu, setMenu] = useState('');
  const [sheet, setSheet] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatError, setChatError] = useState('');
  const [seenCount, setSeenCount] = useState(null);
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(() => Date.now());
  // recording starts by itself with the call when the student card has consent
  const [recState, setRecState] = useState({ recording: false, error: '' });
  const consent = student ? student.recordingConsent === true : null;
  const startedAt = useMemo(() => timestampMillis(invitation.respondedAt) || timestampMillis(invitation.createdAt) || Date.now(), [invitation.createdAt, invitation.respondedAt]);
  const lessonDate = useMemo(() => dateLabel(new Date(startedAt)), [startedAt]);
  const subject = student?.subject || invitation.subject || (teacher ? '' : invitation.title);

  useEffect(() => {
    const timer = globalThis.setInterval(() => setNow(Date.now()), 1000);
    return () => globalThis.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!messagesRepository?.subscribeByStudent || !invitation.studentId) return undefined;
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
  }, [invitation.studentId, messagesRepository]);
  // messages already there when the room opened are not "new"; the chat badge counts what arrives during the lesson
  const baseline = seenCount ?? messages.length;
  useEffect(() => { if (panel === 'chat') setSeenCount(messages.length); }, [messages.length, panel]);
  const unread = panel === 'chat' ? 0 : messages.slice(baseline).filter((message) => message.fromUid !== user.uid).length;

  // the student sees a worksheet as soon as the teacher opens it
  const onSheet = useCallback((current) => {
    setSheet((previous) => {
      if (current && current.id !== previous?.id && !teacher) setSheetOpen(true);
      return current;
    });
  }, [teacher]);

  const toggle = (name) => { setMenu(''); setPanel((current) => (current === name ? '' : name)); };
  const place = async (file) => {
    const kind = fileKind(file);
    const size = kind === 'image' ? await imageSize(file.url) : { width: 1000, height: 1414 };
    const id = await boardRef.current?.insertFile({ url: file.url, name: file.name, kind, storagePath: file.storagePath || '', ...size });
    if (id) { setNotice(`„${file.name || 'Materjal'}” on tahvlil.`); setPanel(''); setSheetOpen(false); }
  };
  useEffect(() => {
    if (!notice) return undefined;
    const timer = globalThis.setTimeout(() => setNotice(''), 3500);
    return () => globalThis.clearTimeout(timer);
  }, [notice]);
  const uploadImage = library?.uploadFile ? (file) => library.uploadFile({ file, user }) : undefined;

  const peerLabel = call.peerOnline ? 'võrgus' : 'pole võrgus';
  const startCall = teacher ? call.startTeacherCall : call.joinStudentCall;
  const callButton = call.hasLocalMedia
    ? <IconButton label="Lõpeta kõne" danger className="lr-call" disabled={call.busy} onClick={call.hangUp}><PhoneOff size={19} /></IconButton>
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
          <span className="lr-pill lr-timer" aria-label="Tunni kestus"><span>{clock(now - startedAt)}</span><Signal status={call.status} label={`Ühendus: ${call.statusLabel}`} /></span>
          {call.hasLocalMedia ? <>
            <IconButton label={call.audioEnabled ? 'Lülita mikrofon välja' : 'Lülita mikrofon sisse'} active={!call.audioEnabled} onClick={call.toggleAudio}>{call.audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}</IconButton>
            <IconButton label={call.videoEnabled ? 'Lülita kaamera välja' : 'Lülita kaamera sisse'} active={!call.videoEnabled} onClick={call.toggleVideo}>{call.videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}</IconButton>
            {teacher ? <IconButton label={call.screenSharing ? 'Lõpeta ekraani jagamine' : 'Jaga ekraani'} active={call.screenSharing} disabled={call.screenBusy} onClick={call.screenSharing ? call.stopScreenShare : call.startScreenShare}>{call.screenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />}</IconButton> : null}
          </> : null}
          {teacher && recState.recording ? <button type="button" className="lr-pill lr-rec" onClick={() => { setMenu(''); setPanel('record'); }} aria-label="Tundi salvestatakse — ava salvestamine"><span className="lr-rec__dot" aria-hidden="true" />Salvestan</button> : null}
          {teacher && !recState.recording && call.hasLocalMedia && consent === false ? <button type="button" className="lr-pill lr-rec is-off" onClick={() => { setMenu(''); setPanel('record'); }}>Ei salvesta</button> : null}
          {call.canReconnect ? <IconButton label="Taasta ühendus" disabled={call.busy} onClick={call.startTeacherCall}><RefreshCw size={18} /></IconButton> : null}
          {callButton}
        </div>
        <div className="lr-top__group lr-top__right">
          <IconButton label="Rohkem" active={menu === 'more'} onClick={() => setMenu(menu === 'more' ? '' : 'more')}><MoreHorizontal size={19} /></IconButton>
          <IconButton label="Osalejad" active={panel === 'people'} onClick={() => toggle('people')}><Users size={18} /></IconButton>
          <IconButton label="Vestlus" active={panel === 'chat'} onClick={() => toggle('chat')}><MessageSquare size={18} />{unread ? <span className="lr-badge">{unread}</span> : null}</IconButton>
          {teacher ? <button type="button" className={`lr-text-btn ${panel === 'materials' ? 'is-active' : ''}`} onClick={() => toggle('materials')}><LibraryBig size={17} /> Materjalid</button> : null}
          <button type="button" className={`lr-text-btn ${sheetOpen ? 'is-active' : ''}`} onClick={() => { setMenu(''); setSheetOpen(!sheetOpen); }}><ClipboardList size={17} /> Ülesanded{sheet && !sheetOpen ? <span className="lr-dot" aria-label="Tööleht on avatud" /> : null}</button>
        </div>
        {menu === 'info' ? <div className="lr-menu lr-menu--left" role="dialog" aria-label="Tunni info">
          <strong>{invitation.title}</strong>
          <dl><dt>Õpetaja</dt><dd>{invitation.teacherName}</dd><dt>Õpilane</dt><dd>{invitation.studentName}</dd>{subject ? <><dt>Aine</dt><dd>{subject}</dd></> : null}<dt>Algus</dt><dd>{new Date(startedAt).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' })}</dd></dl>
          <p className="lr-muted">Tahvel on õpilase oma tahvel: kõik joonistatu jääb alles ka pärast tundi (CRM-is „Tahvel”).</p>
        </div> : null}
        {menu === 'more' ? <div className="lr-menu" role="menu" aria-label="Rohkem">
          {teacher ? <button type="button" role="menuitem" onClick={() => { setMenu(''); boardRef.current?.newPage(`Tund ${lessonDate}`).catch((error) => setNotice(error?.message || 'Uut lehte ei saanud luua.')); }}>Uus tunnileht „Tund {lessonDate}”</button> : null}
          {teacher ? <button type="button" role="menuitem" onClick={() => { setMenu(''); setPanel('record'); }}>Tunni salvestamine</button> : null}
          <button type="button" role="menuitem" onClick={() => { setMenu(''); setPanel('devices'); }}>Kaamera ja mikrofon</button>
          <button type="button" role="menuitem" onClick={() => { setMenu(''); onLeave(); }}>Lahku tunniruumist</button>
          {teacher ? <button type="button" role="menuitem" className="is-danger" disabled={ending} onClick={() => { setMenu(''); onEndLesson(); }}>Lõpeta tund</button> : null}
        </div> : null}
      </header>

      {!teacher ? <RecordingIndicator invitation={invitation} user={user} {...(recordingService ? { service: recordingService } : {})} /> : null}
      {call.error ? <p className="lr-toast lr-toast--error" role="alert">{call.error}</p> : null}
      {notice ? <p className="lr-toast" role="status">{notice}</p> : null}

      <div className="lr-body">
        <main className="lr-stage">
          <StudentBoard
            studentId={invitation.studentId}
            user={user}
            staff={teacher}
            variant="room"
            controllerRef={boardRef}
            onHistoryChange={setHistory}
            newPageTitle={`Tund ${lessonDate}`}
            uploadImage={teacher ? uploadImage : undefined}
            {...(boardService ? { service: boardService } : {})}
          />
          <div className={`lr-sheet ${sheetOpen ? 'is-open' : ''}`} aria-hidden={!sheetOpen}>
            <div className="lr-sheet__head"><strong>Ülesanded</strong><IconButton label="Tagasi tahvlile" onClick={() => setSheetOpen(false)}><X size={18} /></IconButton></div>
            <div className="lr-sheet__body"><RoomWorksheetPanel invitation={invitation} role={role} user={user} onCurrentChange={onSheet} {...worksheetProps} /></div>
          </div>
        </main>

        <aside className={`lr-side ${panel ? 'has-drawer' : ''}`} aria-label="Video">
          <figure className={`lr-tile lr-tile--remote ${call.connected ? 'is-live' : ''}`}>
            <video ref={call.remoteVideoRef} autoPlay playsInline />
            {!call.connected ? <span className="lr-tile__avatar" aria-hidden="true">{initial(call.peerName)}</span> : null}
            <figcaption><span>{call.peerName}</span><Signal status={call.connected ? 'connected' : call.peerOnline ? 'waiting' : 'idle'} label={`${call.peerName} ${peerLabel}`} /></figcaption>
            {!call.connected ? <small className="lr-tile__state">{call.peerOnline ? call.statusLabel : `${call.peerName} ${peerLabel}`}</small> : null}
          </figure>
          <figure className={`lr-tile lr-tile--self ${call.hasLocalMedia ? 'is-live' : ''}`}>
            <video ref={call.localVideoRef} autoPlay playsInline muted className={call.screenSharing ? 'is-screen' : ''} />
            {!call.hasLocalMedia ? <span className="lr-tile__avatar" aria-hidden="true">{initial(user.displayName)}</span> : null}
            <figcaption><span>Sina{call.screenSharing ? ' · ekraan' : ''}</span></figcaption>
          </figure>

          {panel === 'chat' ? <Drawer title="Vestlus" onClose={() => setPanel('')}><ChatPanel invitation={invitation} user={user} repository={messagesRepository} messages={messages} error={chatError} /></Drawer> : null}
          {panel === 'people' ? <Drawer title="Osalejad" onClose={() => setPanel('')}>
            <ul className="lr-people">
              <li><span className="lr-people__avatar">{initial(user.displayName)}</span><span><strong>{user.displayName || 'Sina'} (sina)</strong><small>{teacher ? 'Õpetaja' : 'Õpilane'} · võrgus</small></span></li>
              <li><span className="lr-people__avatar">{initial(call.peerName)}</span><span><strong>{call.peerName}</strong><small>{teacher ? 'Õpilane' : 'Õpetaja'} · {peerLabel}</small></span></li>
            </ul>
          </Drawer> : null}
          {panel === 'devices' ? <Drawer title="Kaamera ja mikrofon" onClose={() => setPanel('')}><DevicesPanel call={call} stream={streams?.local} /></Drawer> : null}
          {panel === 'materials' && teacher ? <Drawer title="Materjalid" onClose={() => setPanel('')}><MaterialsPanel library={library} onPlace={place} /></Drawer> : null}
          <div className={panel === 'record' && teacher ? 'lr-drawer' : 'lr-drawer is-hidden'} aria-hidden={panel !== 'record'}>
            <header><strong>Tunni salvestamine</strong><IconButton label="Sulge salvestamine" onClick={() => setPanel('')}><X size={18} /></IconButton></header>
            <div className="lr-drawer__body">{teacher ? <RoomRecorder invitation={invitation} user={user} streams={streams} consent={consent} auto onStateChange={setRecState} subject={subject} {...(recordingService ? { service: recordingService } : {})} /> : null}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
