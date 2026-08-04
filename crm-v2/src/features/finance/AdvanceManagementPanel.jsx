import { ArrowRightLeft, Coins, ReceiptText, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
} from "../../components/ui/index.js";
import { invoiceBalanceCents } from "../students/studentFinance.js";
import { displayDate } from "./finance.js";
import "./advanceManagement.css";

const today = () => new Date().toISOString().slice(0, 10);
const money = (value) =>
  new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR" }).format(
    Number(value || 0) / 100,
  );

function availableCents(credit) {
  return Number.isInteger(credit?.availableAmountCents)
    ? credit.availableAmountCents
    : Math.round((Number(credit?.availableAmount) || 0) * 100);
}

export default function AdvanceManagementPanel({
  credits,
  refunds,
  invoices,
  onApply,
  onRefund,
  onReload,
}) {
  const [action, setAction] = useState(null);
  const [form, setForm] = useState({
    invoiceId: "",
    amount: "",
    note: "",
    refundedAt: today(),
    method: "bank",
    reference: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const openCredits = credits.filter(
    (credit) => credit.status === "open" && availableCents(credit) > 0,
  );
  const totals = useMemo(
    () =>
      credits.reduce(
        (result, credit) => ({
          available: result.available + availableCents(credit),
          applied: result.applied + Number(credit.appliedAmountCents || 0),
          refunded: result.refunded + Number(credit.refundedAmountCents || 0),
        }),
        { available: 0, applied: 0, refunded: 0 },
      ),
    [credits],
  );

  const eligibleInvoices = action?.credit
    ? invoices.filter(
        (invoice) =>
          invoiceBalanceCents(invoice) > 0 &&
          (!action.credit.studentId ||
            invoice.studentId === action.credit.studentId),
      )
    : [];

  const openApply = (credit) => {
    const invoice = invoices.find(
      (item) =>
        invoiceBalanceCents(item) > 0 &&
        (!credit.studentId || item.studentId === credit.studentId),
    );
    setAction({ type: "apply", credit });
    setForm({
      invoiceId: invoice?.id || "",
      amount: invoice
        ? (
            Math.min(availableCents(credit), invoiceBalanceCents(invoice)) / 100
          ).toFixed(2)
        : "",
      note: "",
      refundedAt: today(),
      method: "bank",
      reference: "",
      reason: "",
    });
    setError("");
  };

  const openRefund = (credit) => {
    setAction({ type: "refund", credit });
    setForm({
      invoiceId: "",
      amount: (availableCents(credit) / 100).toFixed(2),
      note: "",
      refundedAt: today(),
      method: "bank",
      reference: "",
      reason: "",
    });
    setError("");
  };

  const selectInvoice = (invoiceId) => {
    const invoice = invoices.find((item) => item.id === invoiceId);
    setForm({
      ...form,
      invoiceId,
      amount: invoice
        ? (
            Math.min(
              availableCents(action.credit),
              invoiceBalanceCents(invoice),
            ) / 100
          ).toFixed(2)
        : "",
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    const amount = Number(String(form.amount).replace(",", "."));
    const amountCents = Math.round(amount * 100);
    if (
      !Number.isFinite(amount) ||
      amountCents <= 0 ||
      amountCents > availableCents(action.credit)
    ) {
      setError("Sisesta summa, mis ei ületa avansi jääki.");
      return;
    }
    if (action.type === "apply") {
      const invoice = invoices.find((item) => item.id === form.invoiceId);
      if (!invoice) {
        setError("Vali arve.");
        return;
      }
      if (amountCents > invoiceBalanceCents(invoice)) {
        setError("Summa ei tohi ületada arve jääki.");
        return;
      }
    } else if (!form.reason.trim()) {
      setError("Lisa tagastuse põhjus.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (action.type === "apply") {
        await onApply(action.credit.id, form.invoiceId, amount, form.note);
        setSuccess("Avanss rakendati arvele ja arve jääk arvutati uuesti.");
      } else {
        await onRefund(action.credit.id, { ...form, amount });
        setSuccess("Avansi tagastus registreeriti.");
      }
      setAction(null);
      await onReload();
    } catch (submitError) {
      setError(submitError.message || "Toiming ebaõnnestus.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="advance-management">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Ettemaksed ja tagastused</span>
          <h2>Õpilaste avansid</h2>
          <p>
            Pangas laekunud ülejääki saab kasutada järgmise arve tasumiseks või
            maksjale tagastada.
          </p>
        </div>
        <Badge tone={openCredits.length ? "info" : "neutral"}>
          {openCredits.length} avatud
        </Badge>
      </div>
      {success ? (
        <div className="success-notice" role="status">
          {success}
        </div>
      ) : null}
      <div className="advance-management__metrics">
        <span>
          <Coins size={18} /> Saadaval{" "}
          <strong>{money(totals.available)}</strong>
        </span>
        <span>
          <ArrowRightLeft size={18} /> Arvetele kasutatud{" "}
          <strong>{money(totals.applied)}</strong>
        </span>
        <span>
          <Undo2 size={18} /> Tagastatud{" "}
          <strong>{money(totals.refunded)}</strong>
        </span>
      </div>
      {openCredits.length ? (
        <div className="advance-list">
          {openCredits.map((credit) => (
            <article key={credit.id}>
              <Coins size={19} />
              <span>
                <strong>
                  {credit.studentName || credit.payerName || "Maksja määramata"}
                </strong>
                <small>
                  {credit.payerName && credit.studentName
                    ? `Maksja: ${credit.payerName} · `
                    : ""}
                  {displayDate(credit.createdAt)} ·{" "}
                  {credit.bankTransactionId ? "Pangamakse" : "Arve ülejääk"}
                </small>
              </span>
              <b>{money(availableCents(credit))}</b>
              <div>
                <Button
                  variant="secondary"
                  disabled={
                    !invoices.some(
                      (invoice) =>
                        invoiceBalanceCents(invoice) > 0 &&
                        (!credit.studentId ||
                          invoice.studentId === credit.studentId),
                    )
                  }
                  onClick={() => openApply(credit)}
                >
                  <ReceiptText size={16} /> Kasuta arvel
                </Button>
                <Button variant="secondary" onClick={() => openRefund(credit)}>
                  <Undo2 size={16} /> Tagasta
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Avatud avansse ei ole"
          description="Ülemaksed ja arvega sidumata pangalaekumised ilmuvad siia automaatselt."
        />
      )}
      {refunds.length ? (
        <div className="refund-history">
          <span className="eyebrow">Viimased tagastused</span>
          {refunds.slice(0, 5).map((refund) => (
            <div key={refund.id}>
              <span>
                <strong>{refund.payerName || "Maksja"}</strong>
                <small>
                  {displayDate(refund.refundedAt)} ·{" "}
                  {refund.reference || refund.method}
                </small>
              </span>
              <b>{money(refund.amountCents)}</b>
            </div>
          ))}
        </div>
      ) : null}
      <Modal
        open={Boolean(action)}
        title={
          action?.type === "apply" ? "Kasuta avanssi arvel" : "Tagasta avanss"
        }
        onClose={() => !saving && setAction(null)}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => setAction(null)}
            >
              Loobu
            </Button>
            <Button type="submit" form="advance-action-form" loading={saving}>
              {action?.type === "apply" ? "Rakenda avanss" : "Kinnita tagastus"}
            </Button>
          </>
        }
      >
        {action ? (
          <form
            id="advance-action-form"
            className="form-grid"
            onSubmit={submit}
          >
            <div className="advance-context form-grid__wide">
              <span>
                {action.credit.studentName || action.credit.payerName}
              </span>
              <strong>Saadaval {money(availableCents(action.credit))}</strong>
            </div>
            {error ? (
              <div className="action-error form-grid__wide" role="alert">
                {error}
              </div>
            ) : null}
            {action.type === "apply" ? (
              <>
                <Select
                  id="advance-invoice"
                  className="form-grid__wide"
                  label="Arve"
                  value={form.invoiceId}
                  onChange={(event) => selectInvoice(event.target.value)}
                  required
                >
                  <option value="">Vali arve</option>
                  {eligibleInvoices.map((invoice) => (
                    <option value={invoice.id} key={invoice.id}>
                      {invoice.num || invoice.number} · {invoice.studentName} ·
                      jääk {money(invoiceBalanceCents(invoice))}
                    </option>
                  ))}
                </Select>
                <Input
                  id="advance-apply-amount"
                  label="Kasutatav summa (€)"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({ ...form, amount: event.target.value })
                  }
                  required
                />
                <Input
                  id="advance-note"
                  label="Märkus"
                  value={form.note}
                  onChange={(event) =>
                    setForm({ ...form, note: event.target.value })
                  }
                />
              </>
            ) : (
              <>
                <Input
                  id="advance-refund-amount"
                  label="Tagastatav summa (€)"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({ ...form, amount: event.target.value })
                  }
                  required
                />
                <Input
                  id="advance-refund-date"
                  label="Tagastuse kuupäev"
                  type="date"
                  value={form.refundedAt}
                  onChange={(event) =>
                    setForm({ ...form, refundedAt: event.target.value })
                  }
                  required
                />
                <Select
                  id="advance-refund-method"
                  label="Viis"
                  value={form.method}
                  onChange={(event) =>
                    setForm({ ...form, method: event.target.value })
                  }
                >
                  <option value="bank">Pangaülekanne</option>
                  <option value="cash">Sularaha</option>
                  <option value="other">Muu</option>
                </Select>
                <Input
                  id="advance-refund-reference"
                  label="Viide"
                  value={form.reference}
                  onChange={(event) =>
                    setForm({ ...form, reference: event.target.value })
                  }
                />
                <Input
                  id="advance-refund-reason"
                  className="form-grid__wide"
                  label="Tagastuse põhjus *"
                  value={form.reason}
                  onChange={(event) =>
                    setForm({ ...form, reason: event.target.value })
                  }
                />
              </>
            )}
          </form>
        ) : null}
      </Modal>
    </Card>
  );
}
