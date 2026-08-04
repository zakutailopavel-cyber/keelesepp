"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { accountantExportArchive, billingFingerprint, periodCloseProjection } = require("./period-close-core");

const base = {
  month: "2026-07",
  nowIso: "2026-08-04T12:00:00.000Z",
  invoices: [], payments: [], bankTransactions: [], payerCredits: [], lessons: [], paymentLineAllocations: [], creditApplications: [], refunds: [], corrections: [],
};

test("period close requires a matching review, resolved payroll, expense documents, and archived export", () => {
  const first = periodCloseProjection({
    ...base,
    period: {},
    workSessions: [{ id: "w1", startedDate: "2026-07-10", status: "closed", approvalStatus: "pending" }],
    expenses: [{ id: "e1", expenseDate: "2026-07-11", status: "active", amountCents: 1000, vatAmountCents: 0, documents: [] }],
  });
  assert.equal(first.canGenerateExport, false);
  assert.deepEqual(first.dependencyIssues.map(item => item.type), ["financial_review_missing_or_stale", "payroll_unresolved", "expense_document_missing"]);

  const reviewed = periodCloseProjection({ ...base, period: { status: "reviewed" } });
  const ready = periodCloseProjection({ ...base, period: { status: "reviewed", lastReviewFingerprint: reviewed.billingFingerprint } });
  assert.equal(ready.canGenerateExport, true);
  assert.equal(ready.canClose, false);
  const archive = accountantExportArchive({ projection: ready, data: base, requestId: "period_export_0001", actor: { uid: "admin" } });
  const closable = periodCloseProjection({ ...base, period: { status: "reviewed", lastReviewFingerprint: ready.billingFingerprint }, latestExport: { id: "period_export_0001", ...archive } });
  assert.equal(closable.canClose, true);
});

test("period close totals approved payroll, active expenses, corrections, and balances", () => {
  const initial = periodCloseProjection({ ...base, period: { status: "reviewed" } });
  const projection = periodCloseProjection({
    ...base,
    period: { status: "reviewed", lastReviewFingerprint: initial.billingFingerprint },
    workSessions: [{ id: "w1", startedDate: "2026-07-10", status: "closed", approvalStatus: "approved", durationMinutes: 60, payAmountCents: 1500 }],
    expenses: [{ id: "e1", expenseDate: "2026-07-11", status: "active", amountCents: 2440, vatAmountCents: 440, documents: [{ id: "d1" }] }],
    corrections: [{ id: "c1", effectiveDate: "2026-07-20", status: "active", type: "expense", amountDeltaCents: -100, vatDeltaCents: -20 }],
  });
  assert.equal(projection.canGenerateExport, true);
  assert.equal(projection.summary.payrollPayCents, 1500);
  assert.equal(projection.summary.expenseAmountCents, 2440);
  assert.equal(projection.summary.correctionAmountCents, -100);
});

test("current month cannot be closed", () => {
  const projection = periodCloseProjection({ ...base, month: "2026-08", period: { status: "reviewed" } });
  assert.equal(projection.canGenerateExport, false);
  assert.equal(projection.dependencyIssues[0].type, "period_not_finished");
});

test("billing fingerprint changes when stable record identity changes at the same totals", () => {
  const snapshot = {
    month: "2026-07",
    scope: "billing_control_v2",
    dataVersion: 3,
    summary: { paymentCount: 1, paymentsCents: 3000 },
    issues: [],
    evidence: { payments: [{ id: "payment-one", amountCents: 3000 }] },
  };
  assert.notEqual(
    billingFingerprint(snapshot),
    billingFingerprint({
      ...snapshot,
      evidence: { payments: [{ id: "payment-two", amountCents: 3000 }] },
    }),
  );
});
