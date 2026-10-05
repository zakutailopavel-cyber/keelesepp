import { useState } from 'react';
import { Clock3, GraduationCap, UserRoundX } from 'lucide-react';
import { Button, Card } from '../../components/ui/index.js';
import { useAuth } from '../../app/AuthContext.jsx';

// Shown instead of the app while a self-registered account waits for an administrator (or was turned down).
export default function PendingApprovalPage() {
  const { user, refresh, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [info, setInfo] = useState('');
  const rejected = user?.approvalStatus === 'rejected';

  const check = async () => {
    setChecking(true); setInfo('');
    try {
      const next = await refresh();
      if (['pending', 'rejected'].includes(next?.approvalStatus)) setInfo(next.approvalStatus === 'rejected' ? 'Konto on endiselt keeldutud.' : 'Konto ootab veel kinnitamist.');
    } catch (caught) {
      setInfo(caught.message);
    } finally { setChecking(false); }
  };

  return (
    <main className="login-page">
      <Card className="pending-card">
        <div className="login-brand pending-card__brand"><span><GraduationCap size={25} /></span><strong>KeeleSepp</strong></div>
        <div className={`pending-card__icon ${rejected ? 'is-rejected' : ''}`}>{rejected ? <UserRoundX size={30} /> : <Clock3 size={30} />}</div>
        {rejected ? (
          <>
            <h1>Konto ei ole kinnitatud</h1>
            <p>Administraator ei kinnitanud seda kontot. Kui arvad, et see on viga, kirjuta <a href="mailto:info@epkoolitus.ee">info@epkoolitus.ee</a> või helista +372 5434 4155.</p>
            <p lang="ru" className="pending-card__ru">Аккаунт не подтверждён администратором. Если это ошибка, напишите на info@epkoolitus.ee или позвоните +372 5434 4155.</p>
          </>
        ) : (
          <>
            <h1>Konto ootab kinnitamist</h1>
            <p>Aitäh, {user?.displayName || 'registreerumast'}! Administraator vaatab konto üle ja seob selle õpilase kaardiga. Saadame e-kirja aadressile <strong>{user?.email}</strong>, kui konto on kinnitatud — tavaliselt ühe tööpäeva jooksul.</p>
            <p lang="ru" className="pending-card__ru">Спасибо за регистрацию! Администратор проверит аккаунт и свяжет его с карточкой ученика. Мы пришлём письмо, когда аккаунт будет подтверждён — обычно в течение рабочего дня.</p>
          </>
        )}
        {info ? <p className="form-info" role="status">{info}</p> : null}
        <div className="pending-card__actions">
          {!rejected ? <Button loading={checking} onClick={check}>Kontrolli uuesti</Button> : null}
          <Button variant="secondary" onClick={signOut}>Logi välja</Button>
        </div>
      </Card>
    </main>
  );
}
