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

test("the sum is written in Estonian words as on the first version's invoice", () => {
  const { amountInWords } = require("./invoice-document");
  assert.equal(amountInWords(90), "üheksakümmend eurot");
  assert.equal(amountInWords(1250.5), "tuhat kakssada viiskümmend eurot ja 50 senti");
  assert.equal(amountInWords(0), "null eurot");
});

test("a monthly invoice with quantity and unit price renders on one page", async () => {
  const pdf = await buildInvoicePdf({
    invoice: { num: "KS-2026-090", date: "2026-10-07", due: "2026-10-10", amount: 90, payerName: "Timur", lines: [
      { type: "monthly_planned_lessons", description: "Keeletunnid, oktoober 2026: 4 × 60 min × 20 €", quantity: 4, unitPriceCents: 2000, amountCents: 8000, amount: 80 },
      { type: "monthly_correction", description: "Eelmise kuu tasaarveldus: +0,5 tundi", quantity: 0.5, unitPriceCents: 2000, amountCents: 1000, amount: 10 },
    ] },
    student: { name: "Timur", subject: "Eesti keel" },
    paymentDetails: { company: "E&P Koolitus OÜ", regCode: "17270880", email: "info@epkoolitus.ee", phone: "+372 5434 4155", iban: "EE917700771011885682", bank: "LHV Pank AS", swift: "LHVBEE22", issuer: "Pavel Zakutailo" },
  });
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.equal((pdf.toString("latin1").match(/\/Type \/Page\b/g) || []).length, 1);
});
