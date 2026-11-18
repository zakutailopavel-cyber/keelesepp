import { useEffect, useState } from 'react';
import { Badge, Card, EmptyState } from '../../components/ui/index.js';
import { groupPackageGaps, lessonTokensService, tokenAccount, tokenLine } from '../../services/firebase/lessonTokens.js';
import { groupSubjects } from './directionFormat.js';
import { FormatBadge } from './DirectionFormat.jsx';
import './lessonTokens.css';

const ENTRY = { grant: 'Pakett lisatud', lesson_consumption: 'Tund', lesson_restoration: 'Tund tagastatud', adjustment_credit: 'Parandus +', adjustment_debit: 'Parandus −' };
const dateOf = (value) => { const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}.${m[2]}.${m[1]}` : ''; };
const BADGE = { owed: ['danger', 'Võlg'], empty: ['danger', 'Pakett otsas'], low: ['warning', 'Lõppemas'], ok: ['success', 'Aktiivne'] };
const tunde = (n) => `${n} ${n === 1 ? 'tund' : 'tundi'}`;

// „Tunnipakett” on the student card (lesson tokens, owner 2026-10-14 / 2026-10-29): per package invoice bought, held and
// left, the lessons held after the packages were used up (owed: the next package invoice pays them first), and every
// movement — the paid invoice that added lessons, each lesson that took one, each corrected mark that gave it back.
// compact (parent / student): only the line „Paketist alles N tundi” or what is owed.
export default function LessonTokensCard({ student, service = lessonTokensService, compact = false }) {
  const [state, setState] = useState({ loading: true, packages: [], ledger: [], owed: [], error: '' });
  useEffect(() => {
    let alive = true;
    // the owed lessons are optional: an older service (or a missing permission) leaves them out
    const owed = service.owedByStudent ? service.owedByStudent(student.id).catch(() => []) : Promise.resolve([]);
    Promise.all([service.listByStudent(student.id), compact ? [] : service.ledgerByStudent(student.id), owed])
      .then(([packages, ledger, owedLessons]) => { if (alive) setState({ loading: false, packages, ledger, owed: owedLessons, error: '' }); })
      .catch((error) => { if (alive) setState({ loading: false, packages: [], ledger: [], owed: [], error: error.message || 'Tunnipaketti ei saanud laadida.' }); });
    return () => { alive = false; };
  }, [compact, service, student.id]);

  if (state.loading) return null;
  const account = tokenAccount({ packages: state.packages, owed: state.owed });
  if (!account.rows.length && compact) return null;
  const [tone, label] = BADGE[account.state] || [];
  // packages for one subject (2026-11-03): the column shows which lessons each package pays
  const bySubject = account.rows.some((row) => row.subject);
  // „Individuaalne / Grupp” (2026-11-18): a group direction without a group package — its lessons take individual ones
  const gaps = compact ? [] : groupPackageGaps(state.packages, groupSubjects(student));
  const byFormat = account.rows.some((row) => row.format === 'group') || gaps.length > 0;
  return <Card className="lesson-tokens-card">
    <div className="section-heading"><div><span className="eyebrow">Tunnipakett{compact && student.name ? ` · ${student.name}` : ''}</span><h2>{account.left} tundi alles</h2></div>
      {label ? <Badge tone={tone}>{label}</Badge> : null}</div>
    {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    {!account.rows.length ? <EmptyState title="Tunnipaketti pole" description="Loo arve Finantsides → „Tunnipakett”. Pärast makset lisatakse tunnid siia." /> : <>
      {compact ? <p className="form-hint" data-testid="token-line">{tokenLine(account)}</p> : <>
        <p className="form-hint">Ostetud {account.bought} · peetud {account.held} · alles {account.left}{account.owed ? ` · võlg ${tunde(account.owed)}` : ''}{account.state === 'low' || account.state === 'empty' ? ' · aeg saata uus tunnipaketi arve' : ''}</p>
        <table className="lesson-tokens-card__packages" aria-label="Tunnipaketid arvete kaupa">
          <thead><tr><th scope="col">Arve</th>{bySubject ? <th scope="col">Aine</th> : null}<th scope="col">Alates</th><th scope="col">Ostetud</th><th scope="col">Peetud</th><th scope="col">Alles</th></tr></thead>
          <tbody>{account.rows.map((row) => <tr key={row.id}>
            <td>{row.invoiceNum || row.invoiceId || <span title={row.name}>arveta pakett</span>}</td>
            {bySubject ? <td>{row.subject || 'kõik ained'}{byFormat ? <> <FormatBadge format={row.format} /></> : null}</td> : null}
            <td>{dateOf(row.issuedAt)}</td>
            <td>{row.bought}{row.corrected ? <small> ({row.corrected > 0 ? '+' : ''}{row.corrected} parandus)</small> : null}</td>
            <td>{row.held}</td>
            <td>{row.usedUp ? 'läbi' : row.left}</td>
          </tr>)}</tbody>
        </table>
        {gaps.length ? <p className="direction-format-warning" role="note">{gaps.map((subject) => `${subject} · grupp`).join(', ')}: grupi tunnipaketti pole — grupitunnid võetakse individuaalsest paketist. Loo grupi tunnipakett: Finantsid → Tunnipakett, vorm „Grupp”.</p> : null}
        {account.owed ? <p className="form-error" role="status">Pakett on läbi: ilma paketita peetud {account.owedLessons.map((item) => `${dateOf(item.lessonDate)}${item.subject ? ` ${item.subject}` : ''}${Number(item.credits) > 1 ? ` (${item.credits} tundi)` : ''}`).join(', ')} — võlg {tunde(account.owed)}. Saada uus tunnipaketi arve — makstud pakett katab need esimesena.</p> : null}
      </>}
      {!compact && state.ledger.length ? <ul className="simple-list lesson-tokens-card__ledger" aria-label="Tunnipaketi liikumised">
        {state.ledger.slice(0, 12).map((entry) => <li key={entry.id}>
          <span><strong>{ENTRY[entry.entryType] || entry.entryType}</strong><small>{[dateOf(entry.lessonDate || entry.createdAt), entry.lessonTopic, entry.sourceInvoiceNum ? `arve ${entry.sourceInvoiceNum}` : '', entry.formatFallback ? 'grupitund individuaalsest paketist' : ''].filter(Boolean).join(' · ')}</small></span>
          <Badge tone={entry.creditsDelta > 0 ? 'success' : 'neutral'}>{entry.creditsDelta > 0 ? `+${entry.creditsDelta}` : entry.creditsDelta} → {entry.balanceAfter}</Badge>
        </li>)}
      </ul> : null}
    </>}
  </Card>;
}
