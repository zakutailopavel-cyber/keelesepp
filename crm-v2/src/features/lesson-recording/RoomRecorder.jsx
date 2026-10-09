/* global MediaRecorder, MediaStream, Blob, setInterval, clearInterval, setTimeout */
import { useEffect, useRef, useState } from 'react';
import { Circle, FileText, Square } from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import { lessonRecordingsService, SEGMENT_MS } from '../../services/firebase/lessonRecordings.js';
import { Transcript } from './TranscriptView.jsx';
import './lessonRecording.css';

function pickMime() {
  if (typeof MediaRecorder === 'undefined') return '';
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find((m) => MediaRecorder.isTypeSupported?.(m)) || '';
}
const clock = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

// speech needs far less than music: 32 kbit/s Opus keeps the transcript as good and the files ~4× smaller
export const AUDIO_BITS = 32000;

// One audio track recorded in standalone 5-minute files (each file plays and transcribes on its own).
// `nextSeq` numbers the files per track across restarts (reconnect, another microphone), so a restarted track never
// overwrites an uploaded file (Storage allows overwrites while the recording is open).
class TrackRecorder {
  constructor({ track, stream, t0, onSegment, nextSeq }) {
    this.track = track; this.t0 = t0; this.onSegment = onSegment; this.nextSeq = nextSeq; this.stopped = false;
    this.stream = new MediaStream(stream.getAudioTracks());
    this.mime = pickMime();
    this.next();
    this.timer = setInterval(() => this.rotate(), SEGMENT_MS);
  }
  next() {
    const rec = new MediaRecorder(this.stream, { ...(this.mime ? { mimeType: this.mime } : {}), audioBitsPerSecond: AUDIO_BITS });
    const chunks = [];
    const startMs = Date.now() - this.t0;
    const seq = this.nextSeq();
    rec.ondataavailable = (e) => { if (e.data?.size) chunks.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: rec.mimeType || this.mime || 'audio/webm' });
      this.onSegment({ track: this.track, seq, blob, startMs, durationMs: Date.now() - this.t0 - startMs });
    };
    rec.start();
    this.rec = rec;
  }
  rotate() {
    if (this.stopped) return;
    const old = this.rec;
    this.next();
    if (old?.state === 'recording') old.stop();
  }
  // „Tekst kohe”: close the current file now (and start the 5-minute clock again)
  cutNow() {
    if (this.stopped) return;
    clearInterval(this.timer);
    this.rotate();
    this.timer = setInterval(() => this.rotate(), SEGMENT_MS);
  }
  stop() {
    this.stopped = true;
    clearInterval(this.timer);
    if (this.rec?.state === 'recording') this.rec.stop();
  }
}

// Teacher control in the lesson room. Needs the student's consent on the student card.
// `auto`: recording starts by itself as soon as the teacher's microphone is on and stops (files closed) when the call
// ends or the room is left; a manual stop is respected until the next call. Only with consent on the student card.
export default function RoomRecorder({
  invitation, user, streams, consent, subject = '', service = lessonRecordingsService, auto = false,
  onStateChange,
}) {
  const [recording, setRecording] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const ctx = useRef({ id: '', t0: 0, teacher: null, student: null, uploads: [], seq: { teacher: 0, student: 0 } });
  const recorder = (track, stream) => new TrackRecorder({
    track, stream, t0: ctx.current.t0, onSegment: upload,
    nextSeq: () => { const c = ctx.current; const value = c.seq[track]; c.seq[track] = value + 1; return value; },
  });

  const upload = (seg) => {
    const { id } = ctx.current;
    setPending((n) => n + 1);
    const p = service.uploadSegment({ recordingId: id, ...seg })
      .catch((err) => setError(err.message || 'Salvestuse üleslaadimine ebaõnnestus.'))
      .finally(() => setPending((n) => n - 1));
    ctx.current.uploads.push(p);
  };

  // start / restart the student's track when their audio arrives or changes (reconnect)
  useEffect(() => {
    const c = ctx.current;
    if (!recording) return;
    const remote = streams?.remote;
    if (c.student && c.student.source === remote) return;
    if (c.student) { c.student.rec.stop(); c.student = null; }
    if (remote?.getAudioTracks?.().length) c.student = { source: remote, rec: recorder('student', remote) };
  }, [recording, streams?.remote]); // eslint-disable-line react-hooks/exhaustive-deps

  // the teacher switched the microphone (new local stream): continue on the new one
  useEffect(() => {
    const c = ctx.current;
    const local = streams?.local;
    if (!recording || !c.teacher || c.teacher.stream === local || !local?.getAudioTracks?.().length) return;
    c.teacher.rec.stop();
    c.teacher = { stream: local, rec: recorder('teacher', local) };
  }, [recording, streams?.local]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!recording) return undefined;
    const t = setInterval(() => setElapsed(Date.now() - ctx.current.t0), 1000);
    return () => clearInterval(t);
  }, [recording]);

  // leaving the room mid-recording still closes the files and hands the recording to the transcriber
  const alive = useRef(true);
  const closeFiles = async (c) => {
    c.teacher?.rec.stop(); c.student?.rec.stop();
    c.teacher = null; c.student = null;
    // let the last onstop events queue their uploads
    await new Promise((r) => setTimeout(r, 300));
    await Promise.all(c.uploads);
    await service.finish(c.id);
  };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      const c = ctx.current;
      if (c.id && (c.teacher || c.student)) closeFiles(c).catch(() => {});
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async () => {
    setError('');
    if (!streams?.local?.getAudioTracks?.().length) { setError('Käivita enne video ja mikrofon.'); return; }
    if (typeof MediaRecorder === 'undefined') { setError('See brauser ei oska salvestada.'); return; }
    setBusy(true);
    try {
      const rec = await service.start({ invitation, user, subject });
      ctx.current = { id: rec.id, t0: Date.now(), teacher: null, student: null, uploads: [], seq: { teacher: 0, student: 0 } };
      ctx.current.teacher = { stream: streams.local, rec: recorder('teacher', streams.local) };
      setElapsed(0);
      setRecording(rec);
    } catch (err) {
      setError(err.message || 'Salvestamist ei saanud alustada.');
    } finally { setBusy(false); }
  };

  const stop = async () => {
    const c = ctx.current;
    setBusy(true);
    try {
      await closeFiles(c);
      if (alive.current) setRecording(null);
    } catch (err) {
      if (alive.current) setError(err.message || 'Salvestust ei saanud lõpetada.');
    } finally { if (alive.current) setBusy(false); }
  };

  // automatic mode: one recording per call; the teacher's own stop is respected until the call ends
  const hasLocal = Boolean(streams?.local?.getAudioTracks?.().length);
  const manualStop = useRef(false);
  const autoTried = useRef(false);
  useEffect(() => {
    if (!auto) return;
    if (!hasLocal) {
      manualStop.current = false;
      autoTried.current = false;
      if (recording && !busy) stop();
      return;
    }
    if (consent !== true || recording || busy || manualStop.current || autoTried.current) return;
    autoTried.current = true;
    start();
  }, [auto, hasLocal, consent, recording, busy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { onStateChange?.({ recording: Boolean(recording), error }); }, [error, onStateChange, recording]);

  // the text of this recording, growing during the lesson (the school Mac transcribes every closed file)
  const [live, setLive] = useState(null);
  const [asked, setAsked] = useState('');
  useEffect(() => {
    if (!recording?.id || !service.subscribeRecording) return undefined;
    try { return service.subscribeRecording(recording.id, setLive, () => {}); } catch { return undefined; }
  }, [recording?.id, service]);
  const waitingText = Boolean(asked && !(live?.textDoneAt && live.textDoneAt >= asked));
  const textNow = async () => {
    const c = ctx.current;
    c.teacher?.rec.cutNow(); c.student?.rec.cutNow();
    try {
      // the closed files upload first, then the Mac is asked to take them before anything else
      await new Promise((r) => setTimeout(r, 300));
      await Promise.all(c.uploads);
      setAsked(await service.requestText(c.id));
    } catch (err) { setError(err.message || 'Teksti ei saanud küsida.'); }
  };

  if (consent === false) {
    return <div className="rec-panel is-off"><Circle size={14} aria-hidden="true" /><span>Salvestamiseks on vaja õpilase nõusolekut. Märgi see õpilase kaardil („Tunni salvestamine”).</span></div>;
  }
  return (
    <div className={`rec-panel ${recording ? 'is-on' : ''}`}>
      {recording ? (
        <>
          <span className="rec-dot" aria-hidden="true" />
          <strong>Salvestan · {clock(elapsed)}</strong>
          <span className="rec-meta">{streams?.remote ? 'õpetaja + õpilane' : 'ootan õpilase heli'}{pending ? ` · laen üles ${pending}` : ''}</span>
          <Button variant="secondary" loading={busy} onClick={() => { manualStop.current = true; stop(); }}><Square size={15} /> Lõpeta salvestamine</Button>
          {service.requestText ? <Button loading={waitingText} onClick={textNow} title="Tee äsja öeldu kohe tekstiks (umbes minutiga), nt suulise ülesande vigade arutamiseks"><FileText size={15} /> Tekst kohe</Button> : null}
          {waitingText ? <span className="rec-meta">Teen teksti… (umbes minut)</span> : null}
          {live?.transcript?.length ? <div className="rec-live"><Transcript recording={live} newestFirst /></div> : <span className="rec-meta">Tekst ilmub siia tunni ajal iga 5 minuti järel või kohe „Tekst kohe” nupust.</span>}
        </>
      ) : (
        <>
          <Circle size={14} aria-hidden="true" />
          <span className="rec-meta">{auto && !hasLocal ? 'Salvestamine algab koos kõnega.' : 'Tund salvestatakse tekstiks: pärast tundi näed, mida õpilane ütles.'}</span>
          <Button loading={busy} disabled={consent !== true} onClick={start}>Alusta salvestamist</Button>
        </>
      )}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}
