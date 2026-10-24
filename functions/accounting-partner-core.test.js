const test = require("node:test");
const assert = require("node:assert/strict");
const { manualPartnerSuggestions, partnerBackfillPatch, partnerBackfillPlan } = require("./accounting-partner-core");

const supplier = { id: "s1", name: "Senty Studio OÜ", regCode: "14512345" };
const invoice = { id: "pi1", supplierId: "s1", supplierName: "Senty Studio (old)", documentNumber: "1575" };
const oa = { id: "auto_purchase-invoice_pi1", number: "2026-0100", date: "2026-10-01", origin: "auto", documentType: "purchaseInvoice", purchaseInvoiceId: "pi1", documentRef: "1575", lines: [{ account: "4210", debitCents: 300, creditCents: 0 }, { account: "2110", debitCents: 0, creditCents: 300 }] };
const vm = { id: "auto_purchase-payment_pi1_p1", number: "2026-0101", date: "2026-10-05", origin: "auto", documentType: "supplierPayment", sourceKey: "purchase-payment:pi1:p1", documentRef: "1575", lines: [{ account: "2110", debitCents: 300, creditCents: 0 }, { account: "1010", debitCents: 0, creditCents: 300 }] };
const partner = { type: "supplier", id: "s1", name: "Senty Studio OÜ" };

test("backfill plan: OA / VM lines get the supplier of their purchase invoice (its current name)", () => {
  const plan = partnerBackfillPlan({ entries: [oa, vm, { id: "m1", origin: "manual", documentType: "other", lines: [] }], purchaseInvoices: [invoice], suppliers: [supplier] });
  assert.equal(plan.purchaseEntries, 2);
  assert.deepEqual(plan.update.map((u) => [u.number, u.lineIndexes]), [["2026-0100", [0, 1]], ["2026-0101", [0, 1]]]);
  assert.equal(plan.linesToSet, 4);
  assert.deepEqual(plan.update[0].lines[1].partner, partner);
});

test("backfill plan: already set, conflicts, deleted, locked, missing invoice or supplier, storno via its source", () => {
  const done = { ...oa, lines: oa.lines.map((l) => ({ ...l, partner })) };
  const conflict = { ...vm, lines: [{ ...vm.lines[0], partner: { type: "supplier", id: "other", name: "Other" } }, vm.lines[1]] };
  const storno = { id: "reversal_x", number: "2026-0102", date: "2026-10-06", origin: "reversal", reversalOf: oa.id, documentType: "purchaseInvoice", lines: [{ account: "2110", debitCents: 300, creditCents: 0 }] };
  const plan = partnerBackfillPlan({
    entries: [done, conflict, storno, { ...oa, id: "del", deleted: true }, { ...oa, id: "old", date: "2026-01-31" }, { ...oa, id: "x", purchaseInvoiceId: "missing" }, { ...oa, id: "y", purchaseInvoiceId: "pi2" }],
    purchaseInvoices: [invoice, { id: "pi2", supplierId: "gone", supplierName: "Gone OÜ" }], suppliers: [supplier], lockedThrough: "2026-01-31",
  });
  assert.deepEqual(plan.alreadySet.map((e) => e.id), [oa.id]);
  assert.deepEqual(plan.conflicts.map((c) => [c.id, c.line, c.current.id]), [[vm.id, 1, "other"]]);
  assert.deepEqual(plan.update.map((u) => [u.id, u.lineIndexes]), [[vm.id, [1]], ["reversal_x", [0]]], "a conflicting line stays, the empty line of the same entry is set");
  assert.deepEqual(plan.deleted.map((e) => e.id), ["del"]);
  assert.deepEqual(plan.locked.map((e) => e.id), ["old"]);
  assert.deepEqual(plan.noInvoice.map((e) => e.id), ["x"]);
  assert.deepEqual(plan.noSupplier.map((e) => e.supplierName), ["Gone OÜ"]);
  assert.deepEqual(partnerBackfillPlan({ entries: [{ ...oa, date: "2026-03-03" }], purchaseInvoices: [invoice], suppliers: [supplier], closedDates: ["2026-03-03"] }).locked.length, 1);
});

test("backfill patch: lines + a history item with before / after; an override keeps the same lines", () => {
  const [item] = partnerBackfillPlan({ entries: [{ ...oa, override: { lines: oa.lines, reason: "x" }, history: [{ action: "override" }] }], purchaseInvoices: [invoice], suppliers: [supplier] }).update;
  const { patch, before, after } = partnerBackfillPatch({ ...oa, override: { lines: oa.lines, reason: "x" }, history: [{ action: "override" }] }, item, { nowIso: "2026-10-24T10:00:00.000Z", actorData: { uid: "script" } });
  assert.equal(patch.history.length, 2);
  assert.equal(patch.history[1].action, "partner");
  assert.equal(before.lines[0].partner, undefined);
  assert.deepEqual(after.lines[0].partner, partner);
  assert.deepEqual(patch.override.lines, item.lines);
  assert.equal(patch.override.reason, "x");
});

test("manual entries typed before Tarnijad: one supplier named in the text → suggested on its 2110 / 1350 lines only", () => {
  const suppliers = [{ id: "k", name: "Kirsi Residents OÜ" }, { id: "z", name: "Zone Media OÜ", regCode: "12233344" }, { id: "j", name: "Julianus Inkasso OÜ" }];
  const manual = (id, description, documentRef, lines, extra = {}) => ({ id, number: id, date: "2026-03-01", origin: "manual", documentType: "other", description, documentRef, lines, ...extra });
  const out = manualPartnerSuggestions({ suppliers, lockedThrough: "2026-01-31", entries: [
    manual("a", "Kirsi Residents OÜ arve 2025/195", "1327517490", [{ account: "2110", debitCents: 100 }, { account: "1010", creditCents: 100 }]),
    manual("b", "ostuarve", "OA-1010140274 kood 12233344", [{ account: "4320", debitCents: 100 }, { account: "2110", creditCents: 100 }]),
    manual("c", "Kirsi Residents arved, tasumine Julianus Inkasso kaudu", "PA", [{ account: "2110", debitCents: 1 }, { account: "1010", creditCents: 1 }]),
    manual("d", "ostuarve APPLE.COM", "PA-ülekanne", [{ account: "2110", debitCents: 1 }, { account: "1010", creditCents: 1 }]),
    manual("e", "Kirsi Residents", "x", [{ account: "2110", debitCents: 1 }, { account: "1010", creditCents: 1 }], { date: "2026-01-03" }),
    manual("f", "Kirsi Residents", "x", [{ account: "4210", debitCents: 1 }, { account: "1010", creditCents: 1 }]),
    manual("g", "Kirsi Residents", "x", [{ account: "2110", debitCents: 1, partner: { type: "supplier", id: "k", name: "Kirsi" } }, { account: "1010", creditCents: 1 }]),
  ] });
  assert.deepEqual(out.suggest.map((s) => [s.id, s.partner.id, s.lineIndexes]), [["a", "k", [0]], ["b", "z", [1]]]);
  assert.equal(out.suggest[0].lines[1].partner, undefined, "the bank line is not touched");
  assert.deepEqual(out.ambiguous.map((s) => [s.id, s.candidates.length]), [["c", 2]]);
  assert.deepEqual(out.none.map((s) => s.id), ["d"]);
  assert.deepEqual(out.locked.map((s) => s.id), ["e"]);
  assert.equal(out.linesToSet, 2);
});
