"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { invoiceEmailSendLocked } = require("./invoice-email-lock-core");

test("a send that started a moment ago blocks a second send", () => {
  assert.equal(invoiceEmailSendLocked({ emailStatus: "sending", emailUpdatedAt: "2026-11-28T10:00:00.000Z" }, "2026-11-28T10:00:30.000Z"), true);
  assert.equal(invoiceEmailSendLocked({ emailStatus: "sending", emailUpdatedAt: "2026-11-28T10:00:00.000Z" }, "2026-11-28T10:09:59.000Z"), true);
});

test("a „sending” mark left by a dead send expires after 10 minutes", () => {
  assert.equal(invoiceEmailSendLocked({ emailStatus: "sending", emailUpdatedAt: "2026-11-28T10:00:00.000Z" }, "2026-11-28T10:10:00.000Z"), false);
  assert.equal(invoiceEmailSendLocked({ emailStatus: "sending" }, "2026-11-28T10:00:30.000Z"), false);
});

test("other states never block", () => {
  for (const emailStatus of ["", "sent", "queued", "failed", undefined]) {
    assert.equal(invoiceEmailSendLocked({ emailStatus, emailUpdatedAt: "2026-11-28T10:00:00.000Z" }, "2026-11-28T10:00:01.000Z"), false);
  }
});
