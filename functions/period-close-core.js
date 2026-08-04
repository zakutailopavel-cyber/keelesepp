"use strict";

const crypto = require("crypto");
const {
  financialPeriodReviewSnapshot,
  invoiceAmountCents,
  paymentNetAmountCents,
} = require("./finance-core");

function monthOf(value) {
  const match = String(value || "").match(/^(\d{4}-\d{2})/);
  return match ? match[1] : "";
}

function validMonth(value) {
  const month = String(value || "");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Valid period month required");
  return month;
}

function monthEnd(month) {
  const [year, number] = validMonth(month).split("-").map(Number);
  return new Date(Date.UTC(year, number, 0, 23, 59, 59, 999)).toISOString();
}

function previousMonth(month) {
  const [year, number] = validMonth(month).split("-").map(Number);
  return new Date(Date.UTC(year, number - 2, 1)).toISOString().slice(0, 7);
}

function cents(value, fallbackValue) {
  if (value !== undefined && value !== null && Number.isFinite(Number(value))) return Math.round(Number(value));
  return Math.round((Number(fallbackValue) || 0) * 100);
}

function digest(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function billingFingerprint(snapshot) {
  return digest({
    month: snapshot.month,
    scope: snapshot.scope,
    dataVersion: snapshot.dataVersion,
    summary: snapshot.summary,
    issues: snapshot.issues,
    evidence: snapshot.evidence,
  });
}

function recordDate(record, fields) {
  for (const field of fields) {
    const value = String(record?.[field] || "");
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  }
  return "";
}

function balancesAsOf({ invoices, payments, payerCredits, creditApplications, refunds }, isoEnd) {
  const activePayments = payments.filter(payment =>
    payment?.status !== "voided"
    && recordDate(payment, ["paidAt", "createdAt"])
    && recordDate(payment, ["paidAt", "createdAt"]) <= isoEnd.slice(0, 10),
  );
  const paymentsByInvoice = new Map();
  activePayments.forEach(payment => {
    const invoiceId = String(payment.invoiceId || "");
    paymentsByInvoice.set(invoiceId, (paymentsByInvoice.get(invoiceId) || 0) + paymentNetAmountCents(payment));
  });
  const receivablesCents = invoices
    .filter(invoice => {
      const date = recordDate(invoice, ["date", "issuedAt", "createdAt"]);
      return date && date <= isoEnd.slice(0, 10);
    })
    .reduce((sum, invoice) => Math.max(0, invoiceAmountCents(invoice) - (paymentsByInvoice.get(String(invoice.id || "")) || 0)) + sum, 0);

  const appliedByCredit = new Map();
  creditApplications
    .filter(application => recordDate(application, ["createdAt", "appliedAt"]) && recordDate(application, ["createdAt", "appliedAt"]) <= isoEnd.slice(0, 10))
    .forEach(application => {
      const creditId = String(application.creditId || application.payerCreditId || "");
      const amount = cents(application.allocatedAmountCents, application.allocatedAmount || application.amount);
      appliedByCredit.set(creditId, (appliedByCredit.get(creditId) || 0) + Math.max(0, amount));
    });
  const refundedByCredit = new Map();
  refunds
    .filter(refund => recordDate(refund, ["refundedAt", "createdAt"]) && recordDate(refund, ["refundedAt", "createdAt"]) <= isoEnd.slice(0, 10))
    .forEach(refund => {
      const creditId = String(refund.creditId || refund.payerCreditId || "");
      const amount = cents(refund.amountCents, refund.amount);
      refundedByCredit.set(creditId, (refundedByCredit.get(creditId) || 0) + Math.max(0, amount));
    });
  const payerCreditsCents = payerCredits
    .filter(credit => recordDate(credit, ["createdAt"]) && recordDate(credit, ["createdAt"]) <= isoEnd.slice(0, 10))
    .reduce((sum, credit) => {
      const creditId = String(credit.id || "");
      const original = cents(credit.originalAmountCents, credit.originalAmount || credit.amount);
      return sum + Math.max(0, original - (appliedByCredit.get(creditId) || 0) - (refundedByCredit.get(creditId) || 0));
    }, 0);
  return { receivablesCents, payerCreditsCents };
}

function periodCloseProjection({
  month,
  period = {},
  invoices = [],
  payments = [],
  bankTransactions = [],
  payerCredits = [],
  lessons = [],
  paymentLineAllocations = [],
  workSessions = [],
  expenses = [],
  creditApplications = [],
  refunds = [],
  corrections = [],
  latestExport = null,
  nowIso = new Date().toISOString(),
} = {}) {
  const closeMonth = validMonth(month);
  const billing = financialPeriodReviewSnapshot({
    month: closeMonth,
    invoices,
    payments,
    bankTransactions,
    payerCredits,
    lessons,
    paymentLineAllocations,
  });
  const currentBillingFingerprint = billingFingerprint(billing);
  const periodSessions = workSessions.filter(session => monthOf(session.startedDate || session.startedAt) === closeMonth);
  const unresolvedSessions = periodSessions.filter(session =>
    session.status === "open" || !["approved", "rejected"].includes(String(session.approvalStatus || "")),
  );
  const approvedSessions = periodSessions.filter(session => session.status === "closed" && session.approvalStatus === "approved");
  const periodExpenses = expenses.filter(expense => expense.status === "active" && monthOf(expense.expenseDate) === closeMonth);
  const undocumentedExpenses = periodExpenses.filter(expense =>
    !(Number(expense.documentCount) > 0 || (Array.isArray(expense.documents) && expense.documents.length > 0)),
  );
  const periodCorrections = corrections.filter(correction => monthOf(correction.effectiveDate) === closeMonth && correction.status !== "voided");
  const reviewMatches = ["reviewed", "closed"].includes(period.status)
    && period.lastReviewFingerprint === currentBillingFingerprint;
  const periodFinished = closeMonth < monthOf(nowIso);
  const payrollPayCents = approvedSessions.reduce((sum, session) => sum + (Number(session.payAmountCents) || 0), 0);
  const expenseAmountCents = periodExpenses.reduce((sum, expense) => sum + (Number(expense.amountCents) || 0), 0);
  const expenseVatCents = periodExpenses.reduce((sum, expense) => sum + (Number(expense.vatAmountCents) || 0), 0);
  const correctionAmountCents = periodCorrections.reduce((sum, correction) => sum + (Number(correction.amountDeltaCents) || 0), 0);
  const correctionVatCents = periodCorrections.reduce((sum, correction) => sum + (Number(correction.vatDeltaCents) || 0), 0);
  const openingBalances = balancesAsOf({ invoices, payments, payerCredits, creditApplications, refunds }, monthEnd(previousMonth(closeMonth)));
  const closingBalances = balancesAsOf({ invoices, payments, payerCredits, creditApplications, refunds }, monthEnd(closeMonth));
  const evidence = {
    month: closeMonth,
    billingFingerprint: currentBillingFingerprint,
    billingSummary: billing.summary,
    payroll: periodSessions.map(session => ({
      id: String(session.id || ""),
      status: String(session.status || ""),
      approvalStatus: String(session.approvalStatus || ""),
      durationMinutes: Number(session.durationMinutes) || 0,
      payAmountCents: Number(session.payAmountCents) || 0,
    })).sort((a, b) => a.id.localeCompare(b.id)),
    expenses: periodExpenses.map(expense => ({
      id: String(expense.id || ""),
      amountCents: Number(expense.amountCents) || 0,
      vatAmountCents: Number(expense.vatAmountCents) || 0,
      documentIds: (expense.documents || []).map(document => String(document.id || "")).sort(),
    })).sort((a, b) => a.id.localeCompare(b.id)),
    paymentDocuments: payments
      .filter(payment => monthOf(recordDate(payment, ["paidAt", "createdAt"])) === closeMonth)
      .map(payment => ({
        id: String(payment.id || ""),
        documentIds: (payment.documents || []).map(document => String(document.id || "")).sort(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    corrections: periodCorrections.map(correction => ({
      id: String(correction.id || ""),
      type: String(correction.type || ""),
      amountDeltaCents: Number(correction.amountDeltaCents) || 0,
      vatDeltaCents: Number(correction.vatDeltaCents) || 0,
    })).sort((a, b) => a.id.localeCompare(b.id)),
    openingBalances,
    closingBalances,
  };
  const evidenceFingerprint = digest(evidence);
  const exportMatches = latestExport?.status === "archived"
    && latestExport?.evidenceFingerprint === evidenceFingerprint;
  const dependencyIssues = [
    ...(!periodFinished ? [{ type: "period_not_finished", count: 1 }] : []),
    ...(!reviewMatches ? [{ type: "financial_review_missing_or_stale", count: 1 }] : []),
    ...(unresolvedSessions.length ? [{ type: "payroll_unresolved", count: unresolvedSessions.length }] : []),
    ...(undocumentedExpenses.length ? [{ type: "expense_document_missing", count: undocumentedExpenses.length }] : []),
  ];
  const alreadyClosed = period.status === "closed";
  const canGenerateExport = !alreadyClosed && dependencyIssues.length === 0 && billing.canReview;
  const canClose = canGenerateExport && exportMatches;
  return {
    month: closeMonth,
    status: period.status || "open",
    alreadyClosed,
    billing,
    billingFingerprint: currentBillingFingerprint,
    evidenceFingerprint,
    canGenerateExport,
    canClose,
    exportMatches,
    dependencyIssues,
    checklist: [
      { id: "period_finished", ready: periodFinished, count: periodFinished ? 0 : 1 },
      { id: "financial_review", ready: reviewMatches && billing.canReview, count: billing.summary.blockingIssueCount || (reviewMatches ? 0 : 1) },
      { id: "payroll", ready: unresolvedSessions.length === 0, count: unresolvedSessions.length },
      { id: "expenses", ready: undocumentedExpenses.length === 0, count: undocumentedExpenses.length },
      { id: "export", ready: exportMatches, count: exportMatches ? 0 : 1 },
    ],
    summary: {
      ...billing.summary,
      payrollSessionCount: periodSessions.length,
      payrollApprovedCount: approvedSessions.length,
      payrollUnresolvedCount: unresolvedSessions.length,
      payrollPayCents,
      expenseCount: periodExpenses.length,
      undocumentedExpenseCount: undocumentedExpenses.length,
      expenseAmountCents,
      expenseVatCents,
      correctionCount: periodCorrections.length,
      correctionAmountCents,
      correctionVatCents,
      openingReceivablesCents: openingBalances.receivablesCents,
      closingReceivablesCents: closingBalances.receivablesCents,
      openingPayerCreditsCents: openingBalances.payerCreditsCents,
      closingPayerCreditsCents: closingBalances.payerCreditsCents,
    },
    evidence,
    latestExport: latestExport ? {
      id: latestExport.id || "",
      status: latestExport.status || "",
      evidenceFingerprint: latestExport.evidenceFingerprint || "",
      generatedAt: latestExport.generatedAt || "",
      generatedBy: latestExport.generatedBy || null,
    } : null,
  };
}

function accountantExportArchive({ projection, data, requestId, actor, nowIso = new Date().toISOString() }) {
  if (!projection?.canGenerateExport) throw new Error("Period dependencies are not ready for export");
  const month = projection.month;
  const byMonth = (items, fields) => items.filter(item => monthOf(fields.map(field => item?.[field]).find(Boolean)) === month);
  const registers = {
    invoices: byMonth(data.invoices || [], ["date", "issuedAt", "createdAt"]).map(invoice => ({ id: invoice.id || "", number: invoice.num || "", date: recordDate(invoice, ["date", "issuedAt", "createdAt"]), studentName: invoice.studentName || "", amountCents: invoiceAmountCents(invoice), status: invoice.status || "" })),
    payments: byMonth(data.payments || [], ["paidAt", "createdAt"]).map(payment => ({ id: payment.id || "", invoiceId: payment.invoiceId || "", paidAt: recordDate(payment, ["paidAt", "createdAt"]), payerName: payment.payerName || payment.studentName || "", amountCents: paymentNetAmountCents(payment), method: payment.method || "", status: payment.status || "", documents: (payment.documents || []).map(document => ({ id: document.id || "", fileName: document.fileName || "", storagePath: document.storagePath || "" })) })),
    bankTransactions: byMonth(data.bankTransactions || [], ["paidAt", "date", "createdAt"]).map(item => ({ id: item.id || "", paidAt: recordDate(item, ["paidAt", "date", "createdAt"]), payerName: item.payerName || "", reference: item.reference || "", amountCents: cents(item.amountCents, item.amount), allocatedAmountCents: cents(item.allocatedAmountCents, item.allocatedAmount), unappliedAmountCents: cents(item.unappliedAmountCents, item.unappliedAmount) })),
    lessons: byMonth(data.lessons || [], ["date"]).map(lesson => ({ id: lesson.id || "", date: recordDate(lesson, ["date"]), studentName: lesson.studentName || lesson.groupName || "", teacherName: lesson.teacherName || lesson.teacher || "", billingStatus: lesson.billingStatus || "", invoiceId: lesson.invoiceId || "" })),
    expenses: byMonth((data.expenses || []).filter(expense => expense.status === "active"), ["expenseDate"]).map(expense => ({ id: expense.id || "", expenseDate: expense.expenseDate || "", category: expense.category || "", description: expense.description || "", amountCents: Number(expense.amountCents) || 0, vatAmountCents: Number(expense.vatAmountCents) || 0, netAmountCents: Number(expense.netAmountCents) || 0, paymentMethod: expense.paymentMethod || "", documents: (expense.documents || []).map(document => ({ id: document.id || "", fileName: document.fileName || "", storagePath: document.storagePath || "" })) })),
    payroll: byMonth(data.workSessions || [], ["startedDate", "startedAt"]).map(session => ({ id: session.id || "", staffUid: session.staffUid || "", staffName: session.staffName || "", startedAt: session.startedAt || "", endedAt: session.endedAt || "", durationMinutes: Number(session.durationMinutes) || 0, approvalStatus: session.approvalStatus || "", hourlyRateCents: Number(session.hourlyRateCents) || 0, payAmountCents: Number(session.payAmountCents) || 0 })),
    corrections: byMonth((data.corrections || []).filter(item => item.status !== "voided"), ["effectiveDate"]).map(item => ({ id: item.id || "", effectiveDate: item.effectiveDate || "", type: item.type || "", description: item.description || "", amountDeltaCents: Number(item.amountDeltaCents) || 0, vatDeltaCents: Number(item.vatDeltaCents) || 0, reason: item.reason || "", sourceMonth: item.sourceMonth || "", sourceEntityId: item.sourceEntityId || "" })),
  };
  const rowCount = Object.values(registers).reduce((sum, rows) => sum + rows.length, 0);
  if (rowCount > 5000) throw new Error("Period export exceeds the safe archive size");
  if (Buffer.byteLength(JSON.stringify(registers), "utf8") > 800000) {
    throw new Error("Period export exceeds the safe Firestore archive size");
  }
  return {
    month,
    status: "archived",
    schemaVersion: "accountant_export_v1",
    evidenceFingerprint: projection.evidenceFingerprint,
    billingFingerprint: projection.billingFingerprint,
    summary: projection.summary,
    registers,
    rowCount,
    generatedAt: nowIso,
    generatedBy: actor,
    requestId,
  };
}

module.exports = {
  accountantExportArchive,
  balancesAsOf,
  billingFingerprint,
  monthEnd,
  periodCloseProjection,
  previousMonth,
};
