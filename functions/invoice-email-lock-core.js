"use strict";

// The „sending” mark on an invoice stops two people (or a double click) from e-mailing the same invoice at once.
// A send that died half-way (the function timed out or crashed) used to leave the mark for ever: the invoice then
// answered „already being sent” to every later try and counted as sent (audit 2026-11-28). The mark now expires:
// no send can still be running after the longest function timeout (540 s), so 10 minutes is safe.
const INVOICE_EMAIL_LOCK_MS = 10 * 60 * 1000;

function invoiceEmailSendLocked(invoice = {}, nowIso = new Date().toISOString()) {
  if (invoice.emailStatus !== "sending") return false;
  const startedMs = Date.parse(invoice.emailUpdatedAt || "");
  const nowMs = Date.parse(nowIso);
  // a mark without a readable time is treated as stale: it cannot be told apart from a dead send
  if (!Number.isFinite(startedMs) || !Number.isFinite(nowMs)) return false;
  return nowMs - startedMs < INVOICE_EMAIL_LOCK_MS;
}

module.exports = { INVOICE_EMAIL_LOCK_MS, invoiceEmailSendLocked };
