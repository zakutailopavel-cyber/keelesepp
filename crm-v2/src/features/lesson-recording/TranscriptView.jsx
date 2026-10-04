import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, PenLine } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Input, Modal } from '../../components/ui/index.js';
import { RECORDING_STATUS } from '../../services/firebase/lessonRecordings.js';
import { lessonAnalysis } from './lessonTimeline.js';
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

function Analysis({ recording }) {
  const a = useMemo(() => lessonAnalysis(recording.transcript), [recording.transcript]);
  const minutes = (ms) => `${Math.round(ms / 60000)} min`;
  return <div className="lesson-analysis">
    <dl className="lesson-analysis__stats">
      <div><dt>Õpilase osa kõnest</dt><dd>{a.studentShare}%</dd></div>
      <div><dt>Õpilane ütles</dt><dd>{a.student.words} sõna · {minutes(a.student.ms)}</dd></div>
      <div><dt>Õpetaja ütles</dt><dd>{a.teacher.words} sõna · {minutes(a.teacher.ms)}</dd></div>
      <div><dt>Õpilase vastuseid</dt><dd>{a.student.turns}</dd></div>
    </dl>
    {a.longestStudentLine ? <p><b>Pikim õpilase lause:</b> „{a.longestStudentLine}”</p> : null}
    {a.studentQuestions.length ? <div><b>Õpilase küsimused:</b><ul>{a.studentQuestions.slice(0, 10).map((q, i) => <li key={i}>{q}</li>)}</ul></div> : null}
  </div>;
}

const WAITING = {
  recording: 'Tund on veel salvestamisel.',
  uploaded: 'Salvestis on üles laaditud. Tekst ilmub siia, kui kooli arvuti on selle tekstiks teinud (tavaliselt mõne minuti jooksul).',
  transcribing: 'Teen tekstiks… Tekst ilmub siia mõne minuti jooksul.',
  failed: 'Tekstiks tegemine ebaõnnestus.',
};

// Teacher/admin: the student's Live Classroom lessons; each opens the lesson analysis (transcript) or its board.
export default function LessonsCard({ rows, studentId, loading, error, onReload }) {
  const [open, setOpen] = useState(null);
  return (
    <Card>
      <div className="section-heading"><div><span className="eyebrow">Live Classroom · ainult õpetajale</span><h2>Tunnid</h2></div>{onReload ? <Button variant="secondary" onClick={onReload}>Värskenda</Button> : null}</div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {loading ? <p className="form-hint">Laen…</p> : rows.length ? (
        <div className="simple-list lesson-rows">{rows.map((row) => {
          const r = row.recording;
          const status = r ? (STATUS[r.status] || STATUS.uploaded) : null;
          return <div key={row.key}>
            <div><strong>{r ? dateLabel(r.startedAt) : dateLabel(row.at)} · {row.title}</strong><span>{r ? `${r.teacherName || 'Õpetaja'} · salvestatud` : 'ainult tahvel'}{row.pageTitle ? ` · leht „${row.pageTitle}”` : ''}</span></div>
            {status ? <Badge tone={status[1]}>{status[0]}</Badge> : null}
            <span className="lesson-rows__actions">
              {r ? <Button variant="secondary" onClick={() => setOpen(r)}><BarChart3 size={15} /> Tunni analüüs</Button> : null}
              <Link className="button button--secondary" to={`/board/${studentId}${row.pageId ? `?page=${encodeURIComponent(row.pageId)}` : ''}`}><PenLine size={15} /> Tahvel</Link>
            </span>
          </div>;
        })}</div>
      ) : <EmptyState title="Live Classroomi tunde veel ei ole" description="Tund ilmub siia, kui see on salvestatud või tahvlile on tehtud tunnileht." />}
      {open ? <Modal open title={`Tunni analüüs · ${dateLabel(open.startedAt)} · ${open.title || 'Tund'}`} onClose={() => setOpen(null)} className="modal--transcript">
        {open.status === RECORDING_STATUS.done ? <><Analysis recording={open} /><Transcript recording={open} /></> : <p className="form-hint">{WAITING[open.status] || WAITING.uploaded}{open.error ? ` ${open.error}` : ''}</p>}
      </Modal> : null}
    </Card>
  );
}
