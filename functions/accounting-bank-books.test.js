"use strict";

// Pangapõhine raamatupidamine: what the books take once accountingSettings/bankBooks.since is set (docs/ACCOUNTING.md)
const test = require("node:test");
const assert = require("node:assert/strict");
const { automaticEntries, bankBooksMigration, bankBooksRule, exclusionScope } = require("./accounting-core");

const keys = (entries) => entries.map((e) => e.sourceKey).sort();
const SINCE = "2026-11-01";
const inv = (id, over = {}) => ({ id, num: `KS-2026-${id}`, date: "2026-11-02", amountCents: 10000, status: "Saadetud", studentId: "s1", studentName: "Laps", ...over });
const pay = (id, invoiceId, over = {}) => ({ id, invoiceId, invoiceNum: `KS-2026-${invoiceId}`, paidAt: "2026-11-05", amountCents: 10000, method: "bank", status: "active", ...over });

test("without the start date nothing changes: every document is booked as before", () => {
  const entries = automaticEntries({ invoices: [inv("1")], payments: [pay("p1", "1")] });
  assert.deepEqual(keys(entries), ["invoice:1", "payment:p1"]);
});

test("bank rule: a typed bank payment without a bank line and its invoice wait; a linked one books both", () => {
  const sources = {
    invoices: [inv("1"), inv("2"), inv("3")],
    payments: [
      pay("typed", "1"),
      pay("linked", "2", { bankStatementLineId: "lhv_1", bankDate: "2026-11-03" }),
      pay("csv", "3", { bankTransactionId: "stmt_x" }),
    ],
  };
  const entries = automaticEntries(sources, { bankBooksSince: SINCE });
  assert.deepEqual(keys(entries), ["invoice:2", "invoice:3", "payment:csv", "payment:linked"]);
  assert.equal(entries.find((e) => e.sourceKey === "payment:linked").date, "2026-11-03", "booked on the bank date, not the typed date");
  assert.equal(entries.find((e) => e.sourceKey === "invoice:2").date, "2026-11-02", "the sales entry keeps the invoice date");
  const rule = bankBooksRule(sources, { since: SINCE });
  assert.deepEqual(rule.waiting.payments.map((p) => p.id), ["typed"]);
  assert.equal(rule.waiting.invoices, 1);
});

test("bank rule: cash is booked; LinkPay and the 2026-10-15 LHV run count as bank; card and other need a line", () => {
  const sources = {
    invoices: [inv("1"), inv("2"), inv("3"), inv("4"), inv("5")],
    payments: [pay("cash", "1", { method: "cash" }), pay("lp", "2", { method: "linkpay" }), pay("run", "3", { requestId: "lhv-2026101500000001" }), pay("card", "4", { method: "card" }), pay("other", "5", { method: "other" })],
  };
  assert.deepEqual(keys(automaticEntries(sources, { bankBooksSince: SINCE })), ["invoice:1", "invoice:2", "invoice:3", "payment:cash", "payment:lp", "payment:run"]);
});

test("bank rule: documents dated before the start keep the old rule; an already booked invoice keeps its credit note and cancellation", () => {
  const sources = {
    invoices: [inv("old", { date: "2026-10-10" }), inv("booked", { status: "Tühistatud", cancelledAt: "2026-11-10" }), inv("new", { status: "Tühistatud", cancelledAt: "2026-11-10" })],
    creditNotes: [{ id: "kr1", invoiceId: "old", date: "2026-11-04", amountCents: 1000 }],
    payments: [pay("oldpay", "old", { paidAt: "2026-10-20" })],
  };
  const entries = automaticEntries(sources, { bankBooksSince: SINCE, inBooks: new Set(["invoice:booked"]) });
  assert.deepEqual(keys(entries), ["credit-note:kr1", "invoice-cancel:booked", "invoice:booked", "invoice:old", "payment:oldpay"]);
  assert.ok(!keys(entries).includes("invoice-cancel:new"), "a cancelled invoice that was never in the books stays out with its cancellation");
});

test("bank rule: voids follow their payment, advances follow their source, a payment from an advance follows the advance", () => {
  const sources = {
    invoices: [inv("1"), inv("2"), inv("3")],
    payments: [
      pay("v-linked", "1", { bankStatementLineId: "l1", status: "voided", voidedAt: "2026-11-06" }),
      pay("v-typed", "2", { status: "voided", voidedAt: "2026-11-06" }),
      pay("fromcredit", "3", { method: "credit", sourceCreditId: "c-bank" }),
      pay("overpaid", "1", { bankStatementLineId: "l2", amountCents: 15000 }),
    ],
    payerCredits: [
      { id: "c-bank", bankTransactionId: "tx", originalAmountCents: 10000, createdAt: "2026-11-02" },
      { id: "c-over", sourcePaymentId: "overpaid", bankTransactionId: "", originalAmountCents: 5000, createdAt: "2026-11-05" },
      { id: "c-typed-over", sourcePaymentId: "v-typed", originalAmountCents: 100, createdAt: "2026-11-05" },
    ],
  };
  const got = keys(automaticEntries(sources, { bankBooksSince: SINCE }));
  for (const key of ["payment:v-linked", "payment-void:v-linked", "credit:c-bank", "payment:fromcredit", "invoice:3", "payment:overpaid", "credit:c-over", "invoice:1"]) assert.ok(got.includes(key), key);
  for (const key of ["payment:v-typed", "payment-void:v-typed", "credit:c-typed-over", "invoice:2"]) assert.ok(!got.includes(key), key);
});

test("bank rule: an invoice dated in a locked period is booked on the date of its bank money", () => {
  const sources = { invoices: [inv("1", { date: "2026-11-02" })], payments: [pay("p", "1", { bankStatementLineId: "l", bankDate: "2026-12-03" })] };
  const entries = automaticEntries(sources, { bankBooksSince: SINCE, lockedThrough: "2026-11-30" });
  const sale = entries.find((e) => e.sourceKey === "invoice:1");
  assert.equal(sale.date, "2026-12-03");
  assert.match(sale.description, /arve kuupäev 02\.11\.2026, periood suletud/);
});

test("categorised bank lines are booked once: incoming D 1010 / K account, outgoing D account / K 1010", () => {
  const bankStatementLines = [
    { id: "lhv_1", state: "categorized", direction: "C", date: "2026-11-02", amountCents: 88452, counterpartyName: "TÖÖTUKASSA", explanation: "Juhendamistasu", archiveId: "A1", category: { account: "3530", label: "Toetus" } },
    { id: "lhv_2", state: "categorized", direction: "D", date: "2026-11-03", amountCents: 549, counterpartyName: "APPLE", category: { account: "4320", label: "IT", sourceKey: "bank-line:lhv_2~2" } },
    { id: "lhv_3", state: "unmatched", direction: "C", date: "2026-11-03", amountCents: 100 },
    { id: "lhv_4", state: "matched", direction: "C", date: "2026-11-03", amountCents: 100, category: { account: "3000" } },
  ];
  const entries = automaticEntries({ bankStatementLines }, { bankBooksSince: SINCE });
  assert.deepEqual(keys(entries), ["bank-line:lhv_1", "bank-line:lhv_2~2"]);
  const [inEntry, outEntry] = entries;
  assert.deepEqual(inEntry.lines.map((l) => [l.account, l.debitCents, l.creditCents]), [["1010", 88452, 0], ["3530", 0, 88452]]);
  assert.deepEqual(outEntry.lines.map((l) => [l.account, l.debitCents, l.creditCents]), [["4320", 549, 0], ["1010", 0, 549]]);
  assert.equal(inEntry.documentType, "bankLine");
  assert.equal(inEntry.documentRef, "A1");
});

test("exclusion: a payment linked to a statement line is company bank money", () => {
  const scope = exclusionScope({ id: "1" }, { payments: [pay("p", "1", { bankStatementLineId: "l" })] });
  assert.equal(scope.conflicts.length, 1);
});

test("migration overview lists receipts booked without a bank line, booked on another day, and sales without money", () => {
  const sources = {
    invoices: [inv("1", { date: "2026-10-01" }), inv("2", { date: "2026-10-01" }), inv("3", { date: "2026-10-01" })],
    payments: [pay("typed", "1", { paidAt: "2026-10-14" }), pay("late", "2", { paidAt: "2026-10-14", bankStatementLineId: "l", bankDate: "2026-07-03" })],
  };
  const entries = [
    { id: "auto_payment_typed", origin: "auto", sourceKey: "payment:typed", date: "2026-10-14", number: "2026-0100", totalCents: 10000 },
    { id: "auto_payment_late", origin: "auto", sourceKey: "payment:late", date: "2026-10-14", number: "2026-0101", totalCents: 10000 },
    { id: "auto_invoice_3", origin: "auto", sourceKey: "invoice:3", date: "2026-10-01", number: "2026-0050", totalCents: 10000 },
    { id: "auto_invoice_1", origin: "auto", sourceKey: "invoice:1", date: "2026-10-01", number: "2026-0051", totalCents: 10000 },
    { id: "gone", origin: "auto", sourceKey: "invoice:2", date: "2026-10-01", deleted: true },
  ];
  const review = bankBooksMigration(sources, entries, { from: "2026-01-01", to: "2026-10-31" });
  assert.deepEqual(review.withoutBank.map((i) => i.paymentId), ["typed"]);
  assert.deepEqual(review.dateDiffers.map((i) => [i.paymentId, i.bankDate]), [["late", "2026-07-03"]]);
  assert.deepEqual(review.salesWithoutMoney.map((i) => i.invoiceId).sort(), ["1", "3"]);
});
