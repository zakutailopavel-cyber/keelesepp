const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("./cash-core");

// „Sain sularaha” in „Minu kassa” (owner 2026-11-26): a teacher records cash they got; off the books like lesson cash.
const nowIso = "2026-11-26T10:00:00.000Z";
const teacher = { uid: "t1", name: "Anna Õpetaja" };
const student = { name: "Mari Tamm", parentName: "Kati Tamm", teacherUid: "t1", active: true };
const otherStudent = { name: "Jaan Kask", teacherUid: "t2", enrollments: [{ teacherUid: "t3" }], active: true };
const values = { amount: "100", receivedAt: "2026-11-26", purpose: "lessons", lessons: "4", note: "detsembri tunnid" };

test("create: a receipt source teacher, held by the actor, with the payer, purpose and lesson count", () => {
  const entry = core.teacherReceiptEntry({ actor: teacher, isAdmin: false, values, studentId: "s1", student, nowIso });
  assert.equal(entry.type, "receipt");
  assert.equal(entry.source, "teacher");
  assert.equal(entry.holderUid, "t1");
  assert.equal(entry.amountCents, 10000);
  assert.equal(entry.receivedAt, "2026-11-26");
  assert.equal(entry.studentId, "s1");
  assert.equal(entry.studentName, "Mari Tamm");
  assert.equal(entry.payerName, "Kati Tamm");
  assert.equal(entry.purpose, "lessons");
  assert.equal(entry.lessons, 4);
  assert.equal(entry.status, "open");
  assert.equal(entry.invoiceId, null);
  assert.deepEqual(entry.createdBy, { uid: "t1", name: "Anna Õpetaja" });
  // a missing day is today; „Muu” carries no lesson count
  const other = core.teacherReceiptEntry({ actor: teacher, isAdmin: false, values: { amount: "12,50", purpose: "other", lessons: "3" }, studentId: "s1", student, nowIso });
  assert.equal(other.receivedAt, "2026-11-26");
  assert.equal(other.amountCents, 1250);
  assert.equal(other.lessons, null);
});

test("create: „Muu maksja” = no card, a required typed name", () => {
  const entry = core.teacherReceiptEntry({ actor: teacher, isAdmin: false, values: { ...values, payerName: "  Mari ema  " }, studentId: null, nowIso });
  assert.equal(entry.studentId, null);
  assert.equal(entry.studentName, "");
  assert.equal(entry.payerName, "Mari ema");
  assert.throws(() => core.teacherReceiptEntry({ actor: teacher, isAdmin: false, values: { ...values, payerName: " " }, studentId: null, nowIso }), /maksja nimi/);
});

test("permission: a teacher only from their own student (main teacher or a track's); an admin from any", () => {
  assert.throws(() => core.teacherReceiptEntry({ actor: teacher, isAdmin: false, values, studentId: "s2", student: otherStudent, nowIso }), (error) => error.status === 403);
  assert.equal(core.teacherReceiptEntry({ actor: { uid: "t3", name: "T3" }, isAdmin: false, values, studentId: "s2", student: otherStudent, nowIso }).holderUid, "t3");
  const admin = core.teacherReceiptEntry({ actor: { uid: "a1", name: "Pavel" }, isAdmin: true, values, studentId: "s2", student: otherStudent, nowIso });
  assert.equal(admin.holderUid, "a1");
  assert.throws(() => core.teacherReceiptEntry({ actor: teacher, isAdmin: false, values, studentId: "s1", student: { ...student, active: false }, nowIso }), (error) => error.status === 404);
  assert.throws(() => core.teacherReceiptEntry({ actor: teacher, isAdmin: false, values, studentId: "s1", student: null, nowIso }), (error) => error.status === 404);
});

test("amount, purpose and lesson count are validated", () => {
  for (const amount of ["0", "-5", "abc", "1,234", ""]) {
    assert.throws(() => core.teacherReceiptEntry({ actor: teacher, isAdmin: false, values: { ...values, amount }, studentId: "s1", student, nowIso }), /Summa/);
  }
  assert.throws(() => core.teacherReceiptEntry({ actor: teacher, isAdmin: false, values: { ...values, purpose: "invoice" }, studentId: "s1", student, nowIso }), /Vali, mille eest/);
  for (const lessons of ["0", "2.5", "x", "201"]) {
    assert.throws(() => core.teacherReceiptEntry({ actor: teacher, isAdmin: false, values: { ...values, lessons }, studentId: "s1", student, nowIso }), /Tundide arv/);
  }
  assert.equal(core.teacherReceiptEntry({ actor: teacher, isAdmin: false, values: { ...values, lessons: "" }, studentId: "s1", student, nowIso }).lessons, null);
});

test("date range: today − 30 days … today, never the future", () => {
  assert.deepEqual(core.teacherCashDayRange(nowIso), { min: "2026-10-27", max: "2026-11-26" });
  const at = (receivedAt) => core.teacherReceiptEntry({ actor: teacher, isAdmin: false, values: { ...values, receivedAt }, studentId: "s1", student, nowIso });
  assert.equal(at("2026-10-27").receivedAt, "2026-10-27");
  assert.throws(() => at("2026-10-26"), /30 päeva/);
  assert.throws(() => at("2026-11-27"), /tulevikus/);
  assert.throws(() => at("2026-13-40"), /vigane/);
  // the school's local day: 23:30 UTC on the 26th is already the 27th in Tallinn
  assert.equal(core.teacherCashDayRange("2026-11-26T23:30:00.000Z").max, "2026-11-27");
});

const own = (extra = {}) => ({ id: "c1", ...core.teacherReceiptEntry({ actor: teacher, isAdmin: false, values, studentId: "s1", student, nowIso }), ...extra });

test("edit / void permission: own entry while nothing of it is handed over; after that only an admin", () => {
  const entry = own();
  assert.equal(core.teacherReceiptChangeRefusal({ actor: teacher, isAdmin: false, entry, remainingCents: 10000 }), "");
  assert.match(core.teacherReceiptChangeRefusal({ actor: teacher, isAdmin: false, entry, remainingCents: 4000 }), /üle antud/);
  assert.match(core.teacherReceiptChangeRefusal({ actor: teacher, isAdmin: false, entry, remainingCents: 0 }), /üle antud/);
  assert.match(core.teacherReceiptChangeRefusal({ actor: { uid: "t2" }, isAdmin: false, entry, remainingCents: 10000 }), /sinu kirje/);
  assert.equal(core.teacherReceiptChangeRefusal({ actor: { uid: "a1" }, isAdmin: true, entry, remainingCents: 0 }), "");
  assert.match(core.teacherReceiptChangeRefusal({ actor: { uid: "a1" }, isAdmin: true, entry, remainingCents: 0, inPendingHandover: true }), /ootab kinnitust/);
  assert.match(core.teacherReceiptChangeRefusal({ actor: teacher, isAdmin: false, entry: own({ status: "void" }), remainingCents: 10000 }), /tühistatud/);
  // only „Sain sularaha” entries go through this path (lesson cash has its own undo)
  assert.match(core.teacherReceiptChangeRefusal({ actor: teacher, isAdmin: false, entry: { ...entry, source: "lesson" }, remainingCents: 10000 }), /ei leitud/);
});

test("the hand-over state from cashPosition: pending and confirmed hand-overs both lock the teacher's entry", () => {
  const entry = own();
  const handover = (status) => ({ id: "h1", type: "handover", fromUid: "t1", toUid: "a1", amountCents: 10000, items: [{ id: "c1", cents: 10000 }], status, createdAt: "2026-11-26T11:00:00.000Z" });
  for (const status of ["pending", "active"]) {
    const position = core.cashPosition([entry, handover(status)], "t1");
    assert.match(core.teacherReceiptChangeRefusal({ actor: teacher, isAdmin: false, entry, remainingCents: position.remaining.c1 }), /üle antud/);
  }
  const rejected = core.cashPosition([entry, handover("rejected")], "t1");
  assert.equal(core.teacherReceiptChangeRefusal({ actor: teacher, isAdmin: false, entry, remainingCents: rejected.remaining.c1 }), "");
});

test("edit: only changed fields, the old values for the audit, a kept old day stays valid", () => {
  const entry = own({ receivedAt: "2026-10-01" }); // older than 30 days now
  const change = core.teacherReceiptEditPatch({ actor: teacher, isAdmin: false, entry, values: { amount: "120", receivedAt: "2026-10-01", lessons: "5", note: "detsembri tunnid" }, nowIso });
  assert.deepEqual(change.previous, { amountCents: 10000, lessons: 4 });
  assert.equal(change.patch.amountCents, 12000);
  assert.equal(change.patch.lessons, 5);
  assert.equal(change.patch.receivedAt, undefined);
  assert.equal(change.patch.revision, 2);
  assert.deepEqual(change.patch.editedBy, { uid: "t1", name: "Anna Õpetaja" });
  assert.equal(core.teacherReceiptEditPatch({ actor: teacher, isAdmin: false, entry, values: { amount: "100" }, nowIso }), null);
  assert.throws(() => core.teacherReceiptEditPatch({ actor: teacher, isAdmin: false, entry, values: { receivedAt: "2026-12-01" }, nowIso }), /tulevikus/);
  // „Muu” drops the lesson count; a new card must be the teacher's own; „Muu maksja” clears the card
  assert.deepEqual(core.teacherReceiptEditPatch({ actor: teacher, isAdmin: false, entry, values: { purpose: "other" }, nowIso }).previous, { purpose: "lessons", lessons: 4 });
  assert.throws(() => core.teacherReceiptEditPatch({ actor: teacher, isAdmin: false, entry, values: {}, studentId: "s2", student: otherStudent, nowIso }), (error) => error.status === 403);
  const toOther = core.teacherReceiptEditPatch({ actor: teacher, isAdmin: false, entry, values: { payerName: "Naaber" }, studentId: null, nowIso });
  assert.equal(toOther.patch.studentId, null);
  assert.equal(toOther.patch.payerName, "Naaber");
  assert.equal(toOther.previous.studentId, "s1");
});

test("off the books: one list — lesson and teacher cash, never a plain Kassa receipt or a hand-over", () => {
  assert.deepEqual([...core.OFF_BOOKS_SOURCES], ["lesson", "teacher"]);
  assert.equal(core.isOffBooks(own()), true);
  assert.equal(core.isOffBooks({ type: "receipt", source: "lesson" }), true);
  assert.equal(core.isOffBooks({ type: "receipt" }), false);
  assert.equal(core.isOffBooks({ type: "handover", source: "teacher" }), false);
  assert.equal(core.withOffBooks(own()).offBooks, true);
  assert.equal(core.withOffBooks({ type: "receipt" }).offBooks, false);
});

test("myCashView: the teacher's entry with its payer, lessons, offBooks and canEdit until it is handed over", () => {
  const entry = own({ createdAt: "2026-11-26T10:00:00.000Z" });
  let view = core.myCashView([entry], "t1");
  assert.equal(view.onHandCents, 10000);
  assert.deepEqual(
    (({ source, studentName, lessons, purpose, offBooks, canEdit, ownEntry }) => ({ source, studentName, lessons, purpose, offBooks, canEdit, ownEntry }))(view.items[0]),
    { source: "teacher", studentName: "Mari Tamm", lessons: 4, purpose: "lessons", offBooks: true, canEdit: true, ownEntry: true },
  );
  view = core.myCashView([entry, { id: "h1", type: "handover", fromUid: "t1", toUid: "a1", amountCents: 4000, items: [{ id: "c1", cents: 4000 }], status: "pending", createdAt: "2026-11-26T11:00:00.000Z" }], "t1");
  assert.equal(view.items[0].remainingCents, 6000);
  assert.equal(view.items[0].canEdit, false);
});
