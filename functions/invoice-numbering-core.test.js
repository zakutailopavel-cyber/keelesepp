"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { invoiceNumberingPlan, parseInvoiceNumber } = require("./invoice-numbering-core");

test("structured invoice numbers are parsed strictly", () => {
  assert.deepEqual(parseInvoiceNumber("KS-2026-041"), { year: 2026, sequence: 41 });
  assert.equal(parseInvoiceNumber("KS-OLD"), null);
});

test("duplicate invoice numbers keep the strongest canonical evidence", () => {
  const plan = invoiceNumberingPlan([
    { id: "draft", num: "KS-2026-037", date: "2026-07-27", studentName: "Draft" },
    { id: "paid", num: "KS-2026-037", date: "2026-07-28", studentName: "Paid", paidAmountCents: 7700 },
    { id: "other", num: "KS-2026-038", date: "2026-07-29" },
  ], { counterSeq: 41, currentYear: 2026 });
  assert.equal(plan.duplicateGroupCount, 1);
  assert.equal(plan.groups[0].canonicalInvoiceId, "paid");
  assert.deepEqual(plan.replacements[0], {
    invoiceId: "draft",
    studentId: "",
    studentName: "Draft",
    payerName: "",
    oldNumber: "KS-2026-037",
    newNumber: "KS-2026-042",
    risk: "draft",
    requiresResend: false,
    paid: false,
    credited: false,
  });
  assert.equal(plan.counterAfter, 42);
});

test("sent duplicate invoices are marked for corrected delivery", () => {
  const plan = invoiceNumberingPlan([
    { id: "old", num: "KS-2026-013", date: "2026-07-01", paidAmountCents: 2000 },
    { id: "sent", num: "KS-2026-013", date: "2026-07-05", invoiceEmailSentAt: "2026-07-05T12:00:00Z" },
  ], { counterSeq: 13, currentYear: 2026 });
  assert.equal(plan.groups[0].canonicalInvoiceId, "old");
  assert.equal(plan.replacements[0].requiresResend, true);
  assert.equal(plan.replacements[0].risk, "sent");
});
