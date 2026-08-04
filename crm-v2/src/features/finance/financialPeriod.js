export const financialIssue = {
  duplicate_lesson_line: [
    "Tund on arvel kaks korda",
    "Kontrolli arve tunniridu.",
  ],
  invoice_line_missing_lesson: [
    "Arverea tund puudub",
    "Kontrolli algset tunnikirjet.",
  ],
  lesson_invoice_link_mismatch: [
    "Tunni ja arve seos ei klapi",
    "Seo tund õige arvega.",
  ],
  invoice_line_total_mismatch: [
    "Arveridade summa ei klapi",
    "Kontrolli arve parandusi.",
  ],
  invoice_paid_without_payment_records: [
    "Arve on makstud ilma maksekirjeta",
    "Lisa või taasta maksekirje.",
  ],
  invoice_payment_snapshot_mismatch: [
    "Arve ja maksete summad ei klapi",
    "Kontrolli maksete ajalugu.",
  ],
  payment_exceeds_lesson_lines: [
    "Makse ületab arveridu",
    "Kontrolli ettemaksu või arve parandust.",
  ],
  lesson_in_multiple_invoices: [
    "Tund on mitmel arvel",
    "Krediteeri vale arverida.",
  ],
  direct_lesson_payment_invalid: [
    "Otsemakse andmed ei klapi",
    "Kontrolli tunni maksekirjet.",
  ],
  direct_lesson_payment_missing: [
    "Tunni otsemakse puudub",
    "Taasta maksekirje või muuda tunni arvestust.",
  ],
  package_needs_attention: [
    "Tunni arvestus vajab otsust",
    "Määra tunni maksekäsitlus.",
  ],
  absence_billing_disposition_missing: [
    "Puudumise arvestus puudub",
    "Märgi puudumine tasuliseks või tasuta.",
  ],
  legacy_invoice_without_lesson_line: [
    "Vana arve ilma täpse tunnireata",
    "Hoiatus ei blokeeri kuu kontrolli.",
  ],
  unbilled_lesson: ["Tund on arveldamata", "Loo arve või märgi tund tasuta."],
  payment_without_invoice: [
    "Makse viitab puuduvale arvele",
    "Kontrolli makse seost.",
  ],
  payment_line_allocation_invalid: [
    "Makse jaotus ei klapi",
    "Paranda makse jaotus arveridadele.",
  ],
  payment_line_allocation_incomplete: [
    "Makse on osaliselt jaotamata",
    "Jaota jääk või vormista ettemaks.",
  ],
  bank_balance_mismatch: [
    "Pangatehingu saldo ei klapi",
    "Kontrolli seotud makseid ja ettemaksu.",
  ],
  bank_unapplied: [
    "Pangamakse on jaotamata",
    "Seo makse arvega või õpilase ettemaksuga.",
  ],
};

export function previousIsoMonth(date = new Date()) {
  const previous = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1),
  );
  return previous.toISOString().slice(0, 7);
}

export function financialPeriodLabel(month) {
  const match = String(month || "").match(/^(\d{4})-(\d{2})$/);
  if (!match) return String(month || "");
  return new Intl.DateTimeFormat("et-EE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)));
}

function csvCell(value) {
  const source = String(value ?? "");
  return /[;"\n]/.test(source) ? `"${source.replace(/"/g, '""')}"` : source;
}

const amount = (cents) =>
  (Number(cents || 0) / 100).toFixed(2).replace(".", ",");

export function financialPeriodCsv(snapshot) {
  const summary = snapshot?.summary || {};
  const rows = [
    ["KeeleSepp finantsaruanne", snapshot?.month || ""],
    [],
    ["Näitaja", "Väärtus"],
    ["Tunde", summary.lessonCount || 0],
    ["Täpselt arvega seotud tunde", summary.exactLessonLinkCount || 0],
    ["Arveldamata tunde", summary.unbilledLessonCount || 0],
    ["Arveid", summary.invoiceCount || 0],
    ["Arvete summa EUR", amount(summary.issuedCents)],
    ["Makseid", summary.paymentCount || 0],
    ["Maksete summa EUR", amount(summary.paymentsCents)],
    ["Pangalaekumisi", summary.bankTransactionCount || 0],
    ["Pangalaekumised EUR", amount(summary.bankReceivedCents)],
    ["Ettemaksed EUR", amount(summary.bankAdvanceCents)],
    ["Blokeerivaid erinevusi", summary.blockingIssueCount || 0],
    [],
    ["Tase", "Probleem", "Objekt", "Detail"],
    ...(snapshot?.issues || []).map((issue) => [
      issue.severity,
      financialIssue[issue.type]?.[0] || issue.type,
      issue.entityId,
      issue.detail,
    ]),
  ];
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\n")}`;
}
