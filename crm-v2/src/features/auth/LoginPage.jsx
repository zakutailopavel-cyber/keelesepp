import { useState } from 'react';
import { BookOpenCheck, GraduationCap, ShieldCheck } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, ErrorState, Input, Select } from '../../components/ui/index.js';
import { useAuth } from '../../app/AuthContext.jsx';
import { REGISTRATION_TEACHERS, validatePassword } from '../../services/firebase/auth.js';
import { modeFromLocation } from './loginMode.js';

const TERMS_URL = 'https://www.epkoolitus.ee/tingimused';
const PRIVACY_URL = 'https://www.epkoolitus.ee/privaatsus';

const AUTH_MESSAGES = {
  'auth/invalid-credential': 'Vale e-post või parool.',
  'auth/user-disabled': 'Konto on administraatori poolt välja lülitatud.',
  'auth/account-access-denied': 'Konto profiilile puudub ligipääs. Võta ühendust administraatoriga.',
  'auth/popup-closed-by-user': 'Google’i sisselogimisaken suleti.',
  'auth/popup-blocked': 'Brauser blokeeris Google’i sisselogimisakna.',
  'auth/unauthorized-domain': 'See aadress ei ole Firebase Authenticationis lubatud.',
  'auth/email-already-in-use': 'See e-post on juba registreeritud. Logi sisse või taasta parool.',
  'auth/invalid-email': 'Vigane e-posti aadress.',
  'auth/weak-password': 'Parool peab olema vähemalt 6 tähemärki.',
  'auth/user-not-found': 'Selle e-postiga kontot ei leitud.',
  'auth/too-many-requests': 'Liiga palju katseid. Proovi mõne minuti pärast uuesti.',
};
const message = (caught) => AUTH_MESSAGES[caught?.code] || caught?.message || 'Midagi läks valesti.';

const EMPTY = { email: '', password: '', passwordRepeat: '', displayName: '', role: 'parent', childName: '', preferredTeacher: 'Pavel', acceptedTerms: false };

export default function LoginPage({ initialMode }) {
  const { configured, user, signIn, signInWithGoogle, register, resetPasswordFor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(() => modeFromLocation(location, initialMode));
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!configured) return <main className="standalone-state"><ErrorState title="Firebase ei ole seadistatud" message="Lisa .env faili KeeleSepp Firebase veebikonfiguratsioon." /></main>;
  if (user) return <Navigate to="/" replace />;

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });
  const switchMode = (next) => { setMode(next); setError(''); setInfo(''); setForm((current) => ({ ...EMPTY, email: current.email })); };
  const done = () => navigate(location.state?.from?.pathname || '/', { replace: true });

  const run = async (action) => {
    setSubmitting(true); setError(''); setInfo('');
    try { await action(); } catch (caught) {
      if (caught?.code === 'auth/profile-missing') { setMode('register'); setInfo(caught.message); }
      else setError(message(caught));
    } finally { setSubmitting(false); }
  };

  const registration = () => ({ role: form.role, acceptedTerms: form.acceptedTerms, childName: form.childName, preferredTeacher: form.preferredTeacher });

  const submit = (event) => {
    event.preventDefault();
    if (mode === 'login') return run(async () => { await signIn(form.email, form.password); done(); });
    if (mode === 'forgot') return run(async () => { const email = await resetPasswordFor(form.email); setInfo(`Taastamislink on saadetud aadressile ${email}.`); });
    const passwordError = validatePassword(form.password, form.passwordRepeat);
    if (passwordError) { setError(passwordError); return undefined; }
    if (!form.acceptedTerms) { setError('Konto loomiseks nõustu kasutustingimustega.'); return undefined; }
    return run(async () => { await register({ ...registration(), displayName: form.displayName, email: form.email, password: form.password, passwordRepeat: form.passwordRepeat }); done(); });
  };

  const google = () => {
    if (mode === 'register' && !form.acceptedTerms) { setError('Konto loomiseks nõustu kasutustingimustega.'); return; }
    run(async () => { await signInWithGoogle(mode === 'register' ? registration() : null); done(); });
  };

  const titles = {
    login: ['Hea meel sind näha', 'Logi sisse oma KeeleSepp kontoga.'],
    register: ['Loo konto', 'Lapsevanem või õpilane. Õpetaja konto loob administraator.'],
    forgot: ['Parooli taastamine', 'Saadame sulle e-postiga lingi uue parooli määramiseks.'],
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-intro" aria-label="KeeleSepp koolihaldus">
          <div className="login-brand"><span><GraduationCap size={25} /></span><strong>KeeleSepp</strong></div>
          <div className="login-intro__copy">
            <span className="eyebrow">Kooli tööruum</span>
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
          <span className="eyebrow">KeeleSepp</span><h2>{titles[mode][0]}</h2><p>{titles[mode][1]}</p>
          <form onSubmit={submit} noValidate>
            {mode === 'register' ? (
              <div className="login-roles" role="radiogroup" aria-label="Roll">
                {[['parent', 'Lapsevanem'], ['student', 'Õpilane']].map(([id, label]) => (
                  <button type="button" key={id} role="radio" aria-checked={form.role === id} className={form.role === id ? 'is-active' : ''} onClick={() => setForm({ ...form, role: id })}>{label}</button>
                ))}
              </div>
            ) : null}
            {mode === 'register' ? <Input label="Täisnimi" name="displayName" autoComplete="name" required maxLength={160} value={form.displayName} onChange={set('displayName')} /> : null}
            <Input label="E-post" name="email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
            {mode !== 'forgot' ? <Input label="Parool" name="password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required value={form.password} onChange={set('password')} /> : null}
            {mode === 'register' ? (
              <>
                <Input label="Korda parooli" name="passwordRepeat" type="password" autoComplete="new-password" required value={form.passwordRepeat} onChange={set('passwordRepeat')} />
                {form.role === 'parent' ? (
                  <>
                    <Input label="Lapse nimi (mitu last komaga)" name="childName" maxLength={300} value={form.childName} onChange={set('childName')} />
                    <Select label="Õpetaja" name="preferredTeacher" value={form.preferredTeacher} onChange={set('preferredTeacher')}>
                      {REGISTRATION_TEACHERS.map((name) => <option key={name} value={name}>{name}</option>)}
                    </Select>
                  </>
                ) : null}
                <label className="login-terms">
                  <input type="checkbox" name="acceptedTerms" checked={form.acceptedTerms} onChange={set('acceptedTerms')} />
                  <span>Nõustun <a href={TERMS_URL} target="_blank" rel="noreferrer">kasutustingimustega</a> ja <a href={PRIVACY_URL} target="_blank" rel="noreferrer">privaatsuspoliitikaga</a>.</span>
                </label>
              </>
            ) : null}
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            {info ? <p className="form-info" role="status">{info}</p> : null}
            <Button type="submit" loading={submitting}>{mode === 'login' ? 'Logi sisse' : mode === 'register' ? 'Loo konto' : 'Saada taastamislink'}</Button>
            {mode !== 'forgot' ? (
              <>
                <div className="login-divider"><span>või</span></div>
                <Button type="button" variant="secondary" disabled={submitting} onClick={google}>{mode === 'register' ? 'Loo konto Google’iga' : 'Jätka Google’iga'}</Button>
              </>
            ) : null}
            <div className="login-links">
              {mode === 'login' ? <>
                <button type="button" onClick={() => switchMode('forgot')}>Unustasid parooli?</button>
                <button type="button" onClick={() => switchMode('register')}>Loo uus konto</button>
              </> : <button type="button" onClick={() => switchMode('login')}>Mul on konto — logi sisse</button>}
            </div>
            <small className="login-legal"><a href="https://www.epkoolitus.ee" target="_blank" rel="noreferrer">www.epkoolitus.ee</a></small>
          </form>
        </Card>
      </section>
    </main>
  );
}
