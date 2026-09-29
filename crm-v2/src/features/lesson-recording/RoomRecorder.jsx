/* global MediaRecorder, MediaStream, Blob, setInterval, clearInterval, setTimeout */
import { useEffect, useRef, useState } from 'react';
import { Circle, Square } from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import { lessonRecordingsService, SEGMENT_MS } from '../../services/firebase/lessonRecordings.js';
import './lessonRecording.css';

function pickMime() {
  if (typeof MediaRecorder === 'undefined') return '';
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find((m) => MediaRecorder.isTypeSupported?.(m)) || '';
}
const clock = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

// One audio track recorded in standalone 5-minute files (each file plays and transcribes on its own).
class TrackRecorder {
  constructor({ track, stream, t0, onSegment }) {
    this.track = track; this.t0 = t0; this.onSegment = onSegment; this.seq = 0; this.stopped = false;
    this.stream = new MediaStream(stream.getAudioTracks());
    this.mime = pickMime();
    this.next();
    this.timer = setInterval(() => this.rotate(), SEGMENT_MS);
  }
  next() {
    const rec = new MediaRecorder(this.stream, this.mime ? { mimeType: this.mime } : undefined);
    const chunks = [];
    const startMs = Date.now() - this.t0;
    const seq = this.seq++;
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
  stop() {
    this.stopped = true;
    clearInterval(this.timer);
    if (this.rec?.state === 'recording') this.rec.stop();
  }
}

// Teacher control in the lesson room. Needs the student's consent on the student card.
export default function RoomRecorder({ invitation, user, streams, consent, subject = '', service = lessonRecordingsService }) {
  const [recording, setRecording] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const ctx = useRef({ id: '', t0: 0, teacher: null, student: null, uploads: [] });

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
    if (remote?.getAudioTracks?.().length) c.student = { source: remote, rec: new TrackRecorder({ track: 'student', stream: remote, t0: c.t0, onSegment: upload }) };
  }, [recording, streams?.remote]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!recording) return undefined;
    const t = setInterval(() => setElapsed(Date.now() - ctx.current.t0), 1000);
    return () => clearInterval(t);
  }, [recording]);

  // leaving the room mid-recording still closes the files
  useEffect(() => () => { ctx.current.teacher?.stop(); ctx.current.student?.rec.stop(); }, []);

  const start = async () => {
    setError('');
    if (!streams?.local?.getAudioTracks?.().length) { setError('Käivita enne video ja mikrofon.'); return; }
    if (typeof MediaRecorder === 'undefined') { setError('See brauser ei oska salvestada.'); return; }
    setBusy(true);
    try {
      const rec = await service.start({ invitation, user, subject });
      ctx.current = { id: rec.id, t0: Date.now(), teacher: null, student: null, uploads: [] };
      ctx.current.teacher = new TrackRecorder({ track: 'teacher', stream: streams.local, t0: ctx.current.t0, onSegment: upload });
      setElapsed(0);
      setRecording(rec);
    } catch (err) {
      setError(err.message || 'Salvestamist ei saanud alustada.');
    } finally { setBusy(false); }
  };

  const stop = async () => {
    const c = ctx.current;
    setBusy(true);
    c.teacher?.stop(); c.student?.rec.stop();
    c.teacher = null; c.student = null;
    // let the last onstop events queue their uploads
    await new Promise((r) => setTimeout(r, 300));
    try {
      await Promise.all(c.uploads);
      await service.finish(c.id);
      setRecording(null);
    } catch (err) {
      setError(err.message || 'Salvestust ei saanud lõpetada.');
    } finally { setBusy(false); }
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
          <Button variant="secondary" loading={busy} onClick={stop}><Square size={15} /> Lõpeta salvestamine</Button>
        </>
      ) : (
        <>
          <Circle size={14} aria-hidden="true" />
          <span className="rec-meta">Tund salvestatakse tekstiks: pärast tundi näed, mida õpilane ütles.</span>
          <Button loading={busy} disabled={consent !== true} onClick={start}>Alusta salvestamist</Button>
        </>
      )}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}
