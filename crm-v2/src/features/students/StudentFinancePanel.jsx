import { ArrowRight, Clock3, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, EmptyState } from "../../components/ui/index.js";
import MetricCard, { MoneyValue } from "../../components/charts/MetricCard.jsx";
import { invoiceBalanceCents, isInvoiceOverdue } from "./studentFinance.js";
import "./studentFinancePanel.css";

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
        <Link className="button button--secondary" to="/finance#kuuarved">
          <ReceiptText size={17} /> Loo arve
        </Link>
      </div>

      {/* the same card style as Finantsid „Ülevaade” (components/charts/MetricCard), compact */}
      <div className="student-finance-metrics">
        <MetricCard compact title="Arveldatud" cents={issuedCents} caption={`${sorted.length} ${sorted.length === 1 ? "arve" : "arvet"} kokku`} />
        <MetricCard compact title="Makstud" cents={paidCents} caption="registreeritud laekumised" />
        <MetricCard compact title="Tasumata" cents={balanceCents} className={overdueCount ? "student-finance-metrics__alert" : ""} caption={overdueCount ? `${overdueCount} tähtaja ületanud` : "tähtaja ületanud arveid ei ole"} />
        <MetricCard compact title="Järgmine tähtaeg" value={dateLabel(nextDue)} caption={nextDue ? "avatud arvete põhjal" : "avatud arveid ei ole"} />
      </div>

      {sorted.length ? (
        <div className="student-invoice-history">
          <div className="student-invoice-history__head"><span>Arve</span><span>Kuupäev</span><span className="student-invoice-history__num">Summa</span><span className="student-invoice-history__num">Jääk</span><span>Staatus</span></div>
          {sorted.slice(0, 12).map((invoice) => {
            const status = statusMeta(invoice);
            return <div key={invoice.id || invoiceNumber(invoice)}><strong>{invoiceNumber(invoice)}</strong><span>{dateLabel(invoice.date || invoice.createdAt)}</span><span className="student-invoice-history__num"><MoneyValue cents={invoiceAmountCents(invoice)} /></span><span className="student-invoice-history__num"><MoneyValue cents={invoiceBalanceCents(invoice)} /></span><Badge tone={status.tone}>{status.label}</Badge></div>;
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
