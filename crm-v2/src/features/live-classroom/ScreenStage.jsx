import { Maximize, Minimize } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const fullscreenElement = () => globalThis.document?.fullscreenElement || globalThis.document?.webkitFullscreenElement || null;

/** „Ekraan / Tahvel”: what the main area shows while the other side shares its screen. */
export function StageToggle({ view, onChange }) {
  return <div className="lr-seg" role="group" aria-label="Põhivaade">
    <button type="button" aria-pressed={view === 'screen'} className={view === 'screen' ? 'is-on' : ''} onClick={() => onChange('screen')}>Ekraan</button>
    <button type="button" aria-pressed={view === 'board'} className={view === 'board' ? 'is-on' : ''} onClick={() => onChange('board')}>Tahvel</button>
  </div>;
}

/**
 * The other side's shared screen over the board (owner 2026-11-04): fitted with its aspect kept, with a full-screen
 * button. It stays mounted while the share lasts, so switching to „Tahvel” and back does not restart the picture.
 */
export default function ScreenStage({ stream, name, visible }) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [full, setFull] = useState(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.srcObject !== stream) video.srcObject = stream || null;
    video.play?.()?.catch?.(() => {});
  }, [stream]);
  useEffect(() => {
    const change = () => setFull(Boolean(fullscreenElement()) && fullscreenElement() === sectionRef.current);
    globalThis.document?.addEventListener?.('fullscreenchange', change);
    globalThis.document?.addEventListener?.('webkitfullscreenchange', change);
    return () => {
      globalThis.document?.removeEventListener?.('fullscreenchange', change);
      globalThis.document?.removeEventListener?.('webkitfullscreenchange', change);
    };
  }, []);
  const toggleFull = () => {
    const doc = globalThis.document;
    if (fullscreenElement()) { (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc)?.catch?.(() => {}); return; }
    const section = sectionRef.current;
    const request = section?.requestFullscreen || section?.webkitRequestFullscreen;
    // iPhone Safari has no element full screen: the video's own full-screen player is the fallback
    if (request) request.call(section)?.catch?.(() => {});
    else videoRef.current?.webkitEnterFullscreen?.();
  };
  return <section ref={sectionRef} className={`lr-screen ${visible ? '' : 'is-hidden'}`} aria-label={`${name} jagab ekraani`} aria-hidden={!visible || undefined}>
    <video ref={videoRef} autoPlay playsInline muted />
    <div className="lr-screen__bar">
      <span>{name} jagab ekraani</span>
      <button type="button" className="lr-screen__full" onClick={toggleFull} aria-label={full ? 'Välju täisekraanist' : 'Täisekraan'} title={full ? 'Välju täisekraanist' : 'Täisekraan'}>
        {full ? <Minimize size={16} aria-hidden="true" /> : <Maximize size={16} aria-hidden="true" />}
      </button>
    </div>
  </section>;
}
