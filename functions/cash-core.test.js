const test = require("node:test");
const assert = require("node:assert/strict");
const { amountToCents, cashBalances, handoverEntry, receiptEntry, visibleEntries } = require("./cash-core");

const nowIso = "2026-10-18T10:00:00.000Z";
const teacher = { uid: "t1", name: "Oleksiy" };
const student = { name: "Mia Tamm", parentName: "Kati Tamm", teacherUid: "t1", enrollments: [{ subject: "Inglise keel", teacherUid: "t2" }] };

test("a teacher records cash from their own student; it stays in their cash box", () => {
  const entry = receiptEntry({ actor: teacher, isAdmin: false, values: { amount: "60,50", receivedAt: "2026-10-17", note: "oktoober" }, studentId: "s1", student, holder: teacher, nowIso });
  assert.equal(entry.amountCents, 6050);
  assert.equal(entry.holderUid, "t1");
  assert.equal(entry.payerName, "Kati Tamm");
  assert.equal(entry.status, "open");
  assert.equal(entry.receivedAt, "2026-10-17");
});

test("a teacher of another study track may take cash too; a stranger may not", () => {
  assert.equal(receiptEntry({ actor: { uid: "t2", name: "Anna" }, isAdmin: false, values: { amount: 10 }, studentId: "s1", student, holder: { uid: "t2", name: "Anna" }, nowIso }).holderUid, "t2");
  assert.throws(() => receiptEntry({ actor: { uid: "t9" }, isAdmin: false, values: { amount: 10 }, studentId: "s1", student, holder: { uid: "t9" }, nowIso }), /sinu õpilane/);
  assert.throws(() => receiptEntry({ actor: teacher, isAdmin: false, values: { amount: 10 }, studentId: "s1", student, holder: { uid: "a1" }, nowIso }), /ise sai/);
});

test("amounts and dates are checked", () => {
  assert.throws(() => amountToCents("0"), /positiivne/);
  assert.throws(() => amountToCents("1.005"), /kaks kohta/);
  assert.throws(() => receiptEntry({ actor: teacher, isAdmin: false, values: { amount: 5, receivedAt: "2026-10-30" }, studentId: "s1", student, holder: teacher, nowIso }), /tulevikus/);
});

test("balances follow receipts and handovers; void entries do not count", () => {
  const entries = [
    { type: "receipt", holderUid: "t1", holderName: "Oleksiy", amountCents: 12000, status: "open" },
    { type: "receipt", holderUid: "t1", holderName: "Oleksiy", amountCents: 3000, status: "allocated" },
    { type: "receipt", holderUid: "t1", amountCents: 999, status: "void" },
    { type: "handover", fromUid: "t1", fromName: "Oleksiy", toUid: "a1", toName: "Pavel", amountCents: 12000, status: "active" },
  ];
  const balances = cashBalances(entries);
  assert.equal(balances.t1.cents, 3000);
  assert.equal(balances.a1.cents, 12000);
  assert.equal(balances.a1.name, "Pavel");
});

test("nobody hands over more than they hold, a teacher only their own cash", () => {
  const entry = handoverEntry({ actor: teacher, isAdmin: false, values: { amount: 120 }, from: teacher, to: { uid: "a1", name: "Pavel" }, balanceCents: 15000, nowIso });
  assert.equal(entry.amountCents, 12000);
  assert.throws(() => handoverEntry({ actor: teacher, isAdmin: false, values: { amount: 200 }, from: teacher, to: { uid: "a1" }, balanceCents: 15000, nowIso }), /ainult 150.00/);
  assert.throws(() => handoverEntry({ actor: teacher, isAdmin: false, values: { amount: 1 }, from: { uid: "t2" }, to: { uid: "a1" }, balanceCents: 100, nowIso }), /enda käes/);
  assert.throws(() => handoverEntry({ actor: teacher, isAdmin: true, values: { amount: 1 }, from: teacher, to: teacher, balanceCents: 100, nowIso }), /iseendale/);
});

test("a teacher sees only the entries where they hold, give or get money", () => {
  const entries = [{ id: 1, holderUid: "t1" }, { id: 2, holderUid: "t2" }, { id: 3, fromUid: "t2", toUid: "t1" }];
  assert.deepEqual(visibleEntries(entries, { uid: "t1", isAdmin: false }).map(entry => entry.id), [1, 3]);
  assert.equal(visibleEntries(entries, { uid: "a1", isAdmin: true }).length, 3);
});
