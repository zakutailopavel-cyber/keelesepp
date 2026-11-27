"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { financialAnalyticsSnapshot } = require("./financial-analytics-core");

test("analytics separates cash flow, accrual margin, forecast, and aged debt", () => {
  const snapshot = financialAnalyticsSnapshot({
    month: "2026-07",
    nowIso: "2026-08-04T12:00:00.000Z",
    invoices: [{ id: "i1", num: "KS-1", date: "2026-07-02", due: "2026-07-10", amountCents: 10000, studentName: "Mari", lines: [{ lessonId: "l1", amountCents: 10000 }] }],
    payments: [{ id: "p1", invoiceId: "i1", paidAt: "2026-07-15", amountCents: 4000, status: "active", bankTransactionId: "b1" }],
    bankTransactions: [{ id: "b1", paidAt: "2026-07-15", amountCents: 4000 }],
    expenses: [{ id: "e1", expenseDate: "2026-07-12", amountCents: 2000, status: "active" }],
    workSessions: [{ id: "w1", startedDate: "2026-07-11", status: "closed", approvalStatus: "approved", payAmountCents: 3000 }],
    revenuePlans: [{ id: "r1", lessonPriceCents: 2500, weeklyLessons: 1, active: true }],
    lessons: [{ id: "l1", teacherName: "Pavel", subject: "Eesti keel", groupName: "A2" }],
  });
  assert.equal(snapshot.summary.revenueCents, 10000);
  assert.equal(snapshot.summary.cashInflowCents, 4000);
  assert.equal(snapshot.summary.cashOutflowCents, 2000);
  assert.equal(snapshot.summary.marginCents, 5000);
  assert.equal(snapshot.summary.forecastCents, 10833);
  assert.equal(snapshot.agedDebt.balanceCents, 6000);
  assert.equal(snapshot.agedDebt.buckets.find(item => item.id === "days_1_30").balanceCents, 6000);
  assert.equal(snapshot.breakdown.teachers[0].label, "Pavel");
  assert.equal(snapshot.breakdown.subjects[0].amountCents, 10000);
});

test("aged debt leaves out an old invoice marked paid by hand, with no payment records", () => {
  const { agedDebt } = require("./financial-analytics-core");
  const invoices = [
    { id: "old", num: "KS-1", date: "2026-06-12", due: "2026-06-26", amountCents: 6000, status: "Makstud", studentName: "Mari" },
    { id: "open", num: "KS-2", date: "2026-11-01", due: "2026-11-15", amountCents: 11000, status: "Ootel", studentName: "Jaan" },
    { id: "part", num: "KS-3", date: "2026-11-02", due: "2026-11-10", amountCents: 8000, status: "Makstud", studentName: "Liis" },
  ];
  // "part" says Makstud but its only payment record is voided: the records decide, it is still owed
  const payments = [{ id: "p1", invoiceId: "part", paidAt: "2026-11-05", amountCents: 8000, status: "voided" }];
  const result = agedDebt({ invoices, payments }, "2026-11-27");
  assert.deepEqual(result.rows.map(row => row.number).sort(), ["KS-2", "KS-3"]);
  assert.equal(result.balanceCents, 19000);
  assert.equal(result.buckets.find(item => item.id === "days_61_plus").invoiceCount, 0);
});

test("analytics avoids double-counting bank-linked and credit-sourced payments", () => {
  const snapshot = financialAnalyticsSnapshot({
    month: "2026-07",
    nowIso: "2026-08-04T12:00:00.000Z",
    bankTransactions: [{ id: "bank", paidAt: "2026-07-01", amountCents: 5000 }],
    payments: [
      { id: "allocated", paidAt: "2026-07-01", amountCents: 3000, status: "active", bankTransactionId: "bank" },
      { id: "credit", paidAt: "2026-07-02", amountCents: 1000, status: "active", sourceCreditId: "credit-1" },
      { id: "cash", paidAt: "2026-07-03", amountCents: 2000, status: "active", method: "cash" },
    ],
  });
  assert.equal(snapshot.summary.bankInflowCents, 5000);
  assert.equal(snapshot.summary.standalonePaymentCents, 2000);
  assert.equal(snapshot.summary.cashInflowCents, 7000);
});

test("analytics applies dated corrections without rewriting source records", () => {
  const snapshot = financialAnalyticsSnapshot({
    month: "2026-07",
    nowIso: "2026-08-04T12:00:00.000Z",
    corrections: [
      { id: "c1", effectiveDate: "2026-07-05", type: "invoice", amountDeltaCents: 1000, status: "active" },
      { id: "c2", effectiveDate: "2026-07-05", type: "expense", amountDeltaCents: -200, status: "active" },
    ],
  });
  assert.equal(snapshot.summary.revenueCents, 1000);
  assert.equal(snapshot.summary.expenseCents, -200);
  assert.equal(snapshot.summary.marginCents, 1200);
});

test("analytics rejects future and invalid months", () => {
  assert.throws(() => financialAnalyticsSnapshot({ month: "2026-09", nowIso: "2026-08-04T12:00:00.000Z" }), /future/);
  assert.throws(() => financialAnalyticsSnapshot({ month: "2026-13" }), /Valid analytics month/);
});

test("forecast adds further subjects with their own lessons per week (owner 2026-11-06); legacy plans unchanged", () => {
  const forecast = (revenuePlans) => financialAnalyticsSnapshot({ month: "2026-07", nowIso: "2026-08-04T12:00:00.000Z", revenuePlans }).summary.forecastCents;
  const legacy = { id: "r1", lessonPriceCents: 2500, weeklyLessons: 1, active: true, subjectPrices: { Matemaatika: { lessonPriceCents: 3000 } } };
  assert.equal(forecast([legacy]), 10833);
  assert.equal(forecast([{ ...legacy, subjectBilling: { Matemaatika: { weeklyLessons: 2, billingMode: "package" } } }]), Math.round(((2500 + 2 * 3000) * 52) / 12));
});
