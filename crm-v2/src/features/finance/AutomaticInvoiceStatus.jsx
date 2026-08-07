import { Bot, CircleAlert, Play, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card } from '../../components/ui/index.js';
import { manualInvoiceApi } from '../../services/firebase/manualInvoiceApi.js';
import './automaticInvoiceStatus.css';

const money = (cents) => new Intl.NumberFormat('et-EE', {
  style: 'currency',
  currency: 'EUR',
}).format(Number(cents || 0) / 100);

export default function AutomaticInvoiceStatus() {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setPreview(await manualInvoiceApi.automationPreview());
    } catch (nextError) {
      setError(nextError.message || 'Automaatarvete eelvaadet ei saanud laadida.');
    } finally {
      setLoading(false);
    }
  };

  const runPreview = async () => {
    setRunning(true);
    setError('');
    try {
      setPreview(await manualInvoiceApi.refreshAutomationPreview());
    } catch (nextError) {
      setError(nextError.message || 'Automaatarvete eelvaadet ei saanud uuendada.');
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = preview?.totals || {};
  return (
    <Card className="automatic-invoice-status">
      <div className="automatic-invoice-status__main">
        <span className="automatic-invoice-status__icon" aria-hidden="true"><Bot size={20} /></span>
        <div>
          <div className="automatic-invoice-status__title">
            <strong>Automaatarved</strong>
            <Badge tone="info">Eelvaade</Badge>
          </div>
          {loading ? <span>Laen viimast eelvaadet…</span> : null}
          {!loading && error ? <span className="automatic-invoice-status__error">{error}</span> : null}
          {!loading && !error && !preview ? <span>Eelvaadet ei ole veel loodud.</span> : null}
          {!loading && preview ? (
            <span>
              {preview.month}: <strong>{totals.invoices || 0}</strong> arvet · <strong>{totals.lessons || 0}</strong> tundi · <strong>{money(totals.amountCents)}</strong>
            </span>
          ) : null}
        </div>
      </div>
      <div className="automatic-invoice-status__actions">
        {preview?.blocked?.length ? (
          <span className="automatic-invoice-status__blocked" title={preview.blocked.map((item) => `${item.studentName}: ${item.reason}`).join('\n')}>
            <CircleAlert size={16} /> {preview.blocked.length} vajab parandamist
          </span>
        ) : null}
        <Button variant="secondary" disabled={loading || running} onClick={load}>
          <RefreshCw size={16} /> Värskenda
        </Button>
        <Button disabled={loading || running} loading={running} onClick={runPreview}>
          <Play size={16} /> Arvuta praegu
        </Button>
      </div>
    </Card>
  );
}
