import { GitCompare, Mic, Pencil } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button, Card, LoadingState } from '../../components/ui/index.js';
import { studentMonologuesService } from '../../services/firebase/studentMonologues.js';
import { clockLabel } from '../homework/voiceTask.js';
import { NOTE_MAX, analysisFor, defaultPair, monologueLevel, monologueStats, monthLabel, promptById, promptForLevel } from './monologueModel.js';
import './monologue.css';

function StatLine({ item }) {
  const { seconds, words, wpm } = monologueStats(item);
  return <span className="mono-stats">
    <span>{clockLabel(seconds)}</span>
    {words != null ? <span>{words} sõna</span> : <span className="mono-muted">teksti veel pole</span>}
    {wpm != null ? <span>{wpm} sõna/min</span> : null}
  </span>;
}

// the school Mac's error check (a model's guess; this card is staff-only): the top topics next to the numbers, the
// text and the flagged sentences behind „Tekst”
function AnalysisLine({ analysis }) {
  if (!analysis) return null;
  const { checked, errors, topics } = analysis;
  return <span className="mono-analysis">
    {`${checked} lauset kontrollitud, ${errors.length} võimalikku viga`}
    {topics.length ? `: ${topics.map((t) => `${t.label} (${t.count})`).join(', ')}` : ''}
  </span>;
}

function TextDetails({ item, analysis }) {
  if (!item.transcriptText) return null;
  return <details className="mono-details">
    <summary>Tekst{analysis?.errors.length ? ' ja vead' : ''}</summary>
    <p className="mono-transcript">{item.transcriptText}</p>
    {analysis?.errors.length ? <ul className="mono-errors">
      {analysis.errors.map((e, i) => <li key={i}><s>{e.said}</s> → {e.corrected}{e.kind ? <span className="mono-muted"> ({e.kind})</span> : null}</li>)}
    </ul> : null}
    <p className="form-hint">Tekst ja vead on kooli Maci mudeli pakkumine, mitte hinne. Õpilane vigu ei näe.</p>
  </details>;
}

// the file's address is asked only when someone presses play (keyed by the file, so a new month starts fresh)
function Player({ item, service, label }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  if (url) return <audio controls src={url} aria-label={label} />;
  return <span className="mono-play">
    <Button variant="secondary" onClick={async () => {
      try { setUrl(await service.audioUrl(item.audioPath)); } catch (e) { setError(e?.message || 'Salvestust ei saanud avada.'); }
    }}>Kuula</Button>
    {error ? <span className="form-error" role="alert">{error}</span> : null}
  </span>;
}

function NoteEditor({ item, note, service, user, onSaved }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(note?.text || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!open) {
    return <div className="mono-note">
      {note?.text ? <p><strong>Õpetaja märkus:</strong> {note.text}</p> : null}
      <button type="button" className="link-button" onClick={() => { setText(note?.text || ''); setOpen(true); }}><Pencil size={13} aria-hidden="true" /> {note?.text ? 'Muuda märkust' : 'Lisa märkus'}</button>
    </div>;
  }
  const save = async () => {
    setBusy(true); setError('');
    try { onSaved(item.id, await service.saveNote({ monologue: item, text, user })); setOpen(false); }
    catch (e) { setError(e?.message || 'Märkust ei saanud salvestada.'); }
    finally { setBusy(false); }
  };
  return <div className="mono-note">
    <label className="form-field">
      <span>Märkus (näeb ainult õpetaja ja administraator)</span>
      <textarea rows={2} maxLength={NOTE_MAX} value={text} onChange={(event) => setText(event.target.value)} />
    </label>
    <div className="mono-actions">
      <Button loading={busy} onClick={save}>Salvesta</Button>
      <Button variant="secondary" disabled={busy} onClick={() => { setText(note?.text || ''); setOpen(false); }}>Loobu</Button>
    </div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
  </div>;
}

function Compare({ items, service }) {
  const [pair, setPair] = useState(() => defaultPair(items));
  const pick = (index, id) => setPair((current) => { const next = [...current]; next[index] = id; return next; });
  return <div className="mono-compare" aria-label="Kahe kuu võrdlus">
    {pair.map((id, index) => {
      const item = items.find((entry) => entry.id === id) || items[index];
      return <div className="mono-compare__side" key={index}>
        <label className="form-field">
          <span>{index === 0 ? 'Varasem kuu' : 'Hilisem kuu'}</span>
          <select value={item.id} onChange={(event) => pick(index, event.target.value)}>
            {items.map((entry) => <option key={entry.id} value={entry.id}>{monthLabel(entry.month)}</option>)}
          </select>
        </label>
        <StatLine item={item} />
        <Player key={item.audioPath} item={item} service={service} label={`Monoloog ${monthLabel(item.month)}`} />
        {item.transcriptText ? <p className="mono-transcript">{item.transcriptText}</p> : null}
      </div>;
    })}
  </div>;
}

/**
 * Student card → „Areng” → „Monoloogid”: the student's monthly two-minute monologues on the same prompt, by month;
 * „Võrdle” plays two months side by side. The note is for staff only (`studentMonologueNotes`, the student cannot read it).
 */
export default function MonologuesCard({ student, user, service = studentMonologuesService, className = '' }) {
  const [state, setState] = useState({ loading: true, error: '', items: [], notes: {}, analyses: {} });
  const [comparing, setComparing] = useState(false);
  const load = useCallback(() => {
    Promise.resolve().then(() => {
      setState((current) => ({ ...current, loading: true, error: '' }));
      return Promise.all([
        service.listByStudent(student.id),
        service.listNotes(student.id).catch(() => ({})),
        // rules not deployed yet, or an older service: the card works without the error check
        Promise.resolve().then(() => service.listAnalysis?.(student.id) || {}).catch(() => ({})),
      ]);
    })
      .then(([items, notes, analyses]) => setState({ loading: false, error: '', items, notes, analyses }))
      .catch((error) => setState({ loading: false, error: error?.message || 'Monolooge ei saanud laadida.', items: [], notes: {}, analyses: {} }));
  }, [service, student.id]);
  useEffect(() => { load(); }, [load]);

  const level = monologueLevel(student);
  const prompt = promptForLevel(level);
  const { items, notes, analyses } = state;
  const setNote = (id, note) => setState((current) => {
    const next = { ...current.notes };
    if (note) next[id] = note; else delete next[id];
    return { ...current, notes: next };
  });

  return <Card className={`mono-card ${className}`} aria-labelledby="mono-card-title">
    <div className="mono-card__head">
      <h3 id="mono-card-title"><Mic size={17} aria-hidden="true" /> Monoloogid</h3>
      {items.length >= 2 ? <Button variant="secondary" aria-pressed={comparing} onClick={() => setComparing(!comparing)}><GitCompare size={15} /> {comparing ? 'Sulge võrdlus' : 'Võrdle'}</Button> : null}
    </div>
    <p className="form-hint">{prompt
      ? <>Kord kuus 2 minutit samal teemal: „{prompt.title}” (tase {level}). Õpilane näeb seda ülesannete all.</>
      : 'Kuu monoloog algab eesti keele tasemest A2 (kaardil on tase märkimata või madalam).'}</p>
    {state.loading ? <LoadingState inline className="mono-muted" label="Laen…" /> : null}
    {state.error ? <p className="form-error" role="alert">{state.error} <button type="button" className="link-button" onClick={load}>Proovi uuesti</button></p> : null}
    {!state.loading && !state.error && !items.length ? <p className="mono-muted">Salvestusi veel pole.</p> : null}
    {comparing && items.length >= 2 ? <Compare items={items} service={service} /> : null}
    {items.length ? <ul className="mono-list">
      {items.map((item) => <li key={item.id}>
        <div className="mono-row">
          <strong>{monthLabel(item.month)}</strong>
          {item.promptId !== prompt?.id && promptById(item.promptId) ? <span className="mono-muted">„{promptById(item.promptId).title}”</span> : null}
          <StatLine item={item} />
          <Player item={item} service={service} label={`Monoloog ${monthLabel(item.month)}`} />
          <AnalysisLine analysis={analysisFor(item, analyses)} />
        </div>
        <TextDetails item={item} analysis={analysisFor(item, analyses)} />
        <NoteEditor item={item} note={notes[item.id]} service={service} user={user} onSaved={setNote} />
      </li>)}
    </ul> : null}
  </Card>;
}
