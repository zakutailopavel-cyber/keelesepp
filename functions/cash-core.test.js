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
const { invoicesCoveringLesson, lessonCashEntry, lessonCashFlag, lessonCashId, lessonCashMarks, lessonCashUndoRefusal } = require("./cash-core");

const lessonNow = "2026-11-10T09:00:00.000Z"; // 11:00 in Tallinn
const scheduleEntry = { studentId: "s1", teacherUid: "t1", subject: "Eesti keel", time: "16:00", recurring: true, day: "Mon", startDate: "2026-09-07" };
const lessonValues = { scheduleId: "sch1", occurrenceDate: "2026-11-09", amount: "25", note: "ema maksis" };
const lessonArgs = (over = {}) => ({
  actor: teacher, isAdmin: false, values: lessonValues, entry: scheduleEntry, occurs: true, lesson: { status: "Toimunud", teacherUid: "t1", subject: "Eesti keel" },
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
  assert.throws(() => lessonCashEntry(lessonArgs({ occurs: false, lesson: null })), /ei olnud/);
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

test("lesson cash needs a marked lesson (the flag sits on the lesson record that monthly billing reads)", () => {
  assert.throws(() => lessonCashEntry(lessonArgs({ lesson: null })), /Märgi tund enne toimunuks/);
  assert.throws(() => lessonCashEntry(lessonArgs({ lesson: { status: "Tühistatud", teacherUid: "t1" } })), /Märgi tund enne toimunuks/);
  assert.equal(lessonCashEntry(lessonArgs({ lesson: { status: "Puudus_eta", teacherUid: "t1" } })).status, "open");
});

test("an invoice of the lesson's month made before the cash: named on the receipt and the lesson flag, never edited", () => {
  const invoices = [
    { id: "m1", num: "KS-2026-120", planMonth: "2026-11", studentId: "s1", status: "Ootel" },
    { id: "c1", num: "KS-2026-121", planMonth: "2026-11", studentIds: ["s9", "s1"], status: "Makstud" },
    { id: "m1", num: "KS-2026-120", planMonth: "2026-11", studentId: "s1", status: "Ootel" }, // the same invoice from the second query
    { id: "x1", num: "KS-2026-099", planMonth: "2026-11", studentId: "s1", status: "Tühistatud" },
    { id: "o1", num: "KS-2026-090", planMonth: "2026-10", studentId: "s1", status: "Makstud" },
    { id: "f1", num: "FIE-1", planMonth: "2026-11", studentId: "s1", issuer: "fie" },
    { id: "t1", num: "KS-2026-100", studentId: "s1", status: "Ootel" }, // a package invoice: no month
  ];
  const covering = invoicesCoveringLesson(invoices, { studentId: "s1", occurrenceDate: "2026-11-09" });
  assert.deepEqual(covering, [{ id: "m1", num: "KS-2026-120" }, { id: "c1", num: "KS-2026-121" }]);
  const entry = lessonCashEntry(lessonArgs({ invoicedBefore: covering }));
  assert.deepEqual(entry.invoicedBefore, covering);
  const flag = lessonCashFlag("lessoncash_x", entry, lessonNow);
  assert.deepEqual(flag, { receiptId: "lessoncash_x", amountCents: 2500, at: lessonNow, byUid: "t1", invoicedBefore: ["KS-2026-120", "KS-2026-121"] });
  assert.deepEqual(lessonCashEntry(lessonArgs()).invoicedBefore, []);
});

// ---- owner 2026-11-11: „Maksab sularahas” card setting, server-side amount; review D1 ----
const { cashSubjectsOf, lessonCashPayer, lessonCashPriceCents, lessonSettledRefusal, paysCashFor } = require("./cash-core");
const { lessonIsBillable, buildLessonInvoiceLines, selectBillableLessons } = require("./finance-core");
const { lessonTakesToken } = require("./lesson-tokens-core");

test("cash payer: the card's cash subjects; '*' = every subject; names match ignoring case", () => {
  assert.deepEqual(cashSubjectsOf(["Eesti keel", " eesti keel ", "", 5, "Eesti keel"]), ["Eesti keel", "eesti keel", "5"]);
  assert.deepEqual(cashSubjectsOf("Eesti keel"), []);
  assert.equal(paysCashFor({ cashSubjects: ["*"] }, "Matemaatika"), true);
  assert.equal(paysCashFor({ cashSubjects: ["Inglise keel"] }, "inglise Keel"), true);
  assert.equal(paysCashFor({ cashSubjects: ["Inglise keel"] }, "Eesti keel"), false);
  assert.equal(paysCashFor({}, "Eesti keel"), false);
  assert.equal(paysCashFor(null, "Eesti keel"), false);
});

test("cash amount: the subject's own price or the card's, scaled to the lesson's length; no price = 0", () => {
  const plan = { lessonPriceCents: 2500, lessonMinutes: 60, subjectPrices: { Matemaatika: { lessonPriceCents: 3000, lessonMinutes: 45 } } };
  assert.equal(lessonCashPriceCents(plan, "Eesti keel", 60), 2500);
  assert.equal(lessonCashPriceCents(plan, "Eesti keel", 90), 3750);
  assert.equal(lessonCashPriceCents(plan, "Eesti keel", 0), 2500);
  assert.equal(lessonCashPriceCents(plan, "matemaatika", 45), 3000);
  assert.equal(lessonCashPriceCents(plan, "Matemaatika", 90), 6000);
  assert.equal(lessonCashPriceCents(null, "Eesti keel", 60), 0);
  assert.equal(lessonCashPriceCents({ lessonMinutes: 60 }, "Eesti keel", 60), 0);
  const payer = lessonCashPayer({ ...plan, cashSubjects: ["Matemaatika"] }, "Eesti keel");
  assert.deepEqual(payer, { all: false, subjects: ["Matemaatika"], mainSubject: "Eesti keel", main: { unitCents: 2500, minutes: 60 }, prices: { Matemaatika: { unitCents: 3000, minutes: 45 } } });
  assert.equal(lessonCashPayer(plan, "Eesti keel"), null);
  assert.equal(lessonCashPayer({ ...plan, cashSubjects: ["*"] }, "Eesti keel").all, true);
});

test("lesson cash: the server's amount wins over a typed one; no price on the card = refused", () => {
  assert.equal(lessonCashEntry(lessonArgs({ amountCents: 3750 })).amountCents, 3750);
  assert.equal(lessonCashEntry(lessonArgs({ values: { ...lessonValues, amount: "999" }, amountCents: 2500 })).amountCents, 2500);
  assert.throws(() => lessonCashEntry(lessonArgs({ amountCents: 0 })), /tunnihinda/);
});

test("D1: a lesson already invoiced, paid directly, free or paid by the school is not paid in cash again", () => {
  const held = { status: "Toimunud", teacherUid: "t1" };
  assert.equal(lessonSettledRefusal(held), "");
  assert.equal(lessonSettledRefusal({ ...held, packageConsumptionStatus: "consumed", packageAccountingSource: "package_ledger_v1" }), "");
  assert.match(lessonSettledRefusal({ ...held, invoiceId: "inv1" }), /arvel/);
  assert.match(lessonSettledRefusal({ ...held, billingStatus: "invoiced" }), /arvel/);
  assert.match(lessonSettledRefusal({ ...held, directPaymentId: "p1" }), /makstud/);
  assert.match(lessonSettledRefusal({ ...held, billingStatus: "school_covered" }), /kooli kulul/);
  assert.throws(() => lessonCashEntry(lessonArgs({ lesson: { ...held, invoiceId: "inv1" }, amountCents: 2500 })), /arvel/);
});

test("D1: a cash-paid lesson is not billable (per-lesson invoice, bank payment, advance); undone → billable again", () => {
  const held = { id: "l1", date: "2026-11-09", status: "Toimunud", accountingSource: "crm_v2", studentId: "s1" };
  const paid = { ...held, cashPaid: { receiptId: "lessoncash_l1", amountCents: 2500 } };
  assert.equal(lessonIsBillable(held), true);
  assert.equal(lessonIsBillable(paid), false);
  assert.equal(lessonIsBillable({ ...paid, billingStatus: "late_cancel_billable" }), false);
  // the per-lesson invoice: selection skips it, building lines refuses it
  assert.deepEqual(selectBillableLessons([held, { ...paid, id: "l2" }]).map(lesson => lesson.id), ["l1"]);
  assert.throws(() => buildLessonInvoiceLines([paid], 25), /not completed/);
  // undo: the flag is removed → billable again
  const { cashPaid: _cashPaid, ...undone } = paid;
  assert.equal(lessonIsBillable(undone), true);
});

test("D1: a cash-paid lesson takes no package credit (held or charged no-show); undone → takes it again", () => {
  const flag = { cashPaid: { receiptId: "lessoncash_l1", amountCents: 2500 } };
  assert.equal(lessonTakesToken({ status: "Toimunud", ...flag }), false);
  assert.equal(lessonTakesToken({ status: "Puudus_eta", ...flag }, { chargeNoShow: true }), false);
  assert.equal(lessonTakesToken({ status: "Toimunud" }), true);
  assert.equal(lessonTakesToken({ status: "Toimunud", cashPaid: {} }), true);
});
