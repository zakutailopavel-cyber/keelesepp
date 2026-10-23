const test = require("node:test");
const assert = require("node:assert/strict");
const { DEFAULT_ACCOUNTS } = require("./accounting-chart");
const { automaticEntries, entryNumber, openingEntry, reversalOf, validateEntry } = require("./accounting-core");

const balance = (entries) => entries.every((e) => e.lines.reduce((n, l) => n + l.debitCents - l.creditCents, 0) === 0);
const byAccount = (entries) => {
  const out = {};
  entries.forEach((e) => e.lines.forEach((l) => { out[l.account] = (out[l.account] || 0) + l.debitCents - l.creditCents; }));
  return out;
};

test("the chart has the accounts the automatic entries use, each with a type and a report line", () => {
  const codes = new Set(DEFAULT_ACCOUNTS.map((a) => a.code));
  ["1000", "1010", "1200", "2450", "2500", "3000", "4210", "4300", "4320", "4050", "4340", "4360", "4330", "4510", "4398", "2970", "2980"].forEach((code) => assert.ok(codes.has(code), code));
  assert.equal(codes.size, DEFAULT_ACCOUNTS.length, "codes are unique");
  DEFAULT_ACCOUNTS.forEach((a) => {
    assert.match(a.type, /^(asset|liability|equity|income|expense)$/);
    assert.ok(a.name);
  });
});

test("an invoice, its payment by bank and a cash payment become balanced entries", () => {
  const entries = automaticEntries({
    invoices: [{ id: "i1", num: "KS-2026-001", date: "2026-02-03", amountCents: 8000, payerName: "Kati Tamm", status: "Makstud" }],
    payments: [
      { id: "p1", invoiceId: "i1", invoiceNum: "KS-2026-001", paidAt: "2026-02-10", amountCents: 5000, method: "bank", status: "active" },
      { id: "p2", invoiceId: "i1", invoiceNum: "KS-2026-001", paidAt: "2026-02-11", amountCents: 3000, method: "cash", status: "active" },
    ],
  });
  assert.deepEqual(entries.map((e) => e.sourceKey), ["invoice:i1", "payment:p1", "payment:p2"]);
  assert.ok(balance(entries));
  assert.deepEqual(byAccount(entries), { 1200: 0, 3000: -8000, 1010: 5000, 1000: 3000 });
  assert.equal(entries[0].documentRef, "KS-2026-001");
  assert.match(entries[0].description, /Müügiarve KS-2026-001 · Kati Tamm/);
});

test("documents before the start date are in the opening balances; a later payment of an old invoice is booked", () => {
  const entries = automaticEntries({
    invoices: [{ id: "old", num: "KS-2025-090", date: "2025-12-20", amountCents: 6000 }],
    payments: [{ id: "p", invoiceId: "old", invoiceNum: "KS-2025-090", paidAt: "2026-01-05", amountCents: 6000, method: "bank", status: "active" }],
  });
  assert.deepEqual(entries.map((e) => e.sourceKey), ["payment:p"]);
});

test("a cancelled invoice, a credit note and a voided payment are reversed on their own dates, never removed", () => {
  const entries = automaticEntries({
    invoices: [
      { id: "i1", num: "KS-2026-010", date: "2026-03-01", amountCents: 10000, status: "Tühistatud", cancelledAt: "2026-03-05T09:00:00.000Z" },
      { id: "i2", num: "KS-2026-011", date: "2026-03-01", amountCents: 9000, status: "Ootel" },
    ],
    creditNotes: [
      { id: "c1", num: "KR-1", invoiceId: "i1", invoiceNum: "KS-2026-010", date: "2026-03-02", amountCents: 2500 },
      { id: "c2", num: "KR-2", invoiceId: "i2", invoiceNum: "KS-2026-011", date: "2026-03-04", amountCents: -3000 },
    ],
    payments: [{ id: "p1", invoiceId: "i2", paidAt: "2026-03-03", amountCents: 6000, method: "bank", status: "void", voidedAt: "2026-03-06T08:00:00.000Z", voidReason: "vale arve" }],
  });
  const keys = entries.map((e) => `${e.date} ${e.sourceKey}`);
  assert.deepEqual(keys, [
    "2026-03-01 invoice:i1", "2026-03-01 invoice:i2", "2026-03-02 credit-note:c1", "2026-03-03 payment:p1",
    "2026-03-04 credit-note:c2", "2026-03-05 invoice-cancel:i1", "2026-03-06 payment-void:p1",
  ]);
  // the cancellation reverses only what the credit note left open: 100 − 25 = 75
  assert.equal(entries.find((e) => e.sourceKey === "invoice-cancel:i1").totalCents ?? entries.find((e) => e.sourceKey === "invoice-cancel:i1").lines[0].debitCents, 7500);
  const totals = byAccount(entries);
  assert.equal(totals["3000"], -(9000 - 3000));
  assert.equal(totals["1200"], 9000 - 3000);
  assert.equal(totals["1010"], 0);
  assert.ok(balance(entries));
});

test("prepayments: unmatched bank money and overpayments go to 2500; a payment from the credit clears it; a refund pays it back", () => {
  const entries = automaticEntries({
    bankTransactions: [{ id: "banktx_1", externalId: "x1", paidAt: "2026-05-07" }],
    payerCredits: [
      { id: "banktx_1", bankTransactionId: "banktx_1", originalAmountCents: 18500, payerName: "Pere" },
      { id: "res_c1", sourcePaymentId: "p9", sourceInvoiceNum: "KS-2026-020", originalAmountCents: 1000, createdAt: "2026-05-10T10:00:00.000Z" },
    ],
    payments: [{ id: "pc", invoiceId: "i5", invoiceNum: "KS-2026-021", paidAt: "2026-05-12", amountCents: 8000, method: "credit", status: "active" }],
    refunds: [{ id: "r1", refundedAt: "2026-05-20", amountCents: 1000, method: "bank" }],
  });
  const totals = byAccount(entries);
  assert.equal(totals["2500"], -(18500 + 1000 - 8000 - 1000));
  assert.equal(totals["1010"], 18500 - 1000);
  assert.equal(totals["1200"], 1000 - 8000);
  assert.ok(balance(entries));
});

test("an expense goes to the account of its category from the payment account; a correction reverses the old one", () => {
  const entries = automaticEntries({
    expenses: [
      { id: "e1", expenseDate: "2026-04-01", category: "rent", description: "Aprilli rent", amountCents: 30000, paymentMethod: "bank", status: "corrected", correctedAt: "2026-04-03T10:00:00.000Z" },
      { id: "e2", expenseDate: "2026-04-01", category: "rent", description: "Aprilli rent", amountCents: 32000, paymentMethod: "bank", status: "active" },
      { id: "e3", expenseDate: "2026-04-02", category: "office", description: "Paber", amountCents: 1250, paymentMethod: "cash", status: "active" },
      { id: "e4", expenseDate: "2026-04-02", category: "unknown", description: "Muu", amountCents: 100, paymentMethod: "other", status: "active" },
      { id: "e5", expenseDate: "2026-04-02", category: "travel", description: "Vale", amountCents: 700, paymentMethod: "bank", status: "voided", voidedAt: "2026-04-04T10:00:00.000Z", voidReason: "topelt" },
    ],
  });
  const totals = byAccount(entries);
  assert.equal(totals["4210"], 32000);
  assert.equal(totals["4330"], 1250);
  assert.equal(totals["4398"], 100);
  assert.equal(totals["2450"], -100);
  assert.equal(totals["4510"], 0, "a voided expense is reversed");
  assert.ok(entries.some((e) => e.sourceKey === "expense-void:e5" && e.date === "2026-04-04"));
  assert.equal(totals["1010"], -32000);
  assert.equal(totals["1000"], -1250);
});

test("a manual entry must balance, use known open accounts and refer to a source document", () => {
  const accounts = [...DEFAULT_ACCOUNTS, { code: "9999", name: "Suletud", type: "expense", active: false }];
  const ok = validateEntry({ date: "2026-06-30", description: "Juuni palk", documentRef: "Palgaleht 06/2026", lines: [{ account: "4710", debitCents: 100000 }, { account: "2210", creditCents: 100000 }] }, accounts);
  assert.equal(ok.totalCents, 100000);
  assert.throws(() => validateEntry({ date: "2026-06-30", description: "x", documentRef: "d", lines: [{ account: "4710", debitCents: 100 }, { account: "2210", creditCents: 90 }] }, accounts), /ei ole võrdsed/);
  assert.throws(() => validateEntry({ date: "2026-06-30", description: "x", documentRef: "", lines: [{ account: "4710", debitCents: 100 }, { account: "2210", creditCents: 100 }] }, accounts), /algdokumendile/);
  assert.throws(() => validateEntry({ date: "2026-06-30", description: "x", documentRef: "d", lines: [{ account: "0001", debitCents: 100 }, { account: "2210", creditCents: 100 }] }, accounts), /kontoplaanis/);
  assert.throws(() => validateEntry({ date: "2026-06-30", description: "x", documentRef: "d", lines: [{ account: "9999", debitCents: 100 }, { account: "2210", creditCents: 100 }] }, accounts), /suletud/);
  assert.throws(() => validateEntry({ date: "2026-02-30", description: "x", documentRef: "d", lines: [{ account: "4710", debitCents: 100 }, { account: "2210", creditCents: 100 }] }, accounts), /kuupäev/);
});

test("a correction is a storno with a reason; a storno or an already reversed entry cannot be reversed again", () => {
  const entry = { id: "e1", number: "2026-0007", documentRef: "Arve 5", origin: "manual", totalCents: 500, lines: [{ account: "4398", debitCents: 500, creditCents: 0 }, { account: "1010", debitCents: 0, creditCents: 500 }] };
  const storno = reversalOf(entry, { date: "2026-07-01", reason: "vale konto" });
  assert.deepEqual(storno.lines.map((l) => [l.account, l.debitCents, l.creditCents]), [["4398", 0, 500], ["1010", 500, 0]]);
  assert.equal(storno.reversalOf, "e1");
  assert.match(storno.description, /Storno: kanne 2026-0007 · vale konto/);
  assert.throws(() => reversalOf(entry, { date: "2026-07-01", reason: "" }), /põhjus/);
  assert.throws(() => reversalOf({ ...entry, reversedBy: "x" }, { date: "2026-07-01", reason: "a" }), /juba tühistatud/);
  assert.throws(() => reversalOf({ ...entry, origin: "reversal" }, { date: "2026-07-01", reason: "a" }), /uuesti/);
});

test("opening balances must balance and have no income or expense accounts", () => {
  const opening = openingEntry([{ account: "1010", debitCents: 520000 }, { account: "1200", debitCents: 30000 }, { account: "2910", creditCents: 250000 }, { account: "2970", creditCents: 300000 }], DEFAULT_ACCOUNTS);
  assert.equal(opening.date, "2026-01-01");
  assert.equal(opening.totalCents, 550000);
  assert.throws(() => openingEntry([{ account: "1010", debitCents: 100 }, { account: "2970", creditCents: 90 }], DEFAULT_ACCOUNTS), /ei ole võrdsed/);
  assert.throws(() => openingEntry([{ account: "3060", creditCents: 100 }, { account: "1010", debitCents: 100 }], DEFAULT_ACCOUNTS), /algsaldot ei ole/);
});

test("entry numbers are per year and sortable", () => {
  assert.equal(entryNumber(2026, 7), "2026-0007");
  assert.equal(entryNumber(2026, 1234), "2026-1234");
});
