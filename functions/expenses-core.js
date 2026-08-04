"use strict";

const EXPENSE_CATEGORIES = new Set([
  "rent",
  "advertising",
  "software",
  "learning_materials",
  "bank_fees",
  "taxes",
  "office",
  "travel",
  "other",
]);

const DOCUMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function validDate(value) {
  const date = String(value || "").trim();
  const parsed = new Date(`${date}T12:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    const error = new Error("expenseDate must be a valid YYYY-MM-DD date");
    error.status = 400;
    throw error;
  }
  return date;
}

function amountCents(value, field, { allowZero = false } = {}) {
  const number = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(number) || number < 0 || (!allowZero && number <= 0)) {
    const error = new Error(`${field} must be ${allowZero ? "zero or " : ""}a positive amount`);
    error.status = 400;
    throw error;
  }
  const cents = Math.round(number * 100);
  if (Math.abs(number * 100 - cents) > 0.000001) {
    const error = new Error(`${field} must have at most two decimal places`);
    error.status = 400;
    throw error;
  }
  return cents;
}

function cleanText(value, maximum) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maximum);
}

function expenseRecord(values = {}) {
  const category = String(values.category || "").trim();
  if (!EXPENSE_CATEGORIES.has(category)) {
    const error = new Error("valid expense category required");
    error.status = 400;
    throw error;
  }
  const grossAmountCents = amountCents(values.amount, "amount");
  const vatAmountCents = amountCents(values.vatAmount || 0, "vatAmount", { allowZero: true });
  if (vatAmountCents > grossAmountCents) {
    const error = new Error("vatAmount cannot exceed expense amount");
    error.status = 400;
    throw error;
  }
  const description = cleanText(values.description, 500);
  if (!description) {
    const error = new Error("expense description required");
    error.status = 400;
    throw error;
  }
  return {
    expenseDate: validDate(values.expenseDate),
    category,
    description,
    amountCents: grossAmountCents,
    amount: grossAmountCents / 100,
    vatAmountCents,
    vatAmount: vatAmountCents / 100,
    netAmountCents: grossAmountCents - vatAmountCents,
    netAmount: (grossAmountCents - vatAmountCents) / 100,
    paymentMethod: ["bank", "card", "cash", "other"].includes(values.paymentMethod) ? values.paymentMethod : "bank",
    note: cleanText(values.note, 1000),
  };
}

function expenseDocumentRecord({ expenseId, documentId, storagePath, fileName, contentType, size, uploadedAt } = {}) {
  const cleanExpenseId = String(expenseId || "").trim();
  const cleanDocumentId = String(documentId || "").trim();
  if (!/^[A-Za-z0-9_-]{1,160}$/.test(cleanExpenseId) || !/^[A-Za-z0-9_-]{12,120}$/.test(cleanDocumentId)) {
    const error = new Error("valid expense and document IDs required");
    error.status = 400;
    throw error;
  }
  const expectedPath = `financial/expenses/${cleanExpenseId}/${cleanDocumentId}`;
  if (String(storagePath || "").trim() !== expectedPath) {
    const error = new Error("expense document storage path does not match its expense");
    error.status = 400;
    throw error;
  }
  const cleanFileName = cleanText(fileName, 180);
  const cleanContentType = String(contentType || "").trim().toLowerCase();
  const byteSize = Number(size);
  if (!cleanFileName || !DOCUMENT_TYPES.has(cleanContentType) || !Number.isInteger(byteSize) || byteSize <= 0 || byteSize > 10 * 1024 * 1024) {
    const error = new Error("expense document must be a PDF, JPEG, PNG, or WebP file below 10 MB");
    error.status = 400;
    throw error;
  }
  return { id: cleanDocumentId, kind: "expense_receipt", expenseId: cleanExpenseId, storagePath: expectedPath, fileName: cleanFileName, contentType: cleanContentType, size: byteSize, uploadedAt: String(uploadedAt || "") };
}

module.exports = { EXPENSE_CATEGORIES, expenseDocumentRecord, expenseRecord };
