const test = require("node:test");
const assert = require("node:assert/strict");
const { DEFAULT_ACCOUNTS } = require("./accounting-chart");
const { validateEntry } = require("./accounting-core");
const { PARTNER_PRESETS, customersFromInvoices, isPersonalCode, maskCode, otherPartnerImportPlan, otherPartnerRecord } = require("./accounting-partners-core");

// Partnerid — ostjad, tarnijad ja muud (the accountant 2026-11-19: „Партнёров нет в бухгалтерии, есть только tarnijad”)
const chart = DEFAULT_ACCOUNTS.map((a) => ({ ...a, active: true }));
const mta = { type: "other", id: "p1", name: "Maksu- ja Tolliamet" };
const entry = (partner, account = "2030") => ({ date: "2026-03-01", description: "Tasaarvestus osanikuga", documentRef: "Leping 1", lines: [{ account: "4210", debitCents: 500 }, { account, creditCents: 500, partner }] });

test("validateEntry accepts the three partner types; an „other” partner must exist and gets its current name", () => {
  const others = new Map([["p1", { id: "p1", name: "Maksu- ja Tolliamet" }]]);
  assert.deepEqual(validateEntry(entry({ ...mta, name: "MTA vana" }), chart, { others }).lines[1].partner, mta);
  assert.throws(() => validateEntry(entry({ type: "other", id: "nope", name: "Keegi" }), chart, { others }), /Partnerit „Keegi” ei leitud \(Partnerid\)/);
  assert.throws(() => validateEntry(entry({ type: "other", id: "", name: "Ilma id-ta" }), chart, { others }), /ei leitud/);
  // a customer (an Ostja from the invoices) is kept with its name; nothing is looked up
  assert.deepEqual(validateEntry(entry({ type: "customer", id: "reg:14112233", name: "Popovtakso OÜ" }, "1200"), chart, { others }).lines[1].partner, { type: "customer", id: "reg:14112233", name: "Popovtakso OÜ" });
  assert.throws(() => validateEntry(entry({ type: "employee", id: "x", name: "Mari" }), chart), /vali partner nimekirjast \(Partnerid\)/);
  // no new mandatory rule: a 2110 line with an „other” partner is still refused only when a supplier is required
  assert.ok(validateEntry(entry(mta, "2110"), chart, { others }));
  assert.throws(() => validateEntry(entry(mta, "2110"), chart, { others, requirePartner: true }), /partner \(tarnija\) kohustuslik/);
  // the customer accounts never require a partner
  assert.ok(validateEntry(entry(null, "1200"), chart, { requirePartner: true }));
});

test("otherPartnerRecord: name and kind, IBAN and e-mail checked, codes cleaned", () => {
  assert.deepEqual(otherPartnerRecord({ name: "  Eesti  Töötukassa ", kind: "public", regCode: "7000 9770", iban: "ee38 2200 2210 2014 5685", email: "Info@Tootukassa.ee" }), {
    type: "other", kind: "public", name: "Eesti Töötukassa", regCode: "70009770", vatNumber: "", email: "info@tootukassa.ee", iban: "EE382200221020145685", note: "", active: true,
  });
  assert.equal(otherPartnerRecord({ name: "X" }).kind, "other");
  assert.throws(() => otherPartnerRecord({ name: "" }), /nimi on kohustuslik/);
  assert.throws(() => otherPartnerRecord({ name: "X", kind: "alien" }), /Tundmatu partneri liik/);
  assert.throws(() => otherPartnerRecord({ name: "X", iban: "EE00 1" }), /IBAN/);
  assert.throws(() => otherPartnerRecord({ name: "X", email: "pole" }), /E-posti/);
  assert.equal(otherPartnerRecord({ name: "Y", active: false }).active, false);
});

test("presets are valid records and do not duplicate each other", () => {
  const plan = otherPartnerImportPlan(PARTNER_PRESETS.map(({ key: _key, ...values }) => values), []);
  assert.equal(plan.problems.length, 0);
  assert.deepEqual(plan.records.map((r) => r.kind), ["tax", "public", "owner", "bank"]);
});

test("otherPartnerImportPlan: duplicates of saved cards or of earlier rows are problems; all or nothing", () => {
  const existing = [{ id: "p1", name: "Maksu- ja Tolliamet", regCode: "70000349" }];
  const plan = otherPartnerImportPlan([
    { name: "MTA", regCode: "70000349" },
    { name: "Mari Maasikas", kind: "employee", regCode: "48001010000" },
    { name: "mari maasikas" },
    { name: "" },
  ], existing);
  assert.deepEqual(plan.problems.map((p) => p.row), [1, 3, 4]);
  assert.match(plan.problems[0].message, /koodiga 70000349 on juba olemas/);
  assert.match(plan.problems[1].message, /real 2/);
  assert.throws(() => otherPartnerImportPlan([], existing), /ridu ei ole/);
});

test("personal codes are recognised and masked; registry codes are not", () => {
  assert.equal(isPersonalCode("38001010000"), true);
  assert.equal(isPersonalCode("70000349"), false);
  assert.equal(maskCode("38001010000"), "3******0000");
  assert.equal(maskCode("70000349"), "70000349");
});

test("customersFromInvoices: company payers by registry code, private payers by name only; FIE and excluded invoices are not customers", () => {
  const customers = customersFromInvoices([
    { id: "i1", date: "2026-01-10", payerName: "Popovtakso OÜ", payerRegCode: "14112233", payerEmail: "arved@popov.test", payerAddress: "Tallinn", studentId: "s1", studentName: "Laps Üks" },
    { id: "i2", date: "2026-03-10", payerName: "POPOVTAKSO OÜ", payerRegCode: "14112233", studentId: "s2" },
    { id: "i3", date: "2026-02-01", parentName: "Anna Kask", payerEmail: "anna@kask.test", studentName: "Mia Kask" },
    { id: "i4", date: "2026-02-15", payerName: "Anna Kask", payerRegCode: "48001010000" },
    { id: "i5", date: "2026-02-01", payerName: "FIE klient", issuer: "fie" },
    { id: "i6", date: "2026-02-01", payerName: "Väljaspool", accountingExcluded: true },
    { id: "i7", date: "2026-02-01", studentName: "Ainult Õpilane" },
    { id: "i8", date: "2026-02-01" },
  ]);
  assert.deepEqual(customers.map((c) => [c.id, c.name, c.regCode, c.kind, c.invoiceCount, c.lastInvoiceDate]), [
    ["name:ainult õpilane", "Ainult Õpilane", "", "private", 1, "2026-02-01"],
    ["name:anna kask", "Anna Kask", "", "private", 2, "2026-02-15"],
    ["reg:14112233", "POPOVTAKSO OÜ", "14112233", "company", 2, "2026-03-10"],
  ]);
  // only what the accountant needs leaves the server
  customers.forEach((c) => assert.deepEqual(Object.keys(c).sort(), ["id", "invoiceCount", "kind", "lastInvoiceDate", "name", "regCode", "source", "type"]));
  assert.equal(customers[0].source, "CRM arved");
  assert.equal(customers[0].type, "customer");
});
