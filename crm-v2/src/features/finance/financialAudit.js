export const auditCategoryLabels = {
  all: "Kõik tegevused",
  invoice: "Arved ja kreeditarved",
  payment: "Maksed",
  bank: "Pank ja avansid",
  period: "Perioodid",
  document: "Dokumendid",
  lesson: "Tunniarvestus",
};

const actionLabels = {
  "invoice.created_from_lessons": "Arve loodi tundidest",
  "invoice.lesson_line_credited": "Arverida krediteeriti",
  "invoice.overpayment_transferred_to_credit": "Ülemakse muudeti avansiks",
  "invoice.numbering_repaired": "Korduvad arvenumbrid parandati",
  "payment.created": "Makse registreeriti",
  "payment.voided": "Makse tühistati",
  "direct_lesson_payment.voided": "Otsemakse tühistati",
  "payment.document_attached": "Makse kinnitus lisati",
  "bank_transaction.allocated": "Pangamakse seoti arvetega",
  "bank_transaction.saved_as_advance": "Pangamakse salvestati avansina",
  "payer_credit.applied": "Avanss kasutati arvel",
  "payer_credit.refunded": "Avanss tagastati",
  "financial_period.reviewed": "Finantsperiood kontrolliti",
  "lesson.billing_disposition_changed": "Tunni arvestust muudeti",
};

export function auditActionLabel(action) {
  return actionLabels[action] || String(action || "Finantstegevus").replaceAll("_", " ").replaceAll(".", " · ");
}

export function auditCategory(action) {
  const value = String(action || "");
  if (value === "payment.document_attached") return "document";
  if (value.startsWith("invoice.")) return "invoice";
  if (value.startsWith("payment.") || value.startsWith("direct_lesson_payment.")) return "payment";
  if (value.startsWith("bank_") || value.startsWith("payer_credit.")) return "bank";
  if (value.startsWith("financial_period.")) return "period";
  if (value.startsWith("lesson.")) return "lesson";
  return "all";
}

export function filterAuditEntries(entries, { query = "", category = "all", month = "" } = {}) {
  const needle = query.trim().toLocaleLowerCase("et");
  return entries.filter((entry) => {
    const entryCategory = auditCategory(entry.action);
    const createdAt = typeof entry.createdAt === "string"
      ? entry.createdAt
      : entry.createdAt?.toDate?.().toISOString?.() || "";
    const actor = entry.actor || {};
    const haystack = [
      auditActionLabel(entry.action),
      entry.action,
      entry.invoiceNum,
      entry.studentName,
      entry.payerName,
      entry.reason,
      entry.entityId,
      actor.displayName,
      actor.name,
      actor.email,
    ].join(" ").toLocaleLowerCase("et");
    return (category === "all" || entryCategory === category)
      && (!month || createdAt.startsWith(month))
      && (!needle || haystack.includes(needle));
  });
}
