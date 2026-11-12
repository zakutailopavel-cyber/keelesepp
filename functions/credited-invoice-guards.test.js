"use strict";

// Fable review 2026-11-11 Д6: a fully credited invoice never takes a payment and is never reminded
// (functions/index.js recordInvoicePayment, shouldSendDue10Reminder, shouldSendOverdueReminder).
const test = require("node:test");
const assert = require("node:assert/strict");
const rewire = require("rewire");

const api = rewire("./index.js");

function fakeDb(invoice, writes) {
  return {
    collection(name) {
      return {
        doc: (id) => ({ collection: name, id }),
        where: (field, operator, value) => ({ collection: name, field, operator, value }),
      };
    },
    async runTransaction(callback) {
      return callback({
        async get(target) {
          if (target.collection === "invoices" && target.id) return { exists: true, id: target.id, data: () => invoice };
          if (target.field) return { empty: true, docs: [] };
          return { exists: false, data: () => undefined };
        },
        set: (target, value) => writes.push({ type: "set", target, value }),
        create: (target, value) => writes.push({ type: "create", target, value }),
      });
    },
  };
}

const actor = { decoded: { uid: "admin", email: "admin@example.ee" }, profile: { displayName: "Admin" }, roles: new Set(["admin"]) };
const pay = (invoiceId) => api.__get__("recordInvoicePayment")({
  actor, invoiceId, amount: 90, paidAt: "2026-11-12", method: "bank", reference: "", note: "", requestId: "pay-credited-1",
});

test("a payment on a fully credited invoice is refused (409) and nothing is written", async () => {
  const writes = [];
  const restore = api.__set__("db", fakeDb({ status: "Krediteeritud", correctionStatus: "fully_credited", num: "KS-2026-085", amountCents: 9000, amount: 90, effectiveAmountCents: 0 }, writes));
  try {
    await assert.rejects(pay("inv1"), (error) => {
      assert.equal(error.status, 409);
      assert.match(error.message, /KS-2026-085 on krediteeritud/);
      return true;
    });
    assert.equal(writes.length, 0);
  } finally { restore(); }
});

test("a payment on a corrected invoice names the replacement invoice", async () => {
  const writes = [];
  const restore = api.__set__("db", fakeDb({ status: "Krediteeritud", correctionStatus: "corrected", num: "KS-2026-085", correctedBy: { invoiceId: "inv2", invoiceNum: "KS-2026-120" }, amountCents: 9000, amount: 90 }, writes));
  try {
    await assert.rejects(pay("inv1"), (error) => {
      assert.equal(error.status, 409);
      assert.match(error.message, /asendatud arvega KS-2026-120/);
      return true;
    });
    assert.equal(writes.length, 0);
  } finally { restore(); }
});

test("reminders skip a credited invoice, also one a payment put back to „Ootel” before the fix", () => {
  const due10 = api.__get__("shouldSendDue10Reminder");
  const overdue = api.__get__("shouldSendOverdueReminder");
  const today = "2026-11-20";
  const open = { status: "Ootel", due: "2026-11-10" };
  assert.equal(overdue(open, today), true);
  assert.equal(overdue({ ...open, correctionStatus: "fully_credited" }, today), false);
  assert.equal(overdue({ ...open, correctionStatus: "corrected" }, today, true), false, "not even a forced run");
  assert.equal(due10({ ...open, correctionStatus: "fully_credited" }, "2026-11-05", true), false);
  // a partially credited invoice still has money due
  assert.equal(overdue({ ...open, correctionStatus: "partially_credited" }, today), true);
});
