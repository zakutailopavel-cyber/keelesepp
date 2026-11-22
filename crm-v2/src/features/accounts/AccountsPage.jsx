import { useContext, useState } from 'react';
import { Check, UserRoundCheck, UserRoundX, X } from 'lucide-react';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { accountApprovalsService } from '../../services/firebase/accountApprovals.js';
import { groupsService } from '../../services/firebase/groups.js';
import { AuthContext } from '../../app/AuthContext.jsx';
import { APPROVAL_RESPONSE_LOST_MESSAGE } from '../../services/firebase/accountApprovals.js';
import LinkReviewsCard from './LinkReviewsCard.jsx';
import './accounts.css';

const ROLE = { parent: 'Lapsevanem', student: 'Õpilane' };
const TABS = [['pending', 'Ootel'], ['rejected', 'Keeldutud']];

function linkedText(result, teacherUid = '') {
  if (result.responseLost) return APPROVAL_RESPONSE_LOST_MESSAGE;
  // a created card is also in linkedStudentIds: count each card once
  const linked = new Set([...(result.linkedStudentIds || []), ...(result.createdStudentIds || [])]).size;
  const parts = ['Konto kinnitatud.'];
  if (result.reviewCount) parts.push('Sarnane õpilase kaart on juba olemas — vali allpool „Vajab otsust”, kas siduda või luua uus kaart.');
  else parts.push(linked ? `Seotud õpilase kaarte: ${linked}.` : 'Õpilase kaarti automaatselt ei leitud — seo see vajadusel õpilase kaardil.');
  if (result.possibleExistingCount) parts.push('Uus kaart võib kuuluda olemasolevale kaardile — vaata allpool „Vajab otsust” ja ava vajadusel ühendamine.');
  if (result.createdStudentIds?.length && !teacherUid) parts.push('Uuel kaardil pole õpetajat: määra see õpilase kaardil.');
  if (result.mailed) parts.push('Inimesele saadeti e-kiri.');
  else if (result.mailPending) parts.push('E-kirja saatmine ei ole veel kinnitatud.');
  return parts.join(' ');
}

// Administrator: self-registered parents and students wait here until approved.
// the student cards approval produced: a group can take the child only when there is exactly one
function approvedCardIds(result = {}) {
  return [...new Set([...(result.createdStudentIds || []), ...(result.linkedStudentIds || [])])];
}

export default function AccountsPage({ service = accountApprovalsService, groups = groupsService }) {
  const user = useContext(AuthContext)?.user;
  const [tab, setTab] = useState('pending');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const state = useAsyncData(() => service.list(tab), [service, tab]);
  const reviewsState = useAsyncData(() => (service.listReviews ? service.listReviews() : Promise.resolve([])), [service]);
  const teachersState = useAsyncData(() => (service.listTeachers ? service.listTeachers() : Promise.resolve([])), [service]);
  const [teacherFor, setTeacherFor] = useState({});
  const teacherOf = (account) => teacherFor[account.id] ?? account.assignedTeacherUid ?? '';
  // owner 2026-11-22: „надо еще возможность к группе назначать” — the group the new card joins on approval
  const groupsState = useAsyncData(() => (groups?.list ? groups.list() : Promise.resolve([])), [groups]);
  const [groupFor, setGroupFor] = useState({});

  const joinGroup = async (account, result) => {
    const group = (groupsState.data || []).find((item) => item.id === groupFor[account.id]);
    if (!group || result.responseLost) return '';
    const ids = approvedCardIds(result);
    if (ids.length !== 1) return ` Gruppi „${group.name}” ei lisatud: ${ids.length ? 'kontol on mitu õpilase kaarti' : 'õpilase kaarti pole veel'} — lisa laps grupi lehel.`;
    try {
      await groups.setStudent(group, { id: ids[0], name: account.childName || account.displayName }, true, user);
      groupsState.reload();
      return ` Lisatud gruppi „${group.name}”.`;
    } catch (caught) {
      return ` Gruppi „${group.name}” lisamine ebaõnnestus (${caught.message}) — lisa laps grupi lehel.`;
    }
  };

  const decide = async (account, decision) => {
    let reason = '';
    if (decision === 'reject') {
      reason = globalThis.prompt?.(`Keeldu kontost „${account.displayName}”? Põhjus (valikuline):`, '');
      if (reason === null || reason === undefined) return;
    }
    setBusy(account.id); setError(''); setNotice('');
    try {
      const teacherUid = decision === 'approve' ? teacherOf(account) : '';
      const result = await service.decide({ uid: account.id, decision, reason, ...(teacherUid ? { teacherUid } : {}) });
      const joined = decision === 'approve' ? await joinGroup(account, result) : '';
      setNotice(decision === 'approve' ? linkedText(result, teacherUid) + joined : `Konto „${account.displayName}” on keeldutud.`);
      state.reload();
      reviewsState.reload();
    } catch (caught) {
      setError(caught.message);
    } finally { setBusy(''); }
  };

  return (
    <div className="page-content">
      <PageHeader eyebrow="Ligipääs" title="Uued kontod" description="Lapsevanemad ja õpilased, kes registreerusid ise, saavad ligipääsu alles pärast sinu kinnitust." />
      {reviewsState.error ? <p className="form-error" role="alert">Sidumise otsuseid ei saanud laadida: {reviewsState.error.message}</p> : null}
      <LinkReviewsCard reviews={reviewsState.data || []} service={service} onChanged={reviewsState.reload} />
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
                  {account.preferredTeacher ? <><dt>Soovitud õpetaja</dt><dd>{account.preferredTeacher}</dd></> : null}
                  <dt>Registreerus</dt><dd>{account.createdAt || '—'}</dd>
                  {account.approvalReason ? <><dt>Põhjus</dt><dd>{account.approvalReason}</dd></> : null}
                </dl>
                {/* the administrator assigns the teacher; it goes on a card that approval creates */}
                <Select label="Õpetaja (uuele õpilase kaardile)" value={teacherOf(account)} disabled={Boolean(busy)} onChange={(event) => setTeacherFor((current) => ({ ...current, [account.id]: event.target.value }))}>
                  <option value="">Määramata</option>
                  {(teachersState.data || []).map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
                </Select>
                {(groupsState.data || []).length ? (
                  <Select label="Grupp (valikuline)" value={groupFor[account.id] || ''} disabled={Boolean(busy)} onChange={(event) => setGroupFor((current) => ({ ...current, [account.id]: event.target.value }))}>
                    <option value="">Ilma grupita</option>
                    {groupsState.data.map((group) => <option key={group.id} value={group.id}>{group.name}{group.teacher ? ` · ${group.teacher}` : ''}</option>)}
                  </Select>
                ) : null}
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
