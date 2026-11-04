/* global MediaRecorder, Blob, File, setInterval, clearInterval */
/* eslint-disable react-refresh/only-export-components -- small helpers (canRecord, recordingType) live with the recorder */
import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { useAssets } from '../engine/assets.jsx';
import { formatTime } from '../engine/video.js';

// „Salvesta hääl”: the teacher records the text in their own voice (microphone, MediaRecorder), listens to it,
// records again if needed and saves it into the block like an uploaded audio file (the host's assets.audio →
// Storage curriculum/). Hidden where the browser cannot record.
const MAX_SECONDS = 10 * 60;
const TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'];

export const canRecord = () => typeof window !== 'undefined' && typeof window.MediaRecorder === 'function' && Boolean(navigator.mediaDevices?.getUserMedia);
export const recordingType = (isSupported = (type) => MediaRecorder.isTypeSupported?.(type)) => TYPES.find((type) => isSupported(type)) || '';
export const recordingExt = (type) => (/mp4|aac|m4a/.test(type) ? 'm4a' : /ogg/.test(type) ? 'ogg' : 'webm');

export default function VoiceRecorder({ onSave, onClose }) {
  const assets = useAssets();
  const [phase, setPhase] = useState('idle'); // idle · recording · preview · saving
  const [seconds, setSeconds] = useState(0);
  const [take, setTake] = useState(null); // { blob, url, type }
  const [error, setError] = useState('');
  const rec = useRef(null);

  // stop the microphone and free the preview when the panel closes
  useEffect(() => () => {
    rec.current?.stop?.();
    rec.current?.stream?.getTracks().forEach((track) => track.stop());
    clearInterval(rec.current?.timer);
  }, []);
  useEffect(() => () => { if (take?.url) URL.revokeObjectURL(take.url); }, [take]);

  const start = async () => {
    setError('');
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setError('Mikrofoni ei saanud kasutada. Luba brauseris mikrofon sellele lehele.');
      return;
    }
    const type = recordingType();
    const recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    const chunks = [];
    recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      clearInterval(rec.current?.timer);
      const blobType = (recorder.mimeType || type || 'audio/webm').split(';')[0];
      const blob = new Blob(chunks, { type: blobType });
      if (!blob.size) { setPhase('idle'); setError('Salvestus jäi tühjaks. Proovi uuesti.'); return; }
      setTake({ blob, url: URL.createObjectURL(blob), type: blobType });
      setPhase('preview');
    };
    const began = Date.now();
    rec.current = {
      stop: () => { if (recorder.state !== 'inactive') recorder.stop(); },
      stream,
      timer: setInterval(() => {
        const s = Math.floor((Date.now() - began) / 1000);
        setSeconds(s);
        if (s >= MAX_SECONDS && recorder.state !== 'inactive') recorder.stop();
      }, 250),
    };
    setSeconds(0);
    setTake(null);
    recorder.start(1000);
    setPhase('recording');
  };
  const stop = () => rec.current?.stop();

  const save = async () => {
    if (!take) return;
    setPhase('saving');
    setError('');
    try {
      const file = new File([take.blob], `haal-${Date.now()}.${recordingExt(take.type)}`, { type: take.type });
      const audio = await assets.audio(file);
      await onSave({ ...audio, recorded: true });
    } catch (e) {
      setError(e?.message || 'Salvestust ei saanud üles laadida.');
      setPhase('preview');
    }
  };

  return (
    <div className="ed-record" role="group" aria-label="Salvesta hääl">
      {phase === 'recording' ? (
        <div className="ed-row">
          <span className="ed-record-dot" aria-hidden="true" />
          <span role="status">Salvestan… {formatTime(seconds)}</span>
          <button type="button" className="ed-btn" onClick={stop}><Square size={12} aria-hidden="true" /> Lõpeta</button>
        </div>
      ) : null}
      {phase === 'idle' ? (
        <div className="ed-row">
          <button type="button" className="ed-btn" onClick={start}><Mic size={14} aria-hidden="true" /> Alusta salvestamist</button>
          <button type="button" className="ed-btn ghost" onClick={onClose}>Loobu</button>
        </div>
      ) : null}
      {(phase === 'preview' || phase === 'saving') && take ? (
        <>
          <audio controls src={take.url} aria-label="Salvestuse eelkuulamine" />
          <div className="ed-row">
            <button type="button" className="ed-btn" disabled={phase === 'saving'} onClick={save}>{phase === 'saving' ? 'Laadin üles…' : 'Kasuta seda'}</button>
            <button type="button" className="ed-btn ghost" disabled={phase === 'saving'} onClick={start}>Salvesta uuesti</button>
            <button type="button" className="ed-btn ghost" disabled={phase === 'saving'} onClick={onClose}>Loobu</button>
          </div>
        </>
      ) : null}
      <span className="ed-hint">Kuni {MAX_SECONDS / 60} minutit. Räägi rahulikult, mikrofon lähedal.</span>
      {error ? <span className="ed-hint ed-err" role="alert">{error}</span> : null}
    </div>
  );
}
