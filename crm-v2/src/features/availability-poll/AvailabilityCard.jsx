import { CalendarClock, Check, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { needsReview, studentAvailabilityService } from '../../services/firebase/studentAvailability.js';
import PollGrid from './PollGrid.jsx';
import { PRESETS, cellsOf, pollPayload, summaryOf, withPreset } from './pollModel.js';
import './availabilityPoll.css';

const DAYS = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' };
const DAY_NAMES = { Mon: 'Esmaspäev', Tue: 'Teisipäev', Wed: 'Kolmapäev', Thu: 'Neljapäev', Fri: 'Reede', Sat: 'Laupäev', Sun: 'Pühapäev' };
const PRESET_LABELS = { weekdayEvenings: 'Tööpäeva õhtud 17–21', weekdayDays: 'Tööpäeviti 9–17', weekend: 'Nädalavahetus 10–18' };
const when = (iso) => (iso ? new Date(iso).toLocaleString('et-EE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const summaryText = (cells) => summaryOf(cells).map((row) => `${DAY_NAMES[row.day]} ${row.ranges.join(', ')}${row.best.length ? ` (★ ${row.best.join(', ')})` : ''}`);

// „Millal sulle tund sobib?” on the student's / parent's page and „Sobivad ajad” on the card (owner 2026-10-21).
// `mode`: 'own' (the student or parent edits), 'admin' (edits and marks a change reviewed), 'view' (a teacher reads).
export default function AvailabilityCard({ studentId, studentName = '', user, mode = 'own', service = studentAvailabilityService, compact = false }) {
  const state = useAsyncData(() => service.get(studentId), [service, studentId]);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const saved = state.data;
  const cells = saved ? cellsOf(saved.slots, saved.preferred) : {};
  const lines = summaryText(cells);
  const changed = mode === 'admin' && needsReview(saved);
  const canEdit = mode !== 'view';
  const title = mode === 'own' ? 'Millal sulle tund sobib?' : 'Sobivad ajad';

  const save = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      await service.save(studentId, { ...pollPayload(editing.cells), message: editing.message }, user, saved);
      setEditing(null); setNotice(mode === 'own' ? 'Salvestatud. Kool näeb sinu aegu ja pakub vajadusel uue tunniaja.' : 'Salvestatud.');
      await state.reload();
    } catch (caught) { setError(caught.message || 'Salvestamine ebaõnnestus.'); } finally { setBusy(false); }
  };
  const review = async () => {
    setBusy(true); setError('');
    try { await service.markReviewed(studentId, user); await state.reload(); } catch (caught) { setError(caught.message || 'Ei õnnestunud.'); } finally { setBusy(false); }
  };

  return (
    <Card className={`availability-card ${changed ? 'is-changed' : ''}`} id="sobivad-ajad">
      <div className="section-heading">
        <div><span className="eyebrow"><CalendarClock size={13} /> {studentName || 'Tunniplaan'}</span><h2>{title}</h2></div>
        {changed ? <Badge tone="warning">Muutunud {when(saved.changedAt)}</Badge> : null}
        {canEdit && !editing ? <Button variant="secondary" onClick={() => { setNotice(''); setEditing({ cells, message: saved?.message || '' }); }}><Pencil size={15} /> {saved ? 'Muuda' : 'Märgi ajad'}</Button> : null}
      </div>
      {state.loading ? <p className="form-hint">Laen…</p> : null}
      {!state.loading && !saved && !editing ? <p className="form-hint">{mode === 'own' ? 'Märgi kõik ajad, mil saad tunnis tegelikult osaleda — nii saab kool pakkuda sulle sobiva tunniaja ka siis, kui tunniplaan muutub.' : 'Õpilane ei ole veel sobivaid aegu märkinud.'}</p> : null}

      {!editing && saved ? <>
        <ul className="availability-card__lines">{lines.map((line) => <li key={line}>{line}</li>)}</ul>
        {saved.message ? <p className="availability-card__note">„{saved.message}”</p> : null}
        <p className="form-hint">Uuendatud {when(saved.changedAt)}{saved.changedByName ? ` · ${saved.changedByName}` : ''}</p>
        {changed && saved.previousSlots.length ? <details className="availability-card__before"><summary>Mis oli enne</summary><ul>{summaryText(cellsOf(saved.previousSlots, saved.previousPreferred)).map((line) => <li key={line}>{line}</li>)}</ul></details> : null}
        {!compact ? <div className="availability-card__grid"><PollGrid cells={cells} dayNames={DAYS} label={`${studentName || 'Õpilane'}: sobivad ajad`} /></div> : null}
        {changed ? <Button loading={busy} onClick={review}><Check size={16} /> Vaadatud</Button> : null}
      </> : null}

      {editing ? <div className="availability-card__edit">
        <p className="poll-important">Märgi KÕIK ajad, mil saad tunnis tegelikult olla — mitte ainult kõige meelepärasemad. Puuduta tundi: sobib; uuesti: ★ sobib kõige paremini.</p>
        <div className="poll-quick"><span>Kiirvalik:</span>{Object.entries(PRESETS).map(([key, preset]) => <button type="button" key={key} onClick={() => setEditing((current) => ({ ...current, cells: withPreset(current.cells, preset) }))}>{PRESET_LABELS[key]}</button>)}<button type="button" className="is-clear" onClick={() => setEditing((current) => ({ ...current, cells: {} }))}>Tühjenda</button></div>
        <PollGrid cells={editing.cells} onChange={(next) => setEditing((current) => ({ ...current, cells: next }))} dayNames={DAYS} partNames={{ morning: 'Hommik', day: 'Päev', evening: 'Õhtu' }} label="Märgi sobivad ajad" />
        <label className="availability-card__comment"><span>Kommentaar (valikuline)</span><textarea rows={2} maxLength={1000} placeholder="Nt alates millal uus aeg sobib" value={editing.message} onChange={(event) => setEditing((current) => ({ ...current, message: event.target.value }))} /></label>
        <div className="availability-card__actions"><Button loading={busy} disabled={!Object.values(editing.cells).some(Boolean)} onClick={save}>Salvesta ajad</Button><Button variant="secondary" disabled={busy} onClick={() => setEditing(null)}>Loobu</Button></div>
      </div> : null}
      {notice ? <p className="form-hint" role="status">{notice}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </Card>
  );
}
