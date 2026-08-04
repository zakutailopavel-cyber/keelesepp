"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { expenseDocumentRecord, expenseRecord } = require("./expenses-core");

test("expense record calculates net and VAT in cents", () => {
  assert.deepEqual(expenseRecord({ expenseDate: "2026-08-04", category: "software", description: "Videokõne tarkvara", amount: "24,40", vatAmount: "4,40", paymentMethod: "card" }), {
    expenseDate: "2026-08-04", category: "software", description: "Videokõne tarkvara", amountCents: 2440, amount: 24.4, vatAmountCents: 440, vatAmount: 4.4, netAmountCents: 2000, netAmount: 20, paymentMethod: "card", note: "",
  });
});

test("expense record rejects invalid category, date, amount and VAT", () => {
  assert.throws(() => expenseRecord({ expenseDate: "bad", category: "software", description: "x", amount: 10 }), /expenseDate/);
  assert.throws(() => expenseRecord({ expenseDate: "2026-08-04", category: "supplier", description: "x", amount: 10 }), /category/);
  assert.throws(() => expenseRecord({ expenseDate: "2026-08-04", category: "software", description: "x", amount: 10, vatAmount: 11 }), /cannot exceed/);
});

test("expense document path is bound to the immutable expense ID", () => {
  assert.equal(expenseDocumentRecord({ expenseId: "expense-1", documentId: "expense_document_123", storagePath: "financial/expenses/expense-1/expense_document_123", fileName: "receipt.pdf", contentType: "application/pdf", size: 100, uploadedAt: "2026-08-04" }).kind, "expense_receipt");
  assert.throws(() => expenseDocumentRecord({ expenseId: "expense-1", documentId: "expense_document_123", storagePath: "financial/expenses/other/expense_document_123", fileName: "receipt.pdf", contentType: "application/pdf", size: 100 }), /storage path/);
});
