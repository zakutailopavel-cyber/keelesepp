import { useState } from 'react';
import { Check, UserRoundCheck, UserRoundX, X } from 'lucide-react';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { accountApprovalsService } from '../../services/firebase/index.js';
import './accounts.css';

const ROLE = { parent: 'Lapsevanem', student: 'Õpilane' };
const TABS = [['pending', 'Ootel'], ['rejected', 'Keeldutud']];

function linkedText(result) {
  const linked = (result.linkedStudentIds?.length || 0) + (result.createdStudentIds?.length || 0);
  const parts = ['Konto kinnitatud.'];
  parts.push(linked ? `Seotud õpilase kaarte: ${linked}.` : 'Õpilase kaarti automaatselt ei leitud — seo see vajadusel õpilase kaardil.');
  if (result.mailed) parts.push('Inimesele saadeti e-kiri.');
  return parts.join(' ');
}

// Administrator: self-registered parents and students wait here until approved.
export default function AccountsPage({ service = accountApprovalsService }) {
  const [tab, setTab] = useState('pending');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const state = useAsyncData(() => service.list(tab), [service, tab]);

  const decide = async (account, decision) => {
    let reason = '';
    if (decision === 'reject') {
      reason = globalThis.prompt?.(`Keeldu kontost „${account.displayName}”? Põhjus (valikuline):`, '');
      if (reason === null || reason === undefined) return;
    }
    setBusy(account.id); setError(''); setNotice('');
    try {
      const result = await service.decide({ uid: account.id, decision, reason });
      setNotice(decision === 'approve' ? linkedText(result) : `Konto „${account.displayName}” on keeldutud.`);
      state.reload();
    } catch (caught) {
      setError(caught.message);
    } finally { setBusy(''); }
  };

  return (
    <div className="page-content">
      <PageHeader eyebrow="Ligipääs" title="Uued kontod" description="Lapsevanemad ja õpilased, kes registreerusid ise, saavad ligipääsu alles pärast sinu kinnitust." />
      <div className="accounts-tabs" role="tablist" aria-label="Kontode olek">
        {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => { setTab(id); setNotice(''); setError(''); }}>{label}</button>)}
      </div>
      {notice ? <p className="accounts-notice" role="status">{notice}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {state.loading ? <LoadingState label="Laen kontosid…" /> : state.error ? <ErrorState message={state.error.message} onRetry={state.reload} /> : !state.data.length ? (
        <Card><EmptyState title={tab === 'pending' ? 'Kinnitamist ootavaid kontosid pole' : 'Keeldutud kontosid pole'} description={tab === 'pending' ? 'Uue registreerumise korral saad ka e-kirja.' : ''} /></Card>
      ) : (
        <div className="accounts-list">
          {state.data.map((account) => (
            <Card key={account.id} className="account-row">
              <div className="account-row__main">
                <div className="account-row__head"><strong>{account.displayName}</strong><Badge>{ROLE[account.role] || account.role || 'roll puudub'}</Badge></div>
                <span>{account.email}</span>
                <dl>
                  {account.role === 'parent' ? <><dt>Laps</dt><dd>{account.childName || '—'}</dd></> : null}
                  {account.preferredTeacher ? <><dt>Õpetaja</dt><dd>{account.preferredTeacher}</dd></> : null}
                  <dt>Registreerus</dt><dd>{account.createdAt || '—'}</dd>
                  {account.approvalReason ? <><dt>Põhjus</dt><dd>{account.approvalReason}</dd></> : null}
                </dl>
              </div>
              <div className="account-row__actions">
                <Button loading={busy === account.id} disabled={Boolean(busy)} onClick={() => decide(account, 'approve')}>{tab === 'rejected' ? <UserRoundCheck size={16} /> : <Check size={16} />} {tab === 'rejected' ? 'Kinnita siiski' : 'Kinnita'}</Button>
                {tab === 'pending' ? <Button variant="secondary" disabled={Boolean(busy)} onClick={() => decide(account, 'reject')}><X size={16} /> Keeldu</Button> : <UserRoundX size={18} aria-hidden="true" className="account-row__rejected" />}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
