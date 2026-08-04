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

const technicalDetail = /^(invoice|lesson|snapshot|ledger|payments|lines):/i;
const readableDate = (value) => {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(value || "");
  return new Intl.DateTimeFormat("et-EE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${match[0]}T12:00:00.000Z`));
};

export function financialIssueIdentity(issue = {}) {
  const fallbackDetail =
    issue.detail && !technicalDetail.test(issue.detail) ? issue.detail : "";
  const label = issue.entityLabel || fallbackDetail || "Objekt määramata";
  const meta = [
    readableDate(issue.entityDate),
    issue.entityTime,
    issue.entityTeacher,
    Number.isFinite(Number(issue.entityAmountCents))
      ? `${(Number(issue.entityAmountCents) / 100).toLocaleString("et-EE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return { label, meta, id: issue.entityId || "" };
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
    ["Tase", "Probleem", "Objekt", "Andmed", "Tehniline ID", "Detail"],
    ...(snapshot?.issues || []).map((issue) => {
      const identity = financialIssueIdentity(issue);
      return [
        issue.severity,
        financialIssue[issue.type]?.[0] || issue.type,
        identity.label,
        identity.meta,
        identity.id,
        issue.detail,
      ];
    }),
  ];
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\n")}`;
}

export function accountantExportCsv(archive) {
  const registers = archive?.registers || {};
  const rows = [
    ["KeeleSepp raamatupidamise eksport", archive?.month || ""],
    ["Ekspordi ID", archive?.id || archive?.requestId || ""],
    ["Tõendi fingerprint", archive?.evidenceFingerprint || ""],
    ["Loodud", archive?.generatedAt || ""],
    [],
  ];
  const section = (title, headers, values) => {
    rows.push([title], headers, ...values, []);
  };
  section(
    "ARVED",
    ["ID", "Number", "Kuupäev", "Õpilane", "Summa EUR", "Olek"],
    (registers.invoices || []).map((item) => [
      item.id,
      item.number,
      item.date,
      item.studentName,
      amount(item.amountCents),
      item.status,
    ]),
  );
  section(
    "MAKSED",
    [
      "ID",
      "Arve ID",
      "Kuupäev",
      "Maksja",
      "Summa EUR",
      "Viis",
      "Olek",
      "Dokumendi ID-d",
      "Dokumendid",
      "Dokumentide teed",
    ],
    (registers.payments || []).map((item) => [
      item.id,
      item.invoiceId,
      item.paidAt,
      item.payerName,
      amount(item.amountCents),
      item.method,
      item.status,
      (item.documents || []).map((document) => document.id).join(", "),
      (item.documents || []).map((document) => document.fileName).join(", "),
      (item.documents || []).map((document) => document.storagePath).join(", "),
    ]),
  );
  section(
    "PANK",
    [
      "ID",
      "Kuupäev",
      "Maksja",
      "Viide",
      "Summa EUR",
      "Jaotatud EUR",
      "Ettemaks EUR",
    ],
    (registers.bankTransactions || []).map((item) => [
      item.id,
      item.paidAt,
      item.payerName,
      item.reference,
      amount(item.amountCents),
      amount(item.allocatedAmountCents),
      amount(item.unappliedAmountCents),
    ]),
  );
  section(
    "TUNNID",
    ["ID", "Kuupäev", "Õpilane või grupp", "Õpetaja", "Arvestus", "Arve ID"],
    (registers.lessons || []).map((item) => [
      item.id,
      item.date,
      item.studentName,
      item.teacherName,
      item.billingStatus,
      item.invoiceId,
    ]),
  );
  section(
    "KULUD",
    [
      "ID",
      "Kuupäev",
      "Kategooria",
      "Kirjeldus",
      "Summa EUR",
      "KM EUR",
      "Neto EUR",
      "Makseviis",
      "Dokumendid",
    ],
    (registers.expenses || []).map((item) => [
      item.id,
      item.expenseDate,
      item.category,
      item.description,
      amount(item.amountCents),
      amount(item.vatAmountCents),
      amount(item.netAmountCents),
      item.paymentMethod,
      (item.documents || [])
        .map((document) => `${document.fileName} [${document.id}]`)
        .join(" | "),
    ]),
  );
  section(
    "PALGAARVESTUS",
    [
      "ID",
      "Töötaja UID",
      "Nimi",
      "Algus",
      "Lõpp",
      "Minutid",
      "Olek",
      "Tunnitasu EUR",
      "Tasu EUR",
    ],
    (registers.payroll || []).map((item) => [
      item.id,
      item.staffUid,
      item.staffName,
      item.startedAt,
      item.endedAt,
      item.durationMinutes,
      item.approvalStatus,
      amount(item.hourlyRateCents),
      amount(item.payAmountCents),
    ]),
  );
  section(
    "PARANDUSED",
    [
      "ID",
      "Kuupäev",
      "Liik",
      "Kirjeldus",
      "Summa muutus EUR",
      "KM muutus EUR",
      "Lähtekuu",
      "Lähteobjekt",
      "Põhjus",
    ],
    (registers.corrections || []).map((item) => [
      item.id,
      item.effectiveDate,
      item.type,
      item.description,
      amount(item.amountDeltaCents),
      amount(item.vatDeltaCents),
      item.sourceMonth,
      item.sourceEntityId,
      item.reason,
    ]),
  );
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\n")}`;
}
