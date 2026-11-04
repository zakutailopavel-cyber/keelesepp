import { useState } from 'react';
import { Check, Copy, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { accountApprovalsService } from '../../services/firebase/accountApprovals.js';

// The parent's „Konto” block on the Lapsevanemad page (owner + administrator Oleksiy, 2026-11-04), admin only: the
// login, how the parent signs in, whether the e-mail is verified, the approval, when the parent was last in, the
// linked children, other accounts with the same name, „Saada parooli link” (the same route as the student card) and
// „Kinnita” for a pending account. Sign-in facts come from Firebase Auth via /accounts/auth-info (read-only).

export const APPROVAL_LABEL = { approved: 'kinnitatud', pending: 'ootab kinnitust', rejected: 'pole kinnitatud' };
const METHOD_LABEL = { password: 'parool', google: 'Google' };

const millis = (value) => (typeof value?.toMillis === 'function' ? value.toMillis() : typeof value?.seconds === 'number' ? value.seconds * 1000 : Date.parse(value || '') || 0);

export function formatWhen(value) {
  const time = millis(value);
  if (!time) return 'pole teada';
  return new Date(time).toLocaleString('et-EE', { timeZone: 'Europe/Tallinn', day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function methodsText(info) {
  if (!info?.found) return 'pole teada';
  return info.methods?.length ? info.methods.map((method) => METHOD_LABEL[method] || method).join(' ja ') : 'parooli pole veel määratud';
}

export default function ParentAccountCard({ parent, kids = [], sameName = [], service = accountApprovalsService, onApproved }) {
  const others = sameName.filter((item) => item.id !== parent.id);
  const uids = [parent.id, ...others.map((item) => item.id)].slice(0, 10);
  const info = useAsyncData(() => service.authInfo(uids), [service, uids.join('|')]);
  const byUid = new Map((info.data || []).map((item) => [item.uid, item]));
  const own = byUid.get(parent.id);
  const loginEmail = own?.found ? own.email : parent.email;
  const approval = parent.approvalStatus || 'approved';
  const [sending, setSending] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [approvedText, setApprovedText] = useState('');

  const send = async () => {
    setSending(true); setError(''); setResult(null); setCopied(false);
    try { setResult(await service.sendParentPasswordLink({ parentUid: parent.id })); } catch (caught) { setError(caught.message || 'Parooli linki ei saanud saata.'); }
    finally { setSending(false); }
  };
  const copy = async () => {
    try { await globalThis.navigator.clipboard.writeText(result.link); setCopied(true); } catch { setCopied(false); }
  };
  const approve = async () => {
    setApproving(true); setError('');
    try {
      const data = await service.decide({ uid: parent.id, decision: 'approve' });
      const text = data?.responseLost ? data.message : `Konto kinnitatud.${data?.mailed ? ' Lapsevanemale saadeti e-kiri.' : ''}`;
      setApprovedText(text);
      onApproved?.(text, data);
    } catch (caught) { setError(caught.message || 'Kontot ei saanud kinnitada.'); }
    finally { setApproving(false); }
  };

  return <section className="parent-account" aria-label="Konto">
    <div className="parent-section-head"><strong>Konto</strong><Badge tone={approval === 'approved' ? 'success' : approval === 'pending' ? 'warning' : 'danger'}>{APPROVAL_LABEL[approval] || approval}</Badge></div>
    {info.error ? <p className="action-error" role="alert">Sisselogimise andmeid ei saanud laadida: {info.error.message}</p> : null}
    <dl className="parent-account__facts">
      <div><dt>Sisselogimise e-post</dt><dd>{loginEmail || 'puudub'}</dd></div>
      <div><dt>Sisselogimine</dt><dd>{info.loading ? '…' : methodsText(own)}</dd></div>
      <div><dt>E-post kinnitatud</dt><dd>{info.loading ? '…' : own?.found ? (own.emailVerified ? 'jah' : 'ei') : 'pole teada'}</dd></div>
      <div><dt>Viimati sisse loginud</dt><dd>{info.loading ? '…' : formatWhen(own?.lastSignInAt)}</dd></div>
      <div><dt>Viimati CRM-is</dt><dd>{formatWhen(parent.lastSeenAt)}</dd></div>
      {own?.disabled ? <div><dt>Konto</dt><dd>suletud</dd></div> : null}
    </dl>
    {own?.found && parent.email && own.email !== parent.email.toLowerCase() ? <p className="form-hint">Kontaktandmetes on teine e-post ({parent.email}); sisse logitakse aadressiga {own.email}.</p> : null}
    {info.data && !own?.found ? <p className="form-hint">Sellel kirjel pole sisselogimise kontot.</p> : null}
    <div className="parent-account__kids"><span>Seotud lapsed:</span> {kids.length ? kids.map((child, index) => <span key={child.personKey || child.id}>{index ? ', ' : ''}<Link to={`/students/${child.id}`}>{child.name}</Link></span>) : 'pole seotud'}</div>
    {others.length ? <div className="parent-account__same">
      <strong>Sama nimega kontod</strong>
      <ul>{[parent, ...others].map((item) => {
        const facts = byUid.get(item.id);
        return <li key={item.id}><span>{facts?.found ? facts.email : item.email || 'e-post puudub'}{item.id === parent.id ? ' (see konto)' : ''}</span><small>{facts?.found ? `${methodsText(facts)} · viimati sisse loginud ${formatWhen(facts.lastSignInAt)}` : facts ? 'sisselogimise kontot pole' : '…'}</small>{item.id === parent.id ? null : <Link to={`/parents?parent=${encodeURIComponent(item.id)}`}>Ava</Link>}</li>;
      })}</ul>
    </div> : null}
    <div className="form-actions">
      <Button variant="secondary" loading={sending} disabled={!loginEmail || approval === 'rejected'} onClick={send}><Send size={16} /> Saada parooli link</Button>
      {approval === 'pending' && !approvedText ? <Button loading={approving} onClick={approve}><Check size={16} /> Kinnita</Button> : null}
      {approval !== 'approved' ? <Link className="link-button" to="/accounts">Kontod → Uued kontod</Link> : null}
    </div>
    {approvedText ? <p className="success-notice" role="status">{approvedText}</p> : null}
    {error ? <p className="action-error" role="alert">{error}</p> : null}
    {result ? <div className="success-notice" role="status">
      <span>{`Parooli link: ${result.email}. `}{result.mailed ? 'Kiri on saadetud.' : 'Kirja ei õnnestunud kinnitada — saada link lapsevanemale ise.'}</span>
      {result.link ? <Button type="button" variant="secondary" onClick={copy}><Copy size={15} /> {copied ? 'Kopeeritud' : 'Kopeeri link'}</Button> : null}
    </div> : null}
  </section>;
}
