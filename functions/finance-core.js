"use strict";

function toCents(value, field = "amount") {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    const error = new Error(`${field} must be a positive number`);
    error.status = 400;
    throw error;
  }
  const cents = Math.round(number * 100);
  if (cents <= 0 || Math.abs(number * 100 - cents) > 0.000001) {
    const error = new Error(`${field} must have at most two decimal places`);
    error.status = 400;
    throw error;
  }
  return cents;
}

function centsToAmount(cents) {
  return Number((Number(cents || 0) / 100).toFixed(2));
}

function invoiceAmountCents(invoice = {}) {
  if (Number.isInteger(invoice.amountCents) && invoice.amountCents >= 0) {
    return invoice.amountCents;
  }
  return Math.max(0, Math.round((Number(invoice.amount) || 0) * 100));
}

function activePaymentTotalCents(payments = []) {
  return payments.reduce((sum, payment) => {
    if (!payment || payment.status === "voided") return sum;
    const cents = Number.isInteger(payment.amountCents)
      ? payment.amountCents
      : Math.round((Number(payment.amount) || 0) * 100);
    return sum + Math.max(0, cents);
  }, 0);
}

function invoiceFinancialPatch(invoice, payments, nowIso) {
  const amountCents = invoiceAmountCents(invoice);
  const paidAmountCents = activePaymentTotalCents(payments);
  const balanceDueCents = Math.max(0, amountCents - paidAmountCents);
  const overpaidAmountCents = Math.max(0, paidAmountCents - amountCents);
  const paymentStatus = paidAmountCents <= 0
    ? "unpaid"
    : balanceDueCents > 0
      ? "partial"
      : overpaidAmountCents > 0
        ? "overpaid"
        : "paid";

  return {
    amountCents,
    paidAmountCents,
    paidAmount: centsToAmount(paidAmountCents),
    balanceDueCents,
    balanceDue: centsToAmount(balanceDueCents),
    overpaidAmountCents,
    overpaidAmount: centsToAmount(overpaidAmountCents),
    paymentStatus,
    paymentCount: payments.filter(payment => payment && payment.status !== "voided").length,
    status: balanceDueCents === 0 && amountCents > 0 ? "Makstud" : "Ootel",
    paidAt: balanceDueCents === 0 && amountCents > 0
      ? (invoice.paidAt || nowIso.slice(0, 10))
      : null,
    parentPaymentStatus: balanceDueCents === 0 && amountCents > 0 ? "confirmed" : "pending",
    financialUpdatedAt: nowIso,
  };
}

module.exports = {
  activePaymentTotalCents,
  centsToAmount,
  invoiceAmountCents,
  invoiceFinancialPatch,
  toCents,
};
