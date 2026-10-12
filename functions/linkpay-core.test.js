"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const core = require("./linkpay-core");

test("the link is signed like the EveryPay example: HMAC-SHA256 of the PHP-encoded query", () => {
  const url = core.signedLinkpayUrl({
    prefix: "https://payment.sandbox.lhv.ee/lp", linkpayToken: "tok123", secret: "not-a-real-secret",
    params: { transaction_amount: "25.00", invoice_number: "KS-TEST-001", customer_name: "Test Maksja", customer_email: "test@example.com", order_reference: "KS-1" },
  });
  const query = "transaction_amount=25.00&invoice_number=KS-TEST-001&customer_name=Test%20Maksja&customer_email=test%40example.com&order_reference=KS-1&linkpay_token=tok123";
  const hmac = crypto.createHmac("sha256", "not-a-real-secret").update(query).digest("hex");
  assert.equal(url, `https://payment.sandbox.lhv.ee/lp?${query}&hmac=${hmac}`);
  assert.ok(!url.includes("not-a-real-secret"));
  assert.throws(() => core.signedLinkpayUrl({ prefix: "x", linkpayToken: "t", secret: "", params: {} }));
});

test("amount, open balance and the reasons an invoice cannot be paid", () => {
  assert.equal(core.amountString(17500), "175.00");
  assert.equal(core.amountString(2550), "25.50");
  assert.equal(core.openBalanceCents({ balanceDueCents: 4000 }), 4000);
  assert.equal(core.openBalanceCents({ balanceDue: 12.5 }), 1250);
  assert.equal(core.openBalanceCents({ amount: 100, paidAmount: 40 }), 6000);
  assert.equal(core.unpayableReason({ status: "Tühistatud", balanceDueCents: 100 }), "Arve on tühistatud.");
  assert.equal(core.unpayableReason({ balanceDueCents: 0 }), "Arve on juba tasutud.");
  assert.equal(core.unpayableReason({ balanceDueCents: 100 }), "");
});

test("order references are unique per attempt and use only allowed characters", () => {
  const a = core.orderReference({ num: "KS-2026-123" }, 1000, "aa");
  const b = core.orderReference({ num: "KS-2026-123" }, 1001, "aa");
  assert.notEqual(a, b);
  assert.match(a, /^KS-2026-123-[a-z0-9]+$/);
  assert.match(core.orderReference({ num: "KS/2026 #1" }, 1, "bb"), /^KS20261-/);
});

test("pay codes are random and compared in constant time", () => {
  const code = core.newPayCode();
  assert.ok(code.length >= 20);
  assert.notEqual(code, core.newPayCode());
  assert.equal(core.payCodeMatches(code, code), true);
  assert.equal(core.payCodeMatches(code, `${code}x`), false);
  assert.equal(core.payCodeMatches("", ""), false);
});

test("invoice owners match the Firestore rule", () => {
  const invoice = { studentId: "s1", parentUid: "p1", payerEmailLower: "pere@example.com" };
  assert.equal(core.ownsInvoice(invoice, { uid: "x", linkedStudentIds: ["s1"] }), true);
  assert.equal(core.ownsInvoice(invoice, { uid: "p1" }), true);
  assert.equal(core.ownsInvoice(invoice, { uid: "x", email: "PERE@example.com", emailVerified: true }), true);
  assert.equal(core.ownsInvoice(invoice, { uid: "x", email: "pere@example.com", emailVerified: false }), false);
  assert.equal(core.ownsInvoice(invoice, { uid: "x", linkedStudentIds: ["s2"] }), false);
  assert.equal(core.ownsInvoice(invoice, {}), false);
});

test("only a settled payment with the same reference, currency and amount counts", () => {
  const attempt = { orderReference: "KS-1-a", amountCents: 2500 };
  assert.deepEqual(core.paymentVerdict({ payment_state: "settled", order_reference: "KS-1-a", initial_amount: 25, currency: "EUR" }, attempt), { status: "settled", state: "settled", amountCents: 2500 });
  assert.equal(core.paymentVerdict({ payment_state: "settled", order_reference: "KS-1-a", initial_amount: 1, currency: "EUR" }, attempt).status, "mismatch");
  assert.equal(core.paymentVerdict({ payment_state: "settled", order_reference: "KS-9", initial_amount: 25 }, attempt).status, "mismatch");
  assert.equal(core.paymentVerdict({ payment_state: "failed", order_reference: "KS-1-a" }, attempt).status, "failed");
  assert.equal(core.paymentVerdict({ payment_state: "waiting_for_3ds_response", order_reference: "KS-1-a" }, attempt).status, "pending");
  assert.equal(core.paymentRequestId("abc123def456/x"), "linkpay_abc123def456x");
});
