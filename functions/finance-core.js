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

function validIsoDate(value, field = "date") {
  const date = String(value || "").trim();
  const parsed = new Date(`${date}T12:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
    || Number.isNaN(parsed.getTime())
    || parsed.toISOString().slice(0, 10) !== date
  ) {
    const error = new Error(`${field} must be a valid YYYY-MM-DD date`);
    error.status = 400;
    throw error;
  }
  return date;
}

function previousIsoDate(value) {
  const date = validIsoDate(value);
  const parsed = new Date(`${date}T12:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() - 1);
  return parsed.toISOString().slice(0, 10);
}

function positiveInteger(value, field = "value", max = 10000) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0 || number > max) {
    const error = new Error(`${field} must be a positive integer not greater than ${max}`);
    error.status = 400;
    throw error;
  }
  return number;
}

function packageBalanceAfterEntry(packageAccount = {}, creditsDelta, nowIso) {
  const delta = Number(creditsDelta);
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 500) {
    const error = new Error("package credits delta must be a non-zero integer between -500 and 500");
    error.status = 400;
    throw error;
  }
  const balanceBefore = Number(packageAccount.balanceCredits);
  if (!Number.isInteger(balanceBefore) || balanceBefore < 0) {
    const error = new Error("package account has an invalid balance");
    error.status = 409;
    throw error;
  }
  const balanceAfter = balanceBefore + delta;
  if (balanceAfter < 0) {
    const error = new Error("package has insufficient lesson credits");
    error.status = 409;
    throw error;
  }
  return {
    balanceBefore,
    balanceAfter,
    accountPatch: {
      balanceCredits: balanceAfter,
      adjustmentCreditCredits:
        (Number(packageAccount.adjustmentCreditCredits) || 0) + Math.max(0, delta),
      adjustmentDebitCredits:
        (Number(packageAccount.adjustmentDebitCredits) || 0) + Math.max(0, -delta),
      ledgerEntryCount: (Number(packageAccount.ledgerEntryCount) || 0) + 1,
      status: balanceAfter === 0 ? "depleted" : "active",
      updatedAt: nowIso,
    },
  };
}

function selectStudentPackageForLesson(
  studentPackages = [],
  { lessonDate, requestedPackageId = "", preferredPackageId = "" } = {},
) {
  const date = validIsoDate(lessonDate, "lesson date");
  const packages = (Array.isArray(studentPackages) ? studentPackages : [])
    .filter(studentPackage =>
      studentPackage
      && studentPackage.id
      && studentPackage.studentId
      && studentPackage.productType === "lesson_package"
      && studentPackage.status === "active"
      && Number.isInteger(studentPackage.balanceCredits)
      && studentPackage.balanceCredits > 0
      && (!studentPackage.issuedAt || studentPackage.issuedAt <= date),
    )
    .sort((a, b) =>
      `${a.issuedAt || ""}:${a.createdAt || ""}:${a.id}`
        .localeCompare(`${b.issuedAt || ""}:${b.createdAt || ""}:${b.id}`),
    );
  const requestedId = String(requestedPackageId || "").trim();
  if (requestedId) {
    const requested = packages.find(studentPackage => studentPackage.id === requestedId);
    if (!requested) {
      const error = new Error("requested student package has no eligible lesson credits");
      error.status = 409;
      throw error;
    }
    return requested;
  }
  const preferredId = String(preferredPackageId || "").trim();
  if (preferredId) {
    const preferred = packages.find(studentPackage => studentPackage.id === preferredId);
    if (preferred) return preferred;
  }
  return packages[0] || null;
}

function packageBalanceAfterLessonMovement(packageAccount = {}, movement, nowIso) {
  const direction = String(movement || "");
  if (!["consume", "restore"].includes(direction)) {
    const error = new Error("package lesson movement must be consume or restore");
    error.status = 400;
    throw error;
  }
  const balanceBefore = Number(packageAccount.balanceCredits);
  const consumedBefore = Number(packageAccount.consumedCredits) || 0;
  if (!Number.isInteger(balanceBefore) || balanceBefore < 0 || !Number.isInteger(consumedBefore)) {
    const error = new Error("package account has invalid lesson balances");
    error.status = 409;
    throw error;
  }
  if (direction === "consume" && balanceBefore <= 0) {
    const error = new Error("package has insufficient lesson credits");
    error.status = 409;
    throw error;
  }
  if (direction === "restore" && consumedBefore <= 0) {
    const error = new Error("package has no consumed lesson credit to restore");
    error.status = 409;
    throw error;
  }
  const creditsDelta = direction === "consume" ? -1 : 1;
  const balanceAfter = balanceBefore + creditsDelta;
  const consumedAfter = consumedBefore - creditsDelta;
  return {
    creditsDelta,
    balanceBefore,
    balanceAfter,
    consumedBefore,
    consumedAfter,
    accountPatch: {
      balanceCredits: balanceAfter,
      consumedCredits: consumedAfter,
      ledgerEntryCount: (Number(packageAccount.ledgerEntryCount) || 0) + 1,
      status: balanceAfter === 0 ? "depleted" : "active",
      updatedAt: nowIso,
    },
  };
}

function tariffAssignmentPlan(existingAssignments = [], effectiveFrom) {
  const startDate = validIsoDate(effectiveFrom, "effectiveFrom");
  const sorted = (Array.isArray(existingAssignments) ? existingAssignments : [])
    .filter(assignment => assignment && assignment.id && assignment.effectiveFrom)
    .sort((a, b) =>
      `${a.effectiveFrom}:${a.createdAt || ""}:${a.id}`
        .localeCompare(`${b.effectiveFrom}:${b.createdAt || ""}:${b.id}`),
    );
  const previous = sorted.at(-1) || null;
  if (previous && startDate <= previous.effectiveFrom) {
    const error = new Error("new tariff assignment must start after the latest assignment");
    error.status = 409;
    throw error;
  }
  const previousEffectiveUntil = previous ? previousIsoDate(startDate) : "";
  if (
    previous
    && previous.effectiveUntil
    && previous.effectiveUntil < previousEffectiveUntil
  ) {
    return {
      effectiveFrom: startDate,
      previousAssignmentId: "",
      previousEffectiveUntil: "",
    };
  }
  return {
    effectiveFrom: startDate,
    previousAssignmentId: previous?.id || "",
    previousEffectiveUntil,
  };
}

function resolveLessonPricing(lessons = [], assignments = [], legacyLessonPrice) {
  const sortedAssignments = (Array.isArray(assignments) ? assignments : [])
    .filter(assignment =>
      assignment
      && assignment.id
      && assignment.effectiveFrom
      && (!assignment.billingModel || assignment.billingModel === "per_lesson"),
    )
    .sort((a, b) =>
      `${a.effectiveFrom}:${a.createdAt || ""}:${a.id}`
        .localeCompare(`${b.effectiveFrom}:${b.createdAt || ""}:${b.id}`),
    );
  let legacyPriceCents = null;
  const legacyPricing = () => {
    if (legacyPriceCents === null) {
      legacyPriceCents = toCents(legacyLessonPrice, "lesson price");
    }
    return {
      pricingSource: "legacy_student_price",
      unitPriceCents: legacyPriceCents,
      unitPrice: centsToAmount(legacyPriceCents),
    };
  };
  return Object.fromEntries((Array.isArray(lessons) ? lessons : []).map(lesson => {
    const lessonId = String(lesson?.id || "").trim();
    const lessonDate = validIsoDate(lesson?.date, `lesson ${lessonId || "unknown"} date`);
    const assignment = [...sortedAssignments].reverse().find(item =>
      item.effectiveFrom <= lessonDate
      && (!item.effectiveUntil || lessonDate <= item.effectiveUntil),
    );
    if (!assignment) return [lessonId, legacyPricing()];
    const unitPriceCents = Number.isInteger(assignment.unitPriceCents)
      ? assignment.unitPriceCents
      : toCents(assignment.unitPrice, "tariff unit price");
    if (unitPriceCents <= 0) {
      const error = new Error(`tariff assignment ${assignment.id} has an invalid unit price`);
      error.status = 409;
      throw error;
    }
    return [lessonId, {
      pricingSource: "tariff_assignment",
      unitPriceCents,
      unitPrice: centsToAmount(unitPriceCents),
      tariffId: String(assignment.tariffId || ""),
      tariffName: String(assignment.tariffName || ""),
      tariffAssignmentId: String(assignment.id || ""),
    }];
  }));
}

function invoiceAmountCents(invoice = {}) {
  if (Number.isInteger(invoice.effectiveAmountCents) && invoice.effectiveAmountCents >= 0) {
    return invoice.effectiveAmountCents;
  }
  if (Number.isInteger(invoice.amountCents) && invoice.amountCents >= 0) {
    return invoice.amountCents;
  }
  return Math.max(0, Math.round((Number(invoice.amount) || 0) * 100));
}

function invoiceOriginalAmountCents(invoice = {}) {
  const hasAmount = invoice.amount !== undefined
    && invoice.amount !== null
    && invoice.amount !== "";
  const amount = Number(invoice.amount);
  if (hasAmount && Number.isFinite(amount) && amount >= 0) return Math.round(amount * 100);
  if (Number.isInteger(invoice.amountCents) && invoice.amountCents >= 0) {
    return invoice.amountCents;
  }
  return 0;
}

function invoiceAfterLessonCredit(invoice = {}, line = {}) {
  const lessonId = String(line.lessonId || "").trim();
  const lineAmountCents = Number(line.amountCents) || Math.round((Number(line.amount) || 0) * 100);
  if (!lessonId || lineAmountCents <= 0) {
    const error = new Error("valid lesson invoice line required");
    error.status = 400;
    throw error;
  }
  if ((invoice.correctedLessonIds || []).includes(lessonId)) {
    const error = new Error("lesson invoice line is already credited");
    error.status = 409;
    throw error;
  }
  const originalAmountCents = invoiceOriginalAmountCents(invoice);
  const creditedAmountCents = (Number(invoice.creditedAmountCents) || 0) + lineAmountCents;
  const effectiveAmountCents = originalAmountCents - creditedAmountCents;
  if (effectiveAmountCents < 0) {
    const error = new Error("credit exceeds original invoice amount");
    error.status = 409;
    throw error;
  }
  return {
    creditedAmountCents,
    creditedAmount: centsToAmount(creditedAmountCents),
    effectiveAmountCents,
    effectiveAmount: centsToAmount(effectiveAmountCents),
    correctedLessonIds: [...(invoice.correctedLessonIds || []), lessonId],
  };
}

function paymentNetAmountCents(payment = {}) {
  const grossAmountCents = Number.isInteger(payment.amountCents)
    ? payment.amountCents
    : Math.round((Number(payment.amount) || 0) * 100);
  const resolvedAmountCents = Number.isInteger(payment.resolvedAmountCents)
    ? payment.resolvedAmountCents
    : Math.round((Number(payment.resolvedAmount) || 0) * 100);
  return Math.max(0, grossAmountCents - Math.max(0, resolvedAmountCents));
}

function activePaymentTotalCents(payments = []) {
  return payments.reduce((sum, payment) => {
    if (!payment || payment.status === "voided") return sum;
    return sum + paymentNetAmountCents(payment);
  }, 0);
}

function planInvoiceOverpaymentTransfer(invoice = {}, payments = []) {
  const overpaidAmountCents = Math.max(
    0,
    activePaymentTotalCents(payments) - invoiceAmountCents(invoice),
  );
  if (overpaidAmountCents <= 0) {
    const error = new Error("invoice has no overpayment to transfer");
    error.status = 409;
    throw error;
  }
  let remainingAmountCents = overpaidAmountCents;
  const allocations = payments
    .filter(payment =>
      payment
      && payment.status !== "voided"
      && !payment.sourceCreditId
      && payment.method !== "credit"
      && paymentNetAmountCents(payment) > 0,
    )
    .sort((a, b) =>
      `${b.createdAt || b.paidAt || ""}:${b.id || ""}`
        .localeCompare(`${a.createdAt || a.paidAt || ""}:${a.id || ""}`),
    )
    .map(payment => {
      if (remainingAmountCents <= 0) return null;
      const amountCents = Math.min(paymentNetAmountCents(payment), remainingAmountCents);
      remainingAmountCents -= amountCents;
      return {
        paymentId: String(payment.id || ""),
        amountCents,
      };
    })
    .filter(Boolean);
  if (remainingAmountCents > 0 || allocations.some(allocation => !allocation.paymentId)) {
    const error = new Error(
      "overpayment includes payer-credit payments; void those payments before transferring the remainder",
    );
    error.status = 409;
    throw error;
  }
  return { overpaidAmountCents, allocations };
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

function creditAfterRefund(credit = {}, refundAmountCents, nowIso) {
  const availableAmountCents = Number.isInteger(credit.availableAmountCents)
    ? credit.availableAmountCents
    : Math.max(0, Math.round((Number(credit.availableAmount) || 0) * 100));
  if (!Number.isInteger(refundAmountCents) || refundAmountCents <= 0) {
    const error = new Error("refund amount must be positive cents");
    error.status = 400;
    throw error;
  }
  if (refundAmountCents > availableAmountCents) {
    const error = new Error("refund amount exceeds available payer credit");
    error.status = 409;
    throw error;
  }
  const nextAvailableAmountCents = availableAmountCents - refundAmountCents;
  const refundedAmountCents = (Number(credit.refundedAmountCents) || 0) + refundAmountCents;
  return {
    availableAmountCents: nextAvailableAmountCents,
    availableAmount: centsToAmount(nextAvailableAmountCents),
    refundedAmountCents,
    refundedAmount: centsToAmount(refundedAmountCents),
    refundCount: (Number(credit.refundCount) || 0) + 1,
    status: nextAvailableAmountCents === 0 ? "closed" : "open",
    lastRefundedAt: nowIso,
    updatedAt: nowIso,
  };
}

function lessonIsBillable(lesson = {}) {
  if (String(lesson.invoiceId || "").trim() || lesson.billingStatus === "invoiced") return false;
  if (lesson.packageAccountingSource === "package_ledger_v1") return false;
  if (lesson.packageConsumptionStatus === "consumed") return false;
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
  if (lesson.packageConsumptionStatus === "consumed") {
    const error = new Error("package-covered lesson billing status cannot be changed");
    error.status = 409;
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

function buildLessonInvoiceLines(lessons = [], lessonPrice, assignments = []) {
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
    let date;
    try {
      date = validIsoDate(lesson.date, `lesson ${lessonId} date`);
    } catch (error) {
      error.status = 409;
      error.message = `lesson ${lessonId} has an invalid date`;
      throw error;
    }
    const pricing = resolveLessonPricing([lesson], assignments, lessonPrice)[lessonId];
    const unitPriceCents = pricing.unitPriceCents;
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
      pricingSource: pricing.pricingSource,
      ...(pricing.tariffId ? { tariffId: pricing.tariffId } : {}),
      ...(pricing.tariffName ? { tariffName: pricing.tariffName } : {}),
      ...(pricing.tariffAssignmentId
        ? { tariffAssignmentId: pricing.tariffAssignmentId }
        : {}),
    };
  }).sort((a, b) => `${a.date}:${a.lessonId}`.localeCompare(`${b.date}:${b.lessonId}`));
  const amountCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  const uniquePrices = [...new Set(lines.map(line => line.unitPriceCents))];
  const tariffAssignmentIds = [...new Set(
    lines.map(line => line.tariffAssignmentId).filter(Boolean),
  )];
  const tariffIds = [...new Set(lines.map(line => line.tariffId).filter(Boolean))];
  const tariffLineCount = lines.filter(line => line.pricingSource === "tariff_assignment").length;
  const pricingMode = tariffLineCount === lines.length
    ? "tariff_assignments_v1"
    : tariffLineCount > 0
      ? "mixed_tariff_legacy_v1"
      : "legacy_student_price";
  const lessonPriceCents = uniquePrices.length === 1 ? uniquePrices[0] : 0;
  return {
    lines,
    lessonIds: lines.map(line => line.lessonId),
    lessonCount: lines.length,
    lessonPriceCents,
    lessonPrice: centsToAmount(lessonPriceCents),
    amountCents,
    amount: centsToAmount(amountCents),
    pricingMode,
    tariffAssignmentIds,
    tariffIds,
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
    paidAmountCents,
    paidAmount: centsToAmount(paidAmountCents),
    balanceDueCents,
    balanceDue: centsToAmount(balanceDueCents),
    overpaidAmountCents,
    overpaidAmount: centsToAmount(overpaidAmountCents),
    paymentStatus,
    paymentCount: payments.filter(payment =>
      payment
      && payment.status !== "voided"
      && paymentNetAmountCents(payment) > 0,
    ).length,
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
  creditAfterRefund,
  creditAfterRestoration,
  invoiceAmountCents,
  invoiceAfterLessonCredit,
  invoiceOriginalAmountCents,
  invoiceFinancialPatch,
  lessonBillingDispositionPatch,
  lessonIsBillable,
  normalizeAllocations,
  packageBalanceAfterEntry,
  packageBalanceAfterLessonMovement,
  paymentNetAmountCents,
  planInvoiceOverpaymentTransfer,
  positiveInteger,
  selectStudentPackageForLesson,
  selectBillableLessons,
  tariffAssignmentPlan,
  toCents,
  validIsoDate,
  resolveLessonPricing,
};
