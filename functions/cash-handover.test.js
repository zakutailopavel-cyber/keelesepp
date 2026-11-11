const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("./cash-core");

// „Minu kassa” (owner 2026-11-11): a teacher's own cash box and hand-overs to a cash receiver (docs/ACCOUNTING.md).
const nowIso = "2026-11-11T10:00:00.000Z";
const r = (id, cents, extra = {}) => ({ id, type: "receipt", source: "lesson", holderUid: "t1", holderName: "Mari", amountCents: cents, receivedAt: `2026-11-0${extra.day || 1}`, status: "open", createdAt: `2026-11-0${extra.day || 1}T10:00:00.000Z`, ...extra });
const h = (id, cents, extra = {}) => ({ id, type: "handover", fromUid: "t1", fromName: "Mari", toUid: "a1", toName: "Pavel", amountCents: cents, handedAt: "2026-11-05", status: "pending", createdAt: `2026-11-05T1${extra.n || 0}:00:00.000Z`, ...extra });

test("pending and rejected hand-overs do not move money; confirmed ones do", () => {
  const entries = [r("r1", 2500), r("r2", 3000, { day: 2 }), h("h1", 2500, { items: [{ id: "r1", cents: 2500 }] })];
  assert.equal(core.cashBalances(entries).t1.cents, 5500);
  assert.equal(core.cashBalances(entries).a1, undefined);
  assert.equal(core.cashBalances([...entries.slice(0, 2), { ...entries[2], status: "rejected" }]).t1.cents, 5500);
  const confirmed = core.cashBalances([...entries.slice(0, 2), { ...entries[2], status: "active" }]);
  assert.equal(confirmed.t1.cents, 3000);
  assert.equal(confirmed.a1.cents, 2500);
  // older hand-overs without a status still count
  const { status: _status, ...legacy } = h("old", 500);
  assert.equal(core.cashBalances([r("r1", 2500), legacy]).t1.cents, 2000);
});

test("cashPosition: on hand, waiting for the receiver, still available; named items and the admin's amount-only hand-over", () => {
  let position = core.cashPosition([r("r1", 2500), r("r2", 3000, { day: 2 }), h("h1", 3000, { items: [{ id: "r2", cents: 3000 }] })], "t1");
  assert.equal(position.onHandCents, 5500);
  assert.equal(position.pendingOutCents, 3000);
  assert.equal(position.availableCents, 2500);
  assert.deepEqual(position.items.map((item) => item.id), ["r1"]);
  assert.equal(position.remaining.r2, 0);
  assert.equal(position.ever, true);
  // the admin's „Sain kätte” of 10 € (no items) takes the oldest money first
  position = core.cashPosition([r("r1", 2500), r("r2", 3000, { day: 2 }), h("s1", 1000, { status: "active", n: 1 })], "t1");
  assert.equal(position.onHandCents, 4500);
  assert.equal(position.remaining.r1, 1500);
  assert.equal(position.remaining.r2, 3000);
  // void entries and other people's entries are ignored
  position = core.cashPosition([r("r1", 2500, { status: "void" }), h("h9", 100, { status: "void" }), r("x", 900, { holderUid: "t2" })], "t1");
  assert.equal(position.onHandCents, 0);
  assert.equal(position.items.length, 0);
  assert.equal(core.cashPosition([], "t1").ever, false);
  // the receiver: a confirmed hand-over is their money and can be handed on (Oleksiy → Pavel)
  position = core.cashPosition([r("r1", 2500), h("h1", 2500, { status: "active", toUid: "a2", items: [{ id: "r1", cents: 2500 }] })], "a2");
  assert.equal(position.availableCents, 2500);
  assert.deepEqual(position.items.map((item) => item.id), ["h1"]);
});

test("receivers: the saved list, else the owner + the FVHgmN admin; only active staff", () => {
  const people = [
    { uid: "2ai5mVQCmjSGjsy7t53JrqKgZdX2", name: "Pavel Zakutailo", isAdmin: true },
    { uid: "FVHgmNabc", name: "Oleksiy Skoryk", isAdmin: true },
    { uid: "FVHgmNteacher", name: "Not admin", isAdmin: false },
    { uid: "t1", name: "Mari" },
    { uid: "gone", name: "Left", active: false },
  ];
  assert.deepEqual(core.cashReceivers({ people }).map((row) => row.uid), ["2ai5mVQCmjSGjsy7t53JrqKgZdX2", "FVHgmNabc"]);
  assert.deepEqual(core.cashReceivers({ settings: { uids: ["t1", "gone", "FVHgmNabc", "t1"] }, people }).map((row) => row.uid), ["t1", "FVHgmNabc"]);
  assert.deepEqual(core.cleanReceiverUids(["t1", "t1", "FVHgmNabc"], people), ["t1", "FVHgmNabc"]);
  assert.throws(() => core.cleanReceiverUids([], people), /vähemalt üks/);
  assert.throws(() => core.cleanReceiverUids(["gone"], people), /aktiivne/);
  assert.throws(() => core.cleanReceiverUids(["stranger"], people), /aktiivne/);
});

test("„Andsin raha üle”: everything available or chosen entries, only own cash, only to a listed receiver, never 0 €", () => {
  const receivers = [{ uid: "a1", name: "Pavel" }, { uid: "a2", name: "Oleksiy" }];
  const mari = { uid: "t1", name: "Mari" };
  const position = core.cashPosition([r("r1", 2500), r("r2", 3000, { day: 2 })], "t1");
  const all = core.handoverRequestEntry({ actor: mari, from: mari, to: { uid: "a2", name: "Oleksiy" }, receivers, position, nowIso });
  assert.equal(all.status, "pending");
  assert.equal(all.amountCents, 5500);
  assert.equal(all.handedAt, "2026-11-11");
  assert.deepEqual(all.items, [{ id: "r1", cents: 2500 }, { id: "r2", cents: 3000 }]);
  const one = core.handoverRequestEntry({ actor: mari, from: mari, to: { uid: "a1", name: "Pavel" }, receivers, position, itemIds: ["r2"], nowIso });
  assert.equal(one.amountCents, 3000);
  assert.throws(() => core.handoverRequestEntry({ actor: mari, from: mari, to: { uid: "t2" }, receivers, position, nowIso }), /vastuvõtjate/);
  assert.throws(() => core.handoverRequestEntry({ actor: mari, from: { uid: "t2" }, to: { uid: "a1" }, receivers, position, nowIso }), /enda käes/);
  assert.throws(() => core.handoverRequestEntry({ actor: { uid: "a1" }, from: { uid: "a1" }, to: { uid: "a1" }, receivers, position, nowIso }), /iseendale/);
  assert.throws(() => core.handoverRequestEntry({ actor: mari, from: mari, to: { uid: "a1" }, receivers, position, itemIds: ["nope"], nowIso }), /ei ole enam/);
  // what already waits for a receiver cannot be given twice; 0 € is refused
  const after = core.cashPosition([r("r1", 2500), r("r2", 3000, { day: 2 }), { ...all, id: "h1" }], "t1");
  assert.equal(after.availableCents, 0);
  assert.throws(() => core.handoverRequestEntry({ actor: mari, from: mari, to: { uid: "a1" }, receivers, position: after, nowIso }), /ei ole praegu sularaha/);
  assert.throws(() => core.handoverRequestEntry({ actor: mari, from: mari, to: { uid: "a1" }, receivers, position: after, itemIds: ["r1"], nowIso }), /ei ole enam/);
  // „Ei saanud”: the money is the teacher's again and can be given anew
  const rejected = core.cashPosition([r("r1", 2500), r("r2", 3000, { day: 2 }), { ...all, id: "h1", status: "rejected" }], "t1");
  assert.equal(rejected.availableCents, 5500);
});

test("only the addressed receiver answers; „Ei saanud” needs a note; the giver cancels only while pending", () => {
  const pending = h("h1", 2500, { toUid: "a2" });
  assert.equal(core.handoverAnswerPatch({ actor: { uid: "a2", name: "Oleksiy" }, entry: pending, decision: "confirm", nowIso }).status, "active");
  assert.throws(() => core.handoverAnswerPatch({ actor: { uid: "a1" }, entry: pending, decision: "confirm", nowIso }), /ei ole sulle/);
  assert.throws(() => core.handoverAnswerPatch({ actor: { uid: "t1" }, entry: pending, decision: "confirm", nowIso }), /ei ole sulle/);
  assert.throws(() => core.handoverAnswerPatch({ actor: { uid: "a2" }, entry: pending, decision: "reject", note: " ", nowIso }), /Kirjuta/);
  const rejected = core.handoverAnswerPatch({ actor: { uid: "a2" }, entry: pending, decision: "reject", note: "puudu 5 €", nowIso });
  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.rejectNote, "puudu 5 €");
  assert.equal(core.handoverAnswerPatch({ actor: { uid: "a2" }, entry: { ...pending, status: "active" }, decision: "confirm", nowIso }), null);
  assert.throws(() => core.handoverAnswerPatch({ actor: { uid: "a2" }, entry: { ...pending, status: "rejected" }, decision: "confirm", nowIso }), /ei oota/);
  assert.equal(core.handoverCancelRefusal({ actor: { uid: "t1" }, entry: pending }), "");
  assert.match(core.handoverCancelRefusal({ actor: { uid: "a2" }, entry: pending }), /sinu üleandmine/);
  assert.match(core.handoverCancelRefusal({ actor: { uid: "t1" }, entry: { ...pending, status: "active" } }), /kinnitatud/);
});

test("undo of a lesson-cash mark: not for the teacher once it is in a hand-over (pending or confirmed); the admin may", () => {
  const today = "2026-11-01T12:00:00.000Z";
  const receipt = { ...r("r1", 2500), createdBy: { uid: "t1" } };
  let position = core.cashPosition([receipt], "t1");
  assert.equal(core.lessonCashUndoRefusal({ actor: { uid: "t1" }, isAdmin: false, entry: receipt, balanceCents: position.availableCents, remainingCents: position.remaining.r1, nowIso: today }), "");
  position = core.cashPosition([receipt, h("h1", 2500, { items: [{ id: "r1", cents: 2500 }] })], "t1");
  assert.match(core.lessonCashUndoRefusal({ actor: { uid: "t1" }, isAdmin: false, entry: receipt, balanceCents: position.availableCents, remainingCents: position.remaining.r1, nowIso: today }), /üle antud/);
  position = core.cashPosition([receipt, h("h1", 2500, { status: "active", items: [{ id: "r1", cents: 2500 }] })], "t1");
  assert.match(core.lessonCashUndoRefusal({ actor: { uid: "t1" }, isAdmin: false, entry: receipt, remainingCents: position.remaining.r1, nowIso: today }), /üle antud/);
  assert.equal(core.lessonCashUndoRefusal({ actor: { uid: "a1" }, isAdmin: true, entry: receipt, remainingCents: 0, nowIso: today }), "");
  const marks = core.lessonCashMarks([{ ...receipt, lessonId: "L1" }], { uid: "t1", isAdmin: false, remaining: position.remaining, nowIso: today });
  assert.equal(marks.L1.canUndo, false);
});

test("myCashView: only own entries, newest first, hand-overs waiting for me apart", () => {
  const entries = [r("r1", 2500), r("x", 900, { holderUid: "t2", studentName: "Võõras" }), h("h1", 2500, { items: [{ id: "r1", cents: 2500 }] }), h("h2", 700, { fromUid: "t2", toUid: "t1", n: 2 })];
  const view = core.myCashView(entries, "t1");
  assert.equal(view.onHandCents, 2500);
  assert.equal(view.pendingOutCents, 2500);
  assert.equal(view.availableCents, 0);
  assert.equal(view.items.length, 0);
  assert.deepEqual(view.handovers.map((row) => [row.id, row.status, row.itemCount]), [["h1", "pending", 1]]);
  assert.deepEqual(view.incoming.map((row) => row.id), ["h2"]);
  assert.equal(JSON.stringify(view).includes("Võõras"), false);
});
