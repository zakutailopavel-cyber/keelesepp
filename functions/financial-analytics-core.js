"use strict";

const { invoiceAmountCents, paymentNetAmountCents } = require("./finance-core");

function validMonth(value) {
  const month = String(value || "");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Valid analytics month required");
  return month;
}

function dateOf(record, fields) {
  for (const field of fields) {
    const value = String(record?.[field] || "");
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  }
  return "";
}

function monthOf(record, fields) {
  return dateOf(record, fields).slice(0, 7);
}

function monthEnd(month) {
  const [year, number] = validMonth(month).split("-").map(Number);
  return new Date(Date.UTC(year, number, 0)).toISOString().slice(0, 10);
}

function monthShift(month, delta) {
  const [year, number] = validMonth(month).split("-").map(Number);
  return new Date(Date.UTC(year, number - 1 + delta, 1)).toISOString().slice(0, 7);
}

function moneyCents(record, centsField, amountField) {
  if (Number.isFinite(Number(record?.[centsField]))) return Math.round(Number(record[centsField]));
  return Math.round((Number(record?.[amountField]) || 0) * 100);
}

function activePaymentsUntil(payments, endDate) {
  return payments.filter(payment => {
    const date = dateOf(payment, ["paidAt", "createdAt"]);
    return payment?.status !== "voided" && date && date <= endDate;
  });
}

function agedDebt({ invoices = [], payments = [] }, asOfDate) {
  const paidByInvoice = new Map();
  activePaymentsUntil(payments, asOfDate).forEach(payment => {
    const invoiceId = String(payment.invoiceId || "");
    paidByInvoice.set(invoiceId, (paidByInvoice.get(invoiceId) || 0) + paymentNetAmountCents(payment));
  });
  const asOf = new Date(`${asOfDate}T12:00:00.000Z`);
  const rows = invoices
    .filter(invoice => {
      const date = dateOf(invoice, ["date", "issuedAt", "createdAt"]);
      return date && date <= asOfDate;
    })
    .map(invoice => {
      const balanceCents = Math.max(
        0,
        invoiceAmountCents(invoice) - (paidByInvoice.get(String(invoice.id || "")) || 0),
      );
      const due = dateOf(invoice, ["due", "dueDate"]) || dateOf(invoice, ["date", "issuedAt", "createdAt"]);
      const dueDate = new Date(`${due}T12:00:00.000Z`);
      const daysOverdue = Math.max(0, Math.floor((asOf.getTime() - dueDate.getTime()) / 86400000));
      const bucket = daysOverdue === 0
        ? "not_due"
        : daysOverdue <= 30
          ? "days_1_30"
          : daysOverdue <= 60
            ? "days_31_60"
            : "days_61_plus";
      return {
        id: String(invoice.id || ""),
        number: String(invoice.num || invoice.number || invoice.invoiceNumber || ""),
        studentName: String(invoice.studentName || ""),
        payerName: String(invoice.payerName || invoice.parentName || ""),
        due,
        daysOverdue,
        bucket,
        balanceCents,
      };
    })
    .filter(row => row.balanceCents > 0)
    .sort((a, b) => b.daysOverdue - a.daysOverdue || b.balanceCents - a.balanceCents);
  const buckets = ["not_due", "days_1_30", "days_31_60", "days_61_plus"].map(id => {
    const items = rows.filter(row => row.bucket === id);
    return {
      id,
      invoiceCount: items.length,
      balanceCents: items.reduce((sum, row) => sum + row.balanceCents, 0),
    };
  });
  return {
    asOfDate,
    invoiceCount: rows.length,
    balanceCents: rows.reduce((sum, row) => sum + row.balanceCents, 0),
    buckets,
    rows,
  };
}

function correctionTotals(corrections, month) {
  const totals = { invoice: 0, payment: 0, expense: 0, payroll: 0, other: 0 };
  corrections
    .filter(item => item?.status !== "voided" && monthOf(item, ["effectiveDate"]) === month)
    .forEach(item => {
      const type = Object.prototype.hasOwnProperty.call(totals, item.type) ? item.type : "other";
      totals[type] += Number(item.amountDeltaCents) || 0;
    });
  return totals;
}

function monthMetrics(month, data) {
  const invoices = data.invoices.filter(item => monthOf(item, ["date", "issuedAt", "createdAt"]) === month);
  const bank = data.bankTransactions.filter(item =>
    item?.status !== "voided"
    && monthOf(item, ["paidAt", "date", "createdAt"]) === month,
  );
  const standalonePayments = data.payments.filter(item =>
    item?.status !== "voided"
    && !item.bankTransactionId
    && !item.sourceCreditId
    && monthOf(item, ["paidAt", "createdAt"]) === month,
  );
  const refunds = data.refunds.filter(item => item?.status !== "voided" && monthOf(item, ["refundedAt", "createdAt"]) === month);
  const expenses = data.expenses.filter(item => item?.status === "active" && monthOf(item, ["expenseDate"]) === month);
  const payroll = data.workSessions.filter(item =>
    item?.status === "closed"
    && item?.approvalStatus === "approved"
    && monthOf(item, ["startedDate", "startedAt"]) === month,
  );
  const corrections = correctionTotals(data.corrections, month);
  const revenueCents = invoices.reduce((sum, item) => sum + invoiceAmountCents(item), 0) + corrections.invoice;
  const bankInflowCents = bank.reduce((sum, item) => sum + Math.max(0, moneyCents(item, "amountCents", "amount")), 0);
  const standalonePaymentCents = standalonePayments.reduce((sum, item) => sum + paymentNetAmountCents(item), 0);
  const cashInflowCents = bankInflowCents + standalonePaymentCents + corrections.payment;
  const expenseCents = expenses.reduce((sum, item) => sum + Math.max(0, Number(item.amountCents) || 0), 0) + corrections.expense;
  const refundCents = refunds.reduce((sum, item) => sum + Math.max(0, moneyCents(item, "amountCents", "amount")), 0);
  const payrollCents = payroll.reduce((sum, item) => sum + Math.max(0, Number(item.payAmountCents) || 0), 0) + corrections.payroll;
  const cashOutflowCents = expenseCents + refundCents;
  const marginCents = revenueCents - expenseCents - payrollCents + corrections.other;
  return {
    month,
    invoiceCount: invoices.length,
    revenueCents,
    cashInflowCents,
    bankInflowCents,
    standalonePaymentCents,
    cashOutflowCents,
    expenseCents,
    refundCents,
    payrollCents,
    marginCents,
    cashNetCents: cashInflowCents - cashOutflowCents,
    correctionCents: Object.values(corrections).reduce((sum, value) => sum + value, 0),
  };
}

function breakdownRows(invoices, lessonById, dimension) {
  const values = new Map();
  invoices.forEach(invoice => {
    const correctedLessonIds = new Set((invoice.correctedLessonIds || []).map(String));
    const activeLines = (Array.isArray(invoice.lines) ? invoice.lines : [])
      .filter(line => !correctedLessonIds.has(String(line?.lessonId || "")));
    const lines = activeLines.length
      ? activeLines
      : [{ lessonId: "", amountCents: invoiceAmountCents(invoice), amount: invoice.amount }];
    lines.forEach(line => {
      const lesson = lessonById.get(String(line.lessonId || "")) || {};
      const key = dimension === "teacher"
        ? (lesson.teacherName || lesson.teacher || "Määramata")
        : dimension === "group"
          ? (lesson.groupName || "Individuaaltunnid")
          : (lesson.subject || lesson.courseName || "Määramata");
      const current = values.get(String(key)) || { label: String(key), amountCents: 0, lessonCount: 0 };
      current.amountCents += Math.max(0, moneyCents(line, "amountCents", "amount"));
      current.lessonCount += line.lessonId ? 1 : 0;
      values.set(String(key), current);
    });
  });
  return [...values.values()].sort((a, b) => b.amountCents - a.amountCents || a.label.localeCompare(b.label));
}

function financialAnalyticsSnapshot({
  month,
  invoices = [],
  payments = [],
  bankTransactions = [],
  refunds = [],
  expenses = [],
  workSessions = [],
  revenuePlans = [],
  corrections = [],
  lessons = [],
  nowIso = new Date().toISOString(),
} = {}) {
  const selectedMonth = validMonth(month);
  const currentMonth = nowIso.slice(0, 7);
  if (selectedMonth > currentMonth) throw new Error("Analytics month cannot be in the future");
  const data = { invoices, payments, bankTransactions, refunds, expenses, workSessions, corrections };
  const metrics = monthMetrics(selectedMonth, data);
  const forecastCents = revenuePlans
    .filter(plan => plan?.active !== false)
    .reduce((sum, plan) => sum + Math.round(
      (Math.max(0, Number(plan.lessonPriceCents) || 0) * Math.max(0, Number(plan.weeklyLessons) || 0) * 52) / 12,
    ), 0);
  const issuedInvoices = invoices.filter(item => monthOf(item, ["date", "issuedAt", "createdAt"]) === selectedMonth);
  const lessonById = new Map(lessons.map(item => [String(item.id || ""), item]));
  const asOfDate = selectedMonth === currentMonth ? nowIso.slice(0, 10) : monthEnd(selectedMonth);
  return {
    schemaVersion: "financial_analytics_v1",
    month: selectedMonth,
    generatedAt: nowIso,
    summary: {
      ...metrics,
      forecastCents,
      forecastVarianceCents: metrics.revenueCents - forecastCents,
      forecastAttainmentPercent: forecastCents > 0
        ? Math.round((metrics.revenueCents / forecastCents) * 1000) / 10
        : null,
    },
    agedDebt: agedDebt({ invoices, payments }, asOfDate),
    trend: Array.from({ length: 6 }, (_, index) => monthMetrics(monthShift(selectedMonth, index - 5), data)),
    breakdown: {
      subjects: breakdownRows(issuedInvoices, lessonById, "subject"),
      teachers: breakdownRows(issuedInvoices, lessonById, "teacher"),
      groups: breakdownRows(issuedInvoices, lessonById, "group"),
    },
  };
}

module.exports = {
  agedDebt,
  financialAnalyticsSnapshot,
  monthMetrics,
};
