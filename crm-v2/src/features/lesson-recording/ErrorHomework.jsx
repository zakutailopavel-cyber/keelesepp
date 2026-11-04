// „Koosta kodutöö vigadest” in the lesson analysis (teacher / admin): a draft from this lesson's errors, a preview the
// teacher edits, and „Saada õpilasele”. Nothing reaches the student before that click (errorHomework.js).
import { useContext, useState } from 'react';
import { ClipboardList, Send, Trash2 } from 'lucide-react';
import { AuthContext } from '../../app/AuthContext.jsx';
import { Button, IconButton, Input } from '../../components/ui/index.js';
import { homeworkService } from '../../services/firebase/index.js';
import { studentWorksheetsService } from '../../services/firebase/studentWorksheets.js';
import { studentsService } from '../../services/firebase/students.js';
// the builder (with the generator's word-form lexicon) loads only when the teacher asks for the draft
const loadBuilder = () => import('./errorHomework.js');
const inWeek = (now) => { const d = new Date(now); d.setDate(d.getDate() + 7); return d.toLocaleDateString('sv-SE'); };

const DEFAULT_SERVICES = { worksheets: studentWorksheetsService, homework: homeworkService, students: studentsService };
const shortDate = (iso) => (iso ? new Date(iso).toLocaleDateString('et-EE', { day: 'numeric', month: 'numeric' }) : '');
const displayDate = (ymd) => (ymd ? new Date(`${ymd}T12:00:00`).toLocaleDateString('et-EE', { day: 'numeric', month: 'long' }) : '');

export default function ErrorHomework({ analysis, recording, services = DEFAULT_SERVICES, now = new Date() }) {
  const user = useContext(AuthContext)?.user || null;
  const [draft, setDraft] = useState(null);
  const [empty, setEmpty] = useState(false);
  const [due, setDue] = useState(() => inWeek(now));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(null);
  const [lib, setLib] = useState(null);
  if (!recording?.studentId || !Array.isArray(analysis?.errors)) return null;

  const open = async () => {
    setSent(null); setError('');
    let builder = lib;
    try { builder = builder || await loadBuilder(); } catch { setError('Koostaja laadimine ei õnnestunud. Proovi uuesti.'); return; }
    setLib(builder);
    const made = builder.buildErrorHomework({ analysis, seed: recording.id || recording.startedAt || 'lesson' });
    setEmpty(!made);
    setDraft(made);
  };
  const patch = (rowId, change) => setDraft((current) => ({ ...current, rows: current.rows.map((row) => (row.id === rowId ? { ...row, ...change } : row)) }));
  const remove = (rowId) => setDraft((current) => ({ ...current, rows: current.rows.filter((row) => row.id !== rowId) }));
  const send = async () => {
    setBusy(true); setError('');
    try {
      let student = null;
      try { student = await services.students?.getById?.(recording.studentId); } catch { /* name and level are optional */ }
      const result = await lib.sendErrorHomework({ rows: draft.rows, topicKey: draft.topicKey, recording, student, user, due, date: shortDate(recording.startedAt), services });
      setSent(result);
      setDraft(null);
    } catch (failure) {
      setError(failure?.message || 'Saatmine ei õnnestunud.');
    } finally { setBusy(false); }
  };

  if (sent) {
    return <p className="form-hint" role="status">Kodutöö saadetud: tööleht „{sent.title}”{sent.due ? `, tähtaeg ${displayDate(sent.due)}` : ''}. Õpilane näeb seda „Kodutööd” ja „Töölehed” all.</p>;
  }
  if (!draft) {
    return <div className="error-homework__start">
      <Button variant="secondary" onClick={open}><ClipboardList size={15} aria-hidden="true" /> Koosta kodutöö vigadest</Button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {empty ? <p className="form-hint" role="status">Selles tunnis pole kodutööks sobivaid lauseid (liiga lühikesed, ebakindlad või märgitud „Pole viga”).</p> : null}
    </div>;
  }

  const fixes = draft.rows.filter((row) => row.kind === 'fix');
  const choices = draft.rows.filter((row) => row.kind === 'choice');
  const ready = draft.rows.filter(lib.rowReady).length;
  return <section className="error-homework" aria-label="Kodutöö vigadest">
    <header>
      <b>Kodutöö vigadest · eelvaade</b>
      <small>Mustand. Õpilane ei näe seda enne, kui vajutad „Saada õpilasele”. Muuda või eemalda read, mis ei sobi.</small>
    </header>
    {fixes.length ? <div className="error-homework__group">
      <h4>Paranda lause ({fixes.length}) · õpilase enda laused tunnist</h4>
      <ol>{fixes.map((row, i) => <li key={row.id} className="error-homework__row">
        <Input label="Õpilase lause" value={row.wrong} maxLength={300} onChange={(event) => patch(row.id, { wrong: event.target.value })} />
        <Input label="Õige lause" value={row.answer} maxLength={300} onChange={(event) => patch(row.id, { answer: event.target.value })} />
        <IconButton label={`Eemalda lause ${i + 1}`} onClick={() => remove(row.id)}><Trash2 size={15} aria-hidden="true" /></IconButton>
      </li>)}</ol>
    </div> : null}
    {choices.length ? <div className="error-homework__group">
      <h4>{draft.topicKey === 'order' ? 'Vali õige sõnajärg' : 'Vali õige vorm'} ({choices.length}){draft.topic ? ` · ${draft.topic}` : ''}</h4>
      <ol>{choices.map((row, i) => <li key={row.id} className="error-homework__row is-choice">
        <Input label="Ülesanne" value={row.q} maxLength={300} onChange={(event) => patch(row.id, { q: event.target.value })} />
        <Input label="Õige vastus" value={row.answer} maxLength={200} onChange={(event) => patch(row.id, { answer: event.target.value })} />
        <Input label="Valed vastused (komaga)" value={row.wrong.join(', ')} maxLength={300} onChange={(event) => patch(row.id, { wrong: event.target.value.split(',').map((w) => w.trimStart()) })} />
        <IconButton label={`Eemalda ülesanne ${i + 1}`} onClick={() => remove(row.id)}><Trash2 size={15} aria-hidden="true" /></IconButton>
      </li>)}</ol>
    </div> : null}
    {!draft.rows.length ? <p className="form-hint">Kõik read on eemaldatud.</p> : null}
    <div className="error-homework__send">
      <Input label="Tähtaeg" type="date" value={due} onChange={(event) => setDue(event.target.value)} />
      <div className="lesson-ai__actions">
        <Button loading={busy} disabled={!ready || busy} onClick={send}><Send size={15} aria-hidden="true" /> Saada õpilasele ({ready})</Button>
        <Button variant="secondary" disabled={busy} onClick={() => { setDraft(null); setError(''); }}>Loobu</Button>
      </div>
    </div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
  </section>;
}
