"use strict";

// Corrections of an issued invoice (owner decisions 2026-10-23). An issued invoice is never overwritten
// (Raamatupidamise seadus § 7 and § 10, docs/ACCOUNTING.md):
// - „Krediteeri kogu arve”: one credit note for the whole amount that is not yet credited;
// - „Paranda summa või maksja”: the same full credit note + a new invoice with the corrected amount and/or payer
//   (correctionOf on the new invoice, correctedBy on the old one).
// Pure functions; the routes are /invoices/credit-full and /invoices/correct in functions/index.js (financeApi, admins).
// The bookkeeping entries follow from the documents (accounting-core.js automaticEntries): the credit note books
// 3060 → 1200, the new invoice 1200 → 3060.

const { activePaymentTotalCents, centsToAmount, invoiceOriginalAmountCents } = require("./finance-core");

const MIN_REASON = 10;

function correctionError(message, status = 409) {
  return Object.assign(new Error(message), { status });
}

function cleanReason(value) {
  const reason = String(value || "").replace(/\s+/g, " ").trim().slice(0, 500);
  if (reason.length < MIN_REASON) throw correctionError(`Põhjus peab olema vähemalt ${MIN_REASON} märki.`, 400);
  return reason;
}

const lineCents = (line = {}) => Number(line.amountCents) || Math.round((Number(line.amount) || 0) * 100);

// what is still not credited: the original amount minus earlier credit notes (lesson lines)
function openCreditCents(invoice = {}) {
  return Math.max(0, invoiceOriginalAmountCents(invoice) - (Number(invoice.creditedAmountCents) || 0));
}

// lesson lines whose lessons are still invoiced by this invoice (not credited one by one before)
function activeLessonLines(invoice = {}) {
  const corrected = new Set(invoice.correctedLessonIds || []);
  return (Array.isArray(invoice.lines) ? invoice.lines : []).filter((line) => line && line.lessonId && !corrected.has(line.lessonId));
}

// the lessons this invoice still bills: its lesson lines, or — on an old invoice without lesson lines — its lessonIds
// (legacy invoices from before the lesson-line model, e.g. KS-2026-004 / -030 / -049 / -050)
function activeLessonIds(invoice = {}) {
  const corrected = new Set(invoice.correctedLessonIds || []);
  const fromLines = activeLessonLines(invoice).map((line) => String(line.lessonId));
  if (fromLines.length || (invoice.lines || []).some((line) => line?.lessonId)) return fromLines;
  return [...new Set((Array.isArray(invoice.lessonIds) ? invoice.lessonIds : []).map(String).filter((id) => id && !corrected.has(id)))];
}

// why the whole invoice cannot be credited ('' = it can)
function fullCreditError(invoice, payments = []) {
  if (!invoice) return "Arvet ei leitud.";
  if (invoice.status === "Tühistatud") return "Tühistatud arvet ei saa krediteerida.";
  if (invoice.correctedBy?.invoiceId) return "See arve on juba parandatud uue arvega.";
  if (invoice.status === "Krediteeritud" || invoice.correctionStatus === "fully_credited" || openCreditCents(invoice) <= 0) {
    return "Arve on juba täielikult krediteeritud.";
  }
  // money already received stays tied to the invoice: void or refund it first (otherwise the credit makes an overpayment)
  if (invoice.status === "Makstud" || activePaymentTotalCents(payments) > 0 || Number(invoice.paidAmountCents || 0) > 0) {
    return "Arvel on laekumisi. Tühista või tagasta makse enne krediteerimist.";
  }
  // the same rule as the cancellation: the lessons of a credited package are on the card already
  if (invoice.billingMode === "lesson_tokens_v1" && invoice.tokenStatus === "credited") {
    return "Selle paketi tunnid on juba õpilase kaardil. Paranda enne paketti.";
  }
  return "";
}

const PAYER_FIELDS = ["payerName", "payerEmail", "payerRegCode", "payerAddress"];

// the payer as the invoice shows it (old invoices keep it in the parent or student fields)
function invoicePayer(invoice = {}) {
  return {
    payerName: String(invoice.payerName || invoice.parentName || invoice.studentName || "").trim(),
    payerEmail: String(invoice.payerEmail || invoice.parentEmail || "").trim(),
    payerRegCode: String(invoice.payerRegCode || "").trim(),
    payerAddress: String(invoice.payerAddress || invoice.parentAddress || "").trim(),
  };
}

// the corrected amount (euros or cents) and/or payer; at least one must differ from the invoice
function correctionInput(invoice = {}, values = {}) {
  const reason = cleanReason(values.reason);
  // the amount the family owes now: the original minus lesson lines credited one by one before
  const currentCents = openCreditCents(invoice);
  let amountCents = currentCents;
  if (values.amountCents !== undefined && values.amountCents !== null && values.amountCents !== "") {
    amountCents = Number(values.amountCents);
  } else if (values.amount !== undefined && values.amount !== null && values.amount !== "") {
    amountCents = Math.round(Number(String(values.amount).replace(",", ".")) * 100);
  }
  if (!Number.isInteger(amountCents) || amountCents <= 0) throw correctionError("Uus summa peab olema positiivne.", 400);
  if (amountCents > 10000000) throw correctionError("Uus summa on liiga suur.", 400);
  const payerIn = values.payer && typeof values.payer === "object" ? values.payer : {};
  const payer = {};
  const currentPayer = invoicePayer(invoice);
  PAYER_FIELDS.forEach((field) => {
    const current = currentPayer[field];
    const next = payerIn[field] === undefined ? current : String(payerIn[field] || "").replace(/\s+/g, " ").trim().slice(0, field === "payerAddress" ? 300 : 160);
    payer[field] = next;
  });
  if (!payer.payerName) throw correctionError("Maksja nimi on kohustuslik.", 400);
  if (payer.payerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payer.payerEmail)) throw correctionError("Maksja e-post on vigane.", 400);
  const payerChanged = PAYER_FIELDS.some((field) => payer[field] !== currentPayer[field]);
  const amountChanged = amountCents !== currentCents;
  if (!payerChanged && !amountChanged) throw correctionError("Muuda summat või maksjat — praegu on kõik sama.", 400);
  // a lesson line's price comes from the tariff: such an invoice gets a per-line credit instead
  if (amountChanged && ((invoice.lines || []).some((line) => line?.lessonId) || activeLessonIds(invoice).length)) {
    throw correctionError("Tunniridadega arve summat ei parandata siin. Krediteeri vale tunnirida eraldi.");
  }
  const due = String(values.due || "").trim();
  if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) throw correctionError("Maksetähtaeg on vigane.", 400);
  return { reason, amountCents, amountChanged, payer, payerChanged, due };
}

// the credit note for the whole open amount (the lines of the invoice with minus signs)
function fullCreditNoteRecord({ invoice, invoiceId, creditNoteNum, todayIso, nowIso, reason, actor, requestId, signature, issuer, kind = "full_credit" }) {
  const amountCents = openCreditCents(invoice);
  const corrected = new Set(invoice.correctedLessonIds || []);
  // the credited lines of the invoice for the record; the document shows one line for the whole amount
  // (credit-note-document.js prints the first line)
  const creditedLines = (Array.isArray(invoice.lines) ? invoice.lines : [])
    .filter((line) => line && !(line.lessonId && corrected.has(line.lessonId)))
    .map((line) => ({ ...line, amountCents: -lineCents(line), amount: -centsToAmount(lineCents(line)) }));
  const creditLines = [{
    type: "full_credit",
    description: `Arve ${invoice.num || invoiceId} krediteerimine täies ulatuses`,
    date: todayIso,
    amountCents: -amountCents,
    amount: -centsToAmount(amountCents),
  }];
  return {
    num: creditNoteNum,
    status: "issued",
    kind,
    date: todayIso,
    invoiceId,
    invoiceNum: invoice.num || "",
    studentId: invoice.studentId || "",
    studentName: invoice.studentName || "",
    ...(Array.isArray(invoice.studentIds) ? { studentIds: invoice.studentIds } : {}),
    payerName: invoice.payerName || invoice.parentName || invoice.studentName || "",
    payerEmail: invoice.payerEmail || invoice.parentEmail || "",
    payerRegCode: invoice.payerRegCode || "",
    payerAddress: invoice.payerAddress || invoice.parentAddress || "",
    issuer,
    lessonIds: activeLessonIds(invoice),
    amountCents,
    amount: centsToAmount(amountCents),
    lines: creditLines,
    creditedLines,
    originalInvoiceAmountCents: invoiceOriginalAmountCents(invoice),
    originalInvoiceAmount: Number(invoice.amount) || centsToAmount(invoiceOriginalAmountCents(invoice)),
    effectiveInvoiceAmountCents: 0,
    effectiveInvoiceAmount: 0,
    reason,
    signature,
    createdAt: nowIso,
    createdBy: actor,
    requestId,
  };
}

// the old invoice after its full credit: amounts stay, the effective amount and the balance are zero
function invoiceAfterFullCredit(invoice, { creditNoteId, creditNoteNum, amountCents, reason, nowIso }) {
  const originalCents = invoiceOriginalAmountCents(invoice);
  const lessonIds = activeLessonIds(invoice);
  return {
    amountCents: originalCents,
    creditedAmountCents: originalCents,
    creditedAmount: centsToAmount(originalCents),
    effectiveAmountCents: 0,
    effectiveAmount: 0,
    balanceDueCents: 0,
    balanceDue: 0,
    overpaidAmountCents: 0,
    overpaidAmount: 0,
    status: "Krediteeritud",
    paymentStatus: "credited",
    parentPaymentStatus: "credited",
    correctionStatus: "fully_credited",
    correctedLessonIds: [...(invoice.correctedLessonIds || []), ...lessonIds],
    fullCreditNoteId: creditNoteId,
    fullyCreditedAt: nowIso,
    ...(invoice.billingMode === "lesson_tokens_v1" && invoice.tokenStatus !== "credited" ? { tokenStatus: "voided" } : {}),
    correction: { creditNoteId, creditNoteNum, amountCents, amount: centsToAmount(amountCents), reason, createdAt: nowIso, kind: "full_credit" },
    financialUpdatedAt: nowIso,
  };
}

// fields of the old invoice that never move to its replacement (state, history, delivery, numbering)
const NOT_COPIED = new Set([
  "num", "date", "due", "dueDate", "status", "paymentReference", "createdAt", "createdBy", "requestId", "creationSignature",
  "paidAmountCents", "paidAmount", "balanceDueCents", "balanceDue", "overpaidAmountCents", "overpaidAmount", "paymentStatus",
  "paymentCount", "paidAt", "parentPaymentStatus", "parentPaymentMethod", "parentPaymentSubmittedAt",
  "creditedAmountCents", "creditedAmount", "effectiveAmountCents", "effectiveAmount", "correctedLessonIds", "creditNoteIds",
  "corrections", "correction", "correctionStatus", "fullCreditNoteId", "fullyCreditedAt", "correctedBy", "correctionOf",
  "emailStatus", "emailRecipient", "emailSentAt", "emailLastType", "emailQueuedAt", "invoiceEmailSentAt", "lastReminderSentAt",
  "reminderCount", "due10ReminderMonth", "cancelledAt", "cancelledBy", "cancellationReason", "cancellationRequestId",
  "cancelledAfterSending", "dueDateHistory", "tokenStatus", "tokenPackageId", "tokensCreditedAt", "tokensCreditedBy",
  "financialUpdatedAt", "updatedAt", "pdfPath", "pdfUrl", "documentPath", "documentUrl",
]);

// the replacement invoice: the same content (lines, subject, student) with the corrected amount and/or payer
function correctedInvoiceRecord({ invoice, invoiceId, input, invoiceNum, todayIso, nowIso, creditNoteId, creditNoteNum, actor, requestId, signature }) {
  const base = Object.fromEntries(Object.entries(invoice).filter(([key]) => !NOT_COPIED.has(key)));
  const currentCents = openCreditCents(invoice);
  const corrected = new Set(invoice.correctedLessonIds || []);
  // lesson lines credited one by one before stay on the old invoice only
  const lines = (Array.isArray(invoice.lines) ? invoice.lines : [])
    .filter((line) => line && !(line.lessonId && corrected.has(line.lessonId)))
    .map((line) => ({ ...line }));
  if (input.amountChanged) {
    const difference = input.amountCents - currentCents;
    lines.push({
      type: "amount_correction",
      description: `Summa parandus (arve ${invoice.num || invoiceId} asemel)`,
      amountCents: difference,
      amount: centsToAmount(difference),
    });
  }
  const oldDue = String(invoice.due || invoice.dueDate || "");
  const due = input.due || (oldDue >= todayIso ? oldDue : todayIso);
  return {
    ...base,
    ...input.payer,
    payerEmailLower: input.payer.payerEmail.toLowerCase(),
    num: invoiceNum,
    status: "Ootel",
    date: todayIso,
    due,
    paymentReference: invoiceNum,
    amountCents: input.amountCents,
    amount: centsToAmount(input.amountCents),
    lines,
    ...(Array.isArray(invoice.lessonIds) ? { lessonIds: activeLessonIds(invoice) } : {}),
    paidAmountCents: 0,
    paidAmount: 0,
    balanceDueCents: input.amountCents,
    balanceDue: centsToAmount(input.amountCents),
    overpaidAmountCents: 0,
    overpaidAmount: 0,
    paymentStatus: "unpaid",
    paymentCount: 0,
    parentPaymentStatus: "pending",
    emailStatus: "",
    emailRecipient: "",
    emailSentAt: "",
    reminderCount: 0,
    ...(invoice.billingMode === "lesson_tokens_v1" ? { tokenStatus: "pending" } : {}),
    correctionOf: {
      invoiceId,
      invoiceNum: invoice.num || "",
      creditNoteId,
      creditNoteNum,
      amountChanged: input.amountChanged,
      payerChanged: input.payerChanged,
      previousAmountCents: currentCents,
      previousPayerName: invoice.payerName || "",
      reason: input.reason,
    },
    creationSignature: signature,
    createdAt: nowIso,
    createdBy: actor,
    requestId,
  };
}

module.exports = {
  MIN_REASON,
  activeLessonIds,
  activeLessonLines,
  cleanReason,
  correctedInvoiceRecord,
  correctionInput,
  fullCreditError,
  fullCreditNoteRecord,
  invoicePayer,
  invoiceAfterFullCredit,
  openCreditCents,
};
