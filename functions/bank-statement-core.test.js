"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const core = require("./bank-statement-core");

// anonymised fixtures in the LHV export layouts (Russian with commas, Estonian with semicolons); no real names, accounts
// or personal codes
const ru = fs.readFileSync(path.join(__dirname, "test-fixtures/bank/lhv-statement-ru.csv"), "utf8");
const et = fs.readFileSync(path.join(__dirname, "test-fixtures/bank/lhv-statement-et.csv"), "utf8");

test("parseStatement reads the Russian LHV export: every line in and out, ids from the bank reference", () => {
  const parsed = core.parseStatement(ru);
  assert.deepEqual(parsed.errors, []);
  assert.deepEqual(parsed.accountIbans, ["EE917700771011885682"]);
  assert.equal(parsed.lines.length, 14);
  assert.equal(parsed.lines.filter((l) => l.direction === "C").length, 8);
  assert.equal(parsed.lines.filter((l) => l.direction === "D").length, 6);
  const first = parsed.lines[0];
  assert.equal(first.id, "lhv_1000000001");
  assert.equal(first.date, "2026-09-30");
  assert.equal(first.amountCents, 5000);
  assert.equal(first.direction, "D");
  assert.equal(first.archiveId, "2026093000000001");
  const card = parsed.lines.find((l) => l.counterpartyName === "APPLE.COM/BILL");
  assert.equal(card.archiveId, "", "card payments have no archive code");
  assert.equal(card.id, "lhv_1000000003");
  const tootukassa = parsed.lines.find((l) => /TÖÖTUKASSA/.test(l.counterpartyName));
  assert.equal(tootukassa.amountCents, 88452);
  assert.equal(tootukassa.counterpartyRegCode, "70000001", "a company's registry code is kept");
  const person = parsed.lines.find((l) => l.counterpartyName === "MARI MAKSJA");
  assert.equal(person.counterpartyRegCode, "", "a personal code (11 digits) is never kept");
  assert.equal(person.counterpartyAccount, "EE000000000000000201");
});

test("parseStatement reads the Estonian export: semicolons, d.m.y dates, decimal commas, quotes", () => {
  const parsed = core.parseStatement(et);
  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.lines.length, 2);
  assert.equal(parsed.lines[0].date, "2026-10-07");
  assert.equal(parsed.lines[0].id, "lhv_1000000008", "the same line as in the Russian export → the same id");
  assert.equal(parsed.lines[0].counterpartyAccount, "EE000000000000000701");
  const out = parsed.lines[1];
  assert.equal(out.direction, "D");
  assert.equal(out.amountCents, 123456);
  assert.equal(out.counterpartyName, "Näide; Firma OÜ");
  assert.equal(out.explanation, 'Arve "nr" 5');
  assert.equal(out.counterpartyRegCode, "12345678");
});

test("parseStatement: English headers, no bank reference → a stable hash id; missing columns → an error", () => {
  const csv = "Customer account no,Date,Beneficiary's name,Debit/Credit (D/C),Amount,Description,Currency\nEE917700771011885682,2026-10-05,A B,C,10.00,KS-2026-001,EUR\n";
  const a = core.parseStatement(csv);
  const b = core.parseStatement(csv);
  assert.equal(a.lines.length, 1);
  assert.match(a.lines[0].id, /^lhvh_[0-9a-f]{32}$/);
  assert.equal(a.lines[0].id, b.lines[0].id);
  assert.match(core.parseStatement("a,b\n1,2\n").errors[0], /kuupäeva ja summa/);
});

test("invoiceNumbersIn tolerates KC, spaces, „Arve”, prefixes and short numbers", () => {
  assert.deepEqual(core.invoiceNumbersIn("Timur V , Arve KS -2026-083"), ["KS-2026-083"]);
  assert.deepEqual(core.invoiceNumbersIn("KC- 2026-088"), ["KS-2026-088"]);
  assert.deepEqual(core.invoiceNumbersIn("Makse selgitus KS-2026-097"), ["KS-2026-097"]);
  assert.deepEqual(core.invoiceNumbersIn("ks 2026-85 ja KS-2026-109"), ["KS-2026-085", "KS-2026-109"]);
  assert.deepEqual(core.invoiceNumbersIn("Arve nr. 26031"), []);
  assert.deepEqual(core.invoiceNumbersIn("JT-26-21525 7-6.2/26/0856"), []);
  assert.deepEqual(core.invoiceNumbersIn("WORKS-2026-001"), [], "KS inside a word is not an invoice");
  assert.equal(core.normalizedInvoiceNum("KS-2026-85"), "KS-2026-085");
});

const line = (over = {}) => ({ id: "lhv_1", direction: "C", date: "2026-10-07", amountCents: 15000, currency: "EUR", counterpartyName: "JULIA NÄIDIS", counterpartyAccount: "EE000000000000000701", explanation: "", referenceNumber: "", archiveId: "A1", transactionRef: "1", ...over });
const invoice = (over = {}) => ({ id: "inv1", num: "KS-2026-085", studentId: "s1", studentName: "Laps", payerName: "Julia Näidis", amountCents: 15000, balanceDueCents: 15000, status: "Saadetud", date: "2026-10-01", ...over });

test("matchLine: the invoice number in the explanation → a sure new payment on that invoice", () => {
  const match = core.matchLine(line({ explanation: "KS-2026-085" }), { invoices: [invoice()] });
  assert.equal(match.kind, "allocate");
  assert.equal(match.confidence, "sure");
  assert.deepEqual(match.allocations, [{ invoiceId: "inv1", invoiceNum: "KS-2026-085", studentId: "s1", amountCents: 15000 }]);
});

test("matchLine: a payment typed by hand on the named invoice is linked (it gets the bank date), not paid twice", () => {
  const typed = { id: "p1", invoiceId: "inv1", amountCents: 15000, method: "bank", status: "active", paidAt: "2026-10-14" };
  const match = core.matchLine(line({ explanation: "Arve KS -2026-085" }), { invoices: [invoice({ balanceDueCents: 0 })], payments: [typed] });
  assert.equal(match.kind, "payments");
  assert.equal(match.confidence, "sure");
  assert.deepEqual(match.paymentIds, ["p1"]);
  // already linked to another line → not offered again
  const taken = core.matchLine(line({ explanation: "KS-2026-085" }), { invoices: [invoice({ balanceDueCents: 0 })], payments: [typed], takenPaymentIds: new Set(["p1"]) });
  assert.equal(taken.kind, "allocate");
  assert.equal(taken.confidence, "likely", "the invoice is paid: more money than open → a person decides");
  assert.equal(taken.creditStudentId, "s1");
});

test("matchLine: the bank line already recorded by the earlier CSV flow or the LHV run → linked, nothing new", () => {
  assert.deepEqual(core.matchLine(line({ explanation: "KS-2026-085" }), { invoices: [invoice()], bankTransactions: [{ id: "tx1", externalId: "A1" }] }), { kind: "bankTransaction", confidence: "sure", reason: "pangarida on CRM-is juba seotud", bankTransactionId: "tx1" });
  // the earlier flow without the archive code (Russian export): same day, amount and payer
  const noArchive = core.matchLine(line(), { bankTransactions: [{ id: "tx2", externalId: "", paidAt: "2026-10-07", amountCents: 15000, payerName: "Näidis Julia" }] });
  assert.equal(noArchive.bankTransactionId, "tx2");
  assert.equal(core.matchLine(line(), { bankTransactions: [{ id: "tx3", externalId: "", statementLineId: "other", paidAt: "2026-10-07", amountCents: 15000, payerName: "Näidis Julia" }] }).kind, "none");
  const legacy = core.matchLine(line(), { payments: [{ id: "p9", requestId: "lhv-A1", status: "active", amountCents: 15000 }] });
  assert.equal(legacy.kind, "payments");
  assert.deepEqual(legacy.paymentIds, ["p9"]);
});

test("matchLine: name + amount + open balance, the payer's memory and LinkPay are suggestions (likely)", () => {
  const byName = core.matchLine(line({ explanation: "oktoober" }), { invoices: [invoice()] });
  assert.equal(byName.kind, "allocate");
  assert.equal(byName.confidence, "likely");
  const memory = core.payerMemory({ bankTransactions: [{ id: "t", payerAccount: "EE000000000000000701", paidStudentIds: ["s2"] }] });
  const remembered = core.matchLine(line({ counterpartyName: "Keegi Teine", explanation: "x" }), { invoices: [invoice({ id: "inv2", studentId: "s2", payerName: "Muu" })], memory });
  assert.equal(remembered.confidence, "likely");
  assert.equal(remembered.allocations[0].invoiceId, "inv2");
  const linkpay = core.matchLine(line({ counterpartyName: "LHV", explanation: "LinkPay" }), { payments: [{ id: "lp", method: "linkpay", status: "active", amountCents: 15000, paidAt: "2026-10-05" }] });
  assert.equal(linkpay.kind, "payments");
  assert.equal(linkpay.confidence, "likely");
  const typed = core.matchLine(line({ explanation: "tunnid" }), { invoices: [invoice({ balanceDueCents: 0 })], payments: [{ id: "p2", invoiceId: "inv1", payerName: "Näidis Julia", amountCents: 15000, method: "bank", status: "active", paidAt: "2026-10-20" }] });
  assert.equal(typed.kind, "payments");
  assert.equal(typed.confidence, "likely");
});

test("matchLine: two invoices named, an overpayment, an unknown invoice number, money without an invoice", () => {
  const two = core.matchLine(line({ amountCents: 9100, explanation: "KS-2026-108 KS-2026-109" }), { invoices: [invoice({ id: "a", num: "KS-2026-108", balanceDueCents: 4900 }), invoice({ id: "b", num: "KS-2026-109", balanceDueCents: 4200 })] });
  assert.equal(two.confidence, "sure");
  assert.deepEqual(two.allocations.map((a) => [a.invoiceId, a.amountCents]), [["a", 4900], ["b", 4200]]);
  const over = core.matchLine(line({ amountCents: 20000, explanation: "KS-2026-085" }), { invoices: [invoice()] });
  assert.equal(over.confidence, "likely");
  assert.match(over.reason, /ülejääk ettemaksuks/);
  const unknown = core.matchLine(line({ explanation: "KS-2026-999" }), { invoices: [invoice()] });
  assert.equal(unknown.kind, "none");
  assert.match(unknown.reason, /CRM-is ei ole/);
  assert.equal(core.matchLine(line({ counterpartyName: "EESTI TÖÖTUKASSA", explanation: "Juhendamistasu", amountCents: 88452 }), { invoices: [invoice()] }).kind, "none");
  assert.equal(core.matchLine(line({ currency: "USD" }), {}).kind, "none");
});

test("matchLine outgoing: a supplier payment from Ostuarved or a refund is linked; anything else waits for a category", () => {
  const purchaseInvoices = [{ id: "pi1", supplierName: "Näidis Rent OÜ", documentNumber: "2026/246", payments: [{ id: "pay1", date: "2026-10-06", amountCents: 80323, method: "bank" }] }];
  const out = core.matchLine(line({ direction: "D", amountCents: 80323, date: "2026-10-06", counterpartyName: "Näidis Rent OÜ", explanation: "Arve nr 2026/246" }), { purchaseInvoices });
  assert.deepEqual([out.kind, out.confidence, out.purchaseInvoiceId, out.purchasePaymentId], ["purchasePayment", "sure", "pi1", "pay1"]);
  const refund = core.matchLine(line({ direction: "D", amountCents: 2500 }), { refunds: [{ id: "r1", amountCents: 2500, method: "bank", refundedAt: "2026-10-08" }] });
  assert.equal(refund.kind, "refund");
  assert.equal(core.matchLine(line({ direction: "D", amountCents: 549, counterpartyName: "APPLE.COM/BILL" }), { purchaseInvoices }).kind, "none");
});

test("rules: the most specific active rule wins; a rule needs a condition and an account", () => {
  const rules = [
    { id: "r1", direction: "D", counterpartyName: "apple.com", account: "4320", label: "IT", active: true, createdAt: "1" },
    { id: "r2", direction: "D", counterpartyAccount: "EE000000000000000301", account: "1230", label: "Omanik", active: true, createdAt: "2" },
    { id: "r3", direction: "", explanation: "ulekanne", account: "4398", label: "Muu", active: true, createdAt: "0" },
    { id: "r4", direction: "C", counterpartyName: "töötukassa", account: "3530", label: "Toetus", active: false, createdAt: "0" },
  ];
  assert.equal(core.ruleFor(line({ direction: "D", counterpartyName: "APPLE.COM/BILL", counterpartyAccount: "" }), rules).id, "r1");
  assert.equal(core.ruleFor(line({ direction: "D", counterpartyAccount: "EE000000000000000301", explanation: "Ulekanne" }), rules).id, "r2");
  assert.equal(core.ruleFor(line({ direction: "C", counterpartyName: "EESTI TÖÖTUKASSA" }), rules), null, "an inactive rule is not used");
  assert.throws(() => core.cleanRule({ account: "4320" }), /vähemalt üks tingimus/);
  assert.throws(() => core.cleanRule({ counterpartyName: "x", account: "" }), /Vali konto/);
  assert.deepEqual(core.cleanRule({ counterpartyAccount: "ee00 0000", account: "4320", direction: "D" }).counterpartyAccount, "EE000000");
});

test("entryKeysOf: the entries that book a line's money", () => {
  assert.deepEqual(core.entryKeysOf({ paymentIds: ["p1"], creditIds: ["c1"] }), ["payment:p1", "credit:c1"]);
  assert.deepEqual(core.entryKeysOf({ purchase: { invoiceId: "i", paymentId: "p" } }), ["purchase-payment:i:p"]);
});
