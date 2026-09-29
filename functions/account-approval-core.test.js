"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { approvalUpdate, composePendingAccountEmail, composeApprovedEmail } = require("./account-approval-core");

const actor = { uid: "admin1", email: "a@example.ee", name: "Admin" };

test("approve and reject produce the stored decision", () => {
  assert.deepEqual(approvalUpdate({ decision: "approve", actor, nowIso: "2026-09-29T12:00:00.000Z" }), {
    approvalStatus: "approved", approvalDecidedAt: "2026-09-29T12:00:00.000Z", approvalDecidedBy: actor, updatedAt: "2026-09-29T12:00:00.000Z",
  });
  const rejected = approvalUpdate({ decision: "reject", actor, nowIso: "2026-09-29T12:00:00.000Z", reason: "  vale e-post  " });
  assert.equal(rejected.approvalStatus, "rejected");
  assert.equal(rejected.approvalReason, "vale e-post");
  assert.throws(() => approvalUpdate({ decision: "pending", actor, nowIso: "x" }), /Unknown decision/);
});

test("the school is told about a new account with a link to the approval page", () => {
  const mail = composePendingAccountEmail({ displayName: "Mari <b>", email: "m@example.ee", role: "parent", childName: "Kati" });
  assert.equal(mail.to, "info@epkoolitus.ee");
  assert.match(mail.subject, /Uus konto ootab kinnitamist/);
  assert.match(mail.html, /crm\.epkoolitus\.ee\/accounts/);
  assert.ok(mail.html.includes("Mari &lt;b&gt;"));
  assert.match(mail.text, /Lapsevanem/);
});

test("the approved person gets an Estonian and Russian e-mail", () => {
  const mail = composeApprovedEmail({ displayName: "Mari", email: "m@example.ee" });
  assert.equal(mail.to, "m@example.ee");
  assert.match(mail.text, /konto on kinnitatud/);
  assert.match(mail.text, /аккаунт подтверждён/);
});
