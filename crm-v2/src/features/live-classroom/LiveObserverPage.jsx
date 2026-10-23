import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Eye, Mic, MicOff, PhoneOff, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { EmptyState, LoadingState } from '../../components/ui/index.js';
import { liveLessonObserversService } from '../../services/firebase/liveLessonObservers.js';
import { timestampMillis } from './invitationModel.js';
import { useObserveLesson } from './useLessonObserver.js';
import './liveRoom.css';

const STATE = { connected: 'ühendatud', connecting: 'ühendan…', new: 'ühendan…', disconnected: 'ühendus katkes', failed: 'ühendus katkes', closed: 'ühendus katkes' };

// no answer this long: say why instead of waiting forever
const SILENT_MS = 20000;

function Tile({ name, stream, state, onBlocked }) {
  const ref = useRef(null);
  const [silent, setSilent] = useState(false);
  useEffect(() => {
    if (stream) return undefined;
    const timer = globalThis.setTimeout(() => setSilent(true), SILENT_MS);
    return () => globalThis.clearTimeout(timer);
  }, [stream]);
  useEffect(() => {
    const video = ref.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    // only the browser's autoplay block needs a tap; a play() interrupted by the next stream is not one
    video.play?.()?.catch?.((error) => { if (error?.name === 'NotAllowedError') onBlocked(); });
  }, [onBlocked, stream]);
  return <figure className="lo-tile">
    {stream ? <video ref={ref} autoPlay playsInline />
      : silent && !stream ? <div className="lo-tile__wait" role="status">Ei vasta
        <small>Kui tunniruum avati enne CRM-i uuendust, töötab vaatlus alates järgmisest tunnist (või kui leht uuesti avatakse).
          Kui tund käib Google Meetis või Zoomis, siin pilti ei ole: vaatlus töötab ainult CRM-i kõnega.</small></div>
      : <div className="lo-tile__wait">Ootan pilti…<small>Kui kaamera pole veel sees, ilmub pilt kõne alguses.</small></div>}
    <figcaption>{name} · {STATE[state] || 'ühendan…'}</figcaption>
  </figure>;
}

// the observer's microphone and camera for „Räägi kaasa”: the camera only when there is one
async function openOwnMedia(media = globalThis.navigator?.mediaDevices) {
  if (!media?.getUserMedia) throw new Error('See brauser ei luba mikrofoni kasutada.');
  try {
    return await media.getUserMedia({ audio: true, video: { width: { ideal: 640 }, height: { ideal: 360 } } });
  } catch (error) {
    if (error?.name === 'NotAllowedError') throw new Error('Luba brauseris mikrofon (ja kaamera), siis proovi uuesti.');
    return media.getUserMedia({ audio: true });
  }
}

function SelfTile({ stream }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current && stream) { ref.current.srcObject = stream; ref.current.play?.()?.catch?.(() => {}); } }, [stream]);
  return stream?.getVideoTracks().length ? <figure className="lo-tile lo-tile--self"><video ref={ref} autoPlay playsInline muted /><figcaption>Sina</figcaption></figure> : null;
}

// Administrator watching a lesson: sees and hears the teacher and the student; both of them see „Administraator vaatab
// tundi” (owner, 2026-10-14). „Räägi kaasa” (owner 2026-10-23) turns it into a group call: the teacher and the student
// hear and see the administrator too.
export default function LiveObserverPage({ service = liveLessonObserversService, turnService, openMedia = openOwnMedia }) {
  const { invitationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(undefined);
  const [blocked, setBlocked] = useState(false);
  const [own, setOwn] = useState(null);
  const [muted, setMuted] = useState(false);
  const [joining, setJoining] = useState(false);
  const [mediaError, setMediaError] = useState('');
  useEffect(() => service.subscribeInvitation(invitationId, setInvitation, () => setInvitation(null)), [invitationId, service]);
  const watch = useObserveLesson({ invitation: invitation || null, user, localStream: own, service, ...(turnService ? { turnService } : {}) });
  // the microphone and camera are released when the page closes
  useEffect(() => () => own?.getTracks().forEach((track) => track.stop()), [own]);
  const speak = async () => {
    setJoining(true); setMediaError('');
    try { const stream = await openMedia(); setMuted(false); setOwn(stream); } catch (error) { setMediaError(error?.message || 'Mikrofoni ei saanud avada.'); } finally { setJoining(false); }
  };
  const stopSpeaking = () => setOwn(null);
  const toggleMute = () => { const next = !muted; own?.getAudioTracks().forEach((track) => { track.enabled = !next; }); setMuted(next); };
  const back = () => navigate('/live-classroom');

  if (invitation === undefined) return <div className="page-content"><LoadingState label="Avan tundi…" /></div>;
  const open = invitation?.status === 'accepted';
  const started = invitation ? timestampMillis(invitation.respondedAt) || timestampMillis(invitation.createdAt) : 0;
  const resume = () => { document.querySelectorAll('.lo-tile video').forEach((video) => video.play?.()?.catch?.(() => {})); setBlocked(false); };

  return <div className="lr lo" role="region" aria-label="Tunni vaatlemine">
    <header className="lr-top">
      <div className="lr-top__group">
        <button type="button" className="lr-icon" aria-label="Lõpeta vaatlemine" title="Lõpeta vaatlemine" onClick={back}><ArrowLeft size={19} /></button>
        <div className="lr-title"><strong>Vaatan tundi{invitation ? `: ${invitation.teacherName} · ${invitation.studentName}` : ''}</strong>
          <small>{invitation?.title || ''}{started ? ` · algas ${new Date(started).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' })}` : ''}</small></div>
      </div>
      <div className="lr-top__group lr-top__right">
        {own ? <>
          <span className="lr-pill lr-observer" role="note"><Users size={15} /> Räägid kaasa · õpetaja ja õpilane kuulevad sind</span>
          <button type="button" className={`lr-icon ${muted ? 'is-off' : ''}`} aria-label={muted ? 'Lülita mikrofon sisse' : 'Lülita mikrofon välja'} title={muted ? 'Mikrofon on väljas' : 'Mikrofon on sees'} onClick={toggleMute}>{muted ? <MicOff size={18} /> : <Mic size={18} />}</button>
          <button type="button" className="lr-text-btn" onClick={stopSpeaking}><PhoneOff size={16} /> Ainult vaatan</button>
        </> : <>
          <span className="lr-pill lr-observer" role="note"><Eye size={15} /> Sinu kaamera ja mikrofon on väljas · õpetaja ja õpilane näevad, et vaatad</span>
          {open ? <button type="button" className="lr-text-btn" disabled={joining} onClick={speak}><Mic size={16} /> {joining ? 'Avan mikrofoni…' : 'Räägi kaasa'}</button> : null}
        </>}
      </div>
    </header>
    {watch.error || mediaError ? <p className="lr-toast lr-toast--error" role="alert">{mediaError || watch.error}</p> : null}
    {blocked ? <button type="button" className="lr-toast" onClick={resume}>Puuduta, et heli ja pilt käivituks</button> : null}
    {!open ? <div className="lw-empty"><EmptyState title="Tund on lõppenud" description="Seda tundi praegu ei toimu." /></div>
      : <div className="lo-grid">
        <Tile name={`Õpetaja ${invitation.teacherName}`} stream={watch.streams[invitation.teacherUid]} state={watch.states[invitation.teacherUid]} onBlocked={() => setBlocked(true)} />
        <Tile name={`Õpilane ${invitation.studentName}`} stream={watch.streams[invitation.studentUid]} state={watch.states[invitation.studentUid]} onBlocked={() => setBlocked(true)} />
        <SelfTile stream={own} />
      </div>}
  </div>;
}
