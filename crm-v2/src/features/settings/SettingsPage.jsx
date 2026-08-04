import { CheckCircle2, Database, KeyRound, Save, ShieldCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, Input, PageHeader } from '../../components/ui/index.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';

function initialProfile(user) {
  return {
    displayName: user.displayName || '',
    phone: user.profile?.phone || user.profile?.parentPhone || '',
  };
}

export default function SettingsPage() {
  const { user, configured, updateProfile, sendPasswordReset } = useAuth();
  const [form, setForm] = useState(() => initialProfile(user));
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [success, setSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSuccess('');
    setActionError('');
    try {
      const updated = await updateProfile(form);
      setForm(initialProfile(updated));
      setSuccess('Konto andmed salvestati.');
    } catch (error) {
      setActionError(firebaseErrorMessage(error, 'Konto andmete salvestamine ebaõnnestus.'));
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async () => {
    setResetting(true);
    setSuccess('');
    setActionError('');
    try {
      const email = await sendPasswordReset();
      setSuccess(`Parooli taastamise link saadeti aadressile ${email}.`);
    } catch (error) {
      setActionError(firebaseErrorMessage(error, 'Parooli taastamise lingi saatmine ebaõnnestus.'));
    } finally {
      setResetting(false);
    }
  };

  return <div className="page-content">
    <PageHeader eyebrow="Konto" title="Seaded" description="Sinu kontaktandmed, ligipääs ja konto turvalisus." />
    {success ? <div className="success-notice" role="status">{success}<button aria-label="Sulge teade" onClick={() => setSuccess('')}>×</button></div> : null}
    {actionError ? <div className="action-error" role="alert">{actionError}<button aria-label="Sulge veateade" onClick={() => setActionError('')}>×</button></div> : null}
    <section className="settings-grid">
      <Card className="settings-profile-card"><div className="settings-icon"><UserRound /></div><h2>Minu andmed</h2><form className="settings-profile-form" onSubmit={save}><Input id="settings-name" label="Nimi" autoComplete="name" required maxLength="160" value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /><Input id="settings-phone" label="Telefon" type="tel" autoComplete="tel" maxLength="40" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /><Input id="settings-email" label="E-post" type="email" value={user.email} disabled /><p className="form-hint">E-posti või rolli muutmiseks pöördu administraatori poole.</p><Button type="submit" loading={saving}><Save size={17} /> Salvesta andmed</Button></form></Card>

      <Card><div className="settings-icon"><ShieldCheck /></div><h2>Ligipääs</h2><div className="detail-list"><div><dt>Kasutaja</dt><dd>{user.displayName}</dd></div><div><dt>E-post</dt><dd>{user.email}</dd></div><div><dt>Rollid</dt><dd>{user.roles.join(', ')}</dd></div><div><dt>Konto UID</dt><dd className="mono">{user.uid}</dd></div></div></Card>

      <Card><div className="settings-icon"><KeyRound /></div><h2>Turvalisus</h2><p className="settings-copy">Parooli ei kuvata ega muudeta CRM-is otse. Firebase saadab turvalise taastamislingi ainult sinu praeguse konto e-posti aadressile.</p><Button variant="secondary" loading={resetting} onClick={resetPassword}>Saada parooli taastamise link</Button></Card>

      <Card><div className="settings-icon"><Database /></div><h2>Firebase</h2><div className="integration-row"><div><strong>Andmebaasi ühendus</strong><span>Autentimine ja Firestore</span></div><Badge tone={configured ? 'success' : 'danger'}>{configured ? 'Ühendatud' : 'Seadistamata'}</Badge></div><div className="integration-row"><div><strong>Ligipääsureeglid</strong><span>Rollipõhine kaitse</span></div><CheckCircle2 size={20} color="#067647" /></div></Card>
    </section>
  </div>;
}
