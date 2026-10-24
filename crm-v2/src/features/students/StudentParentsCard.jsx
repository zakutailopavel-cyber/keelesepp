import { Link2, Search, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Input } from '../../components/ui/index.js';
import { parentContactsOf, parentIdsOf, parentsService } from '../../services/firebase/parents.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import './directions.css';

const norm = (value) => String(value || '').trim().toLocaleLowerCase('et');

// „Lapsevanemad” on the student card (owner 2026-10-24): the administrator links an existing parent account, adds a
// parent without an account (name / e-mail / phone) or removes a wrong link. A child may have several parents, a
// parent several children; every linked account sees the child (firestore.rules ownsStudentProfile).
export default function StudentParentsCard({ student, user, service = parentsService, onChanged }) {
  const [parents, setParents] = useState(null);
  const [mode, setMode] = useState('');
  const [query, setQuery] = useState('');
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [busy, setBusy] = useState('');
  const [ask, setAsk] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.resolve(service.list()).then((items) => { if (alive) setParents(items || []); }).catch(() => { if (alive) setParents([]); });
    return () => { alive = false; };
  }, [service]);

  const linkedIds = parentIdsOf(student);
  const byId = new Map((parents || []).map((parent) => [parent.id, parent]));
  const linked = linkedIds.map((id) => byId.get(id) || { id, displayName: '', email: '' });
  const linkedMails = new Set(linked.map((parent) => norm(parent.email)).filter(Boolean));
  const contacts = parentContactsOf(student).filter((item) => !item.email || !linkedMails.has(item.email));
  const results = useMemo(() => {
    const needle = norm(query);
    if (!needle) return [];
    return (parents || []).filter((parent) => !linkedIds.includes(parent.id)
      && [parent.displayName, parent.email, parent.phone, parent.childName].some((value) => norm(value).includes(needle))).slice(0, 8);
  }, [parents, query, linkedIds]);

  const run = async (key, action) => {
    setBusy(key); setError('');
    try { await action(); await onChanged?.(); return true; } catch (err) { setError(firebaseErrorMessage(err)); return false; } finally { setBusy(''); }
  };
  const link = (parent) => run(`link:${parent.id}`, () => service.linkStudent(parent, student, user)).then((ok) => { if (ok) { setMode(''); setQuery(''); } });
  const unlink = (id) => run(`unlink:${id}`, () => service.unlinkStudent(id, student, user)).then(() => setAsk(''));
  const addContact = () => run('contact', () => service.addContact(student, contact, user)).then((ok) => { if (ok) { setMode(''); setContact({ name: '', email: '', phone: '' }); } });
  const removeContact = (item) => run(`contact:${item.email || item.phone || item.name}`, () => service.removeContact(student, item, user)).then(() => setAsk(''));

  return (
    <Card className="student-parents">
      <div className="student-directions__head"><h2>Lapsevanemad</h2><Badge tone={linked.length ? 'success' : contacts.length ? 'warning' : 'danger'}>{linked.length ? `${linked.length} kontoga` : contacts.length ? 'kontota' : 'sidumata'}</Badge></div>
      <ul className="student-parents__list">
        {linked.map((parent) => {
          const key = `unlink:${parent.id}`;
          return <li key={parent.id}>
            <div><strong>{parent.displayName || parent.email || (parents ? 'Konto (nimi puudub)' : 'Laen…')}</strong><small>{[parent.email, parent.phone].filter(Boolean).join(' · ') || 'konto'}</small></div>
            <div className="student-parents__actions">
              <Link className="button button--secondary" to={`/parents?parent=${encodeURIComponent(parent.id)}`}>Ava kaart</Link>
              {ask === key ? <Button variant="danger" loading={busy === key} onClick={() => unlink(parent.id)}>Kinnita eemaldamine</Button> : <Button variant="secondary" disabled={Boolean(busy)} onClick={() => setAsk(key)}>Eemalda seos</Button>}
            </div>
          </li>;
        })}
        {contacts.map((item) => {
          const key = `contact:${item.email || item.phone || item.name}`;
          return <li key={key}>
            <div><strong>{item.name || item.email || item.phone}</strong><small>{[item.email, item.phone].filter(Boolean).join(' · ') || '—'} · <Badge tone="neutral">kontot pole</Badge></small></div>
            <div className="student-parents__actions">
              {ask === key ? <Button variant="danger" loading={busy === key} onClick={() => removeContact(item)}>Kinnita eemaldamine</Button> : <Button variant="secondary" disabled={Boolean(busy)} onClick={() => setAsk(key)}>Eemalda</Button>}
            </div>
          </li>;
        })}
      </ul>
      {!linked.length && !contacts.length ? <p className="form-hint">Lapsevanemat pole seotud.</p> : null}
      <div className="student-parents__buttons">
        <Button variant={mode === 'link' ? 'primary' : 'secondary'} onClick={() => setMode(mode === 'link' ? '' : 'link')}><Link2 size={16} /> Seo lapsevanem</Button>
        <Button variant={mode === 'contact' ? 'primary' : 'secondary'} onClick={() => setMode(mode === 'contact' ? '' : 'contact')}><UserPlus size={16} /> Lisa kontakt ilma kontota</Button>
      </div>
      {mode === 'link' ? <div className="student-parents__panel">
        <div className="search-field"><Search size={16} /><input aria-label="Otsi lapsevanemat" placeholder="Nimi, e-post või telefon" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        {query && !results.length ? <p className="form-hint">{parents ? 'Sellist lapsevanema kontot ei leitud. Lisa kontakt ilma kontota või kutsu lapsevanem (konto kaart).' : 'Laen lapsevanemaid…'}</p> : null}
        <ul className="student-parents__list">{results.map((parent) => <li key={parent.id}><div><strong>{parent.displayName || parent.email}</strong><small>{[parent.email, parent.phone, parent.childName ? `lapsed: ${parent.childName}` : ''].filter(Boolean).join(' · ')}</small></div><Button variant="secondary" loading={busy === `link:${parent.id}`} disabled={Boolean(busy)} onClick={() => link(parent)}>Seo</Button></li>)}</ul>
      </div> : null}
      {mode === 'contact' ? <div className="student-parents__panel form-grid">
        <Input label="Lapsevanema nimi" value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} />
        <Input label="E-post" type="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} />
        <Input label="Telefon" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} />
        <p className="form-hint form-grid__wide">Kui lapsevanem registreerub hiljem sama e-postiga, seotakse laps tema kontoga.</p>
        <div className="form-grid__wide"><Button loading={busy === 'contact'} disabled={Boolean(busy)} onClick={addContact}>Salvesta kontakt</Button></div>
      </div> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </Card>
  );
}
