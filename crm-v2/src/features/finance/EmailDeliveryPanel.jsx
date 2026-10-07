import { MailCheck, RefreshCw, Send } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { emailQueueService } from '../../services/firebase/emailQueue.js';
import { invoiceDeliveryApi } from '../../services/firebase/financeApi.js';

const STATUS = {
  sent: { label: 'Saadetud', tone: 'success' },
  failed: { label: 'Ebaõnnestus', tone: 'danger' },
  sending: { label: 'Saatmisel', tone: 'info' },
  queued: { label: 'Järjekorras', tone: 'warning' },
};
const TYPES = { invoice: 'Arve', reminder: 'Meeldetuletus', due10: 'Meeldetuletus', test: 'Testkiri', creditNote: 'Kreeditarve' };
const when = (value) => (value ? new Date(value).toLocaleString('et-EE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—');

// Täpsem → E-kirjad: do invoices and reminders actually leave the server? Last attempts with the provider's error,
// and a test e-mail to the admin's own address.
export default function EmailDeliveryPanel({ repository = emailQueueService, deliveryApi = invoiceDeliveryApi }) {
  const state = useAsyncData(() => repository.recent(30), [repository]);
  const [test, setTest] = useState({ busy: false, result: null });
  const reminders = useAsyncData(() => (deliveryApi.reminderSettings ? deliveryApi.reminderSettings() : Promise.resolve(null)), [deliveryApi]);
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState('');
  const switchReminders = async (autoEnabled) => {
    if (autoEnabled && !globalThis.confirm('Lülitan automaatsed meeldetuletused sisse: igal hommikul kell 9 saadetakse lapsevanematele meeldetuletused tasumata ja tähtaja ületanud arvete kohta. Jätkata?')) return;
    setSwitching(true); setSwitchError('');
    try { await deliveryApi.reminderSettings(autoEnabled); reminders.reload(); } catch (error) { setSwitchError(error.message || 'Seadet ei saanud muuta.'); } finally { setSwitching(false); }
  };
  const runTest = async () => {
    setTest({ busy: true, result: null });
    try {
      const result = await deliveryApi.testEmail();
      setTest({ busy: false, result });
    } catch (error) {
      setTest({ busy: false, result: { ok: false, error: error.message } });
    }
    state.reload();
  };
  const items = state.data || [];
  const failed = items.filter((item) => item.status === 'failed');
  const lastSent = items.find((item) => item.status === 'sent');
  const lastError = failed[0]?.error || '';

  return (
    <Card className="email-delivery-card">
      <div className="section-heading">
        <div><span className="eyebrow">E-kirjad</span><h2>Arvete ja meeldetuletuste saatmine</h2></div>
        <div className="email-delivery-actions">
          <Button variant="secondary" onClick={state.reload}><RefreshCw size={16} /> Värskenda</Button>
          <Button loading={test.busy} onClick={runTest}><Send size={16} /> Saada testkiri endale</Button>
        </div>
      </div>
      {reminders.data ? (
        <div className={`email-reminders ${reminders.data.autoEnabled ? 'is-on' : 'is-off'}`}>
          <span><strong>Automaatsed meeldetuletused: {reminders.data.autoEnabled ? 'SEES' : 'VÄLJAS'}</strong><small>{reminders.data.autoEnabled ? 'Igal hommikul kell 9 saadetakse meeldetuletused tasumata ja üle tähtaja arvete kohta.' : 'Midagi ei saadeta ise. Arved ja meeldetuletused saadab administraator nuppudega.'}</small></span>
          <Button variant="secondary" loading={switching} onClick={() => switchReminders(!reminders.data.autoEnabled)}>{reminders.data.autoEnabled ? 'Lülita välja' : 'Lülita sisse'}</Button>
        </div>
      ) : null}
      {switchError ? <p className="form-error" role="alert">{switchError}</p> : null}
      {test.result ? (
        test.result.ok
          ? <p className="success-notice" role="status"><MailCheck size={16} /> Testkiri saadeti aadressile {test.result.to}. Kontrolli postkasti.</p>
          : <p className="form-error" role="alert">Testkirja ei saanud saata aadressile {test.result.to || '—'}: {test.result.error}</p>
      ) : null}
      {state.loading ? <LoadingState label="Laen e-kirju…" /> : state.error ? <ErrorState message={state.error.message} onRetry={state.reload} /> : (
        <>
          <p className={failed.length && !lastSent ? 'form-error' : 'form-hint'} role={failed.length && !lastSent ? 'alert' : undefined}>
            Viimased {items.length} kirja: saadetud {items.filter((item) => item.status === 'sent').length}, ebaõnnestus {failed.length}.
            {lastSent ? ` Viimane õnnestunud: ${when(lastSent.sentAt || lastSent.createdAt)}.` : ' Ükski viimastest kirjadest ei jõudnud kohale.'}
            {lastError ? ` Viimane viga: ${lastError}` : ''}
          </p>
          {items.length ? (
            <div className="email-delivery-list">
              {items.map((item) => (
                <div key={item.id} className="email-delivery-row">
                  <time>{when(item.createdAt)}</time>
                  <span><strong>{TYPES[item.type] || item.type || 'Kiri'}{item.invoiceNum ? ` · ${item.invoiceNum}` : ''}</strong><small>{item.to}</small></span>
                  <Badge tone={STATUS[item.status]?.tone || 'neutral'}>{STATUS[item.status]?.label || item.status}</Badge>
                  {item.error ? <small className="email-delivery-error">{item.error}</small> : null}
                </div>
              ))}
            </div>
          ) : <EmptyState title="E-kirju pole veel saadetud" />}
        </>
      )}
    </Card>
  );
}
