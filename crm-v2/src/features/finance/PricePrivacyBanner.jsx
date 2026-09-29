import { ShieldAlert } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../app/AuthContext.jsx';
import { Button } from '../../components/ui/index.js';
import { financeApi } from '../../services/firebase/financeApi.js';
import { ROLES } from '../../utils/roles.js';

// One-time task for the admin (Finance v2 §1): old lesson prices are still on student cards, which teachers and
// parents can read. The server moves them into the admin/finance-only plans. Hidden when nothing is left to move.
export default function PricePrivacyBanner({ api = financeApi }) {
  const user = useContext(AuthContext)?.user;
  const isAdmin = Boolean(user?.roles?.includes(ROLES.ADMIN));
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  useEffect(() => {
    if (!isAdmin) return undefined;
    let alive = true;
    api.previewPricePrivacy().then((result) => { if (alive) setPreview(result); }).catch(() => {});
    return () => { alive = false; };
  }, [api, isAdmin]);

  const apply = async () => {
    setBusy(true); setError('');
    try {
      const result = await api.applyPricePrivacy();
      setDone(`Valmis: ${result.summary.students} õpilase kaart puhastatud, ${result.summary.plansToCreate} hinda viidi arveldusseadetesse.`);
      setPreview(null);
    } catch (caught) { setError(caught.message || 'Ülekanne ebaõnnestus.'); }
    finally { setBusy(false); }
  };

  if (done) return <div className="finance-workspace-notice" role="status"><span>{done}</span><button type="button" aria-label="Sulge teade" onClick={() => setDone('')}>×</button></div>;
  if (!preview?.summary?.students) return null;
  const { students, plansToCreate, conflicts } = preview.summary;
  return (
    <div className="price-privacy-banner" role="region" aria-label="Tunnihindade privaatsus">
      <ShieldAlert size={22} />
      <div>
        <strong>{students} õpilase kaardil on tunnihind, mida õpetaja ja lapsevanem saavad tehniliselt lugeda.</strong>
        <p>Vii hinnad privaatsetesse arveldusseadetesse (näevad ainult administraator ja raamatupidaja). {plansToCreate} hinda kantakse üle; {conflicts ? `${conflicts} õpilasel on arveldusseadetes juba teine hind — see jääb kehtima.` : 'vastuolusid ei ole.'}</p>
        {error ? <p className="action-error" role="alert">{error}</p> : null}
      </div>
      <Button loading={busy} onClick={apply}>Vii hinnad üle</Button>
    </div>
  );
}
