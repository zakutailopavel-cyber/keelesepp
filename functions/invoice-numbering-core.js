"use strict";

const crypto = require("crypto");

function parseInvoiceNumber(value) {
  const match = String(value || "").trim().match(/^KS-(\d{4})-(\d+)$/i);
  if (!match) return null;
  return { year: Number(match[1]), sequence: Number(match[2]) };
}

function invoiceCreatedAt(invoice = {}) {
  return String(invoice.createdAt || invoice.date || "9999-12-31");
}

function invoiceEvidence(invoice = {}) {
  const emailStatus = String(invoice.emailStatus || "").toLowerCase();
  const sent = Boolean(
    invoice.invoiceEmailSentAt
      || invoice.emailSentAt
      || emailStatus === "sent"
      || emailStatus === "queued",
  );
  const paid = Number(invoice.paidAmountCents || 0) > 0
    || Number(invoice.paidAmount || 0) > 0
    || Number(invoice.paymentCount || 0) > 0
    || String(invoice.status || "").toLowerCase() === "makstud";
  const credited = (Array.isArray(invoice.creditNoteIds) && invoice.creditNoteIds.length > 0)
    || Number(invoice.creditedAmountCents || 0) > 0
    || Number(invoice.creditedAmount || 0) > 0;
  return { sent, paid, credited };
}

function canonicalScore(invoice) {
  const evidence = invoiceEvidence(invoice);
  return (evidence.sent ? 100 : 0)
    + (evidence.paid ? 200 : 0)
    + (evidence.credited ? 300 : 0)
    + (Array.isArray(invoice.lessonIds) && invoice.lessonIds.length ? 10 : 0);
}

function compareCanonical(left, right) {
  return canonicalScore(right) - canonicalScore(left)
    || invoiceCreatedAt(left).localeCompare(invoiceCreatedAt(right))
    || String(left.id || "").localeCompare(String(right.id || ""));
}

function correctionRisk(invoice) {
  const evidence = invoiceEvidence(invoice);
  if (evidence.credited) return "credited";
  if (evidence.paid) return "paid";
  if (evidence.sent) return "sent";
  return "draft";
}

function invoiceNumberingPlan(invoices = [], { counterSeq = 0, currentYear = new Date().getUTCFullYear() } = {}) {
  const normalized = invoices.map(invoice => ({ ...invoice, id: String(invoice.id || "") }));
  const groupsByNumber = new Map();
  const usedNumbers = new Set();
  const maxByYear = new Map();

  normalized.forEach(invoice => {
    const number = String(invoice.num || "").trim();
    if (!number) return;
    usedNumbers.add(number.toUpperCase());
    if (!groupsByNumber.has(number)) groupsByNumber.set(number, []);
    groupsByNumber.get(number).push(invoice);
    const parsed = parseInvoiceNumber(number);
    if (parsed) maxByYear.set(parsed.year, Math.max(maxByYear.get(parsed.year) || 0, parsed.sequence));
  });

  const duplicateGroups = [...groupsByNumber.entries()]
    .filter(([, group]) => group.length > 1)
    .sort(([left], [right]) => left.localeCompare(right, "et"));
  const groups = [];
  const replacements = [];

  duplicateGroups.forEach(([number, group]) => {
    const sorted = [...group].sort(compareCanonical);
    const canonical = sorted[0];
    const groupReplacements = sorted.slice(1).map(invoice => {
      const parsed = parseInvoiceNumber(number);
      const invoiceYear = parsed?.year
        || Number(String(invoice.date || invoice.createdAt || "").slice(0, 4))
        || currentYear;
      let sequence = Math.max(
        maxByYear.get(invoiceYear) || 0,
        invoiceYear === currentYear ? Number(counterSeq) || 0 : 0,
      ) + 1;
      let nextNumber = `KS-${invoiceYear}-${String(sequence).padStart(3, "0")}`;
      while (usedNumbers.has(nextNumber.toUpperCase())) {
        sequence += 1;
        nextNumber = `KS-${invoiceYear}-${String(sequence).padStart(3, "0")}`;
      }
      usedNumbers.add(nextNumber.toUpperCase());
      maxByYear.set(invoiceYear, sequence);
      const evidence = invoiceEvidence(invoice);
      const replacement = {
        invoiceId: invoice.id,
        studentId: invoice.studentId || "",
        studentName: invoice.studentName || "",
        payerName: invoice.payerName || invoice.parentName || "",
        oldNumber: number,
        newNumber: nextNumber,
        risk: correctionRisk(invoice),
        requiresResend: evidence.sent,
        paid: evidence.paid,
        credited: evidence.credited,
      };
      replacements.push(replacement);
      return replacement;
    });
    groups.push({
      number,
      count: sorted.length,
      canonicalInvoiceId: canonical.id,
      canonicalStudentName: canonical.studentName || "",
      replacements: groupReplacements,
    });
  });

  const fingerprintSource = normalized
    .map(invoice => ({
      id: invoice.id,
      num: String(invoice.num || ""),
      date: String(invoice.date || ""),
      createdAt: String(invoice.createdAt || ""),
      status: String(invoice.status || ""),
      paidAmountCents: Number(invoice.paidAmountCents || 0),
      paymentCount: Number(invoice.paymentCount || 0),
      emailStatus: String(invoice.emailStatus || ""),
      invoiceEmailSentAt: String(invoice.invoiceEmailSentAt || ""),
      creditNoteIds: Array.isArray(invoice.creditNoteIds) ? invoice.creditNoteIds : [],
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const fingerprint = crypto.createHash("sha256").update(JSON.stringify({ counterSeq, invoices: fingerprintSource })).digest("hex");
  const highestAssignedSequence = replacements.reduce((highest, replacement) => {
    const parsed = parseInvoiceNumber(replacement.newNumber);
    return parsed ? Math.max(highest, parsed.sequence) : highest;
  }, Number(counterSeq) || 0);

  return {
    fingerprint,
    invoiceCount: normalized.length,
    duplicateGroupCount: groups.length,
    duplicateInvoiceCount: groups.reduce((sum, group) => sum + group.count, 0),
    replacementCount: replacements.length,
    requiresResendCount: replacements.filter(item => item.requiresResend).length,
    riskyReplacementCount: replacements.filter(item => item.risk !== "draft").length,
    counterBefore: Number(counterSeq) || 0,
    counterAfter: highestAssignedSequence,
    groups,
    replacements,
  };
}

module.exports = {
  compareCanonical,
  invoiceEvidence,
  invoiceNumberingPlan,
  parseInvoiceNumber,
};
