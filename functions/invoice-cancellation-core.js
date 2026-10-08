"use strict";

function invoiceCancellationError(invoice = {}, payments = [], creditNotes = []) {
  if (invoice.status === "Tühistatud") return "Invoice is already cancelled";
  if (!["manual_charge_v1", "monthly_plan_v1"].includes(invoice.billingMode)) return "Only manual and monthly invoices can be cancelled here";
  if ((invoice.lessonIds || []).length || (invoice.lines || []).some(line => line.lessonId)) return "Lesson-linked invoices need a separate correction";
  if (["sent", "queued", "sending"].includes(invoice.emailStatus) || invoice.emailSentAt || invoice.invoiceEmailSentAt || invoice.emailQueuedAt) return "Sent invoices need a separate correction";
  if (invoice.status === "Makstud" || payments.some(payment => payment.status !== "voided") || Number(invoice.paidAmountCents || 0) > 0 || Number(invoice.paidAmount || 0) > 0) return "Paid invoices cannot be cancelled here";
  if (creditNotes.length || Number(invoice.creditedAmountCents || 0) > 0) return "Credited invoices cannot be cancelled here";
  return "";
}

module.exports = { invoiceCancellationError };
