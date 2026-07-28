"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  invoiceFinancialPatch,
  normalizeAllocations,
  toCents,
} = require("./finance-core");

test("toCents accepts normal currency amounts", () => {
  assert.equal(toCents("12.34"), 1234);
  assert.equal(toCents(10), 1000);
});

test("partial payment leaves an open balance", () => {
  const patch = invoiceFinancialPatch(
    { amount: 100 },
    [{ amountCents: 2500, status: "active" }],
    "2026-07-28T10:00:00.000Z",
  );
  assert.equal(patch.paymentStatus, "partial");
  assert.equal(patch.paidAmount, 25);
  assert.equal(patch.balanceDue, 75);
  assert.equal(patch.status, "Ootel");
});

test("overpayment records credit and closes the invoice", () => {
  const patch = invoiceFinancialPatch(
    { amount: 100 },
    [{ amountCents: 12000, status: "active" }],
    "2026-07-28T10:00:00.000Z",
  );
  assert.equal(patch.paymentStatus, "overpaid");
  assert.equal(patch.overpaidAmount, 20);
  assert.equal(patch.balanceDue, 0);
  assert.equal(patch.status, "Makstud");
});

test("multiple partial payments accumulate without floating point drift", () => {
  const patch = invoiceFinancialPatch(
    { amount: 100 },
    [
      { amountCents: 3333, status: "active" },
      { amountCents: 6667, status: "active" },
    ],
    "2026-07-28T10:00:00.000Z",
  );
  assert.equal(patch.paidAmount, 100);
  assert.equal(patch.balanceDue, 0);
  assert.equal(patch.paymentCount, 2);
  assert.equal(patch.paymentStatus, "paid");
});

test("voided payments do not affect the invoice", () => {
  const patch = invoiceFinancialPatch(
    { amount: 100 },
    [{ amountCents: 10000, status: "voided" }],
    "2026-07-28T10:00:00.000Z",
  );
  assert.equal(patch.paymentStatus, "unpaid");
  assert.equal(patch.paymentCount, 0);
  assert.equal(patch.status, "Ootel");
});

test("toCents rejects invalid and over-precise values", () => {
  assert.throws(() => toCents(0), /positive/);
  assert.throws(() => toCents("12.345"), /two decimal/);
});

test("bank transaction can be split across invoices with residual credit", () => {
  const result = normalizeAllocations(120, [
    { invoiceId: "invoice-a", amount: 40 },
    { invoiceId: "invoice-b", amount: 55.5 },
  ]);
  assert.equal(result.transactionAmountCents, 12000);
  assert.equal(result.allocatedAmountCents, 9550);
  assert.equal(result.unappliedAmountCents, 2450);
});

test("allocation rejects duplicate invoices and amounts above the transaction", () => {
  assert.throws(
    () => normalizeAllocations(100, [
      { invoiceId: "invoice-a", amount: 50 },
      { invoiceId: "invoice-a", amount: 20 },
    ]),
    /more than once/,
  );
  assert.throws(
    () => normalizeAllocations(100, [{ invoiceId: "invoice-a", amount: 100.01 }]),
    /exceeds/,
  );
});
