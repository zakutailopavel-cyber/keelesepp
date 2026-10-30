import { useEffect, useState } from 'react';
import { Badge, Button, Card, EmptyState, Input, Modal } from '../../components/ui/index.js';
import { financeApi } from '../../services/firebase/financeApi.js';
import { lessonTokensService, TOKEN_EXPIRY_DAYS, tokenAccount, tokenLines } from '../../services/firebase/lessonTokens.js';
import './lessonTokens.css';

const ENTRY = { grant: 'Pakett lisatud', lesson_consumption: 'Tund', lesson_restoration: 'Tund tagastatud', adjustment_credit: 'Parandus +', adjustment_debit: 'Parandus −', expiry_extension: 'Pakett pikendatud' };
const dateOf = (value) => { const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}.${m[2]}.${m[1]}` : ''; };
const BADGE = { owed: ['danger', 'Võlg'], empty: ['danger', 'Pakett otsas'], expired: ['danger', 'Aegunud'], low: ['warning', 'Lõppemas'], ok: ['success', 'Aktiivne'] };
const tunde = (n) => `${n} ${n === 1 ? 'tund' : 'tundi'}`;

// „Tunnipakett” on the student card (lesson tokens, owner 2026-10-14 / 2026-10-29 / 2026-10-30): per subject and per package
// invoice bought, held, left and expired, the lessons held after that subject's packages were used up (owed: the next package
// invoice of the subject pays them first), and every movement — the paid invoice that added lessons, each lesson that took
// one, each corrected mark that gave it back, each extension. compact (parent / student): one line per subject.
// canExtend (administrator): an expired package can be extended, with a reason.
export default function LessonTokensCard({ student, service = lessonTokensService, compact = false, canExtend = false, extendApi = financeApi }) {
  const [state, setState] = useState({ loading: true, packages: [], ledger: [], owed: [], error: '' });
  const [reloads, setReloads] = useState(0);
  const [extending, setExtending] = useState(null);
  const [reason, setReason] = useState('');
  const [extendError, setExtendError] = useState('');
  const [extendBusy, setExtendBusy] = useState(false);
  useEffect(() => {
    let alive = true;
    // the owed lessons are optional: an older service (or a missing permission) leaves them out
    const owed = service.owedByStudent ? service.owedByStudent(student.id).catch(() => []) : Promise.resolve([]);
    Promise.all([service.listByStudent(student.id), compact ? [] : service.ledgerByStudent(student.id), owed])
      .then(([packages, ledger, owedLessons]) => { if (alive) setState({ loading: false, packages, ledger, owed: owedLessons, error: '' }); })
      .catch((error) => { if (alive) setState({ loading: false, packages: [], ledger: [], owed: [], error: error.message || 'Tunnipaketti ei saanud laadida.' }); });
    return () => { alive = false; };
  }, [compact, service, student.id, reloads]);

  const closeExtend = () => { if (extendBusy) return; setExtending(null); setReason(''); setExtendError(''); };
  const extend = async () => {
    if (reason.trim().length < 3) { setExtendError('Lisa pikendamise põhjus.'); return; }
    setExtendBusy(true);
    setExtendError('');
    try {
      await extendApi.extendStudentPackage(extending.id, { reason: reason.trim() });
      setExtendBusy(false);
      setExtending(null);
      setReason('');
      setReloads((n) => n + 1);
    } catch (caught) {
      setExtendError(caught.message || 'Paketti ei saanud pikendada.');
      setExtendBusy(false);
    }
  };

  if (state.loading) return null;
  const account = tokenAccount({ packages: state.packages, owed: state.owed, card: student });
  const several = account.subjects.length > 1;
  if (!account.rows.length && compact) return null;
  const [tone, label] = BADGE[account.state] || [];
  return <Card className="lesson-tokens-card">
    <div className="section-heading"><div><span className="eyebrow">Tunnipakett{compact && student.name ? ` · ${student.name}` : ''}</span><h2>{account.left} tundi alles</h2></div>
      {label ? <Badge tone={tone}>{label}</Badge> : null}</div>
    {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    {!account.rows.length ? <EmptyState title="Tunnipaketti pole" description="Loo arve Finantsides → „Tunnipakett”. Pärast makset lisatakse tunnid siia." /> : <>
      {compact ? tokenLines(account).map((line) => <p key={line} className="form-hint" data-testid="token-line">{line}</p>) : account.subjects.map((group) => <section key={group.key || 'shared'} className="lesson-tokens-card__subject">
        {several || group.subject ? <h3>{group.subject || 'Ilma aineta'}</h3> : null}
        <p className="form-hint">Ostetud {group.bought} · peetud {group.held} · alles {group.left}{group.expired ? ` · aegunud ${tunde(group.expired)}` : ''}{group.owed ? ` · võlg ${tunde(group.owed)}` : ''}{group.state === 'low' || group.state === 'empty' || group.state === 'expired' ? ' · aeg saata uus tunnipaketi arve' : ''}</p>
        {group.rows.length ? <table className="lesson-tokens-card__packages" aria-label={several ? `Tunnipaketid arvete kaupa · ${group.subject || 'ilma aineta'}` : 'Tunnipaketid arvete kaupa'}>
          <thead><tr><th scope="col">Arve</th><th scope="col">Alates</th><th scope="col">Ostetud</th><th scope="col">Peetud</th><th scope="col">Alles</th><th scope="col">Kehtib kuni</th>{canExtend ? <th scope="col"><span className="sr-only">Tegevus</span></th> : null}</tr></thead>
          <tbody>{group.rows.map((row) => <tr key={row.id}>
            <td>{row.invoiceNum || row.invoiceId || <span title={row.name}>arveta pakett</span>}</td>
            <td>{dateOf(row.issuedAt)}</td>
            <td>{row.bought}{row.corrected ? <small> ({row.corrected > 0 ? '+' : ''}{row.corrected} parandus)</small> : null}</td>
            <td>{row.held}</td>
            <td>{row.usedUp ? 'läbi' : row.expired ? `aegunud ${row.expired}` : row.left}</td>
            <td>{dateOf(row.expiresOn)}</td>
            {canExtend ? <td>{row.expired ? <Button variant="secondary" onClick={() => setExtending(row)}>Pikenda</Button> : null}</td> : null}
          </tr>)}</tbody>
        </table> : null}
        {group.owed ? <p className="form-error" role="status">Pakett on läbi: ilma paketita peetud {group.owedLessons.map((item) => `${dateOf(item.lessonDate)}${Number(item.credits) > 1 ? ` (${item.credits} tundi)` : ''}`).join(', ')} — võlg {tunde(group.owed)}. Saada uus tunnipaketi arve — makstud pakett katab need esimesena.</p> : null}
      </section>)}
      {!compact && state.ledger.length ? <ul className="simple-list lesson-tokens-card__ledger" aria-label="Tunnipaketi liikumised">
        {state.ledger.slice(0, 12).map((entry) => <li key={entry.id}>
          <span><strong>{ENTRY[entry.entryType] || entry.entryType}</strong><small>{[dateOf(entry.lessonDate || entry.createdAt), entry.lessonTopic, entry.sourceInvoiceNum ? `arve ${entry.sourceInvoiceNum}` : '', entry.entryType === 'expiry_extension' ? `kuni ${dateOf(entry.extendedUntil)}: ${entry.reason}` : ''].filter(Boolean).join(' · ')}</small></span>
          <Badge tone={entry.creditsDelta > 0 ? 'success' : 'neutral'}>{entry.creditsDelta > 0 ? `+${entry.creditsDelta}` : entry.creditsDelta} → {entry.balanceAfter}</Badge>
        </li>)}
      </ul> : null}
    </>}
    <Modal open={Boolean(extending)} title="Pikenda paketti" onClose={closeExtend} footer={<>
      <Button variant="secondary" disabled={extendBusy} onClick={closeExtend}>Loobu</Button>
      <Button loading={extendBusy} disabled={extendBusy} onClick={extend}>Pikenda {TOKEN_EXPIRY_DAYS} päeva</Button>
    </>}>
      <p className="form-hint">Aegunud {extending ? tunde(extending.expired) : ''} saab uuesti kasutada {TOKEN_EXPIRY_DAYS} päeva alates tänasest. Põhjus jääb auditisse.</p>
      <Input label="Põhjus" maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} />
      {extendError ? <p className="action-error" role="alert">{extendError}</p> : null}
    </Modal>
  </Card>;
}
