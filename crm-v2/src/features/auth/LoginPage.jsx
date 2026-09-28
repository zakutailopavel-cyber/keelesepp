import { useState } from 'react';
import { BookOpenCheck, GraduationCap, ShieldCheck } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, ErrorState, Input } from '../../components/ui/index.js';
import { useAuth } from '../../app/AuthContext.jsx';

export default function LoginPage() {
  const { configured, user, signIn, signInWithGoogle } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!configured) return <main className="standalone-state"><ErrorState title="Firebase ei ole seadistatud" message="Lisa .env faili KeeleSepp Firebase veebikonfiguratsioon." /></main>;
  if (user) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true); setError('');
    try {
      await signIn(form.email, form.password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (caught) {
      const messages = {
        'auth/invalid-credential': 'Vale e-post või parool.',
        'auth/user-disabled': 'Konto on administraatori poolt välja lülitatud.',
        'auth/account-access-denied': 'Konto profiilile puudub ligipääs. Võta ühendust administraatoriga.',
      };
      setError(messages[caught.code] || caught.message);
    } finally { setSubmitting(false); }
  };

  const googleSignIn = async () => {
    setSubmitting(true); setError('');
    try {
      await signInWithGoogle();
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (caught) {
      const messages = {
        'auth/popup-closed-by-user': 'Google’i sisselogimisaken suleti.',
        'auth/popup-blocked': 'Brauser blokeeris Google’i sisselogimisakna.',
        'auth/unauthorized-domain': 'See CRM v2 aadress ei ole Firebase Authenticationis lubatud.',
        'auth/account-access-denied': 'Konto profiilile puudub ligipääs. Võta ühendust administraatoriga.',
      };
      setError(messages[caught.code] || caught.message);
    } finally { setSubmitting(false); }
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-intro" aria-label="KeeleSepp koolihaldus">
          <div className="login-brand"><span><GraduationCap size={25} /></span><strong>KeeleSepp</strong></div>
          <div className="login-intro__copy">
            <span className="eyebrow">Uus kooli tööruum</span>
            <h1>Õpetamine ja koolihaldus selges rütmis.</h1>
            <p>Üks rahulik töölaud õpilaste, tundide, õppematerjalide ja kooli igapäevaste otsuste jaoks.</p>
          </div>
          <div className="login-benefits">
            <span><BookOpenCheck size={18} /> Õppetöö ja haldus ühes vaates</span>
            <span><ShieldCheck size={18} /> Turvaline rollipõhine ligipääs</span>
          </div>
          <small>EP Koolitus · Tallinn</small>
        </div>
        <Card className="login-card">
          <span className="eyebrow">KeeleSepp CRM v2</span><h2>Hea meel sind näha</h2><p>Logi sisse oma olemasoleva KeeleSepp kontoga.</p>
          <form onSubmit={submit}>
            <Input label="E-post" name="email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <Input label="Parool" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <Button type="submit" loading={submitting}>Logi sisse</Button>
            <div className="login-divider"><span>või</span></div>
            <Button type="button" variant="secondary" disabled={submitting} onClick={googleSignIn}>Jätka Google’iga</Button>
          </form>
        </Card>
      </section>
    </main>
  );
}
