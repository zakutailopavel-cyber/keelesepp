import { requireFirebaseClient } from "./client.js";

const defaultBaseUrl =
  "https://us-central1-keelesepp-5136b.cloudfunctions.net/financeApi";
const defaultInvoiceBaseUrl =
  "https://us-central1-keelesepp-5136b.cloudfunctions.net/invoiceApi";

export function financeRequestId(prefix = "finance") {
  const random =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`.replace(/[^A-Za-z0-9_-]/g, "_");
}

async function post(path, body) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser)
    throw new Error("Aktiivne kasutajaseanss puudub. Logi uuesti sisse.");
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(
    import.meta.env.VITE_FINANCE_API_URL || defaultBaseUrl,
  ).replace(/\/$/, "");
  const response = await globalThis.fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Finantspäring ebaõnnestus.");
  return data;
}

// Duplicate cards and data quality live in staffOperationsApi on the server (financeApi has no such routes).
const defaultStaffOperationsUrl =
  "https://us-central1-keelesepp-5136b.cloudfunctions.net/staffOperationsApi";

async function postStaff(path, body) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser)
    throw new Error("Aktiivne kasutajaseanss puudub. Logi uuesti sisse.");
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(
    import.meta.env.VITE_STAFF_OPERATIONS_API_URL || defaultStaffOperationsUrl,
  ).replace(/\/$/, "");
  const response = await globalThis.fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Päring ebaõnnestus.");
  return data;
}

async function postInvoice(path, body) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser)
    throw new Error("Aktiivne kasutajaseanss puudub. Logi uuesti sisse.");
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(
    import.meta.env.VITE_INVOICE_API_URL || defaultInvoiceBaseUrl,
  ).replace(/\/$/, "");
  const response = await globalThis.fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Arve saatmine ebaõnnestus.");
  return data;
}

export const financeApi = {
  // Removes a lesson mark and reverses its package/counter bookkeeping (refused for invoiced lessons).
  deleteLessonJournal(lessonId) {
    return post("/lessons/journal/delete", { lessonId, requestId: financeRequestId("lesson-delete") });
  },
  // Finance v2 §1: move lesson prices off student cards into the private revenue plans
  previewPricePrivacy() {
    return post("/students/price-privacy/preview", {});
  },
  applyPricePrivacy() {
    return post("/students/price-privacy/apply", {});
  },
  previewDataQuality() {
    return postStaff("/data-quality/preview", {});
  },
  // the student card merge is accountApprovalsService.mergeStudents (/students/merge-cards); cards are never deleted
  // bookkeeping (functions/accounting-core.js, docs/ACCOUNTING.md)
  syncAccounting() {
    return post("/accounting/sync", {});
  },
  createAccountingEntry(entry) {
    return post("/accounting/entries", { entry, requestId: financeRequestId("accounting_entry") });
  },
  reverseAccountingEntry(entryId, date, reason) {
    return post("/accounting/entries/reverse", { entryId, date, reason, requestId: financeRequestId("accounting_storno") });
  },
  setAccountingOpening(balances) {
    return post("/accounting/opening", { balances, requestId: financeRequestId("accounting_opening") });
  },
  saveAccountingAccount(account) {
    return post("/accounting/accounts", { account });
  },
  updateAccountingEntry(entryId, entry, reason) {
    return post("/accounting/entries/update", { entryId, entry, reason, requestId: financeRequestId("accounting_update") });
  },
  deleteAccountingEntry(entryId, reason) {
    return post("/accounting/entries/delete", { entryId, reason, requestId: financeRequestId("accounting_delete") });
  },
  // „Asenda konto” in many entries (targets: [{ entryId, lineIndexes }] moves back exactly those lines — the undo)
  replaceAccountingAccount({ fromAccount, toAccount, entryIds, targets, reason }) {
    return post("/accounting/entries/replace-account", { fromAccount, toAccount, entryIds, targets, reason, requestId: financeRequestId("accounting_replace") });
  },
  setAccountingLock(lockedThrough, reason) {
    return post("/accounting/lock", { lockedThrough, reason });
  },
  // tarnijad and ostuarved (functions/purchases-core.js, docs/ACCOUNTING.md)
  saveSupplier(supplierId, supplier) {
    return post("/suppliers", { supplierId: supplierId || "", supplier, requestId: financeRequestId("supplier") });
  },
  savePurchaseInvoice(purchaseInvoiceId, purchaseInvoice, { paidNow = null, reason = "" } = {}) {
    return post("/purchase-invoices", { purchaseInvoiceId: purchaseInvoiceId || "", purchaseInvoice, paidNow, reason, requestId: financeRequestId("purchase_invoice") });
  },
  payPurchaseInvoice(purchaseInvoiceId, payment) {
    return post("/purchase-invoices/pay", { purchaseInvoiceId, payment, requestId: financeRequestId("purchase_payment") });
  },
  removePurchasePayment(purchaseInvoiceId, paymentId, reason) {
    return post("/purchase-invoices/payment/remove", { purchaseInvoiceId, paymentId, reason, requestId: financeRequestId("purchase_unpay") });
  },
  voidPurchaseInvoice(purchaseInvoiceId, reason) {
    return post("/purchase-invoices/void", { purchaseInvoiceId, reason, requestId: financeRequestId("purchase_void") });
  },
  attachPurchaseDocument(purchaseInvoiceId, document) {
    return post("/purchase-invoices/documents", { purchaseInvoiceId, ...document });
  },
  // INF 3 (functions/inf3-core.js, docs/INF3.md)
  saveTaxIdentity(studentId, identity) {
    return post("/tax/identity", { studentId, identity });
  },
  createTaxFormLink(studentId) {
    return post("/tax/form-link", { studentId });
  },
  inf3Report(year) {
    return post("/tax/inf3", { year });
  },
  createExpense(values) {
    return post("/expenses", {
      ...values,
      requestId: values.requestId || financeRequestId("expense"),
    });
  },
  correctExpense(expenseId, values, reason) {
    return post("/expenses/correct", {
      ...values,
      expenseId,
      reason,
      requestId: values.requestId || financeRequestId("expense_correction"),
    });
  },
  voidExpense(expenseId, reason) {
    return post("/expenses/void", {
      expenseId,
      reason,
      requestId: financeRequestId("expense_void"),
    });
  },
  attachExpenseDocument(expenseId, document) {
    return post("/expenses/documents", {
      expenseId,
      storagePath: document.storagePath,
      fileName: document.fileName,
      contentType: document.contentType,
      size: document.size,
      requestId: document.requestId,
    });
  },
  createInvoiceFromLessons(values) {
    return post("/invoices/from-lessons", {
      studentId: values.studentId,
      lessonIds: values.lessonIds,
      due: values.due,
      description: values.description || "",
      paymentReference: values.paymentReference || "",
      requestId: values.requestId || financeRequestId("invoice"),
    });
  },
  setLessonBillingDisposition(lessonId, billingStatus, reason) {
    return post("/lessons/billing-disposition", {
      lessonId,
      billingStatus,
      reason,
      requestId: financeRequestId("lesson_billing"),
    });
  },
  // due date correction with a reason (audited on the server: dueDateHistory + finance audit); staffOperationsApi route
  correctInvoiceDueDate(invoiceId, due, reason) {
    return postStaff("/data-quality/invoice-due", {
      invoiceId,
      due,
      reason,
      requestId: financeRequestId("invoice_due"),
    });
  },
  creditInvoiceLessonLine(invoiceId, lessonId, reason) {
    return post("/invoices/credit-lesson-line", {
      invoiceId,
      lessonId,
      reason,
      requestId: financeRequestId("credit_note"),
    });
  },
  // „Krediteeri kogu arve” (owner 2026-10-23): one credit note for the whole open amount; the issued invoice stays as it is
  creditInvoiceInFull(invoiceId, reason, requestId) {
    return post("/invoices/credit-full", {
      invoiceId,
      reason,
      requestId: requestId || financeRequestId("credit_full"),
    });
  },
  // „Paranda summa või maksja”: a full credit note + a new invoice with the corrected amount and/or payer
  // (correction = { amount?, payer?: { payerName, payerEmail, payerRegCode, payerAddress }, due?, reason })
  correctIssuedInvoice(invoiceId, correction = {}) {
    return post("/invoices/correct", {
      invoiceId,
      ...(correction.amount !== undefined && correction.amount !== "" ? { amount: correction.amount } : {}),
      ...(correction.payer ? { payer: correction.payer } : {}),
      ...(correction.due ? { due: correction.due } : {}),
      reason: correction.reason,
      requestId: correction.requestId || financeRequestId("invoice_correction"),
    });
  },
  // lesson tokens: a paid package invoice → the card gets its lesson credits (once; the server checks the payment)
  creditInvoiceTokens(invoiceId) {
    return post("/invoices/tokens/credit", { invoiceId });
  },
  recordPayment(invoiceId, payment) {
    return post("/payments", {
      invoiceId,
      amount: payment.amount,
      paidAt: payment.paidAt,
      method: payment.method || "bank",
      reference: payment.reference || "",
      note: payment.note || "",
      requestId: payment.requestId || financeRequestId("payment"),
      ...(payment.method === "cash" && payment.receivedByUid ? { receivedByUid: payment.receivedByUid } : {}),
    });
  },
  // cash box (owner 2026-10-18): staff record cash they took and hand it over; an admin links it to an invoice
  cashSummary() {
    return post("/cash/summary", {});
  },
  recordCashReceipt(values) {
    return post("/cash/receipts", { ...values, requestId: values.requestId || financeRequestId("cash_receipt") });
  },
  recordCashHandover(values) {
    return post("/cash/handover", { ...values, requestId: values.requestId || financeRequestId("cash_handover") });
  },
  allocateCashReceipt(receiptId, invoiceId) {
    return post("/cash/allocate", { receiptId, invoiceId });
  },
  voidCashEntry(entryId, reason) {
    return post("/cash/void", { entryId, reason });
  },
  allocateBankTransaction(transaction) {
    const amount = Number(transaction.amountCents) / 100;
    const allocationAmount = Number(transaction.allocationCents) / 100;
    return post("/bank-transactions/allocate", {
      externalId: transaction.externalId || "",
      paidAt: transaction.paidAt,
      payerName: transaction.payerName || "",
      payerAccount: transaction.payerAccount || "",
      creditStudentId: transaction.studentId || "",
      reference: transaction.reference || "",
      amount,
      // one payment may pay several invoices of a family (owner 2026-10-21)
      allocations: Array.isArray(transaction.allocations) && transaction.allocations.length
        ? transaction.allocations.map((item) => ({ invoiceId: item.invoiceId, amount: Number(item.amountCents) / 100 }))
        : transaction.invoiceId && allocationAmount > 0
          ? [{ invoiceId: transaction.invoiceId, amount: allocationAmount }]
          : [],
      lessonAllocations: [],
      note: transaction.note || "Pangaväljavõttest imporditud makse",
      requestId: transaction.requestId || financeRequestId("bank"),
    });
  },
  previewFinancialPeriod(month) {
    return post("/financial-periods/preview", { month });
  },
  previewFinancialAnalytics(month) {
    return post("/financial-analytics/preview", { month });
  },
  reviewFinancialPeriod(month) {
    return post("/financial-periods/review", {
      month,
      requestId: financeRequestId(`period_${month}`),
    });
  },
  generateFinancialPeriodExport(month) {
    return post("/financial-periods/export", {
      month,
      requestId: financeRequestId(`period_export_${month}`),
    });
  },
  closeFinancialPeriod(month, reason) {
    return post("/financial-periods/close", {
      month,
      reason,
      requestId: financeRequestId(`period_close_${month}`),
    });
  },
  createFinancialPeriodCorrection(values) {
    return post("/financial-periods/corrections", {
      ...values,
      requestId:
        values.requestId ||
        financeRequestId(`period_correction_${values.sourceMonth}`),
    });
  },
  applyPayerCredit(creditId, invoiceId, amount, note) {
    return post("/payer-credits/apply", {
      creditId,
      allocations: [{ invoiceId, amount }],
      lessonAllocations: [],
      note: note || "",
      requestId: financeRequestId("credit_apply"),
    });
  },
  refundPayerCredit(creditId, refund) {
    return post("/payer-credits/refund", {
      creditId,
      amount: refund.amount,
      refundedAt: refund.refundedAt,
      method: refund.method || "bank",
      reference: refund.reference || "",
      reason: refund.reason,
      requestId: financeRequestId("credit_refund"),
    });
  },
  voidPayment(paymentId, reason) {
    return post("/payments/void", {
      paymentId,
      reason,
      requestId: financeRequestId("payment_void"),
    });
  },
  resolveInvoiceOverpayment(invoiceId, reason) {
    return post("/invoices/resolve-overpayment", {
      invoiceId,
      reason,
      requestId: financeRequestId("overpayment"),
    });
  },
  attachPaymentDocument(paymentId, document) {
    return post("/payments/documents", {
      paymentId,
      storagePath: document.storagePath,
      fileName: document.fileName,
      contentType: document.contentType,
      size: document.size,
      requestId: document.requestId,
    });
  },
  previewInvoiceNumbering() {
    return post("/invoices/numbering/preview", {});
  },
  repairInvoiceNumbering(plan, reason) {
    return post("/invoices/numbering/repair", {
      expectedFingerprint: plan.fingerprint,
      reason,
      requestId: financeRequestId("invoice_numbering"),
    });
  },
};

export const invoiceDeliveryApi = {
  send(invoiceId) {
    return postInvoice("/send", { invoiceId });
  },
  remind(invoiceId) {
    return postInvoice("/remind", { invoiceId });
  },
  pdf(invoiceId) {
    return postInvoice("/pdf", { invoiceId });
  },
  creditNotePdf(creditNoteId) {
    return postInvoice("/credit-note/pdf", { creditNoteId });
  },
  sendCreditNote(creditNoteId) {
    return postInvoice("/credit-note/send", { creditNoteId });
  },
  // admin: one test e-mail to the admin's own address → { ok, to, error }
  testEmail() {
    return postInvoice("/email-test", {});
  },
  // admin: { autoEnabled } of the automatic daily payment reminders; pass a boolean to switch them
  reminderSettings(autoEnabled) {
    return postInvoice("/reminder-settings", typeof autoEnabled === "boolean" ? { autoEnabled } : {});
  },
};
