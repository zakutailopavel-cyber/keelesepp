/* global MediaRecorder, Blob, File */
import { Mic, Square, Send, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/index.js';

import { VOICE_MAX_SECONDS, clockLabel as fmt } from './voiceTask.js';

// „Häälülesanne” (owner 2026-10-23: говорение между уроками): the student records up to two minutes, listens and sends;
// the file goes with the homework's answer (homework/{studentId}/…, the storage rules allow audio).
export default function VoiceAnswer({ prompts = [], busy = false, onSend, onCancel, recorderFactory }) {
  const [recorder, setRecorder] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [take, setTake] = useState(null);
  const [error, setError] = useState('');
  const timer = useRef(null);
  useEffect(() => () => { globalThis.clearInterval(timer.current); if (take?.url) URL.revokeObjectURL(take.url); }, [take]);

  const start = async () => {
    setError('');
    try {
      const stream = await globalThis.navigator.mediaDevices.getUserMedia({ audio: true });
      const next = recorderFactory ? recorderFactory(stream) : new MediaRecorder(stream);
      const chunks = [];
      const started = Date.now();
      next.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
      next.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        globalThis.clearInterval(timer.current);
        const type = String(next.mimeType || 'audio/webm').split(';')[0];
        const blob = new Blob(chunks, { type });
        setTake({ blob, type, url: URL.createObjectURL(blob), seconds: Math.round((Date.now() - started) / 1000) });
        setRecorder(null);
      };
      next.start();
      setRecorder(next);
      setTake(null);
      setSeconds(0);
      timer.current = globalThis.setInterval(() => {
        const passed = Math.round((Date.now() - started) / 1000);
        setSeconds(passed);
        if (passed >= VOICE_MAX_SECONDS && next.state !== 'inactive') next.stop();
      }, 250);
    } catch {
      setError('Mikrofon ei ole lubatud. Luba see brauseri aadressiribalt ja proovi uuesti. / Разрешите микрофон в браузере.');
    }
  };
  const send = () => {
    const extension = take.type.includes('mp4') ? 'm4a' : take.type.includes('ogg') ? 'ogg' : 'webm';
    onSend({ text: '', file: new File([take.blob], `haalvastus-${take.seconds}s.${extension}`, { type: take.type }) });
  };

  return <div className="voice-answer" aria-label="Häälvastus">
    {prompts.length ? <ul className="voice-answer__prompts">{prompts.map((line) => <li key={line}>{line}</li>)}</ul> : null}
    <div className="voice-answer__row">
      {recorder
        ? <Button variant="danger" onClick={() => recorder.stop()}><Square size={15} /> Lõpeta</Button>
        : <Button variant={take ? 'secondary' : 'primary'} onClick={start}>{take ? <RotateCcw size={15} /> : <Mic size={15} />} {take ? 'Salvesta uuesti' : 'Alusta salvestamist'}</Button>}
      <span className={`voice-answer__time ${recorder ? 'is-on' : ''}`} aria-live="polite">{fmt(recorder ? seconds : take?.seconds || 0)} / {fmt(VOICE_MAX_SECONDS)}</span>
    </div>
    {take && !recorder ? <audio controls src={take.url} aria-label="Sinu salvestus" /> : null}
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <div className="task-answer-actions">
      <Button loading={busy} disabled={!take || Boolean(recorder)} onClick={send}><Send size={15} /> Saada õpetajale</Button>
      <Button variant="secondary" disabled={busy || Boolean(recorder)} onClick={onCancel}>Loobu</Button>
    </div>
  </div>;
}
