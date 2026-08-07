import { FileStack, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Input, Modal } from '../../components/ui/index.js';
import { batchInvoicePayload, buildBatchInvoicePlan, defaultAutomaticBillingMonth } from './batchInvoices.js';
import { defaultInvoiceDue } from './lessonAccounting.js';
import './batchInvoicePanel.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(Number(cents || 0) / 100);

export default function BatchInvoicePanel({ rows, onCreateInvoice }) {
  const [month, setMonth] = useState(defaultAutomaticBillingMonth());
  const [open, setOpen] = useState(false);
  const [due, setDue] = useState(defaultInvoiceDue());
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [error, setError] = useState('');
  const plan = useMemo(() => buildBatchInvoicePlan(rows, month), [month, rows]);

  const createBatch = async () => {
    if (!plan.ready.length) return;
    setSaving(true);
    setError('');
    setProgress({ completed: 0, total: plan.ready.length });
    try {
      for (const [index, item] of plan.ready.entries()) {
        await onCreateInvoice(batchInvoicePayload(item, {
          due,
          description: `${month} keeletunnid`,
        }));
        setProgress({ completed: index + 1, total: plan.ready.length });
      }
      setOpen(false);
    } catch (nextError) {
      setError(nextError.message || 'Arvete loomine katkestati. Juba loodud arveid ei kustutatud.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="batch-invoice-panel">
      <div className="batch-invoice-panel__intro">
        <span aria-hidden="true"><FileStack size={22} /></span>
        <div>
          <span className="eyebrow">Perioodiarved</span>
          <h3>Automaatarvete eelvaade</h3>
          <p>Vaikimisi kasutatakse eelmist lõpetatud kuud. Siin näed enne loomist täpselt, kellele arve tekib ja kelle andmed vajavad parandamist.</p>
        </div>
      </div>
      <div className="batch-invoice-panel__controls">
        <Input label="Arvelduskuu" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        <div aria-live="polite">
          <strong>{plan.totals.invoices}</strong> arvet · <strong>{plan.totals.lessons}</strong> tundi · <strong>{money(plan.totals.amountCents)}</strong>
        </div>
        <Button disabled={!plan.ready.length} onClick={() => { setDue(defaultInvoiceDue()); setError(''); setOpen(true); }}>
          <FileStack size={17} /> Kontrolli ja loo
        </Button>
      </div>
      {plan.blocked.length ? <p className="batch-invoice-panel__warning"><TriangleAlert size={17} /> {plan.blocked.length} õpilase arvet ei looda: puudu on õpilase kirje või tunni hind.</p> : null}

      <Modal
        open={open}
        title={`Perioodiarved: ${month}`}
        onClose={() => !saving && setOpen(false)}
        footer={<><Button variant="secondary" disabled={saving} onClick={() => setOpen(false)}>Loobu</Button><Button loading={saving} disabled={!plan.ready.length} onClick={createBatch}>Loo {plan.ready.length} arvet</Button></>}
      >
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {saving ? <p className="form-hint" role="status">Loodud {progress.completed} / {progress.total} arvet.</p> : null}
        <p className="form-hint">Arved luuakse ainult veel arveldamata tundidest. Juba arvega seotud tunnid ei kuulu sellesse plaani.</p>
        <Input label="Maksetähtaeg" type="date" value={due} onChange={(event) => setDue(event.target.value)} required />
        {plan.ready.length ? <div className="batch-invoice-preview">{plan.ready.map((item) => <section key={item.studentId}><div><strong>{item.studentName}</strong><span>{item.lessonCount} tundi</span></div><strong>{money(item.amountCents)}</strong></section>)}</div> : <EmptyState title="Valitud kuul arveldamata tunde ei ole" />}
        {plan.blocked.length ? <div className="batch-invoice-blocked"><h4>Vajavad parandamist</h4>{plan.blocked.map((item) => <section key={`${item.studentId}-${item.studentName}`}><span><strong>{item.studentName}</strong><small>{item.reason}</small></span><Badge tone="danger">Ei looda</Badge></section>)}</div> : null}
      </Modal>
    </Card>
  );
}
