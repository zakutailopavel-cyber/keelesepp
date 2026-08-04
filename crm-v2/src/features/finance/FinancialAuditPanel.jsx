import { ClipboardList, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState, Select } from "../../components/ui/index.js";
import { displayDate } from "./finance.js";
import {
  auditActionLabel,
  auditCategory,
  auditCategoryLabels,
  filterAuditEntries,
} from "./financialAudit.js";

const money = (cents) => new Intl.NumberFormat("et-EE", {
  style: "currency",
  currency: "EUR",
}).format(Number(cents || 0) / 100);

function amountCents(entry) {
  if (Number.isInteger(entry.amountCents)) return entry.amountCents;
  if (Number.isInteger(entry.creditsDeltaCents)) return entry.creditsDeltaCents;
  if (Number.isFinite(Number(entry.amount))) return Math.round(Number(entry.amount) * 100);
  return null;
}

function actorName(entry) {
  const actor = entry.actor || {};
  return actor.displayName || actor.name || actor.email || "Süsteem";
}

function tone(category) {
  if (category === "payment" || category === "bank") return "success";
  if (category === "invoice" || category === "document") return "info";
  return "neutral";
}

export default function FinancialAuditPanel({ entries = [] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [month, setMonth] = useState("");
  const [expanded, setExpanded] = useState(false);
  const matches = useMemo(
    () => filterAuditEntries(entries, { query, category, month }),
    [category, entries, month, query],
  );
  const filtered = matches.slice(0, expanded ? 100 : 12);

  return (
    <Card className="financial-audit-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Audit</span>
          <h2>Finantstegevuste ajalugu</h2>
          <p>Muutmatu logi arvetest, maksetest, parandustest ja dokumentidest.</p>
        </div>
        <Badge tone="neutral">{entries.length} kannet</Badge>
      </div>
      <div className="financial-audit-filters">
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label="Otsi auditist"
            placeholder="Otsi arve, õpilase või põhjuse järgi"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Select aria-label="Auditi tegevus" value={category} onChange={(event) => setCategory(event.target.value)}>
          {Object.entries(auditCategoryLabels).map(([value, label]) => (
            <option value={value} key={value}>{label}</option>
          ))}
        </Select>
        <input
          className="audit-month-input"
          aria-label="Auditi kuu"
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        />
      </div>
      {filtered.length ? (
        <div className="financial-audit-list">
          {filtered.map((entry) => {
            const categoryValue = auditCategory(entry.action);
            const cents = amountCents(entry);
            return (
              <article key={entry.id}>
                <i><ClipboardList size={18} /></i>
                <div>
                  <strong>{auditActionLabel(entry.action)}</strong>
                  <span>
                    {[entry.invoiceNum, entry.studentName || entry.payerName].filter(Boolean).join(" · ") || entry.entityId || "Finantskanne"}
                  </span>
                  {entry.reason ? <small>{entry.reason}</small> : null}
                </div>
                <div className="financial-audit-list__meta">
                  <Badge tone={tone(categoryValue)}>{auditCategoryLabels[categoryValue] || "Muu"}</Badge>
                  {cents !== null ? <strong>{money(cents)}</strong> : null}
                  <span>{displayDate(entry.createdAt)} · {actorName(entry)}</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Sobivaid auditikandeid ei leitud" description="Muuda otsingut, tegevust või kuud." />
      )}
      {matches.length > 12 ? (
        <div className="financial-audit-more">
          <span>
            {expanded
              ? `Kuvatakse ${Math.min(matches.length, 100)} kannet.`
              : `Kuvatakse 12 kannet ${matches.length}-st.`}
          </span>
          <Button variant="secondary" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Näita vähem" : "Näita rohkem"}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
