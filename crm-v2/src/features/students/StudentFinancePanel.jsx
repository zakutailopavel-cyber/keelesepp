import { ArrowRight, CalendarClock, CircleCheck, Clock3, ReceiptText, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, EmptyState } from "../../components/ui/index.js";
import { invoiceBalanceCents, isInvoiceOverdue } from "./studentFinance.js";
import "./studentFinancePanel.css";

const money = (cents) =>
  new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR" }).format(
    Number(cents || 0) / 100,
  );
const dateLabel = (value) =>
  value
    ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString("et-EE")
    : "—";
const invoiceAmountCents = (invoice) =>
  Number.isFinite(Number(invoice?.amountCents))
    ? Number(invoice.amountCents)
    : Math.round(Number(invoice?.amount || 0) * 100);
const invoicePaidCents = (invoice) =>
  Number.isFinite(Number(invoice?.paidAmountCents))
    ? Number(invoice.paidAmountCents)
    : Math.round(Number(invoice?.paidAmount || 0) * 100);
const invoiceNumber = (invoice) =>
  invoice?.num || invoice?.number || invoice?.invoiceNumber || "Arve";

function statusMeta(invoice) {
  const balance = invoiceBalanceCents(invoice);
  if (balance <= 0) return { label: "Makstud", tone: "success" };
  if (isInvoiceOverdue(invoice)) return { label: "Üle tähtaja", tone: "danger" };
  if (invoicePaidCents(invoice) > 0)
    return { label: "Osaliselt makstud", tone: "info" };
  return { label: "Tasumata", tone: "neutral" };
}

export default function StudentFinancePanel({ student, invoices = [] }) {
  const sorted = [...invoices].sort((a, b) =>
    String(b.date || b.createdAt || "").localeCompare(
      String(a.date || a.createdAt || ""),
    ),
  );
  const issuedCents = sorted.reduce(
    (sum, invoice) => sum + invoiceAmountCents(invoice),
    0,
  );
  const paidCents = sorted.reduce(
    (sum, invoice) => sum + invoicePaidCents(invoice),
    0,
  );
  const balanceCents = sorted.reduce(
    (sum, invoice) => sum + invoiceBalanceCents(invoice),
    0,
  );
  const overdueCount = sorted.filter((invoice) => isInvoiceOverdue(invoice)).length;
  const nextDue = sorted
    .filter((invoice) => invoiceBalanceCents(invoice) > 0)
    .map((invoice) => String(invoice.due || invoice.dueDate || "").slice(0, 10))
    .filter(Boolean)
    .sort()[0];

  return (
    <Card className="profile-wide student-finance-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Finantsid</span>
          <h2>Arved ja maksed</h2>
        </div>
        <Link className="button button--secondary" to="/finance#tunniarvestus">
          <ReceiptText size={17} /> Loo arve
        </Link>
      </div>

      <div className="student-finance-metrics">
        <div><span><ReceiptText size={18} /> Arveid</span><strong>{money(issuedCents)}</strong><small>{sorted.length} arvet kokku</small></div>
        <div><span><CircleCheck size={18} /> Makstud</span><strong>{money(paidCents)}</strong><small>registreeritud laekumised</small></div>
        <div><span><WalletCards size={18} /> Tasumata</span><strong>{money(balanceCents)}</strong><small>{overdueCount} tähtaja ületanud</small></div>
        <div><span><CalendarClock size={18} /> Järgmine tähtaeg</span><strong>{dateLabel(nextDue)}</strong><small>{nextDue ? "avatud arvete põhjal" : "avatud arveid ei ole"}</small></div>
      </div>

      {sorted.length ? (
        <div className="student-invoice-history">
          <div className="student-invoice-history__head"><span>Arve</span><span>Kuupäev</span><span>Summa</span><span>Jääk</span><span>Staatus</span></div>
          {sorted.slice(0, 12).map((invoice) => {
            const status = statusMeta(invoice);
            return <div key={invoice.id || invoiceNumber(invoice)}><strong>{invoiceNumber(invoice)}</strong><span>{dateLabel(invoice.date || invoice.createdAt)}</span><span>{money(invoiceAmountCents(invoice))}</span><span>{money(invoiceBalanceCents(invoice))}</span><Badge tone={status.tone}>{status.label}</Badge></div>;
          })}
        </div>
      ) : (
        <EmptyState title="Õpilasel ei ole veel arveid" description="Uue arve saab luua finantside tunniarvestuse vaates." action={<Clock3 size={28} />} />
      )}

      <div className="student-finance-panel__footer">
        <Link className="button button--secondary" to="/finance">Ava kogu finantsvaade <ArrowRight size={17} /></Link>
        <small>{student?.name || "Õpilane"} finantsandmed uuendatakse koos profiiliga.</small>
      </div>
    </Card>
  );
}
