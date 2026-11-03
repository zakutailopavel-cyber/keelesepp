const test = require("node:test");
const assert = require("node:assert/strict");
const { DUPLICATE_WINDOW_MS, assertPaymentAllowed, findDuplicatePayment } = require("./payment-guards-core");

const nowIso = "2026-10-14T10:03:00.000Z";
const invoice = { num: "KS-117", amountCents: 17000, amount: 170 };
const first = { id: "p1", amountCents: 17000, paidAt: "2026-10-14", method: "bank", status: "active", createdAt: "2026-10-14T10:00:00.000Z", createdBy: { name: "Admin A" } };

const rejects = (fn, code) => assert.throws(fn, (error) => {
  assert.equal(error.status, 409);
  assert.equal(error.details.code, code);
  return true;
});

test("KS-117: the same payment 3 minutes later is a duplicate (409), whoever enters it", () => {
  rejects(() => assertPaymentAllowed({ invoice, payments: [first], amountCents: 17000, paidAt: "2026-10-14", method: "bank", nowIso, allowOverpayment: true }), "duplicate_payment");
  try {
    assertPaymentAllowed({ invoice, payments: [first], amountCents: 17000, paidAt: "2026-10-14", method: "bank", nowIso });
  } catch (error) {
    assert.match(error.message, /juba registreeritud 3 min tagasi \(Admin A\)/);
    assert.equal(error.details.paymentId, "p1");
  }
});

test("not a duplicate: other amount, date, method, a voided one, or older than 10 minutes", () => {
  const base = { payments: [first], amountCents: 17000, paidAt: "2026-10-14", method: "bank", nowIso };
  assert.equal(findDuplicatePayment({ ...base, amountCents: 8500 }), null);
  assert.equal(findDuplicatePayment({ ...base, paidAt: "2026-10-13" }), null);
  assert.equal(findDuplicatePayment({ ...base, method: "cash" }), null);
  assert.equal(findDuplicatePayment({ ...base, payments: [{ ...first, status: "voided" }] }), null);
  const later = new Date(Date.parse(first.createdAt) + DUPLICATE_WINDOW_MS + 1000).toISOString();
  assert.equal(findDuplicatePayment({ ...base, nowIso: later }), null);
  assert.equal(findDuplicatePayment(base).id, "p1");
});

test("a payment on a fully paid invoice is refused unless the overpayment is confirmed", () => {
  const paidLongAgo = { ...first, createdAt: "2026-09-01T10:00:00.000Z" };
  try {
    assertPaymentAllowed({ invoice, payments: [paidLongAgo], amountCents: 17000, paidAt: "2026-10-14", method: "bank", nowIso });
    assert.fail("should refuse");
  } catch (error) {
    assert.equal(error.status, 409);
    assert.equal(error.message, "Arve on juba makstud. Kas registreerida ülemakse ettemaksuna?");
    assert.deepEqual(error.details, { code: "overpayment", balanceCents: 0, amountCents: 17000, excessCents: 17000, fullyPaid: true });
  }
  assert.deepEqual(assertPaymentAllowed({ invoice, payments: [paidLongAgo], amountCents: 17000, paidAt: "2026-10-14", method: "bank", nowIso, allowOverpayment: true }), { balanceCents: 0 });
});

test("more than the open balance on a partly paid invoice names the balance and the excess", () => {
  const part = { ...first, amountCents: 10000, createdAt: "2026-09-01T10:00:00.000Z" };
  rejects(() => assertPaymentAllowed({ invoice, payments: [part], amountCents: 10000, paidAt: "2026-10-14", method: "bank", nowIso }), "overpayment");
  try { assertPaymentAllowed({ invoice, payments: [part], amountCents: 10000, paidAt: "2026-10-14", method: "bank", nowIso }); } catch (error) {
    assert.match(error.message, /jäägist \(70,00 €\) suurem 30,00 € võrra/);
    assert.equal(error.details.fullyPaid, false);
  }
  // exactly the balance, or less, passes
  assert.deepEqual(assertPaymentAllowed({ invoice, payments: [part], amountCents: 7000, paidAt: "2026-10-14", method: "bank", nowIso }), { balanceCents: 7000 });
  assert.deepEqual(assertPaymentAllowed({ invoice, payments: [], amountCents: 17000, paidAt: "2026-10-14", method: "bank", nowIso }), { balanceCents: 17000 });
});

test("a voided payment does not count as paid; a credit note lowers the invoice amount", () => {
  const voided = { ...first, status: "voided", createdAt: "2026-09-01T10:00:00.000Z" };
  assert.deepEqual(assertPaymentAllowed({ invoice, payments: [voided], amountCents: 17000, paidAt: "2026-10-14", method: "bank", nowIso }), { balanceCents: 17000 });
  const credited = { ...invoice, effectiveAmountCents: 5000 };
  rejects(() => assertPaymentAllowed({ invoice: credited, payments: [], amountCents: 17000, paidAt: "2026-10-14", method: "bank", nowIso }), "overpayment");
});
