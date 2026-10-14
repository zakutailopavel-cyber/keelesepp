import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { EmptyState, LoadingState } from '../../components/ui/index.js';
import { liveLessonObserversService } from '../../services/firebase/liveLessonObservers.js';
import { timestampMillis } from './invitationModel.js';
import { useObserveLesson } from './useLessonObserver.js';
import './liveRoom.css';

const STATE = { connected: 'ühendatud', connecting: 'ühendan…', new: 'ühendan…', disconnected: 'ühendus katkes', failed: 'ühendus katkes', closed: 'ühendus katkes' };

function Tile({ name, stream, state, onBlocked }) {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    // only the browser's autoplay block needs a tap; a play() interrupted by the next stream is not one
    video.play?.()?.catch?.((error) => { if (error?.name === 'NotAllowedError') onBlocked(); });
  }, [onBlocked, stream]);
  return <figure className="lo-tile">
    {stream ? <video ref={ref} autoPlay playsInline /> : <div className="lo-tile__wait">Ootan pilti…<small>Kui kaamera pole veel sees, ilmub pilt kõne alguses.</small></div>}
    <figcaption>{name} · {STATE[state] || 'ühendan…'}</figcaption>
  </figure>;
}

// Administrator watching a lesson: sees and hears the teacher and the student, sends nothing. Both of them see
// „Administraator vaatab tundi” (owner, 2026-10-14).
export default function LiveObserverPage({ service = liveLessonObserversService, turnService }) {
  const { invitationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(undefined);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => service.subscribeInvitation(invitationId, setInvitation, () => setInvitation(null)), [invitationId, service]);
  const watch = useObserveLesson({ invitation: invitation || null, user, service, ...(turnService ? { turnService } : {}) });
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
        <span className="lr-pill lr-observer" role="note"><Eye size={15} /> Sinu kaamera ja mikrofon on väljas · õpetaja ja õpilane näevad, et vaatad</span>
      </div>
    </header>
    {watch.error ? <p className="lr-toast lr-toast--error" role="alert">{watch.error}</p> : null}
    {blocked ? <button type="button" className="lr-toast" onClick={resume}>Puuduta, et heli ja pilt käivituks</button> : null}
    {!open ? <div className="lw-empty"><EmptyState title="Tund on lõppenud" description="Seda tundi praegu ei toimu." /></div>
      : <div className="lo-grid">
        <Tile name={`Õpetaja ${invitation.teacherName}`} stream={watch.streams[invitation.teacherUid]} state={watch.states[invitation.teacherUid]} onBlocked={() => setBlocked(true)} />
        <Tile name={`Õpilane ${invitation.studentName}`} stream={watch.streams[invitation.studentUid]} state={watch.states[invitation.studentUid]} onBlocked={() => setBlocked(true)} />
      </div>}
  </div>;
}
