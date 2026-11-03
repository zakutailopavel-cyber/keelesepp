"use strict";

// Guards for a payment typed in by a person (financeApi /payments, October 2026 accounting audit):
// - the same payment (invoice, amount, date, method) entered again within DUPLICATE_WINDOW_MS is refused as a
//   duplicate (KS-117 got two identical 170 € payments from two users 3 minutes apart);
// - a payment larger than the invoice's open balance is refused unless the request says allowOverpayment: true;
//   the excess then stays on the invoice as an overpayment and is moved to the payer's advance with the existing
//   /invoices/resolve-overpayment (transferInvoiceOverpayment → payerCredits).
// The bank import, LinkPay and the cash box allocation do not use these guards: their money is already real and each
// is idempotent by its own source id.

const { activePaymentTotalCents, centsToAmount, invoiceAmountCents } = require("./finance-core");

const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

const isActive = (payment) => payment && payment.status !== "voided" && payment.status !== "void";
const grossCents = (payment = {}) => (Number.isInteger(payment.amountCents)
  ? payment.amountCents
  : Math.round((Number(payment.amount) || 0) * 100));
const euro = (cents) => `${centsToAmount(cents).toFixed(2).replace(".", ",")} €`;

function guardError(status, code, message, details = {}) {
  const error = new Error(message);
  error.status = status;
  error.details = { code, ...details };
  return error;
}

// the active payment on the invoice that the new one repeats (same amount, date, method, created within the window)
function findDuplicatePayment({ payments = [], amountCents, paidAt, method, nowIso }) {
  const now = Date.parse(nowIso);
  return payments.find((payment) => {
    if (!isActive(payment)) return false;
    if (grossCents(payment) !== amountCents) return false;
    if (String(payment.paidAt || "") !== String(paidAt || "")) return false;
    if (String(payment.method || "bank") !== String(method || "bank")) return false;
    const created = Date.parse(payment.createdAt || "");
    if (!Number.isFinite(created) || !Number.isFinite(now)) return false;
    return now - created >= 0 && now - created <= DUPLICATE_WINDOW_MS;
  }) || null;
}

// throws a 409 with details.code „duplicate_payment” or „overpayment”; returns the open balance otherwise
function assertPaymentAllowed({ invoice = {}, payments = [], amountCents, paidAt, method, nowIso, allowOverpayment = false }) {
  const duplicate = findDuplicatePayment({ payments, amountCents, paidAt, method, nowIso });
  if (duplicate) {
    const minutes = Math.max(1, Math.round((Date.parse(nowIso) - Date.parse(duplicate.createdAt)) / 60000));
    const who = duplicate.createdBy?.name || duplicate.createdBy?.email || "";
    throw guardError(409, "duplicate_payment",
      `Sama makse (${euro(amountCents)}, ${paidAt}) on sellele arvele juba registreeritud ${minutes} min tagasi${who ? ` (${who})` : ""}. Topeltmakset ei salvestatud — kontrolli arve makseid.`,
      { paymentId: duplicate.id || "", createdAt: duplicate.createdAt || "" });
  }
  const balanceCents = Math.max(0, invoiceAmountCents(invoice) - activePaymentTotalCents(payments));
  if (amountCents > balanceCents && allowOverpayment !== true) {
    const excessCents = amountCents - balanceCents;
    throw guardError(409, "overpayment",
      balanceCents === 0
        ? "Arve on juba makstud. Kas registreerida ülemakse ettemaksuna?"
        : `Makse on arve jäägist (${euro(balanceCents)}) suurem ${euro(excessCents)} võrra. Kas registreerida ülemakse ettemaksuna?`,
      { balanceCents, amountCents, excessCents, fullyPaid: balanceCents === 0 });
  }
  return { balanceCents };
}

module.exports = { DUPLICATE_WINDOW_MS, assertPaymentAllowed, findDuplicatePayment };
