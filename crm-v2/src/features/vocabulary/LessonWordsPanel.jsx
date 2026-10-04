import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { WORD_LIMITS, newestFirst, sameWord } from './wordsModel.js';
import './vocabulary.css';

const EMPTY = { word: '', translation: '', example: '' };

/**
 * Live Classroom drawer „Sõnad”: the teacher writes a new word (translation and example optional) and it goes straight
 * into the student's own word list; the student sees the words of this lesson appear and practises them later.
 */
export default function LessonWordsPanel({ studentId, invitationId, user, teacher = false, service = studentWordsService }) {
  const [words, setWords] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try {
      return service.subscribeForStudent(studentId, (items) => { setWords(items); setError(''); }, (next) => setError(next?.message || 'Sõnu ei saanud laadida.'));
    } catch (next) {
      globalThis.queueMicrotask(() => setError(next?.message || 'Sõnu ei saanud laadida.'));
      return undefined;
    }
  }, [service, studentId]);
  const lessonWords = useMemo(() => newestFirst(words.filter((item) => item.invitationId === invitationId)), [invitationId, words]);
  const duplicate = sameWord(words, form.word);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.word.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      await service.add({ studentId, invitationId, user, ...form });
      setForm(EMPTY);
      event.target.querySelector('input')?.focus?.();
    } catch (next) {
      setError(next?.message || 'Sõna ei saanud lisada.');
    } finally {
      setBusy(false);
    }
  };
  const remove = (item) => service.remove(item.id).catch((next) => setError(next?.message || 'Sõna ei saanud kustutada.'));
  const field = (key, label, extra = {}) => <label className="vw-field"><span>{label}</span>
    <input value={form[key]} maxLength={WORD_LIMITS[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} {...extra} /></label>;

  return (
    <div className="vw-panel">
      {teacher ? <form className="vw-form" onSubmit={submit} aria-label="Uus sõna">
        {field('word', 'Sõna või väljend', { required: true, autoComplete: 'off' })}
        {field('translation', 'Tõlge või selgitus', { autoComplete: 'off' })}
        {field('example', 'Näitelause', { autoComplete: 'off' })}
        {duplicate ? <p className="vw-note" role="status">„{duplicate.word}” on õpilase sõnastikus juba olemas.</p> : null}
        <button type="submit" className="vw-btn is-primary" disabled={busy || !form.word.trim()}>Lisa sõnastikku</button>
      </form> : <p className="vw-note">Õpetaja lisab siia tunni uued sõnad. Need jäävad sinu sõnastikku („Minu õpingud” → „Minu sõnad”).</p>}
      {error ? <p className="vw-error" role="alert">{error}</p> : null}
      <h3 className="vw-heading">Selle tunni sõnad ({lessonWords.length})</h3>
      {lessonWords.length ? <ul className="vw-list">{lessonWords.map((item) => <li key={item.id}>
        <span><strong>{item.word}</strong>{item.translation ? <> — {item.translation}</> : null}{item.example ? <small>{item.example}</small> : null}</span>
        {teacher ? <button type="button" className="vw-icon" aria-label={`Kustuta „${item.word}”`} onClick={() => remove(item)}><Trash2 size={15} /></button> : null}
      </li>)}</ul> : <p className="vw-muted">Selles tunnis pole veel sõnu lisatud.</p>}
      <p className="vw-muted">Sõnastikus kokku {words.length} sõna.</p>
    </div>
  );
}
