import { Layers, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Input, Select } from '../../components/ui/index.js';
import { studentsService } from '../../services/firebase/students.js';
import { studyDirectionsService } from '../../services/firebase/studyDirections.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import { directionList, findDirection, parseList, subjectUsage } from '../students/studyDirections.js';
import { resetStudyDirectionsCache } from '../students/useStudyDirections.js';
import '../students/directions.css';

const EMPTY = { id: '', name: '', shortLabel: '', color: '#2f6fed', levels: '', aliases: '', status: 'active', order: '' };
const toForm = (item) => ({ ...EMPTY, ...item, levels: (item.levels || []).join(', '), aliases: (item.aliases || []).join(', '), order: String(item.order ?? '') });

// Seaded → „Õppesuunad” (owner 2026-10-24): the administrator keeps the school's list of directions — name, short
// label, colour, levels (A1–C1, 1.–12. klass …), other spellings — and archives one that is no longer taught. Every
// subject choice (student card, „Õppesuunad”, new child, group) reads this list. Nothing is deleted; cards that
// still carry an old value keep it.
export default function StudyDirectionsCard({ user, service = studyDirectionsService, studentService = studentsService }) {
  const [list, setList] = useState(null);
  const [usage, setUsage] = useState(null);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setList(directionList(await service.list())); } catch (err) { setList(directionList([])); setError(firebaseErrorMessage(err)); }
  }, [service]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    let alive = true;
    Promise.resolve(studentService.list({ pageSize: 500, exhaustive: true })).then((result) => { if (alive) setStudents(result?.items || []); }).catch(() => {});
    return () => { alive = false; };
  }, [studentService]);
  useEffect(() => { if (list) setUsage(subjectUsage(students, list)); }, [list, students]);

  const fallback = Boolean(list?.[0]?.fallback);
  const unknown = usage ? [...usage.entries()].filter(([subject]) => !findDirection(subject, list || [])) : [];

  const save = async (values) => {
    setBusy(true); setError('');
    try {
      // the built-in list is stored first, so saving one direction does not drop the others
      if (fallback) for (const [index, item] of list.entries()) if (!values.fallback || item.id !== values.id) await service.save({ ...item }, user, index + 1);
      const order = values.order === '' || values.order === undefined ? (list?.length || 0) + 1 : Number(values.order);
      await service.save({ ...values, levels: Array.isArray(values.levels) ? values.levels : parseList(values.levels), aliases: Array.isArray(values.aliases) ? values.aliases : parseList(values.aliases), order: Number.isInteger(order) ? order : 0 }, user, order);
      resetStudyDirectionsCache();
      setForm(null);
      await load();
    } catch (err) { setError(firebaseErrorMessage(err)); } finally { setBusy(false); }
  };

  return (
    <Card className="study-directions-card">
      <div className="settings-icon"><Layers /></div>
      <h2>Õppesuunad</h2>
      <p className="settings-copy">Kooli õppesuundade loend: seda näed igal pool, kus valitakse õppeaine (õpilase kaart, „Õppesuunad”, uus laps, grupp). Arhiveeritud suund jääb vanadele kaartidele alles, aga uutele ei pakuta.</p>
      {fallback ? <p className="form-hint">Loendit pole veel salvestatud — kasutusel on vaikimisi suunad. Esimene salvestus salvestab kogu loendi.</p> : null}
      {!list ? <p className="form-hint">Laen…</p> : <ul className="study-directions-card__list">
        {list.map((item) => <li key={item.id} className={item.status === 'archived' ? 'is-archived' : ''}>
          <span className="student-directions__dot" style={item.color ? { background: item.color } : undefined} aria-hidden="true">{item.shortLabel || item.name.slice(0, 2).toUpperCase()}</span>
          <div><strong>{item.name}</strong><small>{item.levels.length ? `${item.levels[0]} … ${item.levels[item.levels.length - 1]}` : 'tasemeteta'}{item.aliases.length ? ` · ka: ${item.aliases.join(', ')}` : ''}{usage ? ` · ${usage.get(item.name) || 0} õpilast` : ''}</small></div>
          {item.status === 'archived' ? <Badge tone="neutral">arhiveeritud</Badge> : null}
          <div className="study-directions-card__actions">
            <Button variant="secondary" disabled={busy} onClick={() => setForm(toForm(item))}>Muuda</Button>
            <Button variant="secondary" disabled={busy} onClick={() => save({ ...item, status: item.status === 'archived' ? 'active' : 'archived' })}>{item.status === 'archived' ? 'Taasta' : 'Arhiveeri'}</Button>
          </div>
        </li>)}
      </ul>}
      {unknown.length ? <div className="form-hint study-directions-card__unknown"><strong>Kaartidel on ka:</strong> {unknown.map(([subject, count]) => <span key={subject}>{subject} ({count}) <button type="button" className="profile-track-add" disabled={busy} onClick={() => setForm({ ...EMPTY, name: subject, shortLabel: subject.slice(0, 2).toUpperCase() })}>lisa loendisse</button></span>)}<br />Kui see on olemasoleva suuna teine kirjapilt, lisa see selle suuna „Muud kirjapildid” alla.</div> : null}
      {!form ? <Button variant="secondary" disabled={busy || !list} onClick={() => setForm({ ...EMPTY })}><Plus size={16} /> Lisa õppesuund</Button> : (
        <form className="form-grid study-directions-card__form" onSubmit={(event) => { event.preventDefault(); save(form); }}>
          <Input label="Nimi" required maxLength={80} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input label="Lühend" maxLength={6} value={form.shortLabel} onChange={(event) => setForm({ ...form, shortLabel: event.target.value })} />
          <Input label="Värv" type="color" value={form.color || '#2f6fed'} onChange={(event) => setForm({ ...form, color: event.target.value })} />
          <Select label="Staatus" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="active">Kasutusel</option><option value="archived">Arhiveeritud</option></Select>
          <Input className="form-grid__wide" label="Tasemed (komaga)" placeholder="A1, A2, B1, B2, C1 või 1. klass, 2. klass …" value={form.levels} onChange={(event) => setForm({ ...form, levels: event.target.value })} />
          <Input className="form-grid__wide" label="Muud kirjapildid (komaga)" placeholder="nt English, Inglise" value={form.aliases} onChange={(event) => setForm({ ...form, aliases: event.target.value })} />
          <Input label="Järjekord" type="number" min={0} max={999} value={form.order} onChange={(event) => setForm({ ...form, order: event.target.value })} />
          <div className="form-grid__wide study-directions-card__actions"><Button variant="secondary" type="button" disabled={busy} onClick={() => setForm(null)}>Loobu</Button><Button type="submit" loading={busy}>Salvesta õppesuund</Button></div>
        </form>
      )}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </Card>
  );
}
