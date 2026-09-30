import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { useAuth } from '../../app/AuthContext.jsx';
import { websiteLeadsService } from '../../services/firebase/index.js';
import './leads.css';

const STATUS = { new: 'Uus', contacted: 'Ühendust võetud', converted: 'Õppijaks saanud', closed: 'Suletud' };

export default function LeadsPage({ service = websiteLeadsService }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState('open');
  const [busy, setBusy] = useState('');
  const state = useAsyncData(() => service.list(), [service]);
  const leads = useMemo(() => (state.data || []).filter(lead => filter === 'all' || (filter === 'open' ? !['converted', 'closed'].includes(lead.status) : lead.status === filter)), [state.data, filter]);
  const changeStatus = async (lead, status) => {
    setBusy(lead.id);
    try { await service.updateStatus(lead.id, status, user); state.reload(); } finally { setBusy(''); }
  };
  return <div className="page-content leads-page">
    <PageHeader eyebrow="Müük" title="Veebipäringud" description="Kodulehe registreerumised ja tasemetesti tulemused ühes tööjärjekorras." />
    <div className="leads-filters" role="tablist" aria-label="Päringute filter">
      {[['open', 'Aktiivsed'], ['new', 'Uued'], ['contacted', 'Ühendust võetud'], ['converted', 'Õppijad'], ['all', 'Kõik']].map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={filter === id} className={filter === id ? 'is-active' : ''} onClick={() => setFilter(id)}>{label}</button>)}
    </div>
    {state.loading ? <LoadingState label="Laen päringuid…" /> : state.error ? <ErrorState message={state.error.message} onRetry={state.reload} /> : !leads.length ? <Card><EmptyState title="Selles vaates päringuid pole" description="Uued veebivormi ja tasemetesti päringud ilmuvad siia automaatselt." /></Card> : <div className="leads-list">
      {leads.map(lead => <Card key={lead.id} className="lead-row">
        <div className="lead-row__main">
          <div className="lead-row__head"><strong>{lead.name}</strong><Badge>{STATUS[lead.status] || lead.status}</Badge><Badge>{lead.source === 'level-test' ? 'Tasemetest' : 'Veebivorm'}</Badge></div>
          <div className="lead-row__contact"><a href={`mailto:${lead.email}`}>{lead.email}</a>{lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : null}</div>
          <dl><dt>Keel ja tase</dt><dd>{lead.language} · {lead.level}</dd><dt>Saabus</dt><dd>{lead.createdAt || '—'}</dd>{lead.assessment ? <><dt>Test</dt><dd>{lead.assessment.score}/100 · {lead.assessment.answered} vastust · {lead.assessment.diagnosticId}</dd></> : null}{lead.message ? <><dt>Eesmärk</dt><dd>{lead.message}</dd></> : null}</dl>
        </div>
        <div className="lead-row__actions">
          {lead.status === 'new' ? <Button loading={busy === lead.id} onClick={() => changeStatus(lead, 'contacted')}>Märgi kontakteerituks</Button> : null}
          {!['converted', 'closed'].includes(lead.status) ? <Button variant="secondary" disabled={Boolean(busy)} onClick={() => changeStatus(lead, 'converted')}>Õppijaks</Button> : null}
        </div>
      </Card>)}
    </div>}
  </div>;
}
