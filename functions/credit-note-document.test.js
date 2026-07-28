"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildCreditNotePdf,
  composeCreditNoteEmail,
  creditNoteFileName,
} = require("./credit-note-document");

const creditNote = {
  num: "KN-2026-001",
  date: "2026-07-28",
  invoiceNum: "KS-2026-010",
  lessonDate: "2026-07-21",
  amount: 25,
  effectiveInvoiceAmount: 75,
  payerName: "Test Pere",
  payerEmail: "pere@example.com",
  reason: "Tund lisati <ekslikult>",
  lines: [{ description: "Keeletund", date: "2026-07-21", amount: -25 }],
};

test("credit-note email contains correction totals and escapes HTML", () => {
  const message = composeCreditNoteEmail({
    creditNote,
    appBaseUrl: "https://example.com/haldus/",
  });
  assert.equal(message.to, "pere@example.com");
  assert.match(message.subject, /KN-2026-001/);
  assert.match(message.text, /-25,00 EUR/);
  assert.match(message.html, /Tund lisati &lt;ekslikult&gt;/);
  assert.doesNotMatch(message.html, /Tund lisati <ekslikult>/);
});

test("credit-note PDF is a real PDF document with a safe filename", async () => {
  const pdf = await buildCreditNotePdf({
    creditNote,
    paymentDetails: {
      company: "E&P Koolitus OÜ",
      regCode: "17270880",
      email: "info@example.com",
    },
  });
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.ok(pdf.length > 1500);
  assert.equal(creditNoteFileName(creditNote), "kreeditarve-KN-2026-001.pdf");
});
