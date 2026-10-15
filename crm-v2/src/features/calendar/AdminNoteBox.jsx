import { StickyNote } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/index.js';

// The administrator's note on a lesson (Oleksiy 2026-10-15): written by the administrator, seen by the administrator
// and the lesson's teacher only. A recurring lesson: the note is for every lesson of the series or for this date only.
export default function AdminNoteBox({ item, notes = [], canEdit = false, onSave }) {
  const series = notes.find((note) => !note.date) || null;
  const day = notes.find((note) => note.date) || null;
  const [scope, setScope] = useState(day || !item.recurring ? 'day' : 'series');
  const current = item.recurring ? (scope === 'day' ? day : series) : (day || series);
  const [text, setText] = useState(current?.text || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const changeScope = (next) => { setScope(next); setText((next === 'day' ? day : series)?.text || ''); setSaved(''); };

  if (!canEdit && !notes.length) return null;
  const save = async () => {
    setSaving(true); setError(''); setSaved('');
    try {
      const date = item.recurring && scope === 'series' ? '' : item.occurrenceDate || '';
      await onSave({ date, text });
      setSaved(text.trim() ? 'Märkus salvestatud.' : 'Märkus eemaldatud.');
    } catch (caught) { setError(caught.message || 'Märkust ei saanud salvestada.'); } finally { setSaving(false); }
  };

  return <section className="lp-admin-note" aria-label="Admini märkus">
    <h3><StickyNote size={16} /> Admini märkus <small>näevad ainult admin ja õpetaja</small></h3>
    {!canEdit ? notes.map((note) => <p key={note.id} className="lp-admin-note__text">{note.text}<small>{note.date ? 'see tund' : 'kõik selle sarja tunnid'}{note.updatedByName ? ` · ${note.updatedByName}` : ''}</small></p>) : <>
      {item.recurring ? <div className="lp-admin-note__scope" role="radiogroup" aria-label="Märkuse ulatus">
        <label><input type="radio" name="admin-note-scope" checked={scope === 'series'} onChange={() => changeScope('series')} /> Kõik selle sarja tunnid</label>
        <label><input type="radio" name="admin-note-scope" checked={scope === 'day'} onChange={() => changeScope('day')} /> Ainult see tund</label>
      </div> : null}
      {item.recurring && scope === 'day' && series ? <p className="form-hint">Sarja märkus: {series.text}</p> : null}
      {item.recurring && scope === 'series' && day ? <p className="form-hint">Selle tunni märkus: {day.text}</p> : null}
      <textarea className="field__input" aria-label="Admini märkuse tekst" rows={3} maxLength={1000} value={text} placeholder="Nt: maksab isa; tuleb vennaga; sel nädalal veebis" onChange={(event) => { setText(event.target.value); setSaved(''); }} />
      <div className="lp-admin-note__actions"><Button variant="secondary" loading={saving} onClick={save}>Salvesta märkus</Button>{saved ? <span role="status">{saved}</span> : null}</div>
      {error ? <p className="action-error" role="alert">{error}</p> : null}
    </>}
  </section>;
}
