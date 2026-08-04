"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { buildInvoicePdf, invoiceFileName, invoiceParties } = require("./invoice-document");

const invoice = {
  num: "KS-2026-042",
  date: "2026-08-04",
  due: "2026-08-10",
  payerName: "Test Pere",
  payerEmail: "pere@example.com",
  amount: 75,
  effectiveAmount: 50,
  creditedAmount: 25,
  correctedLessonIds: ["lesson-2"],
  paymentReference: "KS-2026-042",
  lines: [
    { lessonId: "lesson-1", date: "2026-07-21", description: "Keeletund", amount: 25 },
    { lessonId: "lesson-2", date: "2026-07-23", description: "Keeletund", amount: 25 },
    { lessonId: "lesson-3", date: "2026-07-28", description: "Keeletund", amount: 25 },
  ],
};

test("invoice PDF is a real PDF and filename is safe", async () => {
  const pdf = await buildInvoicePdf({
    invoice,
    paymentDetails: {
      company: "E&P Koolitus OÜ",
      regCode: "17270880",
      email: "info@example.com",
      iban: "EE000000000000000000",
      bank: "Test Pank",
    },
  });
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.ok(pdf.length > 2000);
  assert.equal(invoiceFileName(invoice), "arve-KS-2026-042.pdf");
});

test("invoice parties prefer immutable payer data", () => {
  assert.deepEqual(invoiceParties(invoice, { name: "Õpilane", email: "student@example.com" }), {
    payerName: "Test Pere",
    payerRegCode: "",
    payerAddress: "",
    payerEmail: "pere@example.com",
  });
});
