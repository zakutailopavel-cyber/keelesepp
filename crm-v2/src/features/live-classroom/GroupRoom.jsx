import { ArrowLeft, LibraryBig, Mic, MicOff, Phone, PhoneOff, Redo2, Undo2, Users, Video, VideoOff, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import StudentBoard from '../board/StudentBoard.jsx';
import { imageSize } from '../board/boardModel.js';
import { groupBoardService } from '../../services/firebase/studentBoard.js';
import { liveGroupRoomsService } from '../../services/firebase/liveGroupRooms.js';
import MaterialsPanel from './MaterialsPanel.jsx';
import { fileKind } from './roomMaterials.js';
import { useGroupCall } from './useGroupCall.js';
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

/**
 * A group lesson (owner, 2026-10-04): a teacher and up to 4 students on one group board, everyone sees everyone
 * (WebRTC mesh). The group board stays after the lesson; each student keeps their own board as well.
 */
export default function GroupRoom({
  roomId, role, user, onLeave, onEnd, turnInvitationId = '', service = liveGroupRoomsService, boardService = groupBoardService,
  library, callOptions = {},
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
  const closed = room?.status === 'closed';

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
          {teacher && !closed ? <button type="button" className={`lr-text-btn ${panel === 'materials' ? 'is-active' : ''}`} onClick={() => setPanel(panel === 'materials' ? '' : 'materials')}><LibraryBig size={17} /> Materjalid</button> : null}
          {teacher && !closed ? <button type="button" className="lr-text-btn is-danger" onClick={end}>Lõpeta tund</button> : null}
        </div>
      </header>
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
          {panel === 'materials' && teacher ? <section className="lr-drawer" aria-label="Materjalid">
            <header><strong>Materjalid</strong><button type="button" className="lr-icon" aria-label="Sulge" onClick={() => setPanel('')}><X size={18} /></button></header>
            <div className="lr-drawer__body"><MaterialsPanel library={library} onPlace={place} /></div>
          </section> : null}
        </aside>
      </div>
    </div>
  );
}
