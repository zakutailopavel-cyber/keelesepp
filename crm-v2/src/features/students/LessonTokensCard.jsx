import { useEffect, useState } from 'react';
import { Badge, Card, EmptyState } from '../../components/ui/index.js';
import { lessonTokensService, TOKENS_LOW, tokenSummary } from '../../services/firebase/lessonTokens.js';

const ENTRY = { grant: 'Pakett lisatud', lesson_consumption: 'Tund', lesson_restoration: 'Tund tagastatud', adjustment_credit: 'Parandus +', adjustment_debit: 'Parandus −' };
const dateOf = (value) => { const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[3]}.${m[2]}.${m[1]}` : ''; };

// „Tunnipakett” on the student card (lesson tokens, owner 2026-10-14): lessons left, and every movement — the paid
// package invoice that added them, each lesson that took one and each corrected mark that gave it back.
export default function LessonTokensCard({ student, service = lessonTokensService, compact = false }) {
  const [state, setState] = useState({ loading: true, packages: [], ledger: [], error: '' });
  useEffect(() => {
    let alive = true;
    Promise.all([service.listByStudent(student.id), compact ? [] : service.ledgerByStudent(student.id)])
      .then(([packages, ledger]) => { if (alive) setState({ loading: false, packages, ledger, error: '' }); })
      .catch((error) => { if (alive) setState({ loading: false, packages: [], ledger: [], error: error.message || 'Tunnipaketti ei saanud laadida.' }); });
    return () => { alive = false; };
  }, [compact, service, student.id]);

  if (state.loading) return null;
  const summary = tokenSummary(state.packages);
  if (!state.packages.length && compact) return null;
  return <Card className="lesson-tokens-card">
    <div className="section-heading"><div><span className="eyebrow">Tunnipakett{compact && student.name ? ` · ${student.name}` : ''}</span><h2>{summary.balance} tundi alles</h2></div>
      {state.packages.length ? <Badge tone={summary.balance <= 0 ? 'danger' : summary.balance <= TOKENS_LOW ? 'warning' : 'success'}>{summary.balance <= 0 ? 'Pakett otsas' : summary.balance <= TOKENS_LOW ? 'Lõppemas' : 'Aktiivne'}</Badge> : null}</div>
    {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    {!state.packages.length ? <EmptyState title="Tunnipaketti pole" description="Loo arve Finantsides → „Tunnipakett”. Pärast makset lisatakse tunnid siia." /> : <>
      <p className="form-hint">Lisatud kokku {summary.granted} · kasutatud {summary.consumed}{summary.balance <= TOKENS_LOW ? ' · aeg saata uus tunnipaketi arve' : ''}</p>
      {!compact && state.ledger.length ? <ul className="simple-list lesson-tokens-card__ledger" aria-label="Tunnipaketi liikumised">
        {state.ledger.slice(0, 12).map((entry) => <li key={entry.id}>
          <span><strong>{ENTRY[entry.entryType] || entry.entryType}</strong><small>{[dateOf(entry.lessonDate || entry.createdAt), entry.lessonTopic, entry.sourceInvoiceNum ? `arve ${entry.sourceInvoiceNum}` : ''].filter(Boolean).join(' · ')}</small></span>
          <Badge tone={entry.creditsDelta > 0 ? 'success' : 'neutral'}>{entry.creditsDelta > 0 ? `+${entry.creditsDelta}` : entry.creditsDelta} → {entry.balanceAfter}</Badge>
        </li>)}
      </ul> : null}
    </>}
  </Card>;
}
