import { useState } from 'react';
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
      <Card className="login-card">
        <span className="eyebrow">KeeleSepp CRM v2</span><h1>Logi sisse</h1><p>Kasuta olemasolevat KeeleSepp Firebase kontot.</p>
        <form onSubmit={submit}>
          <Input label="E-post" name="email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <Input label="Parool" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <Button type="submit" loading={submitting}>Logi sisse</Button>
          <Button type="button" variant="secondary" disabled={submitting} onClick={googleSignIn}>Jätka Google’iga</Button>
        </form>
      </Card>
    </main>
  );
}
