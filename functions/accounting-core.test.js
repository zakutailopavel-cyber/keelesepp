const test = require("node:test");
const assert = require("node:assert/strict");
const { DEFAULT_ACCOUNTS } = require("./accounting-chart");
const { automaticEntries, entryNumber, openingEntry, reversalOf, validateEntry } = require("./accounting-core");

const balance = (entries) => entries.every((e) => e.lines.reduce((n, l) => n + l.debitCents - l.creditCents, 0) === 0);
const byAccount = (entries) => {
  const out = {};
  entries.forEach((e) => e.lines.forEach((l) => { out[l.account] = (out[l.account] || 0) + l.debitCents - l.creditCents; }));
  return out;
};

test("the chart has the accounts the automatic entries use, each with a type and a report line", () => {
  const codes = new Set(DEFAULT_ACCOUNTS.map((a) => a.code));
  ["1000", "1010", "1200", "2450", "2500", "3000", "4210", "4300", "4320", "4050", "4340", "4360", "4330", "4510", "4398", "2970", "2980"].forEach((code) => assert.ok(codes.has(code), code));
  assert.equal(codes.size, DEFAULT_ACCOUNTS.length, "codes are unique");
  DEFAULT_ACCOUNTS.forEach((a) => {
    assert.match(a.type, /^(asset|liability|equity|income|expense)$/);
    assert.ok(a.name);
  });
});

test("an invoice, its payment by bank and a cash payment become balanced entries", () => {
  const entries = automaticEntries({
    invoices: [{ id: "i1", num: "KS-2026-001", date: "2026-02-03", amountCents: 8000, payerName: "Kati Tamm", status: "Makstud" }],
    payments: [
      { id: "p1", invoiceId: "i1", invoiceNum: "KS-2026-001", paidAt: "2026-02-10", amountCents: 5000, method: "bank", status: "active" },
      { id: "p2", invoiceId: "i1", invoiceNum: "KS-2026-001", paidAt: "2026-02-11", amountCents: 3000, method: "cash", status: "active" },
    ],
  });
  assert.deepEqual(entries.map((e) => e.sourceKey), ["invoice:i1", "payment:p1", "payment:p2"]);
  assert.ok(balance(entries));
  assert.deepEqual(byAccount(entries), { 1200: 0, 3000: -8000, 1010: 5000, 1000: 3000 });
  assert.equal(entries[0].documentRef, "KS-2026-001");
  assert.match(entries[0].description, /Müügiarve KS-2026-001 · Kati Tamm/);
});

test("documents before the start date are in the opening balances; a later payment of an old invoice is booked", () => {
  const entries = automaticEntries({
    invoices: [{ id: "old", num: "KS-2025-090", date: "2025-12-20", amountCents: 6000 }],
    payments: [{ id: "p", invoiceId: "old", invoiceNum: "KS-2025-090", paidAt: "2026-01-05", amountCents: 6000, method: "bank", status: "active" }],
  });
  assert.deepEqual(entries.map((e) => e.sourceKey), ["payment:p"]);
});

test("a cancelled invoice, a credit note and a voided payment are reversed on their own dates, never removed", () => {
  const entries = automaticEntries({
    invoices: [
      { id: "i1", num: "KS-2026-010", date: "2026-03-01", amountCents: 10000, status: "Tühistatud", cancelledAt: "2026-03-05T09:00:00.000Z" },
      { id: "i2", num: "KS-2026-011", date: "2026-03-01", amountCents: 9000, status: "Ootel" },
    ],
    creditNotes: [
      { id: "c1", num: "KR-1", invoiceId: "i1", invoiceNum: "KS-2026-010", date: "2026-03-02", amountCents: 2500 },
      { id: "c2", num: "KR-2", invoiceId: "i2", invoiceNum: "KS-2026-011", date: "2026-03-04", amountCents: -3000 },
    ],
    payments: [{ id: "p1", invoiceId: "i2", paidAt: "2026-03-03", amountCents: 6000, method: "bank", status: "void", voidedAt: "2026-03-06T08:00:00.000Z", voidReason: "vale arve" }],
  });
  const keys = entries.map((e) => `${e.date} ${e.sourceKey}`);
  assert.deepEqual(keys, [
    "2026-03-01 invoice:i1", "2026-03-01 invoice:i2", "2026-03-02 credit-note:c1", "2026-03-03 payment:p1",
    "2026-03-04 credit-note:c2", "2026-03-05 invoice-cancel:i1", "2026-03-06 payment-void:p1",
  ]);
  // the cancellation reverses only what the credit note left open: 100 − 25 = 75
  assert.equal(entries.find((e) => e.sourceKey === "invoice-cancel:i1").totalCents ?? entries.find((e) => e.sourceKey === "invoice-cancel:i1").lines[0].debitCents, 7500);
  const totals = byAccount(entries);
  assert.equal(totals["3000"], -(9000 - 3000));
  assert.equal(totals["1200"], 9000 - 3000);
  assert.equal(totals["1010"], 0);
  assert.ok(balance(entries));
});

test("prepayments: unmatched bank money and overpayments go to 2500; a payment from the credit clears it; a refund pays it back", () => {
  const entries = automaticEntries({
    bankTransactions: [{ id: "banktx_1", externalId: "x1", paidAt: "2026-05-07" }],
    payerCredits: [
      { id: "banktx_1", bankTransactionId: "banktx_1", originalAmountCents: 18500, payerName: "Pere" },
      { id: "res_c1", sourcePaymentId: "p9", sourceInvoiceNum: "KS-2026-020", originalAmountCents: 1000, createdAt: "2026-05-10T10:00:00.000Z" },
    ],
    payments: [{ id: "pc", invoiceId: "i5", invoiceNum: "KS-2026-021", paidAt: "2026-05-12", amountCents: 8000, method: "credit", status: "active" }],
    refunds: [{ id: "r1", refundedAt: "2026-05-20", amountCents: 1000, method: "bank" }],
  });
  const totals = byAccount(entries);
  assert.equal(totals["2500"], -(18500 + 1000 - 8000 - 1000));
  assert.equal(totals["1010"], 18500 - 1000);
  assert.equal(totals["1200"], 1000 - 8000);
  assert.ok(balance(entries));
});

test("an expense goes to the account of its category from the payment account; a correction reverses the old one", () => {
  const entries = automaticEntries({
    expenses: [
      { id: "e1", expenseDate: "2026-04-01", category: "rent", description: "Aprilli rent", amountCents: 30000, paymentMethod: "bank", status: "corrected", correctedAt: "2026-04-03T10:00:00.000Z" },
      { id: "e2", expenseDate: "2026-04-01", category: "rent", description: "Aprilli rent", amountCents: 32000, paymentMethod: "bank", status: "active" },
      { id: "e3", expenseDate: "2026-04-02", category: "office", description: "Paber", amountCents: 1250, paymentMethod: "cash", status: "active" },
      { id: "e4", expenseDate: "2026-04-02", category: "unknown", description: "Muu", amountCents: 100, paymentMethod: "other", status: "active" },
      { id: "e5", expenseDate: "2026-04-02", category: "travel", description: "Vale", amountCents: 700, paymentMethod: "bank", status: "voided", voidedAt: "2026-04-04T10:00:00.000Z", voidReason: "topelt" },
    ],
  });
  const totals = byAccount(entries);
  assert.equal(totals["4210"], 32000);
  assert.equal(totals["4330"], 1250);
  assert.equal(totals["4398"], 100);
  assert.equal(totals["2450"], -100);
  assert.equal(totals["4510"], 0, "a voided expense is reversed");
  assert.ok(entries.some((e) => e.sourceKey === "expense-void:e5" && e.date === "2026-04-04"));
  assert.equal(totals["1010"], -32000);
  assert.equal(totals["1000"], -1250);
});

test("a manual entry must balance, use known open accounts and refer to a source document", () => {
  const accounts = [...DEFAULT_ACCOUNTS, { code: "9999", name: "Suletud", type: "expense", active: false }];
  const ok = validateEntry({ date: "2026-06-30", description: "Juuni palk", documentRef: "Palgaleht 06/2026", lines: [{ account: "4710", debitCents: 100000 }, { account: "2210", creditCents: 100000 }] }, accounts);
  assert.equal(ok.totalCents, 100000);
  assert.throws(() => validateEntry({ date: "2026-06-30", description: "x", documentRef: "d", lines: [{ account: "4710", debitCents: 100 }, { account: "2210", creditCents: 90 }] }, accounts), /ei ole võrdsed/);
  assert.throws(() => validateEntry({ date: "2026-06-30", description: "x", documentRef: "", lines: [{ account: "4710", debitCents: 100 }, { account: "2210", creditCents: 100 }] }, accounts), /algdokumendile/);
  assert.throws(() => validateEntry({ date: "2026-06-30", description: "x", documentRef: "d", lines: [{ account: "0001", debitCents: 100 }, { account: "2210", creditCents: 100 }] }, accounts), /kontoplaanis/);
  assert.throws(() => validateEntry({ date: "2026-06-30", description: "x", documentRef: "d", lines: [{ account: "9999", debitCents: 100 }, { account: "2210", creditCents: 100 }] }, accounts), /suletud/);
  assert.throws(() => validateEntry({ date: "2026-02-30", description: "x", documentRef: "d", lines: [{ account: "4710", debitCents: 100 }, { account: "2210", creditCents: 100 }] }, accounts), /kuupäev/);
});

test("a correction is a storno with a reason; a storno or an already reversed entry cannot be reversed again", () => {
  const entry = { id: "e1", number: "2026-0007", documentRef: "Arve 5", origin: "manual", totalCents: 500, lines: [{ account: "4398", debitCents: 500, creditCents: 0 }, { account: "1010", debitCents: 0, creditCents: 500 }] };
  const storno = reversalOf(entry, { date: "2026-07-01", reason: "vale konto" });
  assert.deepEqual(storno.lines.map((l) => [l.account, l.debitCents, l.creditCents]), [["4398", 0, 500], ["1010", 500, 0]]);
  assert.equal(storno.reversalOf, "e1");
  assert.match(storno.description, /Storno: kanne 2026-0007 · vale konto/);
  assert.throws(() => reversalOf(entry, { date: "2026-07-01", reason: "" }), /põhjus/);
  assert.throws(() => reversalOf({ ...entry, reversedBy: "x" }, { date: "2026-07-01", reason: "a" }), /juba tühistatud/);
  assert.throws(() => reversalOf({ ...entry, origin: "reversal" }, { date: "2026-07-01", reason: "a" }), /uuesti/);
});

test("opening balances must balance and have no income or expense accounts", () => {
  const opening = openingEntry([{ account: "1010", debitCents: 520000 }, { account: "1200", debitCents: 30000 }, { account: "2910", creditCents: 250000 }, { account: "2970", creditCents: 300000 }], DEFAULT_ACCOUNTS);
  assert.equal(opening.date, "2026-01-01");
  assert.equal(opening.totalCents, 550000);
  assert.throws(() => openingEntry([{ account: "1010", debitCents: 100 }, { account: "2970", creditCents: 90 }], DEFAULT_ACCOUNTS), /ei ole võrdsed/);
  assert.throws(() => openingEntry([{ account: "3060", creditCents: 100 }, { account: "1010", debitCents: 100 }], DEFAULT_ACCOUNTS), /algsaldot ei ole/);
});

test("entry numbers are per year and sortable", () => {
  assert.equal(entryNumber(2026, 7), "2026-0007");
  assert.equal(entryNumber(2026, 1234), "2026-1234");
});

test("corrections while the period is open: a manual entry is edited, an automatic one gets new lines but keeps its date and document", () => {
  const { correctedEntry, assertDeletable, isLocked, snapshotOf } = require("./accounting-core");
  const accounts = DEFAULT_ACCOUNTS.map((a) => ({ ...a, active: true }));
  const manual = { id: "manual_1", number: "2026-0005", origin: "manual", date: "2026-09-30", description: "Palk", documentRef: "PL 09", lines: [{ account: "4710", debitCents: 1000, creditCents: 0 }, { account: "2210", debitCents: 0, creditCents: 1000 }] };
  const fixed = correctedEntry(manual, { date: "2026-09-29", description: "Septembri palk", documentRef: "PL 09", lines: [{ account: "4710", debitCents: 1200 }, { account: "2210", creditCents: 1200 }] }, accounts);
  assert.equal(fixed.before.lines[0].debitCents, 1000);
  assert.equal(fixed.after.lines[0].debitCents, 1200);
  assert.equal(fixed.after.date, "2026-09-29");
  assert.throws(() => correctedEntry(manual, { ...snapshotOf(manual) }, accounts), /Muudatusi/);
  assert.throws(() => correctedEntry(manual, { ...snapshotOf(manual), date: "2027-01-02" }, accounts), /Aastat/);
  assert.throws(() => correctedEntry(manual, { ...snapshotOf(manual), lines: [{ account: "4710", debitCents: 5 }, { account: "2210", creditCents: 4 }] }, accounts), /võrdsed/);

  const auto = { id: "auto_expense_e1", number: "2026-0006", origin: "auto", documentType: "expense", date: "2026-09-10", description: "Kulu: rent", documentRef: "1575", lines: [{ account: "4398", debitCents: 500, creditCents: 0 }, { account: "1010", debitCents: 0, creditCents: 500 }] };
  const override = correctedEntry(auto, { date: "2026-01-01", documentRef: "other", description: "Kulu: rent", lines: [{ account: "4210", debitCents: 500 }, { account: "1010", creditCents: 500 }] }, accounts);
  assert.equal(override.after.date, "2026-09-10", "the date of an automatic entry stays");
  assert.equal(override.after.documentRef, "1575", "the source document stays");
  assert.equal(override.after.lines[0].account, "4210");

  assert.throws(() => correctedEntry({ ...manual, reversedBy: "reversal_x" }, snapshotOf(manual), accounts), /storno/);
  assert.throws(() => correctedEntry({ ...manual, deleted: true }, snapshotOf(manual), accounts), /kustutatud/);
  assert.throws(() => correctedEntry({ ...manual, origin: "reversal" }, snapshotOf(manual), accounts), /Stornokannet/);
  assert.throws(() => correctedEntry({ ...manual, origin: "opening", date: "2026-01-01" }, { ...snapshotOf(manual) }, accounts), /algsaldot/);
  assert.doesNotThrow(() => assertDeletable(manual));
  assert.throws(() => assertDeletable(auto), /ainult käsitsi/);
  assert.equal(isLocked("2026-09-30", "2026-09-30"), true);
  assert.equal(isLocked("2026-10-01", "2026-09-30"), false);
  assert.equal(isLocked("2026-10-01", ""), false);
});

test("„Asenda konto”: the lines of one account move to another; an undo moves back exactly those lines", () => {
  const { correctedEntry, replaceAccountValues } = require("./accounting-core");
  const accounts = DEFAULT_ACCOUNTS.map((a) => ({ ...a, active: true }));
  const entry = { id: "auto_invoice_1", number: "2026-0001", origin: "auto", date: "2026-02-01", description: "Müügiarve KS-1", documentRef: "KS-1",
    lines: [{ account: "1200", debitCents: 8000, creditCents: 0 }, { account: "3060", debitCents: 0, creditCents: 5000 }, { account: "3000", debitCents: 0, creditCents: 3000 }] };
  const moved = replaceAccountValues(entry, "3060", "3000");
  assert.deepEqual(moved.lineIndexes, [1]);
  assert.deepEqual(moved.values.lines.map((l) => l.account), ["1200", "3000", "3000"]);
  assert.equal(moved.values.documentRef, "KS-1");
  // the same correction logic as a single edit: D = K, the document stays, before / after for the history
  const corrected = correctedEntry(entry, moved.values, accounts);
  assert.equal(corrected.before.lines[1].account, "3060");
  assert.equal(corrected.after.lines[1].account, "3000");
  assert.equal(corrected.totalCents, 8000);
  // already moved: nothing to do (a repeated request changes nothing)
  assert.equal(replaceAccountValues({ ...entry, lines: moved.values.lines }, "3060", "3000"), null);
  // undo: only line 1 goes back to 3060, line 2 (3000 from the start) stays
  const undo = replaceAccountValues({ ...entry, lines: moved.values.lines }, "3000", "3060", moved.lineIndexes);
  assert.deepEqual(undo.values.lines.map((l) => l.account), ["1200", "3060", "3000"]);
  assert.throws(() => replaceAccountValues(entry, "3060", "3060"), /samad/);
  assert.throws(() => replaceAccountValues(entry, "", "3000"), /mõlemad/);
  // a closed or unknown target account is refused by the same validation as an edit
  assert.throws(() => correctedEntry(entry, replaceAccountValues(entry, "3060", "9999").values, accounts), /9999/);
  // a storno is never corrected
  assert.throws(() => correctedEntry({ ...entry, origin: "reversal" }, moved.values, accounts), /Storno/);
});

test("batch targets: unique ids, limits and chunks that fit one transaction", () => {
  const { batchTargets, chunked, BATCH_CHUNK, BATCH_MAX } = require("./accounting-core");
  assert.deepEqual(batchTargets({ entryIds: ["a", "b", "a", " "] }).map((t) => t.entryId), ["a", "b"]);
  assert.deepEqual(batchTargets({ targets: [{ entryId: "a", lineIndexes: [1, "2", "x"] }] }), [{ entryId: "a", lineIndexes: [1, 2] }]);
  assert.throws(() => batchTargets({ entryIds: [] }), /Vali kanded/);
  assert.throws(() => batchTargets({ entryIds: Array.from({ length: BATCH_MAX + 1 }, (_, i) => `e${i}`) }), /Korraga/);
  const ids = Array.from({ length: 115 }, (_, i) => i);
  const parts = chunked(ids);
  assert.deepEqual(parts.map((p) => p.length), [BATCH_CHUNK, 15]);
  // each entry is one update and one audit record: a chunk stays within Firestore's 500 writes
  assert.ok(BATCH_CHUNK * 2 <= 500);
});

// ---- partners (the accountant 2026-10-24: „привяжи их к проводкам”) ----
const core = require("./accounting-core");
const chart = DEFAULT_ACCOUNTS.map((a) => ({ ...a, active: true }));
const kirsi = { type: "supplier", id: "sup1", name: "Kirsi Residents OÜ" };

test("validateEntry keeps a line's partner, checks a supplier exists and takes its current name", () => {
  const suppliers = new Map([["sup1", { id: "sup1", name: "Kirsi Residents OÜ" }]]);
  const entry = validateEntry({ date: "2026-03-01", description: "Üür", documentRef: "OA-2026/48", lines: [
    { account: "4210", debitCents: 31859 },
    { account: "2110", creditCents: 31859, partner: { ...kirsi, name: "  kirsi (vana nimi) " } },
  ] }, chart, { suppliers });
  assert.equal(entry.lines[0].partner, undefined, "no partner key on a line without one");
  assert.deepEqual(entry.lines[1].partner, kirsi);
  assert.throws(() => validateEntry({ date: "2026-03-01", description: "x", documentRef: "d", lines: [{ account: "4210", debitCents: 1 }, { account: "2110", creditCents: 1, partner: { type: "supplier", id: "nope", name: "Keegi" } }] }, chart, { suppliers }), /Tarnijat „Keegi” ei leitud/);
  assert.throws(() => validateEntry({ date: "2026-03-01", description: "x", documentRef: "d", lines: [{ account: "4210", debitCents: 1 }, { account: "2110", creditCents: 1, partner: { name: "Vaba tekst" } }] }, chart), /vali tarnija nimekirjast/);
  // without the suppliers map (Asenda konto, storno) the partner is kept as it is
  assert.equal(validateEntry({ date: "2026-03-01", description: "x", documentRef: "d", lines: [{ account: "4210", debitCents: 1 }, { account: "2110", creditCents: 1, partner: { type: "supplier", id: "gone", name: "Old" } }] }, chart).lines[1].partner.id, "gone");
});

test("a new manual entry needs a supplier on 2110 / 1350 lines (requirePartner); other lines do not", () => {
  const values = { date: "2026-03-01", description: "Üür", documentRef: "OA-1", lines: [{ account: "4210", debitCents: 100 }, { account: "2110", creditCents: 100 }] };
  assert.throws(() => validateEntry(values, chart, { requirePartner: true }), /2110 real on partner \(tarnija\) kohustuslik/);
  assert.throws(() => validateEntry({ ...values, lines: [{ account: "1350", debitCents: 100 }, { account: "1010", creditCents: 100 }] }, chart, { requirePartner: true }), /1350/);
  assert.throws(() => validateEntry({ ...values, lines: [values.lines[0], { ...values.lines[1], partner: { type: "customer", id: "st1", name: "Mari" } }] }, chart, { requirePartner: true }), /kohustuslik/);
  assert.ok(validateEntry({ ...values, lines: [values.lines[0], { ...values.lines[1], partner: kirsi }] }, chart, { requirePartner: true, suppliers: new Map([["sup1", { name: "Kirsi Residents OÜ" }]]) }));
  assert.ok(validateEntry(values, chart), "an old entry without partners still validates (corrections)");
});

test("history: a partner change is a change; storno and „Asenda konto” keep the partners", () => {
  const entry = { id: "e1", number: "2026-0001", origin: "manual", date: "2026-03-01", description: "Üür", documentRef: "OA-1", lines: [{ account: "4210", debitCents: 100, creditCents: 0, note: "" }, { account: "2110", debitCents: 0, creditCents: 100, note: "" }] };
  const corrected = core.correctedEntry(entry, { ...entry, lines: [entry.lines[0], { ...entry.lines[1], partner: kirsi }] }, chart, { suppliers: new Map([["sup1", { name: "Kirsi Residents OÜ" }]]) });
  assert.equal(corrected.before.lines[1].partner, undefined);
  assert.deepEqual(corrected.after.lines[1].partner, kirsi);
  const withPartner = { ...entry, lines: corrected.after.lines };
  assert.throws(() => core.correctedEntry(withPartner, { ...withPartner }, chart), /Muudatusi ei ole/);
  const storno = reversalOf({ ...withPartner, origin: "manual" }, { date: "2026-03-02", reason: "viga" });
  assert.deepEqual(storno.lines[1].partner, kirsi);
  assert.equal(storno.lines[1].debitCents, 100);
  assert.equal(storno.lines[0].partner, undefined);
  const moved = core.replaceAccountValues(withPartner, "4210", "4330");
  const fixed = core.correctedEntry(withPartner, moved.values, chart);
  assert.deepEqual(fixed.after.lines.map((l) => [l.account, l.partner?.id || ""]), [["4330", ""], ["2110", "sup1"]]);
});

test("sales entries carry the customer (student card, payer name) on 1200 / 2500 lines", () => {
  const entries = automaticEntries({
    invoices: [{ id: "i1", num: "KS-1", date: "2026-02-01", amountCents: 6000, studentId: "st1", studentName: "Mari", payerName: "Ema Tamm" }],
    creditNotes: [{ id: "c1", num: "KR-1", invoiceId: "i1", date: "2026-02-03", amountCents: -1000 }],
    payments: [{ id: "p1", invoiceId: "i1", paidAt: "2026-02-05", amountCents: 5000, method: "bank" }],
  });
  const lines = entries.flatMap((e) => e.lines.map((l) => [e.sourceKey, l.account, l.partner ? `${l.partner.type}:${l.partner.id}:${l.partner.name}` : ""]));
  assert.deepEqual(lines, [
    ["invoice:i1", "1200", "customer:st1:Ema Tamm"], ["invoice:i1", "3000", ""],
    ["credit-note:c1", "3000", ""], ["credit-note:c1", "1200", "customer:st1:Ema Tamm"],
    ["payment:p1", "1010", ""], ["payment:p1", "1200", "customer:st1:Ema Tamm"],
  ]);
  assert.equal(automaticEntries({ invoices: [{ id: "i2", num: "KS-2", date: "2026-02-01", amountCents: 100 }] })[0].lines[0].partner, undefined, "no customer known → no partner");
});

test("a receipt the CRM marked „voided” is reversed too (1200 must not stay credited)", () => {
  const entries = core.automaticEntries({
    invoices: [{ id: "i9", number: "KS-9", date: "2026-08-10", amountCents: 7700, status: "Makstud" }],
    payments: [
      { id: "p1", invoiceId: "i9", invoiceNum: "KS-9", paidAt: "2026-09-03", amountCents: 7700, method: "bank", status: "active" },
      { id: "p2", invoiceId: "i9", invoiceNum: "KS-9", paidAt: "2026-09-03", amountCents: 7000, method: "bank", status: "voided", voidedAt: "2026-09-03T08:30:00.000Z" },
    ],
  });
  const receivables = entries.flatMap((e) => e.lines).filter((l) => l.account === "1200").reduce((n, l) => n + l.debitCents - l.creditCents, 0);
  assert.equal(receivables, 0);
  assert.ok(entries.some((e) => e.sourceKey === "payment-void:p2"));
});

test("a storno made by mistake can be undone: only a live storno whose original points to it", () => {
  const { assertStornoUndoable } = require("./accounting-core");
  const original = { id: "manual_9", number: "2026-0222", origin: "manual", reversedBy: "rev_1" };
  const storno = { id: "rev_1", number: "2026-0534", origin: "reversal", reversalOf: "manual_9" };
  assert.doesNotThrow(() => assertStornoUndoable(storno, original));
  assert.throws(() => assertStornoUndoable({ ...storno, origin: "manual" }, original), /ei ole stornokanne/);
  assert.throws(() => assertStornoUndoable({ ...storno, deleted: true }, original), /juba tühistatud/);
  assert.throws(() => assertStornoUndoable(storno, null), /ei leitud/);
  assert.throws(() => assertStornoUndoable(storno, { ...original, reversedBy: "other" }), /ei ole selle stornoga/);
});
