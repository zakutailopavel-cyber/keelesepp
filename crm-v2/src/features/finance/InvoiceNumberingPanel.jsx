import { AlertTriangle, CheckCircle2, Hash, MailWarning, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, EmptyState } from "../../components/ui/index.js";

const riskLabel = {
  draft: "Saatmata",
  sent: "Saadetud — saada uuesti",
  paid: "Makstud",
  credited: "Kreeditarve olemas",
};

export default function InvoiceNumberingPanel({ invoices = [], onPreview, onRepair, onReload, onOpenInvoice }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const correctedDeliveryQueue = invoices.filter((invoice) => invoice.correctedInvoiceDeliveryRequired);

  const preview = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await onPreview();
      setPlan(result.plan);
    } catch (previewError) {
      setError(previewError.message || "Arvenumbrite kontroll ebaõnnestus.");
    } finally {
      setLoading(false);
    }
  };

  const repair = async () => {
    if (!reason.trim()) {
      setError("Lisa paranduse põhjus.");
      return;
    }
    if (!confirmed) {
      setError("Kinnita, et kontrollisid numbrimuudatusi.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const result = await onRepair(plan, reason.trim());
      setSuccess(`${result.repair.replacementCount} arvenumbrit parandati. Kõik muudatused salvestati auditisse.`);
      setReason("");
      setConfirmed(false);
      await onReload();
      const next = await onPreview();
      setPlan(next.plan);
    } catch (repairError) {
      setError(repairError.message || "Arvenumbrite parandamine ebaõnnestus.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="invoice-numbering-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Andmekvaliteet</span>
          <h2>Arvenumbrite kontroll</h2>
          <p>Kontrollib korduvaid numbreid ja kaitseb järjestust enne kuu sulgemist.</p>
        </div>
        <Button variant="secondary" loading={loading} disabled={saving} onClick={preview}>
          <RefreshCw size={16} /> Kontrolli numbreid
        </Button>
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {success ? <div className="success-notice" role="status">{success}</div> : null}
      {!plan ? (
        <EmptyState title="Numeratsiooni ei ole veel kontrollitud" description="Käivita kontroll enne järgmiste arvete loomist." />
      ) : plan.replacementCount === 0 ? (
        <div className="numbering-ok">
          <CheckCircle2 size={22} />
          <div>
            <strong>Kõik {plan.invoiceCount} arvenumbrit on unikaalsed</strong>
            <span>Järgmine number jätkab vähemalt järjestusest {plan.counterAfter + 1}.</span>
          </div>
        </div>
      ) : (
        <div className="numbering-review">
          <div className="numbering-warning">
            <AlertTriangle size={22} />
            <div>
              <strong>{plan.duplicateGroupCount} korduvat numbrit · {plan.replacementCount} parandust</strong>
              <span>{plan.riskyReplacementCount} dokumenti sisaldavad makset, saatmist või kreeditarvet.</span>
            </div>
          </div>
          <div className="numbering-groups">
            {plan.groups.map((group) => (
              <section key={group.number}>
                <header>
                  <Hash size={17} />
                  <strong>{group.number}</strong>
                  <Badge tone="neutral">{group.count} arvet</Badge>
                </header>
                <p>Alles jääb: {group.canonicalStudentName || group.canonicalInvoiceId}</p>
                {group.replacements.map((item) => (
                  <div key={item.invoiceId}>
                    <span>
                      <strong>{item.studentName || item.payerName || item.invoiceId}</strong>
                      <small>{item.oldNumber} → {item.newNumber}</small>
                    </span>
                    <Badge tone={item.risk === "draft" ? "info" : "danger"}>{riskLabel[item.risk] || item.risk}</Badge>
                  </div>
                ))}
              </section>
            ))}
          </div>
          <label className="textarea-field">
            <span>Paranduse põhjus *</span>
            <textarea
              rows="3"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Näiteks: ajalooliste korduvate arvenumbrite korrastamine"
            />
          </label>
          <label className="numbering-confirmation">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            <span>Kontrollisin, milline arve säilitab algse numbri. Saadetud parandatud arved tuleb pärast uuesti saata.</span>
          </label>
          <Button loading={saving} onClick={repair}>
            <ShieldCheck size={17} /> Paranda {plan.replacementCount} arvenumbrit
          </Button>
        </div>
      )}
      {correctedDeliveryQueue.length ? (
        <div className="corrected-delivery-queue">
          <div>
            <MailWarning size={20} />
            <span>
              <strong>{correctedDeliveryQueue.length} parandatud arvet ootab uuesti saatmist</strong>
              <small>Pärast saatmist eemaldatakse arve sellest järjekorrast automaatselt.</small>
            </span>
          </div>
          {correctedDeliveryQueue.map((invoice) => (
            <article key={invoice.id}>
              <span>
                <strong>{invoice.num}</strong>
                <small>{invoice.studentName || invoice.payerName || "Maksja"} · eelmine {invoice.previousInvoiceNumbers?.at(-1) || "—"}</small>
              </span>
              <Button variant="secondary" onClick={() => onOpenInvoice?.(invoice)}>Ava arve</Button>
            </article>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
