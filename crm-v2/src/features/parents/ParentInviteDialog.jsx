import { Copy, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Input, Modal } from '../../components/ui/index.js';
import { accountApprovalsService } from '../../services/firebase/accountApprovals.js';
import { studentsService } from '../../services/firebase/students.js';
import ArchivedLinkAsk from './ArchivedLinkAsk.jsx';
import { childPickerGroups, isArchivedCard } from './childPicker.js';

const blank = { displayName: '', email: '', phone: '', studentIds: [] };

// „Lisa lapsevanem” (owner 2026-10-15): the administrator creates a parent's login (no password) and links it to the
// chosen children's cards; the parent gets an e-mail with the link to set the password. An e-mail that already has a
// parent login links that login and sends a new password link (the server decides, functions/parent-invite-core.js).
// `initial` prefills the form (the student card: the card's parent name and e-mail, the card chosen).
// Archived cards are offered under „Arhiveeritud” (Oleksiy 2026-11-06); choosing one asks „Taasta ja seo” /
// „Seo arhiveerituna” — the restore runs after the account is created (studentRepository.restore).
export default function ParentInviteDialog({ open, onClose, students = [], initial = null, service = accountApprovalsService, studentRepository = studentsService, onDone }) {
  const [form, setForm] = useState(() => ({ ...blank, ...(initial || {}) }));
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [ask, setAsk] = useState(null);
  const [restoreIds, setRestoreIds] = useState([]);
  const [restoreNote, setRestoreNote] = useState('');

  const chosen = students.filter((student) => form.studentIds.includes(student.id));
  const matches = useMemo(() => {
    if (!query.trim()) return { active: [], archived: [] };
    const groups = childPickerGroups(students.filter((student) => !form.studentIds.includes(student.id)), query);
    return { active: groups.active.slice(0, 8), archived: groups.archived.slice(0, 8) };
  }, [form.studentIds, query, students]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const toggle = (id) => setForm((current) => ({ ...current, studentIds: current.studentIds.includes(id) ? current.studentIds.filter((item) => item !== id) : [...current.studentIds, id] }));
  const toggleOff = (id) => { toggle(id); setRestoreIds((current) => current.filter((item) => item !== id)); };
  const pick = (student, { confirmed = false, restore = false } = {}) => {
    if (isArchivedCard(student) && !confirmed) { setAsk(student); return; }
    setAsk(null);
    if (restore) setRestoreIds((current) => [...new Set([...current, student.id])]);
    toggle(student.id);
    setQuery('');
    // the first child fills in an empty name / e-mail from its card
    setForm((current) => ({ ...current, displayName: current.displayName || student.parentName || '', email: current.email || student.parentEmail || '' }));
  };
  const close = () => {
    if (busy) return;
    setForm({ ...blank, ...(initial || {}) }); setQuery(''); setError(''); setResult(null); setCopied(false); setRequestId(''); setAsk(null); setRestoreIds([]); setRestoreNote('');
    onClose?.();
  };
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError(''); setCopied(false);
    // one request id per form: a retry after an error never links twice
    const id = requestId || `invite-parent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setRequestId(id);
    try {
      const data = await service.inviteParent({ ...form, requestId: id });
      // „Taasta ja seo”: the chosen archived cards become active once they are linked
      const toRestore = restoreIds.filter((item) => form.studentIds.includes(item));
      if (toRestore.length) {
        const names = students.filter((student) => toRestore.includes(student.id)).map((student) => student.name).join(', ');
        try { await studentRepository.restore(toRestore); setRestoreNote(`Taastati arhiivist: ${names}.`); }
        catch (caught) { setRestoreNote(`Laps on seotud, aga kaarti ei õnnestunud taastada (${names}): ${caught.message || 'viga'}. Taasta see õpilase kaardil.`); }
      }
      setResult(data);
      await onDone?.(data);
    } catch (caught) { setError(caught.message || 'Kontot ei saanud luua.'); }
    finally { setBusy(false); }
  };
  const copy = async () => {
    try { await globalThis.navigator.clipboard.writeText(result.link); setCopied(true); } catch { setCopied(false); }
  };

  return <Modal open={open} title="Lisa lapsevanema konto" onClose={close} footer={result
    ? <Button onClick={close}>Valmis</Button>
    : <><Button variant="secondary" disabled={busy} onClick={close}>Loobu</Button><Button type="submit" form="parent-invite-form" loading={busy}><Send size={16} /> Loo ja saada kutse</Button></>}>
    {result ? <div className="success-notice" role="status">
      <span>{result.created ? `Konto loodud: ${result.email}. ` : `Konto ${result.email} oli juba olemas: lapsed on seotud, saadetud uus parooli link. `}
        {result.mailed ? 'Kiri on saadetud.' : 'Kirja ei õnnestunud kinnitada — saada link lapsevanemale ise.'}{restoreNote ? ` ${restoreNote}` : ''}</span>
      {result.link ? <Button type="button" variant="secondary" onClick={copy}><Copy size={15} /> {copied ? 'Kopeeritud' : 'Kopeeri link'}</Button> : null}
    </div> : <form id="parent-invite-form" className="form-grid" onSubmit={submit}>
      <Input label="Lapsevanema nimi" required value={form.displayName} onChange={set('displayName')} />
      <Input label="E-post (kasutajanimi)" type="email" required value={form.email} onChange={set('email')} />
      <Input label="Telefon" value={form.phone} onChange={set('phone')} />
      <div className="field form-grid__wide">
        <span className="field__label">Lapsed</span>
        {chosen.length ? <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{chosen.map((student) => <Button key={student.id} type="button" variant="secondary" aria-label={`Eemalda ${student.name}`} onClick={() => toggleOff(student.id)}>{student.name}{student.subject ? ` · ${student.subject}` : ''}{isArchivedCard(student) ? (restoreIds.includes(student.id) ? ' · taastatakse' : ' · arhiveeritud') : ''} ×</Button>)}</div> : <p className="form-hint">Lapsi pole valitud: konto luuakse ja lapse saab lisada hiljem („Lisa laps”).</p>}
        <input aria-label="Otsi last" className="field__input" type="search" placeholder="Otsi nime, e-posti, telefoni või lapsevanema järgi" value={query} onChange={(event) => { setQuery(event.target.value); setAsk(null); }} />
        {[['active', 'Aktiivsed õpilased', matches.active], ['archived', 'Arhiveeritud', matches.archived]].map(([key, heading, items]) => items.length ? <div key={key} role="group" aria-label={heading} style={{ display: 'grid', gap: 4 }}>
          {key === 'archived' || matches.archived.length ? <strong className="form-hint">{heading}</strong> : null}
          {items.map((student) => <Button key={student.id} type="button" variant="secondary" disabled={ask?.id === student.id} onClick={() => pick(student)}>+ {student.name}{student.subject ? ` · ${student.subject}` : ''}{student.parentName ? ` · ${student.parentName}` : ''}</Button>)}
        </div> : null)}
        {query.trim() && !matches.active.length && !matches.archived.length ? <p className="form-hint">Õpilast ei leitud (otsing vaatab aktiivseid ja arhiveeritud kaarte, prügikasti mitte).</p> : null}
        {ask ? <ArchivedLinkAsk name={ask.name} onRestore={() => pick(ask, { confirmed: true, restore: true })} onKeep={() => pick(ask, { confirmed: true })} onCancel={() => setAsk(null)} /> : null}
      </div>
      <p className="form-hint form-grid__wide">Lapsevanem saab kirja (eesti ja vene keeles) lingiga, kus ta määrab parooli. Lapse oma konto jääb alles.</p>
      {error ? <p className="action-error form-grid__wide" role="alert">{error}</p> : null}
    </form>}
  </Modal>;
}
