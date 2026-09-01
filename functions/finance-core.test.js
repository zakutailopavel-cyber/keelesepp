"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildLessonInvoiceLines,
  creditAfterApplication,
  creditAfterRefund,
  creditAfterRestoration,
  financialPeriodReviewSnapshot,
  invoiceFinancialPatch,
  invoiceAfterLessonCredit,
  invoiceOriginalAmountCents,
  lessonBillingDispositionPatch,
  lessonIsBillable,
  normalizeAllocations,
  normalizeBankDistribution,
  packageBalanceAfterEntry,
  packageBalanceAfterLessonMovement,
  paymentDocumentRecord,
  paymentLineAllocationPlan,
  paymentNetAmountCents,
  planInvoiceOverpaymentTransfer,
  positiveInteger,
  selectBillableLessons,
  selectStudentPackageForLesson,
  tariffAssignmentPlan,
  toCents,
  validIsoMonth,
} = require("./finance-core");

test("exact payment allocation snapshots immutable invoice lesson lines", () => {
  const plan = paymentLineAllocationPlan({
    payment: {
      id: "payment-a",
      invoiceId: "invoice-a",
      amountCents: 4000,
      paidAt: "2026-07-10",
      status: "active",
    },
    invoice: {
      id: "invoice-a",
      lines: [
        { lessonId: "lesson-a", date: "2026-07-01", description: "Grammar", amountCents: 3000 },
        { lessonId: "lesson-b", date: "2026-07-08", description: "Reading", amountCents: 3000 },
      ],
    },
    allocations: [
      { lessonId: "lesson-a", amount: 30 },
      { lessonId: "lesson-b", amount: 10 },
    ],
    effectiveDate: "2026-07-10",
  });
  assert.equal(plan.version, 1);
  assert.equal(plan.allocatedAmountCents, 4000);
  assert.equal(plan.unallocatedAmountCents, 0);
  assert.deepEqual(plan.lines.map(line => line.invoiceLineIndex), [0, 1]);
  assert.equal(plan.lines[0].lineAmountCents, 3000);
  assert.equal(plan.reason, "Initial exact lesson allocation");
});

test("allocation corrections require a dated reason and respect remaining line capacity", () => {
  const base = {
    payment: {
      id: "payment-a",
      invoiceId: "invoice-a",
      amountCents: 3000,
      paidAt: "2026-07-10",
      status: "active",
    },
    invoice: {
      id: "invoice-a",
      lines: [{ lessonId: "lesson-a", date: "2026-07-01", amountCents: 3000 }],
    },
    allocations: [{ lessonId: "lesson-a", amount: 25 }],
    effectiveDate: "2026-07-11",
    previousAllocation: { id: "allocation-v1", version: 1 },
  };
  assert.throws(
    () => paymentLineAllocationPlan(base),
    /Reason required/,
  );
  assert.throws(
    () => paymentLineAllocationPlan({
      ...base,
      reason: "Corrected bank evidence",
      allocatedByLesson: { "lesson-a": 1000 },
    }),
    /available amount/,
  );
  const correction = paymentLineAllocationPlan({
    ...base,
    reason: "Corrected bank evidence",
    allocations: [{ lessonId: "lesson-a", amount: 20 }],
    allocatedByLesson: { "lesson-a": 1000 },
  });
  assert.equal(correction.version, 2);
  assert.equal(correction.supersedesAllocationId, "allocation-v1");
  assert.equal(correction.unallocatedAmountCents, 1000);
});

test("exact allocation rejects corrected, duplicate, unknown, and over-payment lesson rows", () => {
  const base = {
    payment: {
      id: "payment-a",
      invoiceId: "invoice-a",
      amountCents: 3000,
      paidAt: "2026-07-10",
      status: "active",
    },
    invoice: {
      id: "invoice-a",
      correctedLessonIds: ["lesson-b"],
      lines: [
        { lessonId: "lesson-a", amountCents: 3000 },
        { lessonId: "lesson-b", amountCents: 3000 },
      ],
    },
    effectiveDate: "2026-07-10",
  };
  assert.throws(() => paymentLineAllocationPlan({
    ...base,
    allocations: [{ lessonId: "lesson-b", amount: 10 }],
  }), /not an active line/);
  assert.throws(() => paymentLineAllocationPlan({
    ...base,
    allocations: [
      { lessonId: "lesson-a", amount: 10 },
      { lessonId: "lesson-a", amount: 10 },
    ],
  }), /unique lesson IDs/);
  assert.throws(() => paymentLineAllocationPlan({
    ...base,
    allocations: [{ lessonId: "lesson-a", amount: 30.01 }],
  }), /available amount|payment amount/);
});

test("financial period review is ready only when lessons, invoices, payments, and bank rows reconcile", () => {
  const snapshot = financialPeriodReviewSnapshot({
    month: "2026-07",
    lessons: [{
      id: "lesson-a",
      date: "2026-07-10",
      studentName: "Mari",
      status: "Toimunud",
      billingStatus: "invoiced",
      invoiceId: "invoice-a",
    }],
    invoices: [{
      id: "invoice-a",
      date: "2026-07-11",
      status: "Makstud",
      amountCents: 3000,
      paidAmountCents: 3000,
      lines: [{ lessonId: "lesson-a", date: "2026-07-10", amountCents: 3000 }],
    }],
    payments: [{
      id: "payment-a",
      invoiceId: "invoice-a",
      amountCents: 3000,
      paidAt: "2026-07-12",
      status: "active",
      bankTransactionId: "bank-a",
    }],
    bankTransactions: [{
      id: "bank-a",
      paidAt: "2026-07-12",
      amountCents: 3000,
      allocatedAmountCents: 3000,
      unappliedAmountCents: 0,
    }],
  });
  assert.equal(snapshot.canReview, true);
  assert.equal(snapshot.summary.blockingIssueCount, 0);
  assert.equal(snapshot.summary.lessonCount, 1);
  assert.equal(snapshot.summary.exactLessonLinkCount, 1);
  assert.equal(snapshot.summary.issuedCents, 3000);
  assert.equal(snapshot.summary.paymentsCents, 3000);
});

test("monthly review validates the active exact payment allocation version", () => {
  const base = {
    month: "2026-07",
    lessons: [{
      id: "lesson-exact",
      date: "2026-07-10",
      studentName: "Mari",
      status: "Toimunud",
      billingStatus: "invoiced",
      invoiceId: "invoice-exact",
    }],
    invoices: [{
      id: "invoice-exact",
      date: "2026-07-11",
      amountCents: 3000,
      paidAmountCents: 3000,
      status: "Makstud",
      lines: [{ lessonId: "lesson-exact", date: "2026-07-10", amountCents: 3000 }],
    }],
    payments: [{
      id: "payment-exact",
      invoiceId: "invoice-exact",
      amountCents: 3000,
      paidAt: "2026-07-12",
      status: "active",
      lineAllocationId: "allocation-exact",
      lineAllocationVersion: 1,
      lineAllocatedAmountCents: 3000,
      lineUnallocatedAmountCents: 0,
      allocationMethod: "explicit_invoice_lines_v1",
    }],
  };
  const missing = financialPeriodReviewSnapshot(base);
  assert.equal(missing.canReview, false);
  assert.ok(missing.issues.some(issue => issue.type === "payment_line_allocation_invalid"));

  const valid = financialPeriodReviewSnapshot({
    ...base,
    paymentLineAllocations: [{
      id: "allocation-exact",
      paymentId: "payment-exact",
      invoiceId: "invoice-exact",
      version: 1,
      effectiveDate: "2026-07-12",
      allocatedAmountCents: 3000,
      unallocatedAmountCents: 0,
      lines: [{
        lessonId: "lesson-exact",
        invoiceLineIndex: 0,
        lineAmountCents: 3000,
        allocatedAmountCents: 3000,
      }],
    }],
  });
  assert.equal(valid.canReview, true);
  assert.equal(valid.scope, "billing_control_v2");
  assert.equal(valid.dataVersion, 3);
});

test("financial period review blocks unbilled lessons, unmatched bank money, and missing payment evidence", () => {
  const snapshot = financialPeriodReviewSnapshot({
    month: "2026-07",
    lessons: [
      { id: "unbilled", date: "2026-07-01", status: "Toimunud", studentName: "Jüri" },
      {
        id: "invoiced",
        date: "2026-07-02",
        status: "Toimunud",
        billingStatus: "invoiced",
        invoiceId: "invoice-a",
      },
    ],
    invoices: [{
      id: "invoice-a",
      date: "2026-07-03",
      status: "Makstud",
      amountCents: 2500,
      paidAmountCents: 2500,
      lines: [{ lessonId: "invoiced", date: "2026-07-02", amountCents: 2500 }],
    }],
    bankTransactions: [{
      id: "bank-a",
      paidAt: "2026-07-04",
      amountCents: 2500,
      allocatedAmountCents: 0,
      unappliedAmountCents: 2500,
    }],
  });
  assert.equal(snapshot.canReview, false);
  assert.equal(snapshot.summary.unbilledLessonCount, 1);
  assert.ok(snapshot.issues.some(issue => issue.type === "unbilled_lesson"));
  assert.ok(snapshot.issues.some(issue => issue.type === "invoice_paid_without_payment_records"));
  assert.ok(snapshot.issues.some(issue => issue.type === "bank_unapplied"));
  assert.equal(snapshot.summary.blockingIssueCount, 3);
});

test("financial period issues include readable lesson identity instead of only a Firestore ID", () => {
  const snapshot = financialPeriodReviewSnapshot({
    month: "2026-07",
    lessons: [{
      id: "opaque-firestore-id",
      date: "2026-07-14",
      time: "17:30",
      status: "Toimunud",
      studentName: "Nicole Smirnova",
      teacher: "Pavel Zakutailo",
    }],
  });
  const issue = snapshot.issues.find(item => item.type === "unbilled_lesson");
  assert.deepEqual(issue, {
    type: "unbilled_lesson",
    severity: "attention",
    entityId: "opaque-firestore-id",
    detail: "Nicole Smirnova",
    entityKind: "lesson",
    entityLabel: "Nicole Smirnova",
    entityDate: "2026-07-14",
    entityTime: "17:30",
    entityTeacher: "Pavel Zakutailo",
  });
});

test("financial period accepts an unapplied bank balance recorded as a student advance", () => {
  const snapshot = financialPeriodReviewSnapshot({
    month: "2026-07",
    bankTransactions: [{
      id: "bank-advance",
      paidAt: "2026-07-04",
      amountCents: 5000,
      allocatedAmountCents: 3000,
      unappliedAmountCents: 2000,
    }],
    payerCredits: [{
      id: "credit-advance",
      bankTransactionId: "bank-advance",
      originalAmountCents: 2000,
      availableAmountCents: 2000,
      status: "open",
    }],
  });
  assert.equal(snapshot.canReview, true);
  assert.equal(snapshot.summary.bankAdvanceCents, 2000);
  assert.equal(snapshot.summary.bankUnappliedCents, 2000);
  assert.equal(snapshot.issues.some(issue => issue.type === "bank_unapplied"), false);
});

test("financial period accepts an audited lesson payment without an invoice", () => {
  const snapshot = financialPeriodReviewSnapshot({
    month: "2026-07",
    lessons: [{
      id: "lesson-direct",
      date: "2026-07-05",
      status: "Toimunud",
      billingStatus: "paid_directly",
      directPaymentId: "payment-direct",
      directPaymentAmountCents: 3000,
      studentId: "student-a",
    }],
    payments: [{
      id: "payment-direct",
      kind: "direct_lesson",
      lessonId: "lesson-direct",
      studentId: "student-a",
      amountCents: 3000,
      paidAt: "2026-07-05",
      status: "active",
      bankTransactionId: "bank-direct",
    }],
    bankTransactions: [{
      id: "bank-direct",
      paidAt: "2026-07-05",
      amountCents: 3000,
      allocatedAmountCents: 3000,
      unappliedAmountCents: 0,
    }],
  });
  assert.equal(snapshot.canReview, true);
  assert.equal(snapshot.summary.unbilledLessonCount, 0);
  assert.equal(snapshot.summary.paymentsCents, 3000);
  assert.equal(snapshot.summary.exactLessonLinkCount, 1);
  assert.equal(snapshot.issues.length, 0);
});

test("financial period exact lesson count excludes prior-month lessons paid directly this month", () => {
  const snapshot = financialPeriodReviewSnapshot({
    month: "2026-09",
    lessons: [{
      id: "lesson-direct-prior-month",
      date: "2026-07-26",
      status: "Toimunud",
      billingStatus: "paid_directly",
      directPaymentId: "payment-direct-september",
      directPaymentAmountCents: 2500,
      studentId: "student-a",
    }],
    payments: [{
      id: "payment-direct-september",
      kind: "direct_lesson",
      lessonId: "lesson-direct-prior-month",
      studentId: "student-a",
      amountCents: 2500,
      paidAt: "2026-09-01",
      status: "active",
      bankTransactionId: "bank-direct-september",
    }],
    bankTransactions: [{
      id: "bank-direct-september",
      paidAt: "2026-09-01",
      amountCents: 2500,
      allocatedAmountCents: 2500,
      unappliedAmountCents: 0,
    }],
  });
  assert.equal(snapshot.summary.lessonCount, 0);
  assert.equal(snapshot.summary.paymentCount, 1);
  assert.equal(snapshot.summary.exactLessonLinkCount, 0);
  assert.equal(snapshot.issues.length, 0);
});

test("legacy lesson evidence remains visible without blocking a migration-safe review", () => {
  const snapshot = financialPeriodReviewSnapshot({
    month: "2026-07",
    lessons: [{
      id: "legacy-lesson",
      date: "2026-07-01",
      status: "Toimunud",
      billingStatus: "invoiced",
      invoiceId: "legacy-invoice",
    }],
    invoices: [{
      id: "legacy-invoice",
      date: "2026-07-02",
      amountCents: 2500,
      status: "Ootel",
    }],
  });
  assert.equal(snapshot.canReview, true);
  assert.equal(snapshot.summary.legacyLessonCount, 1);
  assert.equal(snapshot.summary.warningCount, 1);
  assert.equal(snapshot.issues[0].type, "legacy_invoice_without_lesson_line");
});

test("financial period months are validated strictly", () => {
  assert.equal(validIsoMonth("2026-07"), "2026-07");
  assert.throws(() => validIsoMonth("2026-7"), /YYYY-MM/);
  assert.throws(() => financialPeriodReviewSnapshot({ month: "2026-13" }), /YYYY-MM/);
});

test("payment documents keep an exact private storage path and bounded metadata", () => {
  const document = paymentDocumentRecord({
    paymentId: "payment_0001",
    documentId: "paymentdoc_0001",
    storagePath: "financial/payment-orders/payment_0001/paymentdoc_0001",
    fileName: "LHV maksekorraldus.pdf",
    contentType: "application/pdf",
    size: 123456,
    uploadedAt: "2026-07-29T20:00:00.000Z",
  });
  assert.equal(document.kind, "payment_order");
  assert.equal(document.paymentId, "payment_0001");
  assert.equal(document.fileName, "LHV maksekorraldus.pdf");
  assert.equal(document.size, 123456);
});

test("payment documents reject wrong paths, unsafe types, and oversized files", () => {
  const base = {
    paymentId: "payment_0001",
    documentId: "paymentdoc_0001",
    storagePath: "financial/payment-orders/payment_0001/paymentdoc_0001",
    fileName: "payment.pdf",
    contentType: "application/pdf",
    size: 100,
  };
  assert.throws(
    () => paymentDocumentRecord({ ...base, storagePath: "lessons/student/payment.pdf" }),
    /storage path/,
  );
  assert.throws(
    () => paymentDocumentRecord({ ...base, contentType: "text/html" }),
    /PDF, JPEG, PNG, or WebP/,
  );
  assert.throws(
    () => paymentDocumentRecord({ ...base, size: (10 * 1024 * 1024) + 1 }),
    /10 MB/,
  );
});

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

test("package balance applies append-only credit and debit movements", () => {
  const credited = packageBalanceAfterEntry(
    { balanceCredits: 7, adjustmentCreditCredits: 0, ledgerEntryCount: 1 },
    2,
    "2026-07-28T10:00:00.000Z",
  );
  assert.equal(credited.balanceBefore, 7);
  assert.equal(credited.balanceAfter, 9);
  assert.equal(credited.accountPatch.adjustmentCreditCredits, 2);
  assert.equal(credited.accountPatch.status, "active");

  const debited = packageBalanceAfterEntry(
    { balanceCredits: 3, adjustmentDebitCredits: 1, ledgerEntryCount: 2 },
    -3,
    "2026-07-28T11:00:00.000Z",
  );
  assert.equal(debited.balanceAfter, 0);
  assert.equal(debited.accountPatch.adjustmentDebitCredits, 4);
  assert.equal(debited.accountPatch.ledgerEntryCount, 3);
  assert.equal(debited.accountPatch.status, "depleted");
});

test("package balance rejects fractional, zero, and overdraft movements", () => {
  assert.equal(positiveInteger("10", "lesson credits", 500), 10);
  assert.throws(() => positiveInteger(0, "lesson credits", 500), /positive integer/);
  assert.throws(
    () => packageBalanceAfterEntry({ balanceCredits: 2 }, -3, "now"),
    /insufficient/,
  );
  assert.throws(
    () => packageBalanceAfterEntry({ balanceCredits: 2 }, 0.5, "now"),
    /non-zero integer/,
  );
  assert.throws(
    () => packageBalanceAfterEntry({ balanceCredits: 2 }, 0, "now"),
    /non-zero integer/,
  );
});

test("lesson package selection honors explicit choice then oldest eligible balance", () => {
  const packages = [
    {
      id: "new",
      studentId: "student-a",
      productType: "lesson_package",
      status: "active",
      balanceCredits: 4,
      issuedAt: "2026-07-15",
      createdAt: "2026-07-15T10:00:00.000Z",
    },
    {
      id: "old",
      studentId: "student-a",
      productType: "lesson_package",
      status: "active",
      balanceCredits: 2,
      issuedAt: "2026-07-01",
      createdAt: "2026-07-01T10:00:00.000Z",
    },
    {
      id: "future",
      studentId: "student-a",
      productType: "lesson_package",
      status: "active",
      balanceCredits: 10,
      issuedAt: "2026-08-01",
    },
  ];
  assert.equal(
    selectStudentPackageForLesson(packages, { lessonDate: "2026-07-28" }).id,
    "old",
  );
  assert.equal(
    selectStudentPackageForLesson(packages, {
      lessonDate: "2026-07-28",
      requestedPackageId: "new",
    }).id,
    "new",
  );
  assert.equal(
    selectStudentPackageForLesson(packages, {
      lessonDate: "2026-07-28",
      preferredPackageId: "new",
    }).id,
    "new",
  );
  assert.throws(
    () => selectStudentPackageForLesson(packages, {
      lessonDate: "2026-07-28",
      requestedPackageId: "future",
    }),
    /no eligible/,
  );
});

test("lesson package consumption and restoration preserve account totals", () => {
  const consumed = packageBalanceAfterLessonMovement(
    { balanceCredits: 2, consumedCredits: 3, ledgerEntryCount: 4 },
    "consume",
    "2026-07-28T10:00:00.000Z",
  );
  assert.equal(consumed.creditsDelta, -1);
  assert.equal(consumed.balanceAfter, 1);
  assert.equal(consumed.consumedAfter, 4);
  assert.equal(consumed.accountPatch.ledgerEntryCount, 5);

  const restored = packageBalanceAfterLessonMovement(
    { balanceCredits: 1, consumedCredits: 4, ledgerEntryCount: 5 },
    "restore",
    "2026-07-28T11:00:00.000Z",
  );
  assert.equal(restored.creditsDelta, 1);
  assert.equal(restored.balanceAfter, 2);
  assert.equal(restored.consumedAfter, 3);
  assert.equal(restored.accountPatch.status, "active");
  assert.throws(
    () => packageBalanceAfterLessonMovement(
      { balanceCredits: 0, consumedCredits: 1 },
      "consume",
      "now",
    ),
    /insufficient/,
  );
  assert.equal(
    lessonIsBillable({
      id: "package-covered",
      status: "Toimunud",
      packageConsumptionStatus: "consumed",
    }),
    false,
  );
  assert.equal(
    lessonIsBillable({
      id: "package-needs-attention",
      status: "Toimunud",
      packageAccountingSource: "package_ledger_v1",
      packageConsumptionStatus: "needs_attention",
    }),
    false,
  );
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

test("bank transaction can pay lessons directly and keep the remainder as an advance", () => {
  const result = normalizeBankDistribution(
    100,
    [{ invoiceId: "invoice-a", amount: 20 }],
    [
      { lessonId: "lesson-a", amount: 30 },
      { lessonId: "lesson-b", amount: 25 },
    ],
  );
  assert.equal(result.invoiceAllocatedAmountCents, 2000);
  assert.equal(result.lessonAllocatedAmountCents, 5500);
  assert.equal(result.allocatedAmountCents, 7500);
  assert.equal(result.unappliedAmountCents, 2500);
});

test("direct lesson allocation rejects duplicates and a total above the bank payment", () => {
  assert.throws(
    () => normalizeBankDistribution(50, [], [
      { lessonId: "lesson-a", amount: 20 },
      { lessonId: "lesson-a", amount: 20 },
    ]),
    /more than once/,
  );
  assert.throws(
    () => normalizeBankDistribution(50, [], [{ lessonId: "lesson-a", amount: 50.01 }]),
    /exceeds/,
  );
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

test("a selected lesson subset produces only the requested immutable lines", () => {
  const eligible = selectBillableLessons([
    { id: "lesson-a", date: "2026-07-05", status: "Toimunud", billingStatus: "unbilled" },
    { id: "lesson-b", date: "2026-07-12", status: "Toimunud", billingStatus: "unbilled" },
    { id: "lesson-c", date: "2026-07-19", status: "Toimunud", billingStatus: "unbilled" },
  ]);
  const requestedIds = new Set(["lesson-a", "lesson-c"]);
  const selected = eligible.filter(lesson => requestedIds.has(lesson.id));
  const result = buildLessonInvoiceLines(selected, 25);

  assert.deepEqual(result.lessonIds, ["lesson-a", "lesson-c"]);
  assert.equal(result.lessonCount, 2);
  assert.equal(result.amount, 50);
  assert.equal(eligible.find(lesson => lesson.id === "lesson-b").billingStatus, "unbilled");
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

test("CRM v2 lesson records are explicit even when the legacy counter is zero", () => {
  const selected = selectBillableLessons([
    { id: "legacy", date: "2026-08-01", status: "Toimunud" },
    { id: "crm-v2", date: "2026-08-02", status: "Toimunud", accountingSource: "crm_v2" },
  ], 0);
  assert.deepEqual(selected.map(lesson => lesson.id), ["crm-v2"]);
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
  assert.throws(
    () => lessonBillingDispositionPatch(
      { status: "Toimunud", packageConsumptionStatus: "consumed" },
      "free",
      "now",
    ),
    /package-covered/,
  );
});

test("lesson credit reduces effective invoice amount without changing original amount", () => {
  const patch = invoiceAfterLessonCredit(
    { amountCents: 6000, correctedLessonIds: [] },
    { lessonId: "lesson-a", amountCents: 3000 },
  );
  assert.equal(patch.creditedAmount, 30);
  assert.equal(patch.effectiveAmount, 30);
  const financial = invoiceFinancialPatch(
    { amountCents: 6000, ...patch },
    [{ amountCents: 1000, status: "active" }],
    "2026-07-28T10:00:00.000Z",
  );
  assert.equal(financial.balanceDue, 20);
  assert.equal(Object.prototype.hasOwnProperty.call(financial, "amountCents"), false);
});

test("lesson credit rejects duplicate corrections", () => {
  assert.throws(
    () => invoiceAfterLessonCredit(
      { amountCents: 6000, correctedLessonIds: ["lesson-a"] },
      { lessonId: "lesson-a", amountCents: 3000 },
    ),
    /already credited/,
  );
});

test("multiple lesson credits accumulate against the immutable original total", () => {
  const first = invoiceAfterLessonCredit(
    { amountCents: 6000 },
    { lessonId: "lesson-a", amountCents: 3000 },
  );
  const second = invoiceAfterLessonCredit(
    { amountCents: 6000, ...first },
    { lessonId: "lesson-b", amountCents: 3000 },
  );
  assert.equal(second.creditedAmountCents, 6000);
  assert.equal(second.effectiveAmountCents, 0);
  assert.deepEqual(second.correctedLessonIds, ["lesson-a", "lesson-b"]);
});

test("lesson credit recovers original cents from immutable amount after a legacy aggregate overwrite", () => {
  const legacyAffectedInvoice = {
    amount: 60,
    amountCents: 3000,
    creditedAmountCents: 3000,
    effectiveAmountCents: 3000,
    correctedLessonIds: ["lesson-a"],
  };
  assert.equal(invoiceOriginalAmountCents(legacyAffectedInvoice), 6000);
  const patch = invoiceAfterLessonCredit(
    legacyAffectedInvoice,
    { lessonId: "lesson-b", amountCents: 3000 },
  );
  assert.equal(patch.effectiveAmountCents, 0);
});

test("overpayment transfer plan preserves gross payments and selects newest cash source", () => {
  const payments = [
    { id: "old", amountCents: 5000, status: "active", createdAt: "2026-07-01" },
    { id: "new", amountCents: 3000, status: "active", createdAt: "2026-07-02" },
  ];
  const plan = planInvoiceOverpaymentTransfer({ amountCents: 6000 }, payments);
  assert.equal(plan.overpaidAmountCents, 2000);
  assert.deepEqual(plan.allocations, [{ paymentId: "new", amountCents: 2000 }]);
  assert.equal(paymentNetAmountCents({ ...payments[1], resolvedAmountCents: 2000 }), 1000);
  assert.equal(payments[1].amountCents, 3000);
  const financial = invoiceFinancialPatch(
    { amountCents: 6000 },
    [payments[0], { ...payments[1], resolvedAmountCents: 2000 }],
    "2026-07-28T10:00:00.000Z",
  );
  assert.equal(financial.paidAmount, 60);
  assert.equal(financial.overpaidAmount, 0);
  assert.equal(financial.status, "Makstud");
});

test("overpayment transfer refuses credit-sourced money that must be voided first", () => {
  assert.throws(
    () => planInvoiceOverpaymentTransfer(
      { amountCents: 5000 },
      [{ id: "credit-payment", amountCents: 6000, status: "active", sourceCreditId: "credit-a" }],
    ),
    /void those payments/,
  );
});

test("payer credit refund reduces only available balance and is cumulative", () => {
  const original = { availableAmountCents: 3000, appliedAmountCents: 1000 };
  const first = {
    ...original,
    ...creditAfterRefund(original, 1200, "2026-07-28T10:00:00.000Z"),
  };
  const second = {
    ...first,
    ...creditAfterRefund(first, 1800, "2026-07-28T11:00:00.000Z"),
  };
  assert.equal(first.availableAmount, 18);
  assert.equal(first.appliedAmountCents, 1000);
  assert.equal(second.availableAmount, 0);
  assert.equal(second.refundedAmount, 30);
  assert.equal(second.status, "closed");
  assert.throws(
    () => creditAfterRefund(second, 1, "2026-07-28T12:00:00.000Z"),
    /exceeds available/,
  );
});

test("versioned tariff assignments price each lesson by its date", () => {
  const invoice = buildLessonInvoiceLines(
    [
      { id: "lesson-old", date: "2026-07-07", status: "Toimunud", billingStatus: "unbilled" },
      { id: "lesson-new", date: "2026-07-21", status: "Toimunud", billingStatus: "unbilled" },
    ],
    20,
    [
      {
        id: "assignment-old",
        tariffId: "tariff-old",
        tariffName: "Individual 25",
        billingModel: "per_lesson",
        unitPriceCents: 2500,
        effectiveFrom: "2026-07-01",
        effectiveUntil: "2026-07-14",
      },
      {
        id: "assignment-new",
        tariffId: "tariff-new",
        tariffName: "Individual 30",
        billingModel: "per_lesson",
        unitPriceCents: 3000,
        effectiveFrom: "2026-07-15",
        effectiveUntil: "",
      },
    ],
  );
  assert.equal(invoice.amountCents, 5500);
  assert.equal(invoice.lessonPriceCents, 0);
  assert.equal(invoice.pricingMode, "tariff_assignments_v1");
  assert.deepEqual(invoice.tariffIds, ["tariff-old", "tariff-new"]);
  assert.deepEqual(
    invoice.lines.map(line => [
      line.lessonId,
      line.unitPriceCents,
      line.tariffAssignmentId,
    ]),
    [
      ["lesson-old", 2500, "assignment-old"],
      ["lesson-new", 3000, "assignment-new"],
    ],
  );
});

test("lessons outside tariff assignment dates keep the legacy student price", () => {
  const invoice = buildLessonInvoiceLines(
    [
      { id: "lesson-legacy", date: "2026-06-20", status: "Toimunud", billingStatus: "unbilled" },
      { id: "lesson-tariff", date: "2026-07-20", status: "Toimunud", billingStatus: "unbilled" },
    ],
    20,
    [{
      id: "assignment-a",
      tariffId: "tariff-a",
      tariffName: "Individual 30",
      billingModel: "per_lesson",
      unitPriceCents: 3000,
      effectiveFrom: "2026-07-01",
      effectiveUntil: "",
    }],
  );
  assert.equal(invoice.amountCents, 5000);
  assert.equal(invoice.pricingMode, "mixed_tariff_legacy_v1");
  assert.equal(invoice.lines[0].pricingSource, "legacy_student_price");
  assert.equal(invoice.lines[1].pricingSource, "tariff_assignment");
});

test("new tariff assignments close the latest interval without rewriting its price", () => {
  const plan = tariffAssignmentPlan(
    [{
      id: "assignment-a",
      effectiveFrom: "2026-07-01",
      effectiveUntil: "",
      unitPriceCents: 2500,
    }],
    "2026-08-01",
  );
  assert.deepEqual(plan, {
    effectiveFrom: "2026-08-01",
    previousAssignmentId: "assignment-a",
    previousEffectiveUntil: "2026-07-31",
  });
  assert.throws(
    () => tariffAssignmentPlan(
      [{ id: "assignment-a", effectiveFrom: "2026-07-01" }],
      "2026-07-01",
    ),
    /must start after/,
  );
});
