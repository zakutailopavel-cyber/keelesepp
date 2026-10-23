import { useEffect, useRef } from 'react';

// A speaking administrator in the lesson room („Räägi kaasa”, owner 2026-10-23): always heard, seen as a small tile
// next to the call while the video is shown. Nothing renders while the administrator only watches.
function Speaker({ name, stream, showVideo }) {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const hasVideo = stream.getVideoTracks().length > 0;
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.srcObject = stream;
    audio.play?.()?.catch?.(() => {});
  }, [stream]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo || !showVideo) return;
    video.srcObject = stream;
    video.play?.()?.catch?.(() => {});
  }, [hasVideo, showVideo, stream]);
  return <>
    <audio ref={audioRef} autoPlay data-testid="observer-audio" />
    {showVideo && hasVideo ? <figure className="lr-tile lr-tile--observer is-live">
      <video ref={videoRef} autoPlay playsInline muted />
      <figcaption><span>{name}</span></figcaption>
    </figure> : null}
  </>;
}

export default function ObserverMedia({ observers = [], streams = {}, showVideo = true }) {
  return observers.filter((item) => streams[item.uid || item.id]).map((item) => (
    <Speaker key={item.uid || item.id} name={item.displayName || 'Administraator'} stream={streams[item.uid || item.id]} showVideo={showVideo} />
  ));
}
