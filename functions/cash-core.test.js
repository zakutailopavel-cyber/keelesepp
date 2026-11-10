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

// ---- „Makstud sularahas” on a lesson (owner 2026-11-10) ----
const { lessonCashEntry, lessonCashId, lessonCashMarks, lessonCashUndoRefusal } = require("./cash-core");

const lessonNow = "2026-11-10T09:00:00.000Z"; // 11:00 in Tallinn
const scheduleEntry = { studentId: "s1", teacherUid: "t1", subject: "Eesti keel", time: "16:00", recurring: true, day: "Mon", startDate: "2026-09-07" };
const lessonValues = { scheduleId: "sch1", occurrenceDate: "2026-11-09", amount: "25", note: "ema maksis" };
const lessonArgs = (over = {}) => ({
  actor: teacher, isAdmin: false, values: lessonValues, entry: scheduleEntry, occurs: true, lesson: null,
  lessonId: "schedule_sch1_2026-11-09_s1", studentId: "s1", student, issuer: "company", holder: teacher, nowIso: lessonNow, ...over,
});

test("lesson cash: the lesson's teacher marks it; the receipt is held by them, dated today, linked to the lesson", () => {
  const entry = lessonCashEntry(lessonArgs());
  assert.equal(entry.type, "receipt");
  assert.equal(entry.source, "lesson");
  assert.equal(entry.holderUid, "t1");
  assert.equal(entry.status, "open");
  assert.equal(entry.amountCents, 2500);
  assert.equal(entry.receivedAt, "2026-11-10");
  assert.equal(entry.occurrenceDate, "2026-11-09");
  assert.equal(entry.lessonId, "schedule_sch1_2026-11-09_s1");
  assert.equal(entry.invoiceId, null);
  assert.equal(lessonCashId("schedule_sch1_2026-11-09_s1"), "lessoncash_schedule_sch1_2026-11-09_s1");
});

test("lesson cash: another teacher, a foreign holder, a future or cancelled lesson, an FIE card are refused", () => {
  assert.throws(() => lessonCashEntry(lessonArgs({ actor: { uid: "t2", name: "Anna" }, holder: { uid: "t2" } })), /sinu tund/);
  assert.throws(() => lessonCashEntry(lessonArgs({ holder: { uid: "a1", name: "Admin" } })), /ise sai/);
  assert.throws(() => lessonCashEntry(lessonArgs({ values: { ...lessonValues, occurrenceDate: "2026-11-11" } })), /ei ole veel toimunud/);
  assert.throws(() => lessonCashEntry(lessonArgs({ occurs: false })), /ei olnud/);
  assert.throws(() => lessonCashEntry(lessonArgs({ studentId: "s9" })), /ei ole selles tunnis/);
  assert.throws(() => lessonCashEntry(lessonArgs({ lesson: { status: "Puudus_p", teacherUid: "t1" } })), /teatas ette/);
  assert.throws(() => lessonCashEntry(lessonArgs({ issuer: "fie" })), /FIE/);
  assert.throws(() => lessonCashEntry(lessonArgs({ student: { ...student, active: false } })), /kaarti/);
  assert.throws(() => lessonCashEntry(lessonArgs({ values: { ...lessonValues, amount: "0" } })), /positiivne/);
  // a marked lesson's own teacher decides (a substitute who marked it), not the calendar entry's
  assert.equal(lessonCashEntry(lessonArgs({ actor: { uid: "t2", name: "Anna" }, holder: { uid: "t2", name: "Anna" }, lesson: { status: "Toimunud", teacherUid: "t2" } })).holderUid, "t2");
  // an admin may mark any lesson
  assert.equal(lessonCashEntry(lessonArgs({ actor: { uid: "a1", name: "Admin" }, isAdmin: true, holder: { uid: "a1", name: "Admin" } })).holderUid, "a1");
});

test("lesson cash undo: own mark, same day, money not handed over yet; an admin always while open", () => {
  const entry = { ...lessonCashEntry(lessonArgs()), id: "lessoncash_x" };
  assert.equal(lessonCashUndoRefusal({ actor: teacher, isAdmin: false, entry, balanceCents: 2500, nowIso: lessonNow }), "");
  assert.match(lessonCashUndoRefusal({ actor: teacher, isAdmin: false, entry, balanceCents: 2500, nowIso: "2026-11-11T09:00:00.000Z" }), /samal päeval/);
  assert.match(lessonCashUndoRefusal({ actor: teacher, isAdmin: false, entry, balanceCents: 0, nowIso: lessonNow }), /üle antud/);
  assert.match(lessonCashUndoRefusal({ actor: { uid: "t2" }, isAdmin: false, entry, balanceCents: 2500, nowIso: lessonNow }), /sinu märge/);
  assert.equal(lessonCashUndoRefusal({ actor: { uid: "a1" }, isAdmin: true, entry, balanceCents: 0, nowIso: "2026-11-20T09:00:00.000Z" }), "");
  assert.match(lessonCashUndoRefusal({ actor: teacher, isAdmin: false, entry: { ...entry, status: "allocated" }, balanceCents: 2500, nowIso: lessonNow }), /arvega/);
});

test("lesson cash marks: a teacher gets only their own, with canUndo; handed-over money makes it final", () => {
  const mine = { ...lessonCashEntry(lessonArgs()), id: "lc1" };
  const other = { ...lessonCashEntry(lessonArgs({ actor: { uid: "t2", name: "Anna" }, holder: { uid: "t2", name: "Anna" }, lesson: { status: "Toimunud", teacherUid: "t2" }, lessonId: "L2" })), id: "lc2" };
  const handover = { type: "handover", fromUid: "t1", toUid: "a1", amountCents: 2500, status: "active" };
  let marks = lessonCashMarks([mine, other], { uid: "t1", isAdmin: false, balanceCents: cashBalances([mine, other]).t1.cents, nowIso: lessonNow });
  assert.deepEqual(Object.keys(marks), ["schedule_sch1_2026-11-09_s1"]);
  assert.equal(marks["schedule_sch1_2026-11-09_s1"].canUndo, true);
  marks = lessonCashMarks([mine, other, handover], { uid: "t1", isAdmin: false, balanceCents: cashBalances([mine, other, handover]).t1.cents, nowIso: lessonNow });
  assert.equal(marks["schedule_sch1_2026-11-09_s1"].canUndo, false);
  assert.equal(Object.keys(lessonCashMarks([{ ...mine, status: "void" }], { uid: "t1", isAdmin: false, nowIso: lessonNow })).length, 0);
});
