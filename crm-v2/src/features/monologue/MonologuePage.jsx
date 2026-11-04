import { ArrowLeft, Mic, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Button, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { studentsService } from '../../services/firebase/students.js';
import { studentMonologuesService } from '../../services/firebase/studentMonologues.js';
import VoiceAnswer from '../homework/VoiceAnswer.jsx';
import { clockLabel } from '../homework/voiceTask.js';
import { MONOLOGUE_SECONDS, monologueLevel, monthLabel, monthOf, promptById, promptForLevel } from './monologueModel.js';
import '../homework/learnerTasks.css';
import '../homework/reviewLayout.css';
import './monologue.css';

function Recording({ item, service, label }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const load = async () => {
    setError('');
    try { setUrl(await service.audioUrl(item.audioPath)); } catch (e) { setError(e?.message || 'Salvestust ei saanud avada.'); }
  };
  if (url) return <audio controls autoPlay src={url} aria-label={label} />;
  return <span className="mono-play">
    <Button variant="secondary" onClick={load}>Kuula ({clockLabel(item.seconds)})</Button>
    {error ? <span className="form-error" role="alert">{error}</span> : null}
  </span>;
}

/**
 * „Kuu monoloog” for the student (/student/monoloog): this month's fixed prompt, two minutes, listen, record again, send.
 * Opened from the task in „Ülesanded”; nothing about it is on the home page (owner: the first screen stays one step).
 */
export default function MonologuePage({ studentRepository = studentsService, service = studentMonologuesService, today }) {
  const { user, preview } = useAuth();
  const navigate = useNavigate();
  const canAct = !preview;
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const month = monthOf(today || new Date());

  const state = useAsyncData(async () => {
    const records = preview?.studentId && studentRepository.getById
      ? [await studentRepository.getById(preview.studentId)].filter(Boolean)
      : await studentRepository.listOwned(user.uid);
    const student = records.find((record) => monologueLevel(record)) || null;
    const monologues = student ? await service.listByStudent(student.id) : [];
    return { student, monologues };
  }, [preview?.studentId, service, studentRepository, user.uid]);

  if (state.loading && !state.data) return <LoadingState label="Laen…" />;
  if (state.error && !state.data) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const { student, monologues } = state.data;
  const back = <Link className="mono-back" to="/homework"><ArrowLeft size={15} aria-hidden="true" /> Ülesanded</Link>;
  if (!student) {
    return <div className="page-content mono-page">{back}
      <EmptyState title="Kuu monoloogi praegu ei ole" description="Kuu monoloog algab eesti keele tasemest A2. · Ежемесячный монолог начинается с уровня A2." />
    </div>;
  }

  const level = monologueLevel(student);
  const prompt = promptForLevel(level);
  const current = monologues.find((item) => item.month === month) || null;
  const earlier = monologues.filter((item) => item.month !== month);

  const send = async ({ file, seconds }) => {
    setBusy(true); setError('');
    try {
      await service.submit({ student, uid: user.uid, month, level, blob: file, seconds, existing: current });
      setRecording(false);
      setSent(true);
      await state.reload();
    } catch (e) {
      setError(e?.message || 'Salvestust ei saanud saata. Proovi uuesti.');
    } finally { setBusy(false); }
  };

  return <div className="page-content mono-page">
    {back}
    <PageHeader compact title={`Kuu monoloog · ${monthLabel(month)}`}
      description={<>Üks kord kuus räägid samal teemal 2 minutit. Nii kuuled ise, kuidas su keel areneb.<span className="lt-ru" lang="ru"> · Раз в месяц 2 минуты на одну и ту же тему: так слышно, как растёт твой язык.</span></>} />

    <section className="mono-prompt" aria-labelledby="mono-prompt-title">
      <h2 id="mono-prompt-title">{prompt.title}</h2>
      <p className="lt-ru" lang="ru">{prompt.ru}</p>
      <ul>{prompt.hints.map((line) => <li key={line}>{line}</li>)}</ul>
      <p className="mono-tip">Räägi vabalt, ära loe paberilt. Kuni {MONOLOGUE_SECONDS / 60} minutit, salvestus lõpeb ise.<span className="lt-ru" lang="ru"> · Говори свободно, не читай. Запись остановится сама через 2 минуты.</span></p>
    </section>

    {sent ? <div className="success-notice" role="status">Monoloog on saadetud. Õpetaja kuulab seda.<button aria-label="Sulge teade" onClick={() => setSent(false)}>×</button></div> : null}
    {error ? <div className="action-error" role="alert">{error}<button aria-label="Sulge teade" onClick={() => setError('')}>×</button></div> : null}

    {current && !recording ? <section className="mono-done" aria-label="Selle kuu salvestus">
      <p><strong>Selle kuu monoloog on salvestatud</strong> ({clockLabel(current.seconds)}).</p>
      <Recording item={current} service={service} label="Sinu selle kuu monoloog" />
      {canAct ? <Button variant="secondary" onClick={() => { setSent(false); setRecording(true); }}><RotateCcw size={15} /> Salvesta uuesti</Button> : null}
    </section> : null}

    {!current && !recording && canAct ? <Button onClick={() => setRecording(true)}><Mic size={16} /> Alusta</Button> : null}
    {recording && canAct ? <VoiceAnswer busy={busy} maxSeconds={MONOLOGUE_SECONDS} sendLabel="Saada monoloog" cancelLabel="Loobu"
      onSend={send} onCancel={() => (current ? setRecording(false) : navigate('/homework'))} /> : null}
    {!canAct ? <p className="mono-tip">Eelvaade: salvestada saab ainult õpilane ise.</p> : null}

    {earlier.length ? <details className="mono-earlier">
      <summary>Minu varasemad monoloogid ({earlier.length})<span className="lt-ru" lang="ru"> · прошлые месяцы</span></summary>
      <ul>{earlier.map((item) => <li key={item.id}>
        <span>{monthLabel(item.month)}{promptById(item.promptId) && item.promptId !== prompt.id ? ` · ${promptById(item.promptId).title}` : ''}</span>
        <Recording item={item} service={service} label={`Monoloog ${monthLabel(item.month)}`} />
      </li>)}</ul>
    </details> : null}
  </div>;
}
