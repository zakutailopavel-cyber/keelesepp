import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Input, Modal } from '../../components/ui/index.js';
import { RECORDING_STATUS } from '../../services/firebase/lessonRecordings.js';
import './lessonRecording.css';

const clock = (ms) => { const s = Math.floor((ms || 0) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const dateLabel = (iso) => (iso ? new Date(iso).toLocaleString('et-EE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const STATUS = {
  recording: ['Salvestamisel', 'info'], uploaded: ['Ootab tekstiks tegemist', 'neutral'], transcribing: ['Teen tekstiks…', 'info'],
  done: ['Tekst valmis', 'success'], failed: ['Viga', 'danger'],
};
const SPEAKER = { teacher: 'Õpetaja', student: 'Õpilane' };

function Transcript({ recording }) {
  const [q, setQ] = useState('');
  const [who, setWho] = useState('all');
  const lines = useMemo(() => recording.transcript.filter((l) => (who === 'all' || l.speaker === who) && (!q || String(l.text).toLocaleLowerCase('et').includes(q.toLocaleLowerCase('et')))), [recording.transcript, q, who]);
  const studentWords = recording.transcript.filter((l) => l.speaker === 'student').reduce((n, l) => n + String(l.text).split(/\s+/).filter(Boolean).length, 0);
  return (
    <div className="transcript">
      <div className="transcript__tools">
        <Input id="transcript-search" label="Otsi" value={q} onChange={(e) => setQ(e.target.value)} placeholder="sõna tekstist" />
        <div className="transcript__who" role="group" aria-label="Kes räägib">
          {[['all', 'Kõik'], ['student', 'Õpilane'], ['teacher', 'Õpetaja']].map(([k, l]) => <button type="button" key={k} aria-pressed={who === k} onClick={() => setWho(k)}>{l}</button>)}
        </div>
        <span className="transcript__stat">Õpilane ütles {studentWords} sõna</span>
      </div>
      {lines.length ? <ol className="transcript__lines">{lines.map((l, i) => (
        <li key={`${l.startMs}-${i}`} className={`is-${l.speaker}`}><time>{clock(l.startMs)}</time><b>{SPEAKER[l.speaker] || l.speaker}</b><p>{l.text}</p></li>
      ))}</ol> : <EmptyState title="Midagi ei leitud" />}
    </div>
  );
}

// Staff: the recorded lessons of one student and their text.
export default function RecordingsCard({ recordings, loading, error, onReload }) {
  const [open, setOpen] = useState(null);
  return (
    <Card>
      <div className="section-heading"><div><span className="eyebrow">Live Classroom</span><h2>Tunnisalvestised</h2></div>{onReload ? <Button variant="secondary" onClick={onReload}>Värskenda</Button> : null}</div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {loading ? <p className="form-hint">Laen…</p> : recordings.length ? (
        <div className="simple-list">{recordings.map((r) => (
          <div key={r.id}>
            <div><strong>{dateLabel(r.startedAt)} · {r.title || 'Tund'}</strong><span>{r.teacherName || 'Õpetaja'} · {r.segments.length} osa</span></div>
            <Badge tone={(STATUS[r.status] || STATUS.uploaded)[1]}>{(STATUS[r.status] || STATUS.uploaded)[0]}</Badge>
            {r.status === RECORDING_STATUS.done ? <Button variant="secondary" onClick={() => setOpen(r)}>Ava tekst</Button> : null}
          </div>
        ))}</div>
      ) : <EmptyState title="Salvestatud tunde veel ei ole" description="Salvestamise saab alustada Live Classroomis, kui õpilase kaardil on nõusolek." />}
      {open ? <Modal open title={`${dateLabel(open.startedAt)} · ${open.title || 'Tund'}`} onClose={() => setOpen(null)} className="modal--transcript"><Transcript recording={open} /></Modal> : null}
    </Card>
  );
}
