'use strict';

// The batch e-mails of unpaid invoices (index.js sendInvoiceBatch: the scheduled sendInvoicePaymentReminders and the
// admin's /monthly-reminders and /overdue-reminders). Oleksiy 2026-11-06 („Убрать автоматическую отправку счета по
// туннипакету!!”): a lesson-package invoice („Tunnipakett”, also the combined one) is never e-mailed by a batch — the
// administrator sends it, and any reminder for it, by hand from its own invoice row („Saada” / „Meeldetuletus”).

// a package invoice by its billing mode (lesson_tokens_v1 and any later lesson_tokens_* version), its package lessons
// or its package lines — any one marks it, so a future mode name cannot slip into the batch
function isPackageInvoice(invoice = {}) {
  if (/^lesson_tokens/.test(String(invoice.billingMode || ''))) return true;
  if (Number(invoice.tokenCredits) > 0) return true;
  return Array.isArray(invoice.lines) && invoice.lines.some((line) => line && line.type === 'lesson_tokens');
}

const excludedFromReminderBatch = (invoice = {}) => isPackageInvoice(invoice);

// invoices: [{ id, ...data }]; shouldSend(invoice) → boolean; send(invoiceId) → { status }
async function runInvoiceReminderBatch({ invoices = [], shouldSend, send }) {
  const result = { sent: 0, queued: 0, skipped: 0, skippedPackages: 0, failed: 0, errors: [] };
  for (const invoice of invoices) {
    if (excludedFromReminderBatch(invoice)) {
      result.skipped++;
      result.skippedPackages++;
      continue;
    }
    if (!shouldSend(invoice)) {
      result.skipped++;
      continue;
    }
    try {
      const delivery = await send(invoice.id);
      if (delivery && delivery.status === 'sent') result.sent++;
      else result.queued++;
    } catch (e) {
      result.failed++;
      result.errors.push({ invoiceId: invoice.id, error: e.message || String(e) });
    }
  }
  return result;
}

module.exports = { isPackageInvoice, excludedFromReminderBatch, runInvoiceReminderBatch };
