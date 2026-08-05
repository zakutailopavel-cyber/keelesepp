import { CheckCircle2, Database, KeyRound, Save, ShieldAlert, ShieldCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, Input, PageHeader } from '../../components/ui/index.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import { hasAnyRole, ROLES } from '../../utils/roles.js';
import { teacherScopeMigrationApi } from '../../services/firebase/teacherScopeMigrationApi.js';

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
  const [migrationPreview, setMigrationPreview] = useState(null);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationError, setMigrationError] = useState('');
  const [migrationApplyResult, setMigrationApplyResult] = useState(null);
  const [migrationApplyLoading, setMigrationApplyLoading] = useState(false);
  const [migrationApplyArmed, setMigrationApplyArmed] = useState(false);
  const [migrationEnforceResult, setMigrationEnforceResult] = useState(null);
  const [migrationEnforceLoading, setMigrationEnforceLoading] = useState(false);
  const [migrationEnforceArmed, setMigrationEnforceArmed] = useState(false);
  const isAdmin = hasAnyRole(user.roles, [ROLES.ADMIN]);

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

  const previewTeacherScopeMigration = async () => {
    setMigrationLoading(true);
    setMigrationError('');
    try {
      const result = await teacherScopeMigrationApi.preview();
      setMigrationPreview(result);
    } catch (error) {
      setMigrationError(firebaseErrorMessage(error, 'Preview käivitamine ebaõnnestus.'));
    } finally {
      setMigrationLoading(false);
    }
  };

  const applyTeacherScopeMigration = async () => {
    if (!migrationApplyArmed) {
      setMigrationApplyArmed(true);
      return;
    }
    setMigrationApplyArmed(false);
    setMigrationApplyLoading(true);
    setMigrationError('');
    try {
      const result = await teacherScopeMigrationApi.apply();
      setMigrationApplyResult(result);
    } catch (error) {
      setMigrationError(firebaseErrorMessage(error, 'Apply käivitamine ebaõnnestus.'));
    } finally {
      setMigrationApplyLoading(false);
    }
  };

  const enforceTeacherScopeMigration = async () => {
    if (!migrationEnforceArmed) {
      setMigrationEnforceArmed(true);
      return;
    }
    setMigrationEnforceArmed(false);
    setMigrationEnforceLoading(true);
    setMigrationError('');
    try {
      const result = await teacherScopeMigrationApi.enforce();
      setMigrationEnforceResult(result);
    } catch (error) {
      setMigrationError(firebaseErrorMessage(error, 'Enforce käivitamine ebaõnnestus.'));
    } finally {
      setMigrationEnforceLoading(false);
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

      {isAdmin ? <Card><div className="settings-icon"><ShieldAlert /></div><h2>Teacher-scope migratsioon (diagnostika)</h2><p className="settings-copy">Ajutine admin-tööriist: kontrollib, kas õpetajate andmed on valmis range teacherUid-põhise ligipääsu jaoks, käivitab backfilli ja lülitab range kontrolli sisse. Iga toiming nõuab kaht klõpsu (kinnitus ilma brauseri hüpikaknata). Rollback on olemas serveris.</p><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}><Button variant="secondary" loading={migrationLoading} onClick={previewTeacherScopeMigration}>Preview</Button><Button variant={migrationApplyArmed ? 'primary' : 'secondary'} loading={migrationApplyLoading} onClick={applyTeacherScopeMigration}>{migrationApplyArmed ? 'Kinnita: rakenda backfill' : 'Rakenda (apply)'}</Button><Button variant={migrationEnforceArmed ? 'primary' : 'secondary'} loading={migrationEnforceLoading} onClick={enforceTeacherScopeMigration}>{migrationEnforceArmed ? 'Kinnita: luba range piirang' : 'Luba range piirang (enforce)'}</Button></div>{migrationError ? <p className="form-hint" role="alert">{migrationError}</p> : null}{migrationPreview ? <pre className="mono" style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '12px' }}>{JSON.stringify(migrationPreview, null, 2)}</pre> : null}{migrationApplyResult ? <pre className="mono" style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '12px' }}>{JSON.stringify(migrationApplyResult, null, 2)}</pre> : null}{migrationEnforceResult ? <pre className="mono" style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '12px' }}>{JSON.stringify(migrationEnforceResult, null, 2)}</pre> : null}</Card> : null}
    </section>
  </div>;

}
