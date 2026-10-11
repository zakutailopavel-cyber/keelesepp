import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, ErrorState, LoadingState } from '../../components/ui/index.js';
import { liveGuestService, liveLessonCallSignalsService, liveLessonInvitationsService, liveLessonPresenceService } from '../../services/firebase/index.js';
import { studentBoardService } from '../../services/firebase/studentBoard.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import { INVITATION_STATUS, normalizeInvitation, serverNow } from './invitationModel.js';
import LiveRoom from './LiveRoom.jsx';
import './liveClassroom.css';

// /tund/:token — the lesson link a teacher sent to a student without a login (functions/live-guest.js). The server
// signs this browser in as the lesson's guest; the same room as an invited student opens, without the rest of the CRM.
export default function GuestLessonPage({
  guestService = liveGuestService,
  invitationService = liveLessonInvitationsService,
  callSignalService = liveLessonCallSignalsService,
  callPresenceService = liveLessonPresenceService,
  boardService = studentBoardService,
  callMediaDevices,
  callPeerFactory,
  worksheetHomework,
  recordingService,
}) {
  const { token = '' } = useParams();
  const [phase, setPhase] = useState('start');
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [streams, setStreams] = useState({ local: null, remote: null });

  const join = async () => {
    setPhase('joining');
    setError('');
    try {
      setJoined(await guestService.join(token));
      setPhase('joined');
    } catch (joinError) {
      setError(firebaseErrorMessage(joinError));
      setPhase('error');
    }
  };

  // someone already signed in on this browser (a teacher testing the link, a parent): ask before replacing the session
  useEffect(() => {
    let alive = true;
    (async () => {
      const current = guestService.currentAccount?.();
      const guest = current ? Boolean((await current.getIdTokenResult?.())?.claims?.liveGuest) : true;
      if (!alive) return;
      if (current && !guest) setPhase('confirm');
      else join();
    })();
    return () => { alive = false; };
    // the link is opened once per page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!joined?.uid) return undefined;
    return invitationService.subscribeIncoming(joined.uid, setInvitations, (streamError) => setError(firebaseErrorMessage(streamError)));
  }, [invitationService, joined?.uid]);

  const invitation = useMemo(() => {
    const found = invitations.find((item) => item.id === joined?.invitationId);
    return found ? normalizeInvitation(found.id, found, serverNow()) : null;
  }, [invitations, joined?.invitationId]);

  const user = useMemo(() => (joined ? { uid: joined.uid, displayName: joined.studentName, email: '', roles: ['student'], guest: true } : null), [joined]);

  if (phase === 'confirm') {
    return <div className="page-content live-guest"><Card className="live-waiting-room">
      <h2>Tunnilink</h2>
      <p>Selles brauseris on keegi sisse logitud. Tunnilink avab tunni õpilase jaoks ja logib praeguse konto välja.</p>
      <Button onClick={join}>Ava tund õpilasena</Button>
    </Card></div>;
  }
  if (phase === 'error') return <div className="page-content live-guest"><ErrorState title="Tundi ei saa avada" message={error} onRetry={join} /></div>;
  if (!joined || !user) return <div className="page-content live-guest"><LoadingState label="Avan tundi…" /></div>;
  if (phase === 'left' && invitation?.status === INVITATION_STATUS.ACCEPTED) {
    return <div className="page-content live-guest"><Card className="live-waiting-room"><h2>Lahkusid tunnist</h2><p>Tund käib edasi.</p><Button onClick={() => setPhase('joined')}>Tagasi tundi</Button></Card></div>;
  }
  if (invitation?.status === INVITATION_STATUS.CLOSED) {
    return <div className="page-content live-guest"><Card className="live-waiting-room"><h2>Tund on lõppenud</h2><p>Aitäh, {joined.studentName}! Selle lingiga tundi enam ei avata.</p></Card></div>;
  }
  if (invitation?.status === INVITATION_STATUS.CANCELLED) {
    return <div className="page-content live-guest"><Card className="live-waiting-room"><h2>Tund tühistati</h2><p>Palu õpetajalt uus link.</p></Card></div>;
  }
  if (invitation?.status !== INVITATION_STATUS.ACCEPTED) {
    return <div className="page-content live-guest"><LoadingState label={`Ootan õpetajat (${joined.teacherName})…`} />{error ? <p className="action-error" role="alert">{error}</p> : null}</div>;
  }
  return <LiveRoom
    key={invitation.id}
    invitation={invitation}
    role="student"
    user={user}
    callProps={{
      onMediaStreams: setStreams,
      invitation,
      user,
      signalService: callSignalService,
      presenceService: callPresenceService,
      ...(callMediaDevices ? { mediaDevices: callMediaDevices } : {}),
      ...(callPeerFactory ? { peerFactory: callPeerFactory } : {}),
    }}
    boardService={boardService}
    worksheetProps={worksheetHomework ? { homework: worksheetHomework } : {}}
    recordingService={recordingService}
    streams={streams}
    onLeave={() => setPhase('left')}
  />;
}
