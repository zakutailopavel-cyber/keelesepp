"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildLessonInvoiceLines,
  creditAfterApplication,
  creditAfterRestoration,
  invoiceFinancialPatch,
  lessonBillingDispositionPatch,
  lessonIsBillable,
  normalizeAllocations,
  selectBillableLessons,
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

test("payer credit can be partially applied and later restored", () => {
  const applied = creditAfterApplication(
    { availableAmountCents: 5000, appliedAmountCents: 0, applicationCount: 0 },
    3000,
    "2026-07-28T10:00:00.000Z",
  );
  assert.equal(applied.availableAmount, 20);
  assert.equal(applied.appliedAmount, 30);
  assert.equal(applied.status, "open");

  const restored = creditAfterRestoration(
    applied,
    1000,
    "2026-07-28T11:00:00.000Z",
  );
  assert.equal(restored.availableAmount, 30);
  assert.equal(restored.appliedAmount, 20);
  assert.equal(restored.status, "open");
});

test("payer credit closes at zero and rejects over-application", () => {
  const closed = creditAfterApplication(
    { availableAmountCents: 2500 },
    2500,
    "2026-07-28T10:00:00.000Z",
  );
  assert.equal(closed.availableAmount, 0);
  assert.equal(closed.status, "closed");
  assert.throws(
    () => creditAfterApplication({ availableAmountCents: 1000 }, 1001, "2026-07-28T10:00:00.000Z"),
    /exceeds/,
  );
});

test("completed unbilled lessons become dated immutable invoice lines", () => {
  const result = buildLessonInvoiceLines([
    { id: "lesson-b", date: "2026-07-12", status: "Toimunud" },
    { id: "lesson-a", date: "2026-07-05", status: "Toimunud", billingStatus: "unbilled" },
  ], 27.5);
  assert.equal(result.amount, 55);
  assert.equal(result.lessonCount, 2);
  assert.deepEqual(result.lessonIds, ["lesson-a", "lesson-b"]);
  assert.equal(result.lines[0].unitPriceCents, 2750);
});

test("lesson invoice lines reject billed, incomplete, and duplicate lessons", () => {
  assert.throws(
    () => buildLessonInvoiceLines([{ id: "lesson-a", status: "Planeeritud" }], 25),
    /not completed/,
  );
  assert.throws(
    () => buildLessonInvoiceLines([{ id: "lesson-a", status: "Toimunud", billingStatus: "invoiced" }], 25),
    /already billed/,
  );
  assert.throws(
    () => buildLessonInvoiceLines([
      { id: "lesson-a", date: "2026-07-01", status: "Toimunud" },
      { id: "lesson-a", date: "2026-07-01", status: "Toimunud" },
    ], 25),
    /more than once/,
  );
  assert.throws(
    () => buildLessonInvoiceLines([{ id: "lesson-a", date: "not-a-date", status: "Toimunud" }], 25),
    /invalid date/,
  );
});

test("legacy lesson counter limits migration billing to the newest unlinked lessons", () => {
  const selected = selectBillableLessons([
    { id: "old", date: "2026-05-01", status: "Toimunud" },
    { id: "recent-a", date: "2026-07-01", status: "Toimunud" },
    { id: "recent-b", date: "2026-07-08", status: "Toimunud" },
    { id: "explicit", date: "2026-06-01", status: "Toimunud", billingStatus: "unbilled" },
    { id: "billed", date: "2026-07-10", status: "Toimunud", invoiceId: "invoice-1" },
  ], 2);
  assert.deepEqual(selected.map(lesson => lesson.id), ["explicit", "recent-b"]);
});

test("late cancellation is billable and uses a dedicated invoice description", () => {
  const lesson = {
    id: "late-cancel",
    date: "2026-07-20",
    status: "Puudus_eta",
    billingStatus: "late_cancel_billable",
  };
  assert.equal(lessonIsBillable(lesson), true);
  const result = buildLessonInvoiceLines([lesson], 30);
  assert.equal(result.amount, 30);
  assert.match(result.lines[0].description, /Hilinenud/);
  const migrationSelection = selectBillableLessons([
    { id: "old", date: "2026-05-01", status: "Toimunud" },
    lesson,
  ], 1);
  assert.deepEqual(migrationSelection.map(item => item.id), ["late-cancel"]);
});

test("billing disposition transitions adjust the legacy unbilled counter", () => {
  const completed = { id: "lesson-a", status: "Toimunud" };
  const free = lessonBillingDispositionPatch(completed, "free", "2026-07-28T10:00:00.000Z");
  assert.equal(free.counterDelta, -1);
  assert.equal(free.afterBillable, false);

  const absence = { id: "lesson-b", status: "Puudus_eta" };
  const late = lessonBillingDispositionPatch(absence, "late_cancel_billable", "2026-07-28T10:00:00.000Z");
  assert.equal(late.counterDelta, 1);
  assert.equal(late.afterBillable, true);

  const onTime = lessonBillingDispositionPatch(
    { ...absence, billingStatus: "late_cancel_billable" },
    "cancelled_on_time",
    "2026-07-28T11:00:00.000Z",
  );
  assert.equal(onTime.counterDelta, -1);
});

test("billing dispositions reject incompatible lesson states and invoiced lessons", () => {
  assert.throws(
    () => lessonBillingDispositionPatch({ status: "Puudus_eta" }, "free", "now"),
    /completed lesson/,
  );
  assert.throws(
    () => lessonBillingDispositionPatch({ status: "Toimunud" }, "late_cancel_billable", "now"),
    /absent lesson/,
  );
  assert.throws(
    () => lessonBillingDispositionPatch(
      { status: "Toimunud", billingStatus: "invoiced", invoiceId: "invoice-1" },
      "written_off",
      "now",
    ),
    /cannot be changed/,
  );
});
