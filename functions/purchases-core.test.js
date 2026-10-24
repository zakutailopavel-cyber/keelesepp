const test = require("node:test");
const assert = require("node:assert/strict");
const { DEFAULT_ACCOUNTS } = require("./accounting-chart");
const { cleanIban, entryIdOf, paymentRecord, purchaseDocumentRecord, purchaseInvoiceEntry, purchaseInvoiceRecord, statusOf, supplierPaymentEntry, supplierRecord } = require("./purchases-core");

const accounts = DEFAULT_ACCOUNTS.map((a) => ({ ...a, active: true }));
const senty = { id: "s1", name: "Senty Studio OÜ", regCode: "14512345" };
const rows = (entry) => entry.lines.map((l) => [l.account, l.debitCents, l.creditCents, l.note]);

test("a supplier card: name required, IBAN checked and normalised, default account must be open", () => {
  const supplier = supplierRecord({ name: " Senty  Studio OÜ ", regCode: "14512345", vatNumber: "ee 101 234 567", email: "Arved@Senty.ee", iban: "ee38 2200 2210 2014 5685", defaultAccount: "4210" }, accounts);
  assert.equal(supplier.name, "Senty Studio OÜ");
  assert.equal(supplier.iban, "EE382200221020145685");
  assert.equal(supplier.vatNumber, "EE101234567");
  assert.equal(supplier.email, "arved@senty.ee");
  assert.equal(supplier.defaultAccount, "4210");
  assert.throws(() => supplierRecord({ name: "" }, accounts), /nimi/);
  assert.throws(() => supplierRecord({ name: "X", iban: "EE382200221020145686" }, accounts), /kontrollsumma/);
  assert.throws(() => supplierRecord({ name: "X", email: "nope" }, accounts), /E-post/);
  assert.throws(() => supplierRecord({ name: "X", defaultAccount: "9999" }, accounts), /9999/);
  assert.throws(() => supplierRecord({ name: "X", defaultAccount: "4210" }, accounts.map((a) => (a.code === "4210" ? { ...a, active: false } : a))), /suletud/);
  assert.equal(cleanIban(""), "");
});

test("OA Ostuarve kanne: debit the cost with „<tarnija> <kirjeldus>”, credit 2110 with the document number, no 2311 by default", () => {
  const invoice = purchaseInvoiceRecord({ documentNumber: "1575", date: "2026-10-01", dueDate: "2026-10-15", lines: [
    { account: "4210", description: "Ruumide rent oktoober", amountCents: 30000, vatCents: 5000 },
    { account: "4330", description: "Kontoritarbed", amountCents: 1220 },
  ] }, { accounts, supplier: senty });
  assert.equal(invoice.totalCents, 31220);
  assert.equal(invoice.supplierName, "Senty Studio OÜ");
  const entry = purchaseInvoiceEntry("pi1", invoice);
  assert.equal(entry.sourceKey, "purchase-invoice:pi1");
  assert.equal(entry.documentType, "purchaseInvoice");
  assert.equal(entry.documentRef, "1575");
  assert.equal(entry.description, "Senty Studio OÜ");
  assert.deepEqual(rows(entry), [
    ["4210", 30000, 0, "Ruumide rent oktoober"],
    ["4330", 1220, 0, "Kontoritarbed"],
    ["2110", 0, 31220, "Arve 1575"],
  ]);
  assert.equal(entryIdOf(entry.sourceKey), "auto_purchase-invoice_pi1");
});

test("a deductible VAT (only with a VAT registration) is split to 2311 Sisendkäibemaks", () => {
  const invoice = purchaseInvoiceRecord({ documentNumber: "A-7", date: "2026-10-02", lines: [{ account: "4320", description: "Tarkvara", amountCents: 12200, vatCents: 2200, vatDeductible: true }] }, { accounts, supplier: senty });
  assert.equal(invoice.dueDate, "2026-10-02", "the due date defaults to the invoice date");
  assert.deepEqual(rows(purchaseInvoiceEntry("pi2", invoice)), [
    ["4320", 10000, 0, "Tarkvara"],
    ["2311", 2200, 0, "Sisendkäibemaks · Tarkvara"],
    ["2110", 0, 12200, "Arve A-7"],
  ]);
});

test("a purchase invoice is refused without a number, with a bad date, an unknown account or the payables account", () => {
  const base = { documentNumber: "1", date: "2026-10-01", lines: [{ account: "4210", description: "Rent", amountCents: 100 }] };
  assert.throws(() => purchaseInvoiceRecord(base, { accounts }), /tarnija/);
  assert.throws(() => purchaseInvoiceRecord({ ...base, documentNumber: " " }, { accounts, supplier: senty }), /number/);
  assert.throws(() => purchaseInvoiceRecord({ ...base, date: "2026-02-30" }, { accounts, supplier: senty }), /kuupäev/);
  assert.throws(() => purchaseInvoiceRecord({ ...base, dueDate: "2026-09-30" }, { accounts, supplier: senty }), /Maksetähtaeg/);
  assert.throws(() => purchaseInvoiceRecord({ ...base, lines: [{ ...base.lines[0], account: "4999" }] }, { accounts, supplier: senty }), /4999/);
  assert.throws(() => purchaseInvoiceRecord({ ...base, lines: [{ ...base.lines[0], account: "2110" }] }, { accounts, supplier: senty }), /2110/);
  assert.throws(() => purchaseInvoiceRecord({ ...base, lines: [{ ...base.lines[0], amountCents: 0 }] }, { accounts, supplier: senty }), /positiivne/);
  assert.throws(() => purchaseInvoiceRecord({ ...base, lines: [{ ...base.lines[0], vatCents: 200 }] }, { accounts, supplier: senty }), /suurem/);
  assert.throws(() => purchaseInvoiceRecord({ ...base, lines: [] }, { accounts, supplier: senty }), /vähemalt/);
});

test("VM Väljamakse kanne: debit 2110, credit the bank (or the cash box); partial payments add up to paid", () => {
  const invoice = { ...purchaseInvoiceRecord({ documentNumber: "1575", date: "2026-10-01", lines: [{ account: "4210", description: "Rent", amountCents: 30000 }] }, { accounts, supplier: senty }), paidCents: 0 };
  const first = { id: "p1", ...paymentRecord({ date: "2026-10-05", amountCents: 10000 }, invoice) };
  assert.equal(first.method, "bank");
  assert.deepEqual(rows(supplierPaymentEntry("pi1", invoice, first)), [["2110", 10000, 0, "Arve 1575 tasumine"], ["1010", 0, 10000, "Arve 1575 tasumine"]]);
  const rest = paymentRecord({ date: "2026-10-06", method: "cash" }, { ...invoice, paidCents: 10000 });
  assert.equal(rest.amountCents, 20000, "without an amount the open part is paid");
  assert.equal(supplierPaymentEntry("pi1", invoice, { id: "p2", ...rest }).lines[1].account, "1000");
  assert.equal(statusOf(30000, 10000), "unpaid");
  assert.equal(statusOf(30000, 30000), "paid");
  assert.throws(() => paymentRecord({ date: "2026-10-05", amountCents: 40000 }, invoice), /suurem/);
  assert.throws(() => paymentRecord({ date: "2026-09-30" }, invoice), /enne arve/);
  assert.throws(() => paymentRecord({ date: "2026-10-05" }, { ...invoice, paidCents: 30000 }), /juba tasutud/);
});

test("the invoice PDF goes to its own storage folder", () => {
  const doc = purchaseDocumentRecord({ purchaseInvoiceId: "pi1", documentId: "purchase_doc_0001", storagePath: "financial/purchase-invoices/pi1/purchase_doc_0001", fileName: "Arve 1575.pdf", contentType: "application/pdf", size: 1000 });
  assert.equal(doc.kind, "purchase_invoice");
  assert.throws(() => purchaseDocumentRecord({ purchaseInvoiceId: "pi1", documentId: "purchase_doc_0001", storagePath: "financial/expenses/pi1/purchase_doc_0001", fileName: "a.pdf", contentType: "application/pdf", size: 1 }), /asukoht/);
  assert.throws(() => purchaseDocumentRecord({ purchaseInvoiceId: "pi1", documentId: "purchase_doc_0001", storagePath: "financial/purchase-invoices/pi1/purchase_doc_0001", fileName: "a.exe", contentType: "application/x-msdownload", size: 1 }), /PDF/);
});

// ---- Tarnijad: duplicates, import, partner on the entries (the accountant 2026-10-24) ----
const purchases = require("./purchases-core");

test("OA and VM entries carry the supplier as the partner of every line", () => {
  const invoice = purchaseInvoiceRecord({ documentNumber: "1575", date: "2026-10-01", lines: [{ account: "4210", description: "Rent", amountCents: 30000, vatCents: 5000, vatDeductible: true }] }, { accounts, supplier: senty });
  const oa = purchaseInvoiceEntry("pi1", invoice);
  assert.deepEqual(oa.lines.map((l) => [l.account, l.partner]), [["4210", { type: "supplier", id: "s1", name: "Senty Studio OÜ" }], ["2311", { type: "supplier", id: "s1", name: "Senty Studio OÜ" }], ["2110", { type: "supplier", id: "s1", name: "Senty Studio OÜ" }]]);
  const vm = supplierPaymentEntry("pi1", invoice, { id: "p1", date: "2026-10-02", amountCents: 30000, method: "bank" });
  assert.deepEqual(vm.lines.map((l) => [l.account, l.partner.id]), [["2110", "s1"], ["1010", "s1"]]);
});

test("supplier duplicates: the same registry code, or the same name (legal form, case, quotes ignored) without a different code", () => {
  const existing = [{ id: "a", name: "Kirsi Residents OÜ", regCode: "12345678" }, { id: "b", name: "Zone Media OÜ", regCode: "" }];
  assert.equal(purchases.supplierDuplicate({ name: "Anything", regCode: "12345678" }, existing).id, "a");
  assert.equal(purchases.supplierDuplicate({ name: "„kirsi residents” ou", regCode: "" }, existing).id, "a");
  assert.equal(purchases.supplierDuplicate({ name: "Kirsi Residents", regCode: "99999999" }, existing), null, "same name, another registry code → another company");
  assert.equal(purchases.supplierDuplicate({ name: "ZONE MEDIA", regCode: "11111111" }, existing).id, "b", "the saved one has no code");
  assert.equal(purchases.supplierDuplicate({ name: "Kirsi Residents OÜ", regCode: "12345678" }, existing, "a"), null, "itself is not a duplicate");
  assert.match(purchases.duplicateMessage({ name: "X", regCode: "12345678" }, existing[0]), /registrikoodiga 12345678/);
  assert.match(purchases.duplicateMessage({ name: "zone media", regCode: "" }, existing[1]), /nimega „Zone Media OÜ”/);
});

test("import from Excel: every row checked, duplicates of saved suppliers and of earlier rows refused with the row number", () => {
  const plan = purchases.supplierImportPlan([
    { name: "Euronics AS", regCode: "10883455", iban: "EE382200221020145685", defaultAccount: "4330" },
    { name: "Charlot OÜ", regCode: "" },
    { name: "euronics", regCode: "" },
    { name: "Kirsi Residents OÜ" },
    { name: "", regCode: "1" },
    { name: "Bad IBAN", iban: "EE382200221020145686" },
  ], [{ id: "a", name: "Kirsi Residents OÜ", regCode: "12345678" }], accounts);
  assert.deepEqual(plan.records.map((r) => r.name), ["Euronics AS", "Charlot OÜ"]);
  assert.deepEqual(plan.problems.map((p) => p.row), [3, 4, 5, 6]);
  assert.match(plan.problems[0].message, /real 1/);
  assert.match(plan.problems[1].message, /Kirsi Residents OÜ/);
  assert.throws(() => purchases.supplierImportPlan([], [], accounts), /ridu ei ole/);
  assert.throws(() => purchases.supplierImportPlan(Array.from({ length: purchases.IMPORT_MAX + 1 }, (_, i) => ({ name: `S${i}` })), [], accounts), /Korraga/);
});
