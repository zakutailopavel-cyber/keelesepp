import { Link, useNavigate } from 'react-router-dom';
import { Button, EmptyState } from '../../components/ui/index.js';
import { useAuth } from '../../app/AuthContext.jsx';

// A signed-in account without the right role lands here. It must be able to sign out and switch accounts
// (2026-11-18: the accountant signed in with a second, role-less e-mail and could not get back to the login form).
export default function ForbiddenPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const email = user?.email || '';
  const switchAccount = async () => { await signOut(); navigate('/login', { replace: true }); };
  return (
    <main className="standalone-state">
      <EmptyState
        title="Ligipääs puudub"
        description={`Sinu rollil ei ole õigust seda CRM-i osa avada.${email ? ` Oled sisse logitud kui ${email}. Kui sul on teine konto, logi välja ja sisene sellega.` : ''}`}
        action={(
          <>
            <Link className="button button--secondary" to="/">Tagasi avalehele</Link>
            {user ? <Button onClick={switchAccount}>Logi välja ja vaheta kontot</Button> : null}
          </>
        )}
      />
    </main>
  );
}
