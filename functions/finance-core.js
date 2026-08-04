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

function validIsoMonth(value, field = "month") {
  const month = String(value || "").trim();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    const error = new Error(`${field} must be a valid YYYY-MM month`);
    error.status = 400;
    throw error;
  }
  return month;
}

function recordIsoDate(value) {
  if (!value) return "";
  if (typeof value === "string") {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : "";
  }
  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString().slice(0, 10);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return "";
}

function recordMonth(value) {
  return recordIsoDate(value).slice(0, 7);
}

function nonNegativeCents(record, centsField, amountField) {
  const centsValue = Number(record?.[centsField]);
  if (Number.isInteger(centsValue)) return Math.max(0, centsValue);
  return Math.max(0, Math.round((Number(record?.[amountField]) || 0) * 100));
}

function paymentLineAllocationPlan({
  payment,
  invoice,
  allocations = [],
  allocatedByLesson = {},
  effectiveDate,
  reason,
  previousAllocation = null,
} = {}) {
  if (!payment?.id || !invoice?.id) {
    const error = new Error("payment and invoice required");
    error.status = 400;
    throw error;
  }
  if (String(payment.invoiceId || "") !== String(invoice.id)) {
    const error = new Error("payment does not belong to invoice");
    error.status = 409;
    throw error;
  }
  if (payment.status === "voided" || paymentNetAmountCents(payment) <= 0) {
    const error = new Error("payment is not active");
    error.status = 409;
    throw error;
  }
  const cleanEffectiveDate = validIsoDate(effectiveDate, "effectiveDate");
  const paymentDate = recordIsoDate(payment.paidAt || payment.createdAt);
  if (paymentDate && cleanEffectiveDate < paymentDate) {
    const error = new Error("effectiveDate cannot be before the payment date");
    error.status = 400;
    throw error;
  }
  const cleanReason = String(reason || "").trim().slice(0, 500);
  if (previousAllocation && !cleanReason) {
    const error = new Error("Reason required for an allocation correction");
    error.status = 400;
    throw error;
  }
  const correctedLessonIds = new Set((invoice.correctedLessonIds || []).map(String));
  const activeLines = (Array.isArray(invoice.lines) ? invoice.lines : [])
    .map((line, index) => ({
      ...line,
      invoiceLineIndex: index,
      lessonId: String(line?.lessonId || ""),
      lineAmountCents: nonNegativeCents(line, "amountCents", "amount"),
    }))
    .filter(line => line.lessonId && !correctedLessonIds.has(line.lessonId));
  if (!activeLines.length) {
    const error = new Error("invoice has no active immutable lesson lines");
    error.status = 409;
    throw error;
  }
  const lineByLesson = new Map(activeLines.map(line => [line.lessonId, line]));
  const requested = Array.isArray(allocations) ? allocations : [];
  if (!requested.length) {
    const error = new Error("at least one lesson allocation required");
    error.status = 400;
    throw error;
  }
  const seen = new Set();
  const lines = requested.map(item => {
    const lessonId = String(item?.lessonId || "").trim();
    if (!lessonId || seen.has(lessonId)) {
      const error = new Error("lesson allocations must contain unique lesson IDs");
      error.status = 400;
      throw error;
    }
    seen.add(lessonId);
    const line = lineByLesson.get(lessonId);
    if (!line) {
      const error = new Error(`lesson ${lessonId} is not an active line of this invoice`);
      error.status = 409;
      throw error;
    }
    const allocatedAmountCents = toCents(item.amount, `allocation for lesson ${lessonId}`);
    const alreadyAllocatedCents = Math.max(
      0,
      Number(allocatedByLesson?.[lessonId]) || 0,
    );
    const availableCents = Math.max(0, line.lineAmountCents - alreadyAllocatedCents);
    if (allocatedAmountCents > availableCents) {
      const error = new Error(`allocation for lesson ${lessonId} exceeds its available amount`);
      error.status = 409;
      throw error;
    }
    return {
      lessonId,
      invoiceLineIndex: line.invoiceLineIndex,
      lessonDate: recordIsoDate(line.date),
      description: String(line.description || line.title || "").slice(0, 300),
      lineAmountCents: line.lineAmountCents,
      allocatedAmountCents,
    };
  });
  const paymentAmountCents = paymentNetAmountCents(payment);
  const allocatedAmountCents = lines.reduce(
    (sum, line) => sum + line.allocatedAmountCents,
    0,
  );
  if (allocatedAmountCents > paymentAmountCents) {
    const error = new Error("lesson allocations exceed the payment amount");
    error.status = 409;
    throw error;
  }
  return {
    version: Math.max(0, Number(previousAllocation?.version) || 0) + 1,
    supersedesAllocationId: previousAllocation?.id || "",
    effectiveDate: cleanEffectiveDate,
    reason: cleanReason || "Initial exact lesson allocation",
    paymentAmountCents,
    allocatedAmountCents,
    unallocatedAmountCents: paymentAmountCents - allocatedAmountCents,
    lines,
  };
}

function financialPeriodReviewSnapshot({
  month,
  invoices = [],
  payments = [],
  bankTransactions = [],
  lessons = [],
  paymentLineAllocations = [],
} = {}) {
  const reviewMonth = validIsoMonth(month);
  const invoiceList = Array.isArray(invoices) ? invoices : [];
  const paymentList = Array.isArray(payments) ? payments : [];
  const bankList = Array.isArray(bankTransactions) ? bankTransactions : [];
  const lessonList = Array.isArray(lessons) ? lessons : [];
  const allocationList = Array.isArray(paymentLineAllocations) ? paymentLineAllocations : [];
  const allocationById = new Map(
    allocationList.filter(item => item?.id).map(item => [String(item.id), item]),
  );
  const invoiceById = new Map(
    invoiceList.filter(item => item?.id).map(item => [String(item.id), item]),
  );
  const lessonById = new Map(
    lessonList.filter(item => item?.id).map(item => [String(item.id), item]),
  );
  const periodLessons = lessonList.filter(lesson => recordMonth(lesson?.date) === reviewMonth);
  const periodLessonIds = new Set(periodLessons.map(lesson => String(lesson.id || "")).filter(Boolean));
  const periodInvoices = invoiceList.filter(invoice =>
    recordMonth(invoice?.date || invoice?.issuedAt || invoice?.createdAt) === reviewMonth
    || (Array.isArray(invoice?.lines) && invoice.lines.some(line =>
      recordMonth(line?.date) === reviewMonth || periodLessonIds.has(String(line?.lessonId || "")),
    )),
  );
  const periodInvoiceIds = new Set(periodInvoices.map(invoice => String(invoice.id || "")).filter(Boolean));
  const activePayments = paymentList.filter(payment =>
    payment && payment.status !== "voided" && paymentNetAmountCents(payment) > 0,
  );
  const paymentsByInvoice = new Map();
  activePayments.forEach(payment => {
    const invoiceId = String(payment.invoiceId || "");
    if (!paymentsByInvoice.has(invoiceId)) paymentsByInvoice.set(invoiceId, []);
    paymentsByInvoice.get(invoiceId).push(payment);
  });
  const issues = [];
  const addIssue = (type, severity, entityId, detail) => {
    issues.push({
      type,
      severity,
      entityId: String(entityId || ""),
      detail: String(detail || "").slice(0, 300),
    });
  };
  const lineOwners = new Map();
  const exactLessonIds = new Set();

  invoiceList.forEach(invoice => {
    const invoiceId = String(invoice.id || "");
    const lines = Array.isArray(invoice.lines) ? invoice.lines : [];
    if (!lines.length) return;
    const correctedLessonIds = new Set((invoice.correctedLessonIds || []).map(String));
    const seenLessonIds = new Set();
    lines.forEach(line => {
      const lessonId = String(line?.lessonId || "");
      if (!lessonId) return;
      if (!lineOwners.has(lessonId)) lineOwners.set(lessonId, []);
      lineOwners.get(lessonId).push(invoiceId);
      if (seenLessonIds.has(lessonId) && (periodLessonIds.has(lessonId) || periodInvoiceIds.has(invoiceId))) {
        addIssue("duplicate_lesson_line", "error", lessonId, `invoice:${invoiceId}`);
      }
      seenLessonIds.add(lessonId);
      const lesson = lessonById.get(lessonId);
      if (!lesson && (recordMonth(line?.date) === reviewMonth || periodInvoiceIds.has(invoiceId))) {
        addIssue("invoice_line_missing_lesson", "error", lessonId, `invoice:${invoiceId}`);
        return;
      }
      if (!lesson || !periodLessonIds.has(lessonId)) return;
      const linkExact = String(lesson.invoiceId || "") === invoiceId
        && ["invoiced", "credited"].includes(String(lesson.billingStatus || ""));
      if (!linkExact) {
        addIssue("lesson_invoice_link_mismatch", "error", lessonId, `invoice:${invoiceId}`);
      } else {
        exactLessonIds.add(lessonId);
      }
    });
    if (!periodInvoiceIds.has(invoiceId)) return;
    const activeLines = lines.filter(line =>
      line?.lessonId && !correctedLessonIds.has(String(line.lessonId)),
    );
    const activeLineTotalCents = activeLines.reduce(
      (sum, line) => sum + nonNegativeCents(line, "amountCents", "amount"),
      0,
    );
    const effectiveAmountCents = invoiceAmountCents(invoice);
    if (Math.abs(activeLineTotalCents - effectiveAmountCents) > 1) {
      addIssue(
        "invoice_line_total_mismatch",
        "error",
        invoiceId,
        `lines:${activeLineTotalCents};invoice:${effectiveAmountCents}`,
      );
    }
    const invoicePayments = paymentsByInvoice.get(invoiceId) || [];
    const ledgerPaidCents = invoicePayments.reduce(
      (sum, payment) => sum + paymentNetAmountCents(payment),
      0,
    );
    const hasSnapshot = invoice.paidAmountCents !== undefined || invoice.paidAmount !== undefined;
    const snapshotPaidCents = hasSnapshot
      ? nonNegativeCents(invoice, "paidAmountCents", "paidAmount")
      : invoice.status === "Makstud"
        ? effectiveAmountCents
        : 0;
    if (snapshotPaidCents > 0 && invoicePayments.length === 0) {
      addIssue("invoice_paid_without_payment_records", "error", invoiceId, `snapshot:${snapshotPaidCents}`);
    } else if (hasSnapshot && Math.abs(snapshotPaidCents - ledgerPaidCents) > 1) {
      addIssue(
        "invoice_payment_snapshot_mismatch",
        "error",
        invoiceId,
        `snapshot:${snapshotPaidCents};ledger:${ledgerPaidCents}`,
      );
    }
    if (ledgerPaidCents - activeLineTotalCents > 1) {
      addIssue(
        "payment_exceeds_lesson_lines",
        "error",
        invoiceId,
        `payments:${ledgerPaidCents};lines:${activeLineTotalCents}`,
      );
    }
  });

  lineOwners.forEach((owners, lessonId) => {
    const distinctOwners = [...new Set(owners.filter(Boolean))];
    if (periodLessonIds.has(lessonId) && distinctOwners.length > 1) {
      addIssue("lesson_in_multiple_invoices", "error", lessonId, distinctOwners.join(","));
    }
  });

  const periodPayments = activePayments.filter(payment =>
    recordMonth(payment?.paidAt || payment?.createdAt) === reviewMonth,
  );
  periodPayments.filter(payment => payment.kind === "direct_lesson").forEach(payment => {
    const lessonId = String(payment.lessonId || "");
    const lesson = lessonById.get(lessonId);
    const amountCents = paymentNetAmountCents(payment);
    if (
      !lesson
      || lesson.billingStatus !== "paid_directly"
      || String(lesson.directPaymentId || "") !== String(payment.id || "")
      || nonNegativeCents(lesson, "directPaymentAmountCents", "directPaymentAmount") !== amountCents
    ) {
      addIssue("direct_lesson_payment_invalid", "error", payment.id, `lesson:${lessonId}`);
    } else {
      exactLessonIds.add(lessonId);
    }
  });

  let unbilledLessonCount = 0;
  let legacyLessonCount = 0;
  periodLessons.forEach(lesson => {
    const lessonId = String(lesson.id || "");
    const billingStatus = String(lesson.billingStatus || "");
    const packageStatus = String(lesson.packageConsumptionStatus || "");
    const lessonStatus = String(lesson.status || "");
    if (packageStatus === "needs_attention") {
      unbilledLessonCount += 1;
      addIssue("package_needs_attention", "attention", lessonId, lesson.studentName || "");
      return;
    }
    if (packageStatus === "consumed"
      || ["free", "cancelled_on_time", "written_off", "credited", "paid_directly"].includes(billingStatus)) {
      if (billingStatus === "paid_directly" && !exactLessonIds.has(lessonId)) {
        addIssue("direct_lesson_payment_missing", "error", lessonId, String(lesson.directPaymentId || ""));
      }
      return;
    }
    if (["Puudus_p", "Puudus_eta"].includes(lessonStatus) && !billingStatus) {
      unbilledLessonCount += 1;
      addIssue("absence_billing_disposition_missing", "attention", lessonId, lesson.studentName || "");
      return;
    }
    if (lesson.invoiceId || billingStatus === "invoiced") {
      if (!exactLessonIds.has(lessonId)) {
        legacyLessonCount += 1;
        addIssue("legacy_invoice_without_lesson_line", "warning", lessonId, String(lesson.invoiceId || ""));
      }
      return;
    }
    if (
      billingStatus === "late_cancel_billable"
      || billingStatus === "unbilled"
      || (lessonStatus === "Toimunud" && !billingStatus)
    ) {
      unbilledLessonCount += 1;
      addIssue("unbilled_lesson", "attention", lessonId, lesson.studentName || "");
    }
  });

  periodPayments.forEach(payment => {
    if (payment.kind === "direct_lesson") return;
    if (!invoiceById.has(String(payment.invoiceId || ""))) {
      addIssue("payment_without_invoice", "error", payment.id, String(payment.invoiceId || ""));
    }
  });
  const exactAllocatedByLine = new Map();
  activePayments.filter(payment => payment.lineAllocationId).forEach(payment => {
    const invoiceId = String(payment.invoiceId || "");
    const isPeriodRelevant = periodInvoiceIds.has(invoiceId)
      || periodPayments.some(item => String(item.id || "") === String(payment.id || ""));
    if (!isPeriodRelevant) return;
    const allocation = allocationById.get(String(payment.lineAllocationId));
    if (
      !allocation
      || String(allocation.paymentId || "") !== String(payment.id || "")
      || String(allocation.invoiceId || "") !== String(payment.invoiceId || "")
      || Number(allocation.version || 0) !== Number(payment.lineAllocationVersion || 0)
    ) {
      addIssue(
        "payment_line_allocation_invalid",
        "error",
        payment.id,
        String(payment.lineAllocationId || ""),
      );
      return;
    }
    const invoice = invoiceById.get(invoiceId);
    const correctedLessonIds = new Set((invoice?.correctedLessonIds || []).map(String));
    const activeLineByLesson = new Map(
      (Array.isArray(invoice?.lines) ? invoice.lines : [])
        .map((line, index) => ({ line, index }))
        .filter(item => item.line?.lessonId && !correctedLessonIds.has(String(item.line.lessonId)))
        .map(item => [String(item.line.lessonId), {
          amountCents: nonNegativeCents(item.line, "amountCents", "amount"),
          invoiceLineIndex: item.index,
        }]),
    );
    let allocatedCents = 0;
    const seenLessonIds = new Set();
    (Array.isArray(allocation.lines) ? allocation.lines : []).forEach(line => {
      const lessonId = String(line?.lessonId || "");
      const lineAllocatedCents = Math.max(0, Number(line?.allocatedAmountCents) || 0);
      allocatedCents += lineAllocatedCents;
      const lineKey = `${invoiceId}:${lessonId}`;
      const previous = exactAllocatedByLine.get(lineKey) || 0;
      const invoiceLine = activeLineByLesson.get(lessonId);
      if (
        !lessonId
        || seenLessonIds.has(lessonId)
        || !invoiceLine
        || lineAllocatedCents <= 0
        || previous + lineAllocatedCents > invoiceLine.amountCents
        || Number(line?.lineAmountCents) !== invoiceLine.amountCents
        || Number(line?.invoiceLineIndex) !== invoiceLine.invoiceLineIndex
      ) {
        addIssue(
          "payment_line_allocation_invalid",
          "error",
          payment.id,
          `lesson:${lessonId};allocated:${lineAllocatedCents}`,
        );
        return;
      }
      seenLessonIds.add(lessonId);
      exactAllocatedByLine.set(lineKey, previous + lineAllocatedCents);
    });
    if (
      allocatedCents !== nonNegativeCents(allocation, "allocatedAmountCents", "allocatedAmount")
      || allocatedCents > paymentNetAmountCents(payment)
      || nonNegativeCents(allocation, "unallocatedAmountCents", "unallocatedAmount")
        !== Math.max(0, paymentNetAmountCents(payment) - allocatedCents)
      || Number(payment.lineAllocatedAmountCents) !== allocatedCents
      || Number(payment.lineUnallocatedAmountCents)
        !== Math.max(0, paymentNetAmountCents(payment) - allocatedCents)
      || String(payment.allocationMethod || "") !== "explicit_invoice_lines_v1"
      || !recordIsoDate(allocation.effectiveDate)
    ) {
      addIssue(
        "payment_line_allocation_invalid",
        "error",
        payment.id,
        `lines:${allocatedCents};payment:${paymentNetAmountCents(payment)}`,
      );
      return;
    }
    const unallocatedCents = Math.max(0, paymentNetAmountCents(payment) - allocatedCents);
    if (unallocatedCents > 1) {
      addIssue(
        "payment_line_allocation_incomplete",
        "attention",
        payment.id,
        `unallocated:${unallocatedCents}`,
      );
    }
  });
  const periodBanks = bankList.filter(transaction =>
    recordMonth(transaction?.paidAt || transaction?.createdAt) === reviewMonth,
  );
  periodBanks.forEach(transaction => {
    const amountCents = nonNegativeCents(transaction, "amountCents", "amount");
    const allocatedCents = nonNegativeCents(transaction, "allocatedAmountCents", "allocatedAmount");
    const unappliedCents = nonNegativeCents(transaction, "unappliedAmountCents", "unappliedAmount");
    if (Math.abs(amountCents - allocatedCents - unappliedCents) > 1) {
      addIssue(
        "bank_balance_mismatch",
        "error",
        transaction.id,
        `amount:${amountCents};allocated:${allocatedCents};unapplied:${unappliedCents}`,
      );
    } else if (unappliedCents > 0) {
      addIssue("bank_unapplied", "attention", transaction.id, `unapplied:${unappliedCents}`);
    }
  });

  const blockingIssues = issues.filter(issue => ["error", "attention"].includes(issue.severity));
  const issuedCents = periodInvoices.reduce((sum, invoice) => sum + invoiceAmountCents(invoice), 0);
  const paymentsCents = periodPayments.reduce(
    (sum, payment) => sum + paymentNetAmountCents(payment),
    0,
  );
  const bankReceivedCents = periodBanks.reduce(
    (sum, transaction) => sum + nonNegativeCents(transaction, "amountCents", "amount"),
    0,
  );
  const bankUnappliedCents = periodBanks.reduce(
    (sum, transaction) => sum + nonNegativeCents(transaction, "unappliedAmountCents", "unappliedAmount"),
    0,
  );
  const summary = {
    invoiceCount: periodInvoices.length,
    issuedCents,
    paymentCount: periodPayments.length,
    paymentsCents,
    bankTransactionCount: periodBanks.length,
    bankReceivedCents,
    bankUnappliedCents,
    lessonCount: periodLessons.length,
    exactLessonLinkCount: exactLessonIds.size,
    unbilledLessonCount,
    legacyLessonCount,
    errorCount: issues.filter(issue => issue.severity === "error").length,
    attentionCount: issues.filter(issue => issue.severity === "attention").length,
    warningCount: issues.filter(issue => issue.severity === "warning").length,
    blockingIssueCount: blockingIssues.length,
  };
  return {
    month: reviewMonth,
    scope: "billing_control_v2",
    dataVersion: 2,
    canReview: blockingIssues.length === 0,
    summary,
    issues,
  };
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

const PAYMENT_DOCUMENT_CONTENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function paymentDocumentRecord({
  paymentId,
  documentId,
  storagePath,
  fileName,
  contentType,
  size,
  uploadedAt,
} = {}) {
  const cleanPaymentId = String(paymentId || "").trim();
  const cleanDocumentId = String(documentId || "").trim();
  if (!/^[A-Za-z0-9_-]{1,160}$/.test(cleanPaymentId)) {
    const error = new Error("valid paymentId required");
    error.status = 400;
    throw error;
  }
  if (!/^[A-Za-z0-9_-]{12,120}$/.test(cleanDocumentId)) {
    const error = new Error("valid documentId required");
    error.status = 400;
    throw error;
  }
  const expectedPath = `financial/payment-orders/${cleanPaymentId}/${cleanDocumentId}`;
  if (String(storagePath || "").trim() !== expectedPath) {
    const error = new Error("payment document storage path does not match its payment");
    error.status = 400;
    throw error;
  }
  const cleanFileName = String(fileName || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 180);
  if (!cleanFileName) {
    const error = new Error("payment document fileName required");
    error.status = 400;
    throw error;
  }
  const cleanContentType = String(contentType || "").trim().toLowerCase();
  if (!PAYMENT_DOCUMENT_CONTENT_TYPES.has(cleanContentType)) {
    const error = new Error("payment document must be PDF, JPEG, PNG, or WebP");
    error.status = 400;
    throw error;
  }
  const byteSize = Number(size);
  if (!Number.isInteger(byteSize) || byteSize <= 0 || byteSize > 10 * 1024 * 1024) {
    const error = new Error("payment document must be between 1 byte and 10 MB");
    error.status = 400;
    throw error;
  }
  return {
    id: cleanDocumentId,
    kind: "payment_order",
    paymentId: cleanPaymentId,
    storagePath: expectedPath,
    fileName: cleanFileName,
    contentType: cleanContentType,
    size: byteSize,
    uploadedAt: String(uploadedAt || ""),
  };
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

function normalizeBankDistribution(transactionAmount, invoiceAllocations = [], lessonAllocations = []) {
  const invoicePlan = normalizeAllocations(transactionAmount, invoiceAllocations);
  if (!Array.isArray(lessonAllocations)) {
    const error = new Error("lessonAllocations must be an array");
    error.status = 400;
    throw error;
  }
  if (lessonAllocations.length > 100) {
    const error = new Error("at most 100 lesson allocations are allowed");
    error.status = 400;
    throw error;
  }
  const seenLessonIds = new Set();
  const lessons = lessonAllocations.map((allocation, index) => {
    const lessonId = String(allocation?.lessonId || "").trim();
    if (!lessonId) {
      const error = new Error(`lessonAllocations[${index}].lessonId required`);
      error.status = 400;
      throw error;
    }
    if (seenLessonIds.has(lessonId)) {
      const error = new Error(`lesson ${lessonId} is allocated more than once`);
      error.status = 400;
      throw error;
    }
    seenLessonIds.add(lessonId);
    return {
      lessonId,
      amountCents: toCents(allocation?.amount, `lessonAllocations[${index}].amount`),
    };
  });
  const lessonAllocatedAmountCents = lessons.reduce(
    (sum, allocation) => sum + allocation.amountCents,
    0,
  );
  const allocatedAmountCents = invoicePlan.allocatedAmountCents + lessonAllocatedAmountCents;
  if (allocatedAmountCents > invoicePlan.transactionAmountCents) {
    const error = new Error("allocated amount exceeds bank transaction amount");
    error.status = 400;
    throw error;
  }
  return {
    transactionAmountCents: invoicePlan.transactionAmountCents,
    invoiceAllocations: invoicePlan.allocations,
    lessonAllocations: lessons,
    invoiceAllocatedAmountCents: invoicePlan.allocatedAmountCents,
    lessonAllocatedAmountCents,
    allocatedAmountCents,
    unappliedAmountCents: invoicePlan.transactionAmountCents - allocatedAmountCents,
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
    || lesson.billingStatus === "late_cancel_billable"
    || lesson.accountingSource === "crm_v2",
  );
  const legacy = candidates.filter(lesson =>
    !lesson.billingStatus && lesson.accountingSource !== "crm_v2",
  );
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
  normalizeBankDistribution,
  packageBalanceAfterEntry,
  packageBalanceAfterLessonMovement,
  paymentDocumentRecord,
  paymentLineAllocationPlan,
  paymentNetAmountCents,
  financialPeriodReviewSnapshot,
  planInvoiceOverpaymentTransfer,
  positiveInteger,
  selectStudentPackageForLesson,
  selectBillableLessons,
  tariffAssignmentPlan,
  toCents,
  validIsoDate,
  validIsoMonth,
  resolveLessonPricing,
};
