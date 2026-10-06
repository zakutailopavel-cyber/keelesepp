import { Maximize2, Mic, MicOff, Minimize2, Monitor, PhoneOff, RefreshCw, Video, VideoOff, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { Button, Card } from '../../components/ui/index.js';
import { useLiveCall } from './useLiveCall.js';

export default function LiveLessonCallPanel(props) {
  const { role } = props;
  const [floating, setFloating] = useState(false);
  const {
    status, statusLabel, busy, screenBusy, error, hasLocalMedia, audioEnabled, videoEnabled, screenSharing, peerOnline,
    peerName, connected, canReconnect, localVideoRef, remoteVideoRef, startTeacherCall, joinStudentCall, hangUp,
    toggleAudio, toggleVideo, startScreenShare, stopScreenShare, needsPlay, resumePlayback,
  } = useLiveCall(props);

  return <Card className={floating ? 'live-call-card live-call-card--floating' : 'live-call-card'}>
    <div className="live-call-card__header">
      <div>
        <span className="eyebrow">Videokõne</span>
        <h2>{peerName}</h2>
        <span className={peerOnline ? 'live-presence is-online' : 'live-presence'}>
          {peerOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          {peerOnline ? `${peerName} on võrgus` : `${peerName} pole hetkel võrgus`}
        </span>
      </div>
      <div className="live-call-card__header-actions">
        {screenSharing ? <span className="live-screen-share-state"><Monitor size={14} /> Ekraan on jagatud</span> : null}
        <span className={`live-call-status live-call-status--${status}`}>{statusLabel}</span>
        <button type="button" className="live-call-float-toggle" aria-label={floating ? 'Tagasi lehele' : 'Ava ujuvas aknas'} onClick={() => setFloating((value) => !value)}>
          {floating ? <Maximize2 size={17} /> : <Minimize2 size={17} />}
        </button>
      </div>
    </div>

    <div className="live-call-stage">
      <video ref={remoteVideoRef} className="live-call-video live-call-video--remote" autoPlay playsInline />
      {!connected ? <div className="live-call-placeholder"><Video size={34} /><strong>{role === 'teacher' ? 'Õpilase video' : 'Õpetaja video'}</strong><span>{statusLabel}</span></div> : null}
      {needsPlay ? <button type="button" className="lr-tap-play" onClick={resumePlayback}>▶ Puuduta, et näha ja kuulda<span>Нажмите, чтобы видеть и слышать</span></button> : null}
      <video ref={localVideoRef} className={screenSharing ? 'live-call-video live-call-video--local is-screen-share' : 'live-call-video live-call-video--local'} autoPlay playsInline muted />
    </div>

    {error ? <p className="form-error" role="alert">{error}</p> : null}

    <div className="live-call-controls">
      {!hasLocalMedia && role === 'teacher' ? <Button loading={busy} onClick={startTeacherCall}><Video size={18} /> Käivita video ja mikrofon</Button> : null}
      {!hasLocalMedia && role === 'student' ? <Button loading={busy} onClick={joinStudentCall}><Video size={18} /> Liitu videokõnega</Button> : null}
      {canReconnect ? <Button loading={busy} onClick={startTeacherCall}><RefreshCw size={18} /> Taasta ühendus</Button> : null}
      {role === 'teacher' && hasLocalMedia && !screenSharing ? <Button variant="secondary" loading={screenBusy} onClick={startScreenShare}><Monitor size={18} /> Jaga ekraani</Button> : null}
      {role === 'teacher' && screenSharing ? <Button variant="secondary" loading={screenBusy} onClick={stopScreenShare}><Monitor size={18} /> Lõpeta ekraani jagamine</Button> : null}
      {hasLocalMedia ? <>
        <Button variant="secondary" aria-label={audioEnabled ? 'Lülita mikrofon välja' : 'Lülita mikrofon sisse'} onClick={toggleAudio}>{audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}{audioEnabled ? ' Mikrofon sees' : ' Mikrofon väljas'}</Button>
        <Button variant="secondary" aria-label={videoEnabled ? 'Lülita kaamera välja' : 'Lülita kaamera sisse'} onClick={toggleVideo}>{videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}{videoEnabled ? ' Kaamera sees' : ' Kaamera väljas'}</Button>
        <Button variant="danger" loading={busy} onClick={hangUp}><PhoneOff size={18} /> Lõpeta kõne</Button>
      </> : null}
    </div>

    <p className="live-call-note">Ekraani jagamisel asendatakse ainult saadetav videorada; mikrofon jääb samaks ja kaamera taastub jagamise lõppedes. Brauseri enda “Stop sharing” lõpetab jagamise samuti. TURN-varuühendus lisatakse enne tootmisväljalaset.</p>
  </Card>;
}
