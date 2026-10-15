"use strict";

const wasSent = (invoice = {}) => ["sent", "queued", "sending"].includes(invoice.emailStatus) || Boolean(invoice.emailSentAt || invoice.invoiceEmailSentAt || invoice.emailQueuedAt);

// `afterSending`: the administrator confirmed cancelling an invoice that was already e-mailed (a wrong address or a
// wrong invoice, owner 2026-10-15); the number and the reason stay in the history
function invoiceCancellationError(invoice = {}, payments = [], creditNotes = [], { afterSending = false } = {}) {
  if (invoice.status === "Tühistatud") return "Invoice is already cancelled";
  if (!["manual_charge_v1", "monthly_plan_v1", "lesson_tokens_v1"].includes(invoice.billingMode)) return "Only manual, monthly and lesson package invoices can be cancelled here";
  // the lessons of a credited package are on the card already: correct the package instead
  if (invoice.billingMode === "lesson_tokens_v1" && invoice.tokenStatus === "credited") return "The lessons of this invoice are already on the student's card";
  if ((invoice.lessonIds || []).length || (invoice.lines || []).some(line => line.lessonId)) return "Lesson-linked invoices need a separate correction";
  if (wasSent(invoice) && !afterSending) return "Sent invoices need a confirmation that the recipient is told (afterSending)";
  if (invoice.status === "Makstud" || payments.some(payment => payment.status !== "voided") || Number(invoice.paidAmountCents || 0) > 0 || Number(invoice.paidAmount || 0) > 0) return "Paid invoices cannot be cancelled here";
  if (creditNotes.length || Number(invoice.creditedAmountCents || 0) > 0) return "Credited invoices cannot be cancelled here";
  return "";
}

module.exports = { invoiceCancellationError, wasSent };
