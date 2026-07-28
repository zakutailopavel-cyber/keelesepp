"use strict";

function toCents(value, field = "amount") {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    const error = new Error(`${field} must be a positive number`);
    error.status = 400;
    throw error;
  }
  const cents = Math.round(number * 100);
  if (cents <= 0 || Math.abs(number * 100 - cents) > 0.000001) {
    const error = new Error(`${field} must have at most two decimal places`);
    error.status = 400;
    throw error;
  }
  return cents;
}

function centsToAmount(cents) {
  return Number((Number(cents || 0) / 100).toFixed(2));
}

function invoiceAmountCents(invoice = {}) {
  if (Number.isInteger(invoice.amountCents) && invoice.amountCents >= 0) {
    return invoice.amountCents;
  }
  return Math.max(0, Math.round((Number(invoice.amount) || 0) * 100));
}

function activePaymentTotalCents(payments = []) {
  return payments.reduce((sum, payment) => {
    if (!payment || payment.status === "voided") return sum;
    const cents = Number.isInteger(payment.amountCents)
      ? payment.amountCents
      : Math.round((Number(payment.amount) || 0) * 100);
    return sum + Math.max(0, cents);
  }, 0);
}

function normalizeAllocations(transactionAmount, allocations = []) {
  const transactionAmountCents = toCents(transactionAmount, "transaction amount");
  if (!Array.isArray(allocations)) {
    const error = new Error("allocations must be an array");
    error.status = 400;
    throw error;
  }
  if (allocations.length > 50) {
    const error = new Error("at most 50 invoice allocations are allowed");
    error.status = 400;
    throw error;
  }

  const seenInvoiceIds = new Set();
  const normalized = allocations.map((allocation, index) => {
    const invoiceId = String(allocation?.invoiceId || "").trim();
    if (!invoiceId) {
      const error = new Error(`allocations[${index}].invoiceId required`);
      error.status = 400;
      throw error;
    }
    if (seenInvoiceIds.has(invoiceId)) {
      const error = new Error(`invoice ${invoiceId} is allocated more than once`);
      error.status = 400;
      throw error;
    }
    seenInvoiceIds.add(invoiceId);
    return {
      invoiceId,
      amountCents: toCents(allocation?.amount, `allocations[${index}].amount`),
    };
  });
  const allocatedAmountCents = normalized.reduce((sum, allocation) => sum + allocation.amountCents, 0);
  if (allocatedAmountCents > transactionAmountCents) {
    const error = new Error("allocated amount exceeds bank transaction amount");
    error.status = 400;
    throw error;
  }

  return {
    transactionAmountCents,
    allocations: normalized,
    allocatedAmountCents,
    unappliedAmountCents: transactionAmountCents - allocatedAmountCents,
  };
}

function creditAfterApplication(credit = {}, appliedAmountCents, nowIso) {
  const availableAmountCents = Number.isInteger(credit.availableAmountCents)
    ? credit.availableAmountCents
    : Math.max(0, Math.round((Number(credit.availableAmount) || 0) * 100));
  if (!Number.isInteger(appliedAmountCents) || appliedAmountCents <= 0) {
    const error = new Error("applied credit amount must be positive cents");
    error.status = 400;
    throw error;
  }
  if (appliedAmountCents > availableAmountCents) {
    const error = new Error("applied amount exceeds available payer credit");
    error.status = 409;
    throw error;
  }
  const nextAvailableCents = availableAmountCents - appliedAmountCents;
  const appliedTotalCents = (Number(credit.appliedAmountCents) || 0) + appliedAmountCents;
  return {
    availableAmountCents: nextAvailableCents,
    availableAmount: centsToAmount(nextAvailableCents),
    appliedAmountCents: appliedTotalCents,
    appliedAmount: centsToAmount(appliedTotalCents),
    status: nextAvailableCents === 0 ? "closed" : "open",
    applicationCount: (Number(credit.applicationCount) || 0) + 1,
    lastAppliedAt: nowIso,
    updatedAt: nowIso,
  };
}

function creditAfterRestoration(credit = {}, restoredAmountCents, nowIso, { reverseApplication = true } = {}) {
  if (!Number.isInteger(restoredAmountCents) || restoredAmountCents <= 0) {
    const error = new Error("restored credit amount must be positive cents");
    error.status = 400;
    throw error;
  }
  const availableAmountCents = Number.isInteger(credit.availableAmountCents)
    ? credit.availableAmountCents
    : Math.max(0, Math.round((Number(credit.availableAmount) || 0) * 100));
  const appliedAmountCents = reverseApplication
    ? Math.max(0, (Number(credit.appliedAmountCents) || 0) - restoredAmountCents)
    : (Number(credit.appliedAmountCents) || 0);
  const nextAvailableCents = availableAmountCents + restoredAmountCents;
  const restoredTotalCents = (Number(credit.restoredAmountCents) || 0) + restoredAmountCents;
  return {
    availableAmountCents: nextAvailableCents,
    availableAmount: centsToAmount(nextAvailableCents),
    appliedAmountCents,
    appliedAmount: centsToAmount(appliedAmountCents),
    restoredAmountCents: restoredTotalCents,
    restoredAmount: centsToAmount(restoredTotalCents),
    status: "open",
    lastRestoredAt: nowIso,
    updatedAt: nowIso,
  };
}

function lessonIsBillable(lesson = {}) {
  if (String(lesson.invoiceId || "").trim() || lesson.billingStatus === "invoiced") return false;
  if (lesson.billingStatus === "late_cancel_billable") return true;
  return lesson.status === "Toimunud"
    && (!lesson.billingStatus || lesson.billingStatus === "unbilled");
}

function lessonBillingDispositionPatch(lesson = {}, nextStatus, nowIso) {
  const allowed = new Set([
    "unset",
    "unbilled",
    "free",
    "cancelled_on_time",
    "late_cancel_billable",
    "written_off",
  ]);
  if (!allowed.has(nextStatus)) {
    const error = new Error("unsupported lesson billing status");
    error.status = 400;
    throw error;
  }
  if (String(lesson.invoiceId || "").trim() || lesson.billingStatus === "invoiced") {
    const error = new Error("invoiced lesson billing status cannot be changed");
    error.status = 409;
    throw error;
  }
  if (["unbilled", "free"].includes(nextStatus) && lesson.status !== "Toimunud") {
    const error = new Error(`${nextStatus} requires a completed lesson`);
    error.status = 409;
    throw error;
  }
  if (
    ["cancelled_on_time", "late_cancel_billable"].includes(nextStatus)
    && !["Puudus_p", "Puudus_eta"].includes(lesson.status)
  ) {
    const error = new Error(`${nextStatus} requires an absent lesson`);
    error.status = 409;
    throw error;
  }
  const beforeBillable = lessonIsBillable(lesson);
  const nextLesson = {
    ...lesson,
    billingStatus: nextStatus === "unset" ? "" : nextStatus,
  };
  const afterBillable = lessonIsBillable(nextLesson);
  return {
    billingStatus: nextStatus === "unset" ? null : nextStatus,
    counterDelta: Number(afterBillable) - Number(beforeBillable),
    beforeBillable,
    afterBillable,
    billingUpdatedAt: nowIso,
  };
}

function buildLessonInvoiceLines(lessons = [], lessonPrice) {
  if (!Array.isArray(lessons) || lessons.length === 0) {
    const error = new Error("at least one lesson required");
    error.status = 400;
    throw error;
  }
  if (lessons.length > 100) {
    const error = new Error("at most 100 lessons are allowed per invoice");
    error.status = 400;
    throw error;
  }
  const unitPriceCents = toCents(lessonPrice, "lesson price");
  const seen = new Set();
  const lines = lessons.map((lesson, index) => {
    const lessonId = String(lesson?.id || "").trim();
    if (!lessonId) {
      const error = new Error(`lessons[${index}].id required`);
      error.status = 400;
      throw error;
    }
    if (seen.has(lessonId)) {
      const error = new Error(`lesson ${lessonId} is included more than once`);
      error.status = 400;
      throw error;
    }
    seen.add(lessonId);
    if (
      String(lesson.invoiceId || "").trim()
      || ["invoiced", "free", "cancelled_on_time", "written_off"].includes(lesson.billingStatus)
    ) {
      const error = new Error(`lesson ${lessonId} is already billed or excluded`);
      error.status = 409;
      throw error;
    }
    if (!lessonIsBillable(lesson)) {
      const error = new Error(`lesson ${lessonId} is not completed`);
      error.status = 409;
      throw error;
    }
    const date = String(lesson.date || "").slice(0, 10);
    const parsedDate = new Date(`${date}T12:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
      || Number.isNaN(parsedDate.getTime())
      || parsedDate.toISOString().slice(0, 10) !== date
    ) {
      const error = new Error(`lesson ${lessonId} has an invalid date`);
      error.status = 409;
      throw error;
    }
    return {
      lessonId,
      date,
      description: lesson.billingStatus === "late_cancel_billable"
        ? `Hilinenud tühistamine ${date}`
        : `Keeletund ${date}`,
      quantity: 1,
      unit: "tund",
      unitPriceCents,
      unitPrice: centsToAmount(unitPriceCents),
      amountCents: unitPriceCents,
      amount: centsToAmount(unitPriceCents),
    };
  }).sort((a, b) => `${a.date}:${a.lessonId}`.localeCompare(`${b.date}:${b.lessonId}`));
  const amountCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  return {
    lines,
    lessonIds: lines.map(line => line.lessonId),
    lessonCount: lines.length,
    lessonPriceCents: unitPriceCents,
    lessonPrice: centsToAmount(unitPriceCents),
    amountCents,
    amount: centsToAmount(amountCents),
  };
}

function selectBillableLessons(lessons = [], lessonsSinceInvoice) {
  const candidates = (Array.isArray(lessons) ? lessons : [])
    .filter(lesson => lessonIsBillable(lesson))
    .sort((a, b) => `${a.date || ""}:${a.id || ""}`.localeCompare(`${b.date || ""}:${b.id || ""}`));
  const explicit = candidates.filter(lesson =>
    lesson.billingStatus === "unbilled"
    || lesson.billingStatus === "late_cancel_billable",
  );
  const legacy = candidates.filter(lesson => !lesson.billingStatus);
  const legacyCount = lessonsSinceInvoice === undefined || lessonsSinceInvoice === null
    ? legacy.length
    : Math.max(0, (Number(lessonsSinceInvoice) || 0) - explicit.length);
  const selectedLegacy = legacy.slice(Math.max(0, legacy.length - legacyCount));
  return [...explicit, ...selectedLegacy]
    .filter((lesson, index, list) => list.findIndex(item => item.id === lesson.id) === index)
    .sort((a, b) => `${a.date || ""}:${a.id || ""}`.localeCompare(`${b.date || ""}:${b.id || ""}`));
}

function invoiceFinancialPatch(invoice, payments, nowIso) {
  const amountCents = invoiceAmountCents(invoice);
  const paidAmountCents = activePaymentTotalCents(payments);
  const balanceDueCents = Math.max(0, amountCents - paidAmountCents);
  const overpaidAmountCents = Math.max(0, paidAmountCents - amountCents);
  const paymentStatus = paidAmountCents <= 0
    ? "unpaid"
    : balanceDueCents > 0
      ? "partial"
      : overpaidAmountCents > 0
        ? "overpaid"
        : "paid";

  return {
    amountCents,
    paidAmountCents,
    paidAmount: centsToAmount(paidAmountCents),
    balanceDueCents,
    balanceDue: centsToAmount(balanceDueCents),
    overpaidAmountCents,
    overpaidAmount: centsToAmount(overpaidAmountCents),
    paymentStatus,
    paymentCount: payments.filter(payment => payment && payment.status !== "voided").length,
    status: balanceDueCents === 0 && amountCents > 0 ? "Makstud" : "Ootel",
    paidAt: balanceDueCents === 0 && amountCents > 0
      ? (invoice.paidAt || nowIso.slice(0, 10))
      : null,
    parentPaymentStatus: balanceDueCents === 0 && amountCents > 0 ? "confirmed" : "pending",
    financialUpdatedAt: nowIso,
  };
}

module.exports = {
  activePaymentTotalCents,
  buildLessonInvoiceLines,
  centsToAmount,
  creditAfterApplication,
  creditAfterRestoration,
  invoiceAmountCents,
  invoiceFinancialPatch,
  lessonBillingDispositionPatch,
  lessonIsBillable,
  normalizeAllocations,
  selectBillableLessons,
  toCents,
};
